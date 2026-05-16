# Phase 2A Product Polish Batch

日付: 2026-05-14

## 背景

Phase 1 MVPがstable扱いになったため、Phase 2Aではアーキテクチャを変えず、現在のローカルMVPを使いやすくします。

## 決定・変更

- Patch Reviewにcopy buttonsを追加しました。
- Patch Review detailに `Studio反映メモ` を追加しました。
- Visual Registerにplatform filter / assetType filterを追加しました。
- READMEにQuick Startと手動/自動の境界を追加しました。
- `docs/31-phase-2a-smoke-test-checklist.md` を追加しました。

## 理由

Sanity direct writeをまだ入れないため、Patch ReviewからSanity Studioへ手動反映する作業が残ります。

copy buttonsとStudio反映メモにより、手動反映のミスと確認往復を減らします。

platform / assetType filterは、Content Ideaが増えたときに誤ったvisualAssetPlanを選ぶリスクを下げます。

## 影響

- Patch Reviewは引き続きread-onlyです。
- Visual RegisterはSanityへ直接writeしません。
- Next.js dashboard、画像生成API、自動投稿はまだ追加していません。
- status filter、Patch applied status、publish package builderはbacklogに残します。

## 検証

- `node --check tools/visual-register/server.mjs`: 成功
- `node --check tools/visual-register/public/app.js`: 成功
- `npm run build`: 成功
- secret scan: 実シークレットは検出されず
- 新しい生成画像ファイルやpatch fileは作成していない

補足: `npm run visual:register` の直接起動確認は、`127.0.0.1:3334` が既に使用中だったため、このタスク内では完了していません。UIのブラウザ確認は `docs/31-phase-2a-smoke-test-checklist.md` に沿って人間が行います。

## 次の一手

人間が `docs/31-phase-2a-smoke-test-checklist.md` に沿って、Visual Registerの通常モード、test mode、Patch Review copy buttonsを確認します。
