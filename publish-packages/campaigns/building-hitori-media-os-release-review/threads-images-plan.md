# Threads Images Plan: building-hitori-media-os

Status: brief-ready / awaiting generation

## Required Asset

| Asset ID | Required | Purpose | Brief |
| --- | --- | --- | --- |
| `threads-support-v1` | 推奨 (P2) | Threads main post に添える縦長 supporting visual | [tasks/visuals/building-hitori-media-os/threads-support-v1.md](../../../tasks/visuals/building-hitori-media-os/threads-support-v1.md) |

## Optional / Out Of Scope

- X 用画像 (`x-hook-main-v1`) は流用しない（X用は16:9、Threadsは4:5縦長）。
- 顔写真ワークフローはこのバッチで扱わない。

## Where The Image Will Go

- Source file: `assets/visuals/building-hitori-media-os/threads/support/threads-support-v1.png`
- Publish package copy: `publish-packages/threads/building-hitori-media-os/images/threads-support-v1.png`

## Insertion Plan In Threads Post

- Main post（[threads-final-review.md](threads-final-review.md) の "Recommended Main Post"）の inline 画像として添付。
- Reply chain にはテキストのみで進める（必要に応じて中盤の1本だけ簡素な補助画像を追加するか後で判断）。

## Checklist Before Posting

- [ ] `assets/visuals/building-hitori-media-os/threads/support/threads-support-v1.png` が存在する
- [ ] Sanity Studio で `visualAssetPlan.threads-support-v1.localAssetPath` が埋まっている
- [ ] Threads 投稿前に画像を実サイズ（1080x1350）で目視確認した
- [ ] 縦長表示 / 1.91:1 / 1:1 crop でも見出しと中央ノードが読める
- [ ] X 版とトーンが一貫している（base色 / accent色 / font が揃っている）
- [ ] X 版より柔らかい印象
- [ ] secret / 実project ID / private/ ファイル名が映っていない
- [ ] 顔写真が映っていない
- [ ] 有料PDF教材本文が映っていない

## Decision Points

- 画像を main post だけに付けるか、reply chain の中盤にも添えるか（推奨は main post のみ）
- X と同日投稿する場合、画像を時間差で出すか同タイミングで出すか

## Safety

- No auto-posting
- No paid image generation API
- No face photo
- Manual review before posting
