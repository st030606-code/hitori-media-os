# Phase 2B-3 visual approve & register bridge — boss smoke PASS recorded

日付: 2026-05-21

## 背景

handoff/0189 (devlog 0178) で Phase 2B-3 (W1 visual approve & register bridge) を実装。boss が手元で full smoke test を実施し、 **PASS** と確認した。本 batch は smoke PASS を spec / parent spec / devlog / handoff に記録する **docs-only batch**。

boss は加えて長期方向も confirmed: Visual Register は将来 dashboard 統合により retire する path、 ただし本 batch + Phase 2B-3.1 では implement しない。

## 決定・変更

### Boss-confirmed smoke test results (PASS)

| 項目 | 結果 |
|---|---|
| Visual approve/register bridge が動作 | ✅ PASS |
| dashboard が preview → execute → result の full flow を完結 | ✅ PASS |
| dashboard 経由で Visual Register server を call できる | ✅ PASS |
| Visual Register server が file copy + patch JSON + manifest update を担当 | ✅ PASS |
| その他 observed issues | なし |

すべての smoke criteria が boss confirmed。 Phase 2B-3 は **implementation + smoke PASS 完了**。

### Boss-confirmed long-term direction

boss prompt:
> Visual Register should eventually be retired as a separate app/server and integrated into the dashboard. However, this should happen later via core extraction / dashboard integration, not immediately.

つまり:
- **現在 (Phase 2B-3)**: dashboard → HTTP bridge → Visual Register `:3334` separate server
- **次 (Phase 2B-3.1)**: dashboard 内に Sanity reflect 追加、file pipeline は依然 Visual Register が owner
- **将来 (別 Phase / Phase 2B-3.3+)**: `tools/visual-register/server.mjs` の core logic を共有 module に extract → dashboard server action が直接 call → CLI / `:3334` は optional compatibility layer に降格 → 最終的に retire
- **本 batch + 2B-3.1 では retirement を実装しない**

これは Phase 2B-3 spec §16 で「Phase 2B-3.3 候補 (option C — share library extraction)」 として既に notated していた path の **正式 boss commitment**。 本 batch + 2B-3.1 は現在の bridge architecture を維持しつつ前進する。

### 更新 (2 spec)

- `docs/specs/phase-2b-3-visual-approve-register.md` — header status を「**implemented + smoke PASS**」 に変更、 後続 spec (Phase 2B-3.1) への link 追加
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 Implementation status を update:
    - Phase 2B-1 / 2B-2 / Phase 2B-3 全て ✅ implemented + smoke PASS で並ぶ
    - Phase 2B-3.1 を 📐 「spec in progress, implementation pending」 として追加
    - 「Long-term: Visual Register retirement direction (boss confirmed 2026-05-21, not this batch)」 新セクション追加 (現在 → 2B-3.1 → 将来の path を 3 段で documented)
    - "Next P1 batch" を「Phase 2B-3.1 implementation」 に更新
  - §2 P1 の W1 entry を ✅ smoke PASS マークに更新、 採用しない alternative 列挙のうち「shared module extraction」 を Visual Register retirement の長期 path として注記

### 新規 docs (3)

- `docs/devlog/0179-phase-2b-3-smoke-pass.md` (本ファイル)
- `docs/handoff/0190-phase-2b-3-smoke-pass.md`
- (本 batch では Phase 2B-3.1 spec も同時 land、 別 entry で記述: 0180 + 0191)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ smoke PASS を spec / parent spec の両方に記録するか

Phase 2B 全体は spec → implementation → smoke fix → smoke PASS の 4 段階を踏む設計。各段階の land を spec header の「ステータス」 + parent spec § 0.5 Implementation status の両方に明示することで:
- spec を後で読む reader が「これは完成済」 と一目で分かる
- Phase 2B-3.1 spec 起こす時に「2B-3 template が PASS 済」 と参照できる
- 後続 W6 / W7 / W8 等の spec を起こす reader にも 2B-3 が成功 reference として残る

### なぜ Visual Register retirement を documented したか (実装しないのに)

boss が future direction を明示した時点で documented しないと、 数 batch 後に「これは何のために bridge にしたんだっけ?」 という記憶 drift が起きやすい。 parent §0.5 に 3 段 (現在 / 次 / 将来) を残すことで:
- 各 batch の position が明確 (Phase 2B-3 は「bridge first」 path の 1 step、 retirement は数 batch 先)
- Phase 2B-3.1 spec で「Sanity reflect は dashboard 内、 file pipeline は依然 Visual Register が owner」 と書く根拠が明示される
- 将来 Phase 2B-3.3 (仮) で「Visual Register core を extract」 とする batch を起こすとき、 「これは boss が 2026-05-21 に confirmed した direction の実装」 と参照点が残る

「documented but not implemented」 は spec-driven workflow の有効活用。

### Phase 2B-3.1 を本 batch で同時 land する理由

通常は smoke PASS → 別 batch で次 spec 作成、 という flow。 ただし本 batch では boss prompt が:
> Goal:
> 1. Record Phase 2B-3 as boss smoke-tested PASS.
> 2. Create implementation-ready docs-only spec for Phase 2B-3.1: ...

と 2 task を同時 instruction していた。 boss は smoke PASS と次 spec を分離した 2 commit にする pattern より、 1 batch で「現状 confirmed + 次の準備」 まで進めたい意図。 docs-only なので runtime risk なし、 1 batch で完結する方が効率的。

→ smoke PASS 記録と Phase 2B-3.1 spec 作成を本 batch で同時 land。 別 entry (devlog 0179 / handoff 0190 が smoke PASS、 devlog 0180 / handoff 0191 が 2B-3.1 spec) として分離記述することで、 後で個別 reference できる構造を保つ。

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-3-visual-approve-register.md` (header status update)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 + 長期 direction section + §2 W1 entry update)
  - `docs/devlog/0179-...` + `docs/handoff/0190-...`
  - (本 batch で同時 land の 0180 / 0191 は別 entry)
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - Phase 2B P0 (W3 + W5) + P1 (W1 bridge) が完了
  - 次の major step は Phase 2B-3.1 (Sanity reflect)、 spec を本 batch で同時 land 済
- スキーマ: 不変
- プロダクト方針:
  - dashboard で書き込み可能な surface が 3 件 (2B-1 + 2B-2 Sanity field、 2B-3 filesystem via CLI bridge) で運用 stable
  - 「Sanity field op = 自動 undo / file op = preview + confirm」 の 2-pattern が実証済
  - Visual Register retirement の long-term path が boss-committed として documented

## 次の一手

**Option A (推奨) — Phase 2B-3.1 spec の boss review + open questions 確定**

本 batch で同時 land する Phase 2B-3.1 spec (`docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md`) を boss が read し、 Q-2B3.1-1〜Q-2B3.1-7 の open questions に confirmation を出す。 確定後 → Q 確定 microbatch → Phase 2B-3.1 implementation batch。

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**

Phase 2B-3.1 implementation 前に boss が「gate に reviewer / notes も書きたい」 と感じれば 2B-2.1 を先に。

**Option C — Phase 2B-2 cleanup microbatch**

handoff/0186 §8 言及の dead code 整理 (amber「編集不可 (要 Studio 再保存)」 affordance + `[hrg:diag]` log)。 urgent ではない。

発信ネタ案:
- 「Phase 2B-3 bridge architecture が boss smoke PASS で stable に到達した話」
- 「Visual Register retirement の 3 段 path を documented but not implemented で残す spec design の効果」
- 「smoke PASS と次 spec を 1 batch で同時 land する判断 — docs-only なら risk なし」
- 「Phase 2B-1 / 2B-2 / 2B-3 の write surface が 3 通りの異なる pattern で共存している話 (Sanity field / Sanity field with allow-list / filesystem via CLI bridge)」
