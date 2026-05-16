# Brief: note-inline-content-os-flow-v1

Priority: P2
Status: brief-ready

## Asset Metadata

- Asset ID: `note-inline-content-os-flow-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: note（inline）
- Asset Type: flow-diagram
- Aspect Ratio: 16:9
- Pixel size: 1600 x 900
- Reuse Policy: reusable

## Objective

note 記事 **第2章「中心にあるのは『1つの構造化されたContent Idea』」** の H2 直下に配置する inline 構造図。
1つの `Content Idea` レコードが、`主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口` を内部に持ち、そこから 8 媒体へ展開していくハブ&スポーク関係を見せる。

## Message

ひとり運営は「1つの Content Idea」を中心レコードとして持ち、媒体ごとに切り口だけ変えて派生させる。

## Audience

note 記事の長文読者。第2章まで進んで「中心レコードって具体的に何？」と疑問を持っている読者。

## Placement

- note 記事の本文第2章 H2 直下に配置。
- 図の前後に短い説明文があり、図単体で完結する必要はない（補助として置く）。

## Visual Style

`_style-guide.md` 準拠。inline 図は次を意識:

- 文字量より構造で語る
- 中央ノードを明確に1つだけ強調
- 8 ノードは均等サイズ・均等距離

## Layout Guidance

- 中央に大きめの丸角矩形 `Content Idea` を配置。
- そのノード内部（または直下）に小さく `主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口` の6項目を列挙。
- 中央ノードから細い線が放射状に8方向へ伸び、各端に小さな丸角矩形ノード `note` `Substack` `X` `Threads` `YouTube` `Shorts` `Podcast` `Instagram` を配置。
- 全ノードの大きさは中央以外を統一。色も統一。
- 装飾なし、白背景。

## Text To Include

- Content Idea
- 主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口
- note / Substack / X / Threads / YouTube / Shorts / Podcast / Instagram

## Text To Avoid

- 完全自動化 / API投稿
- AI記事生成 / AIで稼ぐ
- 完成

## Reuse Notes

- 同テーマで Substack inline / YouTube screen 補足としても転用可。reusable。

## Generation Prompt (paste-ready)

```text
1600x900 で生成してください（16:9 横長）。

note 記事内に埋め込む inline の構造図です。テーマは「1つの Content Idea から複数媒体へ展開する」。

レイアウト:
- 画面中央にやや大きめの丸角矩形ノードを配置し、その中に大きな日本語ラベル『Content Idea』。
- 中央ノードの内部または直下に、小さく『主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口』の6項目を縦リストか横並びで列挙。
- 中央ノードから細い線が放射状に8方向へ伸びる。
- 各線の端に小さな丸角矩形ノードを配置し、それぞれにラベル『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』を入れる。
- 8つのノードは全て同じ大きさ・同じ色・等距離。

スタイル:
- 背景は白。
- 線とノード輪郭は濃いネイビー or チャコールグレー。
- アクセントは1色のみ。中央ノード（Content Idea）に控えめに使う。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 装飾なし、影なし、グラデーションなし。

避けるもの:
- 完全自動化、API投稿、AI記事生成、AIで稼ぐといった煽り。
- 顔写真、人物、ロボット、脳のシンボル。
- ロゴ風表現、商標。

ユースケース:
- note 記事の長文中に埋め込む inline 図。
- 構造の正確さを優先し、装飾より読みやすさ。

文字量より、中央ノードと8ノードの関係が一瞬で読めることを優先してください。
```

## Review Checklist

- [ ] 中央ノードと8つの周辺ノードがはっきり区別できる
- [ ] 8ラベルが全て読める
- [ ] 中央ノードの中身（主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口）が読める
- [ ] 色数 3 色以内
- [ ] 装飾過多になっていない
- [ ] 顔写真 / AI generated avatar なし
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 有料PDF教材本文の図版が混ざっていない

## Inbox Candidate Path

候補画像は必ず以下に保存する。**final path には直接書かない**。

```text
assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。Visual Register Inbox Review の `approve & register` で初めて final path へ copy される。

## Save Path & Registration

- Final path（Visual Register が approve & register で copy 先）: `assets/visuals/building-hitori-media-os/note/inline/note-inline-content-os-flow-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる
  3. `note-inline-content-os-flow-v1` の candidate（v00X）から採用版を選び `approve & register`
  4. patches/visual-assets/building-hitori-media-os/note-inline-content-os-flow-v1.json が作られたことを確認
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
