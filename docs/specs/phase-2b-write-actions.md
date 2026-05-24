# Phase 2B Write Actions Spec

最終更新: 2026-05-20
ステータス: planning spec, docs only (no implementation, no schema change, no Sanity write)
オーナー: boss + Claude Code

依存:
- [dashboard/README.md](../../dashboard/README.md) — current state (post UI-fidelity-11)
- [docs/handoff/0173-dashboard-readme-rewrite.md](../handoff/0173-dashboard-readme-rewrite.md) — Phase UI-fidelity cycle 完了状態
- [docs/handoff/0167-codex-b-fixes-applied.md](../handoff/0167-codex-b-fixes-applied.md) — demo-data hardcoding 解消の延長線として 2B が必要
- [tools/sanity/reflect-publication-state.mjs](../../tools/sanity/reflect-publication-state.mjs) — 既存 controlled atomic write pattern
- [tools/visual-register/server.mjs](../../tools/visual-register/server.mjs) — 既存 FS write surface

---

## 0. なぜ Phase 2B か

Phase UI-fidelity-1〜11 + 全 cleanup で **dashboard 全 23 routes は完全に read-only**。書き込み手段は今:

1. **Sanity Studio** (campaign / contentIdea / brandProfile / promptTemplate / visualAssetPlan / etc. の編集)
2. **Visual Register CLI** (`npm run visual:register`、`localhost:3334`) — inbox candidate の approve & register / assets/visuals/ copy / patches JSON 生成
3. **`tools/sanity/reflect-*.mjs`** — 高制御 one-off Sanity write (dry-run + execute 2-stage、_id allowlist、atomic transaction)
4. **`tools/publish-package-builder/build.mjs`** — publish-package/<platform>/<campaign>/ 生成
5. **手動 markdown 編集** (`tasks/visuals/` / `docs/devlog/` / `docs/handoff/` / CLAUDE.md / publish-packages/.../release-review/*.md)

dashboard には `DeferredActionButton` (Phase 2B placeholder の disabled button) が複数 page で残っているが、これらをすべて enable するわけではない。**「dashboard で行うべき書き込み」と「CLI / Studio に残すべき書き込み」の boundary 確定**が Phase 2B の本質。

---

## 0.5. Confirmed decisions

### Parent batch (2026-05-20, handoff/0175)

- **Q-1**: `SANITY_WRITE_TOKEN` lives in `dashboard/.env.local` **only**.
  It is **never** set in Vercel production / preview environments.
- **Q-2**: Production write actions stay **disabled forever**. Write actions
  fire **only when both** `enableWriteActions` flag (env) **and**
  `SANITY_WRITE_TOKEN` are present, and only in local / dev runtime.
- **Q-7**: Implementation order is **W3 → W5**. Phase 2B-1 = reactionNotes
  editing (W3). Phase 2B-2 = humanReviewGate state update (W5).

### Phase 2B-1 batch (2026-05-20, handoff/0177)

The following decisions are confirmed for the Phase 2B-1 (W3 reactionNotes)
batch only. They are documented in detail in
[docs/specs/phase-2b-1-reaction-notes.md](./phase-2b-1-reaction-notes.md)
§7 / §8 / §9 and may be revisited per-batch for W5+.

- **Q-6 (undo)**: In-memory previous value + 10 sec toast undo (current UI
  session only). **No Sanity audit-log schema**, **no persistent undo log**.
- **Q-8 (conflict)**: Optimistic `_rev` lock — on `409 Conflict`, surface a
  conflict message and prompt the user to reload (`router.refresh()`).
  **No 3-way merge UI**, **no last-write-wins**.
- **Q-10 (devlog)**: No automatic devlog generation in 2B-1. Server
  `console.log` for local debugging only. Manual `docs/devlog/` commit by
  boss remains the source of truth.

### Phase 2B-3.1 batch (2026-05-21, handoff/0192)

The following decisions are confirmed for the Phase 2B-3.1 (visual asset
Sanity reflect) batch only. They are documented in detail in
[docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](./phase-2b-3-1-visual-asset-sanity-reflect.md)
§0 / §3 / §6 / §7 / §12.

- **Q-2B3.1-1 (field allow-list)**: Exactly 4 fields —
  `localAssetPath` / `status` / `updatedAt` / `reviewNotes`. No other
  `visualAssetPlan` field is patched in this batch.
- **Q-2B3.1-2 (page placement)**: **Option C — both pages**.
  `/visual-assets/[assetId]/candidates` for the post-approve continuation
  flow; `/visual-assets/[assetId]` (detail) for later discovery of
  pending patches. The same server action is called from both entry
  points.
- **Q-2B3.1-3 (undo)**: **No undo**. `<UndoToastHost>` is not reused for
  Phase 2B-3.1. Preview + confirm modal is the only guard. Wrong patches
  are fixed by issuing another patch or editing in Studio (no automatic
  Sanity ↔ filesystem rollback).
- **Q-2B3.1-4 (already-reflected detection)**: **Exact 4-field match**
  between patch JSON `set.*` values and current Sanity values. If all 4
  match, surface "already reflected" hint; if any differs, "needs
  reflect". Execute remains available for explicit re-apply (server
  logs `already-applied: true`).
- **Q-2B3.1-5 (single vs multi-asset)**: **One asset per transaction**.
  Multi-asset / batch reflect is deferred to Phase 2B-3.2.
- **Q-2B3.1-6 (server action implementation)**: **Dashboard server action,
  separate implementation**. Do not import / extract /
  reuse `tools/sanity/reflect-working-pipeline-visual-assets.mjs`.
  Mirror its safety philosophy: allow-list, preview-before-execute,
  `expectedRevision`, post-write verification, no-create-missing-docs,
  no token in log.
- **Q-2B3.1-7 (missing target doc)**: **`not-found` reject + Studio
  guidance**. The dashboard does NOT create the `visualAssetPlan`
  document; if the target `_id` is absent, the server action returns
  a clear error and the UI surfaces a "create the doc in Sanity Studio
  first" hint.

### Phase 2B-3 batch (2026-05-21, handoff/0188)

The following decisions are confirmed for the Phase 2B-3 (W1 visual approve &
register bridge) batch only. They are documented in detail in
[docs/specs/phase-2b-3-visual-approve-register.md](./phase-2b-3-visual-approve-register.md)
§0 / §7 / §9 / §12.

- **Q-3 (W1 strategy)**: **Bridge first** (CLI bridge). Visual Register CLI
  remains the file pipeline owner; dashboard is orchestrator. Full
  reimplement (option B) is deferred indefinitely.
- **Q-2B3-1 (server action design)**: **Option D — HTTP bridge to running
  CLI.** Dashboard server action calls `localhost:3334/api/inbox/approve-and-register`
  via `fetch`. No subprocess spawn (option B nested), no shared-module
  extraction (option C), no command-prep-only (option A).
- **Q-2B3-2 (Sanity reflect)**: Sanity `visualAssetPlan.status: "saved"`
  reflection is **NOT** included in 2B-3. Deferred to Phase 2B-3.1 as a
  separate batch, modeled on `tools/sanity/reflect-working-pipeline-visual-assets.mjs`.
- **Q-2B3-3 (patch JSON generation)**: Patch JSON generation is owned by
  `tools/visual-register/server.mjs`. Dashboard **must not** duplicate file
  copy / patch JSON / manifest update logic.
- **Q-2B3-4 (publish-package distribution)**: No auto-trigger. Success
  result panel surfaces the next-step command (with clipboard copy); boss
  runs `npm run publish:package` manually.
- **Q-2B3-5 (undo / rollback)**: No automatic undo for file operations.
  `<UndoToastHost>` is **not** reused in 2B-3. Safety = preview + confirm
  modal + (optional) overwrite checkbox + manual cleanup checklist on
  success panel + README.
- **Q-2B3-6 (single vs multi-candidate)**: One candidate per transaction.
  Re-approving an already-registered final asset requires an explicit
  `overwriteConfirmed` flag (UI checkbox tick). Multi-select batch approve
  is a Phase 2B-3.2 candidate.
- **Q-2B3-7 (CLI auto-start)**: Dashboard never spawns or auto-starts the
  Visual Register CLI. Boss starts it manually with `npm run visual:register`.
  Dashboard health-checks `/api/health` and surfaces a
  `visual-register-not-running` UI when the server is down.
- **Q-2B3-8 (dry-run API on server.mjs)**: No change to `tools/visual-register/server.mjs`
  in this phase. Dashboard computes preview locally (path expectations,
  existing-file checks) and only calls `/api/inbox/approve-and-register`
  in execute mode.

### Phase 2B-2 batch (2026-05-20, handoff/0181)

The following decisions are confirmed for the Phase 2B-2 (W5 humanReviewGate
state) batch only. They are documented in detail in
[docs/specs/phase-2b-2-human-review-gates.md](./phase-2b-2-human-review-gates.md)
§0 / §3 / §5 / §8 / §9 / §10 / §16.

- **Q-2B2-1 (state enum)**: Schema unchanged. Use only the existing 6 values
  (`not-started` / `in-progress` / `pending-review` / `done` / `blocked` /
  `skipped`). `approved` ≡ `done`; `rejected` is operationally mapped to
  `blocked` (差し戻し) or `skipped` (放棄) depending on reason. **No new
  enum values added to schema.**
- **Q-2B2-2 (confirm modal)**: Confirm modal only for terminal transitions
  (`done` / `skipped`). Non-terminal transitions are 1-click commit; undo
  toast covers misclicks.
- **Q-2B2-3 (field allow-list)**: Phase 2B-2 patches **only**
  `humanReviewGates[_key].state`. `reviewer`, `notes`, `completedAt`, and
  timestamps are out of scope (Phase 2B-2.1 microbatch candidate).
- **Q-2B2-4 (undo host)**: Refactor/rename Phase 2B-1 `<AnalyticsToastHost>`
  into a reusable `<UndoToastHost>`. Same 10-second in-memory undo pattern.
  No persistent undo log, no audit-log schema.
- **Q-2B2-5 (UI control)**: Dropdown UI for state transition selection.
  No button group.
- **Q-2B2-6 (allow-list enforcement)**: Both UI and server enforce — UI
  filters available transitions; server returns `transition-not-allowed`
  when an invalid transition is attempted (defense-in-depth).
- **Q-2B2-7 (undo session scope)**: Undo opportunity loss on tab/page
  navigation is intentional. Current UI session only (Q-6 准拠).

### Phase 2B-4 batch (2026-05-21, handoff/0195) — **planning spec, implementation pending**

The Phase 2B-4 (Publish Status + Output Revision Workflow) planning spec
landed on 2026-05-21. Q-2B4-1〜Q-2B4-7 are documented as recommendations
in [docs/specs/phase-2b-4-publish-status-output-revision.md](./phase-2b-4-publish-status-output-revision.md)
§12 but **not yet boss-confirmed**. Confirmation microbatch + implementation
pending.

Summary of proposed 2B-4 scope:
- 3 server actions: `updateManualPublishStatus` / `updatePlatformOutputStatus` / `updateVisualAssetStatus`
- MVP no-schema-change (existing fields: `manualPublishingStatus[].state/publishedUrl/publishedAt/reactionNotes` + `platformOutput.status/reviewNotes` + `visualAssetPlan.status/reviewNotes`)
- Primary edit surface = `/publish`
- Schema additions deferred to Phase 2B-4.1 (propose only in §5)

### Phase 2C batch (2026-05-21, handoff/0197) — **spec-finalized, decisions CONFIRMED, E2E PASS after UX polish**

The Phase 2C (End-to-End No-API Publishing Workflow with Raw Idea
incubation) spec landed on 2026-05-21 (handoff/0196) and all 13 open
decisions Q-2C-1〜Q-2C-13 are **boss-confirmed** (handoff/0197).
Implementation is staged in sub-batches. Phase 2C-0 / 2C-0.1 / 2C-1A / 2C-1B / 2C-2 / 2C-3 / 2C-4 / 2C-6 and the Configurator context binding fix are boss smoke PASS. Phase 2C-UX guided workflow polish is also boss smoke PASS, and Phase 2C-5 / E2E is marked **PASS after UX polish** (handoff/0225). This is a high-level boss UX approval, not a pixel-perfect UI audit.

Confirmed decisions (full table in
[docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md](./phase-2c-end-to-end-no-api-publishing-workflow.md)
§13):

- **Q-2C-1**: No-schema MVP first — Phase 2C MVP では Sanity schema 不変、 schema 追加は Phase 2C-X 候補
- **Q-2C-2**: Filesystem-only raw idea — `idea-jobs/<ideaSlug>/_raw.json`、 `rawIdea` doc type は MVP では作らない
- **Q-2C-3**: Filesystem-only generation package — `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/{prompt.md, job.json}`、 `generationJob` doc は MVP では作らない
- **Q-2C-4**: Actual published text は MVP では Sanity に保存しない (Phase 2B-4 Q-2B4-3 と整合)
- **Q-2C-5**: Visual not used = `visualAssetPlan.status: 'archived'` + `reviewNotes`、 新 enum なし (Phase 2B-4 Q-2B4-4 と整合)
- **Q-2C-6**: Local AI execution = manual copy/paste + CLI command display の 2 mode、 dashboard shell exec / spawn なし
- **Q-2C-7**: Dashboard が local fs に write 可、 ただし strict allowlist (4 dir / `.md`+`.json` only / size cap / traversal reject / atomic write / `enableLocalFsRoutes` + `enableWriteActions` の 2 段 gate)
- **Q-2C-8**: Phase 2C-3 import は platformOutput doc を自動作成しない。Phase 2C-4 で saved `draft.md` からの controlled `platformOutput` create を別操作として追加。
- **Q-2C-9**: publish 時に `publishedOutput` doc を新規作成しない、 Phase 2B-4 `manualPublishingStatus` flow を使う
- **Q-2C-10**: E2E smoke は boss が本物の new raw idea を使う、 dummy / rehashed old topic 不可
- **Q-2C-11**: Staged batches: Phase 2C-0 (Raw Idea + Idea Dev) / 2C-1 (Content Idea create) / 2C-2 (Generation Package) / 2C-3 (Output Import) / 2C-4 (`platformOutput` creation) / 2C-5 (E2E smoke) / 2C-6 (Visual Brief Extraction + `visualAssetPlan` creation)
- **Q-2C-12**: Product mode roadmap: MVP = manual copy/paste + CLI display → next = local bridge → later = API automation → eventually = hybrid mode
- **Q-2C-13**: Storage mode roadmap: MVP = Sanity operating database → later = Local Markdown / Obsidian-native → eventually = Hybrid storage mode

### Still open

Remaining **Q-3 / Q-4 / Q-5 / Q-9** stay open in §6 and will be answered
at Phase 2B-3 spec start as their relevance increases.

### Implementation status (updated 2026-05-21)

- **Phase 2B-1 — W3 reactionNotes editing** ✅ **implemented + smoke PASS**
  - handoff/0178 (implementation 2026-05-20)
  - handoff/0179 (smoke fix: undo toast lifetime + topbar pill, 2026-05-20)
  - boss confirmed: `/analytics` 反応ノート / 反応メモ待ち で in-place 編集 + 10秒 undo 動作
- **Phase 2B-2 — W5 humanReviewGate state update** ✅ **implemented + smoke PASS**
  - handoff/0182 (implementation 2026-05-20)
  - handoff/0183 (smoke fix 1: badge ≠ trigger, /campaigns/[slug] read-only, 2026-05-20)
  - handoff/0184 (smoke fix 2: missing-data affordance added defensively, 2026-05-21)
  - handoff/0185 (`_key` backfill script: dry-run confirmed all 9 gates already have `_key`, execute not needed, 2026-05-21)
  - handoff/0186 (boss smoke PASS recorded, 2026-05-21)
  - boss confirmed: `/human-review-gates` で explicit「状態を変更」 dropdown、terminal で confirm modal、10秒 undo、`/campaigns/[slug]` は意図的に read-only
- **Phase 2B-3 — W1 visual approve & register bridge** ✅ **implemented + smoke PASS**
  - [docs/specs/phase-2b-3-visual-approve-register.md](./phase-2b-3-visual-approve-register.md) (16 sections, boss-confirmed via handoff/0188)
  - handoff/0187 (spec creation, 2026-05-21)
  - handoff/0188 (Q-2B3-1〜Q-2B3-8 boss confirmed, 2026-05-21)
  - handoff/0189 (implementation, 2026-05-21)
  - handoff/0190 (boss smoke PASS recorded, 2026-05-21)
  - boss confirmed: `/visual-assets/[assetId]/candidates` で「採用する (Visual Register に登録)」 → preview → execute、 Visual Register CLI に HTTP bridge、 file copy + patch JSON + manifest update が動作
- **Phase 2B-3.1 — Visual asset Sanity reflect** ✅ **implemented + smoke PASS**
  - [docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](./phase-2b-3-1-visual-asset-sanity-reflect.md) (boss-confirmed via handoff/0192)
  - handoff/0191 (spec creation, 2026-05-21)
  - handoff/0192 (Q-2B3.1-1〜Q-2B3.1-7 boss confirmed, 2026-05-21)
  - handoff/0193 (implementation, 2026-05-21)
  - handoff/0194 (boss smoke PASS recorded + Visual flow complete, 2026-05-21)
  - boss confirmed: preview で 4 field diff 表示、 execute → Sanity 4 field 更新、 post-write refetch verification (`verified: true`)、 reload で「既に反映済 (4 field 完全一致)」 indicator、 Sanity Studio で `visualAssetPlan` 更新確認。 no observed issues
  - 戦略 (Q-2B3.1-6 confirmed): dashboard server action として別実装、 `reflect-*.mjs` CLI は import せず safety philosophy のみ mirror
  - Edit surface (Q-2B3.1-2 confirmed): `/visual-assets/[assetId]/candidates` (continuation) + `/visual-assets/[assetId]` (post-discovery)
  - Field allow-list (Q-2B3.1-1 confirmed): exactly 4 fields (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)
  - Undo (Q-2B3.1-3 confirmed): なし。 preview + confirm のみ
  - Sanity write が本 sub-batch で復活 → `SANITY_WRITE_TOKEN` AND-gate が writeReady に戻る
- **Phase 2B-4 — Publish Status + Output Revision Workflow** 🟡 **planning spec, Q-2B4-1〜Q-2B4-7 awaiting boss confirmation**
  - [docs/specs/phase-2b-4-publish-status-output-revision.md](./phase-2b-4-publish-status-output-revision.md) (16 sections planning spec)
  - handoff/0195 (spec creation, 2026-05-21)
  - 3 server actions proposed: `updateManualPublishStatus` / `updatePlatformOutputStatus` / `updateVisualAssetStatus`
  - MVP no-schema-change strategy (既存 field のみで 80% カバー)
  - Implementation: 新規 6 + 更新 3-4 = 9-10 ファイル想定、 1 PR 完結可能
  - Next: Q-2B4-1〜Q-2B4-7 boss 確定 microbatch → implementation batch
- **Phase 2C — End-to-End No-API Publishing Workflow (with Raw Idea incubation)** 🟢 **spec-finalized, Q-2C-1〜Q-2C-13 CONFIRMED; Phase 2C-0 + 2C-0.1 + 2C-1A + 2C-1B + 2C-2 + 2C-3 + 2C-4 + 2C-6 + 2C-UX ✅ smoke PASS; Phase 2C E2E ✅ PASS after UX polish**
  - [docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md](./phase-2c-end-to-end-no-api-publishing-workflow.md) (finalized spec)
  - handoff/0196 (spec creation, 2026-05-21)
  - handoff/0197 (Q-2C-1〜Q-2C-13 boss confirmed, 2026-05-21)
  - handoff/0198 (**Phase 2C-0 implementation**: Raw Idea + Idea Development Package、 2026-05-21)
  - handoff/0199 (**Phase 2C-0.1 implementation**: AI-developed result import、 2026-05-21)
  - handoff/0200 (**Phase 2C-0 + 2C-0.1 boss smoke PASS**, 2026-05-21)
  - 10 stage end-to-end workflow (Raw Idea → AI 企画化 → Structured contentIdea → Campaign → Generation → Revision → Publish → Reaction)
  - Phase 2C MVP は **no-schema, filesystem-only raw stage, no external LLM API**
  - Stage 6-8 (Revision / Visual usage / Publish record) は **Phase 2B-4 に完全委譲** (重複定義しない)
  - 4 OS positioning: Obsidian = 思考 OS / Sanity = operating DB / Claude+Codex+ChatGPT = 生成 agent / Dashboard = workflow orchestrator
  - Sub-batch progress:
    - **Phase 2C-0** ✅ smoke PASS — `/ideas` で Raw Idea form + `idea-jobs/<slug>/_raw.json` + `prompt.md` + `job.json` 書き出し動作確認 (handoff/0200)
    - **Phase 2C-0.1** ✅ smoke PASS — AI 結果を dashboard textarea で paste → `result.md` + `result.json` 書き出し動作確認 (handoff/0200)
    - **Phase 2C-1A** ✅ smoke PASS — manual promote helper + schema alignment (Studio handoff + schema-aligned field clipboard; handoff/0201 + 0202 + 0203)
    - **Phase 2C-1B** ✅ smoke PASS — controlled `createContentIdea` server action from `idea-jobs/<slug>/<timestamp>/result.json` to Sanity `contentIdea`, plus Studio URL fix (handoff/0204 + 0205 + 0206)
    - **Phase 2C-2** ✅ smoke PASS — Generation Prompt Package from Sanity `contentIdea` to local `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md + job.json`; boss confirmed `obsidian-ai-sanity` + `threads` prompt was usable in ChatGPT and produced a Threads draft + visual-brief (handoff/0207 + 0208)
    - **Phase 2C-3** ✅ smoke PASS — Generated Output Import from pasted AI output to local `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md` + optional `draft.json`; Import UX smoke fix verified immediate handoff after package create (handoff/0209 + 0211 + 0212)
    - **Phase 2C-4** ✅ smoke PASS — saved `generation-jobs/.../draft.md` → controlled Sanity `platformOutput` create; uses `job.json` platform metadata as source of truth, Studio deep-link opens exact document, and does not create `campaignPlan` / `publishedOutput` or mutate `manualPublishingStatus` (handoff/0213 + 0215 + 0216)
    - **Phase 2C-5** ✅ PASS after UX polish — End-to-End smoke plan, read-only audit, and guided workflow approval together mark the E2E flow passable for continued product development (handoff/0217 + 0223 + 0225)
    - **Phase 2C-6** ✅ smoke PASS — `draft.md` から visual brief / image prompt を抽出して `visual-brief.md` + optional `visual-brief.json` に保存し、Sanity `visualAssetPlan` preview/create/duplicate handling を行う。画像生成・asset 書き込み・Visual Register は行わない。Configurator context binding fix により top-level selected Content Idea が downstream operation の parent context になる (handoff/0219 + 0221 + 0222)
    - **Phase 2C-UX** ✅ smoke PASS — `/ideas` and `/configurator` are now guided workflow screens with clearer Japanese labels, local-vs-Sanity save badges, manual-AI/no-API notices, next action cards, and Step 0 / Step 1-7 sequencing (handoff/0224 + 0225)
  - boss smoke evidence (2026-05-21, handoff/0200): 試運転 raw idea「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 で end-to-end (raw → prompt package → AI 手動実行 → result paste → result.md + result.json 保存) 完走、 ファイル群が `idea-jobs/obsidian-ai-sanity-3/20260521-124748/` 下に正しく配置、 Sanity write 0 件、 外部 LLM API 通信 0 件、 dashboard shell 実行 0 件
  - Product mode roadmap (CONFIRMED Q-2C-12): manual copy/paste + CLI display → local bridge → API automation → hybrid
  - Storage mode roadmap (CONFIRMED Q-2C-13): Sanity operating database → Local Markdown / Obsidian-native → Hybrid storage
  - Next: Phase 2C E2E is PASS after UX polish. Campaign creation remains next phase; Phase 2C-4/2C-6 は detected sections ではなく `job.json` / generation job platform metadata を source of truth とする。Strategic continuation options include Phase 2B-4 publishing management, campaignPlan creation / campaign orchestration, Visual Review / Visual Register refinement, or Phase 2D API automation only if explicitly approved.
  - Phase 2B-4 / later publishing management remains responsible for manual publish status, revision marking, visual usage, and published URL recording.

### Visual flow — complete for now (boss confirmed 2026-05-21, handoff/0194)

Phase 2B-3 (W1 visual approve & register bridge) + Phase 2B-3.1 (visualAssetPlan Sanity reflect) の **両 sub-batch が smoke PASS** で完了。 dashboard は現在以下が可能:

- `/visual-assets/[assetId]/candidates` で **visual candidate を approve & register** (HTTP bridge to `localhost:3334/api/inbox/approve-and-register` 経由、 Visual Register CLI が file pipeline owner)
- `patches/visual-assets/<slug>/<asset>.json` の **patch JSON を read + 4-field diff preview**
- preview confirm 後に **Sanity `visualAssetPlan` の 4 field (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) を patch**
- post-write refetch verification で `verified` flag を返す

**Visual flow として deferred な作業** (本 batch + Phase 2B-3.1 では実装しない):
- **Visual Register retirement** (long-term direction、 handoff/0190 + Phase 2B-3.1 spec §9 で documented): `tools/visual-register/server.mjs` の core logic を share library に extract → dashboard server action が直接 call → CLI / `:3334` server を retire
- **publish-package redistribution auto-trigger** (Phase 2B-3.2 candidate、 Q-2B3-4 で deferred): `npm run publish:package` の auto-trigger は本 flow に含めない、 boss が手動で run
- **multi-asset / batch reflect** (Phase 2B-3.2 candidate、 Q-2B3.1-5 で deferred): 1 asset / 1 transaction を維持
- **Visual Register CLI connection status indicator** (topbar、 Phase 2B-3.2 candidate)

**Sanity schema は不変**: Phase 2B-3 + 2B-3.1 の両方が既存 `visualAssetPlan` schema 内で完結、 新規 enum 値 / 新規 field の追加なし。

### Long-term: Visual Register retirement direction (boss confirmed 2026-05-21, not this batch)

Boss が長期方向を確定:
- **Phase 2B-3 (現在)**: dashboard → HTTP bridge → Visual Register server (separate `:3334` 起動が必要)
- **Phase 2B-3.1 (次)**: Sanity reflect を dashboard 内に追加 (file pipeline は依然 Visual Register が owner)
- **将来 (Phase 2B-3.2 / 2B-3.3 / 別 Phase)**:
  - `tools/visual-register/server.mjs` の core logic を共有 module として extract
  - dashboard server action が直接 core module を call (HTTP bridge を skip)
  - CLI / `:3334` server は optional compatibility layer に降格
  - 最終的に Visual Register separate server は retire
- **本 batch + Phase 2B-3.1 では実装しない**。 現在の bridge architecture を維持しつつ Sanity reflect だけ追加する

Next batch: **Phase 2B-3.1 implementation** (after boss confirms 2B-3.1 spec open questions).

---

## 1. Write Action Candidates (8)

| # | 候補 | 現在の write 手段 | dashboard で扱う価値 |
|---|---|---|---|
| W1 | Approve & register visual candidate | Visual Register CLI (`localhost:3334`) | mid: dashboard と CLI の context switching 削減 / image preview 統合 |
| W2 | Regenerate visual candidate (prompt 編集 + codex exec 再実行) | 手動 `prompt.md` edit + `codex exec` | low: subprocess spawn が複雑、CLI で十分 |
| W3 | `manualPublishingStatus[].reactionNotes` 編集 | Sanity Studio + 手動 markdown 記録 | **high**: 24-72h 後の boss 作業、`/analytics` と `/publish-package/[slug]` で書きたい場所がある |
| W4 | Campaign metadata 編集 (title / coreThesis / status / automationLevel など) | Sanity Studio | low: Studio のほうが editing UX 優れる |
| W5 | `humanReviewGates[].state` 更新 (pending-review → in-progress → done 等) | Sanity Studio | **high**: `/human-review-gates` で state change がワンクリックで完結すると flow 速い |
| W6 | `manualPublishingStatus[].publishedUrl` / `publishedAt` 更新 | `tools/sanity/reflect-publication-state.mjs` (1 回限り / atomic) | mid: boss が公開直後にもう一度回せると便利だが、現状 reflect script で運用回せている |
| W7 | promptTemplate / configurator 出力の保存 (`/configurator` の「下書きを生成」boundary) | Codex CLI / ChatGPT に手動コピペ → `outputs/` に手動配置 | mid: 完全自動化は CLAUDE.md 方針との緊張あり、boss 判断点 |
| W8 | `publishPackagePaths[].state` / publish-package status 更新 | `tools/publish-package-builder/build.mjs` rerun | low: builder script のほうが「正解」、dashboard 書き込みは出口違い |

「dashboard で扱う価値」は: **boss の作業頻度 × dashboard 文脈での意味のあるさ** で評価。

---

## 2. Prioritization

### Phase 2B P0 (2 つの separate batch、W3 が先、W5 が後 — boss confirmed Q-7)

- **Phase 2B-1 — W3 reactionNotes editing** ✅ **implemented + smoke PASS (2026-05-21, handoff/0186)**
  - 理由: 24-72h 後の boss 作業 / 既に `/analytics` `PendingMonitoringCard` で「メモ待ち」を可視化済 / Codex review B fixes (handoff/0167) の延長線
  - touch 範囲: 単一 field の文字列 edit、schema 拡張なし、副作用なし
  - 既存 read path: `outputsListQuery` の `campaigns[].items[].reactionNotes`、`publishPackageStateBySlugQuery`
- **Phase 2B-2 — W5 human review gate state update** ✅ **implemented + smoke PASS (2026-05-21, handoff/0186)**
  - 理由: `/human-review-gates` の操作が「Studio 開いて該当 gate を探して state を変える」の現運用と比べてワンクリック化、頻度高
  - touch 範囲: `campaignPlan.humanReviewGates[]._key` (gate identity) + `state` のみ (本 batch では `reviewer` / `notes` / `completedAt` 編集は scope 外、Phase 2B-2.1 で再評価)
  - State machine (実装): `not-started → in-progress / pending-review / skipped`、`in-progress → pending-review / blocked / done / skipped`、`pending-review → in-progress / done / blocked / skipped`、`blocked → in-progress / skipped`、`done` / `skipped` は terminal (dashboard では再開不可、Studio で手動)
  - Edit surface: `/human-review-gates` のみ (explicit「状態を変更 ▾」 dropdown)、`/campaigns/[slug]` は意図的に read-only

### Phase 2B P1 (P0 land 後の次 batch)

- **Phase 2B-3 — W1 visual approve & register bridge** ✅ **implemented + smoke PASS (2026-05-21, handoff/0190)**
  - 戦略 (Q-3 / Q-2B3-1 confirmed): dashboard 内で完全 reimplement するのではなく、**Visual Register CLI に HTTP bridge** する。dashboard server action が `localhost:3334/api/inbox/approve-and-register` を fetch で call、`tools/visual-register/server.mjs` が file copy + patch JSON + manifest update を transactional に owner として実行。dashboard は orchestrator のみ
  - 採用しない代替: full reimplement (option B) / subprocess spawn (option B nested) / shared module extraction (option C) — Phase 2B-3 では不採用、 ただし **shared module extraction は Visual Register retirement の長期 path** として §0.5 に記録
  - 次サブバッチ: Phase 2B-3.1 で Sanity reflect、 publish-package distribute / batch approve は Phase 2B-3.2、 Visual Register retirement は更に後
  - 詳細 spec: [docs/specs/phase-2b-3-visual-approve-register.md](./phase-2b-3-visual-approve-register.md)

### Phase 2B later (後続 batch、要 boss 確認)

- **W6 — publishedUrl / publishedAt update**
  - reflect-publication-state.mjs の dashboard 化、ただし script は依然 atomic + dry-run なので置き換えは ROI 微妙
- **W4 — campaign metadata edit**
  - Studio の方が editing UX 優れる、dashboard 化の動機弱い (例外: status / automationLevel のみのワンクリック更新は P1 候補)
- **W8 — publishPackagePaths state update**
  - publish-package-builder/build.mjs の rerun trigger を dashboard 化、low ROI

### Keep CLI-only for now

- **W2 — Regenerate visual candidate (prompt + codex exec)**
  - subprocess spawn と timeout 設計が複雑、Visual Register CLI の手元動作で十分
  - 注: 「regenerate prompt をコピーして手動で codex exec する」UX は dashboard で十分可能 (CopyButton + prompt 表示)、これは「書き込み」ではなく「prompt 提示」なので Phase 2B scope 外
- **W7 — promptTemplate / configurator 出力の保存**
  - CLAUDE.md の「API なしで始める」方針と緊張あり、boss 判断点
  - 現運用は Codex CLI / ChatGPT に手動コピペ → `outputs/<platform>/<slug>.md` に手動配置、変更不要

---

## 3. Safety Model

すべての Phase 2B write action は **以下の安全契約**に従う。Visual Register と reflect-*.mjs の既存 pattern を継承。

### 3-1. Dry-run behavior

- すべての write には **dry-run (default) / execute (explicit) の 2-stage**
- dry-run はサーバー側で **完全 simulation** + diff preview を返す (Sanity transaction を build するが commit しない)
- UI 上は「実行前確認」モーダル → 「diff を確認」 → 「commit (execute)」の 3-step
- dry-run でも **Sanity read token を要求**、write token は execute でしか触らない

### 3-2. Audit log

- すべての write は `docs/devlog/<NNNN>-<action>.md` に **手動 commit (boss が approve したものだけ)** — dashboard が自動 devlog 生成は scope 外
- 短期的には **dashboard 内 in-memory log のみ** (ページ load ごとにクリア)、Sanity 内 audit log doc は **schema 拡張対象** で boss 確認待ち
- 各 write action は server-side console log に `action / target / actor (現状は 'localhost' 固定) / dry-run | execute / timestamp` を残す
- write token / read token の値は **絶対に log しない** (reflect-*.mjs と同じ contract)

### 3-3. Rollback / recovery

- Phase 2B P0 / P1 の各 action は **idempotent + before-state を読んで diff** を計算する
- recovery 手段:
  - W3 (reactionNotes): undo は前 value を保持して 1-step undo button (UI 上)、recovery は Studio で手動
  - W5 (gate state): state machine の前 state を log に残す、recovery は Studio で手動
  - W1 (visual approve & register): **「保存先 path がすでに存在する場合は execute を abort」**、recovery は Visual Register CLI で手動 (Visual Register が既に recover サポート: `tools/visual-register/recover-working-pipeline-step-d.mjs`)
- Sanity 全文 export / backup は boss が定期手動運用 (Phase 2B 範囲外)

### 3-4. Confirmation UI

各 action で必須の UI element:
- 「実行前確認」モーダル: target 名 / before-state / after-state diff
- 「実行中…」 spinner (`useTransition` + Server Action progress)
- 「成功 / 失敗」 toast or inline banner
- 失敗時の **error message は原因のみ表示**、stack / token / 内部 path は出さない
- 「dry-run」「execute」の 2 button、デフォルト「dry-run」

### 3-5. Local mode behavior

- Phase 2B write は **`enableWriteActions` flag** (新規、`.env.local` で boss が明示的に enable) でのみ動作
- production deploy (Vercel) では **flag off で 404 / disabled** (DeferredActionButton 表示を維持)
- localhost で flag on のときのみ write を発火 (boss が write 用 Sanity write token を `.env.local` に設定したときのみ動く)
- `SANITY_WRITE_TOKEN` 環境変数の存在チェックを server action 起動時に必須 (token なしで dry-run も abort)

### 3-6. Error handling

- すべての server action は **try/catch wrapper** で 4 種の error class を返す:
  - `'validation-error'` (UI input が schema と矛盾)
  - `'permission-denied'` (write token なし or scope 不足)
  - `'conflict'` (Sanity の `_rev` が ant. と矛盾、同時編集発生)
  - `'unknown'` (上記以外、Sentry 等の external 通知は Phase 2B 後)
- UI 側はこの 4 種を分けてメッセージ表示 (e.g. `'conflict'` → 「他で編集された可能性、画面を再読み込み」)

### 3-7. Permissions / environment

- 最小: `SANITY_WRITE_TOKEN` (`Editor` role、`Deploy Studio` ロールは過剰)
- Token scope: 必要なら **document type 別** に separate token を boss が発行 (例: `SANITY_WRITE_TOKEN_CAMPAIGN_ONLY` for W3+W5)、ただし P0 では single token で十分
- `enableWriteActions` env flag + token both required、片方欠ければ 全 write surface disabled
- prod / preview deploy では env を空のまま → 永続的に disabled

### 3-8. No auto-post boundary

- **絶対に守る**:
  - dashboard の write actions は **Sanity write のみ**
  - 外部 SNS / blog (X / note / Substack / Threads) への post は **dashboard では 100% trigger しない**
  - publish-package files の生成 (`tools/publish-package-builder/build.mjs`) は dashboard から呼ばない (CLI 起動を維持)
  - `assets/visuals/<path>` への copy は **W1 で boss approve 後にのみ**、`patches/` の生成と同 transaction で実行

---

## 4. Responsibility Boundary

```
                        ┌────────────────────────────────────────┐
                        │            HUMAN (boss)                │
                        └────────────────────────────────────────┘
                                          │
       ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
       ▼                  ▼               ▼               ▼                  ▼
┌─────────────┐ ┌───────────────────┐ ┌─────────┐ ┌──────────────┐ ┌────────────────┐
│  Sanity     │ │   Dashboard       │ │ Visual  │ │ publish-     │ │ External SNS / │
│  Studio     │ │   (Phase 2B)      │ │ Register│ │ package      │ │ blog UI        │
│             │ │                   │ │ CLI     │ │ builder      │ │                │
│  - heavy    │ │ - W3 reactionNotes│ │         │ │              │ │ - X / note /   │
│    editing  │ │ - W5 gate state   │ │ - W1    │ │ - publish-   │ │   Substack /   │
│  - schema   │ │ - W1 (bridge?)    │ │   approve│ │   package/   │ │   Threads      │
│    inspect  │ │                   │ │   register│ │   regen     │ │                │
└─────────────┘ └───────────────────┘ └─────────┘ └──────────────┘ └────────────────┘
       │                  │                │                │                │
       └──────────────────┴────────────────┴────────────────┘                │
                          │                                                  │
                          ▼                                                  │
                ┌──────────────────────────────────────┐                     │
                │  Sanity dataset (production)         │                     │
                │  + repo fs (assets/visuals,          │                     │
                │    publish-packages, patches)        │                     │
                └──────────────────────────────────────┘                     │
                          ▲                                                  │
                          │                                                  │
                ┌──────────────────────────────────────┐                     │
                │  tools/sanity/reflect-*.mjs          │                     │
                │  (one-off controlled writes,         │                     │
                │   used by boss during recovery)      │                     │
                └──────────────────────────────────────┘                     │
                                                                             │
                          ▶ NEVER ◀                                          │
                  dashboard NEVER posts to ───────────────────────────────────┘
```

### 4-1. Dashboard UI ↔ Sanity controlled writes

- 各 write action は **server action** (`'use server'`) として実装、client から fetch + JSON で呼ばない (Next.js App Router の標準 pattern)
- server action は **`@sanity/client`** で transaction を build → commit
- token は **server 側のみ**, client bundle には絶対 inline されない (`SANITY_WRITE_TOKEN` は NOT `NEXT_PUBLIC_*`)

### 4-2. Dashboard ↔ `tools/sanity/reflect-*.mjs`

- 重要な共有: **同じ contract** (allowlist + dry-run/execute + atomic + no token logging)
- 違い:
  - reflect-* は one-off CLI、boss が手動で起動、`_id` ハードコード
  - dashboard 2B server actions は **UI からの interactive trigger**、`_id` は user selection
- 並存: reflect-* は **大規模 / 復旧用 / 1 回限り** の write に残置、dashboard 2B は **routine / per-record / 短い** write に使う

### 4-3. Dashboard ↔ Visual Register CLI

- W1 (visual approve & register) の場合の選択肢:
  - **option A**: dashboard が `localhost:3334` (Visual Register) に POST proxy → Visual Register 内部で copy + patches 生成 + Sanity write
  - **option B**: dashboard が完全 reimplement (copy + patches + Sanity write をすべて server action 内で)
- boss 判断点 (§6 Q-3) → 推奨は option A (Visual Register の recover 機能を温存しつつ trigger だけ dashboard 化)

### 4-4. Dashboard ↔ publish-package copy-friendly workflow

- `/publish-package/[slug]` は **完全に保護**、Phase 2B でも touch なし
- ただし W6 (publishedUrl 更新) は `/publish-package/[slug]` 内に inline で edit field を追加する選択肢あり、これは boss 判断点

### 4-5. Dashboard ↔ external analytics

- Phase Analytics-2 (Plausible / X / note / Substack) は **Phase 2B scope 外**
- Phase 2B 完了後、`/analytics` の read-only data source を外部 API 統合に切り替えることが可能になる (write には影響なし)

---

## 5. Recommended Implementation Sequence

Phase 2B を **小さく分割**して、各 batch を 1 PR + 1 boss 確認 cycle に収める:

### 2B-1: reactionNotes write (W3) — 推奨最初

- 範囲: `/analytics` の `ReactionNotesCard` / `PendingMonitoringCard` 内に reactionNotes inline edit
- 実装:
  - new `app/actions/updateReactionNotes.ts` (server action)
  - 1 field 更新、dry-run + execute、`_id` + platform + new text を input
  - `enableWriteActions` flag + `SANITY_WRITE_TOKEN` 両方必須
  - confirmation modal + undo button (前 value 保持)
- audit: console + dashboard in-memory log
- 期間想定: spec 後 1 implementation batch (1 PR)

### 2B-2: Gate state update (W5)

- 範囲: `/human-review-gates` の各 gate に「state を進める」button
- 実装:
  - new `app/actions/updateGateState.ts`
  - state machine 制約 (not-started → in-progress / pending-review → done / blocked) を server side で validation
  - completedAt / reviewer / notes も同 transaction で更新可
  - 入力 UI: dropdown + reviewer text + notes textarea
- 期間想定: 1 implementation batch

### 2B-3: Visual approve & register bridge (W1)

- 範囲: `/visual-assets/[assetId]/candidates` の「Visual Register で承認」を dashboard 内 confirm modal + Visual Register HTTP bridge に
- 実装:
  - new `app/actions/triggerVisualApprove.ts` (server action)
  - `localhost:3334` に POST (Visual Register が動作中であることを前提)
  - Visual Register が動作していない場合は 「Visual Register を起動してください」 banner
  - Phase 2B-3 boss 判断点: bridge (option A) or reimplement (option B) どちらか
- 期間想定: bridge なら 1 batch、reimplement なら 2-3 batches

### 2B-4: Campaign metadata edit (W4) — light only

- 範囲: `/campaigns/[slug]` の PageHeader「編集」button を enable → status / automationLevel のみのワンクリック更新
- title / coreThesis / brand assignment 等の重い編集は **Studio に残す**
- 実装:
  - new `app/actions/updateCampaignStatus.ts`
  - status enum + automationLevel のみの dropdown
- 期間想定: 1 batch

### 2B-5: publishedOutput updates (W6) — optional

- 範囲: `/publish-package/[slug]` 内に「公開 URL を記録」inline edit
- 実装:
  - new `app/actions/updatePublishedOutput.ts`
  - publishedUrl + publishedAt の 2 field を 1 transaction で
- 期間想定: 1 batch
- 注意: `/publish-package/[slug]` は boss-protected、layout 変更は最小化、edit form は折りたたみ式 inline で導入

### 2B-6 and beyond: 要 boss 議論

- W2 (regenerate prompt + codex exec)
- W4-heavy (campaign title / coreThesis edit)
- W7 (configurator output save)
- W8 (publish-package status update)
- Sanity audit-log schema 拡張

---

## 6. Open Questions for Boss

| # | 質問 | 影響範囲 |
|---|---|---|
| Q-1 ✅ | (CONFIRMED 2026-05-20) Phase 2B write を **localhost で有効** にする際、`SANITY_WRITE_TOKEN` を `.env.local` に置く運用で良いか? **→ Yes**: `dashboard/.env.local` 専用、Vercel production / preview 環境変数には **絶対に設定しない**。 | 全 Phase 2B、Q-1 が決まらないと start できない |
| Q-2 ✅ | (CONFIRMED 2026-05-20) Production deploy (Vercel) で Phase 2B write を **絶対に disable** する方針で OK か? **→ Yes**: production write は永久に disabled。write actions は `enableWriteActions` flag **かつ** `SANITY_WRITE_TOKEN` の両方が揃った local / dev でのみ発火。将来「特定 user 限定」の path は想定せず。 | env flag 設計、auth 設計 |
| Q-3 | W1 (visual approve & register) は **option A (Visual Register bridge)** か **option B (dashboard reimplement)** か? boss workflow を維持しやすいのは A、独立度高いのは B | 2B-3 batch の scope |
| Q-4 | Sanity 内 **audit-log schema** (新規 doc type `dashboardAuditLog` 等) を作るか? それとも console + in-memory のみで十分か? | schema 変更 = 別 spec batch、現状 schema 不変方針との緊張 |
| Q-5 | `reflect-*.mjs` script との並存戦略: dashboard 2B が land 後も script 群は残すか? 段階的に削除するか? | 復旧手段の冗長性 |
| Q-6 ✅ | (CONFIRMED 2026-05-20, 2B-1 scope) undo (W3 / W5) を **single-step in-memory** で済ますか、それとも **Sanity 内 history** (per-doc revisions) を使うか? **→ Phase 2B-1**: in-memory previous value + 10 秒 toast undo、Sanity audit-log schema なし、persistent undo log なし。詳細 [phase-2b-1-reaction-notes.md §7](./phase-2b-1-reaction-notes.md)。W5+ は別 batch で再評価可。 | UI 複雑度 |
| Q-7 ✅ | (CONFIRMED 2026-05-20) 2B implementation の最初の batch を **W3 (reactionNotes)** で良いか? **→ Yes**: 2B-1 = W3 reactionNotes、2B-2 = W5 humanReviewGate state update。 | 2B-1 / 2B-2 順序 |
| Q-8 ✅ | (CONFIRMED 2026-05-20, 2B-1 scope) Phase 2B write 中の **同時編集 conflict** (`_rev` 衝突) を扱う頻度想定: solo boss なら極稀 → "再読み込み" メッセージで済ます、それで OK か? **→ Yes**: `_rev` mismatch → conflict message + reload prompt (`router.refresh()`)。3-way merge UI なし、last-write-wins なし。詳細 [phase-2b-1-reaction-notes.md §8](./phase-2b-1-reaction-notes.md)。 | error handling 設計 |
| Q-9 | promptTemplate dataset がまだ空 → W7 (configurator output save) は **dataset 投入後** に議論で OK か? | 2B-6+ |
| Q-10 ✅ | (CONFIRMED 2026-05-20, 2B-1 scope) dashboard 自動 devlog 生成は **scope 外** にする (boss が手動 commit) で良いか? それとも `docs/devlog/` への append を action から実行可にするか? **→ Yes (scope 外)**: 2B-1 では自動 devlog 生成なし、server `console.log` のみ (local debugging)。manual devlog が source of truth。詳細 [phase-2b-1-reaction-notes.md §9](./phase-2b-1-reaction-notes.md)。 | audit log boundary |

---

## 7. Non-Goals

明示的に **やらない**:

1. **No auto-post.** dashboard は X / note / Substack / Threads に絶対に投稿しない。Phase 2B write は Sanity / `assets/visuals/` (W1 のみ approve 後) に限定
2. **No uncontrolled Sanity writes.** 全 write は dry-run/execute 2-stage + `_id` validation + atomic transaction + write token requirement + `enableWriteActions` env flag
3. **No schema change in initial 2B.** P0 (W3 / W5) は既存 `manualPublishingStatus[]` / `humanReviewGates[]` field 更新のみ、schema 拡張なし。schema 変更が必要な audit log / W7 prompt save 等は **別 spec batch** で boss 確認
4. **No publish-package mutation unless explicitly approved.** `publish-packages/` 配下のファイルは dashboard から触らない。W8 は boss 確認後の later batch
5. **No asset file generation unless explicitly approved.** dashboard から codex exec spawn / image generation / 画像 file 書き込みはしない。W2 は keep CLI-only、W1 のみ「既に Visual Register が生成済の inbox file を `assets/visuals/` に copy」を扱う (boss 確認次第)
6. **No external API integrations** (OpenAI / Anthropic / X API / note API 等)、Phase Analytics-2 と Phase 2B は separate
7. **No build-time secret leakage.** `SANITY_WRITE_TOKEN` は **絶対** に client bundle に inline されない、`NEXT_PUBLIC_*` prefix は使わない
8. **No write log retention without boss approval.** in-memory log は session 終了で消える、persistent log は audit-log schema (Q-4) 確定後

---

## 8. Cleanup Chain after Phase 2B

Phase 2B が land した後、次の cleanup が解禁される:

- `DeferredActionButton.tsx` 削除 — 各 page で実 action button に置換完了後
- `LocalModeBanner.tsx` 削除 — build-time snapshot 戦略が land した後 (Phase D2 系列、Phase 2B とは独立)
- comment-only historical breadcrumb 整理 (handoff/0173 で skip した 7 行)
- `tools/sanity/reflect-*.mjs` の段階的縮約 (Q-5 依存)
- `dashboard/README.md` の「Next work candidates」section を再度 refresh

---

## 9. Implementation Sequence Summary

```
Phase 2B planning (本 spec) — docs/specs/phase-2b-write-actions.md  ← 本 batch land 後
   ↓ (boss が §6 Q-1 to Q-10 を回答)

Phase 2B-1 spec batch (docs only): reactionNotes write 詳細 spec
   ↓ boss approve
Phase 2B-1 implementation: W3 (1 PR)

   ↓
Phase 2B-2 spec + implementation: W5 gate state update

   ↓
Phase 2B-3 spec + implementation: W1 visual approve & register bridge (boss Q-3)

   ↓
Phase 2B-4 spec + implementation: W4 light campaign metadata edit (status / auto level only)

   ↓
Phase 2B-5 spec + implementation: W6 publishedOutput update (optional, /publish-package 内 inline)

   ↓
(Phase 2B 完了)
   ↓
DeferredActionButton cleanup microbatch
   ↓
Cleanup of historical comment breadcrumbs (handoff/0173 §8 short-term)
   ↓
Phase Analytics-2 (external API) — separate from 2B
   ↓
Phase Settings-2 (workspaceProfile schema, multi-workspace) — separate
```

---

## 10. Out of Scope (本 spec の対象外)

- Phase Analytics-2 (Plausible / X API / note 統計 / Substack 統計)
- Phase Settings-2 (workspaceProfile schema)
- Phase Billing
- Multi-user / team workspace
- AI-assisted content generation (CLAUDE.md 方針確認待ち)
- Tabs integration P1 for `/campaigns/[slug]` (8 → 5-6) — UI polish、Phase 2B と独立
- DeferredActionButton / LocalModeBanner の本体削除 — Phase 2B 完了の **後** に行う cleanup
- README rewrite — handoff/0173 で完了済
