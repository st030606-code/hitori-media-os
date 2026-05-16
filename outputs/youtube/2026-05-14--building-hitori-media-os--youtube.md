# YouTube Long-form Production Draft: building-hitori-media-os

Status: ready-for-human-edit

Content slug: building-hitori-media-os
Platform: youtube
Generated at: 2026-05-14

このファイルは、`contentIdea.building-hitori-media-os` の YouTube 長尺動画 production draft です。完成した動画ファイルではなく、人間が編集してから録画する前提の ready-for-human-edit ドラフトです。

実際の録画 / 編集 / アップロードはすべて手動で行います。動画ファイル自体はこの builder では生成しません。

---

## Title Options

採用は1つ。

- AIで「ひとりメディア運営OS」を作っている裏側
- 発信を頑張るより、発信が回る仕組みを作る話
- ひとり運営は「コンテンツの量」じゃなく「制作の型」で詰む
- AIに記事を書かせる前に、AIが読めるDBを作っている

## Thumbnail Direction

- 主役: 自分の顔 or 手元の画面（Sanity Studio の画面が映る程度）。
- メインテキスト案: 「発信を頑張るより、仕組みを作る」「ひとり運営OSを作っている裏側」
- フォント: 太め、2行構成、過剰な煽り色は避ける。
- 補助要素: Sanity の Content Idea レコード、Publish Package Builder の出力ツリーをかすかに見せる。
- 派手なエフェクトや「衝撃」「絶対」みたいな煽り語は使わない。
- カラー: 落ち着いた色＋1色アクセント（既存の note hero image とトーンを合わせる）。

詳細は別途 Visual Register と連動して、`visualAssetPlan` で管理する想定。

## Episode Concept

- Type: building-in-public 解説動画
- Length: 10〜15 分
- Production mode candidates:
  - human-shot（推奨初版）
  - hybrid（screen-recording + talking head インサート）
  - ai-generated future version（TODO のみ、本人承認なしには着手しない）

---

## Opening Hook (0:00 – 0:45)

トーン: 自然・抑えめ。完成版の発表ではなく、開発中の途中報告であることを最初に明示する。

> （カメラに向かって）  
> 「最近、自分の発信のうち、ひとつだけやり方を変えました。  
> 発信そのものを増やすんじゃなくて、発信が回る仕組みを作ることに、ここ数週間の時間を使っています。  
> その途中経過と、まだ手動に残してる作業も含めて、今日の動画で共有します。」

サムネとタイトルの内容と矛盾しないよう、completed productと言わないこと。

## Chapter Structure

| Time | Chapter | 目的 |
| --- | --- | --- |
| 0:00 | Opening | 視聴目的の合意。building-in-public宣言。 |
| 0:45 | Why systems matter more than effort | 媒体が増えると消耗する構造を説明。 |
| 2:30 | The Content Idea record | Sanity Studioで実物を見せる。 |
| 5:00 | AI-readable DB before AI articles | 素材構造の話、プロンプトの前にDBを直す理由。 |
| 7:00 | Manual first, automation later | 自動化の優先順位の決め方。 |
| 9:00 | Publish Package Builder demo | screen recordingでフォルダ構造とchecklistを見せる。 |
| 11:00 | What is still manual | 画像生成 / 反映 / 公開 / URL記録などを正直に出す。 |
| 12:30 | Reader takeaway | 真似できる最初の1ステップ。 |
| 13:30 | Closing CTA + outro | 過度な購読煽りなし。 |

各チャプターはYouTubeの chapters 機能に対応する想定で、`00:00 Chapter Name` の表記でdescriptionに転記する。

## Talking-head Outline

各セクションで「話す内容」の要点だけ。台本そのものは、収録時に自分のトーンで言い換える前提。

### 0:00 Opening
- 発信を頑張る → 仕組みを作る、への切り替え話
- 動画は building-in-public の途中報告
- 視聴後の持ち帰りを1つ予告

### 0:45 Why systems matter
- 媒体が増えて作業時間だけ伸びる悩み
- 「量」より「型」で詰むという認識
- 努力不足ではなく構造の問題

### 2:30 Content Idea record（screen recording挿入）
- Sanity Studio起動
- contentIdea.building-hitori-media-os を開く
- claims / audience / tone / platformAngles を1つずつ見せる

### 5:00 AI-readable DB
- プロンプトを毎回直すより素材を直す
- 「主張」「反論」「媒体別切り口」のフィールドを示す
- 出力が安定する理由を1分程度で

### 7:00 Manual first
- API投稿、画像生成API、Sanity direct writeをまだ入れていない理由
- 自動化候補は「下書き作成」より「公開判断」だったという気づき
- 「自動化したいけど、まずどこを？」の問いを視聴者に投げる

### 9:00 Publish Package Builder（screen recording挿入）
- `npm run publish:package -- building-hitori-media-os --dry-run` を実演
- `publish-packages/note/building-hitori-media-os/` のフォルダ構造を見せる
- placeholder detection / dry-run の効用を簡単に解説

### 11:00 What is still manual
- 画像生成 / 下書き編集 / Sanity反映 / 公開 / URL記録
- これを正直に出すことが、building-in-publicとしての価値

### 12:30 Reader takeaway
- 「1つだけテーマを選んで、主張・読者・根拠・反論・媒体別切り口を分けたメモを作る」を提案
- ツールは何でもいい（JSON / Markdown / Notion）

### 13:30 Closing
- Soft CTA: Substackで開発ログを少しずつ書いている、気が向いたら覗いて
- 同じ悩みの人と話したい、コメント歓迎

## Screen-recording Cues

screen recording で使う想定の画面一覧。

1. Sanity Studio: `contentIdea.building-hitori-media-os` の編集画面
2. Sanity Studio: `visualAssetPlan` 一覧（Content Idea filter を含む）
3. ローカルターミナル: `npm run publish:package -- building-hitori-media-os --dry-run` の出力
4. ローカルエディタ: `publish-packages/note/building-hitori-media-os/article.md` を開いた状態
5. ローカルエディタ: `publish-packages/substack/building-hitori-media-os/post.md` を開いた状態
6. ローカルエディタ: `outputs/x/2026-05-14--building-hitori-media-os--x.md` をmain post candidate付近で開いた状態
7. Visual Register: 起動済みの`http://localhost:3334` 画面（必要なら）

録画前に：
- `.env.local` を含む実project IDが映らないよう、ターミナルとStudioを事前確認する。
- API トークン、subdomain、subscriber メール、購入PDFのファイル名などが画面に出ないようにする。
- private/ フォルダは Finder / エクスプローラに映さない。

## Visual Insert / B-roll Ideas

- アニメーション静止画: 1つのContent Ideaから X / note / Substack / YouTube / Shorts / Podcast へ広がる関係図
- 静止画: 「手動 → 半自動 → 自動」の優先順位イメージ
- 静止画: Publish Package Builder の安全弁（safe-skip-existing-files / dry-run / placeholder detection）
- B-roll: ノート手書きで Content Ideaのフィールドをスケッチする5〜10秒程度のカット（任意）

Visual Register の既存画像（note hero / X hook / Instagram carousel cover）を可能な範囲で使い回す。

## Closing CTA (overlay text + 口頭)

- 「同じ悩みで止まっている人がいたら、コメントで教えてもらえると嬉しいです。」
- 「開発ログはSubstackにもう少し長く書いています。プロフィールから飛べます。」

派手な購読登録煽りはしない。低姿勢に。

## Pinned Comment Draft

> 動画ありがとうございます。  
> いまHitori Media OSは、まだ手動運用が多い段階で、完成版のツール紹介ではなく building-in-public の途中報告として撮りました。  
>  
> もしあなたが、自分の発信のうち1つだけ仕組み化するなら、「下書き作成」「公開判断」「素材保存」のどれを最初に手を入れたいですか？  
> 返信欄での会話、楽しみにしています。  
>  
> 開発ログ: Substack（プロフィールリンク参照）

## Description Draft (YouTube説明欄)

```text
発信を頑張るより、発信が回る仕組みを作る。
AIで「ひとりメディア運営OS」を組み立て直している途中の、building-in-publicな実験動画です。

Chapters:
00:00 Opening
00:45 Why systems matter
02:30 The Content Idea record
05:00 AI-readable DB before AI articles
07:00 Manual first, automation later
09:00 Publish Package Builder demo
11:00 What is still manual
12:30 Reader takeaway
13:30 Closing

このChannelは、AIで「ひとりメディア運営OS」を作っていく裏側を共有しています。
完成版の発表ではなく、開発の判断 / 迷い / まだ手動に残している作業も含めて、運用しながら整えていきます。

Substack（開発ログ）: 概要欄リンク
note（日本語アーカイブ）: 概要欄リンク
X / Threads: 概要欄リンク

[安全方針]
- 自動投稿はしません。
- AI clone voice は本人承認なしでは使いません。
- 有料PDFや教材本文は動画 / 概要欄にコピーしません。
```

URLは公開直前に手動で差し替える。Channel未確定の場合は TODO のまま残す。

## Production Modes

### Human-shot version (推奨初版)

- 本人が話す + screen recording インサート
- 録画: スマホ or ミラーレス、内蔵マイク + ラベリアマイク
- 音声: 録画と別取りで重ね合わせると質が安定
- 編集: ジャンプカット中心、過度なエフェクト不要

### Hybrid version

- talking head + screen recording を 5:5 〜 4:6 程度で混ぜる
- screen recording パートでは、自分の声を上にレイヤーする
- 図解インサートを2〜3枚

### AI-generated future version (TODO)

- 本人承認なしでは着手しない
- AI clone voice / AI generated avatar は権利確認後にのみ検討
- 開発初期段階では使わない方針

## Production Checklist

- [ ] 台本の最終版を読み上げ確認
- [ ] サムネ確定 / Visual Registerに登録
- [ ] screen-recording対象の画面で実project ID / 認証情報 / private/ が映らないことを確認
- [ ] 録画環境（音 / 光 / 背景）チェック
- [ ] 録画 → ジャンプカット編集
- [ ] チャプター（00:00形式）を description にコピー
- [ ] Closing CTAテキストと pinned comment を準備
- [ ] アップロード時に「自動投稿しない」を確認（手動公開）
- [ ] アップロード後のURLを `seed/contentIdea-building-hitori-media-os.json` 反映プランへ追記する想定（手動）

## Human Review Checklist

- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が動画全体で守られている
- [ ] 「完成版ツールの発表」になっていない
- [ ] 元レコードの主張・反論から逸脱していない
- [ ] AI clone voiceに関する安全方針を明示している
- [ ] screen recordingで映る画面に secret / 実 project ID / private/ が含まれていない
- [ ] 有料PDF本文の引用が混ざっていない
- [ ] サムネとタイトルが煽りすぎていない
- [ ] チャプターが内容と一致している

## Safety

- No auto-publishing
- No automatic upload
- No AI clone voice without explicit human approval
- No paid PDF content copied
- No screen recording of private/ or secrets
- Manual recording, editing, and publishing only
