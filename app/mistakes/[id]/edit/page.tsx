"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { MistakeForm } from "@/components/mistake/MistakeForm";
import { useStore } from "@/lib/store";

export default function EditMistakePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const mistake = useStore((s) => s.data.mistakes.find((m) => m.id === id));

  if (!id) return notFound();
  if (!mistake) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">ミスが見つかりません</p>
        <Link
          href="/mistakes"
          className="mt-3 inline-block text-sm text-primary underline"
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/mistakes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> ミスログ一覧
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">ミスを編集</h1>
      <MistakeForm
        mode="edit"
        mistakeId={id}
        initial={{
          problemSlug: mistake.problemSlug,
          sqlProblemSlug: mistake.sqlProblemSlug,
          category: mistake.category,
          failureType: mistake.failureType,
          description: mistake.description,
          correctIdea: mistake.correctIdea,
          prevention: mistake.prevention,
        }}
      />
    </div>
  );
}
