# ビジュアルアセット配置戦略

このドキュメントは、実際の画像生成に入る前に、どの媒体にどんなビジュアルが必要かを整理するための設計メモです。

現時点では、実画像ファイルは作成しません。

## diagramPlan と配置計画の違い

`diagramPlan` は、概念レベルのビジュアル計画です。

例:

- Before / After
- Obsidian vs Sanity
- Manual first, API later
- Content OS pipeline
- Instagram carousel

一方で、ビジュアルアセット配置計画は、媒体ごとの実運用計画です。

例:

- noteのアイキャッチに何を使うか。
- note本文のH2下にどの図を置くか。
- Xの最初の投稿にどの図を添えるか。
- YouTubeサムネイルと動画内スライドを分けるか。
- GitHub READMEにどの構造図を置くか。

つまり、`diagramPlan` は「何を図解するか」を扱い、配置計画は「どこで、何枚、どの比率で、どう使うか」を扱います。

## 媒体別ビジュアルアセット表

| platform | 必要なビジュアル | 配置例 | 数量目安 | 再利用 / 専用 | 優先度 |
| --- | --- | --- | --- | --- | --- |
| note | アイキャッチ、本文内の主概念図、H2/H3下の補助図 | 記事トップ、導入後、Obsidian/Sanity説明箇所、まとめ前 | 2-4 | 多くは再利用可。アイキャッチはnote向け調整 | 高 |
| Substack | ヘッダー画像、本文内図解 | メール冒頭、ビルドログの設計説明、次回予告前 | 1-3 | note図解を軽く調整して再利用 | 中 |
| X | hook画像、図解ペア投稿、スレッド途中の補助図 | 1投稿目、図解ペア投稿、GitHub更新告知 | 2-4 | 専用の短い文言に調整 | 高 |
| Threads | hook画像、スレッド補助図 | 1投稿目、途中の概念整理、最後のCTA | 1-3 | X用画像をやや柔らかくして再利用 | 中 |
| Instagram | カルーセル表紙、各スライド、CTAスライド | フィード投稿、保存向けカルーセル | 4-8 | 専用制作が必要 | 高 |
| YouTube | サムネイル、動画内説明スライド、章扉 | 動画サムネイル、導入、構造説明、まとめ | 3-6 | サムネイルは専用。説明スライドは再利用可 | 中 |
| Shorts | 縦長フック画像、画面内テキスト背景 | 冒頭1秒、主張提示、CTA | 1-3 | 縦長専用が必要 | 低 |
| Podcast | カバー画像、エピソード用静止画 | 配信ページ、告知投稿、YouTube静止画版 | 1-2 | note / YouTube素材を調整 | 低 |
| GitHub | READMEアーキテクチャ図、スキーマ関係図、パイプライン図 | README冒頭、docs、設計説明 | 2-4 | 高い再利用性 | 高 |
| paid article / course material | 講義用スライド図、章まとめ図、ワークシート図 | 有料記事の章頭、教材スライド、演習前 | 4-10 | 専用化が必要 | 中 |

## 推奨ビジュアルカテゴリ

- hero image / eye-catch
- section diagram
- comparison diagram
- flow diagram
- architecture diagram
- schema relationship diagram
- pipeline diagram
- carousel slide
- hook image
- thumbnail
- paired post visual
- summary diagram
- CTA visual

## 推奨優先順位

このプロジェクトでは、次の順で作るのが現実的です。

1. note hero / eye-catch
2. note main concept diagram
3. X hook diagram
4. Instagram carousel cover + first 3 slides
5. GitHub architecture diagram
6. YouTube thumbnail
7. YouTube in-video explanation slides
8. Substack header / inline diagrams

理由:

- 最初にnoteとXで思想を見せると、反応を確認しやすい。
- Instagramカルーセルは保存性が高いが、制作枚数が増えるため最初は表紙と3枚だけで検証する。
- GitHub architecture diagramは、開発者向けにプロジェクト構造を伝える資産になる。
- YouTubeとSubstackのビジュアルは、文章・図解の検証後に作った方がズレにくい。

## 再利用戦略

ひとつの `diagramPlan` から、複数のビジュアルアセットを作れます。

### Before / After

用途:

- note本文内の比較図
- X hook画像
- Instagramカルーセルの2枚目または3枚目
- YouTube動画内スライド

調整ポイント:

- Xでは文字を減らして一目で分かる構成にする。
- noteでは少し説明的にしてもよい。
- YouTubeでは16:9にして、話しながら見せやすくする。

### Obsidian vs Sanity

用途:

- note本文内の役割分担図
- Substackビルドログの補助図
- X / Threads投稿の添付画像
- Instagramカルーセルの中盤スライド
- GitHub docsの設計説明

調整ポイント:

- 商標やロゴの扱いに注意する。
- 公式ロゴを使わず、抽象アイコンとテキストだけで表現してもよい。

### Content OS pipeline

用途:

- GitHub READMEのアーキテクチャ図
- noteの主概念図
- YouTube動画内の説明スライド
- 将来ダッシュボードの説明図

調整ポイント:

- GitHubでは構造を正確にする。
- noteやYouTubeでは、初見でも分かるように要素を減らす。
- 将来ダッシュボードでは、現在位置や状態を見せるUIにつなげる。

## 画像生成前に確認すること

実際の画像生成に入る前に、次を確認します。

- どの媒体で最初に使う画像か。
- その画像は再利用前提か、媒体専用か。
- 必要なアスペクト比は何か。
- 図内テキストは短いか。
- 元の `contentIdea` にない主張を足していないか。
- note / X / Instagram / GitHub のどれで反応を見たいか。
- 先に文章下書きを直すべき箇所がないか。

## 将来スキーマメモ

将来的には、`diagramPlan` とは別に、次のようなスキーマを追加する可能性があります。

- `visualAssetPlan`
- `visualPlacementPlan`

役割:

- `diagramPlan`: 概念レベルの図解案
- `visualAssetPlan`: 実際に作るアセット単位の計画
- `visualPlacementPlan`: どの媒体のどの位置に置くかの配置計画

候補フィールド:

- `sourceContentIdea`
- `sourceDiagramPlan`
- `targetPlatform`
- `assetType`
- `placement`
- `purpose`
- `aspectRatio`
- `reusePolicy`
- `status`
- `localAssetPath`
- `pairedOutput`
- `reviewNotes`

ただし、現時点ではスキーマ実装しません。

まずは `docs/09-visual-asset-strategy.md` で運用を整理し、実際に最初の数枚を作ってから、スキーマ化する価値があるかを判断します。

## 次の一手

画像生成の前に、まずは次を選びます。

1. 最初に作るnote hero / eye-catchの方向性
2. note main concept diagramの元にする `diagramPlan`
3. X hook diagramとして使う文言
4. GitHub architecture diagramに含める要素

その後、1枚ずつ生成・レビューし、使えるものだけを正式なアセットとして残します。
