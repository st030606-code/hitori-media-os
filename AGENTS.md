# エージェント向け指示

このリポジトリは Sanity AI Content OS の作業場所です。

エージェントは、次の方向性を守ってください。

- これは、ひとりメディア運営者のための Sanity ベースの AI コンテンツ運用OSです。
- システムの中心は「ひとつの構造化された知識レコード」です。
- MVP では、API 自動化より先に手動・半自動ワークフローを重視します。
- 汎用ブログテンプレートにしないでください。
- 明示的に依頼されるまで、有料 AI API 連携を追加しないでください。
- 明示的に依頼されるまで、Next.js アプリや Sanity Studio を初期化しないでください。

## 作業方針

- 変更は小さく、読みやすく、レビューしやすくしてください。
- この段階では、ドキュメント、プロンプト、サンプル、ワークフロー改善を優先してください。
- `inputs/` は元になる素材、`outputs/` は生成・編集された成果物として扱います。
- 重要なプロダクト判断や設計判断をした場合は、devlog に記録してください。
- プロンプトは Codex、Claude Code、ChatGPT、Claude アプリで再利用できる形にしてください。

## Handoff ワークフロー

意味のある作業が終わるたびに、ChatGPTレビュー用の handoff を作成または更新してください。

必ず更新するファイル:

- `docs/handoff/latest.md`

必要に応じて追加するファイル:

- `docs/handoff/000X-task-name.md`

handoff には、次を簡潔に含めます。

- task goal
- changed files
- key decisions
- constraints followed
- human review questions
- recommended next Codex prompt

新しいhandoffを書くときは、`docs/handoff/_template.md` を使ってください。

## 現在のフェーズ

基礎づくりのフェーズです。

- コンセプト
- ロードマップ
- スキーマ設計
- API なしワークフロー
- 保存済みプロンプト
- ローカル入出力構造
- devlog の習慣化

## まだ避けること

- Next.js 実装
- Sanity 初期化
- 有料 AI API クライアント
- ベクトルデータベース
- キューワーカー
- アカウント固有の投稿自動化
- 特定の AI プロバイダーに強く依存するスクリプト

## レビュー観点

レビュー時は次を確認してください。

- 普通のブログテンプレになっていないか
- ひとつの知識レコードから複数出力へ展開できるか
- note / Substack / Threads / YouTube / Podcast / GitHub の出力に耐えるか
- APIなしMVPの原則を壊していないか
- devlogに残すべき判断が抜けていないか

レビュー結果は次の形式で返してください。

1. Summary
2. Blocking issues
3. Non-blocking improvements
4. Suggested edits
5. Content angle for note/Substack
