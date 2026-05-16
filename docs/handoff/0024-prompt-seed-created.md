# Handoff: Prompt Seed Created

Date: 2026-05-12

## 1. Task Goal

Sanity CLIで `prompt` seed documentsを作成し、Studio上で8件のprompt documentが確認できた結果を記録する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- Codex側ではSanity CLI createやStudio操作を実行していません。
- `platformOutput` seed documentsはまだ作成していません。

## 3. Changed Files

- `docs/devlog/0018-prompt-seeds.md`
- `docs/handoff/latest.md`
- `docs/handoff/0024-prompt-seed-created.md`

## 4. Summary of Changes

ユーザーが `npx sanity documents create seed/prompt-records.json` を実行し、成功したことを記録しました。

Studioで8件のprompt documentが表示され、`targetPlatform`、`outputType`、`localFilePath`、`promptBody` の扱いも期待どおりであることを記録しました。

## 5. Key Decisions

- prompt seed creationは成功済みとして扱う。
- `localFilePath` を正本として扱う方針は有効。
- `promptBody` はMVPでは空または未設定のままでよい。
- 次は `platformOutput` seed documentsを作成できる。

## 6. Human Review Questions

- `platformOutput` seedは既存のMarkdown出力ファイルをすべて対象にするか、まずnote / Substack / Threads / Xだけにするか。
- `platformOutput.draftBody` にMarkdown全文を入れるか、localOutputPath中心にするか。
- `platformOutput.generatedFromPrompt` の参照IDは今回の `_id` で固定してよいか。

## 7. Risks or Uncertainties

- `platformOutput.draftBody` はrequiredなので、seedする場合は本文を入れる必要があります。
- 既存の出力ファイルをSanityに複製すると、Markdownファイルとの同期方針が必要になります。
- `diagramPlan` と `platformOutput` の境界を、図解出力で再確認する必要があります。

## 8. Recommended Next Step

既存の `outputs/` Markdown下書きをもとに、Sanity CLIで作成できる `platformOutput` seed documentsを準備する。

## 9. Exact Prompt to Give Codex Next

```text
Prepare Sanity CLI seed documents for platformOutput records.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Use:
- outputs/note/
- outputs/substack/
- outputs/threads/
- outputs/x/
- outputs/youtube/
- outputs/shorts/
- outputs/podcast/
- schemas/platformOutput.ts
- seed/contentIdea-ai-blog-db.json
- seed/prompt-records.json

Tasks:

1. Create seed/platform-output-records.json containing platformOutput documents for existing text/script/social outputs.
2. Include outputs for note, substack, threads, x, youtube, shorts, and podcast.
3. Do not include diagram outputs in platformOutput seed if they belong better in diagramPlan.
4. Each platformOutput document should include:
   - _id
   - _type: "platformOutput"
   - sourceContentIdea reference to contentIdea.ai-blog-db
   - platform
   - outputType
   - title
   - draftBody
   - localOutputPath
   - status
   - reviewNotes
   - generatedFromPrompt reference to the correct prompt document
   - outputLength if useful
   - targetFormat if useful
   - primaryCTA if useful
   - contentStatus
5. Keep platform and outputType values aligned with schema controlled values.
6. Add CLI create instructions to docs.
7. Create or update docs/devlog.
8. Update docs/handoff/latest.md and create a numbered handoff file.

After editing, summarize:
1. What platformOutput seeds were created
2. How prompt references are wired
3. Whether diagramPlan seeds should come next
```

