"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MistakeForm } from "@/components/mistake/MistakeForm";
import type { StudyCategory } from "@/lib/domain/types";

function NewMistakeInner() {
  const sp = useSearchParams();
  const problemSlug = sp.get("problemSlug") ?? undefined;
  const sqlProblemSlug = sp.get("sqlProblemSlug") ?? undefined;
  const category: StudyCategory = sqlProblemSlug ? "SQL" : "LeetCode";

  return (
    <MistakeForm
      mode="create"
      initial={{
        problemSlug,
        sqlProblemSlug,
        category,
      }}
    />
  );
}

export default function NewMistakePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/mistakes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> ミスログ一覧
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">ミスを記録</h1>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <NewMistakeInner />
      </Suspense>
    </div>
  );
}
