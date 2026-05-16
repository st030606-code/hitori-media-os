# Phase 1 E2E Test Checklist

このチェックリストは、Phase 1 MVPがローカルで一通り動くかを人間が確認するためのものです。

## Launcher / Startup

- [ ] `launchers/start-mac.command` をダブルクリックする。
- [ ] Terminalが開き、launcher logが表示される。
- [ ] project rootが正しく解決される。
- [ ] Sanity Studioが起動する。
- [ ] ブラウザで `http://localhost:3333` が開く。
- [ ] Local Visual Registerがlauncherで開く場合は `http://localhost:3334` も開く。
- [ ] launcherがVisual Registerを開かない場合は、必要に応じて手動で起動する。
- [ ] 通常利用では、ユーザーがterminal commandを手入力しなくてよい。
- [ ] advanced/test modeだけはterminal commandを許容する。

## Sanity

- [ ] Studioでschemasが見える。
- [ ] `contentIdea.ai-blog-db` が存在する。
- [ ] `visualAssetPlan.ai-blog-db.note-hero-v1` が存在する。
- [ ] `expectedLocalAssetPath` が表示される。
- [ ] manual patch後、`localAssetPath` が正しい。
- [ ] manual patch後、`status` が正しい。
- [ ] manual patch後、`reviewNotes` が正しい。
- [ ] real project IDやtokenがrepoに入っていない。

## Seed Data

- [ ] contentIdea seedを安全に作成できる。
- [ ] prompt seedを安全に作成できる。
- [ ] platformOutput seedを安全に作成できる。
- [ ] diagramPlan seedを安全に作成できる。
- [ ] tool seedを安全に作成できる。
- [ ] workflow seedを安全に作成できる。
- [ ] visualAssetPlan seedを安全に作成できる。
- [ ] partial update目的で `seed --replace` を使っていない。

## Visual Register

- [ ] Visual Registerを起動する。
- [ ] Content Idea filterが表示される。
- [ ] `visualAssetPlan` recordsが読み込まれる。
- [ ] test modeでは `ai-blog-db` と `trail-training-3months` が表示される。
- [ ] 画像を選択できる。
- [ ] previewが表示される。
- [ ] `visualAssetPlan` を割り当てられる。
- [ ] expected save pathが表示される。
- [ ] `登録` で画像が `assets/visuals/...` に保存される。
- [ ] patch JSONが `patches/visual-assets/...` に作成される。
- [ ] 既存ファイルがある場合、overwrite protectionが登録をブロックする。
- [ ] overwrite checkboxを明示的に入れると登録できる。
- [ ] 登録後、rowがsaved/registered/Patch created stateになる。
- [ ] Patch Reviewにpatchが表示される。
- [ ] Patch ReviewでlocalAssetPath exists validationがpassする。
- [ ] Patch ReviewはSanityへ直接writeしない。

## Manual Studio Update

- [ ] Patch Reviewで対象patchを開く。
- [ ] `_id` を確認する。
- [ ] Sanity Studioで対象の `visualAssetPlan` を開く。
- [ ] patch JSONの `localAssetPath` をStudioへ反映する。
- [ ] patch JSONの `status` をStudioへ反映する。
- [ ] patch JSONの `reviewNotes` をStudioへ反映する。
- [ ] Studioで保存する。
- [ ] Studioで更新後の値を確認する。

## Expected Result

Phase 1 E2E testが成功した状態:

- Sanity Studioが動く。
- seed dataがStudioで確認できる。
- Visual Registerで画像を保存できる。
- patch JSONを作れる。
- Patch Reviewで確認できる。
- 人間がStudioで安全にmanual updateできる。
- API自動化なしで、local-first workflowが成立している。
