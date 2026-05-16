# Substack Strategy Integration

日付: 2026-05-14

## 背景

購入済みのSubstack教材インサイトを、Hitori Media Lab Content OSの戦略と設計に統合しました。

Substackを単なる `platformOutput` として扱うのではなく、publication、email、Notes、archive、subscriber listを持つ中核レイヤーとして扱います。

## 決定・変更

- `docs/35-substack-strategy-integration.md` を追加しました。
- `docs/36-substack-content-os-pipeline.md` を追加しました。
- `docs/37-substack-schema-extension-plan.md` を追加しました。
- Substack専用promptを6つ追加しました。
- Publish Package BuilderにSubstack packageを追加しました。
- READMEとPhase 2計画を更新しました。

## 追加したプロンプト

- `prompts/substack-positioning.md`
- `prompts/substack-about-page.md`
- `prompts/substack-welcome-email.md`
- `prompts/substack-post.md`
- `prompts/substack-notes.md`
- `prompts/substack-growth-actions.md`

## Publish Package

`npm run publish:package` で次が作成されるようになりました。

```text
publish-packages/substack/ai-blog-db/
├── README.md
├── post.md
├── notes.md
├── title-options.md
├── subscribe-cta.md
├── repurpose-map.md
└── checklist.md
```

Substack packageは、投稿本文だけでなく、Notes、title options、subscribe CTA、repurpose mapを含めます。

## 理由

Substackは、単に記事を置く場所ではありません。

Content OSにおいては、XやThreadsで発見され、noteで検索/アーカイブされ、Substack Notesで交流し、Substack Postでemail配信と信頼形成を行い、subscriber listを育てる流れが重要です。

## 注意

PDF本文の長文引用はしていません。

この統合は、教材インサイトをContent OS向けの戦略、ワークフロー、schema案、prompt案へ抽象化したものです。

## 検証

- `node --check tools/publish-package-builder/build.mjs`: 成功
- `npm run publish:package`: 成功
- `npm run build`: 成功

## 次の一手

次は、`substackPublicationStrategy` を最初のSubstack専用schemaとして実装するか、まずpromptとpublish packageを使って人間レビューするかを決めます。
