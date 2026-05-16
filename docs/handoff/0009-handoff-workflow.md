# Handoff: Handoff Workflow

Date: 2026-05-11

## 1. Task Goal

Add a repeatable handoff workflow for ChatGPT review after meaningful Codex tasks.

## 2. Constraints Followed

- Did not add Next.js.
- Did not initialize Sanity.
- Did not add paid LLM API integrations.
- Did not add OpenAI API or Anthropic API clients.
- Did not implement auto-generation or auto-posting.

## 3. Changed Files

- `docs/handoff/_template.md`
- `docs/handoff/latest.md`
- `docs/handoff/0009-handoff-workflow.md`
- `AGENTS.md`

## 4. Summary of Changes

Added a reusable handoff template and updated `AGENTS.md` so future agents create or update `docs/handoff/latest.md` after every meaningful task.

Also added a numbered handoff for this workflow update.

## 5. Key Decisions

- `docs/handoff/latest.md` is the always-current ChatGPT review file.
- Numbered files like `docs/handoff/000X-task-name.md` preserve task history.
- Handoffs should include goal, changed files, key decisions, constraints, review questions, and the next Codex prompt.
- The handoff workflow is now part of the agent instructions.

## 6. Human Review Questions

- Is the handoff template concise enough for regular use?
- Should every task get a numbered handoff, or only meaningful milestones?
- Should handoff files be written in English, Japanese, or mixed depending on reviewer?

## 7. Risks or Uncertainties

- Handoff files may become noisy if created for very small edits.
- Agents may forget to update both `latest.md` and a numbered file unless the rule is followed.

## 8. Recommended Next Step

Continue with the next implementation task using this handoff workflow.

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

4. Create docs/devlog/0008-remaining-sanity-schemas.md

5. Create or update docs/handoff/latest.md and a numbered handoff file for this task.

After editing, summarize:
1. What changed
2. Which schema decisions were made
3. What still needs human review
4. Whether we are ready to add minimal Sanity config and dependency setup next
```

