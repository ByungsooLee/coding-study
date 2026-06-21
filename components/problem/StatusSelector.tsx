"use client";

import { cn } from "@/lib/utils/cn";
import type { ProblemStatus } from "@/lib/domain/types";

const OPTIONS: { value: ProblemStatus; label: string; tone: string }[] = [
  { value: "NotStarted", label: "Not Started", tone: "border-border text-muted-foreground" },
  { value: "InProgress", label: "In Progress", tone: "border-secondary bg-secondary text-secondary-foreground" },
  { value: "Solved", label: "Solved", tone: "border-success/40 bg-success/10 text-success" },
  { value: "NeedReview", label: "Need Review", tone: "border-warning/40 bg-warning/10 text-warning" },
  { value: "Failed", label: "Failed", tone: "border-destructive/40 bg-destructive/10 text-destructive" },
];

interface Props {
  value: ProblemStatus;
  onChange: (next: ProblemStatus) => void;
}

export function StatusSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              active ? opt.tone : "border-border text-muted-foreground hover:bg-secondary/60",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
