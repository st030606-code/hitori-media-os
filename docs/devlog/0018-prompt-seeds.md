# 0018: prompt seed documentsを作成

日付: 2026-05-12

## 背景

最初の `contentIdea` seed document はSanity CLIで作成でき、Studioでも正しく表示されました。

次に `platformOutput` をseedするには、`platformOutput.generatedFromPrompt` の参照先になる `prompt` documentが必要です。

そのため、既存の `prompts/` Markdownファイルをもとに、Sanity CLIで作成できるprompt seedを用意しました。

## 決定・変更

`seed/prompt-records.json` を追加しました。

含めたprompt documentは次の8件です。

- `prompt.generate-note-article`
- `prompt.generate-substack-post`
- `prompt.generate-threads-post`
- `prompt.generate-x-post`
- `prompt.generate-youtube-script`
- `prompt.generate-shorts-script`
- `prompt.generate-podcast-script`
- `prompt.generate-diagram-plan`

各documentには次を含めています。

- `_id`
- `_type: "prompt"`
- `title`
- `targetPlatform`
- `outputType`
- `localFilePath`
- `requiredInputFields`
- `humanReviewChecklist`
- `outputPathPattern`
- `version`
- `status`
- `notes`

## promptBodyの扱い

MVPでは `promptBody` にMarkdown全文を複製しません。

正本は `localFilePath` が指す `prompts/*.md` とします。

Sanity上の `prompt` は、プロンプト本文のコピーではなく、媒体、出力種別、必要入力、レビュー項目、保存先パターンを管理する台帳として使います。

## CLI作成手順

`docs/06-prompt-seeds.md` を追加し、次のコマンドを記録しました。

```bash
npx sanity documents create seed/prompt-records.json
```

同じ `_id` のdocumentを作り直す場合のみ、確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/prompt-records.json --replace
```

## CLI作成結果

ユーザーが次のコマンドを実行しました。

```bash
npx sanity documents create seed/prompt-records.json
```

結果: 成功。

Studioレビューでも、8件の `prompt` document が表示されました。

確認できたprompt:

- note
- substack
- threads
- x
- youtube
- shorts
- podcast
- diagram

`targetPlatform` と `outputType` の制御値は保たれていました。

`localFilePath` も正しく設定されていました。

`promptBody` はMVP方針どおり空または未設定で、Markdownプロンプトファイルを正本として扱う状態になっています。

Studioレビューでは大きな問題は見つかりませんでした。

## 次の判断

prompt seedは作成・Studio確認ともに成功しました。

これで `platformOutput.generatedFromPrompt` の参照先が揃ったため、次は `platformOutput` seed documentsを作成できます。

## no-API MVPの維持

今回の変更はprompt seedとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

Codex側ではSanity CLI createは実行していません。ユーザーがローカル環境で実行し、成功を確認しました。

## 次に確認すること

- `platformOutput` seed documentsを作成する
- `platformOutput.generatedFromPrompt` が今回作成したprompt documentを正しく参照できるか確認する
