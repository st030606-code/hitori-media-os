# Phase 2B-3 visual approve & register bridge — implementation

日付: 2026-05-21

## 背景

handoff/0188 (devlog 0177) で Phase 2B-3 spec が boss confirmed (Q-3 + Q-2B3-1〜Q-2B3-8)。Q-2B3-1 で「Option D — HTTP bridge to running Visual Register CLI」 を採用、本 batch で実装。

dashboard は orchestrator として動作、`tools/visual-register/server.mjs` を file pipeline owner として維持する。dashboard 側は: candidate 選択 → preview → confirm modal → HTTP fetch to `localhost:3334/api/inbox/approve-and-register` → success result + next-step commands。 Sanity 直接 write はしない (Q-2B3-2 deferred to Phase 2B-3.1)。 file system からの直接書き込みもしない (server.mjs が owner)。

## 決定・変更

### 新規ファイル (3)

| File | 役割 |
|---|---|
| `dashboard/src/lib/visualAssets/bridgePaths.ts` | path validation (regex / absolute / traversal / URL-encoded reject)、preview path 計算 helper、`VISUAL_REGISTER_*` constants (hardcoded localhost:3334) |
| `dashboard/src/lib/actions/approveVisualCandidate.ts` | `'use server'` action、6-step flow (input validate → preview short-circuit / execute env-gate → CLI health check → POST to server.mjs → response map → logEvent stage)、metadata-only `[approveVisualCandidate:stage]` log |
| `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` | `'use client'` card、5 status states (idle / preview / executing / success / error)、preview confirm panel + overwrite checkbox + success panel with manual cleanup details + next-step CopyButton |

### 更新ファイル (3)

| File | 主要変更 |
|---|---|
| `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` | `Props.approveBridge` 追加 (assetId / slugs / paths / writeReady / localFsReady)、右カラムに `<ApproveCandidateAction>` 挿入 (selected candidate を thread)、ActionsCard の deferred「採用する」 行を削除 (実装済みのため)、ActionsCard 内 `visualRegisterLabel` を 「Visual Register で承認 (CLI 直接)」 に変更し 2B-3 と区別 |
| `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` | `enableWriteActions` import、`<CandidateFocusLayout>` に `approveBridge` prop を渡す (assetId / campaignSlug / assetSlug / plan.expectedLocalAssetPath / plan.localAssetPath / writeReady=enableWriteActions / localFsReady=enableLocalFsRoutes) |
| `dashboard/README.md` | Phase 2B write actions section に 2B-3 row 追加、enablement instructions に `ENABLE_LOCAL_FS_ROUTES` + CLI manual startup を追加、Safety layers section を「Common to 2B-1 / 2B-2」 + 「Phase 2B-3 additional layers (8 layer)」 に分割、Out of scope に Phase 2B-3.1 / 2B-3.2 / option B reject を明示 |

### 触らない (絶対)

- `tools/visual-register/server.mjs` (Q-2B3-3 + Q-2B3-8 confirmed)
- `schemas/` (Sanity schema 不変)
- `assets/visuals/` / `assets/inbox/` / `patches/` (file ops は server.mjs に委譲)
- `publish-package/` (Q-2B3-4 confirmed)
- `package.json` (root + dashboard、依存追加なし — `fetch` は Next.js runtime built-in)
- Phase 2B-1 / 2B-2 既存 runtime code (`updateReactionNotes.ts` / `updateGateState.ts` / `<UndoToastHost>` / `<ReactionNoteEditor>` / `<GateStateControl>` / `stateTransitions.ts` / `sanityWriteClient.ts` / `featureFlags.ts` body)

合計 **3 新規 + 3 更新 = 6 ファイル変更**。Sanity 書き込み 0、filesystem 書き込み 0、subprocess spawn 0、package 追加 0。

## 理由

### なぜ option D の "preview" は server.mjs を call しないか

spec §6-1 + §7-4 + Q-2B3-8 confirmed: dashboard は preview を **local に計算** する。

preview step で server.mjs にも call すれば、より正確な「final asset path」 が取れるが:
- server.mjs に dry-run / preview API を追加することは Q-2B3-8 で reject (server.mjs touch なし方針)
- preview で 2 round trip (preview + execute) は UX 遅延 / Visual Register が起動していないと preview の段階で fail する
- dashboard は `plan.localAssetPath` + `plan.expectedLocalAssetPath` という Sanity データを既に持っている → これで preview は十分

→ preview は local computation only、execute だけが HTTP call。 preview 結果は「予測」 と明示 (UI で「final (予測):」 label)。

### なぜ overwrite チェックを spec / 実装で 3 layer にしたか

1. **preview phase**: dashboard が `plan.localAssetPath` の有無を見て `overwriteLikely` flag を返す。 UI で warning + checkbox 表示
2. **execute phase request**: UI が `overwriteConfirmed: true/false` を送る
3. **server.mjs side**: server.mjs が真の filesystem を見て 409 + `overwriteRequired: true` を返す (boss が dashboard preview と異なる状態に気付かなかった場合の defense-in-depth)

3 layer のうち最後の server.mjs check が source of truth。 dashboard の preview hint は「便利機能」 であって安全装置ではない。

### なぜ undo を入れなかったか

handoff/0188 で boss confirmed (Q-2B3-5):
- file copy + patch JSON + manifest update の 3 op は Sanity field op (single `set`) と性質が違う
- 3 file の逆方向 transactional undo を 10秒以内に書くのは複雑
- preview + confirm modal で誤操作を commit 前に吸収する方が安全
- manual cleanup checklist を success panel + README に明示

→ `<UndoToastHost>` を本 batch では import せず流用しない。 Phase 2B-1 / 2B-2 の host は touch せず動作維持。

### なぜ `<ApproveCandidateAction>` を ActionsCard の **横** ではなく **上** に置いたか

ActionsCard は「再生成する」「保留する」 の 2 deferred placeholder が残る (Phase 2B-3.2+ で実装予定)。ApproveCandidateAction を上に置くことで:
- boss の視線が「採用 = primary action」 → 「他 (deferred) = secondary」 の自然な flow
- success / error panel が ActionsCard の下に出ると視線が分散
- ActionsCard 内の deferred「採用する」 を削除した結果、ActionsCard は「再生成 / 保留」 だけになり、`<ApproveCandidateAction>` が「採用」 を担当することで責任分離が明確

### なぜ writeReady で SANITY_WRITE_TOKEN を AND-gate しなかったか

Phase 2B-3 は **filesystem だけ書く** (Q-2B3-2 で Sanity reflect は deferred)。 SANITY_WRITE_TOKEN を求めると:
- 「Sanity 書き込まないのに token が必要」 という UX 違和感
- boss が「token 削除すれば Phase 2B-3 だけ disable できる」 と勘違いするリスク

→ writeReady = `enableWriteActions`、localFsReady = `enableLocalFsRoutes`、`SANITY_WRITE_TOKEN` は **本 batch では参照しない**。 page.tsx の `<CandidateFocusLayout>` props に渡すのは `enableWriteActions` の直値。

これは Phase 2B-1 / 2B-2 の `writeReady = enableWriteActions && Boolean(SANITY_WRITE_TOKEN)` とは別 logic。 トップバーの「ローカル書き込み有効」 indicator (AppShell で計算) は依然 SANITY_WRITE_TOKEN check 込み — つまり 2B-3 だけ有効化 (token なし + flag だけ on) すると、topbar は amber「読み取り専用」 だが Phase 2B-3 採用ボタンは active という状態が発生する。 これは Phase 2B-3.1 で Sanity reflect を追加するとき (token も必要に) に解消する。 本 batch では妥協と documented。

### Build / security validation

- `cd dashboard && npm run build`: 23 routes すべて green、TypeScript clean
- `npm run build` (Sanity Studio): clean
- `.next/static/` の token literal grep: 2 hits、いずれも env var **名** が i18n string で出るのみ (`SANITY_WRITE_TOKEN が設定されていません` / `SANITY_WRITE_TOKEN 設定時のみ`)、 token **値** は **0 hit**
- `child_process / spawn` grep in dashboard: 0 hits (comments only)
- `writeFile / copyFile / writeFileSync` grep in dashboard src/lib/actions / src/lib/visualAssets / src/components/visual-review: 0 hits (dashboard は file system に書かない設計)
- `tools/visual-register/`, `schemas/`, `publish-package/`, `assets/visuals/`, `assets/inbox/`, `patches/`, `package.json` (root + dashboard): すべて touch なし

## 影響

- リポジトリ:
  - dashboard runtime: 3 新規 + 3 更新 = 6 ファイル変更
  - docs: devlog 0178 + handoff 0189 + latest.md mirror
  - schemas / tools / publish-package / assets / patches / package.json: **touch なし**
- ワークフロー:
  - boss が `.env.local` に `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` を設定 + `npm run visual:register` で CLI 起動の 3 セットを揃える
  - `/visual-assets/[assetId]/candidates` で候補を選んで「採用する (Visual Register に登録)」 ボタンを押すと preview → 確認 modal → 実行 → success panel
  - 既存「Visual Register で承認 (CLI 直接)」 link は残してあるので、CLI に直接アクセスする path も維持
- スキーマ: 不変
- プロダクト方針:
  - dashboard で書き込み可能な surface が 3 件 (Phase 2B-1 + 2B-2 Sanity field write、Phase 2B-3 filesystem via CLI bridge) で安定
  - 「Sanity field op = `<UndoToastHost>` 自動 undo / file op = preview + confirm + manual cleanup」 の 2-pattern が actual code として実装された
  - Visual Register CLI は dashboard の dependency として明確化 (健康確認 + 手動起動 instruction)

## 次の一手

**Option A (推奨) — Boss manual smoke test on localhost**

handoff/0189 §10 の checklist に従い:
1. `.env.local` に `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` 設定 (SANITY_WRITE_TOKEN は本 batch では optional)
2. `npm run visual:register` で Visual Register CLI 起動 (`:3334` で listening 確認)
3. `cd dashboard && npm run dev`
4. `/visual-assets/[assetId]/candidates` を開く (例: `building-hitori-media-os` の `threads-support-diagram-v1` 候補ありの asset)
5. 候補画像を選択 → 右カラムに「採用 & 登録」 card + 「採用する」 button が表示されること
6. 「採用する」 click → preview confirm panel が出る (planned final / planned patch / 既存ファイル warning + checkbox)
7. 「実行」 click → success panel + `assets/visuals/.../<asset>.png` / `patches/visual-assets/.../<asset>.json` / manifest 確認
8. Visual Register CLI を kill → 「採用する」 click → preview は出る → 「実行」 で `visual-register-not-running` error
9. `ENABLE_LOCAL_FS_ROUTES=false` または `ENABLE_WRITE_ACTIONS=false` で再起動 → 「採用 不可」 pill が出る
10. `/analytics` reactionNotes + `/human-review-gates` state 編集が動作不変

問題があれば smoke fix microbatch (Phase 2B-1 / 2B-2 で 2-3 round 必要だった経緯を踏まえる)。

**Option B — Phase 2B-3.1 spec batch (Sanity reflect)**

smoke PASS したら、Sanity `visualAssetPlan.status: "saved"` を本 batch の patch JSON から apply する controlled write batch の spec を起こす (Q-2B3-2 で deferred)。

**Option C — Phase 2B-2.1 spec batch (reviewer / notes / completedAt 編集)**

Phase 2B-3 と並行 or 後に挟む。 boss が「state だけだと workflow が薄い」 と感じれば。

発信ネタ案:
- 「dashboard が filesystem を一切書かずに file pipeline を駆動する話 (Option D HTTP bridge)」
- 「`<UndoToastHost>` を Phase 2B-3 で意図的に使わなかった理由 — reversible / irreversible op で undo 戦略を分離する」
- 「Phase 2B-3 で `SANITY_WRITE_TOKEN` を AND-gate に入れなかった判断 — token は実際に Sanity write する batch でのみ required」
- 「Visual Register CLI を dashboard が依存するときの health check + boss-controlled startup pattern」
