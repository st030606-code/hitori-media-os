# Handoff: ai-blog-db v0.2 Demo Campaign

Date: 2026-05-14

## 1. Task Goal

Hitori Media OS v0.2が、1つのContent Ideaからcoordinated cross-platform media campaignを作れることを示すhuman-reviewable demo campaign packageを作る。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 新規media fileは生成していない。
- 既存publish package fileは破壊的に上書きしていない。

## 3. Changed Files

- `README.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/README.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/campaign-plan.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/platform-role-map.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/production-mode-plan.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/publish-sequence.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/repurpose-map.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/substack-package.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/video-package.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/audio-package.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/visual-package.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/final-review-checklist.md`
- `docs/devlog/0059-ai-blog-db-v0-2-demo-campaign.md`
- `docs/handoff/latest.md`
- `docs/handoff/0071-ai-blog-db-v0-2-demo-campaign.md`

## 4. Summary of Changes

`ai-blog-db` をHitori Media OS v0.2のdemo campaignとして整理しました。note、Substack、X、Threads、Instagram、YouTube、Shorts、Podcastの役割、公開順、再利用マップ、productionMode、visual/video/audio TODOを1つのpackageにまとめました。

Validationとして、`node --check tools/publish-package-builder/build.mjs`、`node --check tools/local-check.mjs`、`npm run local:check`、`npm run publish:package`、`npm run build` は成功しました。

## 5. Key Decisions

- Campaign packageは既存publish packagesを参照する統合レビュー用folderとして作る。
- 実media生成はせず、動画/音声はplanとTODOに留める。
- Substackはsubscriber asset layerとして扱い、paid offerはまだ出さない。
- publishingはmanualのまま維持する。

## 6. Human Review Questions

- このcampaign packageで、Hitori Media OS v0.2の価値が伝わるか。
- 最初に公開する媒体はX/note/Substackの順でよいか。
- YouTube thumbnailとGitHub architecture diagramのどちらを先に作るべきか。
- Podcastはこのテーマで録る価値があるか。

## 7. Risks or Uncertainties

- Campaign packageは手動レビュー用であり、自動で各packageを同期しない。
- 既存draftは初稿なので、公開前の人間編集が必要。
- 動画/音声はまだ実制作前のplan段階。

## 8. Recommended Next Step

`final-review-checklist.md` を人間が確認し、最初に公開する媒体と不足assetの優先順位を決める。

## 9. Exact Prompt to Give Codex Next

```text
Record the human review result for the ai-blog-db v0.2 demo campaign package.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.

Use:
- publish-packages/campaigns/ai-blog-db-v0-2-demo/final-review-checklist.md

Record what is approved, what needs changes, and which asset or platform should be prepared next.
```
