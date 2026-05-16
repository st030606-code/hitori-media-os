# Strategy Module: Substack Reader-List Engine

Date: 2026-05-14

## Purpose

このStrategy Moduleは、Hitori Media OSが1つのContent Ideaを、Substack中心のreader-list（subscriber）成長エンジンへ変換するための実装向け仕様です。

教材本文を貼り付けるドキュメントではなく、Content Idea / Campaign / Publish Package / Promptを動かすときに参照する内部運用モジュールとして扱います。

教材の抽象化メモは `docs/strategy-sources/substack-textbook-notes.md` にあります。

## Inputs

このモジュールが期待する入力:

- `contentIdea`（中心レコード）
- `targetReader`
- `positioningStatement`
- `coreTopics`（1〜3個）
- `platformOutputs`（既存のSubstack Post / Notes / Welcome Email / About Page draft）
- `visualAssetPlans`
- `campaignGoal`（discovery / nurture / paid readinessなど）
- `productionMode`（manual / ai-assisted / ai-generated）

## Outputs

- Substack Post draft
- Substack Notes drafts
- About Page draft
- Welcome Email draft
- subscriber CTA copy
- growth action checklist
- repurpose map（X / Threads / noteからSubstackへの流入設計）
- paid readiness notes（無料 / 有料の境界の現状判断）

## Workflow

1. **Define reader and positioning.** target reader、positioning statement、tone of voiceを1ページにまとめる。
2. **Decide 1–3 core topics.** 雑記publicationではなく、subscribeする理由が一文で言える状態にする。
3. **Create text-first campaign assets.** Substack Post、Notes、About Page、Welcome Emailを Content Ideaから生成する。
4. **Create Substack Post as trust / email / archive.** 信頼形成と配信を兼ねる主役。
5. **Create Notes for interaction / discovery.** Substack内の会話入口。Postsの予告 / 補足 / 質問にする。
6. **Align Welcome Email and About Page with positioning.** 新規subscriberが3秒で「ここは何のpublicationか」を理解できる状態にする。
7. **Route discovery platforms into Substack.** X / Threads / noteからSubstackへ自然な誘導を1本ずつ用意する。
8. **Track subscriber growth and replies manually.** 自動投稿はせず、growth actionを人間が記録する。
9. **Delay paid offer until readiness signals exist.** subscriberの反応、free postの再読率、返信や引用が安定してからpaidを検討する。

## Rules

- Substackをrepost先としてだけ扱わない。
- subscriber CTAなしでPostを公開しない。
- paid contentを急がない。
- 最強のpublic essayを最初からpaywallの中に置かない。
- auto-postしない。
- Sanity direct writeしない（Phase 2C以降の検討）。
- 教材本文の長文引用をdocs / package内に残さない。

## Current System Touchpoints

このモジュールが現在連携 / 影響する箇所:

- [docs/35-hitori-media-os-v0-2-architecture.md](../35-hitori-media-os-v0-2-architecture.md)
- [docs/36-substack-strategy-module.md](../36-substack-strategy-module.md)
- [docs/36-substack-content-os-pipeline.md](../36-substack-content-os-pipeline.md)
- [docs/37-substack-schema-extension-plan.md](../37-substack-schema-extension-plan.md)
- [prompts/substack-positioning.md](../../prompts/substack-positioning.md)
- [prompts/substack-about-page.md](../../prompts/substack-about-page.md)
- [prompts/substack-welcome-email.md](../../prompts/substack-welcome-email.md)
- [prompts/substack-post.md](../../prompts/substack-post.md)
- [prompts/substack-notes.md](../../prompts/substack-notes.md)
- [prompts/substack-growth-actions.md](../../prompts/substack-growth-actions.md)
- [publish-packages/substack/](../../publish-packages/substack/)
- [publish-packages/campaigns/](../../publish-packages/campaigns/)

## Future Schema Candidates

将来のSanity schemaとして検討する候補。本バッチでは追加実装はしない。

- **substackPublicationStrategy**: publicationのpositioning、core topics、voice / content / format、target readerを保存。
- **substackPostPlan**: 単一Postの目的、Notes連動、subscriber CTA、repurpose map、人間レビュー項目。
- **substackNotesPlan**: Notesの目的（discovery / interaction / Post predicate）、トピック、頻度、トーン。
- **substackGrowthAction**: 1週間〜1ヶ月単位のgrowth action（X cross-post、note引用、reply作戦など）と結果メモ。
- **substackSubscriberMilestone**: 10 / 50 / 100 / 500 / 1k subscribersなどの節目と、そこで起きた学び / 判断。
- **substackPaidReadiness**: paid化の判定材料（free postの読了率、replies、引用、subscriberの定性反応）。

## Open Questions

- Hitori Media OSのSubstackは1本のpublicationか、複数publicationを束ねるか。
- paid layerは将来「Hitori Media OSテンプレート」販売とどう関係させるか。
- subscriberのemail以外のowned channel（newsletter別配信、Discordなど）をいつ検討するか。

## Status

- 実装方針として有効。
- 対応するSanity schemaはまだ未追加。
- Publish Package BuilderのSubstack拡張は実装済み。
- 将来のdashboard連携時に再度refer する想定。
