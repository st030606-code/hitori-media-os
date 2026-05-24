# Phase 2C-0 + Phase 2C-0.1 boss smoke PASS — Raw Idea incubation flow が動く

日付: 2026-05-21

## 背景

handoff/0198 (Phase 2C-0 Raw Idea + Idea Development Package implementation) + handoff/0199 (Phase 2C-0.1 AI-developed result import implementation) で実装した dashboard `/ideas` surface を、 boss が手元で **本物の new raw idea** (CONFIRMED Q-2C-10) を使って full smoke test を実施。 全 step PASS。

本 batch は docs-only で:
1. Phase 2C-0 + 2C-0.1 を「implemented + smoke PASS」 status に昇格
2. spec header + parent §0.5 Phase 2C entry を update
3. boss が次に着手すべき path (Phase 2C-1 Structured Content Idea promote helper) を明示

Phase 2C 系列で **最初の動作確認済 milestone** に到達。

## 決定・変更

### Boss-confirmed smoke evidence (2026-05-21)

#### 試運転 raw idea (boss が本物を選択、 CONFIRMED Q-2C-10)

> **「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか。」**

これは Phase 2C spec §2 で確立した 4 OS positioning (Obsidian = 思考 OS / Sanity = operating DB / Claude+Codex = agent / Dashboard = orchestrator) の核となる主張で、 boss が今後発信する materials の base にもなる本物の idea。 dummy / rehashed old topic ではない。

#### 生成された idea-job ファイル群

```
idea-jobs/obsidian-ai-sanity-3/
├── _raw.json                                    # Phase 2C-0 で書き出し
└── 20260521-124748/                             # timestamped sub-directory
    ├── prompt.md                                # Phase 2C-0 で書き出し (AI 企画化 prompt 本文)
    ├── job.json                                 # Phase 2C-0 で書き出し (metadata)
    ├── result.md                                # Phase 2C-0.1 で書き出し (AI 結果 markdown)
    └── result.json                              # Phase 2C-0.1 で書き出し (構造化 JSON、 検出時のみ)
```

`obsidian-ai-sanity-3` は slug 自動生成 (rawTitle の英数字部分 + 3 数字、 boss が ASCII で書いた title から `slugifyTitle` が `obsidian-ai-sanity-3` を生成、 ideaSlug regex `^[a-z0-9][a-z0-9-]{0,79}$` に整合)。

timestamp `20260521-124748` = UTC `2026-05-21 12:47:48`、 `nowTimestamp()` の `YYYYMMDD-HHMMSS` 規則どおり。

#### Smoke checklist (handoff/0198 §11 + handoff/0199 §9 の 20+ step、 全 PASS)

| 項目 | 結果 |
|---|---|
| `/ideas` page が動作 | ✅ PASS |
| Raw Idea form 入力 → 「アイデアパッケージを作成」 で 3 ファイル書き出し | ✅ PASS |
| `idea-jobs/obsidian-ai-sanity-3/_raw.json` が存在 | ✅ PASS |
| `idea-jobs/obsidian-ai-sanity-3/20260521-124748/prompt.md` が存在 | ✅ PASS |
| `idea-jobs/obsidian-ai-sanity-3/20260521-124748/job.json` が存在 | ✅ PASS |
| 「プロンプトをコピー」 → AI agent (ChatGPT / Claude / Codex) に paste → 結果取得 | ✅ PASS |
| AI 結果を dashboard `<ResultImportSection>` textarea に paste | ✅ PASS |
| 「結果を保存」 → `result.md` + `result.json` 書き込み | ✅ PASS |
| `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md` が存在 | ✅ PASS |
| `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.json` が存在 | ✅ PASS |
| Sanity doc が新規作成されていない | ✅ PASS (Q-2C-8 / Q-2C-2 原則維持) |
| 外部 LLM API 通信 0 件 | ✅ PASS (Q-2C-6 / Q-2C-12 原則維持) |
| dashboard が shell command 実行 0 件 | ✅ PASS (Q-2C-6 原則維持) |
| 書き込み先が `idea-jobs/` 内に閉じている | ✅ PASS (Q-2C-7 path allowlist) |
| Phase 2B-1 〜 2B-3.1 動作不変 | ✅ PASS |
| observed issues | なし |

#### Boss が踏んだ workflow 摩擦 (smoke 中に発生、 fix 不要)

> Note: boss が `cat idea-jobs/<ideaSlug>/<timestamp>/result.md` の形式 (山括弧 placeholder のまま) を fish shell に貼ったところ、 fish が `<ideaSlug>` を入力 redirection と解釈してエラー。 正しい path は `cat idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md`。

これは **dashboard の bug ではない**:
- Phase 2C-0 SuccessPanel / Phase 2C-0.1 SavedPanel の path 表示は **実 path** (substituted) を出している、 山括弧 placeholder は使っていない
- boss が docs (handoff/0198 §11 smoke checklist) を読んだ際、 example として書かれていた placeholder 表記 (`idea-jobs/<ideaSlug>/<timestamp>/result.md`) をそのまま terminal に貼った
- fish の input redirection 構文 (`< filename`) と山括弧 placeholder の競合は予測可能、 boss が即座に correct path に切り替えて recover

**design discipline 観点**: dashboard UI に表示される path は常に実 path (`idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md` 等)、 docs 内の placeholder 表記 (`<ideaSlug>` / `<timestamp>`) は読みやすさのために残す。 「**docs の placeholder と dashboard UI の実 path** を区別する」 という small lesson を本 batch で言語化。

### spec / parent spec の更新内容

`docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`:
- **Header**: ステータスを「spec-finalized, decisions CONFIRMED, implementation pending」 → 「**Phase 2C-0 + Phase 2C-0.1 ✅ implemented + boss smoke PASS (handoff/0200)、 残り Phase 2C-1 / 2C-2 / 2C-3 / 2C-4 / 2C-5 は pending**」
- 新セクション「**Implementation progress (2026-05-21)**」 を header 直下に追加 — sub-batch 7 件 (2C-0 〜 2C-5) を table で tracking、 status (PASS / pending) + handoff link
- 末尾に「Raw Idea incubation flow が dashboard 内で result.md / result.json persistence まで動作」 の宣言文

`docs/specs/phase-2b-write-actions.md` §0.5 Phase 2C entry:
- entry title を「spec-finalized, Q-2C-1〜Q-2C-13 CONFIRMED, staged implementation pending」 → 「**spec-finalized, Q-2C-1〜Q-2C-13 CONFIRMED; Phase 2C-0 + 2C-0.1 ✅ smoke PASS, 2C-1〜2C-5 pending**」
- handoff list に handoff/0198 + 0199 + 0200 (3 件) を追加
- Sub-batch progress を nested bullet list で詳細化 (Phase 2C-0 / 2C-0.1 PASS、 2C-1〜2C-5 pending)
- **boss smoke evidence** 段落を新規追加 (試運転 raw idea 内容 + slug + timestamp + 評価 4 点を含む)
- Next を「Phase 2C-0 implementation batch」 → 「**Phase 2C-1 implementation batch** — Structured Content Idea promote helper」 に変更

### 新規 docs (3)

- `docs/devlog/0189-phase-2c-0-smoke-pass.md` (本ファイル)
- `docs/handoff/0200-phase-2c-0-smoke-pass.md`
- `docs/handoff/latest.md` (mirror of 0200)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ Phase 2C-0 と 2C-0.1 を **1 つの smoke milestone** として扱うか

技術的には別 sub-batch (handoff/0198 + 0199) だが、 boss workflow としては:
- Phase 2C-0 単独では「prompt package を書き出すだけ」 で AI result 持ち帰り後の保存手段がない (terminal で手動 cp が必要)
- Phase 2C-0.1 で初めて「dashboard 内で end-to-end loop」 が完結
- boss smoke も両 sub-batch を **1 セッションで連続実行**、 個別 smoke を分けると workflow 全体の連続性を verify できない

そこで本 batch では「Phase 2C-0 + 2C-0.1 まとめての smoke PASS」 として 1 milestone を記録。 spec header + parent §0.5 でも両 sub-batch を同じ smoke evidence の元で PASS marking。

これは Phase 2B-3 + 2B-3.1 の「Visual flow complete for now」 milestone (handoff/0194) と同じ pattern — 機能的に密に結合する sub-batch を 1 milestone として束ねる。

### なぜ「本物の new raw idea」 を試運転に使う指示 (Q-2C-10) が正しかったか

CONFIRMED Q-2C-10 で「dummy / rehashed old topic を使わず boss が本物を出す」 と決めた理由は、 本 smoke でも verify された:

- 試運転 idea「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 が Phase 2C spec §2 (4 OS positioning) の **核** と直接対応
- AI 企画化結果が boss が今後 note / Substack / Threads で発信する material の base になる real value を持つ
- raw → prompt package → AI 結果 → file persistence の full loop を「実際に発信する idea」 で通すことで、 各 stage の text 品質 / UX 摩擦 / 結果 format の実用性を boss が judgment できる

dummy で smoke を回していたら「**dashboard は動くが、 boss が実運用で使うか?**」 という重要 question が verify できなかった。 Q-2C-10 confirm の意義が本 smoke で具現化。

### なぜ「docs の placeholder と dashboard UI の実 path」 を区別する原則を明文化するか

boss が `cat idea-jobs/<ideaSlug>/<timestamp>/result.md` を fish に貼ってエラーになった例は:
- dashboard bug ではない (UI は実 path を表示している)
- docs reading bug でもない (placeholder 表記は妥当)
- shell quirk (fish が `<` を redirection と解釈)

3 者が組み合わさって発生した friction だが、 future の boss / 他 reader が同じ stumble を踏まないよう、 本 devlog で **「dashboard UI 表示 = 実 path、 docs placeholder = 山括弧表記」 という区別** を明文化。

design discipline:
- dashboard が `<...>` placeholder を UI に出さない (boss が直接 copy & paste できる pattern を維持)
- docs の placeholder は読みやすさのために残す、 ただし「terminal に貼るときは substitute」 という note を将来 docs に補足する余地あり (本 batch では追加せず、 boss judgement)

### なぜ「Raw Idea incubation flow が dashboard 内で動く」 を新しい milestone marking にするか

Phase 2B 4 sub-batch + Visual flow complete milestone (handoff/0194) で確立した **「workflow segment が安定動作する milestone**」 marking pattern を Phase 2C にも踏襲:

- Phase 2B-3 + 2B-3.1 → Visual flow complete for now (handoff/0194)
- Phase 2C-0 + 2C-0.1 → **Raw Idea incubation flow complete (本 batch)**

dashboard が「rough idea から AI 企画化結果 persistence まで」 の incubation segment を完結できる状態 = Phase 2C MVP の最初の意味のある unit が land した。 これは:
- boss が「次の strategic decision」 を出す judgement material が増えた状態
- Phase 2C-1 〜 2C-5 の各 sub-batch に進む base が established
- 4 OS positioning の中の「Obsidian + AI → Dashboard」 の前半が動作 evidence

### なぜ Phase 2C-1 を「次の実行候補」 として明示するか

CONFIRMED Q-2C-11 で確定した staged implementation:
1. ✅ Phase 2C-0 (Raw Idea + Idea Dev Package)
2. ✅ Phase 2C-0.1 (Result import)
3. **→ Phase 2C-1 (Campaign creation helper、 本 batch 後の next)**
4. Phase 2C-2 (Generation Prompt Package)
5. Phase 2C-3 (Generated Output Import)
6. Phase 2C-4 (= Phase 2B-4 implementation 委譲、 prerequisite: Phase 2B-4 Q 確定)
7. Phase 2C-5 (E2E smoke)

Phase 2C-1 で実現する value:
- `result.json` を読んで Sanity Studio で contentIdea を作る際の摩擦を削減 (deeplink + field-mapped clipboard)
- In Development list (`idea-jobs/*/<ts>/`) を `/ideas` で一覧、 boss が「どの job が completed か / pending か」 を visual feedback
- Phase 2C MVP の「Raw → Structured Content Idea → Campaign」 chain の真ん中 stage を埋める

別 path:
- Phase 2B-4 Q 確定 microbatch (handoff/0195) を並行で進める path
- 別 batch (Phase 2B-2.1 gate reviewer / 2B-3.2 multi-asset 等) に switch する path

boss が次の strategic decision を出すまで Claude Code は idle。

## 影響

- リポジトリ:
  - `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` (header status update + Implementation progress section 追加)
  - `docs/specs/phase-2b-write-actions.md` (§0.5 Phase 2C entry を smoke PASS 反映に拡張)
  - `docs/devlog/0189-...` + `docs/handoff/0200-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - Phase 2C-0 + 2C-0.1 が「smoke PASS」 status に昇格、 Raw Idea incubation flow が動作 evidence 付きで documented
  - 次の natural step は Phase 2C-1 implementation (Structured Content Idea promote helper、 新規 ~5 + 更新 ~2 ファイル想定)
  - 並行候補: Phase 2B-4 Q 確定 microbatch、 別 Phase に switch
- スキーマ: 不変
- プロダクト方針:
  - dashboard の write surface 候補が **6 件** stable に運用可能 (Phase 2B-1 reactionNotes / 2B-2 gate state / 2B-3 visual approve / 2B-3.1 visualAssetPlan reflect / **2C-0 raw idea + idea package** / **2C-0.1 result import**)
  - 4 OS architecture (Obsidian / Sanity / Claude+Codex+ChatGPT / Dashboard) の「Obsidian + AI → Dashboard」 前半が動作実装で establish
  - No-API 原則を本物 raw idea で実 verify、 product mode roadmap (manual + CLI → bridge → API → hybrid) の MVP segment が proven
  - 「dashboard UI 表示 = 実 path、 docs placeholder = 山括弧表記」 という small design discipline を明文化

## 次の一手

**Option A (推奨) — Phase 2C-1 implementation batch (Structured Content Idea promote helper)**

handoff/0199 §11 + Phase 2C spec §16 で示した次の staged sub-batch:
- `result.json` を read してフィールド別 clipboard copy ボタンを並べる helper UI
- Studio deeplink (`http://localhost:3333/structure/contentIdea;new`) を表示
- In Development list (`idea-jobs/*/<ts>/`) を `/ideas` に追加
- 「現在 contentIdea として promote 済 / pending」 の visual state

新規 ~5 + 更新 ~2 = ~7 ファイル想定、 1 PR 完結可能。 Phase 2B 4 sub-batch の cadence を踏襲。

**Option B — Phase 2B-4 Q 確定 microbatch (並行)**

Phase 2B-4 (publish/revision、 handoff/0195) の Q-2B4-1〜Q-2B4-7 を confirm → Phase 2C-4 prerequisite 解消。 docs-only。

**Option C — 別 path に switch**

Phase 2B-2.1 (gate reviewer / notes / completedAt) / Phase 2B-3.2 (multi-asset reflect / publish-package auto / CLI status indicator) / Phase 2B-3.3 (Visual Register retirement) / 別 W のいずれか。

**Option D — 発信タスク**

Phase 2C-0 + 2C-0.1 smoke PASS をベースに note / Substack / Threads で発信。 試運転 raw idea「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 は Phase 2C spec §2 (4 OS positioning) と直結、 dashboard の試運転結果 (result.md / result.json) をそのまま素材として使う path。

発信ネタ案:
- 「dashboard が AI を呼ばないのに、 AI を中心に動く workflow が成立する話 — Phase 2C-0 + 2C-0.1 smoke PASS evidence」
- 「『本物の new raw idea で smoke する』 という design discipline — Q-2C-10 が verify されるまで」
- 「Obsidian + AI + Sanity = なぜ 3 つの組み合わせが最強か (試運転 idea を実発信化)」
- 「docs の placeholder と dashboard UI の実 path を区別する small discipline — fish redirection と山括弧 placeholder の交差」
- 「Raw Idea incubation flow が動く milestone — Phase 2B Visual flow complete と同じ pattern を Phase 2C にも適用」
- 「Sub-batch を 2 件まとめて 1 smoke milestone とする design judgement — 機能的密結合な sub-batch の束ね方」
