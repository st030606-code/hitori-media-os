# 0004: 動画・音声・図解出力を作成

日付: 2026-05-11

## 背景

Phase 1 の残り出力として、YouTube、Shorts、Podcast、Diagram の下書きを作成しました。

前回の note、Substack、Threads に続く、動画・音声・ビジュアル系の手動ワークフローテストです。

今回も、Sanity 初期化、Next.js 追加、有料 LLM API 連携は行っていません。

## 作成した出力

- `outputs/youtube/2026-05-11--ai-blog-db--youtube.md`
- `outputs/shorts/2026-05-11--ai-blog-db--shorts.md`
- `outputs/podcast/2026-05-11--ai-blog-db--podcast.md`
- `outputs/diagrams/2026-05-11--ai-blog-db--diagram-plan.md`

どれも公開用の完成稿ではなく、人間レビューと後工程の制作に使う下書きです。

## 有効だったフィールド

特に効いたフィールド:

- `coreThesis`: YouTube、Podcast、Diagram の中心メッセージとして機能した。
- `audiencePain`: 冒頭の問題提起やBefore / After図に使いやすかった。
- `claims`: YouTubeの章立て、Shortsの各案、Podcastの話題ブロックに変換しやすかった。
- `examples`: JSON、Obsidian、Sanity、複数媒体展開の説明に使えた。
- `objections`: YouTubeとPodcastで反論への回答を作るのに有効だった。
- `platformAngles`: 各媒体のフックと形式を分けるために重要だった。
- `tone`: AIで量産する話ではなく、AIが使える素材を整える話に保つために効いた。

## note / Substack / Threads との違い

YouTubeは、主張を章立てし、映像メモを付ける必要がありました。文章として読むより、視聴者の理解順と画面展開が重要になります。

Shortsは、1本につき1主張に絞る必要があります。`coreThesis` 全体を語るより、1つの切り口だけを短く見せるほうが向いています。

Podcastは、書き言葉よりも話し言葉の自然さが重要でした。Segmentごとに流れを作りつつ、聞き手が作業中でも追える構成が必要です。

Diagramは、文章ではなく構造を見せる出力でした。`audiencePain` を Before、`contentIdea` を中心、複数出力を After として見せると分かりやすくなります。

## 人間レビューが必要な点

YouTube:

- 実際の画面収録やBロールに使える素材があるか
- 10から15分に対して情報量が足りるか
- 冒頭の引きが自然か

Shorts:

- 画面テキストが短く視認しやすいか
- 1本1主張に絞れているか
- 実際の編集テンポに合うか

Podcast:

- 声に出して自然に聞こえるか
- 発信者本人の実体験を足したほうがよい箇所はどこか
- 専門用語が多すぎないか

Diagram:

- 図内テキストが多すぎないか
- どの媒体で最初に使う図か
- 実際に制作するなら横長か縦長か

## サンプルレコードで改善したい点

次の改善候補があります。

- 発信者本人の具体的な作業エピソードを追加する。
- `platformAngles` に、YouTubeの想定尺、Shortsの秒数、Podcastの尺、Diagramの用途を明示する。
- `examples` に、実際のミニJSON例を正式に入れる。
- `evidence` に、今回の手動生成テストで分かったことを追加する。
- `objections` に「AI生成物はそのまま公開できるのか」という論点を追加する。

## プロンプトで改善したい点

次の改善候補があります。

- YouTubeプロンプトに、想定尺ごとの情報量目安を追加する。
- Shortsプロンプトに、各案の秒数とショット数を指定する。
- Podcastプロンプトに、話速や想定分数を入れる。
- Diagramプロンプトに、横長 / 縦長 / カルーセルのサイズ前提を入れる。
- すべてのプロンプトに、出力後にどの項目をサンプルレコードへ戻すべきかを書く。

## Sanityスキーマ実装へ進めるか

ローカルJSONワークフローだけでも、ひとつの元レコードから複数出力を作れることは確認できました。

ただし、すぐにSanity Studioを初期化する前に、スキーマ案をもう一段具体化したほうがよいです。

特に、次の分離を明確にする必要があります。

- `contentIdea`: 元になる知識
- `prompt`: 再利用する生成プロンプト
- `platformOutput`: 下書き出力
- `diagramPlan`: 図解・画像計画
- `publishedOutput`: 公開済み成果物
- `workflow`: どの入力からどの出力を作ったか
- `tool`: Codex、Claude Code、ChatGPT、Claudeアプリ、CapCutなど

結論として、Sanity実装そのものへ進む前に、MVP 7スキーマの詳細設計へ進む準備ができました。

## note / Substack の発信切り口

note向け:

- 「1つのJSONから7つの発信物を作って分かったこと」
- 「AIは完成稿ではなく、媒体別初稿を作るのに向いている」
- 「Sanity AI Content OS のMVPスキーマを考える」

Substack向け:

- 「今週はYouTube、Shorts、Podcast、図解まで展開してみました」
- 「AIに完成稿を任せるのではなく、初稿生成を任せる」
- 「ローカルJSONだけでContent OSの手触りを確認した話」

## 次にやること

次は、出力をさらに増やすより、MVP 7スキーマの詳細設計へ進むのがよさそうです。

Sanityを初期化する前に、`contentIdea`、`prompt`、`workflow`、`platformOutput`、`diagramPlan`、`publishedOutput`、`tool` のフィールド案を具体化します。

