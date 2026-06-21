"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { buildReviewQueue } from "@/lib/domain/review";
import { formatShort } from "@/lib/utils/date";

const TARGET_HREF: Record<string, (slug: string) => string> = {
  Problem: (slug) => `/problems/${slug}`,
  SqlProblem: (slug) => `/sql/${slug}`,
  PythonConcept: (slug) => `/python/${slug}`,
  English: () => "/english",
};

export function ReviewQueueCard() {
  const data = useStore((s) => s.data);
  const queue = buildReviewQueue({
    problems: data.problems,
    sqlProblems: data.sqlProblems,
    concepts: data.pythonConcepts,
  }).filter((i) => i.status !== "Done");

  const due = queue.filter((i) => i.status === "Due");
  const upcoming = queue.filter((i) => i.status === "Upcoming").slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>復習</CardDescription>
            <CardTitle className="mt-1 text-base">今日 / 直近の復習対象</CardTitle>
          </div>
          <Link
            href="/review"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            すべて <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="復習対象なし"
            description="問題を解いてステータスを設定すると、復習スケジュールが自動で組まれます。"
          />
        ) : (
          <div className="space-y-3">
            {due.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-destructive">Due ({due.length})</div>
                <ul className="space-y-1">
                  {due.slice(0, 6).map((it) => (
                    <li key={`${it.targetType}-${it.targetId}`} className="text-sm">
                      <Link
                        href={TARGET_HREF[it.targetType]?.(it.targetSlug) ?? "/"}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-secondary"
                      >
                        <span className="truncate">
                          <span className="mr-2 text-xs text-muted-foreground">
                            {it.targetType}
                          </span>
                          {it.title}
                        </span>
                        <ReviewStatusBadge status={it.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-warning">Upcoming</div>
                <ul className="space-y-1">
                  {upcoming.map((it) => (
                    <li
                      key={`${it.targetType}-${it.targetId}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={TARGET_HREF[it.targetType]?.(it.targetSlug) ?? "/"}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-secondary"
                      >
                        <span className="truncate">{it.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatShort(it.dueAt)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
