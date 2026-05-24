**Claude Code / Codex にそのまま実装指示として渡せる粒度** で、Hitori Media OS のUI仕様を定義します。

---

# Hitori Media OS UI実装仕様 v1

## 0. 前提アーキテクチャ

想定スタックは以下が相性良いです。

```
Next.js App RouterTypeScriptTailwind CSSshadcn/uilucide-reactRechartsSanity
```

UIの基本思想は、

```
App Shell  ├─ Sidebar  ├─ Topbar  └─ Page ContentPage Content  ├─ Page Header  ├─ KPI / Summary  ├─ Main Work Area  └─ Right Context Panel
```

です。

Hitori Media OS は単なる投稿生成ツールではなく、以下の流れを管理するOSです。

```
Idea → Structured → Draft → Review → Published
```

このライフサイクルは、全ページで一貫して使います。

---

# 1. App Shell仕様

## 1-1. AppShell

### 役割

全ページ共通のレイアウト。
Sidebar、Topbar、メインコンテンツ、右パネルの土台。

### コンポーネント名

```
<AppShell />
```

### Props案

```
type AppShellProps = {  children: React.ReactNode  sidebar?: React.ReactNode  topbar?: React.ReactNode  rightPanel?: React.ReactNode  currentNav?: NavItemKey}
```

### レイアウト仕様

```
width: 100vwheight: 100vhdisplay: gridgrid-template-columns: 280px 1frgrid-template-rows: 64px 1fr
```

```
Sidebar: left, full heightTopbar: top, right areaMain: scrollable
```

### 実装クラス例

```
<div className="min-h-screen bg-slate-50 text-slate-950">  <aside className="fixed left-0 top-0 h-screen w-70 border-r bg-white" />  <header className="fixed left-70 right-0 top-0 h-16 border-b bg-white/90 backdrop-blur" />  <main className="ml-70 pt-16">    <div className="mx-auto max-w-[1440px] p-6">      {children}    </div>  </main></div>
```

---

## 1-2. Sidebar

### 役割

主要ページへのナビゲーション。
Hitori Media OSでは、ユーザーが「どの工程にいるか」を常に把握できることが重要。

### コンポーネント名

```
<Sidebar />
```

### Nav Items

```
const navItems = [  { key: "dashboard", label: "ダッシュボード", icon: Home },  { key: "campaigns", label: "キャンペーン", icon: Rocket },  { key: "configurator", label: "出力コンフィギュレーター", icon: Blocks },  { key: "outputs", label: "出力管理", icon: FileText },  { key: "publish", label: "公開管理", icon: Send },  { key: "visualReview", label: "図解レビュー", icon: Image },  { key: "knowledge", label: "ナレッジDB", icon: Database },  { key: "analytics", label: "アナリティクス", icon: LineChart },  { key: "settings", label: "設定", icon: Settings },] as const
```

### Props案

```
type SidebarProps = {  current: NavItemKey  workspace: {    name: string    plan: "free" | "standard" | "pro"    status: "normal" | "warning" | "error"    monthlyOutputsUsed: number    monthlyOutputsLimit: number    storageUsedGb: number    storageLimitGb: number    membersUsed: number    membersLimit: number  }}
```

### 状態別表示

|状態|表示|
|---|---|
|active|薄いブルー背景、アイコン/文字はprimary|
|hover|slate-100|
|normal|slate-600|
|disabled|opacity 40%、クリック不可|

### 実装方針

- 選択中ページは左側に細いblue barを出しても良い。
- アイコンサイズは `18px`。
- ラベルは日本語で短く。
- Sidebarは原則折りたたまない。将来的に `collapsed` 対応。

---

## 1-3. WorkspaceBlock

### 役割

現在のワークスペース、プラン、利用量を表示。

### コンポーネント名

```
<WorkspaceBlock />
```

### Props案

```
type WorkspaceBlockProps = {  workspaceName: string  planLabel: string  status: "normal" | "warning" | "error"  outputUsage: {    current: number    limit: number  }  storageUsage: {    currentGb: number    limitGb: number  }  members: {    current: number    limit: number  }  onUpgrade?: () => void}
```

### 表示例

```
スタンダードプランHitori Lab ワークスペース ・ 正常今月の出力数 72 / 300[progress]ストレージ使用量 18.4GB / 100GB[progress][プランをアップグレード]メンバー 3 / 5
```

### 状態

|status|色|
|---|---|
|normal|green|
|warning|amber|
|error|red|

---

## 1-4. Topbar

### 役割

検索、クイック作成、通知、ユーザー設定への導線。

### コンポーネント名

```
<Topbar />
```

### Props案

```
type TopbarProps = {  searchValue?: string  onSearchChange?: (value: string) => void  notificationsCount?: number  user: {    name: string    workspaceName: string    avatarUrl?: string  }  onQuickCreate?: () => void}
```

### 構成

```
Search barQuick create buttonNotification iconSettings iconUser menu
```

---

## 1-5. SearchBar

### コンポーネント名

```
<SearchBar />
```

### Props案

```
type SearchBarProps = {  value: string  placeholder?: string  shortcutLabel?: string  onChange: (value: string) => void  onSubmit?: () => void}
```

### プレースホルダー

```
検索（キャンペーン、コンテンツ、ドキュメントなど）
```

### 仕様

- 幅: 480〜560px
- 高さ: 40px
- 左にSearchアイコン
- 右に `⌘K`
- フォーカス時にborder primary

---

## 1-6. QuickCreate

### コンポーネント名

```
<QuickCreateButton />
```

### メニュー項目

```
const quickCreateItems = [  { key: "contentIdea", label: "コンテンツアイデア", icon: Lightbulb },  { key: "campaign", label: "キャンペーン", icon: Rocket },  { key: "output", label: "出力", icon: FileText },  { key: "publishPackage", label: "公開パッケージ", icon: Send },  { key: "knowledge", label: "ナレッジ", icon: Database },]
```

### 表示

```
+ クイック作成 ▼
```

---

## 1-7. Notification

### コンポーネント名

```
<NotificationButton />
```

### Props案

```
type NotificationButtonProps = {  count: number  hasUnread: boolean}
```

### 状態

|状態|表示|
|---|---|
|count 0|バッジなし|
|count 1-9|赤バッジで数字|
|count 10+|`9+` 表示|

---

## 1-8. UserMenu

### コンポーネント名

```
<UserMenu />
```

### Props案

```
type UserMenuProps = {  user: {    name: string    email?: string    avatarUrl?: string  }  workspaceName: string}
```

### メニュー項目

```
プロフィールワークスペース設定請求・プランログアウト
```

---

# 2. Dashboard仕様

## 2-1. DashboardPage

### コンポーネント名

```
<DashboardPage />
```

### ページ構成

```
PageHeaderKpiCardsRowMainGrid  ├─ ContentOutputConfiguratorCard  ├─ LifecyclePipeline  ├─ ActiveCampaigns  ├─ RecentOutputsRightColumn  ├─ TodayTasks  ├─ LearningInsights  └─ EngagementSummary
```

---

## 2-2. PageHeader

### Props案

```
type PageHeaderProps = {  title: string  description?: string  actions?: React.ReactNode  meta?: React.ReactNode}
```

### Dashboard表示例

```
ダッシュボードアイデアから出力・レビュー・公開・学習まで、すべてを一元管理します。
```

---

## 2-3. KPI Cards

### コンポーネント名

```
<KpiCard /><KpiCardsRow />
```

### Props案

```
type KpiCardProps = {  label: string  value: string | number  icon: LucideIcon  trend?: {    value: string    direction: "up" | "down" | "flat"    periodLabel?: string  }  sparkline?: number[]  tone?: "blue" | "purple" | "orange" | "green" | "red"}
```

### Dashboard KPI

```
const dashboardKpis = [  { label: "コンテンツアイデア", value: 128, tone: "blue" },  { label: "下書き", value: 36, tone: "purple" },  { label: "レビュー待ち", value: 12, tone: "orange" },  { label: "公開済み", value: 84, tone: "green" },  { label: "ナレッジ資産", value: 256, tone: "blue" },]
```

### 状態別

|direction|表示|
|---|---|
|up|green text + arrow up|
|down|red text + arrow down|
|flat|slate text + minus|

---

## 2-4. Dashboard用 Content Output Configurator

### 役割

ダッシュボード上で最短生成できるミニ版。
フル版は専用ページに配置。

### コンポーネント名

```
<ContentOutputConfiguratorCard />
```

### Props案

```
type ContentOutputConfiguratorCardProps = {  ideas: SelectOption[]  platforms: SelectOption[]  outputTypes: SelectOption[]  purposes: SelectOption[]  tones: SelectOption[]  ctas: SelectOption[]  value: ConfiguratorValue  onChange: (value: ConfiguratorValue) => void  onGenerate: () => void  loading?: boolean}
```

```
type ConfiguratorValue = {  contentIdeaId?: string  platform?: Platform  outputType?: OutputType  purpose?: Purpose  tone?: Tone  cta?: CTA  outputLength?: OutputLength}
```

### UI

```
コンテンツ出力コンフィギュレーター[元アイデア] [出力先] [出力形式][目的] [トーン] [CTA] [出力長さ][下書きを生成]
```

### 状態別表示

|状態|表示|
|---|---|
|初期|disabled generate button|
|入力完了|primary button active|
|loading|ボタンにspinner + `生成中...`|
|error|card下部に赤いエラーメッセージ|
|success|toast `下書きを作成しました`|

---

## 2-5. Lifecycle Pipeline

### コンポーネント名

```
<LifecyclePipeline />
```

### Props案

```
type LifecycleStage = {  key: "idea" | "structured" | "draft" | "review" | "published"  label: string  count: number  description?: string  tone: "blue" | "purple" | "orange" | "amber" | "green"}type LifecyclePipelineProps = {  stages: LifecycleStage[]  currentStage?: LifecycleStage["key"]  variant?: "horizontal" | "compact" | "funnel"  onStageClick?: (stage: LifecycleStage["key"]) => void}
```

### 固定ステージ

```
const lifecycleStages = [  { key: "idea", label: "Idea", jaLabel: "アイデア" },  { key: "structured", label: "Structured", jaLabel: "構造化済み" },  { key: "draft", label: "Draft", jaLabel: "下書き" },  { key: "review", label: "Review", jaLabel: "レビュー待ち" },  { key: "published", label: "Published", jaLabel: "公開済み" },]
```

### 用途

- Dashboard: 全体進捗
- Campaign Detail: キャンペーン単位
- Output Configurator: これからDraftを作ることを表示
- Publish Package: Publishedを強調
- Analytics: コンバージョンファネルとして表示

---

## 2-6. Active Campaigns

### コンポーネント名

```
<ActiveCampaignsCard />
```

### Props案

```
type CampaignSummary = {  id: string  title: string  status: "planning" | "active" | "paused" | "completed"  progress: number  dueDate?: string}type ActiveCampaignsCardProps = {  campaigns: CampaignSummary[]  onViewAll?: () => void}
```

### 表示

```
AI活用術シリーズ 進行中 76%習慣化の科学 進行中 52%副業戦略2025 計画中 20%
```

---

## 2-7. Recent Outputs

### コンポーネント名

```
<RecentOutputsTable />
```

### Props案

```
type OutputRow = {  id: string  title: string  platform: Platform  outputType: OutputType  status: OutputStatus  updatedAt: string  assignee?: UserSummary}type RecentOutputsTableProps = {  outputs: OutputRow[]  onRowClick?: (id: string) => void}
```

### 表示列

```
タイトル / 媒体 / 状態 / 更新日
```

---

## 2-8. Today Tasks

### コンポーネント名

```
<TodayTasksCard />
```

### Props案

```
type TaskItem = {  id: string  title: string  dueLabel: string  completed: boolean  priority?: "low" | "medium" | "high"}type TodayTasksCardProps = {  tasks: TaskItem[]  onToggle: (id: string) => void}
```

### 表示

```
□ レビュー依頼：AI時代の発信戦略 今日 10:00☑ 下書き作成：新NISAの活用法 今日 12:00
```

---

## 2-9. Learning Insights

### コンポーネント名

```
<LearningInsightsCard />
```

### Props案

```
type LearningInsight = {  id: string  title: string  description?: string  metric?: string  tone?: "green" | "blue" | "orange" | "purple"}type LearningInsightsCardProps = {  insights: LearningInsight[]}
```

### 表示例

```
よく読まれているテーマ「習慣化 × テクノロジー」関連が好調です平均エンゲージメント率 4.2%（前月比 +28%）
```

---

# 3. Publish Package / 公開管理仕様

## 3-1. PublishPackagePage

### 役割

複数媒体の出力をまとめて公開するためのパッケージ管理ページ。

### コンポーネント名

```
<PublishPackagePage />
```

### ページ構成

```
PageHeaderPublishPackageOverviewReleaseChecklistManualPublishCopyPanelPublishScheduleApprovalStatusIncludedAssetsTableRiskCheckPostPublishMonitoring
```

---

## 3-2. PublishPackageOverview

### Props案

```
type PublishPackage = {  id: string  title: string  campaignTitle: string  campaignId: string  description: string  objective: string  channels: Platform[]  status: PublishPackageStatus}
```

```
type PublishPackageStatus =  | "draft"  | "ready"  | "scheduled"  | "published"  | "needs_fix"
```

### 表示

```
AI活用術2025パッケージ公開準備OKキャンペーン: AI活用術2025説明: AIを業務で活用するための実践ノウハウをまとめたマルチチャネル公開パッケージ公開目的: リード獲得・ブランド認知含まれるチャネル: X / note / Substack / YouTube / 図解
```

---

## 3-3. Manual Publish Copy UI

### 役割

API自動投稿ではなく、手動公開のために各媒体用コピーとURLを扱うUI。
現段階のHitori Media OSではかなり重要。

### コンポーネント名

```
<ManualPublishCopyPanel />
```

### Props案

```
type ManualPublishItem = {  id: string  platform: Platform  title: string  publishText?: string  publishUrl?: string  status: ManualPublishStatus  copiedAt?: string  publishedAt?: string  reactionNotes?: string}type ManualPublishStatus =  | "pending"  | "copied"  | "published"  | "skipped"  | "needs_fix"
```

```
type ManualPublishCopyPanelProps = {  items: ManualPublishItem[]  onCopy: (id: string) => void  onMarkPublished: (id: string) => void  onUrlChange: (id: string, url: string) => void  onReactionNotesChange: (id: string, notes: string) => void}
```

### UI構成

```
媒体タイトル公開用コピー[コピー]公開URL[URL入力欄]状態[公開済みにする]Reaction Notes[反応メモ入力欄]
```

### 状態別表示

|status|Badge|意味|
|---|---|---|
|pending|未公開|まだ公開作業前|
|copied|コピー済み|手動公開用テキストをコピー済み|
|published|公開済み|URL登録済み|
|skipped|スキップ|今回は公開しない|
|needs_fix|要修正|公開前に修正が必要|

---

## 3-4. Published Badge

### コンポーネント名

```
<PublishedBadge />
```

### Props案

```
type PublishedBadgeProps = {  status: ManualPublishStatus | PublishPackageStatus  publishedAt?: string}
```

### 表示例

```
公開済み予約済み未公開要修正
```

---

## 3-5. URL Display

### コンポーネント名

```
<PublishedUrlField />
```

### Props案

```
type PublishedUrlFieldProps = {  url?: string  editable?: boolean  onChange?: (url: string) => void  onCopy?: () => void  onOpen?: () => void}
```

### 表示仕様

- URL未入力: `公開URLを入力`
- URL入力済み: 省略表示 + 外部リンクアイコン + コピーアイコン
- 不正URL: 赤border + `有効なURLを入力してください`

---

## 3-6. Reaction Notes入力

### コンポーネント名

```
<ReactionNotesField />
```

### Props案

```
type ReactionNotesFieldProps = {  value: string  maxLength?: number  placeholder?: string  onChange: (value: string) => void}
```

### プレースホルダー

```
公開後の反応や気づきを記録します。例：Xからの流入が多い、図解付き投稿の保存率が高い
```

### 仕様

- textarea
- 文字数カウント
- 自動保存表示 `保存済み`
- 将来的にSanity `publishedOutput.performanceNotes` / `learnings` に保存

---

## 3-7. Pending Platform表示

### コンポーネント名

```
<PendingPlatformsCard />
```

### Props案

```
type PendingPlatformsCardProps = {  platforms: {    platform: Platform    status: ManualPublishStatus    required: boolean  }[]}
```

### 表示

```
未公開の媒体□ X□ Substack☑ note☑ 図解
```

### ロジック

```
const pendingCount = platforms.filter(p => p.status !== "published").length
```

---

# 4. Output Configurator仕様

## 4-1. OutputConfiguratorPage

### 役割

中核機能。
`contentIdea` を選び、出力条件を指定し、媒体別下書きを生成する。

### コンポーネント名

```
<OutputConfiguratorPage />
```

### ページ構成

```
PageHeaderConfiguratorFormPreviewPanelGeneratedDeliverablesRecommendedTemplatesLifecyclePreview
```

---

## 4-2. ConfiguratorForm

### Props案

```
type OutputConfiguratorFormProps = {  value: OutputConfiguratorFormValue  options: OutputConfiguratorOptions  onChange: (value: OutputConfiguratorFormValue) => void  onGenerate: () => void  onSaveTemplate?: () => void  onReset?: () => void  loading?: boolean  errors?: Partial<Record<keyof OutputConfiguratorFormValue, string>>}
```

```
type OutputConfiguratorFormValue = {  contentIdeaId?: string  rawIdea?: string  campaignId?: string  platform?: Platform  outputType?: OutputType  purpose?: Purpose  targetAudience?: string  tone?: Tone  cta?: CTA  outputLength?: OutputLength  referencePromptId?: string  includeDiagram?: boolean  publishPriority?: "low" | "medium" | "high"  reviewRequired?: boolean  keywords?: string[]}
```

```
type OutputConfiguratorOptions = {  contentIdeas: SelectOption[]  campaigns: SelectOption[]  platforms: SelectOption[]  outputTypes: SelectOption[]  purposes: SelectOption[]  tones: SelectOption[]  ctas: SelectOption[]  outputLengths: SelectOption[]  prompts: SelectOption[]}
```

---

## 4-3. contentIdea選択

### コンポーネント名

```
<ContentIdeaSelect />
```

### Props案

```
type ContentIdeaSelectProps = {  value?: string  options: {    id: string    title: string    coreThesis?: string    status?: ContentIdeaStatus  }[]  onChange: (id: string) => void}
```

### 表示

```
元アイデア *[AI時代の個人発信戦略 ▼]
```

### 補助表示

- coreThesisの1行プレビュー
- status badge
- 検索可能select

---

## 4-4. platform選択

### 型

```
type Platform =  | "x"  | "threads"  | "note"  | "substack"  | "youtube"  | "shorts"  | "podcast"  | "diagram"  | "instagram"  | "blog"
```

### 表示ラベル

```
const platformLabels: Record<Platform, string> = {  x: "X（旧Twitter）",  threads: "Threads",  note: "note",  substack: "Substack",  youtube: "YouTube",  shorts: "Shorts",  podcast: "Podcast",  diagram: "図解",  instagram: "Instagram",  blog: "ブログ",}
```

---

## 4-5. outputType選択

### 型

```
type OutputType =  | "single_post"  | "thread"  | "newsletter"  | "note_article"  | "youtube_script"  | "shorts_script"  | "podcast_script"  | "diagram_plan"  | "carousel"  | "blog_article"
```

### platform依存の候補

```
const outputTypesByPlatform: Record<Platform, OutputType[]> = {  x: ["single_post", "thread"],  threads: ["single_post", "thread"],  note: ["note_article"],  substack: ["newsletter"],  youtube: ["youtube_script"],  shorts: ["shorts_script"],  podcast: ["podcast_script"],  diagram: ["diagram_plan"],  instagram: ["carousel"],  blog: ["blog_article"],}
```

---

## 4-6. purpose

### 型

```
type Purpose =  | "awareness"  | "lead_generation"  | "trust_building"  | "sales"  | "education"  | "community"  | "seo"
```

### ラベル

```
const purposeLabels = {  awareness: "認知拡大",  lead_generation: "リード獲得",  trust_building: "信頼形成",  sales: "販売",  education: "教育・啓蒙",  community: "コミュニティ形成",  seo: "検索流入",}
```

---

## 4-7. tone

### 型

```
type Tone =  | "friendly"  | "professional"  | "practical"  | "analytical"  | "storytelling"  | "strong_opinion"  | "educational"
```

### ラベル

```
const toneLabels = {  friendly: "フレンドリー",  professional: "専門的",  practical: "実践的",  analytical: "分析的",  storytelling: "ストーリー調",  strong_opinion: "主張強め",  educational: "教材風",}
```

---

## 4-8. CTA

### 型

```
type CTA =  | "none"  | "follow"  | "subscribe_substack"  | "read_blog"  | "buy_note"  | "book_call"  | "download"  | "join_waitlist"
```

### ラベル

```
const ctaLabels = {  none: "CTAなし",  follow: "フォローを促す",  subscribe_substack: "Substack購読",  read_blog: "ブログへ誘導",  buy_note: "note購入",  book_call: "相談申し込み",  download: "資料ダウンロード",  join_waitlist: "事前登録",}
```

---

## 4-9. Preview Panel

### コンポーネント名

```
<OutputPreviewPanel />
```

### Props案

```
type OutputPreviewPanelProps = {  loading?: boolean  preview?: {    titleCandidates: {      title: string      score?: number    }[]    structurePreview: string[]    deliverables: {      label: string      count: number    }[]  }  empty?: boolean}
```

### 状態別

|状態|表示|
|---|---|
|empty|`条件を設定すると、ここに生成プレビューが表示されます`|
|loading|skeleton + `プレビュー生成中...`|
|ready|title案、構成案、成果物|
|error|`プレビューの生成に失敗しました` + retry|

---

# 5. Visual Review仕様

## 5-1. VisualReviewPage

### 役割

図解・カルーセル・サムネイルを確認、コメント、承認、差し戻しする。

### ページ構成

```
PageHeaderVisualFilterBarCandidateCarouselImagePreviewApprovalPanelCommentsPanelVersionHistoryPairedCaptionEditor
```

---

## 5-2. Candidate Carousel

### コンポーネント名

```
<CandidateCarousel />
```

### Props案

```
type VisualCandidate = {  id: string  title: string  thumbnailUrl: string  version: string  status: VisualReviewStatus}type CandidateCarouselProps = {  candidates: VisualCandidate[]  selectedId: string  onSelect: (id: string) => void  onAdd?: () => void}
```

### 表示

```
[1. オープニング] [2. 問題提起] [3. サイクル図解 selected] [4. 実践ステップ] [+ 追加]
```

---

## 5-3. Image Preview

### コンポーネント名

```
<ImagePreviewCanvas />
```

### Props案

```
type ImagePreviewCanvasProps = {  imageUrl: string  title?: string  zoom: number  comments?: VisualCommentPin[]  onZoomChange: (zoom: number) => void  onCommentPinClick?: (id: string) => void}
```

```
type VisualCommentPin = {  id: string  x: number // 0-100  y: number // 0-100  number: number  color?: "blue" | "orange" | "green" | "purple"}
```

### 仕様

- 中央に大きく画像表示
- `object-fit: contain`
- コメントピンを絶対配置
- zoom controls: `- 100% +`
- fullscreenボタン

---

## 5-4. Approval Panel

### コンポーネント名

```
<VisualApprovalPanel />
```

### Props案

```
type VisualReviewStatus =  | "draft"  | "in_review"  | "approved"  | "changes_requested"  | "exported"type VisualApprovalPanelProps = {  visual: {    id: string    title: string    campaignTitle?: string    aspectRatio: string    platform: Platform    fileName: string    status: VisualReviewStatus    assignee?: UserSummary    dueDate?: string  }  onApprove: () => void  onRequestChanges: () => void  onAddComment: () => void  onCopyShareLink: () => void}
```

### アクション

```
[承認][差し戻し][コメントを追加][共有リンクをコピー]
```

### 状態別ボタン

|status|primary action|
|---|---|
|draft|レビュー開始|
|in_review|承認 / 差し戻し|
|approved|書き出し|
|changes_requested|修正を確認|
|exported|公開管理へ|

---

## 5-5. Comments

### コンポーネント名

```
<CommentsPanel />
```

### Props案

```
type CommentItem = {  id: string  pinNumber?: number  author: UserSummary  body: string  createdAt: string  resolved?: boolean}type CommentsPanelProps = {  comments: CommentItem[]  onResolve?: (id: string) => void  onReply?: (id: string) => void}
```

---

## 5-6. Version History

### コンポーネント名

```
<VersionHistory />
```

### Props案

```
type VersionHistoryItem = {  id: string  version: string  author: UserSummary  createdAt: string  changes: string[]  isLatest?: boolean}type VersionHistoryProps = {  versions: VersionHistoryItem[]  onSelectVersion?: (id: string) => void}
```

### 表示例

```
v1.2 最新 ・ テキスト調整、アイコン太さ変更v1.1 ・ 色味調整、レイアウト微調整v1.0 ・ 初稿アップロード
```

---

# 6. Design Tokens

## 6-1. Color Tokens

### Tailwind用

```
export const colors = {  primary: {    50: "#EFF6FF",    100: "#DBEAFE",    200: "#BFDBFE",    300: "#93C5FD",    400: "#60A5FA",    500: "#3B82F6",    600: "#2563EB",    700: "#1D4ED8",    800: "#1E40AF",    900: "#1E3A8A",  },  slate: {    50: "#F8FAFC",    100: "#F1F5F9",    200: "#E2E8F0",    300: "#CBD5E1",    400: "#94A3B8",    500: "#64748B",    600: "#475569",    700: "#334155",    800: "#1E293B",    900: "#0F172A",  },  success: {    50: "#F0FDF4",    100: "#DCFCE7",    500: "#22C55E",    600: "#16A34A",    700: "#15803D",  },  warning: {    50: "#FFFBEB",    100: "#FEF3C7",    500: "#F59E0B",    600: "#D97706",  },  danger: {    50: "#FEF2F2",    100: "#FEE2E2",    500: "#EF4444",    600: "#DC2626",  },  purple: {    50: "#F5F3FF",    100: "#EDE9FE",    500: "#8B5CF6",    600: "#7C3AED",  },  teal: {    50: "#F0FDFA",    100: "#CCFBF1",    500: "#14B8A6",    600: "#0D9488",  },}
```

### 使い分け

|用途|色|
|---|---|
|Primary action|primary-600|
|Selected nav|primary-50 / primary-600|
|Success|success|
|Warning / Review|warning|
|Error|danger|
|Draft|purple|
|Structured|purple / blue|
|Published|success|

---

## 6-2. Typography

### フォント

```
font-family: "Noto Sans JP", "Inter", system-ui, sans-serif;
```

### Scale

|Token|Size|Line Height|Weight|用途|
|---|---|---|---|---|
|display-lg|28px|36px|700|ページタイトル|
|display-md|24px|32px|700|重要ページタイトル|
|heading-lg|20px|28px|700|セクション大見出し|
|heading-md|16px|24px|600|カードタイトル|
|heading-sm|14px|20px|600|小見出し|
|body-md|14px|20px|400|通常本文|
|body-sm|13px|18px|400|補足本文|
|caption|12px|16px|400|メタ情報|
|label|12px|16px|500|フォームラベル|

### ルール

- 日本語本文は14px以上を基本。
- テーブル内は13px可。
- ページタイトルは24〜28px。
- 英語ステータス `Idea / Draft` は日本語補足と併記。

---

## 6-3. Spacing

### Base

```
8px grid
```

### Tokens

```
const spacing = {  xs: "4px",  sm: "8px",  md: "16px",  lg: "24px",  xl: "32px",  "2xl": "40px",  "3xl": "48px",}
```

### ルール

|要素|余白|
|---|---|
|card padding|20〜24px|
|page padding|24px|
|section gap|24px|
|card gap|16px|
|form field gap|12〜16px|
|table row height|52〜60px|

---

## 6-4. Radius

```
const radius = {  sm: "6px",  md: "10px",  lg: "14px",  xl: "18px",  full: "9999px",}
```

### 用途

|要素|radius|
|---|---|
|Button|md|
|Input|md|
|Card|lg|
|Large panel|xl|
|Badge|full|
|Avatar|full|

---

## 6-5. Shadow

```
const shadow = {  card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",  elevated: "0 8px 24px rgba(15, 23, 42, 0.08)",  popover: "0 12px 32px rgba(15, 23, 42, 0.14)",}
```

### ルール

- 基本カードはshadow控えめ。
- hover時に少しだけelevated。
- Modal / dropdown / popoverのみ強め。

---

## 6-6. Border

```
const border = {  default: "#E2E8F0",  muted: "#F1F5F9",  focus: "#2563EB",}
```

### 基本

```
border: 1px solid slate-200focus: ring 2px primary-200 + border primary-600
```

---

## 6-7. Icon Rules

### 基本

```
ライブラリ: lucide-reactサイズ: 16 / 18 / 20 / 24strokeWidth: 2
```

### 用途

|用途|size|
|---|---|
|Sidebar|18|
|Button|16|
|KPI icon|22|
|Empty state|32〜40|
|Pipeline|22〜28|

### ルール

- アイコン単体では意味が弱い場合、必ず日本語ラベルを添える。
- 色は状態に合わせる。
- プラットフォームアイコンは専用色を使ってよいが、控えめに。

---

## 6-8. Badge Rules

### コンポーネント名

```
<StatusBadge />
```

### Props案

```
type StatusBadgeProps = {  status: StatusKey  size?: "sm" | "md"  variant?: "soft" | "solid" | "outline"}
```

### ステータス一覧

```
type StatusKey =  | "idea"  | "structured"  | "draft"  | "review"  | "approved"  | "ready"  | "scheduled"  | "published"  | "needs_fix"  | "archived"
```

### ラベル

```
const statusLabels = {  idea: "アイデア",  structured: "構造化済み",  draft: "下書き",  review: "レビュー待ち",  approved: "承認済み",  ready: "公開準備OK",  scheduled: "予約済み",  published: "公開済み",  needs_fix: "要修正",  archived: "アーカイブ",}
```

### 色

|status|色|
|---|---|
|idea|blue|
|structured|purple|
|draft|orange|
|review|amber|
|approved|green|
|ready|green|
|scheduled|blue|
|published|green|
|needs_fix|red|
|archived|slate|

---

## 6-9. Button Rules

### Button Variants

```
type ButtonVariant =  | "primary"  | "secondary"  | "outline"  | "ghost"  | "danger"
```

### サイズ

```
type ButtonSize = "sm" | "md" | "lg" | "icon"
```

### 仕様

|variant|用途|
|---|---|
|primary|主要アクション。生成、公開、保存|
|secondary|補助アクション|
|outline|設定、共有、フィルター|
|ghost|テーブル行アクション|
|danger|削除、差し戻し|

### 文言ルール

- 動詞で終える。
- 何が起こるか明確にする。
- `OK` や `実行` のような抽象語を避ける。

良い例:

```
下書きを生成公開パッケージを作成公開済みにするコメントを追加画像を書き出し
```

避ける例:

```
実行OK処理開始
```

---

# 7. 共通型定義案

## Platform

```
export type Platform =  | "x"  | "threads"  | "note"  | "substack"  | "youtube"  | "shorts"  | "podcast"  | "diagram"  | "instagram"  | "blog"
```

## OutputStatus

```
export type OutputStatus =  | "idea"  | "structured"  | "draft"  | "review"  | "approved"  | "ready"  | "scheduled"  | "published"  | "needs_fix"  | "archived"
```

## UserSummary

```
export type UserSummary = {  id: string  name: string  avatarUrl?: string}
```

## SelectOption

```
export type SelectOption = {  label: string  value: string  description?: string  icon?: React.ComponentType}
```

---

# 8. 実装ディレクトリ案

```
src/  app/    dashboard/      page.tsx    campaigns/[id]/      page.tsx    configurator/      page.tsx    outputs/      page.tsx    publish/      page.tsx    visual-review/      page.tsx    knowledge/      page.tsx    analytics/      page.tsx  components/    app-shell/      app-shell.tsx      sidebar.tsx      topbar.tsx      workspace-block.tsx      quick-create-button.tsx      user-menu.tsx    common/      page-header.tsx      kpi-card.tsx      status-badge.tsx      platform-icon.tsx      lifecycle-pipeline.tsx      search-bar.tsx      empty-state.tsx      loading-state.tsx      error-state.tsx    dashboard/      content-output-configurator-card.tsx      active-campaigns-card.tsx      recent-outputs-table.tsx      today-tasks-card.tsx      learning-insights-card.tsx    configurator/      output-configurator-form.tsx      content-idea-select.tsx      output-preview-panel.tsx      generated-deliverables-card.tsx    publish/      publish-package-overview.tsx      manual-publish-copy-panel.tsx      published-url-field.tsx      reaction-notes-field.tsx      pending-platforms-card.tsx      included-assets-table.tsx    visual-review/      candidate-carousel.tsx      image-preview-canvas.tsx      visual-approval-panel.tsx      comments-panel.tsx      version-history.tsx      paired-caption-editor.tsx  lib/    labels.ts    status.ts    platforms.ts    mock-data.ts  styles/    tokens.ts
```

---

# 9. 実装優先順位

最短でプロダクト感を出すなら、この順番です。

```
1. AppShell2. Sidebar / Topbar3. StatusBadge / PlatformIcon / KPI Card4. LifecyclePipeline5. DashboardPage6. OutputConfiguratorPage7. PublishPackagePage8. VisualReviewPage
```

特に最初のMVPでは、

```
DashboardOutput ConfiguratorPublish Package
```

の3画面があれば、Hitori Media OSの価値がかなり伝わります。

---

# 10. Claude Codeへの実装指示テンプレ

そのまま投げるなら、こうです。

```
Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui + lucide-react で、Hitori Media OS のUIプロトタイプを実装してください。まず以下を作成してください。1. 共通AppShell- Sidebar- Topbar- WorkspaceBlock- QuickCreateButton- UserMenu2. 共通コンポーネント- PageHeader- KpiCard- StatusBadge- PlatformIcon- LifecyclePipeline- SearchBar- EmptyState- LoadingState- ErrorState3. ページ- /dashboard- /configurator- /publish- /visual-reviewデザイン方針:- 日本語UI- 白ベース- primary blue: #2563EB- Noto Sans JP + Inter- 8px spacing grid- rounded cards- subtle shadow- Material Design寄りのSaaS dashboard- Notion / Linear のような整理感- ただし日本語ユーザー向けにラベルを明確にするHitori Media OSの中心概念は、Idea → Structured → Draft → Review → Publishedです。このLifecyclePipelineを全体で共通利用してください。まずはSanity接続なしで、mock-data.ts のモックデータで表示してください。
```

これでClaude Code / Codexに渡せる実装仕様として使えます。