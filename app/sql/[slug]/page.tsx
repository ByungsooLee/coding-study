"use client";

import { useCallback } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/badge";
import { Timer } from "@/components/problem/Timer";
import { NoteField } from "@/components/problem/NoteField";
import { StatusSelector } from "@/components/problem/StatusSelector";
import { useStore } from "@/lib/store";
import type { ProblemStatus, SqlProblem } from "@/lib/domain/types";
import { formatShort } from "@/lib/utils/date";

const SQL_PLACEHOLDER = `-- write your query here
SELECT ...
FROM ...
WHERE ...;`;

export default function SqlWorkbenchPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const problem = useStore((s) =>
    s.data.sqlProblems.find((p) => p.slug === slug),
  );
  const update = useStore((s) => s.updateSqlProblem);
  const setStatus = useStore((s) => s.setSqlStatus);

  const patch = useCallback(
    (k: keyof SqlProblem) => (v: string) =>
      slug && update(slug, { [k]: v } as Partial<SqlProblem>),
    [slug, update],
  );

  if (!slug) return notFound();
  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">問題が見つかりません: {slug}</p>
        <Link href="/sql" className="mt-3 inline-block text-sm text-primary underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/sql"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 一覧
        </Link>
        <span className="text-xs text-muted-foreground">Week {problem.weekNumber}</span>
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="text-xs text-muted-foreground">{problem.topic}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{problem.title}</h1>
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            LeetCodeで開く
          </a>
        </div>
        <Timer />
      </div>

      <Card>
        <CardContent className="space-y-2 pt-5">
          <div className="text-xs text-muted-foreground">ステータス</div>
          <StatusSelector
            value={problem.status}
            onChange={(s: ProblemStatus) => setStatus(problem.slug, s)}
          />
          {problem.reviewDates.length > 0 && (
            <div className="pt-1 text-xs text-muted-foreground">
              次回復習: {problem.reviewDates.map(formatShort).join(" → ")}
            </div>
          )}
          {problem.attemptCount > 0 && (
            <div className="text-xs text-muted-foreground">
              試行回数: {problem.attemptCount}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* SQL code: takes 7/12 on xl */}
        <Card className="xl:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">SQL クエリ</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteField
              label="SQL"
              description="LeetCodeで実行 → 通ったらここに保存"
              value={problem.sqlCode}
              onCommit={patch("sqlCode")}
              rows={22}
              mono
              placeholder={SQL_PLACEHOLDER}
            />
          </CardContent>
        </Card>

        {/* Notes: 5/12 */}
        <div className="space-y-4 xl:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">解法メモ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteField
                label="アプローチ (使ったJOIN種別 / GROUP BY / window関数 / なぜそれを選んだか)"
                value={problem.note}
                onCommit={patch("note")}
                rows={6}
                placeholder="key idea / which JOIN / why GROUP BY / window vs subquery trade-off"
              />
              <NoteField
                label="間違えた理由"
                value={problem.mistakeReason}
                onCommit={patch("mistakeReason")}
                rows={4}
                placeholder="NULL handling / GROUP BY 抜け / DISTINCT 漏れ / 副問合せの相関ミス"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">英語説明</CardTitle>
            </CardHeader>
            <CardContent>
              <NoteField
                label="このクエリの説明 (英語)"
                value={problem.englishNote}
                onCommit={patch("englishNote")}
                rows={6}
                placeholder="I joined A and B on user_id, then grouped by date and used a CASE WHEN to ..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
