# Handoff: Phase 2C-3 Import UX Smoke Fix

Date: 2026-05-22

## 1. Task Goal

Fix the Phase 2C-3 UX bug where Generated Output Import did not become actionable immediately after **Create generation package** succeeded.

## 2. Root Cause

`GeneratedOutputImportCard` was initialized from server-rendered `recentGenerationJobs` only. After `createGenerationPromptPackage` succeeded client-side, the newly created generation job existed, but the import card had no client-state handoff and still rendered the empty state.

## 3. UX / State Fix

- `GenerationPackageCard` now converts execute success into a `GenerationJobSummary`.
- `ConfiguratorForm` stores the created job in client state.
- `GeneratedOutputImportCard` receives `currentJob`, merges it with recent jobs, places it at the top, and selects it automatically.
- The import section now becomes immediately actionable without page reload.
- Empty-state copy clarifies:
  - Preview generation prompt does not write files.
  - Create generation package writes `prompt.md` / `job.json`.
  - After that, this section accepts AI output.

## 4. Constraints Followed

- Did not modify Sanity schema.
- Did not write to Sanity.
- Did not create `platformOutput`, `campaignPlan`, or `publishedOutput`.
- Did not call external APIs.
- Did not execute shell commands.
- Did not add packages.
- Did not modify tools, assets, patches, or publish-package files.
- Kept Generation Prompt Package behavior intact except for emitting execute success to the import UI.

## 5. Changed Files

- `dashboard/src/components/configurator/GenerationPackageCard.tsx`
- `dashboard/src/components/configurator/ConfiguratorForm.tsx`
- `dashboard/src/components/configurator/GeneratedOutputImportCard.tsx`
- `docs/devlog/0200-phase-2c-3-import-ux-smoke-fix.md`
- `docs/handoff/0211-phase-2c-3-import-ux-smoke-fix.md`
- `docs/handoff/latest.md`

## 6. Validation

- `cd dashboard && npm run build` passed.
- Build emitted the existing Turbopack NFT warning related to `publishPackageReader.ts`; TypeScript and Next build completed successfully.
- Root `npm run build` passed (Sanity Studio build).

## 7. Manual Smoke Checklist

- `/configurator` opens.
- Select contentIdea `obsidian-ai-sanity`.
- Select platform `threads`.
- Preview generation prompt works.
- Create generation package works.
- Generated Output Import immediately shows:
  - selected job: `generation-jobs/obsidian-ai-sanity/threads/<timestamp>/`
  - paste textarea
  - Preview generated output button
  - Save draft button
- Existing recent generation jobs remain selectable.
- No reload is required.
- No Sanity docs are created.
- No external LLM API call.
- No shell execution.

## 8. Remaining Issues

- Phase 2C-3 smoke PASS is not recorded yet.
- Boss re-smoke is required.

## 9. Recommended Next Step

Boss re-smoke Phase 2C-3. If it passes, record Phase 2C-3 smoke PASS and sync specs.

## 10. Exact Prompt to Give Codex Next

```text
Record Phase 2C-3 Generated Output Import smoke PASS after boss re-smoke, or apply a focused smoke fix if any issue remains.

Expected fixed behavior:
- After Create generation package succeeds, Generated Output Import immediately becomes actionable.
- Newly created generation-jobs/<slug>/<platform>/<timestamp>/ job is selected without reload.
- Textarea / Preview generated output / Save draft controls appear.
- Existing recent jobs remain selectable.
- No Sanity docs are created.
- No external LLM API or shell execution occurs.
```
