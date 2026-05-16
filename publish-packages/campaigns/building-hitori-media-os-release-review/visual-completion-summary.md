# Visual Completion Summary: building-hitori-media-os (text-first 4 platforms)

Status: brief-ready / awaiting human generation
Date: 2026-05-14

## Scope

text-first 4 platforms（X / Threads / note / Substack）の production visual を準備するためのまとめ。
video / audio 系（YouTube / Shorts / Podcast）と顔写真ワークフローは **意図的にこのバッチでは扱わない**。

## At-A-Glance Asset Status

| ID | Platform | Type | Aspect | Reuse | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `note-hero-v1` (shared) | note | hero | 16:9 | reusable (= Substack header) | **P1** | brief-ready |
| `substack-header-v1` (shares with note) | Substack | hero | 16:9 | reusable (shares master) | **P1** | brief-ready |
| `x-hook-main-v1` | X | hook-image | 16:9 | variant-required | **P1** | brief-ready |
| `threads-support-v1` | Threads | paired-post-visual | 4:5 | variant-required | **P2** | brief-ready |
| `note-inline-content-os-flow-v1` | note (inline) | flow-diagram | 16:9 | reusable | **P2** | brief-ready |
| `note-inline-manual-vs-automation-v1` | note (inline) | comparison-diagram | 16:9 | reusable | **P2** | brief-ready |
| `note-inline-publish-package-folder-v1` | note (inline) | architecture-diagram | 16:9 | reusable | **P3** | brief-ready |
| `substack-inline-reader-system-v1` | Substack (inline) | section-diagram | 16:9 | platform-specific | **P3** | brief-ready |

Implementation files:

- Seeds: `seed/visual-asset-plan-records-building-hitori-media-os.json`
- Briefs: `tasks/visuals/building-hitori-media-os/*.md`
- Style guide: `tasks/visuals/building-hitori-media-os/_style-guide.md`
- Workflow: `tasks/visuals/building-hitori-media-os/_workflow.md`
- Per-platform plans:
  - `publish-packages/campaigns/building-hitori-media-os-release-review/x-images-plan.md`
  - `publish-packages/campaigns/building-hitori-media-os-release-review/threads-images-plan.md`
  - `publish-packages/campaigns/building-hitori-media-os-release-review/note-images-plan.md`
  - `publish-packages/campaigns/building-hitori-media-os-release-review/substack-images-plan.md`

## What Should Be Generated First

短くまとめると、**1枚目は `note-hero-v1`、2枚目は `x-hook-main-v1`**。

理由:

- `note-hero-v1` は Substack header にも流用するため、1ファイルで2用途を兼ねる。最大の費用対効果。
- それを「トーンの基準」にして、`x-hook-main-v1` を同じ base / accent / font で作る。
- Threads support は X の後で十分。
- note inline 3点は本文公開時に揃えたいが、第1弾の note 公開は hero 1枚でも成立する。
- Substack inline は任意。Substack Post 公開後でも追加できる。

P1 を全部揃えれば、X + Substack の最低限の公開準備が完了する。

## Reuse Decisions

- **note hero ↔ Substack header**: 同じ master `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`。Visual Register で1回だけ登録。
- **X ↔ Threads**: 同じ概念だが解像度・レイアウトが違うため別ファイル。色とフォントだけ揃える。
- **note inline 3点 ↔ Substack inline**: 同概念は転用可。1点ずつ別ファイルだが、reusable に分類。

## What Remains Manual

- 各 asset の画像生成（ChatGPT 手動）
- Visual Register への保存・登録
- Sanity Studio での `localAssetPath` 反映
- `publish-packages/<platform>/<slug>/images/` への配布（builder 経由）
- 各 platform への手動投稿
- 公開後 URL / reaction notes の手動記録

## Intentionally Deferred To Later Workflows

このバッチでは扱わない:

- **YouTube long-form サムネ**（顔写真合成を含む可能性、boss photo workflow が必要）
- **Shorts thumbnail / face-based cover variants**
- **Podcast episode artwork**（必要なら別バッチ）
- **Instagram carousel slides 2〜7**
- **GitHub README architecture**（ai-blog-db 用の既存を流用する案を後で検討）
- **動画 / 音声ファイル本体の生成**

これらは text-first 4 platforms の visual を実生成し、反応を見てから優先順位を判断する。

## Recommended Action For The Boss

1. このサマリを読む。
2. `_inventory.md` と `_style-guide.md` を読み、トーンの方向性に合意する。
3. `note-hero-v1.md` の "Generation Prompt" を ChatGPT にコピーして、最初の画像を生成する。
4. 採用画像を `_workflow.md` 手順で Visual Register に登録し、Sanity Studio で `localAssetPath` を反映する。
5. その master file を「トーンの基準」とし、`x-hook-main-v1.md` を続けて生成する。
6. P1 が揃ったら、`npm run publish:package -- building-hitori-media-os --dry-run --replace-placeholder-package` で publish-packages の配布計画を確認する。
7. P2 の生成へ進む。

## Safety Reaffirmation

- No paid image generation API
- No auto-posting
- No face photo workflow in this batch
- No reuse of Visual Register test images as public assets
- No fake final image files
- No paid PDF content copied
- No secret / 実project ID / private/ exposed in any image
- Manual generation, manual registration, manual Sanity update, manual publishing
