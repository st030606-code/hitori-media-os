# 0007: 最初のSanityスキーマを作成

日付: 2026-05-11

## 背景

Phase 2でMVP 7スキーマの詳細設計を行ったため、Phase 3準備として最初の4スキーマだけをTypeScriptで作成しました。

Sanity Studioの初期化、Next.js追加、有料LLM API連携、OpenAI API / Anthropic API クライアントの追加、自動生成・自動投稿は行っていません。

## 作成したスキーマ

作成したファイル:

- `schemas/contentIdea.ts`
- `schemas/prompt.ts`
- `schemas/platformOutput.ts`
- `schemas/diagramPlan.ts`
- `schemas/index.ts`

実装したスキーマ:

- `contentIdea`
- `prompt`
- `platformOutput`
- `diagramPlan`

まだ実装していないスキーマ:

- `workflow`
- `publishedOutput`
- `tool`

## required / optional の判断

`contentIdea` で required にした主な項目:

- `title`
- `slug`
- `status`
- `summary`
- `coreThesis`
- `audience`
- `audiencePain`
- `claims`
- `tone`
- `platformAngles`

`contentIdea` で optional にした主な項目:

- `contentPillars`
- `evidence`
- `examples`
- `objections`
- `sourceLinks`
- `outputChecklist`
- `personalContext`

`prompt` では、Markdownファイルを source of truth として残すため、`localFilePath` を required にしました。

`platformOutput` では、`sourceContentIdea`、`platform`、`outputType`、`draftBody`、`status`、`generatedFromPrompt` を required にしました。

`diagramPlan` では、`sourceContentIdea`、`visualType`、`targetPlatform`、`title`、`layoutIdea`、`status` を required にしました。

## contentIdeaを軽くした理由

Phase 1で、ひとつの元レコードから複数の下書き、図解案、CTA、公開物が派生することが分かりました。

それらをすべて `contentIdea` に入れると、元レコードが重くなりすぎます。

そのため、`contentIdea` は中心主張、読者、主張、トーン、媒体別切り口に集中させました。

生成下書きは `platformOutput`、図解計画は `diagramPlan`、公開後の情報は将来の `publishedOutput` に分けます。

## promptにlocalFilePathを持たせた理由

現時点では、プロンプトMarkdownファイルをリポジトリ上の source of truth として扱います。

Sanity上の `prompt` は、対象媒体、必要入力、レビュー項目、出力パスパターンなどのメタデータを管理する役割です。

`promptBody` は任意のスナップショットとして扱い、必須にはしません。

これにより、プロンプト改善はGit管理しつつ、Sanity側ではどのプロンプトがどの出力に使われたかを追跡できます。

## no-API MVPの維持

今回のスキーマには、APIキー、認証情報、OpenAI API / Anthropic API クライアント設定は含めていません。

`tool` スキーマはまだ未実装ですが、将来実装するときも利用ツールの役割を記録するだけで、認証情報は保存しません。

## 次に実装するもの

次に実装する候補:

1. `workflow`
2. `publishedOutput`
3. `tool`

ただし、その前に人間レビューで次を確認します。

- `contentIdea` のrequired項目が多すぎないか
- `sourceWorkflow` のoptional referenceをこのまま置くか
- `promptBody` を任意のままでよいか
- `platformOutput.draftBody` をtextで十分とするか、blockContentへ広げるか
- `diagramPlan` の `imagePrompt` と `pairedPostText` の粒度が実務に合うか

