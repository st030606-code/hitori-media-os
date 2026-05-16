# Substack Post: building-hitori-media-os

Status: ready-for-human-edit

Content slug: building-hitori-media-os
Platform: substack
Generated at: 2026-05-14

このファイルは、`contentIdea.building-hitori-media-os` のSubstack Post下書きです。完成版ではなく、人間が編集してから配信する前提のready-for-human-editドラフトです。

`docs/strategy-modules/substack-strategy-module.md` の Workflow と Rules に沿って、信頼形成・email配信・archive・subscriber assetの4役を意識して書いています。

---

## Title Options

採用は1つ。残りはdiscard。

- AIで「ひとりメディア運営OS」を作っている裏側
- 発信を頑張るより、発信が回る仕組みを作る
- ひとり運営は「量」より「制作の型」で詰む話
- AIで記事を書く前に、AIが読めるDBを作っている

## Email Subject Options

採用は1つ。

- 発信を頑張るのをやめて、仕組みを作っている話
- AIで記事を書く前に、AIが読めるDBを作っている
- ひとり運営は「制作の型」で詰む

## Preview Text

note / Substack / X / Threads / YouTube / Podcast。全部頑張ると、ひとり運営はだいたい消耗する。だから今、1つのアイデアから複数媒体へ展開するOSをローカル中心で組み立て直している。

---

# Post Draft

## Opening

ここ数週間、発信そのものを増やすのを一度止めて、「発信が回る仕組みを作る」ほうに時間を使っています。

note、Substack、X、Threads、YouTube、Podcast。媒体は増えるのに、ひとり運営者の作業時間は伸びません。同じテーマを媒体ごとに書き直すたびに、誰に何を言うかをゼロから考え直して、結局どこも中途半端になる。

ここに何度かハマってから、考え方を変えました。

増やすべきは記事じゃなくて、1つのアイデアを複数媒体へ展開できる「型」のほうだ、と。

## Main Story

### なぜ「Hitori Media OS」と呼んでいるか

仰々しい名前ですが、要は「ひとりメディア運営者用の制作OS」です。

中心にあるのは、1つの構造化されたContent Ideaレコード。
- 主張
- 想定読者
- 読者の悩み
- 根拠
- 反論
- トーン
- 媒体ごとの切り口（X / note / Substack / YouTube / Shorts / Podcast / Instagram）

これをSanityというCMSに保存して、note / Substack / X用の下書きを、毎回ここから派生させていく。

「Aの記事のここをコピーしてBにする」ではなく、「中心の元レコードから、媒体ごとに切り口だけ変える」やり方です。

### AIに記事を書かせる前に、AIが読めるDBを作る

最近、AIで記事を量産する話をよく見ます。それ自体は否定しません。

ただ、自分の運営で試した感触だと、いきなりAIに長文を書かせても、毎回トーンや主張がぶれる。理由はシンプルで、AIに渡している素材が散らかっているから。

なので、プロンプトを磨くより先に、素材の構造を整えました。
- 主張は主張のフィールドに
- 反論は反論のフィールドに
- 媒体別の切り口は切り口に

ここを揃えてから初めて、AIに「このContent Ideaから、Substack Postの下書きを作って」と頼めるようになります。出力のばらつきも、目に見えて減りました。

### 自動化は最後

もう1つ意識しているのは、自動化を急がないことです。

API投稿、画像生成API、Sanity direct write、ダッシュボードUI。どれも将来は入るかもしれませんが、「まだ入れていません」。

理由は、手動で1キャンペーン回してみないと、自動化すべき作業が見えないからです。

実際に手動運用してみると、自分が消耗しているのは「下書き作成」ではなく、「下書きの最終確認」と「公開判断」だと分かってきました。だとすると、自動化の優先度はそこに行きます。逆に下書き生成は、たぶん人間が触り続けたほうが質が安定します。

### 今残している手作業

- 画像生成（ChatGPT手動）
- 下書きの最終編集
- Sanityへの反映
- 各媒体への公開と投稿
- 公開URLを後から元レコードに戻す作業

自動化はこの中の繰り返し作業から、少しずつ削っていきます。

## Practical Takeaway

ひとりメディア運営を仕組み化したい人向けに、いま自分が大事にしている順番だけまとめておきます。

1. 1つのテーマ（Content Idea）を構造化して保存する。
2. 媒体ごとの切り口、CTA、トーンを分けて書く。
3. その元レコードから、各媒体の下書きを作る。
4. 公開前に必ず人間が確認する。
5. 自動化は、手動で本当に繰り返したと感じる作業からだけ入れる。

順番が逆になると、AIの出力をひたすら手直しするだけの時間が増えます。

## Reader-List Connection

このSubstackは、Hitori Media OSの開発ログを書く場所として置いています。

X / Threadsは発見の場、noteは日本語の長文アーカイブ、SubstackはEmailで届く制作ログ、という役割分担です。

なので、Postそのものは「全部読まないと意味がわからない宣伝」ではなく、「読者の運営にも1つだけ持ち帰ってもらえる開発記」になるように書いています。完成版ツールを売るための前ふりではありません。

## Reader Question

もしあなたが、自分の発信を1つ仕組み化するとしたら、最初に手を入れたいのは「下書き作成」「公開判断」「素材保存」のどれですか？

返信欄でも、コメント欄でもよいです。同じ悩みを持っている人の答えが、次の開発判断の参考になります。

## Subscribe CTA (soft)

Hitori Media OSの開発過程は、これからもこのSubstackで書いていきます。

派手な完成発表ではなく、迷っているところや、まだ手動で残している作業をそのまま共有していく予定です。

似たような運営の悩みがある人は、購読しておくと、次の開発判断が読めると思います。

（過度な購読煽りはしません。気が向いたタイミングで購読してください。）

## Repurpose Notes

- X: 「発信を頑張るより、発信が回る仕組みを作っている」を主軸にした単発投稿＋短いスレッド。
- Threads: 会話調の連投。完成度を出さず、開発中の気づき寄り。
- note: 同じテーマの日本語長文アーカイブ。設計思想と手動運用の現実をもう少し細かく。
- YouTube: 画面録画つきの長尺解説（Sanity Studio / Visual Register / Publish Package Builderを見せる）。
- Shorts: 「自動化は最後。まず手動で回る型を作る」だけを30〜45秒で。
- Podcast: ひとり語りで、なぜContent OSを作り始めたかの背景。

## Human Review Checklist

- [ ] 元レコードにない断言・数字を足していない
- [ ] 完成済みツールの宣伝になっていない
- [ ] 「発信を頑張るより、発信が回る仕組みを作る」coreThesisが守られている
- [ ] subscribe CTAが煽っていない
- [ ] paid offerを含めていない
- [ ] 教材本文の引用が混ざっていない
- [ ] Substack Strategy Module（信頼形成・email・archive・subscriber asset）の役割を踏襲している
- [ ] Reader Questionが返信したくなる形になっている
- [ ] タイトル / Subject / Previewを最終決定する
- [ ] 公開前に1度音読する

---

# Substack Notes Plan

`prompts/substack-notes.md` のフォーマットに沿って、Post公開前後で使うNotes案を並べます。
最終的に投稿するのは2〜3本に絞り、Postと役割が重ならないようにします。

## Pre-Post Notes

1. （question）
   ひとり運営している人に聞きたい。発信を「量で増やす」「型で整える」のどちらに先に手を入れたいですか？深い答えはあとでSubstackに書こうと思います。

2. （build-log）
   今週やったこと: 1つのContent Ideaから複数媒体へ展開するための、ローカルPublish Package Builderの整備。完成品の発表より、まだ手動に残している作業を共有するほうが楽しいと気づいた。

3. （lesson-learned）
   AI記事生成より先に、AIが読めるDBを整えたほうが出力が安定する。という当たり前っぽい話を、自分の運営で確かめている最中。

## Post Launch Notes

1. （build-log）
   さっきPostを出しました。Hitori Media OSの裏側を、完成版ではなく開発中として共有する書き方を試しています。読んで違和感があれば返信ください。

2. （soft CTA）
   購読してもらえると、これからの開発判断や、自分が手動に残している作業の理由などをそのまま受け取れます。煽る気はないので、気が向いたタイミングでぜひ。

## Conversation Prompts

1. 「自分が一番消耗している発信作業」を1つだけ挙げるとしたら何ですか？
2. note / Substack / X / YouTubeの役割分担は、どう決めていますか？
3. AIにいきなり記事を書かせる派と、まず素材を整える派、どっちでやっていますか？

## CTA Variants

- soft：これからの開発ログはここで書いていきます。
- reply-first：購読より先に、いまの運営の悩みを返信してくれると嬉しいです。
- conversation：このPostに違和感があったら、返信欄でも次のNoteでもどちらでも教えてください。

## Human Review Checklist

- [ ] Xのコピペになっていない
- [ ] Postの中心主張を1文に削れている
- [ ] paid offerやアフィリエイトに直結していない
- [ ] フォロー誘導と購読誘導を混同していない
- [ ] 4本以上同じ週に投稿しすぎていない
- [ ] 完成版を急いで売り込むトーンになっていない

## Safety

- No auto-posting
- No platform API call
- No email send automation
- No paid PDF content copied
- Manual publish only
