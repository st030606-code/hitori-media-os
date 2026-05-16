# 0029: Mac向けローカルランチャーを追加

日付: 2026-05-12

## 背景

買い手が毎回ターミナルで `npm run dev` を入力する運用は重いため、まずMac向けにダブルクリックで起動できる最小ランチャーを追加しました。

この段階では、買い手向けNext.jsダッシュボードやVisual Register UIはまだ実装しません。

## 決定・変更

`launchers/start-mac.command` を追加しました。

このランチャーは次を行います。

- ランチャーファイルの位置からproject rootを解決する。
- project rootへ移動する。
- `package.json` があるか確認する。
- `node_modules` があるか確認する。
- `node_modules` がない場合、ユーザー確認後に `npm install` を実行できる。
- `npm run dev` を実行する。
- `http://localhost:3333` をブラウザで開く。
- Terminal windowをログ表示用として開いたままにする。

`launchers/README.md` も追加し、Macでの使い方、初回権限、停止方法、現在の起動先を説明しました。

## 現在の起動先

```text
http://localhost:3333
```

現時点ではSanity Studioを開きます。

将来、買い手向けのNext.jsダッシュボードやVisual Register UIを追加したら、このURLを差し替えます。

## no-API MVPの維持

今回の変更はランチャーとドキュメントのみです。

Next.js、フロントエンドダッシュボード、有料LLM API連携、OpenAI API / Anthropic API クライアント、画像生成API呼び出し、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

新しい画像ファイルも作成していません。

## 次の一手

Macで実際に `launchers/start-mac.command` をダブルクリックし、次を確認します。

- macOSの権限警告を越えられるか。
- `node_modules` がある場合に `npm run dev` が起動するか。
- `http://localhost:3333` がブラウザで開くか。
- Terminal windowがログ表示用として残るか。

Mac版が安定したら、Windows launcher、Linux launcher、Local Visual Register UIへ進みます。

## 手動テスト結果

ユーザーが `launchers/start-mac.command` をダブルクリックして確認しました。

結果: 成功。

確認できたこと:

- Terminalが開き、ランチャーログが表示された。
- project rootが正しく解決された。

```text
/Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
```

- `npm run dev` が開始された。
- `sanity dev` が正常に起動した。
- ブラウザで `http://localhost:3333` が開いた。
- Sanity Studioがブラウザで表示された。
- Terminal windowはログ表示用として開いたまま残った。
- macOSの権限問題はなかった。
- port問題はなかった。

確認されたログ:

```text
Sanity AI Content OS
Project root:
Starting local Studio...
The browser will open:
http://localhost:3333
Keep this window open while using the local app.
npm run dev
sanity dev
Sanity Studio using vite ready and running at http://localhost:3333/
```

## 判断

Mac launcherは、no-terminal startup MVPとして機能しました。

ユーザーはTerminal windowをログとして見る必要はありますが、`npm run dev` を手入力する必要はありません。

`launchers/README.md` の現行手順は十分だったため、今回は更新しませんでした。

次は、Windows launcherよりもLocal Visual Register UIを優先すると、手動生成画像の保存・登録ミスを減らせます。
