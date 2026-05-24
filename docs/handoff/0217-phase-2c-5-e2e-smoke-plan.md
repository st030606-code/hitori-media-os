# Handoff: Phase 2C-5 E2E Smoke Plan

Date: 2026-05-22

## 1. Task Goal

Create a docs-only Phase 2C-5 E2E smoke plan that boss can execute manually with one new raw idea.

This is not an implementation batch and does not mark Phase 2C-5 PASS.

## 2. Constraints Followed

- Docs only.
- Did not modify dashboard runtime code.
- Did not modify Sanity schema.
- Did not write to Sanity.
- Did not modify tools, assets, patches, or publish-package files.
- Did not add packages.
- Did not deploy.

## 3. Changed Files

- `docs/specs/phase-2c-5-e2e-smoke-plan.md`
- `docs/devlog/0206-phase-2c-5-e2e-smoke-plan.md`
- `docs/handoff/0217-phase-2c-5-e2e-smoke-plan.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

## 4. Summary of Changes

Created a manual E2E smoke checklist for the full no-API Phase 2C workflow:

```text
Raw Idea
→ idea-jobs development package
→ manual AI development
→ result.md / result.json import
→ Sanity contentIdea
→ generation-jobs prompt package
→ manual AI generation
→ draft.md / optional draft.json import
→ Sanity platformOutput
```

## 5. Recommended Test Idea

Title:

```text
AI時代の個人メディアは、記事を書くより運用ログを残す人が強い
```

roughMemo:

```text
Hitori Media OSを作っていて感じたのは、AIで記事を速く書けることよりも、企画・生成・修正・公開・反応までの運用ログが残ることの方が長期的に強いということ。毎回の投稿を単発で終わらせず、次の企画やAIへの入力品質に戻していく仕組みが個人メディアの資産になる、というテーマで企画化したい。
```

Suggested platforms:

- `note`
- `threads`
- `x`

## 6. Checklist Coverage

The smoke plan includes:

- UI location for each step.
- Manual action for each step.
- Expected result for each step.
- Expected local file / Sanity doc artifact.
- Pass/fail checkbox.
- Notes field.
- Negative assertions.
- Known acceptable behavior.
- Completion criteria.

## 7. Specs Synced

Updated:

- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`
- `docs/specs/phase-2b-write-actions.md`

Recorded status:

- Phase 2C-0: PASS
- Phase 2C-0.1: PASS
- Phase 2C-1A: PASS
- Phase 2C-1B: PASS
- Phase 2C-2: PASS
- Phase 2C-3: PASS
- Phase 2C-4: PASS
- Phase 2C-5: planned / smoke plan ready / awaiting boss E2E smoke

## 8. Validation

Docs-only change. Build was not required because runtime files were not modified.

Confirmed intended touched scope is docs only. Existing dirty runtime/assets/package/publish-package files in the worktree are user-owned from prior work and were not touched by this task.

## 9. Human Review Questions

- Does boss want to use the recommended raw idea exactly, or choose another fresh idea?
- Should the first generation platform be `note`, or should boss prefer `threads` / `x` for the final E2E smoke?
- Should Phase 2C-5 PASS be recorded immediately after the manual run, or should the run produce a short observation log first?

## 10. Recommended Next Step

Boss executes Phase 2C-5 E2E smoke using `docs/specs/phase-2c-5-e2e-smoke-plan.md`.

## 11. Exact Prompt to Give Codex Next

```text
Record Phase 2C-5 E2E smoke PASS and sync specs.

Context:
Codex prepared the Phase 2C-5 E2E smoke plan in handoff/0217.
Boss manually executed the checklist using one fresh raw idea.

Goal:
Record the actual smoke results, mark Phase 2C-5 PASS if confirmed, and sync specs.

Docs only. Do not modify runtime code.
```
