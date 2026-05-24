# Phase 2B-2 Detail Spec — W5 humanReviewGate state update

最終更新: 2026-05-21 (smoke test PASS)
ステータス: **implemented + smoke PASS** (implementation 2026-05-20 / explicit "状態を変更" control + `/campaigns/[slug]` read-only 2026-05-21 / boss smoke PASS confirmed 2026-05-21 — handoff/0186)
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体)
前 spec: [docs/specs/phase-2b-1-reaction-notes.md](./phase-2b-1-reaction-notes.md) (W3 reactionNotes、smoke validated 2026-05-20)

## 0. Confirmed decisions (inherited)

### Parent batch (handoff/0175, 2026-05-20)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、Vercel scope (production / preview / development) には絶対設定しない
- **Q-2** ✅: Production write は永久 disabled、`enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local / dev のみ発火
- **Q-7** ✅: Phase 2B-2 = W5 humanReviewGate state update (本 spec)

### Phase 2B-1 batch (handoff/0177, 2026-05-20)

Phase 2B-1 で確定し、本 spec でも **そのまま流用** する:

- **Q-6 (undo)** ✅: in-memory previous value + 10秒 toast undo、Sanity audit-log schema なし、persistent undo log なし
- **Q-8 (conflict)** ✅: `_rev` mismatch → conflict message + reload prompt、no 3-way merge UI、no last-write-wins
- **Q-10 (devlog)** ✅: 自動 devlog 生成なし、server `console.log` のみ (local debugging)、manual devlog が source of truth

### Phase 2B-1 implementation lessons (handoff/0178 + 0179)

実装 + smoke fix で得た知見を 2B-2 にも反映:

- `expectedRevision: string` (required) で楽観ロックを強制
- Server で `_rev` を再 fetch して mismatch を patch 前に検知 (Sanity の `ifRevisionID` + 二重防御)
- Field allow-list を server action 内で hardcode (`set` operation の key を allowlist 経由でのみ build)
- `getSanityWriteClient()` factory を **再利用** (新規 write client を作らない)
- `enableWriteActions` 判定を `featureFlags.ts` から再利用 (新規 flag を増やさない)
- Undo toast は **stable parent host (Context provider)** に置く — row / row card の unmount に耐える設計
- Topbar の `<ReadOnlyPill>` は `writeReady` を AppShell で評価済、本 batch でも追加変更なし

### Phase 2B-2 batch (handoff/0181, 2026-05-20)

Boss confirmed all 7 open questions specific to this spec:

- **Q-2B2-1 (state enum)** ✅: **Schema 不変**。existing 6 値のみで運用 (`not-started` / `in-progress` / `pending-review` / `done` / `blocked` / `skipped`)。`approved` ≡ `done`、`rejected` は理由により `blocked` (差し戻し) または `skipped` (放棄) のどちらかに operationally mapping。新規 enum 値を schema に追加しない。
- **Q-2B2-2 (confirm modal)** ✅: terminal 遷移 (`done` / `skipped`) のみ confirm modal を出す。非 terminal 遷移は 1-click commit + undo toast で救う。
- **Q-2B2-3 (completedAt)** ✅: 本 batch では **`humanReviewGates[_key].state` 単一 field のみ** patch。`reviewer` / `notes` / `completedAt` / timestamps は touch しない。
- **Q-2B2-4 (undo host)** ✅: Phase 2B-1 の `<AnalyticsToastHost>` を **`<UndoToastHost>` (or 同等の汎用名)** に refactor/rename。同じ in-memory 10秒 undo pattern を再利用。persistent undo log なし、audit-log schema なし。
- **Q-2B2-5 (UI control)** ✅: **Dropdown UI** を使う。button group は採用しない。
- **Q-2B2-6 (allow-list 防御)** ✅: **両方** で enforce — UI が available transitions を filter する + server action が `transition-not-allowed` で reject する (defense-in-depth)。
- **Q-2B2-7 (undo session scope)** ✅: tab / page navigation で undo opportunity が失われるのは **intentional**。Current UI session 限定 (Q-6 准拠)。

Remaining open questions (Q-3 / Q-4 / Q-5 / Q-9) は parent spec §6 で tracking 継続、Phase 2B-2 では touch しない。

---

## 1. Goal and scope

### Goal

`campaignPlan.humanReviewGates[]._key === <key>` の **`state`** field を dashboard から更新可能にする。

**Smoke fix 0183 revision (2026-05-21)**: 編集 surface は **`/human-review-gates` 単独** に絞る。`/campaigns/[slug]` の「確認ゲート」 tab は read-only のまま、`/human-review-gates` への明示的 link で edit 動線を案内する。Status badge は表示専用、編集は別の explicit「状態を変更」 button で行う。

### In scope

- `/human-review-gates/page.tsx` の row ごとに state transition control を表示
  - Status badge は表示専用 (`<StatusBadge>`)
  - **その横に explicit `[状態を変更 ▾]` button** が並ぶ (smoke fix 0183、affordance 明示化)
  - 終端 state (`done` / `skipped`) は button の代わりに「終了状態」 chip を表示
- `/campaigns/[slug]/page.tsx` の `<GatesSection>` は **read-only** で維持 (smoke fix 0183、observation-focused にする)
  - badge + reviewer / completedAt / notes 表示のみ
  - 「確認待ちゲートで状態を変更する」 link で `/human-review-gates` に案内
- 単一 `state` field の patch (`set` operation)
- dry-run / execute 2-stage server action
- in-memory undo (current session のみ、Phase 2B-1 と同じ pattern)
- `expectedRevision` 必須 + server-side 二重 verify
- `enableWriteActions` flag + `SANITY_WRITE_TOKEN` の AND-gate (Phase 2B-1 と同じ)
- GROQ projection に `_rev` (campaign) + `_key` (gate) を thread-through (`campaignDetailBySlugQuery` / `pendingHumanReviewGatesQuery`)
- Existing label helpers (`statusJa.ts`) を再利用、gate-specific labels は `stateTransitions.ts` に閉じ込め

### Out of scope (本 spec の対象外、§7 で再列挙)

- **Sanity schema 変更なし** (`humanReviewGates[]` schema は不変、既存 6 状態のみで運用)
- **reviewer 編集なし** (state field のみ、`reviewer` / `notes` / `completedAt` は本 batch で touch しない — Phase 2B-2.1 microbatch 候補)
- **multi-user reviewer assignment なし** (solo boss workflow を維持)
- **notification system なし** (email / webhook / slack 等)
- **Visual Register approval なし** (W1 = Phase 2B-3+ で別 batch)
- **Asset finalization なし** (publish-package 不変)
- **Sanity audit-log doc 作成なし** (Q-4 確定後)
- **自動 devlog 生成なし** (Q-10 confirmed)
- **多 gate bulk transition なし** (1 record / 1 patch / 1 transaction)

---

## 2. Current state audit

### 2-1. Sanity schema (`schemas/campaignPlan.ts:546-588`)

`campaignPlan.humanReviewGates[]` 配列の要素 schema:

| Field | Type | 役割 |
|---|---|---|
| `gateName` | string | gate 識別子 (例: "selectedPlatforms 確認", "release-review final") |
| `state` | string (controlled vocabulary) | **本 spec の write 対象** |
| `reviewer` | string (optional) | 担当者 (例: "人間（自分）", "編集者A") — **本 batch では touch しない** |
| `completedAt` | datetime (optional) | 完了時刻 — **本 batch では touch しない** |
| `notes` | text (optional) | gate-level メモ — **本 batch では touch しない** |

### 2-2. Existing state enum (schema authoritative)

schema の `state` の controlled vocabulary は **6 値** (boss prompt は 7 値を candidate 列挙したが、`approved` / `rejected` は schema に存在しない):

| Schema value | UI label (statusJa.ts) | Tone | 意味 |
|---|---|---|---|
| `not-started` | 未着手 | slate (pending) | 未開始 |
| `in-progress` | 作業中 | amber (progress) | 進行中 |
| `pending-review` | 確認待ち | amber (progress) | レビュー待ち |
| `done` | 完了 | emerald (done) | **完了 = approved 相当** |
| `blocked` | 要対応 | rose (blocked) | ブロック中 |
| `skipped` | スキップ | slate (pending) | スキップ |

**Important** (Q-2B2-1 CONFIRMED 2026-05-20): schema は `approved` / `rejected` を持たず、**schema は不変** で運用する。Mapping は次の通り:
- `approved` ≡ `done` (schema は「approve = done」の意で運用、UI label「完了にする」 = approve action)
- `rejected` は理由に応じて operationally mapping:
  - 差し戻しが必要 (boss が後で再開する) → `blocked`
  - 完全に放棄 (このゲートは行わない) → `skipped`
- schema migration / 新規 enum 値追加は本 batch + 後続 Phase 2B サブバッチでも **行わない**。

### 2-3. GROQ queries (`dashboard/src/lib/groq/campaign.ts`)

| Query | 用途 | 現状 projection |
|---|---|---|
| `campaignDetailBySlugQuery` (L9-95) | `/campaigns/[slug]` | full array `humanReviewGates[]{...}` |
| `campaignListQuery` (L100-123) | `/campaigns` 一覧 | gate count only |
| `dashboardHomeQuery` (L126-212) | `/` ホーム | full latest + counts |
| `pendingHumanReviewGatesQuery` (L217-225) | `/human-review-gates` | flat list `{gateName, state, reviewer, completedAt, notes}` |

→ **本 spec では `campaignDetailBySlugQuery` と `pendingHumanReviewGatesQuery` に `_rev` (doc) + `_key` (gate) を追加する** projection 拡張のみ。他 query は変更しない。

### 2-4. UI surfaces

| Surface | File | 現状 |
|---|---|---|
| `/human-review-gates` aggregate page | `dashboard/src/app/human-review-gates/page.tsx` (L1-239) | bucket 別 (pending-review / in-progress / blocked / not-started) flat list、`StatusBadge` で state 表示、read-only |
| `/campaigns/[slug]` GatesSection | `dashboard/src/app/campaigns/[slug]/page.tsx` (`GatesSection` at L521-553) | 各 gate を list item で表示 (gateName + StatusBadge + reviewer + completedAt + notes)、read-only |

### 2-5. Existing CLI baseline for humanReviewGate writes

**存在しない**。`tools/sanity/reflect-publication-state.mjs` は `manualPublishingStatus[]` / `publishedOutput` 系のみ patch。humanReviewGate state の write は現状 **Sanity Studio 経由のみ**。Phase 2B-2 は dashboard を経由する初の write surface。

### 2-6. Existing label helpers

- `dashboard/src/lib/statusJa.ts` — JA_LABELS + TONE_MAP (上記 6 状態すべて network covered)
- `dashboard/src/components/common/StatusBadge.tsx` — `StatusBadge` component (tone-aware)

→ **本 spec で新規 label map を作らない**。state transition control 内の button label / dropdown option label も `statusJa.ts:statusLabelJa()` を経由。

---

## 3. Allowed state transitions

### 3-1. Transition graph (recommended)

```
not-started ──► in-progress ──► pending-review ──► done
     │              ▲               │     │
     │              │               │     ▼
     │              └─── blocked ◄──┘   (back to in-progress allowed)
     │              │
     ▼              │
   skipped ◄────────┘ (skip from any non-terminal state)

Terminal (no outbound transitions in 2B-2):
  - done
  - skipped
```

### 3-2. Allow-list (explicit, 13 transitions)

| From | To | UI control 文言 (案) | Confirm modal? |
|---|---|---|---|
| not-started | in-progress | 「作業を開始」 | No |
| not-started | pending-review | 「レビュー待ちにする」 | No |
| not-started | skipped | 「スキップ」 | **Yes** (terminal) |
| in-progress | pending-review | 「レビュー待ちにする」 | No |
| in-progress | blocked | 「ブロック」 | No |
| in-progress | done | 「完了にする」 | **Yes** (terminal) |
| in-progress | skipped | 「スキップ」 | **Yes** (terminal) |
| pending-review | in-progress | 「作業中に戻す」 | No |
| pending-review | done | 「完了にする」 (= approve 相当) | **Yes** (terminal) |
| pending-review | blocked | 「ブロック」 (= reject 相当 / 差し戻し) | No |
| pending-review | skipped | 「スキップ」 | **Yes** (terminal) |
| blocked | in-progress | 「作業を再開」 | No |
| blocked | skipped | 「スキップ」 | **Yes** (terminal) |

### 3-3. Explicitly **disallowed** transitions (2B-2 scope)

- `done` → anything (terminal、再開したければ Sanity Studio で手動編集)
- `skipped` → anything (terminal、同上)
- `not-started` → `done` / `blocked` (state を「飛ばす」のは UX 上の事故源)
- `pending-review` ↔ `pending-review` (no-op)
- 全 transition の reverse (例: `done` → `pending-review`) — undo path で previousValue に戻す path のみ使う

### 3-4. Undo (Phase 2B-1 と同じ pattern) の特殊扱い

Undo は 10 秒以内、in-memory の **「直前の commit を元に戻す」 操作のみ**。Undo 経由なら `done` → `pending-review` 等の **逆方向 patch も許可**:

- Server action は normal transition validation (§3-2 allow-list) を行うが、`isUndo: true` flag が立つと allow-list を bypass し、boss が直前に変更した直前値への復帰のみ許可
- Client 側で `previousState` を保持しているのは host (`AnalyticsToastHost` 相当 → 本 batch では汎用化または `/human-review-gates` 用 host 新設)
- Server は `isUndo === true` の場合に `previousValue: typeof === 'string'` + 既存 6 状態のいずれか、で validate

これは Phase 2B-1 reactionNotes (free text) と異なり、state field は controlled vocabulary なので allow-list 違反検知が server で可能 → undo path のために `isUndo` flag が必要。

---

## 4. Data model

### 4-1. Sanity 編集対象

- document type: `campaignPlan`
- document `_id`: 各 campaign の `_id`
- field: `humanReviewGates[]` 配列内の特定要素 (`_key` で identify) の `state` (string)

### 4-2. Server action Input shape

```ts
'use server'

import {z} from 'zod' // ← NOT required; native validation で十分。zod を追加しない方針 (Phase 2B-1 と同じ)

export type GateState =
  | 'not-started'
  | 'in-progress'
  | 'pending-review'
  | 'done'
  | 'blocked'
  | 'skipped'

export interface UpdateGateStateInput {
  campaignId: string         // 例: 'campaignPlan.building-hitori-media-os'
  gateKey: string            // humanReviewGates[]._key
  expectedRevision: string   // Sanity _rev (REQUIRED, Q-8 confirmed)
  nextState: GateState
  /** Set to true when invoked from the host's undo path. Bypasses the
   *  forward-only transition allow-list (§3-2) so the boss can roll back
   *  to the previous value within the 10-second window. */
  isUndo?: boolean
  mode: 'dry-run' | 'execute'
}
```

### 4-3. Server action Output shape

```ts
export type UpdateGateStateResult =
  | {
      ok: true
      mode: 'dry-run'
      campaignId: string
      gateKey: string
      previousState: GateState
      nextState: GateState
      currentRevision: string
    }
  | {
      ok: true
      mode: 'execute'
      campaignId: string
      gateKey: string
      previousState: GateState
      nextState: GateState
      newRevision: string
      committedAt: string
    }
  | {
      ok: false
      error:
        | 'validation'
        | 'missing-token'
        | 'write-disabled'
        | 'permission'
        | 'not-found'
        | 'conflict'
        | 'transition-not-allowed'  // 新規エラー: §3-2 allow-list 違反
        | 'unknown'
      message: string
    }
```

### 4-4. 編集 **しない** field

- `humanReviewGates[].gateName` (boss が後から変える想定なし)
- `humanReviewGates[].reviewer` (本 batch scope 外)
- `humanReviewGates[].completedAt` (本 batch scope 外 — automatic timestamp も入れない、boss が必要なら 2B-2.1 で `done` 遷移時の自動 set 検討)
- `humanReviewGates[]._key` (Sanity 内部 identifier、絶対不変)
- 他 `campaignPlan` field (`manualPublishingStatus` / `visualAssetDetails` / 等)

**Field allow-list は hardcoded** で `set` operation の key を `humanReviewGates[_key=="<key>"].state` のみに限定。

---

## 5. UI design

### 5-1. Read mode (writeReady = false / 全 production deploy)

現行 UI と完全同一:
- `<StatusBadge state={gate.state} />` で state 表示
- gateName / reviewer / completedAt / notes は read-only
- 編集 control は disabled な pill button + tooltip 「state 変更は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ」

### 5-2. Edit mode (writeReady = true、local-only)

**Q-2B2-5 CONFIRMED**: dropdown UI を採用、button group は採用しない。

**Smoke fix 0183 (2026-05-21) — affordance 明示化**: badge 自身は dropdown trigger に **しない**。boss feedback: badge が label に見えて click できると思わなかった → 編集が hidden に感じた。Solution: badge は read-only、その右に explicit `[状態を変更 ▾]` button を並べる。

```
[作業中]  [状態を変更 ▾]   ← 別ボタン (青系) を click で dropdown 展開
            ┌────────────────────┐
            │ → レビュー待ちにする   │
            │ → ブロックにする     │
            │ → 完了にする   [確認] │
            │ → スキップする [確認] │
            └────────────────────┘
```

終端状態 (`done` / `skipped`) は button を出さず、代わりに「終了状態」 chip を表示:

```
[完了]  [✓ 終了状態]   ← non-button chip、Studio で手動編集が必要
```

- 現在 state を起点に §3-2 allow-list に基づく transition **のみ** 表示 (Q-2B2-6 confirmed: UI 側でも事前 filter)
- 「確認」ラベル付きは terminal 遷移 → click で confirm modal
- 非 terminal 遷移は 1-click commit (Q-2B2-2 confirmed)
- Button は青系 (`bg-blue-50 text-blue-800 border-blue-300`) で明確な action affordance を持たせる
- Status badge は他 surface との視覚的整合性を保つため tone を維持 (緑 = done / amber = progress / 灰 = pending / 桃 = blocked / 黒灰 = idle)

### 5-3. Confirm modal (terminal 遷移時)

`done` / `skipped` への遷移は **確認モーダル** で 1 段階挟む:

```
┌──────────────────────────────────┐
│ ゲートを完了にしますか?              │
│                                  │
│ ゲート: selectedPlatforms 確認     │
│ 現在: 作業中                       │
│ 変更後: 完了                       │
│                                  │
│ ※ 完了後は dashboard では再開できません │
│  (Studio で手動変更が必要)          │
│                                  │
│      [キャンセル] [完了にする]      │
└──────────────────────────────────┘
```

- 「完了にする」 click → server action `mode: 'execute'` を invoke
- 「キャンセル」 click → modal 閉じる
- modal は overlay (body scroll lock + ESC で閉じる + focus trap)
- 非 terminal 遷移 (`in-progress` 等) は modal なし、1-click commit

### 5-4. Saving / saved / error

- saving: dropdown trigger が spinner + `aria-busy`、option click 不可
- saved: dropdown 閉じる + state badge 更新 + **`<UndoToastHost>` (or equivalent) に notifySaved を hand-off**
- error: dropdown 下に rose error banner (inline、editor 同等)
  - `conflict` → 「他で編集された可能性があります。画面を更新してください」 + 「更新」 button → `router.refresh()`
  - `transition-not-allowed` → 「この state には移れません: <message>」 + 閉じる
  - `permission` / `missing-token` / `write-disabled` → 既存 mapping

### 5-5. Undo toast (Phase 2B-1 と同じ)

- 保存成功 → 右下 emerald toast「ゲート state を変更しました。10秒以内なら元に戻せます。 — `<gateName>`」 + 「元に戻す」 / 閉じる
- toast の owner は **stable parent host**: §8 で files affected として list 化
- 10 秒内に「元に戻す」 click → server action を `isUndo: true` + `nextState: previousState` で再 invoke

### 5-6. Topbar pill

変更なし。Phase 2B-1 で実装済の `<ReadOnlyPill writeReady={writeReady} />` が `/human-review-gates` 上でも「ローカル書き込み有効」を表示する (AppShell-level evaluation のため全 page で機能)。

### 5-7. Disabled state (writeReady = false)

`<StatusBadge>` をそのまま残し、控えめな disabled pill を右端に並べる:

```
[作業中]  [編集不可 🔒]   ← tooltip で flag/token 要件を説明
```

production deploy では常にこの状態。

---

## 6. Server action design

### 6-1. 設置場所

- ファイル: `dashboard/src/lib/actions/updateGateState.ts` (新規、Phase 2B-1 の `updateReactionNotes.ts` と同 directory)
- `'use server'` directive 付き
- `getSanityWriteClient` を `./sanityWriteClient.ts` から **再利用** (新規 client 作らない)
- `enableWriteActions` を `@/lib/featureFlags` から **再利用**

### 6-2. 10 step flow

1. `enableWriteActions` check (false → `write-disabled`)
2. `SANITY_WRITE_TOKEN` check via `getSanityWriteClient()` (null → `missing-token`)
3. Input validation:
   - `campaignId` regex (Phase 2B-1 と同じ)
   - `gateKey` regex (`/^[a-zA-Z0-9_-]{4,64}$/`)
   - `expectedRevision` regex (Phase 2B-1 と同じ)
   - `nextState` は `GateState` enum
   - `isUndo` は `boolean | undefined`
   - `mode` enum
4. Fetch target doc: `*[_id == $id && _type == "campaignPlan"][0]{_id, _rev, humanReviewGates[]{_key, state}}`
5. `not-found` if doc absent
6. `conflict` if `doc._rev !== expectedRevision`
7. Find gate item by `_key`、`not-found` if absent
8. `previousState = item.state`
9. **Transition validation**:
   - `isUndo === true` → previousState (= current) ≠ nextState なら OK、step 10 へ (allow-list 無視)
   - `isUndo` 無 / false → `(previousState, nextState)` が §3-2 allow-list にあるか check、無ければ `transition-not-allowed`
10. dry-run → preview return / execute → `client.patch(id, {ifRevisionID}).set({['humanReviewGates[_key=="<key>"].state']: nextState})` → transaction commit → return `newRevision` + `committedAt`

### 6-3. Server console.log (Q-10 confirmed)

Phase 2B-1 と同じ stage 構造化 log。出すのは:
- `stage`, `mode`, `campaignId`, `gateKey`, `previousState`, `nextState`, `isUndo`, `elapsedMs`, `newRevision` (execute success 時)

出さないもの:
- token (絶対)
- `notes` (本 batch では touch しないので存在しないが defense-in-depth)
- `reviewer` (同上)

---

## 7. Safety model

Phase 2B-1 と同じ 4 layer safety、本 batch で **transition allow-list** が 5 層目として追加:

1. `enableWriteActions` env flag (cheapest reject)
2. `SANITY_WRITE_TOKEN` env presence
3. Input validation (regex / enum)
4. Document identity + `_rev` verification (server-side double-check)
5. **Transition allow-list** (`(previousState, nextState)` tuple が §3-2 に含まれるか、`isUndo` 時は bypass)
6. Field allow-list (`set` operation の key を `humanReviewGates[_key=="..."].state` のみに hardcode)

### 7-1. No broad document patching

- patch は **state 単一 field のみ**
- 同 transaction 内で他 field を触らない
- 他 record / 他 gate を含めない (bulk なし)

### 7-2. No schema change

- `humanReviewGates[].state` の controlled vocabulary は不変
- schema にも touch しない

### 7-3. Production permanently disabled

- `ENABLE_WRITE_ACTIONS` env を Vercel に設定しない契約
- `SANITY_WRITE_TOKEN` env を Vercel に設定しない契約
- production runtime では `enableWriteActions === false` && `getSanityWriteClient() === null`、server action は即 abort

---

## 8. Undo strategy — Q-2B2-4 + Q-2B2-7 CONFIRMED (2026-05-20)

### Confirmed: in-memory previous value + 10 秒 toast (Phase 2B-1 と同じ pattern)

- state field は controlled vocabulary なので「直前値」を保持するのが trivial (string 1 個)
- transition は単純な reverse patch で undo 可能
- Phase 2B-1 で boss が UX を validated 済、同じ操作感を保つ
- 「2 つの異なる undo pattern」 を学習させるより、ひとつの pattern を session 全体で一貫させる方が認知負荷低い
- **No persistent undo log** (Q-2B2-4 confirmed)
- **No audit-log schema** (Q-2B2-4 confirmed、Q-4 と整合)

### Implementation detail

- Host (`<UndoToastHost>`、Phase 2B-1 `<AnalyticsToastHost>` を refactor/rename した汎用 host — §10 参照) が `notifySaved({campaignId, gateKey, gateName, previousState, savedState, activeRevision})` を保持
- 「元に戻す」 click → server action を `isUndo: true` + `nextState: previousState` + `expectedRevision: activeRevision` で invoke
- Undo 成功 → toast dismiss + `router.refresh()`
- Undo failure → host が rose error banner (Phase 2B-1 と同じ)
- **Page navigation / Tab 切替 / 10 秒経過で undo 機会消失** (Q-2B2-7 confirmed: intentional、current UI session 限定、Q-6 准拠)

---

## 9. Cross-page strategy — Q-2B2-4 CONFIRMED (2026-05-20)

`/human-review-gates` と `/campaigns/[slug]` の 2 surface で同じ control + 同じ undo host が必要。

### Confirmed: 汎用 `UndoToastHost` に refactor/rename

Phase 2B-1 の `AnalyticsToastHost.tsx` を **rename + generalize**:
- 新 file path: `dashboard/src/components/common/UndoToastHost.tsx`
- Context type を generic に: `notifySaved` の payload を Phase 2B-1 / 2B-2 双方が consume 可能な shape にする
- Phase 2B-1 の analytics 側は import path だけ変更
- Phase 2B-2 の 2 surface (`/human-review-gates`, `/campaigns/[slug]`) でも import して使う
- **Low-risk な前提**: build green + 既存 analytics 動作不変 + 単一 file の rename + import path 書き換え 2 件のみ。万一 risk が顕在化したら別 host (`GateUndoToastHost`) 新設に fallback (implementation batch 内 judgement)

### 将来 cleanup (本 batch 対象外)

AppShell 全体への host lift (handoff/0179 §8 言及) は Phase 2B-3 以降に検討。本 batch では採用しない (scope 拡張)。

---

## 10. Files affected (as landed)

Q-2B2-4 CONFIRMED により Phase 2B-1 の `AnalyticsToastHost` を `UndoToastHost` に refactor/rename。Smoke fix 0183 で `/campaigns/[slug]` の編集統合を revert (read-only に戻す)。

### 10-1. 新規 (4)

| File | 役割 |
|---|---|
| `dashboard/src/lib/actions/updateGateState.ts` | `'use server'` action 本体 (§6) |
| `dashboard/src/components/gates/GateStateControl.tsx` | `'use client'` badge (read-only) + explicit「状態を変更」 button + dropdown + confirm modal — `/human-review-gates` 専用 |
| `dashboard/src/components/common/UndoToastHost.tsx` | 汎用 host (Phase 2B-1 の `AnalyticsToastHost` を rename + generalize) |
| `dashboard/src/lib/gates/stateTransitions.ts` | `HumanReviewGateState` 型 + 13 allowed transitions + helpers (label / tone / verb) |

### 10-2. 更新 (7)

| File | 変更内容 |
|---|---|
| `dashboard/src/lib/groq/campaign.ts` | `campaignDetailBySlugQuery` に `_rev` 追加、`pendingHumanReviewGatesQuery` の gates projection に `_key` 追加 + doc `_rev` 追加、`HumanReviewGate._key?` / `CampaignPlanDetail._rev?` / `PendingGatesByCampaign._rev?` 型追加 |
| `dashboard/src/app/human-review-gates/page.tsx` | 各 row に `<GateStateControl>` 統合、`<UndoToastHost>` で wrap、server-side `writeReady` 判定 |
| `dashboard/src/app/campaigns/[slug]/page.tsx` | **smoke fix 0183**: GatesSection は read-only に revert。`<GateStateControl>` import を削除、`<UndoToastHost>` wrap を削除、上部に「ここでは状態を表示のみ。変更は /human-review-gates から行います。」を表示、末尾に「確認待ちゲートで状態を変更する」 link |
| `dashboard/src/lib/statusJa.ts` | 変更なし (gate-specific labels は `stateTransitions.ts` に閉じ込め、cross-surface ripple を防ぐ) |
| `dashboard/src/components/StatusBadge.tsx` | 変更なし |
| `dashboard/src/components/analytics/ReactionNoteEditor.tsx` | `useUndoToast` の import path を `@/components/common/UndoToastHost` に書き換え + `notifySaved` payload を新 generic shape (`title` / `detail` / `onUndo`) に移行 |
| `dashboard/src/app/analytics/page.tsx` | `<AnalyticsToastHost>` import → `<UndoToastHost>` (path 変更) |
| `dashboard/README.md` | 「Phase 2B-1 write actions」 → 「Phase 2B write actions」 にgeneralize、2B-1 + 2B-2 surface 表、6-layer safety、13 transition allow-list 表 |

### 10-3. 削除 (1)

- `dashboard/src/components/analytics/AnalyticsToastHost.tsx` (`UndoToastHost.tsx` に rename + 場所移動済)

### 10-4. 触らないもの

- `schemas/` (Sanity schema)
- `tools/` (CLI / reflect-* scripts)
- `publish-package/` (boss-protected)
- `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (依存追加なし)
- Phase 2B-1 server action (`updateReactionNotes.ts`)、write client (`sanityWriteClient.ts`)、`featureFlags.ts` body

---

## 11. Environment variables

新規 env var **なし**。Phase 2B-1 の 2 変数を再利用:

- `ENABLE_WRITE_ACTIONS` (`dashboard/.env.local` 専用)
- `SANITY_WRITE_TOKEN` (`dashboard/.env.local` 専用)

Vercel 設定 contract は variance なし: 全 scope で **絶対に設定しない**。

---

## 12. Error mapping

| error kind | trigger | UI message | recovery |
|---|---|---|---|
| `validation` | input shape / regex / enum 不正 | 「入力内容に問題があります: <message>」 | 再選択 |
| `missing-token` | `SANITY_WRITE_TOKEN` 未設定 | 「SANITY_WRITE_TOKEN が設定されていません」 | `.env.local` 追加、dev server 再起動 |
| `write-disabled` | `enableWriteActions === false` | 「ENABLE_WRITE_ACTIONS が off です」 | `.env.local` 設定、再起動 |
| `permission` | Sanity API 401/403 | 「Sanity の token に書き込み権限がありません」 | Editor role token 再発行 |
| `not-found` | doc 不在 or gate `_key` 不在 | 「対象 gate が見つかりません」 | reload |
| `conflict` | `_rev` mismatch | 「他で編集された可能性があります。画面を更新してください」 | 「更新」 button → `router.refresh()` |
| `transition-not-allowed` | §3-2 allow-list 違反 | 「この state には移れません: <previousState> → <nextState>」 | dropdown を再展開、別 transition を選ぶ |
| `unknown` | その他 Sanity / network エラー | 「保存に失敗しました: <message>」 | 再試行、boss が server log 確認 |

---

## 13. Test plan

### 13-1. Manual smoke checklist

1. **Setup**: `dashboard/.env.local` に `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>`、`npm run dev`
2. **Topbar pill**: 「ローカル書き込み有効」 表示確認 (Phase 2B-1 で実装済、本 batch でも同じ)
3. **`/human-review-gates`**: 各 row に dropdown trigger 表示、現在 state を起点に allowed transitions が出る
4. **非 terminal 遷移**: `not-started` → `in-progress` 等、1-click commit → toast 表示 → Studio で state 確認
5. **Terminal 遷移**: `in-progress` → `done` を選ぶ → confirm modal 出る → 「完了にする」 click → toast 表示 → Studio で state 確認
6. **Undo**: toast 内「元に戻す」 click → previousState に戻る → 再 toast (or dismiss) → Studio で確認
7. **Conflict**: Sanity Studio で同 record の state を変更 → dashboard 上で別 transition 試行 → `conflict` error banner + 「更新」 button
8. **`/campaigns/[slug]`**: 「確認ゲート」 tab を開き、同じ dropdown が出ることを確認
9. **Disallowed transition**: server response が `transition-not-allowed` (manual な API tampering でしか起こせないので、開発者ツールでの直接 invoke として記録、boss check 不要)
10. **writeReady=false fallback**: `ENABLE_WRITE_ACTIONS=false` で再起動 → topbar amber、dropdown 不在 (元の StatusBadge のみ)
11. **token 削除**: `SANITY_WRITE_TOKEN` を `.env.local` から削除 → 同上
12. **Cross-page navigation**: 別 tab で `/human-review-gates` で save → navigate to `/campaigns/[slug]` → 同 gate の state が更新済 (server side fetch 経由で反映)
13. **Server stdout 確認**: `[updateGateState:execute-ok]` log を 1 行確認、token / notes / reviewer 等が出ていないこと

### 13-2. Negative tests

| シナリオ | 期待結果 |
|---|---|
| campaignId 改竄 | server `validation` reject |
| gateKey 改竄 | `not-found` |
| `expectedRevision` 省略 | `validation` |
| `expectedRevision` 古い | `conflict` |
| `nextState` を enum 外 | `validation` |
| `isUndo: false` で disallowed transition | `transition-not-allowed` |
| `isUndo: true` で previousState ≠ current の値を強要 | server が再 fetch して current と比較、`conflict` |

### 13-3. Build validation

```bash
cd dashboard && npm run build  # 23 routes maintained
npm run build                  # Sanity Studio clean
```

### 13-4. Token / log audit

- `.next/static/` の token literal grep → env var **名** のみ (i18n)、value ゼロ
- server console output で token / reviewer / notes が出ていないこと

---

## 14. Acceptance criteria (10 項目)

1. **Build**: 23 routes すべて green、TypeScript clean
2. **Default behavior**: `ENABLE_WRITE_ACTIONS` / `SANITY_WRITE_TOKEN` 未設定で `/human-review-gates` + `/campaigns/[slug]` Tabs「確認ゲート」 が完全 read-only、既存 UI 振る舞い完全維持
3. **Enabled behavior**: 両 env 設定で dropdown 表示、§3-2 の 13 transition すべて smoke test 通過
4. **Confirm modal**: terminal 遷移 (`done` / `skipped`) で modal 表示、「キャンセル」 / 「実行」 動作
5. **Undo**: 10 秒以内に「元に戻す」 click で previousState に復帰、host は row unmount に耐える
6. **Conflict**: Studio 並行編集で `conflict` error → reload 動作
7. **Transition validation**: `transition-not-allowed` が server で正しく reject (UI bypass / 直接 invoke でも防御)
8. **Security**: `SANITY_WRITE_TOKEN` が `.next/static/` に値として inline されていない (`grep` audit)
9. **Side effects**: `humanReviewGates[].state` 以外の field (gateName / reviewer / completedAt / notes) が触られていない (Studio diff 確認)
10. **Backwards compat**: 既存 `/analytics` reactionNotes 編集 + 既存 `/human-review-gates` 表示が変化なし、Phase 2B-1 動作も維持

---

## 15. Scope exclusions (explicit)

- ✗ Visual Register approval / candidate write (W1、Phase 2B-3 候補)
- ✗ Asset finalization (`assets/visuals/` mutation)
- ✗ Sanity audit-log schema (Q-4 confirmation 待ち)
- ✗ 自動 devlog 生成 (Q-10 confirmed)
- ✗ Email / Slack / webhook notification system
- ✗ Multi-user reviewer assignment (solo boss workflow のみ)
- ✗ `humanReviewGates[].reviewer` 編集 (Phase 2B-2.1 microbatch 候補)
- ✗ `humanReviewGates[].notes` 編集 (同上)
- ✗ `humanReviewGates[].completedAt` 自動 timestamp (boss 確認後 Phase 2B-2.1 で検討)
- ✗ Bulk transition (1 record / 1 patch / 1 transaction を維持)
- ✗ Schema 変更全般
- ✗ 新 env var 追加
- ✗ 新 package / shadcn 追加
- ✗ `tools/` / `publish-package/` / `assets/visuals/` / `patches/` 触らない

---

## 16. Confirmed questions (all resolved 2026-05-20)

すべての Phase 2B-2 specific question は boss confirmed。実装に向けて未解決事項はなし。

| # | Boss-confirmed answer | spec への反映場所 |
|---|---|---|
| **Q-2B2-1** ✅ | Schema 不変。Existing 6 enum 値のみで運用 (`not-started` / `in-progress` / `pending-review` / `done` / `blocked` / `skipped`)。`approved` ≡ `done`、`rejected` は理由により `blocked` (差し戻し) または `skipped` (放棄) に operationally mapping。新規 enum 値追加なし。 | §0 / §2-2 / §3-1 / §3-2 / §15 |
| **Q-2B2-2** ✅ | Confirm modal は terminal 遷移 (`done` / `skipped`) のみ。非 terminal は 1-click commit + undo toast で救う。 | §0 / §3-2 / §5-2 / §5-3 |
| **Q-2B2-3** ✅ | 本 batch では **`humanReviewGates[_key].state` 単一 field のみ** patch。`reviewer` / `notes` / `completedAt` / timestamps は touch しない。 | §0 / §1 (in scope) / §4-4 / §6 / §15 |
| **Q-2B2-4** ✅ | Phase 2B-1 `<AnalyticsToastHost>` を `<UndoToastHost>` に refactor/rename + generalize (low-risk な前提)。同じ 10秒 in-memory undo pattern。Persistent undo log なし、audit-log schema なし。 | §0 / §8 / §9 / §10-1 / §10-2 / §10-3 |
| **Q-2B2-5** ✅ | Dropdown UI を採用。Button group は採用しない。 | §0 / §5-2 |
| **Q-2B2-6** ✅ | UI が available transitions を事前 filter する + server action が `transition-not-allowed` で reject する (両方で enforce)。 | §0 / §5-2 / §6-2 / §7 / §12 |
| **Q-2B2-7** ✅ | Tab / page navigation で undo opportunity が失われるのは intentional。Current UI session 限定 (Q-6 准拠)。 | §0 / §8 |

Remaining parent-level open questions (Q-3 / Q-4 / Q-5 / Q-9) は parent spec §6 で tracking 継続。Phase 2B-2 implementation には不要 (audit-log schema / W1 bridge / reflect-script 段階削除 / W7 promptTemplate save はいずれも 2B-2 scope 外)。

---

## 17. Post-spec next step

1. ~~**boss が本 spec を read** + Q-2B2-1〜Q-2B2-7 に judgement~~ → **Done 2026-05-20** (handoff/0181)
2. **次 → Phase 2B-2 implementation batch を起動**
   - 新規 **3 ファイル** + 更新 **7 ファイル** + 削除 **1 ファイル** (§10 参照)
   - §14 acceptance criteria 10 項目すべて green が completion 条件
3. Phase 2B-2 smoke test → Phase 2B-2.1 microbatch (reviewer / notes / completedAt 拡張) を検討 (boss が「state だけでは不足」と感じれば)
4. その後 → Phase 2B-3 spec batch (W1 visual approve & register bridge、parent Q-3 確定後)
