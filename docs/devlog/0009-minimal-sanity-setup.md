# 0009: 最小Sanity Studioセットアップ

日付: 2026-05-11

## 背景

MVP 7スキーマが揃ったため、Sanity Studioをローカルで起動・検証するための最小セットアップを追加しました。

Next.js、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成・自動投稿は追加していません。

## 追加したファイル

- `package.json`
- `sanity.config.ts`
- `sanity.cli.ts`
- `tsconfig.json`
- `.gitignore`

## 追加したスクリプト

`package.json` にSanity Studio用のスクリプトだけを追加しました。

- `npm run dev`: Studioをローカル起動する
- `npm run start`: ビルド済みStudioを起動する
- `npm run build`: Studioをビルドする

Next.js用のスクリプトは追加していません。

## placeholder projectId / dataset の扱い

`sanity.config.ts` と `sanity.cli.ts` では、実プロジェクトIDではなく placeholder を使っています。

```ts
const projectId = 'placeholder'
const dataset = 'production'
```

実際にStudioを起動する前に、`projectId` をSanity管理画面で作成した実プロジェクトIDへ置き換えます。

APIトークン、認証情報、シークレットは、このリポジトリに保存しません。

## no-API MVPの維持

今回のセットアップは、Sanity Studioで手動入力・手動レビューを行うためのものです。

AI APIによる自動生成や自動投稿の仕組みは含めていません。

引き続き、Codex、Claude Code、ChatGPT、Claude アプリ、ローカルファイル、保存済みプロンプトを使う手動・半自動ワークフローを前提にします。

## まだ実行していないこと

依存関係のインストールはまだ実行していません。

そのため、Studio起動やTypeScriptコンパイルはまだ検証していません。

Sanity Studio v4以降は Node.js 20+ が前提です。ローカル検証前にNodeバージョンも確認します。

## 次に確認すること

- Node.js 20+ で実行しているか
- 実SanityプロジェクトIDに置き換えるかどうか
- `sanity dev` でStudioが起動するか
- 7スキーマがStudioで読み込めるか
- required項目が入力作業を重くしすぎていないか
- `publishedOutput` のsource参照を運用でどう必須化するか
