import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "LeetCode Prep — 3ヶ月外資面接対策",
  description:
    "Python基礎 / Blind 75 / SQL 50 / 英語説明 を12週間で仕上げる個人学習アプリ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
