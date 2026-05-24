# Phase 2B-2 humanReviewGate state update — boss smoke PASS recorded

日付: 2026-05-21

> Note: boss prompt 指定の `docs/devlog/0174-phase-2b-2-smoke-pass.md` は前 batch (`0174-human-review-gate-key-backfill-script.md`) で取得済。本 entry は次の空き番号 **0175** を使用。handoff 番号 **0186** は free のためそのまま。

## 背景

Phase 2B-2 (W5 humanReviewGate state update) は 2026-05-20 〜 21 にかけて以下の 5 batch を経て land:

1. **handoff/0182** (2026-05-20): implementation 本体 — server action / write client / `<GateStateControl>` (initial design) / `<UndoToastHost>` 汎用化 / GROQ projection に `_rev` + `_key` 追加
2. **handoff/0183** (2026-05-20): smoke fix 1 — badge ≠ trigger 原則を採用、explicit「状態を変更 ▾」 button を別 element 化、`/campaigns/[slug]` を read-only に revert
3. **handoff/0184** (2026-05-21): smoke fix 2 — `<GateStateControl>` に missing-data affordance 追加 (defensive)、page-level `canControl` gate 撤去、`[hrg:diag]` server log 追加
4. **handoff/0185** (2026-05-21): `_key` 一括 backfill 用 controlled migration script を `tools/sanity/backfill-human-review-gate-keys.mjs` として新規作成、dry-run 実行 → 全 9 gate に `_key` 既に存在することが判明、`--execute` 不要
5. **本 batch (handoff/0186)**: boss が手元で smoke test を完了、**PASS** と確認

本 entry は smoke PASS を記録する **docs-only batch**。runtime code は touch なし。

## 決定・変更

### Boss-confirmed smoke test results (PASS)

| 項目 | 結果 |
|---|---|
| `/human-review-gates` に explicit「状態を変更 ▾」 dropdown が表示 | ✅ PASS |
| 現在 state に応じて allowed transitions のみが dropdown に表示 | ✅ PASS |
| Terminal transition (例: `pending-review → done`) で confirm modal | ✅ PASS |
| Undo が 10 秒以内に動作 (toast → 旧 state 復帰) | ✅ PASS |
| `/analytics` reactionNotes (Phase 2B-1) 動作不変 | ✅ PASS (regression なし) |
| `/campaigns/[slug]` 確認ゲート tab は read-only に維持 | ✅ PASS (intentional read-only) |
| `_key` 一括 backfill `--execute` は不要 (handoff/0185 dry-run で missing 0 件) | ✅ skip 確定 |

すべての smoke criteria が boss confirmed。Phase 2B-2 は **implementation + smoke PASS 完了**。

### 更新 (2 spec)

- `docs/specs/phase-2b-2-human-review-gates.md` — header の最終更新日 / ステータスを「implemented + smoke PASS (handoff/0186)」 に変更
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 に新セクション「Implementation status (2026-05-21)」 追加 — Phase 2B-1 + 2B-2 を ✅ smoke PASS として記録、関連 handoff へ link
  - §2 Prioritization の Phase 2B P0 2 項目に「✅ implemented + smoke PASS (2026-05-21, handoff/0186)」 マーク追加
  - Phase 2B-2 行の「touch 範囲」「State machine」 を実装後の確定情報に更新 (本 batch では `state` 単一 field、Q-2B2-3 で確定済)

### 新規 docs (3)

- `docs/devlog/0175-phase-2b-2-smoke-pass.md` (本ファイル、boss prompt は 0174 を指定したが taken のため shift)
- `docs/handoff/0186-phase-2b-2-smoke-pass.md`
- `docs/handoff/latest.md` (mirror)

### 触らないもの

- `dashboard/src/**` (runtime UI / server actions / GROQ / write client / undo host すべて touch なし)
- `tools/sanity/backfill-human-review-gate-keys.mjs` (handoff/0185 で作成済、本 batch では未実行)
- `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- Phase 2B-1 既存 (`updateReactionNotes.ts` / `ReactionNoteEditor.tsx` / `sanityWriteClient.ts` / `featureFlags.ts`)

### Sanity への書き込み

**0 件**。本 batch は docs-only。`tools/sanity/backfill-human-review-gate-keys.mjs --execute` も実行していない (dry-run で missing 0 件と確認済のため不要)。

## 理由

### なぜ `_key` backfill execute をスキップして良いと判断したか

handoff/0185 の dry-run output が `missing _key: 0` を返した:
- 全 9 gate に既に Sanity-internal `_key` (prefix `rII736lFD27FsrAxuFlw` + 2-char variation) が割り当てられている
- これらは Sanity dataset import / Studio 初回 open 時に auto-assigned されたもの
- handoff/0184 の root cause 仮説 (「seed JSON に `_key` 無し → dashboard が edit できない」) は実データに対しては不正確だった
- 実際の root cause は HMR / build cache staleness と推測 (boss の `npm run dev` restart で fresh GROQ projection を fetch した結果、`canControl=true` に切り替わって button が visible になった)

execute すべき対象が 0 件なので、`--execute` 実行は完全な no-op。安全だが意味なし。

### なぜ「missing-data affordance」 を残したか (削除しなかった)

handoff/0184 で `<GateStateControl>` に追加した amber「編集不可 (要 Studio 再保存)」 pill は、現実データには発火していない (全 gate に `_key` あり)。しかし:
- 将来 boss が新たな campaignPlan を programmatic に追加する path (npx sanity exec / cli ImportError / 等) で `_key` 無し状態が発生する可能性
- Phase 2B-2.1 で reviewer / notes / completedAt 編集を入れた際、もし片方の field が `_key` injection を avoid する形で migrate されると同 affordance が機能する
- defensive UI は コスト 0 だが、bug 発生時の boss UX を救う

→ 削除せずに保持。boss が将来「dead code を消したい」 と判断した場合は別 microbatch で対応。

### なぜ `[hrg:diag]` server log も残したか

handoff/0184 の `console.log('[hrg:diag]', {writeReady, campaigns, editableGates, missingIdentityGates})` も:
- 機密情報を含まない (count のみ、token / 本文 / reviewer は出さない)
- dev environment 限定の動作確認補助
- `editableGates: N / missingIdentityGates: 0` の output は Phase 2B-2 が正常稼働している証跡

production deploy では `writeReady === false` で log 発火しない (= production stdout に diag log は流れない)。dev でのみ noise — boss が「verbose すぎ」 と感じたら NODE_ENV 検証で gate する microbatch を別途実行可能。

### なぜ `/campaigns/[slug]` read-only を維持したか

handoff/0183 の boss product decision で確定:
- `/human-review-gates` を編集 surface に、`/campaigns/[slug]` を観察 surface に分離
- 1 つの edit surface だけにすると bug 予測 / spec 変更コストが下がる
- 「observation page で state を変更」 という UX は混乱を生む

本 batch でも変更なし。GatesSection は読み取り表示 + `/human-review-gates` への link のみ。

### なぜ smoke PASS を spec header に記録するか

Phase 2B 全体は spec → implementation → smoke fix → smoke PASS の 4 段階を踏む設計。各段階の land を spec header の「ステータス」 field に明示することで:
- 後で spec を読む人が「これは完成済」 と一目で分かる
- 別の batch を起こす時、どの spec が「次の入力」 として安定かが分かる
- Phase 2B-3 spec 作成時に「2B-2 の template が PASS 済」 と参照できる

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-2-human-review-gates.md` (header status update)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 + §2 progress update)
  - `docs/devlog/0175-...` + `docs/handoff/0186-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: **touch なし**
- ワークフロー:
  - Phase 2B P0 (W3 + W5) が完了状態として確定
  - 次の major step は Phase 2B-3 (W1 visual approve & register bridge) の spec batch、parent Q-3 確定後
  - 中間 step として Phase 2B-2.1 (reviewer / notes / completedAt 編集) を選ぶ余地
- スキーマ: 不変 (Q-2B2-1 boss confirmed schema unchanged が維持)
- プロダクト方針:
  - **dashboard で書き込み可能な surface が 2 件 (Phase 2B-1 + 2B-2) で運用 stable** に到達
  - 共通 template (server action / 4-5 layer safety / `<UndoToastHost>` / `expectedRevision` required / token never logged) が 2 件の write 実装で実証済
  - 同 template を W1 (visual approve) で再利用するコストが見える化

## 次の一手

**Option A (推奨) — Phase 2B-3 W1 visual approve & register bridge spec batch**

parent Q-3 が boss confirmed され次第、W1 の detail spec を起こす。input:
- `docs/specs/phase-2b-write-actions.md` (parent §3 W1 candidate)
- `docs/specs/phase-2b-1-reaction-notes.md` (template 元、4 layer safety + 9 step server action)
- `docs/specs/phase-2b-2-human-review-gates.md` (W5 template、5 layer safety + transition allow-list + isUndo flag pattern)
- 本 batch handoff/0186 (boss smoke PASS confirmation lessons)

W1 は visual asset の approve / register、`assets/visuals/` ファイル copy + `visualAssetPlan` の Sanity update + Visual Register CLI との bridge という complexity がある → spec が parent Q-3 で「dashboard bridge」 vs 「dashboard reimplement」 のどちらを採用するか boss 確定が必要。

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**

`/human-review-gates` で state に加えて reviewer / notes / completedAt も編集可能にする。`_key` が全 9 件揃っていることが handoff/0185 で確認済 → field allow-list 拡張だけで実装可能。`done` 遷移時の `completedAt: new Date().toISOString()` 自動 patch も再評価候補。

**Option C — Smoke fix の cleanup microbatch**

amber「編集不可 (要 Studio 再保存)」 affordance + `[hrg:diag]` server log を削除する dead-code cleanup。boss が「dead code が気持ち悪い」 と感じたとき。harmless なので urgent ではない。

**Option D — Phase 2B-1 reactionNotes の `/publish-package/[slug]` 上の編集追加**

boss が「`/analytics` 以外でも reactionNotes 編集したい」 と感じれば 2B-1.1 microbatch。

発信ネタ案:
- 「5 batch かけて W5 humanReviewGate state update を land した経緯」 — spec → 推奨案確定 → implementation → smoke fix 1 (badge ≠ trigger) → smoke fix 2 (missing-data affordance) → backfill script dry-run → smoke PASS
- 「`_key` 仮説が dry-run で外れた話」 — boss feedback で結論を急いだが、データを見たら違った。dry-run-first migration の価値
- 「`/campaigns/[slug]` を read-only に戻した判断が UX 上正解だった」 — 観察 / 編集の surface 分離原則
- 「Phase 2B template が完成、W1 visual approve に転用するコストが見える化」
