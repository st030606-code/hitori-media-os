# Devlog 0146 — Final dead code microbatch

日付: 2026-05-20

## 背景

handoff/0156 §6 「短期 microbatch」で残していた 4 件の orphan / stale 参照を 1 microbatch でまとめて消す。Phase UI-fidelity-7 後の cleanup 線を一旦完結させ、次は `/publish-packages`, `/activity-log`, `/diagnostics` の fidelity batch (中期 4 件削除) か、`/analytics`, `/knowledge`, `/settings` fidelity spec に進める状態にする。

## 決定・変更

### 削除 (1 ファイル)

| File | grep 結果 | 削除理由 |
|---|---|---|
| `dashboard/src/components/visual-review/EmptyCandidateState.tsx` | 0 external imports (self-only) | Phase UI-fidelity-6 で各 page が独自の inline empty state に置換済み |

### 編集 (3 ファイル、いずれも軽い削除 / コメント修正)

| File | 変更内容 |
|---|---|
| `dashboard/src/lib/featureFlags.ts` | `NavFlags` interface (5 行) + `getNavFlags()` 関数 (7 行) + 直前の AppNav 言及コメント (2 行) を削除。`isProductionRuntime` / `enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` の export は全て無変更 |
| `dashboard/src/components/visual-review/BigPreviewCard.tsx` | line 3 のコメント `(same source as the existing CandidatePreview)` を「no Next.js image optimization for already-bounded local PNGs」に書き換え (削除済み component 名の言及を排除) |
| `dashboard/README.md` | 3 箇所の `AppNav` 言及を Sidebar / AppShell 系の現行語彙に更新 (Batch D1 解説 / `ENABLE_DIAGNOSTICS` 表 / `ENABLE_LOCAL_FS_ROUTES` 表 / 「Repository layout」ツリーの 1 行) |

### runtime 変更なし

- featureFlags.ts の active export (`enableDiagnostics`, `enableLocalFsRoutes`, `activityLogMode`, `isProductionRuntime`) は touch なし
- 全ての route / component / lib / API の動作は無変更
- Sanity 書き込みなし、schema 変更なし、publish-package 不変、assets/visuals 不変、patches 不変、deploy なし、package 追加なし

## 理由

- **3 件まとめて 1 microbatch**: いずれも単独で動かす価値はなく、まとめて 5 分作業で済む。diff も読みやすい
- **README の AppNav 言及を Sidebar / AppShell に置換**: 旧名が残ると新規メンバーが「AppNav.tsx を探す」迷子になる。最小修正で誤誘導を断つ
- **`getNavFlags` を残さない**: layout.tsx も Sidebar も `getNavFlags()` を呼んでいないため、orphan を残すと「呼び出し元があるかも」という心理コストを増やす
- **BigPreviewCard コメント更新**: 削除済み `CandidatePreview` を引用しているのは事実誤認、native `<img>` を使う理由を直接書く方が正しい
- **README の Repository layout ツリーは局所修正のみ**: 全体は依然 Batch B 時代の構造、本来は別 batch で書き直したい。ただし今 batch のスコープは AppNav 言及置換に限定

## 影響

- bundle 上は EmptyCandidateState.tsx 削除分のごく微減のみ
- featureFlags.ts の export 数: 4 → 4 (NavFlags / getNavFlags 削除、それ以外不変)
- 23 routes 動作維持、dashboard build green、Sanity Studio 7.9s clean
- `/publish-packages`, `/activity-log`, `/diagnostics` で active な SummaryCard / SectionHeader / EmptyState / FilePathBlock は **依然残存** (handoff/0156 §6 中期)

## 次の一手

1. **boss が `cd dashboard && npm run dev` で動作確認**:
   - 23 routes 巡回
   - hydration エラーなく load する
2. 完了後の選択肢:
   - **`/publish-packages`, `/activity-log`, `/diagnostics` fidelity spec** (中期 4 件削除の前提条件)
   - **`/analytics`, `/knowledge`, `/settings` fidelity spec** (残り fidelity 系)
   - **dashboard/README.md の本格的な書き直し** (Repository layout / Batch 別解説 / Phase UI-fidelity 反映)
   - **Phase 2B 議論** (実 write actions の方針確定)

## 発信ネタ候補

- 「microbatch を 1 PR に絞ると review が静かになる」: 1 削除 + 3 軽編集の cleanup は分離するより 1 まとめにする方が rollback も容易
- 「READMEは別 batch で書き直す」: docs は code とは別のリリース cycle で扱う設計判断、Phase UI-fidelity が一段落したらまとめて update する流れ
