# 0032: Local Visual Register手動テスト結果

日付: 2026-05-12

## 背景

前回、手動生成した画像をローカル保存し、Sanity更新用patch JSONを作るLocal Visual Register UIを実装しました。

今回は、最初の実テスト対象である `visualAssetPlan.ai-blog-db.note-hero-v1` を使い、画像登録フローが動くか確認しました。

## テスト結果

- `npm run visual:register`: 成功
- ブラウザで `http://localhost:3334` を開けたか: はい
- `visualAssetPlan` 読み込み: はい、5件
- 画像選択とプレビュー: はい
- 選択したplan: `visualAssetPlan.ai-blog-db.note-hero-v1`
- 画像コピー: 成功
- 保存先: `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- patch JSON作成: 成功
- patch保存先: `patches/visual-assets/ai-blog-db/note-hero-v1.json`
- Sanityへの直接write: なし
- UI上の大きなエラー: 現時点では記録なし

## 作成されたファイル

手動テストにより、次のファイルが作成されました。

- `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- `patches/visual-assets/ai-blog-db/note-hero-v1.json`

画像ファイルは、ユーザーが選択した手動生成画像のローカルコピーです。

また、macOSが画像フォルダに `.DS_Store` を作る可能性があるため、誤コミット防止として `.gitignore` に `.DS_Store` を追加しました。

## 確認できたこと

Local Visual Registerは、現在のno-API半自動ワークフローに必要な最小機能を満たしています。

- seed JSONから `visualAssetPlan` を読み込める。
- 人間が生成・保存した画像を選択できる。
- 対象planに合わせて保存先を決められる。
- Sanityへ直接writeせず、確認用patch JSONを作れる。

これにより、画像生成そのものは人間が行い、保存・記録・Sanity反映準備をローカルUIが補助する流れが成立しました。

## まだ手動のこと

- ChatGPTなどでの画像生成
- 画像の見た目のレビュー
- patch JSONの確認
- patch内容のSanity反映
- publish packageへの組み込み
- 各媒体への投稿

## 次の一手

Mac launcherを更新し、Sanity StudioだけでなくLocal Visual Registerも開けるようにするのが自然です。

その後、作成済みpatch JSONをSanityへ反映するための安全な手順を設計します。
