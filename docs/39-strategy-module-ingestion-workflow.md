# Strategy Module Ingestion Workflow

日付: 2026-05-14

Hitori Media OSは、新しく購入した教材、PDF、Brain記事、講座、戦略メモを取り込みながら成長する設計にします。

ただし、教材本文を長くコピーして保存する場所にはしません。

## Workflow

### 1. Upload Source

教材PDF、講座メモ、Brain記事、個人メモをローカルに置きます。

### 2. Extract Strategy Principles

本文をそのまま移すのではなく、次を抽出します。

- principle
- checklist
- workflow
- prompt idea
- schema recommendation
- packaging requirement
- human review point

### 3. Convert To Content OS Assets

抽出した内容を、次へ変換します。

- checklist
- prompt templates
- schema recommendations
- workflow changes
- publish package additions
- dashboard requirements
- devlog

### 4. Avoid Verbatim Copying

長い本文引用はしません。

必要な場合でも、短い言い換えや要約にします。

購入教材は、Content OSの内部戦略として抽象化します。

### 5. Store As Strategy Module

将来のschema候補:

- strategyModule
- learningSource

保存する項目:

- sourceName
- sourceType
- summary
- principles
- checklists
- promptTemplates
- schemaRecommendations
- workflowChanges
- copyrightNotes

### 6. Link To Content OS Pipeline

Strategy Moduleは、Content Idea、Campaign Plan、Publish Package、Promptへ接続します。

### 7. Use The Module

次回以降の出力で、Strategy Moduleを参照します。

例:

- Substack Postを書くときにSubstack Strategy Moduleを参照する
- YouTube台本を書くときにYouTube Strategy Moduleを参照する
- sales pageを書くときにSales Strategy Moduleを参照する

## Example: Substackの教科書

Strategy Module:

```text
Substackの教科書
```

Outputs:

- Substack strategy docs
- Substack prompt templates
- Substack package checklist
- reader-list growth workflow
- Substack schema recommendations

## Safety

- 自動投稿しない
- API連携しない
- 教材本文を長く複製しない
- 著作権上の扱いをdevlogに残す
- 人間レビューを挟む

## Private paid source handling

購入した教材PDF、有料Brain記事、講座スライド、購入者向けテンプレートなどは、`private/` 配下に置きます。

- `private/sources/<topic>/<file>` に保存する（例: `private/sources/substack/substack-textbook-brain-2026-04-30.pdf`）。
- `private/` は `.gitignore` で除外されているため、git にも GitHub にもアップロードされません。
- 元の有料PDF、有料素材、購入者向けファイルそのものは絶対にcommitしません。
- 著作権で保護された長文を docs にコピーしません。
- 教材内のスクリーンショット、表、コピー＆ペーストした生テキスト、購入用URLは公開リポジトリに含めません。

教材の中身は、次の形にだけ変換します。

- `docs/strategy-sources/<source-name>-notes.md`: 抽象化メモ（principles、checklist、prompt input、implication）
- `docs/strategy-modules/<module-name>.md`: 実装向けStrategy Module
- `prompts/...`: プロンプトテンプレート
- 既存checklist / Publish Packageの拡張
- schema候補（提案docs / 将来のSanity schema）
- devlog / handoff（判断ログ）

handoffファイルでは、抽出済みの成果物（notes / modules / prompts / checklist updates）への参照だけを書きます。private/配下の生PDFパスは「local-only source」として記載してよいですが、内容を抜粋しません。

教材のreferenceが必要なときは、購入者本人がローカルで `private/sources/...` を直接開いてください。Hitori Media OSのコードベース側では、`private/` の中を読みに行く処理を実装しません。
