"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEED_ENGLISH_TEMPLATES } from "@/lib/seed/englishTemplates";

const ALL_PHRASES: string[] = Array.from(
  new Set(SEED_ENGLISH_TEMPLATES.flatMap((t) => t.phrases)),
);

export function PhrasesCard() {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (text: string, i: number) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied(null), 1200);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>表現集</CardDescription>
        <CardTitle className="text-base">よく使うフレーズ</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm">
          {ALL_PHRASES.map((p, i) => (
            <li
              key={i}
              className="group flex items-start justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/50"
            >
              <span className="leading-relaxed">{p}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleCopy(p, i)}
                aria-label="コピー"
              >
                {copied === i ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
