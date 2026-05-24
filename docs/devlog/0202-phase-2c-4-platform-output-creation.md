# Devlog 0202 — Phase 2C-4 Platform Output Creation

Date: 2026-05-22

## Summary

Implemented Phase 2C-4: saved `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md` can now be previewed and promoted to one Sanity `platformOutput` document from `/configurator`.

This is a controlled Sanity create, not publishing automation. It does not create `campaignPlan`, does not create `publishedOutput`, and does not mark anything as published.

## platformOutput Schema Inventory

Actual `schemas/platformOutput.ts` requires:

- `sourceContentIdea`: reference to `contentIdea`, required
- `platform`: string enum, required
- `outputType`: string enum, required
- `draftBody`: text, required
- `status`: string enum, required, initial value `drafted`
- `generatedFromPrompt`: reference to `prompt`, required

Optional fields used by Phase 2C-4:

- `title`
- `localOutputPath`
- `reviewNotes`
- `outputLength`
- `targetFormat`
- `primaryCTA`
- `contentStatus`

Important schema constraint: `generatedFromPrompt` is required. Generation package `job.json` does not currently store a Sanity `prompt` reference, so Phase 2C-4 resolves an existing `prompt` document by metadata if present, then by matching `targetPlatform` + schema `outputType`, then by safe fallback to an existing prompt. If no prompt exists, create is blocked rather than writing an invalid `platformOutput`.

## Changes

- Added `platformOutputMapper` to map generation job metadata + `draft.md` to schema-aligned `platformOutput`.
- Added `createPlatformOutputFromDraft` server action.
- Added `/configurator` card: `Platform OutputをSanityに作成`.
- Wired Generated Output Import so the selected/saved generation job is available to the Platform Output create card immediately.
- Added Studio root URL helper for cases where a reliable platformOutput structure deep-link is not known.

## Safety

- Uses `job.json` / generation job metadata as source of truth for platform and output type.
- Does not infer platform from detected sections in generated markdown.
- Reads local files only via existing `generationJobs/reader`.
- Writes to Sanity only on execute, only with `enableWriteActions` and `SANITY_WRITE_TOKEN`.
- Creates exactly one `platformOutput`.
- Blocks duplicates by deterministic `_id` and `localOutputPath`.
- Logs metadata only.

## Validation

- `cd dashboard && npm run build`: passed.
- `npm run build`: passed.
- Existing Turbopack NFT warning remains unrelated to this batch.

## Status

Phase 2C-4 implementation landed and is awaiting boss smoke test.
