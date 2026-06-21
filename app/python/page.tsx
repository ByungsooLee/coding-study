"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

export default function PythonListPage() {
  const concepts = useStore((s) => s.data.pythonConcepts);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Python 概念カード</h1>
        <p className="text-sm text-muted-foreground">
          辞書のように、list / dict / set / heapq などをいつでも確認できます。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c) => (
          <Link key={c.id} href={`/python/${c.slug}`} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{c.name}</CardTitle>
                  <StatusChip status={c.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{c.oneLiner}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.whenToUse}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: "NotReviewed" | "Familiar" | "Mastered" }) {
  if (status === "Mastered") return <Badge variant="success">Mastered</Badge>;
  if (status === "Familiar") return <Badge variant="default">Familiar</Badge>;
  return <Badge variant="outline">New</Badge>;
}
