# Handoff: Phase 2B-2 gate control visible fix — surface missing-data state on `/human-review-gates`

Date: 2026-05-21

> Note on numbering: boss prompt asked for `docs/devlog/0172-phase-2b-2-gate-control-visible-fix.md`, but `docs/devlog/0172-phase-2b-2-smoke-fix.md` was already taken by the previous smoke fix (handoff/0183). This batch uses `docs/devlog/0173-...` (next free number). Handoff `0184` is free as requested.

## 1. Task Goal

handoff/0183 (devlog 0172) で Phase 2B-2 smoke fix を適用 (badge / button 分離 + `/campaigns/[slug]` read-only)。boss が再度 `http://localhost:3000/human-review-gates` を開いて smoke test → Topbar は「ローカル書き込み有効」 (writeReady=true)、しかし各 gate row が state badge だけ表示し **「状態を変更」 button が見えない**。

つまり前回の affordance 改善は `<GateStateControl>` の中で行われたが、 **コンポーネント自体が render されていない** ことが分かった。本 batch は root cause を突き止め、boss が原因を理解し前進できる UI を提供する **smoke fix microbatch**。

Phase 2B scope は拡張しない。runtime / schema / publish-package / assets / patches / package.json 不変。`/analytics` reactionNotes touch なし。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes すべて intact
- ✅ Production writes 永久 disabled
- ✅ 両 env (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN`) が AND-gate
- ✅ `SANITY_WRITE_TOKEN` 値は client bundle に inline されない (env var **名** のみ i18n string に出現)
- ✅ Server `console.log` は metadata only — `[hrg:diag]` も `editableGates` / `missingIdentityGates` の **数値のみ**、notes / body / token は絶対 log しない
- ✅ Phase 2B-1 reactionNotes touch なし (build safety のみ)
- ✅ `/campaigns/[slug]` read-only に維持 (前 batch revert を保つ)
- ✅ Visual Register writes / promptTemplate save 未実装
- ✅ Sanity への write は依然 server action 経由のみ

## 3. Changed Files

### 更新 (2 runtime)

| File | 変更内容 |
|---|---|
| [dashboard/src/components/gates/GateStateControl.tsx](dashboard/src/components/gates/GateStateControl.tsx) | `Props.campaignRev` / `Props.gateKey` を **optional** に変更、render 分岐に **missing-data branch** 追加 (amber pill「編集不可 (要 Studio 再保存)」 + tooltip で原因説明)、`useState`/`useEffect` の `campaignRev` を `?? ''` で defaulting、`commitTransition` 先頭に defensive runtime guard 追加 |
| [dashboard/src/app/human-review-gates/page.tsx](dashboard/src/app/human-review-gates/page.tsx) | `canControl` gate を撤去 (`<GateStateControl>` を **常に render**)、`stateIsKnown = isGateState(state)` のみで分岐 (state が schema enum 外なら read-only badge fallback)、import を整理 (`gateStateLabel` 削除、`HumanReviewGateState` 型 import 追加)、`writeReady=true` 時に server-side 診断ログ `[hrg:diag]` を出力 (`editableGates` / `missingIdentityGates` の数のみ、token / notes 出さない) |

### 新規 docs (3)

- [docs/devlog/0173-phase-2b-2-gate-control-visible-fix.md](docs/devlog/0173-phase-2b-2-gate-control-visible-fix.md) (boss prompt は 0172 を指定したが taken のため 0173 に numbering shift)
- [docs/handoff/0184-phase-2b-2-gate-control-visible-fix.md](docs/handoff/0184-phase-2b-2-gate-control-visible-fix.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror)

### 触らないもの

- `schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- `dashboard/src/lib/actions/updateGateState.ts` (server action は既に `_key` regex validate で reject 済、動作不変)
- `dashboard/src/lib/actions/sanityWriteClient.ts` / `featureFlags.ts` / `updateReactionNotes.ts`
- `dashboard/src/lib/gates/stateTransitions.ts` (allow-list / helpers 不変)
- `dashboard/src/lib/groq/campaign.ts` (GROQ projection は前 batch で既に `_rev` + `_key` を要求済、変更なし)
- `dashboard/src/components/common/UndoToastHost.tsx` (動作不変)
- `dashboard/src/components/StatusBadge.tsx`
- `dashboard/src/components/analytics/*` (Phase 2B-1 touch なし)
- `dashboard/src/app/campaigns/[slug]/page.tsx` (read-only に維持、前 batch revert を保つ)
- `dashboard/src/app/analytics/page.tsx` (Phase 2B-1 動作不変)
- `dashboard/README.md` (内容は前 batch のまま正確)

合計 **2 runtime + 3 docs = 5 ファイル変更**。

## 4. Summary of Changes

### 4-1. Root cause

`/human-review-gates/page.tsx` の前 design は安全 gate を持っていた:

```ts
const canControl =
  !!it.gate._key &&
  !!it.campaignRev &&
  isGateState(it.gate.state)

{canControl ? <GateStateControl ... /> : <StatusBadge ... />}
```

3 条件のいずれかが false なら `<GateStateControl>` を render せず、bare `<StatusBadge>` で fallback。boss が見ていた `not-started` / `in-progress` / `pending-review` / `blocked` は全て `isGateState()` で true、GROQ projection は doc level `_rev` を返している → 失敗していたのは `!!it.gate._key`。

`seed/campaign-plan-building-hitori-media-os.json:229-239` を確認: **9 件すべての humanReviewGates 要素に `_key` フィールドが無い**。これらは Sanity に programmatic import された際、`autoGenerateArrayKeys: true` 指定が無かったため `_key` 未付与のまま入っている。Sanity の標準動作: `client.create(doc)` で配列要素を渡しても `_key` 自動付与は行われない (`client.patch().insert()` または Studio UI 経由のみ auto-gen)。

`canControl === false` → bare badge fallback → boss は「ボタンが見えない」 と感じた。

### 4-2. Fix design

**Always render `<GateStateControl>`**、コンポーネント内部で「writeReady=false」「missing-data」「terminal」「editable」 の 4 affordance を出し分ける。これにより:
- boss は row レベルで「なぜ編集できないか」 を即座に理解できる
- Studio で gate を開いて再保存すれば自動的に編集可能に切り替わる (page-level 変更不要、Sanity が `_key` を inject)

### 4-3. `<GateStateControl>` の 4 affordance branch

```
writeReady=false:        [StatusBadge] [🔒 編集不可]
                                       (slate disabled pill + tooltip about env vars)

writeReady=true / missing _key or _rev:
                         [StatusBadge] [🔒 編集不可 (要 Studio 再保存)]
                                       (amber pill + tooltip explaining
                                        Studio re-save will inject _key/_rev)

writeReady=true / terminal state (done / skipped):
                         [StatusBadge] [✓ 終了状態]
                                       (slate chip + tooltip about Studio reopen)

writeReady=true / editable transitions exist:
                         [StatusBadge] [状態を変更 ▾]
                                       (blue button — explicit action affordance,
                                        opens dropdown of allowed transitions)
```

Badge は **どの branch でも常に display only**。Action affordance だけが branch 別に変わる。

### 4-4. `/human-review-gates` integration

- `canControl` gate を撤去
- `stateIsKnown = isGateState(it.gate.state)` のみで `<GateStateControl>` vs fallback `<StatusBadge>` を選ぶ (schema enum 外の state なら badge のみ)
- `<GateStateControl>` には `gateKey` / `campaignRev` を可能ならそのまま渡す (両方が optional プロパティ)
- 4 affordance の出し分けは control 内部

### 4-5. Server-side diagnostic log

`/human-review-gates/page.tsx` の Server Component に追加:

```ts
if (writeReady) {
  let editable = 0
  let missing = 0
  for (const c of campaigns) {
    for (const g of c.gates ?? []) {
      if (!isGateState(g.state)) continue
      const hasKey = typeof g._key === 'string' && g._key.length > 0
      const hasRev = typeof c._rev === 'string' && c._rev.length > 0
      if (hasKey && hasRev) editable += 1
      else missing += 1
    }
  }
  console.log('[hrg:diag]', {
    writeReady,
    campaigns: campaigns.length,
    editableGates: editable,
    missingIdentityGates: missing,
  })
}
```

出力例 (boss の `npm run dev` server stdout で見える):
```
[hrg:diag] { writeReady: true, campaigns: 1, editableGates: 0, missingIdentityGates: 9 }
```

これを見れば boss は「データに `_key` が無い」 と即座に確認できる。**token / notes / body / reviewer は一切出さない**。

### 4-6. Defensive runtime guard in `commitTransition`

万一 `<GateStateControl>` の editable branch に到達した状態で `gateKey` / `revision` が空であれば、`commitTransition` 先頭で:

```ts
if (!gateKey || !revision) {
  setStatus({
    kind: 'error',
    message: 'この gate には _key / _rev が付与されていません。Sanity Studio で再保存してください。',
    isConflict: false,
  })
  return
}
```

Server action call の前に止める → token consumption + Sanity round trip を避ける。実際には render 分岐 (missing-data branch) で editable button 自体を出さないので到達しないが、念のため runtime safety を担保。

### 4-7. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1504ms
  Finished TypeScript in 2.1s
✓ Generating static pages using 13 workers (3/3) in 65ms

Routes: 18 page + 5 API = 23 (unchanged)

$ npm run build (root, Studio)
✔ Build Sanity Studio (10623ms)
```

### 4-8. Token leak audit

```
$ grep -o "SANITY_WRITE_TOKEN[^\"',]*[\"']" .next/static/chunks/*.js
- chunk A: "SANITY_WRITE_TOKEN が設定されていません" (i18n)
- chunk A: "SANITY_WRITE_TOKEN 設定時のみ"             (i18n)
- chunk B: "SANITY_WRITE_TOKEN が設定されていません" (i18n)
- chunk B: "SANITY_WRITE_TOKEN 設定時のみ"             (i18n)

All hits are the env var NAME in user-facing strings.
Zero hits of the token VALUE.
```

Server-side reads (4 sites — unchanged from previous batch):
- `src/lib/actions/sanityWriteClient.ts:29` (actual)
- `src/components/app-shell/AppShell.tsx:21` (Boolean)
- `src/app/analytics/page.tsx:252` (Boolean)
- `src/app/human-review-gates/page.tsx:127` (Boolean)

## 5. Key Decisions

- **Always render `<GateStateControl>`**: silent fallback hides root cause; visible affordance forces boss to see why a row can't be edited
- **Optional `gateKey` / `campaignRev` on the control**: lets the same component handle 4 affordance branches in one place, no `canControl` decision at the call site
- **Amber pill (not red) for missing-data**: this is not a security bug or runtime failure, it's a data state requiring Studio re-save. Amber communicates "needs attention" without alarm
- **Tooltip text explains the fix**: "Sanity Studio で gate を開いて保存し直すと付与されます" — boss can self-serve
- **No automatic migration script**: out of scope. Studio re-save is a 9-click workflow; a migration script needs separate security review (array element patching). Could be a future microbatch if boss prefers
- **`[hrg:diag]` prefix for server log**: integrates with existing `[updateGateState:...]` / `[updateReactionNotes:...]` patterns; grep-friendly
- **Diagnostic log emits counts only**: no token, no notes, no body content, no reviewer name — only `editableGates` + `missingIdentityGates` counts plus `campaigns.length`
- **Defensive `commitTransition` guard**: unreachable in normal flow, but cheap to add and provides a clean failure path if assumptions break
- **`/campaigns/[slug]` untouched**: previous batch's read-only revert is preserved
- **No GROQ change**: projection already includes `_rev` + `_key`; the issue is data, not query

## 6. Human Review Questions

### Smoke re-test

1. `/human-review-gates` を開き、各 row が `[StatusBadge] [🔒 編集不可 (要 Studio 再保存)]` の組み合わせを表示するか? (Topbar は「ローカル書き込み有効」 のままのはず)
2. `npm run dev` の server stdout に `[hrg:diag] { writeReady: true, campaigns: N, editableGates: 0, missingIdentityGates: 9 }` のようなログが出るか?
3. **Studio で 1 件試す**: Sanity Studio で `campaignPlan.building-hitori-media-os` を開き、humanReviewGates の任意の 1 アイテムを編集 (text を 1 文字変えて戻すだけでも OK) → 「保存」 → dashboard reload → 該当 row が `[状態を変更 ▾]` の青ボタンに切り替わるか?
4. その row で `not-started → in-progress` 等の遷移を試して、Sanity Studio で state が反映されるか?
5. 10秒以内に「元に戻す」 で previousState 復帰?
6. terminal state (`done`) の row でも `_key` が無ければ「編集不可 (要 Studio 再保存)」 が出る、`_key` がある + terminal なら「✓ 終了状態」 が出る、ことを確認?
7. `/campaigns/[slug]` 確認ゲート tab で「ここでは状態を表示のみ。」 read-only design が維持されているか?
8. `/analytics` reactionNotes 動作不変?

### Design choice review

9. amber pill 文言「編集不可 (要 Studio 再保存)」 で OK? boss が「もっと具体的に / もっと短く」 希望あれば調整
10. tooltip 文言「この gate には Sanity 内部 _key/_rev が付与されていません。Sanity Studio で gate を開いて保存し直すと付与されます。」 で意味が伝わるか?
11. diagnostic log を **常時 emit** している (writeReady=true なら毎 page render)、頻度が多すぎないか? dev-only build flag で gate する必要があるか?
12. 9 件の gate を Studio で手動再保存するのが面倒なら、`tools/sanity/add-keys-to-humanReviewGates.mjs` migration script を別 microbatch で書く path もある — boss 判断

## 7. Risks or Uncertainties

- **Sanity の `autoGenerateArrayKeys` 仕様確認**: 本 batch の root cause 推測は「seed JSON が programmatic import 時に `_key` 未付与」。Studio で 1 件再保存して `_key` が付与されることを boss が確認したら確定 (本 batch 内で実機テストはしていない)
- **diagnostic log の頻度**: writeReady=true で `/human-review-gates` を開くたびに log が出る。production deploy では writeReady=false で出ないが、local dev では多く出る。debug 完了後に「常時 log」 を「dev-only NODE_ENV」 に限定する microbatch が必要かも
- **Studio 再保存 workflow の認知負荷**: 9 件すべてを手動で開いて保存するのは boss UX として面倒な可能性。migration script を書くべきか判断が必要
- **新規追加 gate は影響なし**: Studio UI 経由で追加された gate は最初から `_key` 付き → 即編集可能。問題は既存 seed-loaded gate のみ
- **Phase 2B-2.1 (reviewer / notes 編集) で同じ問題**: reviewer / notes も `_key` で identify するので、本 batch で `_key` を付与しないと 2B-2.1 もブロックされる。migration script を書くなら 2B-2.1 前が良いタイミング

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Smoke test 結果反映**: 文言調整 / log frequency 調整 / 必要なら migration script
- **`tools/sanity/add-keys-to-humanReviewGates.mjs` migration script** (boss が手動 9 回保存を避けたい場合): `client.patch(_id).set({humanReviewGates: rebuiltArrayWithKeys}).commit()` で一括付与、dry-run / execute 2-stage、Phase 2B-1 reflect-publication-state パターンを踏襲

### 中期 (Phase 2B-2.1 microbatch)

- `reviewer` / `notes` / `completedAt` 編集対応 — 同じ「missing-data affordance」 pattern を再利用
- `done` 遷移時の `completedAt` 自動 patch も再評価

### 中期 (Phase 2B-3 spec)

- W1 visual approve & register bridge (parent Q-3 確定後)

### 長期

- diagnostic log を「dev-only」 に限定 (NODE_ENV 検証)
- AppShell-level `<UndoToastHost>` lift
- `<DeferredActionButton>` 削除

## 9. Next Recommended Step

**Manual smoke re-test on localhost** (§6 の 1〜8)

特に確認すべき:
1. amber「編集不可 (要 Studio 再保存)」 pill が visible
2. `[hrg:diag]` server log が出る
3. Studio で 1 件再保存 → dashboard reload → 該当 row が `[状態を変更 ▾]` 青ボタンに切り替わる
4. `/campaigns/[slug]` read-only / `/analytics` reactionNotes 動作不変

問題なければ次の選択肢:
- **Option A**: 9 件すべてを Studio で manual 再保存 + Phase 2B-2 全 transition smoke 再開
- **Option B**: migration script microbatch (`add-keys-to-humanReviewGates.mjs`)
- **Option C**: Phase 2B-2.1 microbatch (reviewer / notes 編集)
- **Option D**: Phase 2B-3 spec batch (W1 visual approve、parent Q-3 確定後)

---

### Exact prompt for next Claude Code session (Option B — migration script)

```
Phase 2B-2 follow-up microbatch: humanReviewGates `_key` 一括付与 migration script を作成してください。

入力:
- docs/handoff/0184-phase-2b-2-gate-control-visible-fix.md
- tools/sanity/reflect-publication-state.mjs (controlled write pattern reference)

スコープ:
- tools/sanity/add-keys-to-humanReviewGates.mjs を新規作成
- 全 campaignPlan を walk、humanReviewGates 配列で `_key` 未付与の要素にランダム `_key` を付与
- dry-run / execute 2-stage、`SANITY_WRITE_TOKEN` 必須
- `client.patch(_id, {ifRevisionID}).set({humanReviewGates: rebuiltArray}).commit()` pattern
- log は metadata のみ、token / 本文 / reviewer は出さない

constraints は Phase 2B-2 と同じ:
- Sanity schema 不変
- publish-package / assets / patches 不変
- package 追加なし
- production 環境で動かさない (`.env.local` 専用、boss が手動実行)
```

## 10. Validation

```
=== Build ===
$ cd dashboard && npm run build   → ✓ 23 routes green
$ npm run build (root, Studio)    → ✓ Sanity Studio (10623ms)

=== Out-of-scope file check (expect empty) ===
$ find schemas tools publish-package assets/visuals patches package.json \
    -newer docs/handoff/0183-phase-2b-2-smoke-fix.md
(empty = OK)

=== Token leak ===
$ grep -o "SANITY_WRITE_TOKEN[^\"',]*[\"']" dashboard/.next/static/chunks/*.js
4 hits across 2 chunks, all are env var NAME in i18n strings.
Zero hits of token VALUE.

=== Server-side token reads (4 sites, unchanged) ===
- dashboard/src/lib/actions/sanityWriteClient.ts:29 (actual)
- dashboard/src/components/app-shell/AppShell.tsx:21 (Boolean)
- dashboard/src/app/analytics/page.tsx:252 (Boolean)
- dashboard/src/app/human-review-gates/page.tsx:127 (Boolean)
```
