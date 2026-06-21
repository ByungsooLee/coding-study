"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { NoteField } from "@/components/problem/NoteField";
import { CountdownTimer } from "./CountdownTimer";
import { ModeSelector, type PracticeMode } from "./ModeSelector";
import { useStore } from "@/lib/store";
import { SEED_ENGLISH_TEMPLATES } from "@/lib/seed/englishTemplates";
import { formatShort } from "@/lib/utils/date";

const MODE_SEC: Record<PracticeMode, number> = {
  "1min": 60,
  "2min": 120,
  free: 0,
};

export function PracticePanel() {
  const problems = useStore((s) => s.data.problems);
  const updateProblem = useStore((s) => s.updateProblem);
  const practices = useStore((s) => s.data.englishPractices);
  const recordPractice = useStore((s) => s.recordEnglishPractice);

  const [problemSlug, setProblemSlug] = useState<string>(problems[0]?.slug ?? "");
  const [templateSlug, setTemplateSlug] = useState<string>(
    SEED_ENGLISH_TEMPLATES[0]?.slug ?? "",
  );
  const [mode, setMode] = useState<PracticeMode>("1min");
  const [resetKey, setResetKey] = useState(0);
  const [justRecorded, setJustRecorded] = useState(false);

  const problem = useMemo(
    () => problems.find((p) => p.slug === problemSlug),
    [problems, problemSlug],
  );
  const template = useMemo(
    () => SEED_ENGLISH_TEMPLATES.find((t) => t.slug === templateSlug),
    [templateSlug],
  );
  const practice = useMemo(
    () => practices.find((e) => e.id === `eng-${problemSlug || "free"}-${mode}`),
    [practices, problemSlug, mode],
  );

  const onEnglishChange = useCallback(
    (v: string) => problemSlug && updateProblem(problemSlug, { englishNote: v }),
    [problemSlug, updateProblem],
  );
  const onJapaneseChange = useCallback(
    (v: string) => problemSlug && updateProblem(problemSlug, { japaneseNote: v }),
    [problemSlug, updateProblem],
  );

  const handleRecord = () => {
    recordPractice({
      problemSlug: problemSlug || undefined,
      templateSlug,
      mode,
      enNote: problem?.englishNote,
      jaNote: problem?.japaneseNote,
    });
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>練習モード</CardDescription>
        <CardTitle className="text-base">問題を選んで時間内に説明する</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">対象の問題</label>
            <Select
              value={problemSlug}
              onChange={(e) => {
                setProblemSlug(e.target.value);
                setResetKey((x) => x + 1);
              }}
              className="w-full"
            >
              <option value="">— 問題なし (テンプレ音読のみ) —</option>
              {problems.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} · W{p.weekNumber} · {p.difficulty}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">参考テンプレート</label>
            <Select
              value={templateSlug}
              onChange={(e) => setTemplateSlug(e.target.value)}
              className="w-full"
            >
              {SEED_ENGLISH_TEMPLATES.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">モード</label>
          <ModeSelector
            value={mode}
            onChange={(m) => {
              setMode(m);
              setResetKey((x) => x + 1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/60 p-4">
          <div>
            <div className="text-xs text-muted-foreground">タイマー</div>
            <CountdownTimer totalSeconds={MODE_SEC[mode]} resetKey={`${mode}-${resetKey}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">この組み合わせの練習回数</div>
              <div className="text-lg font-semibold">{practice?.practiceCount ?? 0}</div>
              {practice?.lastPracticedAt && (
                <div className="text-[10px] text-muted-foreground">
                  last: {formatShort(practice.lastPracticedAt)}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecord}
              className={justRecorded ? "border-success text-success" : ""}
            >
              <Check className="h-3.5 w-3.5" />
              {justRecorded ? "記録しました" : "練習したと記録"}
            </Button>
          </div>
        </div>

        {problem && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border bg-secondary/40 px-3 py-2 text-xs">
            <span className="font-medium">{problem.title}</span>
            <span className="text-muted-foreground">
              {problem.topic} · W{problem.weekNumber} · {problem.difficulty}
            </span>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              LeetCode
            </a>
            <Link
              href={`/problems/${problem.slug}`}
              className="text-primary hover:underline"
            >
              演習画面
            </Link>
          </div>
        )}

        {problem && (
          <div className="grid gap-4 lg:grid-cols-2">
            <NoteField
              label="英語メモ"
              description="problemにも反映"
              value={problem.englishNote}
              onCommit={onEnglishChange}
              rows={9}
              placeholder="First, I'd clarify the input constraints..."
            />
            <NoteField
              label="日本語メモ"
              description="problemにも反映"
              value={problem.japaneseNote}
              onCommit={onJapaneseChange}
              rows={9}
              placeholder="まずは入力制約を確認..."
            />
          </div>
        )}

        {template && (
          <div className="rounded-md border bg-card p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              テンプレート: {template.title}
            </div>
            <div className="space-y-2 text-sm">
              {template.segments.map((seg, i) => (
                <div key={i}>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {seg.label}
                  </div>
                  <p>{seg.en}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
