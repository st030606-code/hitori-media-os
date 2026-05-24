# Phase 2C spec — End-to-End No-API Publishing Workflow with Raw Idea incubation

日付: 2026-05-21

## 背景

Phase 2B 全 4 sub-batch (2B-1 / 2B-2 / 2B-3 / 2B-3.1) すべて smoke PASS で完了、 Visual flow が「complete for now」 milestone に到達 (handoff/0194)。 Phase 2B-4 (Publish Status + Output Revision Workflow) は planning spec として land (handoff/0195)。

boss が次 strategic direction として **「dashboard で 1 つの real publishing loop を頭から尻尾まで完結させたい」** という要件を提示。 これは Phase 2B が部分 surface ごとに write 機能を整えてきたのを超え、 **end-to-end workflow を統合する layer** が必要。

Important product insight (boss-stated):
- 出発点は完成した contentIdea ではなく **rough human idea** (1 行メモ / Obsidian の走り書き / 会話ログ)
- boss は ChatGPT / Claude Code / Codex を **wall-bouncing partner** として使い、 idea を構造化 contentIdea に育てる
- dashboard が 思考 / 育成 / 構造化 / 生成 / 公開 / 反応 の全 stage を orchestrate するが、 **AI 自身は手動で動かす** (No-API)
- 「dashboard が AI を呼ぶ」 ではなく「dashboard が **AI と boss の work between them を orchestrate**」 する architecture

## 決定・変更

### 新規 (1 spec)

- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` (19 セクション、 planning spec、 docs-only / no implementation / no schema change / no Sanity write / no API integration)

### Phase 2C の中心戦略: No-API + Sanity-only operating mode + filesystem-only raw idea

Phase 2B 全 sub-batch + 2B-4 で確立した「schema 不変原則」 + 「dashboard が doc create しない (Q-2B3.1-7)」 を Phase 2C でも踏襲、 加えて新原則として:

1. **No API**: dashboard が OpenAI / Anthropic / 他有料 LLM API を叩かない、 boss が ChatGPT / Claude Code / Codex を local/manual で動かす
2. **Filesystem-only raw stage**: rough idea は Sanity に入れず `idea-jobs/<slug>/_raw.json` に保存、 promote 時に Studio で contentIdea を new create
3. **Studio deeplink + clipboard pattern**: doc create が必要な操作 (contentIdea / campaignPlan / platformOutput) は dashboard が **Studio deeplink** + 必要 field の **clipboard copy** で boss を補助、 doc create 自体は Studio で行う

### Product positioning (本 spec §2 で明文化)

| OS | 役割 |
|---|---|
| **Obsidian** | 思考 OS — rough memo / research / backlinks / wall-bouncing 前段 |
| **Sanity** | operating database — 構造化済の publishable material のみ |
| **Claude / Codex / ChatGPT** | 生成 / 作業 agent — boss が手動で動かす |
| **Dashboard** | workflow UI / orchestrator — 3 OS を boss が行き来する surface |

### Future modes (documented, not all implemented)

**Product mode roadmap**:
- ✅ Manual copy/paste mode (MVP default)
- ✅ Local CLI mode (MVP option、 command 表示のみ、 shell execution しない)
- 🔜 Local bridge mode (Phase 2C-Y 候補、 boss approval 後)
- 🔜 API automation mode (Phase 2D 候補)

**Storage mode roadmap**:
- ✅ Sanity-only operating mode (MVP default)
- 🔜 Local Markdown / Obsidian-native mode (別 Phase)
- 🔜 Hybrid storage mode (Phase 2C-Z 候補)

### 10 stage end-to-end workflow

Phase 2C は dashboard workflow を以下 10 stage に整理:

```
Stage 0: Raw Idea incubation
  0-A. Raw Idea input (filesystem-only)
  0-B. Idea Development Package (filesystem write、 4 ファイル)
  0-C. Local AI wall-bouncing (boss manual、 dashboard 不介入)
  0-D. AI Idea Result expected schema (markdown + optional JSON、 12 field)
  0-E. Structured Content Idea save (Studio deeplink + clipboard)
Stage 1: Campaign creation (Studio で manual create + dashboard deeplink 補助)
Stage 2: Output configuration (/configurator 既存)
Stage 3: No-API generation package (filesystem write)
Stage 4: Local generation execution (boss manual)
Stage 5: Output import (filesystem read + Studio deeplink)
Stage 6: Revision workflow (Phase 2B-4 委譲)
Stage 7: Visual decision (Phase 2B-4 委譲)
Stage 8: Manual publishing record (Phase 2B-4 委譲)
Stage 9: Reaction recording (Phase 2B-1 既存)
```

### Data model audit (本 spec §4 で完全 inventory)

主要発見:
- **`contentIdea.rawInput`** field が既に存在 (text rows:6、 schema 上「未整理メモ、 Obsidian メモ、 会話ログ」 と documented) ← Phase 2C MVP で rawInput 流用可能
- ただし contentIdea には **7 field 必須** (`title` / `summary` / `coreThesis` / `audience` / `audiencePain` / `claims` / `tone` / `platformAngles`)、 rough idea 段階で contentIdea を作れない
- → **§5 で 3 path 比較**: Path A (filesystem-only raw、 contentIdea 流用 schema 不変) / Path B (validation 緩和、 schema 変更) / Path C (rawIdea doc 新設、 schema 変更)
- **MVP は Path A 採用**: schema 不変原則維持、 raw idea は filesystem-only、 promote 時に Studio で contentIdea を boss が new create

### Open questions (Q-2C-1 〜 Q-2C-13、 13 件)

|  | 質問 | 推奨 |
|---|---|---|
| Q-2C-1 | schema change を本 batch / Phase 2C 系で行うか | **No-schema MVP first** |
| Q-2C-2 | rawIdea doc type を作るか、 contentIdea 流用か | **filesystem-only (Path A)** |
| Q-2C-3 | generationJob doc を作るか | **filesystem-only** |
| Q-2C-4 | 実際に投稿した text の primary source of truth | **MVP では Sanity に保存しない** (Phase 2B-4 と整合) |
| Q-2C-5 | visualUsage を `archived` 流用か新 enum か | **`archived` 流用** (Phase 2B-4 と整合) |
| Q-2C-6 | local AI execution method | **Manual copy/paste + CLI command 表示の 2 mode** |
| Q-2C-7 | dashboard が local file を write してよいか | **Yes, strict allowlist** (Phase 2B-3 pattern) |
| Q-2C-8 | import generated output が platformOutput doc を作るか | **MVP では作成しない** |
| Q-2C-9 | publish 時に publishedOutput doc を作るか | **MVP では作成しない** |
| Q-2C-10 | 試運転 raw idea を何にするか | boss judgement (本物推奨) |
| Q-2C-11 | Phase 2C を 1 batch / staged | **Staged (Phase 2C-0〜2C-5)** |
| Q-2C-12 | product mode roadmap 優先順位 | **MVP = manual + CLI、 next = Local bridge → API → Hybrid** |
| Q-2C-13 | storage mode roadmap | **MVP = Sanity-only、 Local/Obsidian/Hybrid は別 Phase** |

### Phase 2C implementation staging (§16 で詳述)

5 batch + 1 smoke batch:
1. **Phase 2C-0**: Raw Idea + Idea Development Package (~12 ファイル)
2. **Phase 2C-1**: Campaign creation 補助 (~3 ファイル)
3. **Phase 2C-2**: Generation Prompt Package (~5 ファイル)
4. **Phase 2C-3**: Generated Output Import (~4 ファイル)
5. **Phase 2C-4**: Publish / Revision (= Phase 2B-4 implementation、 9-10 ファイル)
6. **Phase 2C-5**: End-to-End smoke (docs-only)

合計 ~33 ファイル変更。 1 batch land だと過大、 5 batch + 1 smoke に分けて段階 land。

### Relationship to Phase 2B-4

Phase 2C は publish/revision/visual usage layer を Phase 2B-4 に **完全委譲**、 重複定義しない:
- Stage 6 (Revision) = Phase 2B-4 `updatePlatformOutputStatus`
- Stage 7 (Visual usage) = Phase 2B-4 `updateVisualAssetStatus`
- Stage 8 (Publish record) = Phase 2B-4 `updateManualPublishStatus`

Phase 2B-4 spec §6 / §7 をそのまま採用、 Phase 2C は **「2B-4 の前段」** を担う orchestration layer。

### 新規 docs (3)

- `docs/devlog/0185-phase-2c-end-to-end-no-api-publishing-workflow-spec.md` (本ファイル)
- `docs/handoff/0196-phase-2c-end-to-end-no-api-publishing-workflow-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ「No API」 を Phase 2C の中心原則にするか

CLAUDE.md の指示「明示的に依頼されるまで API 連携を追加しない」 と整合 — boss はまだ:
- 「どの LLM API が一番 idea 育成に向くか」 を実験中 (ChatGPT vs Claude vs Codex で結果が違う)
- 「API 課金が dashboard に流れる architecture」 が boss workflow に合うか未確定
- 「dashboard が API token を保持する」 risk surface を増やしたくない

→ MVP は dashboard が AI を呼ばない、 boss が手動で AI agent を切り替えながら使える state を維持。 boss が「API がないと回らない」 と判断した時点で Phase 2D を起こす。

加えて design discipline 観点:
- dashboard を「**orchestrator / record-keeper**」 として位置付け、 「generation engine」 にしない
- 生成は agent (boss + Claude/Codex/ChatGPT) の責務、 dashboard は context / package / record の責務
- 役割分離が明確 → bug / spec / safety review が個別 layer に閉じる

### なぜ Obsidian を product positioning で documented するか

boss workflow を観察すると:
- rough idea は Obsidian で生まれる (markdown / backlinks の自由さ)
- structured material は Sanity に入る (operating queries / refs / status enum)
- 生成 / wall-bouncing は Claude/Codex/ChatGPT (会話 + 試行錯誤)
- publish 操作 / record は dashboard (workflow 可視化)

これら 4 OS を「**1 OS で全部やる**」 と product が boring + 巨大化する。 boss が **役割分業した OS スタック** を意識的に保つことが Hitori Media OS の design ethic。 §2 で「Obsidian = 思考 OS / Sanity = operating DB / Claude/Codex = 生成 agent / Dashboard = orchestrator」 という position を明文化することで:
- Phase 2C が「Obsidian + AI を dashboard が代替する」 という方向に流れない
- 将来 Obsidian sync / hybrid storage の検討が「機能追加」 ではなく「architectural addition」 として議論可能

### なぜ Path A (filesystem-only raw) を MVP で採用するか

3 path の trade-off:
- **Path A (filesystem-only raw + contentIdea 流用)**: schema 不変、 「Sanity = structured material のみ」 原則維持、 raw stage で実験可
- **Path B (validation 緩和)**: 既存 contentIdea doc に schema 変更必要、 影響範囲広い、 既存 doc が required で書かれている → migration / Studio warning 発生
- **Path C (rawIdea doc 新設)**: schema 追加必要、 検索 / 一覧の力が増える、 ただし MVP で本当に必要か未検証

MVP 段階で **Path A** が:
- schema 不変原則 (Phase 2B 全 sub-batch + 2B-4 で貫徹) と整合
- boss が「filesystem-only で運用してみる → 限界が見えたら Path C に昇格」 という安全な experimental path
- 「Sanity 内に未完成の material が散らばらない」 という Sanity 衛生を維持

→ Path A 採用、 Path C は Phase 2C-X 候補として §7 で propose。

### なぜ Phase 2B-4 を完全委譲するか

Phase 2C を spec 化するに当たって、 publish / revision / visual usage を **重複定義しない** が重要:

- Phase 2B-4 が既に 16 セクション spec として land 済 (handoff/0195)
- 同じ 3 server action を Phase 2C で再定義すると spec が二重になり、 boss が「どちらに最新仕様があるか」 を毎回判断する必要が出る
- Phase 2C は「2B-4 の前段」 を担う orchestration layer と位置付け、 publish 以降は cross-reference のみ

§14 で Stage → spec mapping を table 化、 Phase 2B-4 と Phase 2C が「同じ層に重複する」 ことを防ぐ。

### なぜ schema 追加を「propose only」 で本 batch では実装しないか

§7 で 8 つの schema addition 候補 (新 doc type 4 + 既存拡張 4 群) を **list するに留める**:
- `rawIdea` doc type (最も意義大、 ただし MVP で filesystem 限界を実証してから)
- `ideaDevelopmentJob` doc type
- `generationJob` doc type
- `outputRevision` doc type
- `contentIdea.developmentNotes` / `ideaSource` / `importedAIResult` / `provenance`
- `platformOutput.localPromptPackagePath` / `generatedFilePath` / `generationSource`
- `publishedOutput.actualPublishedText` 系 7 候補 (Phase 2B-4 §5-1 と整合)
- `manualPublishingStatus[].publishNotes`

理由:
1. Phase 2B 全 sub-batch + 2B-4 + 2C で「schema 不変原則」 を貫徹、 schema 変更は別 spec batch + boss confirmation を要する design discipline
2. MVP (no schema change) で workflow の 60-70% カバーを実証してから残り 30-40% を schema 追加で埋める
3. schema 変更は migration / 再 validation / Studio との整合確認 / 既存 doc への影響評価が膨らむ
4. boss が「filesystem-only では検索 / 一覧が limit」 と判断した時点で Phase 2C-X 起こす

### なぜ staged implementation (5 batch + 1 smoke) を推奨するか

§16 で staging 推奨理由:
- 1 batch land だと新規 ~14 ファイル + 更新 ~5 で過大、 review / smoke 摩擦が大
- Phase 2C-0 (Raw Idea + Idea Dev) だけで boss が「workflow 前段の手応え」 を verify 可能
- Phase 2C-1 / 2C-2 / 2C-3 は各 batch で独立 smoke、 1 PR 完結
- Phase 2C-4 は Phase 2B-4 implementation に被るので、 そちらの batch として land (2C-4 を独立 batch にすると重複)
- Phase 2C-5 (E2E smoke) で全 sub-batch land 後の milestone を docs-only で記録

Phase 2B 4 sub-batch で確立した「spec → confirmation → implementation → smoke fix → smoke PASS」 5 段 lifecycle を Phase 2C 各 sub-batch でも踏襲。

### なぜ「観察 vs 編集 surface 分離」 を Phase 2C 全体で踏襲するか

Phase 2B-2 で確立した原則 (`/human-review-gates` のみ編集可、 他は read-only) を Phase 2C 各 stage でも踏襲:
- Stage 0 (Raw Idea + Idea Dev): `/knowledge` tab 2 / 3 で集中編集
- Stage 3 (Generation Package): `/configurator` で集中編集
- Stage 5 (Output Import): `/outputs` で集中編集
- Stage 6-8 (Publish/Revision/Visual): `/publish` で集中編集 (Phase 2B-4)
- Stage 9 (Reaction): `/analytics` で集中編集 (Phase 2B-1)

`/campaigns/[slug]` は全 stage の「観察 / navigation hub」 として read-only 維持。 これにより:
- 各 server action が 1 entry point から呼ばれる、 logic 重複ゼロ
- bug 予測 / spec 変更 / undo lifecycle が 1 page で完結
- boss が「ここで編集できる」 を即座に認識

## 影響

- リポジトリ:
  - `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` (新規 19 セクション)
  - `docs/devlog/0185-...` + `docs/handoff/0196-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - 次は boss が Q-2C-1〜Q-2C-13 (13 件 open question) を judgement
  - boss OK → Phase 2C Q 確定 microbatch (docs-only)
  - その後 → Phase 2C-0 implementation batch (~12 ファイル)、 段階的に 2C-1 / 2C-2 / 2C-3 / 2C-4 (= 2B-4 implementation) / 2C-5 (smoke)
- スキーマ: 不変 (MVP は no schema change、 Phase 2C-X で schema 追加 propose)
- プロダクト方針:
  - 「dashboard が orchestrator、 AI 実行は外部」 という No-API architecture を明文化
  - 「Obsidian = 思考 OS / Sanity = operating DB / Claude/Codex = agent / Dashboard = workflow UI」 という 4-OS positioning を明文化
  - dashboard が「rough idea → publish → reaction」 end-to-end をカバーする state へ漸進
  - schema 不変原則を Phase 2C でも貫徹 (`rawInput` field を活用、 raw stage は filesystem-only)
  - product mode / storage mode roadmap を documented (Phase 2D / 2C-Y / 2C-Z 候補)

## 次の一手

**Option A (推奨) — Phase 2C Q 確定 microbatch (docs-only)**

boss が Q-2C-1〜Q-2C-13 (13 件) に回答 → docs-only microbatch で spec を CONFIRMED 化:
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` の Q 表を「推奨」 → 「CONFIRMED」 書き換え
- `docs/specs/phase-2b-write-actions.md` §0.5 に Phase 2C 行追加 (Phase 2C-0〜2C-5 sub-batch tracking section)
- devlog + handoff 1 ペア

**Option B — Phase 2C-0 implementation batch (Q 確定後)**

Q 確定後に Phase 2C-0 (Raw Idea + Idea Development Package) を最小 batch で land:
- 新規 ~9 + 更新 ~3 = ~12 ファイル
- §15 acceptance criteria の step 3-6 で smoke
- 1 PR 完結

**Option C — Phase 2B-4 を先に Q 確定 → implementation**

Phase 2B-4 spec が既に planning status (handoff/0195)。 Phase 2C より先に Phase 2B-4 を Q 確定 + implement する方が、 Phase 2C-4 (publish/revision) の前提が固まる利点。 順序は boss judgement。

**Option D — 別 path に進む**

Phase 2C より優先度高い path (Phase 2B-2.1 gate reviewer / 2B-3.2 multi-asset / 2B-3.3 Visual Register retirement / 別 W) を選ぶ場合は本 spec を保留し別 batch へ。

発信ネタ案:
- 「dashboard を orchestrator として位置付ける design — No-API publishing workflow の architecture」
- 「3 OS を分業する Hitori Media OS — Obsidian 思考 / Sanity operating / Claude+Codex agent / Dashboard workflow」
- 「Raw idea → structured contentIdea の 5 stage incubation — wall-bouncing partner としての AI」
- 「filesystem-only raw stage という design discipline — Sanity 内を structured material だけに保つ」
- 「Phase 2C を 5 sub-batch + 1 smoke に分けた staging 戦略 — Phase 2B 4 sub-batch の cadence を踏襲」
- 「Studio deeplink + clipboard copy という補助 UI pattern — doc create を dashboard でしない原則の応用」
- 「product mode roadmap (manual → CLI → bridge → API) を spec に書く理由 — 未来の API integration の議論を今から構造化」
