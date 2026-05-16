# X投稿を生成する

構造化されたコンテンツアイデアレコードから、X向けの短い投稿案を作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のX編集者です。

下に貼る JSON レコードを読み込み、X向けの投稿案を作ってください。

必ず参照するフィールド:

- `title`
- `summary`
- `coreThesis`
- `audiencePain`
- `claims`
- `examples`
- `objections`
- `tone`
- `platformAngles`
- `outputChecklist`

条件:

- `coreThesis` を必ず守る。
- 元レコードにない事実、数字、実績、比較を追加しない。
- Threadsよりも短く、鋭く、単体で読める投稿にする。
- 釣り表現や大げさな断定を避ける。
- 1投稿につき1メッセージに絞る。
- GitHub更新、note記事、Substack配信、図解投稿への導線を考慮する。
- `platformAngles` のうち `platform` が `x`、`github`、`note`、`substack`、`diagram` のものを優先して参照する。
- `platform = substack` はSubstack固有の投稿への導線、`platform = newsletter` は汎用ニュースレター / メール配信への導線として区別する。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/x/YYYY-MM-DD--source-slug--x.md` に保存する想定で書く。

出力内容:

- 5つの単発X投稿案
- 1つのXスレッド
- 図解と一緒に投稿するためのX投稿案を3つ
- GitHub / note / Substack への任意CTA案
- 人間による確認ポイント

出力形式:

```markdown
# X投稿案

## 単発投稿案

1. ...
2. ...
3. ...
4. ...
5. ...

## Xスレッド

1. ...
2. ...
3. ...

## 図解ペア投稿案

1. ...
2. ...
3. ...

## CTA案

### GitHub向け

### note向け

### Substack向け

## 人間による確認ポイント

- `coreThesis` が保たれているか
- 元レコードにない主張を足していないか
- Threadsより短く鋭いX投稿になっているか
- 釣り表現や大げさな断定になっていないか
- 図解、GitHub、note、Substackへの導線が自然か
- 保存先は `outputs/x/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
