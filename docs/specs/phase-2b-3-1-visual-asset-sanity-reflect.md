# Phase 2B-3.1 Detail Spec — Visual asset Sanity reflect (apply patch JSON)

最終更新: 2026-05-21 (smoke PASS recorded)
ステータス: **implemented + smoke PASS** (implementation 2026-05-21 / boss smoke PASS confirmed 2026-05-21 — handoff/0194)
Visual flow status: **Phase 2B-3 + 2B-3.1 complete** (approve/register bridge + Sanity reflect、 publish-package redistribution + Visual Register retirement は deferred)
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体)
前 spec: [docs/specs/phase-2b-3-visual-approve-register.md](./phase-2b-3-visual-approve-register.md) (W1 bridge、 smoke PASS 済)

## 0. Confirmed decisions (inherited)

### Parent batch (handoff/0175)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、 Vercel scope に絶対設定しない
- **Q-2** ✅: Production write は永久 disabled、 `enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local/dev のみ発火

### Phase 2B-1 / 2B-2 で確立した template

- **Q-8 (conflict)** ✅: `_rev` mismatch → reload prompt、 no last-write-wins、 no 3-way merge
- **Q-10 (devlog)** ✅: 自動 devlog 生成なし、 server `console.log` のみ (metadata only)

### Phase 2B-3 で確立した方針 (handoff/0188 + 0190)

- **Q-3 / Q-2B3-1**: dashboard = orchestrator、 Visual Register CLI = file pipeline owner、 HTTP bridge で連結
- **Q-2B3-2**: Sanity reflect は **本 sub-batch (Phase 2B-3.1) で実装** — Phase 2B-3 では patch JSON 生成までで止める方針が確定済
- **Q-2B3-5**: file op には自動 undo を採用しない、 preview + confirm + manual cleanup。 ただし **Sanity field op に対しては undo 採用余地あり** (本 spec §7 で議論)

### Long-term direction (handoff/0190 で boss confirmed)

Visual Register separate server を将来 retire する方針:
- Phase 2B-3 (現在): HTTP bridge to `:3334`
- Phase 2B-3.1 (本 spec): Sanity reflect を dashboard 内に追加
- 将来 (別 Phase): `tools/visual-register/server.mjs` を share library に extract、 dashboard 統合
- **本 spec では実装しない**

### Phase 2B-3.1 batch (handoff/0192, 2026-05-21) — 7 Q boss confirmed

Boss confirmed all 7 open questions specific to this spec:

- **Q-2B3.1-1 (field allow-list)** ✅: 編集対象は **厳密に 4 field** — `localAssetPath` / `status` / `updatedAt` / `reviewNotes`。 他 `visualAssetPlan` field は本 batch で **絶対に patch しない**。 将来 server.mjs が patch JSON に他 field を生成し始めたら spec update。
- **Q-2B3.1-2 (page placement)** ✅: **Option C — 両 page** で edit surface を提供。 `/visual-assets/[assetId]/candidates` は Phase 2B-3「採用」 直後の continuation flow、 `/visual-assets/[assetId]` (detail) は「採用したが Sanity 反映を忘れた」 asset を後から発見する flow。 同 server action を両 entry point から call、 logic 重複ゼロ。
- **Q-2B3.1-3 (undo)** ✅: **No undo**。 `<UndoToastHost>` は流用しない。 preview + confirm modal で誤操作を吸収、 wrong patch を apply した場合は (a) 別 patch を生成して再 apply or (b) Studio で手動編集、 のどちらか。 Sanity / filesystem 乖離を回避するため自動 undo は採用せず。
- **Q-2B3.1-4 (already-reflected detection)** ✅: **4 field 完全一致** で判定。 patch JSON `set.{localAssetPath, status, updatedAt, reviewNotes}` と current Sanity 同 field の値が **すべて一致** すれば「既に反映済」 表示。 1 field でも異なれば「needs reflect」。 boss が「念のため再実行」 する path も残す (execute は引き続き可能、 server log で `already-applied: true` を emit)。
- **Q-2B3.1-5 (single vs multi-asset)** ✅: **1 asset / 1 transaction 厳守**。 multi-asset / batch reflect は本 batch で扱わない、 Phase 2B-3.2 候補。
- **Q-2B3.1-6 (server action implementation 方針)** ✅: **Dashboard server action として別実装**。 `tools/sanity/reflect-working-pipeline-visual-assets.mjs` の logic を直接 import / extract / 再利用 **しない**。 ただし以下 4 つの safety philosophy は mirror:
  - Hardcoded `_id` allow-list / patch JSON shape allow-list
  - `--dry-run` (= `mode: 'preview'`) と `--execute` (= `mode: 'execute'`) を 2-stage に分離
  - `expectedRevision` (= `ifRevisionID`) で楽観 lock
  - Post-write verification (commit 後に再 fetch して 4 field 一致確認)
  - 存在しない doc を新規作成しない
  - Token を log しない
- **Q-2B3.1-7 (missing target doc)** ✅: Sanity に target `visualAssetPlan` doc が存在しない場合 → server action は **`not-found` reject**。 dashboard が doc を新規作成する path は採用しない。 UI で「Sanity Studio で先に visualAssetPlan を作成してください」 と guidance を表示。

### Remaining parent-level open questions

**Q-4 / Q-5 / Q-9** は parent §6 で tracking 継続、 本 batch では touch しない。

---

## 1. Goal and scope

### Goal

Phase 2B-3 が `tools/visual-register/server.mjs` 経由で生成した `patches/visual-assets/<campaignSlug>/<assetSlug>.json` の patch document を、 dashboard から **Sanity `visualAssetPlan` ドキュメントに apply** する。

つまり file pipeline (assets/visuals/ + patches/ + manifest update) は **既に Phase 2B-3 で完結している** が、 Sanity 側の `visualAssetPlan.localAssetPath` / `status` / `updatedAt` / `reviewNotes` field はまだ updating されていない。 本 batch は patch JSON を「真の source of truth」 として読み込み、 Sanity に apply する controlled write を追加する。

### In scope

- patch JSON を `patches/visual-assets/<campaignSlug>/<assetSlug>.json` から読み込み (filesystem read のみ、 write なし)
- patch JSON shape validation (`_id` / `set.*` / `meta.directSanityWrite` 等)
- patch JSON target `_id` が引数 `visualAssetPlanId` と一致することを verify
- Sanity `visualAssetPlan` ドキュメントを `_id` で fetch
- `_rev` mismatch check (`expectedRevision` 必須)
- 既に reflected かどうかの heuristic check (preview hint)
- field allow-list での patch (`set` operation のみ、 `unset` / `inc` / `dec` 等は不採用)
- dry-run preview / execute 2-stage server action
- `/visual-assets/[assetId]/candidates` または `/visual-assets/[assetId]` 上で「Sanity に反映する」 button

### Out of scope (本 spec の対象外、 §8 で再列挙)

- file copy / register (Phase 2B-3 で完結)
- Visual Register server 変更 (`tools/visual-register/` touch なし)
- publish-package distribute auto-trigger
- asset 削除
- patch JSON 生成 (Visual Register が owner)
- 画像再生成
- Sanity schema 変更
- audit-log schema
- 自動 devlog 生成
- Visual Register retirement implementation

---

## 2. Existing data shape audit

### 2-1. patch JSON shape (Visual Register が生成)

実例: `patches/visual-assets/building-hitori-media-os/note-inline-human-judgment-v1.json`

```json
{
  "_id": "visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1",
  "set": {
    "localAssetPath": "assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png",
    "status": "saved",
    "updatedAt": "2026-05-18T11:37:27.190Z",
    "reviewNotes": "Approved via Visual Register inbox and copied to final local asset path. ..."
  },
  "meta": {
    "generatedBy": "tools/visual-register/inbox",
    "inboxSource": "assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png",
    "originalFileName": "v001.png",
    "mimeType": "image/png",
    "directSanityWrite": false
  }
}
```

### 2-2. Expected field allow-list

patch JSON `set` block 内に出現する **4 field** (現状の Visual Register 生成 path):
- `localAssetPath` (string)
- `status` (string, enum: `'saved'` だけが実際生成される)
- `updatedAt` (ISO datetime)
- `reviewNotes` (string)

**meta block は Sanity に apply しない** (validation 用途のみ):
- `generatedBy`
- `inboxSource`
- `originalFileName`
- `mimeType`
- `directSanityWrite` (= `false` であることを verify、 これが `true` だと「dashboard 経由で書け」 という signal、 unsupported)

`tools/sanity/reflect-working-pipeline-visual-assets.mjs` の現行運用 + 既存 patch JSON 16+ 件の audit から、 上記 4 field 以外は実 patch にほぼ出現しない。 ただし `reflect-working-pipeline-*` 系の recovery script では `status: 'skipped'` + `unset: localAssetPath` の pattern がある — 本 batch ではこの recovery path を扱わない (out of scope)。

### 2-3. 対応 Sanity field (`schemas/visualAssetPlan.ts`)

| patch field | Sanity field | Type | 説明 |
|---|---|---|---|
| `set.localAssetPath` | `localAssetPath` | string | 採用後の final asset 相対 path |
| `set.status` | `status` | string enum | `planned` → ... → `saved` → ... → `archived` の 10 値 |
| `set.updatedAt` | `updatedAt` | datetime | 採用時刻 (ISO) |
| `set.reviewNotes` | `reviewNotes` | text | merge 済 review notes |

### 2-4. patch JSON が無い場合 / 既に reflected の場合

- patch JSON が存在しない → boss が `/visual-assets/[assetId]/candidates` で「採用する」 を実行していない → 本 action は呼ばれるはずがない (UI で disable される)
- 既に reflected → Sanity `localAssetPath` が patch JSON の `set.localAssetPath` と一致 + `status === 'saved'` + `updatedAt >= patch.set.updatedAt` → preview hint で「既に反映済」 表示、 boss が「強制で再反映」 する path を別途用意するか不要かは Q-2B3.1-4 で議論

---

## 3. Target page (UI placement)

### 3-1. 候補 page

- A: `/visual-assets/[assetId]/candidates` の result panel (Phase 2B-3 success panel 内に「Sanity に反映する」 button を追加)
- B: `/visual-assets/[assetId]` (detail page) の `<FilePathsCard>` 近辺に「patch JSON あり / Sanity 未反映」 indicator + 「反映する」 button
- C: 両方

### 3-2. CONFIRMED: Option C (both pages) — Q-2B3.1-2 ✅ (2026-05-21)

**Option C (両 page)** を採用:

- **candidates page**: Phase 2B-3 で「採用する」 直後の workflow に「Sanity 反映」 を継続できる、 boss workflow が中断しない
- **detail page**: 「採用したが Sanity 反映を忘れた asset」 を後から発見しやすい、 「すでに採用済だが Sanity 未反映」 状態の visibility が増す

Phase 2B-2 で確立した「edit surface を 1 page に絞る」 原則とは少し異なるが、 本 batch では:
- 同じ server action を両 page から call する (logic 重複なし)
- 「採用後の continuation」「後から発見」 の 2 文脈は edit surface を 1 つに絞るより自然
- Phase 2B-3 が示した「観察 (`/visual-assets[/[assetId]]`) と編集 (`/visual-assets/[assetId]/candidates`)」 の分離 + 本 batch の Sanity reflect は「post-approve operation」 で性質が違う

採用しなかった選択肢: Option A (candidates のみ) / Option B (detail のみ)。 いずれも 2 文脈の片方を missing するため reject。

### 3-3. UI states (両 page 共通)

```
1. patch JSON not found (= Phase 2B-3 未実行):
   → 表示なし、 または「先に Visual Register で採用してください」 hint
2. patch JSON found / Sanity 未反映:
   → 「Sanity に反映する」 button + amber indicator「Sanity 未反映」
3. patch JSON found / Sanity 反映済:
   → 「✓ 反映済」 emerald indicator + (optional)「強制で再反映」 link
4. writeReady=false (env flag off or token missing):
   → 「反映 不可」 disabled pill
5. preview in flight:
   → spinner + 「比較中…」
6. preview shown:
   → diff panel + 「実行」 / 「キャンセル」 buttons
7. executing:
   → spinner + 「Sanity に書き込み中…」
8. success:
   → emerald「✓ 反映完了」 + new `_rev` 表示 + (optional) undo toast (Q-2B3.1-3 次第)
9. error:
   → rose banner + retry button (conflict / permission / etc.)
```

---

## 4. Data model

### 4-1. Server action Input shape

```ts
'use server'

export interface ReflectVisualAssetPatchInput {
  /** Sanity visualAssetPlan _id (must match patch JSON `_id`). */
  visualAssetPlanId: string
  /** Path to patch JSON relative to repo root. Validated against allowlist
   *  before fs read. */
  patchJsonPath: string
  /** Required Sanity _rev. Mode='execute' fails with `conflict` on mismatch. */
  expectedRevision: string
  mode: 'preview' | 'execute'
}
```

`patchJsonPath` を input にする理由: dashboard が patch JSON の場所を server action に明示的に渡すことで、 server.mjs / Visual Register の path computation logic を dashboard に持ち込まずに済む。 dashboard 側 (page or component) が `patches/visual-assets/<campaignSlug>/<assetSlug>.json` を組み立てて渡す。

### 4-2. Server action Output shape

```ts
export type ReflectVisualAssetPatchResult =
  | {
      ok: true
      mode: 'preview'
      visualAssetPlanId: string
      currentRevision: string
      patchJsonShape: 'valid' | 'invalid'
      alreadyReflected: boolean
      diff: {
        // 各 field について before / after を返す。 boss が confirm 前に確認する。
        localAssetPath: {before: string | null; after: string}
        status: {before: string | null; after: string}
        updatedAt: {before: string | null; after: string}
        reviewNotes: {before: string | null; after: string}
      }
    }
  | {
      ok: true
      mode: 'execute'
      visualAssetPlanId: string
      previousRevision: string
      newRevision: string
      committedAtIso: string
      appliedFields: string[]                  // ['localAssetPath', 'status', 'updatedAt', 'reviewNotes']
    }
  | {
      ok: false
      error:
        | 'validation'
        | 'write-disabled'
        | 'missing-token'
        | 'permission'
        | 'not-found'
        | 'conflict'
        | 'patch-not-found'
        | 'patch-malformed'
        | 'patch-target-mismatch'
        | 'patch-already-applied'
        | 'unknown'
      message: string
    }
```

### 4-3. 編集 **しない** field

- `meta.*` (validation のみ、 Sanity に書かない)
- `set` block 内に **無い** 任意の field (例: `title`, `targetPlatform`, `assetType`)
- 他 document (`contentIdea` / `campaignPlan` / 等)

---

## 5. Safety pattern (6 layer)

Phase 2B-1 / 2B-2 の 4-5 layer に **patch JSON 固有の 2 layer** を追加:

| # | Layer | 本 batch での意味 |
|---|---|---|
| 1 | `enableWriteActions` env flag | Phase 2B 全 batch 共通の master switch |
| 2 | `SANITY_WRITE_TOKEN` env presence | **本 batch で復活** (Phase 2B-3 では不要だったが、 Sanity write が再導入されるため) |
| 3 | Hard input validation | `visualAssetPlanId` / `patchJsonPath` / `expectedRevision` の regex / format check |
| 4 | **Patch JSON path allowlist** (本 batch 固有) | `patchJsonPath` は `patches/visual-assets/[a-z0-9-]+/[a-z0-9-]+\.json$` のみ受理、 traversal / 絶対 path / URL encoded reject (Phase 2B-3 `bridgePaths.ts` と同 pattern) |
| 5 | **Patch JSON shape validation** (本 batch 固有) | `_id`, `set.localAssetPath`, `set.status`, `set.updatedAt`, `set.reviewNotes`, `meta.directSanityWrite === false` を check、 missing / type mismatch / `directSanityWrite !== false` で reject |
| 6 | `expectedRevision` 必須 + Sanity re-fetch verify | Phase 2B-1 / 2B-2 と同じ optimistic lock |
| 7 | Field allow-list at patch construction | dashboard が build する `client.patch().set({...})` の object key は `localAssetPath` / `status` / `updatedAt` / `reviewNotes` の 4 のみ、 他 key は include しない |

### 5-1. `meta.directSanityWrite === false` 検証の意味

`tools/visual-register/server.mjs` が生成する patch JSON は **必ず** `meta.directSanityWrite: false` を含む。 これは「この patch は generated by Visual Register、 boss が dashboard 経由で apply する想定」 という marker。

dashboard 側は `directSanityWrite !== false` (= `true` or undefined or 他値) の patch JSON を reject する。 想定:
- `true` → 想定外の external 生成 path、 信頼できない
- undefined → patch JSON shape mismatch
- 他値 → meta tampering

→ `directSanityWrite === false` のみ accept。

### 5-2. `_id` mismatch 検証

`input.visualAssetPlanId !== patch._id` の場合 → `patch-target-mismatch` error。

これは race condition (boss が別 asset の page を開いている時に同 patch JSON を apply しようとする) や URL tampering 防御。

### 5-3. Already-applied detection (heuristic)

preview step で `alreadyReflected = (currentSanity.localAssetPath === patch.set.localAssetPath && currentSanity.status === patch.set.status && currentSanity.updatedAt === patch.set.updatedAt)`。

完全一致なら「既に反映済」、 boss が再 apply する意味なし。 UI で hint 表示、 execute は引き続き可能 (boss が「念のため再実行」 したい場合)、 ただし server log に `already-applied: true` を emit。

---

## 6. Server action design

### 6-1. 設置場所

- ファイル: `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` (新規、 Phase 2B-1 / 2B-2 / 2B-3 actions と同 directory)
- `'use server'` directive
- `getSanityWriteClient` を再利用 (Phase 2B-1 で実装済)
- `enableWriteActions` を再利用

### 6-2. 9 step flow

1. `enableWriteActions` check → `write-disabled` if false
2. `SANITY_WRITE_TOKEN` check via `getSanityWriteClient()` → `missing-token` if null
3. Input validation: `visualAssetPlanId` regex (`^visualAssetPlan\.[a-z0-9][a-z0-9._-]+$`), `patchJsonPath` regex (`^patches/visual-assets/[a-z0-9-]+/[a-z0-9-]+\.json$`), `expectedRevision` regex
4. Patch JSON path safety check (absolute / traversal / outside-allowlist → reject)
5. Patch JSON read from filesystem (fs.readFile, parse JSON、 fail → `patch-not-found` or `patch-malformed`)
6. Patch JSON shape validation: `_id === input.visualAssetPlanId`、 `meta.directSanityWrite === false`、 `set.*` 4 field 型 check → fail で `patch-target-mismatch` or `patch-malformed`
7. Sanity fetch target doc: `*[_id == $id][0]{_id, _rev, _type, localAssetPath, status, updatedAt, reviewNotes}` → `not-found` if absent
8. `_rev` mismatch check → `conflict`
9. Mode='preview': build diff, return preview result (`alreadyReflected` も計算)
10. Mode='execute':
    - `client.patch(visualAssetPlanId, {ifRevisionID: expectedRevision}).set({localAssetPath, status, updatedAt, reviewNotes})` を build
    - `client.transaction().patch(p).commit({autoGenerateArrayKeys: false, returnDocuments: true})`
    - response から new `_rev` + `committedAt` 抽出
    - return success + `appliedFields: ['localAssetPath', 'status', 'updatedAt', 'reviewNotes']`

### 6-3. Server console.log

stage: `start`, `rejected`, `preview-ok`, `execute-ok`, `conflict`, `permission`, `error`

emit metadata only:
- `visualAssetPlanId`
- `patchJsonPath` (path string、 内容は出さない)
- `expectedRevisionPrefix` (先頭 6 文字)
- `newRevisionPrefix` (先頭 6 文字)
- `mode`
- `httpStatus` (該当 case のみ)
- `alreadyReflected` (boolean、 preview のみ)
- `elapsedMs`

**never log**: token、 `set.reviewNotes` 本文、 patch JSON 全体、 Sanity response の `reviewNotes` 文字列。 reviewNotes の length 比較 (`before.length !== after.length`) など boolean / number 統計のみ OK。

---

## 7. Undo / rollback — Q-2B3.1-3 CONFIRMED (2026-05-21)

### 7-1. Option comparison

Phase 2B-1 / 2B-2 では `<UndoToastHost>` の 10秒 in-memory toast undo を採用。 Phase 2B-3 では file op に自動 undo を採用せず preview + confirm + manual cleanup。 本 batch (2B-3.1) は **Sanity field op** で性質が 2B-1 / 2B-2 寄り:

| | reactionNotes (2B-1) | gate state (2B-2) | visual asset reflect (2B-3.1) |
|---|---|---|---|
| 操作 | 単一 field `set` | 単一 field `set` (controlled vocab) | 4 field `set` |
| 元値 | 文字列 | enum 値 | 4 field の各前値 |
| 元に戻す | 反対 patch 1 回 | 反対 patch 1 回 | 反対 patch 1 回 (4 field 同時) |
| 自動 undo の難易度 | 容易 | 容易 | 容易 (前値が preview に揃っている) |
| recovery 路 | undo / Studio 編集 | undo / Studio 編集 | undo / Studio 編集 / 別 patch を生成して再 apply |

→ Sanity field op として「自動 undo を採用しない」 理由が薄い。 ただし:
- 本 batch は file pipeline + Sanity reflect の **post-approve** ワークフロー、 boss が「Sanity に反映した = workflow 確定」 と感じやすい
- undo すると Sanity だけ戻って filesystem の final asset / patch JSON / manifest は残る → 「Sanity と file system が一時的に乖離する」 状態が出る、 boss 混乱の可能性
- Phase 2B-3 と同じ「irreversible-ish op は preview + confirm で吸収」 原則と整合する選択肢もある

### 7-2. CONFIRMED: No undo in Phase 2B-3.1

- preview step で diff (before/after 4 field) を表示
- confirm modal で boss が明示的に承認
- 万一 wrong patch を apply した場合: `tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute` で対象 doc を別 patch で上書き、 または Studio で手動編集、 または Phase 2B-3 で別 candidate を再 approve して新 patch JSON を生成 → 本 action で再 reflect
- `<UndoToastHost>` を本 batch では **流用しない** (Phase 2B-3 と同じ判断、 file pipeline と Sanity の乖離 risk 回避)

採用しなかった代替案: `<UndoToastHost>` の 10秒 undo + `isUndo: boolean` flag。 「Sanity だけ undo されて filesystem の final asset / patch JSON / manifest は残る」 という乖離状態を意図的に避ける。

---

## 8. Scope exclusions

本 batch では **やらない**:

- ✗ file copy / register (Phase 2B-3 で完結)
- ✗ Visual Register server 変更 (`tools/visual-register/` touch なし)
- ✗ publish-package distribute auto-trigger
- ✗ asset 削除 / unset
- ✗ patch JSON 生成
- ✗ 画像再生成
- ✗ Sanity schema 変更
- ✗ audit-log schema
- ✗ 自動 devlog 生成
- ✗ Visual Register retirement implementation (long-term direction、 別 Phase)
- ✗ batch / multi-asset reflect (1 patch JSON / 1 transaction)
- ✗ patch JSON の `unset` operation 対応 (recovery path、 別 batch)
- ✗ `status: 'skipped'` reflect (recovery path)

---

## 9. Long-term Visual Register retirement plan

handoff/0190 で boss confirmed direction を本 spec でも 1 か所に明示しておく:

| 段階 | 内容 | 実装 |
|---|---|---|
| **現在 (Phase 2B-3)** | dashboard → HTTP bridge → Visual Register `:3334` separate server | 完了 (handoff/0189 + 0190) |
| **次 (Phase 2B-3.1、 本 spec)** | dashboard 内に Sanity reflect 追加。 file pipeline は Visual Register が owner のまま | 本 spec の implementation で land |
| **将来 (Phase 2B-3.2 / Phase 2B-3.3 候補)** | `tools/visual-register/server.mjs` の core logic を share library に extract → dashboard server action が直接 call (HTTP bridge を skip) | **本 spec では実装しない** |
| **更に将来** | CLI / `:3334` server を optional compatibility layer に降格 → 最終的に retire | **本 spec では実装しない** |

本 batch は「現在 → 次」 への前進 step。 Visual Register `:3334` server への依存は保持、 boss が手動で `npm run visual:register` する workflow も維持。

---

## 10. Acceptance criteria

12 項目 smoke checklist:

1. **Build green**: `cd dashboard && npm run build` で 23 routes すべて green、 TypeScript clean
2. **Default behavior (writeReady=false)**: 完全 read-only、 既存 Phase 2B-3 動作維持
3. **Enabled behavior**: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN` + Phase 2B-3 で patch JSON 生成済の asset で:
   - patch JSON が存在する page で「Sanity に反映する」 button が出る
   - click → preview panel で diff 4 field 表示
   - 「実行」 → Sanity Studio で `visualAssetPlan` の `localAssetPath` / `status: 'saved'` / `updatedAt` / `reviewNotes` 更新確認
4. **preview ⇄ execute**: preview だけだと Sanity 不変、 execute だけが書く
5. **`_rev` conflict**: Studio で並行編集 → `conflict` banner + 「更新」 button
6. **既に reflected**: `localAssetPath` 完全一致時に「既に反映済」 hint
7. **patch JSON 不在**: button が出ない / disabled
8. **patch JSON malformed**: server で `patch-malformed` reject
9. **`_id` mismatch**: server で `patch-target-mismatch` reject
10. **Phase 2B-1 reactionNotes**: regression なし
11. **Phase 2B-2 humanReviewGate**: regression なし
12. **Phase 2B-3 visual approve/register bridge**: regression なし
13. **Token leak audit**: `.next/static/chunks/*.js` に `SANITY_WRITE_TOKEN` value が出ない
14. **No asset / publish-package modifications**: 本 action は filesystem を書かない、 Sanity に 4 field しか書かない

---

## 11. Files likely affected (implementation batch)

### 11-1. 新規 (2-3)

| File | 役割 |
|---|---|
| `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` | `'use server'` action 本体 (§6) |
| `dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx` | `'use client'` component (preview button + confirm modal + diff panel + result) |
| `dashboard/src/lib/visualAssets/patchPaths.ts` (optional) | `patchJsonPath` allowlist + shape helper (`bridgePaths.ts` と並列) |

### 11-2. 更新 (3-4)

| File | 変更内容 |
|---|---|
| `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` | success result panel 内に `<ReflectVisualAssetAction>` を統合 (Phase 2B-3 success → Sanity reflect の continuation flow) |
| `dashboard/src/app/visual-assets/[assetId]/page.tsx` | `<FilePathsCard>` 近辺に「patch JSON あり / Sanity 未反映」 indicator + `<ReflectVisualAssetAction>` 追加 |
| `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` | 必要に応じて `<ReflectVisualAssetAction>` の slot を追加 (Phase 2B-3 `<ApproveCandidateAction>` の result panel 内 or 隣接) |
| `dashboard/README.md` | Phase 2B-3.1 row 追加、 7 layer safety を documented、 enablement で `SANITY_WRITE_TOKEN` 復活を明示 |

### 11-3. 削除 (0)

なし (Phase 2B-3 既存 component を保持)。

### 11-4. 触らないもの (本 batch + Phase 2B-3.1 全体で)

- `tools/visual-register/*` (Phase 2B-3 + 2B-3.1 を通して boss-controlled)
- `tools/publish-package-builder/*`
- `tools/sanity/reflect-*.mjs` (Phase 2B-3.1 implementation で **参考 logic 元** にはするが、 直接 import しない — server action として書き直す)
- `schemas/visualAssetPlan.ts` (schema 不変)
- `assets/visuals/**` / `assets/inbox/generated/**` (filesystem への write なし)
- `patches/visual-assets/**` (filesystem への write なし、 **read only**)
- `publish-package/**`
- `package.json` (root + dashboard)
- Phase 2B-1 / 2B-2 / 2B-3 既存 runtime code (`updateReactionNotes.ts` / `updateGateState.ts` / `approveVisualCandidate.ts` / `sanityWriteClient.ts` / `featureFlags.ts` / `<UndoToastHost>` 等)

---

## 12. Confirmed questions (all resolved 2026-05-21)

すべての Phase 2B-3.1 specific question は boss confirmed。 実装に向けて未解決事項はなし。

| # | Boss-confirmed answer | spec への反映 |
|---|---|---|
| **Q-2B3.1-1** ✅ | 編集対象は **厳密に 4 field**: `localAssetPath` / `status` / `updatedAt` / `reviewNotes`。 他 `visualAssetPlan` field は patch しない | §0 / §2-2 / §4-3 / §5 (layer 7) / §6 / §10 |
| **Q-2B3.1-2** ✅ | **Option C — 両 page** (candidates + detail) を edit surface に。 同 server action を両 entry から call | §0 / §3-1 / §3-2 / §11-2 |
| **Q-2B3.1-3** ✅ | **No undo**。 `<UndoToastHost>` は流用しない。 preview + confirm modal で吸収、 wrong patch は別 patch / Studio で手動修正 | §0 / §7 |
| **Q-2B3.1-4** ✅ | Already-reflected detection は **4 field 完全一致**。 1 field でも異なれば「needs reflect」。 再 apply path は残す (server log で `already-applied: true` emit) | §0 / §5-3 / §3-3 |
| **Q-2B3.1-5** ✅ | **1 asset / 1 transaction 厳守**。 multi-asset / batch reflect は Phase 2B-3.2 候補 | §0 / §4-1 / §8 |
| **Q-2B3.1-6** ✅ | **Dashboard server action として別実装**。 `reflect-working-pipeline-visual-assets.mjs` を直接 import / extract / 再利用しない。 ただし safety philosophy (allow-list / preview-before-execute / `expectedRevision` / post-write verification / no-create-missing-docs / no token in log) を mirror | §0 / §6 / §11-4 |
| **Q-2B3.1-7** ✅ | Sanity target doc 不在時は **`not-found` reject**。 dashboard が doc を作らない、 UI で「Sanity Studio で先に visualAssetPlan を作成してください」 と誘導 | §0 / §6-2 (step 7) |

Remaining parent-level open questions (**Q-4 / Q-5 / Q-9**) は parent spec §6 で tracking 継続。 Phase 2B-3.1 implementation には不要 (audit-log schema / reflect-script 段階削除 / W7 promptTemplate save はいずれも本 batch scope 外)。

---

## 13. Test plan

### 13-1. Manual smoke (boss が確認)

1. `.env.local` 設定: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>` + (前 batch から) `ENABLE_LOCAL_FS_ROUTES=true`
2. Visual Register 起動: `npm run visual:register`
3. `cd dashboard && npm run dev`
4. Phase 2B-3 で 1 asset を「採用」 → patch JSON 生成済の状態を作る
5. `/visual-assets/<assetId>/candidates` の result panel に「Sanity に反映する」 button が表示
6. click → preview diff panel (4 field の before/after)
7. 「実行」 → success → Sanity Studio で `visualAssetPlan` の 4 field 更新確認
8. `/visual-assets/<assetId>` detail page で「✓ 反映済」 indicator
9. Studio で 1 field 手動変更 → dashboard で再 reflect → `conflict`
10. patch JSON を手動で malform → server で `patch-malformed` reject
11. Phase 2B-1 reactionNotes / 2B-2 gate state / 2B-3 approve/register 動作不変

### 13-2. Negative tests

| シナリオ | 期待結果 |
|---|---|
| `visualAssetPlanId` を改竄 | `validation` reject |
| `patchJsonPath` に `..` 含める | path allowlist reject |
| patch JSON `_id` を改竄 | `patch-target-mismatch` reject |
| `meta.directSanityWrite: true` に変更 | `patch-malformed` reject (期待) |
| `set` を全削除 | `patch-malformed` reject |
| `expectedRevision` 古い | `conflict` reject |
| Sanity doc 不在 | `not-found` reject (Q-2B3.1-7 で boss 確認後の挙動) |

### 13-3. Token / log audit

- `.next/static/chunks/*.js` に `SANITY_WRITE_TOKEN` value がない (Phase 2B-1 / 2B-2 と同じ audit)
- server stdout に `[reflectVisualAssetPatch:execute-ok]` 等の log は出るが、 token / reviewNotes 本文 / patch JSON 全体は出ない

---

## 14. Environment variables

新規 env var **なし**。 Phase 2B-1 / 2B-2 + Phase 2B-3 の既存 3 flag を再利用:

| 変数 | 役割 | 本 batch での要否 |
|---|---|---|
| `ENABLE_WRITE_ACTIONS` | Phase 2B 共通 master switch | **必須** |
| `SANITY_WRITE_TOKEN` | Sanity write 用 token (Editor role) | **必須 (本 batch で復活)** |
| `ENABLE_LOCAL_FS_ROUTES` | filesystem read 用 (patch JSON 読み込み) | **必須** |

Vercel scope は全 (production / preview / development) で **絶対に設定しない**。

---

## 15. Post-spec next step

1. ~~**boss が本 spec を read** + Q-2B3.1-1〜Q-2B3.1-7 (7 件) に judgement~~ → **Done 2026-05-21** (handoff/0192)
2. **次 → Phase 2B-3.1 implementation batch を起動**:
   - 新規 **2-3 ファイル** + 更新 **3-4 ファイル** = 5-7 ファイル変更
   - Server action として別実装 (Q-2B3.1-6 confirmed)、 patch JSON 1 件 / 1 doc 厳守
   - §10 acceptance criteria 14 項目すべて green が completion 条件
   - 1 PR で完結 (Phase 2B-1 / 2B-2 / 2B-3 と同等規模)
3. boss smoke test → 必要なら smoke fix microbatch
4. その後 → Phase 2B-3.2 spec batch (publish-package distribute / batch approve / multi-asset)
5. **更に将来 (別 Phase)** → Visual Register retirement (share library extraction)
