# 0028: ローカルランチャーとVisual Registerワークフローを設計

日付: 2026-05-12

## 背景

現在のSanity AI Content OSは、ローカルファイル、Sanity Studio、Sanity CLI、保存済みプロンプトを使ってMVPを進めています。

ただし、買い手が毎回ターミナルで `npm run dev` やCLIコマンドを打つ運用は、日常利用には重すぎます。

特に画像ワークフローでは、手動生成した画像を正しいローカルパスへ保存し、Sanityの `visualAssetPlan` に登録する必要があります。

この作業を手入力だけにすると、ファイルパスのミスや状態更新漏れが起きやすくなります。

## 決定・変更

`docs/17-local-launcher-and-visual-register-workflow.md` を追加しました。

また、次を更新しました。

- `docs/05-future-dashboard.md`
- `docs/14-visual-asset-plan.md`

## CLI-onlyでは足りない理由

開発者にとってCLIは自然ですが、買い手の日常運用では負担になります。

問題:

- 起動コマンドを覚える必要がある。
- project rootへ移動する必要がある。
- サーバーが起動しているか分かりにくい。
- 画像保存先を手で入力すると間違いやすい。
- Sanity更新用のpatchや手順を自分で組み立てるのは難しい。

そのため、最終的にはダブルクリック起動とブラウザUIが必要です。

## ブラウザだけでは足りない理由

通常のブラウザページは、ローカルコマンドを実行できません。

また、ページを表示するために必要なローカルserverを、そのページ自身が起動することもできません。

さらに、通常のWebページだけでは、任意のproject pathへ画像を保存・移動することもできません。

そのため、ブラウザUIだけではなく、ランチャーとローカルNode helper serverが必要です。

## MVPとしてランチャー + ローカルserver/browser UIが良い理由

この構成なら、買い手はコマンドを打たずに始められます。

想定:

1. ユーザーがランチャーをダブルクリックする。
2. ランチャーがproject rootへ移動する。
3. ランチャーが `node_modules` を確認する。
4. ランチャーが `npm run dev` を起動する。
5. ブラウザでVisual Register UIまたはSanity Studioを開く。
6. ユーザーが画像を選び、対象の `visualAssetPlan` に登録する。
7. ローカルserverが画像を正しいpathへ保存し、patch JSONを作る。

## 画像生成APIをまだ実装しない理由

`visualAssetPlan` には、将来API生成に必要な `generationMode`、`generationProvider`、`generationJobId`、`apiEnabled` があります。

ただし、今はまだAPI化しません。

理由:

- まず手動生成と保存・登録フローを安定させる必要がある。
- どの画像が本当に使えるか、レビュー工程を確認したい。
- API生成より前に、ファイル保存先、publish package、Sanity更新のルールを固めたい。
- APIキー、トークン、認証情報、シークレットを扱う段階ではない。

## no-API MVPの維持

今回の変更はドキュメント設計のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、画像生成API呼び出し、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

新しい画像ファイルも作成していません。

## 次の一手

次は、まずMac向けの最小ランチャーを追加するのが自然です。

候補:

```text
launchers/start-mac.command
```

その後、ローカルVisual Register UIを小さく作ります。
