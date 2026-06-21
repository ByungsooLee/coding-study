"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type {
  FailureType,
  MistakeLog,
  StudyCategory,
} from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

const FAILURE_TYPES: { value: FailureType; label: string }[] = [
  { value: "AlgorithmIdea", label: "Algorithm idea" },
  { value: "DataStructureChoice", label: "Data structure choice" },
  { value: "EdgeCase", label: "Edge case" },
  { value: "ImplementationBug", label: "Implementation bug" },
  { value: "TimeComplexity", label: "Time complexity" },
  { value: "SqlSyntax", label: "SQL syntax" },
  { value: "EnglishExplanation", label: "English explanation" },
];

const CATEGORIES: { value: StudyCategory; label: string }[] = [
  { value: "LeetCode", label: "LeetCode" },
  { value: "SQL", label: "SQL" },
  { value: "Python", label: "Python" },
  { value: "English", label: "English" },
];

export interface MistakeFormInitial {
  problemSlug?: string;
  sqlProblemSlug?: string;
  category?: StudyCategory;
  failureType?: FailureType;
  description?: string;
  correctIdea?: string;
  prevention?: string;
}

interface Props {
  mode: "create" | "edit";
  mistakeId?: string;
  initial?: MistakeFormInitial;
}

export function MistakeForm({ mode, mistakeId, initial }: Props) {
  const router = useRouter();
  const addMistake = useStore((s) => s.addMistake);
  const updateMistake = useStore((s) => s.updateMistake);

  const [category, setCategory] = useState<StudyCategory>(
    initial?.category ?? "LeetCode",
  );
  const [failureType, setFailureType] = useState<FailureType>(
    initial?.failureType ?? "AlgorithmIdea",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [correctIdea, setCorrectIdea] = useState(initial?.correctIdea ?? "");
  const [prevention, setPrevention] = useState(initial?.prevention ?? "");
  const [problemSlug, setProblemSlug] = useState(initial?.problemSlug ?? "");
  const [sqlProblemSlug, setSqlProblemSlug] = useState(
    initial?.sqlProblemSlug ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const payload: Omit<MistakeLog, "createdAt" | "updatedAt" | "id"> = {
      problemSlug: problemSlug || undefined,
      sqlProblemSlug: sqlProblemSlug || undefined,
      category,
      failureType,
      description: description.trim(),
      correctIdea: correctIdea.trim(),
      prevention: prevention.trim(),
      relatedConceptSlugs: [],
      tags: [],
    };

    if (mode === "create") {
      addMistake(payload);
    } else if (mistakeId) {
      updateMistake(mistakeId, payload);
    }
    router.push("/mistakes");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === "create" ? "ミスを記録する" : "ミスを編集"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Category</label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyCategory)}
                className="w-full"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">関連 slug (任意)</label>
              <Input
                value={category === "SQL" ? sqlProblemSlug : problemSlug}
                placeholder={
                  category === "SQL" ? "find-customer-referee" : "two-sum"
                }
                onChange={(e) => {
                  if (category === "SQL") setSqlProblemSlug(e.target.value);
                  else setProblemSlug(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Failure type</label>
            <div className="flex flex-wrap gap-1.5">
              {FAILURE_TYPES.map((ft) => {
                const active = failureType === ft.value;
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setFailureType(ft.value)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary/60",
                    )}
                  >
                    {ft.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              具体的なミス内容 <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="例: ハッシュマップに登録する前に complement を確認していなかった"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">正しい考え方</label>
            <Textarea
              value={correctIdea}
              onChange={(e) => setCorrectIdea(e.target.value)}
              rows={3}
              placeholder="例: enumerate で走査しながら、insert する前に target - x を seen に問い合わせる"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">次回の対策</label>
            <Textarea
              value={prevention}
              onChange={(e) => setPrevention(e.target.value)}
              rows={2}
              placeholder="例: complement lookup のテンプレを毎朝音読する"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/mistakes")}
        >
          キャンセル
        </Button>
        <Button type="submit">{mode === "create" ? "登録" : "更新"}</Button>
      </div>
    </form>
  );
}
