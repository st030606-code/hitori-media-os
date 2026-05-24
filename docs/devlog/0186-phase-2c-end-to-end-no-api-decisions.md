# Phase 2C decisions confirmed — End-to-End No-API Publishing Workflow

日付: 2026-05-21

## 背景

Phase 2C spec (End-to-End No-API Publishing Workflow with Raw Idea incubation) は 2026-05-21 に planning spec として land (handoff/0196)。 boss が手元で本 spec の 13 open question を read + judgement を完了し、 全 13 件を **CONFIRMED** として確定。 本 batch は docs-only で:

1. Phase 2C spec を「推奨」 → 「CONFIRMED」 に書き換え
2. 矛盾する open-question wording を除去
3. 親 spec (`phase-2b-write-actions.md`) §0.5 に Phase 2C row + Phase 2B-4 row を追加
4. devlog + handoff + latest mirror を新規

次の段階は **Phase 2C-0 implementation batch** (Raw Idea + Idea Development Package、 新規 ~9 + 更新 ~3 = ~12 ファイル)。

## 決定・変更

### Boss-confirmed Q-2C-1〜Q-2C-13 (全 13 件 CONFIRMED)

| # | 質問 | Confirmed decision |
|---|---|---|
| **Q-2C-1** ✅ | schema change を本 batch / Phase 2C 系で行うか、 no-schema MVP first か | **No-schema MVP first**。 Phase 2C MVP では Sanity schema 不変、 schema 追加は Phase 2C-X 候補として §7 で propose のみ |
| **Q-2C-2** ✅ | rawIdea doc type を作るか、 contentIdea draft を流用するか | **filesystem-only raw idea (Path A)** = `idea-jobs/<ideaSlug>/_raw.json`、 `rawIdea` doc type 新設は MVP では行わない |
| **Q-2C-3** ✅ | generationJob doc を作るか、 filesystem-only か | **filesystem-only prompt package** = `generation-jobs/<campaignSlug>/<platform>/<timestamp>/{prompt.md, job.json}` |
| **Q-2C-4** ✅ | 実際に投稿した text の primary source of truth は? | **MVP では Sanity に保存しない**、 `actualPublishedText` 追加は Phase 2B-4.1 以降に deferred |
| **Q-2C-5** ✅ | visualUsage を `archived` で代用するか、 新 enum を追加するか | **`visualAssetPlan.status: 'archived'` + `reviewNotes` で表現**、 新 enum なし |
| **Q-2C-6** ✅ | local Claude/Codex execution method | **2 mode** = (a) manual copy/paste + (b) CLI command display、 dashboard shell exec / spawn なし |
| **Q-2C-7** ✅ | dashboard が local files を write してよいか | **Yes, strict allowlist**: 4 dir / `.md`+`.json` only / size cap / traversal reject / atomic write / `enableLocalFsRoutes` + `enableWriteActions` の 2 段 gate |
| **Q-2C-8** ✅ | import generated outputs が platformOutput doc を作るか | **MVP では作成しない**、 filesystem read + Studio deeplink + clipboard copy のみ |
| **Q-2C-9** ✅ | publish 時に publishedOutput doc を新規作成するか | **MVP では作成しない**、 Phase 2B-4 `manualPublishingStatus` flow を使う |
| **Q-2C-10** ✅ | 試運転 raw idea を何にするか | **boss が本物の new raw idea**、 dummy / rehashed old topic 不可 |
| **Q-2C-11** ✅ | Phase 2C を 1 batch / staged batch | **Staged**: Phase 2C-0 / 2C-1 / 2C-2 / 2C-3 / 2C-4 (= Phase 2B-4 implementation) / 2C-5 (E2E smoke) |
| **Q-2C-12** ✅ | product mode roadmap | MVP = manual copy/paste + CLI display → next = local bridge → later = API automation → eventually = hybrid mode |
| **Q-2C-13** ✅ | storage mode roadmap | MVP = Sanity operating database → later = Local Markdown / Obsidian-native → eventually = Hybrid storage mode |

### Phase 2C spec の更新内容

`docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`:

1. **Header**: ステータスを「planning spec」 → 「**spec-finalized, decisions CONFIRMED (handoff/0197), implementation pending**」 に変更、 confirmed premise 5 項目を bullet 化
2. **§0 (inherited decisions)**: 「confirmed direction」 → 「boss CONFIRMED 2026-05-21 via handoff/0197」 + Q-2C-1〜Q-2C-13 を bullet で展開
3. **§2-5 (future modes)**: 「open question Q-2C-12 / Q-2C-13 で documented」 → 「CONFIRMED Q-2C-12 / Q-2C-13」
4. **§5 (Path 比較)**: 「Recommendation (本 spec の前提)」 → 「Decision (CONFIRMED Q-2C-1 + Q-2C-2、 handoff/0197)」 + Path A 採用を明示
5. **§6 (MVP)**: 「Minimum no-schema-change implementation (MVP)」 → 「Minimum no-schema-change implementation (MVP — CONFIRMED)」 + Q-2C-1 / Q-2C-2 reference
6. **§11-1 (試運転 raw idea)**: 候補 (a)〜(e) を削除 → 「boss が本物の new raw idea を Phase 2C-5 smoke で決定」 (CONFIRMED Q-2C-10)
7. **§13 (Open questions)**: section title「Open questions」 → 「**Confirmed decisions (Q-2C-1〜Q-2C-13、 boss CONFIRMED 2026-05-21、 handoff/0197)**」、 全 13 件を CONFIRMED 表記に書き換え
8. **§16 (Staging)**: 「Implementation staging recommendation」 → 「Implementation staging (CONFIRMED Q-2C-11)」
9. **§19 (Post-spec next step)**: Q 確定 microbatch を削除 → 「Phase 2C-0 implementation batch」 を first item に昇格、 Phase 2B-4 dependency note 追加

### 親 spec の更新内容

`docs/specs/phase-2b-write-actions.md` §0.5 Implementation status section:

1. **Phase 2B-4 batch entry を新規追加** (planning spec、 Q-2B4-1〜Q-2B4-7 awaiting confirmation、 handoff/0195 link)
2. **Phase 2C batch entry を新規追加** (spec-finalized、 Q-2C-1〜Q-2C-13 CONFIRMED、 handoff/0196 + 0197 links、 staged sub-batch list、 product/storage roadmap 要約、 Phase 2C-4 prerequisite note)
3. **Implementation status list を 6 entry に拡張**: Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 (all smoke PASS) + Phase 2B-4 (planning) + Phase 2C (CONFIRMED, implementation pending)
4. **Still open** section の Q-3 / Q-4 / Q-5 / Q-9 は不変

### 新規 docs (3)

- `docs/devlog/0186-phase-2c-end-to-end-no-api-decisions.md` (本ファイル)
- `docs/handoff/0197-phase-2c-end-to-end-no-api-decisions.md`
- `docs/handoff/latest.md` (mirror of 0197)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ全 13 件を一括 CONFIRMED したか

boss が本 spec read で「推奨案がすべて納得できる」 と判断、 1 項目ずつの逆転判断は不要。 これは:

- Phase 2C spec の前提が Phase 2B 4 sub-batch + 2B-4 で確立した design ethic (schema 不変 / doc create を dashboard でしない / observation vs edit surface 分離 / safety layers / staging) を一貫して延長したため
- 「No-API first」 + 「filesystem-only raw stage」 + 「staged batch」 + 「product mode roadmap」 + 「storage mode roadmap」 が boss の現在の workflow / dataset 規模 / product 方針 (CLAUDE.md 含む) と整合
- 4 OS positioning (Obsidian / Sanity / Claude+Codex / Dashboard) が boss の意識下にあった分業を言語化したもので、 boss が再確認するまでもなく合意

逆転判断が出る可能性が高い項目は Q-2C-7 (filesystem write の安全 layer) / Q-2C-11 (staging 粒度) / Q-2C-12-13 (mode roadmap の優先順) だったが、 これらも spec が記述した制約 / 利点 / trade-off を boss が full に把握していたため、 推奨案を採用。

### なぜ親 spec §0.5 に Phase 2B-4 row + Phase 2C row を追加するか

Phase 2B 全 sub-batch で確立した spec lifecycle pattern:
1. spec creation (planning)
2. boss Q confirmation
3. implementation
4. boss smoke (必要に応じて 2-3 round)
5. boss smoke PASS

各段階の land を parent §0.5 に「ステータス」 として明示することで:
- spec を後で読む reader が「これは planning か / confirmed か / implemented か / smoke PASS か」 一目で分かる
- 後続 Phase で「2C template が CONFIRMED 済」 と参照できる
- 将来 reviewer が「Phase 2C はいつ confirmed?」 と問うた時に 1 か所で答えが見える

Phase 2B-4 は planning (Q awaiting)、 Phase 2C は CONFIRMED (implementation pending) という **異なる status** を区別して表記。 これにより boss が「次に着手すべき batch」 が parent spec を見るだけで判断できる。

### なぜ §13 を「Open questions」 から「Confirmed decisions」 に書き換えたか

spec が finalized 状態に進んだ段階で、 開いている疑問が残っていると後で読む reader が「これは未解決か?」 と誤読する risk。 タイトル + 表のヘッダー / 各 row の表記をすべて「CONFIRMED」 に揃えることで、 spec の status と内容が一致する。

加えて §0 で各 Q の confirmed decision を bullet 化することで、 spec 全体を読まずに「結局 Phase 2C は何を CONFIRMED したか」 が冒頭で把握できる構造に。

### なぜ Phase 2C-0 を「次の実行候補」 として §19 で明示するか

5 staged sub-batch + 1 smoke の中で Phase 2C-0 (Raw Idea + Idea Development Package) を最初に実行する理由:

1. Phase 2C-0 だけで boss が「workflow 前段の手応え」 を verify 可能 (rough idea → AI 企画化 prompt → result import → Studio で contentIdea 作成)
2. Phase 2C-1 / 2C-2 / 2C-3 は Phase 2C-0 land 後に「再利用 / 模倣」 で書ける、 prompt package / 結果 import の core pattern を Phase 2C-0 で確立
3. Phase 2C-4 (= Phase 2B-4 implementation) は別 prerequisite (Phase 2B-4 Q 確定) があり、 boss judgement で順序を選べる
4. Phase 2C-5 (E2E smoke) は全 sub-batch land 後の docs-only milestone

「次に何をするか」 を spec 末尾で示すことで boss が「Phase 2C-0 implementation batch を起こす」 prompt を即座に投げられる。

### なぜ Phase 2C-4 を Phase 2B-4 implementation と等価に扱うか

Phase 2C spec §14 で確定済の「Stage 6-8 = Phase 2B-4 委譲」 を踏襲。 Phase 2C-4 を独立 batch として実装すると Phase 2B-4 と重複、 spec が二重になる。 そこで:

- Phase 2C-4 = Phase 2B-4 implementation の **別名**
- Phase 2B-4 spec が Q 確定 + implementation すれば、 自動的に Phase 2C-4 が完了
- parent §0.5 に「Phase 2C-4 prerequisite: Phase 2B-4 Q 確定 + implementation」 を明記

これにより boss が「Phase 2B-4 と Phase 2C のどちらを先に進めるか」 という判断軸が明確化。 Recommended order: Phase 2C-0 → 2C-1 → (Phase 2B-4 Q 確定 + implementation) → 2C-2 / 2C-3 → 2C-5 smoke。 ただし boss が「Phase 2B-4 を先」 と判断する path もある。

### なぜ Phase 2C を「spec-finalized」 と呼ぶか (「completed」 ではなく)

「finalized」 = spec text + decisions が確定、 すべての open question に答えがある状態。 「completed」 = implementation + smoke PASS まで完了した状態。

Phase 2C は spec finalized だが implementation pending、 この区別を header + parent §0.5 で明示することで、 後の reader が「これは決まったが、 まだコードは書かれていない」 を即座に理解できる。 Phase 2B 4 sub-batch は全部「implemented + smoke PASS」、 Phase 2B-4 は「planning, Q awaiting」、 Phase 2C は「spec-finalized, CONFIRMED, implementation pending」 という 3 段階 status を区別。

## 影響

- リポジトリ:
  - `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` (header + §0 + §2 + §5 + §6 + §11 + §13 + §16 + §19 を update、 約 50 行 net 変更)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 に Phase 2B-4 row + Phase 2C row 追加、 約 40 行 add)
  - `docs/devlog/0186-...` + `docs/handoff/0197-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - Phase 2C spec が boss CONFIRMED 状態に到達、 implementation phase に移行可能
  - 次は Phase 2C-0 implementation batch (Raw Idea + Idea Development Package、 新規 ~9 + 更新 ~3 = ~12 ファイル)
  - 並行候補: Phase 2B-4 Q 確定 microbatch (Q-2B4-1〜Q-2B4-7、 handoff/0195 末尾の exact prompt 雛形あり)
- スキーマ: 不変 (Phase 2C MVP は no schema change、 Phase 2C-X で schema 追加 propose)
- プロダクト方針:
  - 4 OS positioning (Obsidian = 思考 OS / Sanity = operating DB / Claude+Codex = 生成 agent / Dashboard = orchestrator) が parent spec + Phase 2C spec で明文化
  - product mode roadmap (manual → CLI → bridge → API → hybrid) が parent §0.5 で明示、 boss が judgement する基準が確立
  - storage mode roadmap (Sanity → Local Markdown → Hybrid) が parent §0.5 で明示、 将来 Obsidian sync 検討 path が確保
  - 「dashboard が orchestrator、 AI 実行は外部」 という No-API architecture が CONFIRMED、 Phase 2D (API automation) の議論を「いつ起こすか」 が明確化

## 次の一手

**Option A (推奨) — Phase 2C-0 implementation batch**

最初の staged sub-batch を起こす。 scope:
- 新規 ~9 + 更新 ~3 = ~12 ファイル
- `/knowledge` tab 拡張 (Raw Ideas + In Development tabs)
- raw idea filesystem write (`idea-jobs/<slug>/_raw.json`)
- idea development package 4 ファイル書き出し
- idea result import (preview only)
- Studio deeplink + clipboard copy で contentIdea promote 補助
- safety layers: `enableLocalFsRoutes` + `enableWriteActions` の 2 段 gate、 path allowlist、 extension allowlist、 size cap、 atomic write、 no shell exec

acceptance criteria:
- `/knowledge` tab 2 で raw idea 入力 → `idea-jobs/<slug>/_raw.json` 確認
- 「AI 企画化 prompt を作る」 button → 4 ファイル確認
- prompt copy clipboard + CLI command display 動作
- 「結果を取り込む」 → result.md preview
- 「Studio で contentIdea を作る」 deeplink + clipboard 動作

1 PR 完結可能、 Phase 2B 4 sub-batch の cadence (~3〜4 sub-batch / 2-3 日) を踏襲。

**Option B — Phase 2B-4 Q 確定 microbatch を先行**

Phase 2C-0 より先に Phase 2B-4 を確定 + implement する path。 Phase 2C-4 (publish/revision) の前提が固まる利点。 handoff/0195 末尾に exact prompt 雛形あり。

**Option C — 別 path に進む**

Phase 2C より優先度高い path (Phase 2B-2.1 gate reviewer / 2B-3.2 multi-asset / 2B-3.3 Visual Register retirement / 別 W) を boss が選ぶ。

発信ネタ案:
- 「Phase 2C 13 open questions を一括 CONFIRMED できた理由 — Phase 2B で確立した design ethic を一貫して延長した結果」
- 「No-API first を確定するという design 判断 — API automation を「いつ起こすか」 の基準を spec で明文化」
- 「filesystem-only raw stage を MVP として選んだ trade-off — Sanity 内を structured material だけに保つ衛生」
- 「Staged batch (Phase 2C-0〜2C-5) という分割戦略 — 1 batch land の負担を回避しつつ end-to-end loop を完結」
- 「dashboard が orchestrator、 AI 実行は外部 — 4 OS architecture の言語化」
- 「parent spec §0.5 の 6 entry tracking — planning / CONFIRMED / implemented / smoke PASS の 4 段階 status を区別する spec lifecycle」
