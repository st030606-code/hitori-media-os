# Phase 2B-2 smoke fix — explicit "状態を変更" control + `/campaigns/[slug]` read-only

日付: 2026-05-21

## 背景

devlog 0171 / handoff 0182 で Phase 2B-2 humanReviewGate state update を実装。boss が手元で smoke test した結果、UX bug + 設計上の懸念を 2 件報告:

1. **`/human-review-gates` で状態ラベルが click 可能と気づけない**: 「未着手」「レビュー待ち」 等の StatusBadge を click すると dropdown が開く設計だったが、badge が label にしか見えず affordance が hidden。boss は「どこで状態を変更するのか分からない」 と感じた
2. **`/campaigns/[slug]` 確認ゲート tab でも dropdown が出ない / 編集できないという観察**: 実際には GateStateControl は wire 済だったが、上記 1 と同じ affordance 問題で boss が click できなかった

加えて boss が **valid product concern** を提示:
- status label は status display であるべき、状態変更は explicit action にすべき
- 1 か所 (`/human-review-gates`) を「編集 surface」 に絞り、`/campaigns/[slug]` は「観察 surface」 に保つほうが情報設計として健全

Phase 2B-1 reactionNotes 動作は regression なし (handoff/0182 で host refactor 済、smoke test 通過)。

## 決定・変更

### 修正方針 (boss-confirmed product decision)

1. **`/human-review-gates` を編集 surface に固定**
2. **`/campaigns/[slug]` を read-only に戻す** + 編集動線として `/human-review-gates` への link を残す
3. **Status badge は display のみ**、explicit `[状態を変更 ▾]` button を別 element として表示
4. **終端状態 (`done` / `skipped`) は button の代わりに「終了状態」 chip** を表示

### 更新 (3 files)

| File | 変更内容 |
|---|---|
| `dashboard/src/components/gates/GateStateControl.tsx` | trigger 構造を分割: `<StatusBadge>` は display 専用、その横に explicit `<button>` (「状態を変更 ▾」 / 青系 `bg-blue-50 text-blue-800 border-blue-300`) を置く。terminal state では button の代わりに「✓ 終了状態」 non-button chip を表示。dropdown 展開 / confirm modal / disabled fallback / error banner / undo hand-off の動作は維持 |
| `dashboard/src/app/campaigns/[slug]/page.tsx` | `<UndoToastHost>` wrap を削除、`<GateStateControl>` import を削除、`enableWriteActions` import を削除、`<GatesSection>` 引数を `({gates})` に revert。上部に「ここでは状態を表示のみ。変更は /human-review-gates から行います。」 を表示。末尾の link 文言を「確認待ちゲートで状態を変更する」 に変更 (旧: 「全 gate を /human-review-gates で確認」) |
| `docs/specs/phase-2b-2-human-review-gates.md` | header + ステータス更新、§1 In scope に smoke fix 0183 revision を明記、§5-2 Edit mode の dropdown trigger 仕様を「badge ≠ trigger」 に書き換え、§10 Files affected の `/campaigns/[slug]` 項目を read-only 設計に書き換え |

### 新規 docs (3)

- `docs/devlog/0172-phase-2b-2-smoke-fix.md` (本ファイル)
- `docs/handoff/0183-phase-2b-2-smoke-fix.md`
- `docs/handoff/latest.md` (mirror)

### 触らないもの

- `schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json`
- Server action `updateGateState.ts` (動作は等価、`/human-review-gates` 経由のみ呼ばれる前提)
- `lib/gates/stateTransitions.ts` (allow-list / helpers 不変)
- `<UndoToastHost>` (動作不変)
- `<ReactionNoteEditor>` / `<AnalyticsToastHost>` 周辺 (Phase 2B-1 動作不変)
- README (2 surface 表のまま、boss が改めて見て更新したければ別 microbatch)

## 理由

### なぜ status badge を trigger にしなかったか (boss feedback)

boss prompt の指摘:
> Status labels should remain status display; manual changes should be explicit actions, not hidden badge clicks.

これは UX 設計の原則: 「label は label、action は action」。同一 element に役割を 2 つ載せると discoverability が落ちる。Phase 2B-1 reactionNotes は textarea + 編集 button を別 element に分けていた → Phase 2B-2 でも同じ分離原則を採用すべきだった。

### なぜ `/campaigns/[slug]` を read-only に戻したか

boss prompt:
> /human-review-gates is the work surface where gate state can be changed. /campaigns/[slug] remains read-only for gate status. /campaigns/[slug] may link to /human-review-gates, but should not expose state-changing dropdowns in this batch.

理由:
- **観察と編集の分離**: campaign detail は「この campaign 全体の進捗観察」 surface、`/human-review-gates` は「次に何を判断するか」 work surface。両方で edit できると boss が「どっちが正本?」 と混乱する
- **edit surface を 1 か所**: bug が出たとき / undo 機能を改善するとき / spec 変更時の影響範囲が予測しやすい
- **`<UndoToastHost>` の lifecycle が単純化**: tab 切替で host unmount する設計 (Q-2B2-7 confirmed) が `/campaigns/[slug]` だと `<TabsContent>` 切替で消えるが、`/human-review-gates` のページ全体 host だと session-wide に残る
- **将来の `/campaigns/[slug]` 整理に余地**: 「観察 surface」 として一貫させると、コメント / メモ / KPI / breadcrumb 等を追加する自由度が増す

### なぜ button を青系にしたか

`<StatusBadge>` は state 別に色 (緑 / amber / 灰 / 桃 / 黒灰) を持つ。button が **同じ色系で別 element** だと「badge の延長」 に見えてしまい affordance 問題が再発。

→ 青系 (`bg-blue-50 border-blue-300 text-blue-800`) で **state とは無関係の action color** を使う。dashboard 全体の link 色 (`text-blue-700`) と整合し、「これは action」 と即座に伝わる。

### なぜ「終了状態」 chip を出すか

terminal state (`done` / `skipped`) では allowed transitions が空。前 design では button を `disabled` にして「終端 state です」 tooltip だったが、disabled button は灰色になって「故障している」 / 「権限がない」 と誤読される懸念。

→ button ではなく「✓ 終了状態」 という非 interactive chip を表示。CheckCircle2 icon + 中間色で「これは正常完了の状態」 を示す。Studio で reopen が必要な制約は tooltip に残す。

### なぜ `/campaigns/[slug]` 上部に注記を追加したか

boss が `/campaigns/[slug]` で「ここでは編集できる?」 と再度迷うのを防ぐため、tab 開いた直後に "ここでは状態を表示のみ。変更は /human-review-gates から行います。" を 1 行で明示。`<Link>` を inline で hyperlink 化、boss が即 click で `/human-review-gates` に遷移できる。

### Build 結果

- `cd dashboard && npm run build`: 23 routes すべて green、TypeScript clean
- `npm run build` (Sanity Studio): clean
- `.next/static/` audit: env var **名** が i18n string で 4 hit (2 chunks × 2 文言)、token **値** は **0 hit**
- server-side `process.env.SANITY_WRITE_TOKEN` reads: 4 sites (前 batch 5 → smoke fix 後 4、`/campaigns/[slug]` の Boolean 読みが除去された)

## 影響

- リポジトリ:
  - dashboard runtime: 2 ファイル更新 (`GateStateControl.tsx` + `/campaigns/[slug]/page.tsx`)
  - docs: spec + devlog 0172 + handoff 0183 + latest.md mirror
  - schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - boss は `/human-review-gates` で明確な `[状態を変更 ▾]` button を click → 編集 surface が単一化
  - `/campaigns/[slug]` 確認ゲート tab は観察専用、判断が必要なら link で `/human-review-gates` に遷移
- スキーマ: 不変
- プロダクト方針:
  - 「観察 surface vs 編集 surface」 の分離が初めて明文化された (`/campaigns/[slug]` = 観察、`/human-review-gates` = 編集)
  - badge ≠ trigger 原則を Phase 2B 全体に拡張 (Phase 2B-1 reactionNotes は textarea + 編集 button 分離で既に守っていた、2B-2 がそれに揃った)

## 次の一手

**Option A (推奨) — Manual smoke re-test on localhost**

boss が:
1. `npm run dev` で再起動
2. `/human-review-gates` を開く → 各 row に `[StatusBadge] [状態を変更 ▾]` が並ぶ
3. `[状態を変更 ▾]` click で dropdown 展開、allowed transitions のみ表示
4. `not-started → in-progress` 等の非 terminal を 1-click commit、toast + Studio で確認
5. `pending-review → done` 等の terminal で confirm modal、「キャンセル」/「完了にする」 で動作
6. `done` / `skipped` の row では `[✓ 終了状態]` chip が表示 (button 出ず)
7. `/campaigns/[slug]` 確認ゲート tab で badge のみ表示、編集 control なし、「確認待ちゲートで状態を変更する」 link が見える → click で `/human-review-gates` に遷移
8. Phase 2B-1 `/analytics` reactionNotes 動作不変を確認
9. `ENABLE_WRITE_ACTIONS=false` / token 削除で disabled fallback

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 拡張)**

state は今回の smoke fix で安定したので、boss が「reviewer / notes も書きたい」 と判断すれば 2B-2.1 spec + 実装。`done` 遷移時の `completedAt` 自動 patch も再評価。

**Option C — Phase 2B-3 spec (W1 visual approve & register bridge)**

parent Q-3 確定後の次の major spec。Phase 2B-1 + 2B-2 で固まった template を W1 に転用。

発信ネタ案: 「badge ≠ trigger 原則 — UI primitive に 2 つの役割を持たせると affordance が消える」「観察 surface と編集 surface を 1 か所に絞った結果、bug 予測精度と spec 変更コストがどう変わるか」「Smoke test は機能 bug より affordance bug を見つける」
