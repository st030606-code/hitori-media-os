# Release Review Package: building-hitori-media-os

Status: ready-for-human-review
Date: 2026-05-14

## Campaign Title

AIで「ひとりメディア運営OS」を作っている裏側

## Core Thesis

発信を頑張るより、発信が回る仕組みを作る。

AIで記事を量産する前に、AIが使える知識DBと制作ワークフローを設計したほうが、ひとりメディア運営は長く続けやすい。

## Current Status

- text-first 4 媒体（X / Threads / note / Substack）と video / audio 3 媒体（YouTube / Shorts / Podcast）のドラフトが `ready-for-human-edit`。
- publish-packages 配下の本文・checklist は `--replace-placeholder-package` で最新化済み（placeholder 履歴なし）。
- Sanity 側の Substack 戦略レイヤー4本（publicationStrategy / postPlan / notesPlan / growthAction）が active で、Studio 確認も完了。
- Instagram / GitHub は draftSourceDir 未設定で TODO 扱い、今回のレビュー対象外。
- subscribers が動いていないため、`substackSubscriberMilestone` / `substackPaidReadiness` は proposed のまま。

## Active Sanity Strategy Records (test seeds)

ローカル保存のみ。Studio への投入は人間判断で。`seed --replace` 不使用、Sanity CLI 未実行。

- `seed/contentIdea-building-hitori-media-os.json`
- `seed/substack-publication-strategy-building-hitori-media-os.json`
- `seed/substack-post-plan-building-hitori-media-os.json`
- `seed/substack-notes-plan-building-hitori-media-os.json`
- `seed/substack-growth-action-building-hitori-media-os.json`

## Publish Package Paths

- `publish-packages/x/building-hitori-media-os/`
- `publish-packages/threads/building-hitori-media-os/`
- `publish-packages/note/building-hitori-media-os/`
- `publish-packages/substack/building-hitori-media-os/`
- `publish-packages/youtube/building-hitori-media-os/`
- `publish-packages/shorts/building-hitori-media-os/`
- `publish-packages/podcast/building-hitori-media-os/`
- `publish-packages/instagram/building-hitori-media-os/`（TODO）
- `publish-packages/github/building-hitori-media-os/`（TODO）

## What Is Ready

- X：main post + alternate hooks + short thread + soft CTA + checklist
- Threads：main post + alternate + reply chain + discussion question + checklist
- note：long-form article（7節 + 画像挿入ポイント + soft CTA + repurpose notes + checklist）
- Substack：title / subject / preview + Opening / Main Story / Practical Takeaway / Reader-List Connection / Reader Question / Subscribe CTA + Notes Plan + auxiliary（about-page / welcome-email / title-options / social-preview / subscribe-cta / repurpose-map）+ checklist
- YouTube：10〜15分の長尺台本 + chapters + screen-recording cues + Production Modes（human / hybrid / AI future TODO）+ description + pinned comment + checklist
- Shorts：30〜45秒 × 3本 + caption + visual / edit notes + checklist
- Podcast：20〜30分ひとり語り outline + show notes + audio TODO + production modes + checklist

## What Remains Manual

- 各媒体への手動公開（自動投稿はしない）
- YouTube / Shorts の実録画 / 編集 / アップロード
- Podcast の実収録 / 編集 / 配信
- Substack の About Page / Welcome Email の最終文字埋め
- Sanity Studio への手動 reflect（公開URL / status 更新）
- Visual Register と Publish Package Builder の placeholder バナーが消えていることの再確認
- Instagram / GitHub の draft 化（draftSourceDir 導入バッチ、別件）

## Recommended Review Order

1. このREADMEと [campaign-overview.md](campaign-overview.md) を読む。
2. [publish-order.md](publish-order.md) で公開順を確認する。
3. [final-human-checklist.md](final-human-checklist.md) を見ながら、各媒体の final-review を順に確認する。
4. [x-final-review.md](x-final-review.md) → [threads-final-review.md](threads-final-review.md) → [note-final-review.md](note-final-review.md) → [substack-final-review.md](substack-final-review.md) → [youtube-final-review.md](youtube-final-review.md) → [shorts-final-review.md](shorts-final-review.md) → [podcast-final-review.md](podcast-final-review.md)
5. 公開ごとに [post-publication-log-template.md](post-publication-log-template.md) をコピーして記録する。

## Production Visual Readiness Gate

text-first 4 platforms（X / Threads / note / Substack）を公開する前に、**production visual** を inbox 経由で揃える必要があります。テスト画像 / ai-blog-db からの流用画像は使わない。

canonical 7 assets:

1. `note-hero-v1`（Substack header と master 共有）
2. `substack-header-v1`（master を `note-hero-v1` と共有）
3. `x-hook-main-v1`
4. `threads-support-diagram-v1`
5. `note-inline-content-os-flow-v1`
6. `note-inline-human-judgment-v1`
7. `substack-inline-reader-system-v1`（任意 P3）

各 asset の brief は [tasks/visuals/building-hitori-media-os/](../../../tasks/visuals/building-hitori-media-os/) 配下。インベントリ全体は [_inventory.md](../../../tasks/visuals/building-hitori-media-os/_inventory.md)。フローは [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md)。

video / audio 系（YouTube サムネ / Shorts cover / Podcast cover）は別バッチで扱う（顔写真ワークフローが含まれる可能性のため）。

## Safety

- No auto-posting
- No platform API call
- No Sanity direct write (Studio への反映は手動)
- No paid PDF content copied
- No AI clone voice without explicit human approval
- No private/ source files exposed in any screen recording or published content
- Production visual は inbox 経由のみ。Visual Register Inbox Review が承認ゲート。
- テスト画像 / 他キャンペーンの流用画像は production に使わない。
