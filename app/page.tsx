import { TodayCard } from "@/components/dashboard/TodayCard";
import { ProgressCards } from "@/components/dashboard/ProgressCards";
import { ReviewQueueCard } from "@/components/dashboard/ReviewQueueCard";
import { WeakCategoryCard } from "@/components/dashboard/WeakCategoryCard";
import { EnglishPracticeCard } from "@/components/dashboard/EnglishPracticeCard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          今日やるべきこと・3ヶ月全体の進捗・復習対象を一画面で確認します。
        </p>
      </div>

      <TodayCard />
      <ProgressCards />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReviewQueueCard />
        </div>
        <div className="space-y-4">
          <WeakCategoryCard />
          <EnglishPracticeCard />
        </div>
      </div>
    </div>
  );
}
