# Handoff: Prompt Seeds

Date: 2026-05-12

## 1. Task Goal

`platformOutput.generatedFromPrompt` の参照先を用意するため、既存Markdownプロンプトに対応するSanity `prompt` seed documentsを作成する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `platformOutput` seed documentsは作成していません。
- Sanity CLI createは実行していません。

## 3. Changed Files

- `seed/prompt-records.json`
- `docs/06-prompt-seeds.md`
- `docs/04-first-content-entry.md`
- `docs/devlog/0018-prompt-seeds.md`
- `docs/handoff/latest.md`
- `docs/handoff/0023-prompt-seeds.md`

## 4. Summary of Changes

既存の8つのMarkdownプロンプトに対応する `prompt` seed documentsを追加しました。

MVPでは `promptBody` を複製せず、`localFilePath` を正本として扱う方針にしました。

Sanity CLIで `seed/prompt-records.json` を作成するためのガイドも追加しました。

## 5. Key Decisions

- 8件すべての既存プロンプトを一度にseed対象にした。
- `status` はすべて `active` にした。
- `targetPlatform` と `outputType` はスキーマの制御値に合わせた。
- `promptBody` はMVPでは省略した。
- `platformOutput` seedはまだ作らず、prompt seed確認後に進める。

## 6. Human Review Questions

- `promptBody` を空のままにする運用でよいか。
- `status` は全件 `active` でよいか。
- `requiredInputFields` と `humanReviewChecklist` はStudioで見やすい粒度か。
- prompt seed作成後、すぐ `platformOutput` seedへ進むか。

## 7. Risks or Uncertainties

- `promptBody` を省略するため、Studio単体ではプロンプト全文を読めません。
- `requiredInputFields` と `humanReviewChecklist` はMarkdownから手で要約しているため、今後プロンプト更新時に同期が必要です。
- `platformOutput.generatedFromPrompt` 参照は、prompt seed作成後に確認する必要があります。

## 8. Recommended Next Step

ユーザーが `npx sanity documents create seed/prompt-records.json` を実行し、Studioで8件のprompt documentを確認する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating prompt seed documents with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Current result:
- I ran: npx sanity documents create seed/prompt-records.json
- Result: [success/failure + notes]

Use:
- seed/prompt-records.json
- docs/06-prompt-seeds.md
- schemas/prompt.ts

Tasks:

1. Record whether prompt seed creation succeeded.
2. Record whether 8 prompt documents appear in Studio.
3. Record whether targetPlatform and outputType controlled values are preserved.
4. Record whether localFilePath works as the source of truth.
5. Recommend whether platformOutput seed documents can be created next.
6. Update docs/devlog and docs/handoff/latest.md with the result.

After editing, summarize:
1. Whether prompt seed creation worked
2. What Studio should show
3. Whether platformOutput seed can come next
```

