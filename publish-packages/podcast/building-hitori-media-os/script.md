# Podcast Episode Production Draft: building-hitori-media-os

Status: ready-for-human-edit

Content slug: building-hitori-media-os
Platform: podcast
Generated at: 2026-05-14

このファイルは、`contentIdea.building-hitori-media-os` の Podcast 1話分の production draft です。完成した音声ファイルではなく、人間が編集してから収録する前提の ready-for-human-edit ドラフトです。

実際の音声ファイルはこの builder では生成しません。録音 / 編集 / 公開はすべて手動です。AI clone voiceは本人承認なしには使いません。

---

## Episode Title Options

採用は1つ。

- AIで「ひとりメディア運営OS」を作っている裏側
- 発信を頑張るより、発信が回る仕組みを作る話
- ひとり運営は「量」より「型」で詰みやすい
- AIに記事を書かせる前に、AIが読めるDBを作っている話
- まだ手動運用なのに、なぜ続けやすくなったか

## Episode Concept

- Type: solo monologue（ひとり語り、building-in-publicの考えごと回）
- Length: 20〜30 分目安（収録後に編集で削る前提）
- Mood: 落ち着いた、抑制的、結論を急がない
- Production mode candidates:
  - human-recorded（推奨初版）
  - TTS internal review（社内 / 自分の確認用、配信用ではない）
  - AI clone future（本人承認まで保留）

---

## Opening (0:00 – 2:00)

トーン: 静かに、丁寧に。完成版の宣伝ではないことを最初に置く。

> 「Hitori Media OS、というプロジェクトの話をします。  
> といっても、完成したツールを紹介する回ではなくて、いま自分が、AIで『ひとりメディア運営OS』を作っている途中の、開発ログ的な回です。」

- なぜ今回この話をするか
- 完成版ではない、building-in-public な内容であることを明示
- リスナーへの期待調整（過度な答えは出てこない / 制作の判断や迷いを共有する回）

## Main Talking Points

各点は、収録時に箇条書きを台本化せず、自分のテンポで言い換える前提。

### A. 発信を頑張る、から仕組みを作るへ（2:00 – 6:00）

- 媒体が増えて作業時間だけ伸びる悩み
- 「量」より「型」で詰む、という認識
- 努力ではなく構造の問題、という言い直し
- ひとり運営にとって、続けやすさは「成果」より「制作工程の軽さ」で決まりがちな話

### B. 中心にあるのは1つの構造化された Content Idea（6:00 – 11:00）

- contentIdea レコードの中身（主張・読者・反論・媒体ごとの切り口）
- なぜCMS（Sanity）でやっているか、Obsidianと役割を分けている理由
- 1つの元レコードから、媒体別に下書きを派生させていく感覚
- 仰々しい名前（Hitori Media OS）にした理由と、その重さに見合わない正直な現状

### C. AIに記事を書かせる前に、AIが読めるDBを作る（11:00 – 16:00）

- いきなりAIに長文を書かせて疲れた話
- プロンプトを直すより素材を直すほうが効く
- 出力が安定する理由（文脈を再構成する負担をAIにかけない）
- 「AIに丸投げ」ではなく「AIに素材を渡して人間が判断する」という距離感

### D. 自動化は最後、まず手動で回る型を作る（16:00 – 21:00）

- API投稿、画像生成API、Sanity direct writeをまだ入れていない理由
- 自動化の優先順位は、手動で回してみないと見えない、という気づき
- 「下書き作成」より「公開判断」のほうが自動化したい、という発見の話
- 完成度を上げ過ぎないこと、placeholder と real を仕組みで区別する話（最近のPublish Package Builder周りの裏話）

## Reflective Section (21:00 – 25:00)

落ち着いて、抑え目に話す。

- なぜ完成版を急いで出さないか
- ひとり運営の発信における「人間レビューを残す余白」の価値
- 完成版ツールを売る前に、開発過程を見せるほうが、結果として読者の役にも自分の発信にも合う気がしている、という話
- 失敗・迷い・まだ整理できていない箇所も含めて、なるべく正直に話す

## Listener Question (25:00 – 26:30)

聞いている人に投げる問い。1つだけ。

> 「あなたが、自分の発信のうち1つだけ仕組み化するとしたら、最初に手を入れたいのは『下書き作成』『公開判断』『素材保存』のどれですか？」

- 返信方法（X / Substack 返信 / note コメント）を口頭で1つだけ案内
- 過度な誘導は避ける

## Closing (26:30 – 28:30)

- 今回の話の振り返り（30秒程度）
- 開発ログは Substack にも書いている、という soft CTA
- 次回予告（決まっていなければ「決まったらSubstackで先に告知する」程度で）
- 「ここまで聞いてくれてありがとうございます」で終わる

派手な購読・登録煽りはなし。

---

## Show Notes Draft

エピソード公開時にPodcastホスティング / Substack / note へ転記する想定。

```text
発信を頑張るより、発信が回る仕組みを作る。
AIで「ひとりメディア運営OS」を作っている途中の、building-in-publicな考えごと回です。

## 今日話したこと

- ひとり運営は「量」より「型」で詰みやすい
- 中心にある Content Idea レコードと、Sanity / Obsidian の役割分担
- AIに記事を書かせる前に、AIが読めるDBを作る
- 自動化は最後、まず手動で回る型を作る
- 完成版を急がない、building-in-public の姿勢

## 関連リンク

- Substack 開発ログ（プロフィール参照）
- note 日本語アーカイブ（同上）
- 元レコード: contentIdea.building-hitori-media-os（公開時はlocal-only）

## リスナーへの問い

「あなたが、自分の発信のうち1つだけ仕組み化するなら、『下書き作成』『公開判断』『素材保存』のどれを最初に手を入れたいですか？」

返信方法: X / Substack / note コメント、いずれでもOKです。

## 安全方針

- 自動投稿しません。
- AI clone voice は本人承認なしには使いません。
- 有料PDFや教材本文の引用は含めていません。
```

URLが揃わない時点では、リンクは公開直前に手動で差し込む。

## Production Modes

### Human-recorded version (推奨初版)

- 録音: USBマイクまたはICレコーダー、静かな部屋で1テイク → 編集
- 編集: 長い間を詰める、要点が薄い部分を削る、章マーカー追加
- 配信: Podcastホスティング（手動アップロード）

### TTS internal review version

- 公開用ではなく、自分で台本の流れを確認するためにだけ使う
- TTSの品質は building-in-public の声色には不向きと割り切る
- 配信には絶対に使わない

### AI clone future version (TODO)

- 本人承認なしには着手しない
- 権利確認 / 声色サンプル管理 / 配布範囲の合意が前提
- 開発初期段階では使わない方針

## Audio TODO

- [ ] human-recorded / TTS / podcast-import のどれで進めるか決める
- [ ] 録音環境（マイク / 部屋の反響 / バックグラウンドノイズ）を準備
- [ ] 録音前に台本を一度音読してテンポを確認
- [ ] 録音中の言い直しを許す（編集前提）
- [ ] 音量正規化、ノイズ除去
- [ ] 章マーカーを付ける（YouTubeの chapters と揃える）
- [ ] 公開前に最終チェック（1.5倍速で全体確認、等倍で要点だけ確認）

このplaceholderから音声ファイルは生成しない。

## Production Checklist

- [ ] エピソードタイトル / Show notes / Closing CTA を確定
- [ ] 録音モード（human / TTS / AI clone）を決める
- [ ] 録音
- [ ] 編集（長い間を詰める / 言い直しを削る）
- [ ] 章マーカー付与
- [ ] 公開直前に show notes のリンクを差し込み
- [ ] 公開後、URLを `seed/contentIdea-building-hitori-media-os.json` 反映プランへ追記する想定（手動）

## Human Review Checklist

- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が回全体で守られている
- [ ] 「完成版ツール」と誤読されない言い回しになっている
- [ ] AI clone voice に関する安全方針を口頭で明示している
- [ ] 元レコードの主張・反論から逸脱していない
- [ ] 有料PDF本文の引用が混ざっていない
- [ ] 個人情報 / 取引先 / 未公開のプロジェクト名が漏れていない
- [ ] BGMやSEを使う場合、ライセンスを確認している

## Safety

- No audio file generation by this builder
- No auto-publishing
- No AI clone voice without explicit human approval
- No paid PDF content copied
- No leaking of secrets, real project IDs, or private/ filenames during recording
- Manual recording, editing, and publishing only
