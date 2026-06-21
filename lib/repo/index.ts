import type { AppDataV2 } from "./storage";
import { APP_VERSION, CURRENT_SCHEMA_VERSION } from "./storage";
import { localStorageRepo } from "./localStorageRepo";
import { migratePersistedState } from "./migrate";
import { SEED_BLIND75 } from "@/lib/seed/blind75";
import { SEED_SQL50 } from "@/lib/seed/sql50";
import { SEED_PYTHON_CONCEPTS } from "@/lib/seed/pythonConcepts";
import { DEFAULT_START_DATE_ISO } from "@/lib/utils/date";

export const repo = localStorageRepo;

function makeDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function createInitialData(): AppDataV2 {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    problems: SEED_BLIND75,
    sqlProblems: SEED_SQL50,
    pythonConcepts: SEED_PYTHON_CONCEPTS,
    englishPractices: [],
    mistakes: [],
    mockSessions: [],
    studyTasks: [],
    studyEvents: [],
    dailyAggregates: [],
    dailyLoadHistory: [],
    settings: {
      startDate: DEFAULT_START_DATE_ISO,
      theme: "system",
      locale: "ja",
      defaultDailyLoadLevel: "standard",
      loadLevelOverrides: {},
      loadLevelReservations: [],
      deviceHint: "auto",
    },
    metadata: {
      deviceId: makeDeviceId(),
      eventCount: 0,
    },
  };
}

export function mergeWithSeed(persisted: AppDataV2): AppDataV2 {
  const initial = createInitialData();

  const mergeBySlug = <T extends { slug: string }>(seed: T[], saved: T[]): T[] => {
    const map = new Map<string, T>(seed.map((s) => [s.slug, s]));
    for (const s of saved) map.set(s.slug, s);
    return [...map.values()];
  };

  return {
    ...initial,
    ...persisted,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    problems: mergeBySlug(initial.problems, persisted.problems ?? []),
    sqlProblems: mergeBySlug(initial.sqlProblems, persisted.sqlProblems ?? []),
    pythonConcepts: mergeBySlug(
      initial.pythonConcepts,
      persisted.pythonConcepts ?? [],
    ),
    englishPractices: persisted.englishPractices ?? [],
    mistakes: persisted.mistakes ?? [],
    mockSessions: persisted.mockSessions ?? [],
    studyTasks: persisted.studyTasks ?? [],
    studyEvents: persisted.studyEvents ?? [],
    dailyAggregates: persisted.dailyAggregates ?? [],
    dailyLoadHistory: persisted.dailyLoadHistory ?? [],
    settings: { ...initial.settings, ...persisted.settings },
    metadata: { ...initial.metadata, ...persisted.metadata },
  };
}

export { migratePersistedState };
