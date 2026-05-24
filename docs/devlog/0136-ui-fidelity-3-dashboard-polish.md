# Phase UI-fidelity-3: Dashboard polish

日付: 2026-05-19

## 背景

[docs/71 Dashboard fidelity spec v2](71-dashboard-fidelity-spec-v2.md) で残っていた P1 を吸収し、UI-fidelity-1 (Campaign Detail) / UI-fidelity-2 (Output Management) で確立した tone と 3 page 全体で揃える batch。新規 feature 追加なし、polish 専念。

boss 確定:
- パッケージ追加なし
- KPI sparkline は placeholder のまま継続 (Phase UI-6 Analytics で真値置換)
- trend text は「— 前月比」neutral 継続
- `/outputs` のデータ source pattern (`outputsListQuery` + `buildOutputRows`) を Dashboard RecentOutputs で再利用

## 決定・変更

### 1. RecentOutputsTable を実データ化 (UI-fidelity-2 から流用)

[`dashboard/src/components/dashboard/RecentOutputsTable.tsx`](../dashboard/src/components/dashboard/RecentOutputsTable.tsx) を全面書き換え:

- 旧: placeholder + platform color preview details
- 新: `OutputRow` 型 (lib/groq/outputs から import) を受け取り、top 5 行を 5-column table で表示
- columns: タイトル (+ campaignTitle subtitle) / 媒体 (PlatformBadge + label) / ステータス (StatusBadge + raw label) / 更新日 (JST tabular-nums) / 操作 (公開URL は ExternalLink、それ以外は ChevronRight to publish-package)
- empty state: 「まだ出力がありません」+ /configurator への案内
- header: `最近の出力` + 「出力管理を開く →」link to `/outputs`

OutputsTable と比べて compact:
- 7 → 5 columns (キャンペーン subtitle にマージ / 出力形式 省略 / Source chip 省略)
- padding `py-2.5` (vs OutputsTable の `py-3`)

### 2. Home page で outputsListQuery を fetch

[`dashboard/src/app/page.tsx`](../dashboard/src/app/page.tsx):

- 旧: `dashboardHomeQuery` のみ
- 新: `Promise.all([fetchHome(), fetchOutputs()])` で `outputsListQuery` も並列 fetch
- `buildOutputRows(outputsRaw)` で row 配列を構築、`<RecentOutputsTable rows={recentOutputs} />` に渡す
- 旧 `campaigns={data.campaigns}` prop は削除

### 3. TodayTasksCard polish

[`dashboard/src/components/dashboard/TodayTasksCard.tsx`](../dashboard/src/components/dashboard/TodayTasksCard.tsx):

- 旧: title 下に dueLabel を 11px subtle text で
- 新: title 行の **右端に dueLabel** を tabular-nums で配置。これで複数 task の time labels が縦に揃って scan しやすい
- icon: 旧 AlertCircle (high) / Circle (low) → 新 priority dot (h-2 w-2 rounded-full、ring-2 ring-white)。完了は CheckCircle2 emerald-600 維持
- 「warning-heavy」な見た目を緩和、reference の落ち着いた task list 感に近づく
- dueLabel color が priority と連動 (high=rose-700 / medium=amber-700 / low=slate-600)、完了時は slate-400

### 4. ContentOutputConfiguratorCard select 微調整

[`dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx`](../dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx):

- FakeSelect 高さ: `h-10` → **`h-9`** (`/outputs` FilterBar select と統一)
- text color: `text-slate-700` → `text-slate-800` (やや濃く、密度感)
- `<div>` で書いていた structure を `<label>` + nested `<span>` に変更 (semantic 改善、a11y 副次効果)

### 5. Sidebar nav row 高さ縮小

[`dashboard/src/components/app-shell/Sidebar.tsx`](../dashboard/src/components/app-shell/Sidebar.tsx):

- nav link padding `py-2` → **`py-1.5`** (8px → 6px)
- 9 nav items の縦密度が約 18px 削減、reference の tighter nav 感に近づく
- focus ring + active blue bar はそのまま、操作性無変化

### 6. KPI sparkline は方針通り placeholder 継続

[`KpiCard.tsx`](../dashboard/src/components/common/KpiCard.tsx) のロジックは無変更。Home page の 5 KPI 全てに sparkline + 「— 前月比」 neutral trend を表示。boss 確定の「Analytics phase まで preview placeholder」を docs 側で明示。

### 7. 3 page tone consistency 確認

| 項目 | / | /campaigns/[slug] | /outputs | 結果 |
|---|---|---|---|---|
| max-width | `max-w-[1280px]` | `max-w-[1280px]` | `max-w-[1280px]` | ✓ 一致 |
| padding | `px-4 py-6 sm:px-6 lg:px-8` | 同 | 同 | ✓ 一致 |
| section gap | `gap-5` | `gap-5` | `gap-5` | ✓ 一致 |
| card | `rounded-lg border border-slate-200 bg-white shadow-sm` | 同 | 同 | ✓ 一致 |
| heading | `text-base font-semibold text-slate-900` | 同 | 同 | ✓ 一致 |
| KPI value | `text-3xl font-semibold tabular-nums leading-none` | 同 | 同 | ✓ 一致 |
| table row | `px-4 py-3` (OutputsTable) / `px-4 py-2.5` (RecentOutputs compact) / `px-4 py-3` (PublishingScheduleTable) | — | — | ✓ Recent は compact 意図、他は統一 |
| select | `h-9` (FilterBar) | — | `h-9` (FilterBar) | ✓ Configurator FakeSelect も h-9 に |
| badge tone | per-status / per-platform 共通 map | 同 | 同 | ✓ 一致 |

3 page で tone unified。差は意図的な compact 化のみ。

### Build verification

- `cd dashboard && npm run build` ✓ 23 routes、TypeScript clean
- `npm run build` ✓ Sanity Studio 7.8s clean

## 理由

- **RecentOutputsTable を共通 OutputRow に**: lib/groq/outputs.ts の `OutputRow` 型 + `buildOutputRows` を流用することで Dashboard と /outputs で「出力とは何か」の解釈が一致。Source chip だけ Dashboard 側で省略し、compact 感を出した
- **`Promise.all` で並列 fetch**: 2 query 同時実行で TTFB 影響を最小化。dashboardHomeQuery と outputsListQuery は独立、片方失敗してもエラーは throw されるが server component 上で boundaries を整える余地は Phase UI-6 で
- **TodayTasksCard の dueLabel を右に**: reference 画像で時刻が垂直に揃って読みやすい点が大きい。priority dot + tabular-nums で「warning-heavy なリスト」感を抑えた
- **Configurator FakeSelect を h-9 に**: `/outputs` FilterBar の select と視覚的に同じ。3 page で「これ select だな」と一目でわかる density
- **Sidebar py-1.5 へ**: 9 nav items + group labels + workspace block で sidebar が縦に伸びがち。1 row 2px 削減で全体 18px のヘッダー余白を取り戻す。focus ring と active bar は変更なし
- **KPI sparkline 継続**: boss が「Analytics phase まで preview として残す」と確定。捏造データ感の懸念は handoff §7 に "Phase UI-6 で真値置換" と明記して継承
- **3 page tone unified**: max-w / spacing / card style / typography / badge / select 全てチェック表で確認。意図的差 (Recent は compact / Tabs は専用 padding) のみ残存

## 影響

- `/` Home の RecentOutputsTable が building-hitori-media-os の 4 manualPublishingStatus rows を実データとして表示 (platformOutput が dataset 投入されれば自動的に切替)
- Home の TodayTasksCard / Configurator / Sidebar が UI-fidelity-2 design tone と完全に揃った
- `/campaigns/[slug]` は shared component (KpiCard / TodayTasksCard 等は Home のみ) 経由の影響なし
- `/outputs` も shared component 経由の影響なし
- 23 routes 全て build 通過、`/publish-package/[slug]` v0.2 動作維持
- Sanity 書き込みなし、schema 変更なし、パッケージ追加なし

## 次の一手

1. boss が `cd dashboard && npm run dev` で 5 page 実機確認:
   - `/` Home の RecentOutputsTable 実データ表示、TodayTasksCard の time 右揃え、Configurator select 統一、Sidebar nav 高さ
   - `/campaigns` list は UI-2 と同等
   - `/campaigns/building-hitori-media-os` は UI-fidelity-1 と同等 + sidebar height のみ影響
   - `/outputs` は UI-fidelity-2 と同等
   - `/publish-package/building-hitori-media-os` v0.2 動作確認
2. tone の微調整があれば microbatch
3. 違和感なければ次の選択肢:
   - **Publish Management fidelity spec** — `/publish` を `13_02_43 (5).png` 準拠で spec 化 (Phase UI-3 で実装)
   - **Output Configurator spec** — `13_02_43 (3).png` を spec 化 (Phase UI-4 着手準備)
   - **Visual Review fidelity spec** — `13_02_43 (6).png` を spec 化 (Phase UI-5)

並行候補 (UI と独立):
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup (`PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` 等)
