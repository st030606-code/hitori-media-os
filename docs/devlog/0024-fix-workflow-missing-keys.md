# 0024: workflow seedのMissing keysを修正

日付: 2026-05-12

## 背景

`workflow` documentはSanity Studio上に作成されましたが、配列フィールドに `Missing keys` 警告が表示されました。

対象になった主なフィールド:

- `promptsUsed`
- `toolsUsed`
- `platformOutputs`
- `diagramPlans`

原因は、CLI/API経由で作成した配列内のreference objectに `_key` が入っていなかったことです。

## 決定・変更

`seed/workflow-records.json` を更新し、配列内のreference objectすべてに安定した `_key` を追加しました。

例:

```json
{
  "_key": "prompt-note-article",
  "_type": "reference",
  "_ref": "prompt.generate-note-article"
}
```

`outputFiles` は文字列配列なので `_key` は追加していません。

## 修正したフィールド

修正対象:

- `promptsUsed`
- `toolsUsed`
- `platformOutputs`
- `diagramPlans`

ドキュメントIDや参照先IDは変更していません。

## 置き換え方法

既存のworkflow documentを修正済みseedで置き換えます。

```bash
npx sanity documents create seed/workflow-records.json --replace
```

置き換え後、Studioで `Missing keys` 警告が消えているか確認します。

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

`publishedOutput` seed documentsも作成していません。

## 次の一手

ユーザーが修正済みworkflow seedを `--replace` で再投入します。

その後、Studioで次を確認します。

- `Missing keys` 警告が消えているか。
- `promptsUsed`、`toolsUsed`、`platformOutputs`、`diagramPlans` の参照が維持されているか。
- workflowの6件が引き続き正しく表示されるか。

## 置き換え結果

ユーザーが次を実行しました。

```bash
npx sanity documents create seed/workflow-records.json --replace
```

結果: 成功。

Studioレビュー結果:

- 6件の `workflow` documentがStudioに表示されている。
- `Missing keys` 警告は消えている。
- `promptsUsed` の参照は維持されている。
- `toolsUsed` の参照は維持されている。
- `platformOutputs` の参照は維持されている。
- `diagramPlans` の参照は維持されている。
- 現時点で重い、または分かりにくいフィールドはない。

## 次に確認するseed

今回の問題は、配列内のobject/referenceに `_key` がなかったことです。

同じ種類の警告を避けるため、次はほかのseedも確認します。

優先して見るもの:

- `seed/contentIdea-ai-blog-db.json`
- `seed/prompt-records.json`
- `seed/platform-output-records.json`
- `seed/diagram-plan-records.json`

文字列配列だけであれば `_key` は不要です。

配列内にobjectやreferenceがある場合は、Sanity Studioで `Missing keys` が出ていないか確認します。
