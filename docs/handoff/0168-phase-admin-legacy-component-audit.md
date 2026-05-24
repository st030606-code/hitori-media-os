# Handoff: Phase Admin 1 legacy component audit

Date: 2026-05-20

## 1. Task Goal

Codex review (handoff/0166 §4-5 C3) と B fixes 完了後 (handoff/0167 §8) で残っていた **Phase Admin 1 Batch A/B/C 時代 12 件の legacy component** の import 数を grep 確認し、削除可否を A/B/C 分類する **audit only** batch。実削除は本 batch スコープ外、follow-up cleanup microbatch で実行。

## 2. Constraints Followed

- ✅ Audit only、コード変更なし、`rm` なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (build green、unchanged)

## 3. Changed Files

### 新規 docs (3)

- `docs/devlog/0157-phase-admin-legacy-component-audit.md`
- `docs/handoff/0168-phase-admin-legacy-component-audit.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Files audited (12)

| # | File | grep 結果 (import path + word-boundary) | 分類 |
|---|---|---|---|
| 1 | `CampaignStatusCard.tsx` | 0 / 0 | **A** safe-to-delete |
| 2 | `NextActionSummary.tsx` | 1 import (`computeNextActions` helper) | **C** unclear |
| 3 | `NextActionChecklist.tsx` | 0 / 0 | **A** safe-to-delete |
| 4 | `WorkingPipelineStatus.tsx` | 0 / 0 | **A** safe-to-delete |
| 5 | `PublishReadinessBoard.tsx` | 0 / 0 | **A** safe-to-delete |
| 6 | `PublishPackageLinks.tsx` | 1 import + 1 use in `/campaigns/[slug]:229` | **B** in use |
| 7 | `ManualPublishingStatusList.tsx` | 1 import + 1 use in `/campaigns/[slug]:235` | **B** in use |
| 8 | `PromptTemplateSummary.tsx` | 1 import in `/campaigns/[slug]:19` | **B** in use |
| 9 | `HumanReviewGateList.tsx` | 1 import + 1 use in `/campaigns/[slug]:220` | **B** in use |
| 10 | `VisualAssetStatusTable.tsx` | 1 import + 1 use in `/campaigns/[slug]:223` | **B** in use |
| 11 | `ReleaseReviewLinks.tsx` | 2 imports + 2 uses (`/:195` + `/campaigns/[slug]:186`) | **B** in use |
| 12 | `SelectedPlatformChips.tsx` | 1 import + 1 use in `/campaigns/[slug]:217` | **B** in use |

### 4-2. Safe-to-delete candidates (A, 4 件)

```
dashboard/src/components/CampaignStatusCard.tsx
dashboard/src/components/NextActionChecklist.tsx
dashboard/src/components/WorkingPipelineStatus.tsx
dashboard/src/components/PublishReadinessBoard.tsx
```

- 各 grep: dashboard/src 内 **0 references** (self-file 除く)
- docs / tools 内も runtime 参照なし (devlog / handoff の historical mention のみ)
- README に 1 件残るが (CampaignStatusCard、Repository layout tree) stale 記述で別 README rewrite batch 対象
- bundle 影響: Phase UI-fidelity 完了時点で tree-shake 済 → 削除しても bundle 不変

### 4-3. Files still in use (B, 7 件)

すべて `/campaigns/[slug]` (Phase UI-fidelity-1 detail page) で active、`ReleaseReviewLinks` のみ Home (`/`) でも使われる。

| File | 依存 page | 削除可能になる条件 |
|---|---|---|
| `PublishPackageLinks.tsx` | `/campaigns/[slug]:229` | detail page の deep refactor |
| `ManualPublishingStatusList.tsx` | `/campaigns/[slug]:235` | 同上 (PublishingScheduleTable で代替済の意図あるが共存中) |
| `PromptTemplateSummary.tsx` | `/campaigns/[slug]` | 同上 |
| `HumanReviewGateList.tsx` | `/campaigns/[slug]:220` | 同上 |
| `VisualAssetStatusTable.tsx` | `/campaigns/[slug]:223` | 同上 |
| `SelectedPlatformChips.tsx` | `/campaigns/[slug]:217` | 同上 |
| `ReleaseReviewLinks.tsx` | `/:195` + `/campaigns/[slug]:186` | Home + detail の両方で fidelity 化 (新 component への置換) |

**経緯**: Phase UI-fidelity-1 (handoff/0145) は detail page に Tabs / PublishReadinessScore / PublishingScheduleTable / NextActionList の **新 component を add**、旧 7 件は **そのまま並存** させた conservative approach。完全置換は Phase UI-fidelity-11 候補。

### 4-4. Unclear case (C, 1 件)

| File | 状況 |
|---|---|
| `NextActionSummary.tsx` | **partial dead**: ファイル内 2 export — `computeNextActions(helper)` は `campaign/NextActionList.tsx:13` で active 利用、`NextActionSummary(component)` 本体は dashboard/src 全体で render されていない |

選択肢:
- **(a)** `lib/campaign/nextActions.ts` に helper extract → ファイル削除 — microbatch で 3-step
- **(b)** ファイル内の component export だけ削除 — 1 file edit
- **(c)** 維持、Phase UI-fidelity-11 (`/campaigns/[slug]` rewrite) と同時整理

推奨: **(c)** 維持、`/campaigns/[slug]` rewrite で helper を `lib/` に extract する自然な流れと一緒に処理。

### 4-5. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7487ms) clean
```

audit-only batch、build 不変。

## 5. Key Decisions

- **`/campaigns/[slug]` rewrite を Phase UI-fidelity-11 として独立 batch 化**: B 7 件削除を Phase UI-fidelity-11 land の前提とすることで、本 audit batch のスコープが「分類のみ」に明確化
- **A 4 件は即削除可能**: bundle 影響ゼロ + grep 0 確認済、follow-up microbatch で安全に `rm` 可能
- **C `NextActionSummary` は保留 (option c)**: helper extract を独立 microbatch にすると scope-creep、Phase UI-fidelity-11 と同時整理が natural
- **docs / README の historical mention は別 batch**: README rewrite batch で歴史的記述を一括更新する想定

## 6. Recommended Cleanup Microbatch

**A 4 件削除 microbatch (推奨、5 分以下)**:

```text
Delete 4 Phase Admin 1 legacy components confirmed import-0.

Use:
- docs/handoff/0168-phase-admin-legacy-component-audit.md §4-2

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持
- Re-verify import 0 before each rm

Tasks:
1. Re-verify each file's grep:
   for c in CampaignStatusCard NextActionChecklist WorkingPipelineStatus PublishReadinessBoard; do
     grep -rwn "$c" dashboard/src | grep -v "/$c.tsx"
   done
   (期待: 0 lines)
2. Delete:
   - dashboard/src/components/CampaignStatusCard.tsx
   - dashboard/src/components/NextActionChecklist.tsx
   - dashboard/src/components/WorkingPipelineStatus.tsx
   - dashboard/src/components/PublishReadinessBoard.tsx
3. Final grep:
   grep -rn "CampaignStatusCard\|NextActionChecklist\|WorkingPipelineStatus\|PublishReadinessBoard" dashboard/src
   (期待: 0 lines)
4. cd dashboard && npm run build (23 routes 維持)
5. npm run build (Sanity Studio clean)
6. docs/devlog/0158-phase-admin-A-bucket-delete.md + docs/handoff/0169 + latest mirror
```

## 7. Human Review Questions

1. **A 4 件即削除**: follow-up microbatch を立てて即実行で良いか?
2. **Phase UI-fidelity-11 (`/campaigns/[slug]` rewrite) の優先度**: 直近で着手するか、Phase 2B / README 書き直し / 他の after にするか
3. **C `NextActionSummary` の処理**: (c) 維持 (推奨) で OK か、それとも (a) lib extract microbatch を立てるか
4. **README rewrite batch**: A 削除と同時 or 別 batch、どちらが好み?

## 8. Risks or Uncertainties

- **B バケットの "意図的に共存中" 確認**: `campaign/PublishingScheduleTable.tsx` のコメントに「ManualPublishingStatusList を replace」と書かれているが、実際は detail page で両方が存在する。Phase UI-fidelity-1 の意図的判断か、land 時の見落としかは要 boss 確認 (handoff/0145 §5 で確認可能)
- **A 4 件の git history**: 削除後も復元可能、boss が「歴史的 reference 保存したい」場合 git log で確認できる
- **C の `computeNextActions` extract タイミング**: Phase UI-fidelity-11 が遠い未来になる場合、(a) を独立 microbatch にして 1 ファイルに集約する選択肢もあり
- **README の stale layout tree**: CampaignStatusCard 削除後も README 1 件残るが、別 README rewrite batch で処理予定で動作には無関係

## 9. Next Recommended Step

**Option A (推奨) — A 4 件削除 microbatch**

§6 の Codex prompt をそのまま起動。grep re-verify → 4 `rm` → builds → docs。5 分以下。

**Option B — Phase UI-fidelity-11: `/campaigns/[slug]` deep refactor**

最大の整理 batch。B 7 件をすべて新 fidelity component に置換 + detail page rewrite + C helper extract も同時。Phase UI-fidelity cycle の "完全終了" を狙う中規模 batch。spec batch を先に立てる想定。

**Option C — dashboard/README.md 全体書き直し**

A 削除と同時 or 別 batch、Phase UI-fidelity-1〜10 + B fixes + audit 反映。

**Option D — Phase 2B 議論**

実 write actions の方針確定。
