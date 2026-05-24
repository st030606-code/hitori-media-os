# Dashboard UI Fidelity Audit

最終更新: 2026-05-19
ステータス: Audit (実装変更なし、boss 確認待ち)

## Source materials

- **Approved reference (dashboard mockup)**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png`
- **Component palette / styleguide**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_44 (9).png`
- **Current screenshot**: `~/Downloads/Hitori-Media-OS-—-Admin-05-19-2026_02_40_PM.png`
- **Spec**: `docs/ui-design/000-dashbord-desing.md`、`docs/68-hitori-media-os-ui-design-system.md`、`docs/69-dashboard-ui-redesign-implementation-plan.md`
- **Prior handoffs**: `docs/handoff/0140-ui-1-app-shell.md`、`docs/handoff/0141-ui-2-dashboard-redesign.md`

## Overall verdict

UI-2 で structural な情報配置 (PageHeader / KpiCardsRow / LifecyclePipeline / 主要 cards) は仕様に整列している。ただし **視覚的な仕上がりが reference と大きく差がある**。差分はおもに 5 領域:

1. **Sidebar branding header** — reference は dark navy ヘッダー + ライト本体の 2 層構造、current はフル白
2. **KPI cards の表現密度** — reference は icon-tone-pill + 大きな value + trend、current は icon + value のみで地味
3. **LifecyclePipeline の色使い** — reference は 5 stage 全てに semantic tone 背景、current は currentStage 1 つだけ強調
4. **ReadOnlyBanner の存在感** — current で上部の amber banner が大きく場所を取って業務感を弱める
5. **Information density / 余白** — reference は 1 view に多くの情報がフィット、current は padding 大きめで「ゆとり過剰」

これら 5 つを直すだけで boss が見たときの「approved design に見える」体感が大きく改善する。残りは P2 で漸進対応。

---

## 1. App Shell

### 1-1. Sidebar header (logo block)

| | |
|---|---|
| Current | 白ベース。`H` のロゴ box + 「Hitori Media OS」+ 「Admin · Phase 1」、サイドバー全体が white |
| Reference | 上端 ~88px が **dark navy / slate-900 グラデーション** で、白文字のロゴ + tagline。本体下部の nav は白背景で区切れている |
| Why it matters | "Operating System" 感がブランド identifier に乗る。current は SaaS dashboard としてはニュートラル過ぎる |
| Likely file | `dashboard/src/components/app-shell/Sidebar.tsx` (上部 64px の header div) |
| Risk | 低。1 div の bg-class 変更 + 文字色変更で済む。focus ring の対比が変わるので nav の active 表現と合わせて見直し |
| Priority | **P0** |

### 1-2. Sidebar nav row density

| | |
|---|---|
| Current | 各 nav item が `py-2` (8px×2) で comfortable、group label `text-[11px]` で間隔あり |
| Reference | row が tighter、icon 18 + label がほぼ密着、group label は薄い |
| Likely file | `Sidebar.tsx` の `SidebarLink` |
| Risk | 低 |
| Priority | P1 |

### 1-3. Workspace block

| | |
|---|---|
| Current | `bg-slate-50` border、normal/正常 emerald badge、usage bar 2 件、メンバー、Upgrade button |
| Reference | 同等構造だが上端の "スタンダードプラン" がより目立ち、Upgrade button は青系の outline |
| Likely file | `dashboard/src/components/app-shell/WorkspaceBlock.tsx` |
| Risk | 低 |
| Priority | P2 |

### 1-4. Topbar

| | |
|---|---|
| Current | 検索 input + ⌘K + クイック作成 (blue) + 通知 (bell + bg-rose-500 badge) + 設定 + UserMenu |
| Reference | ほぼ同じ。検索 input の border がやや強い、user avatar の周りに小さく workspace 表示 |
| Likely file | `dashboard/src/components/app-shell/Topbar.tsx` |
| Risk | 低 |
| Priority | P2 |

---

## 2. Page header

| | |
|---|---|
| Current | `text-2xl font-semibold` の「ダッシュボード」+ description + 公開パッケージを開く 緑 CTA |
| Reference | 同等。下に小さなパンくず/タブが見えるが、UI-2 スコープ外 (UI-3+ で再判断) |
| Likely file | `dashboard/src/components/common/PageHeader.tsx` |
| Risk | 低 |
| Priority | P2 |

---

## 3. ReadOnlyBanner

| | |
|---|---|
| Current | ページ最上段に黄色 (`bg-amber-50`) の大きな banner が幅いっぱい。"Phase Admin 1 is read-only…" 英文が場所を取る |
| Reference | banner 自体が存在しない（reference は production 想定のため） |
| Why it matters | ページの一等地を「dev 警告」が占めているため、boss が起動するたび dashboard の主役より banner が先に視線に入る |
| Target behavior | (a) 完全削除 / (b) Topbar に小さい dot indicator に格下げ / (c) `<details>` で初期折り畳み |
| Likely file | `dashboard/src/components/ReadOnlyBanner.tsx` を縮小、または各 page から import を外し AppShell の Topbar 内に統合 |
| Risk | 中。dev/prod 識別が消えると将来の write actions 段階で「いま read-only か write-enabled か」が分からなくなる懸念。Topbar pill 化が現実解 |
| Priority | **P0** |

---

## 4. KPI Cards

### 4-1. Icon placement / tone

| | |
|---|---|
| Current | カード右上に `h-8 w-8 rounded-md` icon、`bg-blue-50 text-blue-700` などのワントーンで全部似た色合い |
| Reference | 各 KPI に **異なる semantic tone**: アイデア=blue, 下書き=purple, レビュー待ち=orange, 公開済み=emerald, ナレッジ=blue。アイコンは大きく、tone が card のアクセントとして強く出ている |
| Likely file | `dashboard/src/components/common/KpiCard.tsx` の TONE_BG map と Icon size |
| Risk | 低。tone map は既に存在。tone を per-KPI で使うだけで改善 |
| Priority | **P0** |

### 4-2. Trend indicator

| | |
|---|---|
| Current | `trend` prop は実装済だが Home から渡していない → 表示なし |
| Reference | 各 KPI 下端に `+12% 前月比` のような trend、緑 up / 赤 down / グレー flat |
| Why it matters | KPI cards が「ただの数字」ではなく「動きのある指標」になる。dashboard の "OS" 感が増す |
| Target behavior | Phase UI-2 では真の trend データなし → **placeholder trend を boss-confirmed の hardcode で** 入れる (例: 公開済み +12.5% 前月比) or 「データ収集中」表示。UI-6 (Analytics) で真値に差し替え |
| Likely file | `dashboard/src/app/page.tsx` で `<KpiCard trend={...}>` を渡す |
| Risk | 中。架空の trend を入れると「捏造データ」感が出る。boss と「placeholder の見せ方」を相談 |
| Priority | **P0** (見た目改善の最大インパクト) |

### 4-3. Value typography

| | |
|---|---|
| Current | `text-2xl font-semibold` = 24px、bold |
| Reference | KPI value は **28-32px**、weight はやや軽め (semibold ぐらい) で「目を引く数字」感が強い |
| Likely file | `KpiCard.tsx` の value `<p>` class |
| Risk | 低 |
| Priority | P1 |

### 4-4. Card padding / shadow

| | |
|---|---|
| Current | `p-4 shadow-sm` |
| Reference | やや tighter padding、shadow は同程度。hover lift なし |
| Risk | 低 |
| Priority | P2 |

---

## 5. Content Output Configurator

### 5-1. Visual hierarchy

| | |
|---|---|
| Current | カード上部に icon + 2 行タイトル、4×2 fake selector grid、下端に灰色テキスト + Blue CTA |
| Reference | より洗練。タイトル横に「下書きを生成」緑 button が初めから配置、selector が 4-col x 2 row でラベル小さく値大きく、CTA が最大級 (青塗りつぶし、横幅広め) |
| Likely file | `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` |
| Risk | 低 |
| Priority | P1 |

### 5-2. Fake select の見た目

| | |
|---|---|
| Current | `h-9 bg-slate-50` でやや薄い |
| Reference | `border-slate-200` で枠が明確、値が大きく見やすい、`▾` chevron が薄い slate |
| Likely file | 同上 |
| Risk | 低 |
| Priority | P1 |

### 5-3. Width allocation

| | |
|---|---|
| Current | Configurator が full-width column (左 2/3 grid) |
| Reference | Configurator が ~70% 横、右に Today's Tasks card が並ぶ 2-column layout (上段) |
| Likely file | `dashboard/src/app/page.tsx` の grid 構造 |
| Risk | 中。grid 全体を組み替える必要 |
| Priority | P1 |

---

## 6. Lifecycle Pipeline

### 6-1. All stages tinted

| | |
|---|---|
| Current | currentStage のみ tone (blue/orange/etc) で背景着色、他 stage は `bg-slate-50 ring-slate-200` のフラット |
| Reference | **5 stage 全てがそれぞれの tone (blue/purple/orange/amber/emerald) で着色**。currentStage はさらに強く ring 表示 |
| Why it matters | これが LifecyclePipeline の "Idea → Published" を視覚的に語る最大要素。current だと「進捗バー風の弱い list」にしか見えない |
| Likely file | `dashboard/src/components/common/LifecyclePipeline.tsx` の stage rendering |
| Risk | 低。tone 適用ロジックを `isCurrent` 条件から外すだけ |
| Priority | **P0** |

### 6-2. Connecting arrows

| | |
|---|---|
| Current | `<ChevronRight size=16>` が薄い slate で stages 間に |
| Reference | より明確な太め arrow、tone と整合 |
| Likely file | 同上 |
| Risk | 低 |
| Priority | P2 |

### 6-3. Stage description text

| | |
|---|---|
| Current | description 任意で未使用 |
| Reference | 各 stage 下に短い 1 行の説明 (例: アイデア「思いつきや原型」) が見える |
| Likely file | 同上 |
| Risk | 低 |
| Priority | P2 |

---

## 7. Active Campaigns

| | |
|---|---|
| Current | List、各行 (title / status / 確認待ち / progress bar) |
| Reference | List + small **donut/progress 円グラフ** が左にアイコン的に並ぶ、status badge が右に |
| Likely file | `dashboard/src/components/dashboard/ActiveCampaignsCard.tsx` |
| Risk | 中。donut chart は HTML/CSS で軽量実装可能（Recharts 未承認）。SVG arc を直書きで足りる |
| Priority | P1 |

---

## 8. Recent Outputs

| | |
|---|---|
| Current | placeholder「出力一覧は /outputs (Phase UI-3) で実装します」+ platform color preview |
| Reference | Table 形式: 媒体 / タイトル / 状態 / 更新日 |
| Likely file | `dashboard/src/components/dashboard/RecentOutputsTable.tsx`、データソースが Phase UI-3 |
| Risk | 高。実データ source (`/outputs` FS scan + Sanity platformOutput) は Phase UI-3 で実装するため、UI-2 のフィデリティ修正範囲外 |
| Priority | P2 (deferred to Phase UI-3) |

---

## 9. Today's Tasks

| | |
|---|---|
| Current | read-only checklist、icon + tone + completion strike-through |
| Reference | ほぼ同じ、ただし各 task に右側に時刻 / 期限が見える |
| Likely file | `dashboard/src/components/dashboard/TodayTasksCard.tsx` |
| Risk | 低 |
| Priority | P2 |

---

## 10. Learning Insights

| | |
|---|---|
| Current | 3 insight、tone 別の border + bg |
| Reference | 2 insight (engagement summary が 3 つ目)、insights は短くテキスト中心、border tone あり |
| Likely file | `dashboard/src/components/dashboard/LearningInsightsCard.tsx` |
| Risk | 低 |
| Priority | P2 |

---

## 11. Right column: Engagement summary

| | |
|---|---|
| Current | 右列に `ReleaseReviewLinks` を表示（5 release-review file へのリンク） |
| Reference | 右列下に **エンゲージメント概要** card: 折れ線/棒チャート + 数値 grid (4 metric tiles) |
| Why it matters | Reference は完全な dashboard 体感、current は building-hitori-media-os 固有の release-review が右列にあり「campaign-specific 情報がダッシュボードに混入」して見える |
| Target behavior | Engagement summary は Phase UI-6 (Analytics) で実装。本フェーズでは ReleaseReviewLinks の **配置を右列下から / 別場所に移動** or 縮小して、空きを「公開後のエンゲージメントは Phase UI-6 で実装予定」プレースホルダ card に置換 |
| Likely file | `dashboard/src/app/page.tsx` の right column 構造 |
| Risk | 中。ReleaseReviewLinks を消すと boss が building-hitori 公開後に reaction 入れるパスを失う、代替を要検討 |
| Priority | P1 |

---

## 12. Information density

### 12-1. Page max-width

| | |
|---|---|
| Current | `max-w-[1280px]` |
| Reference | 同程度〜1440px。reference の screenshot 解像度では適正サイズ |
| Likely file | `dashboard/src/app/page.tsx` |
| Risk | 低 |
| Priority | P2 |

### 12-2. Card padding

| | |
|---|---|
| Current | 主要 card `p-5` (20px)、内 card `p-4` (16px)、warning `p-3` (12px) |
| Reference | ほぼ同じだが視覚的に "tighter" に見える。実は内側要素の line-height や margin が違う |
| Likely file | 全 card component |
| Risk | 低 |
| Priority | P2 |

### 12-3. Section gap

| | |
|---|---|
| Current | `gap-5` (20px) 主体 |
| Reference | 同程度 |
| Risk | 低 |
| Priority | P2 |

---

## 13. Typography

### 13-1. KPI value size

§4-3 参照。**P1**

### 13-2. Body / label

| | |
|---|---|
| Current | body `text-sm` (14px)、caption `text-xs` (12px)、micro `text-[11px]` |
| Reference | 同じ。OK |
| Risk | 低 |
| Priority | OK |

### 13-3. Heading weight

| | |
|---|---|
| Current | `font-semibold` (600) 主体 |
| Reference | section heading は `font-semibold` だがやや軽め |
| Risk | 低 |
| Priority | P2 |

---

## 14. Shadows / borders

| | |
|---|---|
| Current | 全カード `shadow-sm` 一律、`border-slate-200` 一律 |
| Reference | shadow は最小限、hover で `shadow-md` 程度の subtle elevation を許容 |
| Likely file | 全 card component |
| Risk | 低 |
| Priority | P2 |

---

## 15. Color usage

| | |
|---|---|
| Current | Tailwind palette default、`blue-*`/`sky-*`/`emerald-*`/`amber-*`/`rose-*`/`purple-*` を semantic に使用 |
| Reference | tone は同じだが、KPI icon-pill + LifecyclePipeline stage 着色で**色の総量が多い**。Current は全体が monochrome に近く感じる |
| Likely fix | KPI tone + Lifecycle tone を per-stage で表示するだけで体感大きく改善 |
| Risk | 低 |
| Priority | §4-1 / §6-1 と同 |

---

## Dashboard Visual Fidelity Checklist

Phase UI-2.5 (本 audit を受けた fidelity 修正バッチ) で測定可能なチェック:

### App Shell

- [ ] Sidebar 上端 64-88px が dark navy (`bg-slate-900` or `bg-blue-900`) で、ロゴ + tagline が白文字
- [ ] Sidebar 本体 (nav + workspace) は白背景
- [ ] Topbar は white + subtle border-bottom
- [ ] AppShell の `pt-16 lg:pl-[280px]` が維持されている (UI-1 機能無変更)

### Page Header

- [ ] `<PageHeader title="ダッシュボード">` が左、右に 公開パッケージを開く 緑 CTA
- [ ] description 行が小さい slate-600

### Read-only banner

- [ ] 旧大型 banner が **削除 or Topbar 内 pill に縮小** されている
- [ ] dev mode 識別は残る (Topbar 右に "Read-only" pill or `Phase Admin 1` 表示)

### KPI Cards

- [ ] 5 cards 横並び (sm: 3 cols, lg: 5 cols)
- [ ] 各 KPI の icon が **semantic tone** (アイデア=blue, 下書き=purple, レビュー待ち=orange, 公開済み=emerald, ナレッジ=blue) の `rounded-md` pill 内に表示
- [ ] 各 KPI に trend indicator (例: `+12% 前月比` の green/red/slate tone)
- [ ] value が `text-3xl font-semibold` (30px) 程度で目を引く
- [ ] secondary text が `text-xs text-slate-500` で薄い

### Content Output Configurator

- [ ] カード上部に icon + title + 右に「下書きを生成」緑 button (placeholder でも可、`/configurator` へ route)
- [ ] fake select 8 件が 4-col × 2-row grid、ラベル小・値中で見やすい
- [ ] 右側に Today's Tasks card が並ぶ (configurator が ~65-70%、tasks が ~30-35%)

### Lifecycle Pipeline

- [ ] **5 stage 全て** に semantic tone 背景 (blue / purple / orange / amber / emerald)
- [ ] currentStage は ring 強調
- [ ] stage 間に chevron-right の subtle arrow
- [ ] 各 stage に短い description 1 行 (任意)

### Active Campaigns

- [ ] List item 左に donut/progress 円 (SVG 直書き) または progress bar 強化
- [ ] status badge + pending gates count

### Recent Outputs

- [ ] Phase UI-2.5 では placeholder の見た目を **テーブル風に整える** (Phase UI-3 で実データ)

### Today's Tasks

- [ ] task 右側に時刻 / 期限の `text-[11px] text-slate-500`
- [ ] completion icon が emerald-600

### Learning Insights

- [ ] insight cards に tone 別 border
- [ ] metric が tabular-nums で並ぶ

### Right column

- [ ] ReleaseReviewLinks を右列から **下に移動** または 縮小して、エンゲージメント概要 placeholder と入れ替え
- [ ] エンゲージメント概要 placeholder: 4 metric tile grid + Phase UI-6 で実装される予定の note

### Typography

- [ ] KPI value: `text-3xl font-semibold tabular-nums`
- [ ] Section heading: `text-base font-semibold text-slate-900`
- [ ] Body: `text-sm`
- [ ] Caption: `text-xs text-slate-500`

### Spacing

- [ ] Card padding `p-5`、KPI card `p-4`
- [ ] Section gap `gap-5`、column gap `gap-5`
- [ ] Page max-width `max-w-[1280px]` または `max-w-[1440px]`

### Shadow / border

- [ ] 主要 card `shadow-sm border border-slate-200`
- [ ] hover elevation なし (静かな仕上がり)

---

## Files most likely to change in Phase UI-2.5

| File | 変更内容の見込み |
|---|---|
| `dashboard/src/components/app-shell/Sidebar.tsx` | 上部 header に dark navy bg、ロゴ block の文字色変更 |
| `dashboard/src/components/ReadOnlyBanner.tsx` または `Topbar.tsx` | 大型 banner → Topbar 内 small pill に縮小 |
| `dashboard/src/components/common/KpiCard.tsx` | value typography 強化、trend rendering を表示できる形に |
| `dashboard/src/components/common/LifecyclePipeline.tsx` | 5 stage 全て tone bg 適用、currentStage は ring 強調のみ |
| `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` | header に 下書きを生成 button を上に、selectors を 4×2、CTA を強化 |
| `dashboard/src/components/dashboard/ActiveCampaignsCard.tsx` | progress visual を donut/bar 強化 |
| `dashboard/src/app/page.tsx` | grid 構造を 2-col (configurator 70% / tasks 30%) に組み替え、ReleaseReviewLinks を右下から移動、Engagement placeholder を追加 |

---

## Whether another ChatGPT design pass is needed

**Not required for Phase UI-2.5.** Reference image + component palette image の 2 枚で十分。

ただし以下 3 シーンは追加リファレンス画像があると判断が早い:

1. **dark navy sidebar header** の gradient / accent 表現 (現状 reference では小さい)
2. **Engagement summary card** の中身 (Phase UI-6 で実装予定なのでこの batch では不要、UI-6 着手前に追加 mock 1 枚あると◎)
3. **donut / progress visualization** の具体的サイズ感 (ActiveCampaigns card の row 内 visualization)

これらは Phase UI-6 / UI-7 で追加 mockup を boss が出せば対応。**現時点では追加デザインパス不要、Phase UI-2.5 着手可**。

---

## Out of scope (do not touch in UI-2.5)

- `/publish-package/[slug]` v0.2 動作 (boss 公開済みキャンペーンの中核 UI)
- AppShell の structural grid (UI-1 で確定、変更しない)
- Sanity schema / GROQ
- Sanity 書き込み機能
- 新規 route 追加
- Recharts / shadcn 大量追加 (selective adoption policy 継続)
- /campaigns / /campaigns/[slug] (今回は `/` Home のみが対象、別バッチで campaigns 系も同様の fidelity audit を実施)
- 実 engagement data 取得 (Phase UI-6)
- /outputs データ取得 (Phase UI-3)
