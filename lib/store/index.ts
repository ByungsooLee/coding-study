"use client";

import { create } from "zustand";
import { createInitialData, mergeWithSeed, repo } from "@/lib/repo";
import type { AppData } from "@/lib/repo/storage";
import { computeNextReviewDates } from "@/lib/domain/review";
import { nowISO } from "@/lib/utils/date";
import type {
  EnglishPractice,
  MistakeLog,
  MockInterviewSession,
  Problem,
  ProblemStatus,
  PythonConcept,
  Settings,
  SqlProblem,
} from "@/lib/domain/types";

interface State {
  hydrated: boolean;
  storageAvailable: boolean;
  data: AppData;
}

interface Actions {
  hydrate: () => void;
  persist: () => void;

  updateSettings: (patch: Partial<Settings>) => void;

  updateProblem: (slug: string, patch: Partial<Problem>) => void;
  setProblemStatus: (slug: string, status: ProblemStatus) => void;

  updateSqlProblem: (slug: string, patch: Partial<SqlProblem>) => void;
  setSqlStatus: (slug: string, status: ProblemStatus) => void;

  updateConcept: (slug: string, patch: Partial<PythonConcept>) => void;
  markConceptReviewed: (slug: string) => void;
  setConceptReviewOutcome: (
    slug: string,
    outcome: "Failed" | "NeedReview" | "Solved",
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
  removeMistake: (id: string) => void;

  addMockSession: (
    s: Omit<MockInterviewSession, "createdAt" | "updatedAt" | "id">,
  ) => void;

  exportJSON: () => string;
  importJSON: (json: string) => void;
  resetAll: () => void;
}

const persistTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();

export const useStore = create<State & Actions>((set, get) => {
  const schedulePersist = () => {
    const ref = get();
    const existing = persistTimers.get(ref);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => repo.save(get().data), 100);
    persistTimers.set(ref, t);
  };

  return {
    hydrated: false,
    storageAvailable: false,
    data: createInitialData(),

    hydrate: () => {
      const available = repo.isAvailable();
      const saved = repo.load();
      if (saved) {
        set({ data: mergeWithSeed(saved), hydrated: true, storageAvailable: available });
      } else {
        set({ data: createInitialData(), hydrated: true, storageAvailable: available });
      }
    },

    persist: () => repo.save(get().data),

    updateSettings: (patch) => {
      set((s) => ({
        data: { ...s.data, settings: { ...s.data.settings, ...patch } },
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
      const reviewDates =
        status === "Failed" || status === "NeedReview" || status === "Solved"
          ? computeNextReviewDates(status)
          : [];
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
      const reviewDates =
        status === "Failed" || status === "NeedReview" || status === "Solved"
          ? computeNextReviewDates(status)
          : [];
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
                  reviewDates: computeNextReviewDates("NeedReview"),
                  updatedAt: nowISO(),
                }
              : c,
          ),
        },
      }));
      schedulePersist();
    },

    setConceptReviewOutcome: (slug, outcome) => {
      const nextStatus: PythonConcept["status"] =
        outcome === "Failed"
          ? "NotReviewed"
          : outcome === "Solved"
          ? "Mastered"
          : "Familiar";
      set((s) => ({
        data: {
          ...s.data,
          pythonConcepts: s.data.pythonConcepts.map((c) =>
            c.slug === slug
              ? {
                  ...c,
                  status: nextStatus,
                  reviewDates: computeNextReviewDates(outcome),
                  updatedAt: nowISO(),
                }
              : c,
          ),
        },
      }));
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
