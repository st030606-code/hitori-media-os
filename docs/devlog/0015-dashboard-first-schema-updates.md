# 0015: ダッシュボード前提のスキーマ更新

日付: 2026-05-12

## 背景

前回、Sanity StudioはバックオフィスUI、将来のNext.jsダッシュボードは買い手向けの主操作UIとして整理しました。

今回は、その方針をSanity TypeScriptスキーマに反映しました。

## 決定・変更

`contentIdea` に任意フィールド `rawInput` を追加しました。

これは、将来のダッシュボードで最初に入力される未整理メモ、Obsidianメモ、会話ログ、記事アイデアなどを受け取るための欄です。

AI支援で `claims`、`examples`、`objections`、`platformAngles` を整理する前の素材として扱います。

また、以下のフィールドで媒体値をselect option化し、自由入力ではなく制御値として扱うようにしました。

- `contentIdea.platformAngles.platform`
- `platformOutput.platform`
- `diagramPlan.targetPlatform`
- `publishedOutput.platform`
- `prompt.targetPlatform`

さらに、以下の `outputType` も制御値にしました。

- `contentIdea.outputChecklist.outputType`
- `platformOutput.outputType`
- `prompt.outputType`

## 制御値の方針

媒体値は小文字の英語値に揃えました。

例:

- `substack`
- `threads`
- `x`
- `youtube`
- `instagram`
- `newsletter`

Studio上の表示は日本語優先・英語併記にし、保存される値は英語の制御値にしています。

## no-API MVPの維持

今回の変更はSanityスキーマの入力制御と任意フィールド追加のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

## 重要な判断

初回コンテンツ入力前の段階なので、`Substack` や `YouTube` のような大文字混じりの保存値ではなく、将来のダッシュボードで扱いやすい小文字の制御値へ揃えました。

もし既存データが入った後に同じ変更をする場合は、データ移行が必要になります。

## 次に確認すること

- 初回 `contentIdea` 入力時に `rawInput` を入れるか、空のまま始めるか
- サンプルJSONの `platformAngles.platform` を小文字制御値へ更新するか
- 既存プロンプト内の `platformAngles` 参照が大文字前提になっている箇所を直すか
- Studio上のselect optionが長すぎず選びやすいか

