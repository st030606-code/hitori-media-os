# Devlog 0145 — Dead code cleanup after UI fidelity batches

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜7 で確立した layout が安定し、旧 component が import 0 になっていた。handoff/0155 §8 で 10 件の候補を挙げていたので、grep / rg で **実際の import 数を 1 件ずつ確認** してから安全に削除する batch。

## 決定・変更

### 削除 (6 件、import 0 を確認した上で)

| File | grep 結果 | 削除可否 |
|---|---|---|
| `dashboard/src/components/visual-review/VisualAssetHeader.tsx` | 0 external imports | ✓ 削除 |
| `dashboard/src/components/visual-review/CandidateGrid.tsx` | sibling `CandidateCard.tsx` のみ | ✓ 削除 (CandidateCard 削除と同時) |
| `dashboard/src/components/visual-review/CandidateCard.tsx` | sibling `CandidateGrid.tsx` のみ | ✓ 削除 |
| `dashboard/src/components/visual-review/CandidatePreview.tsx` | `CandidateCard.tsx` (削除予定) のみ + BigPreviewCard.tsx のコメント 1 行 | ✓ 削除 |
| `dashboard/src/components/visual-review/CandidateStatusBadge.tsx` | `CandidateCard.tsx` (削除予定) のみ | ✓ 削除 |
| `dashboard/src/components/AppNav.tsx` | 0 external imports (featureFlags.ts のコメント 1 行のみ) | ✓ 削除 |

### 保留 (4 件、まだ使われている)

| File | 残っている呼び出し元 | 判定 |
|---|---|---|
| `dashboard/src/components/SummaryCard.tsx` | `/publish-packages`, `/activity-log`, `/diagnostics` で計 11 箇所 | ✗ 削除しない |
| `dashboard/src/components/SectionHeader.tsx` | `/publish-packages`, `/activity-log`, `/diagnostics` で計 5 箇所 | ✗ 削除しない |
| `dashboard/src/components/EmptyState.tsx` | `/publish-packages`, `/activity-log`, `/diagnostics` で計 6 箇所 | ✗ 削除しない |
| `dashboard/src/components/FilePathBlock.tsx` | `/publish-packages` で 1 箇所 (VisualAssetHeader 削除後) | ✗ 削除しない |

handoff/0155 で「削除候補」として挙げていた 4 件は、`/publish-packages`, `/activity-log`, `/diagnostics` の 3 page がまだ Phase UI-fidelity 経由で再構築されていないため依然 active。Phase UI-fidelity-8 (これら 3 page の fidelity 実装) と同時に削除可能になる予定。

### 不触の stale 参照 (削除候補ファイルへの言及だがコメント/README のみ)

| File | 参照内容 |
|---|---|
| `dashboard/README.md` | 3 行: AppNav の歴史的説明 / `/visual-assets` thumbnail 説明 / 別 ENV table |
| `dashboard/src/components/visual-review/BigPreviewCard.tsx` | コメント 1 行: 「same source as the existing CandidatePreview」 |
| `dashboard/src/lib/featureFlags.ts` | コメント 1 行 + 未使用 `NavFlags` interface + 未使用 `getNavFlags()` 関数 (12〜68 行付近) |

これらは **runtime 動作に影響なし**。本 batch は「削除のみ」スコープで、active file 内のコメント編集や README 更新は **次の cleanup microbatch** に委ねる。

### コード変更 (削除のみ、編集なし)

- 6 ファイル を `rm` で削除
- 既存 active component / page / lib / config は **完全に無変更**
- Sanity schema / publish-package / assets/visuals / patches: 不変
- package 追加なし、依存変更なし、deploy なし

## 理由

- **grep で実 import 数を確認**: handoff/0155 §8 が「全 10 件を削除候補」と記したが、実際は `/publish-packages`, `/activity-log`, `/diagnostics` の 3 page が SummaryCard / SectionHeader / EmptyState / FilePathBlock を依然使用。これら 3 page は Phase UI-fidelity の対象外でまだ古い tone を持つ。grep を信じて 4 件を保留判断
- **intra-cluster な参照は削除可**: CandidateGrid ↔ CandidateCard ↔ CandidatePreview ↔ CandidateStatusBadge は内輪でしか使われておらず、まとめて 1 batch で削除 OK
- **featureFlags の orphan は本 batch スコープ外**: `NavFlags` / `getNavFlags` も import 0 だが「ファイル削除」ではなく「ファイル内の関数削除」になるので、active component 編集禁止のルールに沿って microbatch に分離
- **README の AppNav 言及は別 batch**: dashboard/README.md は文書群、本 batch のスコープを超える

## 影響

- `dashboard/src/components/visual-review/` から 5 ファイル削除 (VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge)
- `dashboard/src/components/` から 1 ファイル削除 (AppNav.tsx)
- 23 routes 動作維持、dashboard build green、Sanity Studio 8.0s clean
- bundle size 微減 (6 ファイル × 小さめのコード)
- 残り 4 active 候補は `/publish-packages`, `/activity-log`, `/diagnostics` の Phase UI-fidelity-8 実装と一緒に削除予定

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 9 route 動作確認**:
   - `/` / `/configurator` / `/outputs` / `/publish` / `/campaigns/building-hitori-media-os`
   - `/visual-assets` / `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` / `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates`
   - `/publish-package/building-hitori-media-os`
2. 確認 OK なら次の選択肢:
   - **`/analytics`, `/knowledge`, `/settings` fidelity spec** (残り fidelity 系 3 route)
   - **`/publish-packages`, `/activity-log`, `/diagnostics` fidelity spec** (これらが SummaryCard / SectionHeader / EmptyState / FilePathBlock を解消する key)
   - **featureFlags.ts microbatch** (NavFlags / getNavFlags / コメントを削除する 1-file 編集)
   - **dashboard/README.md 更新** (AppNav 言及を新 Sidebar 系に書き直す)
   - **Phase 2B 議論** (実 write 計画)

## 発信ネタ候補

- 「import 数を grep で確認してから消す」: 削除候補リストを信じすぎず、毎回 grep で reality を確かめる cleanup の基本姿勢
- 「Phase UI-fidelity-N の rollout は dead code を残しながら進める」: 1 batch で diff を読みやすく保つために、削除は active surface が完全に置換された後でまとめる戦略
- 「歴史的コメントは別 cleanup batch に」: ファイル削除と「ファイル内の stale 参照修正」を 1 PR にまぜると review が辛くなる、分離して進める習慣
