# Devlog 0208: Phase 2C-6 Visual Brief Extraction + visualAssetPlan Creation

Date: 2026-05-22

## Summary

Implemented Phase 2C-6 so generated output that contains both text draft and visual planning can be split into two records:

```text
platformOutput = text/content output
visualAssetPlan = diagram/image/thumbnail planning
```

This keeps `draft.md` useful for text promotion while allowing visual brief / image prompt sections to be separated into local `visual-brief.md` / optional `visual-brief.json`, then registered as a Sanity `visualAssetPlan`.

Status: implemented, awaiting boss smoke test. This is not a smoke PASS record.

## visualAssetPlan Schema Inventory

Required fields observed in `schemas/visualAssetPlan.ts`:

- `sourceContentIdea`: reference to `contentIdea`
- `title`: string
- `purpose`: text
- `targetPlatform`: enum
- `placement`: string
- `assetType`: enum
- `aspectRatio`: enum
- `reusePolicy`: enum
- `status`: enum
- `imagePrompt`: text
- `generationMode`: enum
- `generationProvider`: enum
- `apiEnabled`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

Important optional fields:

- `pairedPlatformOutput`: reference to `platformOutput`
- `textToInclude`: string array
- `textToAvoid`: string array
- `visualDirection`: text
- `reviewNotes`: text
- `expectedLocalAssetPath`: string
- `localAssetPath`: string, intentionally not set in this phase
- `taskFilePath`: string
- `publishPackagePath`: string
- `generationJobId`: string
- `sourcePromptVersion`: string
- `automationNotes`: text

Enum values used:

- `targetPlatform`: `note`, `substack`, `x`, `threads`, `instagram`, `youtube`, `shorts`, `podcast`, `github`, `paid`, `newsletter`
- `assetType`: `hero`, `eye-catch`, `section-diagram`, `comparison-diagram`, `flow-diagram`, `architecture-diagram`, `schema-diagram`, `pipeline-diagram`, `carousel-cover`, `carousel-slide`, `hook-image`, `thumbnail`, `paired-post-visual`, `summary-diagram`, `cta-visual`
- `aspectRatio`: `16:9`, `1:1`, `4:5`, `9:16`
- `status`: new plan uses `planned`, never `saved`, `approved`, or `published`
- `generationMode`: `manual`
- `generationProvider`: `chatgpt-manual`

## Key Decisions

- `job.json` / generation job path remains the platform source of truth.
- Detected visual labels can identify visual sections but cannot override platform.
- `visualAssetPlan.localAssetPath` is not set because no image file exists yet.
- `expectedLocalAssetPath` is only a future target string; this batch does not touch `assets/`.
- Existing `platformOutput` is only read for optional `pairedPlatformOutput`.
- Duplicate `visualAssetPlan` create is blocked by deterministic id.

## Runtime Boundaries

- No Sanity schema changes.
- No image generation.
- No external LLM/image API calls.
- No shell execution or subprocess use.
- No `campaignPlan`, `publishedOutput`, or `manualPublishingStatus` mutation.
- No `assets/`, `patches/`, `tools/`, or `publish-package` changes.
- Local writes are only under `generation-jobs/` and only `.md` / `.json`.

## Validation

- `cd dashboard && npm run build`: PASS
- `npm run build`: PASS

Dashboard build emitted the existing Turbopack NFT trace warning around `publishPackageReader.ts`; the build completed successfully.
