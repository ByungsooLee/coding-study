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
 * Statuses that are not in the repetition queue (e.g. not_started, reading,
 * attempted) map to an empty array.
 */
export const REVIEW_INTERVALS: Record<ProblemStatus, number[]> = {
  not_started: [],
  reading: [],
  attempted: [],
  failed: [1, 3, 7],
  need_review: [3, 7, 14],
  solved_with_help: [3, 7, 14],
  solved_independently: [7, 14, 30],
  mastered: [30, 60],
};

/**
 * Pure: derive the next batch of review dates from a status + base time.
 */
export function computeNextReviewDates(
  status: ProblemStatus,
  baseISO: ISODate = nowISO(),
): ISODate[] {
  return (REVIEW_INTERVALS[status] ?? []).map((d) => addDaysISO(baseISO, d));
}

export function classifyReviewDate(
  dueAt: ISODate,
  now: Date = new Date(),
): ReviewStatus {
  if (isDueBy(dueAt, now)) return "Due";
  const dueTime = fromISO(dueAt).getTime();
  if (dueTime - now.getTime() < 7 * 24 * 60 * 60 * 1000) return "Upcoming";
  return "Done";
}

export function nextDueDate(
  dates: ISODate[],
  now: Date = new Date(),
): ISODate | undefined {
  const sorted = [...dates].sort();
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  return sorted.find((d) => fromISO(d).getTime() >= cutoff.getTime());
}

interface BuildArgs {
  problems: Problem[];
  sqlProblems: SqlProblem[];
  concepts: PythonConcept[];
  now?: Date;
}

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
    items.push({
      targetType: "Problem",
      targetId: p.id,
      targetSlug: p.slug,
      title: p.title,
      dueAt: due,
      status: classifyReviewDate(due, now),
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
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (a.dueAt !== b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return items;
}
