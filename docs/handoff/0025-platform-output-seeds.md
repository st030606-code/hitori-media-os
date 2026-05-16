# Handoff: Platform Output Seeds

Date: 2026-05-12

## 1. Task Goal

既存のPhase 1下書きMarkdownをもとに、Sanity CLIで作成できる `platformOutput` seed documentsを準備する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `publishedOutput` seed documentsは作成していません。
- 図解出力は `platformOutput` seedに含めていません。
- Codex側ではSanity CLI createを実行していません。

## 3. Changed Files

- `seed/platform-output-records.json`
- `docs/07-platform-output-seeds.md`
- `docs/devlog/0019-platform-output-seeds.md`
- `docs/handoff/latest.md`
- `docs/handoff/0025-platform-output-seeds.md`

## 4. Summary of Changes

note、Substack、Threads、X、YouTube、Shorts、Podcastの7件を `platformOutput` seedとして作成しました。

各documentは `contentIdea.ai-blog-db` を参照し、媒体ごとに対応する `prompt.*` documentを `generatedFromPrompt` で参照します。

CLI作成手順とStudio確認項目を `docs/07-platform-output-seeds.md` に追加しました。

## 5. Key Decisions

- `draftBody` には既存Markdown下書き本文を入れる。
- `localOutputPath` も残し、ローカル下書きとの対応を追えるようにする。
- `status` は `drafted`、`contentStatus` は `needs-review` にする。
- 図解出力は `platformOutput` ではなく、次の `diagramPlan` seedで扱う。
- `publishedOutput` は公開後のURLや反応を扱うため、今回は作成しない。

## 6. Human Review Questions

- `draftBody` にMarkdown全文を入れる運用でStudio上の編集体験に問題がないか。
- `reviewNotes` は人間レビューの観点として十分か。
- `outputLength` と `targetFormat` の表現は、将来のダッシュボードで使いやすい粒度か。

## 7. Risks or Uncertainties

- MarkdownファイルとSanity上の `draftBody` が二重管理になるため、どちらを編集正本にするかの運用ルールが必要です。
- 長文台本をStudioのtext fieldで扱う場合、編集体験が重く感じる可能性があります。
- CLI作成後に参照がStudioで期待どおり表示されるかは、ユーザー環境での確認が必要です。

## 8. Recommended Next Step

ユーザーが `seed/platform-output-records.json` をSanity CLIで作成し、Studioで7件の `platformOutput` と参照関係を確認する。

その後、`diagramPlan` seed documentsを準備する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating platformOutput seed documents with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Current result:
- I ran: npx sanity documents create seed/platform-output-records.json
- Result: [success/failure + notes]
- Studio review result:
  - 7 platformOutput documents appear in Studio: [yes/no]
  - note / substack / threads / x / youtube / shorts / podcast outputs appear: [yes/no]
  - sourceContentIdea references contentIdea.ai-blog-db: [yes/no + notes]
  - generatedFromPrompt references the correct prompt documents: [yes/no + notes]
  - platform controlled values are preserved: [yes/no + notes]
  - outputType controlled values are preserved: [yes/no + notes]
  - draftBody is populated correctly: [yes/no + notes]
  - localOutputPath is set correctly: [yes/no + notes]
  - status/contentStatus values are correct: [yes/no + notes]
  - fields that felt heavy or confusing: [notes]

Use:
- seed/platform-output-records.json
- docs/07-platform-output-seeds.md
- schemas/platformOutput.ts

Tasks:

1. Record whether platformOutput seed creation succeeded.
2. Record whether all 7 platformOutput documents appear correctly in Studio.
3. Record whether sourceContentIdea and generatedFromPrompt references are correct.
4. Record whether platform and outputType controlled values are preserved.
5. Record whether draftBody/localOutputPath/status/contentStatus are useful in Studio.
6. Recommend whether to adjust the seed, schema, or labels before creating diagramPlan seed documents.
7. Update docs/devlog and docs/handoff/latest.md with the result.
8. Create a numbered handoff file for this task.

After editing, summarize:
1. Whether platformOutput seed creation worked
2. What Studio showed
3. Whether diagramPlan seed can come next
4. Exact prompt to give Codex next for creating diagramPlan seed documents
```
