# Handoff: Phase UI-1 AppShell / Sidebar / Topbar replacement

Date: 2026-05-19

## 1. Task Goal

[docs/68](../68-hitori-media-os-ui-design-system.md) / [docs/69](../69-dashboard-ui-redesign-implementation-plan.md) 準拠で Hitori Media OS dashboard の app shell を新 design system に置換する。**ページ body は触らず**、shell のみを差し替える。既存 17 route の動作維持を最低条件にし、新規 6 placeholder route を追加。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし
- ✅ Sanity schema 変更なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ shadcn/ui 追加なし（boss 決定: no）
- ✅ パッケージ追加は **lucide-react のみ**（boss 承認済）
- ✅ Noto Sans JP + Inter は `next/font/google` 経由（パッケージ追加なし）
- ✅ `/` を `/dashboard` リダイレクトせず維持
- ✅ 既存 17 route の動作維持（build で全て listed）
- ✅ 既存 copy buttons / published badges に手を入れず

## 3. Changed Files

### Dependencies

- `dashboard/package.json` — `lucide-react@^0.546.0` を `dependencies` に追加
- `dashboard/package-lock.json` — 自動更新

### 新規 ファイル (9)

- `dashboard/src/lib/navigation.ts`
- `dashboard/src/components/app-shell/AppShell.tsx`
- `dashboard/src/components/app-shell/Sidebar.tsx`
- `dashboard/src/components/app-shell/Topbar.tsx`
- `dashboard/src/components/app-shell/WorkspaceBlock.tsx`
- `dashboard/src/components/app-shell/QuickCreateButton.tsx`
- `dashboard/src/components/app-shell/UserMenu.tsx`
- `dashboard/src/components/app-shell/PhasePlaceholder.tsx`
- 6 placeholder routes:
  - `dashboard/src/app/configurator/page.tsx`
  - `dashboard/src/app/outputs/page.tsx`
  - `dashboard/src/app/publish/page.tsx`
  - `dashboard/src/app/knowledge/page.tsx`
  - `dashboard/src/app/analytics/page.tsx`
  - `dashboard/src/app/settings/page.tsx`

### 更新

- `dashboard/src/app/layout.tsx` — `Geist*` → `Inter` + `Noto_Sans_JP`、`<AppNav>` → `<AppShell>`、`<html lang>` を `en` → `ja`
- `dashboard/src/app/globals.css` — font variable 更新、dark mode 削除
- `dashboard/src/components/AppNav.tsx` — ファイル先頭に **deprecation comment** 追加（削除はせず）

### 新規 docs

- `docs/devlog/0129-ui-1-app-shell.md`
- `docs/handoff/0140-ui-1-app-shell.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルを mirror）

## 4. Summary of Changes

### Shell の最終構造

```
<html lang="ja" font: inter + noto-sans-jp>
  <body bg-slate-50 text-slate-900>
    <AppShell>  <- <div>
      <Sidebar />  <- fixed left 280px, lg only
      <Topbar />   <- fixed top 64px
      <div pt-16 lg:pl-[280px]>
        {children}  <- 既存ページがそのまま入る
      </div>
    </AppShell>
  </body>
</html>
```

### Sidebar (280px, lg only)

- 上部: Hitori Media OS ロゴ + `Admin · Phase 1` ステージタグ
- nav: 4 group (main / 制作&配布 / 知識&分析 / system) に分けて 9 nav items 表示
- active 判定: `activeNavKey(pathname)` で最長 prefix match、`/publish-package*` / `/publish-packages` は明示的に「公開管理」へ、`/visual-assets*` は「図解レビュー」へマップ
- active 表示: 左に 3px blue bar + bg-blue-50 + text-blue-700 + ring
- 下部: WorkspaceBlock（boss-only 固定値、usage bar を blue/amber/rose で 70%/90% の閾値で tone 切替）

### Topbar (64px, sticky)

- 左 (mobile only): ロゴ
- 中央: 検索 input + ⌘K kbd（UI のみ、機能は UI-6）
- 右: QuickCreate (+ クイック作成 ▼) / 通知ベル (badge 3) / 設定 icon / UserMenu

QuickCreate / UserMenu は `'use client'`、click-outside + Escape で閉じる最小実装。

### WorkspaceBlock

```
スタンダードプラン                              [正常]
Hitori Lab ワークスペース
今月の出力数        72 / 300
[==============================================] (blue)
ストレージ使用量    18.4GB / 100GB
[==============================================] (blue)
メンバー            3 / 5
[プランをアップグレード]
```

すべて boss-confirmed hardcoded value、`onUpgrade` は `/settings` リンクで実装。

### Placeholder routes

- 6 件すべて `PhasePlaceholder` を使用
- 対応 phase ラベル表示 (UI-3 / UI-4 / UI-6 / UI-7+)
- 「ダッシュボードに戻る」リンク
- `/publish` / `/settings` には既存ルートへの fallback リンクを追加（`/publish-package/building-hitori-media-os` / `/diagnostics`）

### Active nav resolution

| URL | Active sidebar item |
|---|---|
| `/` | ダッシュボード |
| `/campaigns/...` | キャンペーン |
| `/configurator` | 出力コンフィギュレーター |
| `/outputs` | 出力管理 |
| `/publish` / `/publish-package/...` / `/publish-packages` | 公開管理 |
| `/visual-assets/...` | 図解レビュー |
| `/knowledge` | ナレッジDB |
| `/analytics` | アナリティクス |
| `/settings` | 設定 |
| `/activity-log` / `/diagnostics` / `/human-review-gates` | ダッシュボード (fallback) |

### Build result

```
Route (app) — 23 routes
┌ ƒ /
├ ○ /_not-found
├ ƒ /activity-log
├ ƒ /analytics                    [NEW placeholder]
├ ƒ /api/asset-thumb
├ ƒ /api/visual-review/...
├ ƒ /campaigns
├ ƒ /campaigns/[slug]
├ ƒ /configurator                 [NEW placeholder]
├ ƒ /diagnostics
├ ƒ /human-review-gates
├ ƒ /knowledge                    [NEW placeholder]
├ ƒ /outputs                      [NEW placeholder]
├ ƒ /publish                      [NEW placeholder]
├ ƒ /publish-package/[slug]
├ ƒ /publish-packages
├ ƒ /settings                     [NEW placeholder]
├ ƒ /visual-assets
├ ƒ /visual-assets/[assetId]
└ ƒ /visual-assets/[assetId]/candidates
```

17 既存 + 6 新規 = 23 routes、TypeScript clean、turbopack 既存 NFT 警告のみ（本 batch で増えていない）。

## 5. Key Decisions

- **AppShell は `<main>` を使わず `<div>`**: 既存ページの `<main>` を二重化しない設計。UI-2 以降で個別ページを redesign する際に `<main>` 位置を上げる選択肢を残す
- **mobile sidebar drawer は UI-2 に先送り**: `lg` 未満では sidebar 非表示、topbar 左にロゴ表示で代替。drawer 実装は accessibility (focus trap, Esc) と state 管理でそれなりに分量があるため
- **QuickCreate / UserMenu は最小 client component**: dropdown 開閉のみ、actual action なし。ARIA combobox / focus trap は UI-2 以降
- **`activeNavKey` で URL alias を吸収**: 旧 `/visual-assets/*` → 新 nav「図解レビュー」、`/publish-package/*` → 新 nav「公開管理」をマップ。URL は既存維持で nav 表記だけ新 IA に
- **dark mode 削除**: design system §4 が white/light gray 基調。`prefers-color-scheme: dark` の section を残すと OS テーマで色反転して slate-50/900 のコントラスト前提が壊れる
- **`<html lang="ja">`**: 日本語 UI の正式化、accessibility / Lighthouse 言語識別と一致
- **AppNav は削除せず deprecate**: import を外しただけ。Phase UI-2 完了後に削除。古い PR / branch の type-check が壊れない
- **lucide-react を icon library として確定**: nav / topbar / placeholder すべて lucide。icon-only ボタン (通知 / 設定 / user menu の 3 箇所) は `aria-label` 必須を徹底

## 6. Human Review Questions

- **Font 切替**: Geist Sans → Noto Sans JP + Inter で日本語の見た目が変わる。日本語本文の字面に違和感ないか、Geist のままの方が良いか
- **Sidebar 280px は重いか**: max-w-6xl (1152px) のページが余白多めに見える。240px に縮める / `collapsed` トグルを足すなどの調整が必要か
- **アクティブ表示の青系**: 左 3px blue bar + bg-blue-50 + text-blue-700 で識別。design system §4 の primary blue (#2563EB) を踏襲、boss モックアップとずれていないか
- **QuickCreate 中身**: 5 項目すべて placeholder で同じ画面に飛ぶ。UI-2 以降で「コンテンツアイデア → /knowledge/new」等の細分化が必要か
- **WorkspaceBlock の数値**: 72/300 / 18.4GB / 3/5 はモックアップ準拠のダミー値。実際は boss-only (1/1) だが将来 SaaS 化の足場として「それっぽい数字」を残したのは妥当か
- **通知バッジ 3**: 完全 placeholder。UI-2 以降で実数（pending review gates 数 / Threads pending 等）を derive するか
- **`/visual-review` 名前**: docs/68 では target route として `/visual-review` を想定したが、UI-1 では既存 `/visual-assets` をそのまま nav の「図解レビュー」リンク先にした。UI-5 で `/visual-review` を新設し `/visual-assets` を alias 化する想定で良いか

## 7. Risks or Uncertainties

- **HTML 二重 `<main>` の不在は確認したが、各ページの padding / max-width 重畳の見え方は実機確認待ち**: AppShell の `lg:pl-[280px]` の右側で `mx-auto max-w-6xl` が中央寄せ。1440px ディスプレイでは違和感ないはずだが、大きいディスプレイでは中央寄せがズレて見える可能性
- **lucide-react のバンドルサイズ**: tree-shaking が効くので個別 import (`import {Home} from 'lucide-react'`) で OK のはずだが、bundle analyzer は未実行
- **Noto Sans JP の読込重さ**: `subsets: ['latin']` のみ指定したため日本語グリフは subset external request になる。production deploy 時に FOIT/FOUT が発生する可能性。`display: 'swap'` で軽減
- **Mobile (lg 未満) で sidebar が消える**: topbar 左にロゴが出るだけで nav へ到達する手段なし。boss は基本デスクトップ運用想定だが、UI-2 で drawer 実装が必要
- **AppNav の dead code**: build には残るが import なし。古い branch 復活時に AppNav 経由のページが壊れる可能性、UI-2 削除前提
- **`activeNavKey` の URL alias マッピング**: `/publish-packages` を `publish` キーに飛ばすロジックがハードコード。UI-3 で `/publish-packages` を `/publish` 配下に統合した時点で簡素化

## 8. Recommended Next Step

順序:

1. boss が `cd dashboard && npm run dev` を起動して manual check 実行:
   - `/` で Home が新 shell 内に正常表示、sidebar の「ダッシュボード」が active
   - `/publish-package/building-hitori-media-os` で v0.2 機能（コピー / バッジ / URL link）が完全動作、sidebar で「公開管理」がハイライト
   - `/visual-assets` で画像・図解一覧が表示、sidebar で「図解レビュー」がハイライト
   - `/campaigns/building-hitori-media-os` でキャンペーン詳細が表示、sidebar で「キャンペーン」がハイライト
   - `/configurator` / `/publish` / `/outputs` / `/knowledge` / `/analytics` / `/settings` の 6 placeholder が表示、戻りリンクで `/` へ
   - QuickCreate / 通知 / 設定 / UserMenu ボタンが click 可能、dropdown が開閉

2. 違和感あれば microbatch で調整（特に font / sidebar 幅 / active 表示の色味）

3. 違和感なければ **Phase UI-2: Dashboard / Campaign detail redesign** に着手

並行候補（UI と独立）:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- Working Pipeline 1 周完走の振り返り devlog

## 9. Exact Codex Prompt for Phase UI-2

```text
Implement dashboard Phase UI-2: Dashboard (/) + Campaign detail redesign.

References:
- docs/68-hitori-media-os-ui-design-system.md §2 (Dashboard), §6 (Tokens), §11 (Compat)
- docs/69-dashboard-ui-redesign-implementation-plan.md Phase UI-2 task list
- docs/handoff/0140-ui-1-app-shell.md (previous batch context)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Keep all 23 existing routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock / placeholders intact.
- Keep /publish-package/[slug] v0.2 behavior (copy + badges + links).

Package policy (Tailwind-first + shadcn/ui selective adoption, decided 2026-05-19):
- Base stack: Tailwind + lucide-react (already installed) + next/font.
- shadcn/ui is approved for **selective adoption** from this phase.
- Add ONLY the specific primitive(s) you need this phase, one at a time:
    npx shadcn@latest add card
    npx shadcn@latest add button
    npx shadcn@latest add badge
- Do NOT run `shadcn add <template>` (e.g. login-form, dashboard, sidebar).
  Templates are forbidden.
- For UI-2, the likely primitives to add are: Card, Button, Badge.
  Add Tabs / Dialog / DropdownMenu / Table / Tooltip / Input / Select
  only if a UI-2 sub-task actually requires them.
- Hitori-specific semantics MUST be wrapped in `dashboard/src/components/common/`:
    KpiCard wraps shadcn Card
    PublishedBadge wraps shadcn Badge
    LifecyclePipeline wraps Tailwind utilities (no shadcn primitive needed)
  Pure UI primitives (Dialog/Tabs/Tooltip) MAY be used directly in pages.
- Record every added primitive in the devlog + handoff "Dependencies changed".

Tasks:

1. New common components:
   - dashboard/src/components/common/PageHeader.tsx
   - dashboard/src/components/common/KpiCard.tsx
   - dashboard/src/components/common/KpiCardsRow.tsx
   - dashboard/src/components/common/LifecyclePipeline.tsx
   - dashboard/src/components/common/PlatformBadge.tsx
   (status-badge / empty-state は既存を継続利用、必要に応じて拡張)

2. Dashboard-specific:
   - dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx (preview only)
   - dashboard/src/components/dashboard/ActiveCampaignsCard.tsx
   - dashboard/src/components/dashboard/RecentOutputsTable.tsx
   - dashboard/src/components/dashboard/TodayTasksCard.tsx
   - dashboard/src/components/dashboard/LearningInsightsCard.tsx

3. dashboard/src/app/page.tsx を仕様 §2 構造に再構成:
   - PageHeader (タイトル「ダッシュボード」+ description)
   - KpiCardsRow (アイデア / 下書き / レビュー待ち / 公開済み / ナレッジ資産)
   - MainGrid: ContentOutputConfiguratorCard + LifecyclePipeline + ActiveCampaigns + RecentOutputs
   - RightColumn: TodayTasks + LearningInsights + EngagementSummary

4. dashboard/src/app/campaigns/[slug]/page.tsx を再構成:
   - PageHeader (campaign title)
   - LifecyclePipeline (キャンペーン進捗)
   - 既存 PublishReadinessBoard / ReleaseReviewLinks / 公開パッケージを開く CTA は保持
   - KPI 集約

5. dashboard/src/app/campaigns/page.tsx を再構成 (DataTable 中心):
   - title / status / progress / updatedAt / actions 列

Data sources:
- Existing dashboardHomeQuery / campaignDetailBySlugQuery (no schema change)
- Hardcoded fallback values for KPI numbers not yet in Sanity (e.g. ナレッジ資産)
- WorkingPipelineStatus を LifecyclePipeline に置き換える

Validation:
- cd dashboard && npm run build
- npm run build (Sanity Studio)
- Manually check /, /campaigns, /campaigns/building-hitori-media-os
- Verify /publish-package/building-hitori-media-os still renders v0.2 (no regression)

Docs:
- docs/devlog/<番号>-ui-2-dashboard-redesign.md
- docs/handoff/<番号>-ui-2-dashboard-redesign.md
- docs/handoff/latest.md (mirror)
```
