# Handoff: /campaigns/[slug] deep refactor fidelity spec (Phase UI-fidelity-11)

Date: 2026-05-20

## 1. Task Goal

handoff/0168 audit で確定した B 7 件 + C 1 件の legacy component (= すべて `/campaigns/[slug]` 周辺に集中) を deep refactor で削除可能にする **audit + spec docs only** batch。実装 batch + follow-up cleanup microbatch の 2 段で Phase Admin 1 Batch A/B/C 時代の legacy component を完全終了させる cleanup chain を確定。

加えて `ReleaseReviewLinks.tsx` の hardcoded `building-hitori-media-os` (B1 fixes の見逃し) も本 spec で page-local 化することで完全排除。

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
- ✅ Phase UI-fidelity-1〜10 で fidelity 化済の他 page も unchanged

## 3. Changed Files

### 新規 docs (4)

- `docs/81-campaign-detail-deep-refactor-spec.md`
- `docs/devlog/0159-campaign-detail-deep-refactor-spec.md`
- `docs/handoff/0170-campaign-detail-deep-refactor-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Route audited

`/campaigns/[slug]/page.tsx` (419 行) を line-by-line audit。

- **Imports**: 7 件の legacy component + 5 件の fidelity component が共存
- **Top section**: PageHeader / KpiCardsRow / LifecyclePipeline + 2-col grid (CampaignBriefCard + PublishingScheduleTable / PublishReadinessScore + NextActionList + ReleaseReviewLinks) — `ReleaseReviewLinks` のみが legacy
- **詳細 section**: 9 tabs、うち 6 tabs が legacy component を直接 render、1 tab が PublishingScheduleTable と完全重複
- **Helpers**: buildLifecycle / CampaignBriefCard / ContentIdeaSection / BrandProfileSection / ExternalLinks (すべて page-local 関数、touch なし)

### 4-2. Legacy components mapped (8 件)

| Component | 使用箇所 | 置換戦略 |
|---|---|---|
| `SelectedPlatformChips` | 媒体 tab | inline `PlatformsSection` (PlatformBadge + platformLabel + priority/depth meta) |
| `HumanReviewGateList` | 確認ゲート tab | inline `GatesSection` (compact list + `/human-review-gates` link) |
| `VisualAssetStatusTable` | 画像・図解 tab | inline `VisualsSection` (compact list + `/visual-assets` link) |
| `PromptTemplateSummary` | プロンプト tab | inline `PromptsSection` (template + category + platform + Studio link) |
| `PublishPackageLinks` | パッケージ tab | inline `PackagePathsSection` (FilePathsCard pattern + CopyButton) |
| `ManualPublishingStatusList` | 公開状況 (詳細) tab | **tab 自体を drop** (PublishingScheduleTable と完全重複) |
| `ReleaseReviewLinks` | Right column (+ Home `/`) | page-local `ReleaseReviewCard` (campaign.releaseReviewPath 駆動) + Home から完全削除 |
| `NextActionSummary` | indirect: `computeNextActions` helper を `campaign/NextActionList.tsx:13` が import | helper を `lib/campaign/nextActions.ts` に extract、ファイル削除可能化 |

### 4-3. Target structure

```
[PageHeader]          ← 既存維持
[KpiCardsRow]         ← 既存維持
[LifecyclePipeline]   ← 既存維持
[2-col grid]
  Left:  CampaignBriefCard + PublishingScheduleTable           ← 既存維持
  Right: PublishReadinessScore + NextActionList + ReleaseReviewCard (新規 page-local)
[詳細 Tabs (9 → 8)]
  - Content Idea / ブランド / 媒体 / 確認ゲート / 画像・図解 / プロンプト / パッケージ / 外部リンク
  - 「公開状況 (詳細)」 tab drop
  - 媒体〜パッケージ tab は新規 page-local section に置換
[Helpers (既存維持 + 6 新規 page-local section)]
```

### 4-4. Replacement strategy (sample code in spec §3)

- 7 件すべてに対し inline page-local 関数を sample code 付きで提案 (docs/81 §3-1 〜 §3-7)
- 8 件目 (`NextActionSummary`) は helper extract の 3-step microbatch (docs/81 §3-8)
- すべて native HTML + Tailwind、shadcn なし
- データ shape は既存 `CampaignPlanDetail` をそのまま使用、新 query 0

### 4-5. P0 / P1 / P2 scope

**P0 (Phase UI-fidelity-11 必須)**:
- 7 legacy import 削除 + 6 page-local section 新規 + 1 tab drop
- `computeNextActions` を `lib/campaign/nextActions.ts` に extract、`NextActionList.tsx` import 更新
- Home (`/page.tsx`) から `ReleaseReviewLinks` import + render 削除
- 23 routes build green、動作変化なし

**P1 (本 batch or 別 batch)**: Tabs 統合 (9 → 8 → 5-6) / 右 sidebar 密度改善 / platform-specific generation setting display

**P2 (Phase 2B)**: PageHeader「編集」/「共有」 enable / campaign edit form / gate state change UI

### 4-6. Cleanup chain

```
Phase UI-fidelity-11 (実装 batch)
  └─ /campaigns/[slug]/page.tsx: 7 legacy import 削除 + 6 page-local section
  └─ campaign/NextActionList.tsx: import 元を lib/campaign/nextActions.ts に更新
  └─ /page.tsx (Home): ReleaseReviewLinks 利用削除
  └─ grep "from '@/components/<LegacyName>'" → 0 (8 件すべて)

Follow-up microbatch (実装直後)
  └─ 8 ファイル一括 rm
  └─ Phase Admin 1 Batch A/B/C 時代 legacy component が完全終了
```

### 4-7. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged、コード差分なし)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (unchanged)
```

両 build とも前 batch (handoff/0169) 完了時から不変、audit + spec docs only batch であることを確認。

## 5. Key Decisions

- **deep refactor を独立 batch に**: Phase UI-fidelity-1 「並存」trade-off の精算。1 PR で 419 行 page + 8 legacy 削除前提の全置換を扱う中規模 batch
- **公開状況 (詳細) tab を drop**: PublishingScheduleTable と完全重複、ノイズ削減
- **`ReleaseReviewLinks` を本 spec で扱う**: B1 fixes の見逃し回収、hardcoded `building-hitori-media-os` を campaign.releaseReviewPath 駆動に
- **Home からも完全削除**: 代替なし、PageHeader CTA で機能カバー済
- **page-local function 採用**: 7 件の置換を component file ではなく page-local 関数に、共通化は YAGNI で先延ばし
- **helper extract を実装 batch に同梱**: 別 microbatch にすると scope-creep、`/campaigns/[slug]` rewrite と同じ PR にする
- **8 ファイル削除を follow-up microbatch に**: 実装 + 削除を 2-stage に分離 (Phase UI-fidelity-7〜10 と同 pattern)
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜10 と同方針

## 6. Human Review Questions

1. **公開状況 (詳細) tab 削除**: PublishingScheduleTable との重複が boss 認知でも実際に redundant か?
2. **Home からの `ReleaseReviewLinks` 完全削除**: 推奨だが、boss が「Home から release-review に直接飛びたい」希望なら primary campaign の `releaseReviewPath` で再構築する代替案あり
3. **Tabs 統合 (P1)**: 9 → 8 を本 batch で達成、さらに 5-6 への統合は同 batch / 別 batch?
4. **`computeNextActions` extract 先**: `lib/campaign/nextActions.ts` で OK か?
5. **`ReleaseReviewCard` の 5 file list 固定**: x / threads / note / substack + checklist で固定、campaign 差異対応は YAGNI で OK か?
6. **Implementation order**: 1 batch でまとめて (推奨) or 分割?

## 7. Risks or Uncertainties

- **419 行 page の rewrite scope**: 大規模 diff になる、boss review に時間がかかる可能性。section 単位で incremental に commit する選択肢あり (本 batch では推奨せず、1 PR で land)
- **6 件の inline section が page を肥大化**: 419 行 → 推定 450-500 行に。1 page あたりの行数増、ただし複数 file からまとめた結果なのでネット line count は減る
- **`ReleaseReviewCard` の 5 file は campaign 全てで存在する保証なし**: ファイルが実在しなくても path 表示は無害 (fs read していない)、boss が「ファイル不在を視覚化したい」なら別途 P1 で existence check
- **Home の `data.campaigns[]` shape**: B1 fixes で導入した `pickPrimaryCampaign` は CampaignListItem (summary) を扱う、`releaseReviewPath` は detail だけにある。Home で release-review を再構築する場合は別 query 必要 (本 spec では Home 削除を推奨で回避)
- **`computeNextActions` の依存**: NextActionSummary.tsx 内の helper (isActiveGateState / actionToneClasses 等) が computeNextActions と同 file 内、すべて lib にも movement 必要 (docs/81 §3-8 で明示)
- **`/campaigns/[slug]` の boss workflow**: 現状の 9 tabs UX に boss が慣れている可能性、8 tabs に減らすと混乱の可能性 (実装後 boss が再評価)

## 8. Next Recommended Step

**Option A — Phase UI-fidelity-11 実装 batch (推奨)**

`/campaigns/[slug]` deep refactor を 1 PR で land。docs/81 §3 の sample code をベースに 6 新規 page-local section + 1 tab drop + helper extract。Codex prompt は §9 で同梱。

**Option B — Tabs 統合 spec を先に**

P1 候補の Tabs 整理 (9 → 5-6) を別 spec batch で確定してから実装。

**Option C — `NextActionSummary` helper extract microbatch (単発)**

Phase UI-fidelity-11 が遠い場合、helper extract のみ単独 microbatch で先行。`/campaigns/[slug]` deep refactor は後でも可能。

**Option D — dashboard/README.md 全体書き直し**

Phase UI-fidelity-1〜10 + audit + delete 全反映の README rewrite。

## 9. Exact Codex Prompt for Phase UI-fidelity-11 Implementation

```text
Implement Phase UI-fidelity-11: /campaigns/[slug] deep refactor.

Use:
- docs/81-campaign-detail-deep-refactor-spec.md (this spec)
- docs/handoff/0170-campaign-detail-deep-refactor-spec.md (this handoff、boss decisions が反映されたもの)

Boss-confirmed scope (handoff §6 で boss が回答した内容を確認してから着手):
- 公開状況 (詳細) tab: drop (PublishingScheduleTable と重複)
- Home (/page.tsx) から ReleaseReviewLinks: 完全削除
- Tabs 統合 (P1): 本 batch で 9 → 8 のみ、5-6 への統合は別 batch
- computeNextActions extract 先: lib/campaign/nextActions.ts
- ReleaseReviewCard 5 file list: 固定 (x/threads/note/substack/checklist)
- 1 batch でまとめて実装 (Option A)
- shadcn 追加なし、native HTML + Tailwind のみ

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals / patches
- Do NOT add packages
- Do NOT deploy / auto-post
- Keep all 23 routes working
- Do NOT change /publish-package/[slug]
- Do NOT change data fetch logic (campaignDetailBySlugQuery untouched)
- Keep /, /configurator, /publish, /outputs, /campaigns (list), /visual-assets/*, /publish-packages, /activity-log, /diagnostics, /knowledge, /analytics, /settings, /human-review-gates unchanged (Home の ReleaseReviewLinks 削除のみ touch)
- Phase 2B write actions 未実装

Tasks (P0):

1. Create dashboard/src/lib/campaign/nextActions.ts:
   - Copy interface Action / type ActionTone / PRIORITY_ORDER / isActiveGateState / isActiveVisualState / actionToneClasses / actionLabel / computeNextActions from NextActionSummary.tsx
   - Update CampaignPlanDetail import path

2. Update dashboard/src/components/campaign/NextActionList.tsx:
   - Change import: '@/components/NextActionSummary' → '@/lib/campaign/nextActions'

3. Update dashboard/src/app/campaigns/[slug]/page.tsx:
   - Remove 7 legacy imports (SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ReleaseReviewLinks)
   - Add 6 page-local sections (PlatformsSection / GatesSection / VisualsSection / PromptsSection / PackagePathsSection / ReleaseReviewCard) per docs/81 §3 sample code
   - Drop 「公開状況 (詳細)」 tab (TabsTrigger + TabsContent)
   - Replace right column ReleaseReviewLinks with ReleaseReviewCard
   - Keep CampaignBriefCard / ContentIdeaSection / BrandProfileSection / ExternalLinks / buildLifecycle page-local helpers untouched
   - Use existing Tabs / PageHeader / KpiCard / KpiCardsRow / LifecyclePipeline / PlatformBadge / StatusBadge / CopyButton

4. Update dashboard/src/app/page.tsx (Home):
   - Remove ReleaseReviewLinks import (line 6)
   - Remove <ReleaseReviewLinks /> render (line 195)
   - Do not add a replacement section (PageHeader CTA covers navigation)

5. Verify legacy imports drop to 0:
   ```bash
   grep -rn "from '@/components/SelectedPlatformChips'\|from '@/components/HumanReviewGateList'\|from '@/components/VisualAssetStatusTable'\|from '@/components/PromptTemplateSummary'\|from '@/components/PublishPackageLinks'\|from '@/components/ManualPublishingStatusList'\|from '@/components/ReleaseReviewLinks'\|from '@/components/NextActionSummary'" dashboard/src
   ```
   Expected: 0 lines.

6. Builds:
   - cd dashboard && npm run build (23 routes 維持)
   - npm run build (Sanity Studio clean)

7. Docs:
   - docs/devlog/0160-ui-fidelity-11-campaign-detail-deep-refactor.md
   - docs/handoff/0171-ui-fidelity-11-campaign-detail-deep-refactor.md
   - docs/handoff/latest.md (mirror)

Validation:
- 23 routes が build green
- /campaigns/building-hitori-media-os で 8 tabs + 既存の 2-col layout が render
- /campaigns/building-hitori-media-os で ReleaseReviewCard が campaign.releaseReviewPath を表示
- / (Home) から ReleaseReviewLinks section が消えている
- 8 legacy component の import 数すべて 0
- 既存 page (/configurator, /publish, /outputs, /publish-packages, /activity-log, /diagnostics, /knowledge, /analytics, /settings, /visual-assets/*, /campaigns list, /human-review-gates) は touch なし
- /publish-package/[slug] copy-friendly behavior 完全保持

Follow-up (本 batch 完了後の cleanup microbatch):
- grep 0 確認 → 8 ファイル一括 rm
- docs/devlog/0161-* + docs/handoff/0172-* + latest mirror
- → Phase Admin 1 Batch A/B/C 時代 legacy component 完全終了
```
