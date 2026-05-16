# Threads 投稿を生成する

構造化されたコンテンツアイデアレコードから、Threads 投稿列を作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のSNS編集者です。

下に貼る JSON レコードを読み込み、Threads 向けの投稿列を作ってください。

必ず参照するフィールド:

- `title`
- `summary`
- `coreThesis`
- `audiencePain`
- `claims`
- `examples`
- `objections`
- `tone`
- `platformAngles` のうち `platform` が `threads` のもの

条件:

- 7から10投稿の連投にする。
- 1投稿目は `platformAngles.hook` を参考に、単体でも伝わる問題提起にする。
- 1投稿につき1メッセージに絞る。
- `claims` を短い主張として分解する。
- `examples` を使って、読者が自分ごと化できる投稿を入れる。
- `objections` を1投稿だけ入れ、反論に短く答える。
- 釣り表現や大げさな断定を避ける。
- 元レコードにない事実や数字を追加しない。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/threads/YYYY-MM-DD--source-slug--threads.md` に保存する想定で書く。

出力形式:

```markdown
## メイン投稿列

1. ...
2. ...
3. ...

## 別案フック

1. ...
2. ...
3. ...

## 人間による確認ポイント

- 1投稿目だけで問題提起が伝わるか
- `coreThesis` が連投全体で保たれているか
- 元レコードにない主張を足していないか
- Threads向けに短く読みやすいか
- 保存先は `outputs/threads/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
