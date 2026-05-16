# 0010: Sanity Studio検証と環境変数化

日付: 2026-05-12

## 背景

最小Sanity Studioセットアップ後、ローカル環境でStudio起動とログイン確認を行いました。

実Sanity project IDをローカルで設定するとStudioが表示され、ログインできることを確認しました。

## 確認できたこと

- `npm install` は成功しました。
- `styled-components` が不足していたため、依存関係としてインストールされました。
- `npm run dev` でStudioが起動しました。
- Studioは `localhost:3333` で表示されました。
- `projectId` が `placeholder` のままだと `placeholder.api.sanity.io` への接続エラーが発生しました。
- ローカルで実Sanity project IDを設定すると、Studio表示とログインができました。

## 決定・変更

実project IDをコミットしないため、`sanity.config.ts` と `sanity.cli.ts` を環境変数参照へ戻しました。

使用する環境変数:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

安全なfallback:

- `projectId`: `placeholder`
- `dataset`: `production`

`.env.example` を追加し、必要な環境変数名だけを記録しました。

`.env` と `.env.local` は `.gitignore` で除外済みです。

## セキュリティ確認

実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

`tool` や他スキーマにも認証情報を保存するフィールドは追加していません。

## no-API MVPの維持

今回の変更は、Sanity Studioを手動入力・手動レビューのために安全に起動するためのものです。

OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

## 次に確認すること

- `.env.local` に実project IDを設定した状態で、改めて `npm run dev` が動くか
- 7スキーマがStudio上で入力しやすいか
- `publishedOutput` のsource参照を運用でどう必須化するか
- 最初の `contentIdea` をStudioに入力できるか

