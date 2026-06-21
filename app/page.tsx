import { TodayCard } from "@/components/dashboard/TodayCard";
import { TodayMenuCard } from "@/components/dashboard/TodayMenuCard";
import { ProgressCards } from "@/components/dashboard/ProgressCards";
import { ReviewQueueCard } from "@/components/dashboard/ReviewQueueCard";
import { ReadinessScoreCard } from "@/components/dashboard/ReadinessScoreCard";
import { WeaknessControlCard } from "@/components/dashboard/WeaknessControlCard";
import { EnglishPracticeCard } from "@/components/dashboard/EnglishPracticeCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { BurnoutBanner } from "@/components/dashboard/BurnoutBanner";
import { ReservationNotice } from "@/components/dashboard/ReservationNotice";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          今日のメニュー・Readiness・直近の実績を一画面で確認します。
        </p>
      </div>

      <ReservationNotice />
      <BurnoutBanner />

      <TodayCard />
      <TodayMenuCard />
      <ProgressCards />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ReadinessScoreCard />
          <ReviewQueueCard />
        </div>
        <div className="space-y-4">
          <WeaknessControlCard />
          <EnglishPracticeCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
