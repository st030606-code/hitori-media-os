# workflow seed 作成ガイド

このガイドは、ここまでの手動・半自動ワークフローをSanity Studioへ `workflow` documentとして作成するためのメモです。

`workflow` は、小さな出力1つごとではなく、devlogやタスク単位で「何を使って、何を作り、何を学んだか」を記録します。

## seedファイル

```text
seed/workflow-records.json
```

含まれる `workflow`:

- サンプルレコードと媒体別プロンプト整備
- 文章系3媒体の下書き検証
- X出力追加と図解ペア投稿検証
- 動画・音声・図解下書き検証
- Sanity seed作成とStudio確認フロー
- ビジュアルアセット配置戦略の整理

## 参照関係

すべての `workflow` は、次の `contentIdea` を参照します。

```text
contentIdea.ai-blog-db
```

また、必要に応じて次のdocumentを参照します。

- `prompt.*`
- `platformOutput.*`
- `diagramPlan.*`

`toolsUsed` には、将来作成する `tool` documentの参照IDを入れています。

例:

- `tool.codex`
- `tool.chatgpt`
- `tool.sanity-cli`
- `tool.sanity-studio`
- `tool.local-files`
- `tool.docs-devlog`

`workflow.toolsUsed` は `tool` documentへの参照です。

そのため、`workflow` seedを作成する前に、必ず `tool` seedを作成します。

## 方針

- `workflowMode` はすべて `manual` にします。
- `reviewRequired` はすべて `true` にします。
- `outputFiles` にはローカルファイルやdocs/devlogのパスを残します。
- `observations` には、その作業で分かったことを短く残します。
- `devlogReference` には関連するdevlogを記録します。
- `publishedOutput` はまだ作成しません。

## CLIで作成する

事前に `.env.local` が設定されていることを確認します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

先に次のdocumentが作成済み、またはseed準備済みであることを確認します。

- `contentIdea.ai-blog-db`
- `prompt.*`
- `platformOutput.*`
- `diagramPlan.*`
- `tool.*`

作成順序:

1. `tool` recordsを作成する
2. `workflow` recordsを作成する

先に `tool` recordsを作成します。

```bash
npx sanity documents create seed/tool-records.json
```

同じ `_id` のtool documentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/tool-records.json --replace
```

必要ならStudioを起動します。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/workflow-records.json
```

同じ `_id` のdocumentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/workflow-records.json --replace
```

既存のworkflow documentでStudioに `Missing keys` が表示される場合も、修正済みseedで `--replace` します。

## Studioで確認すること

- 6件の `workflow` documentが作成されているか。
- `sourceContentIdea` が `contentIdea.ai-blog-db` を参照しているか。
- `promptsUsed` が関連するprompt documentを参照しているか。
- `platformOutputs` が関連するplatformOutput documentを参照しているか。
- `diagramPlans` が関連するdiagramPlan documentを参照しているか。
- `toolsUsed` が作成済みのtool documentを参照しているか。
- `outputFiles` からローカル成果物を追えるか。
- `observations` がdevlogの要約として使えるか。
- `workflowMode` が `manual` になっているか。
- `reviewRequired` が `true` になっているか。
- `promptsUsed`、`toolsUsed`、`platformOutputs`、`diagramPlans` に `Missing keys` 警告が出ていないか。

## トラブルシューティング: Missing keys

Sanity Studioで `Missing keys` が表示される場合、CLI/API経由で作成した配列内のobjectやreferenceに `_key` が入っていない可能性があります。

`workflow` seedでは、次の配列に `_key` が必要です。

- `promptsUsed`
- `toolsUsed`
- `platformOutputs`
- `diagramPlans`

reference itemは次の形にします。

```json
{
  "_key": "prompt-note-article",
  "_type": "reference",
  "_ref": "prompt.generate-note-article"
}
```

`outputFiles` は文字列配列なので `_key` は不要です。

## 次に進む条件

`workflow` seedの作成とStudio確認ができたら、次は必要に応じて `tool` と `workflow` の参照関係を見直します。

`publishedOutput` は、実際にnote、Substack、X、YouTubeなどへ公開したURLや反応が出てから作成します。
