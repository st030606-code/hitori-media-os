# Handoff: First Sanity Schemas

Date: 2026-05-11

## 1. Task Goal

Create the first Sanity TypeScript schema files for Phase 3 preparation without initializing Next.js, adding paid LLM API integrations, or implementing automation.

Implemented only the first 4 MVP schemas:

- `contentIdea`
- `prompt`
- `platformOutput`
- `diagramPlan`

## 2. Constraints Followed

- Did not add Next.js.
- Did not add paid LLM API integrations.
- Did not add OpenAI API or Anthropic API clients.
- Did not implement auto-generation or auto-posting.
- Did not implement `workflow`, `publishedOutput`, or `tool` yet.
- Did not store API keys or credentials.
- Kept the no-API MVP principle intact.

## 3. Changed Files

- `schemas/contentIdea.ts`
- `schemas/prompt.ts`
- `schemas/platformOutput.ts`
- `schemas/diagramPlan.ts`
- `schemas/index.ts`
- `docs/devlog/0007-first-sanity-schemas.md`

## 4. Summary of Changes

Added Sanity schema definitions for the first 4 MVP schemas and exported them from `schemas/index.ts`.

Added a devlog entry recording which schemas were created, which fields are required or optional, why `contentIdea` stays lightweight, why `prompt.localFilePath` exists, and what should be implemented next.

## 5. Important Decisions

- `contentIdea` stores source knowledge only, not generated drafts or published URLs.
- `evidence`, `examples`, `objections`, `sourceLinks`, `outputChecklist`, and `personalContext` are optional in `contentIdea`.
- `prompt.localFilePath` is required so Markdown prompt files remain the source of truth.
- `prompt.promptBody` is optional and treated as a snapshot, not the canonical prompt.
- `platformOutput` stores non-visual generated drafts.
- `diagramPlan` stores visual plans, diagram labels, image prompts, and paired post text.
- `platformOutput.sourceWorkflow` and `diagramPlan.sourceWorkflow` are optional weak references for a future `workflow` schema.

## 6. Human Review Questions

- Are the required fields in `contentIdea` still too heavy for quick idea capture?
- Should `platformOutput.draftBody` stay as plain `text`, or should it become block content later?
- Should `promptBody` remain optional if Markdown prompt files are the source of truth?
- Is `sourceWorkflow` as an optional weak reference acceptable before the `workflow` schema exists?
- Is `diagramPlan` granular enough for diagrams, carousels, thumbnails, and diagram-paired X posts?

## 7. Risks or Uncertainties

- The schemas import from `sanity`, but the project does not yet have Sanity dependencies or `sanity.config.ts`.
- Weak references to `workflow` are intentional, but should be checked once the `workflow` schema is added.
- The schema files have not been compiled because no package setup exists yet.
- `draftBody` as plain text is simple, but may be limiting if rich editing is needed inside Sanity Studio.

## 8. Recommended Next Step

Implement the remaining MVP schemas in this order:

1. `workflow`
2. `publishedOutput`
3. `tool`

Then add a minimal Sanity config and run schema validation after dependencies are installed.

## 9. Exact Prompt to Give Codex Next

```text
Implement the remaining MVP Sanity schemas.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not store API keys or credentials.

Use:
- docs/02-schema-design.md
- docs/devlog/0007-first-sanity-schemas.md
- schemas/contentIdea.ts
- schemas/prompt.ts
- schemas/platformOutput.ts
- schemas/diagramPlan.ts

Tasks:

1. Create Sanity schema files:
- schemas/workflow.ts
- schemas/publishedOutput.ts
- schemas/tool.ts

2. Update:
- schemas/index.ts

3. Follow the existing schema style.

4. workflow should record:
- sourceContentIdea
- promptsUsed
- toolsUsed
- outputFiles or output references
- workflowMode: manual / semi-automatic / automated
- observations
- devlogReference
- reviewRequired

5. publishedOutput should record:
- sourcePlatformOutput
- sourceDiagramPlan if needed
- platform
- publishedUrl
- publishedAt
- title
- performanceNotes
- learnings
- nextAction

6. tool should record:
- name
- category
- role
- usedFor
- costModel
- notes
- relatedWorkflows

7. Create docs/devlog/0008-remaining-sanity-schemas.md
Record what was added, key required/optional decisions, and what still needs review before initializing Sanity Studio.

After editing, summarize:
1. What changed
2. Which schema decisions were made
3. What still needs human review
4. Whether we are ready to add minimal Sanity config and dependency setup next
```

