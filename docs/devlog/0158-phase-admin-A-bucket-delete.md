# Devlog 0158 — Phase Admin 1 A-bucket delete

日付: 2026-05-20

## 背景

handoff/0168 で確定した audit classification の A バケット 4 件 (`CampaignStatusCard` / `NextActionChecklist` / `WorkingPipelineStatus` / `PublishReadinessBoard`) を `rm` する cleanup microbatch。Runtime 振る舞い無変更、削除のみ。

B バケット 7 件 + C バケット 1 件は **本 batch では touch せず** (handoff/0168 §3 で完全 enumerate 済の不削除リスト遵守)。

## 決定・変更

### 削除前 grep 再確認

```bash
for c in CampaignStatusCard NextActionChecklist WorkingPipelineStatus PublishReadinessBoard; do
  grep -rwn "$c" dashboard/src | grep -v "/$c.tsx"
done
```

結果: **4 件すべて 0 lines** (self-file 以外 references なし)。削除条件を満たすことを確認。

### 削除 (4)

| File | 削除前 references (外部) | 削除可否 |
|---|---|---|
| `dashboard/src/components/CampaignStatusCard.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/NextActionChecklist.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/WorkingPipelineStatus.tsx` | 0 | ✓ 削除 |
| `dashboard/src/components/PublishReadinessBoard.tsx` | 0 | ✓ 削除 |

### 削除後 grep

```bash
$ grep -rn "CampaignStatusCard\|NextActionChecklist\|WorkingPipelineStatus\|PublishReadinessBoard" dashboard/src
(no output)
```

= **0 lines**、4 ファイル分の参照が dashboard ソースから完全消滅。

### 不削除 (8、handoff/0168 enumeration 遵守)

B バケット (7 件、`/campaigns/[slug]` 依存):
- `PublishPackageLinks.tsx`
- `ManualPublishingStatusList.tsx`
- `PromptTemplateSummary.tsx`
- `HumanReviewGateList.tsx`
- `VisualAssetStatusTable.tsx`
- `SelectedPlatformChips.tsx`
- `ReleaseReviewLinks.tsx` (Home + detail で active)

C バケット (1 件、partial dead):
- `NextActionSummary.tsx` (helper `computeNextActions` が `campaign/NextActionList.tsx:13` で active 利用、component 本体は dead だがファイル削除には helper extract が前提)

### コード変更 (削除のみ、編集なし)

active file は **完全に touch なし**。dashboard / Sanity Studio / tools / schemas いずれも touch なし。bundle 上は Phase UI-fidelity 完了時点で tree-shake 済 → 本 microbatch の bundle 削減はゼロ。

## 理由

- **handoff/0168 audit で確認済**: 4 件すべて grep 0 + bundle 影響ゼロ、安全に `rm` 可能
- **B/C 不削除**: handoff/0168 §3 で「削除しない」と明示した 8 件を 1 件も touch しない。Phase UI-fidelity-11 (`/campaigns/[slug]` deep refactor) の前提が変わらないように
- **`rm` のみ、編集なし**: シンプルに 4 ファイル削除、コメント / 文書編集 / refactor は無し
- **README の歴史 mention は別 batch**: README rewrite batch で stale layout tree 等を一括更新

## 影響

- `dashboard/src/components/` から **4 ファイル削除** (legacy 12 → 8)
- 23 routes 動作維持、dashboard TypeScript clean、Sanity Studio 7.8s clean
- bundle / build 出力に変化なし (元から tree-shake 済み)
- 残る legacy: B 7 件 (`/campaigns/[slug]` rewrite で削除可) + C 1 件 (helper extract + 削除)

## 残る Phase Admin 1 legacy components

| File | 削除可能になる条件 |
|---|---|
| `PublishPackageLinks.tsx` | Phase UI-fidelity-11 (`/campaigns/[slug]` rewrite) |
| `ManualPublishingStatusList.tsx` | 同上 |
| `PromptTemplateSummary.tsx` | 同上 |
| `HumanReviewGateList.tsx` | 同上 |
| `VisualAssetStatusTable.tsx` | 同上 |
| `SelectedPlatformChips.tsx` | 同上 |
| `ReleaseReviewLinks.tsx` | Home + detail の両方で fidelity 置換 |
| `NextActionSummary.tsx` | `computeNextActions` を `lib/` に extract、or Phase UI-fidelity-11 と同時整理 |

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 23 routes 巡回確認**: 動作変化ゼロを確認
2. 完了後の選択肢:
   - **Phase UI-fidelity-11 (`/campaigns/[slug]` deep refactor) spec batch** (推奨次回) — B 7 件 + C 1 件をすべて整理する大きめ batch の前提を spec docs only で確定
   - dashboard/README.md 全体書き直し
   - Phase 2B 議論 (実 write actions)
   - C 単独で `computeNextActions` を `lib/campaign/nextActions.ts` に extract する microbatch (Phase UI-fidelity-11 が遠い場合の単発 cleanup)

## 発信ネタ候補

- 「audit → 即 cleanup の 2 段リズム」: 「分類だけの batch」と「削除だけの batch」を分離することで、それぞれの diff が読みやすい
- 「4 件削除で legacy 半減」: Phase Admin 1 時代の component が 12 → 8 件に、目に見える progress
- 「B/C を温存する判断」: 「次の rewrite 前提で並存」の意図を docs に明文化する習慣
