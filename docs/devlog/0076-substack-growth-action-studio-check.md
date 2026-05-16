# Devlog 0076: substackGrowthAction Studio UI Check (manual, passed)

Date: 2026-05-14

## 今日の判断

前バッチで活性化した `substackGrowthAction` を、人間がローカル Sanity Studio で実際にブラウザ確認しました。結果は問題なし。

- Sanity Studio の document type 一覧に「Substack成長施策（Substack Growth Action）」が表示された。
- 新規作成フォームが正しく開く。
- `actionType` select、`targetPlatform` select、`dueDate` / `completedDate` の date picker、`safetyNotes` text、`status` radio がすべて動作。
- ブロッキング問題なし。
- スキーマ active を維持する判断。

加えて、残り2本（`substackSubscriberMilestone` / `substackPaidReadiness`）は **今回は活性化しない** 判断に至りました。

## 確認できたこと

- 左ナビに「Substack成長施策」が並ぶ。
- 新規作成フォームのフィールド順が読みやすい（title → sourceContentIdea → publicationStrategy → actionType → targetPlatform → actionDescription → expectedOutcome → subscriberCTA → dueDate → completedDate → resultNotes → relatedPublishPackagePath → safetyNotes → status）。
- `actionType` の8択（profile-update / about-page-update / welcome-email-update / notes-engagement / cross-post-promotion / reply-campaign / launch-supporter-outreach / post-followup）が問題なく表示される。
- `targetPlatform` 9択も同様。
- `dueDate` / `completedDate` は date picker。空欄でも保存可能（optional）。
- `safetyNotes` の text field に「自動投稿しない / API 不使用 / subscribers個人情報を扱わない」を書ける。
- `status` radio が planned / ready / done / skipped / needs-review で動く。
- reference UI（`sourceContentIdea` / `publicationStrategy`）が解決。

## なぜ残り2本をまだ活性化しないか

### substackSubscriberMilestone

- 現時点では subscribers が動き始めていない。
- マイルストーンレコードを先に作っても入力対象がない。
- 10 / 50 / 100 などの最初の節目が実際に近づいてから活性化したほうが、UI 確認と運用フィードバックを取りやすい。

### substackPaidReadiness

- paid化を急がない方針。
- 信頼の兆し（trustSignals）、繰り返し届く質問（audienceQuestions）、需要シグナル（repeatedDemandSignals）がまだ集まっていない。
- 「急がない理由を残す欄」を Studio に増やしても、いま埋めるべき内容がない。
- proposed のまま残しておくこと自体が、急がない判断のリマインダーになる。

両方とも `schemas/proposed/` にファイルだけ残し、`schemas/index.ts` には登録しない方針を維持。

## なぜ active 維持の判断にしたか（substackGrowthAction）

- フィールド設計の違和感がなかった。
- 参照UIが正しく動いた。
- `safetyNotes` フィールドが運用上で実際に役立ちそうな手応えがあった。
- 残り2本に頼らなくても、Substack 戦略レイヤーの4本（PublicationStrategy / PostPlan / NotesPlan / GrowthAction）だけで運用が成り立つ。

## 次の主たる作業

スキーマ活性化を一旦切り上げ、building-hitori-media-os の **public release review package** を整える方向へ進む。理由:

- 4本の Substack schema が active になり、Sanity 側の戦略レイヤーが揃った。
- text-first 4 媒体 + video / audio 3 媒体の draft も ready。
- 次は、これらを「人間が手動公開する直前に1か所で確認できる場所」をつくると、運用に乗せやすい。
- スキーマをこれ以上増やしても、実投稿 / 実反応が来ないと判断材料が増えない。

## 検証

- 人間が `npm run dev` を起動して Studio をブラウザで確認。
- test seed をローカル投入（`npx sanity documents create` の人間判断は本人が実施。`seed --replace` 不使用）。
- 既存 build / local-check には影響なし。

## 次にやること

- building-hitori-media-os の release review package（`publish-packages/campaigns/building-hitori-media-os-release-review/`）を整備し、人間レビュー駆動の公開フローに進む。
