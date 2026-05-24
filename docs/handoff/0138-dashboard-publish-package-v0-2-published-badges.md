# Handoff: Dashboard /publish-package/[slug] v0.2 — Published Badges

Date: 2026-05-19

## 1. Task Goal

Sanity transaction `yXtPUwiZ1lHhdch3ju9FI9` で反映済みの `manualPublishingStatus` を dashboard から読み、`/publish-package/[slug]` で per-platform `✓ 公開済み` / `⏳ 未公開` バッジ + `publishedUrl` 外部リンク + `publishedAt` JST フォーマット表示を出す。v0.1 の copy-friendly UI は温存。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし（fetch のみ、read-only UI）
- ✅ publish-package output files / assets/visuals / patches / schemas / data model 不変
- ✅ deploy / auto-post / packages 追加なし
- ✅ 既存 17 route そのまま、v0.1 UI 温存（copy buttons / image paths / 警告 / release-review links / 手動手順）
- ✅ hydration mismatch を避けるため、`publishedAt` フォーマットは server / client で同一結果になる決定論的算術で実装

## 3. Changed Files

新規:
- `dashboard/src/lib/groq/publishPackage.ts` — focused GROQ query + ヘルパ (`findPlatformState`, `isPublished`, `formatPublishedAtJst`) と型 (`PublishPackageState`, `PublishPackagePlatformState`)
- `docs/devlog/0127-dashboard-publish-package-v0-2-published-badges.md`
- `docs/handoff/0138-dashboard-publish-package-v0-2-published-badges.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

更新:
- `dashboard/src/app/publish-package/[slug]/page.tsx`
  - 並列 fetch (FS + Sanity)
  - Sanity fetch 失敗時のフォールバック（null）
  - `PageHeader` を 3 セル化（技術準備 / 公開状況 / 次にやること）
  - 新規 `PublishedBadge` を Platform Overview Cards に注入
  - 新規 `PublishedStatusBlock` を各 platform セクション冒頭に注入

## 4. Summary of Changes

### GROQ helper

```groq
*[_type == "campaignPlan" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  "manualPublishingStatus": manualPublishingStatus[]{
    platform, state, publishedUrl, publishedAt
  }
}
```

最小限の field だけ pull。既存 `campaignDetailBySlugQuery`（重い）を流用しなかった理由は devlog 参照。

### `formatPublishedAtJst()`

server / client tz 設定に依存しない決定論的実装:

1. `Date.parse(iso)` で UTC epoch ms
2. `+9h` を ms 単位で加算
3. `getUTCFullYear/Month/Date/Hours/Minutes` で synthetic JST 成分抽出
4. `YYYY-MM-DD HH:mm JST` で連結

`Date.parse('2026-05-19T09:38:00+09:00')` → 加算後の synthetic JST → `2026-05-19 09:38 JST`. ✓

### UI 構造

- **PageHeader (3 cells)**
  - 技術準備: 完了 (done tone)
  - 公開状況: `N/4 公開済み` または `未取得（Sanity 接続不可）` または `未設定`
  - 次にやること: 全公開で「Reaction Notes を後日記入」、partial で「N/4 公開済み — 残りを手動投稿」

- **PlatformOverviewCards (4 cards)**
  - 各カードに `<PublishedBadge>`: ✓ 公開済み (emerald) or ⏳ 未公開 (amber)
  - 公開済みなら `公開日時: YYYY-MM-DD HH:mm JST` を補足表示
  - v0.1 の hasText/hasImage/reviewed/extra リストはそのまま下に残存

- **per-platform セクション (X/Threads/note/Substack)**
  - 各セクション冒頭に `<PublishedStatusBlock>` を挿入:
    - 公開済み: emerald box → ✓ 公開済み + 公開日時 + 公開済みURL（外部リンク target="_blank" rel="noopener noreferrer"）+ CopyButton(URL)
    - 未公開: amber box → 公開予定: 未公開 (state: <state>)
  - その後の v0.1 UI（メイン投稿 / 候補 / Thread / 画像 / 手順 / 警告 / 詳細情報）は全て温存

### Sanity データ反映の今の値

| platform | state | publishedUrl | publishedAt | UI |
|---|---|---|---|---|
| x | done | https://x.com/potablenx/status/2056534823737720925 | 2026-05-19T09:38+09:00 | ✓ 公開済み + 公開日時 + リンク |
| note | done | https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb | 2026-05-19T09:57+09:00 | ✓ 公開済み + 公開日時 + リンク |
| substack | done | https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os | 2026-05-19T09:57+09:00 | ✓ 公開済み + 公開日時 + リンク |
| threads | not-started | — | — | ⏳ 未公開 + 手動公開手順 |

## 5. Key Decisions

- **既存 `campaignDetailBySlugQuery` を再利用しなかった**: あれは campaign detail の重い fetch（{content,brand,visual,prompt}Details など）。publish-package は `manualPublishingStatus` だけで足りるので focused helper を作成
- **Sanity fetch 失敗時に null フォールバック**: 「Sanity 落ち = dashboard 全壊」を避ける。FS-derived UI（copy buttons）は引き続き使える、badges だけ unknown 状態に degrade
- **`formatPublishedAtJst` を決定論的に**: `toLocaleString('ja-JP', {timeZone: ...})` は Next.js Turbopack の server / client ICU 差で hydration mismatch を起こす可能性。算術ベースで完全一致を保証
- **`PublishedStatusBlock` を per-platform セクション冒頭に**: boss が手動公開直前に「これ公開済みだっけ？」を 1 行目で判断できる。誤って二度公開するリスクを軽減
- **emoji `✓` `⏳` は state affordance として残す**: 状態識別の視覚的キーとして有効。逆に「コピー」「URLをコピー」等のラベルには emoji を入れない（v0.1 時の方針継続）
- **`PublishedStatusBlock` 内に CopyButton (URL)**: boss が後で Sanity reactionNotes バッチや post-publication log を書く際に、URL に dashboard 内で reach できる

## 6. Human Review Questions

- `PublishedBadge` ラベル `✓ 公開済み` / `⏳ 未公開` で良いか？「公開予定」「公開待ち」など別単語の方が直感的か
- `formatPublishedAtJst` の `YYYY-MM-DD HH:mm JST` で良いか？「2026年5月19日 09:38」の方が読みやすいか
- 各 platform セクションに `PublishedStatusBlock` を冒頭表示したが、メイン投稿のすぐ上だと「下のテキストが古い？」と混乱しないか？それとも手順カードの直前の方が良いか
- `Sanity fetch 失敗 → null フォールバック` は静かすぎるか？「Sanity 接続不可」を画面上部の bar に出すべきか

## 7. Risks or Uncertainties

- **Sanity 公開後の slug 変更リスク**: campaignPlan の slug が変わると GROQ fetch が空になり、全 platform が `⏳ 未公開` 表示に逆戻り。dashboard 上では検出できない
- **hydration テスト不足**: 決定論的算術にしたが、実機で hydration を確認したわけではない。boss が `npm run dev` で開いたとき console warning が出ないか確認推奨
- **複数 campaign 対応の hardcoded**: `building-hitori-media-os` 名で UI 内部に campaign 名がいくつか残る。次キャンペーンで slug を変えると一部表示が壊れる
- **タイムゾーン明示**: `JST` を文字列で固定。boss が将来海外旅行中に dashboard を見ると、ローカル時刻ではなく JST 固定表示になる（これは意図通り）

## 8. Recommended Next Step

1. **24-72 時間後の reactionNotes 反映バッチ** — boss が手書き済みの reactionNotes を `tools/sanity/reflect-reaction-notes.mjs`（新規）で反映、または既存 `reflect-publication-state.mjs` を `--reaction-notes` モードに拡張
2. **Threads 公開判断** — X / note / Substack の反応データが揃ったら boss が判断、公開後に同 controlled tool で threads entry のみ patch（通常の patch-by-key パスで _key 付き → 安全）
3. **v0.3 候補（boss feedback 次第）**:
   - 画像サムネ表示 (`/api/asset-thumb` prefix 拡張で `publish-packages/<platform>/<slug>/images/` を許可)
   - reactionNotes preview（公開後の手書きを表示）
   - per-campaign template 化（slug-aware に hardcoded を除去）
4. **Working Pipeline 1 周完走の振り返り devlog** — Step A→Sanity 反映→dashboard v0.2 までの全体ループで「何が手動で残ったか / どこが自動化候補か」をまとめる

## 9. Exact Prompt to Give Codex Next

```text
Implement reactionNotes reflection for building-hitori-media-os
via the controlled atomic write pattern.

Context:
24-72 hours after first publish, the boss writes Reaction Notes
manually into each platform's *-final-review.md. Now we want that
content reflected to Sanity:
  campaignPlan.building-hitori-media-os.manualPublishingStatus[*].reactionNotes
  substackGrowthAction.building-hitori-media-os.about-page-update.resultNotes

Hard Rules:
- Use 4-layer safety from Step E pattern:
  - _id allowlist
  - --dry-run default
  - SANITY_WRITE_TOKEN for --execute
  - atomic transaction
- Do NOT auto-post.
- Do NOT modify release-review markdown.
- Do NOT change schema/data model.
- Do NOT touch publishedUrl / publishedAt (already set).
- Refuse to write if reactionNotes content looks like the initial
  template "初回公開。X 後で追記。" (no actual reaction data yet).

Tasks:
1. Extend tools/sanity/reflect-publication-state.mjs with a
   --reflect-reactions mode, OR create a new script
   tools/sanity/reflect-reaction-notes.mjs.
2. Read release-review files for the 4 platforms; extract the
   contents of `## Reaction Notes` / `## Subscriber / Reply Notes`
   sections.
3. Detect "no real data" via heuristic: if the extracted text
   matches the initial template, skip with a warning.
4. Build the patch:
   manualPublishingStatus[_key=="<key>"].reactionNotes = <text>
   (using the _key set in transaction yXtPUwiZ1lHhdch3ju9FI9)
5. For Substack, also try substackGrowthAction.* if it exists.
6. Dry-run first, execute after boss confirms.
7. Post-write verify by re-read.

Validation:
- node tools/sanity/reflect-reaction-notes.mjs --dry-run
- node tools/sanity/reflect-reaction-notes.mjs --execute
- cd dashboard && npm run build
- npm run build

Docs:
- docs/devlog/<番号>-reaction-notes-sanity-reflect.md
- docs/handoff/<番号>-reaction-notes-sanity-reflect.md
- docs/handoff/latest.md (mirror)
```
