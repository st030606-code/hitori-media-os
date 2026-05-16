# Devlog 0067: Proposed Substack Strategy Schemas (read-only sketches)

Date: 2026-05-14

## 今日の判断

Substack 戦略レイヤー用の Sanity スキーマを、`schemas/proposed/` 配下に **read-only 提案** として6本＋README で追加しました。`schemas/index.ts` にも `sanity.config.ts` にも一切登録していません。Studio には何も新規追加されていません。

抽象化メモ（`docs/strategy-sources/substack-textbook-notes.md`）と実装向けStrategy Module（`docs/strategy-modules/substack-strategy-module.md`）の整備直後、勢いで Studio に新スキーマを足してしまうのを防ぎ、人間レビューを通してから段階的に活性化できる状態を作るのが目的です。

## 変更したこと

新規:

- `schemas/proposed/substackPublicationStrategy.ts`
- `schemas/proposed/substackPostPlan.ts`
- `schemas/proposed/substackNotesPlan.ts`
- `schemas/proposed/substackGrowthAction.ts`
- `schemas/proposed/substackSubscriberMilestone.ts`
- `schemas/proposed/substackPaidReadiness.ts`
- `schemas/proposed/README.md`
- `docs/devlog/0067-proposed-substack-strategy-schemas.md`
- `docs/handoff/0079-proposed-substack-strategy-schemas.md`

未変更（確認済）:

- `schemas/index.ts`
- `sanity.config.ts`

`git diff schemas/index.ts sanity.config.ts` は空でした。提案スキーマは Studio に読み込まれません。

## 各提案スキーマの目的

- **substackPublicationStrategy**: publication全体のpositioning、Voice/Content/Format、Notes・Posts・free・paidの役割、About / Welcome / subscriber CTAを束ねる土台。`contentIdea` を `sourceContentIdea` / `relatedContentIdeas` で参照する。
- **substackPostPlan**: Post単体の計画。titleOptions、emailSubjectOptions、previewText、openingAngle、mainSections、readerQuestion、subscriberCTA、publishPackagePath、humanReviewChecklistを持ち、`platformOutput` よりも上位の戦略レイヤーとして扱う。
- **substackNotesPlan**: Post単位のNotes計画。prePost / postLaunch / conversationPrompts / ctaVariantsを独立して持ち、Postと役割が混ざらないように分離。
- **substackGrowthAction**: 手動growth actionログ。actionType（profile-update / about-page-update / notes-engagement / cross-post-promotion / reply-campaign など）、期待成果、結果メモ、安全メモを持つ。subscriber個人情報を扱わないことを `safetyNotes` で明記。
- **substackSubscriberMilestone**: マイルストーン記録（10/50/100/500/1000）。数値は手動入力。subscriberSourcesは Source × 推定数 × メモ。
- **substackPaidReadiness**: paid化判断。trustSignals、audienceQuestions、repeatedDemandSignals、candidatePaidOffer、freePaidBoundary、readinessLevel、readinessScore、reasonsToWait、nextValidationActionsで構成。「急がない」を仕組みで残す。

## なぜ Studio に読み込まないか

Hitori Media OSは「人間が判断しながら進めるContent OS」を方針にしています。`contentIdea` を汚さずに Substack 戦略を扱う設計は重要ですが、6本まとめて Studio に投入すると:

- 同時に複数 UI が増えて、運用判断が雑になる
- フィールド命名の細部のミスが運用後に判明する
- seed / 既存データとの整合が確認できないまま使ってしまう

ため、まず提案として置き、`schemas/proposed/README.md` のActivation Checklist（1ファイルずつ、`substackPublicationStrategy` から、build → dev → test seed → 確認 → 次へ）に沿って人間が段階的に有効化していきます。

## 安全性の担保

- `schemas/index.ts` を変更していない。
- `sanity.config.ts` を変更していない。
- Sanity CLI、`seed --replace`、direct write、外部API、auto-postingは一切呼んでいない。
- 有料PDFの本文をコピーしていない。
- 各提案ファイルの先頭に `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントを付け、誤って `schemaTypes` に登録されないようにした。

## CodexとClaude Codeの役割分担

今回はClaude Codeで提案6本を生成しました。Codex 側は人間レビュー結果を受けて、`substackPublicationStrategy` を最初に活性化するかどうかの判断と、seed JSON の最小サンプル作成に回す想定です。

## APIなしで済ませた理由

LLM API / ベクトル化 / 外部翻訳は不要。Strategy Module の仕様を `defineType` / `defineField` の構造に手で写すだけで完結します。Sanity API も叩いていません。Studio で動かさないため、project ID / token も不要です。

## 発信コンテンツにできる切り口

- 「提案スキーマ」を `schemas/proposed/` に置く設計そのものが、Hitori Media OSらしい運用判断（活性化を急がない）。
- Substack を `platformOutput` の中に押し込まない理由。
- paid readiness を Sanity schemaで「急がない理由を残す」ことの意味。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run build` → 7.5s で成功（提案スキーマが Studio bundle に影響していない）
- `git diff schemas/index.ts sanity.config.ts` → 空（未変更）

## 次にテストすること

1. `schemas/proposed/README.md` の Activation Checklist を人間が読み、フィールド設計に違和感がないかレビュー。
2. もし違和感があれば、`schemas/proposed/*.ts` を再修正（運用ルール上、`schemas/index.ts` を触らないので副作用ゼロ）。
3. レビュー完了後、最初に活性化するのは `substackPublicationStrategy` の想定。`schemas/index.ts` への import + `schemaTypes` 追加 → `npm run build` → `npm run dev` → 手動 seed → 確認、の順で1ファイルだけ進める。
