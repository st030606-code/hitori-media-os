# note Images Plan: building-hitori-media-os

Status: brief-ready / awaiting generation

## Required & Optional Assets

| Asset ID | Required | Placement | Brief |
| --- | --- | --- | --- |
| `note-hero-v1` (shared with Substack) | **必須 (P1)** | 記事冒頭 hero / eye-catch | [tasks/.../note-hero-v1.md](../../../tasks/visuals/building-hitori-media-os/note-hero-v1.md) |
| `note-inline-content-os-flow-v1` | 推奨 (P2) | 第2章「中心にあるのは『1つの構造化されたContent Idea』」H2 直下 | [.../note-inline-content-os-flow-v1.md](../../../tasks/visuals/building-hitori-media-os/note-inline-content-os-flow-v1.md) |
| `note-inline-manual-vs-automation-v1` | 推奨 (P2) | 第4章「自動化は最後、まず手動で回る型を作る」H2 末尾 | [.../note-inline-manual-vs-automation-v1.md](../../../tasks/visuals/building-hitori-media-os/note-inline-manual-vs-automation-v1.md) |
| `note-inline-publish-package-folder-v1` | 任意 (P3) | 第5章「text / visual / video / audio を1つのアイデアから捌く」末尾 | [.../note-inline-publish-package-folder-v1.md](../../../tasks/visuals/building-hitori-media-os/note-inline-publish-package-folder-v1.md) |

## Where Images Will Go

- Source files:
  - `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（note-hero と Substack header の共有）
  - `assets/visuals/building-hitori-media-os/note/inline/note-inline-content-os-flow-v1.png`
  - `assets/visuals/building-hitori-media-os/note/inline/note-inline-manual-vs-automation-v1.png`
  - `assets/visuals/building-hitori-media-os/note/inline/note-inline-publish-package-folder-v1.png`
- Publish package copy: `publish-packages/note/building-hitori-media-os/images/` 配下に同名ファイル。

## Insertion Plan In note Article

[note-final-review.md](note-final-review.md) と整合させる:

1. 記事冒頭の hero: `note-hero-v1` (shared `campaign-hero-v1.png`)
2. 第2章 H2 直下: `note-inline-content-os-flow-v1`
3. 第4章 H2 末尾: `note-inline-manual-vs-automation-v1`
4. 第5章末尾（任意）: `note-inline-publish-package-folder-v1`

## Minimum Required Set For Public Posting

- 必須: `note-hero-v1` のみ。
- 推奨: 第2章 + 第4章の inline 2枚を同時に揃えると、note 検索流入読者の理解が大幅に上がる。
- 任意: 第5章 inline はあとから追加可能（再公開せず note の「再編集」で差し込み）。

## Checklist Before Posting

- [ ] `campaign-hero-v1.png` が存在し、Sanity Studio で note-hero-v1 / substack-header-v1 の両 `localAssetPath` が埋まっている
- [ ] 各 inline 画像が想定パスに存在し、`localAssetPath` が Sanity Studio で埋まっている
- [ ] 各画像を実サイズで目視確認した
- [ ] 各章の本文と画像のメッセージが整合している
- [ ] secret / 実project ID / private/ ファイル名が映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文の図版が混ざっていない
- [ ] note のタグを3つ程度決めた

## Image Placement vs insert-map.md

note publish package の `insert-map.md` は、Publish Package Builder が `visualAssetPlan` 一覧から自動生成する。生成内容に違和感があれば、人間が `insert-map.md` を手動編集する。

## Safety

- No auto-posting
- No paid image generation API
- No face photo
- Manual review before posting
