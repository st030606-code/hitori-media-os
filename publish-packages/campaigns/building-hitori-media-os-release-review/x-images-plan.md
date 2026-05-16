# X Images Plan: building-hitori-media-os

Status: brief-ready / awaiting generation

## Required Asset

| Asset ID | Required | Purpose | Brief |
| --- | --- | --- | --- |
| `x-hook-main-v1` | **必須 (P1)** | X main post の inline hook 画像 | [tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../../../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md) |

## Optional / Out Of Scope

- Threads 用画像 (`threads-support-v1`) は X とは別ファイル。X timeline には添付しない。
- 顔写真ワークフローはこのバッチで扱わない。

## Where The Image Will Go

- Source file: `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
- Publish package copy: `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png`

`localAssetPath` が Sanity Studio で埋まったあと、`npm run publish:package -- building-hitori-media-os` を実行すると publish-package へ自動コピーされる。

## Insertion Plan In X Post

- Main post `posts.md` の最初の投稿に inline 画像として添付。
- スレッド版を使う場合は、1/ の投稿だけに画像を添付し、残りはテキストのみにする（情報過多を避ける）。

## Checklist Before Posting

- [ ] `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` が存在する
- [ ] Sanity Studio で `visualAssetPlan.x-hook-main-v1.localAssetPath` が埋まっている
- [ ] X 投稿前に画像を実サイズ（1200x675）で目視確認した
- [ ] preview crop で「発信を頑張るより、発信が回る仕組みを作る。」が読める
- [ ] secret / 実project ID / private/ ファイル名が映っていない
- [ ] 顔写真が映っていない
- [ ] 有料PDF教材本文が映っていない
- [ ] X main post の本文と画像のメッセージが整合している

## Safety

- No auto-posting
- No paid image generation API
- No face photo
- Manual review before posting
