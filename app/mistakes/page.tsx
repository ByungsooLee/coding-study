"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { formatShort } from "@/lib/utils/date";

export default function MistakesPage() {
  const mistakes = useStore((s) => s.data.mistakes);
  const removeMistake = useStore((s) => s.removeMistake);

  const sorted = [...mistakes].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">ミスログ</h1>
          <p className="text-sm text-muted-foreground">
            失敗タイプ × 具体ミス × 次回対策。3 ヶ月後の自己レビューに必須。
          </p>
        </div>
        <Link href="/mistakes/new">
          <Button>
            <Plus className="h-4 w-4" /> 新規記録
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="まだミスログがありません"
          description="解いた問題で間違えた点や引っかかった点を、忘れる前にすぐ記録しましょう。"
          action={
            <Link href="/mistakes/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" /> 最初の記録
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm leading-tight">
                      {m.description}
                    </CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {m.failureType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {m.category}
                      </Badge>
                      {m.problemSlug && (
                        <Link
                          href={`/problems/${m.problemSlug}`}
                          className="text-primary hover:underline"
                        >
                          {m.problemSlug}
                        </Link>
                      )}
                      {m.sqlProblemSlug && (
                        <Link
                          href={`/sql/${m.sqlProblemSlug}`}
                          className="text-primary hover:underline"
                        >
                          {m.sqlProblemSlug}
                        </Link>
                      )}
                      <span>{formatShort(m.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/mistakes/${m.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="編集">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="削除"
                      onClick={() => {
                        if (confirm("このミスログを削除しますか?")) {
                          removeMistake(m.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {m.correctIdea && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      正しい考え方:{" "}
                    </span>
                    {m.correctIdea}
                  </div>
                )}
                {m.prevention && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      次回の対策:{" "}
                    </span>
                    {m.prevention}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
