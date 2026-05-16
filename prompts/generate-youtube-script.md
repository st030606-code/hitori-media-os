# YouTube 長尺台本を生成する

構造化されたコンテンツアイデアレコードから、YouTube 長尺動画の台本を作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のYouTube構成作家です。

下に貼る JSON レコードを読み込み、10から15分程度の教育・解説動画台本を作ってください。

必ず参照するフィールド:

- `title`
- `summary`
- `coreThesis`
- `audience`
- `audiencePain`
- `claims`
- `evidence`
- `examples`
- `objections`
- `tone`
- `platformAngles` のうち `platform` が `youtube` のもの

条件:

- `platformAngles.hook` を参考に、強いコールドオープンを作る。
- `audiencePain` を使って、視聴者が見る理由を早めに示す。
- `claims` を3から5章の構成に分解する。
- 各章で `evidence` または `examples` を使う。
- 図解、画面収録、JSON例、Bロールが必要な箇所を明記する。
- `objections` をもとに、よくある反論への回答を入れる。
- 元レコードにない事実や数字を追加しない。
- 話し言葉として自然にする。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/youtube/YYYY-MM-DD--source-slug--youtube.md` に保存する想定で書く。

出力形式:

```markdown
# 動画タイトル案

## コールドオープン

## イントロ

## Chapter 1

## Chapter 2

## Chapter 3

## 反論への回答

## 締め・CTA

## 映像メモ

## 人間による確認ポイント

- `coreThesis` が動画全体の軸になっているか
- 章立てが視聴者の理解順になっているか
- 元レコードにない主張を足していないか
- 映像メモが制作に使える具体性を持っているか
- 保存先は `outputs/youtube/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
