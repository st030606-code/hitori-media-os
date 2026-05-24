# Devlog 0151 — Phase UI-fidelity-9 Final placeholder pages implementation

日付: 2026-05-20

## 背景

docs/79 / handoff/0161 で確定した spec を実装する batch。`/analytics` / `/knowledge` / `/settings` の 3 placeholder page を Phase UI-fidelity-1〜8 と同じ design tone (PageHeader + Breadcrumb + KpiCardsRow + 直書き section + read-only) に揃え、Hitori Media OS の main UI surface を一巡させる。

boss 確認済 scope:
- rename: 「アナリティクス」「ナレッジDB」「設定」(現状の日本語をそのまま採用)
- /analytics: 新 query なし、既存 `dashboardHomeQuery` + `outputsListQuery` を `Promise.all` で並列 fetch + page 側 aggregation
- /knowledge: 既存 `configuratorOptionsQuery` を流用、新 query 0
- /knowledge Tabs: `common/Tabs.tsx` (Phase UI-fidelity-1) を流用
- /knowledge card click → Studio document URL を target="_blank"
- /settings secret 表示: env name + on/off のみ、値の中身は出さない
- 1 batch でまとめて実装 (Option A)
- shadcn 追加なし、native HTML + Tailwind のみ
- LearningInsights は analytics-specific component で OK (Dashboard 版との共通化は force しない)

## 決定・変更

### 新規 component (18)

**knowledge (6)**:
- `ContentIdeaCard.tsx` — 1 idea を card 化、3 stat tile + audience chips + Studio link
- `ContentIdeaCardGrid.tsx` — 3-col grid + empty state
- `BrandList.tsx` — brandProfile を 2-col card で、defaultPlatforms に PlatformBadge
- `StyleList.tsx` — visualStyleProfile を divide-y で簡素表示
- `PromptTemplateTable.tsx` — promptTemplate を table 形式 (title / category / version / brand / style / status)
- `KnowledgeView.tsx` — client wrapper、Tabs で 4 tab を切り替え

**analytics (6)**:
- `PlatformPerformanceCard.tsx` — 媒体ごとの publishedCount / reactionNotes / pending を bar 表示
- `CampaignAnalyticsTable.tsx` — キャンペーン別 rollup table (公開済み / 反応 / 媒体数 / 最終公開 / 操作)
- `ReactionNotesCard.tsx` — 直近 8 件の reactionNotes を line-clamp 2 で
- `PendingMonitoringCard.tsx` — 24h+ 経過 + reactionNotes 未記入の publication 上位 6 件
- `FutureIntegrationCard.tsx` — 外部 API placeholder (Plausible / X / note / Substack)
- `LearningInsightsCard.tsx` — 直近 5 件の devlog 抜粋 (analytics specific)

**settings (7)**:
- `WorkspaceCard.tsx` — projectId / dataset / apiVersion / read token 状態 + Studio link
- `FeatureFlagsCard.tsx` — 3 flag table (env name / current / dev / prod default)、secret は出さない
- `LocalDevCard.tsx` — 5 起動コマンド + 3 ショートカット link
- `SafetyReadOnlyCard.tsx` — emerald banner で read-only 明示、書き込み surface 4 種を列挙
- `GenerationSettingsCard.tsx` — CLAUDE.md content quality rules を chip (positive/negative tone)
- `PublishingSettingsCard.tsx` — auto-post: never + 承認フロー explanation
- `FutureIntegrationsCard.tsx` — billing / team / external analytics / AI auto-gen の 4 placeholder

### 更新 (3 page)

- `dashboard/src/app/knowledge/page.tsx` — PhasePlaceholder から PageHeader + 4 KpiCard + KnowledgeView に置換
- `dashboard/src/app/analytics/page.tsx` — PhasePlaceholder から PageHeader + 5 KpiCard + 2-col grid (PlatformPerformance + CampaignAnalyticsTable + LearningInsights 左、ReactionNotes + PendingMonitoring + FutureIntegration 右) に置換
- `dashboard/src/app/settings/page.tsx` — PhasePlaceholder から PageHeader + 2-col 6 card + full-width FutureIntegrationsCard に置換

### データ取得 (新 query なし)

- `/knowledge`: `configuratorOptionsQuery` を 1 度呼ぶだけ
- `/analytics`: `Promise.all([dashboardHomeQuery, outputsListQuery, readLatestDevlogs()])` の並列 fetch + page 側 aggregation (`buildPlatformStats` / `buildCampaignRows` / `buildReactionRows` / `buildPendingRows`)
- `/settings`: `lib/featureFlags.ts` exports + `lib/sanity.ts` `sanityConfig` を直 import

### devlog reader (analytics 内 inline)

`/analytics` の LearningInsightsCard 用に minimal devlog reader (parseFrontmatter + buildExcerpt + readLatestDevlogs) を page 内に inline。activity-log の同 logic と類似だが、本 batch では共通化せず inline で完結 (shared helper 抽出は別 microbatch 候補)。

### Sidebar / nav

9 nav items の最後の 3 (`knowledge` / `analytics` / `settings`) が fidelity 化完了。Sidebar 全 nav items が fidelity 化済になる。

## 理由

- **既存 query の page 側 aggregation**: 新 `lib/groq/analytics.ts` を立てるより、`outputsListQuery` の `campaigns[].items[]` (manualPublishingStatus proxy rows) を walk するほうが scope 最小。YAGNI
- **`/knowledge` の Tabs を採用**: 4 tab を 1 page で切り替え + count chip 付きで、boss が「どの種類が何件あるか」を 1 視野で把握できる
- **Studio link を `target="_blank"`**: dashboard を離れず別タブで Studio を開く、boss が両方を行き来できる
- **secret 表示なし**: 「read token: 設定済み (値は非表示)」と明示。token の中身は dashboard でも server-side 限定で、`sanityConfig.hasReadToken` boolean のみ client 渡し
- **CLAUDE.md rules を chip 化**: 完全な markdown render より、6 rules を chip でビジュアル化したほうが視認性高い。boss が rule を編集したいときは依然 CLAUDE.md 直接編集
- **LearningInsightsCard を analytics specific に**: Dashboard 既存と共通化すると LearningInsight の型 / source が両方で揺れる。両方の component を分離して、それぞれが自分の data source を持つほうが疎結合
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜8 と同方針

## 影響

- **23 routes 動作維持**、dashboard TypeScript clean、Sanity Studio 8.0s clean
- **Sidebar 9 nav items 全 fidelity 化済** — Hitori Media OS の main UI surface が一巡
- **Phase UI-fidelity cycle 一段落** — 残る fidelity 未対応は `/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` (boss が touch しない方針の page 群)
- **新 query 0**、Sanity 書き込みなし、schema 変更なし、依存追加なし、deploy なし
- `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/publish-package/[slug]`, `/`, `/visual-assets/*`, `/publish-packages`, `/activity-log`, `/diagnostics` は完全 untouched

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 3 page 実機確認**:
   - `/knowledge` → 4 KpiCard + Tabs + 4 tab content、Studio link で別タブ
   - `/analytics` → 5 KpiCard + PlatformPerformance + CampaignAnalyticsTable + ReactionNotes + PendingMonitoring + LearningInsights + FutureIntegration
   - `/settings` → 2-col 6 card + FutureIntegrations footer
2. 違和感あれば microbatch
3. 完了後の選択肢:
   - **`/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` fidelity spec** — 最後の ReadOnlyBanner 削除を含む 3 page
   - **dashboard/README.md 全体書き直し** (Phase UI-fidelity-1〜9 の現状反映)
   - **Phase 2B 議論** (実 write actions の方針確定)
   - **Phase Admin 1 Batch A/B/C 時代 component audit** (CampaignStatusCard / NextActionSummary / 等の import 確認)
   - **promptTemplate dataset 投入** (boss 担当、/configurator + /knowledge の表示が充実する)

## 発信ネタ候補

- 「main UI surface が一巡した話」: Phase UI-fidelity-1〜9 で 9 nav items が揃った、なぜ 9 batch も必要だったかと、その途中で発見した tone 仕様の話
- 「新 query を立てない aggregation 戦略」: `/analytics` で既存 query を流用して page 側 aggregation した、新 query を立てない判断の根拠 (YAGNI + 1 round-trip 削減)
- 「設定画面は readout から始める」: write 機能を持たない `/settings` の価値、Phase 2B で書き込みを足すときに layout が既にあるという設計
