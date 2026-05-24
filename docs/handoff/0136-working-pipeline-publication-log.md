# Handoff: Working Pipeline Publication Log: building-hitori-media-os

Date: 2026-05-19

## 1. Task Goal

Working Pipeline 1 周完走後、boss が手動公開した X / note / Substack の Published URL / Date / Reaction Notes を release-review markdown に正式に反映する。Threads は意図的に見送られているため pending として記録。Sanity 書き込みは本バッチで行わず、次バッチに pending listとして残す。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし（Pending として明示記録のみ）
- ✅ deploy / auto-post なし
- ✅ `assets/visuals` / `patches` / publish-package output images 改変なし
- ✅ schema / data model 変更なし
- ✅ パッケージ追加なし
- ✅ URL を捏造していない（実際に貼られていた URL を `TODO:` プレフィックス除去して採用）
- ✅ Threads を published 扱いにしていない（pending として明示）
- ✅ boss-only signature 等を捏造していない

## 3. Changed Files

更新（5 ファイル）:

- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md` — Published URL / Date / Reaction Notes
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md` — 同上
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md` — 同上、Sanity 反映 pending を明示
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md` — `## Publication Status` 節追加、URL / Date / Reaction を「pending」表記に統一
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md` — `## Publication Log Snapshot` 節追加（4 platform 状態 + Pending Sanity reflection チェックリスト）

新規（3 ファイル）:

- `docs/devlog/0125-working-pipeline-publication-log.md`
- `docs/handoff/0136-working-pipeline-publication-log.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

触らなかった:

- `assets/visuals/*` / `patches/*` / `publish-packages/<platform>/<slug>/images/*` / `dashboard/*` / schemas / Sanity dataset
- Threads の Published URL（boss が見送りと判断したため pending 表記）

## 4. Summary of Changes

### URL 反映方針

当初指示の「Obsidian md ファイルから URL を抽出」は Obsidian search で対応する md ファイルが見つからなかったため不可能だった。実態として、boss は URL を直接 release-review ファイル本文に `TODO:` プレフィックス付きで貼り付けていた。boss 確認の上、これを source of truth として採用。

反映した URL (2026-05-19 公開):

| platform | URL | 公開日時 (JST) |
|---|---|---|
| X | https://x.com/potablenx/status/2056534823737720925 | 2026-05-19 09:38 |
| note | https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb | 2026-05-19 09:57 |
| Substack | https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os | 2026-05-19 09:57 |
| Threads | pending | pending |

### 日付フォーマット統一

「2026年5月19日 午前9:38」「2026年5月19日 09:57」の表記揺れを `2026-05-19 09:38 JST` 形式に統一。後段の自動処理（dashboard 表示 / Sanity 反映スクリプト）で `Date.parse()` 等が直接使える形に。

### Threads の扱い

`## Publication Status` 節を新設して「**未投稿**（boss が今回の bundle ではあえて Threads 公開を見送り。X / note / Substack の反応を見てから次回以降に公開予定）」と理由を明示。Published URL / Date / Reaction Notes は全部「pending」表記に統一。

### Publication Log Snapshot (final-human-checklist.md)

`## Pre-Publish Review Result` の直後に新節として挿入。4 platform 状態を ✅/⏳ で並べ、各 final-review へリンク。Pending Sanity reflection の 4 項目チェックリストを subsection として明記。

## 5. Key Decisions

- **`TODO:` プレフィックスを除去して正規化**: dashboard `/publish-package/[slug]` や後続の自動処理が「TODO」を「未公開」と誤認識するのを防ぐ。URL は単独行に
- **日付フォーマット ISO 寄り + JST 明記**: 表記揺れを統一、後段の `Date.parse()` 互換性
- **Threads を `pending` 単語で固定**: 「未投稿」「公開予定」と曖昧にしない、後段の状態判定が割れない
- **Sanity 反映を 4 項目チェックリスト化**: 本バッチで Sanity 書き込みをしないが、忘れないよう次バッチ向け todo として明示
- **campaign 全体を fully published にしない**: 4/4 公開で初めて campaign closure とする方針。Threads pending のため partially published

## 6. Human Review Questions

- Threads 公開を本当に見送って良いか？ X / note / Substack の反応を 24-72 時間見てから判断する想定で良いか？
- Sanity 反映を別バッチに分けたが、boss は自分で Studio から手動更新するか、agent に Studio 反映スクリプト（Step E 同様の controlled atomic write）を作らせるか？
- `404runner.substack.com` の slug が `note-substack-x-threads-youtube-podcast1os` と長い。Substack publication 自体の slug 設定は問題ないか？（URL は変更不可だが運用 ok か）
- 日付フォーマット `2026-05-19 09:38 JST` で統一して良いか？ ISO 8601 `2026-05-19T09:38+09:00` も候補

## 7. Risks or Uncertainties

- **URL の typo リスク**: boss が貼り付けた URL を agent はそのまま採用した。1 文字 typo があると公開 URL として失敗するが、boss が自分で貼った URL なので低リスク。boss が後で実際に開いて確認推奨
- **Reaction Notes が空のまま**: 公開直後は反応が無いため初期テンプレ「初回公開。X 後で追記。」のみ。24-72 時間後に boss が手書きで更新する必要あり
- **Sanity 反映を後回しにした**: dashboard と release-review markdown は正、Sanity は未反映の状態が一時的に発生。次バッチで解消する想定
- **Threads 公開判断が宙ぶらりん**: pending と書いたが、いつまでに判断するかの deadline は記録していない。boss 自身の判断に依存

## 8. Recommended Next Step

順序:

1. **24-72 時間待機** → 各 final-review の Reaction Notes を手書きで埋める
2. **Sanity 反映バッチ** — 以下を Studio で手動 or controlled script で更新:
   - `substackPostPlan.publishedUrl` ← Substack URL
   - `manualPublishingStatus`（4 platform 分: X/note/Substack = `state: done` + URL、Threads = `state: not-started`）
   - `contentIdea.outputChecklist` の該当 entry に `publishedUrl` 反映
   - `substackGrowthAction.resultNotes` は反応が出てから更新
3. **Threads 公開判断** — 反応が出揃ったあと公開するかどうかを boss が判断
4. **Working Pipeline 振り返り devlog** — 「何が手動で残ったか / どこが自動化候補か」を別エントリーで起こす

## 9. Exact Prompt to Give Codex Next

```text
Reflect building-hitori-media-os publication state to Sanity Studio
via a controlled atomic write (mirroring the Step E pattern at
tools/sanity/reflect-working-pipeline-visual-assets.mjs).

Hard Rules:
- Use the existing 4-layer safety pattern from Step E:
  - _id allowlist
  - --dry-run default
  - SANITY_WRITE_TOKEN required for --execute
  - atomic transaction
- Do NOT auto-post.
- Do NOT modify release-review markdown (already updated).
- Do NOT change schema/data model.
- Reflect only what's in publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md Publication Log Snapshot.

Tasks:
1. Create tools/sanity/reflect-publication-state.mjs:
   - allowlist: substackPostPlan.building-hitori-media-os,
     manualPublishingStatus.* (4 platform entries),
     contentIdea.building-hitori-media-os.outputChecklist (Sanity-side
     subdocument keys to be confirmed by reading the dataset),
     substackGrowthAction.building-hitori-media-os.about-page-update
   - --dry-run prints the patch JSON; --execute commits the atomic
     transaction
2. Set:
   - manualPublishingStatus: X/note/Substack = `state: done` +
     `publishedUrl` + `publishedAt`; Threads = `state: not-started`
   - substackPostPlan.publishedUrl
   - contentIdea.outputChecklist entries that have a publishedUrl field
3. Do NOT set:
   - substackGrowthAction.resultNotes (defer until reaction data exists)
   - reactionNotes (defer)
4. Verify post-write that all entries are saved (read-back diff).
5. Write devlog + handoff with the transaction ID.

Validation:
- node tools/sanity/reflect-publication-state.mjs --dry-run
- (boss adds SANITY_WRITE_TOKEN to .env.local if not present)
- node tools/sanity/reflect-publication-state.mjs --execute
- npm run build
- cd dashboard && npm run build

Docs:
- docs/devlog/<番号>-publication-state-sanity-reflect.md
- docs/handoff/<番号>-publication-state-sanity-reflect.md
- docs/handoff/latest.md (mirror)
```
