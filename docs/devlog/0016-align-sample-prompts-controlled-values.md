# 0016: サンプルJSONとプロンプトを制御値に合わせる

日付: 2026-05-12

## 背景

前回、Sanity TypeScriptスキーマで `platform` / `targetPlatform` / `outputType` をselect option化し、小文字英語の制御値へ揃えました。

今回は、初回 `contentIdea` 入力前に、サンプルJSONと保存済みプロンプトの参照値をスキーマに合わせました。

## 決定・変更

`inputs/content-ideas/example-ai-blog-db.json` の `platformAngles.platform` を小文字制御値へ変更しました。

例:

- `Substack` -> `substack`
- `Threads` -> `threads`
- `YouTube` -> `youtube`
- `GitHub` -> `github`

あわせて、`x`、`diagram`、`paid`、`newsletter` のplatform angleも追加しました。

`outputChecklist.outputType` も、スキーマ側の制御値に合わせました。

例:

- `note` -> `note-article`
- `substack` -> `substack-post`
- `threads` -> `threads-thread`
- `youtube` -> `youtube-script`
- `diagram` -> `diagram-plan`
- `github-docs` -> `github-doc`

各プロンプトでは、`platformAngles.platform` を参照する条件を小文字制御値に変更しました。

## substack と newsletter の扱い

`platform = substack` は、Substack固有の投稿、読者関係、制作ログに寄せた出力として扱います。

`platform = newsletter` は、Substackに限らない汎用ニュースレター / メール配信用の出力として扱います。

この区別を `generate-substack-post.md` と `generate-x-post.md` に明記しました。

## no-API MVPの維持

今回の変更はサンプルデータとプロンプト文面の整合だけです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

## 確認したこと

`example-ai-blog-db.json` はJSONとしてパースできることを確認しました。

旧形式の大文字platform値や旧outputType値が、サンプルJSONのデータ値として残っていないことも確認しました。

## 次に確認すること

- Studioで初回 `contentIdea` を入力できるか
- `rawInput` を初回から使うか、空のまま始めるか
- `newsletter` 用の出力プロンプトを今後追加するか
- `outputs/paid/` や `outputs/newsletter/` のような出力フォルダを追加するか

