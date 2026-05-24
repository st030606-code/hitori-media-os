# Devlog 0198: Phase 2C-3 Generated Output Import

Date: 2026-05-22

## Summary

Implemented Phase 2C-3: Generated Output Import for `generation-jobs/`.

The current flow is now:

```text
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md
-> boss manually runs ChatGPT / Claude / Codex
-> boss pastes generated output into /configurator
-> dashboard parses / previews
-> generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md
-> optional draft.json when structured data is detected
```

Status: implemented, awaiting boss smoke test. Do not mark Phase 2C-3 smoke PASS yet.

## Changed Files

- `dashboard/src/lib/generationJobs/outputParser.ts`
- `dashboard/src/lib/generationJobs/reader.ts`
- `dashboard/src/lib/actions/saveGeneratedOutputDraft.ts`
- `dashboard/src/app/configurator/page.tsx`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/components/configurator/GeneratedOutputImportCard.tsx`
- `docs/devlog/0198-phase-2c-3-generated-output-import.md`
- `docs/handoff/0209-phase-2c-3-generated-output-import.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## Implementation Notes

- Added generated output parser:
  - Markdown-only is valid.
  - Detects YAML frontmatter.
  - Detects fenced JSON blocks.
  - Detects entire input as JSON.
  - Detects sections: title candidates, lead, body, CTA, visual-brief, visualPrompt, thread posts, notes, review checklist.
  - Enforces 200 KB max and rejects null bytes.
- Added generation job reader:
  - lists recent `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` jobs
  - detects prompt/job/draft file existence
  - reads `job.json` metadata safely
  - keeps reads path-allowlisted under `generation-jobs/`
- Added `saveGeneratedOutputDraft` server action:
  - preview validates existing generation job and parses pasted output
  - execute requires `enableWriteActions` + `enableLocalFsRoutes`
  - writes `draft.md` always
  - writes `draft.json` only when frontmatter / fenced JSON / full JSON exists
  - no Sanity write
- Added `/configurator` Generated Output Import section:
  - recent job selector
  - paste textarea
  - preview button
  - save draft button
  - detected sections / warnings / excerpt panel

## Constraints Followed

- Sanity schema unchanged.
- No Sanity write.
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
- Recent generation job appears: `generation-jobs/obsidian-ai-sanity/threads/<timestamp>/`.
- Paste the ChatGPT-generated Threads draft from the Phase 2C-2 smoke.
- Preview generated output works.
- Detected sections include at least title candidates, lead/body or body, CTA, and visual-brief if present.
- Execute save works.
- `draft.md` is created.
- `draft.json` is created only if structured data/frontmatter/JSON is detected.
- Files are under `generation-jobs/obsidian-ai-sanity/threads/<timestamp>/`.
- Existing `prompt.md` / `job.json` remain.
- No Sanity docs are created.
- No external LLM API call.
- No shell execution.
- Existing `/ideas` flow still works.
- Existing generation package flow still works.

## Remaining Issues

- Phase 2C-3 boss smoke test is not yet recorded.
- platformOutput creation / handoff remains a later phase.
- Campaign creation remains next phase.

## Next Recommended Step

Boss smoke test Phase 2C-3, then record smoke PASS or apply a focused smoke fix.
