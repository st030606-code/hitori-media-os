# Phase UI-2: Dashboard / Campaign detail redesign

日付: 2026-05-19

## 背景

[Phase UI-1 (handoff 0140)](../handoff/0140-ui-1-app-shell.md) で AppShell / Sidebar / Topbar の共通 shell を導入完了。本 batch では `/`、`/campaigns`、`/campaigns/[slug]` の **ページ body 側** を [docs/68 §2 / docs/69 §5 Phase UI-2](../68-hitori-media-os-ui-design-system.md) 準拠で再構成。既存 `/publish-package/[slug]` v0.2 と既存 17 + 6 placeholder = 23 route は無変更。

## 決定・変更

### Package policy 適用（2026-05-19 確定の selective adoption）

UI-2 は **shadcn primitive を追加せず Tailwind-only で完走** した。理由は §「Phase UI-2 で shadcn を追加しなかった理由」参照。policy 自体は「必要な primitive のみ個別追加」なので、追加しないという選択もポリシー準拠。

### 新規 common components (5)

- `dashboard/src/components/common/PageHeader.tsx` — title + description + actions + meta、Server Component
- `dashboard/src/components/common/KpiCard.tsx` — label / value / tone / trend / icon / secondary、6 tone (blue/purple/orange/emerald/red/slate)
- `dashboard/src/components/common/KpiCardsRow.tsx` — responsive grid (2 / 3 / 5 cols)
- `dashboard/src/components/common/LifecyclePipeline.tsx` — 5-stage 横並びパイプライン (Idea → Structured → Draft → Review → Published)、`currentStage` highlight、tone map は docs/68 §4.3 準拠、stage 間に `ChevronRight`
- `dashboard/src/components/common/PlatformBadge.tsx` — 10 platform 分のブランド色対応、`platformLabel(key)` helper も export

### 新規 dashboard components (5)

- `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` — preview-only、8 fake selector + 「出力コンフィギュレーターを開く」CTA で `/configurator` へ
- `dashboard/src/components/dashboard/ActiveCampaignsCard.tsx` — 進行中キャンペーン top 5、progress bar、status badge、pending gates 表示
- `dashboard/src/components/dashboard/RecentOutputsTable.tsx` — table 形式（Phase UI-3 で `/outputs` データ統合予定、現状は placeholder + platform color preview）
- `dashboard/src/components/dashboard/TodayTasksCard.tsx` — read-only checklist、`TaskItem` 型を export、`completed` / `priority` で icon と tone 切替
- `dashboard/src/components/dashboard/LearningInsightsCard.tsx` — insight list、`LearningInsight` 型を export、5 tone

### Page 再構成

- **`/` (`dashboard/src/app/page.tsx`)** — 全面書き換え:
  - `<PageHeader>` (title 「ダッシュボード」+ description + 公開パッケージを開く CTA)
  - `<KpiCardsRow>` 5 KPIs: コンテンツアイデア / 下書き / レビュー待ち / 公開済み / ナレッジ資産
  - 2-column grid (lg+):
    - 左 (2/3): ContentOutputConfiguratorCard / LifecyclePipeline / ActiveCampaignsCard / RecentOutputsTable
    - 右 (1/3): TodayTasksCard / LearningInsightsCard / ReleaseReviewLinks
  - 下部: 外部ツール section
  - 旧 `WorkingPipelineStatus` / `NextActionChecklist` / 旧 emerald CTA card は LifecyclePipeline + TodayTasks + PageHeader actions に統合
- **`/campaigns`** — 全面書き換え: PageHeader + DataTable 形式 (タイトル / 状態 / 媒体 PlatformBadge / 進捗 bar / chevron action)
- **`/campaigns/[slug]`** — 上半分を再構成、下半分は既存 component を `<details>詳細情報</details>` 内に集約:
  - 上: PageHeader (status badge + CTA in actions) / KpiCardsRow 4 件 (公開済み / 確認待ちゲート / 画像・図解 / 選択媒体) / LifecyclePipeline (per-campaign) / PublishReadinessBoard / ReleaseReviewLinks / NextActionSummary
  - 下: `<details>` の中に ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ExternalLinks

### GROQ 拡張

`dashboard/src/lib/groq/campaign.ts`:

- `dashboardHomeQuery.campaigns[]` に `selectedPlatformsCount` / `manualPublishingNotStartedCount` を追加（既存 `CampaignListItem` 型と整合）
- `dashboardHomeQuery` 全体に `contentIdeaTotal: count(*[_type == "contentIdea"])` / `knowledgeAssetTotal: count(*[_type in ["brandProfile", "visualStyleProfile", "promptTemplate", "prompt", "tool"]])` を追加
- `DashboardHomeData` interface に 2 field を追加

Sanity スキーマには触らず、既存 doc type に対する **count 集計のみ** 追加。

### `/publish-package/[slug]` v0.2 不変

本 batch では touch せず、boss が manually 起動して v0.2 のコピー UI + 公開済みバッジ + URL リンク動作を確認する想定（build verification では TypeScript 整合性のみ check）。

## 理由

### Phase UI-2 で shadcn を追加しなかった理由

policy 上 selective adoption は承認済だが、UI-2 で構築した 10 components はすべて **Tailwind utility class + lucide-react** だけで「読みやすい SaaS ダッシュボード」に十分到達できた:

- KpiCard / LifecyclePipeline / TodayTasksCard / LearningInsightsCard / PlatformBadge は **静的表示が中心** で、shadcn `Card` / `Badge` の primitive を入れても抽象化メリットが薄い
- ActiveCampaignsCard / RecentOutputsTable は **list / table の lightweight 表示** で、shadcn `Table` は overkill
- 唯一 shadcn が役立つのは Dialog / DropdownMenu / Tabs / Select 等の **インタラクティブ primitive** だが、UI-2 のスコープには出てこない
- UI-3 で `/publish` の write actions（URL inline edit / Reaction Notes textarea）や `/configurator` (UI-4) の form 群を実装するときに、本当に必要な primitive (Input / Select / Dialog) を 1 件ずつ追加するほうが、policy の「selective」を素直に守れる

「shadcn を入れる必要が出たら入れる」を実証的に運用するための UI-2 とした。

### Layout の幅を `max-w-[1280px]` に縮めた

docs/68 では `max-w-[1440px]` が AppShell 側、page 側で `mx-auto max-w-6xl` (1152px) としていた。再構成にあたり、grid 3-column 構成が 1152px だと若干窮屈、1440px だと中央寄せがズレて見える → `max-w-[1280px]` で安定。AppShell の `max-w-[1440px]` 内側に 1280 中央寄せの page。

### `/campaigns/[slug]` 下半分を `<details>` に集約

既存 9 セクションを縦に並べたままだと page 長すぎる + UX 上「主役（PageHeader / KPI / Lifecycle / PublishReadinessBoard / ReleaseReviewLinks / NextActionSummary）」と「補助情報（ContentIdea / BrandProfile / etc）」が同じ視覚密度になって boss の視線誘導が弱い。boss 視点の主役 6 セクションを上、技術詳細 9 セクションを `<details>詳細情報>` の中に折り畳むことで「ぱっと見の情報密度」を整理。詳細はクリック 1 つで開ける。

### LifecyclePipeline の `currentStage` derivation

ダッシュボード全体だと「OS の現在地」は 1 つには絞れないので、`pendingGates > 0 → review` / `publishingPending > 0 → draft` / `else → published` の段階推定。完璧ではないが、boss が「いま何が止まっているか」を 3 秒で読むためのフォーカス用途。

per-campaign の `currentStage` は同じヒューリスティックを使い、`visualsDone < visualsTotal → structured` まで延長して、初期段階の campaign も適切にハイライト。

### TodayTasksCard を read-only に

仕様の `onToggle` は scope 外（Sanity 書き込みなし方針）。boss はタスクを `final-human-checklist.md` 等で手書き管理しており、dashboard は「いま何が pending か」を表示するだけで足りる。

## 影響

- `/`、`/campaigns`、`/campaigns/[slug]` の見た目が大きく変わった（v0.2 → UI-2）
- 既存 17 + 6 placeholder = 23 routes はすべて動作維持
- `/publish-package/[slug]` v0.2 のコピー UI / 公開済みバッジ / URL リンク 機能は touch せず
- Sanity への新 count query 2 件追加（contentIdea / knowledge）。スキーマ変更なし
- パッケージ追加なし（lucide-react は UI-1 で導入済）
- TypeScript build clean、Sanity Studio build clean
- 既存 `WorkingPipelineStatus` / `NextActionChecklist` component は `/` から import が消えた（ファイルは残存、UI-3 で削除候補）
- 既存 `CampaignStatusCard` は `/campaigns/[slug]` から import が消えた（同上）

## 次の一手

1. boss が `cd dashboard && npm run dev` で manual check:
   - `/`: 5 KPI / LifecyclePipeline / Configurator card / ActiveCampaigns / RecentOutputs / TodayTasks / LearningInsights が表示
   - `/campaigns`: DataTable で表示、各行クリックで詳細へ
   - `/campaigns/building-hitori-media-os`: 上半分（KPI / Pipeline / Readiness / ReleaseReview / NextAction）+ 下半分 `<details>` で詳細情報
   - `/publish-package/building-hitori-media-os`: v0.2 機能無変更を確認
2. UI 細部の調整（KPI 数値 / Lifecycle currentStage / TodayTasks 項目）は boss feedback で microbatch 修正
3. 違和感なければ **Phase UI-3: Publish Package v0.3 + /publish + /outputs** に着手:
   - `/publish-package/[slug]` v0.3: `<ManualPublishCopyPanel>` で URL / reactionNotes inline edit
   - `/publish` 新規: 全 campaign 横断の publishing 状態
   - `/outputs` 新規: platform × campaign 一覧
   - **このフェーズで shadcn `Input` / `Button` / `Dialog` が必要になる見込み** — その時点で個別追加判断

並行候補（UI 系列と独立）:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 旧 component (AppNav / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard) の削除 cleanup batch
