# 0013: Sanity Studioの表示ラベルを日本語優先に変更

日付: 2026-05-12

## 背景

最初の `contentIdea` をSanity Studioへ手入力する前に、日本語ユーザーが迷わず操作できるよう、スキーマとフィールドの表示ラベルを日本語優先にしました。

保存されるフィールド名や選択肢の値は英語のまま維持し、Studio上で見える `title` と `description` だけを変更しています。

## 決定・変更

以下の7スキーマで、ドキュメントタイプ名、主要フィールド名、select optionの表示名を日本語優先・英語併記に変更しました。

- `contentIdea`
- `prompt`
- `platformOutput`
- `diagramPlan`
- `workflow`
- `publishedOutput`
- `tool`

特に、`coreThesis`、`audiencePain`、`claims`、`evidence`、`examples`、`platformAngles`、`draftBody`、`generatedFromPrompt`、`sourceWorkflow`、`pairedPostText`、`publishedUrl`、`performanceNotes`、`costModel` には説明を追加または改善しました。

## no-API MVPの維持

今回の変更はSanity Studioの表示改善のみです。

Next.js、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

## 重要な判断

スキーマの `name` はすべて英語のまま維持しました。

select optionの `value` も英語のまま維持しました。これは、将来のコード利用、クエリ、移行、既存データ互換性を守るためです。

日本語ラベルはStudio上の操作性を上げるための表示レイヤーとして扱います。

## 次に確認すること

- Studio上で日本語ラベルが自然に見えるか
- `contentIdea` の初回入力で説明文が十分に役立つか
- select optionの日本語表現がボスの運用語彙に合っているか
- まだ説明が足りないフィールドがないか

