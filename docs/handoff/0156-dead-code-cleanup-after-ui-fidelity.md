# Handoff: Dead code cleanup after UI fidelity batches

Date: 2026-05-20

## 1. Task Goal

handoff/0155 §8 で挙げた 10 件の "削除候補" について grep で実 import 数を 1 件ずつ確認し、確実に 0 件のものだけを安全削除する cleanup-only batch。Runtime 振る舞いの変更なし、削除のみ。

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
- ✅ import 数 0 確認後に限り削除
- ✅ active component / page / lib は完全に未編集

## 3. Changed Files

### 削除 (6)

- `dashboard/src/components/visual-review/VisualAssetHeader.tsx`
- `dashboard/src/components/visual-review/CandidateGrid.tsx`
- `dashboard/src/components/visual-review/CandidateCard.tsx`
- `dashboard/src/components/visual-review/CandidatePreview.tsx`
- `dashboard/src/components/visual-review/CandidateStatusBadge.tsx`
- `dashboard/src/components/AppNav.tsx`

### 編集 (0)

active file は **完全に touch なし**。stale コメントが BigPreviewCard.tsx / featureFlags.ts / README.md に残るが、本 batch のスコープ外。

### 新規 docs

- `docs/devlog/0145-dead-code-cleanup-after-ui-fidelity.md`
- `docs/handoff/0156-dead-code-cleanup-after-ui-fidelity.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Files checked (10)

handoff/0155 §8 で挙げた 10 候補すべて。

### 4-2. Files deleted (6)

import 数 0 を確認できたもの:

| File | 削除理由 |
|---|---|
| `visual-review/VisualAssetHeader.tsx` | 0 imports (PageHeader に置換済み) |
| `visual-review/CandidateGrid.tsx` | sibling CandidateCard のみ参照 (intra-cluster cleanup) |
| `visual-review/CandidateCard.tsx` | sibling CandidateGrid のみ参照 |
| `visual-review/CandidatePreview.tsx` | CandidateCard のみ + BigPreviewCard.tsx の説明コメント 1 行 (runtime 影響なし) |
| `visual-review/CandidateStatusBadge.tsx` | CandidateCard のみ |
| `components/AppNav.tsx` | 0 imports (featureFlags.ts のコメント 1 行のみ、runtime 影響なし) |

### 4-3. Files intentionally kept (4)

| File | 残り呼び出し元 | 件数 | 判定 |
|---|---|---|---|
| `components/SummaryCard.tsx` | /publish-packages, /activity-log, /diagnostics | 11 箇所 | active、削除しない |
| `components/SectionHeader.tsx` | /publish-packages, /activity-log, /diagnostics | 5 箇所 | active、削除しない |
| `components/EmptyState.tsx` | /publish-packages, /activity-log, /diagnostics | 6 箇所 | active、削除しない |
| `components/FilePathBlock.tsx` | /publish-packages | 1 箇所 (VisualAssetHeader 削除後) | active、削除しない |

これら 4 件はすべて、まだ fidelity 化されていない **`/publish-packages`, `/activity-log`, `/diagnostics`** 3 page で使用中。これら 3 page を後の Phase UI-fidelity batch で再構築するときに同時削除可能になる予定。

### 4-4. Import verification result

実行コマンド:
```bash
for name in VisualAssetHeader CandidateGrid CandidateCard CandidatePreview \
            CandidateStatusBadge SummaryCard SectionHeader EmptyState \
            FilePathBlock AppNav; do
  grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
          --include="*.mjs" -- "$name" dashboard/src tools 2>/dev/null \
    | grep -v "/$name.tsx\b" | grep -v "/$name.ts\b"
done
```

結果まとめ:

| 候補 | 件数 (除く本ファイル) | 内訳 | 判定 |
|---|---|---|---|
| VisualAssetHeader | 0 | — | 削除 |
| CandidateGrid | 1 | CandidateCard コメント | 削除 |
| CandidateCard | 2 | CandidateGrid (削除予定) | 削除 |
| CandidatePreview | 3 | CandidateCard (削除予定) + BigPreviewCard コメント | 削除 |
| CandidateStatusBadge | 2 | CandidateCard (削除予定) | 削除 |
| SummaryCard | 18 | 3 page で active | 保留 |
| SectionHeader | 7 | 3 page + VisualAssetHeader (削除予定) | 保留 (3 page 分が残る) |
| EmptyState | 8 | 3 page で active | 保留 |
| FilePathBlock | 5 | publish-packages + VisualAssetHeader (削除予定) | 保留 (1 件残る) |
| AppNav | 1 | featureFlags.ts コメント (runtime 影響なし) | 削除 |

削除後の確認 grep:

```bash
grep -rn "VisualAssetHeader\|CandidateGrid\|CandidateCard\|CandidatePreview\
\|CandidateStatusBadge\|AppNav" dashboard tools
```

残った参照 5 件はすべて **コメント or README** (runtime ゼロ影響):

- `dashboard/README.md` 3 行 (歴史的説明)
- `dashboard/src/components/visual-review/BigPreviewCard.tsx` 1 行 (説明コメント)
- `dashboard/src/lib/featureFlags.ts` 1 行 (説明コメント)

### 4-5. Build validation

```
cd dashboard && npm run build   → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)   → ✓ Build Sanity Studio (8019ms) clean
```

route list (23 全て):

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

- **「削除候補リスト」を鵜呑みにしない**: handoff/0155 §8 で 10 件を挙げていたが、grep で 4 件は active と判明。リストは信号、grep は事実
- **intra-cluster cleanup の同時削除**: CandidateGrid ↔ CandidateCard ↔ CandidatePreview ↔ CandidateStatusBadge は互いだけが参照していたので、1 batch でまとめて削除すれば diff 解読が楽
- **stale コメントは別 microbatch に**: ファイル削除と「ファイル内のコメント編集」を 1 PR に混ぜると review 範囲がぶれる、分離する
- **featureFlags の orphan は本 batch スコープ外**: `NavFlags` interface / `getNavFlags()` 関数 / コメントは import 0 だが「ファイル内編集」になるので、active component 編集禁止に従って microbatch に分離
- **dashboard/README.md の AppNav 言及は別 batch**: 文書更新は本 batch のスコープを超える

## 6. Remaining Dead-Code Candidates

本 batch 完了後も残っている可能性:

### 短期 (microbatch、低リスク)

| File / Symbol | 内容 | 推奨アクション |
|---|---|---|
| `dashboard/src/lib/featureFlags.ts` の `NavFlags` interface + `getNavFlags()` + line 61 コメント | import 0 (AppNav 削除に伴う) | featureFlags microbatch で削除 |
| `dashboard/src/components/visual-review/BigPreviewCard.tsx` line 3 コメント | "(same source as the existing CandidatePreview)" の文言 | コメント更新 microbatch |
| `dashboard/README.md` AppNav 言及 (3 箇所) | 旧 nav 説明 | README 更新 batch |

### 中期 (`/publish-packages`, `/activity-log`, `/diagnostics` の fidelity 化と同時に)

| File | 削除可能になる条件 |
|---|---|
| `components/SummaryCard.tsx` | 3 page を KpiCard ベースに置換 |
| `components/SectionHeader.tsx` | 3 page を PageHeader + `<header>` 直書きに置換 |
| `components/EmptyState.tsx` | 3 page を inline empty state (configurator / visual-review と同パターン) に置換 |
| `components/FilePathBlock.tsx` | /publish-packages を `FilePathsCard` ベース or inline に置換 |

### 長期 (Phase 2 以降)

- `DeferredActionButton.tsx` — Phase 2B で実 write actions が入ったときに「placeholder」役目を終える
- `LocalModeBanner.tsx` — Phase D2 build-time snapshot で local 限定 fallback が解消されると不要に

## 7. Human Review Questions

1. **保留した 4 件は妥当か?** SummaryCard / SectionHeader / EmptyState / FilePathBlock は `/publish-packages`, `/activity-log`, `/diagnostics` で active。3 page を fidelity 化する次 batch まで残す判断で OK か?
2. **featureFlags の orphan を別 microbatch にするのは妥当か?** 「同じ feature flag ファイルの一部を編集する」のは active file 編集と扱った
3. **README の AppNav 言及をどう扱うか?** 一括書き直しの README batch を別に立てるか、それとも fidelity batch のたびに該当箇所を直すか?

## 8. Risks or Uncertainties

- **DeferredActionButton / LocalModeBanner / EmptyCandidateState は active**: handoff/0155 §8「dead code cleanup batch」リストには入っていなかったが、念のため再確認 — DeferredActionButton は ActionsCard 内 / LocalModeBanner は 3 page で / EmptyCandidateState は P0 から残置だが現在 import 0... 実は **EmptyCandidateState も削除候補だった可能性**

  確認:
  ```bash
  grep -rn "EmptyCandidateState" dashboard/src
  ```
  結果: `LocalModeBanner` の隣の `EmptyCandidateState.tsx` 自身のみ → **import 0**

  本 batch では handoff/0155 §8 リストに従って 10 件のみ確認 + 削除を実施。EmptyCandidateState は次 microbatch 候補として §6 「短期」に追加して残置 — 慎重に scope を守る。

  → §6 に追記して報告:

  - `dashboard/src/components/visual-review/EmptyCandidateState.tsx` も import 0 (handoff/0155 §8 リスト外、本 batch では未削除)
- **stale コメント残置**: BigPreviewCard / featureFlags / README で旧名が残る。読者を一瞬迷わせる可能性あり、ただし runtime 影響なし
- **`/publish-packages`, `/activity-log`, `/diagnostics`**: 3 page を fidelity 化するときに削除対象 4 件 (SummaryCard / SectionHeader / EmptyState / FilePathBlock) の参照を全て消す責任が生じる。docs/77 系の fidelity spec パターンで進めれば自然に達成

## 9. Next Recommended Step

**Option A — featureFlags + BigPreviewCard + EmptyCandidateState microbatch (推奨、軽い、5 分)**

import 0 になっている残り 3 件を、1 ファイルあたり数行のみ touch する microbatch:
- `dashboard/src/lib/featureFlags.ts` : `NavFlags` interface + `getNavFlags()` + line 61 コメント を削除
- `dashboard/src/components/visual-review/BigPreviewCard.tsx` : コメント line 3 を更新
- `dashboard/src/components/visual-review/EmptyCandidateState.tsx` : import 0 確認後に削除

```text
Implement final dead code microbatch.

Use:
- docs/handoff/0156-dead-code-cleanup-after-ui-fidelity.md (this handoff, §6)

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持

Tasks:
1. grep "EmptyCandidateState" / "getNavFlags" / "NavFlags" → confirm 0 imports
2. Delete:
   - dashboard/src/components/visual-review/EmptyCandidateState.tsx (after confirm)
   - NavFlags interface + getNavFlags function + line 61 comment in dashboard/src/lib/featureFlags.ts
   - BigPreviewCard.tsx の "CandidatePreview" コメントを minor update
3. cd dashboard && npm run build → 23 routes 維持
4. npm run build (Sanity Studio) → clean
5. docs/devlog/0146 + docs/handoff/0157 + latest mirror
```

**Option B — `/publish-packages`, `/activity-log`, `/diagnostics` fidelity spec**

これら 3 page を fidelity 化する spec docs only batch。完了後の実装 batch で SummaryCard / SectionHeader / EmptyState / FilePathBlock を一気に削除可能になる。

**Option C — `/analytics`, `/knowledge`, `/settings` fidelity spec**

残り fidelity 系 3 route の spec batch。

**Option D — README.md 更新 batch**

AppNav 言及を新 Sidebar 系に書き直す。
