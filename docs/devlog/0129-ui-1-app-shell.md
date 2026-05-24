# Phase UI-1: AppShell / Sidebar / Topbar replacement

日付: 2026-05-19

## 背景

[docs/68](68-hitori-media-os-ui-design-system.md) / [docs/69](69-dashboard-ui-redesign-implementation-plan.md) で固めた phase plan に従い、Hitori Media OS dashboard の app shell を全面置換した。**ページ body には触らず、shell だけを差し替える** スコープ。

boss 決定事項（Phase UI-1 開始前に確認済）:

- shadcn/ui: **no**（Tailwind-only で実装）
- lucide-react: **yes**（icon library として正式導入）
- Noto Sans JP + Inter: **yes**（`next/font/google`）
- `/` を維持（`/dashboard` redirect しない）

## 決定・変更

### Dependencies

- `lucide-react@^0.546.0` を `dashboard/package.json` `dependencies` に追加（`npm install lucide-react` で確認）
- Noto Sans JP / Inter は `next/font/google` 経由でロード（パッケージ追加なし）

### 新規コンポーネント (6 ファイル + 1 helper + 1 navigation lib)

- [dashboard/src/lib/navigation.ts](../dashboard/src/lib/navigation.ts) — `NAV_ITEMS` (9 件) + `activeNavKey(pathname)` helper。lucide icon を `Home / Rocket / Blocks / FileText / Send / Image / Database / LineChart / Settings` から import
- [dashboard/src/components/app-shell/AppShell.tsx](../dashboard/src/components/app-shell/AppShell.tsx) — 280px sidebar offset + 64px topbar offset の `<div>` wrapper（`<main>` を使わないことで既存ページの `<main>` を二重化しない）
- [dashboard/src/components/app-shell/Sidebar.tsx](../dashboard/src/components/app-shell/Sidebar.tsx) — fixed left 280px、9 nav items を 3 group (制作&配布 / 知識&分析 / system) に分割、active item は左に 3px blue bar + bg-blue-50、`lg` 未満では非表示（mobile drawer は UI-2 で）
- [dashboard/src/components/app-shell/Topbar.tsx](../dashboard/src/components/app-shell/Topbar.tsx) — fixed top 64px、検索 input (⌘K kbd 付き) / QuickCreate / 通知ベル (badge 3) / 設定 icon / UserMenu
- [dashboard/src/components/app-shell/WorkspaceBlock.tsx](../dashboard/src/components/app-shell/WorkspaceBlock.tsx) — Sidebar 下部の固定ブロック（boss-only 値: スタンダードプラン / Hitori Lab / 出力 72/300 / ストレージ 18.4GB/100GB / メンバー 3/5）。usage bar の tone は 70%/90% で amber/rose に切替
- [dashboard/src/components/app-shell/QuickCreateButton.tsx](../dashboard/src/components/app-shell/QuickCreateButton.tsx) — dropdown menu (`'use client'`)、5 項目 (コンテンツアイデア / キャンペーン / 出力 / 公開パッケージ / ナレッジ)、Escape/click-outside で閉じる
- [dashboard/src/components/app-shell/UserMenu.tsx](../dashboard/src/components/app-shell/UserMenu.tsx) — boss avatar + dropdown (`'use client'`)、プロフィール / ワークスペース設定 / 請求・プラン / ログアウト
- [dashboard/src/components/app-shell/PhasePlaceholder.tsx](../dashboard/src/components/app-shell/PhasePlaceholder.tsx) — 新 route 用の共通 placeholder（title + phase tag + ダッシュボードに戻るリンク + 任意 children）

### Layout 更新

[dashboard/src/app/layout.tsx](../dashboard/src/app/layout.tsx):

- `Geist` / `Geist_Mono` の import を削除、`Inter` + `Noto_Sans_JP` (`next/font/google`) に置換
- CSS variable: `--font-inter` / `--font-noto-sans-jp`
- `<html lang="en">` を `<html lang="ja">` に変更
- `<AppNav>` の import を削除、`<AppShell>` で children をラップ
- 旧 `getNavFlags` 経由の prop 渡しは不要に

[dashboard/src/app/globals.css](../dashboard/src/app/globals.css):

- `--font-sans` を `var(--font-inter), var(--font-noto-sans-jp), system-ui, sans-serif` に
- 旧 `--font-geist-sans` / `--font-geist-mono` の参照を削除
- `prefers-color-scheme: dark` の section を削除（design system が white/light gray 基調のため、dark mode は scope 外）
- body の `font-family` を `var(--font-inter), var(--font-noto-sans-jp), system-ui, -apple-system, "Hiragino Sans", "Yu Gothic UI", sans-serif` に

### 新規 placeholder routes (6 件)

- `/configurator` (UI-4 で実装)
- `/outputs` (UI-3)
- `/publish` (UI-3) — 既存 `/publish-package/[slug]` と `/publish-packages` への inline リンクを併記
- `/knowledge` (UI-6)
- `/analytics` (UI-6)
- `/settings` (UI-7+) — `/diagnostics` への inline リンクを併記

すべて `PhasePlaceholder` を使い、対応 phase ラベルを表示。

### AppNav の扱い

`dashboard/src/components/AppNav.tsx` は **削除せず deprecate**:
- ファイル先頭に deprecation comment を追加
- どこからも import されていない状態（build で TS ファイル warning なし）
- Phase UI-2 完了後に削除予定

### Active nav key resolution

`activeNavKey(pathname)`:
- nav items を declaration order で walk、最長一致 href prefix を選択（`/` は除く、最後の fallback）
- `/publish-package/...` / `/publish-packages` は明示的に `publish` キーへマップ（既存 URL は維持しつつ、sidebar では「公開管理」がハイライトされる）
- `/visual-assets/...` は `/visual-assets` を href とする `visual-review` キーへマップ（リブランドの過渡期、URL は既存維持）

### Build verification

- `cd dashboard && npm run build`: Next.js 16.2.6、**23 routes**（17 既存 + 6 新規 placeholder）、TypeScript clean、turbopack の既存 NFT 警告のみ
- `npm run build`: Sanity Studio 7.9s clean

### Manual check（実装 only、起動チェックは boss 担当）

`npm run dev` 起動後、以下が期待動作:

- **`/`**: Home ページが新 shell 内で表示、左サイドバーに「ダッシュボード」が active（blue bar）
- **`/publish-package/building-hitori-media-os`**: v0.2 の公開パッケージ画面が動作、サイドバーで「公開管理」がハイライト（routing alias 経由）
- **`/visual-assets`**: 画像・図解素材一覧が表示、サイドバーで「図解レビュー」がハイライト
- **`/campaigns/building-hitori-media-os`**: キャンペーン詳細、サイドバーで「キャンペーン」がハイライト
- **`/configurator`** / **`/publish`** / その他 placeholder: 「この画面は次フェーズで実装します」ボックスが表示、ダッシュボードに戻るリンクで `/` へ
- 検索 input / 通知 / クイック作成 / ユーザーメニューはすべて UI のみ、actual action なし

## 理由

- **`<main>` を AppShell で使わない**: 既存ページの大半が `<main className="mx-auto max-w-6xl ...">` を自前で持っているため、AppShell が `<main>` を提供すると HTML 二重化になる。AppShell は `<div>` で offset のみ提供し、`<main>` landmark は page 側に残した。UI-2 以降で個別ページを redesign する際に `<main>` の位置を上げる選択肢を残す
- **mobile sidebar drawer を UI-2 に先送り**: 現状 `lg` 未満では sidebar 非表示、topbar 左にロゴ表示。drawer 実装は state 管理 + accessibility (focus trap, Esc) でそれなりに分量があり、UI-1 のスコープを膨らませないため後送り
- **QuickCreate / UserMenu を `'use client'` にしただけ**: actual create action / auth は scope 外、dropdown 開閉だけ動かす最小実装。focus trap や ARIA combobox 等は UI-2 以降
- **`/publish` placeholder に既存ルートへのリンク**: 既存 `/publish-package/[slug]` と `/publish-packages` を v0.2 で動かし続けるためのフォールバック導線。boss が `/publish` を nav 経由でクリックしても既存機能に到達できる
- **dark mode を削除**: design system §4 は white/light gray 基調を明示。OS の prefers-color-scheme: dark に応じて勝手に色反転すると、既存の slate-50 background / slate-900 text が壊れる
- **`<html lang="ja">`**: 既存 `en` から変更。Lighthouse / accessibility の言語識別と一致
- **lucide-react を使い切る**: nav / topbar / placeholder すべて lucide icon に統一。「アイコン単体では意味が弱い場合は日本語ラベルを添える」のルールはすべて守った（sidebar / topbar button は label + icon、icon-only は通知 / 設定 / user menu の 3 箇所のみで `aria-label` 必須）

## 影響

- **既存 17 route の動作維持**: build 結果から確認、turbopack route table に全て出現。page body の content は無変更（v0.2 の Japanese Review Mode + Publish Package v0.2 の挙動が保たれる）
- **新 6 placeholder route**: nav から到達可能、ダッシュボードへの戻り導線あり
- **font が Noto Sans JP + Inter に切替**: 日本語の見た目が Geist 系から Noto に。boss の好みが分かれる可能性、UI-2 着手前に boss feedback を確認推奨
- **既存 page body の `<main>` が AppShell の `<div>` 内側に存在**: HTML は valid、`max-w-6xl` の中央寄せが AppShell の `lg:pl-[280px]` オフセット後の残り幅で計算される
- **AppNav は dead code**: build には残るが import なし、UI-2 で削除予定

## 次の一手

1. boss が dev 起動して manual check を実行（特に `/publish-package/building-hitori-media-os` で v0.2 機能が完全動作するか、font 切替で違和感ないか）
2. 違和感あれば microbatch で修正
3. 違和感なければ **Phase UI-2: Dashboard / Campaign detail redesign** に着手
   - `<KpiCard>` / `<LifecyclePipeline>` / `<ActiveCampaignsCard>` / `<RecentOutputsTable>` / `<TodayTasksCard>` / `<LearningInsightsCard>` / `<ContentOutputConfiguratorCard>` (preview版)
   - `/` を design system 構成で再構成
   - `/campaigns/[slug]` を Lifecycle 視点で再構成

並行候補（UI 系列と独立）:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- Working Pipeline 1 周完走の振り返り devlog
