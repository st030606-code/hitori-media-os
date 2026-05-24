# Handoff: Phase UI-2 Dashboard / Campaign detail redesign

Date: 2026-05-19

## 1. Task Goal

[docs/68 §2 / docs/69 Phase UI-2](../68-hitori-media-os-ui-design-system.md) 準拠で `/`、`/campaigns`、`/campaigns/[slug]` の **ページ body** を design system tone に再構成する。Phase UI-1 で導入した AppShell / Sidebar / Topbar / WorkspaceBlock は無変更。既存 `/publish-package/[slug]` v0.2 動作維持。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし
- ✅ Sanity schema 変更なし（既存 doc type への count 集計クエリのみ追加）
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし（lucide-react は UI-1 で導入済、shadcn は今回不要と判断）
- ✅ 既存 23 route 動作維持（17 既存 + 6 placeholder）
- ✅ AppShell / Sidebar / Topbar / WorkspaceBlock / placeholder 無変更
- ✅ `/publish-package/[slug]` v0.2 (copy + badges + links) 無変更

## 3. Changed Files

### 新規 components (10)

`dashboard/src/components/common/`:
- `PageHeader.tsx`
- `KpiCard.tsx`
- `KpiCardsRow.tsx`
- `LifecyclePipeline.tsx`
- `PlatformBadge.tsx`

`dashboard/src/components/dashboard/`:
- `ContentOutputConfiguratorCard.tsx`
- `ActiveCampaignsCard.tsx`
- `RecentOutputsTable.tsx`
- `TodayTasksCard.tsx`
- `LearningInsightsCard.tsx`

### 更新 (4)

- `dashboard/src/app/page.tsx` — 全面書き換え (PageHeader + 5 KPI + Lifecycle + Configurator + ActiveCampaigns + RecentOutputs + TodayTasks + LearningInsights + ReleaseReviewLinks + 外部ツール)
- `dashboard/src/app/campaigns/page.tsx` — 全面書き換え (PageHeader + DataTable)
- `dashboard/src/app/campaigns/[slug]/page.tsx` — 上半分 (PageHeader + KPI + Lifecycle + PublishReadinessBoard + ReleaseReviewLinks + NextActionSummary) 再構成、下半分 9 セクションを `<details>詳細情報>` に集約
- `dashboard/src/lib/groq/campaign.ts` — `dashboardHomeQuery.campaigns[]` に `selectedPlatformsCount` / `manualPublishingNotStartedCount` を追加、トップレベルに `contentIdeaTotal` / `knowledgeAssetTotal` を追加。`DashboardHomeData` 型に 2 field 追加

### 新規 docs

- `docs/devlog/0130-ui-2-dashboard-redesign.md`
- `docs/handoff/0141-ui-2-dashboard-redesign.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

### 既存 component で import が消えたもの（ファイルは残存、UI-3 clean-up 候補）

- `WorkingPipelineStatus` (`/` から)
- `NextActionChecklist` (`/` から)
- `CampaignStatusCard` (`/campaigns/[slug]` から、機能は PageHeader + KpiCardsRow に統合)
- `AppNav` (UI-1 以降 deprecated)

## 4. Summary of Changes

### `/` Home redesign

```
[PageHeader (title + description + 公開パッケージを開く CTA)]
[KpiCardsRow: アイデア / 下書き / レビュー待ち / 公開済み / ナレッジ資産]
[2-column grid (lg)]
├ Left (2/3):
│   ContentOutputConfiguratorCard
│   LifecyclePipeline (5-stage、currentStage 推定)
│   ActiveCampaignsCard (top 5、progress bar)
│   RecentOutputsTable (Phase UI-3 placeholder)
└ Right (1/3):
    TodayTasksCard (pending / boss-known follow-ups)
    LearningInsightsCard (rule-based + static for now)
    ReleaseReviewLinks
[外部ツール section (Visual Register / Sanity Studio 等)]
```

KPI 値は `dashboardHomeQuery` から:
- コンテンツアイデア ← `contentIdeaTotal` (新規 count)
- 下書き ← `manualPublishingPending` (proxy)
- レビュー待ち ← `pendingGatesTotal`
- 公開済み ← `manualPublishingDone`
- ナレッジ資産 ← `knowledgeAssetTotal` (新規 count: brandProfile + visualStyleProfile + promptTemplate + prompt + tool)

### `/campaigns` redesign

```
[PageHeader (title + description)]
[DataTable]
  Column: タイトル / 状態 / 媒体 (PlatformBadge) / 進捗 (bar + label) / chevron action
  Row hover: bg-slate-50
  各行クリックで詳細へ
```

### `/campaigns/[slug]` redesign

```
[PageHeader (campaign title + coreThesis + status badge + 公開パッケージを開く CTA)]
[KpiCardsRow: 公開済み / 確認待ちゲート / 画像・図解 / 選択媒体]
[LifecyclePipeline (per-campaign、currentStage 推定)]
[PublishReadinessBoard (既存、無変更)]
[ReleaseReviewLinks (既存、無変更)]
[NextActionSummary (既存、無変更)]
[<details>詳細情報>]
  ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList /
  VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks /
  ManualPublishingStatusList / ExternalLinks
[</details>]
```

主役 6 セクションを上、技術詳細 9 セクションを折り畳み 1 つにまとめて情報密度を整理。

### shadcn/ui を今回追加しなかった

UI 全体方針 (2026-05-19) で **Tailwind-first + shadcn/ui selective adoption** が確定済。UI-2 で構築した 10 components はすべて静的表示 or 軽量 list/table で、shadcn primitive を入れる抽象化メリットが薄かった。次の **Phase UI-3** で URL inline edit / Reaction Notes textarea / Output Configurator form が必要になる時点で、必要な primitive (Input / Button / Dialog) を 1 件ずつ追加判断する。

### Build result

```
Route (app) — 23 routes（17 既存 + 6 placeholder）
TypeScript clean
Sanity Studio build 7.8s clean
```

## 5. Key Decisions

- **shadcn 未追加**: selective adoption policy 準拠、UI-2 では Tailwind-only で十分到達。UI-3 で必要時に判断
- **layout 幅 `max-w-[1280px]`**: AppShell の `max-w-[1440px]` 内側で 1280 中央寄せ。3-column が 1152px だと窮屈、1440px だとズレ
- **`<details>詳細情報>` に技術詳細を集約**: boss 視線誘導を整理、主役と詳細を視覚的に分離
- **LifecyclePipeline の `currentStage` derivation はヒューリスティック**: `pendingGates > 0 → review`、`publishingPending > 0 → draft`、`else → published`。完璧ではないが「いま何が止まっているか」を 3 秒で読むため
- **TodayTasksCard を read-only**: 仕様の `onToggle` は scope 外、boss は `final-human-checklist.md` で手書き管理
- **KpiCard tone を 5 種類用意**: blue / purple / orange / emerald / red / slate、design system §4.3 準拠
- **GROQ 新 count 2 件**: `contentIdeaTotal` / `knowledgeAssetTotal`。スキーマ変更なし
- **既存旧 component (`WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard`) を削除せず**: UI-3 で削除 cleanup batch を別途実施、PR 単位の risk を下げる
- **PlatformBadge を 10 platform 分**: 想定 platform を design system §12-3 から実装、unknown platform は slate fallback

## 6. Human Review Questions

- **5 KPI の選択**: 仕様の「コンテンツアイデア / 下書き / レビュー待ち / 公開済み / ナレッジ資産」をそのまま採用。boss が違う指標を見たい場合は KpiCard 単位で差し替え可能（例: 公開済み URL clicks / Reaction Notes 件数）
- **「下書き」を `manualPublishingPending` で代替**: 厳密には「下書き」は output 単位だが Phase UI-3 の `/outputs` 実装まで proxy 数値。boss が違和感あれば 0 表示にするか、Phase UI-3 まで Card 自体を隠す選択も
- **LifecyclePipeline の count**: 「アイデア」を 1 fixed にしている（per-campaign）/ `contentIdeaTotal` (`/` 全体)、「構造化済み」を visualsTotal or campaignTotal。意味付けが boss の感覚と合うか
- **`/campaigns/[slug]` の `<details>` 折り畳み**: 詳細 9 セクションを 1 つの `<details>` にまとめたが、ContentIdea / BrandProfile / VisualAsset Table 等を Tabs に分けたい場合は Phase UI-3+ で shadcn `Tabs` 導入を検討
- **`RecentOutputsTable`**: 現状 placeholder + platform color preview のみ。Phase UI-3 の `/outputs` でデータ統合する想定で良いか
- **`LearningInsightsCard`**: 3 件の static + rule-based insight のみ。Phase UI-6 (Analytics) で本格 derive する前提で OK か

## 7. Risks or Uncertainties

- **KPI 数値の精度**: `contentIdeaTotal` / `knowledgeAssetTotal` は dataset 全体 count なので、building-hitori-media-os campaign に紐づく数だけを表示したい場合は別 query が必要
- **LifecyclePipeline の `currentStage` 単一値表現**: 実際は campaign ごとに違う段階が並走するため、「全体の currentStage」は 1 つに絞れない。妥協のヒューリスティック
- **`<details>` の中身が 9 セクション縦並び**: 開いたあと長くなる。boss が頻繁に開く場合は Tabs 化検討（UI-3 で shadcn Tabs 導入候補）
- **Geist → Inter/Noto Sans JP font 切替（UI-1 既決）が UI-2 のレイアウト密度に影響している可能性**: 文字幅が変わったため、特に table の列幅 / KPI value の hairline が boss の意図とズレる可能性
- **GROQ 新 count 2 件のパフォーマンス**: dataset が小さいうちは無視できるが、将来的に `knowledgeAssetTotal` の OR 条件 `_type in [...]` は cost が増える

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` で manual check（3 route + `/publish-package/[slug]` で v0.2 機能維持確認）
2. UI 細部の調整は microbatch で
3. **Phase UI-3: Publish Package v0.3 + /publish + /outputs** に着手:
   - `/publish-package/[slug]` v0.3: `<ManualPublishCopyPanel>` で URL / reactionNotes inline edit（server action 経由）
   - `/publish` 新規: 全 campaign × platform の publishing 状態テーブル
   - `/outputs` 新規: platform × campaign の outputs 一覧
   - **shadcn `Input` / `Button` / `Textarea` がここで必要見込み** — 1 件ずつ `npx shadcn@latest add` で個別追加

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 旧 component (`AppNav` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard`) の削除 cleanup batch

## 9. Exact Codex Prompt for Phase UI-3

```text
Implement dashboard Phase UI-3: Publish Package v0.3 + /publish + /outputs.

References:
- docs/68-hitori-media-os-ui-design-system.md §3 (Publish Package), §6 (Tokens), §11 (Compat)
- docs/69-dashboard-ui-redesign-implementation-plan.md Phase UI-3
- docs/handoff/0141-ui-2-dashboard-redesign.md (previous batch context)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT auto-write to Sanity (write via server action wrapper of
  tools/sanity/reflect-publication-state.mjs with --dry-run/--execute).
- Do NOT modify publish-package output files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 existing routes + new placeholders working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep `/publish-package/[slug]` copy UI / published badges functional.

Package policy:
- Add shadcn primitives ONLY if needed, one at a time:
    npx shadcn@latest add button
    npx shadcn@latest add input
    npx shadcn@latest add textarea
    (other primitives only if a UI-3 task pushes for them)
- Do NOT add shadcn templates.
- Wrap Hitori-specific semantics in dashboard/src/components/common/
  (e.g. PublishedUrlField wraps Input, ReactionNotesField wraps Textarea).

Tasks:

1. New common components (Tailwind-only or shadcn-wrapped):
   - dashboard/src/components/common/Button.tsx (if shadcn button added)
   - dashboard/src/components/common/Input.tsx (if shadcn input added)

2. New publish components:
   - dashboard/src/components/publish/PublishPackageOverview.tsx
   - dashboard/src/components/publish/ManualPublishCopyPanel.tsx
   - dashboard/src/components/publish/PublishedUrlField.tsx (inline editable)
   - dashboard/src/components/publish/ReactionNotesField.tsx (textarea)
   - dashboard/src/components/publish/PendingPlatformsCard.tsx
   - dashboard/src/components/publish/IncludedAssetsTable.tsx

3. /publish-package/[slug] v0.3:
   - Replace inline PublishedStatusBlock with <ManualPublishCopyPanel>
   - Add URL / reactionNotes inline edit, persist via server action wrapper
     that calls tools/sanity/reflect-publication-state.mjs (dry-run default,
     execute requires explicit "保存" button + SANITY_WRITE_TOKEN env)
   - Keep CopyButton fallback design intact
   - Keep all v0.2 functionality

4. /publish (replacing the UI-1 placeholder):
   - Full-page DataTable of all campaigns × platforms manual publishing state
   - Status column shows StatusBadge + publishedAt JST
   - URL column shows PublishedUrlField (inline edit)
   - Threads pending highlighted

5. /outputs (replacing the UI-1 placeholder):
   - FS scan of outputs/ + Sanity platformOutput query
   - DataTable view, link to publish-package per row

Data sources:
- Existing dashboardHomeQuery / campaignDetailBySlugQuery / publishPackageStateBySlugQuery
- New server action: dashboard/src/lib/actions/persistPublication.ts
  Calls tools/sanity/reflect-publication-state.mjs equivalent
  Server-only, never exposes write token to client

Validation:
- cd dashboard && npm run build
- npm run build
- Manually check /publish-package/building-hitori-media-os v0.3 URL inline edit
- Verify v0.2 fallback when edit is disabled

Docs:
- docs/devlog/<番号>-ui-3-publish-package-management.md
- docs/handoff/<番号>-ui-3-publish-package-management.md
- docs/handoff/latest.md (mirror)
```
