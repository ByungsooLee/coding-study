"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

interface Stat {
  label: string;
  done: number;
  total: number;
}

function pct({ done, total }: Stat): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function ProgressCards() {
  const problems = useStore((s) => s.data.problems);
  const sql = useStore((s) => s.data.sqlProblems);
  const concepts = useStore((s) => s.data.pythonConcepts);
  const mistakes = useStore((s) => s.data.mistakes);

  const lcStat: Stat = {
    label: "LeetCode Blind 75",
    done: problems.filter(
      (p) =>
        p.status === "solved_independently" || p.status === "mastered",
    ).length,
    total: problems.length,
  };
  const sqlStat: Stat = {
    label: "SQL 50",
    done: sql.filter(
      (p) =>
        p.status === "solved_independently" || p.status === "mastered",
    ).length,
    total: sql.length,
  };
  const conceptStat: Stat = {
    label: "Python概念",
    done: concepts.filter((c) => c.status !== "NotReviewed").length,
    total: concepts.length,
  };

  const allDone = lcStat.done + sqlStat.done + conceptStat.done;
  const allTotal = lcStat.total + sqlStat.total + conceptStat.total;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard stat={{ label: "全体", done: allDone, total: allTotal }} accent />
      <StatCard stat={lcStat} />
      <StatCard stat={sqlStat} />
      <StatCard stat={conceptStat} />
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            ミスログ数 (蓄積)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{mistakes.length}</div>
          <div className="text-xs text-muted-foreground">
            復習対象 × 失敗パターン
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ stat, accent }: { stat: Stat; accent?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-semibold ${accent ? "text-primary" : ""}`}>
            {stat.done}
          </span>
          <span className="text-sm text-muted-foreground">/ {stat.total}</span>
        </div>
        <Progress value={pct(stat)} label={stat.label} />
      </CardContent>
    </Card>
  );
}
