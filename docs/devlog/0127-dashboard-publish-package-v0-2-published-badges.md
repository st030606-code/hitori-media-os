# Dashboard /publish-package/[slug] v0.2: Published Badges

日付: 2026-05-19

## 背景

Sanity transaction `yXtPUwiZ1lHhdch3ju9FI9` で publishedUrl / publishedAt / state が `campaignPlan.building-hitori-media-os.manualPublishingStatus` に反映済み。dashboard 側はまだ filesystem 駆動のままで、Sanity の publish state を読み取っていなかった。

boss が公開後の状況を把握しづらく、Threads 公開判断や reactionNotes 反映タイミングを決めるのに `Studio を開く → 4 platform の状態を読む` 二度手間が発生していた。

## 決定・変更

`/publish-package/[slug]` を read-only のまま Sanity の `manualPublishingStatus` を fetch し、per-platform 公開状態を UI に derive する v0.2 にした。v0.1 の copy-friendly UI（メイン投稿 / Alternate Hooks / Thread / 画像リスト / 手順 / 警告 / release-review links）はすべて温存。

### 新規ファイル

- `dashboard/src/lib/groq/publishPackage.ts`
  - `publishPackageStateBySlugQuery` — campaignPlan を slug で引き、`manualPublishingStatus[]{platform, state, publishedUrl, publishedAt}` だけ pull
  - `findPlatformState(state, platform)` — 配列から目的 platform を取り出すヘルパ
  - `isPublished(item)` — `state === 'done' && publishedUrl` で `true`
  - `formatPublishedAtJst(iso)` — ISO datetime を `2026-05-19 09:38 JST` 形式に決定論的フォーマット

### 更新ファイル

- `dashboard/src/app/publish-package/[slug]/page.tsx`
  - 並列 fetch (`Promise.all`) で FS（readPublishPackage）と Sanity（publishPackageStateBySlugQuery）を取る
  - Sanity fetch 失敗時は null を返してフォールバック（read-only UI として落ちない）
  - `PageHeader` の 3 セルを「技術準備 / 公開状況 / 次にやること」に組み替え。公開状況は `0/4` → `4/4` の比率で表示、全公開で done tone、部分公開で warn tone、未取得 / 未設定で info tone
  - `PlatformOverviewCards` の各カードに新規 `PublishedBadge`（✓ 公開済み / ⏳ 未公開）を追加、公開済みなら `公開日時: YYYY-MM-DD HH:mm JST` を補足
  - 各 platform セクション冒頭に `PublishedStatusBlock` を挿入: 公開済みは emerald box（公開済みURL + コピーボタン + 公開日時）、未公開は amber box（公開予定: 未公開 + state 表示）

### 日付フォーマットの設計

`formatPublishedAtJst()` はサーバー / クライアントの timezone 設定に依存しない決定論的実装にした:

1. `Date.parse(iso)` で epoch ms を取得（タイムゾーン情報は ISO 文字列内のオフセットから正しく解釈される）
2. `+9h` のオフセットを ms 単位で加算
3. `getUTCFullYear / Month / Date / Hours / Minutes` で synthetic JST 成分を抽出
4. `YYYY-MM-DD HH:mm JST` で結合

`toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})` を使わなかった理由: Next.js Turbopack の Server / Client で ICU データの違いが出る場合があり、hydration mismatch のリスクがある。決定論的な算術なら必ず一致する。

## 理由

- **既存の `campaignDetailBySlugQuery` を再利用しなかった**: あれは campaign detail 用に重い ({content,brand,visualAsset,promptTemplate}Details などを resolve)。`/publish-package/[slug]` は `manualPublishingStatus` だけあれば十分なので、焦点を絞った新 query にした。ネットワーク負荷も最小
- **Sanity fetch 失敗時のフォールバック**: dashboard は read-only UI で、Sanity が落ちても FS 駆動部分（コピーボタン等）は使える。try/catch で null を返して全体機能を維持
- **`PublishedStatusBlock` を per-platform セクション冒頭に挿入**: ユーザが「これ公開済みだっけ？」を 1 行目で判断できる。手動 publish step は public なので、誤って二度公開するリスクを軽減
- **emoji を tone 強調のために使う**: 全 dashboard 通じて emoji の使い方を最小限に。`PublishedBadge` の `✓` / `⏳` は状態識別の affordance として有効、`CopyButton` のように "視覚的アクセント不要" なボタンには使わない
- **`copy URL` ボタンを公開済みブロックに追加**: boss が後で Sanity reactionNotes バッチ etc を作るとき、URL を再度 reach する手段が dashboard 内に閉じる

## 影響

- boss が `/publish-package/building-hitori-media-os` を開くと、4 媒体の公開状態が 1 画面で読める
- Threads が `⏳ 未公開` で目立つため、公開判断の trigger が dashboard 内で完結
- X / note / Substack の URL を Studio に行かずクリック可能
- Sanity transaction `yXtPUwiZ1lHhdch3ju9FI9` の効果が UI に現れた → controlled write の往復が dashboard で閉じる
- 次回キャンペーンでも同じ v0.2 UI でそのまま使える（slug 違いで route が動く）

## 次の一手

- 24-72 時間後の reactionNotes 反映バッチ: `tools/sanity/reflect-publication-state.mjs` を拡張するか、新 `reflect-reaction-notes.mjs` を作成
- Threads 公開判断: 反応が出揃ったら同じ controlled tool で threads entry のみ patch
- `/publish-package/[slug]` v0.3 候補:
  - 画像サムネ表示 (`/api/asset-thumb` の prefix 拡張で `publish-packages/<platform>/<slug>/images/` を許可)
  - reactionNotes preview（公開後に手書きで埋めた本文を表示）
  - per-campaign template 化（building-hitori-media-os hardcoded を slug-aware に）
