# note 記事を生成する

構造化されたコンテンツアイデアレコードから、note 記事の下書きを作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のための編集者です。

下に貼る JSON レコードを読み込み、note 記事の下書きを作ってください。

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
- `platformAngles` のうち `platform` が `note` のもの

条件:

- `coreThesis` を記事全体の中心に置く。
- `audiencePain` から導入を作る。
- `claims` を見出しや本文の骨格にする。
- `evidence` と `examples` を使って、抽象論だけで終わらせない。
- `objections` を1つ以上扱い、読者の不安に答える。
- `tone.voice` に合わせ、`tone.avoid` にある表現を避ける。
- 元レコードにない事実や数字を追加しない。
- noteらしく、読み物として自然な流れにする。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/note/YYYY-MM-DD--source-slug--note.md` に保存する想定で書く。

出力形式:

```markdown
# タイトル案

サブタイトル案

## 導入

## 本文

### 見出し1

### 見出し2

### 見出し3

## 反論への回答

## 締め

## 人間による確認ポイント

- `coreThesis` が変わっていないか
- 元レコードにない主張を足していないか
- note記事として読める自然な流れになっているか
- 公開前に確認すべき根拠や表現はあるか
- 保存先は `outputs/note/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
