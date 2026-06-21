"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEED_ENGLISH_TEMPLATES } from "@/lib/seed/englishTemplates";

export function EnglishNudge() {
  const todayIndex = new Date().getDate() % SEED_ENGLISH_TEMPLATES.length;
  const pick = SEED_ENGLISH_TEMPLATES[todayIndex];

  if (!pick) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>音読</CardDescription>
        <CardTitle className="text-base flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          今日の英語テンプレート
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm font-medium">{pick.title}</div>
        <p className="text-xs text-muted-foreground">{pick.scenario}</p>
        {pick.segments[0] && (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-sm italic">
            “{pick.segments[0].en}”
          </blockquote>
        )}
        <Link
          href="/english"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          全文を音読する <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
