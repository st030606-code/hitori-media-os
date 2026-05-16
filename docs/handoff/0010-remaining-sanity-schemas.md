# Handoff: Remaining Sanity Schemas

Date: 2026-05-11

## 1. Task Goal

MVP 7スキーマの残りである `workflow`、`publishedOutput`、`tool` を実装し、既存のSanityスキーマexportに追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- Sanity Studioは初期化していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- APIキー、認証情報、トークン、シークレットを保存するフィールドは追加していません。

## 3. Changed Files

- `schemas/workflow.ts`
- `schemas/publishedOutput.ts`
- `schemas/tool.ts`
- `schemas/index.ts`
- `docs/devlog/0008-remaining-sanity-schemas.md`
- `docs/handoff/latest.md`
- `docs/handoff/0010-remaining-sanity-schemas.md`

## 4. Summary of Changes

`workflow`、`publishedOutput`、`tool` のSanity TypeScriptスキーマを追加し、`schemas/index.ts` にexportしました。

`workflow` はtask/devlog単位の作業記録、`publishedOutput` は公開URLと公開後メモ、`tool` はCodexやClaude Codeなどの利用ツール記録として設計しています。

## 5. Key Decisions

- `workflow` は細かい出力ごとではなく、task/devlog単位で記録する。
- `workflow.reviewRequired` はrequiredにし、no-API MVPの人間レビュー前提を残す。
- `publishedOutput` は公開URL、公開日、反応メモ、学び、次の行動に絞る。
- `publishedOutput.sourcePlatformOutput` と `sourceDiagramPlan` は両方optional。運用上は少なくとも片方を入れる想定。
- `tool` は利用ツールの役割を記録するだけで、認証情報は保存しない。

## 6. Human Review Questions

- `workflow` の粒度は task/devlog 単位で十分か。
- `publishedOutput` で `sourcePlatformOutput` または `sourceDiagramPlan` のどちらか必須にする必要があるか。
- `tool.category` の分類は実務に合っているか。
- `tool.costModel` はどこまで詳しく管理すべきか。
- `platformOutput.sourceWorkflow` / `diagramPlan.sourceWorkflow` はweak referenceのままでよいか。

## 7. Risks or Uncertainties

- まだSanity依存関係がないため、スキーマは未コンパイルです。
- `publishedOutput` の「sourceどちらか必須」はSanity validationでまだ表現していません。
- `workflow` と `tool` は相互参照するため、Studio上の入力順は運用で調整が必要です。

## 8. Recommended Next Step

人間レビュー後、最小限のSanity依存関係と `sanity.config.ts` を追加して、スキーマがStudioで読み込めるか検証する。

## 9. Exact Prompt to Give Codex Next

```text
Add a minimal Sanity Studio setup for the existing schemas.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not store API keys or credentials.

Use:
- schemas/index.ts
- schemas/contentIdea.ts
- schemas/prompt.ts
- schemas/platformOutput.ts
- schemas/diagramPlan.ts
- schemas/workflow.ts
- schemas/publishedOutput.ts
- schemas/tool.ts

Tasks:

1. Add minimal Sanity project files needed to run Studio locally.
2. Add package scripts for Sanity Studio only.
3. Do not add Next.js.
4. Do not create API clients.
5. Keep schema setup focused on manual/no-API MVP workflow.
6. Create docs/devlog/0009-minimal-sanity-setup.md.
7. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What changed
2. How to run or validate the Studio
3. What still needs human review
4. What should be implemented next
```

