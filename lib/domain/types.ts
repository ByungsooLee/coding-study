import type { ISODate } from "@/lib/utils/date";

// ============================================================
// Shared primitives
// ============================================================

export type DeviceMode = "pc" | "tablet" | "mobile";
export type Difficulty = "Easy" | "Medium" | "Hard";

// ============================================================
// ProblemStatus (8 states)
// ============================================================

export type ProblemStatus =
  | "not_started"
  | "reading"
  | "attempted"
  | "solved_with_help"
  | "solved_independently"
  | "need_review"
  | "failed"
  | "mastered";

export const PROBLEM_STATUS_LABELS: Record<ProblemStatus, string> = {
  not_started: "Not Started",
  reading: "Reading",
  attempted: "Attempted",
  solved_with_help: "Solved (with help)",
  solved_independently: "Solved (independently)",
  need_review: "Need Review",
  failed: "Failed",
  mastered: "Mastered",
};

// ============================================================
// Review
// ============================================================

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

// ============================================================
// Entity base
// ============================================================

export interface Entity {
  id: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ============================================================
// EnglishCoverage (6 keys — source of truth)
// ============================================================

export const ENGLISH_COVERAGE_KEYS = [
  "clarification",
  "bruteForce",
  "optimization",
  "dataStructureTradeoff",
  "complexity",
  "edgeCases",
] as const;

export type EnglishCoverageKey = (typeof ENGLISH_COVERAGE_KEYS)[number];

export type EnglishCoverage = Record<EnglishCoverageKey, boolean>;

export const DEFAULT_ENGLISH_COVERAGE: EnglishCoverage = Object.fromEntries(
  ENGLISH_COVERAGE_KEYS.map((k) => [k, false]),
) as EnglishCoverage;

export function isEnglishCoverageComplete(c: EnglishCoverage): boolean {
  return ENGLISH_COVERAGE_KEYS.every((k) => c[k]);
}

export function countEnglishCoverage(c: EnglishCoverage): number {
  return ENGLISH_COVERAGE_KEYS.filter((k) => c[k]).length;
}

export const ENGLISH_COVERAGE_LABELS: Record<
  EnglishCoverageKey,
  { ja: string; en: string }
> = {
  clarification: { ja: "前提確認", en: "Clarification" },
  bruteForce: { ja: "素朴解", en: "Brute Force" },
  optimization: { ja: "最適化アイデア", en: "Optimization" },
  dataStructureTradeoff: {
    ja: "データ構造のトレードオフ",
    en: "Data Structure Trade-off",
  },
  complexity: { ja: "計算量", en: "Complexity" },
  edgeCases: { ja: "エッジケース", en: "Edge Cases" },
};

// ============================================================
// Schedule
// ============================================================

export interface StudyWeek {
  id: string;
  weekNumber: number;
  theme: string;
  pythonTopics: string[];
  leetcodeTopics: LeetcodeTopic[];
  sqlTopics: SqlTopic[];
  englishFocus: string;
  problemSlugs: string[];
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

// ============================================================
// Mastery
// ============================================================

export type MasteryCriterion =
  | "independent_review_count"
  | "latest_review_solved"
  | "within_time_threshold"
  | "english_explanation_done"
  | "complexity_documented"
  | "edge_cases_documented";

export interface MasteryEvaluation {
  ready: boolean;
  satisfied: MasteryCriterion[];
  missing: MasteryCriterion[];
  englishCoverageMissing: EnglishCoverageKey[];
}

export type MasteryRiskReason =
  | "post_mastery_failure"
  | "time_threshold_exceeded"
  | "english_coverage_lost"
  | "stale_review";

export interface MasteryRisk {
  atRisk: boolean;
  reasons: MasteryRiskReason[];
  detectedAt: ISODate;
}

// ============================================================
// Problem (Blind 75)
// ============================================================

export interface Problem extends Entity {
  slug: string;
  title: string;
  topic: LeetcodeTopic;
  difficulty: Difficulty;
  weekNumber: number;
  url: string;
  hints: string[];
  status: ProblemStatus;
  codeNote: string;
  pseudoCode: string;
  pythonCode: string;
  complexityNote: string;
  edgeCases: string;
  mistakeReason: string;
  englishNote: string;
  japaneseNote: string;
  englishCoverage: EnglishCoverage;
  reviewDates: ISODate[];
  lastAttemptAt?: ISODate;
  lastSolveDurationSec?: number;
  attemptCount: number;
  masteryRisk?: MasteryRisk;
  tags: string[];
}

// ============================================================
// SQL Problem
// ============================================================

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

// ============================================================
// Python Concept
// ============================================================

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

// ============================================================
// English template
// ============================================================

export interface EnglishTemplateSegment {
  key?: EnglishCoverageKey;
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

// ============================================================
// Mistakes
// ============================================================

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

// ============================================================
// Review item (derived)
// ============================================================

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

// ============================================================
// Mock interview
// ============================================================

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

// ============================================================
// DailyLoadLevel + reservations + corrections
// ============================================================

export type DailyLoadLevel = "minimum" | "standard" | "intensive" | "review_only";

export interface DailyLoadConfig {
  level: DailyLoadLevel;
  targetMinutes: number;
  maxNewProblems: number;
  maxSqlProblems: number;
  maxReviews: number;
  requiresEnglishPractice: boolean;
}

export const LOAD_PRESETS: Record<DailyLoadLevel, DailyLoadConfig> = {
  minimum: {
    level: "minimum",
    targetMinutes: 30,
    maxNewProblems: 0,
    maxSqlProblems: 0,
    maxReviews: 3,
    requiresEnglishPractice: false,
  },
  standard: {
    level: "standard",
    targetMinutes: 90,
    maxNewProblems: 1,
    maxSqlProblems: 1,
    maxReviews: 5,
    requiresEnglishPractice: true,
  },
  intensive: {
    level: "intensive",
    targetMinutes: 180,
    maxNewProblems: 2,
    maxSqlProblems: 2,
    maxReviews: 10,
    requiresEnglishPractice: true,
  },
  review_only: {
    level: "review_only",
    targetMinutes: 60,
    maxNewProblems: 0,
    maxSqlProblems: 0,
    maxReviews: 999,
    requiresEnglishPractice: false,
  },
};

export type LoadLevelSource =
  | "default"
  | "override"
  | "reservation"
  | "manual";

export type ReservationReason = "burnout_recommendation" | "manual";

export interface LoadLevelReservation {
  id: string;
  date: string;
  level: DailyLoadLevel;
  reason: ReservationReason;
  reasonDetail?: string;
  createdAt: ISODate;
  acceptedAt?: ISODate;
  dismissedAt?: ISODate;
}

// 8 preset reasons
export const DAILY_LOAD_CORRECTION_REASONS = [
  "lost_focus",
  "felt_tired",
  "unexpected_work",
  "family_or_personal",
  "overestimated_capacity",
  "underestimated_capacity",
  "recovery_needed",
  "manual_correction_other",
] as const;

export type DailyLoadCorrectionReason =
  (typeof DAILY_LOAD_CORRECTION_REASONS)[number];

export const DAILY_LOAD_CORRECTION_REASON_LABELS: Record<
  DailyLoadCorrectionReason,
  { ja: string; en: string; tone: "neutral" | "self_kindness" | "self_growth" }
> = {
  lost_focus: {
    ja: "集中力が続かなかった",
    en: "Lost focus",
    tone: "neutral",
  },
  felt_tired: {
    ja: "疲れていた",
    en: "Felt tired",
    tone: "self_kindness",
  },
  unexpected_work: {
    ja: "予定外の仕事が入った",
    en: "Unexpected work",
    tone: "neutral",
  },
  family_or_personal: {
    ja: "私用が入った",
    en: "Family / personal matter",
    tone: "neutral",
  },
  overestimated_capacity: {
    ja: "予定を重く見積もりすぎた",
    en: "Overestimated capacity",
    tone: "self_growth",
  },
  underestimated_capacity: {
    ja: "実際はもっとできた",
    en: "Underestimated capacity",
    tone: "self_growth",
  },
  recovery_needed: {
    ja: "回復日が必要だった",
    en: "Recovery needed",
    tone: "self_kindness",
  },
  manual_correction_other: {
    ja: "その他",
    en: "Other",
    tone: "neutral",
  },
};

export interface DailyLoadCorrection {
  from: DailyLoadLevel;
  to: DailyLoadLevel;
  at: ISODate;
  reason?: DailyLoadCorrectionReason;
  note?: string;
}

export interface DailyLoadHistoryEntry {
  date: string;
  plannedLevel: DailyLoadLevel;
  actualLevel: DailyLoadLevel;
  derivedActualLevel: DailyLoadLevel;
  manuallyCorrected: boolean;
  correctionHistory: DailyLoadCorrection[];
  source: LoadLevelSource;
  completedTaskCount: number;
  totalStudyMinutes: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ============================================================
// DailyAggregate (long-term retention)
// ============================================================

export interface DailyAggregate {
  date: string;
  totalActiveMinutes: number;
  problemsOpened: number;
  problemsAttempted: number;
  problemsSolvedIndependently: number;
  problemsSolvedWithHelp: number;
  problemsFailed: number;
  sqlOpened: number;
  sqlSolvedIndependently: number;
  sqlSolvedWithHelp: number;
  reviewsCompleted: {
    failed: number;
    need_review: number;
    solved: number;
  };
  conceptsReviewed: number;
  englishPracticeCount: number;
  englishPracticeMinutes: number;
  mistakesLogged: number;
  lightReviewCount: number;
  lightReviewCappedCount: number;
  dailyLoadLevel?: DailyLoadLevel;
  readinessSnapshot?: {
    overall: number;
    coding: number;
    sql: number;
    englishExplanation: number;
    reviewConsistency: number;
    weaknessControl: number;
  };
}

// ============================================================
// StudyEvent (180 day retention)
// ============================================================

export type LoadLevelChangeReason =
  | "user_manual"
  | "burnout_recommendation_accepted"
  | "user_overrode_burnout_recommendation"
  | "reservation_dismissed";

export type BurnoutLevel = "ok" | "watch" | "high";

export type BurnoutReason =
  | "consecutive_intensive_3"
  | "consecutive_intensive_5"
  | "intensive_5_in_7_days";

export type BurnoutRecommendation = "minimum_tomorrow" | "review_only_day";

export interface BurnoutAlert {
  level: BurnoutLevel;
  reasons: BurnoutReason[];
  detail: {
    consecutiveIntensive: number;
    intensiveInLast7Days: number;
  };
  recommendation?: BurnoutRecommendation;
  message?: string;
}

export type StudyEvent =
  | {
      id: string;
      type: "problem_opened";
      timestamp: ISODate;
      problemSlug: string;
      weekNumber?: number;
    }
  | {
      id: string;
      type: "problem_status_changed";
      timestamp: ISODate;
      problemSlug: string;
      from: ProblemStatus;
      to: ProblemStatus;
      durationSec?: number;
    }
  | {
      id: string;
      type: "sql_status_changed";
      timestamp: ISODate;
      sqlSlug: string;
      from: ProblemStatus;
      to: ProblemStatus;
    }
  | {
      id: string;
      type: "review_completed";
      timestamp: ISODate;
      targetType: ReviewTargetType;
      targetSlug: string;
      outcome: "failed" | "need_review" | "solved";
    }
  | {
      id: string;
      type: "concept_reviewed";
      timestamp: ISODate;
      conceptSlug: string;
    }
  | {
      id: string;
      type: "english_practice";
      timestamp: ISODate;
      problemSlug?: string;
      templateSlug?: string;
      mode: "1min" | "2min" | "free";
      durationSec?: number;
    }
  | {
      id: string;
      type: "english_coverage_updated";
      timestamp: ISODate;
      problemSlug: string;
      coverage: EnglishCoverage;
    }
  | {
      id: string;
      type: "mistake_logged";
      timestamp: ISODate;
      mistakeId: string;
      failureType: FailureType;
    }
  | {
      id: string;
      type: "session_started" | "session_ended";
      timestamp: ISODate;
      sessionId: string;
      durationSec?: number;
    }
  | {
      id: string;
      type: "daily_load_set";
      timestamp: ISODate;
      level: DailyLoadLevel;
    }
  | {
      id: string;
      type: "load_level_changed";
      timestamp: ISODate;
      date: string;
      from: DailyLoadLevel;
      to: DailyLoadLevel;
      reason: LoadLevelChangeReason;
      reservationId?: string;
    }
  | {
      id: string;
      type: "actual_level_manually_corrected";
      timestamp: ISODate;
      date: string;
      from: DailyLoadLevel;
      to: DailyLoadLevel;
      reason?: DailyLoadCorrectionReason;
      note?: string;
    }
  | {
      id: string;
      type: "mastery_confirmed";
      timestamp: ISODate;
      problemSlug: string;
    }
  | {
      id: string;
      type: "mastery_demoted";
      timestamp: ISODate;
      problemSlug: string;
      reasons: MasteryRiskReason[];
    }
  | {
      id: string;
      type: "mastery_at_risk_detected";
      timestamp: ISODate;
      problemSlug: string;
      reasons: MasteryRiskReason[];
    }
  | {
      id: string;
      type: "burnout_detected";
      timestamp: ISODate;
      level: BurnoutLevel;
      reasons: BurnoutReason[];
      consecutiveIntensive: number;
      intensiveInLast7Days: number;
    }
  | {
      id: string;
      type: "load_level_reservation_created";
      timestamp: ISODate;
      reservationId: string;
      date: string;
      level: DailyLoadLevel;
      reason: ReservationReason;
    }
  | {
      id: string;
      type: "load_level_reservation_accepted";
      timestamp: ISODate;
      reservationId: string;
      date: string;
      level: DailyLoadLevel;
    }
  | {
      id: string;
      type: "load_level_reservation_dismissed";
      timestamp: ISODate;
      reservationId: string;
    }
  | {
      id: string;
      type: "rest_day_taken";
      timestamp: ISODate;
      date: string;
    }
  | {
      id: string;
      type: "light_review_taken";
      timestamp: ISODate;
      date: string;
      mode: "quick" | "selected_items";
      items?: { kind: "concept" | "english_template"; slug: string }[];
    }
  | {
      id: string;
      type: "export_taken";
      timestamp: ISODate;
      eventCount: number;
    };

export type StudyEventType = StudyEvent["type"];

// ============================================================
// ReadinessScore
// ============================================================

export type ConfidenceLevel = "insufficient_data" | "low" | "medium" | "high";

export interface ReadinessDims {
  coding: number;
  sql: number;
  englishExplanation: number;
  reviewConsistency: number;
  weaknessControl: number;
}

export interface ReadinessScore {
  computedAt: ISODate;
  overall: number;
  dimensions: ReadinessDims;
  signals: {
    daysOfData: number;
    insufficientData: boolean;
  };
}

export const READINESS_WEIGHTS: Record<keyof ReadinessDims, number> = {
  coding: 30,
  sql: 20,
  englishExplanation: 20,
  reviewConsistency: 15,
  weaknessControl: 15,
};

export interface WeaknessControlResult {
  score: number | null;
  topCategories: { label: string; count: number }[];
  attemptedCount: number;
  unresolvedCount: number;
  confidence: ConfidenceLevel;
  message?: string;
}

// ============================================================
// Settings
// ============================================================

export interface AppSettings {
  startDate: ISODate;
  theme: "system" | "light" | "dark";
  locale: "ja" | "en";
  defaultDailyLoadLevel: DailyLoadLevel;
  loadLevelOverrides: Record<string, DailyLoadLevel>;
  loadLevelReservations: LoadLevelReservation[];
  deviceHint: DeviceMode | "auto";
}

// Legacy alias for backward compatibility within this codebase.
export type Settings = AppSettings;
