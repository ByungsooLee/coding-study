import { nowISO, type ISODate } from "@/lib/utils/date";
import type {
  AppSettings,
  DailyAggregate,
  DailyLoadConfig,
  DailyLoadCorrection,
  DailyLoadCorrectionReason,
  DailyLoadHistoryEntry,
  DailyLoadLevel,
  LoadLevelSource,
  StudyEvent,
} from "./types";
import { LOAD_PRESETS } from "./types";

export function getLoadPreset(level: DailyLoadLevel): DailyLoadConfig {
  return LOAD_PRESETS[level];
}

export function getEffectiveLoadLevel(
  settings: AppSettings,
  date: string,
): DailyLoadLevel {
  return settings.loadLevelOverrides[date] ?? settings.defaultDailyLoadLevel;
}

interface DeriveInput {
  totalStudyMinutes: number;
  newProblemsCount: number;
  reviewsCount: number;
  restDayTaken: boolean;
  plannedLevel: DailyLoadLevel;
}

/**
 * Derive the actual load level a day fell into, based on events.
 */
export function deriveActualLevel(input: DeriveInput): DailyLoadLevel {
  if (input.restDayTaken) return "minimum";

  if (
    input.totalStudyMinutes < 10 &&
    input.newProblemsCount === 0 &&
    input.reviewsCount === 0
  ) {
    return "minimum";
  }

  // Explicit review_only plan + at least 1 review counts as review_only
  if (input.plannedLevel === "review_only") {
    if (input.newProblemsCount === 0 && input.reviewsCount >= 1) {
      return "review_only";
    }
    // fall through to time-based judgement
  }

  // Auto-derived review_only: 0 new + 3+ reviews
  if (input.newProblemsCount === 0 && input.reviewsCount >= 3) {
    return "review_only";
  }

  // 0 new + 1-2 reviews → minimum
  if (
    input.newProblemsCount === 0 &&
    input.reviewsCount > 0 &&
    input.reviewsCount < 3
  ) {
    return "minimum";
  }

  if (input.totalStudyMinutes >= 150) return "intensive";
  if (input.totalStudyMinutes >= 60) return "standard";
  return "minimum";
}

function eventsOnDate(events: StudyEvent[], date: string): StudyEvent[] {
  return events.filter((e) => e.timestamp.startsWith(date));
}

function newProblemsOnDate(events: StudyEvent[], date: string): number {
  const ev = eventsOnDate(events, date);
  const solvingStatuses = new Set([
    "attempted",
    "solved_with_help",
    "solved_independently",
  ]);
  const slugs = new Set<string>();
  for (const e of ev) {
    if (e.type === "problem_status_changed" && solvingStatuses.has(e.to)) {
      slugs.add(e.problemSlug);
    }
    if (e.type === "sql_status_changed" && solvingStatuses.has(e.to)) {
      slugs.add(`sql:${e.sqlSlug}`);
    }
  }
  return slugs.size;
}

function reviewsOnDate(events: StudyEvent[], date: string): number {
  return eventsOnDate(events, date).filter((e) => e.type === "review_completed")
    .length;
}

function studyMinutesOnDate(events: StudyEvent[], date: string): number {
  let total = 0;
  for (const e of eventsOnDate(events, date)) {
    if (e.type === "session_ended" && typeof e.durationSec === "number") {
      total += e.durationSec;
    }
  }
  return Math.round(total / 60);
}

function restDayTakenOnDate(events: StudyEvent[], date: string): boolean {
  return eventsOnDate(events, date).some((e) => e.type === "rest_day_taken");
}

function sourceForOverride(
  settings: AppSettings,
  date: string,
): LoadLevelSource {
  if (!settings.loadLevelOverrides[date]) return "default";
  const reservation = settings.loadLevelReservations.find(
    (r) => r.date === date && r.acceptedAt && !r.dismissedAt,
  );
  if (reservation) return "reservation";
  return "manual";
}

interface RecomputedSnapshot {
  plannedLevel: DailyLoadLevel;
  derived: DailyLoadLevel;
  source: LoadLevelSource;
  completedTaskCount: number;
  totalStudyMinutes: number;
}

export function recomputeDailyLoadSnapshot(
  date: string,
  settings: AppSettings,
  events: StudyEvent[],
): RecomputedSnapshot {
  const plannedLevel = getEffectiveLoadLevel(settings, date);
  const source = sourceForOverride(settings, date);
  const newProblemsCount = newProblemsOnDate(events, date);
  const reviewsCount = reviewsOnDate(events, date);
  const totalStudyMinutes = studyMinutesOnDate(events, date);
  const restDayTaken = restDayTakenOnDate(events, date);

  const derived = deriveActualLevel({
    totalStudyMinutes,
    newProblemsCount,
    reviewsCount,
    restDayTaken,
    plannedLevel,
  });

  return {
    plannedLevel,
    derived,
    source,
    completedTaskCount: newProblemsCount + reviewsCount,
    totalStudyMinutes,
  };
}

interface BuildInput {
  date: string;
  existing?: DailyLoadHistoryEntry;
  recomputed: RecomputedSnapshot;
  now: ISODate;
}

/**
 * Build the persisted entry from a recomputation, respecting immutability of
 * derivedActualLevel and manuallyCorrected actualLevel.
 */
export function buildDailyLoadHistoryEntry(
  input: BuildInput,
): DailyLoadHistoryEntry {
  if (!input.existing) {
    return {
      date: input.date,
      plannedLevel: input.recomputed.plannedLevel,
      actualLevel: input.recomputed.derived,
      derivedActualLevel: input.recomputed.derived,
      manuallyCorrected: false,
      correctionHistory: [],
      source: input.recomputed.source,
      completedTaskCount: input.recomputed.completedTaskCount,
      totalStudyMinutes: input.recomputed.totalStudyMinutes,
      createdAt: input.now,
      updatedAt: input.now,
    };
  }
  return {
    ...input.existing,
    completedTaskCount: input.recomputed.completedTaskCount,
    totalStudyMinutes: input.recomputed.totalStudyMinutes,
    updatedAt: input.now,
  };
}

export function applyManualCorrection(input: {
  entry: DailyLoadHistoryEntry;
  newLevel: DailyLoadLevel;
  reason?: DailyLoadCorrectionReason;
  note?: string;
  now: ISODate;
}): DailyLoadHistoryEntry {
  const correction: DailyLoadCorrection = {
    from: input.entry.actualLevel,
    to: input.newLevel,
    at: input.now,
    reason: input.reason,
    note: input.note,
  };
  return {
    ...input.entry,
    actualLevel: input.newLevel,
    manuallyCorrected: true,
    correctionHistory: [...input.entry.correctionHistory, correction],
    updatedAt: input.now,
  };
}

export function getLatestCorrection(
  entry: DailyLoadHistoryEntry,
): DailyLoadCorrection | undefined {
  return entry.correctionHistory[entry.correctionHistory.length - 1];
}

export function getCorrectionCount(entry: DailyLoadHistoryEntry): number {
  return entry.correctionHistory.length;
}

// ============================================================
// Day classification (for Recent Activity display)
// ============================================================

export type DayClassification =
  | "rest_day"
  | "recovery_day"
  | "no_activity"
  | "missed"
  | "active";

export function classifyDay(
  entry: DailyLoadHistoryEntry,
  events: StudyEvent[],
): DayClassification {
  const hasRest = events.some(
    (e) => e.type === "rest_day_taken" && e.date === entry.date,
  );
  if (hasRest) return "rest_day";

  if (
    entry.source === "reservation" &&
    (entry.plannedLevel === "minimum" || entry.plannedLevel === "review_only")
  ) {
    return "recovery_day";
  }

  if (entry.totalStudyMinutes === 0 && entry.completedTaskCount === 0) {
    if (
      entry.plannedLevel === "standard" ||
      entry.plannedLevel === "intensive"
    ) {
      return "missed";
    }
    return "no_activity";
  }

  return "active";
}

export const DAY_CLASSIFICATION_LABELS: Record<
  DayClassification,
  { ja: string; en: string; icon: string }
> = {
  rest_day: { ja: "休養日", en: "Rest day", icon: "💤" },
  recovery_day: { ja: "回復日", en: "Recovery day", icon: "🛡" },
  no_activity: { ja: "記録なし", en: "No activity", icon: "·" },
  missed: { ja: "学習未実施", en: "Missed", icon: "⚠" },
  active: { ja: "活動日", en: "Active", icon: "" },
};
