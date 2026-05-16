# Phase 2A Smoke Test Checklist

日付: 2026-05-14

Phase 2A product polish後に、壊れていないことを確認するための短い手動チェックリストです。

## Startup

- [ ] `npm run build` が通る。
- [ ] `node --check tools/visual-register/server.mjs` が通る。
- [ ] `node --check tools/visual-register/public/app.js` が通る。
- [ ] Visual Register が起動する。

## Visual Register Normal Mode

- [ ] 通常モードで visualAssetPlan が5件表示される。
- [ ] Content Idea filter が表示される。
- [ ] platform filter が表示される。
- [ ] assetType filter が表示される。
- [ ] filter変更後も登録先planを選べる。
- [ ] 画像選択とpreviewが動く。
- [ ] image registration が引き続き動く。
- [ ] overwrite protection が引き続き動く。

## Visual Register Test Mode

- [ ] `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register` で起動する。
- [ ] test mode notice が表示される。
- [ ] visualAssetPlan が8件表示される。
- [ ] `ai-blog-db` と `trail-training-3months` が表示される。
- [ ] Content Ideaごとのplan groupingが壊れていない。

## Patch Review

- [ ] Patch Reviewがpatch JSONを表示する。
- [ ] `localAssetPath` copy button が動く。
- [ ] `status` copy button が動く。
- [ ] `reviewNotes` copy button が動く。
- [ ] `updatedAt` copy button が動く。
- [ ] compact copy block が動く。
- [ ] `Studio反映メモ` が表示される。
- [ ] local file exists validation が表示される。

## Safety

- [ ] Sanity direct write は発生しない。
- [ ] `seed --replace` は使っていない。
- [ ] image generation API は呼ばれていない。
- [ ] auto-posting は発生しない。
- [ ] 実project ID、APIキー、トークン、シークレットは追加されていない。
