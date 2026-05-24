# Handoff: Final Placeholder Pages Fidelity Spec (docs only)

Date: 2026-05-20

## 1. Task Goal

`/analytics`, `/knowledge`, `/settings` の 3 placeholder page を Phase UI-fidelity-1〜8 と同じ design tone に揃えるための implementation-ready spec を作成する **audit + docs only** batch。

3 page はすべて現状 `<PhasePlaceholder />` のみ。実装すれば Sidebar 9 nav items 全てが fidelity 化済となり、Hitori Media OS の main UI surface が一巡する。

コード変更ゼロ。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (build 不変)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ Phase UI-fidelity-1〜8 で fidelity 化済 page も unchanged

## 3. Changed Files

### 新規 docs (4)

- `docs/79-final-placeholder-pages-fidelity-spec.md`
- `docs/devlog/0150-final-placeholder-pages-fidelity-spec.md`
- `docs/handoff/0161-final-placeholder-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Routes audited (3)

| Route | 現状 | 行数 | Phase 想定 |
|---|---|---|---|
| `/analytics/page.tsx` | PhasePlaceholder「アナリティクス」 | 12 行 | UI-6 |
| `/knowledge/page.tsx` | PhasePlaceholder「ナレッジDB」 | 12 行 | UI-6 |
| `/settings/page.tsx` | PhasePlaceholder「設定」+ /diagnostics リンク | 33 行 | UI-7+ |

すべて `max-w-3xl` の center-aligned dashed border card、現 fidelity 基準 (`max-w-[1280px]` + PageHeader + Breadcrumb) と未整合。

### 4-2. Specs created

`docs/79-final-placeholder-pages-fidelity-spec.md` の構成:

- **A. /analytics fidelity spec** — current placeholder / target role (公開後の反応 loop) / 5 KpiCard / 2-col grid (PlatformPerformance + CampaignAnalytics + LearningInsights 左、ReactionNotes + PendingMonitoring + FutureIntegration 右) / data sources / P0-P2 / files
- **B. /knowledge fidelity spec** — 4 知識資産 (idea / brand / style / prompt) を Tabs で横断、既存 `configuratorOptionsQuery` を流用、ContentIdeaCardGrid + BrandList + StyleList + PromptTemplateTable
- **C. /settings fidelity spec** — 2-col 6 card (Workspace / FeatureFlags / LocalDev / Safety / Generation / Publishing) + 1 full-width FutureIntegrationsCard
- **D. Data source planning** — 既存利用可能 / 新規必要 / Future / NOT used を表で整理
- **E. Implementation order** — Option A (1 batch、推奨) / Option B (分割) / Option C (並列)
- **F. Constraints** — 23 routes 維持 / read-only / no schema / no external API
- **G. Boss decision points** — 8 件
- **H. Out of scope** — schema 変更 / 外部 API / Phase 2B write / multi-workspace
- **I. Post-implementation expected state** — Sidebar 9 nav items 全 fidelity 化、main UI 一巡

### 4-3. Data sources (横断 summary)

**既存で利用可能**:
- `dashboardHomeQuery` (lib/groq/campaign.ts) — campaign / publishing / idea counts
- `outputsListQuery` (lib/groq/outputs.ts) — recent outputs
- **`configuratorOptionsQuery`** (lib/groq/configurator.ts) — `/knowledge` で contentIdea / promptTemplate / brandProfile / visualStyleProfile **すべて 1 query で**
- `readDocsFromFs('devlog')` — `/analytics` LearningInsights 用 (existing)
- `lib/featureFlags.ts` exports (`isProductionRuntime`, `enableDiagnostics`, `enableLocalFsRoutes`, `activityLogMode`)
- `lib/sanity.ts` exports (`sanityConfig`, `studioDocumentUrl()`)

**新規が必要 (option)**:
- `lib/groq/analytics.ts` — reactionNotes aggregation + platform performance + pending monitoring。または既存 query を `Promise.all` で並列 fetch + page 側で aggregation
  - **推奨**: 後者 (新 query を作らない、YAGNI)

**Future (P2+)**:
- 外部 analytics API (Plausible / X / note) — Phase Analytics-2
- workspaceProfile schema — Phase Settings-2
- billing integration — Phase Billing

### 4-4. P0 / P1 / P2 scope

| Page | P0 | P1 | P2 |
|---|---|---|---|
| /analytics | PageHeader + 5 KpiCard / PlatformPerformance / CampaignAnalyticsTable / ReactionNotes | LearningInsights / PendingMonitoring / FutureIntegration | 外部 API / reactionNotes writable / per-campaign deep-dive |
| /knowledge | PageHeader + 4 KpiCard / Tabs / 4 tab content (CardGrid + 3 List/Table) / 既存 query 流用 | FilterBar / sort / Studio link / 詳細展開 | configurator deep-link / リバース検索 / リレーション graph |
| /settings | PageHeader + 2-col / Workspace / FeatureFlags / LocalDev / Safety | Generation / Publishing / FutureIntegrations | workspaceProfile schema / env 編集 / billing |

詳細は docs/79 §A-6 / B-6 / C-6。

### 4-5. Recommended implementation order

**Option A — `/knowledge` → `/analytics` → `/settings` の 1 batch (推奨)**

- `/knowledge`: pilot。既存 `configuratorOptionsQuery` をそのまま流用、新 query 0
- `/analytics`: 中規模。reactionNotes aggregation が必要
- `/settings`: 最も静的、既存 module exports を render するだけ

**1 batch でまとめる利点**: Phase UI-fidelity-6〜8 と同様の規模感、boss 確認 1 度、Sidebar 9 nav items 全 fidelity 化が 1 PR で完結。

### 4-6. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged、コード差分なし)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (unchanged)
```

両 build とも前 batch (handoff/0160) 完了時から不変。

## 5. Key Decisions

- **1 batch でまとめる推奨**: 3 page 独立で依存なし、共通の `PageHeader + KpiCardsRow + design tone` pattern を踏襲、1 PR で main UI 一巡が完結
- **`/knowledge` を pilot route**: 既存 query を流用、新 GROQ 0、最も実装が軽い
- **`/analytics` の新 query 立てない方針**: 既存 `dashboardHomeQuery` + `outputsListQuery` を `Promise.all` で並列 fetch + page 側で aggregation。YAGNI
- **`/settings` は read-only 完結**: 既存 module exports を直 render、書き込みは scope 外
- **secret は表示しない**: env 変数の値 (token 等) は表示せず、name + on/off + production default のみ
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜8 と同方針
- **Phase 2B write は spec out of scope**: reactionNotes writable / env 編集 / billing 等

## 6. Human Review Questions

1. **rename**: 「アナリティクス」 / 「ナレッジDB」 / 「設定」 のままで良いか、それとも「分析」「ナレッジ」「環境」等に短縮するか
2. **`/analytics` の新 query 戦略**: 既存 query 並列 fetch (推奨、YAGNI) で良いか、それとも専用 `lib/groq/analytics.ts` を新設するか
3. **`/knowledge` の Tabs**: `common/Tabs.tsx` 既存 (Phase UI-fidelity-1) を流用で OK か
4. **`/knowledge` の card click 先**: 現状 `/configurator?ideaId=...` の searchParams は未実装、当面は Studio document URL に link でよいか
5. **`/settings` の secret 表示**: env name + on/off のみで良いか、それとも一部の値 (例: `NODE_ENV`) は表示するか
6. **`/settings` の FutureIntegrationsCard 項目**: billing / team / external analytics / AI auto-gen の 4 つで網羅されているか
7. **3 page を 1 batch か段階か**: Option A (1 batch、推奨) で OK か
8. **共通コンポーネント抽出**: `/analytics` 内 LearningInsightsCard は Dashboard 既存 `LearningInsightsCard` と重複、共通化 (`common/` へ移動) するか、別々に置くか

## 7. Risks or Uncertainties

- **`/analytics` の dataset 偏り**: 現状 reactionNotes が記入されている publication は限られる → 「反応ノート」KpiCard が「— 件」と寂しく見える可能性。Empty state で「24-72h 後に boss が記入する想定」明記が必要
- **`/knowledge` の dataset 偏り**: promptTemplate がまだ Sanity に投入されていない → 4 tab のうち PromptTemplateTab が empty。boss が dataset 投入してから boss 確認推奨
- **`/settings` の Phase 表記**: `/settings` の boss-facing label に Phase 名 (UI-9 等) を出すべきか、boss は気にしないか
- **`/analytics` の 公開済み件数 vs reactionNotes 件数 の乖離**: 24-72h reactionNotes ワークフローを knowing でない人には「Why は反応データがないんだ?」と疑問。description で明示
- **Studio document URL の external 移動**: `/knowledge` で Studio に飛ばすと boss が dashboard に戻りにくい。新タブで開くべき (target="_blank")
- **mobile responsive**: 2-col layout / Tabs を mobile で見せる UX 確認、`sm:grid-cols-2` / `flex flex-col` で対応するが boss が違和感感じれば polish microbatch

## 8. Next Recommended Step

1. **boss が docs/79 を読む**:
   - §A / B / C で各 page の target structure に違和感ないか
   - §G boss decision points 8 件を回答
   - §E implementation order の Option A (1 batch) で進めるか
2. boss OK → Phase UI-fidelity-9 (final placeholder pages implementation) 着手
3. 実装完了後の post-state:
   - Sidebar 9 nav items 全 fidelity 化
   - Hitori Media OS main UI 一巡
4. 並行 / 後続候補:
   - 「中期」cleanup: ReadOnlyBanner 削除 (`/campaigns` / `/human-review-gates` / `/publish-package/[slug]` fidelity 化と同時)
   - dashboard/README.md 全体書き直し
   - Phase 2B 議論 (実 write actions)
   - Phase Admin 1 Batch A/B/C 時代の component audit

## 9. Exact Codex Prompt for Phase UI-fidelity-9 (final placeholder pages implementation)

```text
Implement Phase UI-fidelity-9: Final placeholder pages implementation.

Use:
- docs/79-final-placeholder-pages-fidelity-spec.md (this spec)
- docs/handoff/0161-final-placeholder-pages-fidelity-spec.md (this handoff、boss decisions が反映されたもの)
- docs/handoff/0160-final-old-component-cleanup.md (latest tone)

Boss-confirmed scope (handoff §6 で boss が回答した内容を確認してから着手):
- rename: 各 page のタイトル (boss 回答に従う)
- /analytics 新 query: 立てない、既存 query を Promise.all で並列 fetch + page 側 aggregation
- /knowledge Tabs: common/Tabs.tsx 既存を流用
- /knowledge card click 先: 当面は Studio document URL (target="_blank")
- /settings secret 表示: env name + on/off のみ、値は表示しない
- 1 batch でまとめて実装 (Option A、推奨)
- shadcn 追加なし、native HTML + Tailwind のみ

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals / patches
- Do NOT add packages
- Do NOT deploy / auto-post
- Keep all 23 routes working
- Keep /publish-package/[slug] unchanged
- Keep /, /configurator, /publish, /outputs, /campaigns/[slug], /visual-assets/*, /publish-packages, /activity-log, /diagnostics unchanged
- Phase 2B write actions は実装しない、すべて read-only

Tasks (P0):

1. Rewrite `/knowledge/page.tsx`:
   - PageHeader + Breadcrumb (max-w-[1280px])
   - 4 KpiCard: アイデア (Lightbulb, blue) / ブランド (Compass, purple) / スタイル (Palette, orange) / プロンプト (Wand2, emerald)
   - Tabs (common/Tabs reuse): contentIdea / brandProfile / visualStyleProfile / promptTemplate
   - Tab content components (新規):
     - knowledge/ContentIdeaCardGrid.tsx + ContentIdeaCard.tsx
     - knowledge/BrandList.tsx
     - knowledge/StyleList.tsx
     - knowledge/PromptTemplateTable.tsx
     - knowledge/KnowledgeView.tsx (client wrapper, Tab state)
   - 既存 configuratorOptionsQuery 流用、新 query 0
   - Empty state for 各 tab (dataset 未投入時)

2. Rewrite `/analytics/page.tsx`:
   - PageHeader + Breadcrumb
   - 5 KpiCard: 公開済み / 反応ノート / キャンペーン / 媒体 / 直近の出力
   - 2-col grid (lg:grid-cols-[3fr_2fr])
   - 新規 component:
     - analytics/PlatformPerformanceCard.tsx
     - analytics/CampaignAnalyticsTable.tsx
     - analytics/ReactionNotesCard.tsx
     - analytics/PendingMonitoringCard.tsx (P1 候補だが本 batch で実装 OK)
     - analytics/FutureIntegrationCard.tsx (P1)
   - データ: dashboardHomeQuery + outputsListQuery を Promise.all で並列 fetch、page 側で aggregation
   - LearningInsightsCard は Dashboard 既存を reuse (path: components/dashboard/LearningInsightsCard.tsx) or 新規 components/analytics/LearningInsightsCard.tsx

3. Rewrite `/settings/page.tsx`:
   - PageHeader + Breadcrumb
   - 2-col grid (lg:grid-cols-2)
   - 新規 component:
     - settings/WorkspaceCard.tsx (sanityConfig 表示)
     - settings/FeatureFlagsCard.tsx (3 flags + production default)
     - settings/LocalDevCard.tsx (起動コマンド一覧 + /diagnostics / /activity-log link)
     - settings/SafetyReadOnlyCard.tsx (read-only 状態の説明)
     - settings/GenerationSettingsCard.tsx (P1、CLAUDE.md rules chip)
     - settings/PublishingSettingsCard.tsx (P1、auto-post: never chip)
     - settings/FutureIntegrationsCard.tsx (P1、billing / team / external analytics / AI auto-gen)
   - 既存 lib/featureFlags.ts / lib/sanity.ts を直 import

4. Builds:
   - `cd dashboard && npm run build` (23 routes 維持)
   - `npm run build` (Sanity Studio clean)

5. Docs:
   - `docs/devlog/0151-ui-fidelity-9-final-placeholder-pages.md`
   - `docs/handoff/0162-ui-fidelity-9-final-placeholder-pages.md`
   - `docs/handoff/latest.md` (mirror)

Validation:
- 全 23 routes が build green
- /knowledge で 4 KpiCard + Tabs + 4 tab content
- /analytics で 5 KpiCard + 2-col grid with PlatformPerformance + CampaignAnalytics + ReactionNotes
- /settings で 2-col 6 card + FutureIntegrations footer
- Sidebar 9 nav items 全 fidelity 化済
- 既存 page touch なし
```
