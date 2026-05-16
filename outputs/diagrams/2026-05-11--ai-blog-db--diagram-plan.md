# 図解・画像案

## 中心となるビジュアルアイデア

「記事の山」から「AIが使える知識DB」への転換を、一目で伝える。

中心メッセージ:

ひとつの構造化された知識レコードから、note、Substack、Threads、YouTube、Shorts、Podcast、Diagram、GitHub Docs へ展開できる。

## 方向性1: 構造図

レイアウト:

中央に大きく `contentIdea` のカードを置く。

カード内には、次の短いラベルを入れる。

- coreThesis
- audiencePain
- claims
- evidence
- examples
- objections
- platformAngles

中央カードから外側へ、複数の矢印を伸ばす。

出力先:

- note
- Substack
- Threads
- YouTube
- Shorts
- Podcast
- Diagram
- GitHub Docs

用途:

README、note記事内図解、YouTube内の説明スライド。

狙い:

「元レコードは1つ、出力は複数」というプロジェクト全体の思想を伝える。

## 方向性2: Before / After

レイアウト:

左側: Before「記事の山」

- note下書き
- SNSメモ
- 動画台本
- 音声メモ
- リサーチメモ

矢印が絡まっていて、毎回文脈を作り直している印象にする。

右側: After「AIが使えるDB」

- 1つの知識レコード
- 媒体別プロンプト
- 複数出力

右側は、整理された矢印で各媒体へ展開する。

用途:

Threads画像、Instagramカルーセル1枚目、YouTubeの冒頭説明。

狙い:

読者の悩みである「同じアイデアを何度も書き直している」を視覚化する。

## 方向性3: カルーセル

8枚構成案:

1. 表紙: これからのブログは「AIが使えるDB」になる
2. 問題: 同じアイデアを何度も書き直している
3. Before: 記事・SNS・動画台本がバラバラ
4. 解決: 元になる知識レコードを作る
5. 中身: 主張 / 根拠 / 具体例 / 反論 / 読者 / トーン
6. 展開: note / Substack / Threads / YouTube / Podcast
7. 方針: Manual first, API later
8. CTA: 次の記事を書く前に、まず1つの元レコードを作る

用途:

Instagramカルーセル、LinkedInスライド、note内の補助図。

狙い:

概念を順番に理解できるようにし、保存されやすい図解にする。

## おすすめ案

最初に作るなら、方向性2の Before / After がよいです。

理由:

- 読者の悩みが直感的に伝わる
- 「記事の山」と「AIが使えるDB」の差が分かりやすい
- note、Substack、YouTube、Instagramのどれにも転用しやすい
- 後から方向性1の構造図へ展開しやすい

## ラベル案・画面テキスト案

- 記事の山
- 毎回文脈を作り直す
- AIが使えるDB
- 1つの知識レコード
- 複数媒体へ展開
- Manual first
- API later
- Obsidian = 考える
- Sanity = 展開する

## 制作メモ

トーン:

シンプルで実用的。AI感を強く出しすぎず、発信ワークフローの図として見せる。

避けるもの:

- 派手なAI未来感
- 根拠のない数値
- 複雑すぎる矢印
- 小さすぎる文字

制作時の注意:

- 図内テキストは短くする。
- `contentIdea` を中心に置く場合は、フィールド名を増やしすぎない。
- noteやYouTubeで使う場合は横長、Instagramカルーセルでは縦長に再構成する。
- ObsidianとSanityのロゴや商標表現を使う場合は、公式素材の扱いを確認する。

## 人間による確認ポイント

- `coreThesis` が一目で伝わる設計になっているか
- 元レコードにない主張を足していないか
- note / Instagram / YouTube のどこで使う図か明確か
- 図内テキストが短く、制作しやすいか
- 保存先は `outputs/diagrams/` でよいか

