# Devlog 0161 — Phase UI-fidelity-11 legacy component cleanup

日付: 2026-05-20

## 背景

Phase UI-fidelity-11 実装 (handoff/0171) で `/campaigns/[slug]` の 7 legacy import + Home の `ReleaseReviewLinks` 削除 + `NextActionSummary` helper extract が完了。8 件すべて grep で import 数 0 を確認済の状態 → 本 microbatch で 8 ファイル一括 `rm`。

**Phase Admin 1 Batch A/B/C 時代 legacy component の完全終了**を達成する cleanup chain の最終 microbatch。

## 決定・変更

### 削除前 grep

実行コマンド:
```bash
for c in SelectedPlatformChips HumanReviewGateList VisualAssetStatusTable PromptTemplateSummary PublishPackageLinks ManualPublishingStatusList ReleaseReviewLinks NextActionSummary; do
  echo "=== $c ==="
  grep -rwn "$c" dashboard/src | grep -v "/$c\.tsx"
done
```

結果: **8 件すべて、runtime import / usage 数 0**。残った hit はすべて **コメント (historical breadcrumb)**:

- `ManualPublishingStatusList`: 1 comment in `campaign/PublishingScheduleTable.tsx:3`
- `ReleaseReviewLinks`: 1 comment in `dashboard/EngagementPlaceholder.tsx:1`
- `NextActionSummary`: 4 comments (NextActionList.tsx + nextActions.ts)

コメント残置の判断: 過去 batch (handoff/0157「replaces old AppNav」README breadcrumb) と同 pattern。新規メンバーが旧名で grep したときに「どこに移動したか」が分かる migration trail として残す。

### 削除 (8 ファイル)

| File | 削除前 references (runtime) | 削除可否 |
|---|---|---|
| `dashboard/src/components/SelectedPlatformChips.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/HumanReviewGateList.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/VisualAssetStatusTable.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/PromptTemplateSummary.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/PublishPackageLinks.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/ManualPublishingStatusList.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/ReleaseReviewLinks.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/NextActionSummary.tsx` | 0 | ✓ 削除 |

### 削除後 grep

```bash
$ grep -rn "SelectedPlatformChips\|HumanReviewGateList\|VisualAssetStatusTable\|PromptTemplateSummary\|PublishPackageLinks\|ManualPublishingStatusList\|ReleaseReviewLinks\|NextActionSummary" dashboard/src
```

残った 7 hit:
- `campaigns/[slug]/page.tsx:435` — ReleaseReviewCard 関数のコメント (「old hardcoded ReleaseReviewLinks.tsx」)
- `dashboard/EngagementPlaceholder.tsx:1` — file header コメント
- `campaign/NextActionList.tsx:2,5` — file header コメント
- `campaign/PublishingScheduleTable.tsx:3` — file header コメント
- `lib/campaign/nextActions.ts:3,5` — file header コメント

すべて comment-only historical breadcrumbs、runtime 影響ゼロ。

### コード変更 (削除のみ、編集なし)

active file は **完全に touch なし**。コメントの清掃は別 README rewrite batch で実施予定。

## 理由

- **handoff/0171 で import 0 を確認済**: 8 件すべて grep 0 + bundle tree-shake 済、安全
- **historical breadcrumb コメントは残す**: handoff/0157 README pattern と同一の判断。「旧名で grep」する新メンバーの迷子防止
- **`rm` のみ、編集なし**: 単純な removal で完結、コメント編集は別 batch (README rewrite と一緒に)
- **bundle 影響ゼロ**: Phase UI-fidelity-11 完了時点で tree-shake 済 → 本 microbatch の bundle 削減はゼロ、file system tidiness のみ

## 影響

- `dashboard/src/components/` 直下から **8 ファイル削除** (Phase Admin 1 Batch A/B/C 時代の legacy 一掃)
- 23 routes 動作維持、dashboard TypeScript clean、Sanity Studio 7.5s clean
- bundle / build 出力に変化なし (元から tree-shake 済み)
- **Phase Admin 1 Batch A/B/C 時代 legacy component cleanup 完全終了**

## Phase Admin 1 legacy component cleanup chain 完全終了

handoff/0167 (B fixes 完了) → handoff/0168 (audit) → handoff/0169 (A バケット 4 件削除) → handoff/0170 (deep refactor spec) → handoff/0171 (UI-fidelity-11 実装、B/C 8 件 import 0) → **本 batch (B/C 8 件削除)**。

**累計**: A 4 件 + B 7 件 + C 1 件 = 12 件 すべて削除完了。

| 削除日 | 削除 file | batch |
|---|---|---|
| 0167-0169 | CampaignStatusCard / NextActionChecklist / WorkingPipelineStatus / PublishReadinessBoard | A 削除 |
| 本 batch | SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ReleaseReviewLinks / NextActionSummary | B/C 削除 |

`dashboard/src/components/` 直下に **Phase Admin 1 Batch A/B/C 時代の legacy が一つも残っていない**。

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 23 routes 巡回確認**: 動作変化ゼロを確認
2. 完了後の選択肢:
   - dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜11 + 全 cleanup chain 反映)
   - Phase 2B 議論 (実 write actions: campaign edit / gate write / Approve & register 等)
   - Tabs 統合 P1 (9 → 8 → 5-6 への深掘り) を別 batch で
   - 「中期」の DeferredActionButton / LocalModeBanner は Phase 2B / Phase D2 で役目を終える

## 発信ネタ候補

- 「8 file 削除で Phase 1 時代の遺物が完全終了」: Phase UI-fidelity cycle と平行で進めてきた cleanup chain の完走
- 「historical breadcrumb は残す習慣」: 削除した component への参照を comment で残すことで、旧資料からの grep を救う
- 「実装 → import 0 確認 → rm の 3-stage cleanup」: 1 PR にまとめず separate microbatch にする ROI、各 stage の diff が読みやすい
