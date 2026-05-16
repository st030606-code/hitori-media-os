# 0033: Mac launcherでStudioとVisual Registerを同時起動

日付: 2026-05-12

## 背景

Sanity Studioは `launchers/start-mac.command` から起動できるようになっていました。

その後、Local Visual Register UIも実装・手動テストできたため、買い手がターミナルで `npm run dev` と `npm run visual:register` を個別に打たなくて済むように、Mac launcherを更新しました。

## 変更

`launchers/start-mac.command` を更新し、次の2つを起動するようにしました。

- Sanity Studio: `http://localhost:3333`
- Local Visual Register: `http://localhost:3334`

ランチャーは次を行います。

- project rootを解決する。
- `package.json` を確認する。
- `npm` の有無を確認する。
- `node_modules` がない場合、ユーザー確認後に `npm install` を実行できる。
- `npm run dev` をバックグラウンド起動する。
- `npm run visual:register` をバックグラウンド起動する。
- 両方のURLをブラウザで開く。
- Terminal windowを共有ログとして開いたままにする。
- `Ctrl+C` または終了時に両方のサーバーを止める。

## まだしないこと

- Next.js dashboard追加
- 画像生成API呼び出し
- Sanityへの直接write
- 自動投稿
- 実project IDや秘密情報の埋め込み

## 確認したこと

- `zsh -n launchers/start-mac.command` を通す。
- `npm run build` を通す。

実際のダブルクリック起動は、Mac上で人間が確認します。

## 次の一手

Macで `launchers/start-mac.command` をダブルクリックし、次を確認します。

- Terminal windowが開く。
- Sanity Studioが `http://localhost:3333` で開く。
- Local Visual Registerが `http://localhost:3334` で開く。
- `Ctrl+C` で両方が止まる。

その後、patch JSONをSanityへ安全に反映する手順を設計します。
