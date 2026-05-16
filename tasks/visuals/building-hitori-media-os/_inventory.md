# Visual Inventory: building-hitori-media-os (text-first 4 platforms)

Date: 2026-05-14
Status: brief-ready (実生成前)

## Scope

このバッチは text-first 4 platforms（X / Threads / note / Substack）の **production-ready visual** を完成させるためのインベントリです。

YouTube サムネ（顔写真含む）/ Shorts thumbnail / 顔ベースの compositing は **意図的に対象外**。後続バッチで扱う。

## Canonical Asset List (current set, 7 assets)

| ID | Asset | Platform | Asset Type | Aspect | Reuse | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | `note-hero-v1` | note | hero | 16:9 | reusable (shared with Substack header) | **P1** | brief-ready |
| B | `substack-header-v1` | substack | hero | 16:9 | reusable (shares A) | **P1** | brief-ready |
| C | `x-hook-main-v1` | x | hook-image | 16:9 | variant-required | **P1** | brief-ready |
| D | `threads-support-diagram-v1` | threads | paired-post-visual | 4:5 | variant-required | **P2** | brief-ready |
| E | `note-inline-content-os-flow-v1` | note | flow-diagram | 16:9 | reusable | **P2** | brief-ready |
| F | `note-inline-human-judgment-v1` | note | flow-diagram | 16:9 | reusable | **P2** | brief-ready |
| G | `substack-inline-reader-system-v1` | substack | section-diagram | 16:9 | platform-specific | **P3** | brief-ready |

## Historical / Alternate Assets (kept in seed, not canonical)

| ID | Asset | 理由 |
| --- | --- | --- |
| H | `threads-support-v1` | `threads-support-diagram-v1` に renamed。古い brief は `threads-support-v1.md` に残る（superseded）。seed の `_id` は新 slug に更新済み。 |
| I | `note-inline-manual-vs-automation-v1` | 手動 / 半自動 / 自動の優先順位を扱う別軸。canonical 7 ではないが seed と brief は残す。 |
| J | `note-inline-publish-package-folder-v1` | Publish Package Builder のフォルダ構造を見せる別アセット。canonical 7 ではないが seed と brief は残す。 |

これらは Visual Register に表示はされるが、production 公開のための優先生成対象 **ではない**。

## Generation Order

公開可能性を最短で確保する順序:

1. **A `note-hero-v1`**（同時に B `substack-header-v1` に流用）
2. **C `x-hook-main-v1`**
3. **D `threads-support-diagram-v1`**
4. **E `note-inline-content-os-flow-v1`**
5. **F `note-inline-human-judgment-v1`**
6. **G `substack-inline-reader-system-v1`**（任意）

`A + C` だけで X / Substack / note の最低限の公開準備は成立する（note は本文だけでも公開可能）。

## Reuse Matrix

- `note-hero-v1` の master file は `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`。
- `substack-header-v1` は **同じ master file** をそのまま使う（生成は1回でよい）。
- X / Threads は別解像度・別レイアウトのため、それぞれ専用ファイルで生成する。
- note inline 3点は note 専用だが、Substack 同テーマ Post でも転用可能（reusable）。
- `substack-inline-reader-system-v1` のみ Substack 専用（platform-specific）。

## Out-Of-Scope For This Batch

意図的に後回し:

- YouTube long-form サムネ（顔写真合成を含む可能性）
- Shorts thumbnail / face-based cover variants
- Podcast 用 episode artwork（必要なら後続バッチ）
- Instagram carousel slides 2〜7
- GitHub README architecture diagram（既存 ai-blog-db の流用検討）
- 動画 / 音声ファイル本体

これらは、まず text-first 4 platforms の visual を実生成して反応を見てから判断する。

## Files

- 各 asset の詳細ブリーフ: `tasks/visuals/building-hitori-media-os/<asset-id>.md`
- スタイルガイド: `tasks/visuals/building-hitori-media-os/_style-guide.md`
- ワークフロー: `tasks/visuals/building-hitori-media-os/_workflow.md`
- Sanity 用 seed: `seed/visual-asset-plan-records-building-hitori-media-os.json`
- 公開前レビュー: `publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md`

## Safety

- No paid image generation API
- No auto-posting
- No fake final image files (実生成前に localAssetPath は空のまま)
- No reuse of Visual Register test images as production
- No face photo workflow in this batch
