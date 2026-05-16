# Devlog 0051: Visual Register test seed mode debug

Date: 2026-05-14

## 今日の判断

ブラウザではtest seed mode noticeが出ているのに、plan countが5件のままに見える問題を調査し、test seed loadingの状態をAPI・UI・server logで確認できるようにしました。

## 起きていたこと

前回のAPI検証では、test modeの一時ポートで8件のplanが返っていました。

一方、ブラウザで見ている `localhost:3334` では、noticeは出ているのにplan countが5件のままでした。

この差から、主な原因候補は次です。

- ブラウザが見ている実サーバープロセスが、期待した環境変数・コードで起動していない。
- test seed fileが実プロセスのproject rootから見つかっていない。
- test seedの読み込み失敗理由がUI/APIに出ていない。

## 変更内容

`tools/visual-register/server.mjs`:

- test seed discoveryを明示関数に分けました。
- `/api/health` と `/api/visual-asset-plans` にdebug情報を追加しました。
- `testSeedFiles`
- `loadedSeedFiles`
- `failedSeedFiles`
- `contentIdeaIds`
- `debugWarnings`
- server startup logで、test seed mode、読み込んだrecord数、seed file一覧、失敗seed、warningを表示するようにしました。

`tools/visual-register/public/app.js`:

- test mode noticeに、plan数、Content Idea数、seed file数を表示するようにしました。
- `includeTestSeeds=true` なのにplan数が5件以下、test seed未検出、failed seedあり、warningありの場合、summaryに `要確認` を表示します。

`docs/19-local-visual-register-ui.md`:

- test seed modeのdebug response項目とUI noticeの見方を追記しました。

## APIなしMVPとの関係

Sanityへ直接writeしていません。

`seed --replace` は実行していません。

画像生成も行っていません。

## 次に確認すること

ブラウザで実際に使う `localhost:3334` を、次のように起動し直して確認します。

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

確認項目:

- `/api/health` の `includeTestSeeds` が `true`
- `/api/visual-asset-plans` の `count` が `8`
- `loadedSeedFiles` に `seed/visual-asset-plan-records-test-trail-training.json` が含まれる
- `contentIdeaIds` に `contentIdea.ai-blog-db` と `contentIdea.trail-training-3months` が含まれる
- UI noticeに `8 plans / 2 Content Ideas` が表示される
- Content Idea filterに2つのContent Ideaが表示される

## ローカル検証

実装後に次を確認しました。

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass

Default mode:

- `includeTestSeeds`: `false`
- `count`: `5`
- `contentIdeaIds`: `contentIdea.ai-blog-db`
- `loadedSeedFiles`: `seed/visual-asset-plan-records.json`

Test mode:

- `includeTestSeeds`: `true`
- `count`: `8`
- `contentIdeaIds`: `contentIdea.ai-blog-db`, `contentIdea.trail-training-3months`
- `loadedSeedFiles`: `seed/visual-asset-plan-records.json`, `seed/visual-asset-plan-records-test-trail-training.json`
- `failedSeedFiles`: none
- `debugWarnings`: none

検証用serverは停止しました。

## ブラウザ/API確認結果

実際にブラウザで使う `localhost:3334` を、次の環境変数つきで起動し直して確認しました。

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

結果:

- Actual `localhost:3334` was restarted with `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true`: yes
- Server log showed `Test seed mode: enabled`: yes
- Server log showed `Loaded visualAssetPlan records: 8`: yes
- Loaded seed files:
  - `seed/visual-asset-plan-records.json`
  - `seed/visual-asset-plan-records-test-trail-training.json`
- Discovered test seed files:
  - `seed/visual-asset-plan-records-test-trail-training.json`
- Browser test mode result: works
- UI notice showed test mode correctly
- Content Idea filter showed both:
  - `ai-blog-db`
  - `trail-training-3months`
- Plan select grouping worked as expected
- Patch Review stayed stable
- No direct Sanity write occurred
- No unexpected image files were created

結論:

先に見えていた「noticeは出るが5件のまま」というズレは、seed loading logicの問題ではなく、ブラウザが見ている実サーバープロセスの起動条件・環境変数のズレが原因でした。

test seed modeは検証済みです。

default modeは引き続き `seed/visual-asset-plan-records.json` のみを読み、期待件数は5件です。

test modeはmain seedとtest seedを読み、期待件数は8件です。

## 発信ネタになりそうな切り口

- 「UIの見た目ではなく、実プロセスのdebug情報を出す」
- 「test modeはnoticeだけでは不十分。何を読んだかまで見せる」
- 「ローカルツールは環境変数とポート違いでズレやすい」
