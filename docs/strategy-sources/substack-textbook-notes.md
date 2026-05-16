# Substack Textbook Notes

Date: 2026-05-14

## Source

- Local-only source: `private/sources/substack/substack-textbook-brain-2026-04-30.pdf`
- Type: paid Brain PDF (Substackの教科書)
- Usage: strategy extraction only
- Do not commit original PDF
- Do not paste long verbatim passages from the source
- Do not include screenshots, copied tables, or paid download links

`private/` は `.gitignore` で除外されています。このメモは購入教材を「Hitori Media OSの内部戦略」として抽象化したものです。本文の長文引用ではなく、自分の運用に落とすための判断材料として書きます。

## Executive Summary

- Substackは単なる投稿先ではなく、publication / email delivery / Notes（社内的なSNS） / archive / subscriber relationshipが一体化したプラットフォーム。
- メインの資産はフォロワー数ではなく、subscribers / reader list（emailで届く関係）。
- X / Threadsはdiscovery（発見）に向く。
- noteは日本語検索 / archive / 信頼形成に向く。
- Substack Postsはdeeper trust、email delivery、archiveに向く。
- Substack Notesはinteraction、discovery、relationship buildingに向く。
- paid contentは急がない。free public workで信頼を作ったあと、paidはbackstage-pass型のレイヤーとして加える。

## Core Principles

1. Build owned reader relationships. (timeline依存ではなく、emailで届く関係を作る)
2. Treat subscribers as the main media asset.
3. Separate follow and subscribe behavior. (followは関心、subscribeはemail受信)
4. Use Notes and Posts differently. (Notesは会話、Postsは信頼形成)
5. Keep profile / About / Welcome Email aligned with positioning.
6. Start with a narrow target reader and a clear positioning statement.
7. Use 1–3 core topics, not a generic personal blog.
8. Differentiate through Voice / Content / Format.
9. Treat free content as the best public work, not the leftovers.
10. Treat paid content as later-stage deeper access, not paywalled marketing.
11. Use external platforms (X / Threads / note / YouTube) to route attention into Substack.
12. Use a consistent publication rhythm.
13. Use launch supporters and small network effects early.
14. Make repurposing from note / X / Threads into Substack easy.
15. Review growth data and improve based on subscriber paths.

## Hitori Media OS Implications

- Substackは `platformOutput` の一種としてだけ扱わず、**Strategy Module** として独立させる。
- Content OSは1つのContent Ideaから、Substack Post、Substack Notes、About Page、Welcome Email、subscriber CTA、growth actionまで一貫して生成できるようにする。
- Publish Package BuilderはSubstack専用ファイル群（notes.md、about-page.md、welcome-email.md、title-options.md、social-preview-image.md、subscribe-cta.md、repurpose-map.md、checklist.md）を持つ（実装済）。
- Campaign packageには、subscriber CTAとNotes follow-up planを含める。
- 将来のSanity schema候補:
  - `substackPublicationStrategy`
  - `substackPostPlan`
  - `substackNotesPlan`
  - `substackGrowthAction`
  - `substackSubscriberMilestone`
  - `substackPaidReadiness`

## Pipeline Changes

- X / Threads = discovery and conversation
- note = long-form Japanese credibility / search / archive
- Substack Post = trust, email, archive, subscriber asset
- Substack Notes = Substack-native interaction / discovery
- YouTube / Podcast = deeper trust and personality
- Instagram = visual explanation and reach
- Paid = later-stage backstage pass / product layer

## Prompt Inputs Needed

Strategy Moduleとプロンプトに渡す入力項目:

- `targetReader`
- `positioningStatement`
- `coreTopics`（1〜3個）
- `voiceContentFormat`（差別化軸）
- `freePaidRole`（無料 / 有料の役割定義）
- `campaignCoreMessage`
- `subscriberCTA`
- `notesFollowUpPlan`
- `aboutPageDirection`
- `welcomeEmailDirection`

## Implementation Backlog

- `substackPublicationStrategy` schema
- `substackAboutPage` asset
- `substackWelcomeEmail` asset
- `substackNotesPlan`
- `substackPostPlan`
- `substackGrowthAction`
- `substackSubscriberMilestone`
- `substackPaidReadiness`
- Substack publish package polish（既存ファイル群のUX改善）
- manual publishing checklistのSubstack専用拡張
- 将来のNext.js dashboard連携（Substack KPIビュー）

## What This Notes File Is Not

- 教材本文のコピーではない。
- 教材のリプリント / 再配布ではない。
- 教材へのリンクや購入導線でもない。
- 著作権で保護された具体的な数値、引用、テンプレート文を含めない。

教材の中身を確認したい場合は、購入者本人がローカルの `private/sources/substack/...` を直接開いてください。
