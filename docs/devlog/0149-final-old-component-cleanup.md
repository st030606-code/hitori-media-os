# Devlog 0149 — Final old component cleanup

日付: 2026-05-20

## 背景

Phase UI-fidelity-8 で `/publish-packages` / `/activity-log` / `/diagnostics` を fidelity tone に揃え、旧 4 component (`SummaryCard` / `SectionHeader` / `EmptyState` / `FilePathBlock`) の import 数を 0 にした (handoff/0159 §4-2)。本 microbatch でそれらを `rm` し、Phase UI-fidelity-1〜8 の cleanup 連鎖を完結させる。

## 決定・変更

### 削除 (4)

| File | grep 結果 | 削除理由 |
|---|---|---|
| `dashboard/src/components/SummaryCard.tsx` | 0 imports (precise `from '@/components/SummaryCard'` で検索、`PromptSummaryCard` の substring 偽陽性は除外確認) | Phase UI-fidelity-8 で 3 utility page が KpiCard に置換完了 |
| `dashboard/src/components/SectionHeader.tsx` | 0 imports | Phase UI-fidelity-8 で activity-log / diagnostics が inline `<header>` に置換完了 |
| `dashboard/src/components/EmptyState.tsx` | 0 imports | Phase UI-fidelity-8 で 3 page が inline border-dashed / border-rose-200 card に置換完了 |
| `dashboard/src/components/FilePathBlock.tsx` | 0 imports | Phase UI-fidelity-8 で publish-packages が inline `<code>` + CopyButton に置換完了 |

### 保留 (1)

| File | 残り呼び出し元 | 件数 | 判定 |
|---|---|---|---|
| `dashboard/src/components/ReadOnlyBanner.tsx` | `/human-review-gates`, `/publish-package/[slug]`, `/campaigns` | 5 箇所 (publish-package で 2 回) | active、削除しない |

ReadOnlyBanner は実装上 `return null` の no-op だが、3 page で依然 import されている。Phase UI-fidelity-1〜8 では touch していない page 群 (`/campaigns` list、`/human-review-gates`、`/publish-package/[slug]`) で残存。これら 3 page が fidelity 化されるまで残置。

### precise grep の確認手順

`SummaryCard` は `PromptSummaryCard` の substring に当たる偽陽性が出る。そこで:

```bash
grep -rn "from '@/components/SummaryCard'" dashboard/src    # 0 lines
grep -rwn "SummaryCard" dashboard/src | grep -v PromptSummaryCard | grep -v "/SummaryCard.tsx"  # 0 lines
```

両方とも 0 確認後に削除実施。

### runtime 変更 (なし)

- 削除した 4 ファイルは Phase UI-fidelity-8 完了時点で import 数 0
- すべての route / API / lib / config / Sanity / publish-package / assets / patches は **完全に touch なし**
- bundle 上は Phase UI-fidelity-8 時点で既に tree-shake で除去済 → 本 microbatch の実行効果はファイル存在の有無のみ

## 理由

- **precise grep で偽陽性除外**: 「SummaryCard」は「PromptSummaryCard」の部分文字列に当たるため、import path 全体で grep してから削除する手順を踏んだ
- **ReadOnlyBanner は依然 active**: 5 箇所で import されているため、handoff/0159 §6 で削除候補に上げたが本 microbatch では touch しない。3 page の fidelity 化と同時に touch する想定 (これらの page は現状の fidelity スコープ外)
- **削除のみ**: 編集なし、シンプルに `rm` 4 つ。次の dead-code-cleanup 連鎖と接続

## 影響

- `dashboard/src/components/` のファイル数が 4 減 (CampaignStatusCard / CopyButton / HumanReviewGateList / ManualPublishingStatusList / NextActionChecklist / NextActionSummary / PromptTemplateSummary / PublishPackageLinks / PublishReadinessBoard / ReadOnlyBanner / ReleaseReviewLinks / SelectedPlatformChips / StatusBadge / VisualAssetStatusTable / WorkingPipelineStatus + 7 subdirs が残存)
- 23 routes 動作維持、dashboard TypeScript clean、Sanity Studio 7.7s clean
- bundle / build 出力に変化なし (元から tree-shake 済み)

## 次の一手

1. **boss が `cd dashboard && npm run dev` で `/publish-packages` / `/activity-log` / `/diagnostics` を実機確認**: 動作変化がないことを確認
2. 確認 OK なら次の選択肢:
   - **`/analytics`, `/knowledge`, `/settings` fidelity spec** (残り fidelity 系 3 route。すべて PhasePlaceholder)
   - **`/campaigns` (list), `/human-review-gates`, `/publish-package/[slug]` fidelity spec** (ReadOnlyBanner の最後の使用元、これらを fidelity 化すれば ReadOnlyBanner も削除可能)
   - **dashboard/README.md 全体書き直し** (Phase UI-fidelity-1〜8 の現状を反映)
   - **Phase 2B 議論** (実 write actions の方針確定)

## 発信ネタ候補

- 「precise grep で偽陽性を除外する手順」: 「SummaryCard」は「PromptSummaryCard」の substring に当たる、import path 全体で確認してから削除する習慣
- 「fidelity batch と cleanup batch を交互に進める」: 1 batch で UI 刷新 → 直後の microbatch で旧 component を `rm` の 2-stage 連鎖が安全
- 「ReadOnlyBanner は no-op だが消せない」: 実装は `return null` だが 5 箇所で import されている、active page を fidelity 化するまで待つ判断
