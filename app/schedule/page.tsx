"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEED_WEEKS } from "@/lib/seed/weeks";
import { useStore } from "@/lib/store";
import { computeWeekNumber } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export default function SchedulePage() {
  const startDate = useStore((s) => s.data.settings.startDate);
  const current = computeWeekNumber(startDate);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">12週間スケジュール</h1>
        <p className="text-sm text-muted-foreground">
          Python基礎 / LeetCode Blind 75 / SQL 50 / 英語説明 の週次カリキュラム。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SEED_WEEKS.map((w) => {
          const isCurrent = w.weekNumber === current;
          const isPast = w.weekNumber < current;
          return (
            <Card
              key={w.id}
              className={cn(
                "transition-colors",
                isCurrent && "border-primary ring-1 ring-primary/50",
                isPast && "opacity-70",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Week {w.weekNumber}</CardDescription>
                  {isCurrent && <Badge variant="default">今週</Badge>}
                  {isPast && <Badge variant="outline">完了</Badge>}
                </div>
                <CardTitle className="mt-1 text-base">{w.theme}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Python" value={w.pythonTopics.join(", ") || "—"} />
                <Row label="LeetCode" value={w.leetcodeTopics.join(", ") || "—"} />
                <Row label="SQL" value={w.sqlTopics.join(", ") || "—"} />
                <Row label="English" value={w.englishFocus} />
                {w.problemSlugs.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">対象問題</div>
                    <div className="text-xs">{w.problemSlugs.length} 問</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
