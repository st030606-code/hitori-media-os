# Handoff: Phase UI-fidelity-9 Final placeholder pages implementation

Date: 2026-05-20

## 1. Task Goal

docs/79 で確定した spec を 1 batch で実装し、`/analytics` / `/knowledge` / `/settings` を fidelity tone に揃える。Sidebar 9 nav items 全てが fidelity 化済となり、Hitori Media OS の main UI surface が一巡する。

新 query / 新 schema / write actions なし。すべて read-only。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 8.0s clean)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ `/`, `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/visual-assets/*`, `/publish-packages`, `/activity-log`, `/diagnostics` unchanged (shared common: PageHeader / KpiCard / Tabs / PlatformBadge / StatusBadge / CopyButton のみ reuse)
- ✅ secret 表示なし (env name + on/off / token boolean のみ、値は出さない)
- ✅ Phase 2B write actions 未実装

## 3. Changed Files

### 新規 (19)

knowledge (6):
- `dashboard/src/components/knowledge/ContentIdeaCard.tsx`
- `dashboard/src/components/knowledge/ContentIdeaCardGrid.tsx`
- `dashboard/src/components/knowledge/BrandList.tsx`
- `dashboard/src/components/knowledge/StyleList.tsx`
- `dashboard/src/components/knowledge/PromptTemplateTable.tsx`
- `dashboard/src/components/knowledge/KnowledgeView.tsx` (client)

analytics (6):
- `dashboard/src/components/analytics/PlatformPerformanceCard.tsx`
- `dashboard/src/components/analytics/CampaignAnalyticsTable.tsx`
- `dashboard/src/components/analytics/ReactionNotesCard.tsx`
- `dashboard/src/components/analytics/PendingMonitoringCard.tsx`
- `dashboard/src/components/analytics/FutureIntegrationCard.tsx`
- `dashboard/src/components/analytics/LearningInsightsCard.tsx`

settings (7):
- `dashboard/src/components/settings/WorkspaceCard.tsx`
- `dashboard/src/components/settings/FeatureFlagsCard.tsx`
- `dashboard/src/components/settings/LocalDevCard.tsx`
- `dashboard/src/components/settings/SafetyReadOnlyCard.tsx`
- `dashboard/src/components/settings/GenerationSettingsCard.tsx`
- `dashboard/src/components/settings/PublishingSettingsCard.tsx`
- `dashboard/src/components/settings/FutureIntegrationsCard.tsx`

### 更新 (3)

- `dashboard/src/app/knowledge/page.tsx`
- `dashboard/src/app/analytics/page.tsx`
- `dashboard/src/app/settings/page.tsx`

### 不変

- Sanity schema / API routes / publish-package / assets/visuals / patches
- すべての fidelity 化済 page (Phase UI-fidelity-1〜8)
- 共通 helper (PageHeader / KpiCard / Tabs / PlatformBadge / StatusBadge / CopyButton / lib/featureFlags / lib/sanity / lib/groq/configurator / lib/groq/campaign / lib/groq/outputs)

### 新規 docs

- `docs/devlog/0151-ui-fidelity-9-final-placeholder-pages.md`
- `docs/handoff/0162-ui-fidelity-9-final-placeholder-pages.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Dependencies changed

**なし**。lucide-react は既存、shadcn 追加なし。

### 4-2. Routes implemented (3)

| Route | Title | Layout |
|---|---|---|
| `/knowledge` | ナレッジDB | PageHeader + Breadcrumb + 4 KpiCard (アイデア/ブランド/スタイル/プロンプト) + Tabs (common/Tabs reuse) で 4 tab content |
| `/analytics` | アナリティクス | PageHeader + Breadcrumb + 5 KpiCard (公開済み/反応ノート/キャンペーン/媒体/直近の出力) + 2-col grid (PlatformPerformance + CampaignAnalyticsTable + LearningInsights 左、ReactionNotes + PendingMonitoring + FutureIntegration 右) |
| `/settings` | 設定 | PageHeader + Breadcrumb + 2-col grid (Workspace / FeatureFlags / LocalDev / Safety / Generation / Publishing) + full-width FutureIntegrations |

全 3 page で `max-w-[1280px]` + `gap-5` + design tone consistency。

### 4-3. Components created (19)

`dashboard/src/components/knowledge/` (6) / `analytics/` (6) / `settings/` (7) に分割配置。詳細は §3「新規」。

### 4-4. Data sources used

| Source | Page | Method |
|---|---|---|
| `configuratorOptionsQuery` | `/knowledge` | 1 fetch で 4 list (contentIdea / promptTemplate / brandProfile / visualStyleProfile) |
| `dashboardHomeQuery` | `/analytics` | top-level counts (campaign / publishing / idea) |
| `outputsListQuery` | `/analytics` | manualPublishingStatus proxy rows をすべて取得、page 側 aggregation |
| `readLatestDevlogs()` (page-local fs reader) | `/analytics` | docs/devlog/*.md 上位 5 件、parseFrontmatter + buildExcerpt |
| `lib/featureFlags.ts` exports | `/settings` | 3 flag + runtime |
| `lib/sanity.ts` `sanityConfig` | `/knowledge`, `/settings` | projectId / dataset / apiVersion / hasReadToken (boolean only) |
| `NEXT_PUBLIC_STUDIO_BASE_URL` env | `/knowledge`, `/settings` | Studio external link |

**新規 GROQ query: 0**。`/analytics` は既存 2 query を `Promise.all` で並列 fetch + 4 aggregation function (`buildPlatformStats` / `buildCampaignRows` / `buildReactionRows` / `buildPendingRows`) を page 側で実行。

### 4-5. Read-only / secret handling

- `/settings/WorkspaceCard`: projectId / dataset / apiVersion は表示 (公開情報)、`hasReadToken: boolean` のみで token 値は **完全に非表示**
- `/settings/FeatureFlagsCard`: env 変数 **名** + 現在値 (`enabled`/`disabled`/`fs`/`snapshot`) + dev / prod default のみ。secret を含む env (`SANITY_READ_TOKEN` 等) は表示しない
- `/settings/SafetyReadOnlyCard`: dashboard が read-only であることを emerald banner で明示、書き込み surface 4 種 (Sanity Studio / Visual Register / Codex CLI / リポジトリ手動編集) を列挙
- `/settings/PublishingSettingsCard`: `auto-post: never` chip + 承認フロー explanation
- `/analytics`, `/knowledge` も write action ゼロ。すべて external link / inter-app link のみ

### 4-6. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7971ms) clean
```

23 routes 健在:

```
/, /_not-found, /activity-log, /analytics, /api/asset-thumb,
/api/visual-review/assets/[assetId]/candidates,
/api/visual-review/candidate-image, /api/visual-review/inbox,
/api/visual-review/review-manifest,
/campaigns, /campaigns/[slug], /configurator, /diagnostics,
/human-review-gates, /knowledge, /outputs, /publish,
/publish-package/[slug], /publish-packages, /settings,
/visual-assets, /visual-assets/[assetId],
/visual-assets/[assetId]/candidates
```

**Sidebar 9 nav items 全てが fidelity 化済**:
- ダッシュボード (UI-2 / UI-2.5 / UI-fidelity-3)
- キャンペーン (UI-fidelity-1 detail; list は別 batch)
- 出力コンフィギュレーター (UI-fidelity-5)
- 出力管理 (UI-fidelity-2)
- 公開管理 (UI-fidelity-4)
- 図解レビュー (UI-fidelity-6 / 7)
- ナレッジDB (UI-fidelity-9、本 batch)
- アナリティクス (UI-fidelity-9、本 batch)
- 設定 (UI-fidelity-9、本 batch)

## 5. Key Decisions

- **既存 query の page 側 aggregation (`/analytics`)**: 新 `lib/groq/analytics.ts` を立てるより、`outputsListQuery.campaigns[].items[]` (manualPublishingStatus proxy) を walk するほうが scope 最小、新 query / 新 type なし
- **`/knowledge` で `configuratorOptionsQuery` をそのまま流用**: query を新設せず、1 fetch で 4 list を取得。/configurator と /knowledge で同じ data source を共有
- **Tabs (`common/Tabs.tsx`) を流用**: Phase UI-fidelity-1 で建てた hand-rolled Tabs を流用。keyboard nav + active state + tabpanel a11y も継承
- **Studio link を `target="_blank"`**: dashboard を離れず別タブで Studio を開く、boss が両者を行き来できる
- **secret は表示しない**: token 値の中身は dashboard server-side 限定。`hasReadToken: boolean` のみで boss に伝える
- **CLAUDE.md rules を chip 化**: 完全な markdown render より、6 rules を chip (positive/negative tone) で表示するほうが視認性高い
- **LearningInsights は analytics-specific component**: Dashboard 既存と forced 共通化せず、両方で独立に保つ (data source の揺れを避ける)
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜8 と同方針
- **inline devlog reader (`/analytics`)**: activity-log の同 logic を共通化せず、analytics page 内に minimal version を inline (scope 最小)

## 6. Human Review Questions

1. **`/knowledge` の Tab 順序**: 「アイデア / ブランド / スタイル / プロンプト」で良いか? 使用頻度の高い順に並べるなら別案あり
2. **`/analytics` の KpiCard secondary 文言**: 「manualPublishingStatus.publishedUrl」「24-72h 後に手動記録」等の technical 文言、boss が違和感あれば 1 段ぼかす
3. **`/analytics` の dataset 偏り**: 現状 reactionNotes は少数、PlatformPerformanceCard の bar が単一 platform に偏る可能性。boss が複数 campaign × 媒体で feedback 待ち
4. **`/settings` の Generation rules を CLAUDE.md と同期する仕組み**: 現状 hardcoded、boss が CLAUDE.md を編集したら settings の chip も差し替える必要。Phase 2B で fs read 化する選択肢
5. **`/settings` の `runtime` meta**: `development` / `production` の表示、boss が「Vercel deploy 環境名 (preview / production-canary 等)」を出したい希望ある?
6. **PendingMonitoring の閾値 (24h)**: boss が「12h で reminder したい / 72h で初めて出したい」希望あれば microbatch で調整可能
7. **inline devlog reader の共通化**: activity-log と analytics で同 parseFrontmatter / buildExcerpt logic が重複。次の cleanup で共通化するか?

## 7. Risks or Uncertainties

- **`/analytics` の dataset 偏り**: 現状 reactionNotes が記入されている publication は限られる → カードによっては「— 件」表示。boss が複数公開を実施した後で再評価
- **`/knowledge` の promptTemplate 未投入**: dataset 投入は boss 担当、PromptTemplateTable は empty state で graceful。1 件投入後の確認推奨
- **`/settings` の Vercel preview deploy**: production / development の 2 値だけだと preview deploy が「production」と表示される可能性 (Vercel preview は通常 NODE_ENV=production)。boss が違和感感じれば preview branch 検知の追加検討
- **inline devlog reader の重複**: activity-log と analytics で同 logic、コードベース読みづらさが微増。共通化 microbatch 候補
- **Studio link の env**: `NEXT_PUBLIC_STUDIO_BASE_URL` を設定していないと `localhost:3333` 固定。Vercel 本番では Studio URL が違うので、env を boss 環境で設定するか docs 化する必要
- **`/analytics` の `Promise.all` 失敗時の挙動**: 1 つでも reject すると page 全体が error。本 batch では catch なし (回帰しないため)、本番運用で問題なら try/catch microbatch 候補

## 8. Remaining Gaps

### 短期 (microbatch、低リスク)

- `/analytics` と `/activity-log` の devlog reader 共通化 (`lib/devlog/readDocs.ts` 抽出)
- `/settings` の Vercel preview deploy 名検知 (`process.env.VERCEL_ENV`)

### 中期 (`/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` の fidelity 化と同時)

- `ReadOnlyBanner.tsx` 削除 (3 page で残り 5 import)

### 長期 (Phase 2+)

- 外部 analytics API integration (Plausible / X / note / Substack) — Phase Analytics-2
- reactionNotes writable — Phase 2B
- env 編集 UI — Phase 2B
- workspaceProfile schema (multi-workspace) — Phase Settings-2
- billing integration — Phase Billing
- `DeferredActionButton` / `LocalModeBanner` — Phase 2B / Phase D2 で役目を終える
- Phase Admin 1 Batch A/B/C 時代 component (`CampaignStatusCard` 等) の audit + cleanup

## 9. Next Recommended Step

**Option A — `/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` fidelity spec (推奨)**

最後の ReadOnlyBanner 利用箇所を整理する spec docs only batch。実装で ReadOnlyBanner を削除、Hitori Media OS の fidelity 化が完全に完了する。

**Option B — dashboard/README.md 全体書き直し**

Batch B/C/D 時代の構造記述を Phase UI-fidelity-1〜9 の現状に更新。

**Option C — Phase 2B 議論**

実 write actions (Approve & register / Regenerate / reactionNotes writable / Sanity controlled write) の方針確定。

**Option D — promptTemplate dataset 投入 (boss 担当)**

`/configurator` の RecommendedTemplatesCard と `/knowledge` の PromptTemplateTab を埋めるための dataset 整備。

**Option E — Phase Admin 1 Batch A/B/C 時代 component audit**

`CampaignStatusCard` / `NextActionSummary` / `NextActionChecklist` / `WorkingPipelineStatus` / `PublishReadinessBoard` / `PublishPackageLinks` / `ManualPublishingStatusList` / `PromptTemplateSummary` / `HumanReviewGateList` / `VisualAssetStatusTable` / `ReleaseReviewLinks` / `SelectedPlatformChips` の import 数を grep で確認、削除候補を抽出。

**Option F — devlog reader 共通化 microbatch**

`lib/devlog/readDocs.ts` 抽出、`/analytics` と `/activity-log` から呼ぶ。
