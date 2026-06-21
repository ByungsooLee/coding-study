"use client";

import { useCallback } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/problem/Timer";
import { NoteField } from "@/components/problem/NoteField";
import { StatusSelector } from "@/components/problem/StatusSelector";
import { EnglishCoverageChecklist } from "@/components/problem/EnglishCoverageChecklist";
import { MasteryReadyBadge } from "@/components/problem/MasteryReadyBadge";
import { useStore } from "@/lib/store";
import type {
  EnglishCoverage,
  Problem,
  ProblemStatus,
} from "@/lib/domain/types";
import { getReviewGoal } from "@/lib/domain/mastery";
import { formatShort } from "@/lib/utils/date";

export default function ProblemWorkbenchPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const problem = useStore((s) => s.data.problems.find((p) => p.slug === slug));
  const update = useStore((s) => s.updateProblem);
  const setStatus = useStore((s) => s.setProblemStatus);
  const setCoverage = useStore((s) => s.setProblemEnglishCoverage);

  const patch = useCallback(
    (k: keyof Problem) => (v: string) =>
      slug && update(slug, { [k]: v } as Partial<Problem>),
    [slug, update],
  );

  const onCoverageChange = useCallback(
    (cov: EnglishCoverage) => slug && setCoverage(slug, cov),
    [slug, setCoverage],
  );

  if (!slug) return notFound();
  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">
          問題が見つかりません: {slug}
        </p>
        <Link
          href="/problems"
          className="mt-3 inline-block text-sm text-primary underline"
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  const reviewGoal = getReviewGoal(problem.status);

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/problems"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 一覧
        </Link>
        <span className="text-xs text-muted-foreground">
          Week {problem.weekNumber}
        </span>
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="text-xs text-muted-foreground">{problem.topic}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{problem.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              LeetCodeで開く
            </a>
            <Link
              href={`/mistakes/new?problemSlug=${problem.slug}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <ClipboardList className="h-3 w-3" />
              ミスを記録
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MasteryReadyBadge problem={problem} />
          <Timer />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 pt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>ステータス</span>
            {reviewGoal && (
              <span
                className="hidden text-right md:block"
                title={reviewGoal.detail}
              >
                🎯 {reviewGoal.headline}
              </span>
            )}
          </div>
          <StatusSelector
            value={problem.status}
            onChange={(s: ProblemStatus) => setStatus(problem.slug, s)}
          />
          {reviewGoal && (
            <p className="pt-1 text-xs text-muted-foreground md:hidden">
              🎯 {reviewGoal.headline}
            </p>
          )}
          {problem.reviewDates.length > 0 && (
            <div className="pt-1 text-xs text-muted-foreground">
              次回復習: {problem.reviewDates.map(formatShort).join(" → ")}
            </div>
          )}
          {problem.hints.length > 0 && (
            <div className="pt-2 text-xs">
              <span className="text-muted-foreground">Hints: </span>
              {problem.hints.join(" / ")}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Column 1: 方針・擬似コード */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">方針 / 擬似コード</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NoteField
              label="解法メモ (考え方・データ構造を選んだ理由)"
              value={problem.codeNote}
              onCommit={patch("codeNote")}
              rows={6}
              placeholder="key idea / why this data structure / trade-off"
            />
            <NoteField
              label="擬似コード"
              value={problem.pseudoCode}
              onCommit={patch("pseudoCode")}
              rows={6}
              mono
              placeholder={"1. ...\n2. ...\n3. ..."}
            />
            <NoteField
              label="計算量"
              value={problem.complexityNote}
              onCommit={patch("complexityNote")}
              rows={2}
              placeholder="Time O(n), Space O(n)"
            />
          </CardContent>
        </Card>

        {/* Column 2: Python コード */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Python コード</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteField
              label="Python"
              value={problem.pythonCode}
              onCommit={patch("pythonCode")}
              rows={20}
              mono
              placeholder={"def solution(...):\n    ..."}
            />
          </CardContent>
        </Card>

        {/* Column 3: edge cases / mistake / English */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">検証 / 英語 / レビュー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NoteField
              label="Edge cases"
              value={problem.edgeCases}
              onCommit={patch("edgeCases")}
              rows={3}
              placeholder="empty / single / duplicates / overflow"
            />
            <NoteField
              label="間違えた理由"
              value={problem.mistakeReason}
              onCommit={patch("mistakeReason")}
              rows={3}
              placeholder="思い違い / 実装ミス / DS選択ミス"
            />
            <NoteField
              label="英語説明メモ (100文字以上推奨)"
              value={problem.englishNote}
              onCommit={patch("englishNote")}
              rows={6}
              placeholder="First, I'd clarify ..."
            />
            <EnglishCoverageChecklist
              value={problem.englishCoverage}
              onChange={onCoverageChange}
            />
            <NoteField
              label="日本語メモ"
              value={problem.japaneseNote}
              onCommit={patch("japaneseNote")}
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
