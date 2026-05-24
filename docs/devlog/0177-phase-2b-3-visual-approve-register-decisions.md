# Phase 2B-3 visual approve & register spec — boss decisions confirmed

日付: 2026-05-21

## 背景

handoff/0187 (devlog 0176) で起こした Phase 2B-3 visual approve & register bridge detail spec に対し、§12 で 8 件の open question (Q-2B3-1〜Q-2B3-8) を「Claude 推奨案」 として明示していた。boss が本日 8 件すべてに確定回答を出した → spec を「推奨」 から「CONFIRMED」 に書き換える docs-only microbatch。

implementation はまだ走らせない。本 batch の目的は「spec を最終形に固定」 して次の implementation batch に渡せる状態を作ること。

## 決定・変更

### Boss-confirmed answers (8 件)

| # | Topic | Confirmed answer |
|---|---|---|
| **Q-2B3-1** | server action 設計 | **Option D — HTTP bridge to running Visual Register CLI**。dashboard が `localhost:3334/api/inbox/approve-and-register` を fetch で call。Option A / B / C は不採用 |
| **Q-2B3-2** | Sanity reflect | 本 batch には **含めない**、Phase 2B-3.1 で別 batch (`tools/sanity/reflect-working-pipeline-visual-assets.mjs` pattern 踏襲) |
| **Q-2B3-3** | patch JSON generation | **`tools/visual-register/server.mjs` が owner**、dashboard 側で重複実装しない |
| **Q-2B3-4** | publish-package auto-trigger | **しない**、success result panel に command と clipboard copy button を表示するに留める |
| **Q-2B3-5** | rollback / undo | file operations に自動 undo を実装 **しない**。`<UndoToastHost>` は流用しない、preview + confirm modal + manual cleanup checklist で吸収 |
| **Q-2B3-6** | single vs multi-candidate | **1 candidate / 1 transaction** 維持。既 registered asset の overwrite は explicit checkbox で対応 |
| **Q-2B3-7** | Visual Register CLI auto-start | dashboard は CLI を spawn / auto-start **しない**。boss が `npm run visual:register` で手動起動 |
| **Q-2B3-8** | dry-run API on server.mjs | `tools/visual-register/server.mjs` には dry-run / preview endpoint を新規追加 **しない**。dashboard 側で path 計算 + 既存ファイル check を local に行う |

### 更新 (2 spec)

- `docs/specs/phase-2b-3-visual-approve-register.md`
  - Header の最終更新日 / ステータスを「**spec finalized**, ready for implementation batch」 に変更
  - §0 に「Phase 2B-3 batch (handoff/0188, 2026-05-21) — 8 Q boss confirmed」 ブロック追加 (8 Q を sentence form で再宣言)
  - §7-2 を「**CONFIRMED: Option D (HTTP bridge)** — Q-2B3-1 ✅ (2026-05-21)」 に書き換え、採用しない選択肢 (A / B / C) を明示的に reject reason 付きで documented
  - §9 heading を「**Undo / rollback — Q-2B3-5 CONFIRMED (2026-05-21)**」 に変更、`<UndoToastHost>` 不使用を明示
  - §12 Open questions table を **Confirmed questions table** に書き換え、各 row に boss-confirmed answer + spec への反映 §location
  - §15 Post-spec next step の Step 1 (boss が spec を read + judgement) を strikethrough + 「Done 2026-05-21 (handoff/0188)」
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 に **Phase 2B-3 batch (2026-05-21, handoff/0188)** 新セクション追加 (Phase 2B-1 batch の上、Phase 2B-2 batch の更に上)、Q-3 + Q-2B3-1〜Q-2B3-8 (合計 9 件) を sentence form で再宣言、Phase 2B-3 spec へ link
  - §0.5 Implementation status (2026-05-21) を update:
    - Phase 2B-1 + 2B-2 を ✅ 「implemented + smoke PASS」 として継続
    - Phase 2B-3 を 📐 「spec-finalized, implementation pending」 として追加
    - "Next P1 batch" の文言を「Phase 2B-3 implementation (spec-confirmed via handoff/0188, ready to start)」 に更新
  - §2 Phase 2B P1 の W1 entry を spec-finalized 状態に書き換え、HTTP bridge 採用 + 採用しなかった alternative 列挙 + Phase 2B-3 spec へ link

### 新規 docs (3)

- `docs/devlog/0177-phase-2b-3-visual-approve-register-decisions.md` (本ファイル)
- `docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md`
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ Option D (HTTP bridge) を正式 confirmed にしたか

Phase 2B-3 spec の §7-1 で 4 option を比較表で提示:
- **A (prepare command only)**: boss が手動 run、orchestrator としての価値が薄い
- **B (subprocess spawn)**: shell escaping / env injection / process lifecycle 管理 リスク
- **C (shared module extraction)**: `server.mjs` を share library に refactor、本 Phase で実装範囲が大きい
- **D (HTTP bridge to running CLI)**: 既存 server.mjs HTTP API を fetch で call、refactor 不要、subprocess なし

boss が D を選んだ理由 (推測 + spec の理由付け):
- `server.mjs` の HTTP API は **既に運用で 16+ asset の registration を成功させている** (battle-tested)
- Sanity 直接 write 不要 (本 batch では patch JSON 生成までで停止)
- attack surface 最小 (subprocess なし、shell なし、refactor なし)
- 「bridge first」 (Q-3) と完全に整合

「Q-2B3-1 で Option A / B / C を選ばなかった」 を spec § 7-2 に明示することで、将来 reader が「なぜ subprocess を spawn しないのか」「なぜ share library に extract しないのか」 と疑問に思った時の参照点になる。

### なぜ Sanity reflect を本 batch から除外したか (Q-2B3-2)

Phase 2B-3 で file pipeline + Sanity write を同時に扱うと:
- 実装規模が約 2 倍
- file copy 成功 / Sanity write 失敗 の partial commit シナリオが発生
- rollback の複雑度が増す (file 削除 + Sanity revert の二段)

boss decision: file pipeline bridge first、Sanity reflect は Phase 2B-3.1 で別 batch、既存 `reflect-working-pipeline-visual-assets.mjs` pattern を踏襲。

これにより:
- 本 batch は patch JSON 生成までで boss workflow が前進 (Sanity 反映は手動 `reflect-* --execute`)
- Phase 2B-3.1 で patch JSON を読み込んで Sanity に apply する独立 batch
- 各 batch が小さく安全、roll forward 可能

### なぜ undo を採用しなかったか (Q-2B3-5)

spec §9-1 の比較表:

| | Sanity field op (2B-1 / 2B-2) | file op (2B-3) |
|---|---|---|
| 元に戻し方 | 反対 patch 1 回 | file 削除 + JSON 削除 + manifest revert |
| Atomicity | server action 内 transactional | 3 file の逆方向 undo logic が複雑 |
| Race | `expectedRevision` で防御 | filesystem race (git ops, boss が file 開いてる, etc.) |

boss が「自動 undo は実装しない」 を採用した path:
- file op は reversible でない、`<UndoToastHost>` の 10秒 toast pattern は無理筋
- preview step + confirm modal + (overwrite 時) checkbox tick で誤操作を **commit 前に** 吸収
- 万一の rollback は manual cleanup (3 step) を success result panel + README に明示

これは Phase 2B-1 / 2B-2 の自動 undo pattern を「全 Phase 2B」 に適用するのではなく、**「reversible op に対してのみ自動 undo、irreversible op は preview で吸収」** という方針分離を確立する判断。

### なぜ Visual Register CLI auto-start を採用しなかったか (Q-2B3-7)

CLAUDE.md「明示的に依頼されるまで API 連携を追加しない」 と整合:
- dashboard が subprocess を spawn しない原則
- Visual Register CLI lifecycle は boss が管理 (`npm run visual:register`)
- dashboard は health check (`/api/health`) で起動状態を検知、起動していなければ `visual-register-not-running` error UI で起動指示

これにより:
- subprocess 関連 attack surface ゼロ
- boss が「いつ CLI を起動するか」 を制御
- 将来 CLI を別 port / 別 machine に移しても、health check が fail-fast するだけで dashboard は影響なし

### なぜ親 spec §0.5 を 5 区分構造に拡張したか

これまでの 4 区分 (Parent / 2B-1 / 2B-2 / Still open) に **Phase 2B-3 batch** を追加して 5 区分構造に:

1. Parent batch — Q-1 / Q-2 / Q-7
2. Phase 2B-1 batch — Q-6 / Q-8 / Q-10
3. **Phase 2B-3 batch — Q-3 / Q-2B3-1〜Q-2B3-8** (新規追加、配置順は spec finalize 順)
4. Phase 2B-2 batch — Q-2B2-1〜Q-2B2-7
5. Still open — Q-4 / Q-5 / Q-9

これで各 batch の confirmed decisions の起源を可視化、Phase 2B-3.1 / 2B-4 / W6 / W8 等の続きが続いても同 pattern で追加可能。

### Phase 2B-3 spec を「spec-finalized」 status に昇格

spec header + parent spec §0.5 + §2 の 3 か所で「spec-finalized, implementation pending」 を明示。これにより:
- spec の読み手が即座に「これは未実装 spec」 と理解できる
- Phase 2B-3 implementation batch が独立した行動として明確化
- 後で「W1 implementation 状況は?」 と聞かれた時に parent spec § 0.5 を見れば回答できる

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-3-visual-approve-register.md` (header + §0 + §7 + §9 + §12 + §15)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 Phase 2B-3 batch 新セクション + Implementation status update + §2 P1 W1 entry rewrite)
  - `docs/devlog/0177-...` + `docs/handoff/0188-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / assets / patches / publish-package / package.json: touch なし
- ワークフロー:
  - Phase 2B-3 spec が implementation-ready に固定
  - 次は Phase 2B-3 implementation batch (HTTP bridge 経由で `tools/visual-register/server.mjs` を call、新規 3-4 + 更新 4-5 ファイル)
- スキーマ: 不変
- プロダクト方針:
  - 「Sanity field op = 自動 undo」「file op = preview + confirm」 の方針分離が確立
  - Phase 2B 全体の architecture が 2-pattern (Sanity-direct write / CLI-bridge) で共存することが明確化
  - 「dashboard は orchestrator、CLI / Sanity が data ops の owner」 原則を Phase 2B-3 で文書化

## 次の一手

**Option A (推奨) — Phase 2B-3 implementation batch**

Spec が finalized なので、次は実装。`docs/specs/phase-2b-3-visual-approve-register.md` §13 + §11 に従い:

- **新規 (3-4)**:
  - `dashboard/src/lib/actions/approveVisualCandidate.ts` (`'use server'`、HTTP bridge to `localhost:3334`、9 step flow)
  - `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` (`'use client'`、preview button + confirm modal + result panel)
  - `dashboard/src/lib/visualAssets/bridgePaths.ts` (path allowlist + traversal reject + expected path 計算)
  - (optional) `dashboard/src/lib/visualAssets/visualRegisterClient.ts` (HTTP wrapper)
- **更新 (4-5)**:
  - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (action 統合 + writeReady + localFsReady)
  - `dashboard/src/components/visual-review/*` (selection state を action に渡す微修正)
  - `dashboard/README.md` (Phase 2B-3 row 追加 + 6+1 layer safety を documented)
- **受け入れ基準**: spec §11 の 12 項目すべて green
- 1 PR で完結 (Phase 2B-1 / 2B-2 implementation と同等規模)

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt) を先に挟む**

Phase 2B-3 implementation 前に boss が「gate に reviewer / notes も書きたい」 と感じれば 2B-2.1 を先に。

**Option C — Phase 2B-2 cleanup microbatch (handoff/0186 §8 言及の dead code 整理)**

amber「編集不可 (要 Studio 再保存)」 affordance + `[hrg:diag]` server log を削除する dead-code cleanup。harmless だが boss 好み次第。

発信ネタ案:
- 「Phase 2B-3 で `<UndoToastHost>` を流用しなかった決定の話 — reversible / irreversible op で undo 戦略を分離」
- 「Option D (HTTP bridge to running localhost CLI) は A / B / C どれでもない 4 つ目の正解だった」
- 「dashboard / CLI / Sanity の 3-layer architecture を 8 Q で詰めた経緯」
- 「`server.mjs` を refactor せず HTTP bridge で済ませた判断 — bridge first 原則の実装表現」
