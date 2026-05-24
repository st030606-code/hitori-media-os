# Handoff: Phase 2B-3 visual approve & register bridge — implementation

Date: 2026-05-21

## 1. Task Goal

handoff/0188 で Phase 2B-3 spec が finalized (Q-3 + Q-2B3-1〜Q-2B3-8 boss confirmed)。Option D (HTTP bridge to running Visual Register CLI) を採用、 本 batch で実装。

dashboard は orchestrator として動作: candidate 選択 → preview → confirm modal → HTTP fetch to `localhost:3334/api/inbox/approve-and-register` → success result + manual cleanup note。 `tools/visual-register/server.mjs` を file pipeline owner として維持し、 dashboard は filesystem に直接書き込まない。 Sanity 書き込みもしない (Phase 2B-3.1 で deferred、本 batch では patch JSON 生成までで止める)。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ `tools/visual-register/server.mjs` touch なし
- ✅ Sanity 書き込みなし
- ✅ assets/visuals 直接 write なし (dashboard コード内で `writeFile` / `copyFile` 0 件)
- ✅ assets/inbox 直接 write なし
- ✅ patches 直接 write なし
- ✅ publish-package 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし (依存追加なし、`fetch` は Next.js runtime built-in)
- ✅ 23 routes すべて intact
- ✅ Production writes 永久 disabled
- ✅ `SANITY_WRITE_TOKEN` 値は client bundle に出ない (env var **名** のみ i18n string に出現)
- ✅ prompt body / review body / token を log しない (server log metadata only)
- ✅ Phase 2B-1 reactionNotes 動作不変
- ✅ Phase 2B-2 humanReviewGate state update 動作不変
- ✅ `child_process` / `spawn` 等 dashboard コード内で 0 件
- ✅ `localhost:3334` URL は hardcoded、env override なし

## 3. Changed Files

### 新規 (3)

| File | 役割 |
|---|---|
| [dashboard/src/lib/visualAssets/bridgePaths.ts](dashboard/src/lib/visualAssets/bridgePaths.ts) | path validation (regex / absolute / traversal / URL-encoded reject)、preview path 計算、`VISUAL_REGISTER_*` constants (hardcoded `localhost:3334`)。NO filesystem touch、 NO Sanity touch、 NO HTTP call |
| [dashboard/src/lib/actions/approveVisualCandidate.ts](dashboard/src/lib/actions/approveVisualCandidate.ts) | `'use server'` action、 6 step flow、 mode='preview' は local 計算のみ・ mode='execute' で `localhost:3334/api/inbox/approve-and-register` を fetch、 metadata-only `[approveVisualCandidate:stage]` log、 token / 本文 出力なし |
| [dashboard/src/components/visual-review/ApproveCandidateAction.tsx](dashboard/src/components/visual-review/ApproveCandidateAction.tsx) | `'use client'` card、 5 status states (idle / preview / executing / success / error)、 preview confirm panel + overwrite checkbox + success panel with manual cleanup details + next-step CopyButton |

### 更新 (3)

| File | 変更内容 |
|---|---|
| [dashboard/src/components/visual-review/CandidateFocusLayout.tsx](dashboard/src/components/visual-review/CandidateFocusLayout.tsx) | `Props.approveBridge` 追加 (assetId / slugs / paths / writeReady / localFsReady)、 右カラムに `<ApproveCandidateAction>` を `<NotesCard>` の下 + `<ActionsCard>` の上に挿入、 selected candidate を thread、 ActionsCard の deferred「採用する」 行を削除、 ActionsCard 内 `visualRegisterLabel` を 「Visual Register で承認 (CLI 直接)」 に変更し 2B-3 と区別 |
| [dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx](dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx) | `enableWriteActions` import、 `<CandidateFocusLayout>` に `approveBridge` prop を渡す。 `writeReady = enableWriteActions` (SANITY_WRITE_TOKEN は本 batch では不要、 Sanity write 無いため)、 `localFsReady = enableLocalFsRoutes` |
| [dashboard/README.md](dashboard/README.md) | Phase 2B write actions 表に 2B-3 row 追加 (Mutation 列を新設)、 enablement instructions に `ENABLE_LOCAL_FS_ROUTES` + Visual Register CLI manual startup を追加、 Safety layers section を「Common to 2B-1 / 2B-2」 + 「Phase 2B-3 additional layers (8 layer)」 に分割、 Out of scope に Phase 2B-3.1 / 2B-3.2 / option B reject を明示、 Feature flags table の `ENABLE_WRITE_ACTIONS` 行を 3 batch をカバーする説明に更新 |

### 削除 (0)

### 触らない (絶対 — Q-2B3 confirmations)

- `tools/visual-register/server.mjs` (Q-2B3-3 + Q-2B3-8 confirmed)
- 他 `tools/`
- `schemas/`
- `assets/visuals/` / `assets/inbox/` / `patches/` (dashboard コード内で write op 0 件)
- `publish-package/`
- `package.json` (root + dashboard、依存追加なし)
- Phase 2B-1 / 2B-2 既存 runtime: `updateReactionNotes.ts` / `updateGateState.ts` / `sanityWriteClient.ts` / `featureFlags.ts` body / `<UndoToastHost>` / `<ReactionNoteEditor>` / `<GateStateControl>` / `stateTransitions.ts`

合計 **3 新規 + 3 更新 = 6 ファイル変更**。 Sanity 書き込み 0、 filesystem 書き込み 0 (dashboard 側で)、 subprocess spawn 0、 package 追加 0。

## 4. Summary of Changes

### 4-1. Files changed (詳細)

§3 参照。

### 4-2. Bridge path safety behavior (`bridgePaths.ts`)

- **Allowed extensions**: `.png` / `.jpg` / `.jpeg` / `.webp`
- **Regex validation**:
  - `assetId`: `/^visualAssetPlan\.[a-z0-9][a-z0-9._-]{0,200}$/i`
  - `campaignSlug` / `assetSlug`: `/^[a-z0-9][a-z0-9-]{0,80}$/i`
  - `candidateFile`: `/^v\d{1,4}\.(png|jpg|jpeg|webp)$/i`
- **Rejected paths**:
  - empty values
  - absolute (`/...`, `\...`, `C:\...`)
  - URL-encoded traversal (`%2e%2e`, `%2f`, `%5c`)
  - `..` or `.` segments
  - paths outside `assets/inbox/generated/`
  - shape mismatch (path !== `assets/inbox/generated/<campaignSlug>/<assetSlug>/<candidateFile>`)
- **Preview computation (local only, no HTTP / FS)**:
  - `plannedFinalAssetPath`: `plan.localAssetPath` (overwrite case) → `plan.expectedLocalAssetPath` (first registration case) → `null` (server.mjs が決定)
  - `plannedPatchPath`: `patches/visual-assets/<campaignSlug>/<assetSlug>.json` (server.mjs と同じ shape)
  - `overwriteLikely`: `plan.localAssetPath` non-empty なら true (UI で warning + checkbox)
- **`VISUAL_REGISTER_*` constants hardcoded**:
  - `VISUAL_REGISTER_BASE_URL = 'http://localhost:3334'`
  - `VISUAL_REGISTER_APPROVE_ENDPOINT = '...approve-and-register'`
  - `VISUAL_REGISTER_HEALTH_ENDPOINT = '...health'`
  - env override 不可、 production deploy では reachable でない

### 4-3. Server action behavior (`approveVisualCandidate.ts`)

**Input**:
```ts
{
  assetId: string                     // 'visualAssetPlan.<slug>.<asset>'
  campaignSlug: string
  assetSlug: string
  candidateFile: string                // 'v003.png'
  candidateRelativePath: string         // 'assets/inbox/generated/...'
  expectedLocalAssetPath?: string | null
  currentLocalAssetPath?: string | null
  overwriteConfirmed?: boolean          // execute only
  mode: 'preview' | 'execute'
}
```

**Flow**:
1. **Input validation**: `validateApproveInput` (4-2 の全規則)
2. **Preview computation**: `buildBridgePreview` (mode='preview' でここで short-circuit、 mode='execute' でも reuse)
3. **mode='preview'**: preview return、 server.mjs に call **しない**
4. **Execute-only env gates**:
   - `enableWriteActions === false` → `write-disabled`
   - `enableLocalFsRoutes === false` → `localfs-disabled`
5. **Health check**: `GET localhost:3334/api/health`、 3 秒 timeout、 fail で `visual-register-not-running`
6. **Bridge POST**: `localhost:3334/api/inbox/approve-and-register` with body `{relativePath, visualAssetPlanId, overwriteConfirmed}`、 20 秒 timeout
7. **Response mapping**:
   - 409 + `code: 'asset_exists'` + `overwriteRequired: true` → `overwrite-required` error + `existingLocalAssetPath` echo
   - 404 + error 文に `plan` 含む → `plan-not-found`、 そうでなければ `candidate-not-found`
   - 401 / 403 → `permission`
   - 200 + `ok: true` → success
   - その他 → `unknown`
8. **Success return**: `{ok: true, mode: 'execute', finalAssetPath, patchPath, manifestUpdated, committedAtIso, visualRegisterPatchEcho, nextStepsHint}`

**Server log (`[approveVisualCandidate:stage]`)**:
- stage: `start`, `rejected`, `preview-ok`, `execute-ok`, `error`, `overwrite-required`, `permission`
- emit: `mode`, `assetId`, `candidateFile`, `httpStatus`, `elapsedMs`, `finalAssetSet` / `patchPathSet` (boolean), `overwriteLikely` (preview only)
- **never log**: token, prompt body, review body, image bytes, response raw payload, file contents

### 4-4. UI behavior (`ApproveCandidateAction.tsx`)

**4 affordance branches**:

```
disabled (writeReady=false OR localFsReady=false OR no candidate):
  → 「採用 不可」 slate pill + reason text

idle (writeReady + localFsReady + candidate selected):
  → 選択中: <候補ファイル> の readout
  → blue 「採用する (Visual Register に登録)」 button

preview (after button click):
  → grid panel: Asset / Campaign / 候補 / source path / final (予測) / patch path
  → if overwriteLikely: amber checkbox 「既存ファイルを上書きする」 (実行 button blocked until checked)
  → footer: 「キャンセル」 + 「実行」 buttons

executing (after 「実行」 click):
  → blue button with spinner 「Visual Register に登録中…」
  → disabled

success (after server.mjs 200):
  → emerald panel ✓「Visual Register に登録しました。」
  → grid: 登録時刻 / final / patch / manifest / 候補
  → 「次のステップ」 ordered list:
      1. Sanity reflect (Phase 2B-3.1 で自動化予定) + CopyButton
      2. publish-package distribute + CopyButton
  → details (default closed) 「※ 元に戻したい場合 (manual cleanup)」 with 3 step list
  → footer: Visual Register 外部 link + 閉じる

error (any failure):
  → rose panel with message + retry-as-overwrite button (only if isOverwriteRequired) + 閉じる
```

**No `<UndoToastHost>` usage** (Q-2B3-5 confirmed: undo not applicable to file operations).

### 4-5. Candidates page integration

- `enableWriteActions` import 追加
- `<CandidateFocusLayout>` に `approveBridge` prop を渡す
- `writeReady = enableWriteActions` (NO SANITY_WRITE_TOKEN check、本 batch は Sanity write 無いため)
- `localFsReady = enableLocalFsRoutes`
- `expectedLocalAssetPath = plan?.expectedLocalAssetPath ?? null`
- `currentLocalAssetPath = plan?.localAssetPath ?? null`
- 他 page section (PageHeader / breadcrumbs / 既存 Visual Register external link / LocalModeBanner / EmptyCard) すべて変更なし

`CandidateFocusLayout` 内では:
- selected candidate を `<ApproveCandidateAction>` に `{id, fileName, relativePath}` で渡す
- `<ActionsCard>` の deferred placeholders から「採用する」 を削除 (実装済み)、 残り「再生成する」 / 「保留する」 のみ deferred
- `<ApproveCandidateAction>` を `<NotesCard>` と `<ActionsCard>` の間に挿入 (右カラムの primary action 位置)

### 4-6. Visual Register server interaction

**Request**: HTTP only、 hardcoded `localhost:3334`、 JSON body
```json
{
  "relativePath": "assets/inbox/generated/<slug>/<asset>/v003.png",
  "visualAssetPlanId": "visualAssetPlan.<slug>.<asset>",
  "overwriteConfirmed": true | false
}
```

**Response (server.mjs `handleInboxApproveAndRegister`)**:
- 200 OK: `{ok: true, visualAssetPlanId, inboxSource, localAssetPath, patchPath, patch}`
- 400: missing fields
- 404: candidate not found OR plan not found
- 409 + `code: 'asset_exists'` + `overwriteRequired: true` + `localAssetPath`: overwrite needed

**Health check**: `GET localhost:3334/api/health`、 3秒 timeout。 fail → UI shows 「Visual Register が起動していません。 `npm run visual:register` で起動してから再実行してください。」

**No subprocess spawn**: dashboard は `child_process` を使わない、 boss が手動で `npm run visual:register` する workflow を尊重 (Q-2B3-7 confirmed)。

### 4-7. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1470ms
  Finished TypeScript clean
✓ Generating static pages using 13 workers (3/3) in 64ms
Routes: 18 page routes + 5 API routes = 23 total (unchanged)

$ npm run build (root, Studio)
✔ Build Sanity Studio (10360ms)
```

### 4-8. Security checks

**`.next/static/chunks/*.js` token audit**:
```
$ grep -ho "SANITY_WRITE_TOKEN[^\"']*[\"']" .next/static/chunks/*.js | sort -u
SANITY_WRITE_TOKEN が設定されていません"
SANITY_WRITE_TOKEN 設定時のみ"
```
2 unique strings, both are env var **NAME** in i18n error text. **Zero hits of token VALUE**.

**`child_process` / `spawn` check** (dashboard):
```
$ grep -rn "child_process\|spawn\|execFileSync\|execSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
src/lib/actions/approveVisualCandidate.ts:19://   - Option D (HTTP bridge) only — no subprocess spawn, no shared module
src/lib/visualAssets/bridgePaths.ts:24:// HTTP only, never via spawn / shell. The endpoint URL is hardcoded —
```
2 matches, both are **comments** describing what is NOT used. No actual subprocess usage.

**Filesystem write check** (dashboard):
```
$ grep -rn "writeFile\|copyFile\|writeFileSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(empty)
```
**Zero matches**. Dashboard never writes to `assets/visuals` / `patches` / etc. Visual Register server.mjs owns all file mutations.

**Visual Register endpoint review**: hardcoded `http://localhost:3334`, no env override, only used by:
- `bridgePaths.ts` (constant export)
- `approveVisualCandidate.ts` (health + approve fetch)
- existing pages with **external link** href (read-only static URL)

**Constraint paths check**:
- `tools/`, `schemas/`, `publish-package/`, `assets/visuals/`, `assets/inbox/`, `patches/`, `package.json`: **all empty** under `find -newer 0188`

### 4-9. Manual smoke checklist (for boss)

1. `.env.local` に `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` を設定 (SANITY_WRITE_TOKEN は本 batch では optional)
2. `npm run visual:register` で Visual Register CLI 起動 (`localhost:3334` で listening 確認)
3. `cd dashboard && npm run dev`
4. `/visual-assets` を開く → asset list が出る (Topbar が「ローカル書き込み有効」 と出ない可能性あり: SANITY_WRITE_TOKEN を入れていない場合は amber、 これは intentional 妥協、 §6 Q.4)
5. asset の候補ありエントリ (例: building-hitori-media-os の threads-support-diagram-v1) で詳細 → 「候補比較」 link
6. `/visual-assets/[assetId]/candidates` で:
   - 「採用 & 登録」 card が右カラム上部に表示
   - 候補 v00N を選ぶ (デフォルト v001 が selected)
   - blue 「採用する (Visual Register に登録)」 button が表示
7. button click → preview panel が:
   - Asset / Campaign / 候補 / source path / planned final / planned patch を表示
   - 既に `plan.localAssetPath` がある asset なら amber 上書き warning + checkbox
8. 「実行」 click (overwrite checkbox tick が必要なら先に check)
9. success panel が:
   - 登録時刻 / final / patch / manifest 表示
   - 次のステップ command 2 件 + CopyButton
   - details で manual cleanup checklist
10. ファイルシステム確認:
    - `assets/visuals/<slug>/<platform>/<placement>/<asset>.png` が新規 or 更新
    - `patches/visual-assets/<slug>/<asset>.json` が新規 or 更新
    - `assets/inbox/generated/<slug>/review-manifest.json` の該当 candidate が `reviewStatus: 'registered'`
11. server console (dev terminal) に `[approveVisualCandidate:execute-ok]` log が 1 行 — `token` / 本文 / image bytes は出ていないことを目視
12. Visual Register CLI を kill → 同 asset で再 「採用する」 → preview は出るが 「実行」 で 「Visual Register が起動していません」 error UI
13. `ENABLE_WRITE_ACTIONS=false` で再起動 → 候補比較 page で「採用 不可 / ENABLE_WRITE_ACTIONS が off」 pill 表示
14. `ENABLE_LOCAL_FS_ROUTES=false` で再起動 → 「ローカル候補プレビューは開発環境でのみ利用できます」 empty state (既存挙動) → そもそも候補 page に到達しない
15. 並行で `/analytics` reactionNotes 編集が動作 (regression check)
16. 並行で `/human-review-gates` で 「状態を変更」 dropdown が動作 (regression check)

## 5. Key Decisions

- **Option D HTTP bridge (Q-2B3-1 confirmed)**: dashboard が `localhost:3334/api/inbox/approve-and-register` を fetch で call、 subprocess spawn なし、 share library extraction なし、 server.mjs touch なし
- **`writeReady = enableWriteActions` (SANITY_WRITE_TOKEN AND-gate なし)**: Phase 2B-3 は Sanity write 無いため、 token 要求は不要。 Phase 2B-1 / 2B-2 の writeReady logic (token AND-gate) とは別 expression
- **Preview は server.mjs を call せず local 計算**: Q-2B3-8 confirmed、 server.mjs に新 API 追加しない、 dashboard が持つ Sanity 由来データ (`plan.localAssetPath` / `plan.expectedLocalAssetPath`) で十分 hint を出せる
- **Overwrite check を 3 layer に**: UI preview hint (`overwriteLikely`) → UI checkbox guard → server.mjs filesystem actual check (409 + overwriteRequired)、 server.mjs が source of truth
- **`<UndoToastHost>` を本 batch で流用しない (Q-2B3-5 confirmed)**: file op は reversible でない、 preview + confirm が代替、 manual cleanup を success panel に明示
- **「採用する」 を deferred から削除、 「再生成する」 / 「保留する」 は残す**: ActionsCard の deferred placeholders を 1 件減らし、 `<ApproveCandidateAction>` が責任を担当
- **`visualRegisterLabel` を「Visual Register で承認 (CLI 直接)」 に rename**: ActionsCard の external link と 「採用する」 button (HTTP bridge 経由) を boss が区別できるよう label を改善
- **`<ApproveCandidateAction>` を `<NotesCard>` の下 + `<ActionsCard>` の上に**: 視線 flow を「primary action → deferred secondary」 に揃える
- **Hardcoded `localhost:3334`、 env override 不可**: attack surface 最小、 boss-controlled なら CLI 設定を override しないという原則
- **20 秒 fetch timeout (execute) / 3 秒 fetch timeout (health)**: server.mjs が ready なら 20 秒で十分、 health check は迅速に fail させる
- **server.mjs response shape を defensive narrow**: `parsed as any` ではなく field-by-field type guard、 minor version 変更に強い

## 6. Human Review Questions

### Smoke test (boss が dev server 起動で確認)

1. 「採用 & 登録」 card の位置 (右カラム、 `<NotesCard>` の下 + `<ActionsCard>` の上) で OK?
2. blue button label 「採用する (Visual Register に登録)」 で OK? もっと短い「採用する」 vs もっと正確「Visual Register に登録」 の選択肢あり
3. preview panel の grid 表示 (Asset / Campaign / 候補 / source / final (予測) / patch) で OK?
4. success panel の「次のステップ」 部分: command + CopyButton の組み合わせで OK?
5. manual cleanup details の文言で OK?
6. 「Visual Register が起動していません」 error UI の文言で OK?

### 設計判断 review

7. `writeReady = enableWriteActions` (SANITY_WRITE_TOKEN AND-gate なし) で OK?
   - 妥協: topbar pill は SANITY_WRITE_TOKEN 込みで判定 → 2B-3 だけ enable 状態のとき topbar は amber「読み取り専用」 だが Phase 2B-3 採用ボタンは active
   - 代替: `writeReady = enableWriteActions && Boolean(SANITY_WRITE_TOKEN)` にして topbar と整合させる
   - 代替の影響: Phase 2B-3 試したい boss が SANITY_WRITE_TOKEN を要求される (Sanity write しないのに)、 UX 違和感
   - boss 好み次第
8. ActionsCard の 「Visual Register で承認 (CLI 直接)」 label rename で OK? `(CLI 直接)` の括弧表現で大丈夫?
9. Phase 2B-3.1 (Sanity reflect) の方針: `tools/sanity/reflect-working-pipeline-visual-assets.mjs` の generalize で OK? それとも別 server action 経由?

### 実装後の判断

10. Phase 2B-2 missing-data affordance / `[hrg:diag]` log の cleanup を Phase 2B-3.1 前に挟むか後にするか
11. Phase 2B-2.1 (reviewer / notes / completedAt) を Phase 2B-3.1 と並行 or 順番 どちらで?

## 7. Risks or Uncertainties

- **Smoke test 未実施 (Claude 側)**: build green のみ。 boss 手元で実 write が初発火。 失敗時の挙動 (overwrite path / Visual Register response shape edge case / Sanity client transaction return) は実機 verify 必要
- **`writeReady` の SANITY_WRITE_TOKEN inconsistency**: 上記 6.7 で documented、 boss decision 待ち
- **Visual Register response shape narrowing**: `server.mjs` の 200 response は `{ok: true, visualAssetPlanId, inboxSource, localAssetPath, patchPath, patch}` だが、 minor version で field が変わる可能性 → defensive `typeof === 'string'` guard で扱う
- **Concurrent edit race**: boss が `localhost:3334` Visual Register UI と dashboard を並行で使うと manifest が race する可能性。 server.mjs 側で transactional に書く前提だが race window はゼロではない
- **Health check が `:3334` の別 process を誤認識する可能性**: boss が誤って他 service を `:3334` で listen させると health check が `200 OK` を返してしまう。 通常 dev workflow で発生しないが edge case
- **`fetch` timeout の妥当性**: 20 秒 timeout は server.mjs の典型処理時間 (file copy + JSON write + manifest update) より十分長いが、 大きい画像 / slow disk で長引く可能性
- **CLI が他 port で動いている**: boss が `VISUAL_REGISTER_PORT` env で別 port に設定していると dashboard と接続できない。 これは boss-controlled 設定変更 → boss が自分で気付くべき config drift
- **AppShell の topbar pill UX**: 上記 6.7 と同じ妥協、 boss が「topbar 表示が正しくない」 と感じれば smoke fix microbatch

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Smoke test 結果反映**: 文言調整 / layout 微修正があれば 1-2 microbatch
- **`writeReady` AND-gate を SANITY_WRITE_TOKEN 込みに変更** (boss が topbar 整合性を選んだ場合、 6.7)
- Phase 2B-2 cleanup microbatch (handoff/0186 §8 言及の dead code — amber affordance / `[hrg:diag]` log の削除)

### 中期 (Phase 2B-3.1)

- Sanity `visualAssetPlan.status: "saved"` reflection
- 本 batch の patch JSON を読んで Sanity に apply する controlled write batch
- `tools/sanity/reflect-working-pipeline-visual-assets.mjs` の generalize、 または新規 server action として実装
- このタイミングで `writeReady` に SANITY_WRITE_TOKEN AND-gate を再導入

### 中期 (Phase 2B-2.1)

- `reviewer` / `notes` / `completedAt` 編集対応
- `done` 遷移時の `completedAt` 自動 patch

### 中期 (Phase 2B-3.2)

- publish-package distribute auto-trigger
- batch / multi-asset approve
- Visual Register CLI connection status indicator (topbar)

### 長期

- **Phase 2B-3.3**: option C への進化 (server.mjs を share library に refactor、 Next.js runtime 内で動かす)
- AppShell-level `<UndoToastHost>` lift
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)

## 9. Next Recommended Step

**Phase 2B-3 manual smoke test on localhost** (§4-9 の 16 step)

特に重要:
1. preview → confirm → execute の full flow
2. Visual Register CLI 起動 / 停止での fail-closed 動作
3. overwrite path (既存 final asset の上書き)
4. server console log が token / 本文 を出していないこと
5. Phase 2B-1 reactionNotes + Phase 2B-2 humanReviewGate の regression check

問題なければ次:
- **Option A**: Phase 2B-3.1 spec batch (Sanity reflect、 Q-2B3-2 で deferred)
- **Option B**: Phase 2B-2.1 spec batch (reviewer / notes / completedAt 編集)
- **Option C**: smoke fix microbatch (UX 改善があれば)

---

### Exact prompt for next Claude Code session (Phase 2B-3 smoke fix microbatch、 もし UX 調整が必要なら)

```
Phase 2B-3 smoke fix microbatch を実行してください。

入力:
- docs/specs/phase-2b-3-visual-approve-register.md (finalized + smoke-tested)
- docs/handoff/0189-phase-2b-3-visual-approve-register-implementation.md (本 batch)
- boss の smoke test 結果: [boss が記述]

タスク:
1. issue 修正 (UX / copy / layout のみ、 scope 拡張なし)
2. 必要なら writeReady に SANITY_WRITE_TOKEN AND-gate を再導入 (boss decision に基づく)
3. devlog + handoff + latest.md mirror

constraints:
- tools/visual-register/* 触らない
- Sanity schema 不変
- assets/visuals / assets/inbox / patches / publish-package 不変
- subprocess spawn なし、 hardcoded localhost:3334 維持
- token / 本文 を log しない
```

## 10. Validation

```
=== Build (both) ===
$ cd dashboard && npm run build
✓ 23 routes green、 TypeScript clean
$ npm run build (root, Studio)
✔ Sanity Studio (10360ms)

=== Token leak audit ===
$ grep -ho "SANITY_WRITE_TOKEN[^\"']*[\"']" .next/static/chunks/*.js | sort -u
SANITY_WRITE_TOKEN が設定されていません"
SANITY_WRITE_TOKEN 設定時のみ"
(env var NAME only in i18n strings, zero VALUE leakage)

=== Subprocess / spawn check ===
$ grep -rn "child_process\|spawn\|execFileSync\|execSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(only comments documenting "no spawn" pattern)

=== Filesystem write check ===
$ grep -rn "writeFile\|copyFile\|writeFileSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(empty — dashboard never writes filesystem)

=== Constraint paths untouched (expect empty) ===
$ find tools schemas publish-package assets/visuals assets/inbox patches \
    -type f -newer docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0188-phase-2b-3-visual-approve-register-decisions.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Files added in this batch ===
dashboard/src/lib/visualAssets/bridgePaths.ts          (new, path safety + preview)
dashboard/src/lib/actions/approveVisualCandidate.ts    (new, 'use server' bridge)
dashboard/src/components/visual-review/ApproveCandidateAction.tsx (new, client UI)
dashboard/src/components/visual-review/CandidateFocusLayout.tsx (updated, action slot)
dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx (updated, props thread)
dashboard/README.md                                    (updated, 2B-3 section)
docs/devlog/0178-phase-2b-3-visual-approve-register-implementation.md (new)
docs/handoff/0189-phase-2b-3-visual-approve-register-implementation.md (new)
docs/handoff/latest.md                                  (mirror)
```
