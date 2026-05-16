# 0023: workflow seedの前にtool seedを追加

日付: 2026-05-12

## 背景

`workflow` seed作成時に、`toolsUsed` が存在しない `tool` documentを参照していたため、Sanity CLI作成が失敗しました。

エラー例:

- `workflow.ai-blog-db.first-text-social-outputs` が `tool.codex` を参照している
- `workflow.ai-blog-db.x-output-addition` が `tool.local-files` を参照している

`workflow.toolsUsed` は `tool` documentへの参照なので、workflowより先にtoolを作る必要があります。

## 決定・変更

`seed/tool-records.json` を追加しました。

含めた `tool` documentは次の14件です。

- `tool.codex`
- `tool.claude-code`
- `tool.chatgpt`
- `tool.claude-app`
- `tool.sanity`
- `tool.sanity-cli`
- `tool.sanity-studio`
- `tool.local-files`
- `tool.docs-devlog`
- `tool.github`
- `tool.obsidian`
- `tool.capcut`
- `tool.elevenlabs`
- `tool.fish-audio`

また、`docs/10-workflow-seeds.md` を更新し、作成順序を明確にしました。

1. `tool` recordsを作成する
2. `workflow` recordsを作成する

新しく `docs/11-tool-seeds.md` も追加しました。

## なぜこの修正が必要か

Sanity CLIは、存在しないdocumentへの通常参照があると作成に失敗します。

`workflow` はツール利用履歴を記録するschemaなので、`toolsUsed` の参照先になる `tool` documentを先に作っておく必要があります。

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

ElevenLabs、Fish Audio、CapCutは、LLM API連携ではなく媒体化のための制作ツールとして記録しています。

## 次の一手

ユーザーが次を実行します。

```bash
npx sanity documents create seed/tool-records.json
```

成功したら、workflow seedを再実行できます。

```bash
npx sanity documents create seed/workflow-records.json
```
