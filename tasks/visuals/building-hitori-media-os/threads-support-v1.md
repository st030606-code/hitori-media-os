# Brief: threads-support-v1

Priority: P2
Status: brief-ready

## Asset Metadata

- Asset ID: `threads-support-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.threads-support-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: Threads
- Asset Type: paired-post-visual
- Aspect Ratio: 4:5
- Pixel size: 1080 x 1350（Threads 縦長投稿に最適）
- Reuse Policy: variant-required

## Objective

Threads main post に添える **縦長の supporting visual**。会話・関係づくり媒体役割に合わせ、X よりも柔らかく、文字密度を低くする。

## Message

> 発信を頑張るより、仕組みを作る。

短い変形版（X の `〜回る仕組みを作る。` より、口語的に短縮）。

## Audience

Threads フィードで偶然この投稿を見た発信者。タップして本文を読む or 返信する手前の温度感。

## Placement

- Threads main post の inline 画像。
- 必要なら reply chain の中盤に挟む補助としても使用可（要レビュー）。

## Visual Style

`_style-guide.md` 準拠。Threads 用に次を意識:

- 縦長レイアウト、余白多め
- X / note と同じ base / accent
- 装飾より会話性、柔らかさ

## Layout Guidance

- 画面上 3 分の 1: 日本語見出し `発信を頑張るより、仕組みを作る。` を2行で配置。
- 画面下 3 分の 2: 控えめな構造図。中央に `Content Idea` ノード1つ、その下に小さなラベル `note` `Substack` `X` `Threads` の3〜4個を縦並びまたは少し放射状に配置。
- 装飾要素は最小限。背景余白を多くする。

## Text To Include

- 発信を頑張るより、仕組みを作る。
- Content Idea
- note / Substack / X / Threads（3〜4ラベル、Threads を強調しない程度に）

## Text To Avoid

- 完全自動化
- 稼げる / 誰でも
- 完成
- 顔写真

## Reuse Notes

- X の hook を縦長に引き伸ばさない。Threads 用に再構成する。
- 配色とフォントは X / note と一貫させる。

## Generation Prompt (paste-ready)

```text
1080x1350 で生成してください（縦長 4:5）。

Threads フィード向けの縦長 supporting visual です。

レイアウト:
- 画面上 3 分の 1 に日本語見出し『発信を頑張るより、仕組みを作る。』を2行で配置。
- 画面下 3 分の 2 に控えめな構造図。中央に丸角矩形のノード『Content Idea』を1つ、その下または周囲に小さなラベル『note』『Substack』『X』『Threads』を3〜4個、縦並びまたは少し放射状に配置。
- ノードとラベルは小さめ、装飾は最小限。

スタイル:
- 背景は白〜薄ウォームグレー。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 余白を多めに、Xよりも視覚的にやわらかく。

避けるもの:
- 完全自動化や稼げる系の煽り。
- 顔写真、人物、AI生成アバター。
- ロボットや脳のシンボル。
- グラデーション、光線、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標。

ユースケース:
- Threads main post の inline 画像。
- 会話・関係づくり媒体に合うやわらかい温度感。
- preview crop は 4:5 / 1.91:1 / 1:1 が混在するので、重要要素は中央 60% に収める。

X 版とトーンの色は揃えつつ、Threads 用に文字量と装飾を控えめにしてください。
```

## Review Checklist

- [ ] 縦長で読んでも横長 crop で読んでも、見出しと中央ノードが見える
- [ ] X 版とトーンが揃っている
- [ ] X 版より柔らかい印象
- [ ] 完成品の宣伝感がない
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文が映っていない

## Save Path & Registration

- Save to: `assets/visuals/building-hitori-media-os/threads/support/threads-support-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Content Idea filter = `contentIdea.building-hitori-media-os`
  3. visualAssetPlan `threads-support-v1` を選択
  4. 画像 drop → 登録
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
