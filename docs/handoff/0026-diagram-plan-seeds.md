# Handoff: Diagram Plan Seeds

Date: 2026-05-12

## 1. Task Goal

既存の図解計画Markdownをもとに、Sanity CLIで作成できる `diagramPlan` seed documentsを準備する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `publishedOutput` seed documentsは作成していません。
- 実画像ファイルは作成していません。
- Codex側ではSanity CLI createを実行していません。

## 3. Changed Files

- `seed/diagram-plan-records.json`
- `docs/08-diagram-plan-seeds.md`
- `docs/devlog/0020-diagram-plan-seeds.md`
- `docs/handoff/latest.md`
- `docs/handoff/0026-diagram-plan-seeds.md`

## 4. Summary of Changes

Before / After、Obsidian vs Sanity、Manual first / API later、Content OSパイプライン、Instagramカルーセルの5件を `diagramPlan` seedとして作成しました。

すべてのdocumentは `contentIdea.ai-blog-db` を参照します。

図解関連の出力は `platformOutput` に入れず、ビジュアル制作計画として `diagramPlan` に分離しました。

## 5. Key Decisions

- `visualType` はスキーマの制御値 `diagram`, `carousel`, `paired-post` を使用する。
- `targetPlatform` は制御値 `x`, `note`, `github`, `instagram` を使用する。
- 実アセットはまだないため、`assetPath` は未設定にする。
- 現時点の `diagramPlan` スキーマにはprompt参照がないため、`prompt.generate-diagram-plan` は参照しない。
- 元出力や注意点は `reviewNotes` に残す。

## 6. Human Review Questions

- 5件の粒度は多すぎず少なすぎないか。
- `labels` は図内テキストとして短く使いやすいか。
- `imagePrompt` はChatGPT画像生成やデザイン作業に使える具体性があるか。
- `diagramPlan` にも `generatedFromPrompt` を将来追加すべきか。

## 7. Risks or Uncertainties

- `pairedPostText` はX向けを中心にしているため、ThreadsやInstagramでは調整が必要です。
- `imagePrompt` はまだ制作前の案なので、実際に画像生成・デザインしてみると修正が必要になる可能性があります。
- 図解制作後に `assetPath` をどう管理するかは未決定です。

## 8. Recommended Next Step

ユーザーが `seed/diagram-plan-records.json` をSanity CLIで作成し、Studioで5件の `diagramPlan` と制御値を確認する。

その後、Phase 1の作業全体をタスク単位で記録する `workflow` seed documentsを準備する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating diagramPlan seed documents with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Current result:
- I ran: npx sanity documents create seed/diagram-plan-records.json
- Result: [success/failure + notes]
- Studio review result:
  - 5 diagramPlan documents appear in Studio: [yes/no]
  - Before / After, Obsidian vs Sanity, Manual first/API later, Content OS pipeline, Instagram carousel appear: [yes/no]
  - sourceContentIdea references contentIdea.ai-blog-db: [yes/no + notes]
  - visualType controlled values are preserved: [yes/no + notes]
  - targetPlatform controlled values are preserved: [yes/no + notes]
  - layoutIdea and labels are useful for production: [yes/no + notes]
  - imagePrompt is useful for design or image generation: [yes/no + notes]
  - pairedPostText is useful where included: [yes/no + notes]
  - fields that felt heavy or confusing: [notes]

Use:
- seed/diagram-plan-records.json
- docs/08-diagram-plan-seeds.md
- schemas/diagramPlan.ts

Tasks:

1. Record whether diagramPlan seed creation succeeded.
2. Record whether all 5 diagramPlan documents appear correctly in Studio.
3. Record whether sourceContentIdea references are correct.
4. Record whether visualType and targetPlatform controlled values are preserved.
5. Record whether layoutIdea, labels, imagePrompt, and pairedPostText are useful in Studio.
6. Recommend whether to adjust the seed, schema, or labels before creating workflow seed documents.
7. Update docs/devlog and docs/handoff/latest.md with the result.
8. Create a numbered handoff file for this task.

After editing, summarize:
1. Whether diagramPlan seed creation worked
2. What Studio showed
3. Whether workflow seed can come next
4. Exact prompt to give Codex next for creating workflow seed documents
```
