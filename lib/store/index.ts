"use client";

import { create } from "zustand";
import { createInitialData, mergeWithSeed, repo } from "@/lib/repo";
import type { AppDataV2 } from "@/lib/repo/storage";
import { computeNextReviewDates } from "@/lib/domain/review";
import { nowISO } from "@/lib/utils/date";
import type {
  AppSettings,
  EnglishCoverage,
  EnglishPractice,
  MistakeLog,
  MockInterviewSession,
  Problem,
  ProblemStatus,
  PythonConcept,
  SqlProblem,
  StudyEvent,
} from "@/lib/domain/types";

interface State {
  hydrated: boolean;
  storageAvailable: boolean;
  data: AppDataV2;
}

interface Actions {
  hydrate: () => void;
  persist: () => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  updateProblem: (slug: string, patch: Partial<Problem>) => void;
  setProblemStatus: (slug: string, status: ProblemStatus) => void;
  setProblemEnglishCoverage: (slug: string, coverage: EnglishCoverage) => void;

  updateSqlProblem: (slug: string, patch: Partial<SqlProblem>) => void;
  setSqlStatus: (slug: string, status: ProblemStatus) => void;

  updateConcept: (slug: string, patch: Partial<PythonConcept>) => void;
  markConceptReviewed: (slug: string) => void;
  setConceptReviewOutcome: (
    slug: string,
    outcome: "failed" | "need_review" | "solved",
  ) => void;

  upsertEnglishPractice: (
    p: Omit<EnglishPractice, "createdAt" | "updatedAt" | "id"> & { id?: string },
  ) => void;
  recordEnglishPractice: (input: {
    problemSlug?: string;
    templateSlug?: string;
    mode: EnglishPractice["mode"];
    enNote?: string;
    jaNote?: string;
  }) => void;

  addMistake: (
    m: Omit<MistakeLog, "createdAt" | "updatedAt" | "id">,
  ) => void;
  updateMistake: (id: string, patch: Partial<MistakeLog>) => void;
  removeMistake: (id: string) => void;

  addMockSession: (
    s: Omit<MockInterviewSession, "createdAt" | "updatedAt" | "id">,
  ) => void;

  recordEvent: (event: Omit<StudyEvent, "id"> & { id?: string }) => void;

  exportJSON: () => string;
  importJSON: (json: string) => void;
  resetAll: () => void;
}

const persistTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();

/** Map review-completion outcome to a fresh ProblemStatus for reschedule. */
function outcomeToStatus(
  outcome: "failed" | "need_review" | "solved",
  current: ProblemStatus,
): ProblemStatus {
  if (outcome === "failed") return "failed";
  if (outcome === "need_review") return "need_review";
  // outcome === "solved"
  switch (current) {
    case "failed":
      return "need_review";
    case "need_review":
      return "solved_independently";
    case "solved_with_help":
      return "solved_independently";
    case "mastered":
      return "mastered";
    default:
      return "solved_independently";
  }
}

export const useStore = create<State & Actions>((set, get) => {
  const schedulePersist = () => {
    const ref = get();
    const existing = persistTimers.get(ref);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => repo.save(get().data), 100);
    persistTimers.set(ref, t);
  };

  const appendEvent = (event: StudyEvent) => {
    set((s) => ({
      data: {
        ...s.data,
        studyEvents: [...s.data.studyEvents, event],
        metadata: {
          ...s.data.metadata,
          eventCount: s.data.metadata.eventCount + 1,
        },
      },
    }));
  };

  return {
    hydrated: false,
    storageAvailable: false,
    data: createInitialData(),

    hydrate: () => {
      const available = repo.isAvailable();
      const saved = repo.load();
      if (saved) {
        set({
          data: mergeWithSeed(saved),
          hydrated: true,
          storageAvailable: available,
        });
      } else {
        set({
          data: createInitialData(),
          hydrated: true,
          storageAvailable: available,
        });
      }
    },

    persist: () => repo.save(get().data),

    updateSettings: (patch) => {
      set((s) => ({
        data: {
          ...s.data,
          settings: { ...s.data.settings, ...patch },
        },
      }));
      schedulePersist();
    },

    updateProblem: (slug, patch) => {
      set((s) => ({
        data: {
          ...s.data,
          problems: s.data.problems.map((p) =>
            p.slug === slug ? { ...p, ...patch, updatedAt: nowISO() } : p,
          ),
        },
      }));
      schedulePersist();
    },

    setProblemStatus: (slug, status) => {
      const before = get().data.problems.find((p) => p.slug === slug);
      const reviewDates = computeNextReviewDates(status);
      set((s) => ({
        data: {
          ...s.data,
          problems: s.data.problems.map((p) =>
            p.slug === slug
              ? {
                  ...p,
                  status,
                  reviewDates,
                  lastAttemptAt: nowISO(),
                  attemptCount: p.attemptCount + 1,
                  updatedAt: nowISO(),
                }
              : p,
          ),
        },
      }));
      if (before && before.status !== status) {
        appendEvent({
          id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          type: "problem_status_changed",
          timestamp: nowISO(),
          problemSlug: slug,
          from: before.status,
          to: status,
        });
      }
      schedulePersist();
    },

    setProblemEnglishCoverage: (slug, coverage) => {
      set((s) => ({
        data: {
          ...s.data,
          problems: s.data.problems.map((p) =>
            p.slug === slug
              ? { ...p, englishCoverage: coverage, updatedAt: nowISO() }
              : p,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "english_coverage_updated",
        timestamp: nowISO(),
        problemSlug: slug,
        coverage,
      });
      schedulePersist();
    },

    updateSqlProblem: (slug, patch) => {
      set((s) => ({
        data: {
          ...s.data,
          sqlProblems: s.data.sqlProblems.map((p) =>
            p.slug === slug ? { ...p, ...patch, updatedAt: nowISO() } : p,
          ),
        },
      }));
      schedulePersist();
    },

    setSqlStatus: (slug, status) => {
      const before = get().data.sqlProblems.find((p) => p.slug === slug);
      const reviewDates = computeNextReviewDates(status);
      set((s) => ({
        data: {
          ...s.data,
          sqlProblems: s.data.sqlProblems.map((p) =>
            p.slug === slug
              ? {
                  ...p,
                  status,
                  reviewDates,
                  lastAttemptAt: nowISO(),
                  attemptCount: p.attemptCount + 1,
                  updatedAt: nowISO(),
                }
              : p,
          ),
        },
      }));
      if (before && before.status !== status) {
        appendEvent({
          id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          type: "sql_status_changed",
          timestamp: nowISO(),
          sqlSlug: slug,
          from: before.status,
          to: status,
        });
      }
      schedulePersist();
    },

    updateConcept: (slug, patch) => {
      set((s) => ({
        data: {
          ...s.data,
          pythonConcepts: s.data.pythonConcepts.map((c) =>
            c.slug === slug ? { ...c, ...patch, updatedAt: nowISO() } : c,
          ),
        },
      }));
      schedulePersist();
    },

    markConceptReviewed: (slug) => {
      set((s) => ({
        data: {
          ...s.data,
          pythonConcepts: s.data.pythonConcepts.map((c) =>
            c.slug === slug
              ? {
                  ...c,
                  status: c.status === "NotReviewed" ? "Familiar" : "Mastered",
                  reviewDates: computeNextReviewDates("need_review"),
                  updatedAt: nowISO(),
                }
              : c,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "concept_reviewed",
        timestamp: nowISO(),
        conceptSlug: slug,
      });
      schedulePersist();
    },

    setConceptReviewOutcome: (slug, outcome) => {
      const nextStatus: PythonConcept["status"] =
        outcome === "failed"
          ? "NotReviewed"
          : outcome === "solved"
          ? "Mastered"
          : "Familiar";
      const psStatus: ProblemStatus =
        outcome === "failed"
          ? "failed"
          : outcome === "solved"
          ? "solved_independently"
          : "need_review";
      set((s) => ({
        data: {
          ...s.data,
          pythonConcepts: s.data.pythonConcepts.map((c) =>
            c.slug === slug
              ? {
                  ...c,
                  status: nextStatus,
                  reviewDates: computeNextReviewDates(psStatus),
                  updatedAt: nowISO(),
                }
              : c,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "review_completed",
        timestamp: nowISO(),
        targetType: "PythonConcept",
        targetSlug: slug,
        outcome,
      });
      schedulePersist();
    },

    upsertEnglishPractice: (p) => {
      const id = p.id ?? `eng-${Date.now()}`;
      set((s) => {
        const existing = s.data.englishPractices.find((e) => e.id === id);
        const now = nowISO();
        const next: EnglishPractice = existing
          ? { ...existing, ...p, id, updatedAt: now }
          : {
              ...p,
              id,
              createdAt: now,
              updatedAt: now,
              practiceCount: (p.practiceCount ?? 0) + 1,
            };
        return {
          data: {
            ...s.data,
            englishPractices: existing
              ? s.data.englishPractices.map((e) => (e.id === id ? next : e))
              : [...s.data.englishPractices, next],
          },
        };
      });
      schedulePersist();
    },

    recordEnglishPractice: ({ problemSlug, templateSlug, mode, enNote, jaNote }) => {
      const target = problemSlug ?? templateSlug ?? "free";
      const id = `eng-${target}-${mode}`;
      const now = nowISO();
      set((s) => {
        const existing = s.data.englishPractices.find((e) => e.id === id);
        const next: EnglishPractice = existing
          ? {
              ...existing,
              enNote: enNote ?? existing.enNote,
              jaNote: jaNote ?? existing.jaNote,
              practiceCount: existing.practiceCount + 1,
              lastPracticedAt: now,
              updatedAt: now,
            }
          : {
              id,
              problemSlug,
              templateSlug,
              mode,
              enNote: enNote ?? "",
              jaNote: jaNote ?? "",
              practiceCount: 1,
              lastPracticedAt: now,
              tags: [],
              createdAt: now,
              updatedAt: now,
            };
        return {
          data: {
            ...s.data,
            englishPractices: existing
              ? s.data.englishPractices.map((e) => (e.id === id ? next : e))
              : [...s.data.englishPractices, next],
          },
        };
      });
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "english_practice",
        timestamp: now,
        problemSlug,
        templateSlug,
        mode,
      });
      schedulePersist();
    },

    addMistake: (m) => {
      const now = nowISO();
      const id = `mistake-${Date.now()}`;
      set((s) => ({
        data: {
          ...s.data,
          mistakes: [
            ...s.data.mistakes,
            { ...m, id, createdAt: now, updatedAt: now },
          ],
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "mistake_logged",
        timestamp: now,
        mistakeId: id,
        failureType: m.failureType,
      });
      schedulePersist();
    },

    updateMistake: (id, patch) => {
      set((s) => ({
        data: {
          ...s.data,
          mistakes: s.data.mistakes.map((m) =>
            m.id === id ? { ...m, ...patch, updatedAt: nowISO() } : m,
          ),
        },
      }));
      schedulePersist();
    },

    removeMistake: (id) => {
      set((s) => ({
        data: { ...s.data, mistakes: s.data.mistakes.filter((m) => m.id !== id) },
      }));
      schedulePersist();
    },

    addMockSession: (sess) => {
      const now = nowISO();
      const id = `mock-${Date.now()}`;
      set((s) => ({
        data: {
          ...s.data,
          mockSessions: [
            ...s.data.mockSessions,
            { ...sess, id, createdAt: now, updatedAt: now },
          ],
        },
      }));
      schedulePersist();
    },

    recordEvent: (event) => {
      const id = event.id ?? `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      appendEvent({ ...event, id } as StudyEvent);
      schedulePersist();
    },

    exportJSON: () => JSON.stringify(get().data, null, 2),

    importJSON: (json) => {
      try {
        const parsed = repo.importJSON(json);
        set({ data: mergeWithSeed(parsed) });
      } catch (err) {
        console.error("[store] importJSON failed:", err);
        throw err;
      }
    },

    resetAll: () => {
      repo.clear();
      set({ data: createInitialData() });
    },
  };
});

// Helper exported for callsites that previously imported outcomeToStatus.
export { outcomeToStatus };
