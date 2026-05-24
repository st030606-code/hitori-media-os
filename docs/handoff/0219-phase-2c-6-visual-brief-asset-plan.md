# Handoff: Phase 2C-6 Visual Brief Extraction + visualAssetPlan Creation

Date: 2026-05-22

## 1. Task Goal

Implement a controlled flow that separates visual planning from generated text output:

```text
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md
→ extract visual brief sections
→ save visual-brief.md / optional visual-brief.json
→ preview visualAssetPlan
→ create one Sanity visualAssetPlan
```

This is visual planning only. It does not generate images, upload files, or run Visual Register.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not generate images.
- Did not call OpenAI / Anthropic / image APIs.
- Did not execute shell commands from dashboard.
- Did not spawn Claude Code / Codex.
- Did not modify `assets/`, `patches/`, `tools/`, or publish-package files.
- Did not create `campaignPlan` or `publishedOutput`.
- Did not modify `manualPublishingStatus`.
- Did not modify `platformOutput`; only optional read/reference is used.
- Did not add packages.
- Local writes are gated by `enableWriteActions` + `enableLocalFsRoutes`.
- Sanity writes are gated by `enableWriteActions` + `SANITY_WRITE_TOKEN`.

## 3. Changed Files

- `dashboard/src/lib/generationJobs/paths.ts`
- `dashboard/src/lib/generationJobs/reader.ts`
- `dashboard/src/lib/generationJobs/visualBriefExtractor.ts`
- `dashboard/src/lib/generationJobs/visualAssetPlanMapper.ts`
- `dashboard/src/lib/actions/extractVisualBriefFromDraft.ts`
- `dashboard/src/lib/actions/createVisualAssetPlanFromBrief.ts`
- `dashboard/src/lib/sanity.ts`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/components/configurator/GenerationPackageCard.tsx`
- `dashboard/src/components/configurator/GeneratedOutputImportCard.tsx`
- `dashboard/src/components/configurator/VisualBriefExtractionCard.tsx`
- `dashboard/src/components/configurator/VisualAssetPlanCreateCard.tsx`
- `docs/devlog/0208-phase-2c-6-visual-brief-asset-plan.md`
- `docs/handoff/0219-phase-2c-6-visual-brief-asset-plan.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 4. Summary of Changes

Added a Phase 2C-6 section in `/configurator`:

- **Visual Briefを抽出**
  - Reads selected `generation-jobs/.../draft.md`.
  - Detects Japanese/English visual brief labels.
  - Previews visual brief excerpt, detected fields, placement, asset type, aspect ratio, and image prompt.
  - Saves `visual-brief.md` and optional `visual-brief.json` under the same generation job.

- **Visual Asset PlanをSanityに作成**
  - Builds schema-aligned `visualAssetPlan` from the visual brief.
  - Uses job metadata/path platform as source of truth.
  - Optionally references the existing `platformOutput` when found by `localOutputPath`.
  - Blocks duplicate create by deterministic id.
  - Links to Studio via `/structure/by-type;by-type-visualAssetPlan;<documentId>`.

## 5. visualAssetPlan Schema Inventory

Required fields:

- `sourceContentIdea`
- `title`
- `purpose`
- `targetPlatform`
- `placement`
- `assetType`
- `aspectRatio`
- `reusePolicy`
- `status`
- `imagePrompt`
- `generationMode`
- `generationProvider`
- `apiEnabled`
- `createdAt`
- `updatedAt`

Key enum choices:

- `status`: uses `planned`
- `generationMode`: uses `manual`
- `generationProvider`: uses `chatgpt-manual`
- `targetPlatform`: uses schema values only
- `assetType`: uses schema values only
- `aspectRatio`: uses `16:9`, `1:1`, `4:5`, or `9:16`

`localAssetPath` is intentionally not written because no image exists yet.

## 6. Key Decisions

- `platformOutput` remains text/content output.
- `visualAssetPlan` owns diagram/image/thumbnail planning.
- `draft.md` can contain mixed text + visual sections, but 2C-6 gives boss a clean extraction path.
- No generated section detection is allowed to override `job.json` platform metadata.
- `expectedLocalAssetPath` may be populated as a future target string; no asset file is created.
- Duplicate `visualAssetPlan` creation is blocked; updates are later.

## 7. Validation

- `cd dashboard && npm run build`: PASS
- `npm run build`: PASS

Known build warning:

- Dashboard build still emits the existing Turbopack NFT trace warning related to `publishPackageReader.ts`; build completes successfully.

## 8. Manual Smoke Checklist

- `/configurator` opens.
- Select a generation job with `draft.md` containing a visual brief.
- Preview visual brief works.
- Save `visual-brief.md` works.
- `visual-brief.json` is created if structured fields are detected.
- Copy image prompt works.
- Preview `visualAssetPlan` works.
- Create `visualAssetPlan` works.
- Sanity Studio shows the `visualAssetPlan`.
- `sourceContentIdea` references the correct contentIdea.
- `pairedPlatformOutput` references the created platformOutput if resolver finds it.
- `status` is `planned`, not `saved` / `approved` / `published`.
- No image files are created.
- `assets/` and `patches/` remain untouched.
- No external image API call.
- Existing platformOutput flow still works.

## 9. Risks or Uncertainties

- Visual brief extraction is heuristic and intentionally permissive. Markdown-only visual briefs are valid.
- If the generated output has no visual section, boss should ask AI to regenerate only the visual brief and paste/save it again.
- `pairedPlatformOutput` depends on matching `platformOutput.localOutputPath` to the generation job `draft.md` path.

## 10. Recommended Next Step

Boss smoke-tests Phase 2C-6 using a generation job whose `draft.md` includes visual brief / image prompt text.

## 11. Exact Prompt to Give Codex Next

```text
Record Phase 2C-6 Visual Brief Extraction + visualAssetPlan Creation smoke PASS and sync specs.

Context:
Codex implemented Phase 2C-6 in handoff/0219.
Boss manually smoke-tested /configurator.

Goal:
Record the confirmed smoke results, mark Phase 2C-6 PASS if verified, and sync specs.

Docs only. Do not modify runtime code.
```
