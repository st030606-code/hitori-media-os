# Final Placeholder Pages Fidelity Spec — /analytics, /knowledge, /settings

最終更新: 2026-05-20
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 routes:
- `/analytics` (現状 PhasePlaceholder「アナリティクス」)
- `/knowledge` (現状 PhasePlaceholder「ナレッジDB」)
- `/settings` (現状 PhasePlaceholder「設定」+ /diagnostics リンク)

依存: docs/68 (design system) / docs/69 (Phase UI plan) / docs/77 / docs/78 / docs/handoff/0160 (latest tone after final cleanup)

## なぜこの 3 page をまとめるか

`/configurator` / `/outputs` / `/publish` / `/visual-assets/*` / `/publish-packages` / `/activity-log` / `/diagnostics` が fidelity 化された今、Sidebar に並ぶ最後の utility surface は `/analytics` / `/knowledge` / `/settings` の 3 page だけ。すべて現状 `PhasePlaceholder` (max-w-3xl の dashed border の center-aligned 案内 card) のままで、Hitori Media OS の main UI surface が完結していない。

3 page は依存関係なし、すべて UI のみ (新 schema / write actions 不要)、共通の `PageHeader + Breadcrumb + max-w-[1280px]` pattern を踏襲できるので 1 spec + 1 implementation batch でまとめて fidelity 化できる。

完了すると **Sidebar の 9 nav items 全てが fidelity 化済** となり、Phase UI-fidelity の cycle が一段落する。

---

## A. `/analytics` fidelity spec

### A-1. Current placeholder structure

```tsx
<PhasePlaceholder
  title="アナリティクス"
  phase="UI-6"
  description="公開後の反応・エンゲージメントを集計し、次キャンペーンの learning に変える画面の準備中です。"
/>
```

- file: `dashboard/src/app/analytics/page.tsx` (12 行)
- layout: `max-w-3xl` center-aligned dashed card

### A-2. Target role in Hitori Media OS

「**公開後の反応を集計し、次のキャンペーンの learning に変える**」surface。Hitori Media OS の lifecycle 5 段階 (idea → structured → draft → review → published) のうち、published 後の loop を担う。

現フェーズでは外部 analytics API (Plausible / X API / note 等) との連携はなく、boss が **reactionNotes (`manualPublishingStatus[].reactionNotes`)** に 24-72h 後の反応を文字で記録するワークフロー。本 spec は「既存の手動記録を可視化」が中心で、外部 API integration は Phase Analytics-2 以降。

### A-3. Target page structure

```
[Breadcrumb: ダッシュボード > アナリティクス]
[PageHeader:
  Title「アナリティクス」
  Description: 「公開後の反応・学習を集計し、次キャンペーンに反映します。」
  Meta: (オプション) 「外部 API 連携は Phase Analytics-2 で実装」
  Actions: なし (P1 で「公開管理を開く」link 候補)
]
[KpiCardsRow (5):
  - 公開済み (manualPublishingDone, CheckCircle2, emerald)
  - 反応ノート (reactionNotes 件数、MessageSquare, blue)
  - キャンペーン (campaignTotal, Rocket, purple)
  - 媒体 (selectedPlatforms 総数、Layers, orange)
  - 直近の出力 (recent outputs 件数、FileText, slate)
]
[2-col grid (lg:grid-cols-[3fr_2fr]):
  Left:
    [PlatformPerformanceCard:
      - 媒体ごとの公開済み件数を bar 表示
      - 各 row: PlatformBadge + count + 「note: N 件 / threads: N 件」
      - data: distinctPlatforms × manualPublishingStatus aggregation
    ]
    [CampaignAnalyticsTable:
      - 列: キャンペーン / 公開済み / 反応ノート / 媒体数 / 最新更新
      - 行: 各 campaignPlan (active + recent)
      - link: row click → /publish-package/<slug>
    ]
    [LearningInsightsCard:
      - 直近の devlog から「学び」「次の一手」抜粋
      - data: docs/devlog 最新 5 件の title + excerpt
    ]
  Right:
    [ReactionNotesCard:
      - 直近の reactionNotes (manualPublishingStatus[].reactionNotes が定義されている件)
      - 表示: campaignSlug + platform + 内容 (truncate 2 行)
      - link: 各 row → /publish-package/<slug>#<platform>
    ]
    [PendingMonitoringCard:
      - 公開後 24-72h passed but reactionNotes 未記入の publication 一覧
      - data: manualPublishingStatus[publishedAt < 72h ago && !reactionNotes]
      - 「反応メモを記入」CTA (Phase 2B で writable に、現状 disabled)
    ]
    [FutureIntegrationCard (placeholder):
      - 「外部 API 連携 (準備中)」 + Phase Analytics-2 で実装するもの一覧:
        - Plausible / X API / note 統計 / Substack 統計
    ]
]
```

### A-4. Required components

| Component | reuse / new |
|---|---|
| PageHeader, Breadcrumb, KpiCard, KpiCardsRow | 既存 reuse |
| PlatformBadge, StatusBadge, CopyButton | 既存 reuse |
| `analytics/PlatformPerformanceCard.tsx` | **new** P0 |
| `analytics/CampaignAnalyticsTable.tsx` | **new** P0 |
| `analytics/ReactionNotesCard.tsx` | **new** P0 |
| `analytics/LearningInsightsCard.tsx` | **new** P1 (Dashboard `LearningInsightsCard` 既存、構造流用可能) |
| `analytics/PendingMonitoringCard.tsx` | **new** P1 |
| `analytics/FutureIntegrationCard.tsx` | **new** P1 (Phase 2 placeholder) |

### A-5. Likely data sources (`/analytics`)

| Source | Field | 経由 |
|---|---|---|
| `campaignPlan` (Sanity) | `manualPublishingStatus[]` (platform / state / publishedUrl / publishedAt / reactionNotes) | `dashboardHomeQuery` の `manualPublishingDone` カウント既存、新規 query で詳細 fetch (`/lib/groq/analytics.ts` 新設候補) |
| `campaignPlan` (Sanity) | `selectedPlatforms[]` (platform / enabled) | aggregation 用 |
| `platformOutput` (Sanity) | `_updatedAt` / `_createdAt` | recent outputs カウント (outputsListQuery 流用) |
| `docs/devlog/*.md` (filesystem) | title + body excerpt | LearningInsightsCard 用、既存 `readDocsFromFs('devlog')` 流用候補 |
| 外部 analytics API | (なし、Phase Analytics-2) | FutureIntegrationCard で placeholder |

### A-6. P0 / P1 / P2 scope (`/analytics`)

- **P0**: PageHeader + Breadcrumb / 5 KpiCard / PlatformPerformanceCard / CampaignAnalyticsTable / ReactionNotesCard
- **P1**: LearningInsightsCard (devlog 抜粋) / PendingMonitoringCard / FutureIntegrationCard
- **P2**: 外部 API integration (Plausible / X / note) / reactionNotes writable / per-campaign deep-dive page / time-series chart

### A-7. Likely files affected

- `dashboard/src/app/analytics/page.tsx` (rewrite)
- `dashboard/src/components/analytics/` (新 dir + 7 P0/P1 component)
- `dashboard/src/lib/groq/analytics.ts` (新規、aggregate query) — または既存の `dashboardHomeQuery` / `outputsListQuery` を流用する path
- (option) Dashboard の既存 `LearningInsightsCard` をリネーム or 別 directory に整理して両 page で reuse

---

## B. `/knowledge` fidelity spec

### B-1. Current placeholder structure

```tsx
<PhasePlaceholder
  title="ナレッジDB"
  phase="UI-6"
  description="contentIdea / brandProfile / visualStyleProfile / promptTemplate を閲覧する画面の準備中です。"
/>
```

- file: `dashboard/src/app/knowledge/page.tsx` (12 行)

### B-2. Target role

「**1 つの contentIdea を多媒体に展開する OS の知識資産を閲覧 + 探索**」surface。`/configurator` で「アイデアを使う」前の、boss が「どんなアイデア / brand / style / prompt がある?」を確認する surface。

書き込みは Sanity Studio 経由、本画面は **read-only**。ただし「`/configurator` で使う」「Sanity Studio で開く」の external link を CTA に。

### B-3. Target page structure

```
[Breadcrumb: ダッシュボード > ナレッジDB]
[PageHeader:
  Title「ナレッジDB」
  Description: 「contentIdea / brandProfile / visualStyleProfile / promptTemplate を横断的に閲覧します。書き込みは Sanity Studio で。」
  Actions:
    - 「出力コンフィギュレーターで使う」(outline、to /configurator) — primary 候補
    - 「Sanity Studio を開く」(outline、external)
]
[KpiCardsRow (4):
  - アイデア (contentIdea count, Lightbulb, blue)
  - ブランド (brandProfile count, Compass, purple)
  - スタイル (visualStyleProfile count, Palette, orange)
  - プロンプト (promptTemplate count, Wand2, emerald)
]
[Tabs (hand-rolled, common/Tabs reuse):
  - contentIdea (default active)
  - brandProfile
  - visualStyleProfile
  - promptTemplate
]
[per-tab content (replaces below):

  ContentIdeaTab:
    [filter: search + status select (draft / structured / archived)]
    [ContentIdeaCardGrid:
      - 3-col card
      - 各 card: title + slug + coreThesis (truncate 2 行) + audience chips + 3 stat tile (claims / examples / objections)
      - link: 「/configurator?ideaId=...」(将来) or Sanity Studio doc URL (現状)
    ]

  BrandProfileTab:
    [BrandList: 各 brandProfile を card で
      - brandName + ownerType + voice + defaultPlatforms chips + status
    ]

  VisualStyleProfileTab:
    [StyleList: title + status + linked promptTemplates count]

  PromptTemplateTab:
    [PromptTemplateTable:
      - title / category / version / brandName / styleTitle / status
    ]
]
[Empty state: dataset 未投入時]
```

### B-4. Required components

| Component | reuse / new |
|---|---|
| PageHeader, Breadcrumb, KpiCard, KpiCardsRow | 既存 reuse |
| Tabs (hand-rolled) | `common/Tabs.tsx` 既存 (Phase UI-fidelity-1 で導入) reuse |
| `knowledge/ContentIdeaCard.tsx` | **new** P0 |
| `knowledge/ContentIdeaCardGrid.tsx` | **new** P0 |
| `knowledge/BrandList.tsx` | **new** P0 |
| `knowledge/StyleList.tsx` | **new** P0 |
| `knowledge/PromptTemplateTable.tsx` | **new** P0 |
| `knowledge/KnowledgeFilterBar.tsx` | **new** P1 |
| `knowledge/KnowledgeView.tsx` | **new** P0 (client wrapper、Tabs + active tab state) |

### B-5. Likely data sources (`/knowledge`)

| Source | 既存 query |
|---|---|
| `contentIdea` (Sanity) | `configuratorOptionsQuery.contentIdeas` (lib/groq/configurator.ts) を **そのまま流用** |
| `promptTemplate` (Sanity) | 同上 `configuratorOptionsQuery.promptTemplates` |
| `brandProfile` (Sanity) | 同上 `configuratorOptionsQuery.brandProfiles` |
| `visualStyleProfile` (Sanity) | 同上 `configuratorOptionsQuery.visualStyleProfiles` |
| KPI counts | `dashboardHomeQuery.contentIdeaTotal` + `knowledgeAssetTotal` (lib/groq/campaign.ts、既存) |

**実装上の利点**: 既存の `configuratorOptionsQuery` を 1 つ呼ぶだけで全 tab のデータが揃う。新 query 不要。

### B-6. P0 / P1 / P2 scope (`/knowledge`)

- **P0**: PageHeader + Breadcrumb / 4 KpiCard / Tabs / 4 tab content (ContentIdeaCardGrid / BrandList / StyleList / PromptTemplateTable) / 既存 `configuratorOptionsQuery` 流用 / inline empty states
- **P1**: search + status filter (KnowledgeFilterBar) / sort options / per-card detail expansion / Studio document URL link (studioDocumentUrl helper 既存)
- **P2**: 「このアイデアで configurator を開く」action (現状 boss は手動で contentIdeaId をコピーして configurator に渡す) / brand / style ごとの「使用箇所」リバース検索 / リレーション graph

### B-7. Likely files affected

- `dashboard/src/app/knowledge/page.tsx` (rewrite)
- `dashboard/src/components/knowledge/` (新 dir + 6 component)
- データ取得は `lib/groq/configurator.ts` の既存 query 流用 (新 query なし)

---

## C. `/settings` fidelity spec

### C-1. Current placeholder structure

```tsx
<PhasePlaceholder
  title="設定"
  phase="UI-7+"
  description="env / feature flags / workspace 情報 / billing を確認する画面の準備中です。"
>
  <Link href="/diagnostics">診断（dev only）→</Link>
</PhasePlaceholder>
```

- file: `dashboard/src/app/settings/page.tsx` (33 行)

### C-2. Target role

「**OS の設定・現環境・将来の連携設定を 1 画面で見る**」surface。dashboard が現状 read-only なので、書き込み (env 変更 / billing 操作) は scope 外。**現環境の readout** + **将来のもの placeholders** が中心。

「`/diagnostics` を開く」「Studio を開く」「README を見る」など、設定の入口としての navigation hub。

### C-3. Target page structure

```
[Breadcrumb: ダッシュボード > 設定]
[PageHeader:
  Title「設定」
  Description: 「現環境・feature flags・workspace 情報を確認します。書き込みは Sanity Studio / Vercel ダッシュボードで。」
  Actions:
    - 「診断を開く」(outline、to /diagnostics)
    - 「Sanity Studio を開く」(outline、external)
]
[2-col grid (lg:grid-cols-2):
  Left:
    [WorkspaceCard:
      - workspace name (Hitori Media OS) + 概要
      - Sanity project: projectId / dataset
      - 「Studio を開く」external link
    ]
    [GenerationSettingsCard:
      - CLAUDE.md の content quality rules を chip 一覧 (発信者の視点 / 元レコード制約 / 媒体別形式 / 読者言語 / 実用的な次の行動)
      - 「rules を編集」(disabled、boss が手動で CLAUDE.md を edit)
    ]
    [PublishingSettingsCard:
      - 各 platform の default settings (media-specific length / tone / CTA 等) — 現状はなく、Phase UI-3+ で `brandProfile.defaultPlatforms` 等から導出
      - 「auto-post: never」(read-only chip)
    ]
  Right:
    [FeatureFlagsCard:
      - 3 flag を table 表示:
        - ENABLE_DIAGNOSTICS
        - ENABLE_LOCAL_FS_ROUTES
        - ACTIVITY_LOG_MODE
        各 row: env 変数名 / 現在の値 (badge: enabled/disabled/fs/snapshot) / production default / dev default
      - 「.env.local を編集」(disabled、boss が手動で local file を edit)
    ]
    [LocalDevCard:
      - 起動コマンド一覧 (npm run dev / npm run visual:register / npm run build:activity-snapshot)
      - 「診断を開く」「作業ログを開く」CTA
    ]
    [SafetyReadOnlyCard:
      - 現在 dashboard は read-only であることを明示
      - 書き込み可能 surface 一覧: Sanity Studio / Visual Register / Codex CLI
      - 「Phase 2B で dashboard 書き込み実装予定」note
    ]
]
[FutureIntegrationsCard (full-width):
  - 将来の連携設定 placeholder:
    - billing (Stripe / Substack 等)
    - team workspace (multi-user)
    - external analytics
    - AI auto-generation API
  - 各項目: 「Phase X+ で対応」chip
]
```

### C-4. Required components

| Component | reuse / new |
|---|---|
| PageHeader, Breadcrumb | 既存 reuse |
| StatusBadge | 既存 reuse |
| `settings/WorkspaceCard.tsx` | **new** P0 |
| `settings/FeatureFlagsCard.tsx` | **new** P0 |
| `settings/LocalDevCard.tsx` | **new** P0 |
| `settings/SafetyReadOnlyCard.tsx` | **new** P0 |
| `settings/GenerationSettingsCard.tsx` | **new** P1 |
| `settings/PublishingSettingsCard.tsx` | **new** P1 |
| `settings/FutureIntegrationsCard.tsx` | **new** P1 |

### C-5. Likely data sources (`/settings`)

| Source | 経由 |
|---|---|
| `lib/featureFlags.ts` | exports: `isProductionRuntime` / `enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` (既存) |
| `lib/sanity.ts` | exports: `sanityConfig` (`projectId`, `dataset`), `studioDocumentUrl()` (既存) |
| CLAUDE.md | content quality rules を 5 chip でハードコード (`/settings` で簡潔に示す、本格的な markdown rendering は要らない) |
| `process.env.NODE_ENV` | runtime 判定 |
| (future) Sanity `workspaceProfile` doc | Phase Settings-2 で追加候補 |

### C-6. P0 / P1 / P2 scope (`/settings`)

- **P0**: PageHeader + Breadcrumb / 2-col grid / WorkspaceCard / FeatureFlagsCard / LocalDevCard / SafetyReadOnlyCard
- **P1**: GenerationSettingsCard (CLAUDE.md rules chip) / PublishingSettingsCard (`brandProfile.defaultPlatforms` 流用) / FutureIntegrationsCard (full-width placeholder)
- **P2**: workspace profile schema (Sanity) で複数 workspace 対応 / env 編集 UI (Phase 2B 書き込み実装後) / billing integration

### C-7. Likely files affected

- `dashboard/src/app/settings/page.tsx` (rewrite)
- `dashboard/src/components/settings/` (新 dir + 7 component)
- データ取得は既存 `lib/featureFlags.ts` / `lib/sanity.ts` を直 import (新 query 不要)

---

## D. Data Source Planning (3 page 横断)

### D-1. 既存で利用可能

- `dashboardHomeQuery` (lib/groq/campaign.ts) — campaign / publishing / idea counts
- `outputsListQuery` (lib/groq/outputs.ts) — recent outputs
- `configuratorOptionsQuery` (lib/groq/configurator.ts) — contentIdea / promptTemplate / brandProfile / visualStyleProfile **すべて 1 query で**
- `readDocsFromFs('devlog')` (lib/inboxReader.ts 系) — devlog excerpt
- `lib/featureFlags.ts` exports
- `lib/sanity.ts` exports (`sanityConfig`, `studioDocumentUrl()`)

### D-2. 新規が必要

- `lib/groq/analytics.ts` 新設 — reactionNotes aggregation + per-platform performance + pending monitoring。または既存 `dashboardHomeQuery` を拡張するか、page で複数 query を `Promise.all` で並列 fetch
- (option) `lib/knowledge/index.ts` 新設 — configuratorOptionsQuery を `/knowledge` 用に rename + 型 re-export

### D-3. Future (P2 以降)

- 外部 analytics API client (Plausible / X / note) — Phase Analytics-2、要 boss API 承認
- reactionNotes writable (Phase 2B)
- workspaceProfile schema (Phase Settings-2)
- billing integration (Phase Billing)

### D-4. Data sources NOT used

- `assets/visuals/` / `assets/inbox/` / `patches/` — fidelity の対象外、これらは visual review surface 専用
- `publish-packages/` filesystem — `/publish-packages` で既に表示済
- release-review markdown (`publish-packages/campaigns/<campaign>-release-review/*.md`) — option として LearningInsightsCard 源候補だが、現状は devlog で十分

---

## E. Implementation Order

### Option A (推奨): `/knowledge` → `/analytics` → `/settings`

**理由**:
1. **`/knowledge` が一番楽**: 既存 `configuratorOptionsQuery` を流用するだけ、新 query 0。ContentIdeaCardGrid / BrandList / StyleList / PromptTemplateTable の 4 component を Tabs で切り替えるシンプル構成。pilot route として最適
2. **`/analytics` が中規模**: 新 query (`lib/groq/analytics.ts`) が必要、aggregation logic も。`/knowledge` で確立した tone を flow させる
3. **`/settings` が最も静的**: 既存 module exports を直 render するだけ、3 page の中で最も依存少。最後にすると tone consistency 確認の machine としても使える

**1 batch でまとめて実装** することも可能 (依存なし)。1 batch でやる場合は上記順番で内部実装。

### Option B: `/knowledge` + `/settings` を 1 batch、`/analytics` を別 batch

**理由**: `/analytics` は新 query が必要で、reactionNotes aggregation の意味確認が boss feedback 待ちになる可能性 (どの粒度で何を表示すべきか)。`/knowledge` + `/settings` を先に land、`/analytics` を spec 再確認後に着手する選択肢。

### Option C: 3 page を並列で 1 batch

- 利点: 1 PR で Sidebar 全 nav items 完成
- 欠点: 1 batch の diff が大きい (3 page + 16+ 新 component)

**推奨**: **Option A の 1 batch 実装** (3 page まとめて)。Phase UI-fidelity-6〜8 と同様の規模感、boss 確認も 1 度で済む。

---

## F. Constraints (本 spec & 実装 batch)

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ 他 fidelity 化済 page (`/`, `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/visual-assets/*`, `/publish-packages`, `/activity-log`, `/diagnostics`) unchanged (shared common: PageHeader / KpiCard / Breadcrumb / CopyButton / Tabs / StatusBadge のみ reuse)
- ✅ external API integration なし (P2 以降)
- ✅ Phase 2B write actions なし、すべて read-only

---

## G. Boss Decision Points (Phase UI-fidelity-9 着手前)

1. **rename 候補**:
   - `/analytics` のタイトルを「アナリティクス」のままにするか「分析」に短縮するか
   - `/knowledge` を「ナレッジDB」 / 「ナレッジ」 / 「知識資産」のいずれにするか
   - `/settings` を「設定」のまま (現状) で問題ないか
2. **`/analytics` の実 query**: 新 `lib/groq/analytics.ts` を立てるか、既存 query (`dashboardHomeQuery` + `outputsListQuery`) を `Promise.all` で並列 fetch して page 側で aggregation するか?
   - 推奨: 後者 (新 query を作らない、page で並列 fetch + aggregation)
3. **`/knowledge` の Tabs**: `common/Tabs.tsx` 既存 (Phase UI-fidelity-1) を流用するで OK か?
4. **`/knowledge` の card click 先**: 現状 `/configurator?ideaId=...` の searchParams は未実装 → P1 で `/configurator` の Source side で受け取り対応するか、当面は Studio doc URL に link するか?
5. **`/settings` の secret 表示**: env 変数の値 (`SANITY_*_TOKEN` 等) は **表示しない**、flag の on/off と env name のみ。それで OK か?
6. **`/settings` の FutureIntegrationsCard**: billing / team / external analytics / AI auto-gen の項目をどこまで列挙するか?
7. **3 page を 1 batch か段階か**: Option A (1 batch、推奨) / Option B (knowledge+settings 先) / Option C (並列、diff 大)
8. **共通コンポーネント抽出**: `/analytics` 内の LearningInsightsCard は Dashboard 既存 LearningInsightsCard と概念重複。共通化するか、別々に置くか?

## H. Out of scope

- AppShell / Sidebar / Topbar (UI-1 完成)
- Sanity schema 変更 (workspaceProfile / analytics 等の新 doc type は将来)
- 外部 API integration (Plausible / X / note / billing)
- reactionNotes writable (Phase 2B)
- env 編集 UI (Phase 2B)
- multi-workspace 対応 (Phase Settings-2)
- 「中期」dead code cleanup (ReadOnlyBanner 等) — `/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` の fidelity 化と同時に実施予定

## I. Post-implementation expected state

本 spec の Phase UI-fidelity-9 実装完了後の状態:

- ✅ Sidebar 9 nav items 全てが fidelity 化済 (Dashboard / Campaigns / Configurator / Outputs / Publish / Visual Review / Knowledge / Analytics / Settings)
- ✅ 23 routes 全てで PageHeader + Breadcrumb + KpiCardsRow + design tone consistency
- ✅ utility page (publish-packages / activity-log / diagnostics) + final placeholders (knowledge / analytics / settings) すべて fidelity 完了
- ❌ 残る fidelity 未対応: `/campaigns` (list page、現在 Phase UI-2 で fidelity 化済の `/campaigns/[slug]` とは別) / `/human-review-gates` / `/publish-package/[slug]` (v0.2 のまま、boss が「触らない」と決定したため touch なし)
- ❌ Phase 2B (実 write actions) は別議論

3 page の fidelity 化で **Hitori Media OS の main UI surface が一巡する**。
