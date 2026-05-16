# 0020: diagramPlan seed documentsを準備

日付: 2026-05-12

## 背景

`platformOutput` seedでは、note、Substack、Threads、X、YouTube、Shorts、Podcastの本文・台本・投稿下書きを扱いました。

一方で、図解、カルーセル、サムネイル、図解ペア投稿の制作計画は、媒体別本文の下書きとは性質が違います。

そのため、図解関連の出力は `platformOutput` ではなく `diagramPlan` としてseedする方針にしました。

## 決定・変更

`seed/diagram-plan-records.json` を追加しました。

含めた `diagramPlan` documentは次の5件です。

- `diagramPlan.ai-blog-db.before-after`
- `diagramPlan.ai-blog-db.obsidian-sanity-split`
- `diagramPlan.ai-blog-db.manual-first-api-later`
- `diagramPlan.ai-blog-db.content-os-pipeline`
- `diagramPlan.ai-blog-db.instagram-carousel`

各documentには次を含めています。

- `_id`
- `_type: "diagramPlan"`
- `sourceContentIdea`
- `visualType`
- `targetPlatform`
- `title`
- `layoutIdea`
- `labels`
- `imagePrompt`
- `pairedPostText`
- `status`
- `aspectRatio`
- `reviewNotes`

## 元になった出力

主な元出力:

```text
outputs/diagrams/2026-05-11--ai-blog-db--diagram-plan.md
```

X向けの図解ペア投稿文:

```text
outputs/x/2026-05-11--ai-blog-db--x.md
```

既存の図解計画から、次の用途に分けてSanity上で扱いやすい粒度にしました。

- X向けのBefore / After図解
- note向けのObsidian / Sanity役割分担図
- X向けのManual first, API later図解ペア投稿
- GitHub向けのContent OSパイプライン図
- Instagram向けのカルーセル案

## 参照設計

すべての図解計画は `contentIdea.ai-blog-db` を参照します。

現時点の `diagramPlan` スキーマには `generatedFromPrompt` がないため、`prompt.generate-diagram-plan` への参照は持たせていません。

代わりに、`reviewNotes` に元のローカル出力パスと制作上の注意を残しています。

## 図解をplatformOutputに入れない理由

`platformOutput` は、媒体別の本文、投稿文、台本などの下書きを管理します。

`diagramPlan` は、ビジュアルの構成、ラベル、画像生成プロンプト、ペア投稿文、アスペクト比、制作時の注意点を管理します。

この境界を分けることで、将来のダッシュボードでも「文章下書き」と「ビジュアル制作計画」を別のUIとして扱いやすくなります。

## CLI作成手順

手順は `docs/08-diagram-plan-seeds.md` にまとめました。

実行コマンド:

```bash
npx sanity documents create seed/diagram-plan-records.json
```

同じ `_id` を作り直す場合のみ、確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/diagram-plan-records.json --replace
```

## no-API MVPの維持

今回の変更はseed JSONとドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

実画像ファイルも作成していません。今回の対象は図解計画documentだけです。

Codex側ではSanity CLI createは実行していません。ユーザーがローカル環境で実行し、Studioで確認する前提です。

## 次の判断

次は、ユーザーが `seed/diagram-plan-records.json` をSanity CLIで作成し、Studioで5件の `diagramPlan` が正しく表示されるか確認します。

それが通ったら、`workflow` seedへ進めます。

## 次に確認すること

- `sourceContentIdea` が `contentIdea.ai-blog-db` を参照しているか。
- `visualType` と `targetPlatform` の制御値が保たれているか。
- `layoutIdea` が制作に使える具体性を持っているか。
- `labels` が図内テキストとして長すぎないか。
- `pairedPostText` がXやThreadsの投稿文として自然か。
- `aspectRatio` が用途に合っているか。
