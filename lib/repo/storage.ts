import type {
  EnglishPractice,
  MistakeLog,
  MockInterviewSession,
  Problem,
  PythonConcept,
  Settings,
  SqlProblem,
  StudyTask,
} from "@/lib/domain/types";

export interface AppData {
  version: number;
  problems: Problem[];
  sqlProblems: SqlProblem[];
  pythonConcepts: PythonConcept[];
  englishPractices: EnglishPractice[];
  mistakes: MistakeLog[];
  mockSessions: MockInterviewSession[];
  studyTasks: StudyTask[];
  settings: Settings;
}

/**
 * Storage repository interface. The localStorage implementation is the MVP.
 * A SupabaseRepo can be dropped in later without touching consumers.
 */
export interface StorageRepo {
  load(): AppData | null;
  save(data: AppData): void;
  isAvailable(): boolean;
  exportJSON(): string;
  importJSON(json: string): AppData;
  clear(): void;
}
