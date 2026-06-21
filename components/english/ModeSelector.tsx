"use client";

import { cn } from "@/lib/utils/cn";

export type PracticeMode = "1min" | "2min" | "free";

interface Props {
  value: PracticeMode;
  onChange: (m: PracticeMode) => void;
}

const OPTIONS: { value: PracticeMode; label: string; sub: string }[] = [
  { value: "1min", label: "1 分", sub: "elevator pitch" },
  { value: "2min", label: "2 分", sub: "full walkthrough" },
  { value: "free", label: "自由", sub: "stopwatch" },
];

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md border px-3 py-2 text-left transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary/60",
            )}
          >
            <div className="text-sm font-medium">{opt.label}</div>
            <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
