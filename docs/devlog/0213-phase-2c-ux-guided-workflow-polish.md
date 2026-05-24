# Devlog 0213: Phase 2C-UX Guided Workflow Polish

Date: 2026-05-23

## Summary

Implemented Phase 2C-UX guided workflow polish for `/ideas` and `/configurator`.

This batch does not add capabilities. It improves clarity, sequence, labels, storage destination visibility, and no-API guidance for the already working Phase 2C flow.

Status: **implemented, awaiting boss smoke**.

## Files Changed

- `dashboard/src/components/common/WorkflowGuide.tsx`
- `dashboard/src/app/ideas/page.tsx`
- `dashboard/src/components/ideas/RawIdeaBuilder.tsx`
- `dashboard/src/components/ideas/IdeaJobList.tsx`
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
- `dashboard/src/app/configurator/page.tsx`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx`
- `dashboard/src/components/configurator/PlatformAndOutputTypeCard.tsx`
- `dashboard/src/components/configurator/ToneAndCtaCard.tsx`
- `dashboard/src/components/configurator/AdvancedOptionsCard.tsx`
- `dashboard/src/components/configurator/GenerationPackageCard.tsx`
- `dashboard/src/components/configurator/GeneratedOutputImportCard.tsx`
- `dashboard/src/components/configurator/PlatformOutputCreateCard.tsx`
- `dashboard/src/components/configurator/VisualBriefExtractionCard.tsx`
- `dashboard/src/components/configurator/VisualAssetPlanCreateCard.tsx`
- `docs/devlog/0213-phase-2c-ux-guided-workflow-polish.md`
- `docs/handoff/0224-phase-2c-ux-guided-workflow-polish.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`

## UX Changes

### Common helpers

Added small display-only helpers:

- `WorkflowBadge`
- `WorkflowStepHeader`
- `NextActionCard`
- `WorkflowNotice`

These are UI-only helpers. They do not touch server action inputs, write behavior, path validation, duplicate checks, or Sanity payloads.

### /ideas

Added a Step 0 overview:

- 0-1 仮アイデアを書く
- 0-2 プロンプトを作る
- 0-3 AI結果を取り込む
- 0-4 Sanityに作成

Added / normalized:

- storage badges for local / Sanity destinations
- AI/manual/API-not-used badges
- clearer `Preview` -> `プレビュー` labels
- clearer local result save labels
- next action cards after package creation and result save
- Content Idea creation copy that emphasizes Sanity write and preview-before-create

### /configurator

Added a context header:

- current Content Idea title
- slug
- selected platform
- outputType
- note that only generation jobs tied to the selected Content Idea are handled

Renamed workflow cards:

- Step 1 元アイデアを選ぶ
- Step 2 出力条件を決める
- Step 3 生成プロンプトパッケージ
- Step 4 AI生成結果を取り込む
- Step 5 出力データをSanityに保存
- Step 6 図解案を抽出する
- Step 7 図解プランをSanityに作成

Normalized action labels:

- `Preview generation prompt` -> `生成プロンプトをプレビュー`
- `Create generation package` -> `生成パッケージを作成`
- `Copy prompt` -> `プロンプトをコピー`
- `Copy codex command` -> `Codexコマンドをコピー`
- `Copy claude command` -> `Claudeコマンドをコピー`
- `Preview generated output` -> `生成結果をプレビュー`
- `Save draft` -> `下書きを保存`
- `Preview platformOutput` -> `出力データをプレビュー`
- `Create platformOutput` -> `出力データをSanityに保存`
- `Preview visual brief` -> `図解案をプレビュー`
- `Save visual brief` -> `図解案を保存`
- `Preview visualAssetPlan` -> `図解プランをプレビュー`
- `Create visualAssetPlan` -> `図解プランをSanityに作成`

Added explicit notices:

- Dashboard does not run AI.
- Local cards write local files only.
- Sanity write cards require preview and user-triggered execution.
- Visual brief / visual asset plan cards do not generate images or write assets.

## Constraints Followed

- Did not modify Sanity schema.
- Did not add new write surfaces.
- Did not change server action semantics.
- Did not change path validation.
- Did not change context binding logic.
- Did not change duplicate logic.
- Did not change Sanity write fields.
- Did not change file write locations.
- Did not modify tools.
- Did not modify assets.
- Did not modify patches.
- Did not modify publish-package files.
- Did not add packages.
- Did not call external APIs.

## Build Validation

- `cd dashboard && npm run build`: PASS. Existing Turbopack NFT warning remains for `next.config.ts` / `publishPackageReader.ts`.
- `npm run build`: PASS. Sanity Studio build completed.

## Manual Smoke Checklist

- `/ideas` opens.
- Step 0 overview appears.
- Raw Idea form shows local/manual/no-API guidance.
- Prompt preview button says `プロンプトをプレビュー`.
- Idea package success shows next action card.
- Result import uses `AIの企画化結果を取り込む`.
- Result save success explains local-only save and next Content Idea action.
- Content Idea create panel shows Sanity badges and Japanese create labels.
- `/configurator` opens.
- Context header shows selected Content Idea title, slug, platform, outputType.
- Step 1 through Step 7 labels appear in order.
- Generation package card clearly says AI execution is manual.
- Generated output import clearly says local save only.
- PlatformOutput card clearly says Sanity save and preview-first.
- Visual brief card says local save and no image generation.
- VisualAssetPlan card says Sanity plan creation and no asset write.
- Existing `/ideas` and `/configurator` functional flows still work.

## Remaining Issues

- This is a UX polish implementation. Boss smoke is still required.
- Phase 2C E2E should not be marked PASS until boss confirms the guided workflow is understandable and does not regress the functional flow.

## Next Recommended Step

Boss smoke-tests `/ideas` and `/configurator` guided workflow, then record Phase 2C-UX PASS and proceed to final Phase 2C E2E PASS decision.
