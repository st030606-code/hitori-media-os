# 0027: visualAssetPlan schemaを追加

日付: 2026-05-12

## 背景

`diagramPlan` は概念レベルの図解計画として有効ですが、実際のビジュアル制作では、媒体、配置、比率、保存先、生成状態、公開パッケージを1枚単位で管理する必要があります。

また、現在はChatGPT画像生成などを人間が手動で使うno-APIワークフローですが、将来は同じ計画レコードをAPI生成にも使えるようにしておきたいです。

## 決定・変更

`schemas/visualAssetPlan.ts` を追加し、`schemas/index.ts` に登録しました。

また、次を追加・更新しました。

- `docs/14-visual-asset-plan.md`
- `tasks/visuals/_template.md`
- `seed/visual-asset-plan-records.json`
- `docs/05-future-dashboard.md`

## visualAssetPlanの役割

`visualAssetPlan` は、実際に作るビジュアルアセット1枚ごとの制作計画です。

扱うもの:

- 元の `contentIdea`
- 元の `diagramPlan`
- 関連する `platformOutput`
- 使う制作ツール
- 対象媒体
- 配置場所
- アセット種別
- アスペクト比
- 画像生成プロンプト
- 入れる文字、避ける文字
- ローカル保存先
- タスクファイル
- 公開パッケージ
- 将来API生成のためのgeneration fields

## no-API半自動ワークフロー

現在のMVPでは画像生成APIを実装しません。

流れ:

1. Codex / Claude Code が `visualAssetPlan` とタスクファイルを準備する。
2. 人間がChatGPT画像生成やデザインツールを手動で使う。
3. 生成画像を指定パスへ保存する。
4. Sanityで `localAssetPath`、`status`、`reviewNotes` を更新する。
5. 公開用素材を `publishPackagePath` にまとめる。
6. 投稿や公開は人間が手動で行う。

## 将来API自動化との互換性

将来は、同じ `visualAssetPlan` をAPI生成ジョブにも使えます。

追加した互換フィールド:

- `generationMode`
- `generationProvider`
- `generationJobId`
- `sourcePromptVersion`
- `apiEnabled`
- `automationNotes`

ただし、今回はAPI呼び出し、APIクライアント、認証情報保存は実装していません。

## 初期seed

`seed/visual-asset-plan-records.json` に5件を追加しました。

- note hero / eye-catch v1
- X hook image
- Instagram carousel cover
- GitHub architecture diagram
- YouTube thumbnail

最初のnote hero / eye-catchは、ChatGPT上で生成済みだがローカル保存待ちとして扱うため、`status: generated-needs-save` にしています。

`localAssetPath` は、実ファイルの保存パスが提供されるまで空にしています。

## no-API MVPの維持

今回の変更はスキーマ、seed、ドキュメント、タスクテンプレートの追加のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、画像生成API呼び出し、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

新しい画像ファイルも作成していません。

## 次の一手

まずは `npm run build` でschema buildを確認します。

その後、ユーザーが実際のnote hero画像をローカルに保存し、`visualAssetPlan.ai-blog-db.note-hero-v1` の `localAssetPath` と `status` を更新する流れに進みます。
