# Handoff: Proposed campaignPlan schema + building-hitori-media-os seed

Date: 2026-05-14
Status: **proposed-schema-and-seed-created / not-activated / not-inserted**

## 1. Task Goal

[`docs/48-campaign-generation-flow.md`](../48-campaign-generation-flow.md) と [`docs/49-platform-selection-model.md`](../49-platform-selection-model.md) の設計を、proposed `campaignPlan` schema 1 件 + local-only seed 1 件として実装する。Studio activate / Sanity 投入は行わない。

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない（`npx sanity documents create` 0 回）。
- `seed --replace` を実行していない。
- `schemas/index.ts` を変更していない（既存 active 12 type のまま）。
- `sanity.config.ts` を変更していない。
- 既存 active schemas を破壊的に変更していない（差分 0）。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/` 既存ファイルを変更していない。
- Visual Register Inbox Review を bypass していない。
- 既存 `campaign-hero-v1.png` / `v001.png` を変更していない。

## 3. Changed Files

### Added — Proposed schema（active 化なし）

- `schemas/proposed/campaignPlan.ts`

ファイル冒頭に `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメント。`schemas/index.ts` から import していない。

### Added — Seed（local-only、Sanity 投入なし）

- `seed/campaign-plan-building-hitori-media-os.json`

### Added — Docs

- `docs/55-proposed-campaign-plan-schema.md`
- `docs/devlog/0093-proposed-campaign-plan-schema.md`
- `docs/handoff/0104-proposed-campaign-plan-schema.md`

### Modified

- `docs/handoff/latest.md`（本 0104 にミラー）

### Confirmed unchanged

- `schemas/index.ts`
- `sanity.config.ts`
- `structure/index.ts`
- 既存 active 12 schemas（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy / substackPostPlan / substackNotesPlan / substackGrowthAction）
- 既存 `schemas/proposed/` の `substackPaidReadiness.ts` / `substackSubscriberMilestone.ts` / `brandProfile.ts` / `visualStyleProfile.ts` / `promptTemplate.ts` / `_design-*.md` / `README.md`
- `tools/` / `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/generated/.../v001.png`

## 4. Summary of Changes

### A. proposed `campaignPlan` schema

主フィールド（400+ 行）:

- 基本: title / slug / sourceContentIdea (strong ref to contentIdea) / brandProfile (weak ref to PROPOSED brandProfile) / campaignType (7 enum) / contentMode (6 enum) / coreThesis / targetReader / version / status (6 enum) / notes / createdAt / updatedAt
- **selectedPlatforms[]**: object 配列、9 フィールド: platform / enabled / priority (P0-P3) / contentDepth (4 enum) / visualRequirement (4 enum) / publishMode (3 enum) / productionMode (3 enum) / cadence (5 enum) / requiredAssets / optionalAssets / notes
- **platformGenerationSettings[]**: platform / generationOrder / dependsOn / sharedMasterAssets / specialInstructions（master 共有を表現）
- **requiredRecords[]**: cross-type record ID（platformOutput / substackPostPlan / visualAssetPlan / etc）を string ID で管理、state (6 enum)
- **requiredVisualAssets[]**: visualAssetPlan ID + assetSlug + sharesMasterWith + state + localAssetPath
- **promptTemplateSelections[]**: campaign が使う promptTemplate ID + category + platform + assetType
- **publishPackagePaths[]**: platform 別 publish-packages directory path + state
- **releaseReviewPath**: release-review directory path
- **progressStatus**: overall / textDrafts / visuals / publishPackages / releaseReview の進捗 string
- **humanReviewGates[]**: gateName / state / reviewer / completedAt / notes（人間判断 9 段を record 化）
- **manualPublishingStatus[]**: platform / publishedUrl / publishedAt / reactionNotes / state
- **automationLevel**: manual / semi-auto / auto-eligible

### B. seed `campaignPlan.building-hitori-media-os`

`docs/49` Example B を完全実装 + 現状を反映:

- selectedPlatforms: X (P1, hook-only, minimal visual) / Threads (P2, summary, minimal) / note (P1, full-article, standard) / Substack (P1, full-article, standard)
- platformGenerationSettings: note → substack → x → threads の生成順、note hero master を substack header と共有
- requiredRecords: 14 件（4 platformOutput / 3 Substack plan / 7 visualAssetPlan）
- requiredVisualAssets: 7 件、note-hero-v1 / substack-header-v1 は `done`、x-hook-main-v1 は `pending-review`（v001.png 生成済）、残り 4 件 `not-started`
- promptTemplateSelections: `promptTemplate.x-hook-image-diagram-rich-v1` を x-hook-main-v1 に
- publishPackagePaths: 4 platform directory + release-review
- humanReviewGates: 9 段、既完了 4 / `pending-review` 1 / `in-progress` 1 / `not-started` 3
- manualPublishingStatus: 4 platform 全部 `not-started`
- automationLevel: `semi-auto`

### C. Validation Results

- `schemas/index.ts` の grep で `campaignPlan`: **0 hits**（未 import）
- `sanity.config.ts` の grep で同上: **0 hits**
- `npm run build`: **成功**（proposed schemas は build pipeline に乗らない）
- `npm run local:check`: **ok: true**（17 green / 0 fail）
- JSON validity: seed 1/1 OK
- direct Sanity write の grep: 0 hits
- paid LLM/image API client/SDK の repo 追加: 0 hits
- Sanity CLI auto-exec in tools/scripts: 0 hits
- 画像生成: 0 件
- `assets/visuals/` / `patches/` / 既存 inbox: 不変

## 5. Important Decisions

- **cross-type 参照を `string ID` で持つ**: requiredRecords / requiredVisualAssets / promptTemplateSelections は複数 schema を指すため、Sanity reference 型ではなく string ID にした。検証は別 layer（GROQ query や runner script）で行う想定。
- **humanReviewGates を専用 array にする**: 人間判断 9 段を 1 record 内に集約。`state == "pending-review"` を全 campaign から集めれば「今 boss 待ち」リスト。
- **manualPublishingStatus を別フィールド化**: 公開証跡を独立に持つことで、将来 automation が入っても本フィールドの意味が変わらない。
- **既存 4 proposed schema との同時 activate を推奨**: brandProfile / visualStyleProfile / promptTemplate / campaignPlan は相互依存のため、activate は 4 件まとめて。
- **campaignType を 7 enum で固定**: release-review / build-log / educational / paid-readiness / case-study / launch / milestone。Hitori Media OS の運用に合わせた切り口。

## 6. Human Review Questions

- selectedPlatforms に「将来 X だけ priority を P2 に下げる」運用が来た場合、campaignPlan の version を bump して新規 record にするか、in-place で書き換えるか？
- requiredRecords の state（in-progress / pending-review / done / blocked / skipped）の遷移ルールは GROQ 側だけで管理するか、tool 側に validation を入れるか？
- humanReviewGates の `reviewer` を「self」固定で十分か、将来 editor / external reviewer を分離する必要があるか？
- brandProfile / visualStyleProfile / promptTemplate / campaignPlan の **4 proposed schema を同時 activate する** タイミングはいつか？

## 7. Risks or Uncertainties

- **cross-type string ID が typo で壊れる可能性**: GROQ query で「ID が指す document が存在するか」を runtime に検証する layer が必要（次バッチ以降）。
- **既存 active schemas が将来変更されたとき、requiredRecords の整合が崩れるリスク**: 例えば visualAssetPlan が rename されると、campaignPlan の requiredRecords[].recordId が古いまま残る。
- **selectedPlatforms 内の `enabled: false` の扱い**: schema 上は許可しているが、runner script で「無効な platform は生成スキップ」のロジックを明示する必要。
- **brandProfile / visualStyleProfile / promptTemplate / campaignPlan の同時 activate 時に依存順を間違える危険**: 順序 = brandProfile → visualStyleProfile → promptTemplate → campaignPlan。

## 8. Recommended Next Step

### Immediate Human Actions

- `schemas/proposed/campaignPlan.ts` を読み、`requiredRecords[]` / `humanReviewGates[]` / `manualPublishingStatus[]` の構造が運用に合うか確認
- `seed/campaign-plan-building-hitori-media-os.json` を読み、`requiredRecords` の14件と `requiredVisualAssets` の7件が現状を正確に反映しているか確認
- 4 proposed schema を Studio activate する判断のタイミングを決める

### Next Implementation Batches

1. **4 proposed schema を Studio activate する判断バッチ**（brandProfile → visualStyleProfile → promptTemplate → campaignPlan、seed 4 件を依存順で投入、Studio で 4 type が表示されることを確認）
2. （任意）`structure/index.ts` 拡張: "By Campaign" 子ノードを追加（campaignPlan を起点に requiredRecords / requiredVisualAssets を表示）
3. （任意）`tools/campaign-plan/derive-visual-asset-plans.mjs` の概念 sketch（selectedPlatforms[].requiredAssets から visualAssetPlan を derive、--dry-run のみ）
4. （任意）`tools/campaign-plan/validate-required-records.mjs`（cross-type ID の存在検証）
5. 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義する migration（最後）

### Mid-term

- Visual Register Inbox Review UI に reviewRubric + humanReviewGates の state 反映
- automated diff watcher（Codex agent の overreach 検査、`tools/codex-workflow/`）

### Deferred

- paid LLM / image generation API integration
- auto-posting
- structure builder の "By Brand" / "By Campaign Type" 表示
- A/B test of prompts

## 9. Exact Prompt to Give Codex Next

```text
Activate the 4 proposed schemas in Studio in dependency order, then verify Studio renders them.

Hard Rules:
- Activate in this exact order: brandProfile → visualStyleProfile → promptTemplate → campaignPlan.
- After each activation, run `npm run build` and confirm success before moving to the next.
- Do NOT touch any other schema file.
- Do NOT call paid APIs.
- Do NOT run `npx sanity documents create` yet (seed insertion is a separate step).
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...

Use:
- schemas/proposed/brandProfile.ts
- schemas/proposed/visualStyleProfile.ts
- schemas/proposed/promptTemplate.ts
- schemas/proposed/campaignPlan.ts
- schemas/index.ts
- sanity.config.ts

Workflow:
1. Move (or copy + delete proposed) each proposed schema into schemas/, in dependency order.
2. Update schemas/index.ts to import and export each new type, in dependency order.
3. Update sanity.config.ts only if structure changes are required (typically not needed).
4. After each step: `npm run build` and confirm success.
5. After all 4 are active: `npm run dev`, open Studio, confirm 4 new types appear in "By Type (flat)" view.
6. Run `git diff --stat` at the end. Report which files changed.
7. Do NOT yet insert any seed file. Stop and report status.

End-of-run output:
- list of files moved / modified
- npm run build result per step
- Studio rendering confirmation
- git diff --stat summary
```
