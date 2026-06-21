import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type {
  Difficulty,
  ProblemStatus,
  ReviewStatus,
} from "@/lib/domain/types";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  outline: "border-border text-foreground",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map: Record<Difficulty, BadgeVariant> = {
    Easy: "success",
    Medium: "warning",
    Hard: "destructive",
  };
  return <Badge variant={map[difficulty]}>{difficulty}</Badge>;
}

export function StatusBadge({ status }: { status: ProblemStatus }) {
  const map: Record<ProblemStatus, { label: string; variant: BadgeVariant }> = {
    not_started: { label: "Not Started", variant: "outline" },
    reading: { label: "Reading", variant: "outline" },
    attempted: { label: "Attempted", variant: "secondary" },
    solved_with_help: { label: "Solved (help)", variant: "default" },
    solved_independently: { label: "Solved", variant: "success" },
    need_review: { label: "Need Review", variant: "warning" },
    failed: { label: "Failed", variant: "destructive" },
    mastered: { label: "Mastered", variant: "success" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; variant: BadgeVariant }> = {
    Due: { label: "Due", variant: "destructive" },
    Upcoming: { label: "Upcoming", variant: "warning" },
    Done: { label: "Done", variant: "outline" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
