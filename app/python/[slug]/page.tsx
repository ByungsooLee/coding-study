"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { useStore } from "@/lib/store";

export default function ConceptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const concept = useStore((s) => s.data.pythonConcepts.find((c) => c.slug === slug));
  const markReviewed = useStore((s) => s.markConceptReviewed);
  const allProblems = useStore((s) => s.data.problems);

  if (!slug) return notFound();
  if (!concept) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">概念が見つかりません: {slug}</p>
        <Link href="/python" className="mt-3 inline-block text-sm text-primary underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const related = concept.relatedProblemSlugs
    .map((s) => allProblems.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/python"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Python 概念一覧
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-semibold">{concept.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{concept.oneLiner}</p>
        </div>
        <Button onClick={() => markReviewed(concept.slug)} variant="outline" size="sm">
          <Check className="h-3.5 w-3.5" /> 復習した
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>いつ使うか</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">{concept.whenToUse}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>計算量</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">{concept.complexity}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">よく使う操作</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1 text-sm md:grid-cols-2">
            {concept.commonOps.map((op, i) => (
              <li key={i} className="font-mono text-xs leading-relaxed">
                · {op}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {concept.codeExamples.map((ex, i) => (
        <CodeBlock key={i} code={ex.code} label={ex.label} />
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">コーディングテスト典型用途</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {concept.interviewUses.map((u, i) => (
                <li key={i}>· {u}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">よくあるミス</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {concept.commonMistakes.map((m, i) => (
                <li key={i}>⚠ {m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {related.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">関連するLeetCode問題</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {related.map((p) => (
                <Link key={p.slug} href={`/problems/${p.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                    {p.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
