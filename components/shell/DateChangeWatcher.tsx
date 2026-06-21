"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * App-wide lightweight date-change watcher.
 *
 * On mount: backfills any missing DailyLoadHistory entries.
 * On 5min / visibility / focus: cheap string comparison; commits yesterday
 * only when the calendar day actually rolls over.
 */
export function DateChangeWatcher() {
  const commitMissing = useStore((s) => s.commitMissingDailyLoadHistories);
  const commitDate = useStore((s) => s.commitDailyLoadHistory);
  const refreshRisks = useStore((s) => s.refreshMasteryRisks);
  const lastDateRef = useRef<string>(formatDate(new Date()));

  useEffect(() => {
    // Initial backfill
    commitMissing();
    refreshRisks();

    const check = () => {
      const now = formatDate(new Date());
      if (now === lastDateRef.current) return;
      const yesterday = lastDateRef.current;
      lastDateRef.current = now;
      commitDate(yesterday);
      refreshRisks();
    };

    const interval = setInterval(check, 5 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", check);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", check);
    };
  }, [commitMissing, commitDate, refreshRisks]);

  return null;
}
