# ローカルランチャーとVisual Registerワークフロー

このドキュメントは、買い手がターミナルコマンドを毎回入力しなくても、ローカルアプリを起動し、手動生成した画像を正しい場所へ登録できるようにするための設計メモです。

現時点では、Mac launcherとLocal Visual Register UIの最小実装まで完了しています。

Next.jsダッシュボードと画像生成APIはまだ実装しません。

## 全体アーキテクチャ

### Current MVP

現在のMVPは、ローカル優先・no-API・半自動の制作ワークフローです。

流れ:

1. ユーザーがChatGPT画像生成や別のデザインツールで画像を手動生成する。
2. ユーザーが画像をダウンロードまたは保存する。
3. ローカルランチャーがローカルアプリを起動する。
4. ブラウザUIが画像登録を支援する。
5. ローカルNode serverが画像を正しいproject pathへ保存または移動する。
6. システムがSanity patch/update用JSONまたは手順を作る。
7. 実際のSanity writeは、当面は手動またはpatchベースでよい。
8. 実際のSNS投稿やnote公開は人間が手動で行う。

中心モデル:

```text
visualAssetPlan
```

`visualAssetPlan` が、対象媒体、配置、保存先、生成プロンプト、状態、将来API生成のための情報を持ちます。

### Future

将来のNext.jsダッシュボードでは、`visualAssetPlan` を読み書きします。

対応する生成モード:

- manual
- semi-automatic
- api-automatic

`generationMode` と `generationProvider` により、現在の手動生成と将来のAPI生成を同じモデルで扱います。

将来API化した場合:

1. ダッシュボードが `visualAssetPlan` を読む。
2. `generationMode: api-automatic` の計画を生成対象にする。
3. OpenAI API、Stability API、ローカルモデル、その他providerへジョブを送る。
4. `generationJobId` を保存する。
5. 生成画像を保存する。
6. `localAssetPath`、`status`、`reviewNotes` を更新する。

このため、API自動生成を追加しても `visualAssetPlan` の中心設計は変えません。

## なぜ普通のブラウザページだけでは npm run dev を起動できないか

通常のWebページは、ユーザーのPC上で任意のローカルコマンドを実行できません。

理由:

- ブラウザのセキュリティ制限により、Webページから `npm run dev` のようなローカルコマンドは実行できない。
- 通常のブラウザページは、ユーザーのファイルシステムへ自由に保存・移動できない。
- そもそも、ページを表示するために必要なローカルサーバーを、そのページ自身が起動することはできない。
- ブラウザUIは、起動済みのサーバーに接続して操作する側であり、サーバーを起動する側にはなれない。

そのため、買い手がコマンドを打たずに始めるには、ランチャーまたはデスクトップラッパーが必要です。

## Recommended MVP Launcher Flow

MVPでは、OS別のランチャーファイルを使います。

流れ:

1. ユーザーがランチャーファイルをダブルクリックする。
2. ランチャーがproject rootへ移動する。
3. ランチャーが `node_modules` の有無を確認する。
4. `node_modules` がない場合、ユーザーへinstallが必要だと案内する。
5. 安全に運用できる段階では、ランチャーが `npm install` を実行する選択肢も検討する。
6. ランチャーが `npm run dev` を実行する。
7. ランチャーが `npm run visual:register` を実行する。
8. ランチャーがSanity Studio URLとLocal Visual Register URLをブラウザで開く。
9. Terminal windowはログ表示用として開いたままにする。
10. ユーザーは手動でコマンドを入力しない。

初期MVPでは、Sanity StudioとLocal Visual Registerを同時に開きます。

将来は、買い手向けのローカルVisual Register UIまたはNext.jsダッシュボードURLを開きます。

## Cross-platform Launcher Plan

将来追加する候補:

```text
launchers/start-mac.command
launchers/start-windows.bat
launchers/start-linux.sh
```

最初のMVPランチャーとして、Mac向けの `launchers/start-mac.command` を追加します。

現在の起動先URL:

```text
http://localhost:3333
http://localhost:3334
```

`http://localhost:3333` はSanity Studioです。

`http://localhost:3334` はLocal Visual Registerです。

将来、買い手向けのNext.jsダッシュボードを追加したら、ランチャーの起動先URLをdashboard URLへ変更します。

WindowsとLinuxのランチャーはまだ実装しません。

理由:

- Mac / Windows / Linuxで起動・権限・ブラウザopen方法が異なる。
- `npm install` を自動実行するかどうかは、ユーザー体験と安全性の確認が必要。

Mac版で運用を確認してから、Windows / Linux版へ展開します。

## Visual Register Workflow Without CLI

Visual Registerは、手動生成した画像を正しいローカルパスへ保存し、Sanity更新データを作るためのブラウザUIです。

流れ:

1. ユーザーがVisual Register pageを開く。
2. ユーザーが画像ファイルを選択、またはドラッグ&ドロップする。
3. ユーザーが対象の `visualAssetPlan` を選ぶ。
4. ページが画像プレビューを表示する。
5. ページが expected `localAssetPath` を表示する。
6. ユーザーが `Register` をクリックする。
7. ローカルserverが画像を正しいpathへ保存または移動する。
8. ローカルserverがSanity patch/update JSONを作る。
9. 現在のMVPでは、人間がSanity StudioまたはCLI/patch手順で反映する。
10. 将来版では、serverまたはダッシュボードがSanityへ直接updateする。

Visual Registerが更新する主なフィールド:

- `localAssetPath`
- `status`
- `generatedWith`
- `reviewNotes`
- `publishPackagePath`
- `updatedAt`

将来API生成版では、手動アップロードをスキップし、`generationJobId` とprovider metadataから保存・登録へ進めます。

## Implementation Options

| option | Pros | Cons | Best use |
| --- | --- | --- | --- |
| A. Standalone local HTML tool | 依存が少ない。静的ファイルとして開きやすい。簡単なチェックリストや入力フォームには向く。 | ローカルコマンド実行や任意パス保存ができない。Sanity更新やファイル移動には限界がある。 | 仕様確認、入力項目のプロトタイプ、UIモック。 |
| B. Local Node helper server / lightweight browser UI | ローカルファイル保存、画像移動、patch JSON生成、フォルダ作成ができる。Next.js前でも軽く作れる。 | サーバー起動が必要。ランチャーがないと買い手にはまだ難しい。UIを後でNext.jsへ移す可能性がある。 | MVPのVisual Register、ローカル保存、publish package作成。 |
| C. Future Next.js dashboard page | 買い手向けUIとして統合しやすい。Sanityとの読み書き、状態管理、Visual Register、将来API生成をまとめられる。 | まだ実装タイミングではない。認証、ローカルファイル保存、サーバー起動方法の設計が必要。 | 本番に近い操作UI、日常運用、将来の有料プロダクト。 |

Future D option:

| option | Pros | Cons | Best use |
| --- | --- | --- | --- |
| D. Tauri / Electron desktop app | ダブルクリック起動、ローカルファイル操作、ブラウザUI、バックグラウンド処理を統合しやすい。 | 実装と配布が重くなる。OS別ビルドや更新配布が必要。 | 買い手向けに完全なデスクトップ体験が必要になった段階。 |

## Recommended Implementation Path

推奨順:

1. ランチャー + Visual Register workflowを文書化する。
2. OS別ランチャーファイルを追加する。
3. ランチャーが安定したら、ローカルVisual Register UIを追加する。
4. 後でUIをNext.jsダッシュボードへ移す。
5. さらに後で、Sanity direct writeとAPI画像生成を追加する。

現時点では、Mac launcher、Sanity Studio、Local Visual Registerの最小連携まで完了しています。

## What Should Not Be Automated Yet

まだ自動化しないもの:

- 画像生成API呼び出し
- OpenAI API / Anthropic API クライアント
- 自動投稿
- SNSやnoteへの自動アップロード
- 公開後メトリクスの自動取得
- ランチャーからの無条件 `npm install`

まずは、起動、画像登録、保存先、patch生成までをローカルで安定させます。

## Next Step

次に実装するなら、まず次です。

```text
patch JSONをSanityへ安全に反映する手順
```

その次に、Mac以外のWindows / Linux launcherを検討します。
