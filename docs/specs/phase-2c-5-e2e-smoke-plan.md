# Phase 2C-5 E2E Smoke Plan

最終更新: 2026-05-22
ステータス: **planned / awaiting boss E2E smoke**

## 1. Purpose

Validate the full Phase 2C no-API semi-automated workflow from one new Raw Idea to one Sanity `platformOutput`.

This smoke test confirms the handoff chain:

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

## 2. Scope

In scope:

- Manual AI execution in ChatGPT / Claude / Codex.
- Dashboard local file writes under `idea-jobs/` and `generation-jobs/`.
- Controlled Sanity creation of `contentIdea`.
- Controlled Sanity creation of `platformOutput`.
- Verification that generated local files and Sanity docs exist.

Out of scope:

- No automatic external AI API call from dashboard.
- No publication to note / X / Threads / Substack.
- No `campaignPlan` creation.
- No `publishedOutput` creation.
- No `manualPublishingStatus` update.
- No `platformOutput` published status.
- No schema change.
- No dashboard shell execution.

## 3. Preconditions

- [ ] Dashboard dev server is running.
- [ ] Sanity Studio is running.
- [ ] `ENABLE_WRITE_ACTIONS=true`.
- [ ] `ENABLE_LOCAL_FS_ROUTES=true`.
- [ ] `SANITY_WRITE_TOKEN` is present in local dashboard env.
- [ ] Boss uses a new raw idea to avoid duplicate slug/doc ids.
- [ ] Existing dirty worktree is treated as user-owned; do not clean/reset.

Notes:

```text

```

## 4. Recommended Test Raw Idea

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

Suggested first generation platform:

- `note`

Suggested output type:

- `article`

## 5. Step-by-Step Checklist

| # | UI location | Action | Expected result | Generated file/doc | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| 1 | `/ideas` | Create Raw Idea using the recommended title and roughMemo. | Raw idea is accepted and appears in idea job list. | `idea-jobs/<newSlug>/_raw.json` | [ ] Pass / [ ] Fail |  |
| 2 | `/ideas` | Create Idea Development Package. | Prompt package preview/execute succeeds. | `idea-jobs/<newSlug>/<timestamp>/prompt.md` and `job.json` | [ ] Pass / [ ] Fail |  |
| 3 | Local/manual AI | Copy `prompt.md` into ChatGPT / Claude / Codex manually. | AI returns an idea development result suitable for dashboard import. | No dashboard-created file in this step | [ ] Pass / [ ] Fail |  |
| 4 | `/ideas` | Paste AI-developed result back into the result import textarea. | Preview detects markdown and structured JSON if present. | Preview only | [ ] Pass / [ ] Fail |  |
| 5 | `/ideas` | Save imported idea development result. | Result is persisted locally. | `idea-jobs/<newSlug>/<timestamp>/result.md` and `result.json` | [ ] Pass / [ ] Fail |  |
| 6 | `/ideas` | Prepare Content Idea from saved result. | Schema checklist is ready or manual-edit items are clear. | Schema-aligned studio draft preview | [ ] Pass / [ ] Fail |  |
| 7 | `/ideas` | Create Sanity `contentIdea`. | One new `contentIdea` is created, duplicate create is blocked on retry. | `contentIdea.<slug>` | [ ] Pass / [ ] Fail |  |
| 8 | Sanity Studio | Open created `contentIdea` via dashboard link. | Studio opens the exact contentIdea document or the correct Content Ideas list with document selectable. | Sanity `contentIdea.<slug>` | [ ] Pass / [ ] Fail |  |
| 9 | `/configurator` | Select the created contentIdea. | Content idea appears in selector and summary is populated. | Read-only Sanity fetch | [ ] Pass / [ ] Fail |  |
| 10 | `/configurator` | Select platform `note`, output type `article`, purpose/tone/CTA/length. | Generation Prompt Package card becomes actionable. | Preview only | [ ] Pass / [ ] Fail |  |
| 11 | `/configurator` | Preview generation prompt. | Planned paths appear under `generation-jobs/<slug>/note/<timestamp>/`. | Preview only | [ ] Pass / [ ] Fail |  |
| 12 | `/configurator` | Create generation prompt package. | Package is written locally and Generated Output Import becomes actionable. | `generation-jobs/<slug>/note/<timestamp>/prompt.md` and `job.json` | [ ] Pass / [ ] Fail |  |
| 13 | Local/manual AI | Copy generated prompt into ChatGPT / Claude / Codex manually. | AI returns a note draft and optional visual brief. | No dashboard-created file in this step | [ ] Pass / [ ] Fail |  |
| 14 | `/configurator` | Paste generated output into Generated Output Import. | Preview detects output kind, sections, warnings, and excerpt. | Preview only | [ ] Pass / [ ] Fail |  |
| 15 | `/configurator` | Save generated output draft. | Markdown draft is persisted; structured JSON is saved only if detected. | `generation-jobs/<slug>/note/<timestamp>/draft.md`; optional `draft.json` | [ ] Pass / [ ] Fail |  |
| 16 | `/configurator` | Preview platformOutput creation. | Preview uses `job.json` platform metadata; platform remains `note`; outputType maps to `note-article`. | Preview only | [ ] Pass / [ ] Fail |  |
| 17 | `/configurator` | Create Sanity `platformOutput`. | One `platformOutput` is created; duplicate create is blocked on retry. | `platformOutput.<slug>.note.<timestamp>` | [ ] Pass / [ ] Fail |  |
| 18 | Sanity Studio | Open created `platformOutput` via dashboard link. | Studio opens exact `platformOutput` document under By Type / Platform Outputs. | `/structure/by-type;by-type-platformOutput;<documentId>` | [ ] Pass / [ ] Fail |  |
| 19 | Sanity Studio | Verify `platformOutput` fields. | `sourceContentIdea`, `draftBody`, `status = drafted`, `contentStatus = draft`, `generatedFromPrompt` are present. | Sanity platformOutput doc | [ ] Pass / [ ] Fail |  |
| 20 | Sanity Studio / dashboard | Verify negative assertions. | No out-of-scope docs or publish mutations occurred. | No `campaignPlan`, no `publishedOutput`, no `manualPublishingStatus` mutation | [ ] Pass / [ ] Fail |  |

## 6. Expected Artifacts

Local artifacts:

```text
idea-jobs/<newSlug>/_raw.json
idea-jobs/<newSlug>/<timestamp>/prompt.md
idea-jobs/<newSlug>/<timestamp>/job.json
idea-jobs/<newSlug>/<timestamp>/result.md
idea-jobs/<newSlug>/<timestamp>/result.json

generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/prompt.md
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/job.json
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.md
generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/draft.json  # optional
```

Sanity artifacts:

```text
contentIdea.<slug>
platformOutput.<slug>.<platform>.<timestamp>
```

Expected references:

- `platformOutput.sourceContentIdea._ref` points to `contentIdea.<slug>`.
- `platformOutput.generatedFromPrompt._ref` is populated.
- `platformOutput.localOutputPath` points to `generation-jobs/<slug>/<platform>/<timestamp>/draft.md`.

## 7. Negative Assertions

Confirm:

- [ ] No `campaignPlan` created.
- [ ] No `publishedOutput` created.
- [ ] No `manualPublishingStatus` changed.
- [ ] No `platformOutput` marked `published`, `ready`, or equivalent.
- [ ] No external LLM API call by dashboard.
- [ ] No shell execution by dashboard.
- [ ] No Sanity schema change.

Notes:

```text

```

## 8. Known Acceptable Behavior

- `draft.json` may not be created for markdown-only generated output.
- Detected sections may include unrelated labels. Phase 2C-4 must use `job.json` / generation job platform metadata as source of truth.
- Studio root/list links may be used where a deep link is not available.
- `contentIdea` and `platformOutput` deep links should work where implemented.
- Duplicate create should return a duplicate state, not overwrite an existing doc.

## 9. Completion Criteria

Phase 2C-5 can be marked PASS only when:

- [ ] One new raw idea reaches Sanity `platformOutput`.
- [ ] All expected local files exist.
- [ ] Sanity `contentIdea` exists.
- [ ] Sanity `platformOutput` exists.
- [ ] `platformOutput.sourceContentIdea` references the created `contentIdea`.
- [ ] `platformOutput.status = drafted`.
- [ ] `platformOutput.contentStatus = draft`.
- [ ] Duplicate `contentIdea` creation is blocked.
- [ ] Duplicate `platformOutput` creation is blocked.
- [ ] No out-of-scope writes occurred.
- [ ] Dashboard made no external LLM API calls.
- [ ] Dashboard executed no shell commands.

Final boss notes:

```text

```
