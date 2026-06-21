import {
  BookOpen,
  Brain,
  CalendarDays,
  ClipboardList,
  Compass,
  Database,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Settings as SettingsIcon,
  Timer,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  shortLabel?: string;
  pcOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, shortLabel: "Home" },
  { href: "/guide", label: "使い方ガイド", icon: Compass, shortLabel: "Guide", pcOnly: true },
  { href: "/schedule", label: "12週スケジュール", icon: CalendarDays, shortLabel: "Plan" },
  { href: "/python", label: "Python概念", icon: Brain, shortLabel: "Python" },
  { href: "/problems", label: "Blind 75", icon: ListChecks, shortLabel: "LC" },
  { href: "/sql", label: "SQL 50", icon: Database, shortLabel: "SQL" },
  { href: "/review", label: "今日の復習", icon: BookOpen, shortLabel: "Review" },
  { href: "/english", label: "英語説明", icon: MessagesSquare, shortLabel: "EN" },
  { href: "/mistakes", label: "ミスログ", icon: ClipboardList, shortLabel: "Miss", pcOnly: true },
  { href: "/mock-interview", label: "模擬面接", icon: Timer, shortLabel: "Mock", pcOnly: true },
  { href: "/settings", label: "設定", icon: SettingsIcon, shortLabel: "Set" },
];
