"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SEED_ENGLISH_TEMPLATES } from "@/lib/seed/englishTemplates";
import { cn } from "@/lib/utils/cn";

export function TemplatesList() {
  const [openId, setOpenId] = useState<string | null>(
    SEED_ENGLISH_TEMPLATES[0]?.id ?? null,
  );
  return (
    <div className="space-y-3">
      {SEED_ENGLISH_TEMPLATES.map((t) => {
        const open = openId === t.id;
        return (
          <Card key={t.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : t.id)}
              className="flex w-full items-center justify-between p-5 text-left"
              aria-expanded={open}
            >
              <div>
                <CardDescription>{t.scenario}</CardDescription>
                <CardTitle className="mt-1 text-base">{t.title}</CardTitle>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
            {open && (
              <CardContent className="space-y-4 pt-0">
                {t.segments.map((seg, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">{seg.label}</div>
                    <p className="text-sm">{seg.en}</p>
                    <p className="text-xs text-muted-foreground">{seg.ja}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
