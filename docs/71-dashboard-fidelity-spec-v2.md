# Dashboard Fidelity Spec v2 (post UI-2.5)

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
依存: docs/70 (initial audit) / docs/handoff/0143 (UI-2.5 完了)
対象 route: `/`

## Source materials

- **Ideal (primary)**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png`
- **Ideal (alt)**: `docs/ui-design/ChatGPT Image 2026年5月19日 12_35_50.png`
- **Current (pre UI-2.5)**: `~/Downloads/Hitori-Media-OS-—-Admin-05-19-2026_02_40_PM.png`
- **Current (post UI-2.5)**: 未撮影。コードベース (`dashboard/src/app/page.tsx`、UI-2.5 land 済) から推論

UI-2.5 (docs/handoff/0143) で `docs/70` audit の P0 5 領域はすべて適用済。本 spec は **残ギャップ + 細部の measurable check** に絞る。

## 1. Page Structure Diff

### 1-1. Current structure (post UI-2.5)

```
[PageHeader: ダッシュボード + description + 公開パッケージを開く CTA]
[KpiCardsRow (5): アイデア / 下書き / レビュー待ち / 公開済み / ナレッジ]
[Upper grid 2-col:
  Configurator (65%) ────────────── TodayTasks (35%)
]
[LifecyclePipeline (5 stage, full width)]
[Middle row 2-col:
  ActiveCampaigns ───── RecentOutputs (placeholder)
]
[Lower row 2-col:
  LearningInsights ───── EngagementPlaceholder
]
[ReleaseReviewLinks]
[外部ツール]
```

### 1-2. Ideal structure (13_02_42 (1).png)

```
[PageHeader: ダッシュボード + description + 公開パッケージを開く CTA]
[KpiCardsRow (5)]
[Upper grid 2-col:
  ContentOutputConfigurator (65%) ─ TodayTasks (35%)
]
[LifecyclePipeline (5 stage)]
[Middle row 2-col:
  ActiveCampaigns ───── RecentOutputs (実テーブル)
]
[Lower row 2-col:
  LearningInsights ───── EngagementSummary (実チャート 4 metric tile + line chart)
]
```

(reference には ReleaseReviewLinks / 外部ツール セクションは無し)

### 1-3. Missing sections (current → ideal)

| Section | 状態 |
|---|---|
| RecentOutputs 実テーブル | 現在 placeholder、ideal は実データ行 |
| EngagementSummary 実チャート | 現在 placeholder、ideal は実グラフ |
| (なし) | ReleaseReviewLinks は ideal に存在しないが boss 動線として保持 |

### 1-4. Wrong sections

- **ReleaseReviewLinks**: ideal にない。boss 確定で下部移動済 (UI-2.5) のため許容、削除候補は将来判断
- **外部ツール section**: ideal にない。dev 利便性のため当面残す、Phase UI-7 で `/settings` 統合判断

### 1-5. Reorder needs

なし。UI-2.5 で reference 通りの 4 row 構造に整列済。

---

## 2. Component Diff

| Component | 現在 | 目標 (ideal) | 判定 | Likely file |
|---|---|---|---|---|
| PageHeader | title + description + 公開パッケージを開く CTA | 同等 | **keep** | `dashboard/src/components/common/PageHeader.tsx` |
| KpiCard | text-3xl + tone pill + neutral trend + sparkline | 同等 (ideal は実 trend 数値) | **modify** (trend 真値化は UI-6) | `dashboard/src/components/common/KpiCard.tsx` |
| KpiCardsRow | 5-col responsive grid | 同等 | **keep** | `KpiCardsRow.tsx` |
| ContentOutputConfiguratorCard | hero gradient + 8 fake select + 2 CTA | hero + 8 select + 2 CTA、ただし select の表示密度が ideal はやや詰まり気味 | **modify** (微) | `ContentOutputConfiguratorCard.tsx` |
| TodayTasksCard | read-only checklist | 同等 + 各 task 右に時刻 | **modify** | `TodayTasksCard.tsx` |
| LifecyclePipeline | 全 5 stage tone bg + currentStage ring + CURRENT chip | 同等、ideal は stage 間 chevron がやや控えめ | **keep** | `LifecyclePipeline.tsx` |
| ActiveCampaignsCard | 4 tone bar + chip + platform badges | 同等 | **keep** | `ActiveCampaignsCard.tsx` |
| RecentOutputsTable | placeholder | **実テーブル** (媒体 / タイトル / ステータス / 更新日) | **replace** (P1 で Phase UI-3 統合) | `RecentOutputsTable.tsx` |
| LearningInsightsCard | tone-bordered insights | 同等 | **keep** | `LearningInsightsCard.tsx` |
| EngagementPlaceholder | 4 metric tile + dashed chart | **実 line/bar chart + 4 metric** | **replace** (P2 で Phase UI-6 統合) | `EngagementPlaceholder.tsx` |
| ReleaseReviewLinks | 下部に保持 | (ideal にない) | **keep**, defer-remove | 既存 |
| 外部ツール section | 下部 | (ideal にない) | **keep**, defer-remove | inline in `page.tsx` |

---

## 3. Visual Fidelity Checklist (measurable)

### Header

- [ ] `<PageHeader title="ダッシュボード">` 表示
- [ ] 右に `公開パッケージを開く` 緑 CTA (`bg-emerald-600 px-3 py-2`)
- [ ] description が 1 行 `text-sm text-slate-600`

### KPI Row

- [ ] **5 cards** が sm: 3 col / lg: 5 col
- [ ] 各 KPI の icon が **per-tone** rounded-lg pill (blue/purple/orange/emerald/blue)
- [ ] value `text-3xl font-semibold tabular-nums leading-none`
- [ ] trend slot 表示、neutral 値「— 前月比」(boss 確定)
- [ ] sparkline (SVG inline, 64×18, tone-correct stroke)
- [ ] secondary text `text-xs text-slate-500`

### Upper grid

- [ ] `grid lg:grid-cols-3 gap-5`、Configurator が `lg:col-span-2` (65%)、TodayTasks が `lg:col-span-1` (35%)
- [ ] Configurator card に `bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40` の hero gradient
- [ ] Configurator header 右に「下書きを生成」緑 CTA + Sparkles icon
- [ ] Configurator footer に「出力コンフィギュレーターを開く」青 CTA (`bg-blue-600 px-4 py-2`)
- [ ] fake select 8 件が 2-col (sm) / 4-col (sm+) grid、各 select `h-10 border-slate-200 bg-white shadow-sm`
- [ ] TodayTasks card の task 右に **時刻 / 期限** (`text-[11px]`)
- [ ] task icon: 完了=`CheckCircle2 emerald-600`、high=`AlertCircle rose-700`、low=`Circle slate-400`

### Lifecycle Pipeline

- [ ] **5 stage 全てに tone bg + ring-1**
- [ ] currentStage に `ring-2 shadow-sm` + 右上 `CURRENT` chip
- [ ] stage icon が `h-6 w-6 rounded-md bg-white/70` pill
- [ ] value `text-2xl tabular-nums leading-none`
- [ ] 各 stage に 1 行 description (`text-[11px] text-slate-700/80`)
- [ ] stage 間 chevron `ChevronRight size=18 strokeWidth=2.5 text-slate-300`

### Middle row

- [ ] `grid lg:grid-cols-2 gap-5`
- [ ] ActiveCampaigns: progress bar `h-2`、% chip 右、platform badges インライン
- [ ] RecentOutputs: P0 placeholder OK、P1 で 4-col table (媒体 / タイトル / ステータス / 更新日)

### Lower row

- [ ] `grid lg:grid-cols-2 gap-5`
- [ ] LearningInsights: tone-bordered 2-3 insight
- [ ] EngagementPlaceholder: 4 metric tile (`—`) + dashed chart area + `Phase UI-6` chip

### Bottom

- [ ] ReleaseReviewLinks (less prominent、下部)
- [ ] 外部ツール section (4 リンク grid)

### Layout container

- [ ] `<main className="mx-auto max-w-[1280px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] 全 section が `<section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">` 基本

### Sidebar / Topbar (AppShell 共通)

- [ ] Sidebar 上部 64px が `bg-slate-900` + 白文字
- [ ] Topbar 右に `読み取り専用` pill (amber)
- [ ] Topbar 通知 bell に badge `3`

---

## 4. Implementation Order

### P0 (Dashboard 視認 fidelity に必須)

すべて UI-2.5 で適用済。**残 P0 なし**。

### P1 (重要な polish)

- [ ] **TodayTasksCard 右側に時刻 / 期限**: 現在 `dueLabel` プロパティで実装済だが ideal は時刻表記 (`今日 10:00`) が前面に出ている → `dueLabel` の Display を強化
- [ ] **KPI trend** に **真値 placeholder** (boss は「— 前月比」を確定済、必要なら数値テスト)
- [ ] **RecentOutputsTable 実テーブル化** (Phase UI-3 の `/outputs` データ source と統合)
- [ ] **Configurator select の表示密度**: ideal は select 内に値 + chevron が tighter、現在より 1-2px height 縮小可
- [ ] **Sidebar nav row 高さ tighter**: 現状 `py-2`、ideal は約 6-7px height 削減

### P2 (後段 polish)

- [ ] **EngagementPlaceholder → 実 chart**: Phase UI-6 (Analytics) で `manualPublishingStatus.reactionNotes` を集計、`Recharts` 導入 boss 判断
- [ ] **ReleaseReviewLinks 削除 or 移動先確定**: boss feedback 次第で完全削除 or Settings 配下に
- [ ] **外部ツール section** を `/settings` に統合 (Phase UI-7+)
- [ ] **sparkline 真値化**: 時系列 data 取得後 (Phase UI-6)
- [ ] **KPI value typography**: ideal は数字に細部の `font-feature-settings: "tnum"` (既に tabular-nums)、line-height をさらに tight に

---

## 5. Files Likely Affected

| Priority | File | 想定変更 |
|---|---|---|
| P1 | `dashboard/src/components/dashboard/TodayTasksCard.tsx` | due 表記を右側 prominently 表示 |
| P1 | `dashboard/src/components/dashboard/RecentOutputsTable.tsx` | UI-3 で実データ source 統合 (FS scan + Sanity platformOutput) |
| P1 | `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` | select height 微調整 |
| P1 | `dashboard/src/components/app-shell/Sidebar.tsx` | nav row 高さ縮小 |
| P2 | `dashboard/src/components/dashboard/EngagementPlaceholder.tsx` | Phase UI-6 で実装、Recharts 検討 |
| P2 | `dashboard/src/app/page.tsx` | ReleaseReviewLinks の最終配置判断 |

UI-2.5 完了状態が「ideal の 80-85%」に達したと推定。P1 の 4-5 件で 95%+ に到達可能。
