# Next Campaign: Tool Building in Public

Status: design-only

## Content Idea

Slug: `building-hitori-media-os`

Title: AIで「ひとりメディア運営OS」を作っている裏側

Core message: 発信を頑張るより、発信が回る仕組みを作る。

## Why This Is Strong Content

この企画は、完成したツールを売り込む話ではなく、発信者自身が「発信の仕組み」を作っている過程を見せるコンテンツです。

読者にとっての価値は、ツールそのものより先に、次の問いが見えることです。

- なぜ記事を量産するだけでは限界が来るのか
- どうすれば1つのアイデアを複数媒体へ展開できるのか
- AIを使う前に、どんな情報構造を作るべきか
- 手動、半自動、自動化をどの順番で進めるべきか
- ひとりメディア運営者が、自分の発信を資産化するには何が必要か

Hitori Media OSの開発過程そのものが、note、Substack、X、YouTube、Podcastの発信素材になります。

## Platform Rollout

### X / Threads

Role: 開発中の気づき、短い主張、進捗共有。

Hook examples:

- 発信を頑張るより、発信が回る仕組みを作っている。
- 1つのアイデアからnote、Substack、X、YouTube、Podcastまで展開するOSを作っている。
- いきなりAPI自動化しない。まず手動で回る仕組みを作る。
- AIで記事を書く前に、AIが使えるDBを作る。

### note

Role: 思想、設計背景、実験ログの日本語アーカイブ。

Possible article:

Title: AIで「ひとりメディア運営OS」を作っている裏側

Angle:

- 発信を頑張るだけでは、制作工程が重くなる
- 1つのContent Ideaを中心に置く
- Sanityはデータ基盤、Studioは管理画面
- Visual RegisterやPublish Package Builderで手動作業を減らす
- まだ自動投稿やAPI生成を入れない理由

### Substack

Role: 読者リスト、ビルドログ、信頼形成。

Angle:

- 今週作ったもの
- なぜこの順番で作ったか
- どこをまだ手動に残しているか
- 次に何を検証するか
- 読者に問いを投げる

Question example:

もしあなたが自分の発信をOS化するとしたら、最初にどの作業を仕組み化したいですか？

### YouTube

Role: 開発画面を見せながら、仕組み全体を説明する。

Angle:

- Sanity Studio
- Visual Register
- Patch Review
- Publish Package Builder
- release-prep folder
- なぜNext.js dashboardをまだ作っていないか

Format:

- human-shot talking head
- screen recording
- hybrid explanation

### Shorts

Role: 1つの強い考えだけを短く伝える。

Ideas:

- 発信を増やすより、発信が増える仕組みを作る
- AIに記事を書かせる前に、AIが読めるDBを作る
- 自動化は最後。まず手動で回る型を作る

### Podcast

Role: 開発の背景、判断、迷いを深く話す。

Angle:

- なぜContent OSを作り始めたか
- ひとりメディア運営のしんどさ
- 自動化より前に設計を作る理由
- 人間がレビューする余白を残す理由

### Instagram

Role: 概念を図解・カルーセルで見せる。

Carousel idea:

1. 発信を頑張る時代から、発信が回る仕組みを作る時代へ
2. 1つのContent Idea
3. Text / Visual / Video / Audioへ展開
4. Visual Registerで画像を管理
5. Publish Packageで公開前素材をまとめる
6. まだAPI自動化しない理由
7. Hitori Media OSとして育てる

## Sales Angle

この企画は、将来の販売導線にも向いています。

売るものは「AI記事生成ツール」ではなく、ひとりメディア運営者が自分の発信を資産化し、複数媒体へ展開するための運用OSです。

将来のoffer候補:

- Hitori Media OS template
- Sanity schema starter
- prompt pack
- Visual Register / Publish Package workflow
- media campaign operating manual
- cohort / workshop

## Why It Can Sell the Tool Later

開発過程を公開することで、読者はツールの完成を待つ前に、設計思想、判断基準、運用の現実を理解できます。

その結果、完成版をいきなり売るよりも、次の信頼が作れます。

- この人は実際に自分で使っている
- 派手な自動化ではなく、現実的な制作フローを見ている
- APIなしMVPから始めているので、自分でも取り入れやすい
- 発信者の悩みをプロダクトに落としている

## Next Step

`ai-blog-db` のfirst public releaseを手動公開したあと、この企画を次のContent Ideaとしてseed化します。

最初に作るべきもの:

1. `contentIdea.building-hitori-media-os`
2. note article draft
3. X / Threads hooks
4. Substack build log
5. screen-recording YouTube outline
