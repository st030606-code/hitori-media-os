---
campaignSlug: building-hitori-media-os
assetSlug: threads-support-diagram-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
assetPurpose: social-support-diagram
platform: threads
aspectRatio: 4:5
pixelSize: 1080x1350
candidateStrategy:
  - id: v001
    variant: diagram-first
  - id: v002
    variant: typography-hybrid
  - id: v003
    variant: metaphor-mix
  - id: v004
    variant: japanese-editorial-v1
styleAnchors:
  - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
  - assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
layoutPatterns:
  - centralHeroFourCards
  - hubAndSpoke
  - workflowPipeline
requiredVisualModules:
  - headline
  - centralNode
  - supportNodes
  - connectors
  - platformCards
  - summaryCopy
forbiddenPatterns:
  - text-only-title-card
  - robot-brain-cliche
  - neon-ai-glassmorphism
  - unreadable-small-text
phase: phase-admin-2a-prep
---

# Prompt Log — threads-support-diagram-v1

- contentSlug: `building-hitori-media-os`
- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1`
- targetPlatform: threads
- aspectRatio: 4:5
- pixelSize: 1080 x 1350
- generator: Codex CLI 0.120.0 (`-m gpt-5.4 --enable image_generation`)
- batch: Production Visual Generation Batch 2 (devlog 0109)
- date: 2026-05-17

## Style Anchors

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` (adopted hero)
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` (X 版、トーン揃え)

## 共通 Hard Rules (全 v00N)

- 出力先は `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v00N.png` のみ。
- final path（`assets/visuals/...`）には書き込まない。
- 既存ファイルを上書きしない。
- 図中に secret / token / 実 project ID / `private/` 配下のパス文字列を入れない。
- 顔写真・人物・AI generated avatar・ロボット・脳のシンボル禁止。
- 完全自動化 / 全自動化 / 稼げる / 誰でも / 保証 / 完成 を匂わせる語句禁止。
- 生成後に `git diff --stat` を取り、`assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/` 以外が変わっていたら停止して報告。

## v001 — diagram-first

> 構造図主体。文字はヘッドラインのみ。図のディテール (ノード輪郭・スポーク・サブラベル) で語る。

Base prompt:

```text
1080x1350 で生成してください（縦長 4:5）。

Threads フィード向けの縦長 supporting visual です。構造図を主役にし、文字はヘッドラインのみに絞ります。

レイアウト:
- 画面上 1/3: 日本語見出し『発信を頑張るより、仕組みを作る。』を2行で配置。
  - 行間ゆったり、左揃え or 中央揃え、余白多め。
- 画面下 2/3: 控えめな構造図。
  - 中央に丸角矩形ノード『Content Idea』を1つ、やや大きめに置く。
  - その下または周囲に小さなラベル『note』『Substack』『X』『Threads』を3〜4個、軽く放射状に配置（縦並びでも可）。
  - 中央から各サブノードへ細い線をつなぐ。
  - ノード輪郭は1ピクセル前後の細線、塗りつぶしなしか極薄。

スタイル:
- 背景は白〜薄ウォームグレー。
- 主要テキストは濃いネイビー（#1F2A44 付近）or チャコールグレー。
- アクセント色 1色のみ、サブノード『Content Idea』の輪郭か中央ノード塗りに控えめに使う（warm orange / muted amber 系）。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。日本語フォントは細め〜中ウエイト。
- 余白を多めに、X版より柔らかい印象。

避けるもの:
- 完全自動化 / 稼げる / 誰でも / 保証 / 完成 などの煽り文言。
- 顔写真、人物、AI generated avatar、ロボット、脳のシンボル。
- グラデーション、光線、ガラスフレア、ネオン、強い影。
- ロゴ風表現、商標、URL、トークン文字列。

ユースケース:
- Threads main post 用の縦長 inline 画像。
- preview crop は 4:5 / 1.91:1 / 1:1 が混在するので、ヘッドラインと中央ノードは画面中央 60% に収める。
- 文字密度を低く、構造で語ること。
```

## v002 — typography-hybrid

> ヘッドラインのタイポグラフィを主役に、図は補助的に下に小さく。

Base prompt:

```text
1080x1350 で生成してください（縦長 4:5）。

Threads 向け縦長 visual。タイポグラフィ主役、構造図は補助。

レイアウト:
- 画面上 1/2: 日本語見出し『発信を頑張るより、仕組みを作る。』を大きめに2行で配置。
  - 1行目『発信を頑張るより、』、2行目『仕組みを作る。』
  - ウエイトは中〜やや太め、行間は標準より少し広い。
  - 文字色は濃いネイビー or チャコール。
- 画面下 1/2: 控えめな構造図。
  - 中央に丸角矩形ノード『Content Idea』を1つ、小さめに配置。
  - 左右または下に小さな矩形ラベル『note』『Substack』『X』『Threads』を3〜4個、横並び or 浅い放射状で。
  - サブラベルは中央ノードの 60% サイズ以下。
  - 中央ノードとサブラベルを細線でつなぐ。

スタイル:
- 背景は白〜薄ウォームグレー。
- アクセント色 1色のみ、中央ノードか見出しの読点 or 句点に控えめに使う。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 装飾は最小限、影なし、グラデーションなし。

避けるもの:
- 完全自動化 / 稼げる / 誰でも / 保証 / 完成 系の煽り。
- 顔写真、人物、ロボット、脳のシンボル。
- ロゴ風表現、商標、URL、トークン文字列。

ユースケース:
- Threads main post の inline 画像。
- ヘッドラインで止めて、図でなぜを補強する流れ。
- preview crop 1.91:1 でも上半分のヘッドラインが読めること。
```

## v003 — metaphor-mix

> 構造図にやさしい比喩要素（手描き風点線・ふんわりした囲み）を一点だけ混ぜる。装飾過多にはしない。

Base prompt:

```text
1080x1350 で生成してください（縦長 4:5）。

Threads 向け縦長 visual。構造図に1点だけ控えめな比喩要素を加えます（手描き風点線 or 軽い囲み枠）。装飾過多禁止。

レイアウト:
- 画面上 1/3: 日本語見出し『発信を頑張るより、仕組みを作る。』を2行で配置。
- 画面下 2/3: やわらかい構造図。
  - 中央に丸角矩形ノード『Content Idea』を1つ、やや大きめに置く。
  - 中央ノードを取り囲むように、薄い手描き風点線の楕円 or 角丸枠を1つだけ追加（"仕組み" を示唆する控えめなメタファー）。
  - その点線枠の外側または内側に、小さなラベル『note』『Substack』『X』『Threads』を3〜4個、軽く放射状に配置。
  - 中央から各サブノードへ細線でつなぐ。
  - 比喩要素は1個まで。複数の囲みや矢印を盛らない。

スタイル:
- 背景は白〜薄ウォームグレー。
- 文字色は濃いネイビー or チャコール。
- アクセント色 1色のみ、点線枠か中央ノードのいずれかに控えめに使う。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 影なし、グラデーションなし、光線なし。

避けるもの:
- 完全自動化 / 稼げる / 誰でも / 保証 / 完成 系の煽り。
- 顔写真、人物、ロボット、脳のシンボル、AI clone face。
- ロゴ風表現、商標、URL、トークン文字列。
- 複数の比喩要素の盛り合わせ、装飾過多。

ユースケース:
- Threads main post の inline 画像。
- X 版より柔らかく、構造の存在感を残しつつ会話性を出す。
- preview crop 4:5 / 1.91:1 / 1:1 で重要要素が中央 60% に収まる。
```
