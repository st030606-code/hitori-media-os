# Recommended Schema Extensions for Hitori Media OS

日付: 2026-05-14

このドキュメントは、Hitori Media OS v0.2以降で検討するSanity schema拡張案です。

このタスクではschema codeは実装しません。

## MVP / Near-Term

### videoAssetPlan

Purpose:

- YouTube long-form、Shorts、Instagram Reel、screen recordingなどの動画制作計画を管理する。

Key fields:

- sourceContentIdea
- platform
- assetType
- productionMode
- scriptPath
- expectedLocalAssetPath
- status
- notes
- safetyNotes
- publishPackagePath

References:

- contentIdea
- platformOutput
- visualAssetPlan
- tool

Status lifecycle:

- planned
- script-ready
- shot-needed
- edit-needed
- exported
- reviewed
- packaged
- published

Production modes:

- human-shot
- ai-generated
- hybrid
- screen-recording
- b-roll-plus-narration

Why it matters:

- Videoはtext outputとは制作工程が違うため、platformOutputだけでは重い。

Implement now:

- Backlog。まずseed例とdocsで検証する。

### audioAssetPlan

Purpose:

- Podcast、human-recorded audio、AI clone voice、TTS draftなどの音声制作計画を管理する。

Key fields:

- sourceContentIdea
- platform
- assetType
- productionMode
- scriptPath
- expectedLocalAssetPath
- status
- notes
- safetyNotes
- publishPackagePath

References:

- contentIdea
- platformOutput
- tool

Status lifecycle:

- planned
- script-ready
- recording-needed
- generated-needs-review
- edited
- reviewed
- packaged
- published

Production modes:

- human-recorded
- ai-clone
- tts
- podcast-import

Why it matters:

- 音声は権利、声、品質確認が重要で、textとは別の安全メモが必要。

Implement now:

- Backlog。まずseed例とdocsで検証する。

### campaignPlan

Purpose:

- 1つのContent Ideaから複数媒体へ展開する順番と目的を管理する。

Key fields:

- sourceContentIdea
- campaignName
- targetReader
- primaryCTA
- platforms
- sequence
- publishPackages
- status
- reviewNotes

References:

- contentIdea
- platformOutput
- visualAssetPlan
- videoAssetPlan
- audioAssetPlan

Status lifecycle:

- planned
- package-building
- ready-for-review
- publishing
- completed
- archived

Production mode:

- manual
- assisted
- future-api

Why it matters:

- Content OSを単発出力ではなくcampaign運用に変えるため。

Implement now:

- Near-term候補。

### strategyModule

Purpose:

- 購入教材、PDF、Brain記事、実験ログから抽出した戦略を管理する。

Key fields:

- title
- sourceType
- sourceName
- summary
- principles
- checklists
- promptRecommendations
- schemaRecommendations
- workflowChanges
- copyrightNotes
- status

References:

- contentIdea
- workflow
- prompt

Status lifecycle:

- captured
- summarized
- converted-to-prompts
- converted-to-workflow
- tested
- archived

Production mode:

- manual
- ai-assisted

Why it matters:

- 新しい教材を買うたびに、Content OSが育つ構造にするため。

Implement now:

- Near-term候補。

### substackStrategy

Purpose:

- Substack publication、Notes、Post、subscriber growthをまとめて管理する。

Key fields:

- publicationName
- targetReader
- positioningStatement
- coreTopics
- voice
- contentFormats
- freeRole
- paidRole
- notesStrategy
- postStrategy
- welcomeEmailPath
- aboutPagePath
- subscriberGoal
- status

References:

- contentIdea
- strategyModule
- platformOutput

Status lifecycle:

- draft
- reviewed
- active
- improving
- archived

Production mode:

- manual
- ai-assisted

Why it matters:

- Substackは単なるplatformOutputではなく、reader-list layerだから。

Implement now:

- 最初のSubstack専用schema候補。

### substackGrowthAction

Purpose:

- Notes投稿、Post公開、X/note導線、subscriber goalの成長アクションを記録する。

Key fields:

- strategy
- actionType
- relatedContentIdea
- actionDate
- channel
- expectedOutcome
- actualOutcome
- learnings
- nextAction

References:

- substackStrategy
- contentIdea
- platformOutput

Status lifecycle:

- planned
- done
- reviewed
- learned

Production mode:

- manual
- assisted

Why it matters:

- subscriber growthを感覚ではなく学習ログにするため。

Implement now:

- Backlog。まずdocs/promptで運用する。

## Later

### subscriberMilestone

Purpose:

- 100人、300人、1000人などの節目と学びを記録する。

Implement:

- Phase 3

### paidOfferPlan

Purpose:

- paid article、course、template、backstage passのoffer設計を管理する。

Implement:

- Phase 3

### resultMetric

Purpose:

- 公開後の反応、流入、保存、購読、売上などを記録する。

Implement:

- Phase 3

### contentExperiment

Purpose:

- 見出し、CTA、フォーマット、投稿順などの実験を管理する。

Implement:

- Phase 3

### learningSource

Purpose:

- Strategy Moduleの元になった教材やPDFを記録する。

Implement:

- Phase 2/3。copyrightNotes必須。
