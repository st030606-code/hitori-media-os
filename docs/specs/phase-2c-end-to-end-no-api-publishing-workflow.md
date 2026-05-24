# Phase 2C Detail Spec — End-to-End No-API Publishing Workflow (with Raw Idea incubation)

最終更新: 2026-05-23
ステータス: **Phase 2C-0 + Phase 2C-0.1 ✅ implemented + boss smoke PASS (handoff/0200)、 Phase 2C-1A ✅ manual promote helper + schema alignment PASS、 Phase 2C-1B ✅ createContentIdea + Studio URL fix boss smoke PASS (handoff/0206)、 Phase 2C-2 ✅ Generation Prompt Package boss smoke PASS (handoff/0208)、 Phase 2C-3 ✅ Generated Output Import + Import UX fix boss smoke PASS (handoff/0212)、 Phase 2C-4 ✅ platformOutput creation + Studio URL fix boss smoke PASS (handoff/0216)、 Phase 2C-5 ✅ PASS after UX polish、 Phase 2C-6 ✅ Visual Brief Extraction + visualAssetPlan duplicate handling boss smoke PASS、 Configurator context binding fix ✅ boss smoke PASS (handoff/0222)、 Phase 2C-UX ✅ guided workflow polish boss smoke PASS、 Phase 2C E2E ✅ PASS after UX polish (handoff/0225)**
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体 — controlled write surfaces)
関連 spec: [docs/specs/phase-2b-4-publish-status-output-revision.md](./phase-2b-4-publish-status-output-revision.md) (Phase 2C は 2B-4 を publish/revision sub-system として **再利用**、 重複定義しない)
前 spec: Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 (4 sub-batch すべて smoke PASS — handoff/0186 + 0190 + 0194) + Phase 2B-4 (planning spec — handoff/0195)

Q-2C-1〜Q-2C-13 are all CONFIRMED by boss on 2026-05-21 (handoff/0197). Below sections are written from the CONFIRMED premise:
- **MVP = no-schema, filesystem-only raw stage** (Path A)
- **No external LLM API** (manual copy/paste + CLI command display, no shell exec, no spawn)
- **Staged implementation = Phase 2C-0 〜 2C-5** (5 batch + 1 smoke)
- **doc create を dashboard で行わない原則** は Phase 2C-1A までの暫定原則。boss smoke で field-by-field paste が product UX として不足と判明したため、Phase 2C-1B では `contentIdea`、Phase 2C-4 では saved draft からの `platformOutput` のみ controlled create に進める。`campaignPlan` / `publishedOutput` は引き続き自動作成しない。
- Product mode / storage mode roadmap は documented、 implementation は別 Phase

### Implementation progress (2026-05-23)

| Sub-batch | Scope | Status | Handoff |
|---|---|---|---|
| **Phase 2C-0** | `/ideas` Raw Idea form + idea-jobs/<slug>/_raw.json + prompt.md + job.json 書き出し | ✅ implemented + boss smoke PASS | handoff/0198 + 0200 |
| **Phase 2C-0.1** | AI 結果の dashboard paste + result.md / result.json 書き出し + Content Idea 用 JSON copy | ✅ implemented + boss smoke PASS | handoff/0199 + 0200 |
| **Phase 2C-1A** | Structured Content Idea promote helper (Studio handoff + schema-aligned field-mapped clipboard、 In Development list) | ✅ implemented + schema-aligned boss smoke PASS | handoff/0201 + 0202 + 0203 |
| **Phase 2C-1B** | Controlled `createContentIdea` server action from schema-aligned `studioDraft` + contentIdea Studio URL fix | ✅ implemented + boss smoke PASS | handoff/0204 + 0205 + 0206 |
| **Phase 2C-2** | Generation Prompt Package (`/configurator` 拡張、 generation-jobs/) | ✅ implemented + boss smoke PASS | handoff/0207 + 0208 |
| **Phase 2C-3** | Generated Output Import (`/configurator` 拡張、 generation-jobs draft.md / draft.json persistence) | ✅ implemented + boss smoke PASS | handoff/0209 + 0211 + 0212 |
| **Phase 2C-4** | draft.md → controlled Sanity `platformOutput` creation (`/configurator`) + Studio URL fix | ✅ implemented + boss smoke PASS | handoff/0213 + 0215 + 0216 |
| **Phase 2C-5** | End-to-End smoke (docs-only milestone) | ✅ PASS after UX polish | handoff/0217 + 0223 + 0225 |
| **Phase 2C-6** | `draft.md` から visual brief を分離し、local `visual-brief.md/json` と Sanity `visualAssetPlan` を作成 / duplicate block | ✅ implemented + boss smoke PASS | handoff/0219 + 0222 |
| **Configurator context binding fix** | top-level selected `contentIdea` に downstream generation job / import / create operations を scope | ✅ implemented + boss smoke PASS | handoff/0221 + 0222 |
| **Phase 2C E2E smoke audit** | read-only artifact audit + `/ideas` / `/configurator` UX diagnosis | recommendation: **B. PASS after UX polish** | handoff/0223 |
| **Phase 2C-UX** | `/ideas` + `/configurator` guided workflow polish、Japanese label normalization、storage/AI badges、next action cards | ✅ implemented + boss smoke PASS | handoff/0224 + 0225 |
| **Phase 2C E2E final status** | Raw Idea → Content Idea → generation package → output import → platformOutput / visualAssetPlan の no-API guided workflow | ✅ PASS after UX polish | handoff/0225 |

Raw Idea incubation flow が dashboard 内で **result.md / result.json persistence → schema-aligned contentIdea create → generation prompt package creation → generated output import → platformOutput creation** まで boss smoke PASS。 Boss が ChatGPT / Claude / Codex で手動生成した output を `/configurator` に paste し、既存 `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` の `draft.md` / optional `draft.json` として保存した後、saved draft を controlled create で Sanity `platformOutput` に昇格できる。 Phase 2C-6 では generated output に混ざりがちな図解案 / image prompt を text output から分離し、`visual-brief.md` / optional `visual-brief.json` を local に保存したうえで Sanity `visualAssetPlan` を controlled create できるようにした。画像生成・asset 書き込み・Visual Register は後続 flow の責務。Campaign creation は引き続き次フェーズであり、Phase 2C-4/2C-6 は `campaignPlan` / `publishedOutput` を作成せず、公開状態も変更しない。 Phase 2C-5 の E2E は Phase 2C-UX による guided workflow polish 後に PASS として記録済み。

Context binding + 2C-6 smoke PASS note (handoff/0222): `/configurator` downstream operations are now scoped to the selected top-level `contentIdea.slug`. `GeneratedOutputImport`, `PlatformOutputCreate`, `VisualBriefExtraction`, and `VisualAssetPlanCreate` receive `selectedContentIdeaSlug`, filter generation jobs by that slug, display match/mismatch state, and server actions reject mismatches with `content-idea-mismatch` before any local file write or Sanity write. Boss re-smoke confirmed `ai / note / 20260522-131751` is available when top-level Content Idea is `ai`, current target + `MATCH: matched` are shown, visual brief extraction works, `visual-brief.md` / `visual-brief.json` exist, `visualAssetPlan` preview works, duplicate handling safely detects existing `visualAssetPlan.ai.note.inline-visual-1`, and Sanity Studio shows sourceContentIdea `contentIdea.ai` with `status: planned`. Existing cross-context test artifacts are left untouched.

Safety note (handoff/0222): Boss observed pre-existing dirty files under `assets/visuals`, `patches`, `tools`, and `publish-packages`. Treat these as user-owned dirty changes from earlier phases. Phase 2C-6 did not intentionally create image assets, patch files, tools, or publish-package files; it only writes `generation-jobs/.../visual-brief.md` and optional `visual-brief.json`, and performs controlled Sanity `visualAssetPlan` create/duplicate checks. No external API or dashboard shell execution occurred.

E2E audit note (handoff/0223): Read-only audit confirmed local Phase 2C artifacts exist across `idea-jobs/` and `generation-jobs/`, and boss smoke evidence confirms the Sanity-side `contentIdea`, `platformOutput`, and `visualAssetPlan` documents. No functional blocker was found. Recommendation is **B. PASS after UX polish** because `/ideas` and `/configurator` still feel like functional panels rather than a guided workflow: Japanese/English labels are mixed, step order is not prominent, local file saves and Sanity writes need stronger badges, and no-API/no-image-generation boundaries should be visible as workflow state. Proposed follow-up is **Phase 2C-UX: Guided workflow polish for `/ideas` and `/configurator`** before recording final E2E PASS.

Phase 2C-UX note (handoff/0224 + 0225): Implemented guided workflow polish without changing server actions, write surfaces, Sanity schema, path validation, duplicate handling, or file/Sanity write destinations. `/ideas` now shows a Step 0 overview and next action cards for idea package/result import. `/configurator` now shows selected Content Idea context and Step 1-7 flow labels for generation package, generated output import, platformOutput creation, visual brief extraction, and visualAssetPlan creation. Local-vs-Sanity storage and manual-AI/no-API/no-image-generation boundaries are surfaced as badges/notices. Boss high-level UX review confirmed the workflow is understandable enough to proceed. This is **not** a pixel-perfect UI audit. Phase 2C-UX is PASS, and Phase 2C E2E is marked **PASS after UX polish**.

## 0. Confirmed decisions (inherited)

### Parent batch (handoff/0175)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、 Vercel scope に絶対設定しない
- **Q-2** ✅: Production write は永久 disabled、 `enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local/dev のみ発火

### Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 で確立した template

- **Q-6 (undo, Sanity field op)** ✅: in-memory 10秒 toast (W3 / W5 で採用)、 file pipeline 乖離 risk のある context (2B-3 / 2B-3.1) では採用せず
- **Q-8 (conflict)** ✅: `_rev` mismatch → reload prompt、 no last-write-wins、 no 3-way merge
- **Q-10 (devlog)** ✅: 自動 devlog 生成なし、 server `console.log` のみ (metadata only)
- **Edit surface 原則** (Phase 2B-2 で確立): 1 page に絞るのが基本、 文脈ある場合 (Phase 2B-3.1) は両 page を許容
- **Schema 不変原則** (Phase 2B 全 sub-batch で貫徹): controlled write の境界を明確化、 schema 変更は別 spec batch で扱う
- **Doc create を dashboard で行わない原則** (Q-2B3.1-7): dashboard は field update / array element patch のみ、 doc create は Sanity Studio が owner

### Phase 2B-4 (related、 planning spec)

Phase 2C は publish/revision layer を Phase 2B-4 に **委譲**、 重複定義しない:
- `updateManualPublishStatus` / `updatePlatformOutputStatus` / `updateVisualAssetStatus` (3 action) は 2B-4 で定義
- visual usage `archived` enum 流用、 reviewNotes 理由 prefix も 2B-4 と整合
- Phase 2C は **「rough idea → structured contentIdea → campaign → generation → import」 の前半 flow** を担い、 publish 以降は 2B-4 が握る

### Phase 2C batch (本 spec、 boss CONFIRMED 2026-05-21 via handoff/0197)

boss が現実の content production loop から導出した要件:
- 出発点は完成した contentIdea ではなく、 **rough human idea** (1 行メモ / Obsidian の走り書き / 会話ログ / 思いつき)
- AI (ChatGPT / Claude Code / Codex) を **wall-bouncing partner** として使い、 idea → structured contentIdea に育てる
- dashboard で「rough idea を保存 → AI 企画化 prompt を生成 → 結果を取り込む → contentIdea として正式保存 → campaign 作成 → 生成 → revision → publish → 反応記録」 を完結
- **No API** (CONFIRMED Q-2C-12): dashboard が OpenAI / Anthropic / 他有料 LLM API を叩かない、 boss が ChatGPT / Claude Code / Codex を local/manual で動かす
- 「dashboard が orchestrate、 AI 実行は外部」 という分業を spec で明文化

Confirmed batch decisions (Q-2C-1〜Q-2C-13、 handoff/0197):
- **Q-2C-1 ✅**: No-schema MVP first、 Phase 2C MVP では Sanity schema 変更しない
- **Q-2C-2 ✅**: Raw idea は filesystem-only (`idea-jobs/<ideaSlug>/_raw.json`)、 `rawIdea` doc type 新設は MVP では行わない
- **Q-2C-3 ✅**: Generation job は filesystem-only (`generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/{prompt.md,job.json}`)、 `generationJob` doc 作成は MVP では行わない
- **Q-2C-4 ✅**: Actual published text は MVP では Sanity に保存しない、 `actualPublishedText` 追加は Phase 2B-4.1 以降に deferred
- **Q-2C-5 ✅**: Visual not used = `visualAssetPlan.status: 'archived'` + `reviewNotes` (理由)、 新 `visualUsage` enum は MVP に含めない
- **Q-2C-6 ✅**: Local AI execution = **(a) manual copy/paste mode + (b) CLI command display mode** の 2 mode、 dashboard は shell execution / Claude Code / Codex の自動制御を行わない
- **Q-2C-7 ✅**: Dashboard は local idea/generation package files を write してよい、 ただし **strict allowlist** (4 dir / `.md`+`.json` only / size cap / traversal reject / atomic write / `enableLocalFsRoutes` + `enableWriteActions` の 2 段 gate)
- **Q-2C-8 ✅ / UPDATED by Phase 2C-4**: Phase 2C-3 Generated Output Import は platformOutput doc を自動作成せず local `draft.md` 保存まで。Phase 2C-4 で boss request により **別操作として controlled `platformOutput` create** を追加する。これは auto-import ではなく preview → execute の gated Sanity write。
- **Q-2C-9 ✅**: publish 時に `publishedOutput` doc を新規作成しない、 Phase 2B-4 `manualPublishingStatus` flow を使う
- **Q-2C-10 ✅**: E2E smoke test は **boss が本物の new raw idea** を使う、 dummy / rehashed old topic は使わない (boss が later で明示的に変更する場合を除く)
- **Q-2C-11 ✅**: Staged implementation = Phase 2C-0 / 2C-1 / 2C-2 / 2C-3 / 2C-4 (= Phase 2B-4 implementation) / 2C-5 (E2E smoke)
- **Q-2C-12 ✅**: Product mode roadmap = **MVP = manual copy/paste + local CLI command display** → next: local bridge → later: API automation → eventually: hybrid mode
- **Q-2C-13 ✅**: Storage mode roadmap = **MVP = Sanity operating database** → later: Local Markdown / Obsidian-native mode → eventually: Hybrid storage mode

**現在 dashboard が write 可能な 4 surface** (Phase 2B 4 sub-batch):
- W3 (2B-1): reactionNotes
- W5 (2B-2): humanReviewGate state
- W1 (2B-3): visual approve & register (filesystem via CLI bridge)
- (2B-3.1): visualAssetPlan Sanity reflect (Sanity field, 4 fields from patch JSON)

**ギャップ** (Phase 2C で埋める):
- rough idea を dashboard に保存する surface がない (CLAUDE.md「1. 構造化されたアイデアを Sanity またはローカル JSON / Markdown に保存」 の step 1 が dashboard 未対応)
- AI 企画化 prompt を package する surface がない
- AI 企画化結果を取り込む surface がない
- 完成済 contentIdea を「正式 record」 として promote する pattern が未確立
- 生成 prompt package を local 出力する surface がない (`outputs/` への local generation は CLI のみ)
- 生成結果を import する surface がない (現状 platformOutput doc は Studio で manual create のみ)

### Remaining parent-level open questions

**Q-4 (audit-log schema) / Q-5 (reflect-*.mjs 段階削除) / Q-9 (W7 promptTemplate save)** は parent §6 で tracking 継続、 本 batch では touch しない。

---

## 1. Product goal

dashboard で boss が **1 つの real publishing loop を頭から尻尾まで** 完結できるようにする:

1. rough/raw idea を入力 (1 行メモ程度で OK)
2. AI wall-bouncing で structured content idea に育てる (ChatGPT / Claude Code / Codex を **手動** で使う)
3. 構造化済 contentIdea を Sanity に保存
4. campaign を作成 (campaignPlan)
5. 生成 package を作成 (`/configurator`)
6. local Claude Code / Codex / ChatGPT で生成を **手動** 実行
7. 生成 output を import (platformOutput or local file 経由)
8. weak な generation は revise / replace を marking
9. visual を使うかどうか判断 (Phase 2B-4 visual usage marking 再利用)
10. **手動** で publish (X / Threads / note / Substack 等、 自前で投稿)
11. publish status / URL / actual text / visual usage を record back (Phase 2B-4 再利用)
12. 24-72h 後に reactionNotes を記録 (Phase 2B-1 再利用)

**Phase 2C の本質**: 「dashboard が AI を呼ぶ」 ではなく「dashboard が AI と boss の **work between them を orchestrate**」 する。

### In scope (Phase 2C MVP)

- **rough idea** の入力 surface (`/knowledge` or `/ideas` new tab、 既存 contentIdea.rawInput field を流用 or rawIdea doc type 新設)
- **AI 企画化 prompt package** の local filesystem 出力 (`idea-jobs/<slug>/<timestamp>/{prompt.md, job.json}`)
- **AI 企画化結果** の import (`idea-jobs/.../result.md` or `result.json` を read、 dashboard で preview)
- **contentIdea promote**: rawIdea/draft state → structured contentIdea として正式保存
- **campaign 作成**: contentIdea から campaignPlan を Studio で作る pattern を documented (dashboard は ref を補助、 doc create はしない MVP)
- **生成 prompt package** の local 出力 (`generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/{prompt.md, job.json}`)
- **生成 output** の import (`outputs/generated/...` or `publish-packages/campaigns/<slug>/drafts/<platform>.md` を read、 platformOutput.draftBody に流し込む)
- Phase 2B-4 の publish/revision/visual usage 機能を **再利用**

### Out of scope (本 spec の対象外、 §12 で再列挙)

- ✗ Sanity schema 変更 (Phase 2C-X 候補、 §7 で propose のみ)
- ✗ OpenAI / Anthropic / 他有料 LLM API の dashboard 統合 (Phase 2D 候補)
- ✗ auto-posting (X / Threads / note / Substack 等の自動投稿): never (Phase 2B 全体の方針)
- ✗ dashboard が Claude Code / Codex を spawn / 制御 (Phase 2C-Y 候補、 boss approval 後)
- ✗ multi-user workflow / billing / SaaS 化
- ✗ Visual Register retirement (long-term direction、 Phase 2B-3.3 候補)
- ✗ publish-package auto distribution (Phase 2B-3.2 候補)
- ✗ Obsidian 双方向 sync の実装 (思考 OS としての位置づけは documented、 実装は別 Phase)
- ✗ promptTemplate 編集 (W7)
- ✗ audit-log schema (parent Q-4)

---

## 2. Product positioning — Sanity vs Obsidian vs AI

Hitori Media OS は **複数の OS を組み合わせる architecture** を取る。 各 OS の役割を明確化:

### 2-1. Obsidian = 思考 OS

役割:
- rough memo / 日記 / 走り書き / research notes
- backlinks による idea network 形成
- markdown native、 boss が自由に編集
- AI に投げる前段の wall-bouncing 領域
- **「これは将来 publish する material になるか?」 を考える場所**

Phase 2C との関係:
- Phase 2C MVP では Obsidian との直接 sync は実装しない
- boss は Obsidian で書いた rough memo を dashboard に **手動 copy** で取り込む (`/knowledge` の Raw Idea 入力欄)
- 将来 (別 Phase) Obsidian vault → dashboard import の bridge を作る選択肢を残す

### 2-2. Sanity = operating database

役割 (構造化された operations データ):
- `contentIdea` (構造化済の publishable idea)
- `campaignPlan` (publishing campaign の単位)
- `platformOutput` (媒体別 draft)
- `visualAssetPlan` (visual の plan + status)
- `manualPublishingStatus[]` (publish 実行 log)
- `publishedOutput` (公開済の record)
- `humanReviewGates[]` (review gate の state)
- `prompt` / `workflow` / `tool` (生成 ops の参照)

Phase 2C との関係:
- Phase 2C MVP は Sanity を **operating database として活用**、 doc 構造化が完了したものだけ Sanity に入れる
- rough idea や AI 企画化中の job artifact は **filesystem (idea-jobs/)** に置き、 promote 後に Sanity に保存
- これにより Sanity 内が「公開可能性が高い structured material」 のみで埋まる

### 2-3. Claude / Codex / ChatGPT = 生成/作業 agent

役割:
- AI wall-bouncing partner (idea 育成)
- 生成 executor (text / visual)
- review checker / proofreader (将来)
- code/configuration assistant (dashboard 自身を作る)

Phase 2C との関係:
- Phase 2C MVP では dashboard が **prompt package を local filesystem に書き出す** のみ
- boss が ChatGPT / Claude Code / Codex を **手動で叩く** (copy/paste or CLI command)
- 結果は filesystem に置き、 dashboard が import する
- **dashboard が AI API を直接叩かない** ことで:
  - boss が agent を切り替えられる (ChatGPT が今日調子悪い → Claude に切り替え 等)
  - API 課金が dashboard に閉じ込められない
  - 安全性: dashboard が外部 API token を保持しない (write token と同じ design discipline)

### 2-4. Dashboard = workflow UI / orchestrator

役割:
- 3 OS (Obsidian / Sanity / Claude/Codex) を boss が **行き来する surface**
- Sanity への controlled write (Phase 2B 全 sub-batch で確立)
- local filesystem への controlled read/write (Phase 2B-3 で確立 — `assets/visuals/` / `patches/` の path allowlist)
- 進捗の可視化 (`/campaigns/[slug]` / `/publish` / `/analytics`)
- 「次に何をすべきか」 を boss に提示

### 2-5. Future product modes (documented, not all implemented)

dashboard は将来 4 mode を **mix して** 提供する想定:

| Mode | 説明 | Phase 2C MVP | Future |
|---|---|---|---|
| **Manual copy/paste mode** | boss が prompt を手動 copy → AI agent に貼り付け → 結果を手動 copy back | ✅ 採用 (default) | 維持 |
| **Local CLI mode** | dashboard が `codex exec ...` / `claude ...` 等の command を表示、 boss が CLI で実行 | ✅ 採用 (option) | 拡張 |
| **Local bridge mode** | dashboard が local HTTP bridge (Phase 2B-3 pattern) 経由で Claude Code / Codex を spawn | ❌ MVP 未採用 | Phase 2C-Y 候補 (boss approval 後) |
| **API automation mode** | dashboard が OpenAI / Anthropic API を直接叩く | ❌ MVP 未採用 | Phase 2D 候補 (別 spec batch) |

加えて **storage mode** も将来複数を mix:

| Storage mode | 説明 | Phase 2C MVP | Future |
|---|---|---|---|
| **Sanity-only mode** | 構造化 record は全部 Sanity | ✅ default (operating DB) | 維持 |
| **Local Markdown mode** | Obsidian-compatible markdown のみ、 Sanity 不使用 | ❌ MVP 未採用 | 別 Phase で deferred、 Obsidian 派ユーザー向け |
| **Hybrid mode** | Sanity + local markdown を併用、 sync は片方向 / 双方向 / 手動 | ❌ MVP 未採用 | Phase 2C-Z 候補 |
| **Obsidian-native mode** | Obsidian plugin / vault as source of truth | ❌ MVP 未採用 | far future、 product マーケット fit 検証後 |

Phase 2C MVP は **Sanity-only operating mode + manual copy/paste & local CLI generation mode** に絞る (CONFIRMED Q-2C-12 / Q-2C-13)。 将来の mode flexibility は §13 confirmed decisions に明示。

---

## 3. Target workflow — End-to-End

Phase 2C は dashboard の workflow を **10 stage** に整理する:

```
Stage 0: Raw Idea incubation
   0-A. Raw Idea input
   0-B. Idea Development Package (local filesystem 出力)
   0-C. Local AI wall-bouncing (boss が manual で AI を叩く)
   0-D. AI-developed Idea Result (filesystem 経由 import)
   0-E. Structured Content Idea save (Sanity)
   ↓
Stage 1: Campaign creation (campaignPlan)
   ↓
Stage 2: Output configuration (/configurator)
   ↓
Stage 3: No-API generation package (local filesystem 出力)
   ↓
Stage 4: Local generation execution (boss manual)
   ↓
Stage 5: Output import (platformOutput)
   ↓
Stage 6: Revision workflow (Phase 2B-4 委譲)
   ↓
Stage 7: Visual decision (Phase 2B-4 委譲)
   ↓
Stage 8: Manual publishing record (Phase 2B-4 委譲)
   ↓
Stage 9: Reaction recording (Phase 2B-1 既存)
```

### Stage 0: Raw Idea incubation (本 spec の中心)

#### 0-A. Raw Idea input

`/knowledge` (既存 route) に new tab「**仮アイデア (Raw Idea)**」 を追加。 lightweight form:

| Field | 必須 | 説明 |
|---|---|---|
| `rawTitle` | 任意 | 1 行タイトル (boss が後で書き換え OK) |
| `roughMemo` | **必須** | 自由 text 200-2000 文字、 1 行でも構わない (Obsidian からの copy paste 想定) |
| `source` / `context` | 任意 | 「2026-05-21 朝 シャワー中思いつき」「Obsidian note: …」「会話ログ from X」 等 |
| `intendedTheme` | 任意 | 「Hitori Media OS の design discipline」「No-API publishing workflow」 等の loose tag |
| `urgency` | 任意 | enum: `now` / `this-week` / `someday` / `unknown` |
| `relatedProject` | 任意 | enum: `pota-empire-core` / `pota-card-pro` / `hitori-media-os` / `external` / `other` |
| `initialPlatforms` | 任意 | multi-select: X / Threads / note / Substack / YouTube etc (boss の初期勘) |
| `ideaSource` | 任意 | enum: `obsidian` / `chatgpt-chat` / `claude-chat` / `codex-chat` / `voice-memo` / `dream` / `dialogue` / `manual` |

これは **まだ contentIdea ではない**。 Sanity 内で「structured material」 の境界線を保つため、 raw stage は別 doc type or 既存 `contentIdea.rawInput` 流用で扱う (§5 / §6 で 2 path 検討)。

#### 0-B. Idea Development Package

「**AI 企画化 prompt を作る**」 button → dashboard が local filesystem に prompt package を出力:

```
idea-jobs/<ideaSlug>/<timestamp>/
  prompt.md      # boss が AI agent に貼り付ける本文
  job.json       # metadata (raw idea id, expected output schema, version 等)
  result.md      # AI が結果を書き込む空ファイル (boss が手動で作成 or AI が書く)
  result.json    # 構造化結果 (optional、 boss が手動で json 化)
```

`prompt.md` の構成 (推奨 template):
- raw idea (rawTitle + roughMemo + source + intendedTheme)
- project context (CLAUDE.md / brandProfile / プロジェクト方針)
- brand voice / 既存 tone notes
- target audience assumptions (boss が仮置き)
- platform options (initialPlatforms 中心)
- output schema (AI が返すべき構造)
- AI に答えてほしい questions (12 件 minimum、 §0-D 参照)
- expected result path (`idea-jobs/<slug>/<timestamp>/result.md`)
- review checklist (boss が AI 結果を確認する観点)

`job.json` の構成:
```json
{
  "ideaJobId": "<slug>-<timestamp>",
  "ideaId": "<raw idea ref>",
  "createdAt": "ISO-8601",
  "expectedResultPath": "idea-jobs/.../result.md",
  "promptVersion": "v1",
  "boundary": "no-api, manual-agent",
  "generationSource": "claude_code | codex | chatgpt_manual | manual | other"
}
```

#### 0-C. Local AI wall-bouncing (boss が manual で実行)

dashboard はここで **何もしない**。 boss が:
- **Option A**: ChatGPT / Claude (web) / Claude Code / Codex を開き、 `prompt.md` を copy paste → 結果を `result.md` に書き戻す
- **Option B**: dashboard が local CLI command を表示 (e.g., `codex exec --read prompt.md --out result.md`)、 boss が terminal で実行
- **Option C** (deferred): local bridge mode で dashboard が spawn → Phase 2C-Y 候補

**Phase 2C MVP は A + B を採用、 C は deferred**。 Option B の command 表示は **dangerously execute しない**、 表示のみ。

#### 0-D. AI-developed Idea Result の expected schema

AI に返してほしい構造化結果 (markdown + optional JSON):

| Field | 説明 |
|---|---|
| `proposedTitle` | 仮タイトル (boss が編集 OK) |
| `coreThesis` | 中心主張 |
| `targetReader` | 想定読者 (array) |
| `audiencePain` | 読者の具体的な悩み |
| `claims` | 主張リスト (各 claim + confidence + needsVerification) |
| `objections` | 反論 / 懸念 + response |
| `examples` | 具体例 (title + description) |
| `platformAngles` | 媒体ごとの切り口 (platform + hook + CTA + formatNotes) |
| `visualPotential` | 図解可能性 (yes/no + どんな visual が活きるか) |
| `recommendedCampaign` | campaign framing (release-review / build-log / educational / paid-readiness 等) |
| `risks` / `weakPoints` | 主張の弱点、 verify 必要箇所 |
| `nextQuestions` | boss が次に深掘りすべき question 5-10 件 |

このスキーマは既存 `contentIdea` の構造とほぼ一致 (§4 inventory 参照)。 AI 結果を boss が review + 編集 → そのまま contentIdea として promote しやすい。

#### 0-E. Structured Content Idea save

boss が `result.md` を read + 編集 → dashboard で「**Content Idea として正式保存**」 button:

- contentIdea doc を **Sanity Studio で manual create** (dashboard は ref / metadata 補助のみ、 Q-2B3.1-7 の「dashboard が doc create しない」 原則を踏襲する path)
- もしくは、 dashboard で「import AI result → contentIdea draft 作成」 を許す path も検討 (§5 / §6 で 2 path 検討)

ここで初めて Sanity 内に「publishable material」 として登録される。

### Stage 1: Campaign creation

contentIdea が完成 → campaignPlan を作成:
- **MVP**: Sanity Studio で manual create (campaignPlan は `sourceContentIdea` ref + `selectedPlatforms` + 多数の field を持つ複雑な doc)、 dashboard では作成補助 UI のみ提供
- **将来**: dashboard で「Content Idea → Campaign」 button → campaignPlan doc を draft 作成 (Q-2C-2 / Q-2C-5 で検討)

### Stage 2: Output configuration

既存 `/configurator` route を使う:
- platform 選択
- output type 選択
- purpose / tone / CTA / output length
- visual yes/no

### Stage 3: No-API generation package

「**生成 prompt package を作る**」 button → local filesystem に出力:

```
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/
  prompt.md      # 生成用 prompt (contentIdea data + platform config + style rules)
  job.json       # metadata (source contentIdea, selected platform/output, expected output path)
  draft.md       # boss / local AI が後で置く expected output
  draft.json     # optional structured draft output
```

`prompt.md` の構成:
- contentIdea data (coreThesis / audiencePain / claims / examples / platformAngles[platform=current])
- platform config (output type / length / tone / CTA)
- style rules (brand voice / avoid 表現)
- output format (markdown / json / specific schema)
- expected output file path
- review checklist

Phase 2C-2 smoke PASS note (handoff/0208): `/configurator` can produce a usable generation prompt package under `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/`. Boss confirmed with `obsidian-ai-sanity` + `threads`: preview/planned paths appeared, prompt was copied into ChatGPT manually, ChatGPT produced a Threads draft and visual-brief, and dashboard did not call external LLM APIs, generate images, execute shell/Codex/Claude commands, or create Sanity docs.

### Stage 4: Local generation execution

`prompt.md` を boss が ChatGPT / Claude Code / Codex で実行 (Stage 0-C と同じ pattern)。 結果を:

```
outputs/generated/<campaignSlug>/<platform>/<timestamp>.md
```

または既存 publish-packages structure:

```
publish-packages/campaigns/<slug>/drafts/<platform>.md
```

に保存。 path 選択は Q-2C-7 + Q-2C-8 で決定。

### Stage 5: Output import

Phase 2C-3 implementation では `/configurator` に「**Generated Output Import**」 section を追加し、既存 `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` に対して boss が手動生成した output を paste → preview → local draft persistence する。

保存対象:

```
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/
  draft.md       # pasted generated output (Markdown)
  draft.json     # optional, only when frontmatter / fenced JSON / full JSON is detected
```

`platformOutput` create は本 batch では行わない。Generated Output Import の責務は local draft persistence までで、Sanity handoff / platformOutput creation は次 phase に残す。

### Stage 6: Revision workflow (Phase 2B-4 委譲)

Phase 2B-4 spec §4-2 + §6-2 (`updatePlatformOutputStatus`) を **再利用**:
- `platformOutput.status: 'revised'` + `reviewNotes` (revision 理由)
- 「実際に投稿した text」 の保存は Phase 2B-4 MVP では Sanity に保存しない (§4-4 参照)

### Stage 7: Visual decision (Phase 2B-4 委譲)

Phase 2B-4 spec §4-3 + §6-3 (`updateVisualAssetStatus`) を **再利用**:
- `visualAssetPlan.status: 'archived'` + `reviewNotes` (visual usage 理由)
- 既存 reason vocabulary (`low_quality:` / `off_brand:` / `not_needed:` / `platform_text_only:` / `replaced:`)

### Stage 8: Manual publishing record (Phase 2B-4 委譲)

Phase 2B-4 spec §4-1 + §6-1 (`updateManualPublishStatus`) を **再利用**:
- `manualPublishingStatus[_key].{state, publishedUrl, publishedAt, reactionNotes}`
- 「公開済みにする」 quick action button

### Stage 9: Reaction recording (Phase 2B-1 既存)

Phase 2B-1 で実装済の `/analytics` 反応ノート編集を **再利用**:
- 24-72h 後の `reactionNotes` 編集
- `publishedOutput.performanceNotes` / `learnings` / `nextAction` は MVP では Studio 編集 (Q-2C-9 で検討)

---

## 4. Existing data model inventory

audit 結果 (schemas/*.ts 直接 inspect、 2026-05-21):

### 4-1. `contentIdea` (既存 doc type、 Phase 2C 中心)

| Field | Required | Type | Notes |
|---|---|---|---|
| `title` | ✅ | string | |
| `slug` | ✅ | slug | from title |
| `status` | ✅ | string enum (5) | `idea` / `researched` / `drafted` / `reviewed` / `archived` |
| `summary` | ✅ | text rows:3 | |
| **`rawInput`** | ❌ | text rows:6 | **「将来のダッシュボードで最初に入力する未整理メモ、 Obsidian メモ、 会話ログ、 記事アイデアなど」** ← Phase 2C MVP で流用可能 |
| `coreThesis` | ✅ | text rows:4 | |
| `audience` | ✅ min:1 | array of string | |
| `audiencePain` | ✅ | text rows:3 | |
| `contentPillars` | ❌ | array of string | |
| `claims` | ✅ min:1 | array of object | claim / supportingEvidence / confidence / needsVerification |
| `evidence` | ❌ | array of object | type / description / sourceUrl / notes |
| `examples` | ❌ | array of object | title / description |
| `objections` | ❌ | array of object | objection / response |
| `tone` | ✅ | object | voice (required) / styleNotes / avoid |
| `sourceLinks` | ❌ | array of object | type / title / reference / notes |
| `platformAngles` | ✅ min:1 | array of object | platform / targetReader / hook / formatNotes / callToAction |
| `outputChecklist` | ❌ | array of object | outputType / status / localOutputPath / publishedUrl / notes |
| `personalContext` | ❌ | text rows:4 | |

**Key insight**: `rawInput` field が既に存在し、 schema 上「未整理メモ」 として位置づけられている。 **Phase 2C MVP は contentIdea.rawInput を中心に組み立てられる** (ただし `summary` / `coreThesis` / `audience` / `audiencePain` / `claims` / `tone` / `platformAngles` の 7 field が必須なので、 「rough idea のみ」 で contentIdea を作れない — これが §6 の MVP 戦略を制約する)。

### 4-2. `campaignPlan` (既存 doc type)

主要 field (full inventory は handoff/0195 + Phase 2B-4 spec §3-1 参照):
- `title` / `slug` / `sourceContentIdea` (required ref) / `brandProfile` (weak ref)
- `campaignType` enum / `contentMode` enum / `coreThesis` / `targetReader`
- `selectedPlatforms[]` (required min:1) — platform + enabled + priority + 他 11 enum field
- **`humanReviewGates[]`** — Phase 2B-2 で state 編集対象
- **`manualPublishingStatus[]`** — Phase 2B-1 reactionNotes 編集対象、 Phase 2B-4 で state/URL 編集対象
- `releaseNotes` / `riskCheck` / `postPublishMonitoring` / `publishingLifecycleTimeline` 等

### 4-3. `platformOutput` (既存 doc type)

主要 field:
- `sourceContentIdea` (required ref) / `sourceWorkflow` (weak ref) / `platform` (required) / `outputType` (required)
- `title` / **`draftBody`** (required text rows:18) / `localOutputPath`
- `status` enum (5): `drafted` / `reviewed` / `revised` / `ready` / `archived`
- `reviewNotes` (text rows:4) / `generatedFromPrompt` (required ref to prompt)
- `outputLength` / `targetFormat` / `primaryCTA` / `contentStatus` (3 enum)

### 4-4. `publishedOutput` (既存 doc type、 dashboard 未使用)

主要 field:
- `sourcePlatformOutput` (ref) / `sourceDiagramPlan` (ref) / `platform` (required)
- `publishedUrl` (required url) / `publishedAt` (required datetime) / `title` (required)
- `performanceNotes` (text rows:4) / `learnings` (text rows:4) / `nextAction` (text rows:3)

**現状**: dashboard が query / 書き込みを 0 件、 schema 内に定義はあるが宙ぶらりん。 Phase 2B-4 Q-2B4-5 で「dashboard が doc create しない」 原則を維持しつつ Phase 2C-X で活用検討。

### 4-5. `visualAssetPlan` (既存 doc type、 Phase 2B-3.1 で 4 field reflect 済)

- `status` enum (10): `planned` / `brief-ready` / `prompt-ready` / `generated-needs-save` / `saved` / `reviewed` / `approved` / `packaged` / `published` / `archived`
- `reviewNotes` (text) — Phase 2B-4 で visual usage 理由として活用

### 4-6. `prompt` (既存 doc type)

主要 field (`schemas/prompt.ts` audit 結果):
- `title` / `targetPlatform` / `outputType` / `localFilePath` / `promptBody`
- `requiredInputFields[]` / `humanReviewChecklist[]` / `outputPathPattern`
- `version` / `status` / `notes`

→ Phase 2C MVP で生成 prompt の version 管理 / template 化に活用可能 (実装は Phase 2C-3 候補)

### 4-7. `workflow` (既存 doc type)

主要 field:
- `title` / `sourceContentIdea` / `promptsUsed[]` / `toolsUsed[]` / `platformOutputs[]` / `diagramPlans[]`
- `outputFiles[]` / `workflowMode` / `observations` / `devlogReference` / `reviewRequired`

→ Phase 2C で「1 generation run」 の record 単位として活用候補、 ただし MVP では touch しない (deferred)

### 4-8. `tool` (既存 doc type)

機械可読 tool registry、 dashboard 未活用、 Phase 2C touch なし。

### 4-9. 不在 (Sanity schema にない)

Phase 2C MVP で boss が必要としそうな field:
- `rawIdea` doc type (rough idea 専用 container)
- `ideaDevelopmentJob` doc type (AI 企画化 job log)
- `contentIdea.developmentNotes` (text)
- `contentIdea.ideaSource` (enum)
- `contentIdea.platformAngles[]._developedBy` (boss / AI / hybrid)
- `contentIdea.importedAIResult` (text、 raw AI 結果保存)
- `contentIdea.provenance` (object: ideaJobId / generationSource / timestamp)
- `generationJob` doc type
- `outputRevision` doc type
- `platformOutput.localPromptPackagePath` (string)
- `platformOutput.generatedFilePath` (string)
- `platformOutput.generationSource` (enum: claude_code / codex / chatgpt_manual / manual / other)
- Phase 2B-4 §3-6 と同じ未対応 field 群 (`actualPublishedText` / `publishedTextSource` / `revisionReason` / `visualUsage` / `visualUsageReason` / `supersededOutputId` / `acceptedOutputId` / `publishNotes`)

---

## 5. Raw Idea / Idea Development data model — 2 paths

§4-1 inventory で判明したとおり、 既存 `contentIdea` には **`rawInput` field が既に存在** するが、 同時に 7 field が必須 (`title` / `summary` / `coreThesis` / `audience` / `audiencePain` / `claims` / `tone` / `platformAngles`)。 つまり「rough idea のみ」 で contentIdea を作れない。

### Path A: contentIdea.rawInput を流用 (no schema change、 minimal addition)

- rough idea 段階では `contentIdea` を作らない、 raw memo を **local filesystem (`idea-jobs/<slug>/_raw.json`)** に保存
- AI 企画化結果が揃った段階で、 boss が Studio で contentIdea を新規作成 + `rawInput` に raw memo を貼る + 他 7 required field を埋める
- dashboard は raw idea を **filesystem-only** で扱い、 Sanity には structured contentIdea のみ入る
- **利点**: schema 不変、 「Sanity = structured material のみ」 原則維持、 doc create を boss/Studio に委ねる Q-2B3.1-7 原則と整合
- **欠点**: raw idea を dashboard でリスト / 編集する surface が limited (filesystem read 経由)、 backup や検索が弱い

### Path B: 既存 contentIdea を draft state で使う (no schema change、 validation 緩和案)

- contentIdea schema の `summary` / `coreThesis` / `audience` / `audiencePain` / `claims` / `tone` / `platformAngles` の **required 制約を緩和** (schema 変更が必要、 MVP の前提から外れる)
- contentIdea を `status: 'idea'` (既存 enum) で作成、 rawInput のみ埋まった状態を許容
- **欠点**: 既存 doc に対する validation 緩和は影響範囲広い、 既存 doc は required で書かれている → 緩和すると Studio 側で warning 表示
- → Path B は **schema 変更を伴う**、 MVP の「no schema change」 原則に反する、 Phase 2C-X 候補

### Path C: 新規 `rawIdea` doc type を追加 (schema change required)

- `rawIdea` doc type を新設、 rough memo 専用 container
- promote 時に boss が Studio で contentIdea を new create + rawIdea から ref / 内容 copy
- **利点**: 「raw vs structured」 の境界が schema level で明確、 検索 / 一覧 / backup が Sanity の力を借りられる
- **欠点**: schema 変更必要、 MVP の前提から外れる

### Decision (CONFIRMED Q-2C-1 + Q-2C-2、 handoff/0197)

**Phase 2C MVP は Path A を採用 (boss confirmed)**:
- `idea-jobs/<slug>/_raw.json` で raw idea を local 保存
- `idea-jobs/<slug>/<timestamp>/prompt.md + result.md` で AI 企画化 job を local 保存
- promote 時に boss が Studio で contentIdea を new create + `rawInput` field に raw memo を貼る (dashboard が「Studio で開く」 deeplink + 必要 field の draft 内容を **clipboard copy** で補助)

Path B (validation 緩和) / Path C (rawIdea doc type 新設) は **MVP では採用しない**。 Phase 2C-X (schema 追加 batch) で Path C を将来検討、 boss が「filesystem 限界が見えた」 と判断した時に起こす。

---

## 6. Minimum no-schema-change implementation (MVP — CONFIRMED)

§5 Path A (CONFIRMED Q-2C-2) を前提に、 既存 schema field のみで end-to-end loop を完結。 Schema 変更は本 batch + Phase 2C MVP では一切行わない (CONFIRMED Q-2C-1)。

### 6-1. Raw Idea = filesystem-only (Sanity に入れない)

```
idea-jobs/<ideaSlug>/_raw.json  # rough idea (title / memo / source / theme / urgency / project / platforms / ideaSource)
```

dashboard:
- `/knowledge` に「**仮アイデア (Raw Idea) 入力**」 form (controlled write, local fs)
- 「仮アイデア一覧」 = `idea-jobs/*/_raw.json` を read してリスト表示
- delete = filesystem 上の rename to `_archived/` (mv, soft delete)

### 6-2. Idea Development Package = filesystem-only

```
idea-jobs/<ideaSlug>/<timestamp>/
  prompt.md     # AI に投げる本文
  job.json      # metadata
  result.md     # AI 結果 (boss が手書きで完成させる)
  result.json   # 構造化 (optional)
```

dashboard:
- 「**AI 企画化 prompt を作る**」 button → 上記 4 ファイルを書き出し
- 「**企画化結果を取り込む**」 = `result.md` を read + preview
- prompt template は dashboard 側で hardcode (Phase 2C MVP)、 Phase 2C-X で `promptTemplate` doc type 活用検討 (Q-9)

### 6-3. Structured Content Idea save = Sanity (Studio で manual create)

dashboard:
- 「**Content Idea として正式保存**」 button → Studio deeplink を表示
- boss が Studio で contentIdea を new create、 `rawInput` field に raw memo + AI 結果を boss が編集して貼る
- 他 7 required field は boss が AI 結果から copy/edit

dashboard server action は **0 件** (doc create は Studio で)。 Q-2B3.1-7 原則維持。

### 6-4. Campaign creation = Sanity (Studio で manual create)

dashboard:
- 「**Campaign を作る**」 button → Studio deeplink + 必要 field draft 内容を clipboard copy
- boss が Studio で campaignPlan を new create、 `sourceContentIdea` ref で接続

dashboard server action は **0 件** (doc create は Studio で)。

### 6-5. Generation Package = filesystem-only

```
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/
  prompt.md     # 生成用 prompt
  job.json      # metadata
```

dashboard:
- 「**生成 prompt package を作る**」 button → 2 ファイル書き出し
- prompt template は dashboard hardcode (Phase 2C MVP)、 contentIdea + campaignPlan + platform config から render

### 6-6. Local generation execution = filesystem-only (boss が手動)

dashboard は 何もしない (Stage 0-C と同じ)。 boss が manual で ChatGPT / Claude Code / Codex に prompt を投げ、 結果を `outputs/generated/<campaignSlug>/<platform>/<timestamp>.md` or `publish-packages/campaigns/<slug>/drafts/<platform>.md` に保存。

### 6-7. Output import = Sanity (Studio で manual create)

dashboard:
- `/outputs` で「**生成 output を import**」 button → local file を read + preview + 「Studio で platformOutput を作る」 deeplink
- boss が Studio で platformOutput を new create、 `draftBody` に生成 text を貼る、 `localOutputPath` / `title` / `outputLength` / `targetFormat` / `primaryCTA` 等を boss 入力

dashboard server action は **0 件**。 Q-2B3.1-7 原則維持。

### 6-8. Revision / Visual / Publish status = Phase 2B-4 委譲

Phase 2B-4 spec §6-1 / §6-2 / §6-3 の 3 server action を **再利用** (本 spec で重複定義しない):
- `updateManualPublishStatus` (4 field)
- `updatePlatformOutputStatus` (2 field)
- `updateVisualAssetStatus` (2 field)

### 6-9. Reaction recording = Phase 2B-1 既存

`/analytics` reactionNotes 編集 (既存)。 `publishedOutput.performanceNotes` 等は MVP では Studio 編集。

### 6-10. MVP 実装ファイル想定 (Phase 2C 系 batch 全体で land を想定、 1 batch では land しない)

**新規 (Phase 2C-0 = Raw Idea + Idea Dev Package、 1 PR 完結想定)**:
- `dashboard/src/lib/ideas/rawIdeaFs.ts` (local filesystem read/write、 path allowlist、 schema validation)
- `dashboard/src/lib/ideas/promptPackage.ts` (prompt template render + 4 ファイル書き出し)
- `dashboard/src/lib/actions/createRawIdea.ts` (`'use server'`、 `enableLocalFsRoutes` gate、 filesystem write)
- `dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts` (`'use server'`、 filesystem write)
- `dashboard/src/lib/actions/importIdeaDevelopmentResult.ts` (`'use server'`、 filesystem read + preview)
- `dashboard/src/components/ideas/RawIdeaForm.tsx`
- `dashboard/src/components/ideas/IdeaDevelopmentPackageButton.tsx`
- `dashboard/src/components/ideas/ImportIdeaResultPanel.tsx`
- `dashboard/src/app/knowledge/raw-ideas/page.tsx` (new tab or sub-route)

**更新 (Phase 2C-0)**:
- `dashboard/src/app/knowledge/page.tsx` — new tab「仮アイデア」 追加
- `dashboard/src/lib/groq/contentIdeas.ts` — `rawInput` projection 追加 (既存 contentIdea を「rawInput 入りで promote 済」 と表示)
- `dashboard/README.md` — Phase 2C-0 row 追加

**新規 (Phase 2C-1 = Campaign creation補助、 1 PR 完結想定)**:
- `dashboard/src/components/campaigns/CreateCampaignDeeplink.tsx` (Studio deeplink + clipboard copy)
- `dashboard/src/app/campaigns/new/page.tsx` (no doc create、 補助 UI のみ)

**新規 (Phase 2C-2 = Generation Package、 1 PR 完結想定)**:
- `dashboard/src/lib/generation/jobPackage.ts` (prompt render + 2 ファイル書き出し)
- `dashboard/src/lib/actions/createGenerationJob.ts` (`'use server'`、 filesystem write)
- `dashboard/src/components/configurator/GeneratePromptPackageButton.tsx`
- `dashboard/src/app/configurator/page.tsx` 更新 — package 生成 button + preview

**新規 (Phase 2C-3 = Output import、 1 PR 完結想定)**:
- `dashboard/src/lib/outputs/importedOutput.ts` (local file read + safety check)
- `dashboard/src/lib/actions/importGeneratedOutput.ts` (`'use server'`、 filesystem read + Studio deeplink を返す)
- `dashboard/src/components/outputs/ImportGeneratedOutputPanel.tsx`
- `dashboard/src/app/outputs/page.tsx` 更新 — import panel

**Phase 2C-4 = draft.md → platformOutput creation** — implemented in handoff/0213 as a controlled Sanity create from `generation-jobs/`. Publish/revision remains Phase 2B-4 / later publishing management.

**Phase 2C-5 = E2E smoke test** — docs-only smoke 記録 batch

合計: Phase 2C-0 + 2C-1 + 2C-2 + 2C-3 で **新規 ~14 ファイル + 更新 ~5 ファイル**。 1 PR で land すると規模過大、 §16 で staged implementation を推奨。

---

## 7. Potential schema additions (Phase 2C-X 候補、 本 batch では実装しない)

§4-9 で列挙した不在 field 群を **propose only**:

### 7-1. Idea layer

新 doc type:
- **`rawIdea`** — rough memo 専用、 promote 前段の container
  - `rawTitle` (string, optional)
  - `roughMemo` (text rows:6, required)
  - `source` / `context` (text, optional)
  - `intendedTheme` (string, optional)
  - `urgency` (enum: `now` / `this-week` / `someday` / `unknown`)
  - `relatedProject` (enum)
  - `initialPlatforms` (array of string)
  - `ideaSource` (enum: `obsidian` / `chatgpt-chat` / `claude-chat` / `codex-chat` / `voice-memo` / `dream` / `dialogue` / `manual`)
  - `promotedToContentIdea` (ref to contentIdea, optional) — promote 後の追跡
  - `developmentJobs[]` (array of refs to ideaDevelopmentJob)

- **`ideaDevelopmentJob`** — AI 企画化 job log
  - `rawIdea` (ref to rawIdea, required)
  - `localPromptPackagePath` (string, required)
  - `localResultPath` (string, optional)
  - `generationSource` (enum: `claude_code` / `codex` / `chatgpt_manual` / `manual` / `other`)
  - `status` (enum: `prompt-ready` / `awaiting-ai` / `result-imported` / `archived`)
  - `importedResult` (text rows:24, optional) — boss が import した AI 結果 (markdown のまま)
  - `notes` (text, optional)

既存 contentIdea 拡張:
- `contentIdea.developmentNotes` (text rows:6, optional) — 企画化過程のメモ
- `contentIdea.ideaSource` (enum) — `rawIdea` doc にもあるが、 promote 後の contentIdea にも記録
- `contentIdea.importedAIResult` (text rows:24, optional)
- `contentIdea.provenance` (object: `rawIdeaId` / `ideaJobId` / `generationSource` / `developedAt`)

### 7-2. Generation/output layer

新 doc type:
- **`generationJob`** — generation run 単位の log
  - `campaign` (ref to campaignPlan, required)
  - `platform` (string)
  - `localPromptPackagePath` (string, required)
  - `localGeneratedFilePath` (string, optional)
  - `generationSource` (enum: `claude_code` / `codex` / `chatgpt_manual` / `manual` / `other`)
  - `status` (enum: `prompt-ready` / `awaiting-execution` / `generated` / `imported` / `archived`)
  - `notes` (text, optional)
  - `producedPlatformOutputs[]` (array of refs)

- **`outputRevision`** — text revision history
  - `sourcePlatformOutput` (ref)
  - `revisedAt` (datetime)
  - `revisedBy` (enum: `boss` / `ai-assisted` / `auto`)
  - `revisionReason` (text rows:3)
  - `previousText` (text rows:18)
  - `nextText` (text rows:18, optional)

既存 platformOutput 拡張:
- `platformOutput.localPromptPackagePath` (string)
- `platformOutput.generatedFilePath` (string)
- `platformOutput.generationSource` (enum)
- `platformOutput.revisionReason` (text、 既存 reviewNotes で代用可能だが分離検討)

既存 publishedOutput 拡張 (Phase 2B-4 spec §5-1 と同):
- `publishedOutput.actualPublishedText` (text rows:18)
- `publishedOutput.publishedTextSource` (enum)
- `publishedOutput.revisionReason` (text)
- `publishedOutput.visualUsage` (enum: `used` / `not_used` / `replaced` / `no_visual_planned`)
- `publishedOutput.visualUsageReason` (text)
- `publishedOutput.supersededPlatformOutputIds` (array of refs)
- `publishedOutput.acceptedPlatformOutputId` (ref)

既存 manualPublishingStatus 拡張 (Phase 2B-4 §5-2 と同):
- `manualPublishingStatus[].publishNotes` (text)

### 7-3. なぜ本 batch で schema 追加しないか

- Phase 2B 全 4 sub-batch で「schema 不変原則」 を貫徹、 Phase 2B-4 / 2C も同原則を採用
- schema 変更は migration / 再 validation / Studio との整合確認が膨らむ
- MVP (Path A、 filesystem-only raw idea) で workflow が 60-70% 回ることを実証してから schema 追加
- 本 batch は「propose only、 implement later」 を 16+ セクションで明文化
- 「rawIdea doc type 化」 は最も意義が大きい候補だが、 boss が filesystem-only MVP で実運用してから判断

---

## 8. Write surfaces

Phase 2C で必要な controlled write 候補 (各 batch で逐次 land):

### 8-1. Idea layer (Phase 2C-0)

| Action | Mutation | Layer | Phase 2B 既存 pattern との整合 |
|---|---|---|---|
| **A. createRawIdea** | local fs write (`idea-jobs/<slug>/_raw.json`) | filesystem | Phase 2B-3 path allowlist + shape validation pattern |
| **B. createIdeaDevelopmentPackage** | local fs write (4 ファイル) | filesystem | Phase 2B-3 pattern |
| **C. importIdeaDevelopmentResult** | local fs read (`result.md` / `result.json`) | filesystem | preview only、 import 自体は boss が Studio で行う |
| **D. promoteToStructuredContentIdea** | (MVP では 0 件 server action、 Studio deeplink のみ) | (Sanity Studio) | doc create を dashboard で行わない原則 |

### 8-2. Campaign/generation layer (Phase 2C-1 / 2C-2 / 2C-3)

| Action | Mutation | Layer |
|---|---|---|
| **E. createCampaignFromIdea** | (MVP では 0 件 server action、 Studio deeplink + clipboard copy のみ) | (Sanity Studio) |
| **F. createGenerationJob** | local fs write (`generation-jobs/.../prompt.md + job.json`) | filesystem |
| **G. importGeneratedOutput** | local fs read + Studio deeplink return | filesystem (read only) |
| **H. saveOutputRevision** | Phase 2B-4 `updatePlatformOutputStatus` 委譲 | Sanity field |
| **I. updateManualPublishStatus** | Phase 2B-4 委譲 | Sanity field |
| **J. markVisualUsage** | Phase 2B-4 `updateVisualAssetStatus` 委譲 | Sanity field |

### 8-3. 共通 input / 安全 pattern (全 Phase 2C server action で同じ)

各 server action で:
- `enableWriteActions` env flag (Phase 2B 共通)
- `enableLocalFsRoutes` env flag (filesystem write/read 含む action のみ、 Phase 2B-3 で確立)
- `SANITY_WRITE_TOKEN` env presence (Sanity write 含む action のみ — Phase 2C MVP は 0 件、 全 Phase 2B-4 委譲)
- Input regex validation (slug / path / enum 値)
- mode='preview' / 'execute' 2 段 (filesystem write も preview で diff 表示)
- conflict 検知 (file exists 等は upsert ではなく explicit overwrite confirm)
- token / 本文 を log しない (metadata only)
- production 永久 disabled

### 8-4. Local filesystem write の safety extra

filesystem write を扱う Phase 2C action (A / B / F) は **特別な layer** を追加:

- path allowlist (next §9 で詳述)
- file extension allowlist (`.md` / `.json` のみ)
- max file size cap (e.g., 200 KB / file)
- atomic write (write-temp + rename)
- no symlink follow
- no execute / shell invocation
- file owner / mode unchanged (既存 boss user で write)

---

## 9. Local filesystem safety

Phase 2B-3 で確立した path safety pattern を Phase 2C 全 filesystem 動作で踏襲。

### 9-1. Allowlist directories (write 許可)

```
idea-jobs/                               # Stage 0 raw idea + idea development
generation-jobs/                         # Stage 3 generation package
outputs/generated/<campaignSlug>/<platform>/   # Stage 4 (optional output write target)
publish-packages/campaigns/<slug>/drafts/      # Stage 4 (既存 publish-packages structure 流用 path)
```

すべての write は repo root 相対 path に限定、 absolute path を `path.resolve()` で repo root prefix check。

### 9-2. Reject patterns

- absolute path (`/...`)
- `..` traversal (path.normalize 後に `..` を含む)
- URL encoded traversal (`%2e%2e`)
- null byte
- 拡張子が `.md` / `.json` 以外
- ファイル名が `.` で始まる (hidden file) — ただし `_raw.json` / `_archived/` 等の boss-declared prefix は OK

### 9-3. Write only markdown/json

Phase 2C MVP は markdown + json のみ、 binary / image は扱わない (visual は Phase 2B-3 で別 pipeline)。

### 9-4. No shell execution

dashboard は `child_process.spawn` / `exec` を **使わない**。 「Local CLI mode」 の command 表示は string output のみ、 boss が手動で copy/paste して terminal で run。

将来 Phase 2C-Y (Local bridge mode) で codex / claude を spawn する path も検討されるが、 boss approval + 別 spec batch + safety review が必須。

### 9-5. Concurrent write protection

同一 path への並行 write は MVP では検知のみ (file exists → reject)、 boss が再試行。 lock file 化 / atomic-rename 化は Phase 2C-X 候補。

---

## 10. UI design

### 10-1. Page surface 設計

| Page | 役割 (Phase 2C 後) | Phase 2C 編集? | 既存 / 新規 |
|---|---|---|---|
| **`/knowledge`** | content idea + raw idea の一覧 | ✅ Stage 0-A〜0-E (本 spec の primary entry) | 既存 (拡張) |
| **`/knowledge/raw-ideas`** or `/knowledge?tab=raw-ideas` | rough idea 一覧 + 新規入力 + 企画化 job 管理 | ✅ | 新規 sub-route or tab |
| **`/configurator`** | 既存 + Phase 2C-2 generation package 出力 | ✅ Stage 3 | 既存 (拡張) |
| **`/outputs`** | 生成 output import surface | ✅ Stage 5 | 既存 (拡張) |
| **`/publish`** | publish operation surface (Phase 2B-4 spec で確立) | ✅ Stage 6-8 | 既存 (Phase 2B-4 で大幅拡張) |
| **`/campaigns/[slug]`** | campaign 全体 observation | read-only 維持 | 既存 |
| **`/analytics`** | reactionNotes 編集 (Phase 2B-1 既存) | reactionNotes のみ編集可 | 既存 |
| **`/human-review-gates`** | gate state 編集 (Phase 2B-2 既存) | gate state | 既存 |
| **`/visual-assets/[assetId]/candidates`** | visual approve & register (Phase 2B-3 / 2B-3.1 既存) | visual approve / Sanity reflect | 既存 |

### 10-2. `/knowledge` 拡張 (Stage 0)

既存 `/knowledge` page に **tab 構造** を追加:

```
[ 構造化アイデア (Content Ideas) ] [ 仮アイデア (Raw Ideas) ] [ 企画化中 (In Development) ]
```

#### Tab 1: 構造化アイデア (Content Ideas、 既存表示維持)

- 既存 contentIdea 一覧
- 編集なし (Studio で編集)

#### Tab 2: 仮アイデア (Raw Ideas、 Phase 2C-0 新規)

- `idea-jobs/*/_raw.json` を read してリスト表示
- 「**+ 仮アイデアを追加**」 button → form:
  - rawTitle (optional)
  - roughMemo (required, textarea 200-2000 chars)
  - source / context (optional)
  - intendedTheme (optional)
  - urgency (enum dropdown)
  - relatedProject (enum dropdown)
  - initialPlatforms (multi-select chips)
  - ideaSource (enum dropdown)
- 各 row の actions:
  - 「**AI 企画化 prompt を作る**」 → idea-jobs/<slug>/<timestamp>/prompt.md + job.json 書き出し
  - 「**企画化結果を取り込む**」 → result.md preview + 「Studio で contentIdea を作る」 deeplink
  - 「アーカイブ」 → `_archived/` に mv

#### Tab 3: 企画化中 (In Development、 Phase 2C-0)

- `idea-jobs/<slug>/<timestamp>/` 全ジョブ一覧
- status 区分: `prompt-ready` / `awaiting-ai` / `result-imported` / `archived`
- 各 row で:
  - prompt preview
  - 「**prompt を copy**」 (clipboard)
  - 「**local CLI command を表示**」 (e.g., `codex exec --read idea-jobs/<slug>/<ts>/prompt.md --out idea-jobs/<slug>/<ts>/result.md`)
  - 「**結果を取り込む**」 → result.md read + preview
  - 「**Studio で contentIdea を作る**」 deeplink + clipboard

### 10-3. `/configurator` 拡張 (Stage 3)

既存 `/configurator` に「**生成 prompt package を作る**」 section を追加:
- platform / output type / purpose / tone / CTA / output length / visual yes-no の現状 form 維持
- 「**Generate Prompt Package**」 button → `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md + job.json` 書き出し
- prompt preview + 「prompt を copy」 + 「local CLI command を表示」 + 「output 出力先 path を表示」
- 既存 platformOutput / 既存 prompt との連携は MVP では弱め (display のみ)、 Phase 2C-X で promptTemplate 活用

### 10-4. `/configurator` generated output import (Stage 5)

Phase 2C-3 implementation:
- recent `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` を list
- each row shows package-only / draft markdown saved / structured draft saved
- boss pastes generated output from ChatGPT / Claude / Codex
- preview detects title candidates / lead / body / CTA / visual-brief / visualPrompt / thread posts / notes / review checklist
- execute writes `draft.md` and, when structured data is detected, `draft.json`
- no Sanity write and no `platformOutput` create

`/outputs` route remains a future surface for platformOutput handoff / import workflows.

### 10-5. `/publish` (Stage 6-8)

Phase 2B-4 spec §7 で完全に定義済。 本 spec では重複定義しない、 cross-reference のみ。

### 10-6. 「観察 vs 編集」 surface 分離 (Phase 2B-2 原則の踏襲)

- **編集 entry point**:
  - Stage 0 (Raw Idea + Idea Dev): `/knowledge` tab 2 / 3
  - Stage 3 (Generation Package): `/configurator`
  - Stage 5 (Output Import): `/outputs`
  - Stage 6-8 (Publish/Revision/Visual): `/publish` (Phase 2B-4)
  - Stage 9 (Reaction): `/analytics` (Phase 2B-1)
- **観察 only**:
  - `/campaigns/[slug]` (link で各 stage page へ navigate)
  - `/visual-assets/[assetId]` (Phase 2B-3.1 既存)

---

## 11. MVP test scenario

### 11-1. 試運転 raw idea (CONFIRMED Q-2C-10)

**Boss confirmed**: E2E smoke test は **boss が本物の new raw idea** を使う。 Dummy や過去 topic の rehash は使わない (boss が later で明示的に変更する場合を除く)。 これは本物の workflow friction を測定するため、 Phase 2C-5 の smoke 時点で boss が決定。

「本物」 の意味:
- Phase 2C-5 smoke 時点に boss が抱えている rough idea (Obsidian 走り書き / 会話ログ / シャワー中思いつき 等)
- 既に Sanity に entry がある topic は対象外
- AI 企画化を経て contentIdea として発信する意義のある material

具体的な topic 内容は Phase 2C-5 smoke batch で boss が決定。 本 spec では確定しない。

### 11-2. 試運転 step-by-step (Phase 2C-0〜2C-5 land 後の smoke)

1. `/knowledge` tab 2 で raw idea 入力 (rawTitle + roughMemo + source + initialPlatforms=[X, Threads] + ideaSource=obsidian or manual)
2. 「**AI 企画化 prompt を作る**」 → `idea-jobs/<slug>/<ts>/prompt.md` 確認
3. prompt を ChatGPT / Claude Code / Codex に手動投入 → result.md を書き戻す
4. 「**結果を取り込む**」 → result.md preview
5. 「**Studio で contentIdea を作る**」 deeplink → Studio で contentIdea を new create + rawInput / coreThesis / claims 等を AI 結果から copy
6. Studio で campaignPlan を new create、 `sourceContentIdea` ref で接続
7. dashboard `/configurator` で platform 設定 → 「**Generate Prompt Package**」 → `generation-jobs/<contentIdeaSlug>/x/<ts>/prompt.md` 確認
8. prompt を Claude Code or Codex に投入 → 結果を `outputs/generated/<campaignSlug>/x/<ts>.md` に保存
9. dashboard `/outputs` で「**import**」 → preview → Studio で platformOutput new create
10. dashboard `/publish` で Phase 2B-4 経由:
    - boss が手動で X / Threads に投稿
    - `manualPublishingStatus[threads].state: done` + publishedUrl + publishedAt 記録
    - 生成 text が weak だったら `platformOutput.status: revised` + reviewNotes
    - visual を使わなかったら `visualAssetPlan.status: archived` + reviewNotes
11. 24-72h 後、 `/analytics` で reactionNotes 編集 (Phase 2B-1 既存)

### 11-3. 期待される観察

- raw idea → contentIdea promote が 5 分以内で完結 (AI 結果次第)
- generation prompt package が AI agent に直接投げられる完成度
- 生成 output の import が「Studio で create」 deeplink + clipboard で boss 摩擦 < 30 秒
- publish status / revision marking / visual usage / reactionNotes が 1 surface で完結
- token leak なし、 外部 API 通信ゼロ (network tab で確認)

---

## 12. Scope exclusions

本 batch および Phase 2C MVP 全体で **やらない** (明示):

- ✗ Sanity schema 変更 (本 batch では実装しない、 §7 で propose のみ、 Phase 2C-X 候補)
- ✗ OpenAI / Anthropic / 他有料 LLM API の dashboard 統合 (Phase 2D 候補)
- ✗ auto-posting (X / Threads / note / Substack 等): never
- ✗ Production writes: 永久 disabled
- ✗ dashboard が Claude Code / Codex / ChatGPT を spawn / 制御 (Phase 2C-Y 候補、 boss approval 後)
- ✗ multi-user workflow / billing / SaaS 化
- ✗ Visual Register retirement (long-term direction、 Phase 2B-3.3 候補)
- ✗ publish-package auto distribution (Phase 2B-3.2 候補)
- ✗ API automation mode (Phase 2D 候補)
- ✗ Obsidian 双方向 sync の実装 (思考 OS としての位置づけは documented、 Phase 別 batch で)
- ✗ Local Markdown / Obsidian-native storage mode の実装 (storage mode roadmap で documented、 別 Phase)
- ✗ Hybrid storage mode の実装
- ✗ shell execution (`child_process` 等)
- ✗ promptTemplate 編集 (W7)
- ✗ audit-log schema (parent Q-4)
- ✗ tools/sanity/reflect-*.mjs 段階削除 (parent Q-5)

---

## 13. Confirmed decisions (Q-2C-1〜Q-2C-13、 boss CONFIRMED 2026-05-21、 handoff/0197)

All 13 Phase 2C open questions are **CONFIRMED**。 本 spec の §0 / §1 / §2 / §3 / §5 / §6 / §7 / §16 はこれら decisions を前提に書かれている。

| # | 質問 | Confirmed decision |
|---|---|---|
| **Q-2C-1** ✅ | schema change を本 batch / Phase 2C 系で行うか、 no-schema MVP first か | **CONFIRMED: No-schema MVP first**。 Phase 2C MVP では Sanity schema を追加 / 変更しない。 Phase 2B 全 sub-batch + 2B-4 で貫徹した schema 不変原則を Phase 2C でも踏襲。 schema 追加は Phase 2C-X 候補として §7 で propose のみ |
| **Q-2C-2** ✅ | rawIdea doc type を作るか、 contentIdea draft を流用するか | **CONFIRMED: filesystem-only raw idea (Path A)**。 Raw idea は `idea-jobs/<ideaSlug>/_raw.json` で local 保存、 `rawIdea` doc type 新設は MVP では行わない。 Phase 2C-X で `rawIdea` doc 新設 (Path C) を将来検討 |
| **Q-2C-3** ✅ | generationJob doc を作るか、 filesystem-only か | **CONFIRMED: filesystem-only prompt package**。 `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/{prompt.md, job.json}` で MVP は完結、 `generationJob` doc 作成は MVP では行わない |
| **Q-2C-4** ✅ | 実際に投稿した text の primary source of truth は? | **CONFIRMED: MVP では Sanity に保存しない**。 `actualPublishedText` 追加は Phase 2B-4.1 以降に deferred、 Phase 2B-4 Q-2B4-3 と整合 |
| **Q-2C-5** ✅ | visualUsage を `visualAssetPlan.status: archived` で代用するか、 新 enum を追加するか | **CONFIRMED: 既存 `visualAssetPlan.status: 'archived'` + `reviewNotes` で表現**。 新 `visualUsage` enum は MVP に含めない、 Phase 2B-4 Q-2B4-4 と整合 |
| **Q-2C-6** ✅ | local Claude/Codex execution method | **CONFIRMED: 2 mode** = (a) Manual copy/paste mode + (b) CLI command display mode。 Dashboard は shell execution / Claude Code / Codex の自動制御を行わない。 Local bridge mode は Phase 2C-Y 候補、 boss approval + 別 spec batch + safety review が必須 |
| **Q-2C-7** ✅ | dashboard が local idea/generation package files を write してよいか | **CONFIRMED: Yes, with strict allowlist**。 制約: (1) allowlisted directories のみ (`idea-jobs/`, `generation-jobs/`, `outputs/generated/`, `publish-packages/campaigns/`)、 (2) `.md` / `.json` のみ、 (3) size cap (200 KB / file)、 (4) path traversal reject (absolute / `..` / URL encoded)、 (5) atomic write (write-temp + rename)、 (6) `enableLocalFsRoutes` + `enableWriteActions` の 2 段 env gate |
| **Q-2C-8** ✅ / updated | import generated outputs が platformOutput doc を新規作成するか | **Phase 2C-3 では作成しない**。filesystem read + local `draft.md` persistence のみ。Phase 2C-4 で boss request により、saved draft からの controlled `platformOutput` create を別操作として追加。 |
| **Q-2C-9** ✅ | publish 時に publishedOutput doc を新規作成するか | **CONFIRMED: MVP では作成しない**。 Phase 2B-4 `manualPublishingStatus` flow を使う。 Phase 2B-4 Q-2B4-5 と整合 |
| **Q-2C-10** ✅ | 試運転 raw idea を何にするか | **CONFIRMED: boss が本物の new raw idea** を使う。 Dummy / rehashed old topic は使わない (boss が later で明示的に変更する場合を除く) |
| **Q-2C-11** ✅ / updated | Phase 2C を 1 batch で land するか、 staged batch で land するか | **CONFIRMED: Staged batches**: Phase 2C-0 (Raw Idea → Idea Development Package) / 2C-1 (Content Idea create) / 2C-2 (Generation Package creation) / 2C-3 (Generated Output import) / 2C-4 (`platformOutput` creation) / 2C-5 (E2E smoke test)。Publish Status / Revision は Phase 2B-4 / later publishing management。 |
| **Q-2C-12** ✅ | product mode roadmap: no-API / local CLI / API / hybrid の優先順位 | **CONFIRMED: Product mode roadmap**: MVP = manual copy/paste + local CLI command display → next = local bridge → later = API automation → eventually = hybrid mode。 No-API を完遂してから API 検討、 boss が「API がないと回らない」 と判断した時点で API mode 開始 |
| **Q-2C-13** ✅ | storage mode roadmap: Sanity / Obsidian-local / hybrid | **CONFIRMED: Storage mode roadmap**: MVP = Sanity operating database → later = Local Markdown / Obsidian-native mode → eventually = Hybrid storage mode。 boss が「Sanity-only では limit が出た」 と判断した時に再 audit |

---

## 14. Relationship to Phase 2B-4

| Layer | Phase 2B-4 (publish/revision) | Phase 2C (end-to-end orchestration) |
|---|---|---|
| Stage 0-A〜0-E (Raw Idea → contentIdea) | (out of scope) | ✅ 本 spec primary |
| Stage 1 (Campaign creation) | (out of scope) | ✅ MVP は Studio 補助のみ |
| Stage 2 (Output configuration) | (out of scope) | ✅ /configurator 既存 + Phase 2C-2 |
| Stage 3 (Generation package) | (out of scope) | ✅ Phase 2C-2 |
| Stage 4 (Local generation) | (out of scope) | ✅ Phase 2C-2 + 2C-3 (boss manual + import) |
| Stage 5 (Output import) | (out of scope) | ✅ Phase 2C-3 |
| **Stage 6 (Revision)** | ✅ `updatePlatformOutputStatus` で定義 | Phase 2B-4 委譲 (重複定義しない) |
| **Stage 7 (Visual usage)** | ✅ `updateVisualAssetStatus` で定義 | Phase 2B-4 委譲 (重複定義しない) |
| **Stage 8 (Manual publish record)** | ✅ `updateManualPublishStatus` で定義 | Phase 2B-4 委譲 (重複定義しない) |
| Stage 9 (Reaction) | (out of scope) | Phase 2B-1 既存 (Phase 2C で touch なし) |

**重複しない**: Phase 2B-4 の 3 server action + UI 設計は本 spec では cross-reference のみ、 Phase 2B-4 spec の §6 / §7 をそのまま採用。 Phase 2C は **「2B-4 の前段」 を担う orchestration layer**。

---

## 15. Acceptance criteria (Phase 2C 全体 = 2C-0 + 2C-1 + 2C-2 + 2C-3 + 2C-4 + 2C-5 land 後)

各 sub-batch ごとに individual smoke は分離、 ここでは **end-to-end smoke** (Phase 2C-5) を定義:

15 項目 smoke checklist:

1. **Build**: `cd dashboard && npm run build` で全 routes green、 TypeScript clean (Phase 2C-0 land 後の routes 数 = 既存 + new sub-route)
2. **Default behavior** (writeReady=false / enableLocalFsRoutes=false): 全 Phase 2C edit surface が disabled、 read-only display 完全維持
3. **Raw Idea creation**: `/knowledge` tab 2 で rough idea を入力 → `idea-jobs/<slug>/_raw.json` 確認 (filesystem read で boss が verify)
4. **Idea development package**: 「AI 企画化 prompt を作る」 button → 4 ファイル (`prompt.md` / `job.json` / `result.md` 空 / `result.json` optional) 確認
5. **Manual AI wall-bouncing**: boss が ChatGPT / Claude Code / Codex で result.md を完成 (dashboard touch なし、 boss confirm only)
6. **Import idea result**: 「結果を取り込む」 → result.md preview 表示、 「Studio で contentIdea を作る」 deeplink が動く
7. **Structured Content Idea**: Studio で contentIdea を new create + rawInput / coreThesis / claims 等を AI 結果から埋める、 Sanity Studio で確認
8. **Campaign creation**: Studio で campaignPlan を new create、 `sourceContentIdea` ref で接続、 dashboard `/campaigns/<slug>` で表示確認
9. **Generation package**: `/configurator` で「Generate Prompt Package」 → `generation-jobs/<contentIdeaSlug>/<platform>/<ts>/prompt.md` 確認
10. **Local generation**: boss が Claude Code / Codex で生成 → `outputs/generated/<campaignSlug>/<platform>/<ts>.md` 確認
11. **Output import**: `/outputs` で「import」 → preview → Studio で platformOutput new create
12. **Publish status (Phase 2B-4 経由)**: `/publish` で state / publishedUrl / publishedAt 編集
13. **Revision marking (Phase 2B-4 経由)**: platformOutput.status: revised + reviewNotes
14. **Visual usage marking (Phase 2B-4 経由)**: visualAssetPlan.status: archived + reviewNotes
15. **Reaction recording (Phase 2B-1 既存)**: 24h+ 後に reactionNotes 編集
16. **Token / leak audit**: `.next/static/chunks/*.js` に SANITY_WRITE_TOKEN 値が出ない、 reviewNotes / 本文 が出ない
17. **No regression**: Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変
18. **No external API call**: browser DevTools network tab で外部 LLM API (api.openai.com / api.anthropic.com 等) への通信 0 件
19. **No production write**: NODE_ENV=production では write 全 disabled
20. **Sanity schema 不変**: `schemas/` に diff なし (全 Phase 2C sub-batch 通じて)

---

## 16. Implementation staging (CONFIRMED Q-2C-11)

1 batch で land すると規模過大のため、 **5 batch + 1 smoke batch** に分割 (boss confirmed handoff/0197):

### Phase 2C-0 — Raw Idea → Idea Development Package → Structured Content Idea promote (filesystem + Studio deeplink)

スコープ:
- `/knowledge` tab 拡張 (Raw Ideas + In Development tabs)
- raw idea filesystem write (`idea-jobs/<slug>/_raw.json`)
- idea development package 4 ファイル書き出し
- idea result import (preview only)
- Studio deeplink + clipboard copy で contentIdea promote 補助

新規 ~9 + 更新 ~3 = ~12 ファイル変更。 1 PR 完結。

### Phase 2C-1A / 2C-1B — Structured Content Idea promote + controlled create

スコープ:
- `/ideas` In Development list から schema-aligned `contentIdea` draft を準備
- Phase 2C-1A: Studio handoff + clipboard fallback
- Phase 2C-1B: `createContentIdeaFromResult` controlled server action
- deterministic `_id = contentIdea.<slug.current>`
- duplicate by `_id` / `slug.current` は block
- `campaignPlan` / `platformOutput` / `publishedOutput` は作らない

Phase 2C-1B は boss smoke PASS。`/ideas` の既存 job `obsidian-ai-sanity-3 / 20260521-124748` から Preview create / Execute create / duplicate block / contentIdea Studio URL (`/structure/content-ideas-hub;content-ideas-all;<documentId>`) まで確認済み。Sanity schema は不変、2C-1B は `contentIdea` だけを作成し、`campaignPlan` / `platformOutput` / `publishedOutput` は作らない。

### Phase 2C-2 — Generation Prompt Package (filesystem write)

スコープ:
- `/configurator` 拡張 — Generate Prompt Package button + preview
- `generation-jobs/<contentIdeaSlug>/<platform>/<ts>/prompt.md + job.json` 書き出し
- local CLI command 表示

Implemented in handoff/0207 and boss smoke PASS recorded in handoff/0208. This batch does not create `campaignPlan`, `platformOutput`, or `publishedOutput`, and does not write to Sanity. Generated text / visual-brief can be manually produced by ChatGPT / Claude / Codex; Generated Output Import remains Phase 2C-3.

### Phase 2C-3 — Generated Output Import (filesystem read/write, no Sanity write)

スコープ:
- `/configurator` 拡張 — recent generation jobs list + paste/import panel
- `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md + job.json` がある job を read
- pasted generated output を parse / preview
- `draft.md` always write、 `draft.json` は structured data / frontmatter / fenced JSON / full JSON を検出した場合のみ write
- no Sanity write、 no platformOutput create

Implemented in handoff/0209, Import UX smoke fix landed in handoff/0211, and boss smoke PASS recorded in handoff/0212. Boss confirmed markdown-only output saved to `generation-jobs/obsidian-ai-sanity/note/20260522-114149/draft.md`; `draft.json` was not created because no structured JSON/frontmatter was detected. This batch does not create `campaignPlan`, `platformOutput`, or `publishedOutput`, and does not write to Sanity.

Important Phase 2C-4 note: the smoke job platform was `note`, while heuristic detected sections included `thread-posts`. This is acceptable in Phase 2C-3 because the phase only persists generated markdown. Phase 2C-4 must not blindly trust detected sections; it should use `job.json` / generation job platform metadata as the source of truth for platformOutput creation.

### Phase 2C-4 — draft.md → platformOutput creation

Implemented in handoff/0213, Studio URL fix landed in handoff/0215, and boss smoke PASS recorded in handoff/0216.

スコープ:
- `/configurator` 拡張 — selected generation job の saved `draft.md` から `platformOutput` create preview
- `job.json` / generation job metadata を platform / outputType / contentIdeaSlug の source of truth とする
- `draft.md` を `platformOutput.draftBody` に格納
- deterministic `_id = platformOutput.<contentIdeaSlug>.<platform>.<timestamp>`
- duplicate by `_id` / `localOutputPath` は block
- `status = drafted`、 `contentStatus = draft`
- `sourceContentIdea` ref を設定
- `generatedFromPrompt` ref は既存 `prompt` doc を解決できる場合のみ設定。解決不能なら create を block し、 schema-required field として UI に表示する

Phase 2C-4 は `campaignPlan` / `publishedOutput` を作らず、 `manualPublishingStatus` も変更しない。公開操作・公開URL記録・revision marking は Phase 2B-4 / later publishing management の責務。

Boss smoke confirmed `platformOutput.obsidian-ai-sanity.note.20260522-114149` was created from `generation-jobs/obsidian-ai-sanity/note/20260522-114149/draft.md`; `sourceContentIdea`, `draftBody`, `status = drafted`, `contentStatus = draft`, and `generatedFromPrompt` are populated. Duplicate create is blocked. Studio link opens `/structure/by-type;by-type-platformOutput;platformOutput.obsidian-ai-sanity.note.20260522-114149`.

### Phase 2C-5 — End-to-End smoke (docs-only)

Phase 2C-0〜2C-4 land 後、 boss が §11 試運転 step-by-step を実施 → smoke PASS を docs に記録:
- spec headers status update (planning → implemented + smoke PASS)
- parent spec §0.5 Implementation status update (5 行追加)
- devlog + handoff 1 ペア

docs-only batch。

### 全 Phase 2C 累計 (smoke 含む) 規模

新規 ~23 + 更新 ~10 = **~33 ファイル変更** (smoke を含む)。 Phase 2B 4 sub-batch の累計 (~30 ファイル) より少し大きい。

---

## 17. Environment variables

新規 env var **なし**。 Phase 2B 全 sub-batch で確立した 3 つを再利用:

- `ENABLE_WRITE_ACTIONS=true` (Phase 2B 共通 master switch、 Phase 2C でも要求)
- `SANITY_WRITE_TOKEN=<editor-role-token>` (Phase 2B-4 委譲 server action のみで要求、 Phase 2C 固有 server action では不要 — Phase 2C MVP は doc create を dashboard でしない原則)
- `ENABLE_LOCAL_FS_ROUTES=true` (Phase 2B-3 で確立、 Phase 2C-0 / 2C-2 / 2C-3 で filesystem read/write に必須)

Vercel 設定契約は不変: 3 env のいずれも production / preview / development scope に **絶対設定しない**。

外部 LLM API key (OPENAI_API_KEY / ANTHROPIC_API_KEY 等) は **dashboard が要求しない**、 設定もしない。 boss の Claude Code / Codex / ChatGPT は dashboard と独立に動く。

---

## 18. Test plan

### 18-1. Manual smoke (boss が確認、 Phase 2C-5 で実施)

§11-2 step 1〜11 をすべて実行、 §15 acceptance criteria 20 項目すべて green。

### 18-2. Negative tests (各 Phase 2C sub-batch で実施)

| シナリオ | 期待結果 |
|---|---|
| raw idea slug が空 / 不正文字 | `validation` reject |
| idea-jobs/<slug>/ が absolute path | `path-not-allowed` reject |
| idea-jobs/../etc/passwd 等 traversal | `path-not-allowed` reject |
| `.exe` / `.sh` 等の禁止拡張子 | `extension-not-allowed` reject |
| 200 KB 超の roughMemo | `validation` reject (size cap) |
| `idea-jobs/<slug>/_raw.json` が既に存在 | `conflict` reject (overwrite confirm 必要) |
| `enableLocalFsRoutes=false` で write 試行 | `disabled` reject |
| `NODE_ENV=production` で write 試行 | `disabled` reject (Vercel 設定不変 + production write 永久 disabled) |

### 18-3. Token / log audit

- `.next/static/chunks/*.js` で `SANITY_WRITE_TOKEN` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` value が出ない
- server stdout で `[createRawIdea:execute-ok]` 等の metadata log は出るが、 roughMemo 本文 / prompt 本文 は出さない
- 外部 LLM API への通信が network 上で **0 件** (browser DevTools network tab + server log で verify)

---

## 19. Post-spec next step

Phase 2C spec is **finalized + Q-2C-1〜Q-2C-13 CONFIRMED** (handoff/0197)。 Current staged implementation status:

1. **Phase 2C-0 implementation batch** ✅ boss smoke PASS
2. **Phase 2C-0.1 implementation batch** ✅ boss smoke PASS
3. **Phase 2C-1A / 2C-1B implementation batches** ✅ boss smoke PASS
4. **Phase 2C-2 implementation batch** ✅ boss smoke PASS (Generation Prompt Package、 handoff/0207 + 0208)
5. **Phase 2C-3 implementation batch** ✅ boss smoke PASS (Generated Output Import、 handoff/0209 + 0211 + 0212)
6. **Phase 2C-4 implementation batch** ✅ boss smoke PASS (`draft.md` → controlled `platformOutput` create、 Studio URL fix、 handoff/0213 + 0215 + 0216)
7. **Phase 2C-5 E2E smoke batch** ✅ PASS after UX polish (docs-only plan + audit + guided workflow approval、 handoff/0217 + 0223 + 0225)
8. **Phase 2C-6 Visual Brief Extraction + visualAssetPlan Creation** ✅ boss smoke PASS (handoff/0219 + 0222)
9. **Phase 2C-UX guided workflow polish** ✅ boss smoke PASS (handoff/0224 + 0225)

Current Phase 2C status map:

- 2C-0: ✅ PASS
- 2C-0.1: ✅ PASS
- 2C-1A: ✅ PASS
- 2C-1B: ✅ PASS
- 2C-2: ✅ PASS
- 2C-3: ✅ PASS
- 2C-4: ✅ PASS
- 2C-5: ✅ PASS after UX polish
- 2C-6: ✅ PASS
- 2C-UX: ✅ PASS

Phase 2C E2E is marked **PASS after UX polish**. `/ideas` and `/configurator` are now guided workflow screens at a sufficient level for continued product development. This approval is a high-level boss UX approval, not a pixel-perfect UI audit.

Phase 2C 全完了後、 boss judgement で:
- **Phase 2C-X**: schema 追加 (rawIdea / ideaDevelopmentJob / generationJob / outputRevision / publishedOutput 拡張 等)
- **Phase 2C-Y**: Local bridge mode (dashboard が Claude Code / Codex を spawn)
- **Phase 2D**: API automation mode (OpenAI / Anthropic API integration)
- **Phase 別**: Obsidian sync / Hybrid storage mode 等

Phase 2B-4 と Phase 2C の interleaving:
- Phase 2C-4 は saved generation draft を Sanity `platformOutput` に保存するところまで。
- Phase 2B-4 / later publishing management は revision marking、manual publish status、visual usage、published URL 記録を握る。
- recommended next strategic choices: Phase 2B-4 / publishing management continuation、 campaignPlan creation / campaign orchestration、 Visual Review / Visual Register refinement、 or Phase 2D API automation only if explicitly approved.
