"use client";

import { useMemo } from "react";
import { BookOpen, Brain, Database, ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewSectionRow } from "@/components/review/ReviewSectionRow";
import { RecentMistakes } from "@/components/review/RecentMistakes";
import { EnglishNudge } from "@/components/review/EnglishNudge";
import { MasteryAtRiskSection } from "@/components/review/MasteryAtRiskSection";
import { WeakCategoryCard } from "@/components/dashboard/WeakCategoryCard";
import { useStore } from "@/lib/store";
import { buildReviewQueue } from "@/lib/domain/review";
import type { ReviewItem } from "@/lib/domain/types";

export default function ReviewPage() {
  const data = useStore((s) => s.data);
  const problemsMap = useMemo(
    () => new Map(data.problems.map((p) => [p.slug, p])),
    [data.problems],
  );

  const setProblemStatus = useStore((s) => s.setProblemStatus);
  const setSqlStatus = useStore((s) => s.setSqlStatus);
  const setConceptOutcome = useStore((s) => s.setConceptReviewOutcome);

  const queue = useMemo(
    () =>
      buildReviewQueue({
        problems: data.problems,
        sqlProblems: data.sqlProblems,
        concepts: data.pythonConcepts,
      }),
    [data.problems, data.sqlProblems, data.pythonConcepts],
  );

  const due = queue.filter((q) => q.status === "Due");
  const upcoming = queue.filter((q) => q.status === "Upcoming");

  const dueByType = groupBy(due, (it) => it.targetType);
  const dueCount = {
    Problem: dueByType.Problem?.length ?? 0,
    SqlProblem: dueByType.SqlProblem?.length ?? 0,
    PythonConcept: dueByType.PythonConcept?.length ?? 0,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">今日の復習</h1>
        <p className="text-sm text-muted-foreground">
          Failed → 1d/3d/7d、Need Review → 3d/7d/14d、Solved → 14d/30d。完了時にアウトカムを選ぶと自動で再スケジュールします。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Total Due"
          value={due.length}
          accent
        />
        <SummaryCard
          icon={<ListChecks className="h-4 w-4" />}
          label="LeetCode"
          value={dueCount.Problem}
        />
        <SummaryCard
          icon={<Database className="h-4 w-4" />}
          label="SQL"
          value={dueCount.SqlProblem}
        />
        <SummaryCard
          icon={<Brain className="h-4 w-4" />}
          label="Python概念"
          value={dueCount.PythonConcept}
        />
      </div>

      <MasteryAtRiskSection />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DueSection
            title="LeetCode 問題"
            icon={<ListChecks className="h-4 w-4" />}
            items={dueByType.Problem ?? []}
            renderHref={(it) => `/problems/${it.targetSlug}`}
            renderExtraHref={(it) => problemsMap.get(it.targetSlug)?.url}
            onComplete={(slug, outcome) =>
              setProblemStatus(
                slug,
                outcome === "solved" ? "solved_independently" : outcome,
              )
            }
          />
          <DueSection
            title="SQL 問題"
            icon={<Database className="h-4 w-4" />}
            items={dueByType.SqlProblem ?? []}
            renderHref={(it) => `/sql/${it.targetSlug}`}
            onComplete={(slug, outcome) =>
              setSqlStatus(
                slug,
                outcome === "solved" ? "solved_independently" : outcome,
              )
            }
          />
          <DueSection
            title="Python 概念"
            icon={<Brain className="h-4 w-4" />}
            items={dueByType.PythonConcept ?? []}
            renderHref={(it) => `/python/${it.targetSlug}`}
            onComplete={(slug, outcome) => setConceptOutcome(slug, outcome)}
          />

          {upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardDescription>近日</CardDescription>
                <CardTitle className="text-base">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y text-sm">
                  {upcoming.slice(0, 12).map((it) => (
                    <li
                      key={`${it.targetType}-${it.targetId}`}
                      className="flex items-center justify-between px-2 py-2"
                    >
                      <span className="truncate">
                        <span className="mr-2 text-xs text-muted-foreground">
                          {it.targetType}
                        </span>
                        {it.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {it.dueAt.slice(0, 10)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <WeakCategoryCard />
          <RecentMistakes />
          <EnglishNudge />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${accent ? "text-primary" : ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

interface DueSectionProps {
  title: string;
  icon: React.ReactNode;
  items: ReviewItem[];
  renderHref: (item: ReviewItem) => string;
  renderExtraHref?: (item: ReviewItem) => string | undefined;
  onComplete: (slug: string, outcome: "failed" | "need_review" | "solved") => void;
}

function DueSection({
  title,
  icon,
  items,
  renderHref,
  renderExtraHref,
  onComplete,
}: DueSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {items.length === 0 ? (
          <EmptyState
            className="m-5"
            title="今日のDueなし"
            description="解いてステータスを設定すると、復習スケジュールが自動で組まれます。"
          />
        ) : (
          <ul className="divide-y">
            {items.map((it) => (
              <ReviewSectionRow
                key={`${it.targetType}-${it.targetId}`}
                item={it}
                href={renderHref(it)}
                extraHref={renderExtraHref?.(it)}
                onComplete={(o) => onComplete(it.targetSlug, o)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function groupBy<T, K extends string>(
  arr: T[],
  getKey: (item: T) => K,
): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const item of arr) {
    const k = getKey(item);
    (out[k] ??= []).push(item);
  }
  return out;
}
