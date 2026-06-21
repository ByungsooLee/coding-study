"use client";

import Link from "next/link";
import {
  BookOpen,
  Brain,
  CalendarDays,
  ClipboardList,
  Database,
  Download,
  Laptop,
  ListChecks,
  MessagesSquare,
  Repeat,
  Smartphone,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <Badge variant="default" className="text-[10px]">
          始め方ガイド
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          3ヶ月で外資コーディングテストを通すための使い方
        </h1>
        <p className="text-sm text-muted-foreground">
          このアプリは問題管理ツールではなく、12週間の学習プロセスを駆動する
          ペースメーカーです。以下を順に読むと、毎日の使い方が分かります。
        </p>
      </header>

      {/* === 目的 === */}
      <Section
        icon={<Target className="h-5 w-5" />}
        title="このアプリで実現すること"
        subtitle="ゴール"
      >
        <ul className="space-y-2 text-sm">
          <Bullet>Python基礎 (list / dict / set / deque / heapq / Counter / class / 型ヒント) を体系的に復習</Bullet>
          <Bullet>LeetCode Blind 75 を週ごとのトピック順にこなす</Bullet>
          <Bullet>LeetCode SQL 50 を JOIN / GROUP BY / Window関数まで段階的に</Bullet>
          <Bullet>解法を英語で説明できるようになる (1分 / 2分 / 自由モード)</Bullet>
          <Bullet>復習を自動スケジュールし、忘却前に戻る</Bullet>
          <Bullet>ミスを記録し、二度同じパターンで落ちない</Bullet>
        </ul>
      </Section>

      {/* === デバイス別 === */}
      <Section
        icon={<Laptop className="h-5 w-5" />}
        title="デバイスごとの使い分け"
        subtitle="どこで・何をする"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <DeviceCard
            icon={<Laptop className="h-4 w-4" />}
            title="PC"
            color="default"
            items={[
              "問題演習 (3カラム ワークベンチ)",
              "Python / SQL コード入力 + 計算量メモ",
              "タイマーで時間感覚をトレーニング",
              "模擬面接モード (Step 12 で追加予定)",
              "ミスログ登録 (Step 11 で追加予定)",
            ]}
          />
          <DeviceCard
            icon={<Smartphone className="h-4 w-4" />}
            title="スマホ / タブレット"
            color="success"
            items={[
              "今日の学習予定の確認 (Dashboard)",
              "Python概念カードを辞書のように参照",
              "復習Queue 消化 (難しかった / もう少し / 覚えた)",
              "英語テンプレートの音読",
              "1分説明モードで隙間時間練習",
            ]}
          />
        </div>
      </Section>

      {/* === 1日の流れ === */}
      <Section
        icon={<CalendarDays className="h-5 w-5" />}
        title="1日の流れ"
        subtitle="平日 1.5〜2時間想定"
      >
        <ol className="space-y-3 text-sm">
          <Step
            n={1}
            label="Dashboard を開く"
            desc="今週のテーマ・今日のDue・苦手カテゴリが一画面で見える。"
          />
          <Step
            n={2}
            label="Python概念をサッと確認"
            desc="今週のトピックに該当する概念カードを開く。コード例とよくあるミスを読む。"
          />
          <Step
            n={3}
            label="復習Due を片付ける"
            desc="/review でDue項目に「難しかった/もう少し/覚えた」を選択 → 次回の日付が自動再スケジュール。"
          />
          <Step
            n={4}
            label="新しい問題を解く"
            desc="/problems の今週Topicから1〜2問。ワークベンチでメモ → コード → 計算量 → エッジケース → 英語メモ。"
          />
          <Step
            n={5}
            label="英語で説明する"
            desc="/english で今解いた問題を選び、1分モードで再生 → 説明する。メモは問題画面と同期。"
          />
          <Step
            n={6}
            label="ステータスを更新"
            desc="Solved / NeedReview / Failed のどれかを必ず付ける。これで復習スケジュールが組まれる。"
          />
        </ol>
        <p className="mt-4 rounded-md border-l-2 border-warning/60 bg-warning/5 p-3 text-xs">
          忙しい日は <strong>復習Dueの片付け + 概念カード1枚</strong> だけでもOK。
          流れを切らさないのが最優先。
        </p>
      </Section>

      {/* === 1週間の流れ === */}
      <Section
        icon={<Repeat className="h-5 w-5" />}
        title="1週間の流れ"
        subtitle="月〜日"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr className="text-xs text-muted-foreground">
                <th className="py-2 pr-3">曜日</th>
                <th className="py-2 pr-3">主な活動</th>
                <th className="py-2">時間</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="py-2 pr-3">月-木</td><td className="py-2 pr-3">今週Topicの新規問題 + 復習Due</td><td className="py-2">1.5–2h</td></tr>
              <tr><td className="py-2 pr-3">金</td><td className="py-2 pr-3">英語説明の強化 (1分/2分モード)</td><td className="py-2">1h</td></tr>
              <tr><td className="py-2 pr-3">土</td><td className="py-2 pr-3">難問1問 (Hard) + 復習一括</td><td className="py-2">3–4h</td></tr>
              <tr><td className="py-2 pr-3">日</td><td className="py-2 pr-3">模擬面接 (Month 2 以降) / 弱点カテゴリの復習</td><td className="py-2">2–3h</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* === 12週ロードマップ === */}
      <Section
        icon={<CalendarDays className="h-5 w-5" />}
        title="12週間のロードマップ"
        subtitle="Phase別 構成"
      >
        <div className="space-y-2 text-sm">
          <Phase
            label="Phase 1 (W1-4): 吸収期"
            color="default"
            text="Array/Hashing → Two Pointers → Sliding Window → Stack/Binary Search。SQLはSELECT/JOIN/GROUP BY/CTE。新規:復習=7:3。"
          />
          <Phase
            label="Phase 2 (W5-8): 統合期"
            color="success"
            text="Linked List → Trees → Graphs → Heap/Intervals。SQLはCASE WHEN/Window関数/Ranking/Rolling。新規:復習=5:5。"
          />
          <Phase
            label="Phase 3 (W9-10): 高難度"
            color="warning"
            text="Backtracking → DP。SQLはAdvanced Join/Aggregation。新規:復習=4:6。"
          />
          <Phase
            label="Phase 4 (W11-12): 本番想定"
            color="destructive"
            text="弱点復習 → Timed practice → Full English explanation。模擬面接週2回。新規:復習=2:8。"
          />
          <p className="pt-2 text-xs text-muted-foreground">
            詳細は <Link href="/schedule" className="text-primary hover:underline">/schedule</Link> で各週の Python / LC / SQL / English トピックが見られます。
          </p>
        </div>
      </Section>

      {/* === 復習システム === */}
      <Section
        icon={<BookOpen className="h-5 w-5" />}
        title="復習システムの仕組み"
        subtitle="間隔反復"
      >
        <p className="text-sm">
          問題のステータスを変えると、次回の復習日が自動で算出されます。
          /review で「難しかった / もう少し / 覚えた」を押すたびに、新しいスケジュールが乗ります。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <RuleCard
            label="Failed (難しかった)"
            color="destructive"
            schedule={["+1d", "+3d", "+7d"]}
            desc="記憶が浅いうちに何度も触る"
          />
          <RuleCard
            label="Need Review (もう少し)"
            color="warning"
            schedule={["+3d", "+7d", "+14d"]}
            desc="そこそこ覚えているが定着前"
          />
          <RuleCard
            label="Solved (覚えた)"
            color="success"
            schedule={["+14d", "+30d"]}
            desc="長期記憶への移行"
          />
        </div>
      </Section>

      {/* === 各ページの使い方 === */}
      <Section
        icon={<Sparkles className="h-5 w-5" />}
        title="各ページの使い方"
        subtitle="リファレンス"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <PageCard
            href="/"
            icon={<Sparkles className="h-4 w-4" />}
            title="Dashboard"
            desc="毎日ここから始める。今週テーマ・進捗・Due・弱点。"
          />
          <PageCard
            href="/schedule"
            icon={<CalendarDays className="h-4 w-4" />}
            title="12週スケジュール"
            desc="今週どこにいるか、次の週は何かを確認。"
          />
          <PageCard
            href="/python"
            icon={<Brain className="h-4 w-4" />}
            title="Python概念"
            desc="辞書代わり。コード例 / 計算量 / よくあるミス。"
          />
          <PageCard
            href="/problems"
            icon={<ListChecks className="h-4 w-4" />}
            title="Blind 75"
            desc="PCはここで演習。Status更新で復習自動化。"
          />
          <PageCard
            href="/sql"
            icon={<Database className="h-4 w-4" />}
            title="SQL 50"
            desc="クエリと解法メモを残す。LeetCodeで実行して通ったらここに保存。"
          />
          <PageCard
            href="/review"
            icon={<BookOpen className="h-4 w-4" />}
            title="今日の復習"
            desc="Due項目を片付け、自己評価で再スケジュール。"
          />
          <PageCard
            href="/english"
            icon={<MessagesSquare className="h-4 w-4" />}
            title="英語説明練習"
            desc="1分/2分カウントダウン + 問題別メモ + テンプレ + フレーズ集。"
          />
          <PageCard
            href="/mistakes"
            icon={<ClipboardList className="h-4 w-4" />}
            title="ミスログ"
            desc="失敗タイプ別の記録 (Step 11 で登録UI追加)。"
          />
          <PageCard
            href="/mock-interview"
            icon={<Timer className="h-4 w-4" />}
            title="模擬面接"
            desc="35分タイマー (Step 12 で実装)。Month 2 以降に本格運用。"
          />
          <PageCard
            href="/settings"
            icon={<Download className="h-4 w-4" />}
            title="設定"
            desc="開始日変更 / JSON Export-Import / リセット。"
          />
        </div>
      </Section>

      {/* === データ管理 === */}
      <Section
        icon={<Download className="h-5 w-5" />}
        title="データの管理 (重要)"
        subtitle="localStorage 前提のため"
      >
        <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-sm">
          <p className="font-medium text-warning">
            ⚠ データはこのブラウザの localStorage に保存されています
          </p>
          <p className="mt-1 text-muted-foreground">
            ブラウザのキャッシュクリア・別ブラウザ・別デバイスではデータが共有されません。
            重要な学習記録を残したい場合、定期的に
            <Link href="/settings" className="ml-1 text-primary hover:underline">
              /settings からJSONをエクスポート
            </Link>
            してください。
          </p>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <Bullet>週1回 JSON Export → クラウドストレージにバックアップ推奨</Bullet>
          <Bullet>別デバイスで使いたい → Export → 移行先で Import</Bullet>
          <Bullet>将来 Supabase 連携を入れれば自動同期できる設計 (Repository層分離済)</Bullet>
        </ul>
      </Section>

      {/* === Tips === */}
      <Section
        icon={<Sparkles className="h-5 w-5" />}
        title="効くTips"
        subtitle="3ヶ月で詰むよくあるパターン"
      >
        <ul className="space-y-2 text-sm">
          <Bullet><strong>「解けた」で終わらせない。</strong>必ず解法メモと英語メモを書く。1問あたり実装+メモで30〜45分。</Bullet>
          <Bullet><strong>Failed を恥ずかしがらない。</strong>正直に Failed を付けるほど、適切な頻度で戻ってくる。</Bullet>
          <Bullet><strong>新規問題は1日2問まで。</strong>残り時間は復習Dueに。新規ばかりだと忘れて崩壊する。</Bullet>
          <Bullet><strong>英語は1分モードで毎日。</strong>うまく説明できない問題が「分かったつもり」の問題。</Bullet>
          <Bullet><strong>苦手カテゴリは無視しない。</strong>Dashboardで赤い棒が伸び続けたら、その週末はそこに集中。</Bullet>
        </ul>
      </Section>

      <div className="text-center text-xs text-muted-foreground">
        準備ができたら <Link href="/" className="text-primary hover:underline">Dashboard へ →</Link>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {subtitle && <span className="text-xs">{subtitle}</span>}
        </div>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="select-none text-primary">·</span>
      <span>{children}</span>
    </li>
  );
}

function Step({ n, label, desc }: { n: number; label: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {n}
      </span>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}

function DeviceCard({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: "default" | "success";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          {icon}
          {color === "success" ? "復習・移動中" : "演習・本気作業"}
        </CardDescription>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground">·</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RuleCard({
  label,
  schedule,
  desc,
  color,
}: {
  label: string;
  schedule: string[];
  desc: string;
  color: "destructive" | "warning" | "success";
}) {
  const tone =
    color === "destructive"
      ? "border-destructive/30 bg-destructive/5"
      : color === "warning"
      ? "border-warning/30 bg-warning/5"
      : "border-success/30 bg-success/5";
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="mt-1 font-mono text-sm">{schedule.join(" → ")}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

function Phase({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: "default" | "success" | "warning" | "destructive";
}) {
  const tone =
    color === "default"
      ? "border-primary/30"
      : color === "success"
      ? "border-success/30"
      : color === "warning"
      ? "border-warning/30"
      : "border-destructive/30";
  return (
    <div className={`rounded-md border-l-4 ${tone} bg-card pl-3 pr-2 py-2`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}

function PageCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}
