# Campaign Detail Fidelity Spec

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 route: `/campaigns/[slug]`
依存: docs/68 / docs/69 / docs/handoff/0141 (UI-2 で再構成済) / docs/handoff/0143 (UI-2.5 共有 component 更新済)

## Source materials

- **Ideal**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (2).png`
- **Current**: コードベース `dashboard/src/app/campaigns/[slug]/page.tsx` から推論 (UI-2 + UI-2.5 共有 component 更新が反映済)。実機 screenshot は未取得

---

## 1. Page Structure Diff

### 1-1. Current structure (post UI-2.5)

```
[PageHeader: title + coreThesis description + status badge + 公開パッケージを開く CTA + meta (slug/type/mode/auto)]
[KpiCardsRow (4): 公開済み / 確認待ちゲート / 画像・図解 / 選択媒体]
[LifecyclePipeline (per-campaign, 5-stage)]
[PublishReadinessBoard]
[ReleaseReviewLinks]
[NextActionSummary]
[<details>詳細情報</details>:
  ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList /
  VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks /
  ManualPublishingStatusList / ExternalLinks
]
```

### 1-2. Ideal structure (13_02_42 (2).png)

```
[PageHeader: title 「AI活用術シリーズ」 + status badge + breadcrumb + 公開準備ボード button + 公開パッケージを開く CTA]
[2-col upper:
  Left (~70%):
    [HorizontalStatRow: 4-5 metric tiles (例: アイデア / 構造化 / 下書き / 公開) with lifecycle pipeline 風]
    [Lifecycle row: アイデア → 構造化 → 下書き → レビュー → 公開 with stage counts (5 chips)]
    [Campaign Schedule strip / Timeline horizontal]
  Right (~30%):
    [PublishReadinessScore: 大きな数字 (82) + circular progress + 媒体内訳]
    [LifecyclePipeline mini view or Latest Activity]
]
[2-col middle:
  Left (~70%):
    [DataTable: 公開予定一覧 - 8 columns (媒体 / タイトル / ステータス / 担当 / 公開予定日 / actions)]
  Right (~30%):
    [カレンダー mini]
    [次のアクション list]
]
[Bottom row 2-col:
  AI summary / Learning + Recent Activity timeline
]
```

### 1-3. Missing sections

| ideal にあるのに current にない | 内容 |
|---|---|
| **HorizontalStatRow / 4-5 metric tiles** | 現状 KpiCardsRow(4) はあるが、ideal はもっと dense / tightly grouped |
| **公開準備スコア card with circular progress** | 82 のような単一スコア + 円 progress + 媒体内訳 (X/note/Substack/Threads 等の dot 表示) |
| **公開予定一覧 DataTable** | 現状 `<details>` 内の `ManualPublishingStatusList`、ideal は dashboard 主役 |
| **キャンペーンスケジュール / Timeline** | カレンダー or 横長 timeline。current にない |
| **AI summary / Latest Activity timeline** | 公開後の reaction まとめや最近の更新を時系列で |
| **Breadcrumb** | `キャンペーン > AI活用術シリーズ` 等 |
| **公開準備ボード button** | header 横に「公開準備ボード」ボタン (緑系) |

### 1-4. Wrong sections

| 現在にあるが ideal の主役と合わない | 判定 |
|---|---|
| **`<details>詳細情報>` 9 sections 集約** | ideal は主役と詳細の分け方が違う。詳細を全部 `<details>` 1 つに押し込むのではなく、主要 section (公開予定一覧 / アクティビティ) を可視化、補助情報 (ContentIdea / BrandProfile / 等) は右サイドバーまたは別 tab |
| **ReleaseReviewLinks をこの主役配置** | 補助情報、`<details>` 内へ |
| **NextActionSummary が中段** | 右サイドバーの「次のアクション」list 化が ideal |
| **PublishReadinessBoard 単独 section** | 公開準備スコア card に統合 (circular progress + 媒体内訳) |

### 1-5. Reorder needs

- `KpiCardsRow` を 5 metric に拡張 (アイデア / 下書き / レビュー / 公開済み / 視聴数 など)、または **horizontal lifecycle stage row** に切替
- `LifecyclePipeline` → `KpiCardsRow` の直下に
- 右列に **PublishReadinessScore + 次のアクション + Recent Activity timeline** を縦並び
- 中段 left に **公開予定一覧 DataTable** を主役配置
- 補助情報を右サイドバーの sticky panel or `<details>` 内に分離

---

## 2. Component Diff

| Component | 現在 | 目標 (ideal) | 判定 | Likely file |
|---|---|---|---|---|
| PageHeader | title + description + status badge + 公開パッケージ CTA | + **Breadcrumb** + **公開準備ボード button** + actions 整理 | **modify** (P0) | `common/PageHeader.tsx` (Breadcrumb 対応) |
| Breadcrumb (新) | なし | キャンペーン > {title} | **add** (P1) | 新規 `common/Breadcrumb.tsx` |
| KpiCardsRow | 4 metric | 4-5 metric、ideal はもっと density 高い (compact 横並び) | **modify** | `common/KpiCard.tsx` (compact variant) |
| LifecyclePipeline | per-campaign 5 stage | 同等 | **keep** | `common/LifecyclePipeline.tsx` |
| PublishReadinessScore (新) | なし | 単一スコア 82 + circular progress + 媒体内訳 dots | **add** (P0) | 新規 `campaign/PublishReadinessScore.tsx` |
| PublishReadinessBoard | hardcoded 4-platform readiness 表 | (PublishReadinessScore に統合 or 補助情報内へ) | **replace** (P1) | 既存 `PublishReadinessBoard.tsx` |
| PublishingSchedule (新) | なし | DataTable 公開予定一覧 (媒体 / タイトル / ステータス / 担当 / 公開予定日) | **add** (P0) | 新規 `campaign/PublishingScheduleTable.tsx` |
| CampaignCalendar (新) | なし | 小型カレンダー or timeline | **add** (P2) | 新規 `campaign/CampaignCalendar.tsx` |
| NextActionList (新) | NextActionSummary (横 actions) | 右列縦並び list | **modify/replace** (P1) | 既存 `NextActionSummary.tsx` を縦 list に |
| RecentActivityTimeline (新) | なし | 時系列 entry list | **add** (P2) | 新規 `campaign/RecentActivityTimeline.tsx` |
| AISummary (新) | なし | AI 生成の campaign summary + learning | **add** (P2) | 新規 `campaign/AISummaryCard.tsx`、Phase UI-6 |
| ReleaseReviewLinks | 主役配置 | 補助情報内へ移動 | **modify** | 既存 |
| `<details>詳細情報>` | 9 section 集約 | 分割: 主役 (公開予定 / Activity) と補助 (ContentIdea / Brand / Visual / Prompt 等) で分離 | **modify** (P1) | `page.tsx` の構造変更 |
| Existing components (ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ExternalLinks) | `<details>` 内縦並び | Right sidebar tabs or `<details>` で個別開閉 | **keep / restructure** | 各既存 |

---

## 3. Visual Fidelity Checklist (measurable)

### Page Header

- [ ] Breadcrumb: `キャンペーン > {campaign.title}` (`text-xs text-slate-500`、`/`/`>` separator)
- [ ] Title `text-2xl font-semibold text-slate-900`
- [ ] Status badge inline、`tone` 別
- [ ] **「公開準備ボード」** button (slate-outline、ghost variant) header 右
- [ ] **「公開パッケージを開く」** CTA (`bg-emerald-600`) header 右、primary
- [ ] meta line: `slug` / `type` / `mode` / `auto` を `<code>` 群で

### Stat row / Lifecycle

- [ ] 4-5 metric (公開済み / 確認待ちゲート / 画像・図解 / 選択媒体 / 視聴数?) horizontal row
- [ ] LifecyclePipeline 5 stage horizontal、各 stage に count + lifecycle tone bg + chevron
- [ ] currentStage が ring-2 + CURRENT chip

### Right column: PublishReadinessScore

- [ ] 大型 score 数字 (`text-4xl tabular-nums`、例: 82)
- [ ] Circular progress SVG (radius ~40px)、tone 色
- [ ] 媒体内訳: X / Threads / note / Substack の small dots、状態 (✓ / ⏳) で着色
- [ ] subtitle: 「{N}/4 媒体公開済み」

### Middle row left: PublishingScheduleTable

- [ ] DataTable header: 媒体 / タイトル / ステータス / 担当 / 公開予定日 / actions
- [ ] 各行 hover: `bg-slate-50`
- [ ] platform 列: `<PlatformBadge>` + name
- [ ] status 列: `<StatusBadge>` (tone 別)
- [ ] 公開予定日: `2026-05-19 09:38 JST` 形式、tabular-nums
- [ ] action 列: ChevronRight + `/publish-package/[slug]` link

### Middle row right: Calendar / Next Action

- [ ] Calendar (任意 P2): 月表示 mini calendar、公開済み日に dot
- [ ] **次のアクション list** (P1): 縦並び 5-6 行、checkbox 風 icon + title + due

### Bottom: AI Summary / Recent Activity

- [ ] (P2) AI summary card: campaign の coreThesis + learning summary
- [ ] (P2) Recent activity timeline: 時系列 entry list、最大 10 件

### 補助情報 (`<details>` or sub-tabs)

- [ ] ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ExternalLinks がそれぞれ独立に開閉 (`<details>` × N or shadcn Tabs 1 つ)

### Sidebar / Topbar (AppShell 共通)

- [ ] Sidebar の「キャンペーン」が active highlight
- [ ] Topbar ReadOnlyPill 表示

### Layout container

- [ ] `<main className="mx-auto max-w-[1280px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] 2-col grid `lg:grid-cols-[2fr_1fr]` (左 main / 右 sidebar)
- [ ] 各 card `rounded-lg border border-slate-200 bg-white p-5 shadow-sm`

---

## 4. Implementation Order

### P0 (Campaign Detail fidelity に必須)

- [ ] **PageHeader に Breadcrumb + 公開準備ボード button 追加**
- [ ] **PublishReadinessScore card 新規** (右列に circular progress + 媒体内訳)
- [ ] **PublishingScheduleTable 新規** (中段 left の主役)
- [ ] **2-col layout** (左 main 70% / 右 sidebar 30%)
- [ ] PublishReadinessBoard を score card に統合 (or 補助内へ移動)

### P1 (重要な polish)

- [ ] **NextActionSummary → NextActionList** (縦並び list 化、右列)
- [ ] **Breadcrumb 共通 component 作成** (`common/Breadcrumb.tsx`)
- [ ] **`<details>` 集約 → tabs 分割 or 個別 `<details>`**
- [ ] ReleaseReviewLinks を補助情報内へ
- [ ] KpiCardsRow を compact variant に (smaller padding)

### P2 (後段 polish)

- [ ] **CampaignCalendar** (mini calendar SVG)
- [ ] **RecentActivityTimeline** (Phase UI-6 の activity log データと統合)
- [ ] **AISummaryCard** (Phase UI-4 / UI-6 で AI 集計)
- [ ] PublishingScheduleTable で **inline edit** (Phase UI-3 の write actions と統合)

---

## 5. Files Likely Affected

### 新規 (P0/P1)

| File | 内容 |
|---|---|
| `dashboard/src/components/common/Breadcrumb.tsx` | parent / current ペア |
| `dashboard/src/components/campaign/PublishReadinessScore.tsx` | 大型 score + circular SVG + 媒体内訳 |
| `dashboard/src/components/campaign/PublishingScheduleTable.tsx` | manualPublishingStatus を DataTable で |
| `dashboard/src/components/campaign/NextActionList.tsx` | NextActionSummary を縦 list 化 |

### 更新 (P0/P1)

| File | 想定変更 |
|---|---|
| `dashboard/src/components/common/PageHeader.tsx` | `breadcrumb?` prop 追加 |
| `dashboard/src/app/campaigns/[slug]/page.tsx` | 2-col layout 再構成、新 component 統合 |
| `dashboard/src/components/PublishReadinessBoard.tsx` | score card に統合 or 補助情報内へ |
| `dashboard/src/components/NextActionSummary.tsx` | NextActionList ベースに refactor |

### 新規 (P2)

- `dashboard/src/components/campaign/CampaignCalendar.tsx`
- `dashboard/src/components/campaign/RecentActivityTimeline.tsx`
- `dashboard/src/components/campaign/AISummaryCard.tsx`

### Data sources

- 既存: `campaignDetailBySlugQuery` で `manualPublishingStatus` / `humanReviewGates` / `visualAssetDetails` / `publishPackagePaths` / `sourceContentIdea` / `brandProfile` 等は取得済
- 追加不要: PublishingScheduleTable / PublishReadinessScore は既存データから derive 可能
- 必要追加 (Phase UI-6): RecentActivityTimeline 用の activity log query

---

## 6. Compatibility / Risk

- **PublishReadinessBoard 統合**: 現 component は building-hitori-media-os hardcoded、score card 化すると campaign 動的になる。boss はまだ 1 campaign のみ運用中、UI-2.5 で hardcoded 値を docs/handoff に明記済 (廃止前提)
- **共有 component 再利用**: `KpiCard` / `LifecyclePipeline` / `StatusBadge` / `PlatformBadge` は変更不要、Dashboard と同じ tone で揃う
- **既存 9 component (ContentIdea / Brand 等)**: 既に build clean、再配置時に props は変更不要
- **`<details>` を tabs に変える場合**: shadcn `Tabs` 導入候補 (`npx shadcn add tabs`)、selective adoption policy 準拠で 1 件追加判断

---

## Out of scope (本 spec の範囲外)

- `/publish-package/[slug]` v0.2 動作 (touch しない)
- AppShell / Sidebar / Topbar (UI-1/UI-2.5 完成済)
- Sanity schema 変更
- write actions (Phase UI-3+)
- Engagement / Analytics 集計 (Phase UI-6)
