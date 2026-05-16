# Devlog 0073: Activate substackNotesPlan (3rd Substack schema) + restore relatedNotesPlan

Date: 2026-05-14

## 今日の判断

`substackPostPlan` の Studio UI 確認が問題なく通ったので、proposed の残り4本のうち `substackNotesPlan` だけを **1本だけ** 追加活性化しました。同じバッチで、`substackPostPlan` の `relatedNotesPlan` フィールドを復元しています。

これで Substack 戦略レイヤーの3本（PublicationStrategy → PostPlan → NotesPlan）が active になり、PostPlan ↔ NotesPlan の往復参照も成立しました。残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only です。

## 変更したこと

- `schemas/proposed/substackNotesPlan.ts` を削除し、`schemas/substackNotesPlan.ts` を新規作成。
  - `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントブロックを削除。
  - 参照先（contentIdea / substackPostPlan / substackPublicationStrategy）は **すべて既に active** なので、追加の互換性 fix は不要。
- `schemas/index.ts` に `import {substackNotesPlan} from './substackNotesPlan'` を追加。`schemaTypes` 配列末尾（`substackPostPlan` の後）に1件追加。
- `schemas/substackPostPlan.ts` に `relatedNotesPlan` フィールドを復元（`subscriberCTA` と `repurposeNotes` の間に配置、optional reference）。一時削除を示す NOTE コメントは取り除いた。
- `seed/substack-notes-plan-building-hitori-media-os.json` を新規作成。
  - `_id: substackNotesPlan.building-hitori-media-os.first-post-notes`
  - `sourceContentIdea: contentIdea.building-hitori-media-os`
  - `relatedPostPlan: substackPostPlan.building-hitori-media-os.first-post`
  - `publicationStrategy: substackPublicationStrategy.building-hitori-media-os`
  - `notesPurpose: interaction`
  - `prePostNotes` 3本（_key付き object: question / build-log / lesson-learned）
  - `postLaunchNotes` 2本（_key付き object: post-launch / soft-cta）
  - `conversationPrompts` 2本
  - `ctaVariants` 3案
  - `humanReviewChecklist` 6項目
  - `status: ready-for-human-edit`
  - `reviewNotes` に初期test seedである旨を明記
- `seed/substack-post-plan-building-hitori-media-os.json` に `relatedNotesPlan` フィールドを追加。`substackNotesPlan.building-hitori-media-os.first-post-notes` への reference を持つ。他のフィールドは変更なし。
- `schemas/proposed/README.md` の Activation Status テーブルを更新。`substackNotesPlan` を ACTIVATED に。`Compatibility Note` を更新して `relatedNotesPlan` 復元のタイミングを明記。

## 変更していないもの

- `sanity.config.ts`（`git diff` 空）。
- 既存スキーマ（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy）。
- 残り3本の proposed スキーマファイル（substackGrowthAction.ts / substackSubscriberMilestone.ts / substackPaidReadiness.ts）。
- 既存 outputs / publish-packages / private / assets/visuals。
- Sanity CLI（`sanity documents create` 未実行、`seed --replace` 未使用）。

## 理由

`substackNotesPlan` を3段目として活性化したのは、`substackPostPlan` が active になった以上、Notes 計画を Post と切り離して管理する Sanity 側の置き場が必要だからです。

`substackPostPlan` の `relatedNotesPlan` を復元したのも同じ理由。PostPlan からNotes計画への参照は、Substack Notes Plan モジュール（`docs/strategy-modules/substack-strategy-module.md`）が前提とする「Post ↔ Notes」の往復関係を Sanity 上でも自然に表現するためです。

GrowthAction / SubscriberMilestone / PaidReadiness を引き続き proposed-only にしているのは、これらが「実際の Substack 公開 + subscriber が動き始めてから運用フィードバックを集める」段階で初めて必要になるレコードだからです。今の時点で UI を増やすと判断対象が広がりすぎます。

## 復元した `relatedNotesPlan` の詳細

- 配置: `subscriberCTA` と `repurposeNotes` の間に配置（関連 plan / repurpose / package fields に近い自然な位置）。
- 型: `reference` to `[{type: 'substackNotesPlan'}]`。
- optional（validation なし）。
- description: 「このPostに紐づくSubstack Notes計画。」

これで PostPlan と NotesPlan が `relatedNotesPlan` / `relatedPostPlan` を介して相互参照できる。

## 安全性の担保

- `sanity.config.ts` 未変更（diff 空）。
- Sanity CLI / direct write / `seed --replace` は一切使用していない。
- test seed JSON はローカル保存のみ。
- 残り3本の proposed スキーマは `schemas/proposed/` に残り、`schemas/index.ts` から import されていないため Studio registry に登場しない。
- 提案版（旧 `schemas/proposed/substackNotesPlan.ts`）の `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` コメントブロックは active 版から削除済み。
- 有料PDFの引用ゼロ。

## CodexとClaude Codeの役割分担

Claude Code が今回の活性化を担当。Codex には、Studio UI 手動確認と、`substackGrowthAction` の活性化タイミング判断（X / Substack 公開 + subscribers が動いてから）を渡す想定。

## APIなしで済ませた理由

- スキーマ活性化と test seed 作成、`relatedNotesPlan` の復元は、ローカルファイル編集だけで完結。
- LLM API、外部翻訳、Sanity API は一切呼んでいない。
- Studio UI 動作確認は人間が `npm run dev` で手動で行う想定。

## 発信コンテンツにできる切り口

- スキーマを1本ずつ活性化し、依存関係（reference）が成立した時点で関連フィールドを復元する設計。
- Hitori Media OS の Substack 戦略レイヤーが3層（PublicationStrategy → PostPlan → NotesPlan）で揃ったタイミング。
- 残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）を proposed のまま残す理由（運用が始まってから必要になる）を明文化。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `git diff sanity.config.ts` → 空（未変更）
- `npm run build` → 7.8s で成功（PublicationStrategy + PostPlan + NotesPlan 3本 active 含む）
- `schemas/index.ts` を確認: `substackPublicationStrategy → substackPostPlan → substackNotesPlan` の順で並ぶ。他3本の proposed スキーマは未import。
- `schemas/proposed/` に残るのは README.md + substackGrowthAction.ts + substackSubscriberMilestone.ts + substackPaidReadiness.ts。

## 次にテストすること

1. 人間がローカルで `npm run dev` を起動し、Sanity Studio の document type 一覧に「Substack Notes計画（Substack Notes Plan）」が表示されることを確認する。
2. 新規作成画面で `prePostNotes` / `postLaunchNotes` の object array（noteType radio + body text）、`conversationPrompts` / `ctaVariants` / `humanReviewChecklist` の string array、`status` radio が正しくレンダリングされるか確認する。
3. `substackPostPlan` の編集画面で復元された `relatedNotesPlan` フィールドが表示され、Notes Plan reference を選択できるか確認する。
4. 必要なら `npx sanity documents create seed/substack-notes-plan-building-hitori-media-os.json` でtest seedを投入し、`relatedPostPlan` 参照が解決するか確認する。
5. 違和感があれば `schemas/substackNotesPlan.ts` または `schemas/substackPostPlan.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
6. 安定したら、`substackGrowthAction` を同じ手順で1本だけ活性化する別バッチを検討。
