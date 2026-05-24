# Handoff: Phase 2C-1 Content Idea schema alignment fix

Date: 2026-05-22

## 1. Task Goal

Make the `/ideas` Content Idea promote helper schema-aware enough for manual Sanity Studio creation.

Important: this is **not** a Phase 2C-1 smoke PASS record. It implements the schema alignment fix and awaits boss smoke.

## 2. Constraints Followed

- Did not modify Sanity schema.
- Did not write to Sanity.
- Did not auto-create `contentIdea` docs.
- Did not add packages.
- Did not call external APIs.
- Did not modify tools, assets, patches, or publish-package.
- Did not stage or commit.
- Kept Phase 2C-1 as manual Studio handoff.

## 3. contentIdea Schema Inventory

Required fields from `schemas/contentIdea.ts`:

- `title`: string, required
- `slug`: slug, required, JSON shape `{_type: "slug", current: "..."}`
- `status`: string, required, enum `idea` / `researched` / `drafted` / `reviewed` / `archived`
- `summary`: text, required
- `coreThesis`: text, required
- `audience`: array of string, required, min 1
- `audiencePain`: text, required
- `claims`: array of object, required, min 1
  - item shape: `claim` required, `supportingEvidence`, `confidence` enum `low` / `medium` / `high`, `needsVerification`
- `tone`: object, required
  - `voice`: string, required
  - `styleNotes`: string array
  - `avoid`: string array
- `platformAngles`: array of object, required, min 1
  - item shape: `platform` required enum `note` / `substack` / `threads` / `x` / `youtube` / `shorts` / `podcast` / `diagram` / `github` / `paid` / `instagram` / `newsletter`
  - optional: `targetReader`, `hook`, `formatNotes`, `callToAction`

Optional schema fields included where available:

- `rawInput`
- `contentPillars`
- `evidence`
- `examples`
- `objections`
- `sourceLinks`
- `outputChecklist`
- `personalContext`

## 4. Changed Files

- `dashboard/src/lib/ideaJobs/contentIdeaMapper.ts`
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
- `docs/devlog/0192-phase-2c-1-content-idea-schema-alignment.md`
- `docs/handoff/0203-phase-2c-1-content-idea-schema-alignment.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 5. Summary of Changes

`contentIdeaMapper` now emits:

- `studioDraft`: schema-aligned fields only.
- `studioDraftJsonText`: copy payload for Studio reference, including slug as `{_type: "slug", current: "..."}`.
- `enrichedDraft`: non-schema context for future automation and debugging.
- `copyableJsonText`: full enriched payload containing `studioDraft`, `enrichedDraft`, and `schemaChecklist`.
- `schemaChecklist`: ready / missing / needs manual edit state for required Sanity fields.

Mapper fixes:

- Adds `status: "idea"` using the actual schema enum.
- Adds schema-valid fallback values for `summary`, `audience`, `audiencePain`, `claims`, `platformAngles`, and `tone.voice` when source data is missing.
- Maps `claims` to the actual object item shape: `claim`, `supportingEvidence`, `confidence`, `needsVerification`.
- Maps `platformAngles` to the actual object item shape and normalizes aliases like `twitter -> x`, `thread -> threads`, `yt -> youtube`.
- Keeps provenance and future automation fields out of `studioDraft`.

UI fixes:

- Adds `Sanity必須fieldチェック` card.
- Adds separate copy buttons:
  - `Studio draft JSONをコピー`
  - `Full enriched JSONをコピー`
- Keeps field-by-field copy and adds required/schema-aware fields such as `status`, `tone`, `tone.voice`, `contentPillars`, and `evidence`.
- Clarifies that `/structure` may show an empty right pane and that this is normal; boss should select Content Ideas in the left pane, then New / Create / +.

## 6. Key Decisions

- `studioDraft` must stay schema-only. No provenance or future automation metadata inside it.
- `tone.voice` has no enum in the actual schema, so a schema-valid default string is inserted and marked `needs manual edit`.
- `platformAngles` uses only actual schema enum values. Unknown platform names are dropped; if none remain, a `note` fallback item is inserted.
- `claims` uses exact schema keys to avoid invalid object items and reduce red / Untitled behavior in Studio.
- Phase 2C-1 remains manual handoff; dashboard still does not create Sanity docs.

## 7. Human Review Questions

- Does the `claims` array now appear as valid object items in Studio instead of red / Untitled?
- Does `platformAngles` populate with schema-valid platform enum values?
- Is the default `tone.voice` acceptable as a temporary save helper, or should the wording be adjusted?
- Are any additional Studio-required fields surfaced that were not visible in `schemas/contentIdea.ts`?

## 8. Risks or Uncertainties

- Dashboard checklist is schema-informed but does not run Sanity validation. Studio remains final.
- Studio object array UI may still display an item title as Untitled if the schema does not define a `preview`, even when the item is valid.
- `tone.voice` is editorially subjective. It is intentionally flagged as manual-edit even though it is saveable.

## 9. Manual Smoke Checklist

Boss should verify:

- `/ideas` opens.
- Existing job `obsidian-ai-sanity-3 / 20260521-124748` is listed.
- `Content Idea化を準備` works.
- Required field checklist appears.
- `slug.current` appears.
- `Studio draft JSONをコピー` works.
- `Full enriched JSONをコピー` works.
- Studio root link is not treated as broken if the right pane is blank.
- Manual Studio creation can be completed with fewer/no validation errors.
- `claims` no longer appear as invalid red / Untitled if possible.
- `platformAngles` is populated in schema-valid shape.
- `tone` and `voice` are populated or clearly flagged as needs manual edit.
- No Sanity doc is created automatically by dashboard.

## 10. Recommended Next Step

Run boss smoke for Phase 2C-1 schema alignment using the existing `obsidian-ai-sanity-3 / 20260521-124748` job. If Studio validation passes, record a separate Phase 2C-1 smoke PASS handoff.

## 11. Exact Prompt to Give Codex Next

```text
Run Phase 2C-1 boss smoke result recording.

Context:
- Phase 2C-1 schema alignment fix was implemented in handoff/0203.
- Do not assume PASS unless boss reports the manual smoke result.

If boss confirms manual Studio creation now works:
- Update docs/devlog with Phase 2C-1 smoke PASS.
- Create a new handoff file and update docs/handoff/latest.md.
- Update Phase 2C and Phase 2B specs to mark Phase 2C-1 smoke PASS.

If boss reports remaining Studio validation errors:
- Inspect the exact failing fields and patch only the mapper/UI/docs needed.
- Do not modify Sanity schema.
- Do not write to Sanity.
- Do not auto-create docs.
```
