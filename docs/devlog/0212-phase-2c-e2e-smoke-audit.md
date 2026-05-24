# Devlog 0212: Phase 2C E2E Smoke Audit and UX Flow Diagnosis

Date: 2026-05-23

## Summary

Ran a read-only Phase 2C end-to-end audit against the current docs, local job artifacts, and dashboard UI source.

Recommendation: **B. PASS after UX polish**.

The feature chain is functionally real:

- Raw Idea capture and idea package files exist.
- AI-developed result import exists.
- `contentIdea` creation is smoke PASS.
- generation prompt package creation is smoke PASS.
- generated output import to `draft.md` is smoke PASS.
- `draft.md` to `platformOutput` creation is smoke PASS.
- visual brief extraction and `visualAssetPlan` duplicate-safe creation are smoke PASS.
- configurator context binding is smoke PASS.

However, Phase 2C should not be marked as final E2E PASS for real users until a small UX flow polish pass makes the sequence, storage destinations, and no-API boundary obvious.

## Artifact Audit

### Raw idea / idea development

Checked local artifacts under `idea-jobs/obsidian-ai-sanity-3/`.

Found:

- `idea-jobs/obsidian-ai-sanity-3/_raw.json`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/prompt.md`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/job.json`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.md`
- `idea-jobs/obsidian-ai-sanity-3/20260521-124748/result.json`

Notes:

- `_raw.json` contains the Obsidian + AI + Sanity raw idea.
- `result.json` is populated with structured content idea material.
- `result.md` exists but is very small in this sample; the structured JSON is the meaningful artifact used downstream.

### Generation jobs

Found generation job directories:

- `generation-jobs/obsidian-ai-sanity/note/20260522-112916/`
  - `prompt.md`
  - `job.json`
- `generation-jobs/obsidian-ai-sanity/note/20260522-114149/`
  - `prompt.md`
  - `job.json`
  - `draft.md`
- `generation-jobs/ai/note/20260522-131751/`
  - `prompt.md`
  - `job.json`
  - `draft.md`
  - `visual-brief.md`
  - `visual-brief.json`
- `generation-jobs/ai/x/20260523-120157/`
  - `prompt.md`
  - `job.json`

Notes:

- `obsidian-ai-sanity/note/20260522-114149/draft.md` exists and is substantial.
- `ai/note/20260522-131751/draft.md` exists and is substantial.
- `ai/note/20260522-131751/visual-brief.md` and `visual-brief.json` exist, matching the Phase 2C-6 smoke result.

### Sanity docs

This read-only audit did not perform a live Sanity query. It relies on boss smoke confirmations recorded in handoffs:

- `contentIdea.obsidian-ai-sanity` exists.
- `platformOutput.obsidian-ai-sanity.note.20260522-114149` exists and links to the exact Studio document.
- `visualAssetPlan.ai.note.inline-visual-1` exists and duplicate handling is working.

No Sanity writes were performed during this audit.

## /ideas UX Diagnosis

Strengths:

- The page repeatedly states that Dashboard does not call AI automatically.
- Local filesystem vs Sanity boundaries are present in explanatory copy.
- Content Idea creation has schema checklist and controlled create flow.
- Manual Studio fallback is retained but no longer the primary path.

Issues:

- Labels mix Japanese and English: `Raw Idea`, `roughMemo`, `Preview prompt`, `Create idea package`, `Content Idea化`, `controlled write action`, `field`, `full JSON`, `create preview`.
- The actual workflow is spread across panels rather than shown as one numbered path.
- Button verbs do not consistently communicate destination:
  - `Preview` means dry-run / confirmation.
  - `Create` sometimes means local files and sometimes Sanity docs.
  - `保存` can mean local `result.md/result.json`, not Sanity.
- Users may not know that after `result.json` is saved, the next action is in the recent jobs list.
- Users may not know when they have crossed from local-only artifacts into Sanity writes.

Recommended label direction:

- `Preview prompt` -> `プロンプト内容を確認`
- `Create idea package` -> `AI企画化パッケージを作成（ローカル）`
- `AI企画化結果を取り込む` -> keep, but add `保存先: local idea-jobs/`
- `Content Idea化を準備` -> `Content Idea作成を確認`
- `Create Content Idea` -> `Content Ideaを作成（Sanity）`

## /configurator UX Diagnosis

Strengths:

- The context binding fix makes selected Content Idea the parent context.
- Downstream cards now show current target and match status.
- Preview/execute split prevents accidental writes.
- Platform source-of-truth is correctly job metadata, not parser-detected sections.
- Visual brief separation is conceptually correct for Hitori Media OS.

Issues:

- The page feels like a toolbox of cards rather than a guided workflow.
- Labels are heavily mixed:
  - `Generation Prompt Package`
  - `Generated Output Import`
  - `Preview generated output`
  - `Save draft`
  - `Platform OutputをSanityに作成`
  - `Preview platformOutput`
  - `Visual Briefを抽出`
  - `Preview visual brief`
  - `Visual Asset PlanをSanityに作成`
  - `MATCH: matched` / `match: matched`
- Users can see `prompt.md`, `job.json`, `draft.md`, `visual-brief.md`, but the UI does not consistently badge them as local artifacts.
- Users can see Sanity create cards, but the UI should more strongly badge them as Sanity writes.
- The distinction between "make a prompt for AI" and "AI runs now" is present in text, but not visually strong enough.
- VisualAssetPlan can be mistaken for image generation unless the no-image boundary is elevated.

Recommended label direction:

- `Generation Prompt Package` -> `AI生成用プロンプトを作成`
- `Preview generation prompt` -> `生成プロンプトを確認`
- `Create generation package` -> `生成パッケージを作成（ローカル）`
- `Generated Output Import` -> `AI生成結果を取り込む`
- `Preview generated output` -> `生成結果の保存内容を確認`
- `Save draft` -> `draft.mdとして保存（ローカル）`
- `Platform OutputをSanityに作成` -> `媒体別下書きをSanityに作成`
- `Preview platformOutput` -> `Sanity作成内容を確認`
- `Create platformOutput` -> `platformOutputを作成（Sanity）`
- `Visual Briefを抽出` -> `図解・画像案を抽出`
- `Save visual brief` -> `visual-brief.mdとして保存（ローカル）`
- `Visual Asset PlanをSanityに作成` -> `画像計画をSanityに作成`
- `MATCH: matched` -> `一致: 選択中のContent Ideaに紐づいています`

## E2E Status Recommendation

Classification: **B. PASS after UX polish**.

Reason:

- The feature pieces are smoke-tested and the local artifacts prove the no-API chain is operating.
- No functional gap currently blocks the intended E2E path.
- But the user-facing flow is not yet clear enough to call Phase 2C E2E complete for real users.
- The remaining work is not schema or core server action work; it is guided workflow clarity.

## Proposed Phase 2C-UX

Recommended follow-up:

**Phase 2C-UX: Guided workflow polish for `/ideas` and `/configurator`**

Scope:

- Normalize Japanese labels across Phase 2C surfaces.
- Add step numbers to `/ideas`:
  1. 仮アイデアを入力
  2. AI企画化プロンプトを作成（ローカル）
  3. ChatGPT / Claude / Codexで手動実行
  4. AI企画化結果を保存（ローカル）
  5. Content Ideaを作成（Sanity）
- Add step numbers to `/configurator`:
  1. Content Ideaを選択
  2. AI生成プロンプトを作成（ローカル）
  3. ChatGPT / Claude / Codexで手動生成
  4. 生成結果を保存（ローカル）
  5. platformOutputを作成（Sanity）
  6. 図解・画像案を抽出（ローカル）
  7. visualAssetPlanを作成（Sanity）
- Add badges:
  - `保存先: local file`
  - `保存先: Sanity`
  - `AI実行: 手動`
  - `書き込み: なし / local / Sanity`
- Add "今どこ？" indicators based on artifact existence.
- Add "次にやること" cards after success panels.
- Add a stronger selected Content Idea context header in `/configurator`.
- Keep technical file names visible, but move them into artifact detail rows.
- Make the no-API boundary visually explicit:
  - DashboardはAIを自動実行しません。
  - Dashboardは画像生成しません。
  - Dashboardは投稿しません。

## Constraints Followed

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

## Runtime Unchanged Confirmation

This audit intentionally edits docs only. Existing dirty files under `dashboard/src`, `assets`, `patches`, `tools`, `publish-packages`, and package files are treated as user-owned from earlier phases.

## Next Recommended Step

Implement Phase 2C-UX before recording Phase 2C E2E as complete.
