# Brief: substack-header-v1 (shares master with note-hero-v1)

Priority: P1
Status: brief-ready

## Asset Metadata

- Asset ID: `substack-header-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.substack-header-v1`
- Shared with: `note-hero-v1`（同じ master file）
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: Substack
- Asset Type: hero
- Aspect Ratio: 16:9
- Pixel size: 1456 x 816（Substack の social preview / post header に最適）
- Reuse Policy: reusable

## Objective

Substack Post の **header 画像 / Social Preview** として使う。
新規生成は **不要**。`note-hero-v1` の master file をそのまま転用し、note と Substack で視覚的に同じ publication 感を作る。

## Reuse Strategy

- master file: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- このファイルは `note-hero-v1` 生成バッチで作る。
- Substack 側では Visual Register で再登録 **しない**。Sanity Studio で `localAssetPath` フィールドに同じパスを手動で書く。
- 公開時、Substack のエディタにアップロードする画像は note と同一の master file。

## Why Not Re-Generate

- note ↔ Substack 間で「これは同じ publication です」という視覚的合図を作りたい。
- 1ファイル管理で master 更新時の差分が出ない。
- 生成コスト・レビューコストを半分にする。

新しい variant を作りたくなった場合は、`substack-header-v2` として別ファイル・別 visualAssetPlan で扱う。

## Placement

- Substack Post の header（記事冒頭の cover image）
- Substack Social Preview image
- 必要なら Substack profile の banner にも流用可（要レビュー）

## Generation Prompt

`note-hero-v1.md` の "Generation Prompt" を参照。**このブリーフ単体では生成プロンプトを実行しない**。

## Review Checklist

- [ ] master file が `note-hero-v1` のレビューを通過している
- [ ] Substack エディタにアップロードしたとき、preview が崩れない（1.91:1 表示で文字が読める）
- [ ] Social Preview として Twitter / Threads などへ共有された場合の crop でも主張が伝わる
- [ ] note hero と完全に同じファイルを使っている（二重生成していない）
- [ ] Sanity の `visualAssetPlan.substack-header-v1.localAssetPath` が `note-hero-v1` と一致する

## Inbox Candidate Path

このアセットは `note-hero-v1` の master を共有するため、**Substack 単独で inbox に candidate を新規生成しない**。

- master inbox path（`note-hero-v1` 側で使用）: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v00X.png`
- master final path: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`

万一 Substack 専用 variant を作りたくなった場合は `substack-header-v2` として別 visualAssetPlan を追加し、`assets/inbox/generated/building-hitori-media-os/substack-header-v2/v00X.png` に保存する。

## Save Path & Registration

- master file: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（`note-hero-v1` バッチで Visual Register approve & register 済みの前提）
- Visual Register での操作:
  - 再登録 **しない**。
  - 代わりに Sanity Studio で `visualAssetPlan.substack-header-v1` を開き、`localAssetPath` フィールドに `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を手動入力する。
  - `status` を `saved` に更新する。
- Publish Package Builder は両方の visualAssetPlan を見て、`publish-packages/{note,substack}/building-hitori-media-os/images/` に同じファイルをコピーする。

## Future Variants

将来 Substack 専用に文字組みや色を変えたい場合のみ:

- `substack-header-v2` を新規 visualAssetPlan として追加
- `assets/visuals/building-hitori-media-os/substack/header/substack-header-v2.png` で保存
- reusePolicy を `platform-specific` に変更

## Safety

- No new generation in this batch
- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
