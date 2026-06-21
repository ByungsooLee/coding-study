"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const settings = useStore((s) => s.data.settings);
  const update = useStore((s) => s.updateSettings);
  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);
  const reset = useStore((s) => s.resetAll);
  const storageAvailable = useStore((s) => s.storageAvailable);
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const startDateInputValue = settings.startDate.slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">設定</h1>
        <p className="text-sm text-muted-foreground">
          学習開始日 / 1日の目標時間 / データのエクスポート・インポート。
        </p>
      </div>

      {!storageAvailable && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="pt-5 text-sm">
            ⚠ localStorage が利用できない環境です。データはセッション中のみ保持されます。
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardDescription>カリキュラム</CardDescription>
          <CardTitle className="text-base">学習開始日 (Week 1 Day 1)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            type="date"
            value={startDateInputValue}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              update({ startDate: new Date(v + "T00:00:00.000Z").toISOString() });
            }}
          />
          <p className="text-xs text-muted-foreground">
            起点日を変更すると、Dashboard / Schedule の今週ハイライトが更新されます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>負荷</CardDescription>
          <CardTitle className="text-base">既定の Daily Load Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(["minimum", "standard", "intensive", "review_only"] as const).map(
              (lvl) => {
                const active = settings.defaultDailyLoadLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => update({ defaultDailyLoadLevel: lvl })}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              },
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            その日特有の上書きは Dashboard から行います。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>データ</CardDescription>
          <CardTitle className="text-base">エクスポート / インポート</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => {
              const json = exportJSON();
              navigator.clipboard
                ?.writeText(json)
                .then(() => setMsg("コピーしました"))
                .catch(() => setMsg("コピーに失敗しました"));
            }}
          >
            JSONをクリップボードへ
          </Button>
          <div className="space-y-1">
            <textarea
              className="w-full rounded-md border bg-background p-2 font-mono text-xs"
              rows={6}
              placeholder="ここに以前のJSONを貼って Import"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => {
                try {
                  importJSON(importText);
                  setMsg("Import 成功");
                } catch (err) {
                  setMsg(`Import 失敗: ${(err as Error).message}`);
                }
              }}
            >
              Import
            </Button>
          </div>
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("全データをリセットしますか?")) {
                  reset();
                  setMsg("リセットしました (リロードで反映)");
                }
              }}
            >
              全データリセット
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
