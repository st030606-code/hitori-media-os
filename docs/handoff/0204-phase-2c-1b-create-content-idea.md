# Handoff: Phase 2C-1B createContentIdea server action

Date: 2026-05-22

## 1. Task Goal

Add a safe controlled Sanity create path so `/ideas` can promote:

`idea-jobs/<ideaSlug>/<timestamp>/result.json` → schema-aligned `contentIdea` `studioDraft` → Sanity `contentIdea` document.

This does not mark smoke PASS. Phase 2C-1B is implemented and awaiting boss smoke.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not modify tools, assets, patches, or publish-package.
- Did not add packages.
- Did not call external LLM APIs.
- Did not execute Claude Code / Codex.
- Did not add app-side child_process / spawn / exec usage.
- Production writes remain disabled.
- Execute writes require both `ENABLE_WRITE_ACTIONS` and `SANITY_WRITE_TOKEN`.
- Local filesystem reads remain under `idea-jobs/`.
- Did not create `campaignPlan`, `platformOutput`, or `publishedOutput`.
- Did not stage or commit.

## 3. Changed Files

- `dashboard/src/lib/actions/createContentIdeaFromResult.ts`
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
- `dashboard/src/components/ideas/RawIdeaBuilder.tsx`
- `dashboard/src/app/ideas/page.tsx`
- `docs/devlog/0193-phase-2c-1b-create-content-idea.md`
- `docs/handoff/0204-phase-2c-1b-create-content-idea.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 4. Server Action Behavior

`createContentIdeaFromResult(input)` supports:

- `mode: "preview"`
  - validates `ideaSlug` and `timestamp`
  - requires `ENABLE_LOCAL_FS_ROUTES`
  - reads `result.json` and optional `_raw.json`
  - builds `studioDraft` through `contentIdeaMapper`
  - checks schema-informed required fields
  - plans deterministic `_id = contentIdea.<slug.current>`
  - checks duplicates by `_id` or `slug.current`
  - returns planned id, slug, Studio URL, duplicate status, write readiness, and schema checklist
  - does not write Sanity
- `mode: "execute"`
  - repeats read/map/validate/duplicate checks
  - requires `ENABLE_WRITE_ACTIONS`
  - requires `SANITY_WRITE_TOKEN`
  - creates exactly one `contentIdea` document
  - writes only schema-aligned `studioDraft` fields
  - refetches the created document and verifies `_id`, `slug.current`, and required fields

The deterministic id convention follows existing project examples such as `contentIdea.ai-blog-db` and `contentIdea.building-hitori-media-os`.

## 5. Duplicate Handling

Duplicates are blocked when either:

- `_id == contentIdea.<slug.current>`
- `slug.current == <slug.current>`

Phase 2C-1B does not update existing docs. It returns `duplicate-found`, existing doc id, and a Studio link.

## 6. UI Behavior

`ContentIdeaPromotePanel` now shows `Content IdeaをSanityに作成` as the primary card:

- `Preview create` shows planned doc id, slug, duplicate status, required readiness, and write readiness.
- `Create Content Idea` is disabled until preview succeeds, no duplicate is found, missing required fields are zero, and write readiness is true.
- Success panel shows created doc id, slug, Studio link, createdAt, and verified flag.
- Duplicate panel links to the existing Studio doc.
- Existing manual Studio handoff, Studio draft JSON copy, full enriched JSON copy, and field-by-field copy remain as fallback/debug tools.

## 7. Security Checks

Implementation safety:

- No arbitrary JSON passthrough to Sanity.
- No `enrichedDraft` / `provenance` write.
- No user-provided `_id`.
- No token values in logs.
- Logs include only metadata such as ideaSlug, timestamp, mode, slug, field count, duplicate flag, and elapsedMs.
- No campaign or output docs are created.

Validation still required:

- `cd dashboard && npm run build`
- root `npm run build`
- grep checks for schema/package/tool/asset/publish-package drift and child_process/spawn/exec usage.

## 8. Manual Smoke Checklist

Boss should verify:

- `/ideas` opens.
- Select `obsidian-ai-sanity-3 / 20260521-124748`.
- Content Idea promote panel opens.
- Schema checklist is ready enough for create.
- `Preview create` works.
- `Create Content Idea` works when write flags/token are configured.
- Sanity Studio shows the new `contentIdea`.
- Required fields are saved.
- Duplicate create is blocked.
- Dashboard did not create `campaignPlan`.
- Dashboard did not create `platformOutput` / `publishedOutput`.
- No external LLM API call.
- No app-side shell execution.

## 9. Remaining Issues

- Boss smoke has not been recorded yet.
- `tone.voice` remains a schema-valid default and should be edited later if the brand voice needs tightening.
- Updating an existing `contentIdea` is explicitly deferred.

## 10. Recommended Next Step

Run boss smoke for Phase 2C-1B create. If successful, record a separate smoke PASS handoff and update the specs from “awaiting boss smoke” to PASS.

## 11. Exact Prompt to Give Codex Next

```text
Record Phase 2C-1B boss smoke result.

Only mark PASS if boss confirms:
- Preview create works.
- Execute create works.
- The Sanity Studio document exists with required fields saved.
- Duplicate create is blocked.
- No campaignPlan/platformOutput/publishedOutput is created.
- No external LLM API or shell execution occurs.

If any item fails, patch only the focused server action/UI/docs needed.
Do not modify Sanity schema.
```
