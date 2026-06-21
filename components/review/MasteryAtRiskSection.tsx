"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { detectMasteryRisk } from "@/lib/domain/mastery";
import type { MasteryRiskReason } from "@/lib/domain/types";

const REASON_LABELS: Record<MasteryRiskReason, string> = {
  post_mastery_failure: "Mastered 後に failed が記録",
  time_threshold_exceeded: "時間しきい値を超過",
  english_coverage_lost: "English coverage が落ちた",
  stale_review: "45 日以上 review なし",
};

export function MasteryAtRiskSection() {
  const problems = useStore((s) => s.data.problems);
  const events = useStore((s) => s.data.studyEvents);
  const demote = useStore((s) => s.demoteMastery);

  const atRiskProblems = useMemo(() => {
    return problems
      .filter((p) => p.status === "mastered")
      .map((p) => ({ problem: p, risk: detectMasteryRisk(p, events) }))
      .filter((x) => x.risk.atRisk);
  }, [problems, events]);

  if (atRiskProblems.length === 0) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          降格推奨
        </CardDescription>
        <CardTitle className="text-base">
          Mastery at risk — {atRiskProblems.length} 件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRiskProblems.map(({ problem, risk }) => (
          <div key={problem.slug} className="space-y-1.5 border-l-2 border-warning/40 pl-3">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/problems/${problem.slug}`}
                className="text-sm font-medium hover:text-primary"
              >
                {problem.title}
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (
                    confirm(
                      `${problem.title} を need_review に降格しますか?`,
                    )
                  ) {
                    demote(problem.slug, risk.reasons);
                  }
                }}
              >
                Confirm Demotion
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {risk.reasons.map((r) => (
                <Badge key={r} variant="warning" className="text-[10px]">
                  {REASON_LABELS[r]}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
