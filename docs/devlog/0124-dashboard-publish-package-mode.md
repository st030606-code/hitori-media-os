# Admin Dashboard Publish Package Mode v0.1

日付: 2026-05-18

## 背景

Working Pipeline A-G + Pre-Publish Review が完了し、dashboard も Japanese Review Mode v0.2 まで進めた段階。しかし review 画面はあくまで「状態確認」用で、boss が実際に手動公開するときに「本文をどこから取って、画像はどこにあり、公開後どこに記録するか」を 1 画面で完結させる UI がなかった。

ボトルネック:

- 4 媒体それぞれの publish-package md（`posts.md` / `article.md` / `post.md` 等）をエディタで開いて、必要箇所を選択コピー
- 画像のパスを `publish-packages/<platform>/<slug>/images/` から目視で確認
- 公開後の URL 貼り付け先（`*-final-review.md`）をエディタで開き直す
- すべて手作業で平均 5〜10 個のファイル切替が発生

「dashboard → 各媒体タブ → コピー → 投稿先に貼る」で完結できれば、4 媒体公開の操作回数を大幅に削減できる。

## 決定・変更

### 新規ルート: `/publish-package/[slug]`

- Server Component（FS access）+ Client Component（CopyButton）の組み合わせ
- 既存 `/publish-packages`（dataset list view）はそのまま温存、新 route は singular で「per-campaign 公開ガイド」を担う
- enableLocalFsRoutes 無効時は「ローカルで起動してください」と explicit guidance を表示（既存の `notFound()` パターンより親切）

### 新規ファイル

- `src/lib/publishPackageReader.ts`: Server-only markdown parser。`extractSection(md, title)`（heading level-aware 抽出）と `extractNumberedThread(section)`（"1/ ...", "2/ ..." パターン分解）の 2 つの primitive で 4 媒体 + release-review を全部読み解く。パッケージ追加なし、`node:fs/promises` + `node:path` のみ
- `src/components/CopyButton.tsx`: `'use client'` のクリップボードボタン。`navigator.clipboard.writeText` 優先、失敗時は `<textarea>` + `document.execCommand('copy')` フォールバック、それも失敗したら「手動で選択してコピーしてください」表示
- `src/app/publish-package/[slug]/page.tsx`: ルート本体。4 媒体セクション + Platform Overview Cards + Release Review Footer

### 更新

- `src/components/AppNav.tsx`: 新規 nav item「公開パッケージ」を追加（→ `/publish-package/building-hitori-media-os`）、既存「配布パッケージ」を「配布物一覧」にラベル変更（→ `/publish-packages` のまま）。8 nav items
- `src/app/page.tsx`: Home 上部に emerald-bordered 公開パッケージ CTA section を `WorkingPipelineStatus` 直後に追加
- `src/app/campaigns/[slug]/page.tsx`: `PublishReadinessBoard` 直後に同 CTA を追加、`Link` import を追加

### Platform セクション設計

各媒体カード共通レイアウト:

1. **メイン投稿 / Title / Lead** を `<TextBlock>` で表示（コピーボタン付き）
2. **Alternate Hooks / Title Options** を `<BulletWithCopy>` でリスト表示（1 項目ずつコピー可能）
3. **Thread / Reply Chain** を `<ThreadCopySection>` で表示（個別投稿コピー + 全部一括コピーの 2 ボタン）
4. **画像リスト** を `<ImageList>` で表示（filename + 相対パス + byte 数 + パスコピーボタン）
5. **手順** を `<ManualStepsList>` で 5〜7 ステップの amber-tinted ol 表示
6. **詳細情報** を `<details>` の中（source file path）

### 媒体別の追加表示

- **X**: 期待 image `x-hook-main-v1.png` を allowlist として渡し、想定外の画像があれば amber 強調
- **Threads**: Optional Reply Chain 7 投稿は release-review が「4〜5 に絞る」と既述、ラベルにその注意書きを inline
- **note**: 警告ボックスを 3 件出す（skipped 2 件 / Section 4 marker / insert-map stale）
- **Substack**: 警告ボックスで about-page / welcome-email / notes の stub 状態を明示

### 公開後記録ファイル footer

- 5 release-review ファイルのローカルパスをリスト表示
- 「このダッシュボードは記入先のガイドのみ表示します（保存はしません）」と明示
- 「キャンペーン詳細に戻る」+「配布物一覧」リンクで reachability 維持

## 理由

- **server / client 分割の理由**: FS read は Server Component でしかできない（次の SSR で repo root から read）。Copy button は client interaction が必要なので `'use client'`。混在は Next.js App Router の標準パターンで、Server が parse 済みデータを Client に props で渡す
- **パッケージなしの md parsing を選んだ理由**: gray-matter / unified / remark を追加する必要は薄い。section ヘッダがすべて統一的（`## <title>`）なので、正規表現 1 つで十分。次キャンペーンで md 構造が大きく変わったら採用検討
- **per-platform allowlist で画像を強調する理由**: 期待通りの画像セットが配布されているかを目視で確認する作業を、UI レベルで「allowlist にあれば slate、なければ amber」と差別化することで省略
- **enableLocalFsRoutes ガード**: production 環境では FS が直接 read できないので、route そのものを `notFound()` する代わりに「ローカルで起動してください」と説明文を出す。Phase Admin 1 のローカルファースト方針と一致
- **Copy button の fallback 設計**: `navigator.clipboard` は secure context（HTTPS / localhost）でしか動かない。localhost dev では問題ないが、念のため `document.execCommand('copy')` のフォールバック、それも失敗時は「手動で選択してコピー」を明示。サイレント失敗を避ける
- **nav item を 8 個にした**: 「公開パッケージ」と「配布物一覧」を両方残した。前者は per-campaign 公開ガイド、後者は dataset 全体の listing。役割が違うので統合しない

## 影響

- boss は dashboard 1 画面で 4 媒体の本文 + 画像 + 手順 + 記録先を確認できる
- エディタ切替が「4 媒体の publish-package md + 5 release-review md = 計 9 ファイル open」から「dashboard 1 画面 + 手動公開後に 4 final-review を URL 記入のために開く = 計 5 ファイル open」に削減
- 既存 16 route + 新 1 route = 17 route 動作維持、build TypeScript clean
- パッケージ追加なし / schema 変更なし / Sanity 書き込みなし / dashboard 外の publish-package output ファイル不変
- 次キャンペーンでも同じ slug 違いの URL で利用可能（`/publish-package/<次の slug>`）

## 次の一手

- boss が `/publish-package/building-hitori-media-os` を開いて 4 媒体公開を実施
- 公開後、各 final-review に Published URL / Reaction Notes を手書きで埋める
- v0.2 計画（boss feedback 後）:
  - 画像サムネを `/api/asset-thumb` の prefix allowlist に `publish-packages/<platform>/<slug>/images/` を追加してその場で表示
  - Substack about-page / welcome-email / notes の inline editor（write back せず、boss が clipboard 経由でファイルに反映する想定）
  - 「公開済み」フラグを Sanity の `manualPublishingStatus.state` から derive して、媒体カードに ✓ 公開済み / ⏳ 未公開 を表示
  - 複数 campaign 対応で per-campaign `WorkingPipelineStatus` も拡張
