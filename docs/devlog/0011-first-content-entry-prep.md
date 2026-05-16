# 0011: 初回contentIdea入力準備

日付: 2026-05-12

## 背景

Sanity Studioがローカルで表示され、実project IDを使うとログインできることを確認しました。

次に最初の `contentIdea` をStudioへ入力するため、READMEにローカルSanity環境変数の設定手順を追加しました。

## 決定・変更

`README.md` に、`.env.local` の作成方法を追加しました。

必要な環境変数:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

また、`.env.local` はgitignore済みであり、実project IDやAPIキー、トークン、認証情報、シークレットをコミットしないことを明記しました。

`placeholder.api.sanity.io` に接続しようとして失敗する場合は、project IDが設定されていないこともREADMEに追記しました。

## no-API MVPの維持

今回の変更は、Studioを安全にローカル起動し、手動でコンテンツ入力を始めるためのものです。

Next.js、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

## 次にやること

Studioで最初の `contentIdea` を1件入力します。

入力元としては、`inputs/content-ideas/example-ai-blog-db.json` を使うのがよいです。

入力後に確認すること:

- required項目が多すぎないか
- `claims` と `platformAngles` が入力しやすいか
- optionalにした `evidence`、`examples`、`objections` が必要に応じて使えるか
- Studio上で下書き生成前の元レコードとして扱いやすいか

