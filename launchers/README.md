# Local Launchers

このフォルダには、Sanity AI Content OSをターミナル入力なしで起動するためのランチャーを置きます。

## Mac

```text
launchers/start-mac.command
```

Macでは、このファイルをダブルクリックして起動します。

現在の起動先:

```text
http://localhost:3333
http://localhost:3334
```

`http://localhost:3333` はSanity Studioです。

`http://localhost:3334` はLocal Visual Registerです。

将来、買い手向けのNext.jsダッシュボードを追加したら、起動先URLをそのdashboard URLへ変更できます。

## 初回実行

初回はmacOSが実行をブロックすることがあります。

その場合は、次のいずれかを試します。

1. Finderで `start-mac.command` を右クリックする。
2. `開く` を選ぶ。
3. 警告が出たら、内容を確認して `開く` を選ぶ。

また、実行権限がない場合は、開発者が一度だけ次を実行します。

```bash
chmod +x launchers/start-mac.command
```

## node_modules がない場合

`node_modules` がない場合、ランチャーは `npm install` を実行するか確認します。

自動で無条件にinstallはしません。

## 起動中

ランチャーを実行すると、Terminal windowがログ表示用に開いたままになります。

このウィンドウは閉じずに使います。

停止したい場合は、Terminal windowで `Ctrl+C` を押します。

これにより、Sanity StudioとLocal Visual Registerの両方を停止します。

## まだできないこと

現時点では、次は未実装です。

- 買い手向けNext.jsダッシュボード
- 画像生成API
- 自動投稿
- Sanityへの直接patch/update
