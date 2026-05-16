# Substack Schema Extension Plan

日付: 2026-05-14

このドキュメントは、SubstackをContent OSの中核レイヤーとして扱うためのSanity schema拡張案です。

このタスクではTypeScript schemaは実装しません。

## MVP候補

### substackPublicationStrategy

Purpose:

- Publication全体のpositioning、target reader、core topicsを管理する。

Fields:

- title
- targetReader
- positioningStatement
- coreTopics
- notFor
- readerPromise
- voice
- contentStyle
- formatRules
- freeRole
- paidRole
- cadence
- status

### substackProfileAsset

Purpose:

- Substack profile、bio、profile image方針、linksを管理する。

Fields:

- publicationName
- shortBio
- longBio
- profileImagePlan
- links
- keywords
- status

### substackAboutPage

Purpose:

- About Pageの構成と下書きを管理する。

Fields:

- publicationStrategy
- headline
- readerProblem
- promise
- topics
- whySubscribe
- draftBody
- status

### substackWelcomeEmail

Purpose:

- subscribe直後に届くWelcome Emailを管理する。

Fields:

- publicationStrategy
- subject
- opening
- whatToExpect
- bestPosts
- replyPrompt
- cta
- draftBody
- status

## Phase 2候補

### substackPostPlan

Purpose:

- 1本のSubstack Postを、Post単体ではなくpublication strategyに紐づけて計画する。

Fields:

- sourceContentIdea
- publicationStrategy
- targetReader
- postAngle
- titleOptions
- socialPreviewImagePlan
- subscribeCta
- tags
- commentSetting
- deliverySetting
- scheduledTime
- relatedPlatformOutputs
- status

### substackNotesPlan

Purpose:

- Postの前後で使うSubstack Notes案を管理する。

Fields:

- sourceContentIdea
- relatedPostPlan
- noteType
- noteText
- conversationPrompt
- targetReader
- status

### substackGrowthAction

Purpose:

- Notes投稿、他publicationへの反応、X/noteからの誘導などの成長施策を記録する。

Fields:

- actionType
- relatedContentIdea
- target
- actionDate
- outcome
- learnings
- nextAction

## Phase 3候補

### substackSubscriberMilestone

Purpose:

- subscriber数や節目ごとの学びを記録する。

Fields:

- subscriberCount
- reachedAt
- mainSource
- bestPerformingTopics
- learnings
- nextGoal

### substackPaidReadiness

Purpose:

- paid化してよいかを判断するための準備状態を管理する。

Fields:

- publicationStrategy
- subscriberCount
- engagementSignals
- paidOfferIdea
- freePaidBoundary
- risks
- readinessStatus
- reviewNotes

## Relationship To Existing Schemas

既存:

- `contentIdea`: 元の知識レコード
- `platformOutput`: Substack Post下書きも格納可能
- `prompt`: Substack用promptを格納可能
- `workflow`: Substack運用workflowを記録可能
- `publishedOutput`: 公開後URLや学びを格納可能

追加候補:

- publication戦略は `contentIdea` の中に入れない
- Post計画は `platformOutput` だけに押し込まない
- Notesやgrowth actionは独立させる

## Implementation Order

1. promptsとdocsで運用検証する。
2. publish packageにSubstack folderを追加する。
3. `substackPublicationStrategy` を最初に実装する。
4. About Page / Welcome Emailを追加する。
5. PostPlan / NotesPlanへ進む。
6. subscriber milestone / paid readinessは後回しにする。
