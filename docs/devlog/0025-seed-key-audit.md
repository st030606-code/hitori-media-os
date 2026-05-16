# 0025: seed全体の_key監査

日付: 2026-05-12

## 背景

`workflow` seedで `Missing keys` 警告が発生したため、ほかのSanity seedにも同じ問題が残っていないか確認しました。

Sanityでは、document内部の配列itemがobjectまたはreferenceの場合、CLI/API作成時にも `_key` が必要です。

## 確認対象

確認したseed:

- `seed/contentIdea-ai-blog-db.json`
- `seed/prompt-records.json`
- `seed/platform-output-records.json`
- `seed/diagram-plan-records.json`
- `seed/tool-records.json`
- `seed/workflow-records.json`

## 確認結果

追加修正が必要なseedはありませんでした。

詳細:

- `contentIdea` は `claims`、`examples`、`objections`、`platformAngles`、`outputChecklist` などのobject配列に `_key` が入っている。
- `prompt` は `requiredInputFields` と `humanReviewChecklist` が文字列配列なので `_key` は不要。
- `platformOutput` はdocument内部にobject配列がない。
- `diagramPlan` は `labels` が文字列配列なので `_key` は不要。
- `tool` は `usedFor` が文字列配列なので `_key` は不要。
- `workflow` は `promptsUsed`、`toolsUsed`、`platformOutputs`、`diagramPlans` のreference配列に `_key` が入っている。

## 追加したドキュメント

`docs/12-sanity-seed-key-rules.md` を追加しました。

この文書では、次を整理しています。

- `_key` が必要な配列
- `_key` が不要な配列
- トップレベルのdocument配列には `_key` が不要なこと
- 読みやすく安定した `_key` 命名方針
- 今回確認したseedの結果

## no-API MVPの維持

今回の変更はドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

`publishedOutput` seed documentsも作成していません。

## 次の一手

Studioでほかのseed documentに `Missing keys` 警告が出ていないか確認します。

問題がなければ、次は最初の画像生成に進むか、`visualAssetPlan` / `visualPlacementPlan` スキーマの必要性を判断します。
