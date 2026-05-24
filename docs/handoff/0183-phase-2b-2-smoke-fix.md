# Handoff: Phase 2B-2 smoke fix — explicit control + read-only campaign detail

Date: 2026-05-21

## 1. Task Goal

handoff/0182 (devlog 0171) で Phase 2B-2 humanReviewGate state update を実装。boss が手元で smoke test した結果、UX bug + product 設計上の懸念を 2 件報告:

1. `/human-review-gates` で StatusBadge を click すると dropdown が開く設計が **affordance hidden**、boss が「どこで状態を変更するのか分からない」 と感じた
2. `/campaigns/[slug]` 確認ゲート tab でも同じ affordance 問題で編集できず、加えて boss が valid product concern を提示: 「status badge は status display であるべき、状態変更は explicit action にすべき」「`/human-review-gates` を編集 surface に絞り `/campaigns/[slug]` は read-only に」

本 batch は **UX + 設計 smoke fix microbatch**。Phase 2B scope は拡張しない。runtime / schema / publish-package / assets / patches / package.json 不変。`/analytics` reactionNotes regression なし (前 batch で host refactor 検証済)。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes すべて intact
- ✅ Production writes 永久 disabled (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` を Vercel に設定しない契約)
- ✅ 両 env が AND-gate、片方欠ければ server action は abort
- ✅ `SANITY_WRITE_TOKEN` 値は client bundle に inline されない (env var **名** のみ i18n string に出現)
- ✅ Server `console.log` は metadata only、token / notes / 本文を絶対 log しない
- ✅ Phase 2B-1 reactionNotes touch なし (build safety のみ)
- ✅ Visual Register writes 未実装
- ✅ promptTemplate save 未実装

## 3. Changed Files

### 更新 (2 runtime + 1 spec)

| File | 変更内容 |
|---|---|
| [dashboard/src/components/gates/GateStateControl.tsx](dashboard/src/components/gates/GateStateControl.tsx) | trigger 構造分割: `<StatusBadge>` は display 専用、横に explicit `<button>` 「状態を変更 ▾」 (青系) を別 element として配置。terminal state では button 代わりに「✓ 終了状態」 chip。Dropdown / confirm modal / undo hand-off / disabled fallback / error banner の動作は維持 |
| [dashboard/src/app/campaigns/[slug]/page.tsx](dashboard/src/app/campaigns/[slug]/page.tsx) | **gates tab を read-only に revert**: `<UndoToastHost>` wrap 削除、`<GateStateControl>` import 削除、`enableWriteActions` import 削除、`<GatesSection>` 引数を `({gates})` に戻す。上部に「ここでは状態を表示のみ。変更は /human-review-gates から行います。」 を追加、末尾の link を「確認待ちゲートで状態を変更する」 に書き換え |
| [docs/specs/phase-2b-2-human-review-gates.md](docs/specs/phase-2b-2-human-review-gates.md) | header status を「implemented + smoke-fixed」、§1 In scope に smoke fix 0183 revision、§5-2 Edit mode の trigger 仕様を「badge ≠ trigger」 に書き換え、§10 Files affected の `/campaigns/[slug]` 項目を read-only 設計に更新 |

### 新規 docs (3)

- [docs/devlog/0172-phase-2b-2-smoke-fix.md](docs/devlog/0172-phase-2b-2-smoke-fix.md)
- [docs/handoff/0183-phase-2b-2-smoke-fix.md](docs/handoff/0183-phase-2b-2-smoke-fix.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror)

### 触らないもの

- `schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` (root + dashboard)
- `dashboard/src/lib/actions/updateGateState.ts` (server action 動作等価、`/human-review-gates` 経由のみ呼ばれる前提)
- `dashboard/src/lib/gates/stateTransitions.ts` (allow-list / helpers 不変)
- `dashboard/src/components/common/UndoToastHost.tsx` (動作不変)
- `dashboard/src/lib/groq/campaign.ts` (`_rev` / `_key` projection は維持、read-only な `/campaigns/[slug]` でも `_rev` を fetch しても害なし)
- `dashboard/src/app/human-review-gates/page.tsx` (`<GateStateControl>` の internal change だけが効く、page 側の wiring は不変)
- `dashboard/src/app/analytics/page.tsx` / `dashboard/src/components/analytics/*` (Phase 2B-1 touch なし)
- `dashboard/README.md` (Phase 2B 2 surface 表のまま、`/campaigns/[slug]` read-only への言及は README で boss が改めて見て更新したければ別 microbatch)

合計 **2 runtime + 1 spec + 3 docs = 6 ファイル変更**。

## 4. Summary of Changes

### 4-1. Root cause

`<GateStateControl>` の前 design は **`<StatusBadge>` 自身を `<button>` で wrap** していた。`<button>` には hover 効果 + 小さな chevron icon を付与していたが:
- badge の色 (state-tone) が dominant で「これは label」 と読まれる
- chevron が小さすぎて視線が拾わない
- click できると分かる ユーザーは training された開発者のみ、初見の boss は「ここで何かが起きるはず」 と気づかない

結果: boss が編集できると気づかず、機能はあったが unreachable な状態だった。

加えて boss が product 設計の concern を提示:
- status display と manual change は別 affordance であるべき
- 編集 surface は 1 か所 (`/human-review-gates`) に絞り、`/campaigns/[slug]` は観察 surface に保つほうが情報設計として健全

### 4-2. Files changed (詳細)

#### `dashboard/src/components/gates/GateStateControl.tsx`

Before (前 batch):
```jsx
<button onClick={toggleDropdown}>
  <StatusBadge ... />              {/* badge inside button */}
  <ChevronDown size={12} />        {/* small chevron */}
</button>
```

After (smoke fix 0183):
```jsx
<div className="inline-flex items-center gap-1.5">
  <StatusBadge ... />              {/* badge: display only */}

  {terminalLocked ? (
    <span className="...slate-50 text-slate-500">
      <CheckCircle2 size={11} /> 終了状態
    </span>
  ) : (
    <button onClick={toggleDropdown}
            className="...bg-blue-50 border-blue-300 text-blue-800">
      <span>状態を変更</span>
      <ChevronDown size={12} />
    </button>
  )}
</div>
```

- Badge と change-button が **別 element**、それぞれ独立 role
- Button は青系で `<StatusBadge>` の state-tone とは別 affordance を確立
- 終端状態は灰色「終了状態」 chip、disabled button より誤読が少ない
- Dropdown menu / confirm modal / error banner / saving spinner の動作は不変

#### `dashboard/src/app/campaigns/[slug]/page.tsx`

- `<UndoToastHost>` wrap を `<TabsContent value="gates">` 内から削除
- `<GateStateControl>`、`enableWriteActions`、`isGateState` の import を削除
- `<GatesSection>` 引数を `({gates})` に revert (writeReady / campaignId / campaignRev を渡さない)
- 内部で `<StatusBadge state={g.state} label={gateStateLabel(g.state)} />` だけを render (read-only)
- 上部に説明文を追加:
  ```
  ここでは状態を表示のみ。変更は /human-review-gates から行います。
  ```
  `<Link>` を inline で hyperlink 化
- 末尾の link 文言を更新:
  - 旧: `全 gate を /human-review-gates で確認`
  - 新: `確認待ちゲートで状態を変更する`
- Gates が空のときも同じ「変更は /human-review-gates から」 link を表示

#### `docs/specs/phase-2b-2-human-review-gates.md`

- Header: 最終更新日 + ステータスを「implemented + smoke-fixed」 に変更
- §1 In scope: smoke fix 0183 revision を明記 (`/campaigns/[slug]` は read-only、`/human-review-gates` は explicit 編集 button)
- §5-2 Edit mode: dropdown trigger 仕様を「badge ≠ trigger」 で書き換え、azur button visual を明示、terminal の「終了状態」 chip を追加
- §10 Files affected: `/campaigns/[slug]` の変更内容を「read-only に revert」 + 注記表示 + link rewording に更新

### 4-3. /human-review-gates explicit control behavior

各 gate row の見た目 (writeReady = true、非 terminal):

```
| selectedPlatforms 確認  [作業中]  [状態を変更 ▾] |
|   campaign: building-... reviewer: ...           |
|   notes summary line                             |
```

- `[作業中]` は `<StatusBadge>` (緑/amber/灰のいずれか)、表示専用
- `[状態を変更 ▾]` は青系 button、これだけが action affordance
- click → dropdown 展開、`getAllowedGateTransitions(currentState)` の結果のみ表示
- 非 terminal target: 1-click commit → 右下 toast (10秒) → router.refresh()
- terminal target (`done` / `skipped`): confirm modal → 「キャンセル」/「完了にする」/「スキップする」
- terminal state row: button の代わりに `[✓ 終了状態]` chip、Studio で reopen 必要

エラー処理:
- `conflict` → inline rose banner + 「更新」 button → `router.refresh()`
- `transition-not-allowed` → inline rose banner (allow-list bypass 試行の defense-in-depth)
- `permission` / `missing-token` / `write-disabled` → inline rose banner (通常起きないが備える)

Undo:
- 成功時 `useUndoToast().notifySaved(...)` で host に hand-off
- 10 秒 emerald toast + 「元に戻す」 button (host が手数値を保持)
- 「元に戻す」 click → `updateGateState({isUndo: true, nextState: previousState, expectedRevision: newRev})` → 復帰

### 4-4. /campaigns/[slug] read-only behavior

「確認ゲート」 tab の中身 (read-only):

```
ここでは状態を表示のみ。変更は /human-review-gates から行います。  ← inline link

| selectedPlatforms 確認  [作業中]              |
|   reviewer: ... at: ...                       |
|   notes summary                               |
| ... 他 gate ...                                |

→ 確認待ちゲートで状態を変更する  ← bottom link
```

- 編集 control / dropdown / confirm modal / toast host **すべて出ない**
- `<StatusBadge>` だけが badge を表示、tooltip も含めて click 反応なし
- 末尾の hyperlink で `/human-review-gates` に遷移、boss はそこで編集を継続
- Tabs 切替 / page navigation は他 Tab に影響なし
- Sanity 書き込みは server side `updateGateState` 経由のみ、本 page からは呼ばれない

### 4-5. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1417ms
  Finished TypeScript in 2.2s
✓ Generating static pages using 13 workers (3/3) in 69ms

Routes: 18 page routes + 5 API routes = 23 total (unchanged)

$ npm run build  (root, Studio)
✔ Build Sanity Studio (9938ms)
```

### 4-6. Security / token leak check

**Client static bundle audit** (`grep -o "SANITY_WRITE_TOKEN[^\"',]*[\"']" .next/static/chunks/*.js`):
- 2 chunks × 2 i18n strings = **4 hits**, all are env var **NAME** in user-facing text:
  - `"SANITY_WRITE_TOKEN が設定されていません"` — error message
  - `"SANITY_WRITE_TOKEN 設定時のみ"` — disabled tooltip
- **Zero hits of the token VALUE**.

**Server-side token reads** (dropped from 5 → 4 sites after `/campaigns/[slug]` revert):
- `src/lib/actions/sanityWriteClient.ts:29` — actual token read
- `src/components/app-shell/AppShell.tsx:21` — `Boolean(...)` for topbar pill
- `src/app/analytics/page.tsx:252` — `Boolean(...)` for Phase 2B-1 props
- `src/app/human-review-gates/page.tsx:127` — `Boolean(...)` for HRG writeReady
- (`src/app/campaigns/[slug]/page.tsx:224` was removed; no longer reads token)

**Server console.log**: 動作不変、`updateGateState` も `updateReactionNotes` も metadata-only logging を維持。

## 5. Key Decisions

- **Badge と change-button を別 element に**: 「label と action は別 affordance」 原則を採用、boss が badge を click できると勘違いしない設計
- **Button を青系に**: status-tone (緑/amber/灰/桃) と衝突せず、dashboard 全体の link 色 (`text-blue-700`) と整合
- **Terminal で「終了状態」 chip**: disabled button より誤読リスクが低い、Studio reopen 必要を tooltip で残す
- **`/campaigns/[slug]` を read-only に戻す**: 編集 surface を `/human-review-gates` 単独に絞る、観察 / 編集 surface 分離を Phase 2B 全体の原則に
- **`/campaigns/[slug]` 上部に注記**: boss が次に開いたときも迷わないよう、tab opens 直後に文字で「ここでは表示のみ」 を伝える
- **末尾 link 文言を「変更する」 に**: 旧文言「全 gate を確認」 は閲覧の意味、新文言は edit intent を明示
- **GROQ `_rev` / `_key` projection を維持**: `/campaigns/[slug]` で使わなくても、`/human-review-gates` で必要、また将来 2B-2.1 (reviewer / notes 編集) で再利用する可能性、保持コスト 0
- **Spec を「implemented + smoke-fixed」 status に**: 完了状態を spec 自体に反映、次の reader に「これは smoke 1 周終わった spec」 と伝わる
- **devlog / handoff を separate にする**: 0171 / 0182 は implementation 記録、本 batch は UX fix の記録 — 別 entry にすることで後の reader が変更履歴を追いやすい

## 6. Human Review Questions

### Smoke test (boss が再 dev server 起動で確認)

1. `/human-review-gates` の各 row に `[StatusBadge] [状態を変更 ▾]` が並ぶか? 青 button が click 可能と即座に分かるか?
2. `[状態を変更 ▾]` click で dropdown 展開、allowed transitions のみ表示か?
3. `not-started → in-progress` で 1-click commit → 右下 toast + Studio 反映?
4. `pending-review → done` で confirm modal、「キャンセル」/「完了にする」 動作?
5. terminal row (`done` / `skipped`) で `[✓ 終了状態]` chip が表示され、button が出ないこと?
6. `/campaigns/[slug]` 「確認ゲート」 tab で badge だけ表示、編集 control なし、「確認待ちゲートで状態を変更する」 link が見える?
7. Phase 2B-1 reactionNotes 動作不変 (regression なし)?
8. server stdout で `[updateGateState:execute-ok]` log — token / 本文が出ていない?

### 設計判断 review

9. 「状態を変更」 button のラベル: 「変更」 / 「編集」 / 「移行」 などの代替は不要?
10. 「終了状態」 chip の文言: 「完了済み」 / 「終端」 / 「Terminal」 等の代替は?
11. `/campaigns/[slug]` 上部の注記文言「ここでは状態を表示のみ。変更は /human-review-gates から行います。」 で OK?
12. README に `/campaigns/[slug]` read-only を明記する必要はあるか? (現状の README は両 surface を併記、boss が見て「混乱しない」 なら無修正で OK)
13. Phase 2B-2.1 で reviewer / notes 編集を `/human-review-gates` に追加するなら、編集 button は「状態を変更」 とは別の「メモを編集」 button にする? それとも統合 modal?

## 7. Risks or Uncertainties

- **「状態を変更」 button の汎用性**: 将来 reviewer / notes 編集を追加すると button が 1 行に並ぶ ([状態を変更] [メモを編集] [reviewer]…)。dense list で詰まる可能性、2B-2.1 spec で再評価
- **`/campaigns/[slug]` 注記文の position**: tab 開いた直後の領域に表示しているが、視線が badge に行く前に読まれるか視覚的に未確認 (smoke test で boss feedback 待ち)
- **Dropdown menu の position absolute**: button から `top-full left-0` で展開、横並び要素 ([状態を変更] が右端なら) で画面右端を超える可能性。`/human-review-gates` の card は `max-w-[1280px]` なので通常は OK だが、boss の monitor で確認
- **Build cache の影響**: `<GateStateControl>` の HMR が boss の dev server で正しく反映されるか不明 (`npm run dev` 再起動で確実)
- **`/campaigns/[slug]` で `_rev` を依然 fetch している**: 編集に使わなくても overhead 0 件、無害だが「使わない field を取る」 という意味で一貫性に違和感。次の major refactor で削除候補

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- Smoke test 結果反映 (boss が見て調整したい button label / chip 文言 / 注記文があれば)
- README に `/campaigns/[slug]` read-only 設計を 1 行追記する microbatch (boss が必要と判断すれば)
- a11y: `[状態を変更 ▾]` button のキーボード navigation (現状 click only、Enter / Space で開く動作確認)

### 中期 (Phase 2B-2.1 microbatch)

- `reviewer` 編集 (string input or dropdown of known reviewers)
- `notes` 編集 (textarea, 2000 char cap)
- `done` 遷移時に `completedAt` 自動 patch (boss 要望次第)
- `/human-review-gates` 上で「状態を変更」 と並行する別 button or modal で reviewer/notes 編集

### 中期 (Phase 2B-3 spec)

- W1 visual approve & register bridge (parent Q-3 確定後)
- 同 server action / 同 host pattern を W1 に転用

### 長期

- AppShell-level `<UndoToastHost>` lift (handoff/0179 §8 言及)
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)
- `/campaigns/[slug]` を「観察 surface」 として完全整理 (KPI / progress / read-only sections 一貫化)

## 9. Next Recommended Step

**Phase 2B-2 smoke re-test on localhost**

```
1. cd dashboard && npm run dev
2. /human-review-gates を開く
   - 各 row に [StatusBadge] [状態を変更 ▾] が並ぶ
   - [状態を変更 ▾] click で dropdown 展開
   - not-started -> in-progress 1-click commit + toast
   - in-progress -> pending-review 1-click
   - pending-review -> done confirm modal -> 「完了にする」 → Studio で done 確認
   - 10秒以内に「元に戻す」 で previousState 復帰
   - done / skipped row では [✓ 終了状態] chip が出る (button なし)
3. /campaigns/[slug]/<slug> の「確認ゲート」 tab
   - 上部に「ここでは状態を表示のみ。変更は /human-review-gates から行います。」
   - 各 gate に badge のみ、dropdown / button なし
   - 末尾「確認待ちゲートで状態を変更する」 link click → /human-review-gates に遷移
4. /analytics で reactionNotes 編集 (regression check)
5. .env.local で ENABLE_WRITE_ACTIONS=false → 再起動 → topbar amber + 編集不可
6. server stdout で [updateGateState:execute-ok] log → token / 本文が出ていないこと
```

問題なければ:
- **Option A**: Phase 2B-2.1 microbatch (reviewer / notes / completedAt 拡張)
- **Option B**: Phase 2B-3 spec batch (W1 visual approve、parent Q-3 確定後)

---

### Exact prompt for next Claude Code session (Phase 2B-2.1 spec、boss が reviewer/notes 編集を希望すれば)

```
Phase 2B-2.1 microbatch spec を docs-only で起こしてください。

入力:
- docs/specs/phase-2b-2-human-review-gates.md (smoke-fixed)
- docs/handoff/0183-phase-2b-2-smoke-fix.md (本 batch、affordance 分離の lessons)

スコープ:
W5+ humanReviewGates[_key].reviewer / notes / completedAt の編集対応。

constraints:
- /human-review-gates が編集 surface (Phase 2B-2 で確定)
- /campaigns/[slug] は read-only (Phase 2B-2 で確定)
- Sanity schema 不変
- field allow-list 拡張: reviewer / notes / completedAt のみ追加可能
- done 遷移時に completedAt 自動 patch するか boss confirmation 必要
- 編集 UI は [状態を変更] とは別 affordance ([メモ編集] button or modal)
```

## 10. Validation

```
=== Build (both) ===
$ cd dashboard && npm run build  → ✓ 23 routes green
$ npm run build (root, Studio)   → ✓ Sanity Studio (9938ms)

=== Out-of-scope file check (expect none) ===
$ find schemas tools publish-package assets/visuals patches \
    -type f -newer docs/devlog/0171-phase-2b-2-human-review-gates-implementation.md
(empty = OK)

=== Token leak check ===
$ grep -o "SANITY_WRITE_TOKEN[^\"',]*[\"']" dashboard/.next/static/chunks/*.js
4 hits across 2 chunks, all are env var NAME in i18n strings.
Zero hits of token VALUE.

=== Server-side token reads (4 sites; -1 from Phase 2B-2 due to /campaigns/[slug] revert) ===
- dashboard/src/lib/actions/sanityWriteClient.ts:29 (actual)
- dashboard/src/components/app-shell/AppShell.tsx:21 (Boolean)
- dashboard/src/app/analytics/page.tsx:252 (Boolean)
- dashboard/src/app/human-review-gates/page.tsx:127 (Boolean)
```

Build skipped only for spec edits. Runtime behavior: `/human-review-gates` explicit-button trigger lands, `/campaigns/[slug]` reverts to observation-only.
