# Visual Review Fidelity Spec

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 routes:
- `/visual-assets` (list — 画像・図解素材一覧)
- `/visual-assets/[assetId]` (detail — 単一 visualAssetPlan)
- `/visual-assets/[assetId]/candidates` (candidate grid — inbox v00N 比較)

依存: docs/68 (design system) / docs/69 (Phase UI plan) / docs/handoff/0152 (UI-fidelity-5 完了後の design tone)

---

## Source materials

- **Ideal**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png`
- **Current routes**:
  - `dashboard/src/app/visual-assets/page.tsx` (319 行、ReadOnlyBanner + 6 SummaryCard + bucket-grouped table + Visual Register 説明)
  - `dashboard/src/app/visual-assets/[assetId]/page.tsx` (122 行、VisualAssetHeader + 2 deferred-action button + Reference section)
  - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (211 行、breadcrumb + VisualAssetHeader + CandidateGrid + Prompt context dl + Review rubric dl)
- **Reference docs**:
  - docs/68 §4 (color tone) / §5 (Visual Review §5-3)
  - docs/69 Phase UI plan
  - docs/handoff/0152 (latest after UI-fidelity-5 + configurator runtime fix)
- **Existing visual-review components** (`dashboard/src/components/visual-review/`):
  - CandidateCard / CandidateGrid / CandidatePreview / CandidateStatusBadge
  - DeferredActionButton / EmptyCandidateState / LocalModeBanner / VisualAssetHeader
- **Existing API routes** (read-only):
  - `/api/asset-thumb` (final asset 用、`assets/visuals/` 配下)
  - `/api/visual-review/inbox` (inbox listing)
  - `/api/visual-review/candidate-image` (inbox candidate 画像 stream)
  - `/api/visual-review/review-manifest` (campaign-level manifest)
  - `/api/visual-review/assets/[assetId]/candidates` (asset-scoped candidate bundle)

---

## 0. Page concept

Visual Review は「**生成された候補画像を、複数案 (v001 / v002 / v003) で並べて、人間が承認 / 再生成 / 保留を判断する**」専用 surface。Hitori Media OS では:

1. Codex CLI / ChatGPT で **inbox** に候補画像 (`assets/inbox/generated/<campaign>/<asset>/v00N.png`) を生成
2. 同じフォルダに `prompt.md` (生成プロンプト + frontmatter) と `review.md` (rubric + 自己評価) が並ぶ
3. campaign root に `review-manifest.json` (登録済み候補の `finalAssetPath` / `patchPath` を index)
4. dashboard の `/visual-assets` で全体把握 → `/visual-assets/[assetId]` で単一 asset の状態確認 → `/candidates` で v00N を比較
5. 承認は Visual Register (`http://localhost:3334` / `npm run visual:register`) で実施、`assets/visuals/...` に copy + `patches/visual-assets/...` JSON 生成。dashboard は **読み取り専用** (Phase 2A)
6. 承認後の `localAssetPath` が `visualAssetPlan` doc に反映、status enum (saved → reviewed → approved → packaged → published) が進む

理想 UI (13_02_43 (6).png) は「**1 候補をフォーカスして big preview + side metadata + rubric checklist で見せる review console**」。現在の dashboard は機能はあるが tone が一世代古く、Phase UI-fidelity-1〜5 で確立した design tone (`rounded-lg border-slate-200 bg-white p-5 shadow-sm` / `KpiCard` / `PlatformBadge` / `StatusBadge` / `LifecyclePipeline`) と未整合。

### Visual Review と他 route の役割分担

| route | 役割 |
|---|---|
| `/visual-assets` | 全 visualAssetPlan の一覧 + 状態 grouping、検索 / フィルタの入口 |
| `/visual-assets/[assetId]` | 単一 asset の全体像 (plan + brief + prompt + 最新候補 + 関連 campaign) |
| `/visual-assets/[assetId]/candidates` | v00N 候補の比較 + rubric 自己評価 + 採用判断の起点 |
| `/publish-package/[slug]` | 公開時に Visual Asset を取り出す消費側 (touch なし) |
| `/campaigns/[slug]` | キャンペーン軸の visual asset 概況 (`visualAssetDetails`、touch なし) |

---

## 1. Page Structure Diff

### 1-1. `/visual-assets` — Current structure

```
[ReadOnlyBanner (Phase UI-1 で既に存在を確認)]
[<header> Title「画像・図解素材」+ description with 合計件数]
[6 SummaryCard row: 合計 / 完了 / 今回は保留 / 保存待ち / 作業中 / 計画中]
[LocalFsRoutes banner (emerald 有効 / amber 無効)]
[6 セクション (bucket-grouped table):
  - 保存待ち
  - 作業中
  - 計画中 / 生成前
  - 完了
  - 今回は保留
  - その他 (empty なら skip)
  各セクションは VisualAssetTable: thumbnail / 役割 / 媒体 / 種別 / 状態 / Content Idea / 更新 / 候補リンク
]
[「承認作業は Visual Register で」説明セクション]
```

### 1-1. `/visual-assets` — Ideal structure (13_02_43 (6).png 準拠 + design tone 揃え)

```
[Breadcrumb: ダッシュボード > 図解レビュー]
[PageHeader:
  Title「図解レビュー」(現「画像・図解素材」から rename)
  Description: 「図解・カルーセル・サムネイルなど生成素材のレビュー。」
  Actions:
    - フィルタを保存 (outline、Phase 2B placeholder)
    - 新しい候補を追加 (primary blue、Visual Register への deep link)
]
[FilterBar (h-9 select 3 + sort + chip count):
  - ビジュアル種別 (assetType select: hero / inline / hook / supporting / 図解 / カルーセル / その他)
  - カテゴリ (targetPlatform select: x / note / substack / threads / youtube / shorts / podcast / shared)
  - ステータス (bucket select: 保存待ち / 作業中 / 計画中 / 完了 / 今回は保留)
  - 並び替え (更新日 desc / asc / 状態順 / 媒体順)
  - 検索 input (slug / title 部分一致)
]
[KPI breakdown row (5 KpiCard):
  - 合計 (Image, slate tone)
  - 完了 (CheckCircle2, emerald)
  - 保存待ち (Clock, amber)
  - 作業中 (Loader, blue)
  - 今回は保留 (Archive, zinc)
]
[Asset card grid (3-col on lg、2-col md、1-col sm):
  各 card は visualAssetPlan 1 件:
    - 上部: 64x96 thumbnail (final asset or latest inbox candidate)
    - middle: title + roleJa (assetRoleJa) / slug (code)
    - badges row: PlatformBadge + assetType + StatusBadge
    - メタ: aspectRatio / updatedAt JST
    - footer: 「候補を見る」link + ChevronRight
]
[Empty state (current EmptyState 改): dataset 未投入時]
[Visual Register CTA card (1 件、現セクションを縮約):
  「承認 / 登録は Visual Register で実行 (http://localhost:3334)」
  npm run visual:register のコードブロック
]
```

### 1-2. `/visual-assets/[assetId]` — Current structure

```
[ReadOnlyBanner]
[LocalModeBanner]
[VisualAssetHeader (assetId + campaignSlug + assetSlug + plan)]
[(plan == null の場合) rose-200 error card]
[Candidate review section: View candidates → button + 2 deferred buttons]
[Reference section: brief / image prompt / inbox folder / expected final path]
```

### 1-2. `/visual-assets/[assetId]` — Ideal structure

```
[Breadcrumb: 図解レビュー > <slug>]
[PageHeader: Title <plan.title or slug> + Description「<assetType> · <platform> · <aspectRatio>」+ Actions:
  - 候補一覧へ (outline、to /candidates)
  - 公開パッケージで見る (outline、to /publish-package/<campaignSlug>) ※存在時のみ
  - 承認 / 登録 (Visual Register、external、primary)
]
[2-col main grid (lg:grid-cols-[3fr_2fr]):
  Left (~60%):
    [AssetPreviewCard (新): final asset 大画像 (`assets/visuals/...`) or latest inbox candidate、メタ overlay (px / KB / generatedAt)]
    [PlanMetadataCard (新): 全 visualAssetPlan field を dl/dt/dd で展開、imagePrompt は collapsible、textToInclude / textToAvoid / visualDirection も表示]
    [LifecyclePreviewCard (再利用): 5 stage (planned → prompt-ready → generated → reviewed → saved/published)、currentStage = bucketize(plan.status)]
  Right (~40%):
    [CampaignContextCard (新): sourceCampaign / sourceContentIdea / coreThesis (truncate 2-line)]
    [PromptSummaryCard (新): imagePrompt の上 200 字 + 「全文を見る」collapsible + CopyButton]
    [RubricChecklistCard (新、P1): review.md frontmatter の rubricAxes を checklist で表示 (read-only)]
    [ActionsCard (新、P1):
      - 「Visual Register で承認」 (external)
      - 「再生成プロンプトをコピー」 (Phase 2B)
      - 「今回は保留」 (Phase 2B)
    ]
    [FilePathsCard (新): taskFilePath / expectedLocalAssetPath / localAssetPath / publishPackagePath (CopyButton each)]
]
```

### 1-3. `/visual-assets/[assetId]/candidates` — Current structure

```
[ReadOnlyBanner]
[LocalModeBanner]
[Breadcrumb (inline text)]
[VisualAssetHeader]
[Candidate comparison section: CandidateGrid + 2 deferred buttons]
[Prompt context dl (1 col / 2 col、from prompt.md frontmatter)]
[Review rubric default dl (from review.md frontmatter)]
```

### 1-3. `/visual-assets/[assetId]/candidates` — Ideal structure (13_02_43 (6).png に最も寄せる)

```
[Breadcrumb: 図解レビュー > <slug> > 候補比較]
[PageHeader: Title「<slug> の候補比較」+ Description「<count> 件の候補 / inbox <folderRelativePath>」+ Actions:
  - assetSlug に戻る (outline)
  - 承認 / 登録 (Visual Register external、primary)
]
[CandidateFocusLayout (新、2-col):
  Left (~60%):
    [BigPreviewCard (新、CandidatePreview を流用): 選択中 1 候補を大きく表示 (max-h-[640px] object-contain)]
    [CandidateThumbStrip (新): v001 / v002 / v003 を横並びでクリックで focus 切り替え]
    [PromptContextCard (現 dl を design tone 揃えで再構成、collapsible)]
  Right (~40%):
    [SelectedCandidateMetaCard (新): id / generatedAt / px size / file size / variant / layoutPattern / score]
    [RubricScoresCard (新): rubricAxes × candidate score grid、recommendedCandidate を ★ で]
    [ReviewActionsCard (新): 採用 / 再生成 / 保留 buttons (Phase 2B placeholder)、Visual Register link]
    [NotesCard (新): review.md の Notes section (markdown 抜粋、最初の 5 行 + 「全文」collapsible)]
]
[Warnings section (現 amber-50 ul を card 化)]
```

### 1-4. Missing sections (全 route)

- `/visual-assets`: PageHeader / Breadcrumb / FilterBar / KPI row / card grid (現在は bucket section ごと table)
- `/visual-assets/[assetId]`: AssetPreviewCard / PlanMetadataCard (現在は dl のみ) / RubricChecklistCard / ActionsCard / FilePathsCard / LifecyclePreviewCard
- `/visual-assets/[assetId]/candidates`: CandidateFocusLayout (1 候補を big preview + thumb strip)、RubricScoresCard、ReviewActionsCard

### 1-5. Wrong sections (削除候補)

- `/visual-assets`: bucket section ごと table (card grid に置換、KPI row が代替)
- `/visual-assets/[assetId]`: 現在の Candidate review section の 2 deferred button 配置 (ActionsCard に統合)

### 1-6. Reorder needs

- `/visual-assets/[assetId]/candidates`: 現在「上から table → prompt dl → review rubric dl」を「2-col CandidateFocusLayout」に再編

---

## 2. Component Diff

| Component | 現在 | 目標 | 判定 | Likely file |
|---|---|---|---|---|
| ReadOnlyBanner | あり (全 route) | reuse | **keep** | 既存 |
| LocalModeBanner | あり ([assetId], /candidates) | reuse、ただし list page にも追加 | **reuse** | 既存 |
| VisualAssetHeader | あり | PageHeader + breadcrumb 構成に置換、内部一部 reuse | **replace** | 既存 → PageHeader 経由 |
| PageHeader | 既存 (`common/PageHeader`) | 全 route で導入 | **reuse** | 既存 |
| Breadcrumb | 既存 (`common/Breadcrumb`) | 全 route で導入 | **reuse** | 既存 |
| SummaryCard (旧) | あり (/visual-assets) | KpiCard に置換 | **replace** | 削除予定 |
| KpiCard | 既存 (`common/KpiCard`) | /visual-assets に 5 件 | **reuse** | 既存 |
| KpiCardsRow | 既存 | /visual-assets で reuse | **reuse** | 既存 |
| FilterBar (新) | なし | assetType / platform / status / sort + 検索 | **add** (P0) | 新規 `visual-review/VisualAssetsFilterBar.tsx` |
| VisualAssetTable | あり (bucket section) | card grid に置換 | **replace** | 削除予定 |
| AssetCardGrid (新) | なし | 3-col card grid | **add** (P0) | 新規 `visual-review/AssetCardGrid.tsx` |
| AssetCard (新) | なし | 1 visualAssetPlan を card 化 | **add** (P0) | 新規 `visual-review/AssetCard.tsx` |
| AssetPreviewCard (新) | なし | detail page の big preview | **add** (P0) | 新規 `visual-review/AssetPreviewCard.tsx` |
| PlanMetadataCard (新) | dl 散在 | dl/dt/dd を card 化、imagePrompt collapsible | **add** (P0) | 新規 `visual-review/PlanMetadataCard.tsx` |
| CampaignContextCard (新) | sourceCampaign 簡素 | coreThesis preview + link | **add** (P1) | 新規 `visual-review/CampaignContextCard.tsx` |
| PromptSummaryCard (新) | なし (Reference section に断片) | imagePrompt の冒頭 + 全文 collapsible + Copy | **add** (P1) | 新規 `visual-review/PromptSummaryCard.tsx` |
| RubricChecklistCard (新) | なし | review.md.rubricAxes を chip 化 | **add** (P1) | 新規 `visual-review/RubricChecklistCard.tsx` |
| ActionsCard (新) | DeferredActionButton 2 件 | Visual Register external + Phase 2B placeholders | **add** (P1) | 新規 `visual-review/ActionsCard.tsx` |
| FilePathsCard (新) | dl 散在 | 4 path + CopyButton each | **add** (P1) | 新規 `visual-review/FilePathsCard.tsx` |
| LifecyclePreviewCard | configurator で導入済 | visual asset lifecycle にも適用 | **reuse** | 既存 |
| CandidateGrid | あり | CandidateFocusLayout に置換 | **replace** | 既存 → 新規 |
| CandidateFocusLayout (新) | なし | 1 focus + thumb strip | **add** (P0) | 新規 `visual-review/CandidateFocusLayout.tsx` |
| BigPreviewCard (新) | CandidatePreview の流用 | candidate 1 件を大きく | **add** (P0) | 新規 `visual-review/BigPreviewCard.tsx` (CandidatePreview を再構成) |
| CandidateThumbStrip (新) | なし | 横並び click で focus 切替 | **add** (P0) | 新規 `visual-review/CandidateThumbStrip.tsx` |
| SelectedCandidateMetaCard (新) | dl | card 化 | **add** (P0) | 新規 `visual-review/SelectedCandidateMetaCard.tsx` |
| RubricScoresCard (新) | dl | axes × candidate grid | **add** (P1) | 新規 `visual-review/RubricScoresCard.tsx` |
| ReviewActionsCard (新) | DeferredActionButton 2 件 | 採用 / 再生成 / 保留 + Visual Register | **add** (P1) | 新規 `visual-review/ReviewActionsCard.tsx` |
| NotesCard (新) | なし | review.md の Notes 部分 collapsible | **add** (P1) | 新規 `visual-review/NotesCard.tsx` |
| CandidateStatusBadge | あり | reuse | **reuse** | 既存 |
| DeferredActionButton | あり | ActionsCard / ReviewActionsCard 内で reuse | **reuse** | 既存 |
| EmptyCandidateState | あり | reuse | **reuse** | 既存 |
| Sidebar nav label | 「画像・図解素材」 | 「図解レビュー」に rename | **update** | `dashboard/src/lib/navigation.ts` |

---

## 3. Visual Fidelity Checklist (measurable, ~36 items)

### 共通 (全 3 route)

- [ ] `<main className="mx-auto max-w-[1280px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] Sidebar の「図解レビュー」が active highlight
- [ ] ReadOnlyPill が Topbar に表示
- [ ] LocalModeBanner: `enableLocalFsRoutes` 状態を 1 banner で
- [ ] PageHeader pattern: breadcrumb + title `text-2xl font-semibold` + description + actions
- [ ] Card pattern: `rounded-lg border-slate-200 bg-white p-5 shadow-sm`
- [ ] Icon pill (header): `inline-flex h-7 w-7 ... rounded-md bg-<tone>-50 text-<tone>-600 ring-1 ring-inset ring-<tone>-200`
- [ ] Tabular-nums for px / file size / score 表示

### `/visual-assets` (list)

- [ ] Breadcrumb 「ダッシュボード > 図解レビュー」
- [ ] Title「図解レビュー」(現「画像・図解素材」から rename)
- [ ] Actions: フィルタを保存 (outline、Phase 2B) + 新しい候補を追加 (primary blue、external to Visual Register)
- [ ] FilterBar (h-9): assetType select / platform select / status bucket select / 並び替え / 検索 input
- [ ] KpiCard row (5): 合計 / 完了 / 保存待ち / 作業中 / 今回は保留、各 tone semantic
- [ ] AssetCardGrid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- [ ] AssetCard: thumbnail 64x96 (final or latest inbox) + title + roleJa subtitle + badges row + footer link
- [ ] Empty state: dataset 未投入時の親切なメッセージ + Visual Register コマンド

### `/visual-assets/[assetId]` (detail)

- [ ] Breadcrumb 「図解レビュー > <slug>」
- [ ] Title: plan.title or slug
- [ ] Description: 「<assetType> · <platform> · <aspectRatio>」(meta inline)
- [ ] Actions: 候補一覧へ / 公開パッケージで見る / 承認 (Visual Register)
- [ ] 2-col grid (lg:grid-cols-[3fr_2fr] gap-5)
- [ ] AssetPreviewCard: max-h-[480px] object-contain、final asset 優先、なければ latest inbox candidate
- [ ] PlanMetadataCard: 全 plan field を dl + imagePrompt は initially-collapsed
- [ ] LifecyclePreviewCard: visual asset lifecycle (planned → prompt-ready → generated → reviewed → saved/published)
- [ ] CampaignContextCard: sourceCampaign title / slug / coreThesis (truncate 2 lines)
- [ ] PromptSummaryCard: imagePrompt 200 字 preview + 全文 collapsible + CopyButton
- [ ] RubricChecklistCard (P1): review.md.rubricAxes を chip
- [ ] ActionsCard (P1): Visual Register external + Phase 2B placeholders
- [ ] FilePathsCard: taskFilePath / expectedLocalAssetPath / localAssetPath / publishPackagePath + CopyButton each

### `/visual-assets/[assetId]/candidates` (candidate focus)

- [ ] Breadcrumb 「図解レビュー > <slug> > 候補比較」
- [ ] Title「<slug> の候補比較」、count chip
- [ ] Actions: assetSlug に戻る + 承認 (Visual Register)
- [ ] CandidateFocusLayout: 2-col、Left = BigPreviewCard + ThumbStrip + PromptContext、Right = MetaCard + RubricScoresCard + ReviewActionsCard + NotesCard
- [ ] BigPreviewCard: `max-h-[640px] object-contain bg-slate-50`、候補 ID + px / file size badge overlay
- [ ] CandidateThumbStrip: 横並び thumbnail (h-16 w-24)、選択中は ring-2 ring-blue-500
- [ ] RubricScoresCard: rubricAxes × candidate table、recommendedCandidate は ★
- [ ] ReviewActionsCard: 採用 / 再生成 / 保留 (Phase 2B)、Visual Register link は primary external
- [ ] NotesCard: review.md Notes 抜粋 (5 行 + 全文 collapsible)
- [ ] Warning section: amber card、warnings 配列

---

## 4. Implementation Order

### P0 (Visual Review fidelity に必須)

- [ ] **Sidebar nav rename**: navigation.ts の visual-assets label を「図解レビュー」に
- [ ] **PageHeader + Breadcrumb 全 3 route 導入** (現 `<header>` を置換)
- [ ] **`/visual-assets` の構造書き換え**:
  - PageHeader + Breadcrumb
  - FilterBar (新)
  - 5 KpiCard (KpiCardsRow)
  - AssetCardGrid + AssetCard (新)
  - bucket table / SummaryCard 削除
- [ ] **`/visual-assets/[assetId]` の構造書き換え**:
  - PageHeader + Breadcrumb (VisualAssetHeader は内部一部 reuse)
  - 2-col grid
  - AssetPreviewCard (新、final or inbox)
  - PlanMetadataCard (新、全 plan field)
  - CampaignContextCard (新)
  - PromptSummaryCard (新、collapsible + Copy)
  - LifecyclePreviewCard (再利用)
  - FilePathsCard (新)
- [ ] **`/visual-assets/[assetId]/candidates` の構造書き換え**:
  - PageHeader + Breadcrumb
  - CandidateFocusLayout (新)
  - BigPreviewCard (CandidatePreview 流用)
  - CandidateThumbStrip (新、useState で focus)
  - SelectedCandidateMetaCard (新)
- [ ] **assetThumb 拡張**: list page の AssetCard thumbnail は `assets/visuals/` 既存 final + `assets/inbox/generated/...` 最新候補を fallback で表示。`/api/asset-thumb` の prefix 許可拡張は **要 boss 判断**

### P1 (重要 polish + Phase 2A 完成)

- [ ] **`/visual-assets/[assetId]`**:
  - RubricChecklistCard (review.md.rubricAxes、read-only)
  - ActionsCard (Visual Register external + Phase 2B placeholders)
- [ ] **`/visual-assets/[assetId]/candidates`**:
  - RubricScoresCard (axes × candidate table、recommended ★)
  - ReviewActionsCard (採用 / 再生成 / 保留 placeholders + Visual Register)
  - NotesCard (review.md Notes section、collapsible)
- [ ] **FilterBar の searchParams 同期** (URL に保存、リロード復元)
- [ ] **AssetCard thumbnail の fallback chain**: final → latest inbox → placeholder icon
- [ ] **AssetCard accessibility**: keyboard navigation、focus ring
- [ ] **Empty state polish**: dataset 未投入時の copy 改善

### P2 (Phase 2B、実 write 機能)

- [ ] **Approve & register**: server action / API → `assets/visuals/...` copy + patches/visual-assets/...json 生成、Sanity write は controlled tool 経由
- [ ] **Regenerate prompt**: imagePrompt 編集 + prompt.md 上書き + codex exec 再実行 trigger
- [ ] **Mark needs regeneration**: review-manifest.json に reviewStatus = "needs-regeneration" 書き込み
- [ ] **Visual Register への deep link**: scroll to asset (今は単純 external、改良で `?asset=<slug>` を Visual Register 側で受ける)
- [ ] **Bulk action** (複数 asset を「今回は保留」化)
- [ ] **Activity log integration**: 承認 / 再生成のたびに `/activity-log` にレコード

### P3 (将来検討)

- [ ] **Visual diff** (v001 vs v002 を pixel diff で overlay)
- [ ] **Brand consistency score** (visualStyleProfile と比較)
- [ ] **Auto-recommendation** (rubric scores から best candidate 推奨)
- [ ] **AI-assisted regeneration suggestion**

---

## 5. Files Likely Affected

### 新規 (P0)

| File | 内容 |
|---|---|
| `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx` | assetType / platform / status / sort / search、URL searchParams 同期 (P1 で完成) |
| `dashboard/src/components/visual-review/AssetCardGrid.tsx` | 3-col grid wrapper |
| `dashboard/src/components/visual-review/AssetCard.tsx` | 1 visualAssetPlan を card 化 |
| `dashboard/src/components/visual-review/AssetPreviewCard.tsx` | detail page big preview (final or inbox candidate) |
| `dashboard/src/components/visual-review/PlanMetadataCard.tsx` | dl/dt/dd、imagePrompt collapsible |
| `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` | client wrapper、selected candidate state |
| `dashboard/src/components/visual-review/BigPreviewCard.tsx` | CandidatePreview を流用、サイズ調整 |
| `dashboard/src/components/visual-review/CandidateThumbStrip.tsx` | 横並び thumb、click で focus 切替 |
| `dashboard/src/components/visual-review/SelectedCandidateMetaCard.tsx` | id / generatedAt / px / size / variant / layoutPattern |
| `dashboard/src/lib/groq/visualAssets.ts` (任意) | KpiCard 用の集計 query を分離する場合に新設 (今は campaign.ts に同居でも OK) |

### 新規 (P1)

| File | 内容 |
|---|---|
| `dashboard/src/components/visual-review/CampaignContextCard.tsx` | sourceCampaign + coreThesis |
| `dashboard/src/components/visual-review/PromptSummaryCard.tsx` | imagePrompt preview + Copy |
| `dashboard/src/components/visual-review/RubricChecklistCard.tsx` | review.md.rubricAxes chip |
| `dashboard/src/components/visual-review/ActionsCard.tsx` | Visual Register external + Phase 2B placeholders |
| `dashboard/src/components/visual-review/FilePathsCard.tsx` | 4 path + CopyButton |
| `dashboard/src/components/visual-review/RubricScoresCard.tsx` | axes × candidate grid |
| `dashboard/src/components/visual-review/ReviewActionsCard.tsx` | 採用 / 再生成 / 保留 + Visual Register |
| `dashboard/src/components/visual-review/NotesCard.tsx` | review.md Notes collapsible |

### 更新

| File | 想定変更 |
|---|---|
| `dashboard/src/app/visual-assets/page.tsx` | bucket table / SummaryCard 削除、PageHeader + FilterBar + KpiCardsRow + AssetCardGrid に置換 |
| `dashboard/src/app/visual-assets/[assetId]/page.tsx` | VisualAssetHeader を PageHeader に置換、2-col grid 導入 |
| `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` | 既存 CandidateGrid + 2 dl → CandidateFocusLayout に置換 |
| `dashboard/src/lib/navigation.ts` | 「画像・図解素材」→「図解レビュー」label rename |
| `dashboard/src/components/visual-review/VisualAssetHeader.tsx` | 段階廃止 (PageHeader 経由に移行後、削除候補) |
| `dashboard/src/components/visual-review/CandidateGrid.tsx` | CandidateFocusLayout で部分 reuse か、段階廃止 |
| `dashboard/src/components/visual-review/CandidatePreview.tsx` | BigPreviewCard へ rename or reuse |

### 削除候補 (Phase UI-fidelity-6 land 後の dead-code-cleanup batch)

| File | 理由 |
|---|---|
| `dashboard/src/components/SummaryCard.tsx` | KpiCard に置換、現 /visual-assets でのみ使用 |
| `dashboard/src/components/SectionHeader.tsx` | 全 fidelity page で `<header>` direct に migrate 済、最後の使用箇所が /visual-assets |
| `dashboard/src/components/EmptyState.tsx` | 新規 Empty state component で代替 (要確認) |
| `dashboard/src/components/FilePathBlock.tsx` | FilePathsCard で代替 |
| `dashboard/src/components/visual-review/VisualAssetHeader.tsx` | PageHeader に置換 |

---

## 6. Data Sources

### 6-1. `visualAssetPlan` (Sanity) — 既存

- query: `visualAssetPlanListQuery` (list) / `visualAssetPlanByIdQuery` (detail)
- fields used:
  - title / slug / targetPlatform / assetType / placement / aspectRatio / status / reusePolicy / generationMode / generationProvider
  - expectedLocalAssetPath / localAssetPath / taskFilePath / publishPackagePath
  - imagePrompt / textToInclude / textToAvoid / visualDirection / sourcePromptVersion / reviewNotes
  - sourceContentIdea (ref) / sourceCampaign (reverse ref by `$assetId in requiredVisualAssets[].visualAssetPlanId`)
  - updatedAt / createdAt

### 6-2. `requiredVisualAssets` (campaignPlan の inline 配列) — 既存

- `dashboardHomeQuery` / `campaignDetailBySlugQuery` で fetch 済
- visualAssetPlanId / assetSlug / platform / assetType / priority / state / sharesMasterWith / localAssetPath / notes / plan (de-ref)

### 6-3. inbox candidate frontmatter (`prompt.md` / `review.md`) — 既存

- `lib/inboxReader.ts` の `readAssetCandidates(campaignSlug, assetSlug)` で読む
- `PromptMeta`: campaignSlug / assetSlug / visualAssetPlanId / assetPurpose / platform / aspectRatio / pixelSize / candidateStrategy / styleAnchors / layoutPatterns / requiredVisualModules / forbiddenPatterns / phase
- `ReviewMeta`: reviewStatus / rubricScale / rubricMaxScore / rubricAxes / candidateScores (id → variant/score/notes) / recommendedCandidate / humanDecision / phase
- `CandidateMeta`: id / relativePath / fileName / fileSize / pixelWidth / pixelHeight / generatedAt (mtime) / variant / layoutPattern / score / notes
- 強制: `enableLocalFsRoutes` が true でないと server-side で読まない (本番 build では絶対無効)

### 6-4. `review-manifest.json` (campaign-level、inbox root) — 既存

- `lib/inboxReader.ts` の `readReviewManifest(campaignSlug)` で読む
- 構造: `{contentSlug, updatedAt, candidates: [{relativePath, fileName, suggestedAssetPlanId, reviewStatus, reviewNotes, finalAssetPath, patchPath, registeredAt, createdAt, updatedAt}]}`
- 用途:
  - `/visual-assets` で「完了済 candidate の最新 5 件」表示 (P1)
  - `/visual-assets/[assetId]` で「この asset の登録履歴」(P1)
  - `/visual-assets/[assetId]/candidates` で「採用済の v00N」を ★ 表示 (P0)

### 6-5. `assets/inbox/generated/` — file system

- 構造: `assets/inbox/generated/<campaignSlug>/<assetSlug>/{v001.png, v002.png, ..., prompt.md, review.md}`
- 画像 stream: `/api/visual-review/candidate-image?path=<safePath>` (prefix locked、`v\d{3}\.(png|jpg|jpeg|webp)$` のみ)
- listing: `/api/visual-review/inbox` (existing、unchanged)
- 1 件 bundle: `/api/visual-review/assets/[assetId]/candidates` (existing)
- review manifest: `/api/visual-review/review-manifest?campaignSlug=<slug>` (existing)

### 6-6. `assets/visuals/` (final) — file system

- 構造: `assets/visuals/<campaignSlug>/<platform>/<slot>/<asset-slug>.png`
- 既存 `/api/asset-thumb?path=<safePath>` (8 MB cap、`assets/visuals/` prefix 限定)
- AssetCard thumbnail で最優先表示

### 6-7. `localAssetPath` (visualAssetPlan field、最終配置) — 既存

- saved → reviewed → approved → packaged → published lifecycle で値が定まる
- AssetCard / AssetPreviewCard の thumbnail src 候補 1 (final asset)
- Phase 2B (P2) で `assets/visuals/...` copy 完了時に Sanity write で update する責任あり (本 spec scope 外)

### 6-8. `tasks/visuals/<campaignSlug>/<assetSlug>.md` (brief) — file system

- 既存 `taskFilePath` field で参照、ファイル本体は dashboard で読まない (link のみ)
- FilePathsCard で path 表示 + CopyButton

### 6-9. `patches/visual-assets/<campaignSlug>/<assetSlug>.json` (registration patch) — file system

- Visual Register が生成する Sanity patch JSON
- review-manifest.json の `patchPath` で referenced
- dashboard は **読まない** (Phase 2B で write 側の責任)、表示のみ FilePathsCard

---

## 7. Compatibility / Risk

- **`/api/asset-thumb` prefix**: 現状 `assets/visuals/` 限定。AssetCard で inbox 最新候補も thumb したい場合は `assets/inbox/generated/` を許可するか、別 endpoint `/api/visual-review/candidate-thumb` 新設のどちらか。boss 判断点
- **Sidebar nav rename**: 「画像・図解素材」→「図解レビュー」で旧 bookmark URL は不変 (`/visual-assets` 維持)。ただし発信文脈で「画像・図解」と書いた箇所が docs 内に複数あるため、要 grep
- **VisualAssetHeader 廃止**: 既存 component を全廃止すると VisualAssetHeader をテストする git diff が大きくなる。段階的に PageHeader 経由に移行 + 残骸を deprecated comment 化 → 後の dead-code-cleanup batch で削除
- **`enableLocalFsRoutes` 依存**: 本番 build で inbox が読めないので、List page の AssetCard thumbnail は final 優先 + 「inbox 最新」表示は local モード時のみ
- **Mobile responsive**: 13_02_43 (6).png は desktop layout。`sm:grid-cols-2` 維持で対応するが、Big preview / thumb strip の mobile UX は P1 で再確認
- **shadcn 判断**: Phase UI-fidelity-1〜5 で全 NO 路線。本 phase でも tabs / select / button は hand-roll を維持
- **`visualAssetPlan` dataset 偏り**: dataset が 7 件 (現状) しかなく card grid 1 行で終わる → 「もっと grid 感が欲しい」と感じる可能性。empty state + placeholder card で密度確保するか、grid を 2-col 化で密にするか
- **Approve & register flow との接続**: dashboard は read-only なので primary CTA は依然 Visual Register への external link。boss は Phase 2B (P2) でその統合を望むかどうか
- **`/api/visual-review/review-manifest` への依存追加**: AssetCard で「登録済」chip を出すなら、list page から全 campaign の manifest を集約する必要 (現状 inboxReader.listInbox は manifest 存在チェックのみ)。集約コストを許容するか、P1 で別解 (Sanity status を信頼) か

---

## 8. Boss Decision Points (Phase UI-fidelity-6 着手前)

1. **route 構成**: `/visual-assets/[assetId]` と `/candidates` を **統合** or **分離維持**
   - Option A (推奨): 分離維持 (URL safety、Visual Register の deep link 互換)
   - Option B: detail 内に CandidateFocusLayout を埋め込む (1 page で完結)
2. **Sidebar nav label**: 「画像・図解素材」→ 「図解レビュー」 / 「ビジュアル」/ 維持
3. **AssetCard thumbnail の inbox 候補表示**:
   - 既存 `/api/asset-thumb` の prefix を `assets/inbox/generated/` まで拡張する (1 endpoint 増やさない)
   - 新規 `/api/visual-review/candidate-thumb` を別に作る
4. **RubricChecklistCard / RubricScoresCard の優先度**:
   - P0 に格上げ (rubric は Visual Review の核心)
   - P1 維持 (まず layout を揃える)
5. **ActionsCard / ReviewActionsCard の Phase 2B placeholders**:
   - 「採用」「再生成」「保留」を全て disabled + tooltip
   - 「Visual Register で承認」だけ active で他は hidden
6. **Empty state コピー**: dataset 未投入 + inbox 未生成の双方ケースで何を書くか
7. **shadcn 採用判断**: 全 NO 継続でよいか、それとも Select / Checkbox を許容するか

---

## 9. Future Write / Generation Boundary

### Phase UI-fidelity-6 (本 spec の対象、UI のみ)

- **完全に UI のみ**、Sanity 書き込みなし、`assets/visuals/` copy なし、`patches/` 生成なし
- Approve & register は依然 Visual Register external
- 「採用 / 再生成 / 保留」は Phase 2B placeholder (disabled button + tooltip)

### Phase 2B (P2、実 write)

- **Approve & register flow** を dashboard 内で完結:
  1. inbox candidate を選択 → server action で `assets/visuals/<path>` に copy
  2. `patches/visual-assets/<campaign>/<asset>.json` 生成 (Visual Register 互換 schema)
  3. Sanity `visualAssetPlan` doc の `localAssetPath` / `status` を controlled atomic write
  4. `review-manifest.json` に entry 追加 (filesystem write)
- **Regenerate prompt**: imagePrompt 編集 + prompt.md 上書き + codex exec 再実行 (CLI spawn) → 要 boss 承認
- **Mark needs regeneration**: review-manifest.json への write のみ

### Phase 3+ (将来)

- Visual diff (pixel diff overlay)
- Brand consistency score
- Auto-recommendation (rubric scores から best candidate)
- Activity log への自動記録

### 明示的に scope 外

- AI-assisted regeneration (CLAUDE.md 整合性 + boss 承認待ち)
- 多媒体同時生成 trigger
- Visual Register への dependency 削減 (Phase 4+)

---

## 10. Out of scope (本 spec の範囲外)

- AppShell / Sidebar / Topbar (UI-1 完成)
- Sanity schema 変更 (既存 `visualAssetPlan` schema を使う)
- `/api/asset-thumb` prefix 拡張の実装 (boss 判断点 §8 で議論後、Phase UI-fidelity-6 実装 batch で決定)
- Visual Register tool 自体の改修 (依然 `npm run visual:register` 経由)
- Phase 2B 実装 (Approve & register, Regenerate prompt 実体)
- `requiredVisualAssets` 配列の編集 UI (`/campaigns/[slug]` の責務、本 spec 不変)
- patches/visual-assets/...json の自動生成 ロジック
- dead code cleanup の実施 (本 spec land 後、別 batch で)

---

## 11. Exact Codex Prompt for Phase UI-fidelity-6 (Visual Review implementation)

```text
Implement Phase UI-fidelity-6: Visual Review implementation.

Boss-confirmed scope (前提、必要なら handoff で boss に再確認):
- shadcn primitives: Select / Checkbox / Button: 全て NO (native HTML + Tailwind)
- Action buttons (採用 / 再生成 / 保留): Phase 2B placeholder (disabled + tooltip)
- 「Visual Register で承認」: external link to http://localhost:3334 (primary CTA)
- AssetCard inbox thumbnail: 既存 /api/asset-thumb の prefix 拡張 で OK (1 endpoint 維持)
- Sidebar nav label rename: 「画像・図解素材」 → 「図解レビュー」
- Route 構成: /visual-assets/[assetId] と /candidates は分離維持 (Option A)
- RubricChecklistCard / RubricScoresCard: P1 (まず layout を揃える)
- Empty state: dataset 未投入 + inbox 未生成 を区別したコピー

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png
- Spec: docs/77-visual-review-fidelity-spec.md (本ファイル)
- Reference: docs/68 / docs/69 / docs/handoff/0152 (latest tone)

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals/ or patches/
- Do NOT add packages (lucide-react は既存、shadcn は NO)
- Do NOT deploy
- Keep all 23 routes working
- Keep /publish-package/[slug] unchanged
- Keep /configurator, /publish, /outputs, /campaigns/[slug] unchanged

Tasks (P0 のみ、P1 は次 batch):

1. **Sidebar nav rename** in `dashboard/src/lib/navigation.ts`

2. **新規 component (P0)**:
   - `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx` (P0 はクライアント state、URL sync は P1)
   - `dashboard/src/components/visual-review/AssetCardGrid.tsx`
   - `dashboard/src/components/visual-review/AssetCard.tsx`
   - `dashboard/src/components/visual-review/AssetPreviewCard.tsx`
   - `dashboard/src/components/visual-review/PlanMetadataCard.tsx`
   - `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` (client、selected candidate state)
   - `dashboard/src/components/visual-review/BigPreviewCard.tsx`
   - `dashboard/src/components/visual-review/CandidateThumbStrip.tsx`
   - `dashboard/src/components/visual-review/SelectedCandidateMetaCard.tsx`

3. **3 route 書き換え**:
   - `dashboard/src/app/visual-assets/page.tsx` (PageHeader + FilterBar + KpiCardsRow + AssetCardGrid に置換、bucket table / SummaryCard 削除)
   - `dashboard/src/app/visual-assets/[assetId]/page.tsx` (PageHeader + 2-col grid + AssetPreview + PlanMetadata + LifecyclePreview + FilePaths)
   - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (CandidateFocusLayout に置換)

4. **`/api/asset-thumb` の prefix 拡張** (P0 で許可、`assets/inbox/generated/` を加える):
   - 既存 prefix lock + 8MB cap は維持
   - 1 行 prefix チェックを `assets/visuals/` || `assets/inbox/generated/` に拡張
   - 既存 endpoint 単体で final + inbox 両方賄える

5. **Builds**:
   - `cd dashboard && npm run build` (23 routes 維持)
   - `npm run build` (Sanity Studio clean)

6. **Docs**:
   - `docs/devlog/<番号>-ui-fidelity-6-visual-review.md`
   - `docs/handoff/<番号>-ui-fidelity-6-visual-review.md`
   - `docs/handoff/latest.md` (mirror)

Validation:
- 全 23 routes が build green
- `/visual-assets` で AssetCardGrid が render
- `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` で detail layout
- `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` で focus layout + thumb strip clickable
- Sidebar nav label が「図解レビュー」
- 既存の Visual Register external link が primary 行動として配置
- 既存の DeferredActionButton は ActionsCard / ReviewActionsCard 内で reuse

P1 は次 batch で:
- CampaignContextCard / PromptSummaryCard / RubricChecklistCard / ActionsCard / FilePathsCard
- RubricScoresCard / ReviewActionsCard / NotesCard
- FilterBar URL searchParams sync
- AssetCard thumbnail fallback chain (final → inbox → placeholder)
```
