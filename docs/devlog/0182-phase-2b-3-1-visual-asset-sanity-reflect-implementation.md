# Phase 2B-3.1 visual asset Sanity reflect — implementation

日付: 2026-05-21

## 背景

handoff/0192 (devlog 0181) で Phase 2B-3.1 spec が boss confirmed (Q-2B3.1-1〜Q-2B3.1-7)。 本 batch で実装。

Phase 2B-3 で Visual Register CLI が生成した `patches/visual-assets/<slug>/<asset>.json` を **Sanity `visualAssetPlan` ドキュメントに apply** する dashboard server action を新規追加。 file pipeline は依然 Visual Register が owner、 本 batch は Sanity reflect のみ。 4 field 厳守 (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)、 両 page (`/visual-assets/[assetId]/candidates` + `/visual-assets/[assetId]`) を edit surface に、 undo なし、 missing target doc は `not-found` reject + Studio 誘導。

## 決定・変更

### 新規ファイル (3)

| File | 役割 |
|---|---|
| `dashboard/src/lib/visualAssets/patchJson.ts` | path validation (allowlist + traversal reject) + patch JSON read + shape validation (`_id` / `set.*` 4 field 型 / `meta.directSanityWrite === false`) + 4-field diff computation。 server-only (fs/promises), no Sanity touch |
| `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` | `'use server'` action、 11-step flow (input regex → localFs gate → patch JSON read+validate → write client (token check) → Sanity fetch → not-found → diff/preview return OR write gate → expectedRevision → patch.set with field allow-list → post-write refetch verification)、 metadata-only log |
| `dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx` | `'use client'` action card、 6 status states (idle / preview-loading / preview-shown / executing / success / error)、 diff panel + reviewNotes truncate + already-reflected indicator + manual setup guidance (not-found) + reload prompt (conflict)。 `variant: 'compact' | 'wide'` で candidates / detail 両 page に対応 |

### 更新ファイル (4)

| File | 主要変更 |
|---|---|
| `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` | `Props.reflectBridge` 追加、 `<ReflectVisualAssetAction variant="compact">` を `<ApproveCandidateAction>` の下 + `<ActionsCard>` の上に挿入 (Phase 2B-3 採用 → Phase 2B-3.1 反映の continuation flow) |
| `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` | `buildPatchJsonPath` + `patchJsonExists` import、 `reflectBridge` prop を build して `<CandidateFocusLayout>` に渡す (writeReady は `enableWriteActions && Boolean(SANITY_WRITE_TOKEN)` — Phase 2B-3.1 で token AND-gate が復活) |
| `dashboard/src/app/visual-assets/[assetId]/page.tsx` | `enableWriteActions` import、 `<ReflectVisualAssetAction variant="wide">` を `<FilePathsCard>` の下 + `<ActionsCard>` の上に追加、 `<ActionsCard>` の deferred「採用する」 → 「採用する (候補比較で実行)」 にラベル変更 (Phase 2B-3 で実装済) + helperText 更新 |
| `dashboard/README.md` | Phase 2B-3.1 row を Phase 2B write actions 表に追加、 enablement instructions で `SANITY_WRITE_TOKEN` を 2B-3.1 で要求と明示、 Safety layers section に「Phase 2B-3.1 additional layers (9 layer)」 を追加、 Out of scope の「Sanity `visualAssetPlan.status` reflection — Phase 2B-3.1 candidate」 を「実装済」 に書き換え |

### 削除 (0)

なし。 既存 components / pages / Phase 2B-1 / 2B-2 / 2B-3 runtime はすべて preserved。

### 触らないもの (絶対 — boss confirmed via handoff/0192)

- `tools/visual-register/` (Phase 2B-3 から touch なし継続)
- `tools/sanity/reflect-*.mjs` (Q-2B3.1-6 confirmed: 直接 import / extract / 再利用しない、 logic 元として読むのみ — 本 batch では参照すらしない)
- `schemas/` (schema 不変)
- `assets/visuals/` / `assets/inbox/` / `patches/` (filesystem 書き込みなし、 patch JSON は **read only**)
- `publish-package/`
- `package.json` (root + dashboard、 依存追加なし — `fs/promises` は Node built-in)
- Phase 2B-1 / 2B-2 / 2B-3 既存 runtime code

合計 **3 新規 + 4 更新 = 7 ファイル変更**。 1 PR 完結規模。

## 理由

### なぜ patchJson.ts を共有 helper として分離したか

選択肢:
- A: server action `reflectVisualAssetPatch.ts` 内に inline で全 logic
- B: 共有 helper `patchJson.ts` に validation / read / diff を分離 (本 batch 採用)

B 採用理由:
- `patchJsonExists()` は **Server Component** (`page.tsx`) から呼ぶ必要 (CTA を出すかどうかの判定)
- `validatePatchJsonPath()` / `buildPatchJsonPath()` は client/server 境界をまたいで使う
- server action 内で `readAndValidatePatchJson` + `computePatchDiff` を import するシンプルな構造
- 将来 Phase 2B-3.2 で multi-asset reflect を実装するときも同 helper を再利用可

これは Phase 2B-3 で `bridgePaths.ts` を分離した pattern と完全に対称。

### なぜ 11-step flow にしたか

Phase 2B-1 9-step / Phase 2B-2 10-step / Phase 2B-3 9-step / 2B-3.1 11-step の違い:

| Step | 2B-1 | 2B-2 | 2B-3 | **2B-3.1** |
|---|---|---|---|---|
| 1 | enableWriteActions | enableWriteActions | enableWriteActions | input regex |
| 2 | token | token | enableLocalFsRoutes | enableLocalFsRoutes |
| 3 | input | input | input | **patch JSON read + validate** |
| 4 | fetch doc | fetch doc | path allowlist | token |
| 5 | _rev check | _rev check | health check | fetch Sanity doc |
| 6 | item exists | gate exists | preview build | preview return (mode='preview' here) |
| 7 | platform match | state match | (skip) | enableWriteActions (mode='execute') |
| 8 | preview/execute | transition check | bridge POST | expectedRevision |
| 9 | commit / verify | commit | response map | already-reflected log |
| 10 | — | — | — | patch construction |
| 11 | — | — | — | post-write verify |

本 batch の **post-write refetch verification** は Q-2B3.1-6 で boss confirmed の safety philosophy「post-write verification」 を満たす実装。 commit 後に 4 field を refetch して patch と一致するか確認、 `verified: boolean` を success result に含める。

### なぜ preview mode でも `getSanityWriteClient()` を要求するか

preview は Sanity を読むだけ (write しない) なので、 理論上は `SANITY_READ_TOKEN` か public でも fetch 可能。 しかし:
- Phase 2B-1 / 2B-2 と一貫性を保つ (両 batch とも token 必須)
- token 不在の preview だけ通って execute で fail する UX が複雑
- token が「Sanity への書き込み権限がある environment」 の signal、 preview もその environment 下で動かしたい

→ preview / execute 両方で `SANITY_WRITE_TOKEN` を AND-gate。 boss は両 mode で同じ env 設定で動かす想定。

### なぜ「already-reflected」 でも execute を許可するか

Q-2B3.1-4 confirmed: 4 field 完全一致時に「既に反映済」 hint を出す。 ただし execute path を closing するのではなく、 boss が「念のため再実行」 を click した場合は再 commit する path を残す:
- Server log で `already-applied: true` を emit (audit trail)
- `client.patch().set({...})` は idempotent (同じ値を set しても doc は変更されない、 `_rev` は更新されるが)
- boss が「Sanity 側を強制的にこの値にしたい」 と意図する場面 (race / 部分書き込みのリカバリ) で有用

→ 「既に反映済」 は警告レベルの hint、 強制 block ではない。

### なぜ field allow-list を patch construction で再構築するか

`patch.set` は `validatePatchShape` で「4 field 厳守」 を強制済。 にもかかわらず:

```ts
const setPayload: Record<PatchJsonField, string> = {
  localAssetPath: patch.set.localAssetPath,
  status: patch.set.status,
  updatedAt: patch.set.updatedAt,
  reviewNotes: patch.set.reviewNotes,
}
client.patch(...).set(setPayload)
```

と explicit に再構築する理由:
- defense-in-depth (`validatePatchShape` がバグで `set` に他 key を残しても、 ここで取り除かれる)
- 将来 Visual Register が patch JSON に 5 field 目を生成し始めても、 spec 更新するまで dashboard は patch しない (safety boundary)
- code grep で「dashboard が Sanity に書く field」 をすぐ確認できる (1 か所)

→ `validatePatchShape` + `setPayload` 再構築の 2 段で field allow-list を担保。

### なぜ post-write verification を入れたか

Q-2B3.1-6 boss confirmed: `reflect-*.mjs` の safety philosophy として「post-write verification」 を mirror。

実装:
1. `client.transaction().patch(p).commit({returnDocuments: true})` → return shape から `_rev` 抽出
2. **追加で** Sanity を refetch して 4 field の値を再取得
3. patch JSON `set.*` と完全一致 → `verified: true`、 不一致 → `verified: false`

`verified: false` の場合は (a) Sanity client return の race、 (b) 部分書き込み、 (c) 別 race condition の signal。 boss UX としては「Studio で確認推奨」 と success panel に明示。

`reflect-*.mjs` の audit pattern は「commit 後に existsSync で final asset 確認」 という file system 系の verification。 本 batch は filesystem 不変なので Sanity field の verification に置き換えた。

### なぜ「両 page (candidates + detail)」 を edit surface に

Q-2B3.1-2 confirmed: Phase 2B-2「edit surface 1 page」 原則の例外。 2 文脈:
- **candidates page**: Phase 2B-3「採用する」 直後の continuation flow、 boss が approve → success panel → 「Sanity に反映する」 を 1 page 内で完結
- **detail page**: 「採用したが Sanity 反映を忘れた asset」 を後から発見、 detail page を開いて「patch JSON あり / 反映可能」 indicator を見て click

同 `<ReflectVisualAssetAction>` を `variant='compact' | 'wide'` で render、 logic 重複ゼロ。 page 側で `patchJsonExists()` を呼んで `patchJsonPath` を渡す/null にすることで「patch JSON 不在」 状態を表示分岐。

### なぜ undo を採用しなかったか

Q-2B3.1-3 confirmed: file pipeline (2B-3) と Sanity (2B-3.1) が密結合、 Sanity だけ undo すると filesystem 残存 → 乖離状態。 preview + confirm modal で commit 前に吸収。 wrong patch は (a) 別 patch を生成して再 apply、 (b) Studio で手動編集、 (c) Phase 2B-3 で別 candidate 再 approve、 の 3 path で対応。

### なぜ missing target doc を reject に

Q-2B3.1-7 confirmed: dashboard は doc を新規作成しない。 boss workflow としては「Sanity Studio で planning → 採用 → reflect」 の flow が前提。 UI で「Studio で先に作成」 4 step guidance + Studio link を表示。

### TypeScript narrowing の修正過程

Phase 2B-3 で確立した response shape narrowing pattern (`SanityDocument` → `_rev` 抽出) を本 batch でも踏襲しようとしたが、 TypeScript strict mode で「SanityDocument を `{document: {_rev: string}}` に cast する gap が大きすぎる」 エラー。

修正: helper function `extractRev(first: unknown): string | null` を導入、 `unknown` 経由で narrowing。 これにより:
- 型 cast を 1 か所に集約
- Sanity client の version drift にも耐える (固定 type を仮定しない)
- TypeScript strict mode を通る

### JSX 内 template string syntax の落とし穴

`<li>該当の ... 新規作成 (\`_id\` を \`visualAssetPlan.<campaignSlug>.<assetSlug>\` に設定)</li>` というテンプレートを JSX に直書きしたら、 JSX parser が `<` を tag start と誤認 → build fail。

修正: JSX expression `{'visualAssetPlan.<campaignSlug>.<assetSlug>'}` で string literal として escape。 `<code>` 要素内に置く。

## 影響

- リポジトリ:
  - dashboard runtime: 3 新規 + 4 更新 = 7 ファイル変更
  - docs: devlog 0182 + handoff 0193 + latest.md mirror
  - schemas / tools / publish-package / assets / patches / package.json: **touch なし**
- ワークフロー:
  - boss は `.env.local` に `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>` + `ENABLE_LOCAL_FS_ROUTES=true` の 3 セットを揃える
  - `/visual-assets/[assetId]/candidates` で Phase 2B-3 採用 → Phase 2B-3.1「Sanity に反映する」 → success panel
  - または `/visual-assets/[assetId]` detail page で「Sanity に反映する」 を後から click
  - Sanity Studio で `visualAssetPlan.{localAssetPath, status, updatedAt, reviewNotes}` の 4 field 更新を確認
- スキーマ: 不変
- プロダクト方針:
  - dashboard で write 可能な surface が 4 件 (Phase 2B-1 reactionNotes / 2B-2 gate state / 2B-3 filesystem via CLI / 2B-3.1 visualAssetPlan field)
  - 「Sanity field op」「filesystem op via CLI」「filesystem-source Sanity reflect」 の 3 pattern が dashboard 内に共存
  - patch JSON を「source of truth」 として読み込む新 pattern が確立、 将来の促成 reflect (Phase 2B-3.2 multi-asset / 別 doc type) の template になる

## 次の一手

**Option A (推奨) — Boss manual smoke test on localhost**

handoff/0193 §9 checklist に従い:
1. `.env.local` 3 セット確認
2. (Phase 2B-3 で生成済の) patch JSON が存在する asset を選ぶ — 例: `building-hitori-media-os/x-hook-main-v1` (boss が 2B-3 smoke で書いた)
3. `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` を開く
4. 右カラム「Sanity に反映」 card で「Sanity に反映する」 click
5. preview panel が 4 field diff を表示
6. 「実行」 → success panel + Sanity Studio で 4 field 更新確認 + `verified: true`
7. 同 patch JSON で再 click → 「既に反映済」 hint
8. `/visual-assets/<assetId>` detail page でも同じ action card を確認
9. Studio で 1 field 手動変更 → dashboard で再 reflect → `conflict` reload prompt
10. patch JSON 不在の asset で「反映 不可 / patch JSON がまだ生成されていません」 disabled state
11. token / write_flag を off → disabled state
12. Phase 2B-1 / 2B-2 / 2B-3 動作不変

問題があれば smoke fix microbatch。

**Option B — Phase 2B-3.2 spec batch**

multi-asset / batch reflect、 publish-package distribute auto-trigger、 Visual Register CLI connection status indicator。

**Option C — Visual Register retirement spec (Phase 2B-3.3 候補)**

`tools/visual-register/server.mjs` の core logic を share library に extract、 HTTP bridge を skip する path。

発信ネタ案:
- 「patch JSON を source of truth にする Sanity reflect の設計 — file system と Sanity の橋渡し」
- 「post-write verification を refetch で実装する話 — Sanity client の race / partial commit 対策」
- 「field allow-list を validation 段階 + patch construction 段階の 2 重で担保する defense-in-depth」
- 「JSX 内で template literal syntax を escape する地味な落とし穴」
