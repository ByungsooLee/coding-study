"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ReviewStatusBadge } from "@/components/ui/badge";
import { formatShort } from "@/lib/utils/date";
import { ReviewOutcomeButtons, type ReviewOutcome } from "./ReviewOutcomeButtons";
import type { ReviewItem } from "@/lib/domain/types";

interface Props {
  item: ReviewItem;
  href: string;
  onComplete: (o: ReviewOutcome) => void;
  extraHref?: string;
}

export function ReviewSectionRow({ item, href, onComplete, extraHref }: Props) {
  return (
    <li className="flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <Link href={href} className="block">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{item.title}</span>
            {extraHref && (
              <a
                href={extraHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary"
                aria-label="LeetCodeで開く"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <ReviewStatusBadge status={item.status} />
            <span>· 期日 {formatShort(item.dueAt)}</span>
            {item.createdFromStatus && (
              <span>· 前回 {item.createdFromStatus}</span>
            )}
          </div>
        </Link>
      </div>
      <ReviewOutcomeButtons onPick={onComplete} />
    </li>
  );
}
