# Handoff: Phase UI-fidelity-10 Final ReadOnlyBanner pages implementation

Date: 2026-05-20

## 1. Task Goal

docs/80 で確定した spec を 1 batch で実装し、`/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` の 3 page から最後の `<ReadOnlyBanner />` 利用を除去。Phase UI-fidelity-1〜10 で **Hitori Media OS の 23 routes 全てが fidelity 化完了**。follow-up microbatch で `ReadOnlyBanner.tsx` 本体を削除すれば cleanup chain も完結する。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 7.7s clean)
- ✅ `/publish-package/[slug]` の copy-friendly behavior + publish package parsing は完全保護
- ✅ Phase UI-fidelity-1〜9 で fidelity 化済 page も unchanged
- ✅ Phase 2B write actions 未実装

## 3. Changed Files

### 更新 (3)

- `dashboard/src/app/campaigns/page.tsx` — Breadcrumb 追加 + KpiCardsRow (4 件) 追加 + ReadOnlyBanner 削除
- `dashboard/src/app/human-review-gates/page.tsx` — 完全 fidelity 再構成 (PageHeader + Breadcrumb + 日本語 rename + 4 KpiCard + bucket sections with line-clamp/details)
- `dashboard/src/app/publish-package/[slug]/page.tsx` — surgical edit 3 行のみ (ReadOnlyBanner import + 2 calls 削除、他は完全 untouched)

### 不変

- `dashboard/src/components/ReadOnlyBanner.tsx` — **本 batch では削除せず**、follow-up microbatch で `rm` 予定
- データ取得ロジック (`campaignListQuery` / `pendingHumanReviewGatesQuery` / `readPublishPackage` / `publishPackageStateBySlugQuery`) — touch なし
- `flatten()` / `formatDate()` helper — touch なし
- Phase UI-fidelity-1〜9 で fidelity 化済の他 page すべて

### 新規 docs

- `docs/devlog/0153-ui-fidelity-10-final-readonlybanner-pages.md`
- `docs/handoff/0164-ui-fidelity-10-final-readonlybanner-pages.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Routes changed (3)

| Route | 内容 |
|---|---|
| `/campaigns` | PageHeader に `breadcrumb` prop 追加 / KpiCardsRow (全キャンペーン Rocket slate / active Activity blue / 公開済み CheckCircle2 emerald / レビュー待ち Eye orange) / 既存 CampaignRow / table / progressOf() 全保持 / empty state は `border-dashed bg-slate-50` に微改善 |
| `/human-review-gates` | 完全再構成: max-w-6xl py-8 → max-w-[1280px] py-6 / 旧 `<header>` + h1 を PageHeader + Breadcrumb に置換 / 「Human Review Gates」 → 「確認待ちゲート」 / `BUCKETS` 定数で並び順 (pending-review → in-progress → blocked → not-started) を確定 / 4 KpiCard / 各 bucket section は inline `<header>` + 統計 chip + line-clamp-2 notes + `<details>` で長文 (>160 chars) collapsible / all-zero empty state |
| `/publish-package/[slug]` | surgical edit (3 行): import 削除 + disabled branch `<ReadOnlyBanner />` 削除 + main branch `<ReadOnlyBanner />` 削除。**それ以外は完全 untouched** (740 行の copy-friendly UI、PageHeader / PlatformOverviewCards / 4 platform Section / ReleaseReviewFooter / 各種 sub-component すべて保持) |

### 4-2. ReadOnlyBanner imports removed

実行コマンド:
```bash
grep -rn "ReadOnlyBanner" dashboard/src
```

Before (5 lines):
```
campaigns/page.tsx:5 (import)
campaigns/page.tsx:22 (call)
human-review-gates/page.tsx:8 (import)
human-review-gates/page.tsx:68 (call)
publish-package/[slug]/page.tsx:4 (import)
publish-package/[slug]/page.tsx:42 (call、disabled branch)
publish-package/[slug]/page.tsx:64 (call、main branch)
```

After (1 line):
```
dashboard/src/components/ReadOnlyBanner.tsx:9 (export function ReadOnlyBanner)
```

**page-level import / call はすべて 0**。残るのは component 本体ファイルのみ → follow-up microbatch で削除可能。

### 4-3. /publish-package surgical edit confirmation

`/publish-package/[slug]/page.tsx` の変更内容は **3 行削除のみ**:

| Line | Before | After |
|---|---|---|
| L4 (import) | `import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'` | (削除) |
| L42 area (disabled branch) | `<ReadOnlyBanner />` の 1 行 | (削除) |
| L64 area (main branch) | `<ReadOnlyBanner />` の 1 行 | (削除) |

以下は **完全に untouched**:
- `readPublishPackage` 呼び出し / Promise.all による並列 fetch
- PageHeader 関数 (page-internal、`common/PageHeader` ではない)
- PlatformOverviewCards / XSection / ThreadsSection / NoteSection / SubstackSection / ReleaseReviewFooter
- Pair / PublishedBadge / PublishedStatusBlock の各 sub-component
- 740 行のうち実際の変更は 3 行のみ、残りはすべて元のまま
- enableLocalFsRoutes branch の amber warning section
- CopyButton 統合の copy-friendly logic
- max-w-5xl / max-w-4xl の layout 幅 (boss workflow に最適化済)

### 4-4. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7725ms) clean
```

23 routes 健在 (前 batch から変動なし):

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

### 4-5. Remaining ReadOnlyBanner references

```bash
grep -rn "ReadOnlyBanner" dashboard/src
```

唯一の残り参照:

```
dashboard/src/components/ReadOnlyBanner.tsx:9:export function ReadOnlyBanner() {
```

= **コンポーネント本体ファイルのみ**、外部 import / call は 0。follow-up microbatch で `rm` 可能 (deletion チェック OK)。

## 5. Key Decisions

- **`/campaigns` の最小 touch**: 既に大半 fidelity 整合済、Breadcrumb + KpiCardsRow + ReadOnlyBanner 削除の 3 アイテムのみ
- **`/human-review-gates` の完全再構成**: 最も outdated、bucket order を `BUCKETS` 配列で明示することで KpiCardsRow と section 群が同じ順序で render される (single source of truth)
- **`/publish-package/[slug]` surgical edit 厳守**: 740 行の boss workflow を保護、Breadcrumb 追加すら見送り (boss 指示で「触らない」厳守)
- **`<details>` で長文 notes を畳む**: 160 chars 以上の notes は collapsible (line-clamp-2 で要約 + summary クリックで全文)、短い notes は line-clamp-2 のままで済む。縦スクロール削減
- **`GateBucketSection` extraction なし (YAGNI)**: 4 bucket pattern は page 内 inline で 1 file 完結、再利用ニーズが出るまで保留
- **all-zero empty state**: bucket がすべて空のときに dashed border card を 1 件表示、boss が「dataset 投入待ち」と分かる
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜9 と同方針
- **`ReadOnlyBanner.tsx` 本体は本 batch で削除しない**: 実装と削除を分離して diff の review 範囲を切り分ける、follow-up microbatch で確実に `rm`

## 6. Human Review Questions

1. **`/human-review-gates` rename**: 「確認待ちゲート」で違和感ないか?
2. **`/campaigns` KpiCard secondary 文言**: 「draft / planning / generating / reviewing」「manualPublishingStatus.publishedUrl」「humanReviewGates」等の technical 文言、boss が違和感あれば 1 段ぼかす
3. **`/human-review-gates` の line-clamp-2 + `<details>` パターン**: 視認性 OK か?「最初から全文」希望なら初期 open に変更可能
4. **`/publish-package/[slug]` surgical edit**: ReadOnlyBanner 削除のみで他 untouched、boss workflow に影響ゼロを確認できるか?
5. **follow-up microbatch のタイミング**: 本 batch を boss が確認後すぐ `rm` するか、もう 1 回 dev で動作確認してから `rm` か?

## 7. Risks or Uncertainties

- **`/human-review-gates` の `<details>` 内 `<span className="line-clamp-2">`**: summary 内に span を入れているが、ブラウザによっては summary 自体が `display: list-item` でレイアウト差異が出る可能性。boss feedback で要再調整
- **`/campaigns` の `pendingGatesCount` aggregation**: 既存 `campaignListQuery` で各 campaign に `pendingGatesCount` が含まれているが、`dashboardHomeQuery.pendingGatesTotal` と数値が一致するか dataset によって異なる可能性 (active 4 status の絞り込みが list query 側に効いていない場合)。boss 環境で確認推奨
- **`/publish-package/[slug]` の `gap-5` vs `gap-4`**: 旧コードは disabled branch が `gap-4`、main branch が `gap-5` → 維持。fidelity 基準は `gap-5` だが boss 指示で touch なし
- **dataset 偏り**: 現状 building-hitori-media-os のみ → `/campaigns` の KpiCard が 1 / 0 / N / 0 のように偏る可能性
- **`ReadOnlyBanner` を `import` した古い branch / PR**: 別 branch にあれば merge 時 conflict、ただし main では完全に 0

## 8. Remaining Gaps

- **`ReadOnlyBanner.tsx` 本体の削除**: 本 batch では touch せず、follow-up microbatch で `rm` 予定
- **`/publish-package/[slug]` の fidelity tone 統一**: boss 指示で touch なし、将来 Phase 2B + boss 同意が揃ったタイミングで再検討
- Phase Admin 1 Batch A/B/C 時代 component (CampaignStatusCard 等) の audit
- dashboard/README.md 全体書き直し
- Phase 2B 実 write actions / 外部 analytics API / promptTemplate dataset 投入

## 9. Next Recommended Step

**Option A (推奨、軽い、5 分) — ReadOnlyBanner.tsx deletion microbatch**

import 0 を確認済みなので、最後の `rm` を実行する microbatch。Hitori Media OS UI fidelity cycle の dead-code cleanup chain が完全終了する。

```text
Delete ReadOnlyBanner.tsx after Phase UI-fidelity-10.

Use:
- docs/handoff/0164-ui-fidelity-10-final-readonlybanner-pages.md (this handoff、§4-5 で import 0 確認済)

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持
- 削除前に import count 0 を grep で再確認

Tasks:
1. Re-verify: grep -rn "ReadOnlyBanner" dashboard/src → component 本体 1 行のみ
2. Delete dashboard/src/components/ReadOnlyBanner.tsx
3. cd dashboard && npm run build → 23 routes 維持
4. npm run build (Sanity Studio) → clean
5. Final grep: grep -rn "ReadOnlyBanner" dashboard → 0 lines
6. Write docs/devlog/0154-readonlybanner-final-delete.md + docs/handoff/0165 + latest mirror
   → Hitori Media OS UI fidelity cycle 完全終了の post-state を明文化
```

**Option B — dashboard/README.md 全体書き直し**

Batch B/C/D 時代の構造記述を Phase UI-fidelity-1〜10 の現状に更新。

**Option C — Phase Admin 1 Batch A/B/C 時代 component audit**

`CampaignStatusCard` / `NextActionSummary` / `NextActionChecklist` / `WorkingPipelineStatus` / `PublishReadinessBoard` / `PublishPackageLinks` / `ManualPublishingStatusList` / `PromptTemplateSummary` / `HumanReviewGateList` / `VisualAssetStatusTable` / `ReleaseReviewLinks` / `SelectedPlatformChips` の import 数を grep で確認、削除候補を抽出。

**Option D — Phase 2B 議論**

実 write actions (Approve & register / Regenerate / reactionNotes writable / Sanity controlled write) の方針確定。
