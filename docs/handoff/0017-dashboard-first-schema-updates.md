# Handoff: Dashboard First Schema Updates

Date: 2026-05-12

## 1. Task Goal

将来のNext.jsダッシュボードを主UIにする方針に合わせて、Sanity TypeScriptスキーマへ `rawInput` と制御されたplatform / outputType選択肢を追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

## 3. Changed Files

- `schemas/contentIdea.ts`
- `schemas/prompt.ts`
- `schemas/platformOutput.ts`
- `schemas/diagramPlan.ts`
- `schemas/publishedOutput.ts`
- `docs/02-schema-design.md`
- `docs/devlog/0015-dashboard-first-schema-updates.md`
- `docs/handoff/latest.md`
- `docs/handoff/0017-dashboard-first-schema-updates.md`

## 4. Summary of Changes

`contentIdea.rawInput` を任意フィールドとして追加し、将来のダッシュボードで未整理メモを受け取れるようにしました。

`platform` / `targetPlatform` / `outputType` 系フィールドをselect option化し、媒体・出力種別を自由入力ではなく制御値で扱うようにしました。

## 5. Key Decisions

- `rawInput` は任意項目にして、既存の必須入力フローを重くしない。
- platform値は小文字英語に統一する。
- 表示ラベルは日本語優先・英語併記にする。
- 初回入力前なので、大文字混じりの旧値より将来のダッシュボードで扱いやすい制御値を優先した。
- outputTypeは `note-article`、`x-post`、`youtube-script` などの具体的な出力単位で管理する。

## 6. Human Review Questions

- platform値は小文字統一でよいか。
- `newsletter` と `substack-post` の使い分けはこのままでよいか。
- `diagram` をplatform値にも含める方針でよいか。
- 初回 `contentIdea` 入力時に `rawInput` も入れるべきか。
- サンプルJSONとプロンプト内の大文字platform参照を次に直すべきか。

## 7. Risks or Uncertainties

- 既存のサンプルJSONには `Substack`、`Threads`、`YouTube` など大文字platform値が残っています。
- 既存プロンプトにも大文字platformを参照する記述があります。
- もしStudioに既にデータを入れている場合、保存済みplatform値との表記揺れが発生する可能性があります。

## 8. Recommended Next Step

サンプルJSONとプロンプトを小文字platform制御値に合わせて更新し、その後Studioで初回 `contentIdea` 入力を試す。

## 9. Exact Prompt to Give Codex Next

```text
Align the sample content record and prompts with the new controlled platform values.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- inputs/content-ideas/example-ai-blog-db.json
- prompts/
- schemas/contentIdea.ts
- schemas/prompt.ts
- schemas/platformOutput.ts

Tasks:

1. Update platform values in the sample JSON to match lowercase controlled values.
2. Update outputChecklist outputType values to match controlled outputType values.
3. Update prompt instructions that refer to platformAngles.platform values so they use lowercase controlled values.
4. Do not create new outputs.
5. Add or update docs/devlog with what changed.
6. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What changed
2. Whether sample data now matches the schema
3. Whether prompts now match controlled platform values
4. Whether Studio is ready for first contentIdea entry
```

