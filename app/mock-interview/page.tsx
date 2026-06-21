import { EmptyState } from "@/components/ui/empty-state";
import { Timer } from "lucide-react";

export default function MockInterviewPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">模擬面接モード</h1>
        <p className="text-sm text-muted-foreground">
          35分タイマー / clarification / approach / code / test / 英語説明 / 自己評価。Month 2 以降に本格運用。
        </p>
      </div>

      <EmptyState
        icon={<Timer className="h-6 w-6" />}
        title="模擬面接モードは次のステップで実装します"
        description="ランダム問題出題・35分タイマー・各メモ欄・自己評価を含めて次回追加。"
      />
    </div>
  );
}
