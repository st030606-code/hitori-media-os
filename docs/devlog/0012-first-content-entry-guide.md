# 0012: 初回contentIdea入力ガイドを作成

日付: 2026-05-12

## 背景

Sanity Studioがローカルで起動できる状態になったため、最初の `contentIdea` を手入力するためのガイドを作成しました。

入力元は `inputs/content-ideas/example-ai-blog-db.json` です。

## 決定・変更

`docs/04-first-content-entry.md` を追加しました。

このガイドでは、JSONフィールドとSanity Studioの `contentIdea` フィールドを対応させています。

必須フィールドと任意フィールドを分け、入力順と入力後のQAチェックも追加しました。

## no-API MVPの維持

今回の作業は、Studioで人間が手入力するためのガイド作成です。

Next.js、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

## 重要な判断

最初の入力では、まず必須フィールドだけで保存できるかを確認します。

`contentIdea` には生成下書き本文を入れません。

生成下書きは `platformOutput`、図解計画は `diagramPlan`、公開URLや反応は `publishedOutput` に分けます。

## 次に確認すること

- Studioで必須フィールドだけ入力して保存できるか
- `claims` と `platformAngles` の入力UIが重すぎないか
- 任意フィールドをどこまで初回入力に含めるか
- 次に `prompt` を入力するか、`platformOutput` を入力するか

