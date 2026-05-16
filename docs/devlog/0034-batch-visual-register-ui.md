# 0034: Visual Registerをbatch-friendly UIへ改善

日付: 2026-05-12

## 背景

最初のLocal Visual Register UIは、1枚の画像を1つの `visualAssetPlan` に登録するMVPでした。

ただし、実際のメディア運用では、note hero、X hook、Instagram carousel、YouTube thumbnail、GitHub diagramなどをまとめて扱う必要があります。

1枚ずつ登録するだけでは遅く、保存先の指定ミスや同じplanへの重複登録も起きやすいため、batch-friendly UIへ改善しました。

## 変更

更新したファイル:

- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `tools/visual-register/server.mjs`
- `docs/19-local-visual-register-ui.md`

主な改善:

- 複数画像選択に対応。
- 選択画像を登録キューに表示。
- 画像ごとに `visualAssetPlan` を割り当て可能。
- 各行に保存予定パスを表示。
- 同じ保存予定パスが重複した場合に警告。
- 1件ずつ登録できる。
- `まとめて登録` で登録可能な行を順番に登録できる。
- 右側のプレビュー / 詳細パネルを追加。
- status、platform、assetTypeをchip表示。
- toast-style messageを追加。
- 日本語優先ラベルに変更。

## UI方針

Material Design 3の考え方を参考にし、次を意識しました。

- clean dashboard-like layout
- top app bar
- card-based sections
- soft background
- rounded corners
- clear primary action
- chips for status / platform / assetType
- table queue
- right-side detail panel
- snackbar/toast-style messages

Next.js dashboardではなく、あくまで軽量なlocal Node helper server + static UIです。

## 安全性

サーバー側は引き続き、1件ずつ画像を受け取って保存し、patch JSONを作ります。

UI側のbatch登録は、この単体登録APIを順番に呼ぶだけです。

そのため、次は引き続き行っていません。

- Sanityへの直接write
- 画像生成API呼び出し
- OpenAI API / Anthropic API クライアント
- 自動投稿

## 手動ミスを減らす点

- 保存予定パスを登録前に見えるようにした。
- 同じpathへの重複割り当てを警告する。
- プレビューとplan詳細を同じ画面で確認できる。
- 1件登録とまとめて登録を分けた。
- 登録後に行ごとのステータスを表示する。

## 次の一手

Mac launcherでVisual Registerを開き、複数画像を選択して次を確認します。

- 5件の `visualAssetPlan` が読み込まれる。
- 複数画像がキューに追加される。
- plan割り当てを変更できる。
- 重複pathの警告が出る。
- 1件登録ができる。
- `まとめて登録` ができる。
- 画像とpatch JSONが1件ずつ作成される。

その後、patch JSONをSanityへ安全に反映する手順を設計します。
