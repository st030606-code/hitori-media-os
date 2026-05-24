# Handoff: Phase 2C-0 + Phase 2C-0.1 boss smoke PASS — Raw Idea incubation flow が動く

Date: 2026-05-21

## 1. Task Goal

handoff/0198 (Phase 2C-0 Raw Idea + Idea Development Package implementation) + handoff/0199 (Phase 2C-0.1 AI-developed result import implementation) で land した dashboard `/ideas` surface を、 boss が本物の new raw idea で smoke test → **全 step PASS**。

本 batch は docs-only で:
1. Phase 2C-0 + 2C-0.1 を「implemented + smoke PASS」 status に昇格 (spec header + parent §0.5)
2. boss smoke evidence (試運転 raw idea / 生成ファイル群 / 観察結果) を spec / docs に記録
3. 次に着手すべき path (Phase 2C-1 Structured Content Idea promote helper) を明示

Phase 2C 系列で **最初の動作確認済 milestone** に到達: dashboard 内で「rough idea → AI 企画化 prompt → AI 手動実行 → 結果 paste → 保存」 の Raw Idea incubation segment が end-to-end で動作。

## 2. Constraints Followed

- ✅ Docs only、 runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ `dashboard/src/` touch なし
- ✅ `tools/visual-register/`, `tools/sanity/reflect-*.mjs` touch なし、 import なし
- ✅ `assets/visuals/`, `assets/inbox/`, `patches/`, `publish-package/` 不変
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ deploy なし
- ✅ Production write 永久 disabled
- ✅ 24 routes 不変 (本 batch では build 不要、 handoff/0199 build artifact が継承)
- ✅ 外部 LLM API 通信なし (smoke 中も dashboard から 0 件)
- ✅ Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 / Phase 2C-0 / 2C-0.1 動作不変

## 3. Changed Files

### 更新 (2 spec)

- [docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md](docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md)
  - **Header**: ステータスを「spec-finalized, decisions CONFIRMED, implementation pending」 → 「**Phase 2C-0 + Phase 2C-0.1 ✅ implemented + boss smoke PASS (handoff/0200)、 残り Phase 2C-1 / 2C-2 / 2C-3 / 2C-4 / 2C-5 は pending**」
  - 新セクション「**Implementation progress (2026-05-21)**」 を header 直下に追加 — sub-batch 7 件 (2C-0 〜 2C-5) を table で tracking、 status (PASS / pending) + handoff link
  - 末尾に「Raw Idea incubation flow が dashboard 内で result.md / result.json persistence まで動作する状態」 の宣言文
- [docs/specs/phase-2b-write-actions.md](docs/specs/phase-2b-write-actions.md)
  - §0.5 Phase 2C entry の title を「spec-finalized, Q-2C-1〜Q-2C-13 CONFIRMED, staged implementation pending」 → 「**spec-finalized, Q-2C-1〜Q-2C-13 CONFIRMED; Phase 2C-0 + 2C-0.1 ✅ smoke PASS, 2C-1〜2C-5 pending**」
  - handoff list に handoff/0198 + 0199 + 0200 (3 件) を追加
  - Sub-batch progress を nested bullet list で詳細化 (Phase 2C-0 / 2C-0.1 PASS、 2C-1〜2C-5 pending)
  - **boss smoke evidence** 段落を新規追加 (試運転 raw idea 本文 + slug `obsidian-ai-sanity-3` + timestamp `20260521-124748` + ファイル群 + 4 NoX 確認)
  - Next を「Phase 2C-0 implementation batch」 → 「**Phase 2C-1 implementation batch** — Structured Content Idea promote helper」 に変更

### 新規 docs (3)

- [docs/devlog/0189-phase-2c-0-smoke-pass.md](docs/devlog/0189-phase-2c-0-smoke-pass.md)
- [docs/handoff/0200-phase-2c-0-smoke-pass.md](docs/handoff/0200-phase-2c-0-smoke-pass.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror of 0200)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` (root + dashboard) いずれも touch なし。

## 4. Summary of Changes

### 4-1. Boss smoke evidence (2026-05-21、 本物 raw idea で実 verify)

#### 試運転 raw idea (CONFIRMED Q-2C-10 で「boss が本物を選ぶ」 と決定済)

> **「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか。」**

これは Phase 2C spec §2 で確立した **4 OS positioning** (Obsidian = 思考 OS / Sanity = operating DB / Claude+Codex+ChatGPT = 生成 agent / Dashboard = orchestrator) の核となる主張で、 boss が今後 note / Substack / Threads で発信する material の base にもなる本物の idea。

#### 生成された idea-job ファイル群 (boss confirmed 存在)

```
idea-jobs/obsidian-ai-sanity-3/
├── _raw.json                                    # Phase 2C-0: rough idea 保存
└── 20260521-124748/                             # timestamped sub-directory
    ├── prompt.md                                # Phase 2C-0: AI 企画化 prompt 本文
    ├── job.json                                 # Phase 2C-0: metadata
    ├── result.md                                # Phase 2C-0.1: AI 結果 markdown
    └── result.json                              # Phase 2C-0.1: 構造化 JSON
```

- `obsidian-ai-sanity-3` slug は `slugifyTitle` (Phase 2C-0 paths helper) が rawTitle から自動生成、 `^[a-z0-9][a-z0-9-]{0,79}$` 規則に整合
- timestamp `20260521-124748` = UTC `2026-05-21 12:47:48`、 `nowTimestamp()` の `YYYYMMDD-HHMMSS` 規則どおり
- 5 ファイルすべて `idea-jobs/` 配下に閉じ、 traversal / 拡張子 / size cap 違反なし

#### Smoke checklist (handoff/0198 §11 + handoff/0199 §9 の 20+ step、 全 PASS)

| # | 項目 | 結果 |
|---|---|---|
| 1 | `/ideas` page が動作 | ✅ PASS |
| 2 | Raw Idea form 入力 → 「アイデアパッケージを作成」 で 3 ファイル書き出し | ✅ PASS |
| 3 | `idea-jobs/obsidian-ai-sanity-3/_raw.json` が存在 | ✅ PASS |
| 4 | `idea-jobs/obsidian-ai-sanity-3/20260521-124748/prompt.md` が存在 | ✅ PASS |
| 5 | `idea-jobs/obsidian-ai-sanity-3/20260521-124748/job.json` が存在 | ✅ PASS |
| 6 | 「プロンプトをコピー」 → AI agent (ChatGPT / Claude / Codex) に paste → 結果取得 | ✅ PASS |
| 7 | AI 結果を dashboard `<ResultImportSection>` textarea に paste | ✅ PASS |
| 8 | 「結果を保存」 → `result.md` + `result.json` 書き込み | ✅ PASS |
| 9 | `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md` が存在 | ✅ PASS |
| 10 | `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.json` が存在 | ✅ PASS |
| 11 | Sanity doc が新規作成されていない | ✅ PASS (Q-2C-8 / Q-2C-2 原則維持) |
| 12 | 外部 LLM API 通信 0 件 | ✅ PASS (Q-2C-6 / Q-2C-12 原則維持) |
| 13 | dashboard が shell command 実行 0 件 | ✅ PASS (Q-2C-6 原則維持) |
| 14 | 書き込み先が `idea-jobs/` 内に閉じている | ✅ PASS (Q-2C-7 path allowlist) |
| 15 | Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変 | ✅ PASS |
| 16 | observed issues | なし |

#### Smoke 中に発生した workflow friction (非 bug)

> Boss が `cat idea-jobs/<ideaSlug>/<timestamp>/result.md` の **placeholder 表記のまま** を fish shell に貼ったところ、 fish が `<ideaSlug>` を入力 redirection (`< filename`) と解釈してエラー。 正しい path は `cat idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md`。 boss が即座に substitute → recover、 fix 不要。

これは:
- **dashboard bug ではない**: dashboard UI (Phase 2C-0 SuccessPanel / Phase 2C-0.1 SavedPanel) は **実 path** を表示している、 placeholder 山括弧は使わない
- **docs bug でもない**: handoff/0198 § 11 smoke checklist の placeholder 表記 (`<ideaSlug>` / `<timestamp>`) は読みやすさのために残してある
- **shell quirk**: fish の `<` redirection 構文と山括弧 placeholder の交差で起きた

design discipline として今後も:
- dashboard UI は実 path を表示 (boss が直接 copy & paste できる pattern を維持)
- docs の placeholder は読みやすさのために維持
- 「terminal に貼るときは substitute」 の small note を docs に追加するかは boss judgement (本 batch では追加せず)

### 4-2. Phase 2C-0 + 2C-0.1 final status

| Aspect | Status |
|---|---|
| Spec | [docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md](docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md) — header status「Phase 2C-0 + 2C-0.1 ✅ smoke PASS」 |
| Phase 2C-0 implementation | handoff/0198 (2026-05-21) |
| Phase 2C-0.1 implementation | handoff/0199 (2026-05-21) |
| **Boss smoke PASS** | **2026-05-21 (handoff/0200) ✅** |
| Edit surface | `/ideas` (Phase 2C-0 form + Phase 2C-0.1 ResultImportSection、 同一 page) |
| Write target | `idea-jobs/<slug>/_raw.json` + `idea-jobs/<slug>/<ts>/{prompt.md, job.json, result.md, result.json}` |
| Filesystem boundary | `idea-jobs/` のみ、 `.md` / `.json` only、 200 KB cap、 atomic write |
| Env gate | `enableWriteActions` + `enableLocalFsRoutes` の 2 段 (writeReady の AND-gate) |
| Sanity writes | **0** (Phase 2C-0 + 2C-0.1 は filesystem-only) |
| 外部 LLM API | **0** 通信 (Q-2C-6 / Q-2C-12 維持) |
| Shell execution | **0** (CLI command は表示のみ、 boss が手動 run) |
| Production behavior | permanently disabled (env flags 両方 off で全 disabled) |
| Token requirement | `SANITY_WRITE_TOKEN` 不要 (Sanity write しないため) |

### 4-3. Phase 2C 全体 sub-batch progress

| Sub-batch | Status | Handoff |
|---|---|---|
| **Phase 2C-0** (Raw Idea + Idea Dev Package) | ✅ implemented + smoke PASS | handoff/0198 + 0200 |
| **Phase 2C-0.1** (AI-developed result import) | ✅ implemented + smoke PASS | handoff/0199 + 0200 |
| **Phase 2C-1** (Structured Content Idea promote helper) | pending — next | — |
| **Phase 2C-2** (Generation Prompt Package、 `/configurator` 拡張) | pending | — |
| **Phase 2C-3** (Generated Output Import、 `/outputs` 拡張) | pending | — |
| **Phase 2C-4** (= Phase 2B-4 implementation 委譲) | pending (prerequisite: Phase 2B-4 Q 確定) | — |
| **Phase 2C-5** (End-to-End smoke、 docs-only) | pending | — |

### 4-4. Dashboard write surface 現状

Phase 2C-0 + 2C-0.1 の land により、 dashboard が安定運用できる write surface は **6 件** に到達:

| Surface | Pattern | Status |
|---|---|---|
| Phase 2B-1 reactionNotes | Sanity field op (free text + 10秒 undo) | ✅ smoke PASS (handoff/0186) |
| Phase 2B-2 humanReviewGate state | Sanity field op (controlled vocab + transition allow-list + undo + dropdown UI) | ✅ smoke PASS (handoff/0186) |
| Phase 2B-3 visual approve & register | Filesystem via Visual Register CLI HTTP bridge (no undo + preview/confirm) | ✅ smoke PASS (handoff/0190) |
| Phase 2B-3.1 visualAssetPlan Sanity reflect | Sanity field op (4-field strict allow-list + post-write verification、 patch JSON 経由) | ✅ smoke PASS (handoff/0194) |
| **Phase 2C-0 raw idea + idea dev package** | **Filesystem-only direct write (path allowlist + atomic write + no shell exec)** | **✅ smoke PASS (handoff/0200)** |
| **Phase 2C-0.1 result import** | **Filesystem-only direct write (markdown + optional JSON parse + 13 field detection)** | **✅ smoke PASS (handoff/0200)** |

6 通りの異なる pattern が共存、 Phase 2C 系列が「filesystem-only direct write」 という新 pattern (Phase 2B-3 の HTTP bridge とは別) を追加。

### 4-5. Build NOT run

Docs-only batch のため build 不要 (handoff/0199 build artifact 継承、 24 routes green を保持)。

### 4-6. Runtime behavior unchanged

確認項目:
- 24 routes (前 batch から変化なし)
- データ取得ロジック / feature flags / Topbar pill — touch なし
- Phase 2B-1 〜 2B-3.1 + Phase 2C-0 + 2C-0.1 — 動作不変
- `tools/visual-register/server.mjs` — touch なし
- `tools/sanity/reflect-*.mjs` — touch なし
- Sanity への write surface は Phase 2B 系の 3 件 (2B-1 / 2B-2 / 2B-3.1) のみ、 Phase 2C 系は filesystem-only
- Sanity schema / publish-package / assets / patches / package.json 不変
- 外部 LLM API への通信 0 件 (boss smoke 中も dashboard から非発生)

## 5. Remaining deferred work

Phase 2C-0 + 2C-0.1 smoke PASS milestone 到達後の **未実装** 作業:

### Phase 2C 残り sub-batch

- **Phase 2C-1**: Structured Content Idea promote helper (Studio deeplink + field-mapped clipboard、 `result.json` を読んで contentIdea draft 生成、 In Development list)
- **Phase 2C-2**: Generation Prompt Package (`/configurator` 拡張、 `generation-jobs/<campaignSlug>/<platform>/<ts>/`)
- **Phase 2C-3**: Generated Output Import (`/outputs` 拡張、 Studio deeplink、 既存 publish-package との結合)
- **Phase 2C-4**: = Phase 2B-4 implementation 委譲 (prerequisite: Phase 2B-4 Q 確定 + implementation)
- **Phase 2C-5**: End-to-End smoke (docs-only milestone、 全 Phase 2C land 後)

### Phase 2C-X candidates (schema 追加検討、 boss judgement 待ち)

- `rawIdea` doc type (filesystem 限界が見えた場合の Path C)
- `ideaDevelopmentJob` doc type
- `generationJob` doc type
- `outputRevision` doc type
- `publishedOutput` 拡張 (actualPublishedText / publishedTextSource / revisionReason / visualUsage / visualUsageReason / supersededPlatformOutputIds / acceptedPlatformOutputId)

### Phase 2C-Y / 2C-Z / 2D candidates (long-term direction)

- Phase 2C-Y: Local bridge mode (dashboard が Claude Code / Codex を spawn)
- Phase 2C-Z: Hybrid storage mode (Sanity + local markdown 併用)
- Phase 2D: API automation mode (OpenAI / Anthropic API integration)

### Phase 2B 残り作業

- Phase 2B-4 Q 確定 microbatch + implementation (handoff/0195)
- Phase 2B-2.1: gate reviewer / notes / completedAt 編集
- Phase 2B-3.2: multi-asset reflect / publish-package auto / CLI status indicator
- Phase 2B-3.3: Visual Register retirement
- Phase 2B-X cleanup: dead code / `<UndoToastHost>` AppShell 化 / `<DeferredActionButton>` 削除

### Parent-level open questions

- Q-4 (audit-log schema)
- Q-5 (`tools/sanity/reflect-*.mjs` 段階削除)
- Q-9 (W7 promptTemplate save)

## 6. Key Decisions

- **Phase 2C-0 と 2C-0.1 を 1 つの smoke milestone として束ねる**: 機能的に密に結合する sub-batch を 1 milestone として記録 (Phase 2B Visual flow complete と同じ pattern)、 spec header + parent §0.5 で両 sub-batch を同じ smoke evidence の元で PASS marking
- **試運転 raw idea として boss が本物を選ぶ (Q-2C-10 confirm の verify)**: 「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 が Phase 2C spec §2 (4 OS positioning) と直接対応、 dummy では verify できなかった「実運用 fit」 が実際の発信 material になる level で確認できた
- **「Raw Idea incubation flow が動く」 を新 milestone label にする**: workflow segment レベルの marking pattern を Phase 2B Visual flow complete から踏襲、 boss が次の strategic decision を出す judgement material に
- **「dashboard UI 表示 = 実 path、 docs placeholder = 山括弧表記」 という small discipline を明文化**: fish shell の `<` redirection と山括弧 placeholder の交差で起きた smoke 中 friction を未来の reader が踏まないよう devlog で言語化
- **Phase 2C-1 を「次の実行候補」 として明示**: staged implementation の natural next、 `result.json` を読む helper を追加して Studio promote の摩擦を削減する value
- **Phase 2C-0 + 2C-0.1 を最新の dashboard write surface 6 件目 + 7 件目として cataloging**: filesystem-only direct write という新 pattern が Phase 2B の 4 pattern (Sanity field / Sanity field with vocab / FS via HTTP bridge / Sanity field with FS source) に加わる
- **本 batch では parent §0.5 6 entry tracking を維持**: Phase 2C entry を smoke PASS 反映に拡張するが entry 数は増やさない、 6 entry (Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 / 2B-4 / 2C) を保持

## 7. Human Review Questions

### Smoke PASS 表記の review

1. spec header の「Phase 2C-0 + Phase 2C-0.1 ✅ implemented + boss smoke PASS (handoff/0200)、 残り Phase 2C-1 / 2C-2 / 2C-3 / 2C-4 / 2C-5 は pending」 で OK か?
2. Implementation progress section (header 直下) の 7 行 table 粒度で OK か? もっと簡素化 / 拡張可能
3. parent §0.5 Phase 2C entry の nested bullet list で sub-batch progress を表現する pattern を将来の Phase 2C-1 / 2C-2 / ... 各 land でも踏襲するか?

### Next strategic direction の判断

4. Phase 2C-1 (Structured Content Idea promote helper) を即着手するか、 Phase 2B-4 Q 確定 microbatch を先行するか、 別 path に switch するか
5. 試運転 raw idea で得た AI 結果 (`result.md` / `result.json`) を base に発信タスク (note / Substack / Threads) を Phase 2C-1 と並行で進めるか
6. 「docs の placeholder と dashboard UI の実 path」 discipline を docs に明示的に書く batch を起こすか、 暗黙のままにするか

### Phase 2C-1 scope の判断

7. Phase 2C-1 の scope は「Studio deeplink + clipboard helper」 のみで OK か、 「In Development list (`idea-jobs/*/<ts>/`)」 も同 batch で含めるか
8. Phase 2C-1 で `result.json` を dashboard が **読む** のは OK だが **更新** はしないという原則を維持するか
9. Phase 2C-1 の estimated 規模 (新規 ~5 + 更新 ~2 = ~7 ファイル) で 1 PR 完結できるか

## 8. Risks or Uncertainties

- **Smoke test の reproducibility**: boss が confirm した 16 項目だが、 詳細 test step (例: malformed JSON paste / 200 KB 超 / env flag 片方 off / 同 timestamp 上書き) は本 batch には記録していない。 boss が言及した範囲 = file 存在 + 4 NoX (Sanity / API / shell / outside `idea-jobs/`) で smoke PASS と判定、 edge case の verify は将来 boss feedback で iterate
- **「本物 raw idea で smoke」 の 1 サンプル**: 1 試運転で「動く」 evidence は確かに得たが、 別 idea や別 AI agent (Claude vs ChatGPT vs Codex) での 動作 / 結果 quality を比較していない。 Phase 2C-1 以降の boss workflow で自然に蓄積される想定だが、 本 batch では 1 sample のみ
- **placeholder vs 実 path friction**: 本 smoke で 1 度発生、 boss が即 recover したため fix 不要と判定したが、 別 reader (例えば boss 不在時の Claude Code session) が同 stumble を踏む可能性。 docs に「terminal 貼り付け時は substitute」 note を追加するかは boss judgement
- **6 entry の §0.5 構造の長期メンテ**: Phase 2C 各 sub-batch land のたびに Phase 2C entry を拡張していく方針、 ただし将来 Phase 2C-1 〜 2C-5 が全部 land した時の row 構造が膨らむ。 retroactive な section 整理が将来必要かも
- **次 batch の Phase 2C-1 prerequisite**: Phase 2C-0.1 で生成された `result.json` の field shape (alias normalisation 後の 13 field) を Phase 2C-1 helper が読む想定、 ただし `claims` / `objections` / `examples` 等の **nested 配列内 object shape** が boss が試した AI agent 個体差で揺れている可能性。 Phase 2C-1 着手時に 1-2 sample で再 verify が必要
- **発信 material としての試運転 idea**: 「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 は強い主張、 ただし boss が dashboard の AI 企画化結果を **そのまま** 発信に使うか、 boss が大幅 rewrite するかは未確定。 後者の場合 Phase 2B-4 publish/revision flow との結合 timing が boss workflow 上の next question になる

## 9. Remaining Cleanup Candidates

§5 参照。 全 deferred 作業を category 分けして列挙済。 主要候補:
- **Phase 2C-1**: Structured Content Idea promote helper ← 次の実行候補
- **Phase 2B-4 Q 確定**: handoff/0195 の Q-2B4-1〜Q-2B4-7
- **発信タスク**: 試運転 idea を base に note / Substack / Threads

## 10. Next Recommended Step

**Phase 2C-1 implementation batch (Structured Content Idea promote helper)**

handoff/0199 §11 + Phase 2C spec §16 で示した次の staged sub-batch:
- `result.json` を read してフィールド別 clipboard copy ボタンを並べる helper UI
- Studio deeplink (`http://localhost:3333/structure/contentIdea;new`) を表示
- In Development list (`idea-jobs/*/<ts>/`) を `/ideas` に追加
- 「現在 contentIdea として promote 済 / pending」 の visual state

新規 ~5 + 更新 ~2 = ~7 ファイル想定、 1 PR 完結可能、 Phase 2B 4 sub-batch の cadence を踏襲。

加えて Phase 2B-4 Q 確定 microbatch を並行で進める path も妥当 (Phase 2C-4 prerequisite 解消)。 boss judgement 待ち。

---

### Exact prompt for next Claude Code session (Phase 2C-1 implementation batch)

```
Implement Phase 2C-1: Structured Content Idea promote helper.

Reference:
- docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md (Phase 2C-0 + 2C-0.1 ✅ smoke PASS、 残り pending)
- docs/handoff/0200-phase-2c-0-smoke-pass.md (試運転 raw idea: obsidian-ai-sanity-3, ts: 20260521-124748)
- docs/handoff/0198-phase-2c-0-raw-idea-package.md (path safety pattern を再利用)
- docs/handoff/0199-phase-2c-0-1-idea-result-import.md (resultParser field shape を参考)

Context:
Phase 2C-0 (Raw Idea + Idea Dev Package) と Phase 2C-0.1 (Result import) は smoke PASS (handoff/0200)。
boss が dashboard で raw idea → AI 企画化 prompt → AI 手動実行 → result.md / result.json 保存まで完結できる状態。

ただし「ここから Sanity contentIdea を作る」 摩擦が大: boss は Studio で contentIdea を new、 result.json を terminal で開いて手動 copy & paste する必要あり。

Goal: Phase 2C-1 で boss が `/ideas` から「Sanity Studio で contentIdea を作る」 を 1 click で起こせる helper + 既存 In Development list を実装。

Scope (新規 ~5 + 更新 ~2 = ~7 ファイル想定):

新規:
- dashboard/src/lib/ideaJobs/list.ts (`idea-jobs/*/_raw.json` + `idea-jobs/*/<ts>/result.json` を server-side で read、 In Development list を build)
- dashboard/src/lib/actions/listIdeaJobs.ts ('use server'、 filesystem read 専用)
- dashboard/src/lib/actions/loadIdeaJobResult.ts ('use server'、 個別 job の result.json read)
- dashboard/src/components/ideas/InDevelopmentList.tsx (job 一覧 + 「promote helper を開く」 button)
- dashboard/src/components/ideas/PromoteToContentIdeaHelper.tsx (Studio deeplink + 13 field clipboard copy buttons)

更新:
- dashboard/src/app/ideas/page.tsx (InDevelopmentList を embed)
- dashboard/README.md (Phase 2C-1 row)

Safety layers:
- 既存 paths.ts (Phase 2C-0) の resolveIdeaJobAbsolutePath を再利用、 拡張子 / traversal / path allowlist を踏襲
- read-only (write 0 件、 enableLocalFsRoutes は要求するが enableWriteActions は不要)
- Sanity write しない (Studio deeplink + clipboard のみ)
- doc create は dashboard で行わない (Q-2B3.1-7 / Q-2C-8 原則維持)

Acceptance criteria:
- npm run build green
- /ideas で In Development list が `idea-jobs/*/` を一覧、 status (raw only / result 存在) を visual feedback
- 各 job の row から「promote helper を開く」 → result.json を read → 13 field の clipboard button + Studio deeplink
- Studio deeplink (例: http://localhost:3333/structure/contentIdea;new) が new tab で開く
- Sanity write 0 件、 doc create 0 件
- 外部 LLM API 通信 0 件
- Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 / 2C-0 / 2C-0.1 動作不変

Docs:
- docs/devlog/<NNNN>-phase-2c-1-content-idea-promote-helper.md
- docs/handoff/<NNNN>-phase-2c-1-content-idea-promote-helper.md
- docs/handoff/latest.md mirror

End-of-run summary:
1. Files changed
2. In Development list behavior
3. Promote helper behavior
4. Build validation
5. Security checks
6. Manual smoke checklist
7. Remaining issues
8. Next recommended step
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0199-phase-2c-0-1-idea-result-import.md
(expect empty)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0199-phase-2c-0-1-idea-result-import.md \
    -not -path "*/node_modules/*"
(expect empty)

=== Files touched in this batch ===
docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md  (header status update + Implementation progress section)
docs/specs/phase-2b-write-actions.md                          (§0.5 Phase 2C entry を smoke PASS 反映に拡張)
docs/devlog/0189-phase-2c-0-smoke-pass.md                     (new)
docs/handoff/0200-phase-2c-0-smoke-pass.md                    (new, this file)
docs/handoff/latest.md                                         (mirror of 0200)
```

Build skipped (docs-only)。 Runtime behavior unchanged: Phase 2B-1 reactionNotes + Phase 2B-2 humanReviewGate state + Phase 2B-3 Visual approve/register bridge + Phase 2B-3.1 visualAssetPlan Sanity reflect + Phase 2B-4 spec (planning) + Phase 2C spec (CONFIRMED) + Phase 2C-0 + Phase 2C-0.1 (smoke PASS) すべて preserved as-is。 Sanity schema 不変。 外部 LLM API 通信 0 件。

Phase 2C MVP の **Raw Idea incubation flow** segment が boss-confirmed PASS milestone に到達、 Phase 2C-0 + 2C-0.1 implementation cycle が完結。 boss が次の strategic decision (Phase 2C-1 implementation / 2B-4 Q 確定 / 別 path / 発信 task) を選ぶ段階。
