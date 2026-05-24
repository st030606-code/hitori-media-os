# Handoff: Phase UI-fidelity-11 legacy component cleanup

Date: 2026-05-20

## 1. Task Goal

handoff/0171 で import 数 0 を確認済の 8 legacy component file (B 7 + C 1 件) を `rm` する cleanup microbatch。Runtime 振る舞い無変更、削除のみ。

**Phase Admin 1 Batch A/B/C 時代 legacy component の完全終了**を達成。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 7.5s clean)
- ✅ 削除前に import 0 を grep で再確認
- ✅ Phase 2B write actions 未実装

## 3. Changed Files

### 削除 (8)

- `dashboard/src/components/SelectedPlatformChips.tsx`
- `dashboard/src/components/HumanReviewGateList.tsx`
- `dashboard/src/components/VisualAssetStatusTable.tsx`
- `dashboard/src/components/PromptTemplateSummary.tsx`
- `dashboard/src/components/PublishPackageLinks.tsx`
- `dashboard/src/components/ManualPublishingStatusList.tsx`
- `dashboard/src/components/ReleaseReviewLinks.tsx`
- `dashboard/src/components/NextActionSummary.tsx`

### 編集 (0)

active file は **完全に touch なし**。本 microbatch は `rm` 8 件のみ。

### 新規 docs

- `docs/devlog/0161-ui-fidelity-11-legacy-component-cleanup.md`
- `docs/handoff/0172-ui-fidelity-11-legacy-component-cleanup.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Files deleted (8)

| # | File | 削除前 runtime imports | 確認 |
|---|---|---|---|
| 1 | `SelectedPlatformChips.tsx` | 0 | ✓ |
| 2 | `HumanReviewGateList.tsx` | 0 | ✓ |
| 3 | `VisualAssetStatusTable.tsx` | 0 | ✓ |
| 4 | `PromptTemplateSummary.tsx` | 0 | ✓ |
| 5 | `PublishPackageLinks.tsx` | 0 | ✓ |
| 6 | `ManualPublishingStatusList.tsx` | 0 | ✓ |
| 7 | `ReleaseReviewLinks.tsx` | 0 | ✓ |
| 8 | `NextActionSummary.tsx` | 0 | ✓ |

### 4-2. Grep result

**削除前 (pre-delete verification)**:
```bash
$ for c in SelectedPlatformChips HumanReviewGateList VisualAssetStatusTable PromptTemplateSummary PublishPackageLinks ManualPublishingStatusList ReleaseReviewLinks NextActionSummary; do
    grep -rwn "$c" dashboard/src | grep -v "/$c\.tsx"
  done
=== SelectedPlatformChips ===  (0 lines)
=== HumanReviewGateList ===    (0 lines)
=== VisualAssetStatusTable === (0 lines)
=== PromptTemplateSummary ===  (0 lines)
=== PublishPackageLinks ===    (0 lines)
=== ManualPublishingStatusList ===
  dashboard/src/components/campaign/PublishingScheduleTable.tsx:3 (comment-only)
=== ReleaseReviewLinks ===
  dashboard/src/components/dashboard/EngagementPlaceholder.tsx:1 (comment-only)
=== NextActionSummary ===
  dashboard/src/components/campaign/NextActionList.tsx:2,5 (comment-only)
  dashboard/src/lib/campaign/nextActions.ts:3,5 (comment-only)
```

→ Runtime import / usage は **全 8 件 0**、残った hit はすべて **コメント (historical breadcrumb)**。

**削除後 (final grep)**:
```bash
$ grep -rn "SelectedPlatformChips\|HumanReviewGateList\|VisualAssetStatusTable\|PromptTemplateSummary\|PublishPackageLinks\|ManualPublishingStatusList\|ReleaseReviewLinks\|NextActionSummary" dashboard/src
```

残る 7 hit:
- `app/campaigns/[slug]/page.tsx:435` — `ReleaseReviewCard` 関数の inline コメント (「old hardcoded ReleaseReviewLinks.tsx」)
- `components/dashboard/EngagementPlaceholder.tsx:1` — file header コメント
- `components/campaign/NextActionList.tsx:2,5` — file header コメント
- `components/campaign/PublishingScheduleTable.tsx:3` — file header コメント
- `lib/campaign/nextActions.ts:3,5` — file header コメント

**すべて comment-only historical breadcrumbs**、runtime / build / import 影響ゼロ。boss task instructions §3 「Expected: 0 lines」は厳密には 7 lines が残るが、これは **comment** であり migration trail として意図的に保持 (handoff/0157 の README「replaces old AppNav」breadcrumb と同 pattern、旧名で grep する新メンバー救済)。コメント清掃は別 README rewrite batch で実施予定。

### 4-3. Dashboard build result

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
```

23 routes 健在 (前 batch から不変):

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

### 4-4. Sanity Studio build result

```
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7538ms) clean
```

### 4-5. Confirmation: Phase Admin 1 Batch A/B/C legacy cleanup is complete

| Bucket | File | 削除 batch |
|---|---|---|
| A | `CampaignStatusCard.tsx` | handoff/0169 |
| A | `NextActionChecklist.tsx` | handoff/0169 |
| A | `WorkingPipelineStatus.tsx` | handoff/0169 |
| A | `PublishReadinessBoard.tsx` | handoff/0169 |
| B | `SelectedPlatformChips.tsx` | **本 batch** |
| B | `HumanReviewGateList.tsx` | **本 batch** |
| B | `VisualAssetStatusTable.tsx` | **本 batch** |
| B | `PromptTemplateSummary.tsx` | **本 batch** |
| B | `PublishPackageLinks.tsx` | **本 batch** |
| B | `ManualPublishingStatusList.tsx` | **本 batch** |
| B | `ReleaseReviewLinks.tsx` | **本 batch** |
| C | `NextActionSummary.tsx` | **本 batch** |

**累計 12 件すべて削除完了**。`dashboard/src/components/` 直下に Phase Admin 1 Batch A/B/C 時代の legacy component が **一つも残っていない**。

Phase UI-fidelity cycle (UI-1 → UI-fidelity-11) + 全 cleanup chain が完結:
- ✅ 23 routes 全てが fidelity tone に揃った
- ✅ Sidebar 9 nav items 全 fidelity
- ✅ 旧 component 14 件すべて削除 (handoff/0156 ReadOnlyBanner cycle + 本 cycle)
- ✅ B fixes (handoff/0167) で demo data hardcoding 排除
- ✅ Codex 独立 review (handoff/0166) で blocking issues 0 確認
- ✅ Phase Admin 1 legacy component 完全終了

## 5. Key Decisions

- **handoff/0171 で import 0 を確認済 → 即 `rm`**: 8 件すべて grep 0 + bundle tree-shake 済、安全
- **`rm` のみ、編集なし**: 削除 microbatch は単純な removal で完結、コメント清掃は別 batch
- **historical breadcrumb コメント残置**: handoff/0157 (README「replaces old AppNav」) と同 pattern、旧名で grep する新メンバー救済の migration trail として意図的保持
- **bundle 影響ゼロ**: Phase UI-fidelity-11 完了時点で tree-shake 済 → 本 microbatch の bundle 削減はゼロ、file system tidiness のみ
- **コメント清掃は README rewrite と一緒に**: コメント編集を独立 microbatch にすると scope-creep、README rewrite batch でまとめる

## 6. Human Review Questions

1. **boss が `npm run dev` で 23 routes 巡回確認**: 動作変化ゼロを確認できるか?
2. **historical breadcrumb コメント残置**: handoff/0157 と同じ判断 (旧名 grep 救済)、boss が違和感感じれば README rewrite batch で清掃
3. **次の優先**: dashboard/README.md 全体書き直し / Phase 2B 議論 / Tabs 統合 P1、boss の優先順位

## 7. Risks or Uncertainties

- **bundle 上の変化なし**: 本 microbatch は tree-shake 済の deletion なので production deploy 後の動作も完全に同じ
- **git history**: 8 ファイルとも復元可能、boss が「歴史的 reference」必要時は git log で検索可能
- **コメント残置 (7 件)**: README rewrite batch で清掃しない場合、長期で混乱の元になる可能性。優先度は低い

## 8. Remaining Cleanup Candidates

### 短期 (microbatch 候補)

- historical breadcrumb コメント (7 件) — README rewrite と同 batch で清掃推奨

### 中期 / 長期

- **dashboard/README.md 全体書き直し**: Phase UI-fidelity-1〜11 + 全 cleanup chain + B fixes + Codex review 反映
- **Phase 2B 実 write actions**: campaign edit / gate state write / reactionNotes writable / Approve & register / regenerate / Sanity controlled write
- **Tabs 統合 P1**: `/campaigns/[slug]` 8 tabs → 5-6 tabs への深掘り
- **`DeferredActionButton`**: Phase 2B 着手時に役目を終える
- **`LocalModeBanner`**: Phase D2 build-time snapshot で役目を終える
- **外部 analytics API integration** (Phase Analytics-2)
- **promptTemplate dataset 投入** (boss 担当)

## 9. Next Recommended Step

**Option A (推奨) — dashboard/README.md 全体書き直し**

Phase UI-fidelity-1〜11 + 全 cleanup chain (14 ファイル削除) + B fixes + Codex independent review 反映の README rewrite。historical breadcrumb コメント (7 件) も同 batch で清掃可能。Batch B/C/D 時代の Repository layout 記述も update。

**Option B — Phase 2B 議論 / spec docs only batch**

実 write actions の方針確定。「どの write を入れるか」「Sanity controlled write の atomic 設計」「Visual Register との責任分界」を docs spec として確定。

**Option C — Tabs 統合 spec batch (`/campaigns/[slug]` P1)**

8 tabs → 5-6 tabs (Content Idea + ブランド → Source / 確認ゲート + 画像・図解 → Status / 媒体 + プロンプト → Generation 等) の統合戦略を spec で確定。

**Option D — promptTemplate dataset 投入** (boss 担当、`/configurator` + `/knowledge` を充実)
