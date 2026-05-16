# Brief: x-hook-main-v1

Priority: P1
Status: brief-ready

## Asset Metadata

- Asset ID: `x-hook-main-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.x-hook-main-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: X (formerly Twitter)
- Asset Type: hook-image
- Aspect Ratio: 16:9
- Pixel size: 1200 x 675（X timeline inline preview に最適）
- Reuse Policy: variant-required

## Objective

X main post に添える **hook 画像**。タイムライン上でスクロール中の1秒で `発信を頑張るより、発信が回る仕組みを作る。` を伝える。

## Message

> 発信を頑張るより、発信が回る仕組みを作る。

building-in-public トーンを保ち、完成版ツール宣伝にしない。

## Audience

X タイムラインで偶然この投稿に出会った発信者・開発者・編集者。タップする前の「目に入った瞬間」が判断ポイント。

## Placement

- X main post（[x-final-review.md](../../../publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md) の "Recommended Main Post"）の inline 画像。
- 必要なら別 hook 候補にも転用可（その場合は variant 別ファイル）。

## Visual Style

`_style-guide.md` 準拠。X 用にさらに次を意識:

- 文字量を note hero より1割減らす（インライン preview crop で読めるサイズ感）
- 装飾要素は note hero よりも1段階削る
- 色は note hero と一貫（同じ base / accent）

## Layout Guidance

- 画面中央に大きな日本語見出し `発信を頑張るより、発信が回る仕組みを作る。` を2〜3行で配置。
- 見出しの下に小さく `Hitori Media OS / development log`。
- 構造図は使わない、または使ってもノード1〜2個まで（見出しを邪魔しない）。
- 余白は note hero より広め。

## Text To Include

- 発信を頑張るより、発信が回る仕組みを作る。
- Hitori Media OS
- development log

## Text To Avoid

- 完全自動化 / 全自動化
- 稼げる / 誰でも
- AIに任せる時代
- 保証
- 完成
- 顔写真

## Reuse Notes

- note hero とトーン一貫性を保つが、文字量とサイズは X 専用に最適化。
- Threads 用には別生成（`threads-support-v1` を参照）。
- Substack header は note hero を共有するため、X hook とは別ファイル。

## Generation Prompt (paste-ready)

```text
1200x675 で生成してください。

X タイムライン向けの hook 画像です。

レイアウト:
- 画面中央に大きな日本語見出し『発信を頑張るより、発信が回る仕組みを作る。』を2〜3行で配置。
- 見出しの下に小さく『Hitori Media OS / development log』。
- 構造的なノードや矢印は使わない、または使ってもごく控えめに1〜2個まで。

スタイル:
- 背景は白〜薄いオフホワイト。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 余白を多めに、文字とコントラスト最優先。

避けるもの:
- 完全自動化、稼げる、AIに任せる時代などの煽り。
- 顔写真、人物、AI生成アバター。
- ロボットや脳のシンボル。
- グラデーション、光線、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標、絵文字の装飾。

ユースケース:
- X タイムラインの inline preview で読めるよう、視認性を最優先。
- スクロール中の1秒で内容が伝わること。
- 完成品の宣伝には見えないこと（building-in-public トーン）。

note 用 hero との一貫性を保ちつつ、X 用に文字量と装飾を控えめにしてください。
```

## Review Checklist

- [ ] 中央70%に重要要素が収まり、preview crop で文字が切れない
- [ ] note hero と色・font が一貫している
- [ ] note hero よりも装飾が控えめ
- [ ] 完成品の宣伝感がない
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 顔写真 / AI generated avatar なし
- [ ] 有料PDF教材本文が映っていない

## Inbox Candidate Path

候補画像は必ず以下に保存する。**final path には直接書かない**。

```text
assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。Visual Register Inbox Review の `approve & register` で初めて final path へ copy される。

## Save Path & Registration

- Final path（Visual Register が approve & register で copy 先）: `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる
  3. `x-hook-main-v1` の candidate（v00X）から採用版を選び `approve & register`
  4. patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json が作られたことを確認
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
