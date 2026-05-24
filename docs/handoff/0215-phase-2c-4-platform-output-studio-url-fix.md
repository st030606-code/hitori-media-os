# Handoff: Phase 2C-4 Platform Output Studio URL Fix

Date: 2026-05-22

## 1. Task Goal

Fix the Phase 2C-4 `platformOutput` Studio link so the success / duplicate UI opens the exact created document instead of only Studio root.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not write to Sanity during implementation.
- Did not create `campaignPlan`.
- Did not create `publishedOutput`.
- Did not modify `manualPublishingStatus`.
- Did not call external APIs.
- Did not add shell execution to dashboard.
- Did not add packages.
- Did not modify tools, assets, patches, or publish-package files.
- Kept platformOutput creation logic unchanged.
- Did not mark Phase 2C-4 smoke PASS.

## 3. Root Cause

Phase 2C-4 originally returned Studio root for `platformOutput` because the exact Studio structure path had not been confirmed. Boss smoke showed creation works, so the link now needs to be document-specific.

## 4. Studio Structure Path Confirmed

Read `structure/index.ts`.

Confirmed:

- Root list item id: `by-type`
- Platform Outputs list item id: `by-type-platformOutput`

Correct document URL shape:

```text
/structure/by-type;by-type-platformOutput;<documentId>
```

For the smoke doc:

```text
http://localhost:3333/structure/by-type;by-type-platformOutput;platformOutput.obsidian-ai-sanity.note.20260522-114149
```

## 5. Changed Files

- `dashboard/src/lib/sanity.ts`
- `dashboard/src/lib/actions/createPlatformOutputFromDraft.ts`
- `dashboard/src/components/configurator/PlatformOutputCreateCard.tsx`
- `docs/devlog/0204-phase-2c-4-platform-output-studio-url-fix.md`
- `docs/handoff/0215-phase-2c-4-platform-output-studio-url-fix.md`
- `docs/handoff/latest.md`

## 6. Summary of Changes

- Added `studioPlatformOutputsListUrl()`.
- Added `studioPlatformOutputUrl(documentId)`.
- `createPlatformOutputFromDraft` now returns the platformOutput deep link for:
  - preview planned doc URL
  - execute success URL
  - duplicate existing doc URL
- `PlatformOutputCreateCard` now renders direct duplicate links as well as success links.

## 7. Behavior Kept Unchanged

- platformOutput create logic unchanged.
- Duplicate detection unchanged.
- Deterministic `_id` unchanged.
- Mapper unchanged.
- Schema checklist unchanged.
- `status = drafted` and `contentStatus = draft` unchanged.
- `generatedFromPrompt` resolution unchanged.
- No `campaignPlan` / `publishedOutput` / `manualPublishingStatus` mutation.

## 8. Validation

Ran:

```text
cd dashboard && npm run build
npm run build
```

Result: both passed.

Known unrelated warning:

- Existing Turbopack NFT warning for `publishPackageReader.ts` trace remains.

## 9. Manual Smoke Checklist

Boss should verify:

- `/configurator` opens.
- Existing target job is still usable:
  `generation-jobs/obsidian-ai-sanity/note/20260522-114149/`
- Platform Output preview still works.
- Duplicate state still appears for:
  `platformOutput.obsidian-ai-sanity.note.20260522-114149`
- Success / duplicate Studio link opens:
  `/structure/by-type;by-type-platformOutput;platformOutput.obsidian-ai-sanity.note.20260522-114149`
- No new `platformOutput` is created during duplicate check.
- No `campaignPlan` / `publishedOutput` / `manualPublishingStatus` mutation occurs.
- Existing `/ideas` and `/configurator` generation flows still work.

## 10. Status

Studio URL fix implemented. Awaiting boss re-smoke.

Do not record Phase 2C-4 smoke PASS until boss confirms the fixed link behavior.

## 11. Recommended Next Step

Boss re-smoke Phase 2C-4 Studio link behavior. If confirmed, record Phase 2C-4 smoke PASS and sync specs.

## 12. Exact Prompt to Give Codex Next

```text
Record Phase 2C-4 platformOutput creation smoke PASS and sync specs.

Context:
Codex implemented Phase 2C-4 in handoff/0213 and Studio URL fix in handoff/0215.
Boss re-smoke confirmed the platformOutput success/duplicate Studio links open the exact document:
/structure/by-type;by-type-platformOutput;<documentId>

Docs only. Do not modify runtime code.
```
