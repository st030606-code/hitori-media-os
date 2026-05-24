# Handoff: Phase 2B-2 humanReviewGate state update — boss smoke PASS recorded

Date: 2026-05-21

> Note on numbering: boss prompt asked for `docs/devlog/0174-phase-2b-2-smoke-pass.md`, but devlog 0174 was already taken by `0174-human-review-gate-key-backfill-script.md` from the previous batch. This batch uses **devlog 0175**. Handoff number **0186** is unchanged.

## 1. Task Goal

Phase 2B-2 (W5 humanReviewGate state update) は 5 batch (handoff/0182〜0185) を経て land。boss が手元で完全な manual smoke test を実行し、**全項目 PASS** と確認した。本 batch は smoke PASS を spec / parent spec / devlog / handoff に記録する **docs-only batch**。

runtime code は touch なし。`tools/sanity/backfill-human-review-gate-keys.mjs --execute` も実行しない (handoff/0185 dry-run で missing 0 件と確認済のため不要)。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし (backfill `--execute` 未実行)
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ Production writes 永久 disabled (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` を Vercel に設定しない契約維持)
- ✅ 23 routes 不変 (本 batch では build 不要だが、最新 build artifact が前 batch から 23 routes green)

## 3. Changed Files

### 更新 (2 spec)

- [docs/specs/phase-2b-2-human-review-gates.md](docs/specs/phase-2b-2-human-review-gates.md)
  - 最終更新日 / ステータスを「**implemented + smoke PASS** (handoff/0186)」 に変更
- [docs/specs/phase-2b-write-actions.md](docs/specs/phase-2b-write-actions.md)
  - §0.5 末尾に「**Implementation status (2026-05-21)**」 新セクション追加 — Phase 2B-1 + 2B-2 を ✅ smoke PASS として記録、関連 handoff (0178 / 0179 / 0182 / 0183 / 0184 / 0185 / 0186) へ link
  - §2 Prioritization の P0 2 項目 (Phase 2B-1 + Phase 2B-2) に「✅ implemented + smoke PASS (2026-05-21, handoff/0186)」 マーク追加
  - Phase 2B-2 P0 行の「touch 範囲」 / 「State machine」 描述を実装後の確定情報 (state 単一 field, terminal は `done` / `skipped`, edit surface は `/human-review-gates` のみ) に更新
  - § "Still open" の文末「sufficient to run the Phase 2B-1 implementation batch」 → 「sufficient ... Phase 2B-3 spec start」 に表現更新

### 新規 docs (3)

- [docs/devlog/0175-phase-2b-2-smoke-pass.md](docs/devlog/0175-phase-2b-2-smoke-pass.md) (boss prompt asked for 0174; shifted to 0175 due to existing 0174)
- [docs/handoff/0186-phase-2b-2-smoke-pass.md](docs/handoff/0186-phase-2b-2-smoke-pass.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror of 0186)

### 触らないもの

- `dashboard/src/**` (runtime UI / server actions / GROQ / write client / undo host すべて touch なし)
- `tools/sanity/backfill-human-review-gate-keys.mjs` (前 batch で作成済、本 batch では未実行)
- 他 `tools/` script
- `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- Phase 2B-1 既存 (`updateReactionNotes.ts` / `ReactionNoteEditor.tsx` / `sanityWriteClient.ts` / `featureFlags.ts`)
- Phase 2B-2 既存 (`updateGateState.ts` / `GateStateControl.tsx` / `stateTransitions.ts`)
- `dashboard/README.md` (Phase 2B 2 surface 表 + transition table + safety layers の記述は前 batch のまま正確)

**Sanity への書き込み: 0 件** (本 batch は docs-only)。

## 4. Summary of Changes

### 4-1. Smoke test result recorded (boss confirmed)

| # | 項目 | 結果 |
|---|---|---|
| 1 | `/human-review-gates` で explicit「状態を変更 ▾」 dropdown が visible | ✅ PASS |
| 2 | 現在 state に応じた allowed transitions のみが dropdown に出る | ✅ PASS |
| 3 | Terminal transition (例: `pending-review → done`) で confirm modal が起動 | ✅ PASS |
| 4 | Undo が 10 秒以内に動作 (toast → 旧 state 復帰) | ✅ PASS |
| 5 | `/analytics` reactionNotes (Phase 2B-1) regression なし | ✅ PASS |
| 6 | `/campaigns/[slug]` 確認ゲート tab は read-only (intentional) | ✅ PASS |
| 7 | `_key` 一括 backfill `--execute` は不要 (handoff/0185 dry-run で missing 0 件) | ✅ skip 確定 |

7 項目すべて confirmed PASS。Phase 2B-2 は **implementation + smoke** 完了状態。

### 4-2. Files updated

§3 参照。**2 spec file + 3 new docs = 5 ファイル**。runtime code / schema / publish-package / assets / patches / tools / package.json いずれも touch なし。

### 4-3. Why backfill execute was unnecessary

`tools/sanity/backfill-human-review-gate-keys.mjs` を dry-run で走らせた結果 (handoff/0185 §4-2):

```
Doc _id:                campaignPlan.building-hitori-media-os
Doc _rev:               aru76y…
humanReviewGates total: 9
  with existing _key:   9
  missing _key:         0

[backfill] no missing _key — nothing to do. Exiting.
```

全 9 gate に `_key` (prefix `rII736lFD27FsrAxuFlw` + 2-char variation) が既に割り当て済 → Sanity dataset import / Studio 初回 open 時の auto-assign が原因。 boss が「Studio 再保存で gate が editable に切り替わった」 と観察した現象は、`_key` injection ではなく **HMR / build cache 刷新 + GROQ re-fetch** が真因と推定。

→ `--execute` 実行対象 0 件、no-op で安全だが意味なし。**完全に skip 可**。

migration script 自体は将来の保険として保持 (新規 seed 追加時 / Phase 2B-2.1 で他 field migration が必要になった場合の template として有用)。

### 4-4. Explicit「状態を変更」 dropdown が UX 問題を解消した経緯

Phase 2B-2 の land まで 2 回の smoke fix を要した:

- **Initial implementation (handoff/0182)**: `<StatusBadge>` 自身を `<button>` で wrap、内部に小さな `<ChevronDown>` icon。boss は badge を label として認識、click できると気づかず。
- **Smoke fix 1 (handoff/0183)**: 「badge ≠ trigger」 原則を採用、`[StatusBadge] [状態を変更 ▾]` の 2 element 並列に refactor。Button は青系 (`bg-blue-50 border-blue-300 text-blue-800`) で status-tone (緑/amber/灰/桃) と衝突しない明確な action color。
- **Smoke fix 2 (handoff/0184)**: 念のため missing-data affordance (amber「編集不可 (要 Studio 再保存)」) も追加、page-level `canControl` gate 撤去で `<GateStateControl>` を常に render する設計に。
- **Backfill script + dry-run (handoff/0185)**: missing-data affordance が現実データには発火しないことを確認、しかし defensive な保護として保持。
- **Smoke PASS (本 batch)**: boss が `[状態を変更 ▾]` button を即座に click できると確認、編集 flow 全体が成立。

learning: **「badge / label」 と「action button」 は別 element に分けるべき** という UX 原則を Phase 2B 全体に拡張 (Phase 2B-1 は textarea + 編集 button で既に守っていた、2B-2 は最初これに反して smoke fix で揃えた)。

### 4-5. `/campaigns/[slug]` read-only は意図的設計

handoff/0183 で boss product decision として確定済:
- 編集 surface を `/human-review-gates` 単独に絞ることで bug 予測 / spec 変更コスト / undo lifecycle を単純化
- 「observation page で edit」 の混乱を回避
- 観察 / 編集の役割分離が Phase 2B 全体の方針として確立

`/campaigns/[slug]` 確認ゲート tab は:
- 上部に「ここでは状態を表示のみ。変更は /human-review-gates から行います。」 inline notice
- 各 gate に bare `<StatusBadge>` のみ表示 (control / dropdown / button なし)
- 末尾に「確認待ちゲートで状態を変更する」 link → `/human-review-gates`

boss smoke test で意図通りの動作確認。本 batch でも変更なし。

### 4-6. Build NOT run

Docs-only のため build 不要 (前 batch の build artifact が 23 routes green を保持)。

### 4-7. Runtime unchanged confirmation

確認項目 (すべて intact):
- 23 routes (Phase 2B-2 implementation + smoke fix 2 後から変化なし)
- データ取得ロジック (GROQ queries、`_rev` + `_key` projection を含む) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `enableWriteActions`) — touch なし
- Topbar pill (`writeReady` 評価 + `<ReadOnlyPill>`) — touch なし
- Phase 2B-1 server action / write client / Editor — touch なし
- Phase 2B-2 server action / GateStateControl / stateTransitions / UndoToastHost — touch なし
- Sanity への write — 依然 boss-initiated `/human-review-gates` + `/analytics` 経由のみ、本 batch では 0 件
- Sanity schema / publish-package / assets/visuals / patches / package.json — 不変

### 4-8. Token leak audit (carryover from previous batch)

本 batch では runtime touch なしのため audit 不要だが、前 batch の状態を継承:
- `.next/static/chunks/*.js` に `SANITY_WRITE_TOKEN` literal は env var **名** のみ (i18n strings)、token **値** は出現しない
- server-side reads: 4 sites (sanityWriteClient.ts 1 actual + 3 Boolean coercions)
- server `console.log`: metadata only、token / 本文 / reviewer は出さない

## 5. Phase 2B-2 final status

| Aspect | Status |
|---|---|
| Spec | `docs/specs/phase-2b-2-human-review-gates.md` — finalized + smoke PASS |
| Implementation | landed 2026-05-20 (handoff/0182) |
| Smoke fix 1 (UX) | landed 2026-05-20 (handoff/0183) — explicit「状態を変更」 button + `/campaigns/[slug]` read-only |
| Smoke fix 2 (defensive) | landed 2026-05-21 (handoff/0184) — missing-data affordance + `[hrg:diag]` log |
| `_key` backfill script | created 2026-05-21 (handoff/0185), dry-run confirmed `--execute` 不要 |
| Boss smoke PASS | 2026-05-21 (handoff/0186) ✅ |
| Edit surface | `/human-review-gates` (explicit dropdown UI) |
| Read-only surface | `/campaigns/[slug]` 「確認ゲート」 tab (badge + link to edit surface) |
| Patched field | `humanReviewGates[_key].state` 単一 field only |
| Untouched fields | `gateName` / `reviewer` / `completedAt` / `notes` (Phase 2B-2.1 candidate) |
| State machine | 13 allowed transitions, terminal = `done` / `skipped` |
| Safety layers | 6 (env flag / token / input validation / `expectedRevision` re-verify / transition allow-list / field allow-list) |
| Undo | in-memory 10 秒 toast via `<UndoToastHost>`, `isUndo: true` bypass allow-list, current UI session only |
| Confirm modal | Terminal transitions only |
| Production behavior | permanently disabled (no Vercel env), AND-gate on flag + token |
| Token safety | server-only env (`SANITY_WRITE_TOKEN`), never in client bundle, never in stdout |

## 6. Key Decisions

- **Smoke PASS を spec header と parent spec progress section の両方に記録**: spec を後で読む reader が「これは完成済」 と一目で分かる、Phase 2B-3 起こす時に「2B-2 template が PASS 済」 を即座に参照できる
- **`_key` backfill `--execute` を skip 確定**: dry-run report が 0 missing を返した、no-op execute は安全だが意味なし
- **Migration script を保持 (削除しない)**: 将来 seed 追加時 / Phase 2B-2.1 で他 field migration が必要になった際の template
- **「missing-data affordance」 / `[hrg:diag]` log を保持**: defensive UI は コスト 0、bug 発生時の boss UX を救う、production には流れない (writeReady=false で発火しない)
- **`/campaigns/[slug]` read-only 維持**: 観察 / 編集の surface 分離が boss-confirmed product decision として確定、本 batch でも touch なし
- **`/campaigns/[slug]` の `_rev` 取得を残す**: GROQ projection で `_rev` を fetch しているが現状 read-only では未使用、削除しても良いが将来 reviewer / notes 編集対応時に再度必要になる可能性 → 保持で OK
- **devlog numbering shift (0174 → 0175)**: boss prompt 指定の 0174 は前 batch で取得済、これまでの 2 batch (handoff/0184 / 0185) でも同様の shift が発生、安全策として shift を docs 内に明示
- **parent spec §0.5 に「Implementation status」 セクション追加**: 後続 batch 起こす時に「どこまで land したか」 が parent spec 1 か所で分かる、Phase 2B-3 / 2B-4 でも同 pattern で追加可能
- **§2 Prioritization の P0 行に ✅ マーク**: 視覚的 progress indicator、boss が「次は何?」 と spec を開いた時に即座に見える

## 7. Human Review Questions

### Status の表現について

1. spec header の「**implemented + smoke PASS**」 の表現で OK? 別案: 「**production-ready (local-only)**」「**Phase 2B-2 complete**」
2. parent §0.5 「Implementation status」 セクションの粒度で OK? handoff 6 件を全リスト or 主要 2-3 件に絞る方が読みやすいか?
3. §2 Prioritization の ✅ マークの位置 (bullet 先頭 vs 末尾)、boss preference は?

### Phase 2B-2 cleanup の判断

4. amber「編集不可 (要 Studio 再保存)」 affordance + `[hrg:diag]` server log を残すか削除するか
   - 保持案 (本 batch では保持): defensive、future use、harmless
   - 削除案: dead code が気持ち悪い、yagni
5. `<UndoToastHost>` を AppShell level に lift する microbatch (handoff/0179 §8 言及) を Phase 2B-3 前に入れるか後にするか
6. `/campaigns/[slug]` の `_rev` projection を unused field として削除するか、将来 reviewer / notes 編集に備えて保持するか

### Phase 2B-3 の準備

7. parent Q-3 (W1 visual approve & register bridge: option A bridge vs option B reimplement) を本 batch 後に boss confirm が必要
8. Phase 2B-2.1 (reviewer / notes / completedAt 編集) を Phase 2B-3 の前に入れるか、後に回すか

## 8. Risks or Uncertainties

- **HMR cache 仮説の未確定**: boss が「Studio 再保存で gate が editable になった」 観察の真因が HMR / build cache だった可能性は推定にとどまる。再現性検証 (`.next` 削除 + restart) は本 batch では未実施。今後 dev workflow で同類の symptom が出たら確定
- **Sanity client transaction return shape**: Phase 2B-1 / 2B-2 server action の defensive narrow (Array / `.results` 両対応) は実 write を通過済だが、Sanity client minor version change で形が変わる可能性あり (低 risk)
- **Cross-tab undo race** (Phase 2B-1 と同じ): 2 tab で同 gate を編集すると `expectedRevision` が古くなって undo が `conflict` を引く既知 risk
- **Diagnostic log frequency**: `[hrg:diag]` が writeReady=true で `/human-review-gates` 開くたびに発火、dev environment では多く出る。production deploy では writeReady=false なので 0 件
- **`canControl` gate 撤去の副作用**: 全 row で `<GateStateControl>` が render されるため、状態が schema enum 外 (例: 旧 data に変な state 値が残っていた場合) でも control 内部で fallback path に入る — boss 確認済では問題なし、防御層として機能
- **Phase 2B-2.1 (reviewer / notes / completedAt) の `_key` 依存**: 本 batch で `_key` が全 9 件揃っていることが確認済、2B-2.1 でも同 server action template + field allow-list 拡張で対応可能

## 9. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-3 spec batch (W1 visual approve & register bridge)**: parent Q-3 確定後の主推奨 next step
- **Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**: state 単一だと workflow が薄いと boss が感じれば次に着手
- **Phase 2B-2 cleanup microbatch**: amber affordance + `[hrg:diag]` log + `/campaigns/[slug]` `_rev` projection の削除、boss が「dead code 整理したい」 時

### 中期

- **AppShell level `<UndoToastHost>` lift** (handoff/0179 §8 言及): cross-page undo session が必要になった時
- **`<DeferredActionButton>` 削除**: Phase 2B 全完了後の cleanup chain
- **`tools/sanity/reflect-*.mjs` 段階削除**: parent Q-5 確定後

### 長期

- **Q-4 (audit-log schema)** 確定後の persistent undo / 詳細監査
- **promptTemplate dataset insertion (Q-9)** 後の W7 (configurator output save) 議論

## 10. Next Recommended Step

**Phase 2B-3 visual approve & register bridge spec batch**

Phase 2B P0 (W3 + W5) が smoke PASS で完了したので、次の strategic step は **W1 visual approve & register bridge** の detail spec。

Prerequisites:
1. **parent Q-3 の boss confirmation**: option A (Visual Register CLI に bridge) vs option B (dashboard reimplement、`assets/visuals/<path>` copy + `patches/visual-assets/<slug>.json` 生成 + Sanity `visualAssetPlan` atomic update)
2. Phase 2B-1 + 2B-2 で確立した template の流用:
   - `getSanityWriteClient()` factory
   - `enableWriteActions` + `SANITY_WRITE_TOKEN` AND-gate
   - `expectedRevision` 必須 + server-side `_rev` 再 verify
   - field allow-list (`_key` scoped patch)
   - `<UndoToastHost>` (10秒 in-memory undo)
   - badge ≠ trigger 原則 / explicit action button
   - confirm modal for terminal-ish actions
3. Phase 2B-2.1 (reviewer / notes / completedAt) を先に挟む or 後に回すか boss 判断

W1 は visual asset の approve / register というfile system + Sanity 両方 mutate する complexity がある。Q-3 で boss が方針確定したら detail spec を docs-only batch で起こす。

---

### Exact prompt for next Claude Code session (Phase 2B-3 spec batch、Q-3 boss confirm 後)

```
Phase 2B-3 W1 visual approve & register bridge の detail spec を docs-only で起こしてください。

入力:
- docs/specs/phase-2b-write-actions.md (parent §6 Q-3 = [boss 確定回答], parent §3 W1 candidate)
- docs/specs/phase-2b-1-reaction-notes.md (template 元、4 layer safety + 9 step server action)
- docs/specs/phase-2b-2-human-review-gates.md (W5 template、5 layer safety + transition allow-list + isUndo flag pattern)
- docs/handoff/0186-phase-2b-2-smoke-pass.md (本 batch、smoke PASS lessons + final status)
- Visual Register CLI (tools/visual-register/server.mjs) の現状動作

スコープ:
W1 = visual asset の approve & register。
boss 確定 (Q-3): [option A bridge or option B reimplement]
4 layer safety + server action + UndoToastHost を W1 に転用、ただし
file system mutation (assets/visuals/ copy + patches/visual-assets/<slug>.json 生成) + Sanity write 両方を含む。

constraints:
- Sanity schema 不変
- 23 routes 維持
- production write 永久 disabled
- Vercel への env 設定なし
- token を log しない
- assets/visuals / patches を mutate する場合は dashboard 内で完結する controlled write、boss 明示の指示なしに subprocess spawn しない (CLAUDE.md)
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src schemas tools publish-package assets/visuals patches -type f \
    -newer docs/handoff/0185-human-review-gate-key-backfill-script.md
(empty = OK)

$ find . -maxdepth 3 -name "package.json" \
    -newer docs/handoff/0185-human-review-gate-key-backfill-script.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Files touched in this batch ===
docs/specs/phase-2b-2-human-review-gates.md   (status header update)
docs/specs/phase-2b-write-actions.md          (§0.5 + §2 progress update)
docs/devlog/0175-phase-2b-2-smoke-pass.md     (new)
docs/handoff/0186-phase-2b-2-smoke-pass.md    (new)
docs/handoff/latest.md                        (mirror)
```

Build skipped (docs-only). Runtime behavior unchanged: `/analytics` reactionNotes + `/human-review-gates` gate state update + `/campaigns/[slug]` read-only gate observation all preserved as-is.
