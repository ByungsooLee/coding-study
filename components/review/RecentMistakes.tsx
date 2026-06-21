"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { formatShort } from "@/lib/utils/date";

export function RecentMistakes() {
  const mistakes = useStore((s) => s.data.mistakes);
  const recent = [...mistakes]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardDescription>復習素材</CardDescription>
        <CardTitle className="text-base">直近で失敗した理由</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState
            title="ミスログなし"
            description="問題演習で「間違えた理由」を埋めると、ここに自動で反映されます (フォームは Step 11)。"
          />
        ) : (
          <ul className="space-y-3 text-sm">
            {recent.map((m) => (
              <li key={m.id} className="space-y-1 border-l-2 border-destructive/40 pl-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {m.failureType}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatShort(m.createdAt)}
                  </span>
                </div>
                <div className="font-medium">{m.description}</div>
                {m.prevention && (
                  <div className="text-xs text-muted-foreground">
                    対策: {m.prevention}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Link href="/mistakes" className="text-xs text-primary hover:underline">
            すべて見る →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
