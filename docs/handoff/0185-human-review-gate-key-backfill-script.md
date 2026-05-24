# Handoff: humanReviewGates `_key` backfill script — created + dry-run report

Date: 2026-05-21

> Note on numbering: boss prompt asked for `docs/devlog/0173-human-review-gate-key-backfill-script.md`. devlog 0173 was already taken by `0173-phase-2b-2-gate-control-visible-fix.md` from the previous batch, so this batch uses **0174** for the devlog. Handoff number **0185** is unchanged.

## 1. Task Goal

handoff/0184 (devlog 0173) で「Phase 2B-2 `/human-review-gates` で `[状態を変更 ▾]` button が見えない」 root cause として仮説提示した「seed-loaded humanReviewGates 要素に `_key` が無い」 を解決するため、安全な migration script を作成 + **dry-run のみ実行** する。

boss が dry-run report を見て execute を承認するまでは Sanity への commit を行わない。Phase 2B scope は拡張しない。dashboard runtime / schemas / publish-package / assets / patches / package.json 不変。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ dashboard runtime UI 変更なし (本 batch で touch なし、必要性も発生せず)
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし (既存 `@sanity/client` のみ使用)
- ✅ humanReviewGate **state 値** 変更なし
- ✅ reviewer / notes / completedAt / gateName / その他 field 変更なし
- ✅ **`_key` の追加のみ** (今回は実際には追加 0 件、すべて既存)
- ✅ `SANITY_WRITE_TOKEN` 値は stdout に出力しない (presence/absence のみ報告)
- ✅ Dry-run がデフォルト
- ✅ `--execute` は明示的に渡したときのみ起動、`SANITY_WRITE_TOKEN` 必須
- ✅ allowlist: `campaignPlan.building-hitori-media-os` 単独、resolved `_id` も再 check

## 3. Changed Files

### 新規 (1 script + 3 docs)

| File | 役割 |
|---|---|
| [tools/sanity/backfill-human-review-gate-keys.mjs](tools/sanity/backfill-human-review-gate-keys.mjs) | One-off controlled migration script。`campaignPlan.building-hitori-media-os.humanReviewGates[]` のうち `_key` 無しアイテムに deterministic `_key` を追加する。Default mode は dry-run、`--execute` で commit。 |
| [docs/devlog/0174-human-review-gate-key-backfill-script.md](docs/devlog/0174-human-review-gate-key-backfill-script.md) | devlog entry (boss prompt 指定の 0173 は taken のため 0174 にシフト) |
| [docs/handoff/0185-human-review-gate-key-backfill-script.md](docs/handoff/0185-human-review-gate-key-backfill-script.md) | 本ファイル |
| [docs/handoff/latest.md](docs/handoff/latest.md) | mirror of 0185 |

### 触らないもの

- `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/`
- `package.json` (root + dashboard)
- `dashboard/src/**` (runtime UI / GROQ / server actions すべて touch なし)
- 他 `tools/` script (新規 1 件のみ、`reflect-publication-state.mjs` 等は reference として参照のみ)

合計 **1 script + 3 docs = 4 ファイル**。Sanity 書き込みは 0 件 (dry-run のみ実行)。

## 4. Summary of Changes

### 4-1. Script behavior

`tools/sanity/backfill-human-review-gate-keys.mjs` の主要構造:

**Mode (CLI args)**:
- default: `dry-run` (no writes)
- `--execute`: commit the patch (also requires `SANITY_WRITE_TOKEN` env var)

**Env loading**:
- `process.loadEnvFile()` で `.env.local` (repo root + dashboard) を自動 load
- `reflect-publication-state.mjs` と同パターン

**Safety layers (7)**:
1. dry-run default
2. Hardcoded `_id` allowlist: `campaignPlan.building-hitori-media-os` のみ
3. Slug fallback (`building-hitori-media-os`) でも resolved `_id` を **再 check** — 別 doc に解決されたら abort (exit 4)
4. `_type === 'campaignPlan'` を verify (exit 5)
5. Pre-commit field-preservation check: 元 array の全 field が patched array に存在 + `_key` 以外の値が完全一致 (exit 6)
6. `ifRevisionID: doc._rev` で楽観 lock (concurrent Studio edit を reject)
7. Post-commit verification refetch: gate 数 / `_key` 全件存在 / 非 `_key` field 値の不変 (exit 8-11)

**Deterministic `_key` generation**:
```ts
makeBaseSlug(name, index):
  if name empty → `gate-${index}`
  else:
    1. normalize('NFKD').toLowerCase()
    2. replace [^a-z0-9-]+ with '-'
    3. collapse repeated hyphens
    4. trim leading/trailing hyphens
    5. truncate to 48 chars
    6. prefix with 'gate-'
  fallback: `gate-${index}` if ASCII portion is empty
```

Collision handling: 既存 `_key` 全部を `Set` に入れて、新規 candidate が collision したら `-2`, `-3` ... を suffix。

**Field allowlist**:
- `_key` の追加のみ
- 既存 field は全 spread (`{...g, _key}`)
- pre-commit + post-commit verification で field drift を detect

**Logging policy**:
- token: `present (server-only)` / `absent` のみ報告、値は出さない
- `_rev`: 先頭 6 文字 + `…` のみ表示
- gate name: 64 文字 truncate (notes / body は出力しない)
- state: そのまま (enum 値なので非機密)

### 4-2. Dry-run report (actual output)

実行コマンド:
```
node tools/sanity/backfill-human-review-gate-keys.mjs
```

```
=== humanReviewGates _key backfill ===
Project root:    /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
Sanity project:  5f79ed6q
Sanity dataset:  production
API version:     2025-08-15
Target _id:      campaignPlan.building-hitori-media-os
Mode:            dry-run
Read token:      present (server-only)
Write token:     present (server-only)

Doc _id:                campaignPlan.building-hitori-media-os
Doc slug:               building-hitori-media-os
Doc _rev:               aru76y…
humanReviewGates total: 9
  with existing _key:   9
  missing _key:         0

Per-gate plan:
  [00] keep  _key="rII736lFD27FsrAxuFlwfc"  state="done"             name="selectedPlatforms 確認"
  [01] keep  _key="rII736lFD27FsrAxuFlwhI"  state="done"             name="contentIdea claims / objections 最終確認"
  [02] keep  _key="rII736lFD27FsrAxuFlwiy"  state="done"             name="note-hero-v1 Visual Register approve"
  [03] keep  _key="rII736lFD27FsrAxuFlwke"  state="done"             name="note-hero-v1 / substack-header-v1 Sanity 手動反映"
  [04] keep  _key="rII736lFD27FsrAxuFlwmK"  state="pending-review"   name="x-hook-main-v1 Visual Register approve"
  [05] keep  _key="rII736lFD27FsrAxuFlwo0"  state="in-progress"      name="x-hook-main-v1 Sanity 手動反映"
  [06] keep  _key="rII736lFD27FsrAxuFlwpg"  state="not-started"      name="threads / note inline 3 visualの生成判断"
  [07] keep  _key="rII736lFD27FsrAxuFlwrM"  state="in-progress"      name="release-review final-human-checklist の最終確認"
  [08] keep  _key="rII736lFD27FsrAxuFlwt2"  state="not-started"      name="各 platform への manual publish"

[backfill] no missing _key — nothing to do. Exiting.
```

### 4-3. Important finding: **all 9 gates already have `_key`**

dry-run output が **`missing _key: 0`** を返した。9 件すべてに既に `_key` が存在する。Sanity が dataset import 時 (`npx sanity dataset import` 等) または Studio が doc を最初に開いた際に auto-assign したものと推測。`_key` prefix が全 9 件で共通 (`rII736lFD27FsrAxuFlw` + 2-char variation) → 同一 import session で連続採番されたパターンと一致。

### 4-4. Implication: backfill is NOT needed for execute

dry-run が 0 missing → 本 batch では `--execute` の出番なし。Migration script は完成して available だが、執行対象が無い。

handoff/0184 の root cause 仮説 (「`_key` 無しのため `<GateStateControl>` がレンダリングされない」) は不正確だった可能性が高い。実 root cause は別 (HMR cache / build artifact staleness / GROQ projection の `_rev` 追加前の version で boss が試した、等)。

### 4-5. Build validation

```
$ cd dashboard && npm run build
✓ Compiled successfully in 1494ms
  Finished TypeScript clean
✓ Generating static pages using 13 workers (3/3) in 66ms
Routes: 18 page + 5 API = 23 (unchanged)

$ npm run build (root, Studio)
✔ Build Sanity Studio (10911ms)
```

両 build は green。Migration script は dashboard / Studio build に何も影響しない (`tools/` 配下、build に load されない)。

## 5. Confirmation no runtime behavior changed

- **23 routes intact** (`/`, `/activity-log`, `/analytics`, `/campaigns`, `/campaigns/[slug]`, `/configurator`, `/diagnostics`, `/human-review-gates`, `/knowledge`, `/outputs`, `/publish`, `/publish-package/[slug]`, `/publish-packages`, `/settings`, `/visual-assets`, `/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates`, `/_not-found` = 18 pages + 5 API routes)
- **Sanity への書き込み**: 0 件 (dry-run only, `--execute` 未実行)
- **dashboard runtime code**: touch なし
- **Phase 2B-1 reactionNotes**: 動作不変
- **Phase 2B-2 humanReviewGate editing**: 動作不変 (どのみち全 gate に `_key` が既に存在するので、handoff/0182 で実装した server action + UI は全 9 件で機能するはず)
- **GROQ projections**: 不変 (`_rev` + `_key` は handoff/0182 で既に追加済)
- **Topbar pill**: 不変
- **Sanity schema / publish-package / assets/visuals / patches / package.json**: 不変

## 6. Token leak audit

Script は token を:
- `createClient({token: writeToken or readToken, ...})` の client constructor のみに渡す
- stdout には `present (server-only)` / `absent` のみ出力 (値は絶対に出さない)
- error log にも token 値は流れない

dashboard 側は本 batch で **touch なし**、Phase 2B-1 + 2B-2 で確立した token safety は不変。

## 7. Key Decisions

- **dry-run-first を script の default に**: 仮説検証用途でも安全に走らせられる
- **`_id` allowlist + slug fallback の再 check**: 万一 slug が別 doc に解決しても、resolved `_id` が allowlist 外なら abort
- **Field-preservation pre/post check を必須に**: `_key` 以外の値が偶発的に変化しないことを 2 段階で verify
- **Deterministic key (slug-based) を採用**: boss prompt の「stable fields if available」 に合致。`reflect-publication-state.mjs` の random hex とは異なる方針 — 後から `_key` から gate を逆引きしやすいため
- **token を log しない契約を厳守**: env var **値** は client constructor にしか渡さず、`present (server-only)` の string で presence のみ報告
- **`@sanity/client` を新規追加しない**: 既存 root `node_modules` から import (`tools/sanity/reflect-*` と同じ)
- **devlog/handoff numbering shift を明示**: boss prompt は 0173 を指定したが taken だったので 0174 に shift、handoff は 0185 のまま
- **「nothing to do」 を肯定的に扱う**: 仮説が外れたことを silent に潜らせず、devlog / handoff で明示 — 将来 boss が「`_key` 無し問題」 と聞いたときの参照点になる

## 8. Human Review Questions

### 仮説 vs データ事実の照合

1. boss workflow で「Studio で 1 件再保存 → 編集可能に切り替わった」 という観察は、`_key` injection ではなく **dev server fetch invalidation** (cache 刷新) が原因だった可能性が高い。boss が記憶する詳細状況 (タイミング / どのページから dev server を kill / restart したか) と整合するか?
2. もし「再保存前は本当に編集不可だった」 ことが boss の直接観察として確実なら、別の root cause を継続調査する必要がある (`<GateStateControl>` の prop drilling / GROQ `_rev` 反映タイミング / dev cache の挙動)
3. 9 件の `_key` がすべて `rII736lFD27FsrAxuFlw` prefix で連続採番されている事実から、これらは同一 import session で生成されたものと推測 — boss が記憶する seed import の方法 (Sanity CLI `dataset import` / 手作業 / 別 script) と一致するか?

### Script の品質 review

4. `makeBaseSlug` の `gate-` prefix + ASCII slug 化 + 48 文字 truncate の組合せで OK?
5. Collision handling (`-2`, `-3` suffix) は dry-run で発火していない (9 件すべて keep) ため未テスト — boss が `_key` 無し doc を別途追加して試したくなる場面に備える
6. `--execute` の付加情報 (例: `--verbose` で field diff を full dump) を boss が将来欲しがる可能性

### Operational

7. Migration script を **保持** して future use する path、それとも「`_key` 無しは存在しなかった」 ので **削除** する path、どちら?
   - 推奨: 保持 (future seed 追加時の template、reviewer/notes/completedAt migration の reference)
   - 削除案も合理的 (使われない死 script のリスク)
8. dashboard で依然 `[状態を変更 ▾]` button が見えない場合、`.next/` cache 削除 + dev server full restart を試した結果を共有する path に進むか?

## 9. Risks or Uncertainties

- **`_key` 仮説外れの再評価**: handoff/0184 で導入した「missing-data 用 amber pill (要 Studio 再保存)」 affordance は、今回 dry-run で「実データに `_key` 欠落なし」 が判明したため、現状の prod data では発火しない。残しておくのは harmless だが、boss が「使われない affordance を消したい」 と感じたら microbatch で削除可能
- **execute 未実行のため post-commit verification 未テスト**: post-commit verification logic は dry-run path では走らない。`--execute` が必要になる future case で初めて検証される
- **HMR / build cache hypothesis 未確認**: 本 batch では実証していない。boss が `.next/` 削除 + restart で再現性検証する必要
- **deterministic key の安定性**: 同じ `gateName` を持つ doc が複数になった場合、同じ `gate-...` slug が生成されるが、各 doc は別 array なので collision にはならない。ただし同 doc 内に同名 gate が複数あると collision 検出 + `-2` suffix が動く — テストされていない edge case
- **Sanity API version `2025-08-15` の `client.transaction().patch(p).commit({returnDocuments: true})` return shape**: defensive narrow (Array / `.results` 両対応) を入れたが、別 minor version で shape が変わるリスク

## 10. Remaining Cleanup Candidates

### 短期 (microbatch)

- boss が `npm run dev` + `.next/` 削除 + restart で `/human-review-gates` を再確認 → 全 9 gate に `[状態を変更 ▾]` button が見えるか確認
- 見えれば: handoff/0184 の「missing-data affordance」 が dead code 化、削除 or 保持の判断
- 見えなければ: 別 root cause を継続調査

### 中期

- **Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)**: `_key` が全 9 件揃っていることが確認されたので、追加の field allow-list + 編集 UI を入れる準備が整った
- migration script template を generalize (例: `tools/sanity/backfill-array-keys.mjs` として、任意 doc / 任意 array field に対応する general 版へ refactor) — boss 必要時

### 中期 (Phase 2B-3)

- W1 visual approve & register bridge spec (parent Q-3 確定後)

### 長期

- handoff/0184 で導入した dev-only diagnostic log (`[hrg:diag]`) の dev-only gating
- AppShell-level `<UndoToastHost>` lift
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)

## 11. Next Recommended Step

**Boss decision point: skip `--execute` or proceed with smoke re-test**

dry-run report が「missing _key: 0」 を示したので、`--execute` は **不要**。次に取れる action:

**Option A (推奨) — `/human-review-gates` smoke re-test**

```bash
# Clean dev environment
cd dashboard
rm -rf .next
npm run dev
```

その後 boss が `http://localhost:3000/human-review-gates` を開き、全 9 gate に対して:
- 非 terminal (`pending-review` / `in-progress` / `not-started`) → 青 `[状態を変更 ▾]` button が出る
- terminal (`done`) → slate `[✓ 終了状態]` chip が出る

もし全ゲートで期待通りなら **handoff/0184 の amber affordance** は dead code、microbatch で削除可能。

**Option B — boss が `--execute` を承認する場合** (推奨せず、対象 0 なので意味なし)

```bash
ENABLE_WRITE_ACTIONS=true \
  node tools/sanity/backfill-human-review-gate-keys.mjs --execute
```

すぐに `[backfill] no missing _key — nothing to do. Exiting.` で終了するはず。

**Option C — Phase 2B-2.1 spec batch (reviewer / notes / completedAt 編集)**

`_key` 全件揃っていることが確認されたので、reviewer / notes / completedAt 編集を追加する次の microbatch spec に進める。

---

### Exact prompt for next Claude Code session (Option A 後の cleanup batch)

```
Phase 2B-2 amber "編集不可 (要 Studio 再保存)" affordance を削除する docs-only + minimal runtime microbatch を実行してください。

入力:
- docs/handoff/0184-phase-2b-2-gate-control-visible-fix.md (amber affordance の追加場所)
- docs/handoff/0185-human-review-gate-key-backfill-script.md (本 batch、実データに _key 欠落がないことが確定)
- boss smoke test 結果: 全 9 gate で [状態を変更 ▾] button が見える

タスク:
1. dashboard/src/components/gates/GateStateControl.tsx から「missing _key/_rev」 render branch を削除 (writeReady false + terminal + editable の 3 branch に圧縮)
2. dashboard/src/app/human-review-gates/page.tsx から `[hrg:diag]` server log を削除
3. docs/specs/phase-2b-2-human-review-gates.md の §5-2 から missing-data affordance の言及を簡素化

constraints:
- Sanity schema 不変
- 23 routes 維持
- production / preview ENABLE_WRITE_ACTIONS / SANITY_WRITE_TOKEN を引き続き Vercel に設定しない
```
