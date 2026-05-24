# Handoff: Phase 2C-1B Studio URL fix

Date: 2026-05-22

## 1. Task Goal

Fix the Studio URL used by Phase 2C-1B createContentIdea and duplicate/existing-doc panels, and improve the create preview summary.

This does not mark Phase 2C-1B smoke PASS. Status: Studio URL fix implemented, awaiting boss smoke re-check.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not write to Sanity during implementation.
- Did not add packages.
- Did not call external APIs.
- Did not modify tools, assets, patches, or publish-package.
- Did not change create logic, duplicate blocking, deterministic `_id`, or field mapping.
- Did not create `campaignPlan`, `platformOutput`, or `publishedOutput`.

## 3. Changed Files

- `dashboard/src/lib/sanity.ts`
- `dashboard/src/lib/actions/createContentIdeaFromResult.ts`
- `dashboard/src/lib/actions/prepareContentIdeaFromResult.ts`
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
- `docs/devlog/0194-phase-2c-1b-studio-url-fix.md`
- `docs/handoff/0205-phase-2c-1b-studio-url-fix.md`
- `docs/handoff/latest.md`

## 4. Studio URL Fix

Added contentIdea-specific Studio helpers:

- `studioContentIdeasListUrl()`
- `studioContentIdeaUrl(documentId)`

Content Idea document links now use:

```text
/structure/content-ideas-hub;content-ideas-all;<documentId>
```

Example:

```text
http://localhost:3333/structure/content-ideas-hub;content-ideas-all;contentIdea.obsidian-ai-sanity
```

The generic `studioDocumentUrl(documentId)` remains unchanged for other document types.

## 5. Content Ideas List Link

The fallback Content Ideas list link now points to:

```text
/structure/content-ideas-hub;content-ideas-all
```

Studio root remains:

```text
/structure
```

## 6. Preview Summary Improvement

The Create preview panel now includes a compact schema summary:

- title
- status
- summary ready/missing
- coreThesis ready/missing
- claims count
- platformAngles count
- audience count
- tone.voice
- required readiness

Large body fields are not displayed.

## 7. Manual Smoke Checklist

Boss should verify:

- `/ideas` opens.
- Select `obsidian-ai-sanity-3 / 20260521-124748`.
- Preview create works.
- Preview summary shows title/status/readiness/counts without huge body text.
- Content Ideas list link opens `/structure/content-ideas-hub;content-ideas-all`.
- Created doc Studio link opens `/structure/content-ideas-hub;content-ideas-all;<documentId>`.
- Duplicate existing-doc Studio link opens the same correct Structure path.
- Duplicate blocking remains unchanged.
- No campaign/output docs are created.

## 8. Remaining Issues

- Boss re-smoke has not been recorded.
- Phase 2C-1B smoke PASS should be recorded only after boss confirms the fixed Studio links.

## 9. Recommended Next Step

Run boss re-smoke for Phase 2C-1B Studio URL. If confirmed, record a separate Phase 2C-1B smoke PASS handoff.

## 10. Exact Prompt to Give Codex Next

```text
Record Phase 2C-1B boss smoke PASS only if boss confirms:
- create preview works
- execute create works
- created/duplicate contentIdea Studio links use /structure/content-ideas-hub;content-ideas-all;<documentId>
- duplicate create is blocked
- no campaignPlan/platformOutput/publishedOutput docs are created

If any item fails, patch only the focused URL/UI issue.
```
