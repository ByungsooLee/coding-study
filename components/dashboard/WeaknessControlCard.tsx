"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { computeWeaknessControl } from "@/lib/domain/readiness";
import type { ConfidenceLevel } from "@/lib/domain/types";

const CONFIDENCE_TONE: Record<ConfidenceLevel, string> = {
  insufficient_data: "border-border text-muted-foreground",
  low: "border-warning/40 bg-warning/10 text-warning",
  medium: "border-primary/40 bg-primary/10 text-primary",
  high: "border-success/40 bg-success/10 text-success",
};

export function WeaknessControlCard() {
  const problems = useStore((s) => s.data.problems);
  const sqlProblems = useStore((s) => s.data.sqlProblems);

  const w = useMemo(
    () => computeWeaknessControl(problems, sqlProblems),
    [problems, sqlProblems],
  );

  if (w.confidence === "insufficient_data") {
    return (
      <Card className="opacity-80">
        <CardHeader className="pb-2">
          <CardDescription>苦手</CardDescription>
          <CardTitle className="text-base">Weakness Control</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<TrendingDown className="h-5 w-5" />}
            title="データ収集中"
            description={w.message}
          />
        </CardContent>
      </Card>
    );
  }

  const score = w.score ?? 0;

  // Special case: score=100 with low/medium confidence — do not celebrate
  const dataLight =
    w.unresolvedCount === 0 && w.confidence !== "high";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>苦手</CardDescription>
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            Weakness Control{" "}
            {!dataLight && <span className="text-muted-foreground">· {score}</span>}
          </span>
          <span
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${CONFIDENCE_TONE[w.confidence]}`}
          >
            {w.confidence}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {w.message && (
          <p className="text-xs text-muted-foreground">{w.message}</p>
        )}
        {dataLight ? (
          <p className="text-xs text-muted-foreground">
            判定保留 (確度が high になるまで待ちます)
          </p>
        ) : w.topCategories.length === 0 ? (
          <p className="text-xs text-muted-foreground">弱点なし</p>
        ) : (
          <ul className="space-y-1.5">
            {w.topCategories.slice(0, 5).map((c) => {
              const max = w.topCategories[0]?.count ?? 1;
              const pct = Math.round((c.count / max) * 100);
              return (
                <li key={c.label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{c.label}</span>
                    <span className="font-mono text-muted-foreground">
                      {c.count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-destructive/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground">
          attempted: {w.attemptedCount} / unresolved: {w.unresolvedCount}
        </p>
      </CardContent>
    </Card>
  );
}
