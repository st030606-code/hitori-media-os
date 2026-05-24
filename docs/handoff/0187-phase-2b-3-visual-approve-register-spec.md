# Handoff: Phase 2B-3 visual approve & register bridge — detail spec

Date: 2026-05-21

## 1. Task Goal

Phase 2B P0 (W3 + W5) は handoff/0186 で boss smoke PASS 確定。次の strategic step は W1 visual approve & register。boss が Q-3 を本日「Visual Register CLI bridge first、dashboard 内 full reimplement はせず」 と確定 → **Phase 2B-3 implementation-ready detail spec を docs-only で起こす**。

implementation はまだ走らせない。boss が spec を read して Q-2B3-1〜Q-2B3-8 (8 件 open question) に judgement を付けるまでは Sanity / filesystem への書き込みは 1 行も実行しない。

## 2. Constraints Followed

- ✅ Docs only、dashboard runtime code 変更なし
- ✅ Server actions 未実装
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ assets コピーなし (本 batch では filesystem に何も書かない)
- ✅ assets/visuals 不変
- ✅ assets/inbox 不変
- ✅ patches 不変
- ✅ publish-package files 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ auto-post なし
- ✅ 「Inventing boss decisions」 しない (Q-2B3-1〜Q-2B3-8 は推奨案提示、boss 確定は別 batch)
- ✅ Phase 2B-1 / 2B-2 動作不変 (本 batch は touch なし)

## 3. Changed Files

### 新規 docs (4)

- [docs/specs/phase-2b-3-visual-approve-register.md](docs/specs/phase-2b-3-visual-approve-register.md) (16 セクション、約 25 KB)
- [docs/devlog/0176-phase-2b-3-visual-approve-register-spec.md](docs/devlog/0176-phase-2b-3-visual-approve-register-spec.md)
- [docs/handoff/0187-phase-2b-3-visual-approve-register-spec.md](docs/handoff/0187-phase-2b-3-visual-approve-register-spec.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 4. Summary of Changes

### 4-1. Spec structure (16 sections)

| § | Section | 主要内容 |
|---|---|---|
| 0 | Confirmed decisions | parent + 2B-1 + 2B-2 inherited、Q-3 ✅ confirmed (bridge first) |
| 1 | Product goal | dashboard = orchestrator、CLI = file pipeline owner |
| 2 | Bridge strategy | option A (bridge) 採用、option B (full reimplement) deferred |
| 3 | Data flow inventory | inbox / final / patch / manifest / Sanity / publish-package の全 layout |
| 4 | Target pages | edit surface = `/visual-assets/[assetId]/candidates` 単独 |
| 5 | Safety pattern | 6 + 1 layer (env flag x2 + input validation + path allowlist + traversal reject + dry-run preview) |
| 6 | Operation design | 7-step UX flow |
| 7 | **Server action design** | **option D (HTTP bridge to running CLI) を新規提案** |
| 8 | UI design | 4 affordance + confirm modal + success result panel |
| 9 | Undo / rollback | undo なし、preview + confirm が代替、manual cleanup checklist |
| 10 | Scope exclusions | 12 項目 |
| 11 | Acceptance criteria | 12-item smoke checklist |
| 12 | Open questions | 8 件 (Q-2B3-1〜Q-2B3-8) |
| 13 | Files likely affected | 新規 3-4 + 更新 4-5 |
| 14 | Environment variables | 新規 env var なし、既存 3 flag のうち 2 つ (write + localFs) を AND-gate |
| 15 | Post-spec next step | boss confirm → implementation → smoke → 2B-3.1 (Sanity reflect) |
| 16 | Phase 2B-1 / 2B-2 / 2B-3 対比表 | 1 表で全 batch を比較 |

### 4-2. Bridge strategy (§2)

**Option A 採用 (CLI bridge)** — boss confirmed via Q-3:

```
┌─ dashboard (Next.js, localhost:3000) ─────────────────┐
│  /visual-assets/[assetId]/candidates                  │
│    → ApproveCandidateAction (NEW)                     │
│       → server action approveVisualCandidate          │
│           → fetch POST localhost:3334/api/inbox/...   │
└────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─ tools/visual-register/server.mjs (CLI, :3334) ────────┐
│  POST /api/inbox/approve-and-register                  │
│    1. copy v00N.png → assets/visuals/...               │
│    2. write patches/visual-assets/.../*.json           │
│    3. update review-manifest.json                      │
│  (Sanity write はしない、directSanityWrite: false)      │
└────────────────────────────────────────────────────────┘
                   │
                   ▼  (deferred to Phase 2B-3.1)
       Sanity reflect via existing reflect-* CLI
```

### 4-3. Existing visual pipeline inventory (§3)

audit 結果サマリー (詳細は spec §3):

- **`tools/visual-register/server.mjs`**: HTTP server on `localhost:3334`、`/api/inbox/approve-and-register` が file copy + patch JSON 生成 + manifest update を transactional に実行。Sanity 直接 write は **しない** (`directSanityWrite: false` 契約)。
- **Filesystem layout**:
  - inbox: `assets/inbox/generated/<campaignSlug>/<assetSlug>/v00N.png` + `prompt.md` + `review.md` + parent `review-manifest.json`
  - final: `assets/visuals/<campaignSlug>/<platform>/<placement>/<assetName>.png`
  - patch: `patches/visual-assets/<campaignSlug>/<assetName>.json`
- **Sanity `visualAssetPlan` schema**: 41 field、status enum 10 値 (`planned` → `brief-ready` → ... → `saved` → ... → `archived`)、`localAssetPath` / `reviewNotes` / `status` の field が patch JSON で更新対象
- **Existing dashboard read API**: `/api/visual-review/{inbox, candidate-image, assets/[assetId]/candidates, review-manifest}` の 4 read-only routes、すべて `enableLocalFsRoutes` で gate
- **Reflect-style script**: `tools/sanity/reflect-working-pipeline-visual-assets.mjs` (9-record allowlist、recovery 専用、本 batch では reuse しない)
- **Dashboard pages 現状**: `/visual-assets` (list) / `/visual-assets/[assetId]` (detail) / `/visual-assets/[assetId]/candidates` (candidate focus) — すべて Visual Register への external link 経由で boss が手動 approve、`<DeferredActionButton>` placeholder が actions card に残る

### 4-4. Proposed operation design (§6)

7-step UX flow:

1. boss が `/visual-assets/[assetId]/candidates` を開く
2. `<ThumbStrip>` で v00N.png を選ぶ (既存 selection state)
3. 「採用する (Visual Register に登録)」 button を click
4. server action が `mode: 'preview'` で呼ばれる → preview confirm modal が planned paths + 既存ファイル warning を表示
5. boss が 「実行」 click (overwrite warning ある場合は checkbox tick が前提)
6. server action が `mode: 'execute'` で呼ばれる → server.mjs に POST → file ops が transactional に走る
7. result panel: `finalAssetPath` / `patchPath` / `manifestUpdated` 表示 + 「次のステップ」 hint (`reflect-working-pipeline-visual-assets.mjs --execute` / `npm run publish:package` の command と clipboard copy button)

### 4-5. Safety model (§5)

6 + 1 layer:

1. `enableWriteActions` env flag (Phase 2B 共通 master switch)
2. `enableLocalFsRoutes` env flag (**本 batch 必須**、filesystem ops を gate)
3. `SANITY_WRITE_TOKEN` (本 batch では **不要**、Sanity write が無いため)
4. Hard input validation (regex / length / mode enum)
5. Path allowlist (candidate は `assets/inbox/generated/` 配下、output は `assets/visuals/` + `patches/visual-assets/` 配下)
6. Traversal rejection (`..` / 絶対 path / URL encoded 攻撃すべて reject、`/api/asset-thumb` と同じ pattern)
7. **Dry-run preview** (server action は `mode: 'preview' | 'execute'` を受ける、preview で validate のみ commit しない)

Production deploy (Vercel) は `enableWriteActions === false` + `enableLocalFsRoutes === false` で fail-closed、`localhost:3334` 自体 reachable ではない。

### 4-6. Undo / rollback decision (§9)

**Undo は採用しない**。Phase 2B-1 / 2B-2 の 10秒 in-memory toast undo を本 batch には適用しない:

| | reactionNotes / gate state | visual approve & register |
|---|---|---|
| 操作内容 | Sanity 単一 field `set` | file copy + JSON write + manifest update |
| 元に戻す難易度 | 反対 patch 1 回 | 3 file op の逆方向 transaction |
| Atomicity | server action 内 transactional | server.mjs 内 transactional だが逆方向 undo logic が重い |
| 推奨 | 自動 undo OK | preview + confirm modal が安全 |

代わりに:
- **preview step** で planned paths + 既存ファイル warning を出す
- **confirm modal** で boss が二段階確認 (overwrite ある場合は checkbox tick 必須)
- **manual rollback** 手順を success result panel + README に documented (file 削除 + manifest revert の 3 step)

Phase 2B-3.1 で Sanity reflection を追加する際、必要なら別途 undo 戦略を再評価。

### 4-7. Open questions (§12)

8 件、推奨案明示:

| # | 質問 | 推奨案 |
|---|---|---|
| **Q-2B3-1** | Server action 設計: A / B / C のどれを採用 | **option D 新規提案** (HTTP bridge to running CLI) |
| **Q-2B3-2** | Sanity reflect を本 batch に含めるか | 別 batch (Phase 2B-3.1) |
| **Q-2B3-3** | patch JSON 生成を server.mjs に任せるか | server.mjs に任せる (重複実装ゼロ) |
| **Q-2B3-4** | publish-package distribute auto-trigger | しない、command 表示のみ |
| **Q-2B3-5** | rollback 戦略 | manual cleanup のみ、undo なし |
| **Q-2B3-6** | multi-candidate / 既 registered の扱い | 1 candidate / 1 transaction、overwrite は server.mjs flag で対応 |
| **Q-2B3-7** | Visual Register CLI 自動起動 | しない、boss が手動起動 |
| **Q-2B3-8** | server.mjs に dry-run / preview API 追加 | dashboard 側で preview 計算 (既存 endpoint で十分) |

### 4-8. Acceptance criteria (§11)

12 項目 smoke checklist:
1. Build green、23 routes
2. Default (writeReady=false or localFs=false): 完全 read-only
3. Enabled: 候補選択 → 「採用する」 → preview modal → 実行 → result panel
4. `assets/visuals/.../<asset>.png` の存在確認
5. `patches/visual-assets/.../<asset>.json` の shape 確認
6. `review-manifest.json` の更新確認
7. Overwrite path (既存 final asset 上書き)
8. Visual Register down (`:3334` 落ち) → `visual-register-not-running` error UI
9. Path traversal reject (`..` 等)
10. Phase 2B-1 reactionNotes 動作不変
11. Phase 2B-2 humanReviewGate state update 動作不変
12. Token leak audit (`VISUAL_REGISTER` literal は bundle に含まれない、`SANITY_WRITE_TOKEN` は使わない)

### 4-9. Files likely affected (§13)

**新規 (3-4)**:
- `dashboard/src/lib/actions/approveVisualCandidate.ts` (`'use server'`、HTTP bridge to `localhost:3334`、9 step flow)
- `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` (`'use client'`、preview button + confirm modal + result panel)
- `dashboard/src/lib/visualAssets/bridgePaths.ts` (path allowlist + traversal reject + expected path 計算)
- (optional) `dashboard/src/lib/visualAssets/visualRegisterClient.ts` (HTTP wrapper)

**更新 (4-5)**:
- `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (action 統合 + writeReady + localFsReady 評価)
- `dashboard/src/components/visual-review/*` (selection state を action に渡す微修正)
- `dashboard/src/lib/featureFlags.ts` (変更なし、既存 flag 再利用)
- `dashboard/src/components/common/UndoToastHost.tsx` (変更なし、本 batch では使わない)
- `dashboard/README.md` (Phase 2B-3 row 追加 + 6+1 layer safety を documented)

**触らない**:
- `tools/visual-register/*` (boss-controlled、refactor しない、本 batch の前提)
- `tools/publish-package-builder/*`
- `tools/sanity/reflect-*.mjs`
- `schemas/visualAssetPlan.ts`
- `assets/visuals/**` / `assets/inbox/generated/**` / `patches/visual-assets/**` (git commit しない、boss が CLI 経由で書く)
- `publish-package/**`
- `package.json` (root + dashboard、依存追加なし)
- Phase 2B-1 / 2B-2 既存 (`updateReactionNotes.ts` / `updateGateState.ts` / 関連 components)

### 4-10. Build NOT run

Docs-only batch のため build 不要。validation:
- `find -newer` で `dashboard/src` / `tools` / `schemas` / `assets` / `patches` / `publish-package` / `package.json` に diff 無いことを確認

### 4-11. Runtime behavior unchanged

確認項目:
- 23 routes 維持 (前 batch から変化なし)
- データ取得ロジック (GROQ queries) 不変
- feature flags 不変
- Phase 2B-1 reactionNotes / Phase 2B-2 humanReviewGate / Visual Register CLI / publish-package — touch なし
- Sanity への write は **依然 Phase 2B-1 reactionNotes + Phase 2B-2 humanReviewGate** の 2 surface のみ、本 batch で新 server action は **未実装**

## 5. Key Decisions

- **Bridge first (option A) 採用**: Visual Register CLI を file pipeline owner として維持、dashboard を orchestrator として動作させる小さい first step
- **Option D (HTTP bridge to running CLI) を server action 設計として新規提案**: option A の発展形、option B の subprocess リスクなし、option C の refactor 不要、既存 server.mjs の battle-tested logic を 100% 流用
- **Sanity reflect を本 batch から除外**: file pipeline + Sanity write を同 batch で扱うと complexity 倍、Phase 2B-3.1 で別 batch
- **Edit surface を `/visual-assets/[assetId]/candidates` 単独に絞る**: Phase 2B-2 で確立した「1 edit surface per write target」 原則を継続、list / detail page は read-only + CTA link 維持
- **`<DeferredActionButton>` を残す**: 既存 placeholder は手 touch なし、boss が将来 別 action を追加する path を残す
- **Undo を採用しない**: file op は reversible でない、preview + confirm modal が代替、Phase 2B-1 / 2B-2 と分離した方針
- **Confirm modal を必須 (terminal-only ではなく全 approve)**: file copy は元に戻せないため、二段階確認 + overwrite checkbox を boss UX に強制
- **`SANITY_WRITE_TOKEN` を本 batch では不要**: Sanity write がないため。Phase 2B-3.1 で token requirement を追加
- **Visual Register CLI 自動起動を採用しない**: dashboard が subprocess spawn しない原則 (CLAUDE.md)、boss が手動で `npm run visual:register` する workflow を尊重
- **Path allowlist + traversal reject を defense-in-depth で**: dashboard 側で path validate + server.mjs 側でも同じ check、DevTools tampering 防御
- **HTTP fetch target を `localhost:3334` hardcoded**: env override を dashboard 側で許可しない、attack surface 最小化
- **「badge ≠ trigger」 原則を Phase 2B 全体に拡張**: Phase 2B-2 smoke fix で確立した原則を本 batch UI 設計でも採用、`<StatusBadge>` は表示専用、action は青系 button のみ

## 6. Human Review Questions

### 主要 Q (boss confirmation 必要)

1. **Q-2B3-1**: server action 設計を option D (HTTP bridge to running CLI) で OK か? option A/B/C のどれかを優先したい場合は理由とともに教えてください
2. **Q-2B3-2**: 本 batch では Sanity reflect を含めず、Phase 2B-3.1 で別 batch にする path で OK か? 同 batch にまとめたい場合は spec / 実装規模が倍になる
3. **Q-2B3-4**: publish-package distribute auto-trigger は含めず、success panel で command 表示のみ — boss UX として OK か?
4. **Q-2B3-5**: undo を採用せず manual cleanup のみ — boss UX として OK か? 必要なら別案 (例: 「直近 1 件の approve をなかったことにする」 button) を spec に追加可能
5. **Q-2B3-7**: Visual Register CLI 自動起動は採用せず、boss が `npm run visual:register` で起動 — workflow として OK か?

### Spec 内容の review

6. spec §11 acceptance criteria 12 項目で boss smoke test として網羅できているか? 追加すべき項目あるか?
7. spec §6 7-step flow の UX 順序で OK か? (select → confirm → preview → modal → execute → result → next steps)
8. confirm modal の文言 (§8-2) で OK か? 別 wording 案あれば
9. success result panel の文言 (§8-3) + 「次のステップ」 hint で OK か?
10. Phase 2B-3 と Phase 2B-1 / 2B-2 の対比表 (§16) は将来 reader の理解に十分か?

### 実装後の検討事項 (実装後の Phase 2B-3.x 候補)

11. Phase 2B-3.1: Sanity reflect (本 batch の patch JSON を読んで Sanity に `set` する) を実装するか?
12. Phase 2B-3.2: publish-package distribute auto-trigger / batch approve / multi-asset の対応を実装するか?
13. Phase 2B-3.3: server.mjs の logic を share library に refactor (option C) して Next.js runtime 内で動かす path に進化するか?

## 7. Risks or Uncertainties

- **Visual Register CLI が動いていない状態の UX**: dashboard が `:3334` health check で fail-fast、起動指示を UI で出すが、boss が「いちいち別 tab で `npm run visual:register` するのが手間」 と感じる可能性。dashboard の topbar に「Visual Register: connected / disconnected」 のような status indicator を追加する microbatch 候補
- **server.mjs の transactional 性**: 本 audit では「file copy → patch JSON → manifest」 の write 順を確認したが、途中 fail の rollback logic を 100% 確認していない。万一の部分書き込みが残った場合は manual cleanup (§9-2)
- **path allowlist regex の網羅性**: spec §5-2 で regex を提示したが、Sanity ID format / file 名 format の edge case (例: 数字始まり / 連続 hyphen) を 100% カバーしていない可能性。実装時に boss と一緒に enum 化する余地
- **review-manifest.json の concurrent edit**: boss が CLI と dashboard を並行で使うと manifest が race する。`:3334` 上で transactional に書く前提だが、race window はゼロではない
- **dashboard build 時に visual-register URL 解決**: dashboard が production build される際 `http://localhost:3334` literal は build に inline されるが、production deploy では runtime で reach しないので fail-closed。Vercel 上で誤って読まれても error UI に出るだけ
- **spec / implementation の差**: spec で option D (HTTP bridge) を新規提案、boss が「やはり option A の prepare-only がいい」 と判断すれば spec を Q 確定 microbatch で書き換えた後 implementation
- **Phase 2B-3.1 (Sanity reflect) との結合度**: 本 batch で patch JSON が `set.status: "saved"` を含めて生成されるが、Phase 2B-3.1 でそれを Sanity に apply する batch を分離した結果、boss は「patch JSON を作っただけだが Sanity 反映してない」 と感じる中間状態が一時的に発生。これは intentional だが boss UX で明示が必要

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- boss が Q-2B3-1〜Q-2B3-8 (8 件) に confirmation → Q 確定 docs-only microbatch (Phase 2B-1 / 2B-2 で確立した pattern)
- 必要なら spec §6 / §8 の文言調整 microbatch

### 中期 (Phase 2B-3 implementation batch)

- spec §13 の新規 3-4 + 更新 4-5 ファイルを実装する batch
- 受け入れ基準 12 項目 smoke test

### 中期 (Phase 2B-3.1 Sanity reflect batch)

- 本 batch で生成された patch JSON を Sanity に apply する controlled write batch
- `tools/sanity/reflect-working-pipeline-visual-assets.mjs` の generalize、または新規 server action として実装

### 中期 (Phase 2B-3.2 advanced)

- publish-package distribute auto-trigger (Q-2B3-4)
- batch / multi-asset approve (Q-2B3-6)
- Visual Register CLI connection status indicator (topbar)

### 長期

- Phase 2B-3.3: option C (server.mjs を share library に refactor、Next.js runtime 内で動かす)
- audit-log schema (parent Q-4) 確定後の永続 audit

## 9. Next Recommended Step

**Boss が Phase 2B-3 spec を read + Q-2B3-1〜Q-2B3-8 (8 件) に judgement**

特に boss confirmation が必要な大物:
- **Q-2B3-1** (server action 設計): option D (HTTP bridge) で OK?
- **Q-2B3-2** (Sanity reflect): 本 batch では含めない、Phase 2B-3.1 で別 batch、で OK?
- **Q-2B3-5** (rollback): undo なし、preview + confirm + manual cleanup、で OK?

確定後 → Q 確定 microbatch (docs-only) で spec を「推奨」 → 「CONFIRMED」 書き換え → Phase 2B-3 implementation batch (HTTP bridge 経由で `tools/visual-register/server.mjs` を call、新規 3-4 ファイル + 更新 4-5 ファイル + 受け入れ 12 項目)。

---

### Exact prompt for next Claude Code session (Q 確定 microbatch)

```
Phase 2B-3 spec の boss 確定を反映する docs-only microbatch を実行してください。

入力:
- docs/specs/phase-2b-3-visual-approve-register.md (推奨案)
- boss の確定回答:
  - Q-2B3-1 = [option D / A / B / C のどれか + 理由]
  - Q-2B3-2 = [本 batch に含める / Phase 2B-3.1 で別 batch]
  - Q-2B3-3 = [server.mjs に任せる / dashboard で再実装]
  - Q-2B3-4 = [auto trigger / command 表示のみ]
  - Q-2B3-5 = [undo なし / 別案]
  - Q-2B3-6 = [1 candidate / multi-select OK]
  - Q-2B3-7 = [boss が手動起動 / dashboard が auto-start]
  - Q-2B3-8 = [dashboard で preview / server.mjs に dry-run API 追加]

タスク:
1. spec §12 を「CONFIRMED」 書き換え
2. spec §0 に Phase 2B-3 batch confirmed decisions ブロック追加
3. spec §7 / §9 / その他を boss 確定後の最終形に update
4. parent spec §0.5 にも Phase 2B-3 batch 確定を追記
5. devlog/0177 + handoff/0188 + latest.md mirror

constraints:
- docs only、runtime code 変更なし
- Sanity schema 不変
- publish-package / assets / patches / package.json 不変
- 「Inventing boss decisions」 しない
```

## 10. Validation

```
=== Docs-only check (expect empty) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0186-phase-2b-2-smoke-pass.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0186-phase-2b-2-smoke-pass.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Files added in this batch ===
docs/specs/phase-2b-3-visual-approve-register.md       (new spec, 16 sections, ~25KB)
docs/devlog/0176-phase-2b-3-visual-approve-register-spec.md
docs/handoff/0187-phase-2b-3-visual-approve-register-spec.md
docs/handoff/latest.md                                 (mirror)
```

Build skipped (docs-only). Runtime behavior unchanged: `/analytics` reactionNotes + `/human-review-gates` gate state update + `/campaigns/[slug]` read-only / Visual Register CLI / publish-package すべて preserved as-is.
