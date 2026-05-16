# 初回 contentIdea 入力ガイド

このガイドは、`inputs/content-ideas/example-ai-blog-db.json` をもとに、Sanity Studioへ最初の `contentIdea` を手入力するためのメモです。

自動生成やAPI連携は使いません。Studioで人間が確認しながら入力します。

## このガイドの位置づけ

この手入力フローは、初期検証と管理者向けテストのためのものです。

長期的なゴールは、ユーザーにSanity Studioで全フィールドを手入力してもらうことではありません。

将来の主UIはNext.jsダッシュボードにします。そこでは、ユーザーが最小限の生アイデアを入力し、AI支援で構造化し、人間が確認したうえでSanityへ保存する流れを想定します。

Sanity Studioは、開発者・管理者・上級ユーザーがデータ確認や手動修正を行うバックオフィスツールとして扱います。

## 前提

`.env.local` にSanity project IDを設定し、Studioを起動します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

```bash
npm run dev
```

## 入力するドキュメント

Sanity Studioで `Content Idea` を新規作成します。

入力元:

```text
inputs/content-ideas/example-ai-blog-db.json
```

## CLIでseed documentを作成する方法

手入力の代わりに、Sanity CLIで最初の `contentIdea` を作成し、Studioで確認する方法も使えます。

seedファイル:

```text
seed/contentIdea-ai-blog-db.json
```

このファイルは、Sanityの `contentIdea` documentとして作成できる形に整えています。

事前確認:

1. `.env.local` にSanity project IDとdatasetが設定されている。
2. 実project ID、APIキー、トークン、認証情報、シークレットをseed JSONに入れていない。
3. 必要ならStudioを起動して、ログイン済みであることを確認する。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json
```

同じ `_id` のdocumentを作り直したい場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json --replace
```

作成後、Studioで `知識アイデア（Content Idea）` を開き、`contentIdea.ai-blog-db` が表示されるか確認します。

このCLI作成フローは、手入力の負担を減らすための初期検証です。長期的には、将来のNext.jsダッシュボードが最小入力から構造化データをSanityへ保存する想定です。

## seed作成後のStudioレビュー

`npx sanity documents create seed/contentIdea-ai-blog-db.json` が成功したら、Studioで `contentIdea.ai-blog-db` を開いて確認します。

確認項目:

- `rawInput` が正しく表示されているか。
- `claims` が正しく表示されているか。
- `platformAngles` が正しく表示されているか。
- `outputChecklist` が正しく表示されているか。
- `examples` が正しく表示されているか。
- `objections` が正しく表示されているか。
- `personalContext` が正しく表示されているか。
- `platform` の制御値が `note`, `substack`, `threads`, `x`, `youtube`, `shorts`, `podcast`, `diagram`, `github`, `paid`, `instagram`, `newsletter` のまま保存されているか。
- `outputType` の制御値が `note-article`, `substack-post`, `threads-thread`, `x-post`, `youtube-script`, `shorts-script`, `podcast-script`, `diagram-plan`, `github-doc`, `paid-article-outline`, `instagram-carousel`, `newsletter` のまま保存されているか。

このseedベースの流れは、初回の手入力検証をほぼ置き換えます。

Studioでは、全項目を手で入力するのではなく、seedされたデータの見え方、編集しやすさ、重すぎる項目がないかを確認します。

## 必須フィールド

| Studio field | JSON field | 入力例 |
| --- | --- | --- |
| `Title` | `title` | `これからのブログは、記事を書くより「AIが使えるDB」を作った人が勝つ` |
| `Slug` | `slug` | `ai-usable-blog-database` |
| `Status` | `status` | `idea` |
| `Summary` | `summary` | AI時代の発信では... |
| `Core Thesis` | `coreThesis` | これからのブログ運営で差がつくのは... |
| `Audience` | `audience` | ひとりメディア運営者 / noteやSubstackで発信する個人クリエイター |
| `Audience Pain` | `audiencePain` | 発信者は、同じアイデアを... |
| `Claims` | `claims` | `claim`, `supportingEvidence`, `confidence`, `needsVerification` を入力 |
| `Tone` | `tone` | `voice`, `styleNotes`, `avoid` を入力 |
| `Platform Angles` | `platformAngles` | platform / targetReader / hook / formatNotes / callToAction を入力 |

## 任意フィールド

最初の入力では、必要なものだけ入れます。

| Studio field | JSON field | メモ |
| --- | --- | --- |
| `Content Pillars` | `contentPillars` | 入れておくと後で分類しやすい |
| `Evidence` | `evidence` | 根拠や観察を残したい場合に入力 |
| `Examples` | `examples` | 具体例。noteやYouTubeで効く |
| `Objections` | `objections` | 反論回答。note / Substack / YouTubeで効く |
| `Source Links` | `sourceLinks` | 内部docsやdevlog参照 |
| `Output Checklist` | `outputChecklist` | 予定している派生出力 |
| `Personal Context` | `personalContext` | ボス本人の体験や背景。初回は空でもよい |

## 入力順のおすすめ

1. `Title`, `Slug`, `Status`
2. `Summary`, `Core Thesis`, `Audience Pain`
3. `Audience`
4. `Claims`
5. `Tone`
6. `Platform Angles`
7. 必要に応じて `Examples`, `Objections`, `Evidence`

まず必須項目だけで保存できるか確認し、その後に任意項目を足します。

## 手入力時の注意

- 実project ID、APIキー、トークン、認証情報、シークレットは入力しません。
- `contentIdea` には生成済みのnote本文やX投稿本文を入れません。
- 生成下書きは将来 `platformOutput` に入れます。
- 図解計画は将来 `diagramPlan` に入れます。
- 公開URLや公開後の反応は将来 `publishedOutput` に入れます。

## 入力後のQAチェック

- 必須フィールドだけで保存できるか。
- `coreThesis` が元JSONと同じ意味になっているか。
- `claims` が最低1件以上入っているか。
- `tone.voice` が入っているか。
- `platformAngles` が最低1件以上入っているか。
- `platformAngles` に note / Substack / Threads / X / YouTube など主要媒体が入っているか。
- `contentIdea` が重くなりすぎていないか。
- 生成下書き本文を誤って `contentIdea` に入れていないか。
- 将来のダッシュボードなら、どの入力をユーザーに見せずにAI支援で補完できそうか。

## 次にやること

最初の `contentIdea` 保存後、次は `prompt` seedを作成します。

手順は `docs/06-prompt-seeds.md` にまとめます。

ただし、この検証はStudioを日常運用UIにするためではありません。

入力しづらい項目や重い手順は、将来のNext.jsダッシュボードで「最小入力」「AI構造化」「人間レビュー」に分けるための材料として記録します。
