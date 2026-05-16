# Publish Order: building-hitori-media-os

Status: ready-for-human-review

## Recommended Order

1. **X**：単発hook + 短いスレッドで反応を観測する
2. **Threads**：会話調の連投で反応を広げる
3. **note**：日本語アーカイブとして長文を残す
4. **Substack**：reader-list と deeper trust の中心。Welcome Email / About Page と整合してから公開
5. **YouTube**：text の反応で copy direction が固まったあと、画面録画を含む長尺で出す
6. **Shorts**：YouTube 同期 or 単独 hook として、3本中2本を1週間以内に出さない（同じ週に詰めすぎない）
7. **Podcast**：text 系で最初の反応が見えたあとに、深い背景を音声で語る

Instagram / GitHub は draftSourceDir 未設定でこのキャンペーンの対象外（別バッチで判断）。

## Why This Order

- **X / Threads = fast reaction**：1〜2日で反応が見えるので、coreThesis の伝わり方を低コストでテストできる。
- **note = Japanese archive**：日本語検索からの長期流入と「あとから読み返せる」アーカイブを作る。X / Threads 後に出すと、リアクションを踏まえた言い回し調整がしやすい。
- **Substack = reader-list + deeper trust**：email 配信で関係を深める主役。Welcome Email / About Page / Notes follow-up を整えてから公開する必要があるため、テキスト系3媒体で copy direction が固まってからのほうが安全。
- **YouTube / Shorts / Podcast = after copy direction validated**：制作コストが高い。text の反応から「どの hook が刺さるか」を見たうえで撮ったほうが、内容のブレが減る。

## Single-Day vs Multi-Day

- X → Threads は同日でも別日でもよい。同日にする場合、Threads は X 投稿の3〜4時間後にすると、自分の投稿同士が timeline で被らない。
- note → Substack は別日推奨。note 公開後の反応が Substack Post の Reader Question を磨くヒントになる。
- YouTube → Shorts は同週でもよいが、Shorts は3本中2本を上限にして同じ週に詰めすぎない。
- Podcast は他媒体公開のあと、落ち着いて収録できる週末などに回す。

## Manual Posting Reminders

- 自動投稿しない。各 platform にログインして人間が手動で投稿する。
- 公開直前に「published URL」をメモする欄（各 final-review の最後）に書き戻す。
- Sanity Studio で `substackPostPlan` の `publishedUrl` フィールドに手動でURLを反映する。
- Sanity への反映は `seed --replace` 不使用。直接 Studio UI で編集する。

## Pause Triggers

公開を一時停止してよいシグナル:

- X / Threads の最初の反応に「完成版を期待された」フィードバックが多い場合 → note / Substack 公開前にトーンを再調整する。
- private/ や実 project ID、シークレットが screen recording / 画像に映っている可能性に気付いた場合 → 公開を止めて素材を差し替える。
- AI clone voice / AI generated avatar を急いで使いたくなったとき → 本人承認・権利確認なしには進めない。

公開を急ぐより、止めて作り直すほうが安全側。
