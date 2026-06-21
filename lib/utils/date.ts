import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

export type ISODate = string;

export function toISO(d: Date): ISODate {
  return d.toISOString();
}

export function fromISO(s: ISODate): Date {
  return parseISO(s);
}

export function today(): Date {
  return startOfDay(new Date());
}

export function addDaysISO(s: ISODate, days: number): ISODate {
  return toISO(addDays(fromISO(s), days));
}

export function isToday(s: ISODate, now: Date = new Date()): boolean {
  return isSameDay(fromISO(s), now);
}

export function isDueBy(s: ISODate, now: Date = new Date()): boolean {
  return startOfDay(fromISO(s)).getTime() <= startOfDay(now).getTime();
}

export function daysFromNow(s: ISODate, now: Date = new Date()): number {
  return differenceInCalendarDays(fromISO(s), now);
}

export function formatShort(s: ISODate): string {
  return format(fromISO(s), "MMM d");
}

export function formatLong(s: ISODate): string {
  return format(fromISO(s), "yyyy-MM-dd (EEE)");
}

export function nowISO(): ISODate {
  return new Date().toISOString();
}

/** Default study start: Week 1 Day 1 = 2026-06-22 (Mon) per spec. */
export const DEFAULT_START_DATE_ISO: ISODate = "2026-06-22T00:00:00.000Z";

/**
 * Given an ISO start date and today, returns 1-based week number (1..12).
 * Returns 0 if today is before start. Returns >12 if past plan.
 */
export function computeWeekNumber(
  startISO: ISODate,
  now: Date = new Date(),
): number {
  const start = startOfDay(fromISO(startISO));
  const today = startOfDay(now);
  const diff = differenceInCalendarDays(today, start);
  if (diff < 0) return 0;
  return Math.floor(diff / 7) + 1;
}

/**
 * Day index 1..7 within the current week.
 */
export function computeDayOfWeek(
  startISO: ISODate,
  now: Date = new Date(),
): number {
  const start = startOfDay(fromISO(startISO));
  const today = startOfDay(now);
  const diff = differenceInCalendarDays(today, start);
  if (diff < 0) return 1;
  return (diff % 7) + 1;
}
