# Handoff: Phase 2B-2 humanReviewGate state update — implementation

Date: 2026-05-20

## 1. Task Goal

handoff/0181 で Phase 2B-2 spec が finalized、Q-2B2-1〜Q-2B2-7 すべて boss confirmed。spec §10 + §14 に従って **Hitori Media OS 2 つ目の controlled Sanity write surface** を実装。Phase 2B-1 で築いた server action / write client / undo host pattern を 5-layer safety (transition allow-list 追加) で拡張し、`/human-review-gates` + `/campaigns/[slug]` 「確認ゲート」 tab で gate state を dropdown 経由で更新可能にする。

Sanity schema は不変 (Q-2B2-1)、reviewer / notes / completedAt / timestamps は touch しない (Q-2B2-3)。`humanReviewGates[_key].state` 単一 field のみ patch。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし (Q-2B2-1 confirmed)
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし (native HTML + Tailwind)
- ✅ 23 routes 維持 (build 確認済)
- ✅ Production writes 永久 disabled (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` を Vercel に設定しない契約)
- ✅ 両 env が AND-gate、片方欠ければ server action は abort
- ✅ `SANITY_WRITE_TOKEN` 値は client bundle に inline されない (env var **名** のみ i18n string に出現)
- ✅ Server `console.log` は metadata only、token / notes / reviewer / 本文を絶対 log しない
- ✅ Visual Register writes 未実装
- ✅ humanReviewGate **state** のみ patch (reviewer / notes / completedAt は touch しない)
- ✅ promptTemplate save 未実装
- ✅ Phase 2B-3 (W1 visual approve) 未実装
- ✅ Audit-log schema なし
- ✅ 自動 devlog 生成なし

## 3. Changed Files

### 新規 (4)

| File | 行数 | 役割 |
|---|---|---|
| [dashboard/src/components/common/UndoToastHost.tsx](dashboard/src/components/common/UndoToastHost.tsx) | 194 | Generic undo toast host (元 `AnalyticsToastHost` を rename + 場所移動 + action 非依存化、`onUndo: () => Promise<UndoResult>` callback で server action を decouple) |
| [dashboard/src/lib/gates/stateTransitions.ts](dashboard/src/lib/gates/stateTransitions.ts) | 101 | `HumanReviewGateState` 型 (6 enum 値) + 13 allowed transitions + 6 helpers |
| [dashboard/src/lib/actions/updateGateState.ts](dashboard/src/lib/actions/updateGateState.ts) | 244 | `'use server'`、10 step flow (Phase 2B-1 9 step + transition allow-list step)、`isUndo: boolean` flag で undo 経由のみ allow-list bypass |
| [dashboard/src/components/gates/GateStateControl.tsx](dashboard/src/components/gates/GateStateControl.tsx) | 307 | `'use client'` dropdown UI (Q-2B2-5)、terminal 遷移で確認モーダル (Q-2B2-2)、conflict reload prompt、disabled fallback (writeReady=false)、`useUndoToast()` 経由で toast hand-off |

### 更新 (8)

| File | 変更内容 |
|---|---|
| [dashboard/src/lib/groq/campaign.ts](dashboard/src/lib/groq/campaign.ts) | `campaignDetailBySlugQuery` に `_rev` 追加、`pendingHumanReviewGatesQuery` の gates projection に `_key` 追加 + doc `_rev` 追加、`HumanReviewGate._key?` / `CampaignPlanDetail._rev?` / `PendingGatesByCampaign._rev?` 型追加 |
| [dashboard/src/app/analytics/page.tsx](dashboard/src/app/analytics/page.tsx) | `<AnalyticsToastHost>` import → `<UndoToastHost>` (path: `@/components/analytics/...` → `@/components/common/UndoToastHost`) |
| [dashboard/src/components/analytics/ReactionNoteEditor.tsx](dashboard/src/components/analytics/ReactionNoteEditor.tsx) | `useUndoToast` の import path 切り替え、`notifySaved` の payload を新 generic shape (`title` / `detail` / `onUndo` callback) に書き換え。Editor が自分の undo path (action invocation + error mapping) を構築して host に渡す設計に移行 |
| [dashboard/src/app/human-review-gates/page.tsx](dashboard/src/app/human-review-gates/page.tsx) | `enableWriteActions` + `process.env.SANITY_WRITE_TOKEN` で `writeReady` 評価、`flatten()` で `campaignRev` を `FlatGate` に thread-through、bucket list 全体を `<UndoToastHost>` で wrap、各 row で bare `<StatusBadge>` を `<GateStateControl>` に置換 (writeReady=false は同 control が内部処理) |
| [dashboard/src/app/campaigns/[slug]/page.tsx](dashboard/src/app/campaigns/[slug]/page.tsx) | `enableWriteActions` import、Tabs `"gates"` content を `<UndoToastHost>` で wrap、`<GatesSection>` 引数を `(gates, campaignId, campaignRev, writeReady)` に拡張、内部で `<GateStateControl>` または fallback `<StatusBadge>` を render |
| [dashboard/README.md](dashboard/README.md) | 旧「Phase 2B-1 write actions」 → 新「Phase 2B write actions」 にgeneralize、2B-1 + 2B-2 surface 表 + 6-layer safety + 13 transition allow-list 表 + out-of-scope 整理。anchor 名変更に伴う 2 つの内部リンクも更新 |

### 削除 (1)

- `dashboard/src/components/analytics/AnalyticsToastHost.tsx` (`UndoToastHost.tsx` に rename + 場所移動)

### 触らないもの

- `schemas/` (Sanity schema 不変)
- `tools/` (Visual Register / reflect-* 等の CLI)
- `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (依存追加なし)
- `dashboard/src/lib/actions/sanityWriteClient.ts` / `featureFlags.ts` / `updateReactionNotes.ts` (Phase 2B-1 既存をそのまま再利用)
- `dashboard/src/lib/statusJa.ts` (canonical labels は他 surface でも使われている)
- `dashboard/src/components/StatusBadge.tsx`
- Phase 2B-1 analytics cards (`ReactionNotesCard.tsx` / `PendingMonitoringCard.tsx`)

合計 **13 ファイル変更 (4 新規 + 8 更新 + 1 削除) / 1 PR で完結**。

## 4. Summary of Changes

### 4-1. Files changed (詳細)

§3 参照。

### 4-2. UndoToastHost refactor behavior

**Before (Phase 2B-1)**: `<AnalyticsToastHost>` が `updateReactionNotes` を直接 import + hard-coded undo path。

**After (Phase 2B-2)**: `<UndoToastHost>` は完全 generic、`notifySaved({title, detail, onUndo})` の `onUndo: () => Promise<UndoResult>` を caller が供給。Host は callback を invoke して `UndoResult` で error / conflict 判別:

```ts
export type UndoResult =
  | {ok: true}
  | {ok: false; message: string; isConflict: boolean}

export interface SavedNotification {
  title: string                          // 「保存しました。」 / 「ゲート state を変更しました。」
  detail?: string                        // 「10秒以内なら元に戻せます。 — note」
  onUndo: () => Promise<UndoResult>      // caller-supplied; host invokes on click
}
```

Phase 2B-1 `ReactionNoteEditor` の動作は等価 (call site が新 shape に書き換えられたのみ)。10 秒 toast lifetime / row unmount 耐性 / 右下 fixed position / conflict error inline banner はすべて維持。

### 4-3. Server action behavior (`updateGateState`)

**Input** (`UpdateGateStateInput`):
```ts
{
  campaignId: string         // CAMPAIGN_ID_RE: /^[a-zA-Z0-9_.-]{4,200}$/
  gateKey: string            // GATE_KEY_RE: /^[a-zA-Z0-9_-]{4,64}$/
  currentState: HumanReviewGateState   // 6 enum 値
  nextState: HumanReviewGateState       // 6 enum 値
  expectedRevision: string   // REVISION_RE: /^[a-zA-Z0-9_-]{4,64}$/ — REQUIRED
  isUndo?: boolean           // true で transition allow-list を bypass (undo path のみ)
}
```

**10 step flow**:
1. `enableWriteActions` check → `write-disabled` if false
2. `SANITY_WRITE_TOKEN` check via `getSanityWriteClient()` → `missing-token` if absent
3. Input validation (regex / enum / `isUndo` boolean check / `currentState !== nextState`) → `validation` if any field bad
4. Fetch target doc with `*[_id == $id && _type == "campaignPlan"][0]{_id, _rev, humanReviewGates[]{_key, state}}`
5. `not-found` if doc absent
6. `conflict` if `doc._rev !== expectedRevision` (二重 lock の 1 つ目)
7. Find gate by `_key`、`not-found` if absent
8. **State drift detection**: `conflict` if `gate.state !== currentState` (二重 lock の 2 つ目、UI が古い state を信じていた場合の defense-in-depth)
9. **Transition allow-list** (`isAllowedGateTransition(currentState, nextState)`): `isUndo: true` ならスキップ、それ以外で違反すると `transition-not-allowed`
10. Execute: `client.patch(id, {ifRevisionID: expectedRevision}).set({['humanReviewGates[_key=="..."].state']: nextState})` → transaction commit with `autoGenerateArrayKeys: false` → return `newRevision` + `committedAt`

**Output** (`UpdateGateStateResult`):
- Success: `{ok: true, campaignId, gateKey, previousState, nextState, newRevision, committedAt}`
- Failure: `{ok: false, error: 'validation' | 'missing-token' | 'write-disabled' | 'permission' | 'not-found' | 'conflict' | 'transition-not-allowed' | 'unknown', message}`

**Server console.log** (Q-10 confirmed):
- stage: `start`, `rejected`, `error`, `conflict`, `permission`, `execute-ok`
- metadata only: `campaignId`, `gateKey`, `currentState`, `nextState`, `isUndo`, `elapsedMs`, `newRevisionPrefix` (6 chars)
- **token / reviewer / notes / 本文を絶対 log しない**

### 4-4. Transition allow-list behavior (Q-2B2-6 両方で enforce)

**UI**: `<GateStateControl>` が `getAllowedGateTransitions(currentState)` の結果のみ dropdown に表示。 boss が disallow transition を click できない。

**Server**: 同 `isAllowedGateTransition()` を server action 内で再 check (defense-in-depth)。DevTools から直接 invoke して bypass しようとしても reject。

Allow-list (`dashboard/src/lib/gates/stateTransitions.ts`):

| From | Allowed targets (terminal ✱ = confirm modal) |
|---|---|
| `not-started` | `in-progress` / `pending-review` / `skipped`✱ |
| `in-progress` | `pending-review` / `blocked` / `done`✱ / `skipped`✱ |
| `pending-review` | `in-progress` / `done`✱ / `blocked` / `skipped`✱ |
| `blocked` | `in-progress` / `skipped`✱ |
| `done` | (terminal, no outbound) |
| `skipped` | (terminal, no outbound) |

**Undo bypass**: `isUndo: true` で allow-list を bypass、それでも `expectedRevision` + `_key` 存在 + drift detection の他 layer は維持。

### 4-5. UI behavior (`<GateStateControl>`)

**Read mode** (`writeReady = false` — production deploy 含むデフォルト全状態):
```
[作業中] [編集不可 🔒]
```
- `<StatusBadge state={...} label={gateStateLabel(state)} />` + disabled「編集不可」 pill + tooltip 「state 変更は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ」

**Edit mode** (`writeReady = true`):
```
[作業中 ▼]   ← StatusBadge をクリックで dropdown 展開
  ┌──────────────────────────────┐
  │ → レビュー待ちにする            │
  │ → ブロックにする               │
  │ → 完了にする         [確認]   │
  │ → スキップする       [確認]   │
  └──────────────────────────────┘
```
- click trigger → dropdown 展開、`getAllowedGateTransitions(currentState)` の結果のみ表示
- terminal target (`done` / `skipped`) は 「確認」 badge 付き → click で **confirm modal** 出現
- 非 terminal target は 1-click commit
- `position: absolute top-full left-0`、`z-10`、outside click + Escape で close

**Confirm modal** (terminal 遷移時):
```
┌──────────────────────────────────────┐
│ ゲートを完了にしますか?                │
│                                      │
│ ゲート: selectedPlatforms 確認        │
│ 現在: 作業中                          │
│ 変更後: 完了                          │
│                                      │
│ ※ 完了は終端 state です。dashboard では │
│  再開できません (Studio で手動変更が必要)│
│  10秒以内なら元に戻せます。            │
│                                      │
│         [キャンセル] [完了にする]      │
└──────────────────────────────────────┘
```

**Saving**: trigger に「保存中…」 + `aria-busy`、option click 不可。

**Success**: trigger collapse → 新 state badge 表示 → `useUndoToast().notifySaved({title, detail, onUndo})` を host に hand-off → 右下 emerald toast 「ゲート state を変更しました。」 (10 秒) → `router.refresh()`。

**Conflict / Error**: 同 trigger 下に inline rose banner、`conflict` 時は「更新」 button (→ `router.refresh()`)、それ以外は「閉じる」 button。

### 4-6. /human-review-gates integration

- 既存 4 bucket (pending-review / in-progress / blocked / not-started) 構造完全維持
- `flatten()` を拡張して `campaignRev` を `FlatGate` に thread
- bucket list 全体を `<UndoToastHost>` で wrap (空 state — `totalAll === 0` のときは wrap 不要なので元の dashed message のみ)
- 各 row の bare `<StatusBadge state={gate.state} />` を `<GateStateControl>` に置換
- `gate._key` または `campaignRev` が無いとき (旧データ等) は fallback で `<StatusBadge state label={gateStateLabel(state)} />` を render — write は走らないが read 表示は維持
- header / KPI cards / sub-info (campaign link / reviewer / completedAt / notes) すべて変更なし

### 4-7. /campaigns/[slug] integration

- 既存 Tabs 8 panel 構造完全維持
- `"gates"` Tab content だけを `<UndoToastHost>` で wrap (他 Tab に影響なし)
- `<GatesSection>` 引数を `(gates, campaignId, campaignRev, writeReady)` に拡張
- 内部で `gate._key && campaignRev && isGateState(gate.state)` なら `<GateStateControl>` を render、それ以外は fallback `<StatusBadge>`
- 他 section (`ContentIdeaSection` / `BrandProfileSection` / `PlatformsSection` / `VisualsSection` / `PromptsSection` / `PackagePathsSection` 等) は touch なし
- `/publish-package/[slug]` も touch なし (boss-protected layout 維持)

### 4-8. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1711ms
  Finished TypeScript in 2.1s
✓ Generating static pages using 13 workers (3/3) in 84ms

Routes: 18 page routes + 5 API routes = 23 total (unchanged from prior batch)

$ npm run build  (repo root, Sanity Studio)
✔ Build Sanity Studio (9825ms)
```

### 4-9. Security / token leak check

**`.next/static/chunks/*.js` audit** (`grep -o "SANITY_WRITE_TOKEN[^\"',]*[\"']"`):
- 3 chunks each contain 2 hits = **6 total occurrences**, all of which are:
  - `"SANITY_WRITE_TOKEN が設定されていません"` — i18n error message text
  - `"SANITY_WRITE_TOKEN 設定時のみ"` — disabled tooltip text
- **Zero hits of the token VALUE**. Only the env var **NAME** appears, by design.

**Server-side `process.env.SANITY_WRITE_TOKEN` reads** (5 sites, all server-only):
- `src/lib/actions/sanityWriteClient.ts:29` — actual token read (the only site that touches the value)
- `src/components/app-shell/AppShell.tsx:21` — `Boolean(...)` for topbar pill
- `src/app/analytics/page.tsx:252` — `Boolean(...)` for Phase 2B-1 card props
- `src/app/human-review-gates/page.tsx:127` — `Boolean(...)` for HRG writeReady
- `src/app/campaigns/[slug]/page.tsx:224` — `Boolean(...)` for Tabs writeReady

All four `Boolean(...)` sites convert to a boolean before passing as a prop, so the token value never reaches the client tree.

**Server console.log** (`updateGateState` and `updateReactionNotes`): metadata only. Both server actions explicitly avoid logging token, reviewer name, gate notes, or reactionNotes body content.

### 4-10. Manual smoke checklist (for boss)

1. `.env.local` に Phase 2B 設定 (`ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>`) があることを確認
2. `cd dashboard && npm run dev`
3. Topbar pill が青「ローカル書き込み有効」 を表示
4. `/human-review-gates` を開く → 各 row の StatusBadge が dropdown trigger になっている
5. `not-started` の gate で click → dropdown 展開 → 「→ 作業中にする」 click → 即 commit → 右下 emerald toast 「ゲート state を変更しました。」 + 「元に戻す」 button
6. 10 秒以内に「元に戻す」 click → 旧 state に復帰 + toast 消える + Sanity Studio で確認
7. `in-progress` の gate で 「→ レビュー待ちにする」 → state badge 即更新 (Tab 移動なしで dropdown が「レビュー待ち」 trigger に切替)
8. `pending-review` の gate で 「→ 完了にする (確認)」 click → confirm modal 出現 → 「キャンセル」で閉じる + state 不変
9. もう一度 → 「完了にする」 click → modal 閉じる → toast 表示 → Studio で `state: 'done'` 確認
10. 「元に戻す」 で previousState (`pending-review`) に戻す
11. `done` の gate を確認 → dropdown trigger が disabled (「終端 state です。Studio で手動編集が必要です。」 tooltip)
12. `blocked` の gate で 「→ 作業を再開」 click (実際は「→ 作業中にする」) → in-progress に遷移
13. `skipped` の gate を確認 → 同じく terminal、disabled
14. **`/campaigns/[slug]`** 「確認ゲート」 tab を開く → 同じ dropdown 動作
15. Sanity Studio で並行に同 gate の state を変更 → dashboard で別 transition を試行 → `conflict` banner + 「更新」 button → click で `router.refresh()` で復旧
16. `.env.local` で `ENABLE_WRITE_ACTIONS=false` → 再起動 → topbar amber 「読み取り専用」 / dropdown disabled / 「編集不可 🔒」 pill 表示
17. `SANITY_WRITE_TOKEN` を削除 → 再起動 → 同上
18. Phase 2B-1 `/analytics` reactionNotes 編集 + undo もまだ動作することを確認 (host refactor の regression がないこと)
19. server stdout で `[updateGateState:execute-ok]` / `[updateReactionNotes:execute-ok]` log を確認 — token / 本文 / notes / reviewer が出ていないこと

## 5. Key Decisions

- **Generic `UndoToastHost`**: action 非依存に refactor、`onUndo` を caller-supplied callback に。Phase 2B-3 以降の write surface 追加 cost を下げる
- **`isUndo: boolean` flag**: controlled vocabulary 特有の問題 (undo が逆方向 transition を要求) を 1 boolean で表現、他の safety layer は維持
- **State drift detection を二重 lock の 2 つ目に**: `_rev` 検証だけでなく `gate.state === currentState` も server で検証、`_rev` 同一かつ state 異なるという data corruption / race を `conflict` reload で救う
- **`gateStateLabel` を `stateTransitions.ts` に閉じ込め**: `statusJa.ts` の canonical labels は他 surface で widely used、gate-specific labels は分離して ripple を防ぐ
- **Dropdown `position: absolute top-full`**: dense list で layout shift を起こさない、floating menu の自然な UX
- **`/human-review-gates` の `<UndoToastHost>` wrap 位置**: bucket list 全体を wrap、bucket 間の row 移動 (state change で別 bucket に移る) でも host が unmount しない設計
- **`/campaigns/[slug]` Tab `"gates"` のみを wrap**: Tabs 切替で host unmount するのは intentional (Q-2B2-7 confirmed: undo は current UI session のみ)
- **Fallback `<StatusBadge>` を残す**: `_key` / `_rev` が無い旧 record (Sanity 内に存在する可能性) でも read 表示は維持、write 不可で透過
- **disabled state は同 control 内で表現**: writeReady=false 時に別 component を使うのではなく、`<GateStateControl>` 内で 2 形態を render する。call site を 1 か所に揃える
- **`process.env.SANITY_WRITE_TOKEN` を Server Components で `Boolean(...)` 化して prop drilling**: token 値が client に到達しない、Phase 2B-1 と同パターン

## 6. Human Review Questions

### Smoke test 後の判断

1. Dropdown の文言 (「作業中にする」「レビュー待ちにする」「ブロックにする」「完了にする」「スキップする」「未着手に戻す」) で OK? 短すぎ / 長すぎ?
2. Confirm modal の文言と layout (`absolute top-full` で trigger 直下に展開) で OK? 別 location (画面中央 overlay) のほうが boss preference か?
3. Toast の文言 「ゲート state を変更しました。 / `<previous>` → `<next>` · 10秒以内なら元に戻せます — `<gateName>`」 で OK?
4. Terminal disabled tooltip 「終端 state です。Studio で手動編集が必要です。」 で OK?
5. `/human-review-gates` の bucket 間 row 移動 (state change で別 bucket に出る) は intentional だが、boss が「移動せずに同じ場所に残ってほしい」 希望ありか? (今回は移動する、`router.refresh()` で bucket 再計算)

### 設計判断 review

6. `pendingHumanReviewGatesQuery` は **page 全 gate を返す** ように既に変更されている (Phase Admin 1 で boss が「全 gate を見たい」 と設計)。本 batch では query を **不変** で gates に `_key` を追加しただけ、ロジックは変えていない
7. `<UndoToastHost>` の汎用化で Phase 2B-1 動作が変わっていないか smoke test で確認必要 (build green は確認済)
8. `gateStateLabel` が他 surface の表示 (`statusJa.ts`) と微妙に違う (「確認待ち」 vs 「レビュー待ち」 等) のは intentional — `/human-review-gates` のヘッダー bucket labels (旧来の「レビュー待ち」「作業中」「ブロック」) と一致させた

## 7. Risks or Uncertainties

- **`_rev` を `campaignDetailBySlugQuery` に追加した影響**: 既存 `CampaignPlanDetail` を consume する他 page (主に `/campaigns/[slug]`) の TypeScript は `_rev?: string` の optional 追加なので互換性問題なし。build green で確認済だが、cache 戦略は要観察
- **Sanity client transaction return shape**: `@sanity/client@7.22.0` の `transaction().patch(p).commit({returnDocuments: true})` の return shape は推測的に narrow、実 write で確認するまで「新 `_rev` を 100% 抜き出せる」保証は弱い。Phase 2B-1 で同 pattern が動いた実績はあるが、edge case (例えば commit が `results` を空配列で返す) では `newRevision: '(unknown)'` を返す
- **Drift detection の偽陽性**: gate.state が client の `currentState` と一致しない場合 `conflict` を返すが、これは race condition / DevTools tampering 以外でも `_rev` が偶然同一の状態で gate.state だけ違うという理論ケースで発火する。boss UX としては「reload してください」 で正しいが、頻発するなら原因究明が必要
- **Cross-tab undo race**: 2 tab で同 gate を編集すると `expectedRevision` が古くなって undo が `conflict` を引く既知 risk (Phase 2B-1 と同じ)
- **Dropdown のキーボード navigation**: 現在は click only、Tab / 矢印キーでの option 移動は実装していない。a11y improvement は将来 microbatch
- **`/human-review-gates` の row が state 変更で別 bucket に移動**: `router.refresh()` で bucket 再計算 → row が消えて別 bucket に出現する。Phase 2B-1 reactionNotes と同じ pattern、`<UndoToastHost>` が bucket list 全体を wrap しているので toast は残る
- **Confirm modal 内で「キャンセル」 後の dropdown state**: modal 閉じると `{kind: 'idle'}` に戻る。再度 dropdown を開いて選び直す必要があるが、これは intentional (cancel = やめる、再考慮の意)

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- Smoke test 結果反映 (boss が見て調整したい copy / layout があれば)
- a11y: dropdown のキーボード navigation (Tab + 矢印キー + Enter で option 選択)
- 「ローカル書き込み有効」 indicator の `/settings` page との整合性 (現状の `SafetyReadOnlyCard` 文言が writeReady=true でも変わらない)

### 中期 (Phase 2B-2.1 microbatch)

- `reviewer` 編集対応 (string input or dropdown of known reviewers)
- `notes` 編集対応 (textarea)
- `done` 遷移時に `completedAt: new Date().toISOString()` 自動 patch (boss 要望次第)

### 中期 (Phase 2B-3 spec)

- W1 visual approve & register bridge (parent Q-3 確定後)
- 同 server action / 同 host pattern を W1 に転用

### 長期

- `<DeferredActionButton>` 削除 (Phase 2B 全完了後の cleanup)
- AppShell-level `<UndoToastHost>` lift (handoff/0179 §8 言及)
- `tools/sanity/reflect-*.mjs` script 段階削除 (parent Q-5 確定後)

## 9. Next Recommended Step

**Phase 2B-2 manual smoke test on localhost** (§4-10 の 19 step)

特に確認すべき:
1. Phase 2B-1 reactionNotes 動作不変 (host refactor 影響なし)
2. `/human-review-gates` で 13 transition すべて動作
3. Terminal で confirm modal、非 terminal で 1-click
4. Undo 10 秒で previousState 復帰
5. Conflict (Studio 並行編集) で reload prompt
6. `/campaigns/[slug]` Tab で同 dropdown 動作
7. Server log に token / 本文 / notes / reviewer が出ていないこと

問題なければ **Phase 2B-2.1 microbatch (reviewer/notes/completedAt)** または **Phase 2B-3 spec (W1 visual approve)** に進行。

---

### Exact prompt for next Claude Code session (Phase 2B-2 smoke fix microbatch、もし UX 調整が必要なら)

```
Phase 2B-2 humanReviewGate smoke fix microbatch を実行してください。

入力:
- docs/specs/phase-2b-2-human-review-gates.md (finalized)
- docs/handoff/0182-phase-2b-2-human-review-gates-implementation.md (本 batch)
- boss が smoke test で見つけた issue: [boss が記述]

タスク:
1. issue 修正 (UX / copy / layout のみ、scope 拡張なし)
2. devlog + handoff + latest.md mirror

constraints:
- Sanity schema 不変
- runtime behavior の本質を変えない (UX 改善のみ)
- 新 env / 新 dependency 追加なし
- Phase 2B-3 (W1) 未実装
```

## 10. Build validation summary

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1711ms
  Finished TypeScript in 2.1s
✓ Generating static pages using 13 workers (3/3) in 84ms

Routes: 18 page routes + 5 API routes = 23 total

$ npm run build  (repo root, Sanity Studio)
✔ Build Sanity Studio (9825ms)

$ grep "SANITY_WRITE_TOKEN" .next/static/chunks/*.js
3 chunks × 2 i18n string hits = 6 total
All are env var NAME in user-facing error / tooltip strings.
Zero hits of the token VALUE.

Server-side reads: 5 sites
- src/lib/actions/sanityWriteClient.ts:29 (actual)
- src/components/app-shell/AppShell.tsx:21 (Boolean coercion)
- src/app/analytics/page.tsx:252 (Boolean)
- src/app/human-review-gates/page.tsx:127 (Boolean)
- src/app/campaigns/[slug]/page.tsx:224 (Boolean)
```
