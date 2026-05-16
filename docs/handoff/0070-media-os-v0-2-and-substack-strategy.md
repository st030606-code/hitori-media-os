# Handoff: Media OS v0.2 and Substack Strategy

Date: 2026-05-14

## 1. Task Goal

Content OSをplatform-output toolからHitori Media OS v0.2へ進化させ、text / visual / video / audio / Substack / social / future sales contentを統合的に扱う設計とローカル実装を追加する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 実動画/音声/画像ファイルは生成していない。
- destructive overwriteは実行していない。

## 3. Changed Files

- `README.md`
- `tools/publish-package-builder/build.mjs`
- `tools/local-check.mjs`
- `docs/26-phase-1-known-backlog.md`
- `docs/30-next-phase-plan.md`
- `docs/32-publish-package-builder.md`
- `docs/35-hitori-media-os-v0-2-architecture.md`
- `docs/36-substack-strategy-module.md`
- `docs/37-recommended-schema-extensions-media-os.md`
- `docs/38-video-audio-asset-planning.md`
- `docs/39-strategy-module-ingestion-workflow.md`
- `docs/40-this-week-completion-roadmap.md`
- `docs/devlog/0058-media-os-v0-2-and-substack-strategy.md`
- `docs/handoff/latest.md`
- `docs/handoff/0070-media-os-v0-2-and-substack-strategy.md`
- `seed/video-asset-plan-examples.json`
- `seed/audio-asset-plan-examples.json`
- `prompts/youtube-longform-script.md`
- `prompts/shorts-script.md`
- `prompts/podcast-script.md`
- `prompts/instagram-carousel.md`
- `prompts/cross-platform-campaign.md`
- `publish-packages/substack/ai-blog-db/`
- `publish-packages/threads/ai-blog-db/`
- `publish-packages/shorts/ai-blog-db/`
- `publish-packages/podcast/ai-blog-db/`

## 4. Summary of Changes

Hitori Media OS v0.2 architectureを追加しました。Substackをreader-list / publication strategy moduleとして再定義し、video/audio asset planning、strategy module ingestion、this-week roadmap、prompt templates、publish package拡張を追加しました。

Validationとして、`node --check`、`npm run local:check`、`npm run publish:package`、`npm run build` は成功しました。

## 5. Key Decisions

- Substackは単なるplatformOutputではなく、publication / email / Notes / archive / subscriber assetとして扱う。
- Video/AudioはplatformOutput内ではなく、Asset Planとして別管理する設計にする。
- Strategy Moduleを導入し、購入教材やPDFをworkflow/checklist/prompt/schema recommendationへ変換する。
- Publish Package BuilderはSubstack / Threads / Shorts / Podcastを追加するが、投稿やAPI連携はしない。
- Schema実装はdocs-firstで、videoAssetPlan/audioAssetPlanはseed例に留める。

## 6. Human Review Questions

- Hitori Media OS v0.2という呼び方で進めてよいか。
- video/audio asset planは次にschema化するべきか、もう少しseed/docsで検証するべきか。
- Strategy ModuleはSanity schemaとして早めに実装するべきか。
- 次のdemo campaignは `ai-blog-db` のままでよいか。

## 7. Risks or Uncertainties

- 同じ番号帯の旧Substack docsも残っているため、後でdocs indexを整理すると読みやすくなる。
- Publish Package Builderは既存fileを上書きしないため、古いpackage fileが残る可能性がある。
- PDF本文の長文引用は避けており、教材内容は戦略モジュールとして抽象化している。

## 8. Recommended Next Step

`prompts/cross-platform-campaign.md` を使って、`ai-blog-db` のv0.2 demo campaign packageを人間レビュー可能な形に整える。

## 9. Exact Prompt to Give Codex Next

```text
Create the first Hitori Media OS v0.2 demo campaign package for ai-blog-db.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not write directly to Sanity.
Do not run seed --replace.
Do not auto-post.
Do not generate new media files.

Use:
- prompts/cross-platform-campaign.md
- docs/35-hitori-media-os-v0-2-architecture.md
- docs/36-substack-strategy-module.md
- seed/video-asset-plan-examples.json
- seed/audio-asset-plan-examples.json
- publish-packages/

Create a local campaign plan under docs or publish-packages that ties together note, Substack, X, Threads, Instagram, YouTube, Shorts, and Podcast for ai-blog-db.
Keep it as a human-review draft.
```
