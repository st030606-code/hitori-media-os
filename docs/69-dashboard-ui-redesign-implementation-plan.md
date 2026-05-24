# Dashboard UI Redesign — Implementation Plan v2

最終更新: 2026-05-19
ステータス: Plan (Phase UI-0、実装前)
依存: [docs/68-hitori-media-os-ui-design-system.md](68-hitori-media-os-ui-design-system.md)
Source: [docs/ui-design/000-dashbord-desing.md](ui-design/000-dashbord-desing.md) §8〜10

本 docs は boss 提示の UI 仕様（uploaded spec）を **current dashboard 構造に合わせて段階的に実装するためのフェーズ計画**。実装は別バッチで Phase UI-1 から段階着手する。

---

## 1. Current Route Inventory

| Route | 役割 | ファイル |
|---|---|---|
| `/` | Home (ひとりメディアOS 管理画面) | `dashboard/src/app/page.tsx` |
| `/campaigns` | Campaigns 一覧 | `dashboard/src/app/campaigns/page.tsx` |
| `/campaigns/[slug]` | Campaign detail | `dashboard/src/app/campaigns/[slug]/page.tsx` |
| `/visual-assets` | Visual Asset 一覧 | `dashboard/src/app/visual-assets/page.tsx` |
| `/visual-assets/[assetId]` | Visual Asset detail | `dashboard/src/app/visual-assets/[assetId]/page.tsx` |
| `/visual-assets/[assetId]/candidates` | Candidate review | `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` |
| `/publish-package/[slug]` | 公開パッケージ (copy UI) v0.2 | `dashboard/src/app/publish-package/[slug]/page.tsx` |
| `/publish-packages` | 配布物一覧 (dev) | `dashboard/src/app/publish-packages/page.tsx` |
| `/human-review-gates` | 確認待ちゲート一覧 | `dashboard/src/app/human-review-gates/page.tsx` |
| `/activity-log` | 作業ログ | `dashboard/src/app/activity-log/page.tsx` |
| `/diagnostics` | 診断 | `dashboard/src/app/diagnostics/page.tsx` |

API routes (touch only if necessary):
- `/api/asset-thumb`
- `/api/visual-review/*`

---

## 2. Target Route Inventory (uploaded spec準拠)

| Route | 日本語ラベル | 役割 | Phase |
|---|---|---|---|
| `/` (alias to dashboard) | ダッシュボード | OS Home | UI-2 |
| `/campaigns` | キャンペーン | Campaign 一覧 | UI-2 |
| `/campaigns/[slug]` | キャンペーン詳細 | per-campaign 主役画面 | UI-2 |
| `/configurator` | 出力コンフィギュレーター | contentIdea → output 派生 (中核) | UI-4 |
| `/outputs` | 出力管理 | platform × campaign の全 outputs | UI-3 |
| `/publish-package/[slug]` | 公開パッケージ | copy + URL + reaction (v0.3) | UI-3 |
| `/publish` | 公開管理 | 全 campaign × platform の集約 | UI-3 |
| `/visual-review` | 図解レビュー | Visual Asset + candidate 統合 | UI-5 |
| `/knowledge` | ナレッジDB | contentIdea / brand / styleProfile 閲覧 | UI-6 |
| `/analytics` | アナリティクス | 反応 / engagement 集計 | UI-6 |
| `/settings` | 設定 | env / flags / workspace info | UI-7+ |

---

## 3. Current → New Route Mapping

| Current | New | 対応 |
|---|---|---|
| `/` | `/` (`/dashboard` alias) | UI-2 で全面再構成。仕様の `/dashboard` パスを使うかは Phase UI-1 で判断、現状は `/` を主とする |
| `/campaigns` | `/campaigns` | UI-2 で design system tone 化 |
| `/campaigns/[slug]` | `/campaigns/[slug]` | param 名 `[slug]` を維持（仕様の `[id]` は内部表現として扱う）、UI-2 で再構成 |
| `/visual-assets` | `/visual-review` (リブランド) | UI-5 で統合、`/visual-assets` は alias として残す |
| `/visual-assets/[assetId]` | `/visual-review/[id]` (内側) | UI-5 で統合 |
| `/visual-assets/[assetId]/candidates` | `/visual-review/[id]` (Candidate Carousel 内) | UI-5 で内蔵化 |
| `/publish-package/[slug]` | `/publish-package/[slug]` (継続) | UI-3 で v0.3 化（仕様の `<ManualPublishCopyPanel>` に拡張） |
| `/publish-packages` | `/publish` (公開管理) | UI-3 で統合、`/publish-packages` は alias |
| `/human-review-gates` | （Dashboard / Campaign Detail 内）+ `/publish` の Approval Status | UI-3 で吸収、`/human-review-gates` を保留 or 残す |
| `/activity-log` | `/activity-log`（継続）または `/settings` 配下 | 当面継続、UI-7+ で再判断 |
| `/diagnostics` | `/settings` 配下 | UI-7+ で統合 |

新規 route: `/configurator` / `/outputs` / `/publish` / `/knowledge` / `/analytics` / `/settings`

---

## 4. Current → New Component Mapping

| Current Component | Path | New Component | 移行方針 |
|---|---|---|---|
| `AppNav` | `dashboard/src/components/AppNav.tsx` | `AppShell` + `Sidebar` + `Topbar` | Phase UI-1 で置換、`AppNav` は deprecate 表示で残す |
| `ReadOnlyBanner` | `dashboard/src/components/ReadOnlyBanner.tsx` | `<AppShell>` 上部 banner として継続 | そのまま再利用 |
| `SummaryCard` | `dashboard/src/components/SummaryCard.tsx` | `KpiCard` | 仕様の `tone` / `trend` / `sparkline` を追加 |
| `SectionHeader` | `dashboard/src/components/SectionHeader.tsx` | `PageHeader` (or 共通 SectionHeader 継続) | UI-2 で再構成 |
| `EmptyState` | `dashboard/src/components/EmptyState.tsx` | `EmptyState` (継続) | tone="error" を `ErrorState` に分離 |
| `FilePathBlock` | `dashboard/src/components/FilePathBlock.tsx` | （dev detail 内専用） | そのまま継続 |
| `WorkingPipelineStatus` | `dashboard/src/components/WorkingPipelineStatus.tsx` | `LifecyclePipeline` (`idea / structured / draft / review / published`) | UI-2 で再実装、static→dynamic 化 |
| `NextActionChecklist` | `dashboard/src/components/NextActionChecklist.tsx` | `TodayTasksCard` | UI-2 で移行 |
| `ReleaseReviewLinks` | `dashboard/src/components/ReleaseReviewLinks.tsx` | `IncludedAssetsTable` の一部 | UI-3 で吸収 |
| `PublishReadinessBoard` | `dashboard/src/components/PublishReadinessBoard.tsx` | `PublishPackageOverview` | UI-3 で移行 |
| `CopyButton` | `dashboard/src/components/CopyButton.tsx` | `<ManualPublishCopyPanel>` 内 copy button | そのまま再利用（fallback 設計を保持） |
| `StatusBadge` | `dashboard/src/components/StatusBadge.tsx` | `StatusBadge` (仕様の StatusKey に揃える) | tone map を仕様準拠で更新 |
| `CandidateGrid` | `dashboard/src/components/visual-review/CandidateGrid.tsx` (確認要) | `CandidateCarousel` | UI-5 で置換 |
| `CandidateCard` | (visual-review 内) | `CandidateCarousel` のアイテム | UI-5 で統合 |
| `HumanReviewGateList` | `dashboard/src/components/HumanReviewGateList.tsx` | `ApprovalStatus` (Publish Package 内) or 独立 | UI-3 で再配置 |
| `ManualPublishingStatusList` | `dashboard/src/components/ManualPublishingStatusList.tsx` | `ManualPublishCopyPanel` (項目部分) | UI-3 で統合 |
| `PublishPackageLinks` | `dashboard/src/components/PublishPackageLinks.tsx` | `IncludedAssetsTable` | UI-3 で統合 |
| `VisualAssetStatusTable` | `dashboard/src/components/VisualAssetStatusTable.tsx` | `IncludedAssetsTable` の visuals 行 / Visual Review へリンク | UI-5 で再構成 |
| `PromptTemplateSummary` | `dashboard/src/components/PromptTemplateSummary.tsx` | `RecommendedTemplates` (Output Configurator) | UI-4 で移行 |
| `SelectedPlatformChips` | `dashboard/src/components/SelectedPlatformChips.tsx` | `PlatformBadge` (新) + chip list 継続 | UI-2 で発展 |
| `CampaignStatusCard` | `dashboard/src/components/CampaignStatusCard.tsx` | `PageHeader` + KpiCardsRow の組み合わせ | UI-2 で分解 |
| `NextActionSummary` | `dashboard/src/components/NextActionSummary.tsx` | `TodayTasksCard` | UI-2 で吸収 |
| `PublishedStatusBlock` (v0.2 inline) | `dashboard/src/app/publish-package/[slug]/page.tsx` 内 | `ManualPublishCopyPanel` の 1 行 | UI-3 で抽出 |
| `PublishedBadge` (v0.2 inline) | `dashboard/src/app/publish-package/[slug]/page.tsx` 内 | `<PublishedBadge>` 独立 | UI-3 で抽出 |
| `LocalModeBanner` | `dashboard/src/components/ReadOnlyBanner.tsx` 等 | `AppShell` 上部固定 banner | そのまま使用 |

**新規 component（仕様準拠で UI-1 以降に新規実装）**:

- `AppShell` / `Sidebar` / `Topbar` / `WorkspaceBlock` / `SearchBar` / `QuickCreateButton` / `NotificationButton` / `UserMenu` (Phase UI-1)
- `PageHeader` / `KpiCard` / `KpiCardsRow` / `LifecyclePipeline` / `PlatformBadge` (Phase UI-1〜2)
- `ContentOutputConfiguratorCard` / `ActiveCampaignsCard` / `RecentOutputsTable` / `TodayTasksCard` / `LearningInsightsCard` (Phase UI-2)
- `PublishPackageOverview` / `ManualPublishCopyPanel` / `PublishedUrlField` / `ReactionNotesField` / `PendingPlatformsCard` / `IncludedAssetsTable` (Phase UI-3)
- `OutputConfiguratorForm` / `ContentIdeaSelect` / `OutputPreviewPanel` / `GeneratedDeliverablesCard` (Phase UI-4)
- `CandidateCarousel` / `ImagePreviewCanvas` / `VisualApprovalPanel` / `CommentsPanel` / `VersionHistory` / `PairedCaptionEditor` (Phase UI-5)
- `KnowledgePage` / `AnalyticsPage` (Phase UI-6)

---

## 5. Phased Implementation Plan

各 phase は **独立 commit / 独立 PR**。phase 間に boss review、既存 17 route の動作維持を最低条件。

### Phase UI-0 — Documentation only (current batch)

- `docs/68` design system spec（uploaded spec の正式リポジトリ版）
- `docs/69` 本ファイル
- `docs/devlog/0128-ui-design-spec-import.md`
- `docs/handoff/0139-ui-design-spec-import.md`
- 実装変更なし、build 結果不変
- パッケージ追加判断は Phase UI-1 開始前に boss と決定

### Phase UI-1 — AppShell / Sidebar / Topbar replacement

**目標**: 全ルートで共通の Sidebar (280px) + Topbar (64px) を導入。ページ body は既存ページを差し込むのみ。

タスク:

- `dashboard/src/components/app-shell/AppShell.tsx` 新規
- `dashboard/src/components/app-shell/Sidebar.tsx` 新規（9 nav items、Lifecycle pipeline 識別の細い blue bar）
- `dashboard/src/components/app-shell/Topbar.tsx` 新規（search placeholder / quick create / notification / user menu）
- `dashboard/src/components/app-shell/WorkspaceBlock.tsx` 新規（boss-only 固定値）
- `dashboard/src/components/app-shell/QuickCreateButton.tsx` 新規（dropdown menu のみ、actual create は placeholder）
- `dashboard/src/components/app-shell/UserMenu.tsx` 新規
- `dashboard/src/app/layout.tsx` を `<AppShell>` 経由に
- 既存 `<AppNav>` は archive（削除せず deprecate comment）
- 新ルート `/configurator` / `/outputs` / `/publish` / `/knowledge` / `/analytics` / `/settings` の placeholder page を作成（"Coming in Phase UI-X" 表示のみ）
- `tailwind.config.ts` を最小限拡張（`spacing.70`、shadow tokens 等。詳細は docs/68 §11-5）

決定事項（Phase UI-1 開始前に boss 確認）:
- `shadcn/ui` 導入 yes/no
- `lucide-react` 導入 yes/no
- `Noto Sans JP` / `Inter` 導入 yes/no
- custom Tailwind tokens (primary / shadow / radius) vs default 直書き

非目標:
- ページ body の中身変更
- データソース変更

検証:
- `cd dashboard && npm run build` clean
- 既存 17 route + 新 placeholder route が新 shell で正常表示

### Phase UI-2 — Dashboard / Campaign detail redesign

**目標**: `/` と `/campaigns/[slug]` を design system tone で再構成。

タスク:

- `dashboard/src/components/common/PageHeader.tsx` 新規
- `dashboard/src/components/common/KpiCard.tsx` 新規
- `dashboard/src/components/common/LifecyclePipeline.tsx` 新規（既存 `WorkingPipelineStatus` を発展）
- `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` 新規（preview 表示のみ、actual generate は UI-4）
- `dashboard/src/components/dashboard/ActiveCampaignsCard.tsx` 新規
- `dashboard/src/components/dashboard/RecentOutputsTable.tsx` 新規
- `dashboard/src/components/dashboard/TodayTasksCard.tsx` 新規
- `dashboard/src/components/dashboard/LearningInsightsCard.tsx` 新規
- `/` を 仕様の DashboardPage 構造で再構成
- `/campaigns/[slug]` を LifecyclePipeline + KpiCards 中心に再構成
- `/campaigns` を `<DataTable>` で簡素化

非目標:
- 新ルートのページ body は触らない（UI-3 以降）

検証:
- 既存 17 route 動作維持
- KPI 数値は既存 GROQ query から derive、hardcoded を最小化

### Phase UI-3 — Publish Package / 公開管理 redesign

**目標**: `/publish-package/[slug]` v0.3 + `/publish` 新規 + `/outputs` 新規。仕様の `<ManualPublishCopyPanel>` で URL / reaction notes write-back を導入。

タスク:

- `dashboard/src/components/publish/PublishPackageOverview.tsx` 新規
- `dashboard/src/components/publish/ManualPublishCopyPanel.tsx` 新規（既存 `<PublishedStatusBlock>` を吸収・抽出）
- `dashboard/src/components/publish/PublishedUrlField.tsx` 新規
- `dashboard/src/components/publish/ReactionNotesField.tsx` 新規
- `dashboard/src/components/publish/PendingPlatformsCard.tsx` 新規
- `dashboard/src/components/publish/IncludedAssetsTable.tsx` 新規
- `/publish-package/[slug]` v0.3:
  - design system tone に合わせる
  - `<ManualPublishCopyPanel>` を埋め込み
  - URL / reactionNotes inline edit を server action 経由 controlled write tool wrapper として実装（`tools/sanity/reflect-publication-state.mjs` の薄い API ラッパ）
- `/publish` (公開管理) 新規:
  - 全 campaign × platform 横断の publishing 状態テーブル
  - Threads pending 一覧
- `/outputs` 新規:
  - `outputs/` FS scan + `platformOutput` Sanity の listing
- 旧 `/publish-packages` → `/publish` リダイレクト or co-exist

検証:
- 既存 publish-package コピー UI が機能維持
- write actions は dry-run/execute の 2-step を踏襲（boss が write 前に確認）

### Phase UI-4 — Output Configurator MVP（中核機能）

**目標**: `/configurator` を MVP として実装。boss が UI から「下書きを生成」を試せる状態に。

タスク:

- `dashboard/src/components/configurator/OutputConfiguratorForm.tsx` 新規
- `dashboard/src/components/configurator/ContentIdeaSelect.tsx` 新規
- `dashboard/src/components/configurator/OutputPreviewPanel.tsx` 新規
- `dashboard/src/components/configurator/GeneratedDeliverablesCard.tsx` 新規
- `/configurator` 実装:
  - contentIdea / platform / outputType / purpose / tone / cta / outputLength 等の form
  - 「下書きを生成」ボタン
- 生成は **placeholder**: ボタン押下時に prompt template を組み立てて `OutputPreviewPanel` に表示するだけ、actual generation は別途（Codex CLI 経由 or 手動コピー）
- 既存 `prompts/` の prompt template と統合

非目標:
- 実際の AI 生成（boss が manually コピー実行）
- platform API 連携

検証:
- contentIdea / platform / outputType の組み合わせで prompt が正しく組み上がる
- 組み上がった prompt をコピーできる

### Phase UI-5 — Visual Review redesign

**目標**: `/visual-review` を `/visual-assets` 系から統合。`<CandidateCarousel>` + `<ImagePreviewCanvas>` + `<VisualApprovalPanel>` + `<CommentsPanel>` + `<VersionHistory>`。

タスク:

- `dashboard/src/components/visual-review/CandidateCarousel.tsx` 新規
- `dashboard/src/components/visual-review/ImagePreviewCanvas.tsx` 新規
- `dashboard/src/components/visual-review/VisualApprovalPanel.tsx` 新規
- `dashboard/src/components/visual-review/CommentsPanel.tsx` 新規
- `dashboard/src/components/visual-review/VersionHistory.tsx` 新規
- `dashboard/src/components/visual-review/PairedCaptionEditor.tsx` 新規
- `/visual-review` 新規（旧 `/visual-assets` を alias 化 or 統合）
- 既存 Visual Register との橋渡し UI（approve & register は Visual Register 経由のまま）

非目標:
- approve & register の dashboard 内実行

### Phase UI-6 — Knowledge DB / Analytics

**目標**: `/knowledge` + `/analytics` を初期 listing 状態で実装。

タスク:

- `/knowledge`:
  - contentIdea / brandProfile / visualStyleProfile / promptTemplate の listing
  - 各レコード preview + Studio link
- `/analytics`:
  - `manualPublishingStatus.reactionNotes` 集計
  - 簡易 chart（Recharts 承認時）or HTML/CSS bar/line (fallback)
  - `<LearningInsightsCard>` の rule-based 検出

非目標:
- 外部 platform API 連携

### Phase UI-7+ — Settings / Multi-user / Theming

範囲外（boss 確認待ち）。`/settings` で env / flags 表示、将来 multi-workspace / theming 対応。

---

## 6. Phase Sequencing Summary

```
UI-0  docs only         ← 本バッチ
UI-1  AppShell / Sidebar / Topbar replacement
UI-2  Dashboard + Campaign detail
UI-3  Publish Package v0.3 + /publish + /outputs
UI-4  Output Configurator MVP (中核 monetizable feature)
UI-5  Visual Review 統合
UI-6  Knowledge DB + Analytics
UI-7+ Settings / Multi-user / Theming
```

各 phase の **間に boss review** を必ず挟む。順序は変更可能（boss が Output Configurator を先に試したい場合は UI-4 を前倒し）。

---

## 7. Current Repo Compatibility Notes

### 7-1. ディレクトリ構造の差異

仕様の §8 ディレクトリ案は単一 `src/` 想定だが、本リポジトリは **`dashboard/src/`**。Phase UI-1 で以下の対応で実装する:

| 仕様 (uploaded) | 本リポジトリ |
|---|---|
| `src/app/dashboard/page.tsx` | `dashboard/src/app/page.tsx` (or `dashboard/src/app/dashboard/page.tsx` 新設で `/` → `/dashboard` redirect) |
| `src/app/configurator/page.tsx` | `dashboard/src/app/configurator/page.tsx` |
| `src/app/publish/page.tsx` | `dashboard/src/app/publish/page.tsx` |
| `src/app/visual-review/page.tsx` | `dashboard/src/app/visual-review/page.tsx` |
| `src/components/app-shell/` | `dashboard/src/components/app-shell/` |
| `src/components/common/` | `dashboard/src/components/common/` |
| `src/components/dashboard/` | `dashboard/src/components/dashboard/` |
| `src/components/configurator/` | `dashboard/src/components/configurator/` |
| `src/components/publish/` | `dashboard/src/components/publish/` |
| `src/components/visual-review/` | `dashboard/src/components/visual-review/`（既存ディレクトリ拡張） |
| `src/lib/labels.ts` 等 | `dashboard/src/lib/labels.ts` |
| `src/styles/tokens.ts` | `dashboard/src/lib/tokens.ts`（styles dir 不使用なら lib に） |

### 7-2. 既存ルートの保護

- `/publish-package/[slug]` v0.2 は **そのまま動作維持**、UI-3 で in-place upgrade
- `/visual-assets` 系は **alias として残しつつ** `/visual-review` を新設
- 既存 17 route は **全 phase で動作維持** が最低条件

### 7-3. 既存コンポーネントの保護

- `CopyButton` (v0.2) の fallback 設計は移植先でも維持
- `publishPackageReader` (v0.2) は `ManualPublishCopyPanel` の data source として再利用
- `AppNav` は UI-1 後に deprecate（削除はしない、import を外す）
- `StatusBadge` は仕様の StatusKey に揃えるが既存 tone map との互換性を保つ

### 7-4. shadcn/ui 依存の判断（2026-05-19 確定: selective adoption）

- **Policy**: **Tailwind-first + shadcn/ui selective adoption**
- **UI-1**: shadcn 未使用で完了（AppShell / Sidebar / Topbar / dropdown はすべて Tailwind + 手書き）
- **UI-2+**: 必要な primitive のみ個別追加（`Button` / `Card` / `Badge` / `Input` / `Select` / `Tabs` / `Dialog` / `DropdownMenu` / `Table` / `Tooltip`）
- **テンプレート丸ごと禁止**: `npx shadcn add login-form` 等の sweeping import は行わない。1 件ずつ `npx shadcn@latest add button` のように個別追加
- **Hitori 固有 semantic は wrap**: shadcn primitive をそのまま page で使わず、`dashboard/src/components/common/` 配下に Hitori 用 wrapper を作る（例: `<KpiCard>` は shadcn `Card` を内包する形で実装）
- **wrap せず直接使える primitive**: 汎用 UI 要素のみ (`Dialog` / `Tabs` / `Tooltip` 等)
- **設置場所**: `dashboard/components.json` で alias 設定、shadcn primitive は `dashboard/src/components/ui/` (default config)、Hitori 固有 wrapper は `dashboard/src/components/common/` に分離

### 7-5. Tailwind-first approach

base のスタイリングは Tailwind utility class、shadcn primitive を導入したセクションでも UI ロジックは Tailwind class を直書きする方針。仕様の `<StatusBadge variant="soft|solid|outline">` 等は wrapper 側で variant prop を解釈し、内側で Tailwind class を組み立てる（必要に応じて shadcn の `Badge` を base として）。`class-variance-authority` は shadcn 導入時に標準で入るので利用可、ただし wrapper 側だけに留める。

### 7-6. Sanity スキーマとの紐付け

仕様の `ManualPublishStatus` / `PublishPackage` / `VisualReviewStatus` 等は **Sanity スキーマと完全一致しない**。下記で吸収:

| 仕様 enum | 現行 Sanity field | 吸収 |
|---|---|---|
| `ManualPublishStatus.pending` | `manualPublishingStatus[].state === 'not-started'` | helper 関数で正規化 |
| `ManualPublishStatus.copied` | （Sanity に該当なし） | UI 内のみで保持、Sanity 反映不要 |
| `ManualPublishStatus.published` | `state === 'done'` | helper 関数 |
| `ManualPublishStatus.skipped` | `state === 'archived'` 等？ | Phase UI-3 で確定 |
| `ManualPublishStatus.needs_fix` | （該当なし） | UI のみ |
| `PublishPackage` type | （Sanity に該当 doc type 無し） | campaignPlan + manualPublishingStatus から derive |
| `VisualReviewStatus` | `visualAssetPlan.status` (saved/skipped/etc) | helper 関数 |

Sanity スキーマ変更は本フェーズの **scope 外**。

### 7-7. Boss 決定事項（記録）

#### Phase UI-1 開始前 (2026-05-19、決定済)

| 項目 | 決定 |
|---|---|
| shadcn/ui 導入 | **no**（UI-1 は使わず完了） |
| lucide-react 導入 | **yes**（UI-1 で導入済） |
| Noto Sans JP + Inter | **yes**（next/font/google 経由、UI-1 で導入済） |
| `/` を dashboard route とする | **yes**（`/dashboard` redirect しない、`/` 維持） |

#### UI 全体方針 (2026-05-19、確定)

- **Tailwind-first + shadcn/ui selective adoption**
- UI-2 以降で必要な primitive (`Button` / `Card` / `Badge` / `Input` / `Select` / `Tabs` / `Dialog` / `DropdownMenu` / `Table` / `Tooltip`) を個別追加
- テンプレート丸ごと導入は禁止
- Hitori 固有 semantic を持つ部品は `dashboard/src/components/common/` で wrap

#### UI-2 着手時に決定する項目（必要に応じて）

- Tailwind config 拡張 (custom primary tokens / shadow / radius) vs `blue-*` / `shadow-sm` 直書き
- 上記 10 candidate primitive のうち、UI-2 で実際に追加するのはどれか（`Card` / `Button` / `Badge` あたりが UI-2 で必要になる見込み）

---

## 8. Productization Notes

- **Boss-only local-first mode (Phase 1)**: single-user 前提、認証なし、localhost が main。WorkspaceBlock は固定値表示
- **Future SaaS mode (Phase 2+)**: workspace 切替 / 認証 / billing。本 spec の WorkspaceBlock がそのまま再利用可能
- **Read-only first, write actions later**:
  - v0.2 までは全 dashboard read-only
  - Phase UI-3 で `ManualPublishCopyPanel` の URL / reactionNotes write を server action 経由 controlled tool として導入
  - Phase UI-4 で Output Configurator も file 出力までに留め、Sanity 直書きしない
- **Manual publishing first, auto-post later**:
  - 全 publish 行動は manual（CLAUDE.md と一致）
  - auto-post / platform API は scope 外
- **Content Output Configurator が中核 monetizable feature**: 教材 / SaaS 化文脈で「structured contentIdea → AI 派生」体験そのものが製品価値。Phase UI-4 の優先度が高い、boss 判断で UI-2/3 と前後入替可
- **Developer details hidden behind `<details>` panels**: `_id` / `localAssetPath` / `transactionId` / `bytes` 等は折り畳む
- **Japanese UI first**: nav / heading / button / badge 全て日本語、識別子は `<code>` 内

---

## 9. Out of Scope

- 認証 / 多 user (Phase UI-7+ で議論)
- Sanity schema 変更
- 外部 API 連携（X / note / Substack の reaction 自動取得）
- 自動投稿
- 有料 / paid offer UI
- モバイル app
- 多言語化（英語切替）

---

## 10. Exact Codex Prompt for Phase UI-1

```text
Implement dashboard Phase UI-1: AppShell / Sidebar / Topbar replacement.

References:
- docs/68-hitori-media-os-ui-design-system.md (sections 1, 6, 11)
- docs/69-dashboard-ui-redesign-implementation-plan.md (phase UI-1 task list)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Keep all existing 17 routes working.
- Do NOT touch page body content; only swap the shell.
- Package additions require explicit boss approval before this batch
  starts. If denied, fall back to Tailwind-only + Unicode + emoji + local SVG.

Boss-approved packages for this phase (fill in before running):
- shadcn/ui:       [yes | no]
- lucide-react:    [yes | no]
- Noto Sans JP:    [yes | no]
- Inter:           [yes | no]

Tasks:

1. New components under dashboard/src/components/app-shell/:
   - AppShell.tsx
   - Sidebar.tsx (280px wide, 9 nav items)
   - Topbar.tsx (64px, sticky, search placeholder)
   - WorkspaceBlock.tsx (boss-only fixed values)
   - QuickCreateButton.tsx (dropdown menu, placeholder actions)
   - UserMenu.tsx

2. Sidebar nav (per docs/68 §1-2):
   - ダッシュボード → /
   - キャンペーン → /campaigns
   - 出力コンフィギュレーター → /configurator (placeholder route)
   - 出力管理 → /outputs (placeholder)
   - 公開管理 → /publish (placeholder)
   - 図解レビュー → /visual-review (alias to /visual-assets for now)
   - ナレッジDB → /knowledge (placeholder)
   - アナリティクス → /analytics (placeholder)
   - 設定 → /settings (placeholder)

3. Placeholder routes:
   - dashboard/src/app/configurator/page.tsx
   - dashboard/src/app/outputs/page.tsx
   - dashboard/src/app/publish/page.tsx
   - dashboard/src/app/knowledge/page.tsx
   - dashboard/src/app/analytics/page.tsx
   - dashboard/src/app/settings/page.tsx

   Each shows "Coming in Phase UI-X" placeholder.

4. dashboard/src/app/layout.tsx:
   - Wrap children with <AppShell />.
   - Remove old <AppNav> import but keep the file (deprecated comment).

5. Tailwind config minimal extension (dashboard/tailwind.config.ts):
   - spacing.70: '17.5rem'   (sidebar width)
   - colors.primary: copy from docs/68 §6-1 (only if not using blue-* directly)

6. Accessibility:
   - aria-current="page" on active nav.
   - focus ring (primary-200 or blue-200) on interactive elements.
   - keyboard: Tab to all nav, Esc to close mobile drawer.

Validation:
- cd dashboard && npm run build (clean, all 17 + 6 placeholder routes listed)
- npm run build (Sanity Studio clean)
- Manually open each existing route in localhost dev, confirm content
  renders inside new shell with no visual regression.

Docs:
- docs/devlog/<番号>-ui-phase-1-appshell.md
- docs/handoff/<番号>-ui-phase-1-appshell.md
- docs/handoff/latest.md (mirror)
```

---

End of Implementation Plan v2.
