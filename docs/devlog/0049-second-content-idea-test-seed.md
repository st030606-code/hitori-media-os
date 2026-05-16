# Devlog 0049: Second Content Idea test seed

Date: 2026-05-13

## 今日の判断

Visual RegisterのContent Idea filter / groupingを検証するため、2つ目のContent Idea test seedと、それに紐づくvisualAssetPlan test recordsを別ファイルで作成しました。

既存の `ai-blog-db` recordsには混ぜていません。

## 追加したContent Idea

```text
seed/contentIdea-test-trail-training.json
```

内容:

- `_id`: `contentIdea.trail-training-3months`
- title: `トレラン初心者が最初の3ヶ月でやるべき練習4つ`
- slug: `trail-training-3months`
- status: `idea`
- coreThesis: `トレラン初心者は、最初から距離を増やすより、登り・下り・補強・補給の基礎を3ヶ月で整えるべき。`

既存のAIブログDBテーマとは明確に違う、スポーツ・トレーニング系のテストテーマにしました。

## 追加したvisualAssetPlan test records

```text
seed/visual-asset-plan-records-test-trail-training.json
```

含めたrecords:

- `visualAssetPlan.trail-training-3months.note-hero-v1`
- `visualAssetPlan.trail-training-3months.x-hook-v1`
- `visualAssetPlan.trail-training-3months.instagram-carousel-cover`

すべて次に紐づきます。

```text
contentIdea.trail-training-3months
```

保存予定パス:

- `assets/visuals/trail-training-3months/note/hero/note-hero-v1.png`
- `assets/visuals/trail-training-3months/x/hook/x-hook-v1.png`
- `assets/visuals/trail-training-3months/instagram/carousel/instagram-carousel-cover-v1.png`

## 安全方針

- 実画像は作成していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- 既存の `seed/visual-asset-plan-records.json` は変更していません。
- まずローカルseedとして保持し、UI検証方法を決めてから使います。

## Sanity CLIで作成する場合

人間が確認したあと、必要なら次を実行します。

```bash
npx sanity documents create seed/contentIdea-test-trail-training.json
npx sanity documents create seed/visual-asset-plan-records-test-trail-training.json
```

`--replace` は使いません。

## 次に確認すること

- Local Visual Registerが複数seedを安全に読める検証方法を決める。
- 2つ目のvisualAssetPlan recordsをUIに一時的に読み込ませ、Content Idea filterが2択になるか確認する。
- plan selectの `optgroup` が `ai-blog-db` と `trail-training-3months` で分かれるか確認する。

## 発信ネタになりそうな切り口

- 「Content OSはテーマが増えたときに初めてUIの設計が効いてくる」
- 「テストseedを本番seedに混ぜないことで、安全にUI検証できる」
- 「画像生成より先に、画像planの親テーマを取り違えない仕組みを作る」
