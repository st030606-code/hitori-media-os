# Publish Management Fidelity Spec

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 route: `/publish` (現状 PhasePlaceholder)
依存: docs/68 / docs/69 / docs/handoff/0147 (UI-fidelity-3 完了、design tone 確立済)

## Source materials

- **Ideal**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png`
- **Current**: `dashboard/src/app/publish/page.tsx` = PhasePlaceholder。実コンテンツなし
- **Reference**: docs/68 (tokens / 3-2 §) / docs/69 (Phase UI-3 / target IA) / docs/72 (Campaign Detail spec、共通 component が確立済) / docs/handoff/0147 (UI-2.5/3-1/3-2/3-3 で確立した design tone)

---

## 0. Page concept (差別化)

current 設計と命名で混乱しやすい:

- **`/publish-package/[slug]`** (v0.2 既存): **コピー UI 中心**。「いま手動で投稿する人」のための作業画面。本文 / 画像 / 公開済み URL コピー。Phase UI-3 で URL inline 編集が入る予定だがあくまで **作業者視点**
- **`/publish`** (本 spec): **モニタリング + 公開ステート管理**。Publish Package を「単位として」見せる。配布 channel grid / lifecycle stage / リスクチェック / 反応モニタリング / カレンダー。**Publisher 視点**

ideal screenshot (`13_02_43 (5).png`) は **single Publish Package を hero として全体監視する画面**。`/publish` route は default で「最新の active campaign」の publish package を表示し、上部で switcher を持つ。`/publish-package/[slug]` への動線 (「公開パッケージで開く」link) を保持。

---

## 1. Page Structure Diff

### 1-1. Current structure

```
[PhasePlaceholder:
  Title「公開管理」
  「この画面は次フェーズで実装します (Phase UI-3)」
  既存 /publish-package/building-hitori-media-os / /publish-packages link
  ダッシュボードに戻るリンク
]
```

### 1-2. Ideal structure (13_02_43 (5).png)

```
[Breadcrumb: ダッシュボード > キャンペーン > {campaign} > 公開管理]
[PageHeader:
  Title 「公開管理」
  Subtitle / Description: 「Publish Package」label
  Actions: 公開パッケージを編集 (outline) / 公開設定 (outline) / 今すぐ公開 (primary blue) / user avatar
]
[PackageHeroCard (full width):
  Package title + status badge (公開済み / 公開準備OK 等)
  Description summary
  小型 cover thumbnail area
]
[2-col main grid (lg:grid-cols-[2fr_1fr]):
  Left:
    [ChannelsGrid card:
      Title「公開チャネルとリンク」
      Subtitle「すべての媒体の公開状況」
      6 platform 行 (X / Threads / note / Substack / YouTube / Podcast)
      各 platform: PlatformBadge + 状態 dot + published URL (省略表示) + open icon
    ]
    [PublishingMediaTable card:
      Title「公開メディア一覧」
      6-column DataTable:
        媒体 / レビュー・承認状態 / Published URL / Published At / 担当 / 操作
    ]
    [IncludedAssetsTable card:
      Title「含まれる成果物」
      含まれる visual / text assets の list
    ]
  Right:
    [PublishingLifecycleTimeline card:
      Title「公開ライフサイクル」
      Horizontal arrow flow: 計画 → 準備 → レビュー → 公開予定 → 公開済み
      現在 stage highlight
    ]
    [ReleaseNotesCard:
      Title「リリースノート」
      ハイライト 箇条書き + reaction summary placeholder
    ]
    [RiskCheckCard:
      Title「リスクチェック」
      4-5 check items (内部情報漏出 / 有料PDF 引用 / 自動投稿無 / 個人情報 等)
      各 ✓ green or ⚠ amber
    ]
    [PostPublishMonitoringCard:
      Title「公開後モニタリング」
      4 metric tile (視聴 / スキ / 購読 / 返信)
      mini sparkline area
    ]
]
[Bottom: PublishingCalendarCard (full width):
  Title「公開済みカレンダー / 公開予定」
  Mini calendar (週次 / 月次切替)
  Bottom metric strip: 数値 (例 52,300 / 3,420 / 1,120 — total views / engagement / replies)
]
```

### 1-3. Missing sections (current → ideal)

current は PhasePlaceholder のみ → ideal の全 sections が missing。新規構築する必要あり:

- Breadcrumb
- PageHeader (with 3 actions)
- PackageHeroCard
- ChannelsGrid (status dots + URLs)
- PublishingMediaTable
- IncludedAssetsTable
- PublishingLifecycleTimeline (横長 arrow flow、`LifecyclePipeline` とは別 stage set)
- ReleaseNotesCard
- RiskCheckCard
- PostPublishMonitoringCard
- PublishingCalendarCard

### 1-4. Wrong sections

なし (current が空)。PhasePlaceholder は本実装 land 後に削除。

### 1-5. Reorder needs

該当なし (新規構築)。

---

## 2. Component Diff

| Component | 現在 | 目標 (ideal) | 判定 | Likely file |
|---|---|---|---|---|
| PhasePlaceholder | あり (placeholder) | 削除 | **replace** | `publish/page.tsx` |
| PageHeader | (placeholder) | breadcrumb + 3 actions | **reuse** | `common/PageHeader.tsx` (UI-fidelity-1 で breadcrumb prop 対応済) |
| PackageHeroCard (新) | なし | campaign title + status + cover + description | **add** (P0) | 新規 `publish/PackageHeroCard.tsx` |
| ChannelsGrid (新) | なし | 6 platform 行 with status dot + URL | **add** (P0) | 新規 `publish/ChannelsGrid.tsx` |
| PublishingMediaTable (新) | なし | 6-column DataTable | **add** (P0、Campaign Detail の `PublishingScheduleTable` と共通 pattern) | 新規 `publish/PublishingMediaTable.tsx` |
| IncludedAssetsTable (新) | なし | visual / text assets list | **add** (P1) | 新規 `publish/IncludedAssetsTable.tsx` |
| PublishingLifecycleTimeline (新) | なし | 公開専用 5 stage 横長 (計画→準備→レビュー→予定→公開済み) | **add** (P0) | 新規 `publish/PublishingLifecycleTimeline.tsx` |
| ReleaseNotesCard (新) | なし | highlights + reaction summary | **add** (P1) | 新規 `publish/ReleaseNotesCard.tsx` |
| RiskCheckCard (新) | なし | 4-5 check items | **add** (P1) | 新規 `publish/RiskCheckCard.tsx` |
| PostPublishMonitoringCard (新) | なし | 4 metric tile + sparkline (engagement placeholder) | **add** (P1、UI-2.5 の `EngagementPlaceholder` と共通化) | 新規 `publish/PostPublishMonitoringCard.tsx` または `EngagementPlaceholder` を generalize |
| PublishingCalendarCard (新) | なし | mini calendar + bottom metric strip | **add** (P2) | 新規 `publish/PublishingCalendarCard.tsx` |
| CampaignSwitcher (新) | なし | header 内 dropdown で複数 campaign 切替 | **add** (P1) | 新規 `publish/CampaignSwitcher.tsx` |
| Breadcrumb | あり | reuse | **keep** | `common/Breadcrumb.tsx` |
| StatusBadge / PlatformBadge | あり | reuse | **keep** | 既存 |
| KpiCard | あり | reuse for metric tiles | **keep** | 既存 |

---

## 3. Visual Fidelity Checklist (measurable)

### Page Header

- [ ] Breadcrumb: `ダッシュボード > {campaign 名} > 公開管理` (or 短縮 `公開管理`)
- [ ] Title `text-2xl font-semibold` 「公開管理」
- [ ] Subtitle: 「Publish Package」 small label / chip (slate-100 ring)
- [ ] Header actions (右側 group):
  - 「公開パッケージを編集」outline button (border-slate-200 bg-white)
  - 「公開設定」outline button
  - 「今すぐ公開」primary blue button (`bg-blue-600`)
- [ ] User avatar / cluster (`UserMenu` の薄縮版 or just avatar)

### CampaignSwitcher (P1)

- [ ] PageHeader 直下に dropdown: 「対象キャンペーン: {title} ▾」
- [ ] click で全 campaign list を表示 (max 10)
- [ ] selected campaign の slug が URL search param 経由 (`?slug=...`) で persist

### PackageHeroCard

- [ ] 全幅 card `rounded-lg border-slate-200 bg-white shadow-sm`
- [ ] Title: campaign.title `text-xl font-semibold`
- [ ] Status badge: `<StatusBadge state="published" label="公開済み" />` or similar
- [ ] Description: coreThesis or auto-generated summary (`text-sm text-slate-700`)
- [ ] Cover area: campaign hero image thumbnail (publish-packages の hero image 流用)
- [ ] Meta line: 「公開: 2026-05-19 JST」「対象媒体: 4 / 4」等の小さい metadata

### Left main column

#### ChannelsGrid card

- [ ] Title 「公開チャネルとリンク」+ small subtitle
- [ ] 6-8 platform 行 (X / Threads / note / Substack / YouTube / Podcast / 図解 / etc)
- [ ] 各 row layout:
  - PlatformBadge (h-7) + platform 名
  - 状態 dot: 公開済み (emerald) / 公開予定 (blue) / 未公開 (slate)
  - publishedUrl の省略表示 (truncate-ellipsis)
  - 「URL コピー」icon button + 「開く」(target=_blank)
- [ ] published URL なし platform は 「公開予定: pending」+「`/publish-package/[slug]#{platform}` を開く」リンク

#### PublishingMediaTable card

- [ ] Title 「公開メディア一覧」
- [ ] 6-column DataTable:
  - 媒体 (PlatformBadge + label)
  - レビュー / 承認状態 (`<StatusBadge state>` を 各 stage で: drafted / reviewed / ready / scheduled / published / needs_fix)
  - Published URL (短縮 + external icon)
  - Published At (JST tabular-nums)
  - 担当 (UserSummary avatar + name、boss-only 時は固定値)
  - 操作 (ChevronRight to `/publish-package/[slug]#{platform}`)
- [ ] Row hover bg-slate-50
- [ ] Empty state: 「公開する媒体がありません」

#### IncludedAssetsTable card (P1)

- [ ] Title 「含まれる成果物」
- [ ] Asset list (visual / text / publishedOutput):
  - thumbnail (visual のみ、`/api/asset-thumb` 経由)
  - filename + path
  - byte size
  - status badge
- [ ] Click で `/visual-assets/[id]` or `/outputs?campaign=...` に飛ぶ

### Right sidebar

#### PublishingLifecycleTimeline card

- [ ] Title 「公開ライフサイクル」
- [ ] 5 stage 横長 (`flex flex-row`): 計画 → 準備 → レビュー → 公開予定 → 公開済み
- [ ] 各 stage box: tone bg + icon + 短い label
- [ ] 現在 stage は ring-2
- [ ] stage 間 chevron-right arrows
- [ ] `LifecyclePipeline` (`Idea / Structured / Draft / Review / Published`) とは別の **publish-specific** lifecycle なので新コンポーネント

#### ReleaseNotesCard

- [ ] Title 「リリースノート」
- [ ] Sub: 「今回のハイライト」or 「変更点」
- [ ] 箇条書き (3-5 件): boss 入力 or `release-review/*-final-review.md` から derive
- [ ] 末尾に「反応サマリー」: 「Phase UI-6 で reactionNotes 集計」note + 4 placeholder metric

#### RiskCheckCard

- [ ] Title 「リスクチェック」
- [ ] Subtitle: 「公開前の確認項目」
- [ ] 4-6 check items (各 ✓ green or ⚠ amber):
  - 内部情報 (`.env`, project ID, dataset 名) の漏出なし
  - 有料 PDF 引用なし
  - 自動投稿なし
  - 個人情報 / subscribe email の表示なし
  - AI clone voice 承認待ち (該当時)
- [ ] 各 item: small icon + label + 補足 1 行

#### PostPublishMonitoringCard

- [ ] Title 「公開後モニタリング」
- [ ] Subtitle: 「公開直後 24h / 7d の指標」
- [ ] 4 metric tile (視聴 / スキ・♥ / 購読・フォロー / 返信・引用)
- [ ] 各 tile: 数値 (`text-lg font-semibold tabular-nums`) + sparkline placeholder
- [ ] Footer: 「Phase UI-6 で実装予定 (manualPublishingStatus.reactionNotes 集計)」note
- [ ] UI-2.5 の `EngagementPlaceholder` を generalize して再利用候補

### Bottom: PublishingCalendarCard (P2)

- [ ] Full-width card
- [ ] Title 「公開カレンダー」+ 切替 (週次 / 月次)
- [ ] mini calendar SVG: 月のグリッド、公開済み日に colored dot
- [ ] Bottom strip 3 metric (合計視聴 / 合計エンゲージメント / 合計返信)、`text-2xl tabular-nums`

### Layout

- [ ] `<main className="mx-auto max-w-[1280px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] 全 section が `rounded-lg border-slate-200 bg-white shadow-sm` (badge / dot 系を除く)
- [ ] 2-col grid `lg:grid-cols-[2fr_1fr] gap-5`

### Sidebar / Topbar

- [ ] Sidebar の「公開管理」が active highlight (key: `publish`)
- [ ] Topbar ReadOnlyPill 表示

---

## 4. Implementation Order

### P0 (Publish Management 視認 fidelity に必須)

- [ ] **PhasePlaceholder 削除 → 本実装 page**
- [ ] **PageHeader (breadcrumb + 3 actions)**
- [ ] **PackageHeroCard** (campaign title + status + description + 小型 cover)
- [ ] **ChannelsGrid** (6 platform 行 with status / URL / open icon)
- [ ] **PublishingMediaTable** (6-column DataTable)
- [ ] **PublishingLifecycleTimeline** (publish-specific 5 stage)
- [ ] **2-col layout** (左 main / 右 sidebar)
- [ ] Sanity から data: `campaignDetailBySlugQuery` を再利用 + 必要なら publish-package FS scan

### P1 (重要な polish)

- [ ] **CampaignSwitcher** (PageHeader 下 dropdown + URL searchParam)
- [ ] **IncludedAssetsTable** (visual + text asset list)
- [ ] **ReleaseNotesCard** (release-review markdown から highlight derive)
- [ ] **RiskCheckCard** (4-6 check items、static for now)
- [ ] **PostPublishMonitoringCard** (4 metric placeholder、`EngagementPlaceholder` 再利用検討)

### P2 (後段 polish)

- [ ] **PublishingCalendarCard** (mini calendar SVG + bottom metric strip)
- [ ] **PublishingMediaTable inline URL edit** (Phase UI-3 server action / write actions)
- [ ] **担当 (UserSummary) avatar 表示** (Phase UI-7+ multi-user)
- [ ] **Real reaction data 取得 + monitoring** (Phase UI-6 Analytics)
- [ ] 公開設定 / 今すぐ公開 actions の実装 (P2、Phase UI-7+)

---

## 5. Files Likely Affected

### 新規 (P0/P1)

| File | Priority | 内容 |
|---|---|---|
| `dashboard/src/components/publish/PackageHeroCard.tsx` | P0 | campaign title + status + description + cover |
| `dashboard/src/components/publish/ChannelsGrid.tsx` | P0 | 6 platform 行 with URL + open icon |
| `dashboard/src/components/publish/PublishingMediaTable.tsx` | P0 | 6-column DataTable (Campaign Detail の `PublishingScheduleTable` と共通 pattern、columns 増強版) |
| `dashboard/src/components/publish/PublishingLifecycleTimeline.tsx` | P0 | publish-specific 5 stage |
| `dashboard/src/components/publish/CampaignSwitcher.tsx` | P1 | dropdown with URL searchParam |
| `dashboard/src/components/publish/IncludedAssetsTable.tsx` | P1 | asset list |
| `dashboard/src/components/publish/ReleaseNotesCard.tsx` | P1 | highlights + reaction summary |
| `dashboard/src/components/publish/RiskCheckCard.tsx` | P1 | 4-6 check items |
| `dashboard/src/components/publish/PostPublishMonitoringCard.tsx` | P1 | 4 metric tile placeholder |

### 新規 (P2)

| File | Priority | 内容 |
|---|---|---|
| `dashboard/src/components/publish/PublishingCalendarCard.tsx` | P2 | mini calendar + bottom metric strip |

### 更新

| File | 想定変更 |
|---|---|
| `dashboard/src/app/publish/page.tsx` | PhasePlaceholder 削除、本実装に置換 |
| `dashboard/src/components/dashboard/EngagementPlaceholder.tsx` | (任意) `<EngagementPlaceholder variant="publish">` のように generalize して `PostPublishMonitoringCard` で再利用 |

### 既存 component reuse

- `common/PageHeader.tsx` (breadcrumb prop 既存)
- `common/Breadcrumb.tsx`
- `common/KpiCard.tsx` / `KpiCardsRow.tsx` (PostPublishMonitoringCard 内で？)
- `common/PlatformBadge.tsx` + `platformLabel()`
- `StatusBadge`
- `Tabs` (もし右 sidebar の Release Notes / Risk Check / Monitoring を Tabs にまとめる場合)
- 既存 `ReleaseReviewLinks` (PageHeader 内 actions から link？)

### Data sources

#### 既存 query

- **`campaignDetailBySlugQuery`** (`dashboard/src/lib/groq/campaign.ts`): `manualPublishingStatus[].publishedUrl/publishedAt/state/reactionNotes` / `visualAssetDetails` / `publishPackagePaths` / `releaseReviewPath` / `humanReviewGates` 等を再利用可能
- **`outputsListQuery`** (`dashboard/src/lib/groq/outputs.ts`): IncludedAssetsTable で text outputs 表示

#### 新規 query (オプション、P1+)

- **`campaignsForSwitcherQuery`**: 全 campaign の slug + title (CampaignSwitcher 用) — 既存 `campaignListQuery` で代替可能

#### 新規データ無し / future

- `substackGrowthAction` / `substackPostPlan.publishedUrl`: 既存 schema にあるが seed 投入未確認
- Reaction analytics (視聴 / スキ / 購読 / 返信): Phase UI-6 で取得方針確定後
- Risk check 状態: 現状 static items のみ、Phase UI-7+ で実データ化判断

---

## 6. Compatibility / Risk

- **`/publish-package/[slug]` (v0.2) との区別**: 別 route として共存、`/publish` から「公開パッケージで開く」link で動線。`/publish` ≠ `/publish-package/[slug]` を仕様書 / UI 内で明示
- **CampaignSwitcher URL searchParam**: `useSearchParams` を client component 内で使用、Server Component 親が `searchParams` prop を受け取って Sanity fetch
- **Default campaign 選択**: searchParam 未指定なら `campaignsActive` の latest を default
- **`/publish-package/[slug]` v0.2 と `/publish` の data 違い**: v0.2 は publish-package FS の copy 中心、`/publish` は Sanity 中心。両者の状態が異なって表示される懸念 (例: Sanity 反映前の URL が `/publish-package/[slug]` v0.2 では既に出ているが `/publish` ではまだ未公開表示) → handoff §7 に明記
- **PublishingLifecycleTimeline**: 既存 `LifecyclePipeline` (Idea→Structured→Draft→Review→Published) と stage が違う。混同しないよう専用 component に分離する判断
- **shadcn primitive 候補**: CampaignSwitcher dropdown は shadcn `DropdownMenu` がきれい、ただし `@radix-ui/react-dropdown-menu` + 3 deps が必要。Phase UI-fidelity-4 着手時に boss 判断。Fallback は hand-roll dropdown (UI-1 QuickCreateButton と同じパターン)
- **担当 (UserSummary)**: 現状 boss-only mode、すべての row が「ボス」固定。Phase UI-7+ で multi-user 化時に変動

---

## Out of scope (本 spec の範囲外)

- `/publish-package/[slug]` v0.2 動作 (touch しない、別 route)
- AppShell / Sidebar / Topbar (UI-1/UI-2.5 完成済)
- Sanity schema 変更
- Write actions (Phase UI-3+ で server action 経由、本 spec は read-only listing が中心)
- Real reaction analytics 取得 (Phase UI-6)
- 「今すぐ公開」/「公開設定」buttons の実装 (Phase UI-7+、現 phase は disabled placeholder)
- 担当 (UserSummary) avatar の dynamic 化 (multi-user mode 待ち)
