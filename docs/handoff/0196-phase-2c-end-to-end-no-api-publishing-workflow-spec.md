# Handoff: Phase 2C spec — End-to-End No-API Publishing Workflow (with Raw Idea incubation)

Date: 2026-05-21

## 1. Task Goal

Phase 2B 全 4 sub-batch (2B-1 / 2B-2 / 2B-3 / 2B-3.1) すべて smoke PASS、 Visual flow「complete for now」 milestone 到達 (handoff/0194)、 Phase 2B-4 spec planning land (handoff/0195) を踏まえ、 boss が次 strategic direction として **dashboard で 1 つの real publishing loop を頭から尻尾まで完結させる** end-to-end orchestration layer の spec 化を指示。

重要な product insight (boss-stated):
- 出発点は完成した contentIdea ではなく **rough human idea** (1 行メモ / Obsidian の走り書き / 会話ログ)
- boss は ChatGPT / Claude Code / Codex を **wall-bouncing partner** として使い、 idea を structured contentIdea に育てる
- dashboard は orchestrator、 AI 実行は外部 (boss が手動)
- 「No API first」: dashboard が OpenAI / Anthropic / 他有料 LLM API を叩かない
- product 将来は **No-API + API automation の hybrid**、 storage は **Sanity + Obsidian + Hybrid** が future modes

現在 gap:
- rough idea を dashboard に保存する surface がない (CLAUDE.md step 1 が未対応)
- AI 企画化 prompt の package surface がない
- AI 企画化結果を取り込む surface がない
- 完成済 contentIdea を「正式 record」 として promote する pattern が未確立
- 生成 prompt package を local 出力する surface がない
- 生成結果を import する surface がない

本 batch は **docs-only spec 作成**、 implementation / schema change / Sanity write / API integration は一切行わない。

## 2. Constraints Followed

- ✅ Docs only、 runtime code 変更なし
- ✅ Sanity schema 変更なし、 schema additions は §7 で **propose only**
- ✅ Sanity 書き込みなし
- ✅ `dashboard/src/` touch なし
- ✅ `tools/visual-register/`, `tools/sanity/reflect-*.mjs` touch なし
- ✅ `assets/visuals/`, `assets/inbox/`, `patches/`, `publish-package/` 不変
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ deploy なし
- ✅ **No OpenAI / Anthropic / 他有料 LLM API** integration (Phase 2C MVP の中心原則)
- ✅ **No paid API keys 要求** (env var なし)
- ✅ Production writes 永久 disabled (本 spec が proposing する filesystem write も `enableLocalFsRoutes` + `enableWriteActions` の 2 段 gate)
- ✅ 23 routes 不変 (本 batch では build 不要、 handoff/0194 build artifact 継承)
- ✅ Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変
- ✅ Phase 2B-4 spec を **委譲** (重複定義しない、 cross-reference のみ)

## 3. Changed Files

### 新規 (1 spec)

- [docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md](docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md) — 19 セクション planning spec
  - §0 Confirmed decisions (inherited from parent + Phase 2B-4)
  - §1 Product goal (12 step real publishing loop)
  - §2 Product positioning — Sanity vs Obsidian vs AI (4 OS architecture)、 future modes
  - §3 Target workflow (10 stage end-to-end)
  - §4 Existing data model inventory (contentIdea / campaignPlan / platformOutput / publishedOutput / visualAssetPlan / prompt / workflow / tool + 不在 field list)
  - §5 Raw Idea / Idea Development data model — 3 paths 比較 (filesystem-only / validation 緩和 / rawIdea doc 新設)
  - §6 Minimum no-schema-change implementation (MVP) — Path A 採用
  - §7 Potential schema additions (propose only、 Phase 2C-X 候補) — 4 new doc types + 8 existing field 拡張
  - §8 Write surfaces — 10 server action 候補 (3 = Phase 2B-4 委譲)
  - §9 Local filesystem safety — path allowlist + extension allowlist + size cap + no shell exec
  - §10 UI design — `/knowledge` tab 拡張 + `/configurator` + `/outputs` + `/publish` (Phase 2B-4)
  - §11 MVP test scenario (試運転 raw idea 5 候補 + step-by-step 11 step)
  - §12 Scope exclusions (16 件明示)
  - §13 Open questions (Q-2C-1 〜 Q-2C-13、 13 件)
  - §14 Relationship to Phase 2B-4 (stage → spec mapping table、 重複定義しない)
  - §15 Acceptance criteria (20 項目 end-to-end smoke)
  - §16 Implementation staging recommendation (Phase 2C-0〜2C-5、 5 batch + 1 smoke)
  - §17 Environment variables (新規なし、 既存 3 つ再利用、 LLM API key 要求なし)
  - §18 Test plan (manual smoke + negative tests + token / API audit)
  - §19 Post-spec next step

### 新規 docs (3)

- [docs/devlog/0185-phase-2c-end-to-end-no-api-publishing-workflow-spec.md](docs/devlog/0185-phase-2c-end-to-end-no-api-publishing-workflow-spec.md)
- [docs/handoff/0196-phase-2c-end-to-end-no-api-publishing-workflow-spec.md](docs/handoff/0196-phase-2c-end-to-end-no-api-publishing-workflow-spec.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror of 0196)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

### 親 spec (`docs/specs/phase-2b-write-actions.md`) touch なし

本 batch では parent spec §0.5 Implementation status の更新は **行わない**。 Phase 2C が「planning」 status の間は parent §0.5 に row を追加せず、 Q 確定 microbatch で parent spec row 追加する pattern (Phase 2B-3 / 2B-3.1 / 2B-4 と同 pattern)。

## 4. Summary of Changes

### 4-1. Product positioning (本 spec §2): 4 OS architecture

| OS | 役割 | Phase 2C との関係 |
|---|---|---|
| **Obsidian** = 思考 OS | rough memo / research / backlinks / wall-bouncing 前段 | MVP は手動 copy 取り込み、 双方向 sync は別 Phase |
| **Sanity** = operating database | 構造化済の publishable material 専用 | Phase 2C MVP の primary record store |
| **Claude / Codex / ChatGPT** = 生成 agent | wall-bouncing partner / 生成 executor | boss が手動で動かす、 dashboard が API を呼ばない |
| **Dashboard** = workflow UI / orchestrator | 3 OS を boss が行き来する surface | Phase 2C 本体 |

### 4-2. Future product modes (本 spec §2-5、 documented for roadmap)

**Product mode**:
- ✅ Manual copy/paste mode (MVP default)
- ✅ Local CLI mode (MVP option、 command 表示のみ)
- 🔜 Local bridge mode (Phase 2C-Y 候補)
- 🔜 API automation mode (Phase 2D 候補)

**Storage mode**:
- ✅ Sanity-only operating mode (MVP default)
- 🔜 Local Markdown / Obsidian-native mode (別 Phase)
- 🔜 Hybrid storage mode (Phase 2C-Z 候補)

### 4-3. 10 stage end-to-end workflow (本 spec §3)

```
Stage 0: Raw Idea incubation
  0-A. Raw Idea input (filesystem-only `idea-jobs/<slug>/_raw.json`)
  0-B. Idea Development Package (4 ファイル書き出し)
  0-C. Local AI wall-bouncing (boss manual)
  0-D. AI Idea Result expected schema (12 field)
  0-E. Structured Content Idea save (Studio deeplink + clipboard)
Stage 1: Campaign creation (Studio + deeplink)
Stage 2: Output configuration (/configurator)
Stage 3: No-API generation package (filesystem write)
Stage 4: Local generation execution (boss manual)
Stage 5: Output import (filesystem read + Studio deeplink)
Stage 6-8: Phase 2B-4 委譲 (Revision / Visual / Publish)
Stage 9: Reaction (Phase 2B-1 既存)
```

### 4-4. Data model inventory key finding

- **`contentIdea.rawInput`** field が既に存在 (text rows:6、 「Obsidian メモ、 会話ログ、 記事アイデア」 schema 内に明記) ← Phase 2C MVP で活用可能
- ただし contentIdea には 7 field 必須 → rough stage で contentIdea を作れない、 §5 で 3 path 比較

### 4-5. Raw Idea handling — 3 paths (§5)

| Path | schema 変更 | Raw stage 場所 | MVP 採用? |
|---|---|---|---|
| **A. filesystem-only raw + contentIdea 流用** | 不要 | `idea-jobs/<slug>/_raw.json` | ✅ 採用 |
| B. validation 緩和 | 必要 | contentIdea draft state | ❌ |
| C. rawIdea doc type 新設 | 必要 | rawIdea Sanity doc | ❌ (Phase 2C-X 候補) |

### 4-6. MVP no-schema-change implementation (§6)

| Stage | dashboard mutation | Sanity write |
|---|---|---|
| 0-A Raw Idea | filesystem `idea-jobs/<slug>/_raw.json` write | none |
| 0-B Idea Dev Package | filesystem 4 ファイル write | none |
| 0-C AI wall-bouncing | (boss manual) | none |
| 0-D AI Idea Result | (boss が `result.md` を完成) | none |
| 0-E contentIdea save | Studio deeplink + clipboard copy のみ、 dashboard server action 0 件 | (boss が Studio で create) |
| 1 Campaign creation | Studio deeplink + clipboard copy のみ | (boss が Studio で create) |
| 2 Output config | `/configurator` 既存 | none |
| 3 Generation package | filesystem 2 ファイル write | none |
| 4 Local generation | (boss manual) | none |
| 5 Output import | filesystem read + Studio deeplink | (boss が Studio で create) |
| 6 Revision | Phase 2B-4 `updatePlatformOutputStatus` | Phase 2B-4 |
| 7 Visual usage | Phase 2B-4 `updateVisualAssetStatus` | Phase 2B-4 |
| 8 Publish record | Phase 2B-4 `updateManualPublishStatus` | Phase 2B-4 |
| 9 Reaction | Phase 2B-1 既存 | Phase 2B-1 |

**Phase 2C 固有 server action は 5 件** (filesystem-only):
- A. createRawIdea (`idea-jobs/<slug>/_raw.json`)
- B. createIdeaDevelopmentPackage (4 ファイル)
- C. importIdeaDevelopmentResult (filesystem read + preview)
- F. createGenerationJob (`generation-jobs/.../prompt.md + job.json`)
- G. importGeneratedOutput (filesystem read + Studio deeplink)

Sanity write を行う server action は **0 件** (全 Phase 2B-4 委譲)。

### 4-7. Local filesystem safety (§9)

Phase 2B-3 path safety pattern を踏襲:
- **Allowlist directories** (write 可): `idea-jobs/`, `generation-jobs/`, `outputs/generated/`, `publish-packages/campaigns/`
- **Extension allowlist**: `.md` / `.json` のみ
- **Reject patterns**: absolute path / `..` traversal / URL encoded traversal / null byte / 禁止拡張子
- **Size cap**: 200 KB / file
- **No shell execution** (`child_process` 使わない)
- **Atomic write** (write-temp + rename)

### 4-8. Implementation staging (§16)

5 batch + 1 smoke batch:
1. **Phase 2C-0** (Raw Idea + Idea Dev Package、 ~12 ファイル)
2. **Phase 2C-1** (Campaign creation 補助、 ~3 ファイル)
3. **Phase 2C-2** (Generation Prompt Package、 ~5 ファイル)
4. **Phase 2C-3** (Generated Output Import、 ~4 ファイル)
5. **Phase 2C-4** = Phase 2B-4 implementation batch (9-10 ファイル)
6. **Phase 2C-5** End-to-End smoke (docs-only)

合計 ~33 ファイル変更。 各 batch は 1 PR 完結。

### 4-9. Relationship to Phase 2B-4 (§14)

| Stage | Phase 2B-4 | Phase 2C |
|---|---|---|
| 0-A〜0-E | (out of scope) | ✅ |
| 1 (Campaign) | (out of scope) | ✅ (Studio 補助) |
| 2-5 (Output config 〜 Import) | (out of scope) | ✅ |
| **6 (Revision)** | ✅ updatePlatformOutputStatus | Phase 2B-4 委譲 |
| **7 (Visual usage)** | ✅ updateVisualAssetStatus | Phase 2B-4 委譲 |
| **8 (Publish record)** | ✅ updateManualPublishStatus | Phase 2B-4 委譲 |
| 9 (Reaction) | (out of scope) | Phase 2B-1 既存 |

Phase 2C は **「Phase 2B-4 の前段」** を担う orchestration layer、 重複定義しない。

### 4-10. Phase 2C 全体 acceptance criteria (§15) のハイライト

20 項目 smoke、 重要 3 項目:
- **No external API call**: browser DevTools network tab で外部 LLM API (api.openai.com / api.anthropic.com 等) への通信 **0 件**
- **No production write**: NODE_ENV=production では write 全 disabled
- **Sanity schema 不変**: `schemas/` に diff なし

## 5. Open Questions for Boss

Spec §13 にまとめた **Q-2C-1 〜 Q-2C-13** (13 件)。 推奨案は本 spec 全体の前提に組み込まれているが、 boss 判断で逆転可能:

| # | 質問 | 推奨 |
|---|---|---|
| Q-2C-1 | schema change を本 batch / Phase 2C 系で行うか、 no-schema MVP first か | **No-schema MVP first** |
| Q-2C-2 | rawIdea doc type を作るか、 contentIdea draft 流用か | **filesystem-only (Path A)** |
| Q-2C-3 | generationJob doc を作るか | **filesystem-only** |
| Q-2C-4 | 実際に投稿した text の primary source of truth | **MVP では Sanity に保存しない** |
| Q-2C-5 | visualUsage を `archived` 流用か新 enum か | **`archived` 流用** |
| Q-2C-6 | local AI execution method | **Manual copy/paste + CLI command 表示の 2 mode** |
| Q-2C-7 | dashboard が local file を write してよいか | **Yes, strict allowlist** |
| Q-2C-8 | import generated outputs が platformOutput doc を作るか | **MVP では作成しない** |
| Q-2C-9 | publish 時に publishedOutput doc を作るか | **MVP では作成しない** |
| Q-2C-10 | 試運転 raw idea を何にするか | boss judgement (本物推奨) |
| Q-2C-11 | Phase 2C を 1 batch / staged batch | **Staged (Phase 2C-0〜2C-5)** |
| Q-2C-12 | product mode roadmap 優先順位 | **MVP = manual + CLI、 next = bridge → API → hybrid** |
| Q-2C-13 | storage mode roadmap | **MVP = Sanity-only、 Local/Obsidian/Hybrid は別 Phase** |

加えて parent-level open questions (Q-4 audit-log / Q-5 reflect-*.mjs / Q-9 W7 promptTemplate) は本 batch では touch しない、 parent §6 tracking 継続。

## 6. Key Decisions

- **No-API を Phase 2C の中心原則に**: dashboard が OpenAI / Anthropic / 他有料 LLM API を叩かない、 boss が ChatGPT / Claude Code / Codex を local/manual で動かす、 product mode roadmap で「manual → CLI → bridge → API」 の漸進を documented
- **4 OS positioning を明文化**: Obsidian = 思考 OS / Sanity = operating DB / Claude+Codex+ChatGPT = 生成 agent / Dashboard = workflow orchestrator、 「dashboard が AI を呼ぶ」 ではなく「dashboard が boss と AI の work を orchestrate」 する architecture
- **MVP no-schema-change + Path A (filesystem-only raw)**: schema 不変原則 (Phase 2B 全 sub-batch + 2B-4 で貫徹) を Phase 2C でも踏襲、 rough idea は `idea-jobs/<slug>/_raw.json` で局所保存、 promote 時に boss が Studio で contentIdea を new create
- **Studio deeplink + clipboard pattern**: doc create が必要な操作 (contentIdea / campaignPlan / platformOutput) は dashboard が Studio deeplink + 必要 field 内容を clipboard copy する補助 UI のみ提供、 doc create 自体は Studio で行う (Q-2B3.1-7「dashboard が doc create しない」 原則を踏襲)
- **Phase 2B-4 完全委譲**: Stage 6 / 7 / 8 (Revision / Visual / Publish record) は Phase 2B-4 spec を re-import、 本 spec で重複定義しない
- **Staged implementation (5 batch + 1 smoke)**: Phase 2C-0〜2C-5 に分割、 1 batch land だと過大、 Phase 2B 4 sub-batch の cadence (~3〜4 sub-batch / 2-3 日) を踏襲
- **Filesystem safety = Phase 2B-3 pattern 踏襲**: path allowlist 4 dir / extension allowlist `.md` `.json` / size cap 200KB / no shell exec / atomic write
- **`/knowledge` tab を Raw Idea / In Development 拡張**: 既存 route を活用、 新 route 増設しない、 「観察 vs 編集 surface 分離」 原則を踏襲
- **Future modes documented but not implemented**: Local bridge mode (2C-Y) / API automation mode (2D) / Hybrid storage mode (2C-Z) / Obsidian-native mode (別 Phase) を roadmap として記録、 boss judgement で順序確定
- **本 batch では parent spec §0.5 を touch しない**: Phase 2C が「planning」 status の間は parent row 追加せず、 Q 確定 microbatch で追加 (Phase 2B-3 / 2B-3.1 / 2B-4 spec batch と同 pattern)

## 7. Human Review Questions

### Spec scope の review

1. 19 セクション + 5 batch staging は適切か? もっと縮めるべき / 拡張すべき箇所はあるか
2. No-API 原則を本 spec で明文化した方向で良いか? (Phase 2D で API 始める前提だが、 boss が「API いつから検討するか」 timeline に判断はあるか)
3. 4 OS positioning (Obsidian / Sanity / Claude+Codex / Dashboard) は boss が今後発信する material としても使える framing か? 他に押さえるべき OS / agent はあるか
4. Path A (filesystem-only raw) の trade-off は許容範囲か? Path C (rawIdea doc 新設) を MVP に含める方が boss workflow に近い可能性はあるか
5. Studio deeplink + clipboard pattern は実用に耐えるか? boss が「Studio を毎回開くのは面倒」 と感じる risk
6. Phase 2B-4 完全委譲の分離は適切か? Phase 2C 側で「自分の領域」 を持ちすぎないように切ったが、 反対意見はあるか

### Q 確定の優先順位

7. Q-2C-1〜Q-2C-13 の中で boss が **最も迷っている / 議論したい** 項目はどれか
8. 推奨案を全部採用してすぐ Q 確定 microbatch に進むか、 1-2 項目だけ深堀してから進むか
9. Q-2C-10 試運転 raw idea は本物を boss が出す方向で良いか (recommended)、 それとも過去 topic を rehash する方が smoke の確実性を優先するか

### 次 step の判断

10. 本 spec を read 後、 (a) Q 確定 microbatch、 (b) Phase 2B-4 を先に Q 確定 + implement、 (c) 別 path に switch のどれが優先か
11. Phase 2C-0 だけ先行 implement し、 残り 4 sub-batch は後でも良いか? それとも staged batch を順序通り進めるか
12. Phase 2C-X (schema 追加) を「いつ」 起こすかの基準は? (filesystem 限界が出たら / dataset 規模が増えたら / boss が「やはり Sanity にあった方が」 と感じたら)
13. product mode (Phase 2D = API integration) を「いつ」 起こすかの目安は? (Phase 2C 完了 + N 週間運用 / 特定 use case で No-API limit 到達 等)

## 8. Risks or Uncertainties

- **No-API 原則の boss 摩擦**: 「dashboard で prompt を作って agent に投げる」 が「dashboard で 1 click 生成」 より体験 friction が高い。 boss が manual copy/paste / CLI command を毎回踏むコストを許容できるかは実運用次第、 もし苦痛なら Phase 2D を早期に起こす
- **`/knowledge` tab UI 規模膨張**: 既存 contentIdea 一覧 + Raw Ideas + In Development の 3 tab は密度が高くなる。 「観察 vs 編集」 surface 分離原則を踏襲しつつ、 tab 切り替え cost を design で吸収できるか
- **Studio deeplink + clipboard の workflow continuity**: boss が dashboard ↔ Studio を頻繁に行き来する流れになる。 もし「Studio 開くのが面倒」 と感じたら Phase 2C-X (rawIdea doc / generationJob doc 新設) を早めに起こして dashboard 内で doc create を許可する path もある
- **filesystem-only raw stage の検索 / 一覧の力不足**: rough idea が 50+ 件積まれた段階で、 filesystem list 表示が limit になる可能性。 boss が「検索 / フィルタ / タグが欲しい」 と判断したら Phase 2C-X で `rawIdea` doc 新設
- **Phase 2C-4 と Phase 2B-4 の依存関係**: Phase 2C-3 land 後に Phase 2C-4 (= Phase 2B-4 implementation) を実行する順序が natural だが、 Phase 2B-4 が独立 batch で先に進む可能性もある (boss judgement)。 順序が乱れると Phase 2C E2E smoke が遅れる
- **AI Idea Result の format 統一が boss UX に効く**: §3 Stage 0-D で 12 field の expected schema を提示したが、 ChatGPT / Claude / Codex で結果 format が変わる risk あり。 prompt template の robustness が boss 摩擦の中心、 boss feedback で iterate
- **Phase 2C 累計 ~33 ファイル変更の review 負荷**: 5 batch + 1 smoke に分けても全体規模が Phase 2B 全 4 sub-batch (~30 ファイル) より少し大きい。 boss が「途中で他 path に switch したい」 と判断した時の sunken cost を意識
- **External LLM API への通信 0 件 verify 手段**: §15 acceptance criteria で「browser DevTools network tab で 0 件」 を要求するが、 ブラウザ拡張 / 別タブ / VPN 経由など boss workflow 全体での通信を verify する手段は限定的、 dashboard 内 network call だけが verify 対象
- **Obsidian sync の boss 期待値**: §2 で「思考 OS = Obsidian」 を明示したが、 実 sync の実装は別 Phase。 boss が「思考 OS と operating DB が分離しっぱなしで結局 dashboard でも書き直す」 摩擦を感じる可能性、 Phase 別 batch (Obsidian bridge / hybrid storage) を timeline で考えておく

## 9. Remaining Cleanup Candidates

本 spec が land 後、 まだ未着手:

- **Phase 2C-0**: Raw Idea + Idea Development Package implementation
- **Phase 2C-1**: Campaign creation 補助 implementation
- **Phase 2C-2**: Generation Prompt Package implementation
- **Phase 2C-3**: Generated Output Import implementation
- **Phase 2C-4**: Publish / Revision implementation (= Phase 2B-4 implementation)
- **Phase 2C-5**: End-to-End smoke (docs-only milestone)
- **Phase 2C-X**: schema 追加 (rawIdea / ideaDevelopmentJob / generationJob / outputRevision doc types + existing 拡張)
- **Phase 2C-Y**: Local bridge mode (dashboard が Claude Code / Codex を spawn、 boss approval 後)
- **Phase 2C-Z**: Hybrid storage mode (Sanity + local markdown 併用)
- **Phase 2D**: API automation mode (OpenAI / Anthropic API integration、 別 spec batch)
- **Phase 別**: Obsidian sync / Local Markdown / Obsidian-native modes
- **Phase 2B-2.1**: gate reviewer / notes / completedAt 編集
- **Phase 2B-3.2**: multi-asset reflect / publish-package auto / CLI status indicator
- **Phase 2B-3.3**: Visual Register retirement (share library extraction)
- **Phase 2B-X cleanup**: dead code / AppShell `<UndoToastHost>` lift / `<DeferredActionButton>` 削除
- **Parent-level open questions**: Q-4 (audit-log schema) / Q-5 (reflect-*.mjs 段階削除) / Q-9 (W7 promptTemplate save)
- **別 W**: W4 metadata / W6 publishedUrl auto / W7 promptTemplate save / W8 publishPackagePaths state

## 10. Next Recommended Step

**Phase 2C Q 確定 microbatch (docs-only)**

boss が本 spec の Q-2C-1〜Q-2C-13 (13 件 open question) に judgement、 Claude Code が docs-only microbatch で spec を CONFIRMED 化:

- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md` の Q 表を「推奨」 → 「CONFIRMED」 書き換え
- `docs/specs/phase-2b-write-actions.md` §0.5 に Phase 2C 行を追加 (Phase 2C-0〜2C-5 sub-batch tracking section、 区分構造を 7 区分 / 8 区分に拡張するならその decision も含む)
- devlog + handoff 1 ペア

その後 → **Phase 2C-0 implementation batch** (Raw Idea + Idea Development Package、 ~12 ファイル) → smoke fix → smoke PASS → 残り Phase 2C-1 / 2C-2 / 2C-3 / 2C-4 / 2C-5 を順次。

加えて Phase 2B-4 spec (handoff/0195) も Q 確定待ち。 boss が Phase 2C と Phase 2B-4 のどちらを先に Q 確定するか判断する。

---

### Exact prompt for next Claude Code session (Phase 2C Q 確定 microbatch)

```
Confirm Phase 2C End-to-End No-API Publishing Workflow open decisions.

Reference: docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md §13 (Open questions Q-2C-1〜Q-2C-13).

Boss decisions to land in spec (docs-only, no code, no schema change):

Q-2C-1: No-schema MVP first → CONFIRMED (推奨採用)
Q-2C-2: filesystem-only raw (Path A) → CONFIRMED
Q-2C-3: generationJob doc は MVP では作らない (filesystem-only) → CONFIRMED
Q-2C-4: actual published text は MVP では Sanity に保存しない → CONFIRMED (Phase 2B-4 Q-2B4-3 と整合)
Q-2C-5: visualUsage = `archived` 流用 → CONFIRMED (Phase 2B-4 Q-2B4-4 と整合)
Q-2C-6: local AI execution = manual copy/paste + CLI command 表示の 2 mode → CONFIRMED
Q-2C-7: dashboard local file write = Yes, strict allowlist (Phase 2B-3 pattern) → CONFIRMED
Q-2C-8: import generated output が platformOutput doc を作らない → CONFIRMED
Q-2C-9: publishedOutput doc は MVP では作らない → CONFIRMED (Phase 2B-4 Q-2B4-5 と整合)
Q-2C-10: 試運転 raw idea = (boss 決定、 本物推奨)
Q-2C-11: Staged (Phase 2C-0〜2C-5) → CONFIRMED
Q-2C-12: product mode roadmap MVP = manual + CLI、 next = bridge → API → hybrid → CONFIRMED
Q-2C-13: storage mode roadmap MVP = Sanity-only、 Local/Obsidian/Hybrid は別 Phase → CONFIRMED

(boss が項目別に逆転判断する場合はその指示で上書き)

Tasks:
1. Update docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md §13 Q 表を「推奨」 → 「CONFIRMED」 化、 §0 / §1 / §6 / §7 / §16 で必要な「前提を再確認」 文を追加
2. Update docs/specs/phase-2b-write-actions.md §0.5 Implementation status に Phase 2C 行を追加 (Phase 2C-0〜2C-5 sub-batch tracking section、 6 → 7 区分 / 8 区分の判断含む)
3. Create docs/devlog/0186-phase-2c-end-to-end-no-api-publishing-workflow-decisions.md
4. Create docs/handoff/0197-phase-2c-end-to-end-no-api-publishing-workflow-decisions.md
5. Mirror to docs/handoff/latest.md

Docs only. dashboard/src, tools, schemas, assets, patches, publish-package, package.json 触らない。 build 不要。

End-of-run summary:
- Confirmed decisions
- Spec section updates
- Parent spec section update
- Next: Phase 2C-0 implementation batch (Raw Idea + Idea Development Package, ~12 files)
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md
(expect empty)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md \
    -not -path "*/node_modules/*"
(expect empty)

=== Files touched in this batch ===
docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md  (new, 19 セクション planning spec)
docs/devlog/0185-phase-2c-end-to-end-no-api-publishing-workflow-spec.md  (new)
docs/handoff/0196-phase-2c-end-to-end-no-api-publishing-workflow-spec.md  (new, this file)
docs/handoff/latest.md  (mirror of 0196)
```

Build skipped (docs-only). Runtime behavior unchanged: Phase 2B-1 reactionNotes + Phase 2B-2 humanReviewGate state + Phase 2B-3 Visual approve/register bridge + Phase 2B-3.1 visualAssetPlan Sanity reflect + Phase 2B-4 spec (planning) + Visual Register CLI / publish-package すべて preserved as-is. Sanity schema 不変。 外部 LLM API への通信は dashboard では 0 件 (本 spec が API integration を要求しない)。

Phase 2C spec が docs-only で land、 boss が Q-2C-1〜Q-2C-13 (13 件 open question) を judgement する段階。 Phase 2B-4 と Phase 2C のどちらを先に Q 確定するかは boss 次第。
