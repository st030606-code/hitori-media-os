# Substack Images Plan: building-hitori-media-os

Status: brief-ready / awaiting generation

## Required & Optional Assets

| Asset ID | Required | Placement | Brief |
| --- | --- | --- | --- |
| `substack-header-v1` (shares with note hero) | **必須 (P1)** | Substack Post header / Social Preview | [tasks/.../substack-header-v1.md](../../../tasks/visuals/building-hitori-media-os/substack-header-v1.md) |
| `substack-inline-reader-system-v1` | 任意 (P3) | Substack Post の「Reader-List Connection」節 | [.../substack-inline-reader-system-v1.md](../../../tasks/visuals/building-hitori-media-os/substack-inline-reader-system-v1.md) |

## Shared With note

- `substack-header-v1` の master file は **`note-hero-v1` と同一**: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`。
- Visual Register で **二重登録しない**。Sanity Studio で両方の `localAssetPath` を同じパスに手動入力する。
- Publish Package Builder が両方の publish package へ同じファイルをコピーする。

## Where Images Will Go

- Source files:
  - `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（shared）
  - `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png`
- Publish package copy: `publish-packages/substack/building-hitori-media-os/images/` 配下に同名ファイル。

## Insertion Plan In Substack Post

[substack-final-review.md](substack-final-review.md) と整合させる:

1. Post header / Social Preview: `substack-header-v1`（= `campaign-hero-v1.png`）
2. 本文「Reader-List Connection」節（任意）: `substack-inline-reader-system-v1`

## Minimum Required Set For Public Posting

- 必須: `substack-header-v1` のみ。
- 任意: `substack-inline-reader-system-v1` を入れると Reader-List 設計が一発で伝わるが、無くても Post 本文だけで成立する。

## Social Preview

- Substack の Social Preview にも `substack-header-v1`（= campaign-hero）が使われる。
- Twitter Card / Threads / Facebook など、Substack の URL がプレビューされる先で同じ画像が表示される。
- そのため文字とコントラストは preview crop 耐性を最優先する。

## About Page / Welcome Email

- About Page / Welcome Email 用の画像はこのバッチでは扱わない。
- 必要になれば後続バッチで `substack-about-image-v1` や `substack-welcome-image-v1` を別 visualAssetPlan として追加する。

## Checklist Before Posting

- [ ] `campaign-hero-v1.png` が存在し、Sanity Studio で substack-header-v1 の `localAssetPath` が埋まっている
- [ ] note hero と Substack header が **同じファイル**（パスが一致）であることを確認した
- [ ] Substack エディタへのアップロードで preview が崩れない
- [ ] Social Preview crop でも文字が読める
- [ ] secret / 実project ID / private/ ファイル名が映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文の図版が混ざっていない

## Safety

- No auto-posting
- No Substack API call
- No email send automation
- No paid image generation API
- No face photo
- Manual review before posting
