# Handoff: Phase UI-fidelity-3 Dashboard polish

Date: 2026-05-19

## 1. Task Goal

[docs/71 (Dashboard fidelity spec v2)](../71-dashboard-fidelity-spec-v2.md) で残っていた P1 を吸収し、UI-fidelity-1 (Campaign Detail) / UI-fidelity-2 (Output Management) で確立した design tone と 3 page (`/` / `/campaigns/[slug]` / `/outputs`) を全体で揃える。新規 feature 追加なし、polish 専念。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 23 routes 動作維持
- ✅ AppShell / Sidebar / Topbar / WorkspaceBlock structural 無変更 (nav row height のみ微縮)
- ✅ `/publish-package/[slug]` v0.2 touch なし
- ✅ `/campaigns/[slug]` UI-fidelity-1 動作維持 (shared component 経由の sidebar height 影響のみ)
- ✅ `/outputs` UI-fidelity-2 動作維持 (shared component 経由の sidebar height 影響のみ)

## 3. Changed Files

### 更新 (5)

- `dashboard/src/components/dashboard/RecentOutputsTable.tsx` — placeholder → 実データ table、`OutputRow` 型を `lib/groq/outputs` から流用、5-column compact table
- `dashboard/src/app/page.tsx` — `outputsListQuery` を並列 fetch、`buildOutputRows` で row 配列を構築、`RecentOutputsTable rows={recentOutputs}` で渡す
- `dashboard/src/components/dashboard/TodayTasksCard.tsx` — dueLabel を title 行右端に移動、priority dot icon、tabular-nums
- `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` — FakeSelect `h-10` → `h-9`、structure を `<label>` + nested `<span>` に
- `dashboard/src/components/app-shell/Sidebar.tsx` — nav link `py-2` → `py-1.5`

### 新規 docs

- `docs/devlog/0136-ui-fidelity-3-dashboard-polish.md`
- `docs/handoff/0147-ui-fidelity-3-dashboard-polish.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

## 4. Summary of Changes

### Dashboard polish

| 項目 | 旧 (UI-2.5 後) | 新 (UI-fidelity-3) |
|---|---|---|
| RecentOutputsTable | placeholder + color preview | 5-column compact table、top 5 OutputRow |
| TodayTasksCard dueLabel | title 下に subtle text | title 行右端、tabular-nums、priority 連動 color |
| TodayTasksCard icon | AlertCircle/Circle (warning-heavy) | priority dot (h-2 w-2 rounded-full) + 完了は CheckCircle2 |
| Configurator FakeSelect | h-10、`<div>` 構造 | h-9、`<label>` + `<span>` semantic、text-slate-800 |
| Sidebar nav padding | py-2 (16px total) | py-1.5 (12px total) |

### RecentOutputs データ source

- 旧: `campaigns: CampaignListItem[]` を受け取り placeholder 表示
- 新: `rows: OutputRow[]` (max 5) を受け取り 5-column 実 table 表示
- Source: `outputsListQuery` (lib/groq/outputs.ts) を Home page で並列 fetch
- 行の構造は OutputsTable と同期、columns は compact:
  - タイトル (+ campaignTitle subtitle, linkable)
  - 媒体 (PlatformBadge + label)
  - ステータス (StatusBadge + raw label)
  - 更新日 (JST tabular-nums)
  - 操作 (公開URL → ExternalLink / それ以外 → ChevronRight to publish-package)

### Shared component changes

| Component | 変更内容 | 影響範囲 |
|---|---|---|
| `Sidebar` | nav padding py-2 → py-1.5 | 全 23 routes (Sidebar は AppShell 経由で全 page 共通) |
| `RecentOutputsTable` | OutputRow 型ベースに rewrite | `/` Home のみ (他 page では import なし) |
| `TodayTasksCard` | dueLabel 右配置 + priority dot | `/` Home のみ |
| `ContentOutputConfiguratorCard` | FakeSelect h-9 | `/` Home のみ |

### 3-page tone consistency 検証

| 項目 | / | /campaigns/[slug] | /outputs | 結果 |
|---|---|---|---|---|
| max-width | `max-w-[1280px]` | `max-w-[1280px]` | `max-w-[1280px]` | ✓ |
| padding | `px-4 py-6 sm:px-6 lg:px-8` | 同 | 同 | ✓ |
| section gap | `gap-5` | `gap-5` | `gap-5` | ✓ |
| card | `rounded-lg border-slate-200 bg-white shadow-sm` | 同 | 同 | ✓ |
| heading | `text-base font-semibold text-slate-900` | 同 | 同 | ✓ |
| KPI value | `text-3xl font-semibold tabular-nums leading-none` | 同 | 同 | ✓ |
| table row | `px-4 py-3` (standard) / `px-4 py-2.5` (Recent compact) | `px-4 py-3` (PublishingScheduleTable) | `px-4 py-3` (OutputsTable) | ✓ (Recent は意図的 compact) |
| select | `h-9 rounded-md border-slate-200 shadow-sm` (Configurator FakeSelect) | — | `h-9 rounded-md border-slate-200 shadow-sm` (FilterBar) | ✓ |
| badge | per-tone semantic map (`StatusBadge` / `PlatformBadge` 共通) | 同 | 同 | ✓ |

3 page で tone unified。差は意図的な compact 化のみ。

### Build result

```
Route (app) — 23 routes (unchanged)
TypeScript clean
Sanity Studio 7.8s clean
```

## 5. Key Decisions

- **`OutputRow` 共通化**: 「DataTable 抽象化を force しない」boss 指示は守りつつ、`OutputRow` 型 + `buildOutputRows` 関数だけは 3 page で共有。これにより `/` Home の RecentOutputsTable と `/outputs` の OutputsTable が「同じ Output を見せている」確信を保てる
- **2 query 並列 fetch**: `Promise.all([fetchHome(), fetchOutputs()])` で TTFB 影響最小化。boss が Phase UI-6 で Activity log 等を追加するときも同パターンで拡張
- **TodayTasks の priority dot**: AlertCircle は警告感が強すぎた。dot にすることで「優先度の indicator」として機能、warning-heavy さを抑制
- **dueLabel 右端配置**: reference 画像で時刻が垂直に揃って読みやすい点を再現。複数 task でも視線がブレない
- **Configurator h-9 統一**: FilterBar / TodayTasks / Configurator で「これ select だな」が一目でわかる density
- **Sidebar py-1.5**: 9 nav items + 4 group labels + workspace block で sidebar が縦に伸びすぎていた。1 row 2px の積み重ねで全体 18px 余白回収
- **KPI sparkline 継続**: boss 確定「Analytics phase まで preview」。捏造データ感の懸念は handoff §6 / §7 に明記
- **Sidebar py-1.5 を 23 routes 全てに反映**: shared component なので影響範囲広いが、polish (visual only) でロジック変更なし、回帰リスク極小

## 6. Human Review Questions

1. **TodayTasksCard の dueLabel 右配置**: 視認性向上を狙ったが、boss が「title と一体感がほしい」場合は左配置に戻す option
2. **KPI sparkline placeholder**: boss は「Analytics phase まで」と確定したが、実機で「捏造感がある」と感じた場合は `sparkline` prop を home page から削除する microbatch あり
3. **Sidebar py-1.5**: 9 nav items + group labels で「窮屈すぎる」と感じる場合は py-2 に戻す
4. **RecentOutputsTable の 5 column 構成**: タイトル / 媒体 / ステータス / 更新日 / 操作 で十分か、boss が「キャンペーン列を独立で見たい」と希望すれば 6 columns 化
5. **Configurator FakeSelect の `<label>` semantic 変更**: `<div>` → `<label>` で a11y 改善。boss feedback なければそのまま
6. **3 page tone consistency**: max-w-[1280px] / gap-5 / card style 全て一致。boss が「もっと密 / 緩」と感じる箇所があるか

## 7. Risks or Uncertainties

- **`outputsListQuery` を Home でも fetch**: dataset 規模が大きくなると 2 query のレイテンシが目立つ可能性。Phase UI-3 以降で `dashboardHomeQuery` に小型 outputs subquery を統合する選択肢あり
- **Sidebar py-1.5 影響範囲**: 23 routes 全てで sidebar 高さが変わる。boss の操作感が変わる可能性、必要なら revert 1 line
- **`OutputRow` 共通化の副作用**: `/outputs` の OutputsTable と `/` の RecentOutputsTable が同じ `bucket` mapping を使う。dataset で bucket 分布が偏ると Home の Recent が「ほぼ全部 published」になり退屈な見た目になる
- **TodayTasks の dueLabel scan 改善**: 現状 7 件中 5 件が text (今日 10:00 等)、残りは 完了 / 優先度高 等の文字列。time-only にすると揃って scan 可能、混在すると一部だけ位置がずれて見える
- **`<label>` を Configurator に**: native form 動作はなくレイアウト的 wrap だが、screen reader の announcing が増える可能性。a11y には有利

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` で 5 page 実機確認:
   - `/` Home の RecentOutputs / TodayTasks / Configurator / Sidebar
   - `/campaigns/building-hitori-media-os` の UI-fidelity-1 + sidebar height 影響
   - `/outputs` の UI-fidelity-2 + sidebar height 影響
   - `/campaigns` list の状態
   - `/publish-package/building-hitori-media-os` v0.2 動作
2. tone の微調整があれば microbatch
3. 違和感なければ次の選択肢:
   - **Publish Management fidelity spec** — `/publish` を `13_02_43 (5).png` 準拠で spec 化 (Phase UI-3 で実装)
   - **Output Configurator fidelity spec** — `13_02_43 (3).png` を spec 化 (Phase UI-4 着手準備)
   - **Visual Review fidelity spec** — `13_02_43 (6).png` を spec 化 (Phase UI-5)

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup (`PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` 等)

## 9. Exact Codex Prompt for "Publish Management fidelity spec"

```text
Create fidelity spec for /publish (Publish Management) page.

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png
- Current state: dashboard/src/app/publish/page.tsx is currently a PhasePlaceholder
- Reference docs:
  - docs/68 (design system)
  - docs/69 (implementation plan)
  - docs/handoff/0147 (latest design tone after fidelity 1-3)

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch.
- Do NOT modify Sanity schema.
- Do NOT add packages.
- Do NOT modify other pages.
- Audit-only docs deliverable.

Tasks:

1. Analyze ideal screenshot and identify:
   - page structure (header / KPI / table / sidebar / etc)
   - components
   - color tones
   - missing data sources

2. Compare with current placeholder (current is empty):
   - All sections will be net-new

3. Create docs:
   - docs/75-publish-management-fidelity-spec.md
     - page structure diff
     - component diff (table)
     - visual fidelity checklist (~30+ items)
     - P0/P1/P2 implementation order
     - files likely affected
     - data sources (manualPublishingStatus, substackGrowthAction, etc)
   - docs/devlog/<番号>-publish-management-fidelity-spec.md
   - docs/handoff/<番号>-publish-management-fidelity-spec.md
   - docs/handoff/latest.md (mirror)

4. Exact Codex prompt for Phase UI-fidelity-4 (Publish Management implementation) included in handoff §9.

Validation:
- npm run build
- cd dashboard && npm run build
(docs-only, both builds remain unchanged)
```
