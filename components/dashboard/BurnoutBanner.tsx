"use client";

import { useMemo } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { detectBurnout } from "@/lib/domain/burnout";

export function BurnoutBanner() {
  const history = useStore((s) => s.data.dailyLoadHistory);
  const createReservation = useStore((s) => s.createLoadLevelReservation);
  const acceptReservation = useStore((s) => s.acceptLoadLevelReservation);

  const alert = useMemo(() => detectBurnout(history), [history]);

  if (alert.level === "ok") return null;

  const accent =
    alert.level === "high"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-warning/40 bg-warning/10 text-warning";

  const handleAcceptMinimum = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const id = createReservation({
      date: tomorrowStr,
      level: "minimum",
      reason: "burnout_recommendation",
      reasonDetail: alert.reasons.join(", "),
    });
    acceptReservation(id);
  };

  const handleAcceptReviewOnly = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const id = createReservation({
      date: tomorrowStr,
      level: "review_only",
      reason: "burnout_recommendation",
      reasonDetail: alert.reasons.join(", "),
    });
    acceptReservation(id);
  };

  return (
    <div className={`rounded-md border p-3 ${accent}`}>
      <div className="flex items-start gap-2">
        {alert.level === "high" ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="text-sm font-medium">
            {alert.level === "high" ? "Burnout risk: HIGH" : "Burnout watch"}
          </div>
          {alert.message && <p className="text-xs">{alert.message}</p>}
          <p className="text-[10px] text-muted-foreground">
            連続 intensive {alert.detail.consecutiveIntensive} 日 /
            直近 7 日で intensive {alert.detail.intensiveInLast7Days} 回
          </p>
          {alert.level === "high" && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptMinimum}
              >
                明日 minimum を予約
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptReviewOnly}
              >
                明日 review only を予約
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
