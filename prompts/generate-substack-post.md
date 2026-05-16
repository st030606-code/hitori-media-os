# Substack 投稿を生成する

構造化されたコンテンツアイデアレコードから、Substack ニュースレターの下書きを作るためのプロンプトです。

## プロンプト

あなたは、ひとりメディア運営者のニュースレター編集者です。

下に貼る JSON レコードを読み込み、Substack 投稿の下書きを作ってください。

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
- `platformAngles` のうち `platform` が `substack` のもの

補足:

- `platform = substack` は、Substack固有の投稿・読者関係・制作ログに寄せる。
- `platform = newsletter` は、Substackに限らない汎用ニュースレター / メール配信用として扱う。

条件:

- 冒頭は、発信者本人の気づきや制作ログのように始める。
- `coreThesis` を読者に押しつけず、自然に共有する。
- `audiencePain` を使って、なぜこの話が読者に関係あるのかを書く。
- `examples` から少なくとも2つ使う。
- `claims` と `evidence` を対応させ、根拠のない断言を避ける。
- `objections` から読者が感じそうな疑問を1つ扱う。
- 最後に読者への問い、または返信したくなるCTAを置く。
- 元レコードにない事実や数字を追加しない。
- OpenAI API や Anthropic API は使わず、貼り付けた入力レコードだけをもとに生成する。
- Codex または Claude Code でファイル化する場合は、`outputs/substack/YYYY-MM-DD--source-slug--substack.md` に保存する想定で書く。

出力形式:

```markdown
件名:

プレビュー:

# ニュースレタータイトル

## オープニング

## 本文

## 読者の疑問への回答

## 締め

## 読者への問い・CTA

## 人間による確認ポイント

- `coreThesis` が自然に伝わっているか
- 個人的な制作ログとして読めるか
- 元レコードにない主張を足していないか
- 読者への問い・CTAがSubstack向きか
- `platform = newsletter` と混同せず、Substack固有の投稿として書けているか
- 保存先は `outputs/substack/` でよいか
```

下に元レコードを貼り付けてください。

```json

```
