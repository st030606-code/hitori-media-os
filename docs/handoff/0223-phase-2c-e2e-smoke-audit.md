# Handoff: Phase 2C E2E Smoke Audit and UX Flow Diagnosis

Date: 2026-05-23

## 1. Task Goal

Run a read-only Phase 2C end-to-end smoke audit and UX diagnosis to decide whether Phase 2C can be considered complete now or should wait for UX flow polish.

## 2. Constraints Followed

- Read-only / docs-only.
- Did not modify dashboard runtime code.
- Did not modify Sanity schema.
- Did not write to Sanity.
- Did not modify tools.
- Did not modify assets.
- Did not modify patches.
- Did not modify publish-package files.
- Did not add packages.
- Did not deploy.
- Did not run destructive git commands.
- Treated existing dirty worktree files as user-owned.

## 3. Changed Files

- `docs/devlog/0212-phase-2c-e2e-smoke-audit.md`
- `docs/handoff/0223-phase-2c-e2e-smoke-audit.md`
- `docs/handoff/latest.md`
- `docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md`

## 4. Summary of Audit

Phase 2C is functionally close: all major sub-batches have boss smoke PASS and local artifacts exist for the no-API workflow.

Audited local artifacts include:

- `idea-jobs/obsidian-ai-sanity-3/_raw.json`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/prompt.md`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/job.json`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.json`
- `generation-jobs/obsidian-ai-sanity/note/20260522-114149/prompt.md`
- `generation-jobs/obsidian-ai-sanity/note/20260522-114149/job.json`
- `generation-jobs/obsidian-ai-sanity/note/20260522-114149/draft.md`
- `generation-jobs/ai/note/20260522-131751/prompt.md`
- `generation-jobs/ai/note/20260522-131751/job.json`
- `generation-jobs/ai/note/20260522-131751/draft.md`
- `generation-jobs/ai/note/20260522-131751/visual-brief.md`
- `generation-jobs/ai/note/20260522-131751/visual-brief.json`

Sanity document existence was not re-queried live during this read-only audit. It is based on boss smoke confirmations already recorded in handoffs:

- `contentIdea.obsidian-ai-sanity`
- `platformOutput.obsidian-ai-sanity.note.20260522-114149`
- `visualAssetPlan.ai.note.inline-visual-1`

## 5. Key Decision

Recommendation: **B. PASS after UX polish**.

Rationale:

- No functional gap currently blocks the intended E2E path.
- The no-API workflow is working as designed.
- But `/ideas` and `/configurator` still read like functional panels rather than one guided workflow.
- Japanese and English labels are mixed.
- Users can still confuse local file writes with Sanity writes.
- Users can still miss that Dashboard creates prompt packages but does not run AI.

## 6. UX Diagnosis

### /ideas

Main issues:

- Mixed labels: `Raw Idea`, `roughMemo`, `Preview prompt`, `Create idea package`, `Content Idea化`, `field`, `full JSON`.
- The path from raw idea to recent job to Content Idea creation is not visually numbered.
- `Preview/Create/保存` verbs do not always state destination.
- The local-only stage and Sanity-write stage should be visually separated.

### /configurator

Main issues:

- Mixed labels: `Generation Prompt Package`, `Generated Output Import`, `Preview generated output`, `Save draft`, `Preview platformOutput`, `Visual Asset Plan`.
- Downstream context binding is fixed, but the selected Content Idea should become a stronger page-level header.
- The cards feel like independent utilities instead of one linear workflow.
- Local file artifacts and Sanity documents should be badged consistently.
- No-API / no-image-generation / no-posting boundaries should be visible as badges, not only explanatory text.

## 7. Proposed Phase 2C-UX Scope

Recommended follow-up:

**Phase 2C-UX: Guided workflow polish for `/ideas` and `/configurator`**

Include:

- Japanese label normalization.
- Step numbers.
- "今どこ？" indicators.
- `保存先: local file / Sanity` badges.
- `AI実行: 手動` badges.
- `DashboardはAIを自動実行しません` notices.
- `Dashboardは画像生成しません` notices for visual brief / visual asset plan.
- "次にやること" cards after each success state.
- Strong selected Content Idea context header in `/configurator`.
- Completed / pending state per step based on artifact existence.

## 8. Risks or Uncertainties

- Sanity docs were not live-queried during this audit to avoid any accidental write/API behavior; this handoff relies on recorded boss smoke evidence for Sanity-side existence.
- Some existing dirty runtime files appear in git status, but they predate this docs-only audit.
- `result.md` for the audited `obsidian-ai-sanity-3` job exists but is very small; `result.json` is the substantial structured artifact used by the downstream flow.

## 9. Recommended Next Step

Implement Phase 2C-UX guided workflow polish, then run and record Phase 2C E2E PASS.

## 10. Exact Prompt to Give Codex Next

```text
Implement Phase 2C-UX: guided workflow polish for /ideas and /configurator.

Context:
Phase 2C feature batches are smoke PASS, and Codex completed a read-only E2E smoke audit in handoff/0223.
Recommendation was B: PASS after UX polish.

Goal:
Make /ideas and /configurator understandable as a guided no-API workflow before recording final Phase 2C E2E PASS.

Scope:
- Normalize Japanese labels.
- Add step numbers.
- Add "今どこ？" indicators.
- Add "保存先: local file / Sanity" badges.
- Add "AI実行: 手動" and "DashboardはAIを自動実行しません" notices.
- Add "次にやること" cards after success states.
- Strengthen selected Content Idea context header in /configurator.
- Keep all existing Phase 2C behavior intact.

Hard rules:
- Do not modify Sanity schema.
- Do not add packages.
- Do not call external APIs.
- Do not execute shell commands from dashboard.
- Do not change write semantics.
```
