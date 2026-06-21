"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { evaluateMasteryReadiness } from "@/lib/domain/mastery";
import { useStore } from "@/lib/store";
import type {
  EnglishCoverageKey,
  MasteryCriterion,
  Problem,
} from "@/lib/domain/types";
import { ENGLISH_COVERAGE_LABELS } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const CRITERION_LABELS: Record<MasteryCriterion, string> = {
  independent_review_count: "自力review成功 3回以上",
  latest_review_solved: "最後のreviewが自力成功",
  within_time_threshold: "時間しきい値内 (Easy 15m / Med 35m / Hard 60m)",
  english_explanation_done: "English 100文字+ 6 coverage",
  complexity_documented: "計算量 documented",
  edge_cases_documented: "Edge case documented",
};

const ENG_KEY_LABELS = ENGLISH_COVERAGE_LABELS;

interface Props {
  problem: Problem;
}

export function MasteryReadyBadge({ problem }: Props) {
  const events = useStore((s) => s.data.studyEvents);
  const confirmMastery = useStore((s) => s.confirmMastery);
  const [open, setOpen] = useState(false);

  const evaluation = useMemo(
    () => evaluateMasteryReadiness(problem, events),
    [problem, events],
  );

  if (problem.status === "mastered") {
    return (
      <Badge variant="success" className="gap-1">
        <Sparkles className="h-3 w-3" /> Mastered
      </Badge>
    );
  }

  const score = `${evaluation.satisfied.length}/6`;
  const ready = evaluation.ready;

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          ready
            ? "border-success/40 bg-success/10 text-success"
            : "border-border text-muted-foreground hover:bg-secondary/60",
        )}
      >
        {ready ? "Mastery ready" : "Mastery 条件"} {score}
        {open ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {open && (
        <div className="space-y-2 rounded-md border bg-card p-3 text-xs">
          <ul className="space-y-1">
            {(
              [
                "independent_review_count",
                "latest_review_solved",
                "within_time_threshold",
                "english_explanation_done",
                "complexity_documented",
                "edge_cases_documented",
              ] as MasteryCriterion[]
            ).map((c) => {
              const ok = evaluation.satisfied.includes(c);
              return (
                <li key={c} className="flex items-start gap-2">
                  <span
                    className={ok ? "text-success" : "text-muted-foreground"}
                  >
                    {ok ? "✓" : "✗"}
                  </span>
                  <span>{CRITERION_LABELS[c]}</span>
                </li>
              );
            })}
          </ul>

          {evaluation.englishCoverageMissing.length > 0 && (
            <div className="border-t pt-2">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                English coverage 不足
              </div>
              <ul className="space-y-0.5">
                {evaluation.englishCoverageMissing.map((k) => (
                  <li key={k} className="text-muted-foreground">
                    · {ENG_KEY_LABELS[k as EnglishCoverageKey].en}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ready && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm("この問題を mastered として確定しますか?")) {
                  confirmMastery(problem.slug);
                  setOpen(false);
                }
              }}
            >
              <Check className="h-3.5 w-3.5" /> Confirm Mastery
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
