# Final Human Review Checklist

日付: 2026-05-14

Codexが大きめの実装バッチを終えたあと、ボスが最後に確認するためのチェックリストです。

## Startup

- [ ] Mac launcherでSanity Studioが開く。
- [ ] Local Visual Registerが開く。
- [ ] Terminalはログ表示として残る。

## Visual Register

- [ ] 通常モードでvisualAssetPlanが5件表示される。
- [ ] test modeでvisualAssetPlanが8件表示される。
- [ ] Content Idea filterが動く。
- [ ] platform filterが動く。
- [ ] assetType filterが動く。
- [ ] 画像previewが表示される。
- [ ] overwrite protectionが効く。
- [ ] 登録済み画像を誤って上書きしない。

## Patch Review

- [ ] Patch Reviewがpatch JSONを表示する。
- [ ] local file exists validationが正しく表示される。
- [ ] `localAssetPath` copy buttonが動く。
- [ ] `status` copy buttonが動く。
- [ ] `reviewNotes` copy buttonが動く。
- [ ] `updatedAt` copy buttonが動く。
- [ ] compact copy blockが動く。
- [ ] `Studio反映メモ` が分かりやすい。

## Publish Package Builder

- [ ] `npm run publish:package` が動く。
- [ ] `publish-packages/note/ai-blog-db/` が作られる。
- [ ] `publish-packages/x/ai-blog-db/` が作られる。
- [ ] `publish-packages/instagram/ai-blog-db/` が作られる。
- [ ] `publish-packages/github/ai-blog-db/` が作られる。
- [ ] `publish-packages/youtube/ai-blog-db/` が作られる。
- [ ] 存在する画像だけがcopyされる。
- [ ] 画像や下書きが足りない場合はTODOになる。
- [ ] 既存package fileが勝手に上書きされない。

## Local Diagnostics

- [ ] `npm run local:check` が通る。
- [ ] seed countが期待通り。
- [ ] patch JSON countが期待通り。
- [ ] direct Sanity write code pathがない。
- [ ] obvious secretがない。

## Safety

- [ ] no auto-posting
- [ ] no direct Sanity write
- [ ] no image generation API
- [ ] no paid LLM API integration
- [ ] no `seed --replace`
- [ ] READMEが理解しやすい。
- [ ] backlogが明確。

## Review Result

- [ ] Phase 2A large batchを受け入れる。
- [ ] 小さなUI修正だけ必要。
- [ ] 一部をbacklogへ戻す。
