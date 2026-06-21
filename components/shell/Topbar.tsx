"use client";

import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "@/lib/store";
import { computeDayOfWeek, computeWeekNumber } from "@/lib/utils/date";

export function Topbar() {
  const startDate = useStore((s) => s.data.settings.startDate);
  const week = computeWeekNumber(startDate);
  const day = computeDayOfWeek(startDate);

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="text-sm font-semibold">LeetCode Prep</div>
      </div>
      <div className="hidden text-xs text-muted-foreground lg:block">
        {week === 0
          ? "学習開始前"
          : week > 12
          ? "計画期間終了"
          : `Week ${week} / Day ${day} of 12 weeks`}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:block lg:hidden">
          {week === 0 ? "Pre" : `W${week}·D${day}`}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
