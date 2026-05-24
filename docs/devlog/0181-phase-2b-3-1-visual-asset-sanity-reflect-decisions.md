# Phase 2B-3.1 visual asset Sanity reflect spec — boss decisions confirmed

日付: 2026-05-21

## 背景

handoff/0191 (devlog 0180) で起こした Phase 2B-3.1 visual asset Sanity reflect spec に対し、 §12 で 7 件の open question (Q-2B3.1-1〜Q-2B3.1-7) を「Claude 推奨案」 として明示していた。 boss が本日 7 件すべてに確定回答を出した → spec を「推奨」 から「CONFIRMED」 に書き換える docs-only microbatch。

implementation はまだ走らせない。 本 batch の目的は「spec を最終形に固定」 して次の implementation batch に渡せる状態を作ること。

## 決定・変更

### Boss-confirmed answers (7 件)

| # | Topic | Confirmed answer |
|---|---|---|
| **Q-2B3.1-1** | Field allow-list | **厳密に 4 field** (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)。 他 `visualAssetPlan` field は patch しない |
| **Q-2B3.1-2** | Page placement | **Option C — 両 page** (`/visual-assets/[assetId]/candidates` + `/visual-assets/[assetId]`)。 同 server action を両 entry から call、 logic 重複なし |
| **Q-2B3.1-3** | Undo | **No undo**。 `<UndoToastHost>` 流用しない。 preview + confirm modal で吸収、 wrong patch は別 patch / Studio 手動 |
| **Q-2B3.1-4** | Already-reflected detection | **4 field 完全一致** で判定。 1 field でも異なれば「needs reflect」。 boss が「念のため再実行」 する path は残す (server log で `already-applied: true` emit) |
| **Q-2B3.1-5** | Single vs multi-asset | **1 asset / 1 transaction 厳守**。 multi-asset は Phase 2B-3.2 候補 |
| **Q-2B3.1-6** | Server action 実装方針 | **Dashboard server action として別実装**。 `reflect-*.mjs` CLI を直接 import / extract / 再利用しない。 ただし safety philosophy (allow-list / preview-before-execute / `expectedRevision` / post-write verification / no-create-missing-docs / no token in log) を mirror |
| **Q-2B3.1-7** | Missing target doc | **`not-found` reject + Studio guidance**。 dashboard が doc を新規作成しない、 UI で「Sanity Studio で先に visualAssetPlan を作成」 と誘導 |

### 更新 (2 spec)

- `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md`
  - Header: 最終更新日 + ステータスを「**spec finalized**, ready for implementation batch」 に変更
  - §0 末尾に「Phase 2B-3.1 batch (handoff/0192, 2026-05-21) — 7 Q boss confirmed」 ブロック追加 (Q-2B3.1-1〜Q-2B3.1-7 を sentence form で再宣言)
  - §3-2 を「**CONFIRMED: Option C (both pages)** — Q-2B3.1-2 ✅ (2026-05-21)」 に書き換え、 採用しなかった Option A / B を reject reason 付きで documented
  - §7 Undo / rollback heading に「Q-2B3.1-3 CONFIRMED」 注釈、 §7-2 を「CONFIRMED: No undo in Phase 2B-3.1」 に書き換え、 採用しなかった `<UndoToastHost>` 案を明示
  - §12 Open questions table → **Confirmed questions table** 全書き換え、 各 row に boss-confirmed answer + spec 反映 §location
  - §15 Post-spec next step の Step 1 を strikethrough + 「Done 2026-05-21 (handoff/0192)」
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 に **Phase 2B-3.1 batch (2026-05-21, handoff/0192)** 新セクション追加 (Phase 2B-3 batch の **上** に挿入 = boss confirm 順)、 Q-2B3.1-1〜Q-2B3.1-7 を sentence form で再宣言、 Phase 2B-3.1 spec へ link
  - §0.5 Implementation status の Phase 2B-3.1 行を「📐 spec finalized, implementation pending」 に update、 handoff/0191 + 0192 link 追加、 戦略 (server action 別実装) / Edit surface (両 page) / Field allow-list (4 field) / Undo (なし) を要約

### 新規 docs (3)

- `docs/devlog/0181-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md` (本ファイル)
- `docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md`
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ 4 field 厳守を選んだか

選択肢:
- A: 4 field 固定 (本確定)
- B: 拡張余地を残す (将来 Visual Register が他 field を生成し始める想定)
- C: patch JSON 全体を pass-through

A 採用理由:
- 現行 `tools/visual-register/server.mjs:handleInboxApproveAndRegister` が生成する patch JSON は 4 field のみ (実 patch 16+ 件 audit で確認)
- 将来 field が追加されたら spec / 実装 update する方が、 安全境界が明確
- patch JSON shape のドリフト検出 (Q-2B3.1-1 confirmed の allow-list が server で reject) が機能する

B / C は「未知 field を passthrough」 = unintended write の risk。 boss decision で reject。

### なぜ両 page を edit surface にしたか

Phase 2B-2 で確立した「edit surface 1 page」 原則の例外として認めた:
- candidates page: Phase 2B-3「採用」 直後の continuation flow (success panel 内に「Sanity に反映する」 button)
- detail page: 「採用したが Sanity 反映を忘れた asset」 を後から発見する flow

2 文脈は性質が違う (連続 vs 発見) ので 1 page に絞ると片方が missing する。 同 server action を両 entry から call することで logic 重複ゼロ、 UI duplication only。

### なぜ undo を採用しなかったか

Sanity field op として Phase 2B-1 / 2B-2 と性質が近いが、 本 batch は **file pipeline と密結合**:
- Phase 2B-3 で `assets/visuals/.../<asset>.png` + `patches/visual-assets/.../<asset>.json` + `review-manifest.json` が file system に書かれた状態
- 本 batch で Sanity に reflect
- もし Sanity だけ undo すると filesystem (final asset / patch JSON / manifest) は残ったまま → 状態乖離

→ preview + confirm modal で誤操作を commit 前に吸収する方が安全。 wrong patch を apply した場合は (a) 別 patch を生成して再 apply、 (b) Studio で手動編集、 (c) Phase 2B-3 で別 candidate を再 approve、 の 3 path で対応。

### なぜ 4 field 完全一致を already-reflected detection に

選択肢:
- `localAssetPath` のみ一致 → simple、 ただし `updatedAt` 等が異なる場合の見逃し
- `updatedAt` 比較 → race / timezone / format で false negative の risk
- **4 field 完全一致** (本確定) → precision 重視、 boss が「念のため再実行」 する path も残す

「需 reflect」 表示で boss が「reflect しなくていい」 と判断できる → UI で skip path がある。 一致しない場合は「needs reflect」、 boss が confirm modal で実行 / cancel を選ぶ。

### なぜ別実装 (server action) を選んだか

`tools/sanity/reflect-working-pipeline-visual-assets.mjs` を直接 import する path もあった:
- Pro: logic 重複なし、 既存 audit済 code を再利用
- Con: CLI script は 9-record hardcoded allowlist + Node.js subprocess 用設計、 server action 内で動かすには大量の refactor 必要、 race / lifecycle 違い

boss decision (separate implementation):
- dashboard server action は **patch JSON 1 件 / 1 doc** に絞った simple な実装に
- `reflect-*.mjs` CLI は recovery / batch 復旧用途として併存
- safety philosophy (allow-list / preview-before-execute / `expectedRevision` / post-write verification / no-create-missing-docs / no token in log) は mirror

これにより:
- 本 batch implementation が小さく安全
- 既存 reflect-* CLI は touch なし、 recovery script として継続有効
- Phase 2B-3.3 で Visual Register retirement する path との整合も保てる

### なぜ missing target doc を reject に

選択肢:
- A: dashboard で doc create
- B: `not-found` reject + Studio 誘導 (本確定)

A は scope creep:
- `client.createIfNotExists` を server action 内で扱う必要
- `visualAssetPlan` の必須 field を dashboard が自動生成する必要 (title / purpose / imagePrompt / 等)
- 「dashboard が Sanity doc を作る」 という新 capability が増える、 これは Phase 2B 全体の「既存 doc field を controlled write」 原則を超える

B 採用:
- boss workflow としては「Sanity Studio で先に visualAssetPlan を planning」 → Phase 2B-3 で採用 → Phase 2B-3.1 で reflect、 の flow が前提
- 既存 reflect-* CLI script も create 不可
- UI で「Sanity Studio で先に visualAssetPlan を作成してください」 と guidance を出すだけ

→ scope を保つ + boss workflow と整合。

### parent §0.5 を 6 区分構造に拡張

これまで 5 区分 (Parent / 2B-1 / 2B-3 / 2B-2 / Still open) に **Phase 2B-3.1 batch** を追加して 6 区分構造に。 配置は boss confirm 順 (Parent / 2B-1 / 2B-3.1 ← 新規 / 2B-3 / 2B-2 / Still open)。

「いつ何が確定したか」 を時系列で読みやすく、 後続 Phase 2B-3.2 / 2B-3.3 / W4-W8 でも同 pattern で追加可能。

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md` (header + §0 + §3-2 + §7 + §12 + §15)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 Phase 2B-3.1 batch 新セクション + Implementation status update)
  - `docs/devlog/0181-...` + `docs/handoff/0192-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - Phase 2B-3.1 spec が implementation-ready に固定
  - 次は Phase 2B-3.1 implementation batch (新規 2-3 + 更新 3-4 ファイル)
- スキーマ: 不変
- プロダクト方針:
  - 「Sanity field op = 自動 undo (2B-1 / 2B-2)」「file op = preview + confirm (2B-3)」「filesystem 密結合 Sanity op = preview + confirm (2B-3.1)」 の 3 pattern が明確化
  - patch JSON を source of truth として読み込む新 pattern が dashboard 内に確立
  - 「dashboard は既存 doc の field を controlled write」 原則を維持 (doc create はしない)

## 次の一手

**Option A (推奨) — Phase 2B-3.1 implementation batch**

Spec が finalized したので、 次は実装。 `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md` §11 + §10 に従い:

- 新規 (2-3):
  - `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` (`'use server'`、 9-10 step flow)
  - `dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx` (`'use client'`、 preview button + confirm modal + diff panel + result)
  - (optional) `dashboard/src/lib/visualAssets/patchPaths.ts` (path allowlist helper、 `bridgePaths.ts` と並列)
- 更新 (3-4):
  - `/visual-assets/[assetId]/candidates/page.tsx` (Phase 2B-3 success panel 内に統合)
  - `/visual-assets/[assetId]/page.tsx` (detail page に indicator + button 追加)
  - `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` (slot)
  - `dashboard/README.md` (Phase 2B-3.1 row + 7 layer safety + enablement で `SANITY_WRITE_TOKEN` 復活)
- 受け入れ基準: §10 の 14 項目すべて green
- 1 PR で完結

**Option B — Phase 2B-2 cleanup microbatch を先に挟む**

handoff/0186 §8 言及の dead code (amber「編集不可」 affordance + `[hrg:diag]` log) 整理。 urgent ではない。

**Option C — `<UndoToastHost>` AppShell 化** を先に進める

handoff/0179 §8 言及の long-term cleanup。 Phase 2B 全完了後の方が ROI が見えやすい。

発信ネタ案:
- 「4 field 厳守 + meta validation を field allow-list として spec で固定する効果 — patch JSON の安全境界を明確化」
- 「両 page edit surface の例外採用 — Phase 2B-2 で確立した「1 surface」 原則をいつ緩めるか」
- 「Sanity field op でも undo を採用しなかった判断 — filesystem との乖離 risk が決め手」
- 「dashboard server action と reflect-*.mjs CLI を共存させる responsibility split — recovery vs daily workflow」
