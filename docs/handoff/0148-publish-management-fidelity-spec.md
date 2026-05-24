# Handoff: Publish Management Fidelity Spec (docs only)

Date: 2026-05-19

## 1. Task Goal

reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png`) と現状 PhasePlaceholder を比較し、`/publish` route の実装可能な fidelity spec を作成。実装変更なし、boss が Phase UI-fidelity-4 着手時に使う仕様書 + Codex prompt を確定する。

## 2. Constraints Followed

- ✅ docs-only batch、コード変更なし
- ✅ Sanity schema / 書き込み なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 23 routes 動作維持

## 3. Changed Files

新規 (3 docs + 1 mirror):

- `docs/75-publish-management-fidelity-spec.md` — 11 sections の structure diff + 15 行 component diff + ~50 項目 checklist + P0/P1/P2 + files affected
- `docs/devlog/0137-publish-management-fidelity-spec.md`
- `docs/handoff/0148-publish-management-fidelity-spec.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

実装ファイルは一切変更なし。

## 4. Summary of Changes

### Spec の核

#### Page concept 差別化

| route | 役割 | 対象視点 |
|---|---|---|
| `/publish-package/[slug]` (v0.2 既存) | 本文 / 画像 / URL コピー、手動投稿作業 | 作業者視点 |
| `/publish` (本 spec) | Publish Package 単位の監視 + 状態管理、リスクチェック、反応モニタリング | publisher 視点 |

#### Target structure (ideal screenshot より)

```
[Breadcrumb + PageHeader + 3 actions (公開パッケージを編集 / 公開設定 / 今すぐ公開)]
[CampaignSwitcher (P1)]
[PackageHeroCard]
[2-col grid (lg:grid-cols-[2fr_1fr]):
  Left:
    ChannelsGrid (6 platform 行 status + URL)
    PublishingMediaTable (6-column DataTable)
    IncludedAssetsTable (P1)
  Right:
    PublishingLifecycleTimeline (publish-specific 5 stage)
    ReleaseNotesCard (P1)
    RiskCheckCard (P1)
    PostPublishMonitoringCard (P1)
]
[PublishingCalendarCard (P2、full width bottom)]
```

#### Component diff (9 新規 + 5 reuse)

- **新規 P0**: PackageHeroCard / ChannelsGrid / PublishingMediaTable / PublishingLifecycleTimeline
- **新規 P1**: CampaignSwitcher / IncludedAssetsTable / ReleaseNotesCard / RiskCheckCard / PostPublishMonitoringCard
- **新規 P2**: PublishingCalendarCard
- **Reuse**: PageHeader / Breadcrumb / StatusBadge / PlatformBadge / KpiCard / Tabs (任意)

#### Data sources

- 既存 `campaignDetailBySlugQuery` (`lib/groq/campaign.ts`) で 90% cover
- 既存 `outputsListQuery` (`lib/groq/outputs.ts`) を IncludedAssetsTable で再利用
- 既存 `campaignListQuery` を CampaignSwitcher で再利用
- 新規 GROQ 不要、Sanity schema 変更なし
- Reaction analytics は Phase UI-6 まで placeholder

#### Implementation order

- **P0 (MVP fidelity に必須)**: 6 件 — PhasePlaceholder 削除 / PageHeader / PackageHeroCard / ChannelsGrid / PublishingMediaTable / PublishingLifecycleTimeline / 2-col layout
- **P1 (重要 polish)**: 5 件 — CampaignSwitcher / IncludedAssetsTable / ReleaseNotesCard / RiskCheckCard / PostPublishMonitoringCard
- **P2 (後段)**: 4 件 — PublishingCalendarCard / inline URL edit / 担当 avatar dynamic / 実 reaction data

## 5. Key Decisions

- **`/publish` ≠ `/publish-package/[slug]`**: 仕様レベルで「作業者視点 vs publisher 視点」を明示。両者の data source 重複は Phase UI-3 server action で解消
- **CampaignSwitcher を P1 に**: P0 MVP は single campaign hero に専念、複数 campaign 運用開始時に P1 で
- **PublishingLifecycleTimeline を専用 component に分離**: 既存 `LifecyclePipeline` (Idea→Published) と stage set が違う (計画→準備→レビュー→公開予定→公開済み)、混同回避のため別 component
- **PostPublishMonitoringCard の `EngagementPlaceholder` 再利用検討**: UI-2.5 component と構造ほぼ同じ、`variant` prop で共通化可能 (Phase UI-fidelity-4 着手時に判断)
- **RiskCheckCard を static で start**: boss-only mode で実 dynamic data なし、Phase UI-7+ で release-review の Safety Reaffirmation 連動
- **既存 GROQ で十分**: 新規 query 不要、`campaignDetailBySlugQuery` の field set 豊富
- **CampaignSwitcher の hand-roll 推奨**: shadcn `DropdownMenu` を 1 dropdown のために 3 dep 追加するのは過剰、UI-1 QuickCreateButton と同 pattern 流用
- **「今すぐ公開」/「公開設定」 actions は disabled placeholder**: Phase UI-7+ で auto-post / scheduling 機能が入るまで disabled、boss が「ここに button がほしい」を visual で読めれば十分

## 6. Human Review Questions

1. **P0 scope**: 6 件 (PageHeader + Hero + Channels + Media table + Lifecycle + 2-col layout) で MVP 着手で OK か、CampaignSwitcher も P0 に上げるべきか
2. **`/publish-package/[slug]` v0.2 との並走**: 両 route 共存で OK か、boss は将来 1 つに統合したいか
3. **PublishingLifecycleTimeline の stage set**: 計画 / 準備 / レビュー / 公開予定 / 公開済み で問題ないか、それとも別の 5 段が良いか
4. **PostPublishMonitoringCard の placeholder metric tile 4 件**: 視聴 / スキ・♥ / 購読・フォロー / 返信・引用 で良いか
5. **RiskCheckCard の check items**: 内部情報漏出 / 有料 PDF 引用 / 自動投稿 / 個人情報 / AI clone voice の 5 項目で良いか
6. **CampaignSwitcher dropdown**: hand-roll で OK か、shadcn `DropdownMenu` 採用したいか (3 dep 追加)
7. **「今すぐ公開」 button**: P2 disabled placeholder で OK か、Phase UI-3+ で実装したいか (Sanity write 連動)
8. **CampaignSwitcher URL searchParam (`?slug=...`)**: bookmarkable で良いか、boss は別の persistence 方式を希望するか

## 7. Risks or Uncertainties

- **`/publish` vs `/publish-package/[slug]` の data source 差**: Sanity 反映前の URL が v0.2 では既に出ているが `/publish` ではまだ未公開表示 → 一時的な乖離が起きる可能性。Phase UI-3 で write actions 統合時に解消
- **`PublishingMediaTable` と Campaign Detail の `PublishingScheduleTable` の重複**: 同じ column set + data source、共通 component 化候補。Phase UI-fidelity-4 着手時に「force しない (UI-fidelity-2 の指針通り)」で個別実装、Phase UI-fidelity-5 cleanup で抽出判断
- **`PublishingLifecycleTimeline` stage 計画 / 準備 / レビュー / 公開予定 / 公開済み**: boss の publishing mental model と完全一致するか確認必要。reference 画像から推測しているため、boss が「現状の段階感と違う」と判断する可能性
- **PostPublishMonitoringCard の placeholder**: UI-2.5 の `EngagementPlaceholder` と同 placeholder。boss が「3 page で同じ placeholder が並ぶのは退屈」と判断する可能性
- **CampaignSwitcher dropdown が hand-roll**: a11y / focus trap / Escape ハンドリングを毎回再実装する手間。Phase UI-fidelity-4 で 2 件目の hand-roll dropdown (QuickCreateButton に続く) になるなら、共通 `common/Dropdown.tsx` 抽出を検討
- **RiskCheckCard items の出典**: release-review の Safety Reaffirmation section から derive する余地あり、現状 static
- **「今すぐ公開」 / 「公開設定」 button が disabled で配置**: visual 上は完成しているが「触れないボタン」が boss にとって inconsistent に映る可能性

## 8. Recommended Next Step

1. boss が docs/75 + 本 handoff を音読、P0/P1/P2 のスコープと Human Review Questions に回答
2. 違和感なければ **Phase UI-fidelity-4 (Publish Management 実装)** に着手:
   - docs/75 + handoff §9 の Codex prompt を使用
   - P0 4 components + 2-col layout + page rework を 1 batch
   - boss-decided shadcn DropdownMenu の y/n を埋める
3. Phase UI-fidelity-4 完了後 → 次の選択肢:
   - 残 4 page (Configurator / Visual Review / Knowledge / Analytics) の fidelity spec 化
   - もしくは Phase UI-3 (write actions) に着手して `/publish` + `/outputs` + `/publish-package/[slug]` の inline edit を一気に統合

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup
- 残 4 page の fidelity spec 化 (一括 spec batch も可)

## 9. Exact Codex Prompt for Phase UI-fidelity-4

```text
Implement Phase UI-fidelity-4: Publish Management implementation.

References:
- docs/75-publish-management-fidelity-spec.md (P0/P1 sections, measurable checklist)
- docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png (ideal)
- docs/68-hitori-media-os-ui-design-system.md (tokens)
- docs/handoff/0148-publish-management-fidelity-spec.md (this spec batch context)
- docs/handoff/0147-ui-fidelity-3-dashboard-polish.md (latest design tone)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep /publish-package/[slug] v0.2 untouched.
- Keep /, /campaigns/[slug], /outputs (UI-fidelity-1/2/3) untouched.
- Reuse design tone established in UI-2.5 / UI-fidelity-1 / -2 / -3.

Boss-confirmed scope (fill in before running):
- shadcn DropdownMenu for CampaignSwitcher: [yes | no]
  (if no, hand-roll using QuickCreateButton pattern from UI-1)
- Implement P1 components in this batch: [yes | no]
  (if no, only P0 6 items + bare structure)
- PublishingLifecycleTimeline stages:
  [計画 → 準備 → レビュー → 公開予定 → 公開済み | other custom]

Package policy:
- Add packages only if needed:
    npx shadcn@latest add dropdown-menu  (only if CampaignSwitcher uses shadcn)
- Do NOT add shadcn templates.
- Hand-rolled dropdown pattern is available in QuickCreateButton.tsx.

Tasks:

1. New publish components in dashboard/src/components/publish/:
   P0:
   - PackageHeroCard.tsx
       Full-width card with campaign title + status badge + description
       (coreThesis) + small cover thumbnail area (placeholder).
   - ChannelsGrid.tsx
       6-8 platform rows with PlatformBadge + status dot + URL
       (truncated) + open + URL-copy icon.
   - PublishingMediaTable.tsx
       6-column DataTable: 媒体 / レビュー状態 / Published URL /
       Published At / 担当 / 操作
       Reuses StatusBadge + PlatformBadge.
       Note: pattern similar to Campaign Detail's PublishingScheduleTable
       — do NOT extract shared DataTable yet, keep page-specific.
   - PublishingLifecycleTimeline.tsx
       Horizontal arrow flow with publish-specific 5 stages.
       Distinct from common/LifecyclePipeline (idea→published).
   P1 (if scope allows):
   - CampaignSwitcher.tsx (hand-roll dropdown, URL searchParam ?slug=)
   - IncludedAssetsTable.tsx (visualAssetDetails + outputs)
   - ReleaseNotesCard.tsx (static highlights for now)
   - RiskCheckCard.tsx (5 check items, static green/amber)
   - PostPublishMonitoringCard.tsx (4 metric tile, placeholder, reuse
     EngagementPlaceholder logic if simple)

2. Replace dashboard/src/app/publish/page.tsx:
   - Delete PhasePlaceholder
   - Server component fetching campaignDetailBySlugQuery (slug from
     searchParams.slug or latest active campaign)
   - PageHeader with Breadcrumb + title + 3 actions (公開パッケージを編集,
     公開設定, 今すぐ公開 — first two as outline buttons, last as primary
     blue, all three disabled placeholder for now)
   - (P1) CampaignSwitcher below header
   - PackageHeroCard
   - 2-col grid:
       Left: ChannelsGrid + PublishingMediaTable + (P1) IncludedAssetsTable
       Right: PublishingLifecycleTimeline + (P1) ReleaseNotesCard +
              (P1) RiskCheckCard + (P1) PostPublishMonitoringCard

3. (P2 — defer to next batch):
   - PublishingCalendarCard
   - inline URL edit
   - dynamic 担当 avatar
   - real reaction data

Validation:
- cd dashboard && npm run build
- npm run build
- Manual check at /publish (defaults to building-hitori-media-os):
    - Breadcrumb / 3 actions / Package hero
    - ChannelsGrid shows 4 platform rows from manualPublishingStatus
    - PublishingMediaTable shows 4 rows with URL + date
    - PublishingLifecycleTimeline highlights current stage
- Verify /publish-package/[slug], /, /campaigns/[slug], /outputs untouched

Docs:
- docs/devlog/<番号>-ui-fidelity-4-publish-management.md
- docs/handoff/<番号>-ui-fidelity-4-publish-management.md
- docs/handoff/latest.md (mirror)
```
