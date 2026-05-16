# prompt seed 作成ガイド

このガイドは、`prompts/` のMarkdownファイルをもとに、Sanity Studioへ `prompt` documentを作成するためのメモです。

MVPでは、プロンプト本文の正本はローカルMarkdownファイルに置きます。

Sanityの `prompt` documentは、どのプロンプトがどの媒体・出力種別に対応するかを管理する台帳として使います。

## seedファイル

```text
seed/prompt-records.json
```

含まれるprompt:

- `generate-note-article`
- `generate-substack-post`
- `generate-threads-post`
- `generate-x-post`
- `generate-youtube-script`
- `generate-shorts-script`
- `generate-podcast-script`
- `generate-diagram-plan`

## 方針

- `localFilePath` を正本として扱います。
- MVPでは `promptBody` にMarkdown全文を複製しません。
- `targetPlatform` と `outputType` はスキーマの制御値に合わせます。
- `platformOutput.generatedFromPrompt` が `prompt` を参照するため、`platformOutput` seedより先に作成します。

## CLIで作成する

事前に `.env.local` が設定されていることを確認します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

必要ならStudioを起動します。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/prompt-records.json
```

同じ `_id` のdocumentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/prompt-records.json --replace
```

## Studioで確認すること

- 8件の `prompt` documentが作成されているか。
- `targetPlatform` が制御値で保存されているか。
- `outputType` が制御値で保存されているか。
- `localFilePath` が正しいMarkdownファイルを指しているか。
- `requiredInputFields` と `humanReviewChecklist` が見やすいか。
- `promptBody` が空でも運用上問題ないか。

## 次に進む条件

prompt seedの作成とStudio確認ができたら、次は `platformOutput` seedへ進めます。

