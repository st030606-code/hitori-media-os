# Handoff: Phase UI-fidelity-11 /campaigns/[slug] deep refactor

Date: 2026-05-20

## 1. Task Goal

docs/81 spec を 1 batch で実装し、`/campaigns/[slug]` (419 行) から 7 件の Phase Admin 1 legacy component imports を除去、Home (`/`) から `ReleaseReviewLinks` 利用を除去、`NextActionSummary` の `computeNextActions` helper を `lib/` に extract。8 legacy file の **import 数 = 0** に到達 → follow-up cleanup microbatch で 8 ファイル一括 `rm` → **Phase Admin 1 Batch A/B/C 時代 legacy component 完全終了** が可能。

データ取得ロジックは touch なし。Phase 2B write actions は scope 外。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard TypeScript clean、Sanity Studio 7.5s clean)
- ✅ `/publish-package/[slug]` copy-friendly behavior unchanged
- ✅ campaignDetailBySlugQuery 含むデータ取得ロジック touch なし
- ✅ 他 fidelity 化済 page unchanged (Home の ReleaseReviewLinks 利用削除のみ touch)
- ✅ Phase 2B write actions 未実装

## 3. Files Changed

### 新規 (1)

- `dashboard/src/lib/campaign/nextActions.ts` — `Action` / `ActionTone` / `PRIORITY_ORDER` / `isActiveGateState` / `isActiveVisualState` / `actionToneClasses` / `actionLabel` / `computeNextActions` を export

### 更新 (3)

- `dashboard/src/components/campaign/NextActionList.tsx` — import 元を `@/lib/campaign/nextActions` に (1 行)
- `dashboard/src/app/campaigns/[slug]/page.tsx` — 7 legacy import 削除 / 6 page-local section 関数追加 (PlatformsSection / GatesSection / VisualsSection / PromptsSection / PackagePathsSection / ReleaseReviewCard) / 1 tab drop (公開状況 詳細) / `formatIso` helper + `ReleaseFile` interface 追加
- `dashboard/src/app/page.tsx` (Home) — ReleaseReviewLinks import + render 削除、comment で移動先明示

### 不変 (touch なし)

- 8 legacy component file (本 batch では削除しない、follow-up microbatch で `rm`)
- データ取得ロジック (`campaignDetailBySlugQuery`、CampaignPlanDetail 型) — unchanged
- 他 fidelity 化済 page (`/configurator`, `/publish`, `/outputs`, `/visual-assets/*`, `/knowledge`, `/analytics`, `/settings`, `/publish-packages`, `/activity-log`, `/diagnostics`, `/human-review-gates`, `/campaigns` list, `/publish-package/[slug]`)
- Sanity schema / API routes / publish-package / assets/visuals / patches

### 新規 docs

- `docs/devlog/0160-ui-fidelity-11-campaign-detail-deep-refactor.md`
- `docs/handoff/0171-ui-fidelity-11-campaign-detail-deep-refactor.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. nextActions helper extraction

`dashboard/src/lib/campaign/nextActions.ts` (新規) に以下を export:
- `type ActionTone = 'now' | 'soon' | 'later' | 'warn' | 'done'`
- `interface Action`
- `const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3']`
- `function isActiveGateState(state?: string): boolean`
- `function isActiveVisualState(state?: string): boolean`
- `function actionToneClasses(tone: ActionTone): string`
- `function actionLabel(tone: ActionTone): string`
- `function computeNextActions(campaign: CampaignPlanDetail): Action[]`

`NextActionSummary.tsx` から **JSX を含まない部分のみ移植**。`computeNextActions` の logic は完全に同一 (1 文字も変更なし)。

`dashboard/src/components/campaign/NextActionList.tsx:13` の import を:
```ts
// before
import {computeNextActions} from '@/components/NextActionSummary'
// after
import {computeNextActions} from '@/lib/campaign/nextActions'
```

### 4-2. Legacy components removed from /campaigns/[slug]

| Old (import 削除) | Replacement (page-local) | 設計 |
|---|---|---|
| `SelectedPlatformChips` | `PlatformsSection` | enabled / disabled 分離、PlatformBadge + label + priority/depth |
| `HumanReviewGateList` | `GatesSection` | divide-y compact + line-clamp-2 notes + `/human-review-gates` link |
| `VisualAssetStatusTable` | `VisualsSection` | divide-y compact + StatusBadge + `/visual-assets` link |
| `PromptTemplateSummary` | `PromptsSection` | divide-y compact + template / category / platform / version + Studio link |
| `PublishPackageLinks` | `PackagePathsSection` | inline FilePathsCard pattern + CopyButton + StatusBadge + releaseReviewPath inline |
| `ManualPublishingStatusList` | **drop tab entirely** | PublishingScheduleTable と完全重複、tab 削除 |
| `ReleaseReviewLinks` (right column) | `ReleaseReviewCard` | `campaign.releaseReviewPath` 駆動、固定 5 file list、未設定なら null hide |

### 4-3. Home ReleaseReviewLinks removal

- `dashboard/src/app/page.tsx:10` の `import {ReleaseReviewLinks}` 削除
- 旧 line 194 の `<ReleaseReviewLinks />` 削除
- 旧コメント 「Lower prominence: release-review links + 外部ツール」 → 「Lower prominence: 外部ツール (release-review links moved to /campaigns/[slug] page-local ReleaseReviewCard per UI-fidelity-11)」 に更新
- 代替 section なし (PageHeader CTA で機能カバー、B1 fixes と整合)

### 4-4. Tab count change

- Before: **9 tabs** (Content Idea / ブランド / 媒体 / 確認ゲート / 画像・図解 / プロンプト / パッケージ / 公開状況 詳細 / 外部リンク)
- After: **8 tabs** (公開状況 詳細 を drop、他はラベル維持)

PublishingScheduleTable (main 2-col Left) が manualPublishingStatus を同 data source で同等 render → 「公開状況 詳細」 tab は完全重複、削除。

### 4-5. Import verification

```bash
$ grep -rn "from '@/components/SelectedPlatformChips'\|from '@/components/HumanReviewGateList'\|from '@/components/VisualAssetStatusTable'\|from '@/components/PromptTemplateSummary'\|from '@/components/PublishPackageLinks'\|from '@/components/ManualPublishingStatusList'\|from '@/components/ReleaseReviewLinks'\|from '@/components/NextActionSummary'" dashboard/src
$ # (no output)
```

= **0 lines**、8 legacy component の import が dashboard ソースから完全に消滅。

### 4-6. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7460ms) clean
```

最初の build で `RELEASE_FILES as const` が TypeScript literal narrowing で `.note` field を失う型エラー (line 448)。`interface ReleaseFile` + `readonly ReleaseFile[]` 型注釈で解決、2 回目の build で green。

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

## 5. Key Decisions

- **page-local 関数を採用 (6 件すべて)**: 共通化 (component 化) は YAGNI、`/campaigns/[slug]` 専用 logic を 1 file 内に集約 (419 → 推定 600 行)
- **`computeNextActions` を `lib/campaign/` に**: `lib/configurator/` (Phase UI-fidelity-5) と同 pattern、page-domain logic の集約場所として一貫性確保
- **Home から ReleaseReviewLinks 完全削除**: 代替なし、PageHeader CTA で機能カバー (B1 fixes と整合)
- **ReleaseReviewCard を null-return で hide**: `campaign.releaseReviewPath` 未設定時に意味のない empty section を出さない
- **「公開状況 詳細」 tab drop**: PublishingScheduleTable と data source / render 結果完全重複、ノイズ削減
- **`PackagePathsSection` の design**: 旧 PublishPackageLinks の per-path box layout から settings/LocalDevCard 系の inline `<code>` + CopyButton に変更、fidelity tone と整合
- **`interface ReleaseFile`**: `as const` の literal narrowing 罠を avoid、optional field を許容する型を明示
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜10 と同方針
- **8 file 削除を follow-up microbatch に分離**: 実装 + 削除を 2-stage、Phase UI-fidelity-7〜10 と同 pattern

## 6. Human Review Questions

1. **PlatformsSection の disabled section**: enabled / disabled 分離、boss feedback でレイアウト微調整
2. **GatesSection の line-clamp-2**: notes が長文時に collapsible (`<details>`) を入れるか、現状の clamp で OK か
3. **VisualsSection の `/visual-assets` link**: 当面 list page 全体に飛ぶ、boss が「この campaign の visual だけ filter したい」希望なら `/visual-assets?campaign=<slug>` 等の search param 検討 (P1)
4. **PromptsSection の template が null の場合**: 現状 「—」 を表示、boss feedback で改善余地
5. **PackagePathsSection の inline layout**: 旧 PublishPackageLinks の 2-col box vs 新 inline `<code>` + CopyButton、視認性 boss feedback
6. **ReleaseReviewCard hide on no path**: 未設定の campaign では右 column の section 数が減る、boss が「placeholder 表示したい」希望なら option

## 7. Risks or Uncertainties

- **`/campaigns/[slug]` の page サイズ**: 419 行 → 推定 600 行 (page-local function 6 件 + ReleaseFile interface + formatIso helper)。1 file 完結だが boss が「分割したい」と感じれば split microbatch あり
- **`/configurator/promptBuilder.ts` の `normalizeTextList` と類似ロジック**: `PromptsSection` で template 表示時に template が null チェックのみ、Phase UI-fidelity-5 で導入した normalize logic は使っていない (現状必要なし、template ref が定義型のため)
- **Visual section link `/visual-assets`**: campaign filter なし、Phase UI-fidelity-7 で URL searchParams sync を入れた pattern を流用すれば P1 で実装可能
- **Home から release-review section 消失**: boss が「Home から release-review に直接飛びたい」習慣があれば違和感、PageHeader CTA で代替できることを boss が再確認推奨
- **`ReleaseFile` interface の固定 5 file**: 他 campaign が独自 file list を持つときに対応できない。spec §G-5 で boss は「固定で OK」と承認済、YAGNI

## 8. Remaining Cleanup Candidates

### 即削除可能 (follow-up microbatch)

8 ファイル、grep 0 確認済:
- `dashboard/src/components/SelectedPlatformChips.tsx`
- `dashboard/src/components/HumanReviewGateList.tsx`
- `dashboard/src/components/VisualAssetStatusTable.tsx`
- `dashboard/src/components/PromptTemplateSummary.tsx`
- `dashboard/src/components/PublishPackageLinks.tsx`
- `dashboard/src/components/ManualPublishingStatusList.tsx`
- `dashboard/src/components/ReleaseReviewLinks.tsx`
- `dashboard/src/components/NextActionSummary.tsx`

### 中期 / 長期

- dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜11 反映)
- Phase 2B 実 write actions (campaign edit / gate state write / visualAssetPlan inline approve)
- Tabs 統合 P1 (9 → 5-6 への深掘り)
- DeferredActionButton / LocalModeBanner の役目終了 (Phase 2B / Phase D2)

## 9. Next Recommended Step

**Option A (推奨、5 分以下) — Follow-up cleanup microbatch**

8 legacy file を `rm` する microbatch。Phase Admin 1 Batch A/B/C 時代 legacy component の完全終了。

```text
Delete 8 Phase Admin 1 B/C bucket legacy components after Phase UI-fidelity-11.

Use:
- docs/handoff/0171-ui-fidelity-11-campaign-detail-deep-refactor.md §4-5 で import 0 確認済

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持
- Re-verify import 0 before each rm

Tasks:
1. Re-verify: grep for 8 import paths → 0 lines expected
2. Delete:
   - dashboard/src/components/SelectedPlatformChips.tsx
   - dashboard/src/components/HumanReviewGateList.tsx
   - dashboard/src/components/VisualAssetStatusTable.tsx
   - dashboard/src/components/PromptTemplateSummary.tsx
   - dashboard/src/components/PublishPackageLinks.tsx
   - dashboard/src/components/ManualPublishingStatusList.tsx
   - dashboard/src/components/ReleaseReviewLinks.tsx
   - dashboard/src/components/NextActionSummary.tsx
3. Final grep:
   grep -rn "SelectedPlatformChips\|HumanReviewGateList\|VisualAssetStatusTable\|PromptTemplateSummary\|PublishPackageLinks\|ManualPublishingStatusList\|ReleaseReviewLinks\|NextActionSummary" dashboard/src
   Expected: 0 lines (component definitions deleted)
4. cd dashboard && npm run build → 23 routes 維持
5. npm run build (Sanity Studio) → clean
6. docs/devlog/0161-* + docs/handoff/0172-* + latest mirror
   → Phase Admin 1 Batch A/B/C 時代 legacy component 完全終了
```

**Option B — dashboard/README.md 全体書き直し**

Phase UI-fidelity-1〜11 + 全 cleanup chain を反映する README rewrite batch。

**Option C — Phase 2B 議論**

実 write actions (Approve & register / Regenerate / reactionNotes writable / campaign edit / Sanity controlled write) の方針確定。
