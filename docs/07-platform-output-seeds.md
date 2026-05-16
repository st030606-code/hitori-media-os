# platformOutput seed 作成ガイド

このガイドは、`outputs/` にあるPhase 1下書きをもとに、Sanity Studioへ `platformOutput` documentを作成するためのメモです。

`platformOutput` は、ひとつの `contentIdea` から生成された媒体別の下書きを管理する場所です。

## seedファイル

```text
seed/platform-output-records.json
```

含まれる `platformOutput`:

- note記事下書き
- Substack投稿下書き
- Threads投稿列下書き
- X投稿案下書き
- YouTube長尺台本下書き
- Shorts台本下書き
- Podcast台本下書き

図解出力は含めません。

図解、カルーセル、サムネイル、図解ペア投稿のような視覚制作メモは、`platformOutput` ではなく `diagramPlan` に入れる方が自然です。

## 参照関係

すべての `platformOutput` は、次の `contentIdea` を参照します。

```text
contentIdea.ai-blog-db
```

各出力は、対応する `prompt` documentを `generatedFromPrompt` で参照します。

| platform | outputType | prompt reference |
| --- | --- | --- |
| `note` | `note-article` | `prompt.generate-note-article` |
| `substack` | `substack-post` | `prompt.generate-substack-post` |
| `threads` | `threads-thread` | `prompt.generate-threads-post` |
| `x` | `x-post` | `prompt.generate-x-post` |
| `youtube` | `youtube-script` | `prompt.generate-youtube-script` |
| `shorts` | `shorts-script` | `prompt.generate-shorts-script` |
| `podcast` | `podcast-script` | `prompt.generate-podcast-script` |

## 方針

- `draftBody` には既存Markdown下書きの本文を入れます。
- `localOutputPath` には元のローカルMarkdownパスを残します。
- `status` は `drafted` にします。
- `contentStatus` は `needs-review` にします。
- `platform` と `outputType` はスキーマの制御値に合わせます。
- `publishedOutput` はまだ作成しません。

MVPでは、MarkdownファイルとSanity documentの両方を使います。

Markdownはローカル作業・レビュー用の成果物、Sanityの `platformOutput` は媒体別下書きの管理台帳として扱います。

## CLIで作成する

事前に `.env.local` が設定されていることを確認します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

先に次のdocumentが作成済みであることを確認します。

- `contentIdea.ai-blog-db`
- `prompt.generate-note-article`
- `prompt.generate-substack-post`
- `prompt.generate-threads-post`
- `prompt.generate-x-post`
- `prompt.generate-youtube-script`
- `prompt.generate-shorts-script`
- `prompt.generate-podcast-script`

必要ならStudioを起動します。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/platform-output-records.json
```

同じ `_id` のdocumentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/platform-output-records.json --replace
```

## Studioで確認すること

- 7件の `platformOutput` documentが作成されているか。
- `sourceContentIdea` が `contentIdea.ai-blog-db` を参照しているか。
- `generatedFromPrompt` が各媒体のprompt documentを参照しているか。
- `platform` が制御値で保存されているか。
- `outputType` が制御値で保存されているか。
- `draftBody` にMarkdown本文が入っているか。
- `localOutputPath` が元の出力ファイルを指しているか。
- `status` が `drafted` になっているか。
- `contentStatus` が `needs-review` になっているか。
- `reviewNotes` が人間レビューの役に立つ内容になっているか。

## 次に進む条件

`platformOutput` seedの作成とStudio確認ができたら、次は `diagramPlan` seedへ進めます。

その後、必要に応じて `workflow`、`publishedOutput`、`tool` のseed方針を決めます。
