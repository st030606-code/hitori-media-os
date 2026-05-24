# Handoff: Phase 2B-3.1 visual asset Sanity reflect spec — boss decisions applied

Date: 2026-05-21

## 1. Task Goal

handoff/0191 (devlog 0180) で Phase 2B-3.1 visual asset Sanity reflect の detail spec を land。 §12 で 7 件の open question (Q-2B3.1-1〜Q-2B3.1-7) を「Claude 推奨案」 として明示していた。 boss が本日 7 件すべてに確定回答 → spec を「推奨」 から「CONFIRMED」 に書き換える **docs-only microbatch**。

本 batch の出口は **「Phase 2B-3.1 spec finalized, ready for implementation batch」** 状態。 implementation はまだ走らせない。 runtime / schema / publish-package / assets / patches / package.json 不変。

## 2. Constraints Followed

- ✅ Docs only、 dashboard runtime code 変更なし
- ✅ Server actions 未実装
- ✅ `tools/visual-register/server.mjs` touch なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ assets コピー / 削除なし、 assets/visuals / assets/inbox 不変
- ✅ patches 不変
- ✅ publish-package files 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ Phase 2B-1 / 2B-2 / 2B-3 動作不変 (touch なし)
- ✅ 「Inventing boss decisions」 しない (parent Q-4 / Q-5 / Q-9 は open のまま)

## 3. Changed Files

### 更新 (2 spec)

- [docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md)
  - header: 最終更新日 + status「**spec finalized**, ready for implementation batch」
  - §0 末尾に「Phase 2B-3.1 batch (handoff/0192, 2026-05-21) — 7 Q boss confirmed」 ブロック追加 (Q-2B3.1-1〜Q-2B3.1-7 を sentence form で再宣言)
  - §3-2「**CONFIRMED: Option C (both pages)** — Q-2B3.1-2 ✅ (2026-05-21)」 に書き換え、 採用しなかった Option A / B を reject reason 付きで documented
  - §7 heading「Undo / rollback — Q-2B3.1-3 CONFIRMED (2026-05-21)」、 §7-2「CONFIRMED: No undo in Phase 2B-3.1」 + 採用しなかった `<UndoToastHost>` 案を明示
  - §12 Open questions table → **Confirmed questions table** 全書き換え、 各 row に boss-confirmed answer + 反映 §location
  - §15 Step 1 を strikethrough + 「Done 2026-05-21 (handoff/0192)」
- [docs/specs/phase-2b-write-actions.md](docs/specs/phase-2b-write-actions.md)
  - §0.5 に **Phase 2B-3.1 batch (2026-05-21, handoff/0192)** 新セクション追加、 Q-2B3.1-1〜Q-2B3.1-7 を sentence form で再宣言、 Phase 2B-3.1 spec へ link
  - §0.5 Implementation status の Phase 2B-3.1 行を「📐 spec finalized, implementation pending」 に update、 handoff/0191 + 0192 link 追加、 戦略 (別実装) / Edit surface (両 page) / Field allow-list (4 field) / Undo (なし) を要約

### 新規 docs (3)

- [docs/devlog/0181-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md](docs/devlog/0181-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md)
- [docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md](docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror)

### 触らないもの

- `dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- Phase 2B-1 / 2B-2 / 2B-3 既存 runtime code
- `tools/visual-register/server.mjs` (本 spec の対象だが Q-2B3-3 + Q-2B3-8 で確定済)
- `tools/sanity/reflect-working-pipeline-visual-assets.mjs` (本 batch で「直接 import しない」 と確定、 logic 元として読むのみ — 本 batch では実装すらしない)
- `dashboard/README.md` (本 batch では touch なし、 implementation batch で update)

**Sanity への書き込み: 0 件** (本 batch は docs-only)。

## 4. Summary of Changes

### 4-1. Boss-confirmed decisions applied (7 件)

| # | Boss answer (要約) | spec 反映 §location |
|---|---|---|
| **Q-2B3.1-1** ✅ | 編集対象は 4 field 厳守 (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)、 他 field は patch しない | §0 / §2-2 / §4-3 / §5 (layer 7) / §6 / §10 / 親 §0.5 |
| **Q-2B3.1-2** ✅ | Option C — 両 page (candidates + detail) を edit surface に | §0 / §3-1 / §3-2 / §11-2 / 親 §0.5 |
| **Q-2B3.1-3** ✅ | No undo、 `<UndoToastHost>` 流用しない、 preview + confirm | §0 / §7 / 親 §0.5 |
| **Q-2B3.1-4** ✅ | Already-reflected detection は 4 field 完全一致 | §0 / §3-3 / §5-3 / 親 §0.5 |
| **Q-2B3.1-5** ✅ | 1 asset / 1 transaction 厳守 | §0 / §4-1 / §8 / 親 §0.5 |
| **Q-2B3.1-6** ✅ | Dashboard server action として別実装、 `reflect-*.mjs` を直接 import / extract しない、 safety philosophy のみ mirror | §0 / §6 / §11-4 / 親 §0.5 |
| **Q-2B3.1-7** ✅ | Missing target doc は `not-found` reject + Studio 誘導 | §0 / §6-2 (step 7) / 親 §0.5 |

### 4-2. Phase 2B-3.1 spec の主要編集

1. **Header**: 最終更新日 + ステータスを「**spec finalized**, ready for implementation batch」 に変更
2. **§0** 末尾に新セクション「Phase 2B-3.1 batch (handoff/0192, 2026-05-21) — 7 Q boss confirmed」 追加
3. **§3-2** 「CONFIRMED: Option C (both pages)」 に書き換え、 Option A / B reject reason 明示
4. **§7** Undo / rollback heading に「Q-2B3.1-3 CONFIRMED」 注釈、 §7-2 を「CONFIRMED: No undo in Phase 2B-3.1」 に変更
5. **§12** Open questions table → **Confirmed questions table** 全書き換え、 各 row に boss answer + 反映 §location
6. **§15** Post-spec next step Step 1 を strikethrough + 「Done 2026-05-21 (handoff/0192)」、 Step 2 で別実装 (Q-2B3.1-6 confirmed) を明記

### 4-3. Parent spec (phase-2b-write-actions.md) の主要編集

§0.5 を **6 区分構造** に拡張 (boss confirm 順):

1. Parent batch (Q-1 / Q-2 / Q-7)
2. Phase 2B-1 batch (Q-6 / Q-8 / Q-10)
3. **Phase 2B-3.1 batch** ← **新規追加** (Q-2B3.1-1〜Q-2B3.1-7)
4. Phase 2B-3 batch (Q-3 / Q-2B3-1〜Q-2B3-8)
5. Phase 2B-2 batch (Q-2B2-1〜Q-2B2-7)
6. Still open (Q-4 / Q-5 / Q-9)

§0.5 Implementation status:
- Phase 2B-1 / 2B-2 / 2B-3 ✅ implemented + smoke PASS (継続)
- **Phase 2B-3.1 📐 spec finalized, implementation pending** (新規 status)
- "Next P1 batch" の文言は「Phase 2B-3.1 implementation」 のまま

§6 Open Questions table は変更なし (parent-level Q のみ、 Phase 2B-3.1 specific Q は子 spec 内で完結)。

### 4-4. No contradictory open-question wording remains

grep 検証:
```
$ grep -n "推奨" docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md
(empty - all open-question wording removed)
```

「推奨」「Recommendation」 等の open-question 系 wording は全削除済。 残った Q-2B3.1-* reference は「CONFIRMED」 文脈での参照。 「Phase 2B-3.2 候補」「将来 (Phase 2B-3.3 候補)」 等の **future batch placeholder** wording は意図的に残す (Visual Register retirement の段階を documented but not implemented として明示するため)。

### 4-5. Build NOT run

Docs-only batch のため build 不要 (handoff/0190 build artifact が継承、 23 routes green を保持)。

### 4-6. Runtime behavior unchanged

確認項目:
- 23 routes (前 batch から変化なし)
- データ取得ロジック / feature flags / Topbar pill — touch なし
- Phase 2B-1 reactionNotes / Phase 2B-2 humanReviewGate / Phase 2B-3 visual approve/register bridge — 動作不変
- `tools/visual-register/server.mjs` — touch なし、 CLI 動作不変
- `tools/sanity/reflect-*.mjs` — touch なし、 recovery script 動作不変
- Sanity への write は 3 surface (Phase 2B-1 + 2B-2 + Phase 2B-3 file pipeline) のみ、 本 batch で新 server action 未実装
- Sanity schema / publish-package / assets / patches / package.json 不変

## 5. Phase 2B-3.1 final status (after this batch)

| Aspect | Status |
|---|---|
| Spec | [docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md) — **finalized + 7 Q boss confirmed** |
| Implementation | **pending** (本 batch では未着手) |
| Strategy | Dashboard server action として別実装、 patch JSON を source of truth に |
| Edit surfaces | `/visual-assets/[assetId]/candidates` + `/visual-assets/[assetId]` 両方 |
| Field allow-list | 4 fields (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) |
| Already-reflected detection | 4 field 完全一致 |
| Transaction scope | 1 asset / 1 transaction |
| Undo | **なし** (preview + confirm のみ) |
| Missing target doc | `not-found` reject (no auto-create) |
| Logic reuse | None — `reflect-*.mjs` CLI は import しない、 safety philosophy のみ mirror |
| Production behavior | permanently disabled (env flags + Vercel に token 設定しない) |
| Token requirement | `SANITY_WRITE_TOKEN` 必須 (本 batch で復活、 Phase 2B-3 では不要だった) |
| File system writes | **0** (patch JSON は read only) |
| Sanity writes | 4 field 1 patch / 1 transaction |
| Safety layers | 7 (env flag x2 + input regex + patch JSON path allowlist + patch shape validation + `expectedRevision` + field allow-list) |

## 6. Key Decisions

- **Phase 2B-3.1 spec を「spec finalized」 status に昇格**: header + parent §0.5 + parent §0.5 Implementation status の 3 か所で「📐 spec finalized, implementation pending」
- **4 field 厳守 (Q-2B3.1-1)**: 現行 Visual Register patch JSON shape (実 patch 16+ 件 audit 済) と一致、 拡張余地は将来 spec update で対応する明確な safety boundary
- **両 page edit surface (Q-2B3.1-2)**: Phase 2B-2「1 edit surface」 原則の例外、 2 文脈 (continuation + post-discovery) は entry point を増やす方が UX 自然
- **No undo (Q-2B3.1-3)**: Sanity field op だが file pipeline (2B-3) と密結合、 Sanity だけ undo すると filesystem 乖離。 preview + confirm modal で commit 前に吸収
- **4 field 完全一致 (Q-2B3.1-4)**: precision 重視、 boss が「念のため再実行」 する path は execute available + log で `already-applied: true` を残す
- **別実装 (Q-2B3.1-6)**: `reflect-*.mjs` CLI を直接 import / extract しない、 dashboard server action は patch JSON 1 件 / 1 doc に絞った simple な実装、 reflect-* CLI は recovery 用途として併存
- **`not-found` reject (Q-2B3.1-7)**: dashboard が doc を新規作成しない、 boss workflow としては「Sanity Studio で planning → 採用 → reflect」 の flow が前提、 UI で「Studio で先に作成」 と誘導
- **親 §0.5 を 6 区分構造に拡張**: boss confirm 順 (Parent / 2B-1 / 2B-3.1 ← 新規 / 2B-3 / 2B-2 / Still open)、 時系列で読みやすい
- **Future placeholder wording を残す**: 「Phase 2B-3.2 候補」「Phase 2B-3.3 候補 (Visual Register retirement)」 等は意図的に保持、 documented but not implemented として明示
- **devlog/handoff numbering**: 0181 / 0192 は boss prompt 指定どおり free だったので numbering shift なし

## 7. Human Review Questions

### Spec の最終形 review

1. Q-2B3.1-1〜Q-2B3.1-7 すべて「CONFIRMED」 として spec に反映済、 文言 review 必要なら指摘 (特に §3-2 の Option A / B reject reason、 §12 の Confirmed questions table)
2. 4 field 厳守 (Q-2B3.1-1) について: 将来 Visual Register が他 field を生成し始めるシナリオで spec update する trigger を明示するか? (本 spec では「将来 server.mjs が patch JSON に他 field を生成し始めたら spec update」 と documented)
3. parent §0.5 6 区分構造の boss confirm 順 (Parent / 2B-1 / 2B-3.1 / 2B-3 / 2B-2 / Still open) で OK? 「W 番号順」 を希望すれば 2B-3 と 2B-3.1 と 2B-2 の順番を swap 可能

### Implementation batch までの path

4. 本 batch 後の最優先 next step は Phase 2B-3.1 implementation batch で OK?
5. Phase 2B-2 cleanup microbatch (handoff/0186 §8 言及の dead code) を 2B-3.1 implementation 前に挟むか後にするか?
6. `<UndoToastHost>` AppShell 化 (handoff/0179 §8 言及) を 2B-3.1 と並列で進めるか後にするか?

### 中長期判断

7. Phase 2B-3.2 (publish-package distribute / batch approve / multi-asset) の timing
8. Phase 2B-3.3 (Visual Register retirement / share library extraction) の timing
9. parent Q-4 (audit-log schema) を Phase 2B-X までに確定したいか — 関連: Phase 2B-1 / 2B-2 の undo は「current UI session のみ」、 永続 audit は別 spec batch

## 8. Risks or Uncertainties

- **boss confirmation の解釈リスク**: Claude 側の解釈で「サーバー action 別実装」 = `reflect-*.mjs` 完全 untouched + safety philosophy mirror、 と理解したが、 boss が異なるニュアンス (例: 「reflect-*.mjs を refactor して share util を作る」) を意図していた可能性。 implementation batch で確認
- **「Option C 両 page」 のメンテコスト**: 同 server action を 2 entry point から call、 各 page で UI state 同期する必要、 Phase 2B-2「1 edit surface」 原則の例外。 implementation 中に boss が「やはり 1 page に絞ろう」 と感じれば smoke fix で対応
- **patch JSON shape の安定性**: 現行 Visual Register が生成する 4 field shape を前提、 server.mjs が将来 field を追加すると spec / 実装更新が必要
- **「既に reflected」 detection の precision**: 4 field 完全一致を採用するが、 ISO datetime format / whitespace / 改行の差で false negative が起き得る。 implementation 時に normalize 戦略 (e.g., trim、 ISO 正規化) が必要
- **`reflect-*.mjs` との責任分離が明確か**: server action と CLI が併存、 「どちらを使うか」 の判断基準を README / docs で明示する必要 (implementation batch で対応)
- **Missing target doc の guidance UI**: 「Sanity Studio で先に visualAssetPlan を作成してください」 と表示するが、 具体的な手順 (どの field を入力するか / どこに createButton があるか) は implementation 時に決める

## 9. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-3.1 implementation batch** (本 batch の直接後続、 推奨 Next step)
- Phase 2B-2 cleanup (handoff/0186 §8 dead code) — boss 好み次第のタイミング

### 中期

- **Phase 2B-3.1 implementation batch**: 新規 2-3 + 更新 3-4 = 5-7 ファイル変更、 14 acceptance criteria green
- **Phase 2B-3.1 smoke fix microbatch**: Phase 2B-1 / 2B-2 / 2B-3 で 2-3 round 必要だった経緯
- **Phase 2B-2.1 microbatch**: reviewer / notes / completedAt 編集

### 中期 (Phase 2B-3.2)

- publish-package distribute auto-trigger
- batch / multi-asset reflect (Q-2B3.1-5 で deferred)
- Visual Register CLI connection status indicator (topbar)

### 長期

- **Phase 2B-3.3 candidate**: Visual Register retirement (share library extraction)、 `tools/visual-register/server.mjs` を core module に refactor、 HTTP bridge を skip
- audit-log schema (parent Q-4) 確定後の永続 undo / 詳細監査
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)
- `tools/sanity/reflect-*.mjs` 段階削除 (parent Q-5) — 注: Phase 2B-3.1 で dashboard server action が `reflect-working-pipeline-visual-assets.mjs` の役割を一部代替するが、 recovery 用途は引き続き有効

## 10. Next Recommended Step

**Phase 2B-3.1 visual asset Sanity reflect implementation batch**

Spec が finalized したので、 次は **実装**。 `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md` §11 + §10 に従い:

- **新規 (2-3)**:
  - `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` (`'use server'`、 9-10 step flow、 7 layer safety)
  - `dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx` (`'use client'`、 preview button + confirm modal + diff panel + result panel + manual cleanup hint)
  - (optional) `dashboard/src/lib/visualAssets/patchPaths.ts` (path allowlist + shape validation helper、 `bridgePaths.ts` と並列)
- **更新 (3-4)**:
  - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (Phase 2B-3 success panel 内に統合)
  - `dashboard/src/app/visual-assets/[assetId]/page.tsx` (detail page に「patch JSON あり / Sanity 未反映」 indicator + button)
  - `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` (slot)
  - `dashboard/README.md` (Phase 2B-3.1 row + 7 layer safety + enablement で `SANITY_WRITE_TOKEN` 復活明示)
- **触らない (絶対)**:
  - `tools/visual-register/server.mjs`
  - `tools/sanity/reflect-*.mjs` (logic 元として読むのみ、 import しない)
  - `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` (read only) / `publish-package/`
  - Phase 2B-1 / 2B-2 / 2B-3 既存 runtime code (regression-free にする)
- **受け入れ基準**: spec §10 の 14 項目すべて green
- 1 PR で完結 (Phase 2B-1 / 2B-2 / 2B-3 と同等規模)

---

### Exact prompt for next Claude Code session (Phase 2B-3.1 implementation batch)

```
Phase 2B-3.1 visual asset Sanity reflect の implementation batch を実行してください。

入力:
- docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md (finalized, 7 Q confirmed via handoff/0192)
- docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md (本 batch、 boss confirmations)
- docs/specs/phase-2b-1-reaction-notes.md (template 元: 4-layer safety + 9 step server action)
- docs/specs/phase-2b-2-human-review-gates.md (template 元: 5-layer + transition allow-list + isUndo bypass、 ただし本 batch では undo なし)
- docs/specs/phase-2b-3-visual-approve-register.md (template 元: bridgePaths / approveVisualCandidate / ApproveCandidateAction の structure)
- tools/sanity/reflect-working-pipeline-visual-assets.mjs (参考 logic 元、 import しない、 safety philosophy のみ mirror)

スコープ:
- Dashboard server action として別実装 (Q-2B3.1-6 confirmed)
- `tools/sanity/reflect-*.mjs` を import / extract しない、 safety philosophy のみ mirror
- patch JSON を source of truth として読み込み (read only)
- 4 field 厳守 (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)
- 1 asset / 1 transaction
- Both pages (candidates + detail) を edit surface に
- No undo (preview + confirm)
- 7 layer safety: env x2 + input validation + patch JSON path allowlist + patch shape validation + expectedRevision + field allow-list

タスク:
1. 新規ファイル (2-3):
   - dashboard/src/lib/actions/reflectVisualAssetPatch.ts ('use server'、 9-10 step flow)
   - dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx ('use client'、 preview + confirm + diff + result)
   - (optional) dashboard/src/lib/visualAssets/patchPaths.ts

2. 更新ファイル (3-4):
   - dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx (Phase 2B-3 success panel 内に統合)
   - dashboard/src/app/visual-assets/[assetId]/page.tsx (detail page に indicator + button)
   - dashboard/src/components/visual-review/CandidateFocusLayout.tsx (slot)
   - dashboard/README.md (Phase 2B-3.1 row + 7 layer safety + enablement で SANITY_WRITE_TOKEN 復活明示)

3. 受け入れ基準 (spec §10 の 14 項目すべて green):
   - build 23 routes green、 TypeScript clean
   - default 動作: writeReady=false で完全 read-only
   - enabled 動作: preview → execute → Sanity 4 field 更新
   - preview ⇄ execute 区別
   - _rev conflict 動作
   - 既に reflected hint (4 field 完全一致)
   - patch JSON 不在で button が出ない
   - patch JSON malformed reject
   - _id mismatch reject
   - Phase 2B-1 reactionNotes 動作不変
   - Phase 2B-2 humanReviewGate 動作不変
   - Phase 2B-3 visual approve/register 動作不変
   - token leak audit
   - no asset / publish-package modifications

4. devlog + handoff + latest.md mirror

constraints:
- tools/visual-register/ 一切 touch なし
- tools/sanity/reflect-*.mjs を import / extract / refactor しない
- Sanity schema 不変
- assets / patches / publish-package / package.json 不変
- subprocess spawn なし
- 4 field 厳守、 5 field 目を patch しない
- token / 本文を log しない
- production / preview / development Vercel scope に env を絶対に設定しない
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0191-phase-2b-3-1-visual-asset-sanity-reflect-spec.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0191-phase-2b-3-1-visual-asset-sanity-reflect-spec.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Stale open-question wording check (in 2B-3.1 spec) ===
$ grep -n "推奨" docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md
(none — all Q-related wording converted to CONFIRMED references)

=== Future placeholder wording (intentional, retained) ===
"Phase 2B-3.2 候補"     (multi-asset, publish-package auto)
"Phase 2B-3.3 候補"     (Visual Register retirement, share library extraction)

=== Files touched in this batch ===
docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md   (header + §0 + §3-2 + §7 + §12 + §15)
docs/specs/phase-2b-write-actions.md                     (§0.5 Phase 2B-3.1 batch new + Implementation status update)
docs/devlog/0181-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md   (new)
docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md  (new)
docs/handoff/latest.md                                    (mirror)
```

Build skipped (docs-only). Runtime behavior unchanged: `/analytics` reactionNotes + `/human-review-gates` gate state + `/visual-assets/[assetId]/candidates` Visual approve/register bridge / Visual Register CLI / publish-package すべて preserved as-is.
