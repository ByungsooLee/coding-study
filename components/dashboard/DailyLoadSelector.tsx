"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import type { DailyLoadLevel } from "@/lib/domain/types";
import { LOAD_PRESETS } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const LEVELS: { value: DailyLoadLevel; label: string }[] = [
  { value: "minimum", label: "minimum" },
  { value: "standard", label: "standard" },
  { value: "intensive", label: "intensive" },
  { value: "review_only", label: "review only" },
];

export function DailyLoadSelector() {
  const settings = useStore((s) => s.data.settings);
  const setOverride = useStore((s) => s.setLoadLevelOverride);
  const clearOverride = useStore((s) => s.clearLoadLevelOverride);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const override = settings.loadLevelOverrides[today];
  const effective: DailyLoadLevel = override ?? settings.defaultDailyLoadLevel;
  const preset = LOAD_PRESETS[effective];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>今日の Load level {override ? "(本日のみ上書き)" : ""}</span>
        {override && (
          <button
            type="button"
            onClick={() => clearOverride(today)}
            className="text-primary hover:underline"
          >
            既定に戻す
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LEVELS.map((lvl) => {
          const active = effective === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => setOverride(today, lvl.value, "user_manual")}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary/60",
              )}
            >
              {lvl.label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        目標 {preset.targetMinutes} min / 新規 LC {preset.maxNewProblems} /
        新規 SQL {preset.maxSqlProblems} / 復習 {preset.maxReviews} /
        英語 {preset.requiresEnglishPractice ? "必須" : "任意"}
      </p>
    </div>
  );
}
