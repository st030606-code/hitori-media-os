# Admin Dashboard Japanese Review Mode v0.2

日付: 2026-05-18

## 背景

Working Pipeline Step G 完了直後、boss が最終公開判断に進む手前のフェーズ。dashboard UI は英語ラベル + 開発者向け数値が中心で、boss が「いま何が ready で次に何をすべきか」を 1 画面で読み取るには向いていなかった。

直前のキャンペーン（building-hitori-media-os）では:

- 9 visualAssetPlan のうち 7 件 saved / 2 件 skipped
- 4 platform の publish-package 配布完了
- release-review 5 ファイル更新完了
- boss-only: 媒体ごとの最終確認、公開予定日、手動公開、Published URL 記録

この状態を「技術完了済 / boss 判断のみ pending」として 1 枚で見せる UI を v0.2 として整える。

## 決定・変更

dashboard UI の boss-facing 領域を日本語化し、Working Pipeline 完走後のレビュー視点に組み替えた。スキーマ・ルート・auth・データ書き込みパスはすべて変更なし。

主な変更:

- `src/components/AppNav.tsx`: 7 nav ラベルを日本語化（URL 不変）
- `src/lib/statusJa.ts`: 新規。`statusLabelJa(status)` / `statusTone(status)` を提供。saved / skipped / brief-ready / pending-review / in-progress / done / blocked / draft / active / unknown とその他派生ステータスを日本語へ
- `src/lib/assetRoleJa.ts`: 新規。9 件の visualAssetPlan slug を human-readable な日本語役割名に変換
- `src/components/WorkingPipelineStatus.tsx`: 新規。Working Pipeline 6 段（画像生成 / Visual Register recovery / Sanity反映 / 配布パッケージ / 公開前レビュー / 最終公開判断）の状態を表示
- `src/components/NextActionChecklist.tsx`: 新規。boss の次のアクション 5 ステップ
- `src/components/ReleaseReviewLinks.tsx`: 新規。5 件の release-review ファイルパスをカード形式で表示（dev / prod 両対応、ファイルを開こうとはしない）
- `src/components/PublishReadinessBoard.tsx`: 新規。媒体別 ready 状態 + 画像サマリ + 残り作業の 1 枚パネル
- `src/app/page.tsx`: タイトルを「ひとりメディアOS 管理画面」、Working Pipeline / Next Action / Release Review Links を主役に、データセット全体の 4 つの数値カードは `<details>詳細情報</details>` の中に格納
- `src/app/campaigns/[slug]/page.tsx`: `CampaignStatusCard` の直後に `PublishReadinessBoard` + `ReleaseReviewLinks` を追加。既存の Next Action 以下の section はそのまま残す
- `src/app/visual-assets/page.tsx`: 見出しを「画像・図解素材」、summary を 6 ボックス（合計 / 完了 / 今回は保留 / 保存待ち / 作業中 / 計画中）に変更、bucket に `skipped` を追加して別 section で表示、表の列ヘッダを日本語化、`Asset` 列で `assetRoleJa()` による人間可読な役割を主表示し、`title` / `_id` / `slug` / `localAssetPath` は `<details>詳細情報</details>` の中へ

## 理由

- **日本語化を「ラベル翻訳」ではなく「視点の組み替え」として実施**: boss は dashboard を「公開前レビュー資料の入口」として使う。英語の Overview 数値を最上段に置き続けると、Working Pipeline の完了状態が埋もれる。Home 最上段に静的な Working Pipeline + Next Action + Release Review Links を据え直したのはこの判断。
- **Working Pipeline / 公開準備ボードを Sanity クエリから derive しなかった**: クエリ結果に揺れがあると、boss が見るたびに「あれ、状態が違う」と疑念を持つ。「2026-05-18 時点の人間確認済 Working Pipeline 状態」を静的に固定し、再生成のタイミングで再評価する設計にした。
- **開発者向け情報を消さず `<details>` の中へ**: `_id` / `localAssetPath` / `transactionId` / `bytes` などはトラブル時の再現性に必要。「視界から外す」と「削除する」を区別。
- **status の日本語化を「再翻訳」ではなく「マッピング」として外部化**: `src/lib/statusJa.ts` に集約することで、後日新ステータスが増えたときの追加点が 1 ファイルで済む。`StatusBadge` 自体は変えず、呼び出し側で日本語 label を渡す形にした（toneFor は英語 enum のままで OK）。
- **publish-package の readiness は静的に書いた**: campaign detail に表示する `公開準備ボード` は building-hitori-media-os 固定の状態を出す。次キャンペーンが入ったら、ボードを per-campaign で再生成する設計に発展させる（v0.3）。

## 影響

- boss が dashboard を開いて 3 秒で「Working Pipeline は完了済 / 次は最終チェック」と読み取れる
- 媒体ごとの release-review markdown へのパスが Home + Campaign detail の両方から確認できる
- dev/dev-detail を <details> 化したことで、boss は data field を読まずに公開判断に集中できる
- 既存ルートは全 16 route そのまま、auth・スキーマ・データ書き込みパスは変更なし
- 次に新しいキャンペーンが入った場合、Working Pipeline / 公開準備ボード / Release Review Links は building-hitori-media-os 固定なので、ハードコードを per-campaign に展開する作業が次の改善対象

## 次の一手

- boss が dashboard を 1 度開いて、Home → Campaign detail → Visual Assets の 3 画面を音読し、日本語が違和感ないか確認
- v0.3 計画: Working Pipeline / 公開準備ボード / Release Review Links を per-campaign で derive する（campaignPlan.slug ベースで release-review path / Working Pipeline state を引く）
- v0.3 計画: `statusLabelJa` を `StatusBadge` の default にして、呼び出し側で `label` 指定を不要にする（言語切替対応の足場）
