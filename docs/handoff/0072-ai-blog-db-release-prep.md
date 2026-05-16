# Handoff: ai-blog-db Release Prep

Date: 2026-05-14

## 1. Task Goal

`ai-blog-db` のHitori Media OS v0.2 demo campaignを、first public releaseに向けた手動公開準備packageへ進める。

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
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/release-overview.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/first-release-sequence.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/manual-publish-checklist.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/x-ready.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/threads-ready.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/note-ready.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/substack-ready.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/asset-priority.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/video-recording-pack.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/podcast-recording-pack.md`
- `publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/shorts-production-pack.md`
- `docs/41-next-campaign-tool-building-in-public.md`
- `docs/devlog/0060-ai-blog-db-release-prep.md`
- `docs/handoff/latest.md`
- `docs/handoff/0072-ai-blog-db-release-prep.md`

## 4. Summary of Changes

`ai-blog-db` campaignに `release-prep/` を追加し、X、Threads、note、Substackのready-for-human-edit draftと、手動公開チェックリスト、公開順、asset priority、video/audio/shorts production packを作成しました。

次のbuilding-in-public企画として、`building-hitori-media-os` のdesign docも追加しました。

Validationとして、`node --check tools/publish-package-builder/build.mjs`、`node --check tools/local-check.mjs`、`npm run local:check`、`npm run publish:package`、`npm run build` は成功しました。

## 5. Important Decisions

- 最初の公開はtext-firstで進める。
- X / Threads / note / Substackを人間編集可能な公開候補にする。
- Instagram / YouTube / Shorts / Podcastはまだproduction packとTODOに留める。
- 公開、Sanity更新、画像生成、動画音声制作は手動のままにする。
- 次キャンペーンは「AIでひとりメディア運営OSを作っている裏側」にする。

## 6. Human Review Questions

- 最初の公開順は X -> Threads -> note -> Substack でよいか。
- `x-ready.md` の主張は強すぎないか。
- note冒頭に、実験ログとしての一文を入れるか。
- SubstackのCTAは購読誘導でよいか、それとも返信誘導を強めるか。
- Instagram slides 2-5とYouTube thumbnailのどちらを先に作るか。

## 7. Risks or Uncertainties

- ready-for-human-editであり、final approved copyではない。
- note / Substack本文は元packageを参照する形なので、最終公開前に全文確認が必要。
- Instagram、YouTube、Shorts、Podcastは制作前TODOが残っている。
- 公開URLをSanityへ戻す作業はまだ手動。

## 8. Recommended Next Step

まず `release-prep/x-ready.md` と `release-prep/threads-ready.md` を人間が確認し、最初の投稿文として使えるか判断する。その後、note記事の最終編集へ進む。

## 9. Exact Prompt to Give Codex Next

```text
Record the human review result for the ai-blog-db release-prep package.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.

Use:
- publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/

Record:
- which text-first platforms are approved
- what copy needs changes
- which platform should be published first
- which asset should be created next
- any published URLs if manual publishing happened

Update devlog and handoff.
```
