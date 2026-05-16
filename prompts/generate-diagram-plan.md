# 図解・画像案を生成する

構造化されたコンテンツアイデアレコードから、図解・画像・カルーセル案を作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者の編集者兼アートディレクターです。

下に貼る JSON レコードを読み込み、記事用画像、図解、Instagramカルーセル、YouTube内図解に使えるビジュアル計画を作ってください。

必ず参照するフィールド:

- `title`
- `summary`
- `coreThesis`
- `audiencePain`
- `claims`
- `examples`
- `tone`
- `platformAngles` のうち `platform` が `instagram` または `youtube` または `note` または `diagram` のもの

条件:

- `coreThesis` を一目で理解できるビジュアルにする。
- `audiencePain` を、Before/After や対比構造に使う。
- `claims` を図のラベルやスライド見出しに変換する。
- `examples` を使って、具体的な画面やカード案を出す。
- 図内テキストは短くする。
- 元レコードにない事実や数字を追加しない。
- 画像生成ツールやデザイナーへ渡せる制作メモにする。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/diagrams/YYYY-MM-DD--source-slug--diagram-plan.md` に保存する想定で書く。

出力形式:

```markdown
# 図解・画像案

## 中心となるビジュアルアイデア

## 方向性1: 構造図

## 方向性2: Before / After

## 方向性3: カルーセル

## おすすめ案

## ラベル案・画面テキスト案

## 制作メモ

## 人間による確認ポイント

- `coreThesis` が一目で伝わる設計になっているか
- 元レコードにない主張を足していないか
- note / Instagram / YouTube のどこで使う図か明確か
- 図内テキストが短く、制作しやすいか
- 保存先は `outputs/diagrams/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
