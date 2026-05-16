# Phase 1 Release Candidate Check

日付: 2026-05-14

このドキュメントは、Sanity AI Content OS を Phase 1 local-first MVP の release candidate として扱えるか確認するためのメモです。

## What Works Now

- Sanity Studio をローカルで起動できる。
- `.env.local` で Sanity project ID / dataset をローカル設定できる。
- schemas は `contentIdea`、`prompt`、`platformOutput`、`diagramPlan`、`publishedOutput`、`tool`、`workflow`、`visualAssetPlan` まで存在する。
- seed documents は `contentIdea`、`prompt`、`platformOutput`、`diagramPlan`、`tool`、`workflow`、`visualAssetPlan` まで用意されている。
- Mac launcher で Sanity Studio と Local Visual Register を起動できる。
- Local Visual Register で手動生成画像を `assets/visuals/...` に保存できる。
- `expectedLocalAssetPath` により、保存予定パスを事前に確認できる。
- overwrite protection により、既存画像の誤上書きを防げる。
- Patch Review で `patches/visual-assets/...` の patch JSON を read-only 確認できる。
- Content Idea filter / grouping により、複数テーマの visualAssetPlan を見分けられる。
- test seed mode により、通常seedを壊さず複数 Content Idea のUI検証ができる。

## Intentionally Manual

- 画像生成は ChatGPT 画像生成などの外部ツールで人間が実行する。
- 生成画像の採用判断は人間が行う。
- Visual Register が作った patch JSON は、人間が確認してから Sanity Studio に手動反映する。
- `localAssetPath`、`status`、`reviewNotes` の最終更新はSanity Studioで行う。
- seed documents の作成は Sanity CLI で人間が実行する。
- 公開作業、SNS投稿、配信予約は人間が行う。

## Intentionally Postponed

- Next.js dashboard
- Tailwind CSS / shadcn/ui での本番UI化
- Sanity direct write
- OpenAI API / Anthropic API client
- 画像生成API
- 自動投稿
- social platform integration
- publish package builder
- Windows / Linux launcher
- Tauri / Electron desktop app

## Known Limitations

- Visual Register はMVP用の静的HTML/CSS/JS UIであり、将来のdashboard実装とは別物。
- Patch Review は read-only で、Sanityへの反映は手動。
- 複数画像のbatch registrationはUIとして存在するが、実画像複数枚での本格テストは未完了。
- test seed mode は開発・検証用で、本番運用モードではない。
- `seed --replace` はpartial updateには使わない。既存documentの一部更新はpatch JSON確認後にStudioで手動反映する。
- 現時点では buyer-facing dashboard ではなく、開発者/上級ユーザー向けのlocal-first MVP。

## Before-Demo Checklist

- `npm run build` が通る。
- `launchers/start-mac.command` でSanity Studioが開く。
- Visual Register が `http://localhost:3334` で開く。
- 通常モードで visualAssetPlan が5件表示される。
- test seed modeで visualAssetPlan が8件表示され、Content Ideaが2件表示される。
- Patch Reviewに `note-hero-v1` patch が表示される。
- Sanity Studioで `visualAssetPlan.ai-blog-db.note-hero-v1` の `expectedLocalAssetPath` と `localAssetPath` を確認できる。
- READMEの手順だけで、現在のMVPの意図と使い方が分かる。
- `.env.local` や実project IDがコミット対象になっていない。

## Buyer-Facing Explanation Draft

Sanity AI Content OS は、ひとつのアイデアを記事、SNS投稿、動画台本、図解、ドキュメントへ展開するためのローカル運用ツールです。

Phase 1では、AIにすべてを自動化させるのではなく、人間が確認しながら、構造化されたアイデア、媒体別下書き、画像計画、ローカル画像、Sanity上の記録をつなげます。

今のMVPは、画像生成そのものや自動投稿は行いません。代わりに、手動生成した画像を正しい場所へ保存し、Sanityに反映するための安全なpatch情報を作ります。

## Developer-Facing Setup Checklist

1. `.env.local` を作成する。
2. `npm install` 済みであることを確認する。
3. `npm run build` を実行する。
4. `launchers/start-mac.command` をダブルクリックする。
5. Sanity Studioでseed documentを確認する。
6. Visual Registerで visualAssetPlan が読み込まれることを確認する。
7. Patch Reviewで既存patch JSONが表示されることを確認する。
8. test seed modeは必要なときだけ `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register` で起動する。

## Release Candidate Judgment

Phase 1 MVP は、local-first / no-API / manual-review workflow のrelease candidateとして扱ってよい状態です。

ただし、正式デモ前には `docs/29-today-final-checklist.md` の人間確認を完了する必要があります。
