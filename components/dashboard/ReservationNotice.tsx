"use client";

import { useMemo, useState } from "react";
import { Info, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { DailyLoadLevel } from "@/lib/domain/types";

export function ReservationNotice() {
  const settings = useStore((s) => s.data.settings);
  const setOverride = useStore((s) => s.setLoadLevelOverride);
  const [dismissed, setDismissed] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const acceptedReservation = settings.loadLevelReservations.find(
    (r) =>
      r.date === today &&
      r.reason === "burnout_recommendation" &&
      r.acceptedAt &&
      !r.dismissedAt,
  );
  const override = settings.loadLevelOverrides[today];

  if (dismissed || !acceptedReservation || !override) return null;

  const handleChange = (newLevel: DailyLoadLevel) => {
    setOverride(today, newLevel, "user_overrode_burnout_recommendation");
  };

  return (
    <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <span>
          今日は <strong>{override}</strong> mode (Burnout 予約) — 必要なら
        </span>{" "}
        <button
          type="button"
          onClick={() => handleChange("standard")}
          className="text-primary underline hover:opacity-80"
        >
          standard に戻す
        </button>{" "}
        ·{" "}
        <button
          type="button"
          onClick={() => handleChange("review_only")}
          className="text-primary underline hover:opacity-80"
        >
          review only にする
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="閉じる"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
