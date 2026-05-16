# Handoff: Activate 4 Campaign Generation Schemas (brandProfile / visualStyleProfile / promptTemplate / campaignPlan)

Date: 2026-05-14
Status: **4-schemas-activated / structure-updated / build-green-5-of-5 / seed-not-inserted / studio-render-pending-human-confirm**

## 1. Task Goal

4 proposed schema を依存順に Studio へ activate。各 activate 後に `npm run build` を確認しながら段階的に進める rolling activation。**seed 投入は本バッチ scope 外**、別バッチで人間が判断。

依存順: `brandProfile → visualStyleProfile → promptTemplate → campaignPlan`

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない（`npx sanity documents create` 0 回）。
- `seed --replace` を実行していない。
- 既存 active schemas を破壊的に変更していない（12 件不変）。
- `sanity.config.ts` を変更していない。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/`を変更していない。
- publish-packages 配下を変更していない。
- seed file を Sanity dataset に投入していない（JSON は local-only のまま）。

## 3. Changed Files

### Moved (schemas/proposed/ → schemas/)

- `schemas/proposed/brandProfile.ts` → `schemas/brandProfile.ts`（top comment 更新）
- `schemas/proposed/visualStyleProfile.ts` → `schemas/visualStyleProfile.ts`（top comment 更新）
- `schemas/proposed/promptTemplate.ts` → `schemas/promptTemplate.ts`（top comment 更新）
- `schemas/proposed/campaignPlan.ts` → `schemas/campaignPlan.ts`（top comment 更新）

各 file の冒頭 `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` を `// Active schema (activated 2026-05-14, batch 0096).` に書き換え、`_design-*.md` への参照は `(design sketch, retained for reference)` として保持。

### Modified

- `schemas/index.ts` — 4 件 import 追加 + `schemaTypes` array に追加（既存 12 件 → brandProfile → visualStyleProfile → promptTemplate → campaignPlan、合計 16 件）
- `structure/index.ts` — `allDocumentTypes` array に 4 件追加（Brand Profiles / Visual Style Profiles / Prompt Templates / Campaign Plans）

### Added

- `docs/devlog/0096-activate-campaign-generation-schemas.md`
- `docs/handoff/0107-activate-campaign-generation-schemas.md`

### Modified (mirror)

- `docs/handoff/latest.md`（本 0107 にミラー）

### Confirmed unchanged

- `sanity.config.ts`
- `tools/` / `package.json` / `package-lock.json`
- 既存 active 12 schemas
- `schemas/proposed/` の残存物: `README.md` / `_design-brandProfile.md` / `_design-campaignPlan.md` / `_design-promptTemplate.md` / `_design-visualStyleProfile.md` / `substackPaidReadiness.ts` / `substackSubscriberMilestone.ts`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- DNS / hosting / Auth: いずれも未変更

## 4. Summary of Changes

### A. Rolling activation 結果

| Step | Activated | `npm run build` |
| --- | --- | --- |
| 1 | brandProfile | ✓ 7,461 ms |
| 2 | visualStyleProfile | ✓ 7,365 ms |
| 3 | promptTemplate | ✓ 7,195 ms |
| 4 | campaignPlan | ✓ 7,525 ms |
| 5 | structure/index.ts allDocumentTypes 追加 | ✓ 7,352 ms |

5 連続 green。schema 間の weak ref 解決は build 時には警告されない（dataset reference 検証は runtime / Studio で行われる）。

### B. schemas/index.ts 現状

active 16 type:

```
contentIdea (1)
prompt (2)
platformOutput (3)
diagramPlan (4)
visualAssetPlan (5)
workflow (6)
publishedOutput (7)
tool (8)
substackPublicationStrategy (9)
substackPostPlan (10)
substackNotesPlan (11)
substackGrowthAction (12)
brandProfile (13) ← new
visualStyleProfile (14) ← new
promptTemplate (15) ← new
campaignPlan (16) ← new
```

### C. structure/index.ts allDocumentTypes 現状

16 type:

```
Content Ideas / Prompts / Platform Outputs / Diagram Plans / Visual Asset Plans /
Workflows / Published Outputs / Tools / Substack Publication Strategies /
Substack Post Plans / Substack Notes Plans / Substack Growth Actions /
Brand Profiles / Visual Style Profiles / Prompt Templates / Campaign Plans
```

`directGroupedTypes`（"By Content Idea" view で子グループ表示する type のリスト）は **今回は変更しない**:

- campaignPlan は `sourceContentIdea` を ref として持つので、将来 directGroupedTypes に追加する余地あり
- promptTemplate / brandProfile / visualStyleProfile は contentIdea を ref しないので、"By Content Idea" 配下に置く意味がない
- 必要に応じて別バッチで判断

### D. Studio 表示確認 — 人間アクション待ち

**Claude Code 側では起動できない**ため、人間が次を実行:

```bash
npm run dev
```

Studio を開いて以下 4 type が表示されることを確認:

| Studio 表示名（schema.title） |
| --- |
| **ブランドプロファイル（Brand Profile）** |
| **ビジュアルスタイルプロファイル（Visual Style Profile）** |
| **プロンプトテンプレート（Prompt Template）** |
| **キャンペーン計画（Campaign Plan）** |

表示場所:

- **`By Type (flat)` → 上記 4 type が個別 listing として表示**（structure/index.ts の `allDocumentTypes` の末尾4件）
- **Content Ideas → By Content Idea → <slug>** 配下には今回出てこない（campaignPlan は ref を持つが directGroupedTypes 未追加）
- **default search** で type 名を打てば該当 type の document list に飛べる（dataset には document 0 件のため空 list）

各 type に対応する seed JSON は `seed/` に作成済だが、本バッチでは投入していない:

- `seed/brand-profile-hitori-media-os-default.json`
- `seed/visual-style-profile-hitori-media-os-x-hook-image.json`
- `seed/prompt-template-x-hook-image-diagram-rich-v1.json`
- `seed/campaign-plan-building-hitori-media-os.json`

### E. Validation Results

- `npm run build`: 5/5 green
- `npm run local:check`: ok: true（17 green / 0 fail、最終確認）
- direct Sanity write の grep: 0 hits
- paid LLM/image API client/SDK の repo 追加: 0 hits
- `npx sanity documents create` 実行: 0 回
- `seed --replace` 実行: 0 回
- 画像生成: 0 件
- `assets/visuals/` / `patches/` / `assets/inbox/`: 変更なし
- `sanity.config.ts`: 不変
- ai-blog-db 関連: 不変

## 5. Important Decisions

- **rolling activation**: 4 件まとめて activate せず、1 件ずつ build を確認しながら進める。失敗時の切り分けが容易。
- **`schemas/proposed/_design-*.md` は残す**: 設計史として retain、`.ts` 側に「(design sketch, retained for reference)」として参照を残す。
- **`structure/index.ts.allDocumentTypes` を更新**: Sanity の custom structure は明示リスト依存。新規 type を入れないと "By Type (flat)" に表示されない。Phase Admin 0 → 1 trigger の Studio 表示要件を満たすために必須。
- **`directGroupedTypes` は更新しない**: campaignPlan は将来 "By Content Idea" 子グループに追加候補だが、本バッチ scope 外。
- **`sanity.config.ts` を変更しない**: schema は `schemas/index.ts` 経由で取り込まれる。
- **seed は投入しない**: schema activate と data 投入を別バッチに分離。

## 6. Phase Admin 0 → 1 trigger 4 条件 — 最新

| 条件 | 状態 |
| --- | --- |
| 4 proposed schema activate | **[x] 完了**（本バッチで `schemas/index.ts` 登録 + `structure/index.ts` 追加 + build 5/5 green） ※ Studio 目視確認は人間アクション待ち |
| campaignPlan seed 投入 | **[ ] 未**（JSON 作成済、Sanity dataset には未投入） |
| Visual Register ≥ 2 production asset approve | **[x] 完了**（note-hero-v1 + x-hook-main-v1） |
| publish package distribution が X / note / Substack で動く | **[x] 完了**（hero + x-hook-main-v1） |

→ 残るは **seed 投入の 1 バッチ**で trigger 4 条件すべて達成。

## 7. Human Review Questions

- `npm run dev` で Studio を開き、4 type が "By Type (flat)" 配下に表示されるか確認できるか？
- Studio 表示名（日本語タイトル）は受け入れ可能か、英語に統一したい場合は schema title を別バッチで調整するか？
- 次バッチで 4 seed を Sanity に投入する判断は今でよいか？（依存順: brandProfile → visualStyleProfile → promptTemplate → campaignPlan）
- `directGroupedTypes` に `campaignPlan` を追加して "Content Ideas → By Content Idea → Campaign Plans" view も作るか？（別バッチ）

## 8. Risks or Uncertainties

- **Studio 目視確認まで完全 trigger 完了とは断言できない**: build pass + index.ts register + structure 追加までは Claude Code から確認できるが、Studio UI 上の display は人間しか確認できない。形式上「pending-human-confirm」を本 handoff に記す。
- **seed 投入時の reference 整合**: `contentIdea.building-hitori-media-os` が dataset に既存である前提。未投入なら先に contentIdea seed から投入が必要。campaignPlan seed は `sourceContentIdea` を strong ref で持つので、未存在 ref は validation error の可能性。
- **promptTemplate / visualStyleProfile / campaignPlan の weak ref 解決**: `brandProfile.hitori-media-os-default` document が dataset に未投入だと、Studio で「Reference unresolved」警告が出る。投入順序で回避可能。
- **既存 visualAssetPlan / platformOutput と campaignPlan.requiredRecords の整合**: seed の `requiredRecords` は string ID 配列なので runtime validation は無い。typo が混入すると後で気付く構造。次バッチで GROQ で整合 check する script があると安心。

## 9. Recommended Next Step

### Immediate Human Actions

1. **`npm run dev` で Studio を開く**
2. "By Type (flat)" を開いて **4 新規 type が表示されることを確認**:
   - ブランドプロファイル（Brand Profile）
   - ビジュアルスタイルプロファイル（Visual Style Profile）
   - プロンプトテンプレート（Prompt Template）
   - キャンペーン計画（Campaign Plan）
3. 各 type をクリックして空の document list が出ることを確認（dataset には未投入）
4. 表示に違和感がなければ、次バッチへ進む判断

### Next Implementation Batches（推奨順）

1. **4 seed を Sanity に投入するバッチ**（依存順: brandProfile → visualStyleProfile → promptTemplate → campaignPlan、`npx sanity documents create` を 1 件ずつ、`--replace` 禁止）
2. **trigger 達成記録バッチ**（投入後、Phase Admin 0 → 1 trigger を `[x] 完了` に統合更新）
3. （任意・並走可）`structure/index.ts` の `directGroupedTypes` に `campaignPlan` を追加して "Content Ideas → By Content Idea → Campaign Plans" view を作る
4. （任意・並走可）`tools/codex-workflow/` に Codex agent diff watcher script を追加（[devlog 0090](../devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md) の lesson）
5. **Phase Admin 0 → 1 trigger 4 条件達成後**: `docs/59-admin-phase-1-implementation-plan.md` を design batch
6. Next.js scaffold バッチ（最小限 app router + 1 画面 read-only）

### Mid-term

- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）の生成サイクル
- 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義する migration
- `tools/campaign-plan/derive-visual-asset-plans.mjs` 概念 sketch

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / dashboard charts

## 10. Exact Prompt to Give Codex Next

```text
Insert 4 seeds into Sanity dataset in dependency order via `npx sanity documents create`.

Hard Rules:
- Insert in this exact order:
  1. seed/brand-profile-hitori-media-os-default.json
  2. seed/visual-style-profile-hitori-media-os-x-hook-image.json
  3. seed/prompt-template-x-hook-image-diagram-rich-v1.json
  4. seed/campaign-plan-building-hitori-media-os.json
- Use `npx sanity documents create <path>` for each. Do NOT use `--replace`.
- Confirm `contentIdea.building-hitori-media-os` already exists in dataset before inserting campaign-plan seed.
- Do NOT modify the seed JSON files themselves.
- Do NOT call paid APIs.
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...
- Do NOT generate images.
- If any insert fails (e.g. _id collision, ref validation), STOP and report.

Use:
- seed/brand-profile-hitori-media-os-default.json
- seed/visual-style-profile-hitori-media-os-x-hook-image.json
- seed/prompt-template-x-hook-image-diagram-rich-v1.json
- seed/campaign-plan-building-hitori-media-os.json
- docs/handoff/0107-activate-campaign-generation-schemas.md
- docs/55-proposed-campaign-plan-schema.md

Workflow:
1. Confirm `contentIdea.building-hitori-media-os` exists in dataset (Studio or GROQ).
2. Insert each seed file in the order above with `npx sanity documents create <path>`.
3. After each insert, open Studio and confirm the new document appears.
4. After all 4 inserts, confirm campaignPlan's references resolve (brandProfile / sourceContentIdea).
5. Run `git diff --stat` at the end. Confirm only docs/devlog/ + docs/handoff/ + docs/handoff/latest.md touched.
6. Update docs/devlog/0097-insert-campaign-generation-seeds.md and docs/handoff/0108-...
   with: which IDs created, validation results, Phase Admin trigger now fully satisfied.

End-of-run output:
- list of _id created
- Studio rendering confirmation for each
- git diff --stat summary
```
