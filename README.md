# LeetCode Prep — 3ヶ月外資コーディングテスト対策アプリ

外資大手企業のコーディングテストを3ヶ月後に自信を持って受けるための個人用学習Webアプリ。

## カバー範囲

- Python基礎 (list / dict / set / deque / heapq / Counter / etc.)
- LeetCode Blind 75
- LeetCode SQL 50
- 英語での解法説明練習
- 間隔反復による復習システム
- ミスログ
- 模擬面接モード

## デバイス別UX

- PC: 問題演習・コード入力・タイマー・模擬面接
- スマホ/タブレット: 復習・概念確認・英語音読・進捗確認

## 開発

```bash
npm install
npm run dev
```

開発サーバが http://localhost:3000 で起動します。

```bash
npm run build  # 本番ビルド
npm run typecheck  # 型チェックのみ
```

## 学習開始日

`Settings.startDate` (デフォルト 2026-06-22 月曜) を Week 1 Day 1 とします。

## データ

MVPは localStorage に保存。Repository 層 (`lib/repo/`) でインターフェースを切ってあるため、後日 Supabase / PostgreSQL へ移行可能です。
