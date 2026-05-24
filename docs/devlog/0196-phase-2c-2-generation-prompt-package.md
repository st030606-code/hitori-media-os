# Devlog 0196: Phase 2C-2 Generation Prompt Package

Date: 2026-05-22

## Summary

Implemented Phase 2C-2: a no-API generation prompt package flow from an existing Sanity `contentIdea`.

The current flow is now:

```text
Sanity contentIdea
-> /configurator select platform / output settings
-> preview generation prompt
-> write local generation package under generation-jobs/
-> boss manually runs ChatGPT / Claude Code / Codex
```

Status: implemented, awaiting boss smoke test. Do not mark Phase 2C-2 smoke PASS yet.

## Changed Files

- `dashboard/src/lib/generationJobs/paths.ts`
- `dashboard/src/lib/generationJobs/promptBuilder.ts`
- `dashboard/src/lib/actions/createGenerationPromptPackage.ts`
- `dashboard/src/app/configurator/page.tsx`
- `dashboard/src/components/configurator/AdvancedOptionsCard.tsx`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/components/configurator/DeliverablesCard.tsx`
- `dashboard/src/components/configurator/GenerationPackageCard.tsx`
- `dashboard/src/components/configurator/StructurePreviewCard.tsx`
- `dashboard/src/lib/configurator/options.ts`
- `dashboard/src/lib/configurator/promptBuilder.ts`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`
- `docs/handoff/0207-phase-2c-2-generation-prompt-package.md`
- `docs/handoff/latest.md`

## Implementation Notes

- Added strict `generation-jobs/` path helper:
  - `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/`
  - `.md` / `.json` only
  - rejects absolute paths, traversal, URL-encoded traversal, null bytes, invalid slug/platform/timestamp, unexpected extensions
  - 200 KB max per file
  - atomic temp-file write + rename
- Added generation prompt builder:
  - includes contentIdea title, slug, summary, rawInput, coreThesis, audience, audiencePain, contentPillars, claims, evidence, examples, objections, tone/voice/styleNotes/avoid, platformAngles, outputChecklist, personalContext
  - asks the AI agent to write only the selected platform/output
  - returns Markdown suitable for later dashboard import
  - includes expected `draft.md` / `draft.json` paths
  - visual preference is direction-only; no image generation in this batch
- Added `createGenerationPromptPackage` server action:
  - preview reads Sanity and returns planned paths, prompt text, job JSON, warnings, suggested commands
  - execute requires `enableWriteActions` + `enableLocalFsRoutes`
  - execute writes only `prompt.md` and `job.json`
  - no Sanity write
  - metadata-only logs
- Added `/configurator` UI:
  - generation package card
  - preview button
  - create button
  - compact source/path summary
  - copy prompt / Codex command / Claude command / pbcopy command

## Constraints Followed

- Sanity schema unchanged.
- No Sanity write in this batch.
- No `campaignPlan` creation.
- No `platformOutput` creation.
- No `publishedOutput` creation.
- No OpenAI / Anthropic API calls.
- Dashboard does not execute Claude Code / Codex.
- No child process / shell execution added.
- No packages added.
- No tools, assets, patches, or publish-package files modified.
- Production writes remain disabled.

## Validation

- `cd dashboard && npm run build` passed.
- Build emitted an existing Turbopack NFT warning related to `publishPackageReader.ts`; TypeScript and Next build completed successfully.
- Root `npm run build` passed (Sanity Studio build).

## Manual Smoke Checklist

- `/configurator` opens.
- contentIdea created from Phase 2C-1B appears in selector.
- Select `obsidian-ai-sanity`.
- Select platform `threads` or `x`.
- Select outputType / purpose / tone / CTA / outputLength / visualPreference.
- Preview generation prompt works.
- Planned paths appear under `generation-jobs/obsidian-ai-sanity/<platform>/<timestamp>/`.
- Execute creates `prompt.md` and `job.json`.
- Expected `draft.md` path is shown.
- Copy prompt works.
- Suggested CLI commands are displayed but not executed.
- No Sanity docs are created.
- No external LLM API call.
- Existing `/ideas` flow still works.

## Remaining Issues

- Phase 2C-2 boss smoke test is not yet recorded.
- Generated output import is still pending.
- Campaign creation remains next phase; this batch intentionally skips `campaignPlan`.

## Next Recommended Step

Boss smoke test Phase 2C-2, then implement Phase 2C-3 Generated Output Import.
