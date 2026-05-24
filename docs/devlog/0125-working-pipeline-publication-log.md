# Working Pipeline Publication Log: building-hitori-media-os

日付: 2026-05-19

## 背景

Working Pipeline 1 周完走 + Pre-Publish Review が完了し、boss が手動公開に進んだフェーズ。X / note / Substack の 3 媒体が公開済み、Threads は意図的に保留。release-review markdown に Published URL / Date / Reaction Notes を反映する作業を実行した。

## 決定・変更

### URL ソース判定

当初指示では「Obsidian の md ファイルに URL が書かれている」前提で、Obsidian vault を search する手順だった。実際に search すると:

- POTA_Empire Obsidian vault（`/Users/sugawaratakuya/Documents/POTA_Empire/`）配下の md で URL を含むのは sanity-ai-content-os の release-review markdown のみ
- iCloud Obsidian (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/`) は空
- 2026-05-19 に modified された URL 含む md は release-review 3 ファイル（X / note / Substack）のみ

boss は URL を直接 release-review ファイル本文に `TODO:` プレフィックス付きで貼り付けていた。boss 確認の上、これを source of truth として採用、`TODO:` プレフィックスを除去して正規の「Published URL」として記録する方針に変更した。

### 反映した URL（2026-05-19 公開）

- **X**: `https://x.com/potablenx/status/2056534823737720925`（2026-05-19 09:38 JST）
- **note**: `https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb`（2026-05-19 09:57 JST）
- **Substack**: `https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os`（2026-05-19 09:57 JST）
- **Threads**: pending（boss が今回の bundle で意図的に見送り）

### 更新したファイル

- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md` — Published URL/Date 確定、Reaction Notes 初回テンプレ
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md` — 同上
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md` — 同上、Sanity 反映待ち項目を明示
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md` — `## Publication Status` 節を追加、Published URL / Date / Reaction を「pending / 未投稿」表記に統一
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md` — `## Publication Log Snapshot` 節を追加（4 platform の公開状況 + Pending Sanity reflection チェックリスト）

### 触らなかったこと

- Sanity への書き込み: 本バッチでは行わない（hard rule）。`final-human-checklist.md` に「Pending Sanity reflection」サブセクションを追加して、次バッチで Sanity Studio から手動反映する項目を明示しただけ
- Threads を published 扱いにしない: 4/4 が published になるまで campaign 全体は **partially published** ステータス
- 公開順 / 推奨投稿テンプレ等の content 部分は変更なし

## 理由

- **URL を `TODO:` プレフィックス付きで残さなかった**: boss が `cat *-final-review.md | grep Published` で 1 行抽出する運用や、`/publish-package/[slug]` dashboard の自動表示時に「TODO」表記が出ると「未公開」と誤認識する可能性が高い。正規の URL 1 行に整理して、後段の自動処理を素直にした
- **Date 表記を `2026-05-19 09:38 JST` に統一**: 「2026年5月19日 午前9:38」「2026年5月19日 09:57」と表記揺れがあったので、ISO 寄りで JST 明記の統一形式へ。後段で `Date.parse()` 等で処理しやすい
- **Threads を「pending」と書いた**: 「未投稿」「公開予定」と曖昧にすると後段の状態判定が割れる。`pending` という単語で固定。「次回以降に手動公開する」を理由として併記
- **Sanity 反映を pending として明示**: Sanity 書き込みを今 batch でやらないと決めたので、忘れないよう「Pending Sanity reflection」ブロックに 4 項目チェックリスト化（substackPostPlan.publishedUrl / manualPublishingStatus / contentIdea.outputChecklist / substackGrowthAction.resultNotes）

## 影響

- boss は X / note / Substack の Published URL を 1 画面で確認可能（dashboard `/publish-package/building-hitori-media-os` のリリースレビュー footer + final-human-checklist の Publication Log Snapshot）
- 後段の Sanity 反映バッチで「何をどう更新するか」が事前リストアップされた
- Threads 公開時には threads-final-review.md の Publication Status / URL / Date / Reaction Notes 4 ブロックを差し替えるだけで済む（同じ format に統一済み）
- campaign 全体が **partially published** ステータスのまま — 次の Threads 公開でクローズする想定

## 次の一手

1. **Sanity 反映バッチ**: Studio で 4 項目を手動更新（本 devlog の Pending Sanity reflection ブロック参照）
2. **24-72 時間後の Reaction Notes 更新**: 各 final-review の `## Reaction Notes` / `## Subscriber / Reply Notes` を手動で書き直す
3. **Threads 公開判断**: X / note / Substack の反応が出揃ったあと、Threads を公開するかを boss が判断。公開する場合は threads-final-review.md の 4 ブロック差し替え
4. **Working Pipeline 1 周完走の振り返り devlog**: 「何が手動で残ったか / どこが自動化候補か」を別エントリーで起こす（Visual Engine Improvement Phase / Sanity 反映自動化 / dashboard publish-package mode v0.2 等の優先順位付け）
