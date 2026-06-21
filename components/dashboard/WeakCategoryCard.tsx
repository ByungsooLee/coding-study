"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { computeWeakCategories } from "@/lib/domain/aggregate";

export function WeakCategoryCard() {
  const data = useStore((s) => s.data);
  const weak = computeWeakCategories(data.problems, data.sqlProblems);

  return (
    <Card>
      <CardHeader>
        <CardDescription>苦手</CardDescription>
        <CardTitle className="text-base">弱点カテゴリ</CardTitle>
      </CardHeader>
      <CardContent>
        {weak.length === 0 ? (
          <EmptyState
            icon={<TrendingDown className="h-5 w-5" />}
            title="まだデータなし"
            description="Failed / Need Review に登録した問題から自動集計します。"
          />
        ) : (
          <ul className="space-y-1.5">
            {weak.slice(0, 6).map((w) => {
              const max = weak[0]?.count ?? 1;
              const pct = Math.round((w.count / max) * 100);
              return (
                <li key={w.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{w.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{w.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-destructive/70" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
