# Devlog 0050: Visual Register test seed mode

Date: 2026-05-13

## 今日の判断

Local Visual Registerに、安全なtest seed modeを追加しました。

目的は、既存のmain seedを変更せずに、2つ目のContent Idea test seedを読み込んでContent Idea filter / groupingを検証できるようにすることです。

## 変更内容

`tools/visual-register/server.mjs`:

- defaultでは `seed/visual-asset-plan-records.json` だけを読みます。
- `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` のときだけ、`seed/visual-asset-plan-records-test-*.json` も読みます。
- `/api/health` に `includeTestSeeds` と `testSeedPattern` を追加しました。
- `/api/visual-asset-plans` に `includeTestSeeds`、`seedFiles`、`count` を追加しました。

`tools/visual-register/public/index.html` / `app.js` / `styles.css`:

- test seed mode時に小さなnoticeを表示します。
- Content Idea filter summaryにもtest seed込みであることを表示します。

## 起動方法

通常モード:

```bash
npm run visual:register
```

test seed mode:

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

## 安全方針

- Sanityへ直接writeしていません。
- `seed --replace` は使っていません。
- 実画像は作成していません。
- schema変更はしていません。
- test seed modeは明示的な環境変数があるときだけ有効です。

## 次に確認すること

- default modeで `ai-blog-db` の5件だけが返ること。
- test modeで `ai-blog-db` 5件 + `trail-training-3months` 3件の合計8件が返ること。
- Content Idea filterが `ai-blog-db` と `trail-training-3months` の2択になること。
- plan selectの `optgroup` が2つに分かれること。
- Patch Reviewが変わらず動くこと。

## 発信ネタになりそうな切り口

- 「本番seedを汚さずに、UIの複数テーマ対応をテストする」
- 「環境変数でtest modeを明示し、通常運用を壊さない」
- 「Content Ideaが増える前に、選択ミスを防ぐUIを先に検証する」
