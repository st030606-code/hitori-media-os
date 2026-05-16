# 0026: 最初のビジュアル生成ブリーフを作成

日付: 2026-05-12

## 背景

`diagramPlan` seedと `docs/09-visual-asset-strategy.md` により、ビジュアル制作の概念計画と配置戦略は整理できました。

次に必要なのは、実際に最初の1枚を作る前の具体的な生成ブリーフです。

今回は画像ファイルは作らず、note hero / eye-catch用のブリーフだけを作成しました。

## 決定・変更

`docs/13-first-visual-generation-brief.md` を追加しました。

最初に作るビジュアルは、Before / After図解をベースにしたnote hero / eye-catchにします。

採用する `diagramPlan`:

```text
diagramPlan.ai-blog-db.before-after
```

## なぜBefore / Afterを最初にするか

このプロジェクトの中心には、次の対比があります。

- Before: 記事、SNSメモ、動画台本、音声メモ、リサーチメモが散らばっている
- After: 1つの構造化された知識レコードから複数媒体へ展開できる

この対比は、note記事の読者にとって直感的です。

また、note hero / eye-catchだけでなく、X hook画像、Instagramカルーセル表紙、YouTube動画内スライドにも展開できます。

## ブリーフに含めたもの

- purpose
- target platform
- placement
- aspect ratio
- visual direction
- main message
- text to include
- text to avoid
- reusable variants
- draft image prompt
- review checklist

## no-API MVPの維持

今回の変更はドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

実画像ファイルも作成していません。

## 次の一手

次は、ユーザーが明示的に依頼した場合に、`docs/13-first-visual-generation-brief.md` をもとに `16:9` のnote hero / eye-catchを1枚生成します。

生成後は、次を確認します。

- note記事の中心主張が一目で伝わるか。
- Before / Afterの差が直感的に分かるか。
- 図内テキストが読みやすいか。
- XやInstagramへ再構成できそうか。
