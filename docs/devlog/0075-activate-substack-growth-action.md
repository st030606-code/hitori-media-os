# Devlog 0075: Activate substackGrowthAction (4th Substack schema)

Date: 2026-05-14

## 今日の判断

`substackNotesPlan` と `substackPostPlan.relatedNotesPlan` の Studio UI 確認が問題なく通ったので、proposed の残り3本のうち `substackGrowthAction` だけを **1本だけ** 追加活性化しました。残り2本（SubscriberMilestone / PaidReadiness）は引き続き proposed-only。

これで Substack 戦略レイヤーの4本（PublicationStrategy / PostPlan / NotesPlan / GrowthAction）が active になり、Hitori Media OS の Substack 運用面（戦略 / Post / Notes / 手動施策）を Studio で完結できる土台が揃いました。

## 変更したこと

- `schemas/proposed/substackGrowthAction.ts` を削除し、`schemas/substackGrowthAction.ts` を新規作成。
  - `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントブロックを削除。
  - 参照先（`contentIdea` / `substackPublicationStrategy`）は既に active なので追加の互換性 fix は不要。
- `schemas/index.ts` に `import {substackGrowthAction} from './substackGrowthAction'` を追加。`schemaTypes` 配列末尾（`substackNotesPlan` の後）に1件追加。
- `seed/substack-growth-action-building-hitori-media-os.json` を新規作成。
  - `_id: substackGrowthAction.building-hitori-media-os.about-page-update`
  - `sourceContentIdea: contentIdea.building-hitori-media-os`
  - `publicationStrategy: substackPublicationStrategy.building-hitori-media-os`
  - `actionType: about-page-update`
  - `targetPlatform: substack`
  - `actionDescription`: About Page をHitori Media OS の開発ログとして整理する目的を具体的に記述
  - `expectedOutcome`: 初回訪問者の理解と期待値合わせ
  - `subscriberCTA`: この実験の続きを追いたい人は購読してください
  - `relatedPublishPackagePath: publish-packages/substack/building-hitori-media-os/`
  - `safetyNotes`: 自動投稿しない / Substack API 不使用 / subscribers個人情報を扱わない / Aboutの本文は人間が手動投入
  - `status: planned`
  - `resultNotes` は空（実施前）
- `schemas/proposed/README.md` の Activation Status テーブルを更新。`substackGrowthAction` を ACTIVATED に。Compatibility Note も「`substackGrowthAction` は追加 fix 不要」と記録。残り2本（SubscriberMilestone / PaidReadiness）が proposed-only である旨を再確認。

## 変更していないもの

- `sanity.config.ts`（`git diff` 空）。
- 既存スキーマ（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy / substackPostPlan / substackNotesPlan）。
- 残り2本の proposed スキーマファイル（substackSubscriberMilestone.ts / substackPaidReadiness.ts）。
- 既存 outputs / publish-packages / private / assets/visuals / 既存 seed。
- Sanity CLI（`sanity documents create` 未実行、`seed --replace` 未使用）。

## 理由

`substackGrowthAction` を4段目として活性化したのは、PostPlan / NotesPlan が揃った今、「Substack 上で何を手動でやったか」を Studio に記録する場所が必要だからです。

About Page 更新、Welcome Email 更新、Notes engagement、cross-post promotion、reply campaign、launch supporter outreach、Post followup の8種類の手動アクションを、ad-hoc メモではなく構造化レコードで蓄積できると、運用判断（次にどの施策が効くか）の振り返りに使えます。

残り2本（SubscriberMilestone / PaidReadiness）を引き続き proposed-only にしているのは、これらが「実際に subscribers が動き始めるか、paid化を真剣に検討する」段階で初めて必要になるからです。今の時点で Studio に増やしても入力対象がないため、UI を増やすコストの方が先に来てしまいます。

## 安全性の担保

- `sanity.config.ts` 未変更（diff 空）。
- Sanity CLI / direct write / `seed --replace` は一切使用していない。
- test seed JSON はローカル保存のみ。
- 残り2本の proposed スキーマは `schemas/proposed/` に残り、`schemas/index.ts` から import されていないため Studio registry に登場しない。
- 提案版（旧 `schemas/proposed/substackGrowthAction.ts`）の `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` コメントブロックは active 版から削除済み。
- 有料PDFの引用ゼロ。
- `safetyNotes` フィールドを seed で埋めて、「自動投稿しない / API 不使用 / 個人情報を扱わない」運用ルールをレコードレベルで明示。

## CodexとClaude Codeの役割分担

Claude Code が今回の活性化を担当。Codex には、Studio UI 手動確認と、X / Substack 公開後の最初の `substackGrowthAction` レコード（実施結果メモ付き）の運用テストを渡す想定。

## APIなしで済ませた理由

- スキーマ活性化と test seed 作成は、ローカルファイル編集だけで完結。
- LLM API、外部翻訳、Sanity API は一切呼んでいない。
- Studio UI 動作確認は人間が `npm run dev` で手動で行う想定。

## 発信コンテンツにできる切り口

- Substack 戦略レイヤー4本（PublicationStrategy / PostPlan / NotesPlan / GrowthAction）が active になり、手動施策ログまで Studio で扱えるようになった。
- Hitori Media OS の方針通り、SubscriberMilestone / PaidReadiness は急がずに proposed-only に残す判断。
- `safetyNotes` をスキーマに組み込み、「やらないこと」をレコードレベルで残す設計の話。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `git diff sanity.config.ts` → 空（未変更）
- `npm run build` → 7.5s で成功（4本 active 含む）
- `schemas/index.ts` を確認: `substackPublicationStrategy → substackPostPlan → substackNotesPlan → substackGrowthAction` の順で並ぶ。他2本の proposed スキーマは未import。
- `schemas/proposed/` に残るのは README.md + substackSubscriberMilestone.ts + substackPaidReadiness.ts のみ。

## 次にテストすること

1. 人間がローカルで `npm run dev` を起動し、Sanity Studio の document type 一覧に「Substack成長施策（Substack Growth Action）」が表示されることを確認する。
2. 新規作成画面で `actionType` の select / radio、`targetPlatform` の select、`dueDate` / `completedDate` の date picker、`status` radio、`safetyNotes` の text field が正しくレンダリングされるか確認する。
3. 必要なら `npx sanity documents create seed/substack-growth-action-building-hitori-media-os.json` でtest seedを投入し、`sourceContentIdea` / `publicationStrategy` の参照UIが解決するか確認する。`seed --replace` は使わない。
4. 違和感があれば `schemas/substackGrowthAction.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
5. 安定したら、`substackSubscriberMilestone` の活性化を、subscribers が実際に動き始めるタイミングで検討する。
