"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getEffectiveLoadLevel } from "@/lib/domain/load";
import { LOAD_PRESETS } from "@/lib/domain/types";
import { DailyLoadSelector } from "./DailyLoadSelector";
import { buildReviewQueue } from "@/lib/domain/review";

export function TodayMenuCard() {
  const data = useStore((s) => s.data);
  const recordLightReview = useStore((s) => s.recordLightReviewQuick);
  const recordRest = useStore((s) => s.recordRestDay);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const level = getEffectiveLoadLevel(data.settings, today);
  const preset = LOAD_PRESETS[level];

  const queue = useMemo(
    () =>
      buildReviewQueue({
        problems: data.problems,
        sqlProblems: data.sqlProblems,
        concepts: data.pythonConcepts,
      }),
    [data.problems, data.sqlProblems, data.pythonConcepts],
  );

  const dueCount = queue.filter((q) => q.status === "Due").length;

  // Today's progress (very lightweight, based on events)
  const todayEvents = data.studyEvents.filter((e) =>
    e.timestamp.startsWith(today),
  );
  const reviewsToday = todayEvents.filter(
    (e) => e.type === "review_completed",
  ).length;
  const newProblemsToday = new Set(
    todayEvents.flatMap((e) =>
      e.type === "problem_status_changed" &&
      (e.to === "attempted" || e.to === "solved_with_help" || e.to === "solved_independently")
        ? [e.problemSlug]
        : [],
    ),
  ).size;
  const englishToday = todayEvents.filter(
    (e) => e.type === "english_practice",
  ).length;

  if (level === "review_only" && dueCount === 0) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardDescription>Today: review only</CardDescription>
          <CardTitle className="text-base">💤 完全休養しても OK です</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DailyLoadSelector />
          <p className="text-muted-foreground">
            今日の Due 復習はありません。続けることが最優先なので、
            体調が許せば軽く触れる程度でも OK、思い切って休むのも正しい選択です。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                recordRest();
              }}
            >
              💤 Take full rest
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => recordLightReview()}
            >
              📚 Light review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardDescription>Today: {level}</CardDescription>
        <CardTitle className="text-base">今日のメニュー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DailyLoadSelector />
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <MenuRow
            label="新規 LC"
            done={newProblemsToday}
            cap={preset.maxNewProblems}
          />
          <MenuRow
            label="復習 Due"
            done={Math.min(reviewsToday, dueCount)}
            cap={Math.min(preset.maxReviews, dueCount || preset.maxReviews)}
          />
          <MenuRow
            label="英語"
            done={englishToday}
            cap={preset.requiresEnglishPractice ? 1 : 0}
            required={preset.requiresEnglishPractice}
          />
          <MenuRow label="目標時間" done={null} cap={preset.targetMinutes} unit="min" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            問題演習 <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/review"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            今日の復習 ({dueCount}) <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/english"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <MessagesSquare className="h-3 w-3" /> 英語
          </Link>
          <button
            type="button"
            onClick={() => recordLightReview()}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            📚 Light review
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function MenuRow({
  label,
  done,
  cap,
  required,
  unit,
}: {
  label: string;
  done: number | null;
  cap: number;
  required?: boolean;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">
        {done !== null ? `${done}/${cap}` : cap}
        {unit && ` ${unit}`}
        {required && done === 0 && (
          <span className="ml-1 text-destructive">!</span>
        )}
      </span>
    </div>
  );
}
