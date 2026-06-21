"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { computeReadinessScore } from "@/lib/domain/readiness";
import { READINESS_WEIGHTS } from "@/lib/domain/types";
import { fromISO } from "@/lib/utils/date";

const LABELS: Record<keyof typeof READINESS_WEIGHTS, string> = {
  coding: "Coding",
  sql: "SQL",
  englishExplanation: "English",
  reviewConsistency: "Review",
  weaknessControl: "Weak ctrl",
};

export function ReadinessScoreCard() {
  const data = useStore((s) => s.data);

  const daysOfData = useMemo(() => {
    if (data.studyEvents.length === 0) return 0;
    const earliest = data.studyEvents
      .map((e) => e.timestamp)
      .sort()[0];
    if (!earliest) return 0;
    const diff = (Date.now() - fromISO(earliest).getTime()) / 86400000;
    return Math.max(1, Math.ceil(diff));
  }, [data.studyEvents]);

  const score = useMemo(
    () =>
      computeReadinessScore({
        problems: data.problems,
        sqlProblems: data.sqlProblems,
        events: data.studyEvents,
        aggregates: data.dailyAggregates,
        daysOfData,
      }),
    [data, daysOfData],
  );

  const insufficient = score.signals.insufficientData;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Readiness</CardDescription>
        <CardTitle className="text-base">
          総合 {score.overall}
          {insufficient && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (データ {daysOfData} 日)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(READINESS_WEIGHTS) as (keyof typeof READINESS_WEIGHTS)[]).map(
          (k) => {
            const v = score.dimensions[k];
            return (
              <div key={k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{LABELS[k]}</span>
                  <span className="font-mono text-muted-foreground">
                    {v} · w{READINESS_WEIGHTS[k]}
                  </span>
                </div>
                <Progress value={v} label={LABELS[k]} />
              </div>
            );
          },
        )}
        <p className="text-[10px] text-muted-foreground">
          重み: coding 30 / sql 20 / english 20 / review 15 / weakness ctrl 15
          (Data Engineer / AI Platform 志向)
        </p>
      </CardContent>
    </Card>
  );
}
