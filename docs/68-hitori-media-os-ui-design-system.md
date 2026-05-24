# Hitori Media OS — UI Design System v1

最終更新: 2026-05-19
ステータス: Imported design spec (Phase UI-0、実装前)

## Source

本ドキュメントは boss がアップロードした UI 仕様の正式リポジトリ版です:

- 元ファイル: [docs/ui-design/000-dashbord-desing.md](ui-design/000-dashbord-desing.md)
- 整形・リポジトリ整合のため改行 / コードブロック / 補足を補ったが、設計判断は元仕様を踏襲

実装は本 docs ではなく [docs/69-dashboard-ui-redesign-implementation-plan.md](69-dashboard-ui-redesign-implementation-plan.md) の段階計画に従う。

---

## 0. Product UI Concept

Hitori Media OS は単なる投稿生成ツールではなく、以下のライフサイクルを管理する **OS** として設計する:

```
Idea → Structured → Draft → Review → Published
```

このライフサイクルは **全ページで一貫**して使う。

### UI 基本思想

```
App Shell
├─ Sidebar
├─ Topbar
└─ Page Content
   ├─ Page Header
   ├─ KPI / Summary
   ├─ Main Work Area
   └─ Right Context Panel
```

### 想定スタック（boss 提示 + 2026-05-19 policy 確定）

```
Next.js App Router
TypeScript
Tailwind CSS                          ← **Tailwind-first** が原則
shadcn/ui (selective adoption)         ← UI-2+ で必要な primitive のみ
lucide-react                           ← UI-1 で導入済
Recharts                               ← Phase UI-6 (Analytics) で要否判断
next/font (Noto Sans JP + Inter)       ← UI-1 で導入済
Sanity                                 ← 導入済
```

### Policy: Tailwind-first + shadcn/ui selective adoption（2026-05-19 確定）

boss 決定:

- **UI 実装は Tailwind-first を基本**: スタイリングは Tailwind utility class、roll-your-own component を default にする
- **shadcn/ui は selective adoption**: UI-2 (Dashboard redesign) 以降で **必要な primitive のみ** 選択導入する
- **shadcn/ui テンプレート丸ごと導入は禁止**: `npx shadcn add <component>` で個別追加し、それ以上の sweeping import は行わない
- **Hitori Media OS 固有の意味を持つ部品は wrap 必須**: shadcn primitive をそのまま page で使わず、`dashboard/src/components/common/` 配下に Hitori 用 wrapper を作って意味づけする

#### shadcn/ui 採用候補 primitive (UI-2+ で必要に応じて）

| Primitive | 想定用途 | wrapper 候補 |
|---|---|---|
| `Button` | 全 CTA / 補助アクション | `<Button>` 直、または `<PrimaryCta>` 等のラッパ |
| `Card` | KpiCard / OutputCard / WorkspaceBlock 等の土台 | `<KpiCard>` / `<OutputCard>` でラップ |
| `Badge` | StatusBadge / PlatformBadge / PublishedBadge | Hitori 用 wrapper で tone map を吸収 |
| `Input` | Search / URL / Reaction Notes 等 | `<PublishedUrlField>` 等でラップ |
| `Select` | Platform / OutputType / Tone / CTA 選択 | `<ContentIdeaSelect>` 等の意味的 wrapper |
| `Tabs` | Visual Review の candidate / 比較切替 | そのまま使用可 |
| `Dialog` | Quick Create / Confirm / 設定モーダル | そのまま使用可 |
| `DropdownMenu` | QuickCreate / UserMenu / Row actions | UI-1 の手書き実装を置換候補に |
| `Table` | DataTable (campaigns / outputs / publishing) | `<DataTable>` で wrap |
| `Tooltip` | アイコンボタンの説明 / metadata hover | そのまま使用可 |

#### 採用判断フロー

1. Phase 着手時に「この primitive は本当に必要か」を 1 件ずつ判断
2. 必要なら `npx shadcn@latest add <primitive>` で個別追加（テンプレートを全部入れない）
3. Sanity / Hitori 固有の semantic が乗る場合は `dashboard/src/components/common/` で wrap
4. wrap せず直接使ってよいのは Topbar 内の `Dialog` / `Tabs` 等、汎用 UI 要素のみ
5. 追加した primitive は devlog に記録、handoff の "Dependencies changed" 欄に書く

---

## 1. App Shell

### 1-1. `<AppShell />`

#### 役割
全ページ共通レイアウト。Sidebar、Topbar、メインコンテンツ、右パネルの土台。

#### Props

```ts
type AppShellProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  rightPanel?: React.ReactNode
  currentNav?: NavItemKey
}
```

#### レイアウト

```
width: 100vw
height: 100vh
display: grid
grid-template-columns: 280px 1fr
grid-template-rows: 64px 1fr
```

- Sidebar: left, full height
- Topbar: top, right area
- Main: scrollable

#### 実装クラス例（Tailwind）

```tsx
<div className="min-h-screen bg-slate-50 text-slate-950">
  <aside className="fixed left-0 top-0 h-screen w-70 border-r bg-white" />
  <header className="fixed left-70 right-0 top-0 h-16 border-b bg-white/90 backdrop-blur" />
  <main className="ml-70 pt-16">
    <div className="mx-auto max-w-[1440px] p-6">
      {children}
    </div>
  </main>
</div>
```

> 注: `w-70` (280px) は Tailwind default に無いので、`tailwind.config.ts` で `spacing: { 70: '17.5rem' }` を拡張するか、`w-[280px]` を直書きする。Phase UI-1 でどちらにするか決定。

### 1-2. `<Sidebar />`

#### 役割
主要ページへのナビゲーション。ユーザーが「どの工程にいるか」を常に把握できることが重要。

#### Nav Items

```ts
const navItems = [
  { key: "dashboard",    label: "ダッシュボード",         icon: Home },
  { key: "campaigns",    label: "キャンペーン",           icon: Rocket },
  { key: "configurator", label: "出力コンフィギュレーター", icon: Blocks },
  { key: "outputs",      label: "出力管理",               icon: FileText },
  { key: "publish",      label: "公開管理",               icon: Send },
  { key: "visualReview", label: "図解レビュー",           icon: Image },
  { key: "knowledge",    label: "ナレッジDB",             icon: Database },
  { key: "analytics",    label: "アナリティクス",         icon: LineChart },
  { key: "settings",     label: "設定",                   icon: Settings },
] as const
```

> 注: `icon` は `lucide-react` 前提。fallback では Unicode シンボル（`⚙` / `📊` 等）または手書き SVG で代替。

#### Props

```ts
type SidebarProps = {
  current: NavItemKey
  workspace: {
    name: string
    plan: "free" | "standard" | "pro"
    status: "normal" | "warning" | "error"
    monthlyOutputsUsed: number
    monthlyOutputsLimit: number
    storageUsedGb: number
    storageLimitGb: number
    membersUsed: number
    membersLimit: number
  }
}
```

#### 状態別

| 状態 | 表示 |
|---|---|
| active | 薄いブルー背景、アイコン/文字は primary |
| hover | slate-100 |
| normal | slate-600 |
| disabled | opacity 40%、クリック不可 |

#### 実装方針

- 選択中ページは左側に細い blue bar を出す
- アイコンサイズは `18px`
- ラベルは日本語で短く
- Sidebar は原則折りたたまない（将来的に `collapsed` 対応）

### 1-3. `<WorkspaceBlock />`

現在のワークスペース、プラン、利用量を表示。

```ts
type WorkspaceBlockProps = {
  workspaceName: string
  planLabel: string
  status: "normal" | "warning" | "error"
  outputUsage: { current: number; limit: number }
  storageUsage: { currentGb: number; limitGb: number }
  members: { current: number; limit: number }
  onUpgrade?: () => void
}
```

#### 表示例

```
スタンダードプラン
Hitori Lab ワークスペース ・ 正常
今月の出力数 72 / 300 [progress]
ストレージ使用量 18.4GB / 100GB [progress]
[プランをアップグレード]
メンバー 3 / 5
```

| status | 色 |
|---|---|
| normal | green |
| warning | amber |
| error | red |

> **boss-only mode 現状**: Phase 1 では single-user の boss のみ。`plan` / `members` フィールドは hardcoded `pro` / `1 / 1` として表示、UI 上は将来 SaaS 化の足場として残す。

### 1-4. `<Topbar />`

検索、クイック作成、通知、ユーザー設定への導線。

```ts
type TopbarProps = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  notificationsCount?: number
  user: { name: string; workspaceName: string; avatarUrl?: string }
  onQuickCreate?: () => void
}
```

#### 構成

```
[Search bar] [Quick create button] [Notification icon] [Settings icon] [User menu]
```

### 1-5. `<SearchBar />`

```ts
type SearchBarProps = {
  value: string
  placeholder?: string
  shortcutLabel?: string
  onChange: (value: string) => void
  onSubmit?: () => void
}
```

- placeholder: `検索（キャンペーン、コンテンツ、ドキュメントなど）`
- 幅: 480〜560px / 高さ: 40px
- 左に Search アイコン、右に `⌘K`
- フォーカス時に border primary

> Phase UI-1 では UI のみ、actual search 機能は Phase UI-6 で。

### 1-6. `<QuickCreateButton />`

```ts
const quickCreateItems = [
  { key: "contentIdea",    label: "コンテンツアイデア", icon: Lightbulb },
  { key: "campaign",       label: "キャンペーン",       icon: Rocket },
  { key: "output",         label: "出力",               icon: FileText },
  { key: "publishPackage", label: "公開パッケージ",     icon: Send },
  { key: "knowledge",      label: "ナレッジ",           icon: Database },
]
```

表示: `+ クイック作成 ▼`

### 1-7. `<NotificationButton />`

```ts
type NotificationButtonProps = { count: number; hasUnread: boolean }
```

| 状態 | 表示 |
|---|---|
| count 0 | バッジなし |
| count 1-9 | 赤バッジで数字 |
| count 10+ | `9+` 表示 |

### 1-8. `<UserMenu />`

```ts
type UserMenuProps = {
  user: { name: string; email?: string; avatarUrl?: string }
  workspaceName: string
}
```

メニュー項目: プロフィール / ワークスペース設定 / 請求・プラン / ログアウト

---

## 2. Dashboard

### 2-1. `<DashboardPage />`

#### ページ構成

```
PageHeader
KpiCardsRow
MainGrid
├─ ContentOutputConfiguratorCard
├─ LifecyclePipeline
├─ ActiveCampaigns
└─ RecentOutputs
RightColumn
├─ TodayTasks
├─ LearningInsights
└─ EngagementSummary
```

### 2-2. `<PageHeader />`

```ts
type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  meta?: React.ReactNode
}
```

Dashboard 表示例:

```
ダッシュボード
アイデアから出力・レビュー・公開・学習まで、すべてを一元管理します。
```

### 2-3. `<KpiCard />` / `<KpiCardsRow />`

```ts
type KpiCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    direction: "up" | "down" | "flat"
    periodLabel?: string
  }
  sparkline?: number[]
  tone?: "blue" | "purple" | "orange" | "green" | "red"
}
```

#### Dashboard 既定 KPI

```ts
const dashboardKpis = [
  { label: "コンテンツアイデア", value: 128, tone: "blue" },
  { label: "下書き",             value: 36,  tone: "purple" },
  { label: "レビュー待ち",       value: 12,  tone: "orange" },
  { label: "公開済み",           value: 84,  tone: "green" },
  { label: "ナレッジ資産",       value: 256, tone: "blue" },
]
```

#### trend direction

| direction | 表示 |
|---|---|
| up | green text + arrow up |
| down | red text + arrow down |
| flat | slate text + minus |

### 2-4. `<ContentOutputConfiguratorCard />`

ダッシュボード上で最短生成できるミニ版。フル版は専用ページ (`/configurator`) に。

```ts
type ContentOutputConfiguratorCardProps = {
  ideas: SelectOption[]
  platforms: SelectOption[]
  outputTypes: SelectOption[]
  purposes: SelectOption[]
  tones: SelectOption[]
  ctas: SelectOption[]
  value: ConfiguratorValue
  onChange: (value: ConfiguratorValue) => void
  onGenerate: () => void
  loading?: boolean
}

type ConfiguratorValue = {
  contentIdeaId?: string
  platform?: Platform
  outputType?: OutputType
  purpose?: Purpose
  tone?: Tone
  cta?: CTA
  outputLength?: OutputLength
}
```

#### UI

```
コンテンツ出力コンフィギュレーター
[元アイデア] [出力先] [出力形式]
[目的] [トーン] [CTA] [出力長さ]
[下書きを生成]
```

#### 状態別

| 状態 | 表示 |
|---|---|
| 初期 | disabled generate button |
| 入力完了 | primary button active |
| loading | ボタンに spinner + `生成中...` |
| error | card 下部に赤いエラーメッセージ |
| success | toast `下書きを作成しました` |

### 2-5. `<LifecyclePipeline />`

```ts
type LifecycleStage = {
  key: "idea" | "structured" | "draft" | "review" | "published"
  label: string
  count: number
  description?: string
  tone: "blue" | "purple" | "orange" | "amber" | "green"
}

type LifecyclePipelineProps = {
  stages: LifecycleStage[]
  currentStage?: LifecycleStage["key"]
  variant?: "horizontal" | "compact" | "funnel"
  onStageClick?: (stage: LifecycleStage["key"]) => void
}
```

#### 固定ステージ

```ts
const lifecycleStages = [
  { key: "idea",       label: "Idea",       jaLabel: "アイデア" },
  { key: "structured", label: "Structured", jaLabel: "構造化済み" },
  { key: "draft",      label: "Draft",      jaLabel: "下書き" },
  { key: "review",     label: "Review",     jaLabel: "レビュー待ち" },
  { key: "published",  label: "Published",  jaLabel: "公開済み" },
]
```

#### 用途

- Dashboard: 全体進捗
- Campaign Detail: キャンペーン単位
- Output Configurator: これから Draft を作ることを表示
- Publish Package: Published を強調
- Analytics: コンバージョンファネル

### 2-6. `<ActiveCampaignsCard />`

```ts
type CampaignSummary = {
  id: string
  title: string
  status: "planning" | "active" | "paused" | "completed"
  progress: number
  dueDate?: string
}
```

### 2-7. `<RecentOutputsTable />`

```ts
type OutputRow = {
  id: string
  title: string
  platform: Platform
  outputType: OutputType
  status: OutputStatus
  updatedAt: string
  assignee?: UserSummary
}
```

表示列: タイトル / 媒体 / 状態 / 更新日

### 2-8. `<TodayTasksCard />`

```ts
type TaskItem = {
  id: string
  title: string
  dueLabel: string
  completed: boolean
  priority?: "low" | "medium" | "high"
}
```

### 2-9. `<LearningInsightsCard />`

```ts
type LearningInsight = {
  id: string
  title: string
  description?: string
  metric?: string
  tone?: "green" | "blue" | "orange" | "purple"
}
```

---

## 3. Publish Package / 公開管理

### 3-1. `<PublishPackagePage />`

複数媒体の出力をまとめて公開するためのパッケージ管理ページ。

#### ページ構成

```
PageHeader
PublishPackageOverview
ReleaseChecklist
ManualPublishCopyPanel
PublishSchedule
ApprovalStatus
IncludedAssetsTable
RiskCheck
PostPublishMonitoring
```

### 3-2. `<PublishPackageOverview />`

```ts
type PublishPackage = {
  id: string
  title: string
  campaignTitle: string
  campaignId: string
  description: string
  objective: string
  channels: Platform[]
  status: PublishPackageStatus
}

type PublishPackageStatus =
  | "draft"
  | "ready"
  | "scheduled"
  | "published"
  | "needs_fix"
```

### 3-3. `<ManualPublishCopyPanel />`

API 自動投稿ではなく、手動公開のために各媒体用コピーと URL を扱う UI。**現段階の Hitori Media OS で特に重要**。

```ts
type ManualPublishItem = {
  id: string
  platform: Platform
  title: string
  publishText?: string
  publishUrl?: string
  status: ManualPublishStatus
  copiedAt?: string
  publishedAt?: string
  reactionNotes?: string
}

type ManualPublishStatus =
  | "pending"
  | "copied"
  | "published"
  | "skipped"
  | "needs_fix"

type ManualPublishCopyPanelProps = {
  items: ManualPublishItem[]
  onCopy: (id: string) => void
  onMarkPublished: (id: string) => void
  onUrlChange: (id: string, url: string) => void
  onReactionNotesChange: (id: string, notes: string) => void
}
```

#### UI 構成

```
媒体 / タイトル
公開用コピー [コピー]
公開URL [URL入力欄]
状態 [公開済みにする]
Reaction Notes [反応メモ入力欄]
```

#### 状態別

| status | Badge | 意味 |
|---|---|---|
| pending | 未公開 | まだ公開作業前 |
| copied | コピー済み | 手動公開用テキストをコピー済み |
| published | 公開済み | URL 登録済み |
| skipped | スキップ | 今回は公開しない |
| needs_fix | 要修正 | 公開前に修正が必要 |

> **本リポジトリの現状**: `/publish-package/[slug]` v0.2 は `<PublishedStatusBlock>` で同等の役割を担うが、URL / reactionNotes の write-back は dashboard 内で行わず、現在は manual 経由（boss が release-review markdown に手書き → `tools/sanity/reflect-publication-state.mjs`）。spec の `onUrlChange` / `onReactionNotesChange` を dashboard に導入するなら、controlled write tool の薄い wrapper として server action 経由で実装する想定。

### 3-4. `<PublishedBadge />`

```ts
type PublishedBadgeProps = {
  status: ManualPublishStatus | PublishPackageStatus
  publishedAt?: string
}
```

表示例: 公開済み / 予約済み / 未公開 / 要修正

### 3-5. `<PublishedUrlField />`

```ts
type PublishedUrlFieldProps = {
  url?: string
  editable?: boolean
  onChange?: (url: string) => void
  onCopy?: () => void
  onOpen?: () => void
}
```

#### 表示仕様

- URL 未入力: `公開URLを入力`
- URL 入力済み: 省略表示 + 外部リンクアイコン + コピーアイコン
- 不正 URL: 赤 border + `有効なURLを入力してください`

### 3-6. `<ReactionNotesField />`

```ts
type ReactionNotesFieldProps = {
  value: string
  maxLength?: number
  placeholder?: string
  onChange: (value: string) => void
}
```

#### placeholder

```
公開後の反応や気づきを記録します。例：Xからの流入が多い、図解付き投稿の保存率が高い
```

#### 仕様

- textarea
- 文字数カウント
- 自動保存表示 `保存済み`
- 将来的に Sanity `publishedOutput.performanceNotes` / `learnings` に保存

### 3-7. `<PendingPlatformsCard />`

```ts
type PendingPlatformsCardProps = {
  platforms: {
    platform: Platform
    status: ManualPublishStatus
    required: boolean
  }[]
}
```

```ts
const pendingCount = platforms.filter(p => p.status !== "published").length
```

---

## 4. Output Configurator

### 4-1. `<OutputConfiguratorPage />`

中核機能。`contentIdea` を選び、出力条件を指定し、媒体別下書きを生成する。

#### ページ構成

```
PageHeader
ConfiguratorForm
PreviewPanel
GeneratedDeliverables
RecommendedTemplates
LifecyclePreview
```

### 4-2. `<OutputConfiguratorForm />`

```ts
type OutputConfiguratorFormProps = {
  value: OutputConfiguratorFormValue
  options: OutputConfiguratorOptions
  onChange: (value: OutputConfiguratorFormValue) => void
  onGenerate: () => void
  onSaveTemplate?: () => void
  onReset?: () => void
  loading?: boolean
  errors?: Partial<Record<keyof OutputConfiguratorFormValue, string>>
}

type OutputConfiguratorFormValue = {
  contentIdeaId?: string
  rawIdea?: string
  campaignId?: string
  platform?: Platform
  outputType?: OutputType
  purpose?: Purpose
  targetAudience?: string
  tone?: Tone
  cta?: CTA
  outputLength?: OutputLength
  referencePromptId?: string
  includeDiagram?: boolean
  publishPriority?: "low" | "medium" | "high"
  reviewRequired?: boolean
  keywords?: string[]
}

type OutputConfiguratorOptions = {
  contentIdeas: SelectOption[]
  campaigns: SelectOption[]
  platforms: SelectOption[]
  outputTypes: SelectOption[]
  purposes: SelectOption[]
  tones: SelectOption[]
  ctas: SelectOption[]
  outputLengths: SelectOption[]
  prompts: SelectOption[]
}
```

### 4-3. `<ContentIdeaSelect />`

```ts
type ContentIdeaSelectProps = {
  value?: string
  options: {
    id: string
    title: string
    coreThesis?: string
    status?: ContentIdeaStatus
  }[]
  onChange: (id: string) => void
}
```

補助表示: coreThesis の 1 行プレビュー / status badge / 検索可能 select

### 4-4. Platform 型

```ts
type Platform =
  | "x"
  | "threads"
  | "note"
  | "substack"
  | "youtube"
  | "shorts"
  | "podcast"
  | "diagram"
  | "instagram"
  | "blog"

const platformLabels: Record<Platform, string> = {
  x:         "X（旧Twitter）",
  threads:   "Threads",
  note:      "note",
  substack:  "Substack",
  youtube:   "YouTube",
  shorts:    "Shorts",
  podcast:   "Podcast",
  diagram:   "図解",
  instagram: "Instagram",
  blog:      "ブログ",
}
```

### 4-5. OutputType 型

```ts
type OutputType =
  | "single_post"
  | "thread"
  | "newsletter"
  | "note_article"
  | "youtube_script"
  | "shorts_script"
  | "podcast_script"
  | "diagram_plan"
  | "carousel"
  | "blog_article"

const outputTypesByPlatform: Record<Platform, OutputType[]> = {
  x:         ["single_post", "thread"],
  threads:   ["single_post", "thread"],
  note:      ["note_article"],
  substack:  ["newsletter"],
  youtube:   ["youtube_script"],
  shorts:    ["shorts_script"],
  podcast:   ["podcast_script"],
  diagram:   ["diagram_plan"],
  instagram: ["carousel"],
  blog:      ["blog_article"],
}
```

### 4-6. Purpose 型

```ts
type Purpose =
  | "awareness"
  | "lead_generation"
  | "trust_building"
  | "sales"
  | "education"
  | "community"
  | "seo"

const purposeLabels = {
  awareness:       "認知拡大",
  lead_generation: "リード獲得",
  trust_building:  "信頼形成",
  sales:           "販売",
  education:       "教育・啓蒙",
  community:       "コミュニティ形成",
  seo:             "検索流入",
}
```

### 4-7. Tone 型

```ts
type Tone =
  | "friendly"
  | "professional"
  | "practical"
  | "analytical"
  | "storytelling"
  | "strong_opinion"
  | "educational"

const toneLabels = {
  friendly:       "フレンドリー",
  professional:   "専門的",
  practical:      "実践的",
  analytical:     "分析的",
  storytelling:   "ストーリー調",
  strong_opinion: "主張強め",
  educational:    "教材風",
}
```

### 4-8. CTA 型

```ts
type CTA =
  | "none"
  | "follow"
  | "subscribe_substack"
  | "read_blog"
  | "buy_note"
  | "book_call"
  | "download"
  | "join_waitlist"

const ctaLabels = {
  none:               "CTAなし",
  follow:             "フォローを促す",
  subscribe_substack: "Substack購読",
  read_blog:          "ブログへ誘導",
  buy_note:           "note購入",
  book_call:          "相談申し込み",
  download:           "資料ダウンロード",
  join_waitlist:      "事前登録",
}
```

### 4-9. `<OutputPreviewPanel />`

```ts
type OutputPreviewPanelProps = {
  loading?: boolean
  preview?: {
    titleCandidates: { title: string; score?: number }[]
    structurePreview: string[]
    deliverables: { label: string; count: number }[]
  }
  empty?: boolean
}
```

| 状態 | 表示 |
|---|---|
| empty | `条件を設定すると、ここに生成プレビューが表示されます` |
| loading | skeleton + `プレビュー生成中...` |
| ready | title 案、構成案、成果物 |
| error | `プレビューの生成に失敗しました` + retry |

---

## 5. Visual Review

### 5-1. `<VisualReviewPage />`

図解・カルーセル・サムネイルを確認、コメント、承認、差し戻し。

#### ページ構成

```
PageHeader
VisualFilterBar
CandidateCarousel
ImagePreview
ApprovalPanel
CommentsPanel
VersionHistory
PairedCaptionEditor
```

### 5-2. `<CandidateCarousel />`

```ts
type VisualCandidate = {
  id: string
  title: string
  thumbnailUrl: string
  version: string
  status: VisualReviewStatus
}

type CandidateCarouselProps = {
  candidates: VisualCandidate[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd?: () => void
}
```

### 5-3. `<ImagePreviewCanvas />`

```ts
type ImagePreviewCanvasProps = {
  imageUrl: string
  title?: string
  zoom: number
  comments?: VisualCommentPin[]
  onZoomChange: (zoom: number) => void
  onCommentPinClick?: (id: string) => void
}

type VisualCommentPin = {
  id: string
  x: number // 0-100
  y: number // 0-100
  number: number
  color?: "blue" | "orange" | "green" | "purple"
}
```

#### 仕様

- 中央に大きく画像表示、`object-fit: contain`
- コメントピンを絶対配置
- zoom controls: `- 100% +`
- fullscreen ボタン

### 5-4. `<VisualApprovalPanel />`

```ts
type VisualReviewStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "changes_requested"
  | "exported"

type VisualApprovalPanelProps = {
  visual: {
    id: string
    title: string
    campaignTitle?: string
    aspectRatio: string
    platform: Platform
    fileName: string
    status: VisualReviewStatus
    assignee?: UserSummary
    dueDate?: string
  }
  onApprove: () => void
  onRequestChanges: () => void
  onAddComment: () => void
  onCopyShareLink: () => void
}
```

#### アクション

```
[承認] [差し戻し] [コメントを追加] [共有リンクをコピー]
```

#### 状態別 primary action

| status | primary action |
|---|---|
| draft | レビュー開始 |
| in_review | 承認 / 差し戻し |
| approved | 書き出し |
| changes_requested | 修正を確認 |
| exported | 公開管理へ |

### 5-5. `<CommentsPanel />`

```ts
type CommentItem = {
  id: string
  pinNumber?: number
  author: UserSummary
  body: string
  createdAt: string
  resolved?: boolean
}

type CommentsPanelProps = {
  comments: CommentItem[]
  onResolve?: (id: string) => void
  onReply?: (id: string) => void
}
```

### 5-6. `<VersionHistory />`

```ts
type VersionHistoryItem = {
  id: string
  version: string
  author: UserSummary
  createdAt: string
  changes: string[]
  isLatest?: boolean
}
```

---

## 6. Design Tokens

### 6-1. Color Tokens

```ts
export const colors = {
  primary: {
    50:  "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  slate: {
    50:  "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
  success: { 50: "#F0FDF4", 100: "#DCFCE7", 500: "#22C55E", 600: "#16A34A", 700: "#15803D" },
  warning: { 50: "#FFFBEB", 100: "#FEF3C7", 500: "#F59E0B", 600: "#D97706" },
  danger:  { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444", 600: "#DC2626" },
  purple:  { 50: "#F5F3FF", 100: "#EDE9FE", 500: "#8B5CF6", 600: "#7C3AED" },
  teal:    { 50: "#F0FDFA", 100: "#CCFBF1", 500: "#14B8A6", 600: "#0D9488" },
}
```

#### 使い分け

| 用途 | 色 |
|---|---|
| Primary action | primary-600 (`#2563EB`) |
| Selected nav | primary-50 / primary-600 |
| Success | success |
| Warning / Review | warning |
| Error | danger |
| Draft | purple |
| Structured | purple / blue |
| Published | success |

> **本リポジトリでの命名**: Tailwind の `blue-*` ファミリが上記 primary と一致する（`blue-600 = #2563EB`）。custom token `primary-*` を `tailwind.config.ts` に追加するか、`blue-*` 直書きにするかは Phase UI-1 で決定。

### 6-2. Typography

```css
font-family: "Noto Sans JP", "Inter", system-ui, sans-serif;
```

#### Scale

| Token | Size | Line Height | Weight | 用途 |
|---|---|---|---|---|
| display-lg | 28px | 36px | 700 | ページタイトル |
| display-md | 24px | 32px | 700 | 重要ページタイトル |
| heading-lg | 20px | 28px | 700 | セクション大見出し |
| heading-md | 16px | 24px | 600 | カードタイトル |
| heading-sm | 14px | 20px | 600 | 小見出し |
| body-md | 14px | 20px | 400 | 通常本文 |
| body-sm | 13px | 18px | 400 | 補足本文 |
| caption | 12px | 16px | 400 | メタ情報 |
| label | 12px | 16px | 500 | フォームラベル |

#### ルール

- 日本語本文は 14px 以上を基本
- テーブル内は 13px 可
- ページタイトルは 24〜28px
- 英語ステータス `Idea / Draft` は日本語補足と併記

> **現状の dashboard**: `Geist Sans` + `Geist Mono` (next/font/google) が `app/layout.tsx` で読み込み済み。Noto Sans JP に切り替える場合は Phase UI-1 で `next/font/google` の `Noto_Sans_JP` を追加（Google Fonts なので追加パッケージは不要、ただし Web font 読込が新規発生）。boss 判断待ち。

### 6-3. Spacing

8px grid を base に。

```ts
const spacing = {
  xs:   "4px",
  sm:   "8px",
  md:   "16px",
  lg:   "24px",
  xl:   "32px",
  "2xl": "40px",
  "3xl": "48px",
}
```

#### ルール

| 要素 | 余白 |
|---|---|
| card padding | 20〜24px |
| page padding | 24px |
| section gap | 24px |
| card gap | 16px |
| form field gap | 12〜16px |
| table row height | 52〜60px |

### 6-4. Radius

```ts
const radius = {
  sm:   "6px",
  md:   "10px",
  lg:   "14px",
  xl:   "18px",
  full: "9999px",
}
```

| 要素 | radius |
|---|---|
| Button | md |
| Input | md |
| Card | lg |
| Large panel | xl |
| Badge | full |
| Avatar | full |

### 6-5. Shadow

```ts
const shadow = {
  card:     "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",
  elevated: "0 8px 24px rgba(15, 23, 42, 0.08)",
  popover:  "0 12px 32px rgba(15, 23, 42, 0.14)",
}
```

ルール: 基本カードは shadow 控えめ、hover 時に少しだけ elevated、Modal / dropdown / popover のみ強め。

### 6-6. Border

```ts
const border = {
  default: "#E2E8F0",
  muted:   "#F1F5F9",
  focus:   "#2563EB",
}
```

基本: `border: 1px solid slate-200`、focus: `ring 2px primary-200 + border primary-600`

### 6-7. Icon Rules

```
ライブラリ: lucide-react
サイズ: 16 / 18 / 20 / 24
strokeWidth: 2
```

| 用途 | size |
|---|---|
| Sidebar | 18 |
| Button | 16 |
| KPI icon | 22 |
| Empty state | 32〜40 |
| Pipeline | 22〜28 |

#### ルール

- アイコン単体では意味が弱い場合、必ず日本語ラベルを添える
- 色は状態に合わせる
- プラットフォームアイコンは専用色を使ってよいが控えめに

> **本リポジトリでの fallback**: `lucide-react` 未承認の間は Unicode シンボル + emoji + ローカル SVG (`dashboard/public/icons/`) で代替。承認後に lucide-react を導入し、placeholder を段階的に置換。

### 6-8. Badge Rules

```ts
type StatusBadgeProps = {
  status: StatusKey
  size?: "sm" | "md"
  variant?: "soft" | "solid" | "outline"
}

type StatusKey =
  | "idea"
  | "structured"
  | "draft"
  | "review"
  | "approved"
  | "ready"
  | "scheduled"
  | "published"
  | "needs_fix"
  | "archived"

const statusLabels = {
  idea:       "アイデア",
  structured: "構造化済み",
  draft:      "下書き",
  review:     "レビュー待ち",
  approved:   "承認済み",
  ready:      "公開準備OK",
  scheduled:  "予約済み",
  published:  "公開済み",
  needs_fix:  "要修正",
  archived:   "アーカイブ",
}
```

| status | 色 |
|---|---|
| idea | blue |
| structured | purple |
| draft | orange |
| review | amber |
| approved | green |
| ready | green |
| scheduled | blue |
| published | green |
| needs_fix | red |
| archived | slate |

### 6-9. Button Rules

```ts
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg" | "icon"
```

| variant | 用途 |
|---|---|
| primary | 主要アクション。生成、公開、保存 |
| secondary | 補助アクション |
| outline | 設定、共有、フィルター |
| ghost | テーブル行アクション |
| danger | 削除、差し戻し |

#### 文言ルール

- 動詞で終える
- 何が起こるか明確にする
- `OK` / `実行` のような抽象語を避ける

**良い例**:
```
下書きを生成
公開パッケージを作成
公開済みにする
コメントを追加
画像を書き出し
```

**避ける例**:
```
実行
OK
処理開始
```

---

## 7. 共通型定義

```ts
export type Platform =
  | "x" | "threads" | "note" | "substack"
  | "youtube" | "shorts" | "podcast"
  | "diagram" | "instagram" | "blog"

export type OutputStatus =
  | "idea" | "structured" | "draft" | "review"
  | "approved" | "ready" | "scheduled" | "published"
  | "needs_fix" | "archived"

export type UserSummary = {
  id: string
  name: string
  avatarUrl?: string
}

export type SelectOption = {
  label: string
  value: string
  description?: string
  icon?: React.ComponentType
}
```

---

## 8. 実装ディレクトリ案（boss 提示）

```
src/
  app/
    dashboard/
      page.tsx
    campaigns/[id]/
      page.tsx
    configurator/
      page.tsx
    outputs/
      page.tsx
    publish/
      page.tsx
    visual-review/
      page.tsx
    knowledge/
      page.tsx
    analytics/
      page.tsx
  components/
    app-shell/
      app-shell.tsx
      sidebar.tsx
      topbar.tsx
      workspace-block.tsx
      quick-create-button.tsx
      user-menu.tsx
    common/
      page-header.tsx
      kpi-card.tsx
      status-badge.tsx
      platform-icon.tsx
      lifecycle-pipeline.tsx
      search-bar.tsx
      empty-state.tsx
      loading-state.tsx
      error-state.tsx
    dashboard/
      content-output-configurator-card.tsx
      active-campaigns-card.tsx
      recent-outputs-table.tsx
      today-tasks-card.tsx
      learning-insights-card.tsx
    configurator/
      output-configurator-form.tsx
      content-idea-select.tsx
      output-preview-panel.tsx
      generated-deliverables-card.tsx
    publish/
      publish-package-overview.tsx
      manual-publish-copy-panel.tsx
      published-url-field.tsx
      reaction-notes-field.tsx
      pending-platforms-card.tsx
      included-assets-table.tsx
    visual-review/
      candidate-carousel.tsx
      image-preview-canvas.tsx
      visual-approval-panel.tsx
      comments-panel.tsx
      version-history.tsx
      paired-caption-editor.tsx
  lib/
    labels.ts
    status.ts
    platforms.ts
    mock-data.ts
  styles/
    tokens.ts
```

> **本リポジトリへの adaptation**: 上記は単一 `src/` を想定しているが、本リポジトリは monorepo 風で **`dashboard/src/...`** が正解パス。`docs/69` の §3 でフル mapping を提示する。

---

## 9. 実装優先順位（boss 提示）

```
1. AppShell
2. Sidebar / Topbar
3. StatusBadge / PlatformIcon / KPI Card
4. LifecyclePipeline
5. DashboardPage
6. OutputConfiguratorPage
7. PublishPackagePage
8. VisualReviewPage
```

最初の MVP では **Dashboard / Output Configurator / Publish Package** の 3 画面があれば Hitori Media OS の価値がかなり伝わる。

---

## 10. デザイン方針サマリ（boss 提示）

```
日本語UI
白ベース
primary blue: #2563EB
Noto Sans JP + Inter
8px spacing grid
rounded cards
subtle shadow
Material Design 寄りの SaaS dashboard
Notion / Linear のような整理感
ただし日本語ユーザー向けにラベルを明確にする
```

中心概念: `Idea → Structured → Draft → Review → Published` を全体で共通利用。最初は Sanity 接続なしで `mock-data.ts` で表示。

---

## 11. Current Repo Compatibility Notes

本仕様を current repo で実装する際に **既に存在する / 衝突する要素**:

### 11-1. 既存ルート

| 既存 route | 仕様の target route | 対応 |
|---|---|---|
| `/` | `/dashboard` | redirect or keep `/` as dashboard alias (Phase UI-1 判断) |
| `/campaigns` | `/campaigns` | 一致、redesign のみ |
| `/campaigns/[slug]` | `/campaigns/[id]` | param 名を `[slug]` のまま運用、`id` は内部表現 |
| `/visual-assets` | `/visual-review` | リブランド + 統合 |
| `/visual-assets/[assetId]/candidates` | `/visual-review/[id]` の内側 | 統合 |
| `/publish-package/[slug]` | `/publish/[id]` | 一致（route 名は `/publish-package/[slug]` のまま、Phase UI-3 で `/publish` への alias を検討） |
| `/publish-packages` | `/publish` の一覧モード | 統合 |
| `/human-review-gates` | （ダッシュボード内 Pending Reviews） | 統合 or 残す |
| `/activity-log` | （ダッシュボード内 Recent activity）or `/settings` | 残す |
| `/diagnostics` | `/settings` 配下 | 統合候補 |

### 11-2. 既存コンポーネント（保護対象）

| 既存 | 仕様の新コンポーネント | 移行方針 |
|---|---|---|
| `AppNav` | `AppShell` + `Sidebar` + `Topbar` | Phase UI-1 で置換、AppNav は deprecate して残す |
| `CopyButton` | `<ManualPublishCopyPanel>` 内の copy 機能 | そのまま再利用（fallback 設計が良い） |
| `publishPackageReader` | `<ManualPublishCopyPanel>` の data source | そのまま再利用 |
| `StatusBadge`（既存） | `StatusBadge`（仕様） | tone map を仕様の StatusKey に揃える |
| `EmptyState` | `EmptyState` | そのまま継続 |
| `FilePathBlock` | （仕様に無し、dev detail 用） | そのまま継続 |
| `WorkingPipelineStatus` | `LifecyclePipeline` | 移行、static → dynamic |
| `NextActionChecklist` | `TodayTasks` | 移行 |
| `ReleaseReviewLinks` | `<IncludedAssetsTable>` 系 | そのまま継続 |
| `PublishReadinessBoard` | `<PublishPackageOverview>` | 移行 |
| `CandidateGrid` / `CandidateCard` | `CandidateCarousel` + `ImagePreviewCanvas` | 移行 |
| `LocalModeBanner` | AppShell 上部 banner | そのまま再利用 |
| `PublishedStatusBlock` (v0.2 inline) | `<ManualPublishCopyPanel>` 内表示 | 統合 |
| `PublishedBadge` (v0.2 inline) | `<PublishedBadge>` | 移行 |

### 11-3. 既存 GROQ helper

- `dashboard/src/lib/groq/campaign.ts` — `campaignDetailBySlugQuery` / `dashboardHomeQuery` 等は **保護対象**
- `dashboard/src/lib/groq/publishPackage.ts` (v0.2 で新規) — `manualPublishingStatus` fetch、そのまま再利用可

### 11-4. パッケージ追加の判断点（2026-05-19 確定）

| パッケージ | 用途 | 状態 | 対応 |
|---|---|---|---|
| `shadcn/ui` | Button / Card / Badge / Input / Select / Tabs / Dialog / DropdownMenu / Table / Tooltip 等 | ✅ **Selective adoption 承認**（UI-2+） | 必要な primitive のみ個別追加。テンプレート丸ごと禁止。固有 semantic は `components/common/` で wrap |
| `lucide-react` | アイコン全般 | ✅ **承認 / UI-1 で導入済** | nav / topbar / placeholder で使用中 |
| `Recharts` | Analytics chart | ⏳ Phase UI-6 まで決定保留 | UI-6 着手時に再判断、HTML/CSS bar/sparkline で代替可能 |
| `Noto Sans JP` (next/font/google) | 日本語フォント | ✅ **承認 / UI-1 で導入済** | `next/font/google` 経由 |
| `Inter` (next/font/google) | 英字フォント | ✅ **承認 / UI-1 で導入済** | 同上 |

**実装方針 (Tailwind-first + shadcn/ui selective adoption)**:

- **基本は Tailwind-first**: スタイリングは utility class、roll-your-own component が default
- **shadcn は phase ごとに必要 primitive のみ個別追加**: `npx shadcn@latest add button` のように 1 件ずつ
- **テンプレート丸ごと import は禁止**: `npx shadcn add login-form` 等の sweeping import は行わない
- **Hitori 固有 semantic は wrap**: `<KpiCard>` / `<PublishedBadge>` / `<ContentIdeaSelect>` 等は `dashboard/src/components/common/` 配下に置き、shadcn primitive を内側で使う
- **wrap せず直接使ってよい primitive**: 汎用 UI 要素のみ (`Dialog` / `Tabs` / `Tooltip` 等)
- **追加した primitive は devlog 必須**: handoff の "Dependencies changed" にも記録

### 11-5. 現行 Tailwind 設定

- `tailwind.config.ts` (現状): 標準設定 + `geist` font variable
- 本仕様で必要な拡張:
  - `spacing.70: '17.5rem'` (sidebar 280px)
  - custom `primary` color tokens (or `blue` 直書き)
  - shadow tokens (`shadow-card` / `shadow-elevated` / `shadow-popover`)
  - radius tokens (`rounded-lg-os: 14px` 等、または既存 `rounded-lg` で代用)

Phase UI-1 で最小限の `tailwind.config.ts` 拡張のみ実施。

### 11-6. Sanity スキーマとの紐付け

仕様の field 名は Sanity スキーマと一致しないものがある:

| 仕様 (UI) | Sanity 実体 | 備考 |
|---|---|---|
| `contentIdeaId` | `contentIdea._id` | 一致 |
| `Platform` enum | `manualPublishingStatus[].platform` (string) | 値域が広い、Phase UI-4 で確認 |
| `OutputStatus` | `manualPublishingStatus[].state` + 他複数 field の状態 | 集約ロジック必要 |
| `ManualPublishStatus` | 同上、`status` vs `state` の混在 | helper で正規化 |
| `PublishPackage` | 現状 Sanity に該当 type 無し | スキーマ追加 or campaignPlan に統合 |

Sanity スキーマ変更は本フェーズの **scope 外**。campaignPlan 既存フィールドを最大活用する。

---

## 12. Productization Notes

- **Boss-only mode (Phase 1)**: 単一ユーザー、Workspace 関連 UI は固定値、auth / billing 機構なし
- **Future SaaS mode (Phase 2+)**: Workspace / Plan / Members を実機能化。本 spec の `WorkspaceBlockProps` がそのまま使える
- **Read-only first**: v0.2 まで全 dashboard が read-only。`<ManualPublishCopyPanel>` の write actions (`onUrlChange` / `onMarkPublished` / `onReactionNotesChange`) は Phase UI-3 で server action 経由 controlled write tool 化
- **Manual publishing first**: 全 publish 行動は manual、auto-post / platform API は意図的に scope 外（CLAUDE.md と一致）
- **Content Output Configurator が中核 monetizable feature**: 教材 / SaaS 化文脈で「structured contentIdea → AI 派生」が製品価値。Phase UI-4 の優先度が高い
- **Developer details hidden behind `<details>` panels**: `_id` / `path` / `transactionId` / `bytes` 等は折り畳む（current v0.2 既施行）
- **Japanese UI first**: nav / heading / button / badge 全て日本語、識別子は `<code>` 内

---

## Appendix A — Diff vs Previous Iteration

本 docs は前バッチで作成した「モックアップから逆算した design system」を、boss の正式アップロード版で **置き換え**たもの。主な変更点:

| 項目 | 前バッチ | 本バッチ（uploaded spec 準拠） |
|---|---|---|
| Primary color | `sky-600` (#0284c7) | `primary-600` / `blue-600` (#2563EB) |
| Sidebar 幅 | 240px (`w-60`) | 280px (`w-70` or `w-[280px]`) |
| 最大幅 | `max-w-6xl` (1152px) | `max-w-[1440px]` |
| Font | Geist Sans only | Noto Sans JP + Inter（読込判断保留） |
| Icon | パッケージ不使用 | lucide-react 前提（fallback あり） |
| Chart | HTML/CSS のみ | Recharts 前提（fallback あり） |
| Lifecycle | 5-stage (Idea→Structured→Draft→Review→Published) を明示 | 同（強化） |
| Workspace block | 単純表示 | Plan / 利用量 / メンバー数まで含む完全版 |
| QuickCreate | なし | 5 項目 dropdown あり |
| Notification | なし | バッジ付き |
| ManualPublishCopyPanel | 静的表示のみ | URL 入力 / Reaction Notes 入力 / 状態遷移を含む完全版 |

**前バッチの設計判断は破棄**し、本 docs を Phase UI-1 以降の唯一の design source とする。

---

End of UI Design System v1.
