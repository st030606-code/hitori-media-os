# Handoff: Final old component cleanup after Phase UI-fidelity-8

Date: 2026-05-20

## 1. Task Goal

handoff/0159 §4-5 で「ready to delete」と確認した 4 旧 component を grep で再検証してから `rm` する cleanup-only microbatch。Runtime 振る舞い無変更。Phase UI-fidelity-1〜8 の cleanup 連鎖を完結。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio clean)
- ✅ 削除前に import 数 0 を grep で確認

## 3. Changed Files

### 削除 (4)

- `dashboard/src/components/SummaryCard.tsx`
- `dashboard/src/components/SectionHeader.tsx`
- `dashboard/src/components/EmptyState.tsx`
- `dashboard/src/components/FilePathBlock.tsx`

### 編集 (0)

active file は **完全に touch なし**。

### 新規 docs

- `docs/devlog/0149-final-old-component-cleanup.md`
- `docs/handoff/0160-final-old-component-cleanup.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Files checked (5)

| File | grep 実行 | 結果 |
|---|---|---|
| `SummaryCard.tsx` | `grep -rn "from '@/components/SummaryCard'" dashboard/src` + word-boundary grep (PromptSummaryCard を除外) | 0 lines |
| `SectionHeader.tsx` | `grep -rn "from '@/components/SectionHeader'" dashboard/src` | 0 lines |
| `EmptyState.tsx` | `grep -rn "from '@/components/EmptyState'" dashboard/src` | 0 lines |
| `FilePathBlock.tsx` | `grep -rn "from '@/components/FilePathBlock'" dashboard/src` | 0 lines |
| `ReadOnlyBanner.tsx` | `grep -rn "ReadOnlyBanner" dashboard/src` | **5 lines** (3 active pages) — keep |

### 4-2. Files deleted (4)

import 数 0 を grep で確認したもの:

| File | 直前まで使われていた page (Phase UI-fidelity-8 で除去) |
|---|---|
| `SummaryCard.tsx` | `/publish-packages`, `/activity-log`, `/diagnostics` (各 ×4) |
| `SectionHeader.tsx` | `/activity-log` (×2), `/diagnostics` (×2) |
| `EmptyState.tsx` | `/publish-packages` (×3), `/activity-log` (×3), `/diagnostics` (×2) |
| `FilePathBlock.tsx` | `/publish-packages` (×1) |

### 4-3. Files intentionally kept (1)

| File | 残り呼び出し元 | 件数 | 判定 |
|---|---|---|---|
| `dashboard/src/components/ReadOnlyBanner.tsx` | `/human-review-gates/page.tsx`, `/publish-package/[slug]/page.tsx`, `/campaigns/page.tsx` | 5 (publish-package で 2 回) | active、削除しない |

ReadOnlyBanner 自体は実装上 `return null` の no-op だが、3 active page で依然 import されている。これら 3 page (Phase UI-fidelity-1〜8 で未着手) を fidelity 化するときに同時削除可能になる。

### 4-4. Import verification result

実行コマンド (precise grep):

```bash
grep -rn "from '@/components/SummaryCard'" dashboard/src    # → 0 lines
grep -rn "from '@/components/SectionHeader'" dashboard/src  # → 0 lines
grep -rn "from '@/components/EmptyState'" dashboard/src     # → 0 lines
grep -rn "from '@/components/FilePathBlock'" dashboard/src  # → 0 lines
```

偽陽性除外 (substring 検索 - 念のため):

```bash
grep -rwn "SummaryCard" dashboard/src \
  | grep -v "PromptSummaryCard" \
  | grep -v "/SummaryCard\.tsx"
# → 0 lines (PromptSummaryCard は Visual Review の別 component)
```

削除後の最終 grep:

```bash
grep -rn "SummaryCard\b\|SectionHeader\|EmptyState\|FilePathBlock" dashboard/src \
  | grep -v "PromptSummaryCard"
```

残った参照は **なし** (Visual Review の `PromptSummaryCard` の substring 1 件のみ、これは別 component の正式名)。

### 4-5. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7686ms) clean
```

23 routes 健在:

```
/, /_not-found, /activity-log, /analytics,
/api/asset-thumb, /api/visual-review/assets/[assetId]/candidates,
/api/visual-review/candidate-image, /api/visual-review/inbox,
/api/visual-review/review-manifest,
/campaigns, /campaigns/[slug], /configurator, /diagnostics,
/human-review-gates, /knowledge, /outputs, /publish,
/publish-package/[slug], /publish-packages, /settings,
/visual-assets, /visual-assets/[assetId],
/visual-assets/[assetId]/candidates
```

## 5. Key Decisions

- **precise grep で偽陽性除外**: 「SummaryCard」は「PromptSummaryCard」の substring に当たるため、import path 全体で grep + word-boundary grep の二重確認
- **ReadOnlyBanner は残置**: 5 箇所で active import あり、削除条件を満たさない。3 page の fidelity 化と同時に touch する想定
- **削除のみ、編集なし**: シンプルに `rm` 4 つ。コメント / 文書編集は無し
- **bundle 影響なし**: Phase UI-fidelity-8 完了時点で import 0 → tree-shake 済 → 本 microbatch の実行による bundle 削減は元からゼロ。ファイル存在の有無のみ変化

## 6. Remaining Cleanup Candidates

### 中期 (`/campaigns` list, `/human-review-gates`, `/publish-package/[slug]` の fidelity 化と同時)

| File | 削除可能になる条件 |
|---|---|
| `dashboard/src/components/ReadOnlyBanner.tsx` | 3 page で import 削除 (それぞれ既存の PageHeader / Topbar の ReadOnlyPill が代替) |

### 長期 (Phase 2 以降)

- `dashboard/src/components/visual-review/DeferredActionButton.tsx` — Phase 2B で実 write actions が入ったときに placeholder の役目を終える
- `dashboard/src/components/visual-review/LocalModeBanner.tsx` — Phase D2 build-time snapshot 戦略で local-only fallback が解消されると不要に
- `dashboard/src/components/CampaignStatusCard.tsx`, `NextActionSummary.tsx`, `NextActionChecklist.tsx`, `WorkingPipelineStatus.tsx`, `PublishReadinessBoard.tsx`, `PublishPackageLinks.tsx`, `ManualPublishingStatusList.tsx`, `PromptTemplateSummary.tsx`, `HumanReviewGateList.tsx`, `VisualAssetStatusTable.tsx`, `ReleaseReviewLinks.tsx`, `SelectedPlatformChips.tsx` — Phase Admin 1 Batch A/B/C 時代の coarse-grained component。fidelity 化された page でほとんど import されていない可能性 (本 microbatch では未確認、別 audit batch で検査推奨)

### docs

- `dashboard/README.md` の Batch B/C 時代の構造記述 — Phase UI-fidelity 反映の書き直し batch

## 7. Human Review Questions

1. **ReadOnlyBanner の扱い**: 3 active page で import されているが、実装は `return null` の no-op。3 page の fidelity 化と同時に削除する方針で良いか? それとも 3 page から import 削除する microbatch を先に実行するか?
2. **「中期」cleanup candidates の audit**: Phase Admin 1 Batch 時代の coarse-grained component (CampaignStatusCard / NextActionSummary 等) の import 数を確認する batch を立てるか?
3. **ReadOnlyPill の存在確認**: Topbar の `<ReadOnlyPill />` が 23 routes 全てに表示されている前提だが、boss が「ReadOnlyBanner の no-op を機能化したい」と希望する可能性

## 8. Risks or Uncertainties

- **`PromptSummaryCard` 検索引っ掛かり**: 「SummaryCard」grep で `PromptSummaryCard` がヒットしたが、これは Visual Review の別 component で削除対象ではない。`from '@/components/SummaryCard'` で path 全体一致を確認したので、本 microbatch では問題なし
- **ReadOnlyBanner ファイル残置**: import 5 件、削除条件を満たさず。次の microbatch 候補として §6 に明記
- **削除した 4 ファイルの歴史的価値**: git history で復元可能。「Batch B/C で確立した tone を記録したい」と boss が考えれば、git tag / commit message で参照可能

## 9. Next Recommended Step

**Option A — `/analytics`, `/knowledge`, `/settings` fidelity spec (推奨、軽い、新規 fidelity の探索)**

残り fidelity 系 3 route の audit + spec docs only batch。すべて PhasePlaceholder なので影響は小さく、Phase UI-fidelity-9 の前提を確定できる。

```text
Create fidelity spec for /analytics, /knowledge, /settings.

Inputs:
- Current state: dashboard/src/app/analytics/page.tsx, /knowledge/page.tsx, /settings/page.tsx (PhasePlaceholder)
- Reference: docs/68 / docs/69 / docs/77 / docs/78 / docs/handoff/0160 (latest tone)

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch
- Do NOT modify Sanity schema
- Do NOT add packages
- Audit-only docs deliverable

Tasks:
1. Audit each route's PhasePlaceholder + identify ideal data sources
2. Create docs/79-utility-fidelity-spec.md or combined docs/80-final-fidelity-spec.md
3. Phase UI-fidelity-9 用 Codex prompt を handoff §9 に同梱
```

**Option B — `/campaigns` (list), `/human-review-gates`, `/publish-package/[slug]` の ReadOnlyBanner 整理 microbatch**

3 page から ReadOnlyBanner の import / 呼び出しを削除するだけの cleanup microbatch。これで ReadOnlyBanner も削除可能になる。

**Option C — dashboard/README.md 全体書き直し**

Batch B/C/D 時代の構造記述を Phase UI-fidelity-1〜8 の現状に更新。

**Option D — Phase 2B 議論**

実 write actions (Approve & register / Regenerate / Sanity controlled write) の方針確定。

**Option E — Phase Admin 1 Batch A/B/C 時代の component audit**

`CampaignStatusCard` / `NextActionSummary` / `NextActionChecklist` / `WorkingPipelineStatus` / `PublishReadinessBoard` / `PublishPackageLinks` / `ManualPublishingStatusList` / `PromptTemplateSummary` / `HumanReviewGateList` / `VisualAssetStatusTable` / `ReleaseReviewLinks` / `SelectedPlatformChips` の import 数を grep で確認、削除候補を抽出する audit batch。
