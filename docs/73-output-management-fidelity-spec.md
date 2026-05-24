# Output Management Fidelity Spec

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 route: `/outputs` (現状 placeholder)
依存: docs/68 / docs/69 (Phase UI-3 territory) / docs/handoff/0140 (UI-1 で placeholder 作成済)

## Source materials

- **Ideal**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (4).png`
- **Current**: `dashboard/src/app/outputs/page.tsx` は `PhasePlaceholder`（「この画面は次フェーズで実装します」+ ダッシュボードに戻る link）。実コンテンツなし

---

## 1. Page Structure Diff

### 1-1. Current structure

```
[PhasePlaceholder:
  Title「出力管理」
  「この画面は次フェーズで実装します」 (UI-3)
  ダッシュボードに戻るリンク
]
```

それだけ。

### 1-2. Ideal structure (13_02_43 (4).png)

```
[PageHeader: 出力管理 + description + 新規作成 CTA + 公開済み CTA?]
[FilterBar: campaign select / platform select / status select / sort + 新規作成 button]
[KpiCardsRow (4): 全出力 256 / 下書き / レビュー待ち / 公開済み (各 sparkline + trend)]
[2-col layout (~70% / ~30%):
  Left:
    [Filters row (再表示 or chip filters)]
    [DataTable: タイトル / キャンペーン / プラットフォーム / ステータス / 担当 / 公開予定日 / actions]
    [Pagination]
  Right:
    [媒体別出力 card: platform list with count per platform]
    [出力アクティビティ: recent activity timeline]
]
```

### 1-3. Missing sections (current → ideal)

すべて missing (current が placeholder のみ)。以下を新規構築:

- PageHeader (with 新規作成 / フィルタ / etc actions)
- FilterBar (campaign / platform / status / sort / +新規)
- KpiCardsRow (4 metric per status: 全 / 下書き / レビュー / 公開)
- DataTable (outputs 主役)
- 媒体別出力 sidebar card
- 出力アクティビティ sidebar card
- Pagination

### 1-4. Wrong sections

なし (current が空)。PhasePlaceholder は本実装 land 後に削除。

### 1-5. Reorder needs

該当なし (新規構築)。

---

## 2. Component Diff

| Component | 現在 | 目標 (ideal) | 判定 | Likely file |
|---|---|---|---|---|
| PhasePlaceholder | あり (placeholder) | 削除、本実装に置換 | **replace** | `outputs/page.tsx` |
| PageHeader | (placeholder) | title + description + 新規作成 CTA + 一覧設定 | **reuse** + add actions | `common/PageHeader.tsx` |
| FilterBar (新) | なし | 4 select + 検索 input + 新規作成 button | **add** (P0) | 新規 `outputs/OutputsFilterBar.tsx` |
| KpiCardsRow | (placeholder) | 4 metric: 全/下書き/レビュー/公開 | **reuse** | `common/KpiCardsRow.tsx` |
| KpiCard | (placeholder) | per-status tone + sparkline + trend | **reuse** (UI-2.5 改善版) | `common/KpiCard.tsx` |
| OutputsTable (新) | なし | DataTable: タイトル / キャンペーン / プラットフォーム / ステータス / 担当 / 公開予定日 / actions | **add** (P0) | 新規 `outputs/OutputsTable.tsx` |
| PlatformBreakdownCard (新) | なし | platform 別の count list (右 sidebar) | **add** (P1) | 新規 `outputs/PlatformBreakdownCard.tsx` |
| OutputActivityFeed (新) | なし | 出力アクティビティ (recent activity timeline) | **add** (P2) | 新規 `outputs/OutputActivityFeed.tsx` |
| Pagination (新) | なし | DataTable 下のページネーション | **add** (P2) | 新規 `common/Pagination.tsx` |
| OutputRow (sub) | なし | DataTable の row component | **add** (P0) | `OutputsTable.tsx` 内 |
| PlatformBadge | あり | reuse | **keep** | 既存 |
| StatusBadge | あり | reuse | **keep** | 既存 |

---

## 3. Visual Fidelity Checklist (measurable)

### Page Header

- [ ] `<PageHeader title="出力管理" description="すべての出力をプラットフォーム横断で管理できます。">`
- [ ] 右に **「新規作成」** primary CTA (`bg-blue-600 px-3 py-2`)
- [ ] 右に **「一覧設定」** secondary outline button (任意、P2)

### Filter Bar

- [ ] `FilterBar` を Page Header 直下に
- [ ] 4 selects: キャンペーン / プラットフォーム / 出力ステータス / ソート順
- [ ] 検索 input (任意 search by title)
- [ ] **「新規作成」** primary CTA (header と重複可)
- [ ] select 高さ `h-9`、border-slate-200、focus:border-blue-500
- [ ] 全 selects とボタンを `flex flex-wrap gap-2 items-center` で

### KPI Row (per-status)

- [ ] 4 cards: 全出力 / 下書き / レビュー待ち / 公開済み
- [ ] それぞれ tone: 全=slate / 下書き=purple / レビュー=orange / 公開=emerald
- [ ] sparkline + trend「— 前月比」
- [ ] icon: 全=FileText / 下書き=Edit / レビュー=Eye / 公開=CheckCircle2

### 2-col layout

- [ ] `grid lg:grid-cols-[2fr_1fr] gap-5`
- [ ] Left: OutputsTable + Pagination
- [ ] Right: PlatformBreakdownCard + OutputActivityFeed

### OutputsTable

- [ ] Header columns: タイトル / キャンペーン / プラットフォーム / ステータス / 担当 / 公開予定日 / actions
- [ ] Row hover: `hover:bg-slate-50`
- [ ] platform 列: `<PlatformBadge platform={p}>`
- [ ] status 列: `<StatusBadge state={s}>` (idea / structured / draft / review / approved / ready / scheduled / published / needs_fix / archived)
- [ ] 公開予定日: `YYYY-MM-DD HH:mm JST` tabular-nums
- [ ] 担当: avatar (UserSummary) + name、不明時は `—`
- [ ] action 列: ChevronRight + per-row link (`/publish-package/{campaign.slug}` または出力詳細 phase later)

### PlatformBreakdownCard (right sidebar)

- [ ] Title: 「媒体別出力」
- [ ] 10 platform 行: PlatformBadge + count
- [ ] Click で table 側 platform filter を適用 (P1)

### OutputActivityFeed (right sidebar)

- [ ] Title: 「出力アクティビティ」
- [ ] 縦並び entry: time + actor + action + target (例: `8:32 ボス が「AIで始める習慣化」を 下書き → レビュー待ち に更新`)
- [ ] 最大 10 件、`text-xs`、divider 線

### Pagination

- [ ] Table 下、`<` / `1 / 2 / 3` / `>` buttons + total count
- [ ] `flex justify-between items-center text-xs text-slate-500`

### Layout container

- [ ] `<main className="mx-auto max-w-[1440px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] FilterBar / KpiRow / 2-col 全て `gap-5`
- [ ] 各 card `rounded-lg border border-slate-200 bg-white p-5 shadow-sm`

### Sidebar / Topbar

- [ ] Sidebar の「出力管理」が active highlight
- [ ] Topbar ReadOnlyPill 表示

---

## 4. Implementation Order

### P0 (Output Management fidelity に必須)

- [ ] **PhasePlaceholder 削除、本実装に置換**
- [ ] **PageHeader (title + 新規作成 CTA)**
- [ ] **FilterBar (4 select + 検索 + 新規作成)**
- [ ] **KpiCardsRow (4 status metric)**
- [ ] **OutputsTable (7 column DataTable、行 click で publish-package へ)**
- [ ] **2-col layout (左 main / 右 sidebar)**

### P1 (重要な polish)

- [ ] **PlatformBreakdownCard** (右 sidebar)
- [ ] OutputsTable のフィルタ反映 (FilterBar select 変更で table 再描画)
- [ ] OutputsTable 検索 (タイトル部分一致)
- [ ] sort: 公開予定日 / 更新日 desc/asc
- [ ] 担当 column の avatar (現状 boss only fixed)

### P2 (後段 polish)

- [ ] **OutputActivityFeed** (Phase UI-6 で activity log と統合)
- [ ] Pagination
- [ ] OutputsTable inline edit (Phase UI-3+ で write actions)
- [ ] 新規作成 CTA から `/configurator` への route (Phase UI-4)
- [ ] CSV export 等の 一覧設定 button

---

## 5. Files Likely Affected

### 新規

| File | 内容 | Priority |
|---|---|---|
| `dashboard/src/components/outputs/OutputsFilterBar.tsx` | 4 select + 検索 + 新規作成 | P0 |
| `dashboard/src/components/outputs/OutputsTable.tsx` | 7-column DataTable | P0 |
| `dashboard/src/components/outputs/PlatformBreakdownCard.tsx` | platform 別 count | P1 |
| `dashboard/src/components/outputs/OutputActivityFeed.tsx` | activity timeline | P2 |
| `dashboard/src/components/common/Pagination.tsx` | shared pagination | P2 |
| `dashboard/src/lib/groq/outputs.ts` | new GROQ query for `platformOutput` + counts | P0 |

### 更新

| File | 想定変更 |
|---|---|
| `dashboard/src/app/outputs/page.tsx` | PhasePlaceholder 削除、本実装に書き換え |
| `dashboard/src/components/app-shell/Sidebar.tsx` | (変更不要、active highlight は既に動作) |

### Data sources

#### 必要な Sanity データ

- `*[_type == "platformOutput"]` で title / platform / outputType / status / updatedAt 等を fetch
- もし `platformOutput` doc type が dataset に未投入なら、本 phase で:
  - (a) `manualPublishingStatus` の各 entry を「output 1 件」として derive する
  - (b) FS scan で `outputs/*/<slug>.md` から推測
  - boss 確認待ち、Phase UI-3 着手時に判断

#### 必要な FS source

- `outputs/{x,threads,note,substack,...}/*.md` を Server Component で walk
- file mtime / front-matter から status を推定

#### Count aggregations

```groq
"全出力": count(*[_type == "platformOutput"]),
"下書き": count(*[_type == "platformOutput" && status == "draft"]),
"レビュー待ち": count(*[_type == "platformOutput" && status == "review"]),
"公開済み": count(*[_type == "platformOutput" && status == "published"]),
```

(`platformOutput` 未投入なら manualPublishingStatus から相当を derive)

---

## 6. Compatibility / Risk

- **`platformOutput` doc type の存在**: `schemas/platformOutput.ts` は repo にあるが dataset 投入状況は確認必要
- **`manualPublishingStatus` proxy**: dataset 未投入なら campaignPlan.manualPublishingStatus から output を仮構築可能。Phase UI-3 着手時に boss 判断
- **DataTable component**: 既に `/campaigns` で同様 pattern 実装済 (`page.tsx` の table)。共通化候補だが本 spec では未定 (Phase UI-3 で `common/DataTable.tsx` 抽出検討)
- **shadcn primitives**: filter selects は shadcn `Select` が綺麗。Phase UI-3 着手時に 1 件追加判断 (`npx shadcn@latest add select`)。fallback は native `<select>` で十分

---

## Out of scope (本 spec の範囲外)

- AppShell / Sidebar / Topbar (UI-1/UI-2.5 完成済)
- Sanity schema 変更
- Write actions (Phase UI-3+ で server action 経由、本 spec は read-only listing)
- 新規作成 CTA から `/configurator` への完全な flow (Phase UI-4)
- CSV / API export (P2 以降)
- Activity log の真値取得 (Phase UI-6)
