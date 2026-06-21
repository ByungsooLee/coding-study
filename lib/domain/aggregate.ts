import type {
  DailyAggregate,
  DailyLoadLevel,
  StudyEvent,
  StudyEventType,
} from "./types";

interface AggregateInput {
  date: string;
  events: StudyEvent[];
  dailyLoadLevel?: DailyLoadLevel;
}

function eventsOnDate(events: StudyEvent[], date: string): StudyEvent[] {
  return events.filter((e) => e.timestamp.startsWith(date));
}

function countType<T extends StudyEventType>(
  events: StudyEvent[],
  type: T,
): number {
  return events.filter((e) => e.type === type).length;
}

export function aggregateEvents(input: AggregateInput): DailyAggregate {
  const day = eventsOnDate(input.events, input.date);

  let totalActiveMinutes = 0;
  for (const e of day) {
    if (e.type === "session_ended" && typeof e.durationSec === "number") {
      totalActiveMinutes += e.durationSec / 60;
    }
  }
  totalActiveMinutes = Math.round(totalActiveMinutes);

  // Problem & SQL status transitions
  let problemsOpened = 0;
  let problemsAttempted = 0;
  let problemsSolvedIndependently = 0;
  let problemsSolvedWithHelp = 0;
  let problemsFailed = 0;
  let sqlOpened = 0;
  let sqlSolvedIndependently = 0;
  let sqlSolvedWithHelp = 0;
  const reviewsCompleted = { failed: 0, need_review: 0, solved: 0 };
  let conceptsReviewed = 0;
  let englishPracticeCount = 0;
  let englishPracticeMinutes = 0;
  let mistakesLogged = 0;
  let lightReviewCount = 0;

  for (const e of day) {
    switch (e.type) {
      case "problem_opened":
        problemsOpened++;
        break;
      case "problem_status_changed":
        if (e.to === "attempted") problemsAttempted++;
        if (e.to === "solved_independently") problemsSolvedIndependently++;
        if (e.to === "solved_with_help") problemsSolvedWithHelp++;
        if (e.to === "failed") problemsFailed++;
        break;
      case "sql_status_changed":
        if (e.to === "attempted") sqlOpened++;
        if (e.to === "solved_independently") sqlSolvedIndependently++;
        if (e.to === "solved_with_help") sqlSolvedWithHelp++;
        break;
      case "review_completed":
        reviewsCompleted[e.outcome]++;
        break;
      case "concept_reviewed":
        conceptsReviewed++;
        break;
      case "english_practice":
        englishPracticeCount++;
        if (typeof e.durationSec === "number") {
          englishPracticeMinutes += e.durationSec / 60;
        }
        break;
      case "mistake_logged":
        mistakesLogged++;
        break;
      case "light_review_taken":
        lightReviewCount++;
        break;
    }
  }

  const lightReviewCappedCount = Math.min(lightReviewCount, 2);

  return {
    date: input.date,
    totalActiveMinutes,
    problemsOpened,
    problemsAttempted,
    problemsSolvedIndependently,
    problemsSolvedWithHelp,
    problemsFailed,
    sqlOpened,
    sqlSolvedIndependently,
    sqlSolvedWithHelp,
    reviewsCompleted,
    conceptsReviewed,
    englishPracticeCount,
    englishPracticeMinutes: Math.round(englishPracticeMinutes),
    mistakesLogged,
    lightReviewCount,
    lightReviewCappedCount,
    dailyLoadLevel: input.dailyLoadLevel,
  };
}

export interface LightReviewWeeklyStats {
  weekStartDate: string;
  totalEvents: number;
  creditedEvents: number;
  activeDays: number;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function computeWeeklyLightReviewStats(
  aggregates: DailyAggregate[],
  weekStartDate: string,
): LightReviewWeeklyStats {
  const end = addDays(weekStartDate, 7);
  const inWeek = aggregates.filter(
    (a) => a.date >= weekStartDate && a.date < end,
  );
  return {
    weekStartDate,
    totalEvents: inWeek.reduce((s, a) => s + a.lightReviewCount, 0),
    creditedEvents: inWeek.reduce((s, a) => s + a.lightReviewCappedCount, 0),
    activeDays: inWeek.filter((a) => a.lightReviewCount > 0).length,
  };
}

const STUDY_EVENT_RETENTION_DAYS = 180;

export function trimOldStudyEvents(
  events: StudyEvent[],
  aggregates: DailyAggregate[],
  now: Date = new Date(),
): StudyEvent[] {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - STUDY_EVENT_RETENTION_DAYS);
  const aggregatedDates = new Set(aggregates.map((a) => a.date));

  return events.filter((e) => {
    const ts = new Date(e.timestamp);
    if (ts >= cutoff) return true;
    const day = e.timestamp.slice(0, 10);
    return !aggregatedDates.has(day);
  });
}

// computeWeaknessControl-equivalent legacy helper used by dashboard cards
export function computeWeakCategories(
  problems: { status: import("./types").ProblemStatus; topic: string }[],
  sqlProblems: { status: import("./types").ProblemStatus; topic: string }[],
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  const bump = (label: string) =>
    counts.set(label, (counts.get(label) ?? 0) + 1);
  for (const p of problems) {
    if (
      p.status === "failed" ||
      p.status === "need_review" ||
      p.status === "solved_with_help"
    )
      bump(`LC: ${p.topic}`);
  }
  for (const s of sqlProblems) {
    if (
      s.status === "failed" ||
      s.status === "need_review" ||
      s.status === "solved_with_help"
    )
      bump(`SQL: ${s.topic}`);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
