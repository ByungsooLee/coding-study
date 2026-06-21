"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEED_WEEKS } from "@/lib/seed/weeks";
import { useStore } from "@/lib/store";
import { computeDayOfWeek, computeWeekNumber } from "@/lib/utils/date";

export function TodayCard() {
  const startDate = useStore((s) => s.data.settings.startDate);
  const targetMin = useStore((s) => s.data.settings.dailyTargetMinutes);
  const week = computeWeekNumber(startDate);
  const day = computeDayOfWeek(startDate);
  const current = SEED_WEEKS.find((w) => w.weekNumber === Math.max(1, Math.min(12, week))) ?? SEED_WEEKS[0];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              {week === 0 ? "学習開始前" : week > 12 ? "計画期間終了" : `Week ${week} · Day ${day}`}
            </CardDescription>
            <CardTitle className="mt-1 text-lg">{current?.theme ?? "—"}</CardTitle>
          </div>
          <Badge variant="default">target {targetMin}m</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Python</div>
            <div className="font-medium">{current?.pythonTopics.join(", ") || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">LeetCode</div>
            <div className="font-medium">{current?.leetcodeTopics.join(", ") || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SQL</div>
            <div className="font-medium">{current?.sqlTopics.join(", ") || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">English</div>
            <div className="font-medium">{current?.englishFocus}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            問題演習 <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/python"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Python概念 <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/review"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            今日の復習 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
