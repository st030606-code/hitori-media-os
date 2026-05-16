# Handoff: Visual Asset Plan Schema

Date: 2026-05-12

## 1. Task Goal

ローカル優先・no-APIのビジュアル制作ワークフローを支えつつ、将来のAPI画像生成にも対応できる `visualAssetPlan` schemaと初期seedを追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- 新しい画像ファイルは作成していません。
- `publishedOutput` seed documentsは作成していません。

## 3. Changed Files

- `schemas/visualAssetPlan.ts`
- `schemas/index.ts`
- `seed/visual-asset-plan-records.json`
- `docs/14-visual-asset-plan.md`
- `docs/05-future-dashboard.md`
- `tasks/visuals/_template.md`
- `docs/devlog/0027-visual-asset-plan-schema.md`
- `docs/handoff/latest.md`
- `docs/handoff/0034-visual-asset-plan-schema.md`

## 4. Summary of Changes

`visualAssetPlan` schemaを追加しました。

これは、媒体別の実ビジュアルアセット1枚ごとに、目的、配置、比率、生成プロンプト、ローカル保存先、公開パッケージ、現在の状態、将来API生成のための情報を管理するschemaです。

初期seedとして、note hero、X hook、Instagram carousel cover、GitHub architecture diagram、YouTube thumbnailの5件を追加しました。

## 5. Key Decisions

- `diagramPlan` は概念レベルの図解計画として残す。
- `visualAssetPlan` は実アセット単位の制作・保存・レビュー・公開パッケージ計画を扱う。
- 現在は `generationMode: semi-automatic`、`generationProvider: chatgpt-manual`、`apiEnabled: false` を使う。
- note hero v1はChatGPT上で生成済みだが保存待ちとして `generated-needs-save` にする。
- `localAssetPath` は実ファイルが保存されるまで空にする。

## 6. Human Review Questions

- `visualAssetPlan` のフィールド数はStudioで重すぎないか。
- `generationProvider` の制御値は今後の制作ツールに十分か。
- note hero v1の `status: generated-needs-save` は現状に合っているか。
- ローカルフォルダルールは実運用しやすいか。

## 7. Risks or Uncertainties

- 実画像ファイルがまだ保存されていないため、`localAssetPath` は空です。
- 画像生成後のファイル形式や命名規則は、最初の保存時に微調整が必要かもしれません。
- 将来API化する場合、`generationJobId` 以外にprovider固有のmetadataが必要になる可能性があります。

## 8. Recommended Next Step

ユーザーがChatGPT上のnote hero画像をローカルに保存し、`visualAssetPlan.ai-blog-db.note-hero-v1` の `localAssetPath` と `status` を更新する。

その後、必要ならSanity CLIで `seed/visual-asset-plan-records.json` を作成し、Studioで表示確認する。

## 9. Exact Prompt to Give Codex Next

```text
Prepare a local registration update for the first generated note hero image.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Current status:
- The first note hero image exists in ChatGPT.
- It still needs to be saved locally.
- visualAssetPlan.ai-blog-db.note-hero-v1 currently has status generated-needs-save and empty localAssetPath.

Tasks:

1. Create the appropriate local folder path for the note hero image if needed.
2. Do not create or modify the image file unless a real local path is provided.
3. Prepare instructions for saving the image to:
   assets/visuals/ai-blog-db/note/hero/note-hero-eye-catch-v1.png
4. Prepare the Sanity update steps:
   - localAssetPath
   - status: saved
   - updatedAt
   - reviewNotes
5. Update docs/devlog and docs/handoff/latest.md.

After editing, summarize:
1. Where the image should be saved
2. What Sanity fields should be updated
3. What should be reviewed after saving
4. Whether X/Instagram variants should come next
```
