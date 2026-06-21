"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { classifyDay, DAY_CLASSIFICATION_LABELS } from "@/lib/domain/load";
import type {
  DailyLoadCorrectionReason,
  DailyLoadHistoryEntry,
  DailyLoadLevel,
} from "@/lib/domain/types";
import {
  DAILY_LOAD_CORRECTION_REASONS,
  DAILY_LOAD_CORRECTION_REASON_LABELS,
} from "@/lib/domain/types";

const LEVELS: DailyLoadLevel[] = [
  "minimum",
  "standard",
  "intensive",
  "review_only",
];

function diffDays(date: string, now: Date): number {
  const d = new Date(`${date}T00:00:00.000Z`);
  return Math.round(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
      d.getTime()) /
      86400000,
  );
}

function relativeLabel(diff: number): string {
  if (diff === 1) return "昨日";
  if (diff === 2) return "2 日前";
  if (diff === 3) return "3 日前";
  return `${diff} 日前`;
}

export function RecentActivityCard() {
  const history = useStore((s) => s.data.dailyLoadHistory);
  const events = useStore((s) => s.data.studyEvents);
  const correct = useStore((s) => s.correctActualLevel);

  const [editing, setEditing] = useState<string | null>(null);

  const recent = useMemo(() => {
    const now = new Date();
    const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted
      .map((h) => ({
        entry: h,
        diff: diffDays(h.date, now),
      }))
      .filter((x) => x.diff >= 1 && x.diff <= 3)
      .slice(0, 3);
  }, [history]);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>履歴</CardDescription>
          <CardTitle className="text-base">最近の実績</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            実績データはまだありません。学習を進めると、ここに直近 3 日が表示されます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>履歴</CardDescription>
        <CardTitle className="text-base">最近の実績 (3 日)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map(({ entry, diff }) => (
          <RecentRow
            key={entry.date}
            entry={entry}
            diff={diff}
            events={events}
            isEditing={editing === entry.date}
            onToggleEdit={() =>
              setEditing(editing === entry.date ? null : entry.date)
            }
            onSave={(newLevel, reason, note) => {
              correct({ date: entry.date, newLevel, reason, note });
              setEditing(null);
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface RecentRowProps {
  entry: DailyLoadHistoryEntry;
  diff: number;
  events: ReturnType<typeof useStore.getState>["data"]["studyEvents"];
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (
    newLevel: DailyLoadLevel,
    reason?: DailyLoadCorrectionReason,
    note?: string,
  ) => void;
}

function RecentRow({
  entry,
  diff,
  events,
  isEditing,
  onToggleEdit,
  onSave,
}: RecentRowProps) {
  const cls = classifyDay(entry, events);
  const clsLabel = DAY_CLASSIFICATION_LABELS[cls];

  const [level, setLevel] = useState<DailyLoadLevel>(entry.actualLevel);
  const [reason, setReason] = useState<DailyLoadCorrectionReason | "">("");
  const [note, setNote] = useState("");

  const latest =
    entry.correctionHistory[entry.correctionHistory.length - 1];

  return (
    <div className="space-y-2 border-l-2 border-border pl-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">
            {relativeLabel(diff)} ({entry.date})
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>
              {clsLabel.icon} {clsLabel.ja}
            </span>
            <span>· Planned: {entry.plannedLevel}</span>
            <span>· Actual: {entry.actualLevel}</span>
            {entry.manuallyCorrected && (
              <Badge variant="outline" className="text-[10px]">
                ✏️ 修正済 ({entry.correctionHistory.length})
              </Badge>
            )}
          </div>
          {cls === "active" && (
            <div className="text-[10px] text-muted-foreground">
              復習 {entry.completedTaskCount} / Study{" "}
              {entry.totalStudyMinutes} min
            </div>
          )}
          {latest && (
            <div className="text-[10px] text-muted-foreground">
              修正: {latest.from} → {latest.to}
              {latest.reason &&
                ` (${DAILY_LOAD_CORRECTION_REASON_LABELS[latest.reason].ja})`}
              {latest.note && ` "${latest.note}"`}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleEdit}>
          {isEditing ? "閉じる" : "編集"}
        </Button>
      </div>

      {isEditing && (
        <div className="space-y-2 rounded-md border bg-card/40 p-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Actual level を修正</label>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((lvl) => {
                const active = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">修正理由 (任意)</label>
            <Select
              value={reason}
              onChange={(e) =>
                setReason(e.target.value as DailyLoadCorrectionReason | "")
              }
              className="w-full"
            >
              <option value="">— 選択 —</option>
              {DAILY_LOAD_CORRECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {DAILY_LOAD_CORRECTION_REASON_LABELS[r].ja}
                </option>
              ))}
            </Select>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="任意の補足 (50文字程度)"
              rows={2}
              className="text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLevel(entry.actualLevel);
                setReason("");
                setNote("");
                onToggleEdit();
              }}
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onSave(
                  level,
                  reason === "" ? undefined : reason,
                  note || undefined,
                )
              }
              disabled={level === entry.actualLevel}
            >
              保存
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
