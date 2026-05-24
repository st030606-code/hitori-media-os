# humanReviewGates `_key` backfill script — created + dry-run shows nothing to do

日付: 2026-05-21

> Note: boss prompt asked for `docs/devlog/0173-human-review-gate-key-backfill-script.md`. Number 0173 was already taken by the previous gate-control visibility fix (`0173-phase-2b-2-gate-control-visible-fix.md`), so this entry uses the next free number, **0174**. Handoff number `0185` is unchanged.

## 背景

handoff/0184 (devlog 0173) で「`/human-review-gates` の `[状態を変更 ▾]` button が見えない問題」の root cause として「seed-loaded humanReviewGates 要素に `_key` が無い」 を仮説提示。boss は Sanity Studio で 1 件のゲートを再保存したところ、そのゲートが dashboard から編集可能になった。boss decision: 残り 8 件についても同様の backfill が必要 → 安全な migration script を作って一括対応する。

本 batch は **migration script を作成 + dry-run のみ実行** する。execute は boss が dry-run report を見て承認したのち、別 commit で実行する。

## 決定・変更

### 新規ファイル (1)

- [tools/sanity/backfill-human-review-gate-keys.mjs](tools/sanity/backfill-human-review-gate-keys.mjs)
  - 7 layer safety (dry-run default / `_id` allowlist / 単一 doc 限定 / field 保存検証 / `ifRevisionID` 楽観 lock / 単一 transaction / token を log しない)
  - 決定論的 `_key` 生成: `gateName` を基に slug 化 (`gate-` prefix + `[a-z0-9-]` のみ残す + 連続 hyphen 圧縮 + 48 文字 truncate)
  - collision 時は `-2`, `-3` ... の suffix
  - ASCII 部が空なら `gate-<index>` fallback
  - `_key` 以外の field は touch なし、変更検出で abort

### Dry-run 結果 (実際の Sanity データに対して実行)

```
=== humanReviewGates _key backfill ===
Sanity project:  5f79ed6q
Sanity dataset:  production
Target _id:      campaignPlan.building-hitori-media-os
Mode:            dry-run

Doc _id:                campaignPlan.building-hitori-media-os
Doc slug:               building-hitori-media-os
Doc _rev:               aru76y…
humanReviewGates total: 9
  with existing _key:   9
  missing _key:         0

Per-gate plan:
  [00] keep  _key="rII736lFD27FsrAxuFlwfc"  state="done"  name="selectedPlatforms 確認"
  [01] keep  _key="rII736lFD27FsrAxuFlwhI"  state="done"  name="contentIdea claims / objections 最終確認"
  [02] keep  _key="rII736lFD27FsrAxuFlwiy"  state="done"  name="note-hero-v1 Visual Register approve"
  [03] keep  _key="rII736lFD27FsrAxuFlwke"  state="done"  name="note-hero-v1 / substack-header-v1 Sanity 手動反映"
  [04] keep  _key="rII736lFD27FsrAxuFlwmK"  state="pending-review"  name="x-hook-main-v1 Visual Register approve"
  [05] keep  _key="rII736lFD27FsrAxuFlwo0"  state="in-progress"  name="x-hook-main-v1 Sanity 手動反映"
  [06] keep  _key="rII736lFD27FsrAxuFlwpg"  state="not-started"  name="threads / note inline 3 visualの生成判断"
  [07] keep  _key="rII736lFD27FsrAxuFlwrM"  state="in-progress"  name="release-review final-human-checklist の最終確認"
  [08] keep  _key="rII736lFD27FsrAxuFlwt2"  state="not-started"  name="各 platform への manual publish"

[backfill] no missing _key — nothing to do. Exiting.
```

### 重要な発見: 全 9 ゲートが既に `_key` を持っていた

dry-run の結果、**すべての 9 humanReviewGates アイテムに `_key` が既に存在する**。Sanity 側に渡された時点で auto-assign されている (Sanity の `dataset import` ツールや、Studio が最初に doc を開いた際の auto-key 付与など)。`seed/campaign-plan-building-hitori-media-os.json:229-239` の JSON には `_key` 無しだが、Sanity に投入された時点では `_key` が injection された模様。

key の prefix `rII736lFD27FsrAxuFlw` が全 9 件で共通、末尾 2 文字だけが変わるパターン → 同一 import session で連続採番されたものと推定。

### 結論: execute は不要

dry-run が `missing _key: 0` を返したので、**この batch では `--execute` 不要**。migration script は完成したが、実行する対象が無い。

### 過去観察との突合

handoff/0184 の「`/human-review-gates` で button が見えない」 issue の root cause 仮説 (「seed import 時に `_key` 未付与だった」) は **不正確** だった可能性が高い。boss の「Studio で 1 件再保存したら編集可能になった」 という観察も、`_key` injection ではなく **HMR / build cache の刷新** で説明できる:

1. handoff/0184 が land した時点で、`/human-review-gates/page.tsx` の前 batch design は `canControl = !!_key && !!_rev && isGateState(state)` の gate を持っていた
2. boss が dev server を起動した直後、もし build artifact が古い (一例: GROQ projection に `_rev` 追加前の version でキャッシュされていた) と、`canControl = false` で fallback `<StatusBadge>` が描画される
3. Studio で再保存 → doc の `_rev` が変わる → Next.js の `revalidate: 0` + `force-dynamic` で次回 fetch が fresh response を返す → 新 `_rev` 取得 → `canControl = true` に切り替わる

つまり「Studio 再保存」 が hit したのは `_key` injection ではなく **dev server fetch invalidation** だった可能性。handoff/0184 で実装した「missing-data affordance」 自体は無害なので残しておけば良い (将来 reviewer / notes 編集等で `_key` 無し doc に遭遇した際の防御として機能する)。

## 理由

### なぜ migration script を作ったか

`_key` 無し問題が現実だった場合、boss が 9 件すべてを Studio で手動再保存するのは tedious。再現性のある仕組みとして migration script を残しておくのは、:
- 将来また seed が増えた場合の保険
- Phase 2B-2.1 で reviewer / notes / completedAt 編集を追加する際の前提整理
- 「`_key` がなければ controlled write が成立しない」 という不変条件を仕様 + 実装で再確認

になる。実 execute が不要だったとしても、script の存在自体が boss workflow の安心材料。

### なぜ slug-based deterministic key を採用したか

選択肢:
1. 完全 random hex (Sanity のデフォルトに準拠、`reflect-publication-state.mjs` の `newKey()` と同様)
2. `gateName` から slug 化 (本 script 採用)
3. UUID

`gateName` slug 化を選んだ理由:
- boss prompt 明示: 「prefer stable fields if available: slug / gateId / title / name」
- 後から「どの gate にどの `_key` がついたか」 を grep で辿りやすい (random hex だと doc 全体を読まないと特定できない)
- Japanese 文字は ASCII 部分のみ抽出される設計だが、ゲート名の latin 部分が 9 件すべて unique なので collision なし

### なぜ execute mode を防御的に書いたか

`reflect-publication-state.mjs` と同じ 7 layer safety:
1. dry-run default
2. `_id` allowlist (`campaignPlan.building-hitori-media-os` のみ)
3. slug fallback でも resolved `_id` を再 check
4. field 保存検証 (pre-commit + post-commit)
5. `ifRevisionID` 楽観 lock
6. 単一 transaction
7. token を絶対 log しない (env 値は client に渡すだけ、stdout には `present (server-only)` のみ)

将来 reviewer / notes / completedAt 編集等で似た migration が必要になった際の **template** として使い回せる構造。

### なぜ Sanity の auto-`_key` 動作を seed 段階で意識しなかったか

`seed/campaign-plan-building-hitori-media-os.json` は単に JSON ファイル — load 方法 (Sanity CLI `dataset import` vs `client.create()` vs Studio paste vs `npx sanity exec` script) によって `_key` 付与挙動が異なる。今回判明したのは、boss が使った load 方法では auto-key 付与が起きていたという事実のみ。

将来 seed を新規追加するときは:
- `npx sanity dataset import` を使う (auto-key 付与あり)
- もしくは seed JSON 内に `_key` を手書きする (= deterministic にしたい場合)

を boss workflow として揃えるのが望ましい。本 batch ではそこまで踏み込まない。

## 影響

- リポジトリ:
  - `tools/sanity/backfill-human-review-gate-keys.mjs` (新規 1 ファイル)
  - `docs/devlog/0174-...` + `docs/handoff/0185-...` + `docs/handoff/latest.md`
  - dashboard / schemas / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - boss が `/human-review-gates` で全 9 件のゲートで `[状態を変更 ▾]` button を見られるはず (現実データに `_key` が揃っているため)
  - もし依然 amber「編集不可 (要 Studio 再保存)」 が出るなら、別の根本原因 (HMR cache / 古い build artifact / project_id mismatch / etc.) が残っている
  - Sanity 書き込みは 0 件 (本 batch 内で commit していない)
- スキーマ: 不変
- プロダクト方針:
  - 「Sanity データ migration」 の controlled write pattern を 1 件再利用可能な形で残した
  - 「dry-run-first」 の運用が data 仮説検証に有効であることを実証 (実際に「`_key` 無し」 仮説は誤りだったと判明)

## 次の一手

**Option A (推奨) — boss が `/human-review-gates` で改めて smoke test**

`npm run dev` で再起動 + `/human-review-gates` を開き、全 9 ゲートに対して:
- 非 terminal state (`pending-review` / `in-progress` / `not-started`) → 青 `[状態を変更 ▾]` button が出ること
- terminal state (`done`) → slate `[✓ 終了状態]` chip が出ること

もし依然 amber「編集不可 (要 Studio 再保存)」 が出るゲートがあれば、別の調査トピック (`<GateStateControl>` の prop drilling / GROQ projection / dev cache 等) が必要。

**Option B — script を `--execute` で走らせる必要なし**

dry-run 結果が「nothing to do」 なので、`--execute` の出番なし。script は将来の保険として保持。

**Option C — 別の potential issue (HMR cache / build cache) を boss と確認**

handoff/0184 の amber pill 観察が HMR cache 起因だった場合、`.next` を削除して clean rebuild + dev server restart で再現性確認。

**Option D — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**

`_key` が全 9 件揃っていることが分かったので、reviewer / notes / completedAt 編集も同 server action pattern で実装可能。同じ field-allow-list 拡張 + UI affordance 設計で対応。

発信ネタ案:
- 「dry-run-first migration は、想定の root cause が間違っていたことを発見するためにも使える」
- 「Sanity の `_key` 付与は load 方法依存 (`dataset import` / `client.create` / Studio で挙動が違う) — seed の保守で陥る罠」
- 「`/analytics` で reactionNotes editor を一気に作るのではなく、smoke fix を 2 回挟んで affordance を磨いた pattern を 2B-2 でも踏襲したのが正解だった」
