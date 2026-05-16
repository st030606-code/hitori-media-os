# 0008: 残りのSanityスキーマを作成

日付: 2026-05-11

## 背景

前回、MVP 7スキーマのうち `contentIdea`、`prompt`、`platformOutput`、`diagramPlan` を作成しました。

今回は残りの `workflow`、`publishedOutput`、`tool` を追加し、MVP 7スキーマを一通り揃えました。

Next.js、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成・自動投稿は追加していません。

## 作成したスキーマ

- `schemas/workflow.ts`
- `schemas/publishedOutput.ts`
- `schemas/tool.ts`

更新したファイル:

- `schemas/index.ts`

## required / optional の判断

`workflow` で required にした主な項目:

- `title`
- `sourceContentIdea`
- `promptsUsed`
- `workflowMode`
- `reviewRequired`

`workflow` で optional にした主な項目:

- `toolsUsed`
- `platformOutputs`
- `diagramPlans`
- `outputFiles`
- `observations`
- `devlogReference`

`publishedOutput` で required にした主な項目:

- `platform`
- `publishedUrl`
- `publishedAt`
- `title`

`sourcePlatformOutput` と `sourceDiagramPlan` は、テキスト出力とビジュアル出力の両方に対応するため、どちらも optional にしています。運用上は少なくとも片方を入れる前提です。

`tool` で required にした主な項目:

- `name`
- `category`
- `role`
- `usedFor`

`costModel`、`notes`、`relatedWorkflows` は optional にしました。

## 重要な判断

`workflow` は細かい出力ごとではなく、task / devlog 単位で記録する前提にしました。

たとえば、note、Substack、Threads をまとめて生成した作業は、1つの `workflow` として記録します。

これにより、Sanity上の workflow が細かくなりすぎることを防ぎます。

`publishedOutput` は、公開後のURL、公開日、反応メモ、学び、次の行動だけを保存します。

詳細な分析や自動取得はMVPでは扱いません。

`tool` には、Codex、Claude Code、ChatGPT、Claude アプリ、CapCut、ElevenLabs、Fish Audio などの役割を記録します。

ただし、APIキー、認証情報、トークン、シークレットは保存しません。

## no-API MVPの維持

今回の追加でも、OpenAI API や Anthropic API のクライアント設定は含めていません。

`tool` は、API連携のためではなく、手動・半自動ワークフローでどのツールを何に使ったかを記録するためのスキーマです。

## まだ人間レビューが必要な点

- `workflow` の記録粒度が task / devlog 単位で十分か
- `publishedOutput` で `sourcePlatformOutput` または `sourceDiagramPlan` のどちらか必須にする運用をどう担保するか
- `tool.category` の分類が実務に合っているか
- `tool.costModel` に契約状況をどこまで入れるか
- `publishedOutput.performanceNotes` の粒度をどこまで求めるか

## 次の一手

次は、最小限のSanity設定と依存関係セットアップへ進めます。

ただし、Sanity Studioを初期化する前に、スキーマ7つを人間がレビューし、必須項目が重すぎないかを確認します。

