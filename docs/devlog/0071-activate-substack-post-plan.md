# Devlog 0071: Activate substackPostPlan (2nd Substack schema)

Date: 2026-05-14

## 今日の判断

`substackPublicationStrategy` の Studio UI 確認が問題なく通ったので、proposed の残り5本のうち `substackPostPlan` だけを **1本だけ** 追加で活性化しました。残り4本（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。

これは `schemas/proposed/README.md` の Activation Checklist に従った、2回目の段階的活性化バッチです。

## 変更したこと

- `schemas/proposed/substackPostPlan.ts` を削除し、`schemas/substackPostPlan.ts` を新規作成。
  - `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントブロックを削除。
  - **小さな互換性 fix**: 元の `relatedNotesPlan`（`substackNotesPlan` への reference）フィールドを一時的に削除。`substackNotesPlan` が proposed-only のまま `schemas/index.ts` に登録されていないため、未登録 type への reference は Studio 起動時にエラーになる可能性があるため。NOTE コメントで再追加タイミング（`substackNotesPlan` 活性化時）を明記。
- `schemas/index.ts` に `import {substackPostPlan} from './substackPostPlan'` を追加。`schemaTypes` 配列に `substackPublicationStrategy` の次へ entry を1件追加（順序維持: reference 先が先）。
- `seed/substack-post-plan-building-hitori-media-os.json` を新規作成。
  - `_id: substackPostPlan.building-hitori-media-os.first-post`
  - `sourceContentIdea: contentIdea.building-hitori-media-os`
  - `publicationStrategy: substackPublicationStrategy.building-hitori-media-os`
  - `campaignSlug: building-hitori-media-os`
  - `titleOptions` 3案 / `emailSubjectOptions` 3案 / `previewText` / `openingAngle`
  - `mainSections` 3 ブロック（なぜ仕組みを作るか / Content Idea / 自動化は最後）
  - `readerQuestion`、`subscriberCTA`、`repurposeNotes`、`publishPackagePath`、`humanReviewChecklist`（6項目）
  - `status: ready-for-human-edit`
  - `reviewNotes` に初期test seedである旨を明記
- `schemas/proposed/README.md` の Activation Status テーブルを更新。`substackPostPlan` を ACTIVATED に変更、`Compatibility Note` 節を追加して `relatedNotesPlan` の一時削除と再追加方針を記録。

## 変更していないもの

- `sanity.config.ts`（`git diff` 空）。
- 既存スキーマ（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy）。
- 残り4本の proposed スキーマファイル。
- 既存 outputs / publish-packages / private / assets/visuals / seed（既存ファイル一切）。
- Sanity Studio への CLI 操作（`sanity documents create` は未実行、`seed --replace` も未使用）。

## 理由

`substackPublicationStrategy` を1段目として土台にしたあと、Post 単位の計画レイヤーを早めに足したのは、Substack 公開作業の手前で Studio に「実際に書く対象」が必要だからです。

PublicationStrategy だけでは、publication全体の枠組みは扱えますが、1本のPostの計画（title options / email subject / preview / opening / sections / repurpose）を保存する場所がありません。Post 単位を Studio に持つことで、building-hitori-media-os の Substack 1本目の公開準備を Studio 側でも揃えられるようになります。

NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness は引き続き proposed-only。理由:

- NotesPlan: Post を1本公開してから Notes plan の運用感を見たい。
- GrowthAction: subscriber が増え始めてから運用ログとして必要になる。
- SubscriberMilestone: 数値マイルストーンが見えてから。
- PaidReadiness: paid化はまだ判断していない。

Studio UI を毎回1本ずつ確認できる体制を維持するため、急がない。

## 互換性 fix の詳細

元の `substackPostPlan` には `relatedNotesPlan` というフィールドがありました:

```ts
defineField({
  name: 'relatedNotesPlan',
  title: '関連Notes計画（Related Notes Plan）',
  type: 'reference',
  to: [{type: 'substackNotesPlan'}],
}),
```

`substackNotesPlan` が `schemas/index.ts` に登録されていない状態でこの reference を残すと、Sanity Studio が「schema type 'substackNotesPlan' not found」相当のエラーで止まる可能性があります。

`schemas/proposed/README.md` の Activation Checklist が許容する "TypeScript/build requires small fixes" の範囲として、このフィールドだけ一時的に削除しました。

```ts
// NOTE: `relatedNotesPlan` (reference -> substackNotesPlan) は、
// substackNotesPlan が active になったタイミングで再追加する想定。
// 現在は substackNotesPlan が proposed-only のため、活性化済みスキーマの中で
// 未登録の type を参照しないようフィールドを一時的に省略している。
```

将来 `substackNotesPlan` を活性化したときに、このフィールドだけを `schemas/substackPostPlan.ts` に戻すフローを `schemas/proposed/README.md` に明記しました。

## 安全性の担保

- `sanity.config.ts` 未変更（diff空）。
- Sanity CLI / direct write / `seed --replace` は一切使用していない。
- test seed JSON はローカル保存のみ。Studio への投入は人間が手動で `npx sanity documents create` を判断したときに初めて行う。
- 残り4本の proposed スキーマは `schemas/proposed/` に残り、`schemas/index.ts` から import されていないため、Studio registry に登場しない。
- 提案版（旧 `schemas/proposed/substackPostPlan.ts`）の `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` コメントブロックは、active 版から削除済み。
- 有料PDFの引用ゼロ。

## CodexとClaude Codeの役割分担

Claude Code が今回の活性化を担当。Codex には、Studio UI 手動確認と、`substackNotesPlan` の活性化タイミング判断、`relatedNotesPlan` フィールドを `substackPostPlan` に戻すリファクタを渡す想定。

## APIなしで済ませた理由

スキーマ活性化と test seed 作成は、ローカルファイル操作 + `schemas/index.ts` 1ファイルの編集 + 互換性 fix の小さな修正だけで完結。LLM API、外部翻訳、Sanity API は一切呼んでいません。

## 発信コンテンツにできる切り口

- スキーマを1本ずつ活性化することで、Studio UI を逐次確認できる安心感。
- 「未登録 type への reference」を一時 fix で外し、活性化順を制御する設計判断。
- building-in-public 視点: 「次に必要になった schema を1本だけ追加する」のがHitori Media OS らしい運用。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `git diff sanity.config.ts` → 空（未変更）
- `npm run build` → 7.4s で成功（新規スキーマ含む）
- `schemas/index.ts` を確認: `substackPublicationStrategy` の後に `substackPostPlan` が並ぶ。他4本の proposed スキーマは未import。
- `schemas/proposed/` に残るのは README.md + substackNotesPlan.ts + substackGrowthAction.ts + substackSubscriberMilestone.ts + substackPaidReadiness.ts の5項目（README.md と4スキーマ）。

## 次にテストすること

1. 人間がローカルで `npm run dev` を起動し、Sanity Studio の document type 一覧に「Substack Post計画（Substack Post Plan）」が表示されることを確認する。
2. 新規作成画面で各フィールド（titleOptions 配列、emailSubjectOptions 配列、mainSections の object array、status radio）が正しくレンダリングされるか確認する。
3. 必要なら `npx sanity documents create seed/substack-post-plan-building-hitori-media-os.json` でtest seedを投入し、`sourceContentIdea` / `publicationStrategy` の参照UIが解決できるか確認する。
4. 違和感があれば `schemas/substackPostPlan.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
5. 安定したら、`substackNotesPlan` を同じ手順で1本だけ活性化する別バッチを検討。その際 `substackPostPlan` の `relatedNotesPlan` フィールドを再追加する。
