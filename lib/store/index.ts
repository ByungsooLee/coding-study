"use client";

import { create } from "zustand";
import { createInitialData, mergeWithSeed, repo } from "@/lib/repo";
import type { AppDataV2 } from "@/lib/repo/storage";
import { computeNextReviewDates } from "@/lib/domain/review";
import { detectMasteryRisk } from "@/lib/domain/mastery";
import {
  applyManualCorrection,
  buildDailyLoadHistoryEntry,
  recomputeDailyLoadSnapshot,
} from "@/lib/domain/load";
import { nowISO } from "@/lib/utils/date";
import type {
  AppSettings,
  DailyLoadCorrectionReason,
  DailyLoadLevel,
  EnglishCoverage,
  EnglishPractice,
  LoadLevelChangeReason,
  LoadLevelReservation,
  MasteryRiskReason,
  MistakeLog,
  MockInterviewSession,
  Problem,
  ProblemStatus,
  PythonConcept,
  ReservationReason,
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

  // === Mastery ===
  confirmMastery: (problemSlug: string) => void;
  demoteMastery: (problemSlug: string, reasons: MasteryRiskReason[]) => void;
  refreshMasteryRisks: () => void;

  // === Load level / reservations ===
  setDefaultDailyLoadLevel: (level: DailyLoadLevel) => void;
  setLoadLevelOverride: (
    date: string,
    level: DailyLoadLevel,
    reason: LoadLevelChangeReason,
  ) => void;
  clearLoadLevelOverride: (date: string) => void;

  createLoadLevelReservation: (
    input: Omit<LoadLevelReservation, "id" | "createdAt"> & {
      id?: string;
      reason: ReservationReason;
    },
  ) => string;
  acceptLoadLevelReservation: (reservationId: string) => void;
  dismissLoadLevelReservation: (reservationId: string) => void;

  // === Daily load history ===
  commitDailyLoadHistory: (date: string) => void;
  commitMissingDailyLoadHistories: () => void;
  correctActualLevel: (input: {
    date: string;
    newLevel: DailyLoadLevel;
    reason?: DailyLoadCorrectionReason;
    note?: string;
  }) => void;

  // === Rest / light review ===
  recordRestDay: () => void;
  recordLightReviewQuick: () => void;

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

    // ====================================================================
    // Mastery
    // ====================================================================

    confirmMastery: (problemSlug) => {
      const now = nowISO();
      set((s) => ({
        data: {
          ...s.data,
          problems: s.data.problems.map((p) =>
            p.slug === problemSlug
              ? {
                  ...p,
                  status: "mastered",
                  reviewDates: computeNextReviewDates("mastered"),
                  masteryRisk: { atRisk: false, reasons: [], detectedAt: now },
                  updatedAt: now,
                }
              : p,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "mastery_confirmed",
        timestamp: now,
        problemSlug,
      });
      schedulePersist();
    },

    demoteMastery: (problemSlug, reasons) => {
      const now = nowISO();
      set((s) => ({
        data: {
          ...s.data,
          problems: s.data.problems.map((p) =>
            p.slug === problemSlug
              ? {
                  ...p,
                  status: "need_review",
                  reviewDates: computeNextReviewDates("need_review"),
                  masteryRisk: undefined,
                  updatedAt: now,
                }
              : p,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "mastery_demoted",
        timestamp: now,
        problemSlug,
        reasons,
      });
      schedulePersist();
    },

    refreshMasteryRisks: () => {
      const data = get().data;
      const updates = data.problems.map((p) => {
        if (p.status !== "mastered") return p;
        const risk = detectMasteryRisk(p, data.studyEvents);
        if (
          p.masteryRisk?.atRisk === risk.atRisk &&
          p.masteryRisk?.reasons.length === risk.reasons.length
        ) {
          return p;
        }
        return { ...p, masteryRisk: risk };
      });
      set((s) => ({ data: { ...s.data, problems: updates } }));
      schedulePersist();
    },

    // ====================================================================
    // Load level / reservations
    // ====================================================================

    setDefaultDailyLoadLevel: (level) => {
      set((s) => ({
        data: {
          ...s.data,
          settings: { ...s.data.settings, defaultDailyLoadLevel: level },
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "daily_load_set",
        timestamp: nowISO(),
        level,
      });
      schedulePersist();
    },

    setLoadLevelOverride: (date, level, reason) => {
      const data = get().data;
      const existing = data.settings.loadLevelOverrides[date];
      set((s) => ({
        data: {
          ...s.data,
          settings: {
            ...s.data.settings,
            loadLevelOverrides: {
              ...s.data.settings.loadLevelOverrides,
              [date]: level,
            },
          },
        },
      }));
      if (existing && existing !== level) {
        appendEvent({
          id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          type: "load_level_changed",
          timestamp: nowISO(),
          date,
          from: existing,
          to: level,
          reason,
        });
      }
      schedulePersist();
    },

    clearLoadLevelOverride: (date) => {
      set((s) => {
        const next = { ...s.data.settings.loadLevelOverrides };
        delete next[date];
        return {
          data: {
            ...s.data,
            settings: { ...s.data.settings, loadLevelOverrides: next },
          },
        };
      });
      schedulePersist();
    },

    createLoadLevelReservation: ({ id, ...rest }) => {
      const reservationId = id ?? `res-${Date.now()}`;
      const reservation: LoadLevelReservation = {
        id: reservationId,
        createdAt: nowISO(),
        ...rest,
      };
      set((s) => ({
        data: {
          ...s.data,
          settings: {
            ...s.data.settings,
            loadLevelReservations: [
              ...s.data.settings.loadLevelReservations,
              reservation,
            ],
          },
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "load_level_reservation_created",
        timestamp: nowISO(),
        reservationId,
        date: reservation.date,
        level: reservation.level,
        reason: reservation.reason,
      });
      schedulePersist();
      return reservationId;
    },

    acceptLoadLevelReservation: (reservationId) => {
      const now = nowISO();
      const target = get().data.settings.loadLevelReservations.find(
        (r) => r.id === reservationId,
      );
      if (!target || target.acceptedAt || target.dismissedAt) return;
      set((s) => ({
        data: {
          ...s.data,
          settings: {
            ...s.data.settings,
            loadLevelOverrides: {
              ...s.data.settings.loadLevelOverrides,
              [target.date]: target.level,
            },
            loadLevelReservations: s.data.settings.loadLevelReservations.map(
              (r) => (r.id === reservationId ? { ...r, acceptedAt: now } : r),
            ),
          },
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "load_level_reservation_accepted",
        timestamp: now,
        reservationId,
        date: target.date,
        level: target.level,
      });
      schedulePersist();
    },

    dismissLoadLevelReservation: (reservationId) => {
      const now = nowISO();
      set((s) => ({
        data: {
          ...s.data,
          settings: {
            ...s.data.settings,
            loadLevelReservations: s.data.settings.loadLevelReservations.map(
              (r) =>
                r.id === reservationId && !r.acceptedAt && !r.dismissedAt
                  ? { ...r, dismissedAt: now }
                  : r,
            ),
          },
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "load_level_reservation_dismissed",
        timestamp: now,
        reservationId,
      });
      schedulePersist();
    },

    // ====================================================================
    // Daily load history (commit / backfill / manual correction)
    // ====================================================================

    commitDailyLoadHistory: (date) => {
      const data = get().data;
      const recomputed = recomputeDailyLoadSnapshot(
        date,
        data.settings,
        data.studyEvents,
      );
      const existing = data.dailyLoadHistory.find((h) => h.date === date);
      const entry = buildDailyLoadHistoryEntry({
        date,
        existing,
        recomputed,
        now: nowISO(),
      });
      set((s) => ({
        data: {
          ...s.data,
          dailyLoadHistory: existing
            ? s.data.dailyLoadHistory.map((h) =>
                h.date === date ? entry : h,
              )
            : [...s.data.dailyLoadHistory, entry],
          settings: existing
            ? s.data.settings
            : (() => {
                const overrides = { ...s.data.settings.loadLevelOverrides };
                if (overrides[date]) delete overrides[date];
                return { ...s.data.settings, loadLevelOverrides: overrides };
              })(),
        },
      }));
      schedulePersist();
    },

    commitMissingDailyLoadHistories: () => {
      const data = get().data;
      const today = new Date().toISOString().slice(0, 10);
      const events = data.studyEvents;
      if (events.length === 0) return;

      const history = data.dailyLoadHistory;
      const earliestEventDate = events
        .map((e) => e.timestamp.slice(0, 10))
        .sort()[0];
      const lastCommittedDate =
        history.length === 0
          ? earliestEventDate
          : history.map((h) => h.date).sort().slice(-1)[0];

      if (!lastCommittedDate) return;

      // From day-after-last-committed to today-1
      const start = new Date(`${lastCommittedDate}T00:00:00.000Z`);
      const todayDate = new Date(`${today}T00:00:00.000Z`);
      const cur = new Date(start);

      if (history.length === 0) {
        // include the earliest event date too
      } else {
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      while (cur < todayDate) {
        const dateStr = cur.toISOString().slice(0, 10);
        get().commitDailyLoadHistory(dateStr);
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    },

    correctActualLevel: ({ date, newLevel, reason, note }) => {
      const data = get().data;
      const entry = data.dailyLoadHistory.find((h) => h.date === date);
      if (!entry) return;
      const fromLevel = entry.actualLevel;
      const corrected = applyManualCorrection({
        entry,
        newLevel,
        reason,
        note,
        now: nowISO(),
      });
      set((s) => ({
        data: {
          ...s.data,
          dailyLoadHistory: s.data.dailyLoadHistory.map((h) =>
            h.date === date ? corrected : h,
          ),
        },
      }));
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "actual_level_manually_corrected",
        timestamp: nowISO(),
        date,
        from: fromLevel,
        to: newLevel,
        reason,
        note,
      });
      schedulePersist();
    },

    // ====================================================================
    // Rest day / light review
    // ====================================================================

    recordRestDay: () => {
      const today = new Date().toISOString().slice(0, 10);
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "rest_day_taken",
        timestamp: nowISO(),
        date: today,
      });
      schedulePersist();
    },

    recordLightReviewQuick: () => {
      const today = new Date().toISOString().slice(0, 10);
      appendEvent({
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        type: "light_review_taken",
        timestamp: nowISO(),
        date: today,
        mode: "quick",
      });
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
