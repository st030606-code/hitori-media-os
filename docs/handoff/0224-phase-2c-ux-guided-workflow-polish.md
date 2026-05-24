# Handoff: Phase 2C-UX Guided Workflow Polish

Date: 2026-05-23

## 1. Task Goal

Polish `/ideas` and `/configurator` into clearer guided no-API workflow screens after the Phase 2C E2E audit recommended **B. PASS after UX polish**.

This batch improves clarity only. It does not add new capabilities or change write semantics.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not add new write surfaces.
- Did not write to Sanity during implementation.
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
- Kept Phase 2B and Phase 2C behavior intact.

## 3. Changed Files

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

## 4. Summary of Changes

Added display-only workflow helpers:

- `WorkflowBadge`
- `WorkflowStepHeader`
- `NextActionCard`
- `WorkflowNotice`

Updated `/ideas`:

- Added Step 0 overview.
- Added local / Sanity / manual AI / no API badges.
- Normalized button labels around preview, local save, and Sanity create.
- Added next action cards after idea package creation and AI result save.
- Clarified that result save is local-only and Content Idea create is the Sanity write.

Updated `/configurator`:

- Added current target context header with Content Idea title, slug, selected platform, and outputType.
- Added clearer Step 1-7 flow labels.
- Normalized action labels to Japanese.
- Added local-vs-Sanity save explanations.
- Added no-AI-execution and no-image-generation notices.
- Kept context binding and all server action wiring unchanged.

## 5. Key Decisions

- Kept this as UI/copy/layout only.
- Did not introduce a new route or new workflow engine.
- Kept technical file names visible, but paired them with clearer storage destination text.
- Kept `platformOutput` and `visualAssetPlan` technical names where they are the actual Sanity document types, but made the user-facing action labels clearer.

## 6. Validation

Build validation requested:

- `cd dashboard && npm run build`
- `npm run build`

Status:

- `cd dashboard && npm run build`: PASS. Existing Turbopack NFT warning remains for `next.config.ts` / `publishPackageReader.ts`.
- `npm run build`: PASS. Sanity Studio build completed.

## 7. Manual Smoke Checklist

- `/ideas` opens.
- Step 0 overview appears.
- Prompt package preview/create still works.
- Prompt package success shows next action card.
- AI result import preview/save still works.
- Result save success points to Content Idea creation.
- Content Idea create preview/execute still works or duplicate blocks as before.
- `/configurator` opens.
- Context header shows selected Content Idea title, slug, platform, outputType.
- Only selected Content Idea generation jobs are shown.
- Step 3 generation package preview/create still works.
- Step 4 generated output import preview/save still works.
- Step 5 platformOutput preview/create/duplicate still works.
- Step 6 visual brief preview/save still works.
- Step 7 visualAssetPlan preview/create/duplicate still works.
- No external AI API call.
- No dashboard shell execution.
- No image generation.
- No schema change.

## 8. Risks or Uncertainties

- This is a UX clarity pass, so boss smoke should focus on comprehension as much as function.
- Some internal labels such as `platformOutput`, `visualAssetPlan`, `draft.md`, and `job.json` intentionally remain because they identify real artifacts/doc types.
- Existing dirty worktree files outside this batch remain user-owned.

## 9. Recommended Next Step

Boss smoke-tests Phase 2C-UX. If clear and functional, record Phase 2C-UX PASS and then decide whether Phase 2C E2E can be marked PASS.

## 10. Exact Prompt to Give Codex Next

```text
Record Phase 2C-UX guided workflow polish smoke PASS and sync specs.

Context:
Codex implemented Phase 2C-UX in handoff/0224.
Boss smoke-tested /ideas and /configurator.

Goal:
Record Phase 2C-UX PASS if the guided workflow is clear and no functional regressions were found.

Hard rules:
- Docs only.
- Do not modify runtime code.
- Do not modify Sanity schema.
- Do not write to Sanity.
- Do not add packages.
```
