# Handoff: Phase 2B-1 smoke fix — undo toast + topbar indicator

Date: 2026-05-20

## 1. Task Goal

handoff/0178 (devlog 0167) で Phase 2B-1 reactionNotes write が land。boss が手元で smoke test を行い、機能本体 (save / Sanity 反映 / Studio diff / flag・token gate) はすべて OK。ただし UX bug 2 件:

1. **Undo toast が click 前に消える** (10 秒は出続けるべき)
2. **Topbar 「読み取り専用」 indicator** が local write enable 時も変わらない

本 batch は **smoke fix microbatch**。Phase 2B scope は拡張しない。runtime / schema / publish-package / assets / patches / package.json 不変。

なお boss 報告の「`true` に戻しても編集不可」は `.env.local` 上の `ture` typo が原因 (本人確認済) で、コード fix は不要。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ Visual Register write actions 未実装
- ✅ humanReviewGate write actions 未実装
- ✅ promptTemplate save 未実装
- ✅ 23 routes すべて intact
- ✅ Production writes 永久 disabled (Vercel に env 設定しない原則維持)
- ✅ `SANITY_WRITE_TOKEN` は server 側のみで読まれ、client bundle に値は流れない (env var **名** が i18n error string に出るのみ)
- ✅ reactionNotes 本文を log しない (`updateReactionNotes.ts` の console.log は metadata only)
- ✅ Phase 2B scope 拡張なし (W3 修正のみ)

## 3. Changed Files

### 新規 (1)

| File | 役割 | 行数 |
|---|---|---|
| [dashboard/src/components/analytics/AnalyticsToastHost.tsx](dashboard/src/components/analytics/AnalyticsToastHost.tsx) | `'use client'` host — React Context で `useUndoToast()` 提供、`useState` + `useRef` で 10 秒 timer 保持、`position: fixed` で bottom-right floating toast を render、undo / dismiss button 内蔵 | 226 |

### 更新 (4)

| File | 主要変更 |
|---|---|
| [dashboard/src/components/analytics/ReactionNoteEditor.tsx](dashboard/src/components/analytics/ReactionNoteEditor.tsx) | local toast state / `status: 'saved'` / `showUndo` / `setTimeout` を全削除、保存成功時は `useUndoToast().notifySaved(...)` で host に hand-off、editor 自身は read mode に collapse |
| [dashboard/src/app/analytics/page.tsx](dashboard/src/app/analytics/page.tsx) | 右列の `<ReactionNotesCard>` + `<PendingMonitoringCard>` を `<AnalyticsToastHost>` で wrap、`FutureIntegrationCard` は host 外に保持 (layout 不変) |
| [dashboard/src/components/app-shell/ReadOnlyPill.tsx](dashboard/src/components/app-shell/ReadOnlyPill.tsx) | `writeReady: boolean` prop 追加、true で blue 「ローカル書き込み有効」 + Pencil icon、false で従来の amber 「読み取り専用」 + ShieldAlert icon |
| [dashboard/src/components/app-shell/Topbar.tsx](dashboard/src/components/app-shell/Topbar.tsx) | `writeReady: boolean` prop を受けて `<ReadOnlyPill>` に forward |
| [dashboard/src/components/app-shell/AppShell.tsx](dashboard/src/components/app-shell/AppShell.tsx) | `enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)` を server-side 評価して `<Topbar>` に boolean のみ渡す |

### 触らないファイル

- `schemas/`, `tools/`, `publish-package/`, `assets/visuals/`, `assets/inbox/`, `patches/`, `package.json`, config files
- `dashboard/src/components/analytics/ReactionNotesCard.tsx` (card 側は本 batch unchanged)
- `dashboard/src/components/analytics/PendingMonitoringCard.tsx` (同)
- `dashboard/src/lib/actions/updateReactionNotes.ts` (server action 不変)
- `dashboard/src/lib/actions/sanityWriteClient.ts` (不変)
- `dashboard/src/lib/featureFlags.ts` (不変)
- `dashboard/src/lib/groq/outputs.ts` (不変)
- `dashboard/README.md` (Phase 2B-1 section 内容は accurate のまま、UX fix の説明は devlog/handoff 経由)

## 4. Summary of Changes

### 4-1. Root cause of vanishing toast

`<ReactionNoteEditor>` was inside each row's `<li>` of `<ReactionNotesCard>` and `<PendingMonitoringCard>`. The flow after save:

1. Editor calls `updateReactionNotes({mode:'execute'})` → server commits patch
2. Editor sets local `status: 'saved'` + starts `setTimeout(10_000)` toast
3. Editor calls `router.refresh()` → Server Component re-fetches outputs
4. **Pending row → ReactionNotes row** because reactionNotes is now non-empty: `buildPendingRows` drops it, `buildReactionRows` includes it
5. Old `<li>` in PendingMonitoringCard unmounts → editor unmounts → cleanup fires → `setTimeout` cleared → toast `<div>` disappears
6. New `<li>` in ReactionNotesCard mounts a fresh editor with status `'read'` (no toast)

Net effect: toast flashes briefly (or not at all) — boss can't click 元に戻す.

### 4-2. Fix: lift toast to stable host (Context)

`<AnalyticsToastHost>` is a thin client wrapper around both cards. The Provider value exposes `notifySaved(state)`. The host owns:

- `useState<SavedNotification | null>` for the active toast
- `useState<ErrorState | null>` for undo-path errors (network / conflict / permission)
- `useRef<Timeout>` for the 10-second clear timer
- `useState<boolean>` for the "undo in flight" busy state
- `useTransition` for the undo server action call

The host renders a `position: fixed bottom-4 right-4` floating panel that sits outside the card DOM tree, so row unmount cannot kill it.

### 4-3. ReactionNoteEditor changes

Removed:
- `status: 'saved'` variant
- local `showUndo` state
- local `undoTimerRef` + `setTimeout`
- local toast / undo button rendering
- `onUndo` / `onDismissUndo` handlers

Kept:
- `read` / `edit` / `saving` / `error` status (these are tied to the editor's own lifecycle; OK to die with the row)
- inline error banner (conflict + non-conflict cases)
- `mountedRef` to suppress setState-after-unmount when the editor really does unmount mid-save

Added:
- `useUndoToast()` hook call to obtain the host's `notifySaved` function
- On successful execute: call `notifySaved({campaignId, itemKey, platform, previousValue, savedValue, activeRevision: newRev})` then collapse to `'read'`

### 4-4. Undo flow in host

When the user clicks 元に戻す in the floating toast:

1. Host calls `updateReactionNotes({newReactionNotes: previousValue, expectedRevision: activeRevision, mode: 'execute'})`
2. On success: dismiss toast + `router.refresh()` (re-renders the row with the restored value)
3. On `conflict`: show rose error banner with 「更新」 button → `router.refresh()`
4. On other errors: show rose error banner with 閉じる button

Undo is **single-step**: after the undo commits, the toast is dismissed and the new `_rev` is not re-armed for a "redo". Spec §7 confirmed single-step in-memory undo only.

### 4-5. Topbar write-mode indicator

- `<AppShell>` computes `writeReady = enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)` server-side
- `<AppShell>` passes `writeReady` to `<Topbar>`
- `<Topbar>` passes `writeReady` to `<ReadOnlyPill>`
- `<ReadOnlyPill>` renders:
  - `writeReady = true` → blue pill「ローカル書き込み有効」 + `<Pencil>` icon + tooltip 「ローカル環境で Phase 2B-1 write actions が有効です。Vercel 上では常に読み取り専用のままです。」
  - `writeReady = false` → unchanged amber pill「読み取り専用」 + `<ShieldAlert>` icon + tooltip 「このダッシュボードは読み取り専用です。Sanity への書き込みは Studio または controlled write tool 経由のみ。」

Production deploy: `ENABLE_WRITE_ACTIONS` and `SANITY_WRITE_TOKEN` are absent on Vercel by contract, so `writeReady === false` is guaranteed and the pill stays amber.

### 4-6. Disabled-state copy (Task 3 optional)

`/analytics` の disabled copy は現状の文言を維持:
- ReactionNotesCard header subtitle: 「公開後 24-72h に手動記録」 (writeReady=true 時は「· 編集可」追記)
- PendingMonitoringCard header subtitle: 「公開後 24h+ で reactionNotes 未記入」 (writeReady=true 時は「· その場で記入可」追記)
- Editor disabled button tooltip: 「編集は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ」

これらは「bug を疑わせる文言」ではないので変更なし。

### 4-7. Token / log safety preserved

- `process.env.SANITY_WRITE_TOKEN` reads は server side 3 か所のみ:
  - `lib/actions/sanityWriteClient.ts:29` — actual token
  - `app/analytics/page.tsx:252` — `Boolean(...)`
  - `components/app-shell/AppShell.tsx:21` — `Boolean(...)` (新規追加、topbar pill 用)
- `.next/static/` の token literal grep: env var **名** の i18n string 3 件のみ、token **値** はゼロ
- server console.log: `updateReactionNotes` の log は変更なし、token / 本文を吐かない契約を維持

## 5. Key Decisions

- **Toast を server component の外、editor の外、cards の外に**: row unmount に左右されない stable parent が必要、analytics page の右列レベルが最小限の scope
- **React Context (Provider/Consumer) で host ↔ editor を接続**: prop drilling 不要、cards を client 化せず Server Component のまま使える Next.js のハイブリッド設計
- **`position: fixed` の floating toast**: card 内 absolute だと unmount に影響、viewport-fixed なら DOM tree 上の親が消えない
- **Undo の `activeRevision` を host が保持**: editor が unmount しても undo path に必要な `_rev` を失わない、host が「最後に saved したときの newRev」を 1 件持つ
- **Single-step undo only**: undo 成功後は toast を dismiss、redo / multi-step は spec 外
- **Topbar pill を写し全 page 共通**: writeReady は session-wide 事実、`/settings` 等他 page でも同 indicator が出ていると boss が「今 local 開発 mode に居る」と認識しやすい
- **Production write 永久 disabled の再保証**: AppShell の server-side check は `enableWriteActions` (env flag) AND `SANITY_WRITE_TOKEN` 両方を要求、production には片方も入らない契約
- **Disabled copy は変更なし**: bug を疑わせる文言ではない、無変更で OK
- **`mountedRef` を editor に残す**: 保存中に row が unmount するエッジケースで `setState` 警告を抑える、defense-in-depth
- **Undo 成功後の `router.refresh()` のみ**: Sanity write client 内部の cache invalidate には依存しない、client から refresh trigger

## 6. Human Review Questions

### Smoke test (boss が再 dev server 起動で確認)

1. Topbar が「ローカル書き込み有効」 + 青 Pencil icon に切り替わるか?
2. `/analytics` の `<ReactionNotesCard>` で row 編集 → 保存 → editor 即座に collapse + 右下に green toast 「保存しました。10秒以内なら元に戻せます。 — `<platform>`」
3. **`<PendingMonitoringCard>` で row 編集 → 保存 → row が ReactionNotesCard に移動 → toast が消えずに 10 秒残る** (本 batch 主目的)
4. 10 秒以内に「元に戻す」 click → 旧値復元 + toast 消える
5. 10 秒経過 → toast 自動消滅、boss が click しなくても害なし
6. 並行で Studio 編集して conflict 発生 → undo path 内のエラー banner が右下に rose で出る + 「更新」 button → `router.refresh()`
7. `ENABLE_WRITE_ACTIONS=false` で再起動 → topbar amber 「読み取り専用」 + 編集 button disabled
8. server stdout で `[updateReactionNotes:execute-ok]` ログを確認 (token / 本文が出ていないこと)

### 設計判断 review

9. **Topbar copy** 「ローカル書き込み有効」 で OK? 候補: 「編集モード」 / 「local-write enabled」 / 「ローカル編集中」
10. **Toast 位置** 右下 floating (bottom-right) で OK? 候補: 上中央 / 右上 / inline-cards 内
11. **Toast 配色** emerald 200/300 で OK? 候補: blue / slate
12. **Undo button label** 「元に戻す」 で OK? 候補: 「取り消し」 / 「Undo」
13. **Undo 成功時の追加 toast** ("元に戻しました") が無い。実装した方が良いか?

## 7. Risks or Uncertainties

- **`AnalyticsToastHost` の Context は同一 page 内のみ**: 他 page (/campaigns/[slug] 等) では undo は出ない。Phase 2B-2 (W5) で他 page にも write が広がれば再設計が必要 (`AppShell` レベルに上げる選択肢)
- **同一 boss が複数の save を 10 秒以内に連発した場合**: 直近 1 件の toast だけが残る (前 toast は state replace で消える)、undo は最後の save のみ。spec §7「single-step」と整合
- **Save 中に同 row を別 tab で編集すると undo が conflict**: 期待通り (Q-8 confirmed)、UI は host の error banner で表示
- **`useUndoToast()` を host 外から呼ぶと throw**: 開発時の見落とし防御だが、誤って analytics page 以外から editor を import する future-self への trip wire (実害は build / dev で即 error として顕在化)
- **Pencil icon の意味**: 「local 書き込み有効」 vs 「編集中」 と混同される可能性。tooltip でカバーするが、icon 単独だと曖昧
- **Cross-page navigation 中の toast**: 別 page に遷移したら toast は消える (unmount される)、undo 機会も消える。boss が「保存 → 即 navigate」した場合 undo 不可。spec §7「current UI session のみ」と整合
- **Smoke test 未実施 (Claude 側)**: 本 batch も build green のみで実 write は流していない、boss の手元で再 verify が必要

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- Smoke test 結果反映 (toast 位置 / 配色 / copy 調整があれば)
- Topbar pill を `/settings` の Safety section とも整合させる微修正 (現状 `SafetyReadOnlyCard` が「読み取り専用」 と書いているが、write enable 時の文言は未対応)

### 中期 (Phase 2B-2 関連)

- **Phase 2B-2 spec batch (W5 humanReviewGate state)**: `<AnalyticsToastHost>` の Context pattern を別 page 用に汎用化、または `AppShell` 全体に上げる検討
- `<DeferredActionButton>` partial 削除 (2B-2 で gate state UI 置換時に同時)

### 長期

- Topbar pill の「production deploy 中」 ラベルとの併用 (現状 production は flagless で常に「読み取り専用」)、Settings page の Safety と consistent text

## 9. Next Recommended Step

**Phase 2B-1 smoke re-test on localhost**

```
1. dashboard/.env.local に Phase 2B-1 設定が残っていることを確認:
     ENABLE_WRITE_ACTIONS=true
     SANITY_WRITE_TOKEN=<editor>
2. cd dashboard && npm run dev
3. 確認項目:
   - Topbar pill が 青 Pencil 「ローカル書き込み有効」 に変わる
   - /analytics で ReactionNotesCard の行を編集 → 保存
     → editor は即 read mode に collapse
     → 右下に emerald toast 「保存しました。10秒以内なら元に戻せます。」
   - PendingMonitoringCard の行で reactionNotes を埋める → 保存
     → 行が ReactionNotesCard に移動
     → 右下 toast は **10 秒間消えない** (本 fix の主目的)
   - 10 秒以内に「元に戻す」 → 旧値復元 + toast 消える
   - 10 秒待つと自動で toast 消える
   - .env.local で flag/token を片方ずつ off → topbar 「読み取り専用」 + 編集 disabled
4. server stdout で [updateReactionNotes:execute-ok] log を 1 行確認
   - token も本文も含まれていないことを目視
```

問題が無ければ **Phase 2B-2 spec batch (W5 humanReviewGate state)** に進行。

---

### Exact prompt for next Claude Code session (Phase 2B-2 spec batch)

```
Phase 2B-2 W5 humanReviewGate state update の detail spec を docs-only で起こしてください。

入力:
- docs/specs/phase-2b-write-actions.md (parent spec、§0.5 で Phase 2B-2 = W5 確定)
- docs/specs/phase-2b-1-reaction-notes.md (Phase 2B-1 spec、template 元)
- docs/handoff/0178-phase-2b-1-reaction-notes-implementation.md (2B-1 実装の学び)
- docs/handoff/0179-phase-2b-1-smoke-fix.md (本 batch、host pattern の learnings)

スコープ:
W5 = humanReviewGates[].state を /human-review-gates から更新可能にする。
state は controlled vocabulary (pending-review / in-progress / done / blocked) なので dropdown UI、テキスト入力ではない。
4 layer safety + 9 step flow + 8 UI state template を W5 に転用。
Toast / undo pattern は <AnalyticsToastHost> 相当を /human-review-gates 用に作る (or AppShell に上げる検討)。

Open question 候補:
- 複数 gate を 1 commit で更新するか
- "blocked" 遷移時に reason 入力を要求するか
- undo 戦略 (Q-6 を W5 でも採用するか、別判断か)

constraints は 2B-1 と同じ:
- Sanity schema 変更なし、Sanity 書き込みなし (spec のみ)
- publish-package / assets/visuals / patches 不変
- package 追加なし
- 23 routes 維持
```

## 10. Build validation summary

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1599ms
  Finished TypeScript in 2.1s
✓ Generating static pages using 13 workers (3/3) in 74ms

Routes: 18 page routes + 5 API routes = 23 total (unchanged from prior batch)

$ npm run build  (repo root, Sanity Studio)
✔ Build Sanity Studio (8063ms)

$ grep "SANITY_WRITE_TOKEN" dashboard/.next/static/chunks/*.js
.next/static/chunks/0_7w0njgfd6~h.js: 3 hits (all i18n strings, env var NAME only):
  - "SANITY_WRITE_TOKEN が設定されていません"  (editor error message)
  - "SANITY_WRITE_TOKEN が設定されていません"  (host error mapping)
  - "SANITY_WRITE_TOKEN 設定時のみ"            (disabled tooltip)
→ no token VALUE leakage
```

Token value read sites (server-only, 3):
- `src/lib/actions/sanityWriteClient.ts:29` — actual read
- `src/app/analytics/page.tsx:252` — `Boolean(...)`
- `src/components/app-shell/AppShell.tsx:21` — `Boolean(...)` (newly added for topbar pill)

Production write path verification (unchanged):
- `enableWriteActions` defaults to `false` (opt-in flag) — production stays disabled by env-absence
- `getSanityWriteClient()` returns `null` when token absent — server action returns `missing-token` before any Sanity call
- AND-gate enforced: flag alone or token alone is insufficient
