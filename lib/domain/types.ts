import type { ISODate } from "@/lib/utils/date";

// ===== shared =====
export type DeviceMode = "pc" | "tablet" | "mobile";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type ProblemStatus =
  | "NotStarted"
  | "InProgress"
  | "Solved"
  | "NeedReview"
  | "Failed";

export type ReviewStatus = "Due" | "Upcoming" | "Done";

export type StudyCategory = "Python" | "LeetCode" | "SQL" | "English";

export type LeetcodeTopic =
  | "ArrayHashing"
  | "TwoPointers"
  | "SlidingWindow"
  | "Stack"
  | "BinarySearch"
  | "LinkedList"
  | "Trees"
  | "Graphs"
  | "Heap"
  | "Intervals"
  | "Backtracking"
  | "DP";

export type SqlTopic =
  | "SelectWhere"
  | "Join"
  | "GroupByHaving"
  | "CteSubquery"
  | "CaseWhen"
  | "WindowFunctions"
  | "Ranking"
  | "DateHandling"
  | "RollingAggregate"
  | "AdvancedJoin"
  | "AdvancedAggregation";

export type FailureType =
  | "AlgorithmIdea"
  | "DataStructureChoice"
  | "EdgeCase"
  | "ImplementationBug"
  | "TimeComplexity"
  | "SqlSyntax"
  | "EnglishExplanation";

// ===== entity base =====
export interface Entity {
  id: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ===== schedule =====
export interface StudyWeek {
  id: string;
  weekNumber: number; // 1..12
  theme: string;
  pythonTopics: string[];
  leetcodeTopics: LeetcodeTopic[];
  sqlTopics: SqlTopic[];
  englishFocus: string;
  problemSlugs: string[]; // slugs into Problem.slug
  sqlSlugs: string[];
  pythonConceptSlugs: string[];
}

export interface StudyTask extends Entity {
  weekNumber: number;
  category: StudyCategory;
  title: string;
  refSlug?: string;
  status: "Todo" | "Done";
  dueAt?: ISODate;
  completedAt?: ISODate;
  notes?: string;
  tags: string[];
}

// ===== problem (Blind 75) =====
export interface Problem extends Entity {
  slug: string;
  title: string;
  topic: LeetcodeTopic;
  difficulty: Difficulty;
  weekNumber: number;
  url: string;
  hints: string[];
  status: ProblemStatus;
  // Free-text user-owned notes
  codeNote: string;
  pseudoCode: string;
  pythonCode: string;
  complexityNote: string;
  edgeCases: string;
  mistakeReason: string;
  englishNote: string;
  japaneseNote: string;
  reviewDates: ISODate[];
  lastAttemptAt?: ISODate;
  attemptCount: number;
  tags: string[];
}

// ===== sql =====
export interface SqlProblem extends Entity {
  slug: string;
  title: string;
  topic: SqlTopic;
  difficulty: Difficulty;
  weekNumber: number;
  url: string;
  status: ProblemStatus;
  sqlCode: string;
  note: string;
  mistakeReason: string;
  englishNote: string;
  reviewDates: ISODate[];
  lastAttemptAt?: ISODate;
  attemptCount: number;
  tags: string[];
}

// ===== python concept =====
export interface CodeExample {
  label: string;
  code: string;
  output?: string;
}

export interface PythonConcept extends Entity {
  slug: string;
  name: string;
  oneLiner: string;
  whenToUse: string;
  commonOps: string[];
  codeExamples: CodeExample[];
  complexity: string;
  interviewUses: string[];
  commonMistakes: string[];
  relatedProblemSlugs: string[];
  reviewDates: ISODate[];
  status: "NotReviewed" | "Familiar" | "Mastered";
  tags: string[];
}

// ===== english =====
export interface EnglishTemplateSegment {
  label: string;
  en: string;
  ja: string;
}

export interface EnglishTemplate {
  id: string;
  slug: string;
  title: string;
  scenario: string;
  segments: EnglishTemplateSegment[];
  phrases: string[];
}

export interface EnglishPractice extends Entity {
  problemSlug?: string;
  templateSlug?: string;
  mode: "1min" | "2min" | "free";
  enNote: string;
  jaNote: string;
  lastPracticedAt?: ISODate;
  practiceCount: number;
  tags: string[];
}

// ===== mistakes =====
export interface MistakeLog extends Entity {
  problemSlug?: string;
  sqlProblemSlug?: string;
  category: StudyCategory;
  failureType: FailureType;
  description: string;
  correctIdea: string;
  prevention: string;
  relatedConceptSlugs: string[];
  reviewDate?: ISODate;
  tags: string[];
}

// ===== review =====
export type ReviewTargetType =
  | "Problem"
  | "SqlProblem"
  | "PythonConcept"
  | "English";

export interface ReviewItem {
  targetType: ReviewTargetType;
  targetId: string;
  targetSlug: string;
  title: string;
  dueAt: ISODate;
  status: ReviewStatus;
  intervalStage: number;
  createdFromStatus?: ProblemStatus;
}

// ===== mock interview =====
export interface MockInterviewSession extends Entity {
  problemSlug: string;
  startedAt: ISODate;
  endedAt?: ISODate;
  durationSec: number;
  clarificationNote: string;
  approachNote: string;
  code: string;
  testCases: string;
  complexity: string;
  englishExplanation: string;
  selfRating?: 1 | 2 | 3 | 4 | 5;
  outcome?: "Solved" | "NeedReview" | "Failed";
  tags: string[];
}

// ===== settings =====
export interface Settings {
  startDate: ISODate;
  theme: "system" | "light" | "dark";
  locale: "ja" | "en";
  dailyTargetMinutes: number;
  deviceHint: DeviceMode | "auto";
}
