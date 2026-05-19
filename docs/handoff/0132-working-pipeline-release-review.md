# Handoff: Working Pipeline Step G — Release-Review Markdown 更新

Date: 2026-05-18

## 1. Task Goal

`building-hitori-media-os` キャンペーンの Working Pipeline 1 周完走の最終ステップ (Step G)。Step A–F で完了した「7 件 saved + 2 件 skipped」の状態を、boss が公開判断する前提の release-review markdown に反映する。

ゴール:

- 5 つの release-review markdown を、技術完了済み / boss 判断のみ pending という状態に整える
- 各 platform に 3-axis readiness checklist (Visual / Text / Manual publish) を導入
- `final-human-checklist.md` で boss-only 領域は **絶対に auto-check しない**

## 2. Constraints Followed

- 自動公開・自動投稿は行っていない（boss が手動公開）
- API 連携は追加していない
- Sanity Studio への直接書き込みは行っていない（既存の Step E atomic transaction を参照しているのみ）
- boss-only signature / Published URL / Published Date / Reaction Notes 欄は **空欄のまま** 残した
- 5 ファイル以外の release-review 関連 markdown は触っていない
- 有料 PDF / クライアント secret はファイルに含めていない

## 3. Changed Files

5 ファイルのみ（git status で確認済）:

- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`

新規 docs:

- `docs/devlog/0121-working-pipeline-release-review.md`
- `docs/handoff/0132-working-pipeline-release-review.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

## 4. Summary of Changes

各 platform final-review に「Working Pipeline Step F Status (3-axis readiness)」セクションを追加。

- **Visual assets ✅**: filename / bytes / self-rubric を含む確定状態
- **Text draft ✅**: outputs ファイル / publish-package canonical / redact 状態
- **Manual publish readiness ⏳ pending-human-fill**: タイトル絞り込み / CTA 確定 / 音読 / 公開予定日記入 など boss 判断項目

既存の `Production Visual Readiness` セクションは、各ファイルで全件 `[x]` に更新し、Sanity transaction ID `spvtGcqRbreWFzrmNCgxGn`（Step E atomic）と Step F の bytes を明記。

`final-human-checklist.md` には新規 `Technical Readiness Snapshot` セクションを追加し、Step A–F の完了状態と boss-only 領域を区別。text-first 4 platforms の asset 行 6 件中 4 件を `[x]` に更新（既存 `note-hero-v1` / `substack-header-v1` / `x-hook-main-v1` 3 件は前から checked）。skipped 2 件を別ブロックで明示し、`[x]`（skip 処理済）として扱う。

`note-final-review.md` の 3-axis Visual axis では、「3 ready + 2 skipped」を **明示的に分離**。skip 判断の正当性（補助図のみ、Visual Engine Improvement Phase で再評価、記事は補助図なしで公開可）を 1 行で説明。

## 5. Key Decisions

- **3-axis 統一フォーマット**: 媒体ごとに異なる section 構成を許すと、boss が毎回構造を読み直す必要が出る。Visual / Text / Manual publish の 3 軸でテンプレ化し、後続キャンペーンの基準にする。
- **Sanity transaction ID を全所に明記**: `spvtGcqRbreWFzrmNCgxGn` を最終 review / final-human-checklist の両方に書き込んだことで、後日「この reviewNotes はどの atomic write で入ったか」を grep 1 回で追える。
- **skipped 2 件を `[x]` で記録**: `[ ]` のままだと「未完了」に見える。「skip という判断を済ませた」状態を `[x]` で明示。
- **boss-only 領域を auto-check しない**: 公開判断 / signature / Published URL を agent が代行すると、checklist が儀礼化する。技術完了 ≠ boss 納得、を構造で表現。
- **publish-package 配布ファイル名 / bytes を 1:1 記録**: 各 final-review の Visual assets axis に bytes を書き込んだことで、配布物の同一性を後日 verify 可能（idempotent skip-if-identical の根拠になる）。

## 6. Human Review Questions

- 3-axis readiness checklist のフォーマットは次キャンペーンでもこの構造で良いか？（特に `Manual publish readiness` の項目セットの粒度）
- `note-final-review.md` で skipped 2 件を「補助図 / Visual Engine Improvement Phase で再評価」と書いたが、再評価の trigger（何が起きたら再生成に着手するか）はどこに記録するか？ → Visual Engine Improvement Phase の planning doc に書く想定で良いか
- `final-human-checklist.md` の `Technical Readiness Snapshot` 節は、今後の release-review template にも組み込むか？

## 7. Risks or Uncertainties

- **boss が 5 ファイル全てを読まずに公開判断に進む可能性**: 媒体ごとの review file を全部読んで欲しいが、`final-human-checklist.md` の Per-Platform Review checkbox に頼る形になっている。読まずに公開すると 3-axis section の意味が消える。
- **Published URL 欄の埋め忘れリスク**: 公開後、boss が `Published URL` / `Published Date` / `Reaction Notes` を埋めないと、`post-publication-log` も書けず、Sanity の `substackPostPlan.publishedUrl` も同期されない。
- **次回キャンペーンで 3-axis フォーマットを再利用するための template が未整備**: 現状は building-hitori-media-os に限定の構造。template 化は次タスクで必要。

## 8. Recommended Next Step

順序:

1. boss が `final-human-checklist.md` を 1 度全文音読し、Per-Platform Review / Safety Reaffirmation / 各 final-review 内 publish 判断を順次チェック
2. 公開予定日を記入し、媒体ごとに手動公開（推奨順は `publish-order.md` を参照）
3. 公開後、各 final-review の `Published URL` / `Published Date` / `Reaction Notes` を手動更新
4. `post-publication-log-template.md` を `docs/devlog/` にコピーして post-publication log を書く
5. Working Pipeline 1 周完走の振り返り devlog を別エントリーで起こす — note 第 6・7 章の更新材料 + 次回キャンペーンへの learning

技術側で次に着手すべきは、**3-axis readiness フォーマットを campaign-agnostic な release-review template に昇格**させる作業（次キャンペーンが控えている場合）。

## 9. Exact Prompt to Give Codex Next

```text
publish-packages/campaigns/_template-release-review/ を新規作成し、
building-hitori-media-os-release-review の 5 ファイルから 3-axis readiness checklist 構造を抽出した
campaign-agnostic な template を作成してください。

要件:
- 3-axis section（Visual assets / Text draft / Manual publish readiness）の構造を保つ
- placeholder（{{CAMPAIGN_SLUG}}、{{ASSET_BYTES}}、{{TRANSACTION_ID}} など）を導入
- Sanity transaction ID 記録欄を必ず含める
- boss-only 領域（Final Sign-off / Published URL / Published Date / Reaction Notes）を明示し、auto-check しないことを README で説明
- final-human-checklist にも Technical Readiness Snapshot 節を組み込む

building-hitori-media-os-release-review の 5 ファイルは変更しない。
新規 docs:
- docs/<番号>-release-review-template.md（運用ガイド）
- docs/devlog/<番号>-release-review-template.md
- docs/handoff/<番号>-release-review-template.md

完了後、npm run build と cd dashboard && npm run build を必ず実行してください。
```
