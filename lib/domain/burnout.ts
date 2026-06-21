import { subDays } from "date-fns";
import type {
  BurnoutAlert,
  BurnoutReason,
  BurnoutRecommendation,
  BurnoutLevel,
  DailyLoadHistoryEntry,
} from "./types";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function detectBurnout(
  history: DailyLoadHistoryEntry[],
  now: Date = new Date(),
): BurnoutAlert {
  const last7Dates: string[] = Array.from({ length: 7 }, (_, i) =>
    formatDate(subDays(now, i)),
  );

  const map = new Map(history.map((h) => [h.date, h]));

  const isIntensive = (date: string): boolean => {
    const entry = map.get(date);
    if (!entry) return false;
    return entry.actualLevel === "intensive" || entry.totalStudyMinutes >= 150;
  };

  // Consecutive starting from yesterday (today might still be in progress)
  let consecutive = 0;
  for (let i = 1; i < last7Dates.length; i++) {
    const date = last7Dates[i];
    if (date && isIntensive(date)) consecutive++;
    else break;
  }

  const intensiveInLast7 = last7Dates.filter(isIntensive).length;

  const reasons: BurnoutReason[] = [];
  let level: BurnoutLevel = "ok";

  if (consecutive >= 5) {
    level = "high";
    reasons.push("consecutive_intensive_5");
  } else if (consecutive >= 3) {
    level = "watch";
    reasons.push("consecutive_intensive_3");
  }

  if (intensiveInLast7 >= 5) {
    level = "high";
    if (!reasons.includes("intensive_5_in_7_days"))
      reasons.push("intensive_5_in_7_days");
  }

  const recommendation: BurnoutRecommendation | undefined =
    level === "high" ? "minimum_tomorrow" : undefined;

  const message =
    level === "high"
      ? "バーンアウトリスクが高めです。明日は minimum mode または review-only day を強く推奨します。"
      : level === "watch"
      ? "intensive 連続中です。1 日 minimum を挟むことを検討してください。"
      : undefined;

  return {
    level,
    reasons,
    detail: {
      consecutiveIntensive: consecutive,
      intensiveInLast7Days: intensiveInLast7,
    },
    recommendation,
    message,
  };
}
