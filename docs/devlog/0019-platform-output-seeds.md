# 0019: platformOutput seed documentsを準備

日付: 2026-05-12

## 背景

`contentIdea` seedと `prompt` seedはSanity CLIで作成でき、Studioでも正しく表示されました。

次は、Phase 1で作成した媒体別下書きをSanity上の `platformOutput` として管理できるか確認します。

## 決定・変更

`seed/platform-output-records.json` を追加しました。

含めた `platformOutput` documentは次の7件です。

- `platformOutput.ai-blog-db.note`
- `platformOutput.ai-blog-db.substack`
- `platformOutput.ai-blog-db.threads`
- `platformOutput.ai-blog-db.x`
- `platformOutput.ai-blog-db.youtube`
- `platformOutput.ai-blog-db.shorts`
- `platformOutput.ai-blog-db.podcast`

各documentには次を含めています。

- `_id`
- `_type: "platformOutput"`
- `sourceContentIdea`
- `platform`
- `outputType`
- `title`
- `draftBody`
- `localOutputPath`
- `status`
- `reviewNotes`
- `generatedFromPrompt`
- `outputLength`
- `targetFormat`
- `primaryCTA`
- `contentStatus`

## 参照設計

すべての下書きは `contentIdea.ai-blog-db` を参照します。

また、各下書きは対応するprompt documentを `generatedFromPrompt` で参照します。

- note: `prompt.generate-note-article`
- Substack: `prompt.generate-substack-post`
- Threads: `prompt.generate-threads-post`
- X: `prompt.generate-x-post`
- YouTube: `prompt.generate-youtube-script`
- Shorts: `prompt.generate-shorts-script`
- Podcast: `prompt.generate-podcast-script`

## 図解を含めなかった理由

`outputs/diagrams/2026-05-11--ai-blog-db--diagram-plan.md` は、媒体別本文の下書きというより、図解、カルーセル、サムネイル、図解ペア投稿の制作計画です。

そのため、今回の `platformOutput` seedには含めず、次の `diagramPlan` seedで扱う方針にしました。

## CLI作成手順

手順は `docs/07-platform-output-seeds.md` にまとめました。

実行コマンド:

```bash
npx sanity documents create seed/platform-output-records.json
```

同じ `_id` を作り直す場合のみ、確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/platform-output-records.json --replace
```

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

Codex側ではSanity CLI createは実行していません。ユーザーがローカル環境で実行し、Studioで確認する前提です。

## 次の判断

次は、ユーザーが `seed/platform-output-records.json` をSanity CLIで作成し、Studioで7件の `platformOutput` が正しく表示されるか確認します。

それが通ったら、`diagramPlan` seedへ進めます。

## 次に確認すること

- `sourceContentIdea` が `contentIdea.ai-blog-db` を参照しているか。
- `generatedFromPrompt` が各媒体のprompt documentを参照しているか。
- `draftBody` にMarkdown本文が入っているか。
- `platform` と `outputType` の制御値が保たれているか。
- `status` が `drafted`、`contentStatus` が `needs-review` になっているか。
