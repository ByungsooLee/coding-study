"use client";

import { PracticePanel } from "@/components/english/PracticePanel";
import { PhrasesCard } from "@/components/english/PhrasesCard";
import { TemplatesList } from "@/components/english/TemplatesList";

export default function EnglishPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">英語説明 練習</h1>
        <p className="text-sm text-muted-foreground">
          問題ごとに英語/日本語メモを書き、1分・2分の時間制限で説明する練習。テンプレートとフレーズは下に。
        </p>
      </div>

      <PracticePanel />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            テンプレート集
          </h2>
          <TemplatesList />
        </div>
        <div className="space-y-6">
          <PhrasesCard />
        </div>
      </div>
    </div>
  );
}
