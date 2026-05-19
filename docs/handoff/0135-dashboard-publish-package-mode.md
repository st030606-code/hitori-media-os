# Handoff: Admin Dashboard Publish Package Mode v0.1

Date: 2026-05-18

## 1. Task Goal

Working Pipeline A-G + Pre-Publish Review 完了後、boss が building-hitori-media-os キャンペーンを **手動公開する作業を 1 画面に集約する** UI を作る。各媒体の本文をコピーし、画像のパスを見て、公開後の記録先がわかる、というガイド型ダッシュボード。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし
- ✅ `assets/visuals` / `patches` / dashboard 外の `publish-packages` outputs 改変なし
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし（依存変更なし）
- ✅ schema / data model 変更なし
- ✅ 既存 16 route そのまま動作（新 route `/publish-package/[slug]` を追加）
- ✅ read-only UI（Published URL / Reaction Notes は記録先ガイドのみ、persist しない）
- ✅ account credentials / platform API なし

## 3. Changed Files

新規:

- `dashboard/src/lib/publishPackageReader.ts` — server-only md parser
- `dashboard/src/components/CopyButton.tsx` — `'use client'` クリップボードボタン
- `dashboard/src/app/publish-package/[slug]/page.tsx` — 新 route の page
- `docs/devlog/0124-dashboard-publish-package-mode.md`
- `docs/handoff/0135-dashboard-publish-package-mode.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

更新:

- `dashboard/src/components/AppNav.tsx` — nav に「公開パッケージ」追加、既存を「配布物一覧」にラベル変更
- `dashboard/src/app/page.tsx` — Home 上部に emerald CTA section
- `dashboard/src/app/campaigns/[slug]/page.tsx` — CampaignStatusCard 直下に emerald CTA、`Link` import 追加

## 4. Summary of Changes

### 新 route の構造

`/publish-package/[slug]`:

1. **Page header** — タイトル「公開パッケージ」+ campaign 名 + 技術準備/公開方式/次にやること の 3 状態
2. **Platform overview cards** — X / Threads / note / Substack の 4 カード、anchor link で各セクションへ
3. **X セクション** — メイン投稿 + Alternate Hooks + Optional Thread + Soft CTAs + 画像 + 5 step 手順
4. **Threads セクション** — 同上 + Reply Chain + Discussion Question
5. **note セクション** — 警告ボックス（skipped images / Section 4 marker / insert-map stale）+ Title Options + Lead Paragraph + Article Body + Suggested Image Insertion Points + Soft CTAs + 画像 + 7 step 手順
6. **Substack セクション** — 警告ボックス（about/welcome/notes stub）+ Title Options + Email Subject + Preview Text + Post Body + Notes Plan + 画像 + 7 step 手順
7. **Release review footer** — 5 final-review ファイルパスリスト + reachability link

### Md parser のしくみ

- `extractSection(md, title)`: 指定タイトルの heading（level 1-6）を見つけ、次の同 level 以上の heading まで本文を返す。先頭・末尾の空行を trim
- `extractBullets(section)`: `- ` で始まる行をリスト化
- `extractNumberedThread(section)`: `N/` プレフィックス（X thread / Threads reply chain）でセクションを分解、N/ より前の lead-in 文章は捨てる
- `looksLikeStub(content)`: 300 文字未満 or 先頭 H1 直後に `TODO:` がある → stub と判定（Substack about/welcome/notes 検出用）

### Copy button のフォールバック設計

```
navigator.clipboard.writeText() → 失敗
  → document.createElement('textarea') + execCommand('copy') → 失敗
    → "手動で選択してコピーしてください" 表示
```

成功時は「コピーしました」を 2.2 秒間表示。プライマリ tone（全返信をコピー）と secondary tone（コピー / パスをコピー）で見た目を区別。

### Production / Local FS guard

`enableLocalFsRoutes` が false（production default）の場合、route 全体を「ローカルで起動してください」guidance に差し替え。`notFound()` よりも親切な「なぜ見えないか + どうすれば見えるか」を表示。

## 5. Key Decisions

- **Server + Client component の分離**: FS read を Server Component で行い、Copy button のみ Client Component。Next.js App Router の標準パターン
- **パッケージなしの md parsing**: gray-matter / remark などを足さず、`extractSection` 1 関数で 4 媒体すべて parse 可能。section header が安定していることが前提
- **`/publish-packages`（plural）を消さない**: dataset listing は別 route として残し、新 `/publish-package/[slug]` を追加。reachability 両立
- **per-platform expected filename allowlist**: 期待画像セットが配布されているかを目視確認する作業を UI で短縮。想定外画像は amber 強調
- **release-review ファイルへの copy / write back はしない**: boss が手書きで URL を埋める前提。ダッシュボードは「記入先ガイド」のみ。persist 機構なし
- **8 nav items は許容**: 「公開パッケージ」と「配布物一覧」は役割が違うので統合しない。boss feedback で過密と感じたら統合 / 折りたたみ検討
- **`looksLikeStub` ヒューリスティック**: 厳密な検査より単純な閾値（300 chars + TODO 検出）で十分。Substack stubs は構造が一定

## 6. Human Review Questions

- 8 nav items は許容範囲か？「公開パッケージ」「配布物一覧」が並ぶのは boss にとって混乱しないか？
- 「公開パッケージを開く」CTA を Home と Campaign detail の両方に置いたが、片方に集約したほうが良いか？
- 画像のサムネイル表示を見送ったのは適切か？それとも v0.2 で `/api/asset-thumb` の prefix 拡張までやるべきか？
- Copy button のラベル（「コピー」「全返信をコピー」「パスをコピー」「この投稿をコピー」「タイトルをコピー」）は迷わないか？
- Substack post.md の `# Post Draft` セクション全体を 1 ボタンでコピーする設計は適切か？大きすぎる場合は section ごと（Opening / Main Story / Practical Takeaway / Reader-List Connection / Reader Question / Subscribe CTA）に細分化したほうが良いか？

## 7. Risks or Uncertainties

- **md parsing の脆さ**: section title が変わると extract が空になる。次キャンペーンの publish-package が同じ section title を保つ保証はない。template 化が必要
- **Substack post.md の copy 範囲が広い**: 約 90 行の Post Body を 1 ボタンで copy するため、boss が Substack エディタに貼ったあと markdown formatting を手で整える必要が出る可能性
- **clipboard API の secure context 要件**: localhost / HTTPS でないと動かない。`http://192.168.x.x:3000` でアクセスすると textarea fallback が走るが、user gesture が必要なので失敗する可能性
- **insert-map stale 検出は文字列マッチ**: 「このplatform向けの画像がまだありません」が変わると検出失敗。fragile
- **「公開済み」フラグ未実装**: 公開後の状態が UI に反映されない。boss が手動で final-review に URL を埋めても、dashboard 側の見え方は変わらない。v0.2 で `manualPublishingStatus.state` から derive 予定

## 8. Recommended Next Step

1. boss が `/publish-package/building-hitori-media-os` を開く
2. X → Threads → note → Substack の順に手動公開（`publish-order.md` 参照）
3. 公開後、各 final-review に Published URL / Reaction Notes を手書きで埋める
4. boss feedback を集めて v0.2 候補を優先順位付け:
   - 画像サムネイル表示（`/api/asset-thumb` prefix 拡張）
   - 公開済みフラグの `manualPublishingStatus` 経由表示
   - Substack post body の section 分解 copy
   - per-campaign 拡張（`WorkingPipelineStatus` 等 v0.2 で hardcoded のもの）

## 9. Exact Prompt to Give Codex Next

```text
Implement Admin Dashboard Publish Package Mode v0.2:
Iterate on /publish-package/[slug] based on actual boss feedback after
the first manual publish run.

Hard Rules:
- Do NOT write to Sanity (still read-only).
- Do NOT modify publish-package output files.
- Do NOT deploy.
- Do NOT auto-post.
- Do NOT add packages.

Likely tasks (refine after boss feedback):

1. Image thumbnails in /publish-package/[slug]
   - Extend dashboard/src/app/api/asset-thumb to allow the prefix
     `publish-packages/<platform>/<slug>/images/` in addition to
     `assets/visuals/`.
   - Render the thumbnail inline in <ImageList> next to filename + path.
   - Cap at 8 MB / 256 KB rasterized as today.

2. Published flag from Sanity
   - Pull `manualPublishingStatus` from the campaignPlan via the
     existing dashboardHomeQuery / campaignDetailBySlugQuery.
   - Pass `publishedUrl` / `publishedAt` into the per-platform cards
     in /publish-package/[slug].
   - Show "✓ 公開済み" or "⏳ 未公開" badge with the URL.

3. Substack post.md section-level copy
   - Add granular CopyButtons per H2 section under `# Post Draft`
     (Opening / Main Story / Practical Takeaway / Reader-List Connection /
     Reader Question / Subscribe CTA) so boss can paste per section.
   - Keep the existing "Post Body 全部" copy for one-shot paste.

4. per-campaign hardcoded state
   - Pass `slug` prop into WorkingPipelineStatus / PublishReadinessBoard /
     ReleaseReviewLinks. For unknown slugs, derive what's possible from
     Sanity; for `building-hitori-media-os`, keep current hardcoded
     pipeline state.

Validation:
- cd dashboard && npm run build
- npm run build (Sanity Studio)
- Open /publish-package/building-hitori-media-os, confirm thumbnails
  render and "公開済み" badges appear (or "⏳" if nothing published yet).

Docs:
- docs/devlog/<番号>-dashboard-publish-package-mode-v0-2.md
- docs/handoff/<番号>-dashboard-publish-package-mode-v0-2.md
- docs/handoff/latest.md (mirror)
```
