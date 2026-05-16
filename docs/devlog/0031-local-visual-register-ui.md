# 0031: Local Visual Register UIを最小実装

日付: 2026-05-12

## 背景

Mac launcherでSanity Studioはダブルクリック起動できるようになりました。

次の課題は、手動生成した画像を正しいローカルパスへ保存し、Sanity更新用patch JSONを作ることです。

CLIだけでは買い手にとって重く、ファイルパスの入力ミスも起きやすいため、Local Visual Register UIを最小実装しました。

## 決定・変更

追加したファイル:

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`

更新したファイル:

- `package.json`

追加script:

```bash
npm run visual:register
```

## できること

- `seed/visual-asset-plan-records.json` から `visualAssetPlan` を読み込む。
- 画像ファイルを選ぶ。
- 画像をプレビューする。
- `visualAssetPlan` を選ぶ。
- expected `localAssetPath` を表示する。
- 画像を `assets/visuals/...` に保存する。
- patch JSONを `patches/visual-assets/...` に作る。

## まだしないこと

- 画像生成API呼び出し
- OpenAI API / Anthropic API クライアント
- Sanityへの直接write
- 自動投稿
- Next.js dashboard化

## 安全性

サーバーはproject root外へ書き込まないようにpathを検証します。

保存先フォルダは必要に応じて作成します。

Sanityへ直接writeせず、patch JSONを作るだけにしています。

## 次の一手

`npm run visual:register` を起動し、ブラウザで `http://localhost:3334` を開きます。

最初は `visualAssetPlan.ai-blog-db.note-hero-v1` を使い、実際の画像ファイルを選んで保存とpatch JSON生成を確認します。
