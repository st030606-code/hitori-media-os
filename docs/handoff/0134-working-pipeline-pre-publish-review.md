# Handoff: Working Pipeline Pre-Publish Review 完了

Date: 2026-05-18

## 1. Task Goal

Working Pipeline Step G 完了後、boss が手動公開判断に進む前に「technical 観点」と「editorial 観点」の dual-reviewer 公開前レビューを実施し、結果を `final-human-checklist.md` に記録する。

## 2. Constraints Followed

- ✅ Review-only — platform package outputs / images / Sanity / dashboard / schemas / patches に変更なし
- ✅ Sanity 書き込みなし
- ✅ deploy / auto-post / publish-package 実行なし
- ✅ Published URL / Published Date / Reaction Notes は空欄維持（boss-only）
- ✅ Final Sign-off は boss 自身が user/linter で更新（agent 側は触らず）
- ✅ パッケージ追加なし / schema 変更なし
- ✅ 修正対象は本タスク指定の 4 ファイルのみ:
  - `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`
  - `docs/devlog/0123-working-pipeline-pre-publish-review.md`
  - `docs/handoff/0134-working-pipeline-pre-publish-review.md`
  - `docs/handoff/latest.md`

## 3. Changed Files

- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md` — `Pre-Publish Review Result` セクション + `Non-blocking notes` サブセクションを `Technical Readiness Snapshot` の直後に挿入
- `docs/devlog/0123-working-pipeline-pre-publish-review.md`（新規）
- `docs/handoff/0134-working-pipeline-pre-publish-review.md`（本ファイル、新規）
- `docs/handoff/latest.md`（本ファイルをミラー）

## 4. Summary of Changes

### Technical review: PASS

Claude Code が以下を実行し、blocking issues = none:

- Step A–G 完了確認、Sanity transaction `spvtGcqRbreWFzrmNCgxGn` 全所整合
- publish-package 画像 7/7 件 byte 完全一致
- master file 6/6 件存在
- patch JSON 7 件 `status: saved` + `directSanityWrite: false`
- release-review 5 ファイル 3-axis section 揃い、boss-only field placeholder 維持
- skipped 2 件明示記録（`note-inline-manual-vs-automation-v1` / `note-inline-publish-package-folder-v1`）
- secret / token / paid PDF leak scan = 0 件
- `npm run build` / `cd dashboard && npm run build` 両者 clean

### Editorial review: PASS_WITH_NOTES（Claude Code 代替実行）

Codex CLI が model version mismatch（v1.0.3 default `gpt-5.5` 未対応 + ChatGPT subscription が代替モデル不許可）で起動不能。boss 判断で Claude Code が editorial review を代替実行。Blocking issues = none、ただし以下 4 件の non-blocking notes:

1. `publish-packages/note/building-hitori-media-os/insert-map.md` が stale（Step F で hero + 2 inline 計 3 枚配布済みだが TODO 表記のまま）
2. `publish-packages/note/building-hitori-media-os/article.md` Section 4 末尾の `> 想定画像挿入:` マーカーが skipped image を指したまま
3. `publish-packages/substack/building-hitori-media-os/{about-page,welcome-email,notes}.md` は TODO stub のまま（release-review で「手書きで埋める」と既述）
4. X 6 投稿スレッド / Threads 7 投稿 reply chain は冗長気味（release-review で「4-5 本に絞る判断あり」既述）

すべて boss の手動編集パスで吸収可能、または release-review に既明示。

### Codex CLI 不通の扱い

- 「dual-reviewer 独立性」が失われたことを `Pre-Publish Review Result` セクションに `Editorial reviewer note` として明示記録
- 致命的でないので公開判断は進める判断を boss が採用
- 後日 Codex CLI 復旧後の editorial 軸再 review は boss 判断

## 5. Key Decisions

- **代替実行を選んだ**: Working Pipeline 1 周完走の test 優先度が高く、dual-reviewer 独立性の損失はキャンペーンを止めるほどではないと boss 判断。building-in-public 文脈で失敗もリカバリ可。
- **代替実行を明示記録した**: 「Codex CLI 障害が起きていた」事実を残すことで、次回キャンペーンで「公開前に Codex CLI version check を強制する」改善 trigger になる。
- **PASS_WITH_NOTES を blocking と区別**: non-blocking notes 4 件はすべて手動編集パスで吸収可能 / 既明示。boss を急かさず、判定基準を分離した。
- **Final Sign-off は触らない**: boss が user/linter で既に `[x]` を入れている状態を尊重。agent が再書き込みしない。

## 6. Human Review Questions

- 「Codex CLI 復旧後の editorial 再 review」をやるか？やる場合は publish 後 or 公開前にもう一度回すか？
- `note article.md` Section 4 マーカーの扱いは boss が手動で削除する想定でよいか？それとも次キャンペーンで publish-package builder 側で「skipped image marker を自動 strip」するロジックを入れるか？
- `insert-map.md` を Step F の builder が自動同期する改善は v0.3 で組み込むべきか？
- `Pre-Publish Review Result` セクションは次キャンペーンの release-review template にも組み込むか？

## 7. Risks or Uncertainties

- **Dual-reviewer 独立性の損失**: Technical + Editorial が同モデル（Claude Code）から出ているため、編集観点で見落としがあった場合に Technical review もそれを catch できていない可能性。boss 公開前の音読パスで補完する想定。
- **Codex CLI 復旧トリガー未設定**: 現状「次回キャンペーンで Codex CLI version check を Working Pipeline 開始時に走らせる」自動化は未実装。手動で boss が気付かないと再発する。
- **note insert-map.md staleness は次キャンペーンでも再発する**: Step F builder が `insert-map.md` を書き換えるロジックなしのため、同じ問題が次キャンペーンの note でも起きる。改善は publish-package builder の機能拡張に依存。
- **Editorial review の自己評価バイアス**: Claude Code が自分の technical review 結果に引きずられて editorial の厳しさを下げた可能性は理論上否定できない（mitigation: 観点を明確に分離して実施）。

## 8. Recommended Next Step

順序:

1. boss が `final-human-checklist.md` の `Pre-Publish Review Result` セクションと `Non-blocking notes` を音読
2. `Safety Reaffirmation` / `Tracking Plan` / `Pause Conditions` をチェック
3. 公開予定日を記入し、`publish-order.md` の順序で手動公開
4. 公開後、各 final-review の `Published URL` / `Published Date` / `Reaction Notes` を手動更新
5. `post-publication-log-template.md` を `docs/devlog/` にコピーして post-publication log を書く

技術側の次の改善候補（boss 判断後）:
- Codex CLI version check を Working Pipeline Step A 開始時に走らせる検査 script
- publish-package builder に `insert-map.md` 自動同期ロジック
- release-review template に `Pre-Publish Review Result` セクション組み込み
- Working Pipeline 1 周完走の振り返り devlog（note 第 6・7 章の更新材料）

## 9. Exact Prompt to Give Codex Next

```text
After boss completes manual publishing for building-hitori-media-os:

1. Read post-publication-log-template.md and copy it to
   docs/devlog/<番号>-building-hitori-media-os-post-publication-log.md.

2. Fill in:
   - Published URLs for each platform (boss provides)
   - Published Date / Time (boss provides)
   - Reaction Notes (boss provides after 24-72 hours)

3. Update Sanity:
   - substackPostPlan.publishedUrl (Studio manual update)
   - substackGrowthAction.resultNotes (Studio manual update)
   - contentIdea.outputChecklist entries with publishedUrl

4. Then write a Working Pipeline retrospective devlog covering:
   - what manual work was actually expensive (vs. expected)
   - which steps are now automation candidates (Visual Engine
     Improvement Phase scope)
   - what to change for next campaign (insert-map auto-sync,
     Codex CLI version check, release-review template extension)

Do NOT auto-post. Do NOT skip the post-publication log copy.
Do NOT fake reactions data.

Validation:
- npm run build
- cd dashboard && npm run build

Optional: if Codex CLI is back up, re-run editorial review
on the actual published copy (post-edit by boss) as a quality
check, and record verdict in the post-publication log.
```
