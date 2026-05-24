# Handoff: Phase 2B-3.1 visual asset Sanity reflect — implementation

Date: 2026-05-21

## 1. Task Goal

handoff/0192 で Phase 2B-3.1 spec が boss confirmed (Q-2B3.1-1〜Q-2B3.1-7)。 Phase 2B-3 が生成する `patches/visual-assets/<slug>/<asset>.json` を **Sanity `visualAssetPlan` ドキュメントに apply** する dashboard server action を実装。

dashboard = orchestrator + Sanity reflect 担当、 Visual Register CLI = file pipeline owner (touch なし)、 `reflect-*.mjs` = 直接 import せず safety philosophy のみ mirror。 4 field 厳守、 両 page (`/visual-assets/[assetId]/candidates` + `/visual-assets/[assetId]`) を edit surface に、 undo なし、 missing target doc は `not-found` reject + Studio 誘導。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ `tools/visual-register/` touch なし
- ✅ `tools/sanity/reflect-*.mjs` touch なし、 import なし (Q-2B3.1-6 confirmed)
- ✅ assets/visuals / assets/inbox / patches / publish-package 不変
- ✅ patches は **read only** (dashboard コード内で `writeFile` / `copyFile` 0 件 in Phase 2B-3.1 paths)
- ✅ deploy なし、 auto-post なし
- ✅ package 追加なし
- ✅ 23 routes 維持 (build 確認済)
- ✅ Production writes 永久 disabled (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` を Vercel に設定しない契約)
- ✅ Sanity write は `expectedRevision` + `_rev` 再 verify + 4 field allow-list + post-write refetch verification の 9 layer safety
- ✅ `SANITY_WRITE_TOKEN` 値は client bundle に inline されない (env var **名** のみ i18n string)
- ✅ patch JSON 全体 / reviewNotes 本文 / token を log しない (metadata-only `[reflectVisualAssetPatch:stage]` log)
- ✅ Phase 2B-1 reactionNotes 動作不変
- ✅ Phase 2B-2 humanReviewGate 動作不変
- ✅ Phase 2B-3 visual approve/register bridge 動作不変

## 3. Changed Files

### 新規 (3)

| File | 行数 | 役割 |
|---|---|---|
| [dashboard/src/lib/visualAssets/patchJson.ts](dashboard/src/lib/visualAssets/patchJson.ts) | 246 | path validation + patch JSON read + shape validation + 4-field diff computation。 server-only (fs/promises)、 NO Sanity touch、 NO file write |
| [dashboard/src/lib/actions/reflectVisualAssetPatch.ts](dashboard/src/lib/actions/reflectVisualAssetPatch.ts) | 343 | `'use server'` action、 11-step flow (input → localFs → patch JSON read+validate → token → fetch Sanity → not-found → preview/execute branch → expectedRevision → patch construction → commit → post-write verification)、 metadata-only log |
| [dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx](dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx) | 591 | `'use client'` action card、 6 status states (idle / preview-loading / preview-shown / executing / success / error)、 diff panel + reviewNotes truncate + already-reflected indicator + manual setup guidance (not-found) + reload prompt (conflict)。 `variant: 'compact' \| 'wide'` で両 page 対応 |

### 更新 (4)

| File | 主要変更 |
|---|---|
| [dashboard/src/components/visual-review/CandidateFocusLayout.tsx](dashboard/src/components/visual-review/CandidateFocusLayout.tsx) | `Props.reflectBridge` 追加、 `<ReflectVisualAssetAction variant="compact">` を `<ApproveCandidateAction>` の下 + `<ActionsCard>` の上に挿入 |
| [dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx](dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx) | `buildPatchJsonPath` + `patchJsonExists` import、 `reflectBridge` prop を server-side で build して `<CandidateFocusLayout>` に渡す。 `writeReady = enableWriteActions && Boolean(SANITY_WRITE_TOKEN)` — Phase 2B-3.1 で token AND-gate が復活 |
| [dashboard/src/app/visual-assets/[assetId]/page.tsx](dashboard/src/app/visual-assets/[assetId]/page.tsx) | `enableWriteActions` + `ReflectVisualAssetAction` + `patchJsonExists` import、 `<ReflectVisualAssetAction variant="wide">` を `<FilePathsCard>` の下 + `<ActionsCard>` の上に追加。 `<ActionsCard>` の deferred 「採用する」 → 「採用する (候補比較で実行)」 にラベル変更 + helperText 更新 |
| [dashboard/README.md](dashboard/README.md) | Phase 2B-3.1 row を Phase 2B write actions 表に追加、 enablement で `SANITY_WRITE_TOKEN` を 2B-3.1 で要求と明示、 Safety layers section に「Phase 2B-3.1 additional layers (9 layer)」 追加、 Out of scope の「Sanity reflection — Phase 2B-3.1 candidate」 を「実装済」 に書き換え |

### 削除 (0)

なし。 Phase 2B-1 / 2B-2 / 2B-3 既存 runtime と Visual Register CLI は完全 preserved。

### 触らない (絶対 — Q-2B3.1 + 全 Phase 2B 共通)

- `tools/visual-register/server.mjs` (Phase 2B-3 から継続)
- `tools/sanity/reflect-*.mjs` (logic 元として読むのみ、 import なし)
- `tools/publish-package-builder/`
- `schemas/`
- `assets/visuals/`, `assets/inbox/`, `patches/` (patches は read only)
- `publish-package/`
- `package.json` (root + dashboard、 依存追加なし)
- Phase 2B-1 / 2B-2 / 2B-3 既存 runtime (`updateReactionNotes.ts` / `updateGateState.ts` / `approveVisualCandidate.ts` / `bridgePaths.ts` / `sanityWriteClient.ts` / `featureFlags.ts` / `<UndoToastHost>` / 関連 components)

合計 **3 新規 + 4 更新 = 7 ファイル変更**。 1 PR 完結規模 (Phase 2B-1 / 2B-2 / 2B-3 と同等)。

## 4. Summary of Changes

### 4-1. Files changed (詳細は §3)

### 4-2. Patch JSON validation behavior (`patchJson.ts`)

**Path validation** (`validatePatchJsonPath`):
- Allowed pattern: `^patches/visual-assets/<campaignSlug>/<assetSlug>.json$`
- `campaignSlug` / `assetSlug` regex: `/^[a-z0-9][a-z0-9-]{0,80}$/i`
- Reject: empty / absolute (`/...`, `\...`, `C:\...`) / `..` or `.` segments / URL-encoded traversal (`%2e%2e`, `%2f`, `%5c`) / non-`.json` extension / outside allowlist prefix / shape mismatch
- Returns `{ok: true, campaignSlug, assetSlug, relativePath, absolutePath}` or structured error

**Patch JSON shape validation** (`validatePatchShape` inside `readAndValidatePatchJson`):
- `_id` must be non-empty string
- `set` must be object with **exactly** 4 fields (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) all as strings
- Any extra field in `set` block → `shape-mismatch` reject (defense-in-depth, even if future Visual Register adds fields)
- `meta` must be object with `meta.directSanityWrite === false` (Visual Register convention marker)
- `_id` mismatch with input `expectedVisualAssetPlanId` → `id-mismatch` reject

**Diff computation** (`computePatchDiff`):
- For each of 4 fields: `{field, before, after, changed}` — `changed` is `before !== after`
- `alreadyReflected = diffs.every((d) => !d.changed)` — all 4 fields exactly match

**Public exports**:
- `validatePatchJsonPath(path)`: pure validation (no fs)
- `buildPatchJsonPath(campaignSlug, assetSlug)`: build canonical path string (no fs)
- `patchJsonExists(path)`: cheap server-side existence probe (server-only, used by Server Component)
- `readAndValidatePatchJson(path, expectedId)`: fs read + parse + shape validate (server-only)
- `computePatchDiff(patch, current)`: pure diff calc

**Boundaries**:
- NO Sanity calls (server action does that)
- NO file writes (server.mjs is the file pipeline owner)
- Importable only from server code (Server Components + `'use server'`)

### 4-3. Server action behavior (`reflectVisualAssetPatch.ts`)

**Input**:
```ts
{
  visualAssetPlanId: string                  // regex: /^visualAssetPlan\.[a-z0-9][a-z0-9._-]{0,200}$/i
  patchJsonPath?: string                      // either patchJsonPath OR campaignSlug+assetSlug
  campaignSlug?: string                       // derived via buildPatchJsonPath if patchJsonPath missing
  assetSlug?: string
  expectedRevision?: string                   // required for execute, regex /^[a-zA-Z0-9_-]{4,64}$/
  mode: 'preview' | 'execute'
}
```

**11-step flow**:
1. Input regex validation (`visualAssetPlanId`, `mode`, path derivation)
2. `enableLocalFsRoutes` check (cheapest gate; we need to read patch JSON in both modes)
3. `readAndValidatePatchJson` (path allowlist + traversal + fs read + JSON parse + shape validate + `_id` match)
4. `getSanityWriteClient()` → `missing-token` if null (both preview + execute require token for consistency with 2B-1/2)
5. Sanity fetch target doc with GROQ `*[_id == $id && _type == "visualAssetPlan"][0]{...}`
6. `not-found` reject if doc absent (with Studio guidance message)
7. Compute 4-field diff via `computePatchDiff`
8. **mode='preview' branch**: return diff + `alreadyReflected` + `currentRevision`. NO Sanity write.
9. **mode='execute' branch**: `enableWriteActions` AND-gate
10. `expectedRevision` regex + `_rev` mismatch check → `conflict`
11. Patch construction (explicit 4-field `setPayload`) → `client.patch(id, {ifRevisionID}).set(setPayload)` → `client.transaction().patch(p).commit({returnDocuments: true})` → post-write **refetch verification** (re-fetch + 4-field equality check)

**Output**:
- preview success: `{ok: true, mode: 'preview', visualAssetPlanId, patchJsonPath, currentRevision, diffs, alreadyReflected}`
- execute success: `{ok: true, mode: 'execute', visualAssetPlanId, patchJsonPath, previousRevision, newRevision, committedAtIso, appliedFields, verified}`
- error: `{ok: false, error: ReflectVisualAssetPatchError, message}` with 11 error kinds

**Server log** (`[reflectVisualAssetPatch:stage]`):
- stages: `start`, `rejected`, `preview-ok`, `execute-ok`, `already-applied`, `conflict`, `permission`, `error`, `verify-error`
- metadata only: `mode`, `visualAssetPlanId`, `patchJsonPath`, `currentRevisionPrefix` (6 chars), `newRevisionPrefix`, `diffFieldCount`, `alreadyReflected`, `verified`, `elapsedMs`
- **never log**: token, full patch JSON, `reviewNotes` body, image bytes, any field values

### 4-4. UI behavior (`ReflectVisualAssetAction.tsx`)

**4 disabled branches** (renders `<DisabledState>`):
1. `!localFsReady` → 「ENABLE_LOCAL_FS_ROUTES が off のため利用できません」
2. `!writeReady` → 「ENABLE_WRITE_ACTIONS / SANITY_WRITE_TOKEN が揃っていません」
3. `!patchJsonPath` (no patch JSON file) → 「patch JSON がまだ生成されていません (先に Visual Register で採用してください)」

**Enabled states** (`<Body>`):
- **idle**: patch JSON path readout + blue「Sanityに反映する」 button
- **preview-loading**: blue spinner「diff を計算中…」
- **preview-shown**: grid panel of 4 field diffs with `before` / `after` (reviewNotes truncated to 240 chars), `alreadyReflected` indicator (emerald) or `差分あり` (amber)、 「キャンセル」 / 「実行」 buttons
- **executing**: blue spinner「Sanity に書き込み中…」
- **success**: emerald panel with new `_rev` + applied fields + `verified` flag + CopyButton for path、 閉じる
- **error**: rose panel with message + subtype-specific extras (conflict reload / Studio setup guidance / patch-not-found message)

**Two variants**:
- `variant='compact'` (used in candidates page right column): `p-3`, tighter spacing
- `variant='wide'` (used in detail page): `p-4`, more breathing room

**No `<UndoToastHost>`** (Q-2B3.1-3 confirmed).

### 4-5. Candidates page integration

- `enableWriteActions` import added (already present from Phase 2B-3 in some files)
- `buildPatchJsonPath` + `patchJsonExists` imported from `@/lib/visualAssets/patchJson`
- `<CandidateFocusLayout>` extended with `reflectBridge` prop:
  ```ts
  {
    visualAssetPlanId: assetId,
    campaignSlug,
    assetSlug,
    patchJsonPath: (enableLocalFsRoutes && buildPatchJsonPath(...) && patchJsonExists(...)) ? path : null,
    writeReady: enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN),
    localFsReady: enableLocalFsRoutes,
  }
  ```
- Inside `<CandidateFocusLayout>`, `<ReflectVisualAssetAction variant="compact">` rendered between `<ApproveCandidateAction>` and `<ActionsCard>` — establishes the **Phase 2B-3 採用 → Phase 2B-3.1 反映** continuation flow within a single right column
- Phase 2B-3 `<ApproveCandidateAction>` still uses `writeReady = enableWriteActions` (no token AND-gate, since 2B-3 doesn't write Sanity). The two `writeReady` flags coexist intentionally — they reflect different write requirements.

### 4-6. Asset detail page integration

- `enableWriteActions` import added
- `<ReflectVisualAssetAction variant="wide">` rendered between `<FilePathsCard>` and `<ActionsCard>` in the right column
- `patchJsonPath = (enableLocalFsRoutes && patchPath && patchJsonExists(patchPath)) ? patchPath : null` (where `patchPath` comes from existing `expectedPatchPath()` helper)
- `<ActionsCard>` deferred placeholders updated:
  - 「採用する」 → 「採用する (候補比較で実行)」 (Phase 2B-3 で実装済を明示)
  - helperText: 「採用は候補比較ページ、 Sanity 反映は上記カード、 再生成 / 保留は将来 Phase で対応予定です。」

Page stays read-mostly: only the new `<ReflectVisualAssetAction>` adds an interactive surface. PageHeader / breadcrumbs / `<AssetPreviewCard>` / `<PlanMetadataCard>` / `<PromptSummaryCard>` / `<CampaignContextCard>` / `<RubricChecklistCard>` / `<FilePathsCard>` all unchanged.

### 4-7. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1443ms
  Finished TypeScript clean
✓ Generating static pages using 13 workers (3/3) in 65ms

Routes: 18 page routes + 5 API routes = 23 total (unchanged from previous batch)

$ npm run build (root, Studio)
✔ Build Sanity Studio (7964ms)
```

Build hit 2 issues during initial pass (resolved):
1. **JSX template-literal escape** in `ReflectVisualAssetAction.tsx:554` — `<campaignSlug>` inside backtick text was parsed as a tag. Fixed by wrapping in JSX expression + `<code>`.
2. **TypeScript narrowing** of `SanityDocument` response shape — direct cast to `{document: {_rev: string}}` failed strict-mode "insufficient overlap". Fixed by extracting `extractRev(first: unknown): string | null` helper that narrows through `unknown`.

Both fixed, final build green.

### 4-8. Security checks

**Token leak audit** (`.next/static/chunks/*.js`):
```
$ grep -ho "SANITY_WRITE_TOKEN[^\"']*[\"']" .next/static/chunks/*.js | sort -u
SANITY_WRITE_TOKEN が揃っていません"           (new — Phase 2B-3.1 disabled state)
SANITY_WRITE_TOKEN が設定されていません"      (existing — Phase 2B-1 / 2B-2 / 2B-3 error mapping)
SANITY_WRITE_TOKEN 設定時のみ"                  (existing — disabled tooltip)
```
**3 unique strings, all env var NAME in i18n text**. Zero hits of token VALUE.

**reviewNotes body leak check**:
```
$ grep -o "reviewNotes:[^,}]*[,}]" .next/static/chunks/*.js
(empty)
```
No inlined `reviewNotes` value. The component truncates `reviewNotes` only at display time after fetching from the server action; the value lives in component state, never in the static bundle.

**Subprocess / shell check** (Phase 2B-3.1 code paths):
```
$ grep -rn "child_process\|spawn\|execFileSync\|execSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
src/lib/actions/approveVisualCandidate.ts:19://   - Option D (HTTP bridge) only — no subprocess spawn ...
src/lib/visualAssets/bridgePaths.ts:24:// HTTP only, never via spawn / shell ...
```
2 matches — both documentation **comments** from Phase 2B-3. Zero actual usage in 2B-3.1.

**Filesystem write check** (Phase 2B-3.1 code paths):
```
$ grep -rn "writeFile\|copyFile\|writeFileSync\|fs.write\|fs.append" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(empty)
```
**Zero matches**. Phase 2B-3.1 only reads patch JSON (via `readFile` in `patchJson.ts`); never writes filesystem.

**reflect-*.mjs import check** (Q-2B3.1-6 confirmed: must NOT import):
```
$ grep -rn "reflect-working-pipeline\|reflect-publication-state\|from.*tools/sanity" src/
src/lib/actions/approveVisualCandidate.ts:329:      sanityReflectCommand: 'node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run',
src/lib/visualAssets/patchJson.ts:18://                that action; we do NOT import tools/sanity/reflect-*.mjs)
```
- Line 329 (Phase 2B-3): string literal command shown to boss in success panel — **not an import**
- Line 18 (Phase 2B-3.1): comment confirming "we do NOT import" — **not an import**

**Zero actual imports** from `tools/sanity/reflect-*.mjs`. Q-2B3.1-6 fully honored.

**Constraint paths check** (`find -newer 0192`):
- `tools/`, `schemas/`, `publish-package/`, `assets/visuals/`, `assets/inbox/`, `patches/`, `package.json` — all empty

### 4-9. Manual smoke checklist (for boss)

1. `.env.local` 3 セット確認: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>` + `ENABLE_LOCAL_FS_ROUTES=true`
2. (Phase 2B-3 で生成済の) patch JSON が存在する asset を選ぶ。 boss は `building-hitori-media-os/x-hook-main-v1` を 2B-3 smoke で書き済 → `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` が存在
3. `cd dashboard && npm run dev`
4. **Candidates page**: `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` を開く
   - 右カラム上部に「採用 & 登録」 card (Phase 2B-3、 動作不変)
   - その下に「Sanity に反映」 card (Phase 2B-3.1、 新規) — patch JSON path readout + blue「Sanityに反映する」 button
5. click → preview panel が 4 field diff を表示 (`localAssetPath` / `status` / `updatedAt` / `reviewNotes` の `before` / `after`)
6. 「実行」 click → success panel に `new _rev` / `verified: ✓ post-write refetch で 4 field 一致` / applied fields
7. Sanity Studio で `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を開く → 4 field が patch JSON と一致確認
8. 同 patch JSON で再 click → preview で「✓ 既に反映済 (4 field 完全一致)」 indicator
9. **Detail page**: `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を開く → 右カラムに `variant="wide"` の同 card
10. Studio で 1 field 手動変更 → dashboard で再 reflect → preview の「差分あり」 indicator + 実行可能
11. Studio で並行編集中に dashboard で「実行」 → `conflict` rose banner + 「更新」 button (`router.refresh()`)
12. patch JSON 不在の asset (例: 別 visualAssetPlan で Phase 2B-3 未実行) → 「反映 不可 / patch JSON がまだ生成されていません」 disabled state
13. Sanity に target doc が無い `visualAssetPlanId` で reflect → `not-found` error + 4 step Studio 誘導 panel
14. `.env.local` で token を削除 → 「反映 不可 / ENABLE_WRITE_ACTIONS / SANITY_WRITE_TOKEN が揃っていません」 disabled
15. `ENABLE_LOCAL_FS_ROUTES=false` で再起動 → 「反映 不可 / ENABLE_LOCAL_FS_ROUTES が off のため利用できません」 disabled
16. server stdout で `[reflectVisualAssetPatch:execute-ok]` log — `token` / `reviewNotes` 本文 / 全 patch JSON が出ていないことを目視
17. 並行で Phase 2B-1 reactionNotes (`/analytics`) / Phase 2B-2 humanReviewGate (`/human-review-gates`) / Phase 2B-3 approve & register (`/visual-assets/[assetId]/candidates`) 動作不変

## 5. Key Decisions

- **patchJson.ts を共有 helper として分離**: page-level `patchJsonExists()` + server action `readAndValidatePatchJson()` の 2 surface で同じ logic を再利用、 Phase 2B-3 `bridgePaths.ts` と対称
- **11-step server action flow**: Phase 2B-1 / 2B-2 / 2B-3 の pattern を踏襲しつつ、 本 batch 固有の patch JSON read + shape validation (step 3) + post-write refetch verification (step 11) を追加
- **preview / execute 両 mode で token を要求**: Phase 2B-1 / 2B-2 と一貫性、 boss が「preview だけ動いて execute で fail」 という UX 混乱を回避
- **already-reflected hint は execute を block しない**: boss が「念のため再実行」 する path を残す、 server log で `already-applied: true` を audit trail として残す
- **Field allow-list を 2 段で担保**: (1) `validatePatchShape` で `set` block の field を検証 (2) `client.patch().set(setPayload)` で explicit に 4 field のみ含む object を build。 defense-in-depth
- **Post-write verification**: commit 後に Sanity refetch → 4 field の値が patch JSON と一致するか確認 → `verified: boolean` を success result に含める。 Sanity client race / partial commit 検知
- **両 page edit surface**: Phase 2B-2「1 edit surface」 原則の意図的例外。 同 `<ReflectVisualAssetAction>` を `variant='compact' \| 'wide'` で render、 logic 重複ゼロ
- **`<ActionsCard>` のラベル更新**: detail page の deferred「採用する」 → 「採用する (候補比較で実行)」 で Phase 2B-3 既に実装を明示、 helperText も「採用は候補比較、 反映は上記カード」 と current state を反映
- **No undo (Q-2B3.1-3)**: file pipeline と Sanity の乖離 risk を回避、 preview + confirm modal が代替
- **No reflect-*.mjs import (Q-2B3.1-6)**: safety philosophy のみ mirror、 logic は dashboard server action として書き直し
- **Missing target doc → not-found + Studio 誘導 (Q-2B3.1-7)**: dashboard が doc を新規作成しない、 boss が Sanity Studio で先に planning する workflow を尊重、 4 step setup guidance を rose panel に表示
- **TypeScript narrowing via `unknown`**: Sanity client return shape を strict mode で narrowing するための `extractRev(first: unknown): string | null` helper
- **JSX template literal escape**: `<campaignSlug>` を JSX 内 backtick text に書くと parser error → JSX expression `{'...'}` + `<code>` で wrap

## 6. Human Review Questions

### Smoke test 後の判断

1. preview panel の diff 表示 (4 field grid layout、 reviewNotes truncate 240 chars) で OK?
2. success panel の `verified` flag 表示 (「✓ post-write refetch で 4 field 一致」 / 「— refetch verification 未完了」) で OK?
3. 「既に反映済」 hint が execute を block しない設計で OK? それとも「変更なし → execute disable」 にすべき?
4. not-found 時の 4 step Studio 誘導 panel + Studio external link で OK?
5. `<ActionsCard>` の helperText 更新 「採用は候補比較、 反映は上記カード」 で OK?

### 設計判断 review

6. `<ReflectVisualAssetAction>` を `variant='compact' \| 'wide'` の 2 form で 両 page に置く判断で OK? 同 server action を 2 entry point から呼ぶ logic 重複ゼロは保てているが、 component 単体の UX testing は 2 form 必要
7. `writeReady` を 2 surface で 2 通り定義する (Phase 2B-3 = `enableWriteActions` のみ / Phase 2B-3.1 = `enableWriteActions && Boolean(SANITY_WRITE_TOKEN)`) 設計で OK? 一貫性のために 2B-3 にも token check 戻すか?
8. post-write verification を `verified: false` で出した場合の boss UX — 「Studio で確認推奨」 hint で OK? それとも自動 retry を入れるか?

### 実装後の判断

9. Phase 2B-3.2 (multi-asset reflect / publish-package distribute auto / Visual Register CLI status indicator) の timing
10. Phase 2B-3.3 (Visual Register retirement / share library extraction) の timing
11. Phase 2B-2 dead code cleanup (handoff/0186 §8 言及の amber affordance + `[hrg:diag]` log) を 2B-3.2 / 2B-3.3 前に挟むか

## 7. Risks or Uncertainties

- **Smoke test 未実施 (Claude 側)**: build green のみ、 boss 手元で実 Sanity write が初発火。 (a) Visual Register response shape narrowing、 (b) Sanity client transaction return、 (c) post-write refetch race の 3 点は実機で確認必要
- **post-write refetch race**: Sanity の eventual consistency により、 commit 直後の refetch が古い `_rev` を返す可能性。 現状は `verified: false` を flag するだけで boss が Studio で確認、 race 多発するなら短い setTimeout を入れる調整余地
- **`writeReady` inconsistency between Phase 2B-3 / Phase 2B-3.1**: 同 candidates page 内で 2 つの component が異なる writeReady 定義を持つ。 boss が token なしで Phase 2B-3 だけ試したい場合、 2B-3.1 card は disabled、 2B-3 card は active という状態が出る。 妥協として documented (handoff/0189 §10 で Phase 2B-3 の writeReady inconsistency をすでに記録、 本 batch でも継承)
- **patchJsonExists race**: Server Component が render する時点と server action が実行する時点で patch JSON が消えている可能性 (boss が手動削除した場合)。 server action 側 `readAndValidatePatchJson` が `patch-not-found` reject するので safety は保たれる
- **`reviewNotes` truncate 240 文字**: 長い review notes の preview で truncate される。 boss が「full text を見たい」 と感じれば smoke fix で expand button を追加
- **client.patch().set({...}).commit() return shape**: `extractRev` の defensive narrowing で扱うが、 minor version drift で field 名が変わる可能性。 `verified` flag が false になれば boss が Studio で確認 → recovery 可能
- **`SANITY_WRITE_TOKEN` を preview でも要求**: Phase 2B-1 / 2B-2 と一貫性を選んだが、 boss が「preview だけは public でも動かしたい」 と感じれば調整余地

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Smoke test 結果反映**: 文言 / layout / behavior 調整 (Phase 2B-1 / 2B-2 / 2B-3 は 2-3 round smoke fix が必要だった)
- Phase 2B-2 cleanup microbatch (handoff/0186 §8 言及の amber affordance + `[hrg:diag]` log) — boss 好み次第

### 中期 (Phase 2B-3.2)

- multi-asset / batch reflect (Q-2B3.1-5 で deferred)
- publish-package distribute auto-trigger
- Visual Register CLI connection status indicator (topbar)
- 「already-reflected」 detection の正規化戦略強化 (ISO datetime normalize 等)

### 中期 (Phase 2B-2.1)

- gate reviewer / notes / completedAt 編集

### 長期 (Phase 2B-3.3)

- Visual Register retirement (share library extraction、 `tools/visual-register/server.mjs` を core module に refactor、 HTTP bridge を skip)
- audit-log schema (parent Q-4)
- `<UndoToastHost>` AppShell 化 (handoff/0179 §8 言及)
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)
- `tools/sanity/reflect-*.mjs` 段階削除 (parent Q-5)

## 9. Next Recommended Step

**Phase 2B-3.1 manual smoke test on localhost**

handoff/0193 §4-9 の 17-step checklist。 特に重要:
1. patch JSON 存在 asset で preview → execute → success → Studio で 4 field 確認 + `verified: true`
2. 既に reflected hint (4 field 一致時)
3. Studio 並行編集で `conflict` reload prompt
4. Missing target doc で `not-found` + 4 step Studio 誘導
5. env flag / token / patch JSON 不在の disabled states
6. server stdout に token / reviewNotes 本文 / 全 patch JSON が出ていないこと
7. Phase 2B-1 / 2B-2 / 2B-3 動作不変 (regression)

問題なければ:
- **Option A**: Phase 2B-3.1 smoke PASS 記録 (docs-only batch)
- **Option B**: Phase 2B-3 + 2B-3.1 全体の cleanup microbatch
- **Option C**: Phase 2B-3.2 spec batch (multi-asset / publish-package auto / etc.)
- **Option D**: Phase 2B-3.3 spec batch (Visual Register retirement)

---

### Exact prompt for next Claude Code session (Phase 2B-3.1 smoke fix microbatch、 UX 調整が必要なら)

```
Phase 2B-3.1 smoke fix microbatch を実行してください。

入力:
- docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md (finalized + smoke-tested)
- docs/handoff/0193-phase-2b-3-1-visual-asset-sanity-reflect-implementation.md (本 batch)
- boss の smoke test 結果: [boss が記述]

タスク:
1. issue 修正 (UX / copy / layout のみ、 scope 拡張なし)
2. 必要なら writeReady の AND-gate 戦略を見直し (Phase 2B-3 と 2B-3.1 で揃える / 別 spec 必要)
3. devlog + handoff + latest.md mirror

constraints:
- tools/visual-register/* 触らない
- tools/sanity/reflect-*.mjs 触らない / import しない
- Sanity schema 不変
- assets / patches / publish-package 不変
- subprocess spawn なし、 hardcoded localhost:3334 維持
- token / 本文 を log しない
- 4 field 厳守、 5 field 目に拡張しない
```

## 10. Validation

```
=== Build (both) ===
$ cd dashboard && npm run build
✓ Compiled successfully in 1443ms, TypeScript clean, 23 routes (18 page + 5 API)
$ npm run build (root, Studio)
✔ Sanity Studio (7964ms)

=== Token leak audit ===
$ grep -ho "SANITY_WRITE_TOKEN[^\"']*[\"']" .next/static/chunks/*.js | sort -u
SANITY_WRITE_TOKEN が揃っていません"          (new — 2B-3.1 disabled state)
SANITY_WRITE_TOKEN が設定されていません"     (existing — 2B-1/2/3 error mapping)
SANITY_WRITE_TOKEN 設定時のみ"                 (existing — disabled tooltip)
(3 unique strings, all env var NAME in i18n strings, zero VALUE leakage)

=== reviewNotes body in client bundle ===
$ grep -o "reviewNotes:[^,}]*[,}]" .next/static/chunks/*.js
(empty — no inlined reviewNotes value)

=== Subprocess / spawn ===
$ grep -rn "child_process\|spawn" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(only comments from Phase 2B-3, no actual usage in 2B-3.1)

=== Filesystem writes in Phase 2B-3.1 paths ===
$ grep -rn "writeFile\|copyFile\|writeFileSync" \
    dashboard/src/lib/actions \
    dashboard/src/lib/visualAssets \
    dashboard/src/components/visual-review
(empty — dashboard never writes filesystem in 2B-3.1)

=== reflect-*.mjs imports (Q-2B3.1-6: must be 0) ===
$ grep -rn "from.*reflect-working-pipeline\|from.*reflect-publication-state" src/
(empty — only string literals + comments matched, no actual import)

=== Constraint paths untouched (expect empty) ===
$ find tools schemas publish-package assets/visuals assets/inbox patches \
    -type f -newer docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0192-phase-2b-3-1-visual-asset-sanity-reflect-decisions.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Files added/modified in this batch ===
dashboard/src/lib/visualAssets/patchJson.ts                                 (new)
dashboard/src/lib/actions/reflectVisualAssetPatch.ts                       (new)
dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx        (new)
dashboard/src/components/visual-review/CandidateFocusLayout.tsx            (updated)
dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx              (updated)
dashboard/src/app/visual-assets/[assetId]/page.tsx                         (updated)
dashboard/README.md                                                         (updated)
docs/devlog/0182-phase-2b-3-1-visual-asset-sanity-reflect-implementation.md (new)
docs/handoff/0193-phase-2b-3-1-visual-asset-sanity-reflect-implementation.md (new)
docs/handoff/latest.md                                                      (mirror)
```
