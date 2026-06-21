# LeetCode Prep — 3ヶ月外資コーディングテスト対策アプリ

外資大手企業のコーディングテストを3ヶ月後に自信を持って受けるための個人用学習Webアプリ。

## カバー範囲

- Python基礎 (list / dict / set / deque / heapq / Counter / etc.)
- LeetCode Blind 75
- LeetCode SQL 50
- 英語での解法説明練習 (1分 / 2分 / 自由モード)
- 間隔反復による復習システム
- ミスログ (登録UIは Step 11 で追加)
- 模擬面接モード (Step 12 で追加)

## デバイス別UX

- PC: 問題演習・コード入力・タイマー・模擬面接
- スマホ/タブレット: 復習・概念確認・英語音読・進捗確認

## 使い方

アプリを開いたら `/guide` ページに使い方が詳しく書かれています。

## ローカルで動かす

```bash
npm install
npm run dev
```

開発サーバが http://localhost:3000 で起動します。

```bash
npm run build      # 本番ビルド
npm run typecheck  # 型チェックのみ
npm start          # 本番ビルドで起動
```

## Vercel に無料でデプロイする

このアプリは Next.js なので Vercel が最も簡単です。

1. https://vercel.com/signup で GitHub アカウントでサインアップ (無料、カード不要)
2. ダッシュボードで **Add New… → Project**
3. `ByungsooLee/coding-study` を Import
4. Framework: Next.js が自動検出される。Build/Output 設定は触らず **Deploy**
5. ~2 分で `https://coding-study-<random>.vercel.app` が払い出される

GitHub の `main` に push するたびに自動で再デプロイされます。プレビュー環境 (PR ごと) も無料で付きます。

### カスタムサブドメイン (任意)

Vercel のプロジェクト設定 **Domains** で `coding-study.vercel.app` や自前ドメインに変更できます。

### 環境変数 (任意)

メタデータの絶対URLを正しく出したい場合のみ:

```
NEXT_PUBLIC_SITE_URL = https://<your-vercel-url>.vercel.app
```

## データについて

データは **localStorage** に保存されます (バックエンドなし)。

- ブラウザを変えるとデータは共有されません
- 重要な記録は `/settings` から JSON Export を取ってバックアップしてください
- 将来 Supabase 等に切り替えやすいよう `lib/repo/` でリポジトリ層を抽象化済み

## 学習開始日

`Settings.startDate` (デフォルト 2026-06-22 月曜) を Week 1 Day 1 とします。
`/settings` で変更可能。

## アーキテクチャ要点

- Next.js 15 App Router / React 19 / TypeScript strict
- Tailwind CSS v3 + 自前 shadcn 風 UI プリミティブ
- Zustand store + localStorage 永続化 (debounced)
- Repository pattern (`lib/repo/`) — 後日 Supabase / PostgreSQL に差し替え可能
- 間隔反復は `lib/domain/review.ts` の純粋関数 (`computeNextReviewDates`, `buildReviewQueue`)
