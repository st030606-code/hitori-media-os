# Brief: substack-inline-reader-system-v1

Priority: P3
Status: brief-ready

## Asset Metadata

- Asset ID: `substack-inline-reader-system-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: Substack（inline）
- Asset Type: section-diagram
- Aspect Ratio: 16:9
- Pixel size: 1456 x 816
- Reuse Policy: platform-specific

## Objective

Substack Post の **「Reader-List Connection」節** に配置する inline 役割分担図。
X / Threads = discovery、Substack Post + Notes = email & trust、note = Japanese archive、YouTube / Podcast = deeper trust という pipeline 設計を1枚で示す。

## Message

Substack を中心とした reader-list 設計。X / Threads が入口、Substack が信頼形成、note がアーカイブ、YouTube / Podcast が深い信頼。

## Audience

Substack Post を読み進めて「他媒体とどう使い分けるんだろう？」と疑問を持っている読者。subscribers / 制作ログ視点の読者。

## Placement

- Substack Post の `Reader-List Connection` 節の冒頭または末尾に配置。
- Substack エディタの上限解像度（横幅 1456px 推奨）に合わせる。

## Visual Style

- 4列の役割分担、列の幅は均等
- 情報量を絞り、各列に「ラベル + 媒体名 + 30字以内の役割説明」
- subscriber 強調部分だけアクセント色

## Layout Guidance

- 画面を縦に4列に分割。区切りは細い縦線。
- 各列の構造（上から下へ）:
  1. 列タイトル（英字小ラベル + 日本語短い説明）
  2. 媒体名（短いラベル）
  3. 役割説明文（30字以内）
- 中央の `email & trust: Substack Post + Notes` 列の中、または列の下に小さく `subscriber` を主要資産として強調する記号またはピル。これだけアクセント色を使う。
- 全体の構図はカードレイアウト風。

### 4列構成

| 列 | ラベル | 媒体名 | 役割（30字以内目安） |
| --- | --- | --- | --- |
| 1 | discovery | X / Threads | 短い主張で発見・会話を作る |
| 2 | email & trust | Substack Post + Notes | email で届く信頼関係と subscriber 資産 |
| 3 | Japanese archive | note | 日本語検索・archive・信頼形成 |
| 4 | deeper trust | YouTube / Podcast | 長尺と音声で深い信頼を作る |

## Text To Include

- discovery / X / Threads / 短い主張で発見・会話を作る
- email & trust / Substack Post / Substack Notes / email で届く信頼関係と subscriber 資産
- Japanese archive / note / 日本語検索・archive・信頼形成
- deeper trust / YouTube / Podcast / 長尺と音声で深い信頼を作る
- subscriber（強調）

## Text To Avoid

- 完全自動化
- 稼げる / 誰でも
- 保証
- 完成

## Reuse Notes

- Substack 専用。note inline には別構成を使うこと。
- 将来 paid 検討時には別 variant が必要になる可能性。

## Generation Prompt (paste-ready)

```text
1456x816 で生成してください（16:9 横長）。

Substack Post 内に埋め込む inline section diagram です。テーマは「discovery → Substack → archive → deeper trust の役割分担」。

レイアウト:
- 画面を縦に4列に等分割する。列の間は細い縦線で区切る。
- 各列に上から下へ3層:
  1. 列タイトル（英字の小ラベル + 日本語の短い説明）
  2. 媒体名
  3. 役割説明文（30字以内）

列1: discovery / X / Threads / 短い主張で発見・会話を作る
列2: email & trust / Substack Post / Substack Notes / email で届く信頼関係と subscriber 資産
列3: Japanese archive / note / 日本語検索・archive・信頼形成
列4: deeper trust / YouTube / Podcast / 長尺と音声で深い信頼を作る

強調:
- 列2の中、または列2の下に小さく『subscriber』を強調するピル状の記号またはラベルを置く。
- アクセント色1色は subscriber 強調部分のみに使う。

スタイル:
- 背景は白。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは1色のみ（subscriber 強調）。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 装飾なし、影なし、グラデーションなし。

避けるもの:
- 完全自動化、稼げる、誰でも、保証、完成といった煽り。
- 顔写真、人物。
- ロボットや脳のシンボル。
- ロゴ風表現、商標。

ユースケース:
- Substack Post の long-form 中に埋め込む役割分担図。
- 4列の関係が一瞬で読み取れること。
- 列のラベル / 媒体名 / 役割説明文 がそれぞれ独立した行で見えること。
```

## Review Checklist

- [ ] 4列が均等幅で分割されている
- [ ] 各列のラベル / 媒体名 / 役割説明文 が読める
- [ ] subscriber 強調がアクセント色1色だけで実現されている
- [ ] 完成品の宣伝感がない
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文の図版が混ざっていない

## Inbox Candidate Path

候補画像は必ず以下に保存する。**final path には直接書かない**。

```text
assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。Visual Register Inbox Review の `approve & register` で初めて final path へ copy される。

## Save Path & Registration

- Final path（Visual Register が approve & register で copy 先）: `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる
  3. `substack-inline-reader-system-v1` の candidate（v00X）から採用版を選び `approve & register`
  4. patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json が作られたことを確認
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
