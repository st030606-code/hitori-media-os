# Handoff: Studio Review Validated

Date: 2026-05-12

## 1. Task Goal

最初の `contentIdea` seed document のStudioレビュー結果を確定し、seed-based first entryが有効か判断する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- Codex側ではSanity CLI createやStudio操作を実行していません。

## 3. Changed Files

- `docs/devlog/0017-first-content-seed.md`
- `docs/handoff/latest.md`
- `docs/handoff/0022-studio-review-validated.md`

## 4. Summary of Changes

Studioレビュー結果をdevlogに反映しました。

`contentIdea.ai-blog-db`、`rawInput`、`claims`、`platformAngles`、`outputChecklist`、`examples`、`objections`、`personalContext` はすべて正しく表示されました。

platform / outputType の制御値も保たれていました。

## 5. Key Decisions

- seed-based first entryは検証済みとして扱う。
- Studioはseed後のレビュー・編集画面として十分に機能する。
- `contentIdea` スキーマ、seed、Studioラベルへの即時修正は不要。
- 次は `platformOutput` より先に `prompt` seedを作る。

## 6. Human Review Questions

- `prompt` seedに全プロンプトを一度に入れるか、まず主要3媒体だけ入れるか。
- `prompt.localFilePath` を正本として扱う運用で問題ないか。
- `promptBody` は空にするか、Markdown本文のスナップショットも入れるか。
- `outputs/paid/` と `outputs/newsletter/` を先に作るか。

## 7. Risks or Uncertainties

- prompt seedを作る前に、各promptの `targetPlatform` と `outputType` を再確認する必要があります。
- `platformOutput.generatedFromPrompt` が `prompt` を参照するため、prompt seedなしでplatformOutput seedへ進むと参照が作れません。
- `promptBody` にMarkdown全文を入れる場合、Sanity上の管理が重くなる可能性があります。

## 8. Recommended Next Step

`prompts/` のMarkdownファイルをもとに、Sanity CLIで作成できる `prompt` seed documentsを作成する。

## 9. Exact Prompt to Give Codex Next

```text
Prepare Sanity CLI seed documents for prompt records.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create platformOutput seed documents yet.

Use:
- prompts/
- schemas/prompt.ts
- docs/devlog/0017-first-content-seed.md

Tasks:

1. Create seed/prompt-records.json containing prompt documents for existing prompt Markdown files.
2. Each prompt document should include:
   - _id
   - _type: "prompt"
   - title
   - targetPlatform
   - outputType
   - localFilePath
   - requiredInputFields
   - humanReviewChecklist
   - outputPathPattern
   - version
   - status
   - notes
3. Keep targetPlatform and outputType values aligned with schema controlled values.
4. Prefer localFilePath as source of truth. Do not duplicate full promptBody unless there is a strong reason.
5. Add CLI create instructions to docs/04-first-content-entry.md or a new prompt seed guide.
6. Create or update docs/devlog.
7. Update docs/handoff/latest.md and create a numbered handoff file.

After editing, summarize:
1. What prompt seeds were created
2. How to create them with Sanity CLI
3. Whether platformOutput seeds can come next
```

