# Phase 2B-2 humanReviewGate state update — implementation

日付: 2026-05-20

## 背景

handoff/0181 (devlog 0170) で Phase 2B-2 spec が finalized、Q-2B2-1〜Q-2B2-7 すべて boss confirmed。spec §10 + §14 に従って **Hitori Media OS 2 つ目の controlled Sanity write surface** を実装。

スコープ:
- `/human-review-gates` の各 row + `/campaigns/[slug]` の「確認ゲート」 tab 内 row で `humanReviewGates[_key].state` を dropdown 経由で更新
- Phase 2B-1 `<AnalyticsToastHost>` を `<UndoToastHost>` に refactor + 場所移動、汎用 host として両 batch から使う

Sanity schema は不変。reviewer / notes / completedAt / timestamps は touch しない (Q-2B2-3)。Sanity への write は **`humanReviewGates[_key=="<key>"].state` 単一 field** のみ。

## 決定・変更

### 新規ファイル (4)

| File | 役割 |
|---|---|
| `dashboard/src/components/common/UndoToastHost.tsx` | 汎用 undo toast host (元 AnalyticsToastHost を rename + 場所移動 + `onUndo: () => Promise<UndoResult>` callback で server action を decouple) |
| `dashboard/src/lib/gates/stateTransitions.ts` | `HumanReviewGateState` 型 + 13 allowed transitions + helpers (`getAllowedGateTransitions` / `isAllowedGateTransition` / `isTerminalGateState` / `gateStateLabel` / `gateStateTone` / `gateTransitionVerb`) |
| `dashboard/src/lib/actions/updateGateState.ts` | `'use server'` action、10 step flow (Phase 2B-1 9 step + transition allow-list)、`expectedRevision` required、`isUndo` flag で undo path だけ allow-list bypass |
| `dashboard/src/components/gates/GateStateControl.tsx` | `'use client'` dropdown UI (Q-2B2-5)、terminal 遷移で確認モーダル (Q-2B2-2)、conflict reload prompt、disabled fallback、`useUndoToast()` 経由で toast hand-off |

### 更新ファイル (8)

| File | 主要変更 |
|---|---|
| `dashboard/src/lib/groq/campaign.ts` | `campaignDetailBySlugQuery` に `_rev` 追加、`pendingHumanReviewGatesQuery` の gates projection に `_key` 追加 + `_rev` 追加、`HumanReviewGate._key?` / `CampaignPlanDetail._rev?` / `PendingGatesByCampaign._rev?` 型追加 |
| `dashboard/src/app/analytics/page.tsx` | `<AnalyticsToastHost>` import → `<UndoToastHost>` (path 変更) |
| `dashboard/src/components/analytics/ReactionNoteEditor.tsx` | `useUndoToast` の import を `@/components/common/UndoToastHost` に切り替え、`notifySaved` の payload を新 shape (`title` / `detail` / `onUndo` callback) に書き換え、editor 自身が undo path を構築して host に渡す設計に変更 |
| `dashboard/src/app/human-review-gates/page.tsx` | `enableWriteActions` + `process.env.SANITY_WRITE_TOKEN` で `writeReady` 評価、`flatten()` で `campaignRev` を `FlatGate` に thread-through、bucket list を `<UndoToastHost>` で wrap、各 row で bare `<StatusBadge>` を `<GateStateControl>` に置換 (writeReady=false fallback も同 control が内部処理) |
| `dashboard/src/app/campaigns/[slug]/page.tsx` | `enableWriteActions` import、Tabs `"gates"` content を `<UndoToastHost>` で wrap、`<GatesSection>` 引数を `(gates, campaignId, campaignRev, writeReady)` に拡張、`<StatusBadge>` を `<GateStateControl>` に置換 |
| `dashboard/README.md` | 「Phase 2B-1 write actions」 セクションを **「Phase 2B write actions」** に generalize、2B-1 + 2B-2 を併記する表 + 6-layer safety + state transition table + out-of-scope の整理 |

### 削除 (1)

- `dashboard/src/components/analytics/AnalyticsToastHost.tsx` (`UndoToastHost.tsx` に rename + 場所移動済)

合計 **4 新規 + 8 更新 + 1 削除 = 13 ファイル変更**。Phase 2B-1 implementation と同等規模。

### 触らないもの

- `schemas/` (Sanity schema は不変、Q-2B2-1 で boss confirmed)
- `tools/` (Visual Register / reflect-* scripts)
- `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (依存追加なし)
- `dashboard/src/lib/actions/sanityWriteClient.ts` / `featureFlags.ts` body / `updateReactionNotes.ts` (Phase 2B-1 既存をそのまま再利用)
- `dashboard/src/lib/statusJa.ts` (canonical labels は他 surface でも使われている、gate-specific labels は新 `stateTransitions.ts` 内に置く方が安全)
- `dashboard/src/components/StatusBadge.tsx` (tone 判定はそのままで OK)
- Phase 2B-1 analytics の cards (`ReactionNotesCard.tsx` / `PendingMonitoringCard.tsx`)

## 理由

### なぜ `UndoToastHost` を generic 化したか

Phase 2B-1 `<AnalyticsToastHost>` は `updateReactionNotes` を **直接 import** していたので host が action の存在を知っていた。Phase 2B-2 で別 action (`updateGateState`) も使いたい → host から action を decouple する必要。

新 design:
- `notifySaved({title, detail, onUndo})` の `onUndo` を **caller-supplied callback** に
- 各 caller (editor / control) が自分の action 呼び出しを encapsulate して host に渡す
- host は callback を invoke して `UndoResult` で error / conflict 判別するだけ

これで host は無知になり、Phase 2B-3 で W1 visual approve が加わっても同 host を流用できる。

### なぜ `isUndo` flag を server action に入れたか

state は controlled vocabulary (6 値) で、allow-list が 13 transition に絞られている。Undo は逆方向 transition (`done` → `pending-review` 等) を要求するので、normal validation だと reject される。

Solution: input に `isUndo?: boolean` を追加、`true` なら `isAllowedGateTransition` check を bypass。ただし他の safety layer (`expectedRevision` 必須 + 再 fetch verify + `_key` 存在 + drift detection) はすべて維持。これで「undo 経由なら逆 transition 可、それ以外なら forward-only」 を 1 boolean で表現。

### なぜ Status drift を server で `conflict` 扱いにしたか

GROQ で gate.state を再 fetch するが、`expectedRevision` (= doc レベルの `_rev`) が一致しても、別 boss session で同 gate を変えた直後にもう一度同 `_rev` で edit する race condition は理論上ない (Sanity が `_rev` を伸ばす)。

しかし `_rev` 検証 + gate.state 検証 を **二重で** やる:
- `_rev` 検証 → doc レベル の楽観 lock
- `gate.state === currentState` 検証 → 行レベルの defense-in-depth (もし `_rev` が同一なのに gate.state が違ったら、これは bug or data corruption、reload を強要)

Phase 2B-1 reactionNotes でも platform mismatch を `validation` でreject しているが、本 batch では「state drift」を `conflict` (= reload prompt) で扱う方が UX 自然 (drift は user 視点では「他の何かが変更された」と同じ意味)。

### なぜ `gateStateLabel` を新 helper に置いたか

`statusJa.ts` の canonical labels (`pending-review` → 「確認待ち」、`blocked` → 「要対応」、`skipped` → 「今回は保留」) は多 surface (visualAssetPlan, platformOutput, contentIdea, etc.) で使われている。boss prompt は gate に対して 「レビュー待ち」「ブロック」「スキップ」 を希望したが、これを `statusJa.ts` に書き換えると他 surface が連動して変わってしまうリスク (ripple effect)。

Solution: gate-specific labels を `stateTransitions.ts` の `GATE_LABELS` に閉じ込め、`GateStateControl` がそれを使う。他 surface はそのまま。

### なぜ dropdown を `position: absolute top-full left-0` にしたか

inline dropdown を選んだ (Q-2B2-5)。flex 内に置いたとき:
- inline dropdown が下に展開 → 行間に展開して周辺を押し下げると、`/human-review-gates` の dense list で layout shift が大きい
- `absolute top-full` で flex から外に floating → 下の li を押し下げない、視覚的にも「上から下に開く menu」 として自然

dropdown を上に開く / 横に開くの選択肢もあるが、bottom-anchored は最も普通の menu UX。

### なぜ `enableWriteActions` を AppShell + page 両方で読むか

DRY 違反のように見えるが:
- AppShell で読む → topbar pill (writeReady) を全 page で表示
- 各 page で読む → `<GateStateControl>` の writeReady prop に渡す

両方とも server-side で `process.env.SANITY_WRITE_TOKEN` を `Boolean(...)` 化して boolean を渡しているので、token 値は client に到達しない。重複読みは Next.js server component の冪等な動作で問題なし。

### Build 結果

- `cd dashboard && npm run build`: 23 routes すべて green、TypeScript clean
- `npm run build` (Sanity Studio): clean
- `.next/static/` audit: env var **名** が i18n string で 6 hit (3 chunks × 2 文言)、token **値** は **0 hit**
- server-side `process.env.SANITY_WRITE_TOKEN` reads: 5 sites (AppShell, analytics page, HRG page, campaigns/[slug] page, sanityWriteClient.ts) — すべて server-only

## 影響

- リポジトリ:
  - dashboard runtime: 13 ファイル変更 (4 新規 + 8 更新 + 1 削除)
  - Phase 2B-1 動作: ReactionNoteEditor の `useUndoToast` import path を書き換え、`notifySaved` payload を新 generic shape に移行。動作は等価
  - 23 routes 不変、TypeScript clean
- ワークフロー:
  - boss は既存の `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN` 設定そのまま、新 env 追加なし
  - `/human-review-gates` の各 row + `/campaigns/[slug]` 「確認ゲート」 tab で state dropdown が出る
- スキーマ: 不変 (Q-2B2-1 boss confirmed)
- プロダクト方針:
  - dashboard で書き込み可能な surface が `/analytics` + `/human-review-gates` + `/campaigns/[slug]` Tabs の 3 surface に拡大
  - 4 layer safety + 5 layer (transition allow-list) を server で enforce、UI でも事前 filter (Q-2B2-6)
  - 同 server action / 同 host pattern が Phase 2B-3+ で再利用できる骨格を獲得

## 次の一手

**Option A (推奨) — Manual smoke test on localhost**

handoff/0182 §10 の checklist に従い、boss が:
1. `.env.local` の Phase 2B 設定で `npm run dev`
2. Topbar 「ローカル書き込み有効」 確認
3. `/human-review-gates` 行で dropdown 表示確認 → `not-started → in-progress` 等の非 terminal transition (1-click commit)
4. terminal transition (`done`/`skipped`) で confirm modal
5. 10 秒以内に「元に戻す」 で previousState 復帰
6. Studio 並行編集で conflict + reload prompt
7. `/campaigns/[slug]` 「確認ゲート」 tab で同 dropdown 動作確認
8. Phase 2B-1 reactionNotes も並行で動作確認

問題なければ次の選択肢:

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 拡張)**

boss が「state だけだと workflow が薄い」と感じれば spec + 実装の microbatch。`done` 遷移時に `completedAt: new Date().toISOString()` 自動 set も検討。

**Option C — Phase 2B-3 spec (W1 visual approve & register bridge)**

parent Q-3 確定後の next major spec。Phase 2B-1 + 2B-2 で固めた template (server action / 5-layer safety / `<UndoToastHost>` / `expectedRevision` required) を W1 に転用。

発信ネタ案: 「Generic UndoToastHost — host から action を decouple すると Phase 2B-3 以降の cost が劇的に下がる」「State machine の allow-list を 13 transition で固定する spec の精度」「`isUndo` flag — controlled vocabulary 特有の問題を 1 boolean で表現する」「Sanity Studio + dashboard 並行編集の conflict UX を spec で予防」
