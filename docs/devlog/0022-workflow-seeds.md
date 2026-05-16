# 0022: workflow seed documentsを準備

日付: 2026-05-12

## 背景

`contentIdea`、`prompt`、`platformOutput`、`diagramPlan` のseedが揃い、Sanity上で扱う主要な制作物の形が見えてきました。

次に必要なのは、これらがどの作業・判断・手動ワークフローから生まれたかをタスク単位で記録することです。

## 決定・変更

`seed/workflow-records.json` を追加しました。

含めた `workflow` documentは次の6件です。

- `workflow.ai-blog-db.sample-record-and-prompts`
- `workflow.ai-blog-db.first-text-social-outputs`
- `workflow.ai-blog-db.x-output-addition`
- `workflow.ai-blog-db.video-audio-visual-test`
- `workflow.ai-blog-db.sanity-seed-creation`
- `workflow.ai-blog-db.visual-asset-strategy`

また、CLI作成手順として `docs/10-workflow-seeds.md` を追加しました。

## 設計方針

workflowは、小さな出力1つごとではなく、devlogやタスク単位で記録します。

理由:

- 細かくしすぎるとStudio上で追いにくい。
- 今回のMVPでは、出力1件ごとの自動化履歴より、作業判断と学びの記録が重要。
- 将来のダッシュボードでは、タスク単位の進捗として見せた方が分かりやすい。

## 参照設計

すべてのworkflowは `contentIdea.ai-blog-db` を参照します。

必要に応じて、次も参照します。

- `prompt.*`
- `platformOutput.*`
- `diagramPlan.*`

`toolsUsed` には、将来作成する `tool` documentの参照IDを入れました。

例:

- `tool.codex`
- `tool.chatgpt`
- `tool.sanity-cli`
- `tool.sanity-studio`
- `tool.local-files`
- `tool.docs-devlog`

現時点では `tool` seed documentsがまだないため、Studio上では未解決参照として見える可能性があります。

次に `tool` seedを作ることで、この参照を解消できます。

## publishedOutputをまだ作らない理由

`publishedOutput` は、実際に公開されたURL、公開日、反応、学び、次の行動を記録するschemaです。

現時点の出力はすべて下書き・計画段階です。

そのため、`publishedOutput` seedはまだ作りません。

## CLI作成手順

手順は `docs/10-workflow-seeds.md` にまとめました。

実行コマンド:

```bash
npx sanity documents create seed/workflow-records.json
```

同じ `_id` を作り直す場合のみ、確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/workflow-records.json --replace
```

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

`publishedOutput` seed documentsも作成していません。

Codex側ではSanity CLI createは実行していません。ユーザーがローカル環境で実行し、Studioで確認する前提です。

## 次の一手

次は、ユーザーが `seed/workflow-records.json` をSanity CLIで作成し、Studioで6件のworkflowと参照関係を確認します。

その後、`toolsUsed` の未解決参照を解消するために、`tool` seed documentsを作るのが自然です。
