import type { AppData } from "./storage";
import { CURRENT_VERSION, localStorageRepo } from "./localStorageRepo";
import { SEED_BLIND75 } from "@/lib/seed/blind75";
import { SEED_SQL50 } from "@/lib/seed/sql50";
import { SEED_PYTHON_CONCEPTS } from "@/lib/seed/pythonConcepts";
import { DEFAULT_START_DATE_ISO } from "@/lib/utils/date";

export const repo = localStorageRepo;

export function createInitialData(): AppData {
  return {
    version: CURRENT_VERSION,
    problems: SEED_BLIND75,
    sqlProblems: SEED_SQL50,
    pythonConcepts: SEED_PYTHON_CONCEPTS,
    englishPractices: [],
    mistakes: [],
    mockSessions: [],
    studyTasks: [],
    settings: {
      startDate: DEFAULT_START_DATE_ISO,
      theme: "system",
      locale: "ja",
      dailyTargetMinutes: 90,
      deviceHint: "auto",
    },
  };
}

/**
 * Merge persisted data with the latest seed so that newly added problems / concepts
 * appear without wiping user progress.
 */
export function mergeWithSeed(persisted: AppData): AppData {
  const initial = createInitialData();

  const mergeBySlug = <T extends { slug: string }>(seed: T[], saved: T[]): T[] => {
    const map = new Map<string, T>(seed.map((s) => [s.slug, s]));
    for (const s of saved) map.set(s.slug, s);
    return [...map.values()];
  };

  return {
    ...initial,
    ...persisted,
    problems: mergeBySlug(initial.problems, persisted.problems),
    sqlProblems: mergeBySlug(initial.sqlProblems, persisted.sqlProblems),
    pythonConcepts: mergeBySlug(initial.pythonConcepts, persisted.pythonConcepts),
    settings: { ...initial.settings, ...persisted.settings },
  };
}
