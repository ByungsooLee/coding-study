"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";

export default function MistakesPage() {
  const mistakes = useStore((s) => s.data.mistakes);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">ミスログ</h1>
        <p className="text-sm text-muted-foreground">
          失敗タイプ × 具体ミス × 次回対策。次ステップで登録フォームを追加します。
        </p>
      </div>

      {mistakes.length === 0 ? (
        <EmptyState
          title="まだミスログがありません"
          description="次のステップで /mistakes に登録フォームを追加します。"
        />
      ) : (
        <div className="space-y-3">
          {mistakes.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{m.description}</CardTitle>
                  <Badge variant="outline">{m.failureType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">正しい考え方: </span>
                  {m.correctIdea}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">次回の対策: </span>
                  {m.prevention}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
