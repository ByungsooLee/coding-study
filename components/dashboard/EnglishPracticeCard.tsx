"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { useStore } from "@/lib/store";

export function EnglishPracticeCard() {
  const practices = useStore((s) => s.data.englishPractices);
  const total = practices.reduce((sum, p) => sum + (p.practiceCount ?? 0), 0);
  const recent = practices.slice(-3).reverse();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>英語</CardDescription>
            <CardTitle className="text-base">英語説明 練習回数</CardTitle>
          </div>
          <Link
            href="/english"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            開く <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <MessagesSquare className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-semibold">{total}</span>
          <span className="text-xs text-muted-foreground">回</span>
        </div>
        {recent.length > 0 && (
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {recent.map((p) => (
              <div key={p.id} className="truncate">
                · {p.problemSlug ?? p.templateSlug ?? "free"} ({p.mode})
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
