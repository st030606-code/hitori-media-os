# Devlog 0069: Activate substackPublicationStrategy (1st Substack schema)

Date: 2026-05-14

## 今日の判断

`schemas/proposed/` に置いていた6本の Substack 戦略スキーマのうち、`substackPublicationStrategy` だけを **1本だけ** Studio に活性化しました。残り5本（PostPlan / NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only の状態で `schemas/proposed/` に残しています。

これは `schemas/proposed/README.md` の Activation Checklist に従った、最初の段階的活性化バッチです。

## 変更したこと

- `schemas/proposed/substackPublicationStrategy.ts` を削除し、`schemas/substackPublicationStrategy.ts` を新規作成（PROPOSED コメントブロックを取り除いた以外は内容同一）。
- `schemas/index.ts` に `import {substackPublicationStrategy} from './substackPublicationStrategy'` を追加し、`schemaTypes` 配列に1つだけ entry を追加（末尾）。
- `seed/substack-publication-strategy-building-hitori-media-os.json` を新規作成。
  - `_id: substackPublicationStrategy.building-hitori-media-os`
  - `sourceContentIdea: contentIdea.building-hitori-media-os`
  - `relatedContentIdeas: [ai-blog-db]`
  - targetReader / positioningStatement / coreTopics（Hitori Media OS / AI-assisted media workflow / Substack reader-list growth）
  - publicationPromise / freeContentRole / paidContentRole / notesRole / postRole / subscriberCTA / voiceContentFormat
  - aboutPageDraft / welcomeEmailDraft は TODO（手書きで埋める想定）
  - status: draft
  - reviewNotes: 「Initial test seed. 他5本は proposed のまま」と明記
- `schemas/proposed/README.md` に Activation Status テーブルを追加し、`substackPublicationStrategy` が activated、他5本が proposed-only である現状を明記。test seed パスと「次の活性化は別バッチ」のメモも追加。

## 変更していないもの

- `sanity.config.ts`（`git diff` 空）。`schemaTypes` を `schemas/index.ts` から取り込む構造はそのまま。
- 既存スキーマ（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool）。
- 他の proposed スキーマファイル5本。
- 既存 outputs / publish-packages / private / assets/visuals。
- Sanity Studio への CLI 操作（`sanity documents create` は実行していない、`seed --replace` も使っていない）。

## 理由

`substackPublicationStrategy` を最初に選んだのは、他5本（PostPlan / NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）がいずれも `publicationStrategy` への reference を持つためです。publicationStrategy が先に活性化されていれば、後続スキーマを足すときに依存が自然に解ける形になります。

1本ずつ活性化する方針を維持しているのは、`schemas/proposed/README.md` Activation Checklist で示した通り、Studio UI に複数 document type を同時に投入すると運用判断が雑になるからです。今回はあくまで「土台1本だけ active」にして、Studio で実際にデータを入れたときの使い勝手と過不足を判断する段階。

## 安全性の担保

- `sanity.config.ts` 未変更（diff空）。
- Sanity CLI / direct write / `seed --replace` は一切使用していない。
- test seed JSON はローカル保存のみ。Studio への投入は人間が手動で `npx sanity documents create seed/substack-publication-strategy-building-hitori-media-os.json` を判断したときに初めて行う。
- 5本の proposed スキーマは `schemas/proposed/` に残り、`schemas/index.ts` から import されていないため、Studio registry に登場しない。
- 提案版（旧 `schemas/proposed/substackPublicationStrategy.ts`）の `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` コメントブロックは、active 版から削除済み。

## CodexとClaude Codeの役割分担

Claude Code が今回の活性化を担当。Codex には、人間が Studio で document を作ったあと、`aboutPageDraft` / `welcomeEmailDraft` を実際に埋めるドキュメントレビューと、入力UIの使い勝手フィードバックの整理を渡す想定。

## APIなしで済ませた理由

スキーマ活性化と test seed 作成は、ローカルファイル操作 + `schemas/index.ts` 1ファイルの編集だけで完結します。LLM API、外部翻訳、Sanity API は一切呼んでいません。Sanity Studio への動作確認は人間が `npm run dev` で手動でブラウザを開いて行う想定。

## 発信コンテンツにできる切り口

- 6本まとめて足さず、1本だけ活性化する Hitori Media OS らしい段階的活性化。
- 「土台になるスキーマ」を最初に活性化したほうが依存関係を綺麗に保てる、という設計判断。
- proposed → active の境界をフォルダ構造とコメントブロックで二重に守る運用。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `git diff sanity.config.ts` → 空（未変更）
- `npm run build` → 7.6s で成功（新規スキーマ含む）
- `schemas/proposed/` の残り5本は import されていないことを確認

## 次にテストすること

1. 人間がローカルで `npm run dev` を起動し、Sanity Studio の左ナビに「Substack発行戦略（Substack Publication Strategy）」が表示されること、新規作成画面で各フィールドが想定通りレンダリングされることを確認する。
2. 必要であれば `npx sanity documents create seed/substack-publication-strategy-building-hitori-media-os.json` でtest seedを投入し、Studio で参照UIや radio status が正しく動くか確認する（`seed --replace` は使わない）。
3. `aboutPageDraft` / `welcomeEmailDraft` を人間が実際に埋めて、Substack 公開時の準備に使えるか確かめる。
4. 入力UIに違和感があれば `schemas/substackPublicationStrategy.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` へ戻す（diff小さく revert可能）。
5. 安定したら、次は `substackPostPlan` を同じ手順で1本だけ活性化する別バッチを検討する。
