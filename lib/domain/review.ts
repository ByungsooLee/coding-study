import {
  addDaysISO,
  fromISO,
  isDueBy,
  nowISO,
  type ISODate,
} from "@/lib/utils/date";
import type {
  Problem,
  PythonConcept,
  ReviewItem,
  ReviewStatus,
  SqlProblem,
  ProblemStatus,
} from "./types";

/**
 * Spaced-repetition intervals (in days) keyed by ProblemStatus.
 * Failed: aggressive short cycle.
 * NeedReview: moderate.
 * Solved: long, light maintenance.
 */
export const REVIEW_INTERVALS: Record<ProblemStatus, number[]> = {
  NotStarted: [],
  InProgress: [],
  Failed: [1, 3, 7],
  NeedReview: [3, 7, 14],
  Solved: [14, 30],
};

/**
 * Pure: derive the next batch of review dates from a status + last attempt.
 * Always returns dates in chronological order, all in the future relative to base.
 */
export function computeNextReviewDates(
  status: ProblemStatus,
  baseISO: ISODate = nowISO(),
): ISODate[] {
  const intervals = REVIEW_INTERVALS[status];
  return intervals.map((days) => addDaysISO(baseISO, days));
}

/**
 * Pure: classify a review date relative to "now".
 */
export function classifyReviewDate(
  dueAt: ISODate,
  now: Date = new Date(),
): ReviewStatus {
  if (isDueBy(dueAt, now)) return "Due";
  const dueTime = fromISO(dueAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (dueTime - now.getTime() < sevenDays) return "Upcoming";
  return "Done";
}

/**
 * Selects the next active review date from a list — the earliest date in the future
 * (or today). Returns undefined if no future dates remain.
 */
export function nextDueDate(
  dates: ISODate[],
  now: Date = new Date(),
): ISODate | undefined {
  const sorted = [...dates].sort();
  return sorted.find((d) => fromISO(d).getTime() >= now.setHours(0, 0, 0, 0));
}

interface BuildArgs {
  problems: Problem[];
  sqlProblems: SqlProblem[];
  concepts: PythonConcept[];
  now?: Date;
}

/**
 * Build the consolidated review queue for "today" across all target types.
 * Only items whose nextDueDate <= now and which are not yet fully Solved-and-mature
 * are returned. Items are sorted by (urgency desc, title asc).
 */
export function buildReviewQueue({
  problems,
  sqlProblems,
  concepts,
  now = new Date(),
}: BuildArgs): ReviewItem[] {
  const items: ReviewItem[] = [];

  for (const p of problems) {
    const due = nextDueDate(p.reviewDates, now);
    if (!due) continue;
    const cls = classifyReviewDate(due, now);
    items.push({
      targetType: "Problem",
      targetId: p.id,
      targetSlug: p.slug,
      title: p.title,
      dueAt: due,
      status: cls,
      intervalStage: p.reviewDates.length,
      createdFromStatus: p.status,
    });
  }

  for (const s of sqlProblems) {
    const due = nextDueDate(s.reviewDates, now);
    if (!due) continue;
    items.push({
      targetType: "SqlProblem",
      targetId: s.id,
      targetSlug: s.slug,
      title: s.title,
      dueAt: due,
      status: classifyReviewDate(due, now),
      intervalStage: s.reviewDates.length,
      createdFromStatus: s.status,
    });
  }

  for (const c of concepts) {
    const due = nextDueDate(c.reviewDates, now);
    if (!due) continue;
    items.push({
      targetType: "PythonConcept",
      targetId: c.id,
      targetSlug: c.slug,
      title: c.name,
      dueAt: due,
      status: classifyReviewDate(due, now),
      intervalStage: c.reviewDates.length,
    });
  }

  const order: Record<ReviewStatus, number> = { Due: 0, Upcoming: 1, Done: 2 };
  items.sort((a, b) => {
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }
    if (a.dueAt !== b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  return items;
}

/**
 * Compute a coarse "weak categories" view: counts of problems / SQL with
 * Failed or NeedReview status, grouped by topic.
 */
export function computeWeakCategories(
  problems: Problem[],
  sqlProblems: SqlProblem[],
): { label: string; count: number }[] {
  const counts = new Map<string, number>();

  const bump = (label: string) =>
    counts.set(label, (counts.get(label) ?? 0) + 1);

  for (const p of problems) {
    if (p.status === "Failed" || p.status === "NeedReview") {
      bump(`LC: ${p.topic}`);
    }
  }
  for (const s of sqlProblems) {
    if (s.status === "Failed" || s.status === "NeedReview") {
      bump(`SQL: ${s.topic}`);
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
