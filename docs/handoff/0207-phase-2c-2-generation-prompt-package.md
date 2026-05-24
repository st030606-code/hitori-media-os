# Handoff: Phase 2C-2 Generation Prompt Package

Date: 2026-05-22

## 1. Task Goal

Implement Phase 2C-2: create a no-API generation prompt package from an existing Sanity `contentIdea`.

Target flow:

```text
Sanity contentIdea
-> /configurator output settings
-> generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md + job.json
-> boss manually runs ChatGPT / Claude Code / Codex
```

Status: implemented, awaiting boss smoke test. Do not mark smoke PASS yet.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not write to Sanity.
- Did not create `campaignPlan`.
- Did not create `platformOutput`.
- Did not create `publishedOutput`.
- Did not call OpenAI / Anthropic APIs.
- Did not execute Claude Code / Codex from dashboard.
- Did not add shell execution / child process usage.
- Did not modify tools, assets, patches, or publish-package files.
- Did not add packages.
- Local writes are gated by `enableWriteActions` + `enableLocalFsRoutes`.

## 3. Changed Files

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
- `docs/devlog/0196-phase-2c-2-generation-prompt-package.md`
- `docs/handoff/0207-phase-2c-2-generation-prompt-package.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 4. Summary of Changes

Added a controlled local generation package workflow to `/configurator`.

Preview mode:

- reads the selected `contentIdea` from Sanity
- validates platform / output config
- plans safe `generation-jobs/` paths
- renders `prompt.md` and `job.json`
- returns copyable Codex / Claude / pbcopy commands
- writes nothing

Execute mode:

- repeats validation and Sanity read
- requires `enableWriteActions` + `enableLocalFsRoutes`
- writes only `prompt.md` and `job.json`
- does not write to Sanity
- does not create related docs

## 5. Key Decisions

- Use `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` for Phase 2C-2 because campaign creation remains a later phase.
- Keep the existing multi-platform configurator UI, but Phase 2C-2 package creation uses the first selected platform as the primary platform.
- Show suggested CLI commands as copyable text only. Dashboard never executes them.
- Keep the older prompt preview section; the new Generation Prompt Package card is the product-like filesystem package path.

## 6. Validation

- `cd dashboard && npm run build` passed.
- Build emitted an existing Turbopack NFT warning related to `publishPackageReader.ts`; TypeScript and Next build completed successfully.
- Root `npm run build` passed (Sanity Studio build).

## 7. Manual Smoke Checklist

- `/configurator` opens.
- contentIdea created from Phase 2C-1B appears in selector.
- Select `obsidian-ai-sanity`.
- Select platform: `threads` or `x`.
- Preview generation prompt works.
- Planned paths appear under `generation-jobs/obsidian-ai-sanity/<platform>/<timestamp>/`.
- Execute creates `prompt.md` and `job.json`.
- Expected `draft.md` path is shown.
- Copy prompt works.
- Suggested CLI command is displayed but not executed.
- No Sanity docs are created.
- No external LLM API call.
- Existing `/ideas` flow still works.

## 8. Risks or Uncertainties

- Phase 2C-2 is not smoke PASS until boss verifies local package creation.
- The `/configurator` still supports selecting multiple platforms; package creation intentionally uses the first selected platform only in this batch.
- Generated output import is not implemented yet, so `draft.md` / `draft.json` are expected paths only.
- Campaign creation remains next phase.

## 9. Recommended Next Step

Boss smoke test Phase 2C-2. If it passes, record smoke PASS; otherwise apply a focused smoke fix. Then implement Phase 2C-3 Generated Output Import.

## 10. Exact Prompt to Give Codex Next

```text
Record or fix Phase 2C-2 Generation Prompt Package after boss smoke.

Smoke checklist:
- /configurator opens.
- Phase 2C-1B contentIdea appears in selector.
- Select obsidian-ai-sanity.
- Select platform threads or x.
- Preview generation prompt works.
- Execute creates generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md and job.json.
- Copy prompt and suggested commands work.
- Dashboard does not execute commands.
- No Sanity docs are created.
- No external LLM API call.
- Existing /ideas flow still works.

If all pass, record Phase 2C-2 smoke PASS and sync specs.
If issues remain, make a minimal focused smoke fix and keep PASS unrecorded.
```
