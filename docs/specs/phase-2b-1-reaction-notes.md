# Phase 2B-1 Detail Spec — W3 reactionNotes write

最終更新: 2026-05-20 (Q-6 / Q-8 / Q-10 boss confirmed)
ステータス: **spec finalized**, ready for implementation batch (no implementation yet, no schema change, no Sanity write)
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体)

## Confirmed decisions

### Inherited from parent spec §0.5 (handoff/0175, 2026-05-20)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、Vercel production / preview には **絶対** に設定しない
- **Q-2** ✅: Production write actions は永久に disabled (将来も「特定 user 限定」の path は想定せず)。Write actions は **`enableWriteActions` flag + `SANITY_WRITE_TOKEN` 両方** が揃った local / dev runtime のみ発火
- **Q-7** ✅: Phase 2B-1 = W3 reactionNotes editing (本 spec) / Phase 2B-2 = W5 humanReviewGate state update (本 spec の next)

### Phase 2B-1 specific (handoff/0177, 2026-05-20)

- **Q-6 (undo)** ✅: in-memory previous value + 10 秒 toast undo。**No Sanity audit-log schema**, **no persistent undo log**。current UI session のみ、page reload / navigate away で undo 履歴消失。詳細 §7
- **Q-8 (conflict)** ✅: `_rev` mismatch 検出 → conflict message + reload prompt。**No 3-way merge UI**, **no last-write-wins**。詳細 §8
- **Q-10 (devlog)** ✅: 2B-1 では自動 devlog 生成なし。server `console.log` のみ (local debugging)。manual devlog (boss が `docs/devlog/` に手動 commit) が source of truth。詳細 §9

Remaining open questions (Q-3 / Q-4 / Q-5 / Q-9) は parent spec §6 で tracking、Phase 2B-1 では touch しない。

---

## 1. Goal and scope

### Goal

`campaignPlan.manualPublishingStatus[]._key === <key>` の **`reactionNotes`** field を、`/analytics` 上で inline 編集できるようにする。

### In scope

- `/analytics` の `<ReactionNotesCard>` と `<PendingMonitoringCard>` の 2 card のみ
- 単一 string field の patch (`set` operation)
- dry-run / execute 2-stage server action
- in-memory undo (current session のみ)
- `enableWriteActions` env flag 設計 + `SANITY_WRITE_TOKEN` の sanity check
- 既存 read path (`outputsListQuery`) の prop 拡張 (`_id` / `_key` の thread-through)

### Out of scope (本 spec の対象外)

- **Sanity schema 変更なし** (`manualPublishingStatus[]` schema は不変)
- **Auto-post なし** (X / note / Substack / Threads 等への外部 post は一切しない)
- **Publish-package mutation なし** (`publish-packages/` 配下のファイルは触らない)
- **他 field 編集なし** (`publishedUrl` / `publishedAt` / `state` / `platform` は **edit 不可**)
- **多 record bulk edit なし** (1 record / 1 patch / 1 transaction)
- **Sanity audit-log doc 作成なし** (in-memory + console のみ、Q-4 に該当 / Q-6 confirmed)
- **Persistent undo log なし** (Q-6 confirmed: in-memory + 10 秒 toast のみ)
- **自動 devlog 生成なし** (Q-10 confirmed: server `console.log` のみ、`docs/devlog/` への fs write なし)
- **3-way merge UI / last-write-wins なし** (Q-8 confirmed: `_rev` mismatch → reload prompt のみ)
- **`/publish-package/[slug]` での edit なし** (boss-protected layout を維持)
- **multi-step approval flow なし** (single confirm モーダルのみ)

---

## 2. Current UI audit

### 2-1. `<ReactionNotesCard>` 現状

ファイル: `dashboard/src/components/analytics/ReactionNotesCard.tsx` (92 行)

- Props: `rows: ReactionNoteRow[]`
- `ReactionNoteRow` shape: `{ campaignSlug, campaignTitle?, platform, reactionNotes, publishedAt? }`
- 表示: 直近 reactionNotes 記入済 row 一覧、PlatformBadge + campaign title + `fmtJstShort(publishedAt)` + line-clamp-2 で notes 抜粋 + 「公開パッケージを開く」 link
- empty state: 「反応ノートはまだ記録されていません。」 inline dashed card

**Inline edit が出るべき位置**: 各 `<li>` 内、line-clamp-2 で truncate された notes 段落の **右端 or 下** に 「編集」ボタン (disabled 時は `<DeferredActionButton>` 相当のスタイル)。クリックで line-clamp-2 が `<ReactionNoteEditor>` (新規 client component) に置換される。

### 2-2. `<PendingMonitoringCard>` 現状

ファイル: `dashboard/src/components/analytics/PendingMonitoringCard.tsx` (80 行)

- Props: `rows: PendingMonitoringRow[]`
- `PendingMonitoringRow` shape: `{ campaignSlug, campaignTitle?, platform, publishedAt, ageHours }`
- 表示: 公開後 24h+ で reactionNotes 未記入 row 一覧、PlatformBadge + campaign title + 「経過: NNh」 + 「記入」 link (現状は `/publish-package/<slug>#<platform>` に飛ぶ)
- empty state: 「24h 以上経過した公開で、反応メモ未記入のものはありません。」 inline dashed card

**Inline edit が出るべき位置**: 各 `<li>` 内の右端「記入」 link を **inline editor の trigger** に置換する。クリックで `<ReactionNoteEditor>` がその li の下に展開される (`<details>` 風)。

### 2-3. 共通: aggregation source

両 card とも `/analytics/page.tsx` 内の `buildReactionRows(outputsRaw)` / `buildPendingRows(outputsRaw)` が `OutputsListRaw.campaigns[].items[]` を walk して生成。`_id` (campaign の Sanity `_id`) と `_key` (manualPublishingStatus 要素の `_key`) は GROQ で既に取得しているが、現在の row interface には含めていない → **追加が必要**。

---

## 3. Data model

### 3-1. Sanity 編集対象

- **document type**: `campaignPlan`
- **document `_id`**: 各 campaign の `_id` (例: `campaignPlan.building-hitori-media-os`)
- **field**: `manualPublishingStatus[]` 配列内の特定要素 (`_key` で identify) の `reactionNotes` (string)

### 3-2. 必要な identifier

- `campaignId: string` — Sanity `_id`
- `itemKey: string` — `manualPublishingStatus[]._key`

両方とも GROQ で取得済 ([dashboard/src/lib/groq/outputs.ts:29,33](dashboard/src/lib/groq/outputs.ts:29))。

### 3-3. Server action Input shape

```ts
interface UpdateReactionNotesInput {
  campaignId: string         // 例: 'campaignPlan.building-hitori-media-os'
  itemKey: string            // manualPublishingStatus[]._key
  newReactionNotes: string   // 新しい値 (空文字 OK = clear)
  expectedRevision: string   // 楽観ロック用 Sanity _rev (Q-8 confirmed: execute 時必須、no last-write-wins)
  mode: 'dry-run' | 'execute'
}
```

### 3-4. Server action Output shape

```ts
type UpdateReactionNotesResult =
  | {
      ok: true
      mode: 'dry-run'
      campaignId: string
      itemKey: string
      previousValue: string | null
      newValue: string
      patchPreview: string  // human-readable diff or JSON-stringified patch
    }
  | {
      ok: true
      mode: 'execute'
      campaignId: string
      itemKey: string
      previousValue: string | null
      newValue: string
      committedAt: string   // ISO timestamp
      newRevision: string   // Sanity _rev after patch
    }
  | {
      ok: false
      error: 'validation' | 'missing-token' | 'write-disabled'
            | 'permission' | 'not-found' | 'conflict' | 'unknown'
      message: string
    }
```

### 3-5. 編集 **しない** もの

- `manualPublishingStatus[].publishedUrl` (reflect-publication-state.mjs の範囲)
- `manualPublishingStatus[].publishedAt`
- `manualPublishingStatus[].state`
- `manualPublishingStatus[].platform`
- `manualPublishingStatus[]._key` (Sanity 内部 identifier、絶対不変)
- 他 campaignPlan field (`title` / `coreThesis` / `humanReviewGates[]` / 等)
- 他 document (`contentIdea` / `visualAssetPlan` / 等)

server action は **single `set` operation only** — 上記 field を patch 対象から弾く defensive check を入れる (実装時の `mapPatchKeysToFieldName` allow-list pattern)。

---

## 4. UI design

### 4-1. Read mode (default)

- `<ReactionNotesCard>` 内の各 row: 現行通り line-clamp-2 + 「編集」 button が右端
- `<PendingMonitoringCard>` 内の各 row: 現行通り「記入」 link、ただし click 時に inline editor 展開

### 4-2. Edit mode

- `<textarea>` (rows=3, max 2000 chars) + 「保存 (dry-run)」 button + 「キャンセル」 button
- textarea 上部に label: `<platform> · <campaign>` (どの record を編集中か明示)
- textarea 下部に hint: 「24-72h 後の反応メモ。Markdown は plain text で保存されます」
- dirty state: 「保存 (dry-run)」 button は dirty (現値と新値が違う) のときだけ enable

### 4-3. Save / cancel flow

1. ユーザーが textarea を編集 → 「保存 (dry-run)」 click
2. server action `updateReactionNotes` を `mode: 'dry-run'` で呼ぶ
3. dry-run 成功 → confirm モーダル: `<previousValue>` (before) / `<newValue>` (after) の diff preview
4. モーダル内「実行 (execute)」 click → server action を `mode: 'execute'` で呼ぶ
5. execute 成功 → toast「保存しました」 + 「元に戻す」 button (10 sec visible)
6. cancel: textarea 値を `previousValue` に戻して read mode に戻る

### 4-4. Empty note state

- `reactionNotes === ''` または `undefined` の場合: 「(未記入)」を italic で表示、「編集」 button は同じ位置に表示
- edit mode で空文字を保存することも OK (= 削除と同義、`unset` ではなく `set: ''` を使う)

### 4-5. Disabled state — write actions unavailable

- `enableWriteActions === false` または `SANITY_WRITE_TOKEN` 未設定: 「編集」 button を `<DeferredActionButton>` 相当 (disabled + cursor-not-allowed + tooltip「dashboard write は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ」)
- production deploy ではこの state がデフォルト → boss は触れない

### 4-6. Loading state

- 「保存 (dry-run)」/「実行 (execute)」 click 後: button が spinner + `aria-busy`、textarea は readOnly
- 期待 latency: dry-run ~200-500ms / execute ~500-1500ms (Sanity API ラウンドトリップ)

### 4-7. Error state

- inline error message (textarea 下部 rose-200 banner) + 適切なリカバリ hint:
  - `validation`: 「入力内容に問題があります: <message>」
  - `missing-token`: 「SANITY_WRITE_TOKEN が設定されていません」
  - `write-disabled`: 「ENABLE_WRITE_ACTIONS が off です」
  - `permission`: 「Sanity の token に書き込み権限がありません」
  - `not-found`: 「対象 record が見つかりません (delete された可能性)」
  - `conflict`: 「他で編集された可能性があります。画面を更新してください」 + 「更新」 button
  - `unknown`: 「保存に失敗しました: <message>」

### 4-8. Success state

- 確認モーダル → 「実行 (execute)」 後 → モーダル閉じる → 該当 li 内 row が read mode に戻る + 新値が即表示 (server から返ってきた `newValue` を local state に反映)
- toast (10 sec): 「保存しました — <campaignSlug> · <platform>」 + 「元に戻す」 button
- 「元に戻す」 click → server action を `mode: 'execute'` で `newReactionNotes = previousValue` で再 call

---

## 5. Server action design

### 5-1. 提案 action 名 + 設置場所

- **action 名**: `updateReactionNotes`
- **ファイル**: `dashboard/src/lib/actions/updateReactionNotes.ts` (新規ディレクトリ `lib/actions/` を作る)
- **`'use server'`** directive つきで export

### 5-2. Function signature (proposed)

```ts
'use server'

import {z} from 'zod' // ← NOT required; native validation で十分。zod を追加しない方針
import {createClient} from '@sanity/client'
import {enableWriteActions, sanityConfig} from '@/lib/featureFlags'

export interface UpdateReactionNotesInput {
  campaignId: string
  itemKey: string
  newReactionNotes: string
  expectedRevision?: string
  mode: 'dry-run' | 'execute'
}

export type UpdateReactionNotesResult = /* see §3-4 */

export async function updateReactionNotes(
  input: UpdateReactionNotesInput,
): Promise<UpdateReactionNotesResult> {
  // 1. Input validation (manual)
  // 2. enableWriteActions check
  // 3. SANITY_WRITE_TOKEN check
  // 4. Build write client (token-bearing, useCdn: false)
  // 5. Read target doc + verify _id / _key exist
  // 6. Build patch: client.patch(campaignId, { ifRevisionID: expectedRevision }).set({...})
  // 7. mode='dry-run' → return preview, do NOT commit
  // 8. mode='execute' → client.transaction([patch]).commit() → return result
  // 9. Catch & map errors
}
```

依存追加なし (`@sanity/client` は既存)。

### 5-3. Input validation (no zod)

- `campaignId`: `typeof === 'string'` && starts with `campaignPlan.` && length 4-200
- `itemKey`: `typeof === 'string'` && matches `/^[a-zA-Z0-9_-]{4,64}$/` (Sanity `_key` の標準形)
- `newReactionNotes`: `typeof === 'string'` && `.length <= 2000` (任意上限、edge case は server で hard reject)
- `expectedRevision`: **required** `string` (Q-8 confirmed: 必ず `ifRevisionID` に渡して `_rev` mismatch を強制検知。`expectedRevision` 未指定の execute は `validation` エラーで reject)
- `mode`: `'dry-run' | 'execute'`、不正値は `validation` エラー

### 5-4. Token check

```ts
const writeToken = process.env.SANITY_WRITE_TOKEN
if (!writeToken) return { ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN not set' }
```

### 5-5. `enableWriteActions` check

```ts
if (!enableWriteActions) return { ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off' }
```

(`enableWriteActions` は `lib/featureFlags.ts` に新規 export 追加)

### 5-6. Dry-run behavior

- Sanity から target doc を read (`client.fetch('*[_id == $id][0]', { id: campaignId })`)
- `manualPublishingStatus` 配列内に `_key === itemKey` の要素が存在することを確認
- 存在しなければ `error: 'not-found'`
- 存在すれば previousValue (`.reactionNotes || ''`) を捕捉、patch object を build (commit せず)
- patch preview を JSON string で return

### 5-7. Execute behavior

- dry-run と同じ read を実行 (再 fetch、`_rev` 取得)
- **`expectedRevision` を `ifRevisionID` で `client.patch` に必ず渡す** (Q-8 confirmed: 楽観ロックを強制、no last-write-wins) → `_rev` mismatch で Sanity が `409` を返したら `conflict` error
- `client.transaction([patch]).commit({ autoGenerateArrayKeys: false })` で atomic commit
- 成功すれば newRevision + committedAt を return

### 5-8. Return shape

§3-4 と同じ。Success / failure を判別する `ok: boolean` discriminated union。

---

## 6. Safety model

### 6-1. Local / dev only

- server action 起動時に `process.env.NODE_ENV` と `enableWriteActions` を チェック
- production / preview deploy では `enableWriteActions === false` が保証される ( env で `ENABLE_WRITE_ACTIONS=true` を設定しないため)
- 防御 layer は 4 重:
  1. `enableWriteActions` flag (env)
  2. `SANITY_WRITE_TOKEN` 存在 (env)
  3. server action 内の field allow-list (`reactionNotes` のみ)
  4. `_id` + `_key` validation (regex / format check)

### 6-2. Vercel production and preview disabled

- `ENABLE_WRITE_ACTIONS` env 変数は **Vercel project に設定しない** (production scope / preview scope 両方とも)
- `SANITY_WRITE_TOKEN` env 変数も同様に Vercel に設定しない
- 両方欠ければ server action は確実に `write-disabled` または `missing-token` で abort

### 6-3. `SANITY_WRITE_TOKEN` 不在時の動作

- server action: `error: 'missing-token'` を返す、Sanity に touch しない
- UI: 「編集」 button が disabled + tooltip 表示

### 6-4. No broad document patching

- patch は **`reactionNotes` 単一 field のみ**
- `client.patch(...).set({})` 内の object は `{ ['manualPublishingStatus[_key=="<key>"].reactionNotes']: newValue }` の **1 key**
- 実装時に key allow-list を hardcoded で validate

### 6-5. Single-field patch only

- 同 transaction 内で他 field を触らない
- 他 record を含めない
- bulk update なし

### 6-6. No schema change

- `campaignPlan.manualPublishingStatus[].reactionNotes` は既存 schema 上の field (type: string、optional)
- spec も実装も schema を変更しない

---

## 7. Undo strategy — Q-6 CONFIRMED (2026-05-20)

### Confirmed: in-memory previous value、current UI session のみ

- server execute response に `previousValue` を含める (§3-4 の output shape)
- client (React component) で previousValue を 1 record 分だけ React state に保持
- toast 内「元に戻す」 button が表示されている間 (10 sec) は `previousValue` で server action を再呼び出し可能
- page reload / navigate away で undo は **失われる** (in-memory のみ)
- multiple undo / redo / history なし
- **No Sanity audit-log schema** (Q-4 は別 spec batch、Phase 2B-1 で touch しない)
- **No persistent undo log** (filesystem / Sanity 双方への永続化なし)

### Sanity 内 audit log を 2B-1 で使わない理由 (boss 確定 rationale)

- audit-log schema 拡張 (Q-4) は別 spec batch (boss が Q-4 を確定するまで保留)
- per-doc Sanity revisions API は read + restore に 2 round trip かかる + Sanity の保持期間制限あり (90 日)
- reactionNotes は人間が書いた prose、復元したいケースは「直前の 1 step」が大半 → in-memory で十分
- 永続 audit が必要なら boss が手動で `docs/devlog/` に commit する現運用を継続

---

## 8. Conflict handling — Q-8 CONFIRMED (2026-05-20)

### Confirmed: `_rev` mismatch → conflict message + reload prompt

- server action は `client.patch(id, { ifRevisionID: expectedRevision }).set({...})` で楽観ロック
- Sanity が `409 Conflict` を返したら server action は `error: 'conflict'` を返す
- UI: error banner 表示「他で編集された可能性があります。画面を更新してください」 + 「更新」 button (click で `router.refresh()`)
- **No 3-way merge UI** (diff / merge editor は実装しない)
- **No last-write-wins** (`ifRevisionID` を必ず付けて楽観ロックを強制、`expectedRevision` なしの patch は受け付けない)

### 2B-1 で複雑な merge UI を入れない理由 (boss 確定 rationale)

- solo boss workflow が現実、同時編集の発生頻度は極稀
- Sanity Studio + dashboard の同時セッションは存在し得るが、boss が dashboard で reactionNotes 編集中に Studio で同 record を触る確率は低い
- 実際 conflict が起きたら boss が「あ、Studio で開いてた」と気づくケースが大半 → reload で解決
- 複雑な merge UI を入れると実装範囲が大きく膨らむ、2B-1 の規模を維持
- last-write-wins を採用すると Sanity Studio 側の編集を黙って上書きするリスクがある → 明示的に reject + reload

---

## 9. Devlog / audit behavior — Q-10 CONFIRMED (2026-05-20)

### Confirmed: 自動 devlog 生成なし、server console log のみ

- server action 内で `console.log` server-side ログを書く (request metadata: target campaignId, itemKey, mode, success/failure, latency)
- token / new value 本文は **絶対 log しない** (`reflect-publication-state.mjs` の contract と同じ)
- console log は **local debugging 用途のみ** — Next.js dev server / `next start` の stdout に出るだけで、persistent file には書かない
- in-memory client log は dashboard 内に持たない (= UI 上の log panel は 2B-1 で作らない)
- **No automatic devlog generation** (`docs/devlog/` への append を server action から実行しない)
- **Manual devlog remains source of truth**: boss が「重要な編集をした日」を `docs/devlog/` に手動 commit する現運用を継続

### 2B-1 で自動 devlog 生成を入れない理由 (boss 確定 rationale)

- 「dashboard が docs/devlog/ にファイル書き込み」は新たな fs write surface、安全 model の追加層が必要
- Phase Admin 1 全体の boss 運用は「devlog は手動 commit、Claude Code が batch 完了時に 1 ファイル生成」の流れ → 自動生成は boss の判断 sense を弱める懸念
- Q-4 (Sanity audit log doc schema 拡張) が確定した後に再評価可

---

## 10. Environment variables

### 10-1. 最終 env 名

| 変数名 | 設置場所 | 役割 |
|---|---|---|
| `ENABLE_WRITE_ACTIONS` | `dashboard/.env.local` のみ | Phase 2B write actions の master switch (`'true'` で有効、それ以外で無効) |
| `SANITY_WRITE_TOKEN` | `dashboard/.env.local` のみ | Sanity write 用 token (Editor role)、絶対に Vercel に設定しない |

既存 `ENABLE_DIAGNOSTICS` / `ENABLE_LOCAL_FS_ROUTES` と同じ UPPER_SNAKE 命名で一貫性を保つ。

### 10-2. `.env.local` 例 (boss が手動で書く)

```ini
# Existing
NEXT_PUBLIC_SANITY_PROJECT_ID=5f79ed6q
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
SANITY_READ_TOKEN=<existing-viewer-token>

# Phase 2B-1 additions (boss が手動で設定、上の SANITY_READ_TOKEN とは別 token)
ENABLE_WRITE_ACTIONS=true
SANITY_WRITE_TOKEN=<editor-role-token-from-sanity-manage>
```

`SANITY_WRITE_TOKEN` は **Viewer ではなく Editor role**。Sanity manage UI で新規発行する。

### 10-3. Production / preview 禁止

- Vercel project の Environment Variables UI で `ENABLE_WRITE_ACTIONS` と `SANITY_WRITE_TOKEN` を **絶対に設定しない**
- production / preview scope 両方とも空欄を厳守
- deployment runtime で `enableWriteActions === false` + `SANITY_WRITE_TOKEN === undefined` が保証される → server action は確実に abort
- `dashboard/README.md` の **Environment** セクションに「Do not add SANITY_WRITE_TOKEN to Vercel」の警告 1 行追加 (2B-1 実装 batch 内で同時 update)

### 10-4. Feature flag interaction

`lib/featureFlags.ts` に新規 export:

```ts
function envFlagOn(name: string): boolean {
  return process.env[name] === 'true'
}

export const enableWriteActions = envFlagOn('ENABLE_WRITE_ACTIONS')
// Phase 2B safety: writes are gated by BOTH this flag AND SANITY_WRITE_TOKEN.
// Production deploys must keep this off; see docs/specs/phase-2b-1-reaction-notes.md §10.
```

dev default は `false` (`ENABLE_WRITE_ACTIONS=true` を boss が明示的に設定して初めて有効)。既存の `ENABLE_DIAGNOSTICS` / `ENABLE_LOCAL_FS_ROUTES` (dev default `true`) とは挙動が逆な点に注意 — write は **opt-in** 設計。

---

## 11. Error mapping

| error kind | trigger | UI message | recovery |
|---|---|---|---|
| `validation` | input shape / field length / format 不正 | 「入力内容に問題があります: <message>」 | textarea を直して再 submit |
| `missing-token` | `SANITY_WRITE_TOKEN` 未設定 | 「SANITY_WRITE_TOKEN が設定されていません」 | boss が `.env.local` に追加、dev server 再起動 |
| `write-disabled` | `enableWriteActions === false` | 「ENABLE_WRITE_ACTIONS が off です」 | boss が `.env.local` に `ENABLE_WRITE_ACTIONS=true` 設定、再起動 |
| `permission` | Sanity API が 401 / 403 を返す (token に write 権限なし) | 「Sanity の token に書き込み権限がありません」 | Editor role の新 token を発行して `.env.local` 更新 |
| `not-found` | `campaignId` doc 不在、または `_key === itemKey` の array element なし | 「対象 record が見つかりません」 | 画面を再読み込みして最新状態を確認 |
| `conflict` | `_rev` mismatch (409) | 「他で編集された可能性があります。画面を更新してください」 | 「更新」 button → `router.refresh()` |
| `unknown` | 上記以外の Sanity / network error | 「保存に失敗しました: <message>」 | 再試行、それでも続けば boss が console log 確認 |

---

## 12. Test plan

### 12-1. Manual tests (boss が dev server 起動で確認)

1. **環境 setup**:
   - `dashboard/.env.local` に `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>` 設定
   - `cd dashboard && npm run dev`
2. **正常系**:
   - `/analytics` 表示 → ReactionNotesCard 内の row で「編集」 button 表示
   - click → textarea 出現 → 文字入力 → 「保存 (dry-run)」 → 確認モーダル
   - 「実行」 → toast「保存しました」 + 「元に戻す」 button (10 sec)
   - Sanity Studio で同 record を確認 → 新 reactionNotes が反映されている
3. **Undo**:
   - 上記の toast 内「元に戻す」 click → 旧値が復元、再 toast「元に戻しました」
4. **PendingMonitoringCard**:
   - 24h+ 経過 + reactionNotes 未記入 row で「記入」 click → 同じ editor 展開 → 保存 → row が消える (`/analytics` re-render で PendingMonitoringRows から除外)
5. **Empty note**:
   - 既存 reactionNotes ありの row で textarea を空にして保存 → Sanity Studio で空文字保存される

### 12-2. Negative tests

| シナリオ | 期待結果 |
|---|---|
| `SANITY_WRITE_TOKEN` を `.env.local` から削除して dev server 再起動 | 「編集」 button が disabled、tooltip 表示 |
| `ENABLE_WRITE_ACTIONS=false` で dev server | 同上 |
| 両方なし | 同上 |
| Sanity Studio で同 record の `_rev` を更新 (=他で編集) → dashboard で execute | error: `conflict`、「更新」 button 表示 |
| token を Viewer role にすると Sanity が 403 | error: `permission` |
| campaignId を改竄 (URL hack or DevTools) | server action `validation` で reject、Sanity touch せず |
| `itemKey` を存在しない値に | error: `not-found` |
| 2001 字の reactionNotes を submit | `validation` error: `length > 2000` |

### 12-3. Unit tests

- `lib/actions/updateReactionNotes.ts` の input validation: 8 ケース (campaignId format / itemKey format / length 上限 / mode enum / etc.) — Vitest or builtin Node test runner、test framework 追加なし方針なら **省略** (manual tests に統合)
- Phase 2B-1 spec では unit test framework 追加 = scope creep、**省略推奨**

### 12-4. Build validation

```bash
cd dashboard && npm run build  # 23 routes 維持
npm run build                  # Sanity Studio clean
```

両 build が green であること + TypeScript clean。

### 12-5. Conflict simulation

- Sanity Studio で同 record を開いて reactionNotes を編集 + 保存 (=`_rev` インクリメント)
- 並行で dashboard `/analytics` で同 record の「編集」 → dry-run → execute
- 期待: execute で `conflict` error、「更新」 button で復旧

---

## 13. Implementation batch proposal

### 13-1. 実装 batch で **新規**作成するファイル (3)

| File | 役割 |
|---|---|
| `dashboard/src/lib/actions/updateReactionNotes.ts` | server action 本体 (§5) |
| `dashboard/src/components/analytics/ReactionNoteEditor.tsx` | client component (textarea + dirty + confirm modal + toast) |
| (optional) `dashboard/src/lib/actions/sanityWriteClient.ts` | write client factory (token gating + sanityConfig 流用) — または `updateReactionNotes.ts` 内に inline |

### 13-2. 実装 batch で **更新**するファイル (5)

| File | 変更内容 |
|---|---|
| `dashboard/src/lib/featureFlags.ts` | `enableWriteActions` export 追加 (§10-4) |
| `dashboard/src/lib/groq/outputs.ts` | `ReactionNoteRow` 系の型に `campaignId: string` と `itemKey: string` を追加 (既に GROQ では `_id` / `_key` 取得済) |
| `dashboard/src/app/analytics/page.tsx` | `buildReactionRows` / `buildPendingRows` で `campaignId` + `itemKey` を thread-through |
| `dashboard/src/components/analytics/ReactionNotesCard.tsx` | row 内に「編集」 button + `<ReactionNoteEditor>` 統合、`enableWriteActions` prop を受ける |
| `dashboard/src/components/analytics/PendingMonitoringCard.tsx` | 「記入」 link を inline editor trigger に置換、同 prop 追加 |
| `dashboard/README.md` | Environment セクションに `ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` の説明 + Vercel 禁止の警告 |

合計 **6 ファイル更新 + 2-3 ファイル新規 = 8-9 ファイル変更**。1 PR で完結する規模。

### 13-3. 実装 batch で **触らない** もの

- Sanity schema (`schemas/campaignPlan.ts` 等)
- `tools/sanity/reflect-*.mjs` (既存 controlled-write script 並存)
- `tools/visual-register/server.mjs`
- `publish-package/` files
- `assets/visuals/` / `assets/inbox/generated/` / `patches/`
- 他 dashboard page (`/configurator`, `/publish`, `/outputs`, `/campaigns/*`, `/visual-assets/*`, `/knowledge`, `/settings`, `/publish-packages`, `/activity-log`, `/diagnostics`, `/human-review-gates`, `/publish-package/[slug]`)
- 他 server action (none exists yet; 2B-1 が最初)
- `package.json` (依存追加なし)

### 13-4. Acceptance criteria

1. **build**: `cd dashboard && npm run build` が 23 routes すべて green、TypeScript clean
2. **Sanity Studio build**: `npm run build` (repo root) clean
3. **Default behavior**: `ENABLE_WRITE_ACTIONS` / `SANITY_WRITE_TOKEN` 未設定 (= 既存 dev 環境 + production 全て) で「編集」 button が disabled、`/analytics` の旧 read-only 振る舞いが完全維持
4. **Enabled behavior**: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN` 設定 で `/analytics` の reactionNote 編集が動作 (manual test §12-1 1-5 が全通る)
5. **Negative tests**: §12-2 の 8 シナリオすべてが期待通り error を出す
6. **Security**: `SANITY_WRITE_TOKEN` が client bundle に inline されていない (`grep` で確認 — Next.js は `NEXT_PUBLIC_` prefix なしの env を server-only に保つ)
7. **Side effects**: Sanity 上の `manualPublishingStatus[].reactionNotes` 以外の field が触られていない (Sanity Studio で diff 確認)
8. **No schema change**: `schemas/` に diff なし
9. **No publish-package mutation**: `publish-packages/` に diff なし
10. **Backwards compat**: 既存 `/analytics` `/campaigns/*` `/publish-package/[slug]` の動作変化なし

---

## 14. Out of scope (本 spec 対象外)

- Phase 2B-2 (W5 humanReviewGate state update) — 次 spec batch
- Phase 2B-3 (W1 visual approve & register bridge) — boss Q-3 確定後
- Phase 2B-4 (W4 campaign metadata light edit) — 後続
- Phase 2B-5 (W6 publishedOutput update) — optional
- audit-log schema (Q-4) — 別 spec batch
- multi-user / team workspace (Phase Settings-2)
- 外部 API integration (Phase Analytics-2)
- Tabs integration P1 for `/campaigns/[slug]` — UI polish、Phase 2B と独立
- `DeferredActionButton` / `LocalModeBanner` 削除 — Phase 2B 全完了後

---

## 15. Post-spec next step

1. ~~**boss が本 spec を read** + Q-6 / Q-8 / Q-10 推奨案 + 環境変数名 + 実装ファイル提案に approve~~ → **Done 2026-05-20** (handoff/0177)
2. **次 → Phase 2B-1 implementation batch を起動** (詳細は §13-1 / §13-2 / §13-4)
   - 新規 3 ファイル + 更新 5-6 ファイル = 8-9 ファイル変更を 1 PR で完結
   - 受け入れ基準 §13-4 の 10 項目すべて green が implementation 完了条件
3. その後 → Phase 2B-2 spec batch (W5 humanReviewGate state update)、Phase 2B-1 で固めた template (8 UI state / 9 step server action / 4 layer safety) を流用
