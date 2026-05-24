# Devlog 0157 — Phase Admin 1 legacy component audit

日付: 2026-05-20

## 背景

handoff/0166 §4-5 (C3) と handoff/0167 §8 で「Phase Admin 1 Batch A/B/C 時代 component audit」を後続候補に挙げていた。Codex review batch (handoff/0166) と B fixes batch (handoff/0167) が完了したので、本 batch で 12 件の legacy component を grep audit、削除可否を classification。

**audit only。本 batch では `rm` しない**。boss 確認後の follow-up cleanup microbatch で実削除。

## 決定・変更

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas / docs 以外いずれも touch なし。

### grep audit method

各 12 件に対して 2 種の grep を実行:

1. **exact import path**: `grep -rn "from '@/components/<Name>'" dashboard/src`
2. **word-boundary name** (self-file 除外 + substring 偽陽性除外): `grep -rwn "<Name>" dashboard/src | grep -v "/<Name>.tsx"`

加えて A-bucket (import 0) 候補について docs / tools 範囲の reference も確認。

### 結果 classification

#### A. import 0、safe to delete (4)

| File | grep 結果 |
|---|---|
| `dashboard/src/components/CampaignStatusCard.tsx` | dashboard/src 内 import 0 / word-boundary 0 |
| `dashboard/src/components/NextActionChecklist.tsx` | dashboard/src 内 import 0 / word-boundary 0 |
| `dashboard/src/components/WorkingPipelineStatus.tsx` | dashboard/src 内 import 0 / word-boundary 0 |
| `dashboard/src/components/PublishReadinessBoard.tsx` | dashboard/src 内 import 0 / word-boundary 0 |

docs / tools のいずれにも runtime 参照なし (devlog / handoff の歴史的 mention のみ)。README に 1 件残るが Repository layout tree の stale 記述で別 README rewrite batch 対象。

#### B. 依然使用中、保持 (7)

| File | 依然使用している page | 補足 |
|---|---|---|
| `PublishPackageLinks.tsx` | `/campaigns/[slug]:229` | Phase UI-fidelity-1 detail page で active |
| `ManualPublishingStatusList.tsx` | `/campaigns/[slug]:235` | `campaign/PublishingScheduleTable.tsx` のコメントに「old list を replace」と書かれているが、実際は両方共存中 — fidelity rewrite では完全置換しなかった |
| `PromptTemplateSummary.tsx` | `/campaigns/[slug]:19` (import line) | detail page で active |
| `HumanReviewGateList.tsx` | `/campaigns/[slug]:220` | detail page で active |
| `VisualAssetStatusTable.tsx` | `/campaigns/[slug]:223` | detail page で active |
| `SelectedPlatformChips.tsx` | `/campaigns/[slug]:217` | detail page で active |
| `ReleaseReviewLinks.tsx` | `/` (page.tsx:195) + `/campaigns/[slug]:186` | Home + Campaign detail で active、最も広く使われている |

**共通テーマ**: 6 件は `/campaigns/[slug]` 単一 page に集約、`ReleaseReviewLinks` は Home + detail に。`/campaigns/[slug]` は Phase UI-fidelity-1 で部分的に fidelity 化したが、detail 構成に旧 component を組み込んだまま land した。完全置換は Phase UI-fidelity-11 (= `/campaigns/[slug]` の "deep refactor") 候補。

#### C. unclear (1)

| File | 状況 |
|---|---|
| `NextActionSummary.tsx` | **partial dead**: ファイルは `computeNextActions(helper)` と `NextActionSummary(component)` の 2 export を持つ。`computeNextActions` は `campaign/NextActionList.tsx:13` で active 利用、`NextActionSummary` component 自体は dashboard/src 全体で render されていない |

選択肢:
- **(a) helper を `lib/campaign/nextActions.ts` に extract → ファイル削除**: 1 つの import update + 新 file 作成 + 削除の 3-step microbatch
- **(b) ファイル維持、component export 部分のみ削除**: 1 file 内 edit、API surface は cleaner だが diff やや大きい
- **(c) 維持**: 軽い問題、Phase UI-fidelity-11 で `/campaigns/[slug]` を rewrite するときに `NextActionList` 経由に統一して同時整理

推奨: **(c) で当面維持**。理由: `/campaigns/[slug]` の rewrite と同時に整理するほうが diff が小さく、helper も自然に lib/ へ移動できる流れになる。

### 削除候補のまとめ

- **即削除可能 (A)**: 4 ファイル
- **後続削除 (B)**: 7 ファイル、`/campaigns/[slug]` rewrite が前提
- **保留 / 統合作業 (C)**: 1 ファイル、helper extract + 削除 or rewrite と同時

### 削除前 grep check (follow-up microbatch 用)

A の 4 件について、follow-up microbatch では削除前に再 grep が必須。本 batch 時点では 0 件確認済。

```bash
for c in CampaignStatusCard NextActionChecklist WorkingPipelineStatus PublishReadinessBoard; do
  grep -rwn "$c" dashboard/src | grep -v "/$c.tsx"
done
```

期待結果: 0 lines。

## 理由

- **`/campaigns/[slug]` を Phase UI-fidelity-1 で「rewrite ではなく enrichment」した経緯**: Phase UI-fidelity-1 (handoff/0145) は Tabs / PublishReadinessScore / PublishingScheduleTable / NextActionList の **新 component を追加**したが、detail page の旧 component 7 件は **そのまま並存**させた。当時の意図は「新 fidelity tone を導入しつつ既存の detail content を残す」conservatism。結果として旧 7 件が今も active
- **本 batch は audit only**: `/campaigns/[slug]` rewrite は別 batch、本 batch では grep audit + classification に scope 限定
- **A バケットの即削除を推奨**: 4 件すべて grep 0 + bundle 上 tree-shake 済 → bundle 影響なし、ファイル削除のみで cleanup chain 1 件分推進
- **B バケットの長期戦略**: Phase UI-fidelity-11 (= `/campaigns/[slug]` detail の deep refactor) を立てて、Tabs / PublishingScheduleTable / 既存 fidelity component への完全移行と並行して 7 件を削除
- **C の保留判断**: `NextActionSummary.tsx` の `computeNextActions` helper は `/campaigns/[slug]` rewrite で `lib/` に extract するのが自然、本 batch でも別 microbatch でも単独 edit は scope-creep

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- 4 件 (A) の即削除 microbatch の根拠が確定
- 8 件 (B + C) の状況が文書化、Phase UI-fidelity-11 計画の前提

## 次の一手

1. **boss が audit 結果を読む**:
   - A 4 件即削除 microbatch を起動するか
   - B 7 件は `/campaigns/[slug]` rewrite (Phase UI-fidelity-11) と同時整理で OK か
   - C `NextActionSummary` の処理方針 (a / b / c)
2. boss OK → **A 4 件削除 microbatch** (5 分以下、`rm` のみ)
3. 後続:
   - Phase UI-fidelity-11 (`/campaigns/[slug]` detail rewrite)
   - dashboard/README.md 全体書き直し
   - Phase 2B 議論

## 発信ネタ候補

- 「`/campaigns/[slug]` で fidelity tone と旧 component を共存させた話」: Phase UI-fidelity-1 で「rewrite ではなく add」を選んだ意図と、その代償としての delete chain の長さ
- 「helper-only file を file 削除前に lib に extract する習慣」: NextActionSummary の partial dead を直す手順
- 「audit microbatch を独立 PR にする ROI」: grep + classification だけの batch を立てることで、削除 microbatch の安全性が確実になる
