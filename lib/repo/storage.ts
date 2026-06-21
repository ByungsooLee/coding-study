import type {
  AppSettings,
  DailyAggregate,
  DailyLoadHistoryEntry,
  EnglishPractice,
  MistakeLog,
  MockInterviewSession,
  Problem,
  PythonConcept,
  SqlProblem,
  StudyEvent,
  StudyTask,
} from "@/lib/domain/types";

export const CURRENT_SCHEMA_VERSION = 2 as const;
export const APP_VERSION = "0.2.0";

/**
 * Top-level persisted shape (v2). Flat to keep existing call-sites simple.
 */
export interface AppDataV2 {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  appVersion?: string;
  exportedAt?: string;

  problems: Problem[];
  sqlProblems: SqlProblem[];
  pythonConcepts: PythonConcept[];
  englishPractices: EnglishPractice[];
  mistakes: MistakeLog[];
  mockSessions: MockInterviewSession[];
  studyTasks: StudyTask[];
  studyEvents: StudyEvent[];
  dailyAggregates: DailyAggregate[];
  dailyLoadHistory: DailyLoadHistoryEntry[];
  settings: AppSettings;

  metadata: {
    deviceId: string;
    userAgent?: string;
    eventCount: number;
    totalSizeBytes?: number;
  };
}

// Backwards compatible alias for callsites.
export type AppData = AppDataV2;

export interface StorageRepo {
  load(): AppDataV2 | null;
  save(data: AppDataV2): void;
  isAvailable(): boolean;
  exportJSON(): string;
  importJSON(json: string): AppDataV2;
  clear(): void;
  takeSnapshot(data: AppDataV2): void;
}
