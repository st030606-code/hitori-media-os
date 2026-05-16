# Brief: note-hero-v1 (shared with substack-header-v1)

Priority: P1
Status: brief-ready

## Asset Metadata

- Asset ID: `note-hero-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.note-hero-v1`
- Shared with: `substack-header-v1`（同じ master file を使用）
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: note（同 master を Substack header / Social Preview にも使用）
- Asset Type: hero
- Aspect Ratio: 16:9
- Pixel size: 1456 x 816（note hero 1280x670 / Substack social preview にも適合）
- Reuse Policy: reusable

## Objective

building-hitori-media-os キャンペーンの **キービジュアル**。
note 記事冒頭と Substack Post ヘッダー / Social Preview の両方で使い、視覚的一貫性を保つ。

## Message

> 発信を頑張るより、発信が回る仕組みを作る。

building-in-public な開発ログ publication であることを1秒で伝える。完成版ツールの宣伝ではない。

## Audience

- ひとりで発信・商品化・メディア運営を進めたい個人
- AIワークフローを自分の運営に取り入れたいクリエイター・開発者・編集者
- 完成品の自慢より、開発過程と判断を読みたい読者

## Placement

- note 記事冒頭の hero / eye-catch
- Substack Post header
- Substack Social Preview image
- 必要なら note のSNSプレビューにも同じ画像

## Visual Style

`_style-guide.md` を参照。要点:

- 白〜薄オフホワイト背景
- 濃いネイビー or チャコールの主要テキスト
- 控えめなアクセント1色のみ
- sans-serif、ノードは丸角矩形
- 装飾過多や AI 未来感を避ける

## Layout Guidance

- 画面を左右2列に分ける。
- 左 50%: 大きな日本語見出し `発信を頑張るより、発信が回る仕組みを作る。` を2〜3行に折り返し。下に小さく `Hitori Media OS / development log / in progress`。
- 右 50%: ハブ&スポーク構造。中央に丸角矩形 `Content Idea`、そこから細い線で8ノード（`note` `Substack` `X` `Threads` `YouTube` `Shorts` `Podcast` `Instagram`）に放射状につながる。ノードは同じサイズ、ラベルは小さめ。
- 余白を多めに取る。情報密度より読みやすさを優先。

## Text To Include

- 発信を頑張るより、発信が回る仕組みを作る。
- Content Idea
- note / Substack / X / Threads / YouTube / Shorts / Podcast / Instagram（8ノードラベル）
- Hitori Media OS
- development log
- in progress

## Text To Avoid

- 完全自動化 / 全自動化
- AIが書く時代
- 稼げる / 誰でも
- API投稿
- 顔写真 / boss face
- 根拠のない数字、矢印に「↑1000%」のような煽り

## Reuse Notes

- master file 1枚で note hero / Substack header / Substack Social Preview の3用途をカバーする。
- 二重生成しない。Visual Register で1回だけ登録し、両方の visualAssetPlan に同じパスを手動入力する。

## Generation Prompt (paste-ready)

```text
1456x816 で生成してください。

Hitori Media OS のキービジュアルを作ります。

レイアウト:
- 画面を左右 50/50 に分ける。
- 左側: 大きな日本語見出し『発信を頑張るより、発信が回る仕組みを作る。』を2〜3行で配置。下に小さく『Hitori Media OS / development log / in progress』。
- 右側: 中央に丸角矩形のノード『Content Idea』を1つ置き、そこから細い線で8つのノード『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』へ放射状に接続。ノードは全て同じ丸角矩形、サイズ均一、ラベルは小さく。

スタイル:
- 背景は白〜薄いオフホワイト。
- 主要テキストとノード輪郭は濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 線は細め、装飾なし、グラデーション・光線・AI未来感なし。

避けるもの:
- 完全自動化や稼げる系の煽り、誇張表現。
- 顔写真、人物、AI生成アバター。
- ロボットや脳のシンボル。
- グラデーション、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標。

ユースケース:
- note 記事の hero / eye-catch、Substack Post header、Substack Social Preview の3用途で使う。
- 完成版ツール宣伝に見えないこと。building-in-public トーンを保つ。

文字量を控えめにし、構造（中央 Content Idea + 8ノード）が一瞬で読めるようにしてください。
```

## Review Checklist

- [ ] 文字が中央70%に収まっており、note / Substack の preview crop で切れない
- [ ] 8ノードがすべて読める
- [ ] 「完成版」の印象を与えない
- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が中心にある
- [ ] 顔写真 / 人物 / AIアバターなし
- [ ] アクセント色は1色のみ
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 有料PDF教材本文の引用が混ざっていない

## Inbox Candidate Path

候補画像は必ず以下に保存する。**final path には直接書かない**。

```text
assets/inbox/generated/building-hitori-media-os/note-hero-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。Visual Register Inbox Review の `approve & register` で初めて final path へ copy される。

## Save Path & Registration

- Final path（Visual Register が approve & register で copy 先）: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- Visual Register で登録:
  1. `npm run visual:register` で起動
  2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる
  3. `note-hero-v1` の candidate（v00X）から採用版を選び `approve & register`
  4. patches/visual-assets/building-hitori-media-os/note-hero-v1.json が作られたことを確認
- 同じ master file を `substack-header-v1` でも使うため、Visual Register で再登録 **しない**。Sanity Studio で両方の `localAssetPath` を手動で同じパスにする。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
