# Phase 2B-2 gate control invisible — visible diagnosis + missing-data affordance

日付: 2026-05-21

> Note: boss prompt 指定の `docs/devlog/0172-...` は前回 smoke fix で取得済 (0172-phase-2b-2-smoke-fix.md)。本 batch は次の空き番号 0173 を使用。

## 背景

handoff/0183 (devlog 0172) で Phase 2B-2 smoke fix を適用: badge は display only、別 button「状態を変更 ▾」 で edit。ただし boss が `http://localhost:3000/human-review-gates` を再度開いて確認したところ:

- Topbar は「ローカル書き込み有効」 (= writeReady=true)
- 各 row は state badge (レビュー待ち / 作業中 / 未着手) のみ表示
- **「状態を変更」 button が見えない**

つまり `<GateStateControl>` 自体が render されていない (前回の affordance 改善は内部の render branch にあるので、コンポーネントが呼ばれていなければ何の効果もない)。

## 決定・変更

### Root cause

`/human-review-gates/page.tsx` には render 時の安全 gate があった:

```ts
const canControl =
  !!it.gate._key &&
  !!it.campaignRev &&
  isGateState(it.gate.state)

{canControl ? <GateStateControl ... /> : <StatusBadge ... />}
```

`isGateState(state)` は boss が見ている `not-started` / `in-progress` / `pending-review` / `blocked` を全て true で返す。
`!!it.campaignRev` は GROQ で `_rev` 取得済なので truthy。
→ 失敗しているのは **`!!it.gate._key`**。

`seed/campaign-plan-building-hitori-media-os.json:229-239` を確認:

```json
"humanReviewGates": [
  {"gateName": "selectedPlatforms 確認", "state": "done", "reviewer": "self", ...},
  {"gateName": "x-hook-main-v1 Visual Register approve", "state": "pending-review", ...},
  ...
]
```

**9 件の gate に `_key` フィールドが無い**。Sanity client API は `client.create(doc)` で配列要素を渡すと、デフォルトでは `_key` を自動付与しない (auto-generation は `client.patch().insert()` でのみ動く、または明示的に `autoGenerateArrayKeys: true` 指定時)。Sanity Studio UI 経由で追加された配列要素は自動で `_key` が付くが、seed JSON を programmatic に import した path では `_key` 無しのまま入っている。

結果: `it.gate._key === undefined` → `canControl === false` → fallback `<StatusBadge>` のみが render → boss は「ボタンが見えない」。

### 修正方針

「データに `_key` が無い」 という現実を **UI 上で visible に surface** する。具体的には:

1. `/human-review-gates/page.tsx` の `canControl` gate を撤去、`<GateStateControl>` を **常に render** (state が schema enum 内であれば)
2. `<GateStateControl>` の Props を `gateKey?: string` / `campaignRev?: string` (optional) に拡張
3. `<GateStateControl>` 内に新しい render branch を追加:
   - `!gateKey || !campaignRev` のとき → 「編集不可 (要 Studio 再保存)」 amber pill を表示 + tooltip で原因説明
4. server-side 診断ログを `/human-review-gates/page.tsx` の Server Component に追加 — writeReady=true 時に `editableGates` / `missingIdentityGates` の数を console.log (`[hrg:diag]`)、token / notes / body は出さない
5. `commitTransition` 内に defensive runtime guard を追加 (`gateKey` / `revision` が空ならエラー表示で早期 return)

これで boss は:
- 「ボタンが見えない」 → 「編集不可 (要 Studio 再保存)」 の affordance が見えるようになり、原因が分かる
- どうしても編集したい場合は Studio で gate を開いて保存し直せば `_key` が付く

### 更新 (2 runtime + 1 spec ファイル)

| File | 変更内容 |
|---|---|
| `dashboard/src/components/gates/GateStateControl.tsx` | `Props.campaignRev` / `Props.gateKey` を optional 化、render 分岐に「missing _key/_rev」 amber pill 追加、`commitTransition` に defensive runtime guard 追加、`useState`/`useEffect` の campaignRev defaulting (`campaignRev ?? ''`) |
| `dashboard/src/app/human-review-gates/page.tsx` | `canControl` gate を撤去、`stateIsKnown` のみで分岐 (state が schema enum 外なら read-only badge)、`gateStateLabel` import を整理、診断ログ追加 (writeReady=true 時に editableGates / missingIdentityGates を `[hrg:diag]` で出力) |

### 新規 docs (3)

- `docs/devlog/0173-phase-2b-2-gate-control-visible-fix.md` (本ファイル)
- `docs/handoff/0184-phase-2b-2-gate-control-visible-fix.md`
- `docs/handoff/latest.md` (mirror)

### 触らないもの

- `schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json`
- `dashboard/src/lib/actions/updateGateState.ts` (server action は既に `_key` を validate で要求している、動作不変)
- `dashboard/src/lib/gates/stateTransitions.ts` (helpers 不変)
- `dashboard/src/components/common/UndoToastHost.tsx` (host 不変)
- Phase 2B-1 reactionNotes 関連 (touch なし、build safety のみ)
- `/campaigns/[slug]/page.tsx` (read-only に維持、前 batch で revert 済)

## 理由

### なぜ「ボタンを出さない」 ではなく「missing data の affordance を見せる」 か

選択肢を比較:

**Option A (採用)**: control を常に render、missing-data 用の disabled affordance を 1 つ追加
- pro: boss が「ここで編集できるはず」 と感じる場所に何かしらの control が出る、原因も tooltip / pill 文言で伝わる
- pro: 将来 Sanity Studio で再保存して `_key` が付与されれば、それだけで自動的に編集可能に切り替わる (page-level の変更不要)
- con: amber pill が並ぶと密度が増す

**Option B (不採用)**: control を出さず、page 上部に warning banner で「`_key` が無い gate があります」 と通知
- pro: row が綺麗
- con: 「どの gate?」 が即座に分からない、warning banner が無視されやすい

→ Option A が boss workflow に合う。「どの gate がなぜ編集できないか」 が row レベルで分かる。

### なぜ Studio 再保存で `_key` が付くと言えるか

Sanity Studio は配列要素を保存するたびに自動で `_key` を付与する (Sanity の標準動作)。`_key` 無しの要素は Studio UI で warning マークが出るが、編集して保存すると `_key` が injection される。

boss が `/human-review-gates` の amber pill を見て → Studio で該当 gate を開く → 編集なしで「保存」 を押す → `_key` 付与 → dashboard reload → control が edit 可能に切り替わる、というワークフローが成立する。

### なぜ自動 migration script を書かなかったか

`tools/sanity/add-_key-to-humanReviewGates.mjs` のような migration を書く path もあるが:
- spec scope ではない (本 batch は smoke fix microbatch)
- Studio で「保存」 を 9 回押すだけで完了する作業量
- migration script は `client.patch` での array-element manipulation を必要とし、追加の安全 review が必要
- 本 batch は「dashboard 上で原因を可視化する」 ことに留めるのが boss instruction の精神 (「Do not expand scope」) に整合

将来 reviewer / notes / completedAt 編集 (Phase 2B-2.1) で同じ問題が顕在化したら migration script を別 batch で検討。

### なぜ diagnostic log を `[hrg:diag]` prefix にしたか

既存 server log の prefix と整合:
- `[updateReactionNotes:stage]` (Phase 2B-1)
- `[updateGateState:stage]` (Phase 2B-2)
- `[hrg:diag]` (本 batch、page-level 診断)

grep しやすい + boss が「これは debugging info」 と即座に認識できる + production には流れない (`/human-review-gates` server-only render path)。

## 影響

- リポジトリ:
  - dashboard runtime: 2 ファイル更新 (`GateStateControl.tsx` + `/human-review-gates/page.tsx`)
  - docs: devlog 0173 + handoff 0184 + latest.md mirror
  - schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - boss は `/human-review-gates` を開いて amber pill「編集不可 (要 Studio 再保存)」 を見れば原因が分かる
  - Studio で gate を開いて保存 → `_key` 付与 → dashboard reload → 編集可能に
  - 新たに Studio UI 経由で追加した gate は最初から `_key` 付き → 即編集可能
- スキーマ: 不変
- プロダクト方針:
  - 「データに何かが欠けている」 という状態を UI で可視化する pattern を 1 件確立 (将来の reviewer / notes 編集や Phase 2B-3 W1 でも応用可)
  - 「dashboard で edit 不可」 = 「機能が壊れている」 ではなく「Studio で再保存が必要」 という明確な分離

## 次の一手

**Option A (推奨) — Manual smoke re-test on localhost**

boss が:
1. `npm run dev` で再起動
2. `/human-review-gates` を開く → 既存 gate の各 row に amber「編集不可 (要 Studio 再保存)」 pill が表示されるはず
3. server stdout に `[hrg:diag] { writeReady: true, campaigns: N, editableGates: 0, missingIdentityGates: 9 }` 相当の log が出る (具体数字はデータ状況による)
4. Sanity Studio で `campaignPlan.building-hitori-media-os` を開く → 任意の humanReviewGates アイテムを編集 (state を変えずに「保存」だけ) → Studio が `_key` を付与
5. dashboard を reload → 該当 row が `[状態を変更 ▾]` の青ボタンに切り替わる
6. boss workflow が成立することを確認

**Option B — Sanity migration script で `_key` を一括付与**

boss が 9 件 manual で開くのが面倒なら、`tools/sanity/add-keys-to-humanReviewGates.mjs` のような one-shot script を別 microbatch で作成。

**Option C — Phase 2B-2.1 microbatch (reviewer / notes 編集)**

`_key` 問題が Option A で解決すれば、次は reviewer / notes 編集対応。同じ「missing-data affordance」 pattern を再利用。

発信ネタ案: 「Sanity の `_key` auto-gen は `create` ではなく `patch.insert` でしか動かない — seed JSON を programmatic import した後に出る "編集できない" バグの正体」「`canControl` で wrap して silent fallback するより、disabled affordance を visible に出す方が UX として正しい」「Server Component の Server-side console.log を diagnostic に使う pattern」
