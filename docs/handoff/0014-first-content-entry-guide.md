# Handoff: First Content Entry Guide

Date: 2026-05-12

## 1. Task Goal

最初の `contentIdea` をSanity Studioへ手入力するための短いガイドを作成する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

## 3. Changed Files

- `docs/04-first-content-entry.md`
- `docs/devlog/0012-first-content-entry-guide.md`
- `docs/handoff/latest.md`
- `docs/handoff/0014-first-content-entry-guide.md`

## 4. Summary of Changes

`example-ai-blog-db.json` をSanity Studioの `contentIdea` に手入力するためのガイドを追加しました。

JSONフィールドとStudioフィールドの対応、必須/任意フィールド、入力順、入力後QAチェックを整理しています。

## 5. Key Decisions

- 最初は必須フィールドだけで保存できるか確認する。
- `contentIdea` には生成済み下書き本文を入れない。
- 生成下書きは `platformOutput`、図解計画は `diagramPlan`、公開情報は `publishedOutput` に分ける。
- 初回入力元は `inputs/content-ideas/example-ai-blog-db.json`。

## 6. Human Review Questions

- ガイドはStudioを見ながら迷わず入力できる粒度か。
- 初回入力で任意フィールドもどこまで入れるべきか。
- `Claims` と `Platform Angles` の入力が重すぎないか。
- 次は `prompt` と `platformOutput` のどちらを先に入力すべきか。

## 7. Risks or Uncertainties

- `contentIdea` の必須項目が多いと、初回入力が重く感じる可能性があります。
- `platformAngles` のobject配列入力がStudio上で扱いやすいかは実操作で確認が必要です。
- 生成下書き本文を誤って `contentIdea` に入れない運用確認が必要です。

## 8. Recommended Next Step

Studioで `inputs/content-ideas/example-ai-blog-db.json` をもとに最初の `contentIdea` を1件入力し、QAチェックを行う。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of the first manual contentIdea entry in Sanity Studio.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- docs/04-first-content-entry.md
- inputs/content-ideas/example-ai-blog-db.json
- schemas/contentIdea.ts

Tasks:

1. After the user manually enters the first contentIdea in Studio, update docs/devlog with what worked and what felt heavy.
2. Record whether required fields were reasonable.
3. Record whether claims and platformAngles were easy to enter.
4. Recommend whether to adjust contentIdea schema before entering more records.
5. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What was learned from first entry
2. Whether contentIdea schema should change
3. What should be entered next
```

