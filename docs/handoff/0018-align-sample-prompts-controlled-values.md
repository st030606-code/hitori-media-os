# Handoff: Align Sample Prompts Controlled Values

Date: 2026-05-12

## 1. Task Goal

サンプルJSONと保存済みプロンプトを、Sanityスキーマで定義した小文字のplatform / outputType制御値に合わせる。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- 新しい出力ファイルは作成していません。

## 3. Changed Files

- `inputs/content-ideas/example-ai-blog-db.json`
- `prompts/generate-substack-post.md`
- `prompts/generate-threads-post.md`
- `prompts/generate-youtube-script.md`
- `prompts/generate-shorts-script.md`
- `prompts/generate-podcast-script.md`
- `prompts/generate-diagram-plan.md`
- `prompts/generate-x-post.md`
- `docs/devlog/0016-align-sample-prompts-controlled-values.md`
- `docs/handoff/latest.md`
- `docs/handoff/0018-align-sample-prompts-controlled-values.md`

## 4. Summary of Changes

サンプルJSONの `platformAngles.platform` と `outputChecklist.outputType` を、スキーマの制御値に合わせました。

各プロンプトで `platformAngles.platform` を参照する条件も、小文字制御値へ更新しました。

`substack` はSubstack固有の投稿、`newsletter` は汎用ニュースレター / メール配信用として扱うことを明記しました。

## 5. Key Decisions

- 媒体名の表示としてのSubstack / YouTubeなどは残し、データ値だけを小文字制御値へ揃えた。
- X、diagram、paid、newsletterのplatform angleをサンプルJSONに追加した。
- `outputType` は `note-article`、`x-post`、`paid-article-outline` など具体的な出力単位にした。
- 新しい出力ファイルは作らず、入力データとプロンプトだけを更新した。

## 6. Human Review Questions

- `newsletter` をSubstackとは別出力として今後扱うか。
- `paid` と `paid-article-outline` の出力先フォルダを追加するか。
- `diagram` をplatform angleとして持たせる運用でよいか。
- 初回Sanity入力では `rawInput` も入れるべきか。

## 7. Risks or Uncertainties

- `outputs/paid/` と `outputs/newsletter/` はまだ作成していません。
- `newsletter` 専用プロンプトはまだありません。
- サンプルJSONにplatform angleを追加したため、初回入力の手数は少し増えます。

## 8. Recommended Next Step

Sanity Studioで `inputs/content-ideas/example-ai-blog-db.json` をもとに、最初の `contentIdea` を手入力して保存できるか確認する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of the first manual contentIdea entry in Sanity Studio.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- docs/04-first-content-entry.md
- inputs/content-ideas/example-ai-blog-db.json
- schemas/contentIdea.ts

Tasks:

1. After the first contentIdea is manually entered in Studio, update docs/devlog with what worked and what felt heavy.
2. Record whether required fields were reasonable.
3. Record whether rawInput, claims, outputChecklist, and platformAngles were easy to enter.
4. Recommend whether to adjust contentIdea schema before entering more records.
5. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What was learned from first entry
2. Whether contentIdea schema should change
3. Whether platform/outputType controlled values worked
4. What should be entered next
```

