# Devlog 0210: Phase 2C Configurator Context Binding Fix

Date: 2026-05-23

## Summary

Fixed a `/configurator` context mismatch issue found during Phase 2C-6 smoke testing.

The top-level Content Idea selector could show `obsidian-ai-sanity`, while downstream sections still allowed selecting a generation job from another slug such as `ai / note / 20260522-131751`. That made it possible to create valid Sanity documents for the wrong content context.

This batch binds downstream Phase 2C operations to the selected top-level Content Idea.

## Root Cause

`recentGenerationJobs` was passed to `GeneratedOutputImportCard` without filtering by the selected Content Idea slug. Downstream cards then used the selected generation job as their source of truth, even if it belonged to a different Content Idea.

## Changes

- Added selected Content Idea context in `/configurator`:
  - `selectedContentIdeaId`
  - `selectedContentIdeaSlug`
  - `selectedContentIdeaTitle`
- Filtered generation jobs to `job.contentIdeaSlug === selectedContentIdeaSlug`.
- Reset downstream job state when the top-level Content Idea changes.
- Added context indicators near downstream cards.
- Added match / mismatch display for selected jobs.
- Disabled preview/create/save actions when selected Content Idea and job slug differ.
- Added server action mismatch guards returning `content-idea-mismatch`.

## Guarded Server Actions

- `saveGeneratedOutputDraft`
- `createPlatformOutputFromDraft`
- `extractVisualBriefFromDraft`
- `createVisualAssetPlanFromBrief`

Each action now accepts `selectedContentIdeaSlug` and rejects mismatches before any local file write or Sanity write.

## Boundaries

- No Sanity schema change.
- No Sanity document deletion.
- No asset / patch / tool / publish-package changes.
- No package additions.
- No external API calls.
- Existing `visualAssetPlan.ai.note.inline-visual-1` remains untouched as a test artifact.

## Validation

- `cd dashboard && npm run build`: PASS
- `npm run build`: PASS

Dashboard build still emits the existing Turbopack NFT trace warning related to `publishPackageReader.ts`; build completes successfully.
