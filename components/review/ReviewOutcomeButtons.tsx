"use client";

import { cn } from "@/lib/utils/cn";

type Outcome = "Failed" | "NeedReview" | "Solved";

interface Props {
  onPick: (o: Outcome) => void;
  size?: "sm" | "default";
  className?: string;
}

const OPTIONS: { value: Outcome; label: string; tone: string }[] = [
  {
    value: "Failed",
    label: "難しかった",
    tone: "border-destructive/40 text-destructive hover:bg-destructive/10",
  },
  {
    value: "NeedReview",
    label: "もう少し",
    tone: "border-warning/40 text-warning hover:bg-warning/10",
  },
  {
    value: "Solved",
    label: "覚えた",
    tone: "border-success/40 text-success hover:bg-success/10",
  },
];

export function ReviewOutcomeButtons({ onPick, size = "sm", className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPick(opt.value);
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-md border bg-background font-medium transition-colors",
            opt.tone,
            size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-sm",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export type { Outcome as ReviewOutcome };
