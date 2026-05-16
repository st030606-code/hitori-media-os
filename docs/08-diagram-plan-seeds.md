# diagramPlan seed 作成ガイド

このガイドは、`outputs/diagrams/` の図解計画をもとに、Sanity Studioへ `diagramPlan` documentを作成するためのメモです。

`diagramPlan` は、図解、カルーセル、サムネイル、図解ペア投稿の制作計画を管理する場所です。

## seedファイル

```text
seed/diagram-plan-records.json
```

含まれる `diagramPlan`:

- Before / After図解
- Obsidian vs Sanity 役割分担図
- Manual first, API later 図解ペア投稿
- Content OS パイプライン図
- Instagramカルーセル案

## 元になった出力

```text
outputs/diagrams/2026-05-11--ai-blog-db--diagram-plan.md
```

Xの図解ペア投稿案も、必要な範囲で `pairedPostText` に反映しています。

```text
outputs/x/2026-05-11--ai-blog-db--x.md
```

## 参照関係

すべての `diagramPlan` は、次の `contentIdea` を参照します。

```text
contentIdea.ai-blog-db
```

現時点の `diagramPlan` スキーマには `generatedFromPrompt` はありません。

そのため、今回のseedでは `prompt.generate-diagram-plan` への参照は持たせず、`reviewNotes` に元のローカル出力パスを残します。

## 方針

- 実画像ファイルは作成しません。
- `assetPath` は、まだ実アセットがないため未設定にします。
- `status` は `planned` にします。
- `targetPlatform` はスキーマの制御値に合わせます。
- `visualType` は `diagram`, `carousel`, `thumbnail`, `paired-post` の制御値から選びます。
- 図解計画は `platformOutput` ではなく `diagramPlan` に保存します。

## CLIで作成する

事前に `.env.local` が設定されていることを確認します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

先に次のdocumentが作成済みであることを確認します。

- `contentIdea.ai-blog-db`

必要ならStudioを起動します。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/diagram-plan-records.json
```

同じ `_id` のdocumentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/diagram-plan-records.json --replace
```

## Studioで確認すること

- 5件の `diagramPlan` documentが作成されているか。
- `sourceContentIdea` が `contentIdea.ai-blog-db` を参照しているか。
- `visualType` が制御値で保存されているか。
- `targetPlatform` が制御値で保存されているか。
- `title` と `layoutIdea` が制作時に使える具体性を持っているか。
- `labels` が図内テキストとして長すぎないか。
- `imagePrompt` が画像生成やデザイン作業に使えるか。
- `pairedPostText` がXやThreadsの投稿文として自然か。
- `aspectRatio` が用途に合っているか。
- `reviewNotes` に元出力や注意点が残っているか。

## 次に進む条件

`diagramPlan` seedの作成とStudio確認ができたら、次は `workflow` seedへ進めます。

`workflow` では、今回の `contentIdea`、`prompt`、`platformOutput`、`diagramPlan` がどの手動ワークフローで作られたかをタスク単位で記録します。
