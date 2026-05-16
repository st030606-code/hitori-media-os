# 最初のビジュアル生成ブリーフ: note hero / eye-catch

## 結論

最初に作るビジュアルは、Before / After図解をベースにしたnote hero / eye-catchにします。

採用する `diagramPlan`:

```text
diagramPlan.ai-blog-db.before-after
```

理由:

- 記事の中心主張が一目で伝わる。
- 「記事を増やす」から「AIが使えるDBを作る」への転換が直感的に見える。
- noteのアイキャッチだけでなく、X hook画像、Instagramカルーセル表紙にも再利用しやすい。

## purpose

note記事の冒頭で、読者に次の対比を一瞬で伝える。

- Before: 記事、SNSメモ、動画台本、音声メモ、リサーチメモが散らばっている状態
- After: 1つの構造化された知識レコードから、複数媒体へ展開できる状態

この画像は、本文を読む前に「これは単なるブログ論ではなく、発信ワークフローの再設計の話だ」と伝えるために使います。

## target platform

主対象:

- note

再利用候補:

- X hook image
- Instagram carousel cover
- Substack header
- YouTube in-video explanation slide

## placement

主配置:

- note記事のhero / eye-catch

再利用時の配置:

- X: 1投稿目または図解ペア投稿
- Instagram: カルーセル表紙または2枚目
- Substack: 投稿冒頭のヘッダー画像
- YouTube: 導入直後の説明スライド

## aspect ratio

第一候補:

- `16:9`

理由:

- noteのアイキャッチとして使いやすい。
- YouTube動画内スライドにも転用しやすい。
- GitHubやSubstackの横長説明図にも流用しやすい。

再利用候補:

- X向け: `1:1`
- Instagramカルーセル向け: `4:5`

最初は `16:9` で作り、良ければ `1:1` と `4:5` に再構成します。

## visual direction

左右比較のシンプルな図解にします。

左側:

- Before
- 記事の山
- 散らばったメモや下書き
- 絡まった矢印
- 毎回文脈を作り直す印象

右側:

- After
- AIが使えるDB
- 1つの知識レコード
- 媒体別プロンプト
- note / Substack / X / YouTube / Podcast などへ整理された矢印

全体トーン:

- シンプル
- 実用的
- 白背景または明るい背景
- 黒文字中心
- アクセントカラーは控えめ
- 派手なAI未来感より、発信ワークフローの図として見せる

## main message

記事を増やすより、AIが使えるDBを作る。

## text to include

図内に入れる文字は短くします。

優先テキスト:

- Before
- 記事の山
- 毎回文脈を作り直す
- After
- AIが使えるDB
- 1つの知識レコード
- 複数媒体へ展開

余裕があれば入れる出力先:

- note
- Substack
- X
- YouTube
- Podcast

## text to avoid

避ける文字:

- 根拠のない数値
- 過度な煽り
- 長い文章
- 小さすぎる補足文
- OpenAI API
- Anthropic API
- 自動投稿
- 完全自動化

避けたい見せ方:

- AIで全部自動化できるように見える表現
- API連携がMVPの中心に見える表現
- 「記事を書く人は負ける」のような強すぎる断定
- ロゴや商標に依存した構成

## reusable variants

### note hero / eye-catch

- aspect ratio: `16:9`
- text amount: 中程度
- role: 記事全体の主張を一目で伝える

### X hook image

- aspect ratio: `1:1`
- text amount: 少なめ
- role: スクロール中に対比が伝わる
- main text: `記事の山 → AIが使えるDB`

### Instagram carousel cover

- aspect ratio: `4:5`
- text amount: 最小
- role: 保存したくなる表紙
- main text: `これからのブログはAIが使えるDBになる`

### YouTube in-video slide

- aspect ratio: `16:9`
- text amount: 中程度
- role: 導入直後に話の全体像を示す

## draft image prompt

```text
日本語のシンプルなBefore / After図解。

テーマ: 記事の山からAIが使えるDBへ。

左側はBefore。散らばったnote下書き、SNSメモ、動画台本、音声メモ、リサーチメモを「記事の山」として見せる。矢印は少し絡まり、毎回文脈を作り直している印象。

右側はAfter。中央に「AIが使えるDB」または「1つの知識レコード」を置き、そこからnote、Substack、X、YouTube、Podcastへ整理された矢印が伸びる。

白背景、黒文字中心、控えめなアクセントカラー。発信ワークフローの実用図として見せる。派手なAI未来感、根拠のない数値、過度な煽りは避ける。

16:9。note hero / eye-catch向け。文字は大きく読みやすく、図内テキストは短くする。
```

## review checklist

- note記事の中心主張が一目で伝わるか。
- Before / Afterの差が直感的に分かるか。
- 元レコードにない主張を足していないか。
- API自動化や自動投稿が中心に見えないか。
- 図内テキストが短く読みやすいか。
- noteのアイキャッチとして使える余白と視認性があるか。
- XやInstagramへ再構成しやすいか。
- ロゴや商標に依存していないか。

## next step

このブリーフをもとに、まず `16:9` のnote hero / eye-catchを1枚生成します。

生成後にレビューし、使える方向性なら `1:1` のX hook画像と `4:5` のInstagramカルーセル表紙へ展開します。
