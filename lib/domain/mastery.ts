import { fromISO, nowISO, type ISODate } from "@/lib/utils/date";
import {
  isEnglishCoverageComplete,
  ENGLISH_COVERAGE_KEYS,
  type EnglishCoverageKey,
  type Problem,
  type ProblemStatus,
  type MasteryCriterion,
  type MasteryEvaluation,
  type MasteryRisk,
  type MasteryRiskReason,
  type StudyEvent,
} from "./types";

// Review goal — what success means for the next review of this status.
export interface ReviewGoal {
  headline: string;
  detail: string;
}

export function getReviewGoal(status: ProblemStatus): ReviewGoal | null {
  switch (status) {
    case "failed":
      return {
        headline: "最初から自力で書けるようにする",
        detail:
          "前回詰まった原因を理解しなおし、最初の 1 行から書き直す。解答を見ずに完走できれば成功。",
      };
    case "need_review":
      return {
        headline: "詰まった箇所を意識しながら、もう一度解く",
        detail:
          "前回の自分のメモ・擬似コードを最小限だけ参照して OK。ノートを閉じて再現できれば solved_independently へ。",
      };
    case "solved_with_help":
      return {
        headline: "解説を見ずに、最初から最後まで自力で再現する",
        detail:
          "前回はヒント／解答例に頼った。今度は何も見ずに同じ実装を再現できるか確認する。",
      };
    case "solved_independently":
      return {
        headline: "30 日経過の保守復習",
        detail:
          "1 分以内に方針を口で説明できるか確認 (英語推奨)。",
      };
    case "mastered":
      return {
        headline: "45 日に 1 度のメンテナンス",
        detail: "方針確認 + 英語説明テスト。詰まったら need_review に降格を検討。",
      };
    default:
      return null;
  }
}

// Stale review thresholds (in days) per status.
export const STALE_REVIEW_DAYS: Partial<Record<ProblemStatus, number>> = {
  failed: 7,
  need_review: 14,
  solved_with_help: 14,
  solved_independently: 30,
  mastered: 45,
};

// Mastery time thresholds in seconds, per difficulty.
const TIME_THRESHOLD_SEC = {
  Easy: 15 * 60,
  Medium: 35 * 60,
  Hard: 60 * 60,
} as const;

const MIN_ENGLISH_NOTE_LENGTH = 100;
const MIN_COMPLEXITY_NOTE_LENGTH = 10;
const MIN_EDGE_CASES_LENGTH = 10;
const MIN_INDEPENDENT_REVIEWS = 3;

function countIndependentReviewSuccesses(
  events: StudyEvent[],
  slug: string,
): number {
  return events.filter(
    (e) =>
      e.type === "review_completed" &&
      e.targetSlug === slug &&
      e.outcome === "solved",
  ).length;
}

function findLastReviewOutcome(
  events: StudyEvent[],
  slug: string,
): "failed" | "need_review" | "solved" | undefined {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e && e.type === "review_completed" && e.targetSlug === slug) {
      return e.outcome;
    }
  }
  return undefined;
}

export function evaluateMasteryReadiness(
  problem: Problem,
  events: StudyEvent[],
): MasteryEvaluation {
  const satisfied: MasteryCriterion[] = [];
  const missing: MasteryCriterion[] = [];

  // A. Independent review count >= 3
  const independentCount = countIndependentReviewSuccesses(events, problem.slug);
  if (independentCount >= MIN_INDEPENDENT_REVIEWS) {
    satisfied.push("independent_review_count");
  } else {
    missing.push("independent_review_count");
  }

  // B. Latest review is solved
  const latestOutcome = findLastReviewOutcome(events, problem.slug);
  if (latestOutcome === "solved") {
    satisfied.push("latest_review_solved");
  } else {
    missing.push("latest_review_solved");
  }

  // C. Time threshold (Hard is bonus — counted as satisfied even if exceeded)
  const lastDur = problem.lastSolveDurationSec;
  const threshold = TIME_THRESHOLD_SEC[problem.difficulty];
  if (problem.difficulty === "Hard") {
    satisfied.push("within_time_threshold");
  } else if (lastDur !== undefined && lastDur <= threshold) {
    satisfied.push("within_time_threshold");
  } else {
    missing.push("within_time_threshold");
  }

  // D. English explanation done (100+ chars + 6 coverage)
  const englishCoverageMissing: EnglishCoverageKey[] = ENGLISH_COVERAGE_KEYS.filter(
    (k) => !problem.englishCoverage[k],
  );
  const englishOk =
    problem.englishNote.trim().length >= MIN_ENGLISH_NOTE_LENGTH &&
    isEnglishCoverageComplete(problem.englishCoverage);
  if (englishOk) satisfied.push("english_explanation_done");
  else missing.push("english_explanation_done");

  // E. Complexity documented
  if (problem.complexityNote.trim().length >= MIN_COMPLEXITY_NOTE_LENGTH) {
    satisfied.push("complexity_documented");
  } else {
    missing.push("complexity_documented");
  }

  // F. Edge cases documented
  if (problem.edgeCases.trim().length >= MIN_EDGE_CASES_LENGTH) {
    satisfied.push("edge_cases_documented");
  } else {
    missing.push("edge_cases_documented");
  }

  return {
    ready: missing.length === 0,
    satisfied,
    missing,
    englishCoverageMissing,
  };
}

function daysBetween(a: ISODate, b: Date): number {
  return Math.floor((b.getTime() - fromISO(a).getTime()) / 86400000);
}

function findLastMasteryConfirmedAt(
  events: StudyEvent[],
  slug: string,
): ISODate | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e && e.type === "mastery_confirmed" && e.problemSlug === slug) {
      return e.timestamp;
    }
  }
  return null;
}

function findLastReviewAt(events: StudyEvent[], slug: string): ISODate | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e && e.type === "review_completed" && e.targetSlug === slug) {
      return e.timestamp;
    }
  }
  return null;
}

export function detectMasteryRisk(
  problem: Problem,
  events: StudyEvent[],
  now: Date = new Date(),
): MasteryRisk {
  if (problem.status !== "mastered") {
    return { atRisk: false, reasons: [], detectedAt: nowISO() };
  }

  const reasons: MasteryRiskReason[] = [];

  // 1. Mastered-后 failure
  const confirmedAt = findLastMasteryConfirmedAt(events, problem.slug);
  if (confirmedAt) {
    const postFailures = events.filter(
      (e) =>
        e.type === "review_completed" &&
        e.targetSlug === problem.slug &&
        e.outcome === "failed" &&
        e.timestamp > confirmedAt,
    );
    if (postFailures.length > 0) reasons.push("post_mastery_failure");
  }

  // 2. Time threshold exceeded (Easy / Medium only)
  if (problem.difficulty !== "Hard" && problem.lastSolveDurationSec !== undefined) {
    const threshold = TIME_THRESHOLD_SEC[problem.difficulty];
    if (problem.lastSolveDurationSec > threshold) {
      reasons.push("time_threshold_exceeded");
    }
  }

  // 3. English coverage lost
  if (!isEnglishCoverageComplete(problem.englishCoverage)) {
    reasons.push("english_coverage_lost");
  }

  // 4. Stale review
  const stale = STALE_REVIEW_DAYS[problem.status];
  if (stale !== undefined) {
    const lastReviewAt = findLastReviewAt(events, problem.slug) ?? problem.updatedAt;
    if (daysBetween(lastReviewAt, now) >= stale) {
      reasons.push("stale_review");
    }
  }

  return {
    atRisk: reasons.length > 0,
    reasons,
    detectedAt: nowISO(),
  };
}

// Map "次に取りうる状態"
export function nextLikelyStatuses(current: ProblemStatus): ProblemStatus[] {
  switch (current) {
    case "not_started":
      return ["reading", "attempted"];
    case "reading":
      return ["attempted"];
    case "attempted":
      return ["solved_with_help", "solved_independently", "failed", "need_review"];
    case "solved_with_help":
      return ["solved_independently", "need_review", "failed"];
    case "solved_independently":
      return ["need_review", "failed", "mastered"];
    case "need_review":
      return ["solved_with_help", "solved_independently", "failed"];
    case "failed":
      return ["reading", "attempted", "need_review"];
    case "mastered":
      return ["need_review"];
  }
}

// Map review outcome buttons to a next status, given current status.
export function applyReviewOutcomeToStatus(
  current: ProblemStatus,
  outcome: "failed" | "need_review" | "solved",
): ProblemStatus {
  if (outcome === "failed") return "failed";
  if (outcome === "need_review") {
    if (current === "mastered") return "need_review";
    if (current === "solved_independently") return "need_review";
    return "need_review";
  }
  // outcome === "solved"
  switch (current) {
    case "failed":
      return "need_review";
    case "need_review":
      return "solved_independently";
    case "solved_with_help":
      return "solved_independently";
    case "solved_independently":
      return "solved_independently";
    case "mastered":
      return "mastered";
    default:
      return "solved_independently";
  }
}
