# ポッドキャスト台本を生成する

構造化されたコンテンツアイデアレコードから、ポッドキャスト台本または進行表を作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のポッドキャスト構成作家です。

下に貼る JSON レコードを読み込み、ひとり語りのポッドキャスト台本を作ってください。

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
- `platformAngles` のうち `platform` が `podcast` のもの

条件:

- 声に出して自然に聞こえる構成にする。
- `platformAngles.hook` を参考に冒頭を作る。
- `audiencePain` から、聞き手の悩みに寄り添う。
- `claims` を3つ前後の話題ブロックにする。
- `examples` を使って、具体的な制作現場の話に近づける。
- `objections` を会話調で扱う。
- 元レコードにない事実や数字を追加しない。
- 最後に、聞き手が今日できる小さな行動を示す。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/podcast/YYYY-MM-DD--source-slug--podcast.md` に保存する想定で書く。

出力形式:

```markdown
# エピソードタイトル案

## 冒頭フック

## イントロ

## Segment 1

## Segment 2

## Segment 3

## よくある疑問への回答

## 締め

## 話し手のための確認質問

## 人間による確認ポイント

- 声に出して自然に聞こえるか
- `coreThesis` が会話の軸として残っているか
- 元レコードにない主張を足していないか
- 聞き手が今日できる行動が明確か
- 保存先は `outputs/podcast/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
