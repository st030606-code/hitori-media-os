# 0017: 初回contentIdea seed documentを作成

日付: 2026-05-12

## 背景

最初の `contentIdea` をSanity Studioで全項目手入力する代わりに、Sanity CLIで作成できるseed JSONを用意しました。

これにより、初回はCLIでデータを作成し、Studioでは入力作業ではなくレビューと確認に集中できます。

## 決定・変更

`seed/contentIdea-ai-blog-db.json` を追加しました。

このファイルは、Sanityの `contentIdea` documentとして作成できるように、次を含めています。

- `_id`
- `_type: "contentIdea"`
- `title`
- `slug`
- `status`
- `rawInput`
- `summary`
- `coreThesis`
- `audience`
- `audiencePain`
- `claims`
- `tone`
- `platformAngles`
- `outputChecklist`
- `examples`
- `objections`
- `personalContext`

`slug` はSanityのslug object形式にしています。

array内のobjectには、Sanity Studioで扱いやすいように `_key` と `_type` を付けています。

## CLI作成手順

`docs/04-first-content-entry.md` に、次のコマンドを追記しました。

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json
```

同じ `_id` のdocumentを作り直す場合のみ、確認したうえで `--replace` を使う方針にしています。

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json --replace
```

## CLI作成結果

ユーザーが次のコマンドを実行しました。

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json
```

結果: 成功。

最初の `contentIdea` seed document はエラーなく作成されました。

次にStudioで `contentIdea.ai-blog-db` を開き、表示と編集しやすさを確認します。

## Studioレビュー項目

- `rawInput` が正しく表示されているか。
- `claims` が正しく表示されているか。
- `platformAngles` が正しく表示されているか。
- `outputChecklist` が正しく表示されているか。
- `examples` が正しく表示されているか。
- `objections` が正しく表示されているか。
- `personalContext` が正しく表示されているか。
- `platform` の制御値が小文字のまま保存されているか。
- `outputType` の制御値がスキーマの選択肢どおり保存されているか。

## Studioレビュー結果

ユーザーがStudioで `contentIdea.ai-blog-db` を確認しました。

| 項目 | 結果 | メモ |
| --- | --- | --- |
| `contentIdea.ai-blog-db` がStudioに表示されるか | yes | 正しく表示された。 |
| `rawInput` が正しく表示されるか | yes | 正しく表示された。 |
| `claims` が正しく表示されるか | yes | 正しく表示された。 |
| `platformAngles` が正しく表示されるか | yes | 正しく表示された。 |
| `outputChecklist` が正しく表示されるか | yes | 正しく表示された。 |
| `examples` が正しく表示されるか | yes | 正しく表示された。 |
| `objections` が正しく表示されるか | yes | 正しく表示された。 |
| `personalContext` が正しく表示されるか | yes | 正しく表示された。 |
| `platform` / `outputType` の制御値が保たれているか | yes | 制御値は保たれていた。 |
| 重い・分かりにくいフィールドがあるか | no | このseedレビューでは特になし。 |

## Studioレビュー後の判断

seedベースの初回 `contentIdea` 作成は検証済みとして扱えます。

Studioは、seed作成後のレビュー・編集画面として十分に機能しました。

現時点では、`contentIdea` スキーマ、seed、Studioラベルへの即時修正は不要です。

次は `platformOutput.generatedFromPrompt` が `prompt` を参照するため、`platformOutput` より先に `prompt` documentをseedするのが自然です。

## 手入力フローとの関係

今回の成功により、seedベースの作成フローは初回の手入力検証をほぼ置き換えられます。

Studioの役割は、ゼロから全項目を入力する場所ではなく、seedされた `contentIdea` を確認し、編集しやすさや項目の重さをレビューする場所になります。

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

Codex側ではSanity CLIのcreateコマンドを実行していません。ユーザーがローカル環境で実行し、成功を確認しました。

## 次に確認すること

- Studioで `contentIdea.ai-blog-db` が表示されるか
- `rawInput`、`claims`、`platformAngles`、`outputChecklist` がStudioで見やすいか
- `examples`、`objections`、`personalContext` がStudioで見やすいか
- `prompt` seedを作成し、その後 `platformOutput` seedへ進む
