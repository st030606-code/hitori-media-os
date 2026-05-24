# Handoff: Phase 2B-3 visual approve & register spec — boss decisions applied

Date: 2026-05-21

## 1. Task Goal

handoff/0187 (devlog 0176) で起こした Phase 2B-3 visual approve & register bridge detail spec に対し、§12 で 8 件「Claude 推奨案」 として明示していた open question (Q-2B3-1〜Q-2B3-8) に boss 確定回答が出た → spec を「推奨」 から「CONFIRMED」 に書き換える **docs-only microbatch**。

本 batch の出口は **「Phase 2B-3 spec finalized, ready for implementation batch」** 状態。implementation はまだ走らせない。runtime / schema / publish-package / assets / patches / package.json 不変。

## 2. Constraints Followed

- ✅ Docs only、dashboard runtime code 変更なし
- ✅ Server actions 未実装
- ✅ `tools/visual-register/` 触らない
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ assets コピーなし、assets/visuals 不変、assets/inbox 不変
- ✅ patches 不変
- ✅ publish-package files 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ Phase 2B-1 / 2B-2 動作不変 (本 batch は touch なし)

## 3. Changed Files

### 更新 (2 spec)

- [docs/specs/phase-2b-3-visual-approve-register.md](docs/specs/phase-2b-3-visual-approve-register.md)
  - Header: 最終更新日 / ステータスを「**spec finalized**, ready for implementation batch」 に変更
  - §0: 「Phase 2B-3 batch (handoff/0188, 2026-05-21) — 8 Q boss confirmed」 ブロック追加 (Q-2B3-1〜Q-2B3-8 を sentence form で再宣言)
  - §7-2: 「**CONFIRMED: Option D (HTTP bridge)** — Q-2B3-1 ✅ (2026-05-21)」 に書き換え、Option A / B / C を採用しなかった reject reason 明示
  - §9: heading に「Q-2B3-5 CONFIRMED (2026-05-21)」 注釈、`<UndoToastHost>` 不使用を明示
  - §12: Open questions table → **Confirmed questions table** に書き換え、各 row に boss answer + 反映 §location
  - §15: Step 1 (boss が spec を read + judgement) を strikethrough + 「Done 2026-05-21 (handoff/0188)」
- [docs/specs/phase-2b-write-actions.md](docs/specs/phase-2b-write-actions.md)
  - §0.5 に **Phase 2B-3 batch (2026-05-21, handoff/0188)** 新セクション追加 (Phase 2B-2 batch の **上** に挿入 = spec finalize 順)、Q-3 + Q-2B3-1〜Q-2B3-8 (合計 9 件) を sentence form で再宣言、Phase 2B-3 spec へ link
  - §0.5 Implementation status を update: Phase 2B-1 + 2B-2 を ✅ 維持、Phase 2B-3 を 📐 「spec-finalized, implementation pending」 として追加、"Next P1 batch" の文言を更新
  - §2 Phase 2B P1 の W1 entry を spec-finalized 状態に書き換え、HTTP bridge 採用 + Phase 2B-3 spec link + 不採用 alternative 明示

### 新規 docs (3)

- [docs/devlog/0177-phase-2b-3-visual-approve-register-decisions.md](docs/devlog/0177-phase-2b-3-visual-approve-register-decisions.md)
- [docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md](docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror)

### 触らないもの

- `dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- Phase 2B-1 / 2B-2 既存 runtime code (`updateReactionNotes.ts` / `updateGateState.ts` / `<UndoToastHost>` / `<ReactionNoteEditor>` / `<GateStateControl>` / `stateTransitions.ts` / `sanityWriteClient.ts` / `featureFlags.ts`)
- `tools/visual-register/server.mjs` (本 spec の対象だが、Q-2B3-3 / Q-2B3-8 で「触らない」 が明確化)
- `dashboard/README.md` (本 batch では touch なし、Phase 2B-3 implementation batch で update する)

**Sanity への書き込み: 0 件** (本 batch は docs-only)。

## 4. Summary of Changes

### 4-1. Boss-confirmed decisions applied (8 件)

| # | Boss answer (要約) | spec への反映 |
|---|---|---|
| **Q-2B3-1** ✅ | Option D (HTTP bridge to running CLI)。dashboard が `localhost:3334/api/inbox/approve-and-register` を fetch で call。A / B / C は採用しない | spec §0 / §2 / §7-2 / 親 spec §0.5 / §2 |
| **Q-2B3-2** ✅ | Sanity reflect は本 batch に含めない、Phase 2B-3.1 で別 batch | spec §0 / §1 / §3-2 / §10 / §16 / 親 spec §0.5 |
| **Q-2B3-3** ✅ | patch JSON generation は server.mjs が owner、dashboard で重複実装しない | spec §0 / §2 / §3-1 / §6 / §7 / §13 / 親 spec §0.5 |
| **Q-2B3-4** ✅ | publish-package auto-trigger しない、success panel に command 表示のみ | spec §0 / §6 / §8-3 / §10 / §15 / 親 spec §0.5 |
| **Q-2B3-5** ✅ | file op に自動 undo 実装しない、`<UndoToastHost>` 不使用、preview + confirm + manual cleanup | spec §0 / §9 / §16 / 親 spec §0.5 |
| **Q-2B3-6** ✅ | 1 candidate / 1 transaction 維持、overwrite は explicit checkbox 必須 | spec §0 / §6-2 / §8-2 / §10 / 親 spec §0.5 |
| **Q-2B3-7** ✅ | Visual Register CLI auto-start しない、boss が `npm run visual:register` 手動起動 | spec §0 / §6-3 / §10 / 親 spec §0.5 |
| **Q-2B3-8** ✅ | server.mjs に dry-run API 新規追加しない、dashboard 側で preview 計算、`/api/inbox/approve-and-register` は execute 専用 | spec §0 / §6-1 / §7-4 / 親 spec §0.5 |

### 4-2. Phase 2B-3 spec の主要編集

1. **Header**: 最終更新日 + ステータスを「**spec finalized**, ready for implementation batch」 に
2. **§0** に新セクション「Phase 2B-3 batch (handoff/0188, 2026-05-21) — 8 Q boss confirmed」 を追加、Q-2B3-1〜Q-2B3-8 を sentence form で再宣言
3. **§7-2** を「**CONFIRMED: Option D (HTTP bridge)** — Q-2B3-1 ✅」 に書き換え、採用理由 + Option A / B / C を採用しない理由を明示 (reject reasons)
4. **§9** Undo / rollback heading に「Q-2B3-5 CONFIRMED」 注釈、`<UndoToastHost>` 不使用を明文化
5. **§12** Open questions table → **Confirmed questions table** 全書き換え、各 row に boss answer + 反映 §location
6. **§15** Post-spec next step の Step 1 を strikethrough + 「Done 2026-05-21 (handoff/0188)」、Step 2 で HTTP bridge 採用が確定済を明記

### 4-3. Parent spec (phase-2b-write-actions.md) の主要編集

§0.5 を **5 区分構造** に拡張:

1. Parent batch (Q-1 / Q-2 / Q-7)
2. Phase 2B-1 batch (Q-6 / Q-8 / Q-10)
3. **Phase 2B-3 batch** ← **新規追加** (Q-3 / Q-2B3-1〜Q-2B3-8 を sentence form で再宣言、Phase 2B-3 spec へ link)
4. Phase 2B-2 batch (Q-2B2-1〜Q-2B2-7) ← 既存
5. Still open (Q-4 / Q-5 / Q-9) ← 既存

§0.5 Implementation status (updated 2026-05-21):
- Phase 2B-1 ✅ implemented + smoke PASS (継続)
- Phase 2B-2 ✅ implemented + smoke PASS (継続)
- **Phase 2B-3 📐 spec-finalized, implementation pending** (新規追加)
- "Next P1 batch" の文言を「Phase 2B-3 implementation (spec-confirmed via handoff/0188, ready to start)」 に更新

§2 Phase 2B P1 の W1 entry を **spec-finalized 状態** に書き換え:
- 戦略: HTTP bridge 採用、`tools/visual-register/server.mjs` が owner
- 採用しない代替: full reimplement / subprocess spawn / shared module extraction
- Sanity reflect は Phase 2B-3.1、publish-package は Phase 2B-3.2 と明示
- Phase 2B-3 spec へ link

§6 Open Questions table は変更なし (parent-level Q のみ、Phase 2B-3 specific Q は子 spec 内で完結)。

### 4-4. No contradictory open-question wording remains

grep 検証:
```
$ grep -n "推奨\|新規提案\|Recommendation:" docs/specs/phase-2b-3-visual-approve-register.md
(empty)
```

「推奨」「新規提案」「Recommendation」 等の open-question 系 wording は全削除済。残った Q-2B3-* reference はすべて「CONFIRMED」 文脈での参照。

### 4-5. Phase 2B-3 spec key requirements (final form)

確定後の spec の核心:

- **Option D HTTP bridge は実装戦略として確定**: dashboard server action が `localhost:3334/api/inbox/approve-and-register` を fetch で call、`tools/visual-register/server.mjs` を refactor せず使う
- **Dashboard は orchestrator のみ**: file copy / patch JSON 生成 / manifest update のロジックを dashboard 側で持たない
- **CLI / server.mjs は file pipeline owner**: 既存の transactional logic を 100% 流用
- **Sanity reflect は Phase 2B-3.1 で deferred**: 本 batch では patch JSON 生成まで、Sanity 反映は別 batch
- **Undo なし for file operations**: `<UndoToastHost>` は流用しない、preview + confirm + manual cleanup
- **Visual Register CLI manual startup 必須**: dashboard は `npm run visual:register` を spawn しない、boss が事前に起動

### 4-6. Build NOT run

Docs-only batch のため build 不要 (前 batch の build artifact が 23 routes green を保持)。

### 4-7. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):
- 23 routes (前 batch から変化なし)
- データ取得ロジック (GROQ queries) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `enableWriteActions`) — touch なし
- Topbar pill — touch なし
- Phase 2B-1 reactionNotes / Phase 2B-2 humanReviewGate state — 動作不変
- Sanity への write は **Phase 2B-1 + 2B-2** の 2 surface のみ、本 batch では新 server action 未実装
- `tools/visual-register/server.mjs` — touch なし、Visual Register CLI 動作不変
- Sanity schema / publish-package / assets / patches / package.json — 不変

## 5. Phase 2B-3 final status (after this batch)

| Aspect | Status |
|---|---|
| Spec | [docs/specs/phase-2b-3-visual-approve-register.md](docs/specs/phase-2b-3-visual-approve-register.md) — **finalized + 8 Q boss confirmed** |
| Implementation | **pending** (this batch ではまだ未着手) |
| Strategy | Option D — HTTP bridge to running Visual Register CLI |
| Edit surface | `/visual-assets/[assetId]/candidates` のみ (boss decision で 1 page に絞る) |
| Read-only surfaces | `/visual-assets`、`/visual-assets/[assetId]` (既存 DeferredActionButton + Visual Register external link 維持) |
| Touched (in implementation): runtime | `dashboard/src/lib/actions/approveVisualCandidate.ts` (新規) + `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` (新規) + `dashboard/src/lib/visualAssets/bridgePaths.ts` (新規) + `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (更新) + `dashboard/README.md` (更新) |
| Untouched (always): pipeline | `tools/visual-register/server.mjs` / `assets/visuals` / `assets/inbox` / `patches/visual-assets` / `schemas/visualAssetPlan.ts` / `publish-package` |
| Sanity write | **0** (本 batch + Phase 2B-3 implementation 両方とも) |
| File system write | **0** (本 batch のみ、Phase 2B-3 implementation で boss が approve 実行時に `server.mjs` が transactional に書く) |
| Safety layers | 6 + 1 (env flag x2 + input validation + path allowlist + traversal reject + dry-run preview) |
| Undo | **なし** (file op に自動 undo を入れない、preview + confirm + manual cleanup) |
| Confirm modal | 必須 (terminal-only ではなく全 approve) |
| Production behavior | permanently disabled (env x2 + `:3334` reachable でない) |
| Token requirement | **なし** (本 batch では Sanity write 無し、Phase 2B-3.1 で SANITY_WRITE_TOKEN 必要に) |

## 6. Key Decisions

- **Phase 2B-3 spec を「spec-finalized」 に昇格**: spec header + parent §0.5 + parent §2 の 3 か所で documented
- **Option D を採用 alternative 不採用理由付きで明示**: Option A / B / C をそれぞれ reject reason 付きで documented、将来 reader への参照点
- **Undo 戦略の方針分離を確立**: Sanity field op (reversible) には自動 undo、file op (irreversible-ish) には preview + confirm — Phase 2B 全体の architecture pattern として明文化
- **親 spec §0.5 を 5 区分構造に拡張**: Parent / Phase 2B-1 / Phase 2B-3 / Phase 2B-2 / Still open。spec finalize 順で並べる規約を採用 (2B-3 が 2B-2 より先に finalize したわけではないが、boss confirm 順を尊重)
- **§2 P1 の W1 entry を spec-finalized 状態に書き換え**: spec link + 採用 / 不採用 alternative + Sanity reflect / publish-package deferred を 1 か所で読める
- **`tools/visual-register/server.mjs` を touch しない方針を Q-2B3-3 + Q-2B3-8 で 2 重に確定**: Phase 2B-3 で server.mjs に変更を入れない、Phase 2B-3.3 候補 (option C への進化) も後の判断
- **boss が `npm run visual:register` を手動起動する workflow を尊重**: dashboard が CLI lifecycle を管理しない原則を Q-2B3-7 で確定、CLAUDE.md「明示的に依頼されるまで API 連携を追加しない」 と整合
- **devlog / handoff numbering**: 今回は boss prompt 指定 (0177 / 0188) がそのまま free だったので numbering shift なし

## 7. Human Review Questions

### Status / 表記の review

1. spec header の「**spec finalized**, ready for implementation batch」 表現で OK?
2. parent §0.5 の 5 区分構造 (Parent / 2B-1 / 2B-3 / 2B-2 / Still open) で OK? spec finalize 順より「W 番号順」 で並べたい場合は 2B-2 と 2B-3 の順番を swap 可能
3. 「Implementation status」 で 「📐 spec-finalized」 icon の表現で OK? 別 icon ("⏳ pending" / "🛠 in spec" など) 案あれば
4. §2 P1 の W1 entry の長さ + リンク密度で OK? 短縮 / 拡張可能

### 実装着手前の判断

5. 本 batch 後の最優先 next step は Phase 2B-3 implementation batch で OK?
6. Phase 2B-2.1 (reviewer / notes / completedAt 編集) を Phase 2B-3 implementation の前に挟むか後に回すか — boss preference?
7. Phase 2B-2 cleanup microbatch (handoff/0186 §8 言及の dead code 整理) を本 batch 後にやるか、Phase 2B-3 implementation 後にやるか?
8. boss が `.env.local` の `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` + `npm run visual:register` 起動の 3 セットを Phase 2B-3 implementation 前に揃えておく workflow で OK?

## 8. Risks or Uncertainties

- **boss confirmation の解釈リスク**: Q-2B3-1 で「Option D」 と表記したが、boss prompt は明示的に「Option D」 とは書いていない (代わりに「HTTP bridge to localhost:3334/api/inbox/approve-and-register」 と書いた)。Claude 側で Option D に名付けたのは spec §7 の比較表との整合を取るため。boss が「自分は D とは言ってない、A / B / C のいずれかを再選択したい」 と思った場合は再 confirm が必要
- **「採用しない A / B / C」 の reject reason**: spec §7-2 で「Option A: orchestrator としての価値が薄い」「Option B: shell escaping リスク」「Option C: refactor を本 Phase で行わない」 と Claude が文章化したが、これは boss confirm された内容ではなく Claude の推測。boss が後で「いや C は将来やる予定」 と判断すれば spec を update
- **Phase 2B-3.1 / 2B-3.2 / 2B-3.3 の future batch 命名**: 本 spec で「Phase 2B-3.1 (Sanity reflect)」「Phase 2B-3.2 (multi-asset / publish-package auto)」「Phase 2B-3.3 (Option C への進化)」 と numbering したが、boss が異なる numbering preference を持つ可能性
- **spec finalize 順での parent §0.5 配置**: Phase 2B-3 batch を Phase 2B-2 batch の上に挿入 (boss confirm 順)、これが「W 番号順」 を期待する reader に違和感を与える可能性。spec finalize 順を採用したのは「いつ何が確定したか」 の歴史が読みやすいため、ただし boss が「W 番号順がよい」 と判断すれば swap 可能
- **Phase 2B-3 implementation 中の HTTP bridge 動作確認**: spec ではすべて理論ベース、`localhost:3334` の `/api/inbox/approve-and-register` の **実際の response shape を 100% は audit していない**。implementation batch で実 fetch して shape を確認 + types を narrow する必要

## 9. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-3 implementation batch** (本 batch の直接後続、推奨 Next step)
- 必要なら spec 文言調整 microbatch (Section 7 で boss review が出れば)

### 中期 (Phase 2B-3 implementation 後)

- **Phase 2B-3 smoke fix microbatch**: Phase 2B-1 / 2B-2 で 2-3 round の smoke fix が必要だった経緯、同様の round が発生し得る
- **Phase 2B-3.1 spec batch**: Sanity reflect (Q-2B3-2 で deferred)、本 batch の patch JSON を読み込んで Sanity に apply
- **Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**: Phase 2B-3 と並行 or 前後に挟む候補

### 中期 (cleanup)

- handoff/0184 で導入した amber「編集不可 (要 Studio 再保存)」 affordance + `[hrg:diag]` server log を削除する microbatch (boss confirm 待ち)
- AppShell-level `<UndoToastHost>` lift (handoff/0179 §8 言及)

### 長期

- **Phase 2B-3.2** (publish-package auto / batch approve / multi-asset)
- **Phase 2B-3.3** (Option C — server.mjs を share library に refactor、Next.js runtime で動かす)
- **Q-4 audit-log schema** 確定後の永続 undo / 詳細監査
- **`<DeferredActionButton>` 削除**: Phase 2B 全完了後

## 10. Next Recommended Step

**Phase 2B-3 visual approve & register implementation batch**

Spec が finalized したので、次は **実装**。`docs/specs/phase-2b-3-visual-approve-register.md` §11 + §13 に従い:

- **新規 (3-4)**:
  - `dashboard/src/lib/actions/approveVisualCandidate.ts` (`'use server'`、HTTP bridge to `localhost:3334`、9 step flow、6+1 layer safety)
  - `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` (`'use client'`、preview button + confirm modal + overwrite checkbox + result panel + manual cleanup hint)
  - `dashboard/src/lib/visualAssets/bridgePaths.ts` (path allowlist + traversal reject + expected path 計算 helper)
  - (optional) `dashboard/src/lib/visualAssets/visualRegisterClient.ts` (HTTP wrapper, health check + approve-and-register)
- **更新 (4-5)**:
  - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (action 統合 + writeReady + localFsReady 評価)
  - `dashboard/src/components/visual-review/*` (selection state を action に渡す微修正)
  - `dashboard/README.md` (Phase 2B-3 row 追加 + 6+1 layer safety + enablement (両 flag + CLI 起動) を documented)
- **触らない (絶対)**:
  - `tools/visual-register/server.mjs` (Q-2B3-3 + Q-2B3-8 confirmed)
  - `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/visual-assets/` / `publish-package/`
  - Phase 2B-1 / 2B-2 既存 runtime code (regression-free にする)
- **受け入れ基準**: spec §11 の 12 項目すべて green
- 1 PR で完結 (Phase 2B-1 / 2B-2 implementation と同等規模)

---

### Exact prompt for next Claude Code session (Phase 2B-3 implementation batch)

```
Phase 2B-3 visual approve & register bridge の implementation batch を実行してください。

入力:
- docs/specs/phase-2b-3-visual-approve-register.md (finalized, 8 Q confirmed via handoff/0188)
- docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md (本 batch、boss confirmations)
- docs/specs/phase-2b-1-reaction-notes.md (template 元: 4-layer safety + 9 step server action)
- docs/specs/phase-2b-2-human-review-gates.md (template 元: 5-layer + transition allow-list, `<UndoToastHost>`, badge ≠ trigger)
- docs/handoff/0186-phase-2b-2-smoke-pass.md (Phase 2B P0 smoke PASS lessons)
- tools/visual-register/server.mjs (本 batch では touch しない、reference のみ)

スコープ:
- HTTP bridge to `localhost:3334/api/inbox/approve-and-register` (Option D 確定)
- `/visual-assets/[assetId]/candidates` を edit surface に絞る (boss decision)
- file pipeline は `tools/visual-register/server.mjs` が owner、dashboard で重複実装しない
- Sanity reflect は Phase 2B-3.1 で別 batch、本 batch では含めない
- 自動 undo なし (preview + confirm modal + manual cleanup)
- 6+1 layer safety: enableWriteActions + enableLocalFsRoutes + input validation + path allowlist + traversal reject + dry-run preview + (HTTP target hardcoded to localhost:3334)

タスク:
1. 新規ファイル (3-4):
   - dashboard/src/lib/actions/approveVisualCandidate.ts ('use server'、9 step flow)
   - dashboard/src/components/visual-review/ApproveCandidateAction.tsx ('use client'、preview + confirm modal + result panel)
   - dashboard/src/lib/visualAssets/bridgePaths.ts (path validation helpers)
   - (optional) dashboard/src/lib/visualAssets/visualRegisterClient.ts (HTTP wrapper)

2. 更新ファイル (4-5):
   - dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx (action 統合)
   - dashboard/src/components/visual-review/* (selection state thread)
   - dashboard/README.md (Phase 2B-3 row + 6+1 layer safety + enablement instructions)

3. 受け入れ基準 (spec §11 の 12 項目すべて green):
   - build 23 routes green、TypeScript clean
   - default 動作: writeReady=false or localFs=false で完全 read-only
   - enabled 動作: 候補選択 → 採用ボタン → preview modal → 実行 → result panel
   - assets/visuals/.../<asset>.png の存在確認 (server.mjs 経由で書かれた)
   - patches/visual-assets/.../<asset>.json の shape 確認
   - review-manifest.json の更新確認
   - overwrite path 動作 (既存ファイル上書き + checkbox tick)
   - Visual Register down → visual-register-not-running error UI
   - path traversal reject (.. 等)
   - Phase 2B-1 reactionNotes 動作不変
   - Phase 2B-2 humanReviewGate 動作不変
   - token leak audit (VISUAL_REGISTER literal が client bundle に出ない)

4. devlog + handoff + latest.md mirror

constraints:
- tools/visual-register/* 一切 touch なし (Q-2B3-3 + Q-2B3-8 confirmed)
- Sanity schema 不変
- Sanity write 0 (本 batch + 実装後とも)
- assets / patches / publish-package / package.json 不変
- subprocess spawn しない (Q-2B3-7 confirmed)
- `<UndoToastHost>` を本 batch で流用しない (Q-2B3-5 confirmed)
- HTTP fetch target は localhost:3334 hardcoded、env override 不可
- Vercel への env 設定なし、production write 永久 disabled
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0187-phase-2b-3-visual-approve-register-spec.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0187-phase-2b-3-visual-approve-register-spec.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Stale open-question wording check (in 2B-3 spec) ===
$ grep -n "推奨\|新規提案\|Recommendation:" docs/specs/phase-2b-3-visual-approve-register.md
(empty = OK)

=== Files touched in this batch ===
docs/specs/phase-2b-3-visual-approve-register.md   (header + §0 + §7 + §9 + §12 + §15)
docs/specs/phase-2b-write-actions.md               (§0.5 + Implementation status + §2 P1 W1)
docs/devlog/0177-phase-2b-3-visual-approve-register-decisions.md   (new)
docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md  (new)
docs/handoff/latest.md                              (mirror)
```

Build skipped (docs-only). Runtime behavior unchanged: `/analytics` reactionNotes + `/human-review-gates` gate state update + `/campaigns/[slug]` read-only / Visual Register CLI / publish-package すべて preserved as-is.
