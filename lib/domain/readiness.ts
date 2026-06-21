import { nowISO } from "@/lib/utils/date";
import type {
  ConfidenceLevel,
  DailyAggregate,
  Problem,
  ProblemStatus,
  ReadinessDims,
  ReadinessScore,
  SqlProblem,
  StudyEvent,
  WeaknessControlResult,
} from "./types";
import { READINESS_WEIGHTS } from "./types";

// ============================================================
// Mastery points per status (used by coding / sql scores)
// ============================================================

const MASTERY_POINTS: Record<ProblemStatus, number> = {
  not_started: 0,
  reading: 0,
  attempted: 0.2,
  solved_with_help: 0.4,
  solved_independently: 0.8,
  need_review: 0.3,
  failed: 0.1,
  mastered: 1.0,
};

const HARD_BONUS_PER_PROBLEM_PCT = 3;
const HARD_BONUS_CAP_PCT = 12;

export function computeCodingScore(problems: Problem[]): number {
  const required = problems.filter((p) => p.difficulty !== "Hard");
  const hard = problems.filter((p) => p.difficulty === "Hard");

  if (required.length === 0) return 0;

  const requiredPoints = required.reduce(
    (sum, p) => sum + MASTERY_POINTS[p.status],
    0,
  );
  const basePct = (requiredPoints / required.length) * 100;

  const hardBonusPct = Math.min(
    HARD_BONUS_CAP_PCT,
    hard.reduce(
      (sum, p) => sum + MASTERY_POINTS[p.status] * HARD_BONUS_PER_PROBLEM_PCT,
      0,
    ),
  );

  return Math.min(100, Math.round(basePct + hardBonusPct));
}

export function computeSqlScore(sqlProblems: SqlProblem[]): number {
  if (sqlProblems.length === 0) return 0;
  const pts = sqlProblems.reduce(
    (sum, p) => sum + MASTERY_POINTS[p.status],
    0,
  );
  return Math.min(100, Math.round((pts / sqlProblems.length) * 100));
}

// ============================================================
// English explanation score
// ============================================================

export function computeEnglishScore(
  problems: Problem[],
  events: StudyEvent[],
): number {
  const practiceCount = events.filter((e) => e.type === "english_practice")
    .length;
  const uniquePracticedProblems = new Set(
    events
      .filter(
        (e): e is Extract<StudyEvent, { type: "english_practice" }> =>
          e.type === "english_practice",
      )
      .map((e) => e.problemSlug)
      .filter(Boolean),
  ).size;

  const coveredProblems = problems.filter((p) =>
    Object.values(p.englishCoverage).every(Boolean),
  ).length;

  const score =
    Math.min(40, practiceCount * 2) +
    Math.min(30, uniquePracticedProblems * 3) +
    Math.min(30, coveredProblems * 4);

  return Math.min(100, Math.round(score));
}

// ============================================================
// Review consistency score
// ============================================================

const REVIEW_WINDOW_DAYS = 14;

export function computeReviewConsistency(
  events: StudyEvent[],
  aggregates: DailyAggregate[],
  now: Date = new Date(),
): number {
  const window: string[] = [];
  for (let i = 0; i < REVIEW_WINDOW_DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    window.push(d.toISOString().slice(0, 10));
  }
  const aggMap = new Map(aggregates.map((a) => [a.date, a]));

  let activeDays = 0;
  let dueCompleted = 0;
  let dueTotal = 0;

  for (const date of window) {
    const agg = aggMap.get(date);
    if (!agg) continue;
    const rc = agg.reviewsCompleted;
    const reviewActivity =
      rc.failed + rc.need_review + rc.solved + agg.lightReviewCappedCount;
    if (reviewActivity > 0) activeDays++;
    dueCompleted += rc.solved + rc.need_review;
    dueTotal += rc.solved + rc.need_review + rc.failed;
  }

  const streakRatio = activeDays / REVIEW_WINDOW_DAYS;
  const completionRatio = dueTotal === 0 ? 0 : dueCompleted / dueTotal;

  return Math.round(streakRatio * 30 + completionRatio * 70);
}

// ============================================================
// Weakness control
// ============================================================

const WEAKNESS_STATUSES: ReadonlySet<ProblemStatus> = new Set<ProblemStatus>([
  "failed",
  "need_review",
  "solved_with_help",
]);

function classifyConfidence(
  attemptedCount: number,
  unresolvedCount: number,
): ConfidenceLevel {
  if (attemptedCount < 10) return "insufficient_data";
  if (attemptedCount >= 25 && unresolvedCount >= 5) return "high";
  if (attemptedCount >= 15 && unresolvedCount >= 3) return "medium";
  return "low";
}

export function computeWeaknessControl(
  problems: Problem[],
  sqlProblems: SqlProblem[],
): WeaknessControlResult {
  const counts = new Map<string, number>();
  let attemptedCount = 0;

  for (const p of problems) {
    if (p.status !== "not_started" && p.status !== "reading") {
      attemptedCount++;
    }
    if (WEAKNESS_STATUSES.has(p.status)) {
      const key = `LC: ${p.topic}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const s of sqlProblems) {
    if (s.status !== "not_started" && s.status !== "reading") {
      attemptedCount++;
    }
    if (WEAKNESS_STATUSES.has(s.status)) {
      const key = `SQL: ${s.topic}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const unresolvedCount = entries.reduce((sum, [, c]) => sum + c, 0);
  const confidence = classifyConfidence(attemptedCount, unresolvedCount);

  if (confidence === "insufficient_data") {
    return {
      score: null,
      topCategories: [],
      attemptedCount,
      unresolvedCount,
      confidence,
      message: `弱点判定にはまだデータが足りません (${attemptedCount}/10 問評価済)`,
    };
  }

  let score: number;
  let message: string | undefined;

  if (unresolvedCount === 0) {
    score = 100;
    if (confidence !== "high") {
      message = `現時点では弱点なし (確度 ${confidence})`;
    }
  } else {
    const top1Count = entries[0]?.[1] ?? 0;
    score = Math.round((top1Count / unresolvedCount) * 100);
    if (confidence === "low") {
      message = "弱点が少なく、傾向の確度は低めです";
    }
  }

  return {
    score,
    topCategories: entries.slice(0, 5).map(([label, count]) => ({ label, count })),
    attemptedCount,
    unresolvedCount,
    confidence,
    message,
  };
}

// ============================================================
// Overall ReadinessScore
// ============================================================

export interface ComputeReadinessInput {
  problems: Problem[];
  sqlProblems: SqlProblem[];
  events: StudyEvent[];
  aggregates: DailyAggregate[];
  daysOfData: number;
  now?: Date;
}

export function computeReadinessScore(
  input: ComputeReadinessInput,
): ReadinessScore {
  const now = input.now ?? new Date();

  const coding = computeCodingScore(input.problems);
  const sql = computeSqlScore(input.sqlProblems);
  const englishExplanation = computeEnglishScore(input.problems, input.events);
  const reviewConsistency = computeReviewConsistency(
    input.events,
    input.aggregates,
    now,
  );
  const weakness = computeWeaknessControl(input.problems, input.sqlProblems);
  const weaknessControl = weakness.score ?? 0;

  const dimensions: ReadinessDims = {
    coding,
    sql,
    englishExplanation,
    reviewConsistency,
    weaknessControl,
  };

  const insufficientData =
    input.daysOfData < 7 || weakness.confidence === "insufficient_data";

  let overall: number;
  if (weakness.confidence === "insufficient_data") {
    // Remove weaknessControl from weighting
    const { coding: cw, sql: sw, englishExplanation: ew, reviewConsistency: rw } =
      READINESS_WEIGHTS;
    const denom = cw + sw + ew + rw;
    overall = Math.round(
      (coding * cw +
        sql * sw +
        englishExplanation * ew +
        reviewConsistency * rw) /
        denom,
    );
  } else {
    const denom = Object.values(READINESS_WEIGHTS).reduce((s, w) => s + w, 0);
    overall = Math.round(
      (coding * READINESS_WEIGHTS.coding +
        sql * READINESS_WEIGHTS.sql +
        englishExplanation * READINESS_WEIGHTS.englishExplanation +
        reviewConsistency * READINESS_WEIGHTS.reviewConsistency +
        weaknessControl * READINESS_WEIGHTS.weaknessControl) /
        denom,
    );
  }

  return {
    computedAt: nowISO(),
    overall,
    dimensions,
    signals: {
      daysOfData: input.daysOfData,
      insufficientData,
    },
  };
}
