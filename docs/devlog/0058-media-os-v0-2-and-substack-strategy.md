# Media OS v0.2 and Substack Strategy

日付: 2026-05-14

## 背景

Phase 1 MVPとPhase 2Aのlocal-first toolingを土台に、Content OSをHitori Media OS v0.2へ拡張しました。

目的は、platformOutputを増やすだけではなく、ひとつのContent Ideaをtext、visual、video、audio、Substack、note、X、Threads、Instagram、YouTube、Shorts、Podcast、future sales / education contentへ展開するmedia campaignとして扱うことです。

## 決定・変更

- `docs/35-hitori-media-os-v0-2-architecture.md` を追加しました。
- `docs/36-substack-strategy-module.md` を追加しました。
- `docs/37-recommended-schema-extensions-media-os.md` を追加しました。
- `docs/38-video-audio-asset-planning.md` を追加しました。
- `docs/39-strategy-module-ingestion-workflow.md` を追加しました。
- `docs/40-this-week-completion-roadmap.md` を追加しました。
- video/audio asset planのseed例を追加しました。
- YouTube、Shorts、Podcast、Instagram、cross-platform campaignのpromptを追加しました。
- Publish Package BuilderをSubstack / Threads / Shorts / Podcastへ拡張しました。
- README、backlog、next phase planをv0.2に合わせて更新しました。

## Substack Strategy

Substackは、単なるplatform outputではなく、publication、email、Notes、archive、subscriber assetとして扱います。

X / Threadsはdiscovery、noteは日本語search/archive、Substack Notesはinteraction/discovery、Substack Postはtrust/email/archiveとして役割を分けます。

paid contentは、初期の売り物ではなく、later-stageのbackstage passとして扱います。

## Video / Audio Planning

videoAssetPlan / audioAssetPlanはまだschema実装していません。

まずseed例として、次を追加しました。

- `seed/video-asset-plan-examples.json`
- `seed/audio-asset-plan-examples.json`

Production modes:

- human-shot
- ai-generated
- hybrid
- screen-recording
- b-roll-plus-narration
- human-recorded
- ai-clone
- tts
- podcast-import

## Publish Package Expansion

`npm run publish:package` は、既存のnote / x / instagram / github / youtubeに加えて、次を扱います。

- substack
- threads
- shorts
- podcast

既存fileは上書きせず、足りない素材はTODOとして扱います。

## Strategy Module Ingestion

購入教材やPDFは、本文を長くコピーせず、strategy moduleとして抽象化します。

変換先:

- checklist
- prompt templates
- schema recommendations
- workflow changes
- publish package additions

## 意図的にやっていないこと

- Next.js dashboard
- Sanity direct write
- OpenAI / Anthropic API client
- image generation API
- auto-posting
- seed replace
- 実動画/音声ファイル生成

## 検証

- `node --check tools/visual-register/server.mjs`
- `node --check tools/visual-register/public/app.js`
- `node --check tools/publish-package-builder/build.mjs`
- `node --check tools/local-check.mjs`
- `npm run local:check`
- `npm run publish:package`
- `npm run build`

すべて成功しました。

`npm run publish:package` は、Substack / Threads / Shorts / Podcastのpackage targetを含めて成功しました。既存fileは上書きせず、`skipped` として扱われました。

## 次の一手

次の大きなバッチでは、v0.2のdemo campaignを1つ選び、cross-platform campaign promptを使って、実際のpublish packageを人間レビュー可能な形へ磨き込みます。
