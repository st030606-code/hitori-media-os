# Handoff: Phase 2C-4 Platform Output Creation

Date: 2026-05-22

## 1. Task Goal

Implement Phase 2C-4: promote a saved generation job draft to a Sanity `platformOutput` document.

Flow:

```text
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md
→ schema-aligned platformOutput draft
→ controlled Sanity platformOutput create
```

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not create `campaignPlan`.
- Did not create `publishedOutput`.
- Did not modify `manualPublishingStatus`.
- Did not mark anything as published.
- Did not call OpenAI / Anthropic APIs.
- Did not execute Claude Code / Codex.
- Did not add shell execution to dashboard.
- Did not modify tools, assets, patches, or publish-package files.
- Did not add packages.
- Kept writes behind `enableWriteActions` + `SANITY_WRITE_TOKEN`.
- Kept local reads allowlisted under `generation-jobs/`.

## 3. Changed Files

- `dashboard/src/lib/generationJobs/platformOutputMapper.ts`
- `dashboard/src/lib/actions/createPlatformOutputFromDraft.ts`
- `dashboard/src/components/configurator/PlatformOutputCreateCard.tsx`
- `dashboard/src/components/configurator/GeneratedOutputImportCard.tsx`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/lib/sanity.ts`
- `docs/devlog/0202-phase-2c-4-platform-output-creation.md`
- `docs/handoff/0213-phase-2c-4-platform-output-creation.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 4. platformOutput Schema Inventory

Required fields in actual schema:

- `sourceContentIdea`: reference to `contentIdea`
- `platform`: enum string
- `outputType`: enum string
- `draftBody`: text
- `status`: enum string, new draft uses `drafted`
- `generatedFromPrompt`: reference to `prompt`

Optional fields used:

- `title`
- `localOutputPath`
- `reviewNotes`
- `outputLength`
- `targetFormat`
- `primaryCTA`
- `contentStatus`

Important: `campaignPlan` is not part of the actual `platformOutput` schema, so Phase 2C-4 does not need or create one.

## 5. Mapper Behavior

`platformOutputMapper`:

- Uses `job.json` / generation job metadata as source of truth.
- Uses `draft.md` as the canonical draft body.
- Treats `draft.json` as supplemental metadata only.
- Does not let parser-detected sections override platform.
- Maps Phase 2C-2 generic output types such as `article` to schema enum values such as `note-article`.
- Writes source provenance only into schema-supported fields: `localOutputPath` and `reviewNotes`.
- Keeps non-schema provenance in returned preview metadata only.

## 6. Server Action Behavior

`createPlatformOutputFromDraft` supports:

- `mode: "preview"`:
  - validates the generation job path
  - requires `prompt.md`, `job.json`, and `draft.md`
  - fetches `contentIdea` by `slug.current`
  - resolves a required `prompt` reference if possible
  - returns schema checklist, planned id, duplicate status, source paths, warnings, and write readiness
  - does not write to Sanity
- `mode: "execute"`:
  - repeats reads/checks
  - requires `enableWriteActions` and `SANITY_WRITE_TOKEN`
  - blocks duplicate `_id` / `localOutputPath`
  - creates exactly one `platformOutput`
  - verifies `_id`, `sourceContentIdea`, `platform`, `outputType`, `status`, `generatedFromPrompt`, and `draftBody`

Deterministic id:

```text
platformOutput.<contentIdeaSlug>.<platform>.<timestamp>
```

## 7. Duplicate Handling

Duplicates are blocked by:

- deterministic `_id`
- `localOutputPath == generation-jobs/.../draft.md`

Phase 2C-4 does not update existing `platformOutput` documents.

## 8. UI Behavior

`/configurator` now has a `Platform OutputをSanityに作成` card.

The card:

- appears under Generated Output Import
- becomes actionable when the selected generation job has `draft.md`
- previews platform, output type, status, body length, planned id, prompt reference, duplicate status, and required checklist
- creates one `platformOutput` on execute
- shows duplicate / missing prompt reference as blocking states
- links to Studio root because a reliable platformOutput structure deep-link is not yet confirmed

## 9. Validation

Ran:

```text
cd dashboard && npm run build
npm run build
```

Result: passed.

Known unrelated build warning:

- Existing Turbopack NFT warning for `publishPackageReader.ts` trace remains.

## 10. Manual Smoke Checklist

Boss should verify:

- `/configurator` opens.
- Recent generation job with `draft.md` appears:
  `generation-jobs/obsidian-ai-sanity/note/20260522-114149/`
- Platform Output creation card appears.
- Preview platformOutput works.
- Preview uses job.json platform metadata as source of truth.
- Platform is `note` even if detected sections include `thread-posts`.
- Planned document id appears.
- Duplicate status appears.
- Required checklist appears.
- Execute creates one `platformOutput`.
- Sanity Studio shows created `platformOutput`.
- Status is `drafted`, not published.
- `sourceContentIdea` reference is correct.
- `generatedFromPrompt` reference is present, or create is blocked with a clear missing prompt message.
- `campaignPlan` is not created.
- `publishedOutput` is not created.
- `manualPublishingStatus` is not changed.
- Duplicate create is blocked.
- Existing `/ideas` and `/configurator` generation flows still work.

## 11. Remaining Issues

- Phase 2C-4 is implemented but not boss smoke PASS yet.
- `platformOutput` Studio deep-link path is not confirmed, so the UI uses Studio root rather than inventing a fragile document URL.
- Generation package `job.json` does not yet store a Sanity `prompt` reference. Create can still proceed if an existing prompt doc is resolved; otherwise it blocks safely.

## 12. Recommended Next Step

Boss smoke-test Phase 2C-4 with:

```text
generation-jobs/obsidian-ai-sanity/note/20260522-114149/
```

## 13. Exact Prompt to Give Codex Next

```text
Record Phase 2C-4 platformOutput creation smoke PASS and sync specs.

Context:
Codex implemented Phase 2C-4 in handoff/0213.
Boss manually smoke-tested /configurator.

Record whether:
- preview platformOutput works
- job.json platform is used as source of truth
- execute creates exactly one platformOutput
- duplicate create is blocked
- status remains drafted
- contentIdea reference is correct
- generatedFromPrompt is present or missing-prompt blocking behavior is acceptable
- no campaignPlan / publishedOutput / manualPublishingStatus mutation occurred
- no external LLM API or shell execution occurred

Docs only. Do not modify runtime code.
```
