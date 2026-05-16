# Devlog 0060: ai-blog-db Release Prep

Date: 2026-05-14

## 今日の判断

`ai-blog-db` のv0.2 demo campaignを、単なるhuman-reviewable packageから、手動公開に向けたfirst public release preparation packageへ進めました。

まだ自動投稿、Sanity direct write、画像生成API、Next.js dashboardは入れません。今回の目的は、公開前に人間が確認しやすい形へ整理することです。

## 変更したこと

`publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/` を作り、次を追加しました。

- `release-overview.md`
- `first-release-sequence.md`
- `manual-publish-checklist.md`
- `x-ready.md`
- `threads-ready.md`
- `note-ready.md`
- `substack-ready.md`
- `asset-priority.md`
- `video-recording-pack.md`
- `podcast-recording-pack.md`
- `shorts-production-pack.md`

また、次のbuilding-in-public企画として `docs/41-next-campaign-tool-building-in-public.md` を追加しました。

READMEには、demo campaign packageとrelease-prep folderへの導線を追加しました。

## なぜこの設計にしたか

Hitori Media OS v0.2は、1つのContent Ideaから複数媒体へ展開できることを示す必要があります。ただし、最初の公開でいきなり全媒体を完成させるとレビューが重くなります。

そのため、最初の公開準備では次の順に分けました。

- X / Threads / note / Substackをtext-first release候補にする
- Instagram / YouTube / Shorts / Podcastはproduction packとTODOで整理する
- 不足assetはpriority順に並べる
- 公開は手動のまま維持する

## APIなしで済ませた理由

今回必要だったのは生成や投稿の自動化ではなく、公開判断の整理です。

実装したのはtext-only draft、checklist、production plan、TODO整理だけです。外部API、画像生成API、SNS API、Substack APIは使っていません。

## Codexとの役割分担

Codexは、既存のplatform packageとcampaign packageを読み、公開準備用のfolder構成とdraft/checklistを整理しました。

人間は、公開前に次を確認します。

- X / Threads / note / Substackの文体が本人の発信に合うか
- CTAが強すぎないか
- note hero imageをどの媒体まで使い回すか
- Instagram / YouTube / Podcastの制作優先度

## 発信コンテンツにできる切り口

- Hitori Media OS v0.2の最初の公開準備をした
- 1つのContent Ideaから公開順を設計する方法
- いきなり全媒体公開しない理由
- AI時代の発信は「下書き」より「公開準備package」が重要
- tool building in publicを次のキャンペーンにする理由

## 次にテストすること

1. `release-prep/x-ready.md` を人間が編集してXへ手動投稿できるか確認する。
2. `threads-ready.md` と `note-ready.md` の流れが自然か確認する。
3. note公開後にSubstack Postへ転用できるか確認する。
4. Instagram carousel slides 2-5を追加制作する。
5. YouTube thumbnailとrecording planを確認する。

## Validation

次は成功しました。

- `node --check tools/publish-package-builder/build.mjs`
- `node --check tools/local-check.mjs`
- `npm run local:check`
- `npm run publish:package`
- `npm run build`

`npm run publish:package` は `safe-skip-existing-files` として動作し、既存publish package fileを破壊的に上書きしませんでした。
