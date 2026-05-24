# Handoff: Phase 2C-3 Generated Output Import

Date: 2026-05-22

## 1. Task Goal

Implement Phase 2C-3: allow boss to paste manually generated AI output back into Dashboard and save it under the existing generation job.

Target flow:

```text
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md
-> boss manually runs ChatGPT / Claude / Codex
-> boss pastes generated output into /configurator
-> generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md
-> optional draft.json when structured data is detected
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

## 4. Summary of Changes

Added a controlled local generated-output import workflow to `/configurator`.

Parser behavior:

- Markdown-only is accepted.
- YAML frontmatter is detected with simple key/value parsing.
- Fenced JSON blocks are detected.
- Entire input as JSON is detected.
- Sections are detected for title candidates, lead, body, CTA, visual-brief, visualPrompt, thread posts, notes, and review checklist.

Reader behavior:

- lists recent `generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/` jobs
- reads `job.json` metadata safely
- detects package-only / draft markdown saved / structured draft saved status
- keeps all reads under `generation-jobs/`

Server action behavior:

- preview validates job paths and parses pasted generated output
- execute repeats validation, requires write/local-fs gates, and writes local files
- writes `draft.md` always
- writes `draft.json` only if frontmatter / structured JSON exists
- no Sanity write

## 5. Key Decisions

- Place Phase 2C-3 import in `/configurator` next to Generation Prompt Package, because the user is returning to the same generation job.
- Keep this batch focused on local draft persistence. `platformOutput` creation / handoff is later.
- Do not normalize into platformOutput JSON yet; store detected structured data as `draft.json` only when present.

## 6. Validation

- `cd dashboard && npm run build` passed.
- Build emitted an existing Turbopack NFT warning related to `publishPackageReader.ts`; TypeScript and Next build completed successfully.
- Root `npm run build` passed (Sanity Studio build).

## 7. Manual Smoke Checklist

- `/configurator` opens.
- Recent generation job appears: `generation-jobs/obsidian-ai-sanity/threads/<timestamp>/`.
- Paste the ChatGPT-generated Threads draft from the Phase 2C-2 smoke.
- Preview generated output works.
- Detected sections include at least:
  - title candidates
  - lead/body or body
  - CTA
  - visual-brief if present
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

## 8. Risks or Uncertainties

- Phase 2C-3 is not smoke PASS until boss verifies local `draft.md` / optional `draft.json` creation.
- Parser detection is tolerant and heuristic; Markdown-only remains valid.
- platformOutput creation is intentionally deferred.
- Campaign creation remains next phase.

## 9. Recommended Next Step

Boss smoke test Phase 2C-3. If it passes, record smoke PASS; otherwise apply a focused smoke fix.

## 10. Exact Prompt to Give Codex Next

```text
Record or fix Phase 2C-3 Generated Output Import after boss smoke.

Smoke checklist:
- /configurator opens.
- Recent generation job appears under generation-jobs/obsidian-ai-sanity/threads/<timestamp>/.
- Paste the ChatGPT-generated Threads draft from Phase 2C-2 smoke.
- Preview generated output works.
- Execute save creates draft.md.
- draft.json is created only if structured data/frontmatter/JSON is detected.
- Existing prompt.md / job.json remain.
- No Sanity docs are created.
- No external LLM API call.
- No shell execution.
- Existing /ideas and generation package flows still work.

If all pass, record Phase 2C-3 smoke PASS and sync specs.
If issues remain, make a minimal focused smoke fix and keep PASS unrecorded.
```
