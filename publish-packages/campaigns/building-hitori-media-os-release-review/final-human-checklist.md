# Final Human Checklist: building-hitori-media-os

Status: ready-for-human-review

公開前に、このチェックリストを1度通す。各項目にチェックを入れて、最後に1度音読してから手動公開する。

## Technical Readiness Snapshot (Working Pipeline Step A–F 完了)

2026-05-18 時点で、boss 公開前の技術前提は完了済み。Per-Platform Review / Safety Reaffirmation / Final Sign-off は boss が読みながら順次チェック。

- ✅ **Working Pipeline Step A–F 完走**（Step G が本ファイル）
- ✅ **9 visualAssetPlan 解決**: 7 件 `status: saved` / 2 件 `status: skipped`、Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`（2026-05-18、post-write verification 9/9 PASS）
- ✅ **publish-package 実配布**: x 1 / threads 1 / note 3 / substack 2 = **計 7 ファイル** が `publish-packages/<platform>/building-hitori-media-os/images/` に配置済み
- ✅ **release-review 5 ファイル更新**（x / threads / note / substack final-review + 本ファイル）
- ⏳ **boss-only**: Per-Platform Review、Safety Reaffirmation、各 final-review 内 publish 判断、Published URL / Date、Reaction Notes、Final Sign-off

## Pre-Publish Review Result

2026-05-18 に dual-reviewer での公開前レビューを実施。

- ✅ **Technical review: PASS** — Claude Code が repo 整合性 / byte size / Sanity 反映 / publish-package / build / secret scan を実行（blocking issues: none）
- ⚠️ **Editorial review: PASS_WITH_NOTES** — 読者目線 / 媒体適性 / 主張の分かりやすさ / 公開リスク / CTA / 内部情報の混入 / 文章と画像のズレ を確認（blocking issues: none）
- 📌 **Editorial reviewer note**: Codex CLI が model version mismatch で起動不能だったため、本来 Codex で行う予定だった editorial review を **Claude Code が代替実行**。両 review が同モデルから出ているため、本来期待した dual-reviewer 独立性は失われている。boss 判断で公開後に Codex CLI 復旧後の再 review を行うか決める。
- ✅ **Result: Ready for boss final sign-off and manual publishing**

### Non-blocking notes（boss が手動編集パスで吸収可、または既に release-review に明示済み）

- **note insert-map.md が stale**: `publish-packages/note/building-hitori-media-os/insert-map.md` が `TODO: このplatform向けの画像がまだありません` のまま停止。Step F で hero + 2 inline 計 3 枚配布済みだが反映されていない。boss が公開時に [note-final-review.md](note-final-review.md) の Image Insertion Checklist と article.md 本文の「想定画像挿入」マーカーを直接参照する想定。
- **note article.md に skipped-image マーカーが 1 つ残存**: Section 4 末尾の `> 想定画像挿入: 「手動 → 半自動 → 自動」` マーカーが `note-inline-manual-vs-automation-v1`（intentionally skipped）を指している。boss は手動編集時にこのマーカーを削除するか、`note-inline-human-judgment-v1` を代替配置するか決める。
- **Substack About / Welcome / Notes は stub のまま**: `about-page.md` / `welcome-email.md` / `notes.md` は TODO + checklist のみで本文未記入。`substack-final-review.md` の Manual publish readiness で「手書きで埋める」と既述、boss が公開前に記入する。
- **Optional X / Threads reply chains を短縮する余地**: X 6 投稿スレッド / Threads 7 投稿 reply chain は冗長気味、各 final-review が「4-5 本に絞る判断あり」と既述。boss が公開時に手動で削減判断。

## Publication Log Snapshot

2026-05-19 時点の手動公開状況。campaign 全体としては **partially published**（Threads が boss 判断で次回以降に保留）。

- ✅ **X**: published — `https://x.com/potablenx/status/2056534823737720925`（2026-05-19 09:38 JST）→ [x-final-review.md](x-final-review.md)
- ✅ **note**: published — `https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb`（2026-05-19 09:57 JST）→ [note-final-review.md](note-final-review.md)
- ✅ **Substack**: published — `https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os`（2026-05-19 09:57 JST）→ [substack-final-review.md](substack-final-review.md)
- ⏳ **Threads**: **未投稿** — boss が今回の bundle ではあえて Threads 公開を見送り、X / note / Substack の反応を見てから次回以降に公開予定 → [threads-final-review.md](threads-final-review.md)

公開後の手動記録は各 final-review の `Published URL` / `Published Date / Time` / `Reaction Notes` セクションに反映済み。campaign は **Threads が pending のため fully published 扱いにはしない**。

### Pending Sanity reflection（本バッチでは Sanity 書き込みなし）

- [ ] Sanity Studio で `substackPostPlan.publishedUrl` を手動更新（Substack URL）
- [ ] Sanity Studio で `manualPublishingStatus` を 4 platform 分更新（X/note/Substack = done + URL、Threads = not-started）
- [ ] Sanity Studio で `contentIdea.outputChecklist` の該当 entry に `publishedUrl` を反映
- [ ] Sanity Studio で `substackGrowthAction.resultNotes` を実施後に更新（後日 reaction が出てから）

## Per-Platform Review

- [x] X reviewed（[x-final-review.md](x-final-review.md)）
- [x] Threads reviewed（[threads-final-review.md](threads-final-review.md)）
- [x] note reviewed（[note-final-review.md](note-final-review.md)）
- [x] Substack reviewed（[substack-final-review.md](substack-final-review.md)）
- [ ] YouTube script reviewed（[youtube-final-review.md](youtube-final-review.md)）
- [ ] Shorts scripts reviewed（[shorts-final-review.md](shorts-final-review.md)）
- [ ] Podcast outline reviewed（[podcast-final-review.md](podcast-final-review.md)）

## Production Visual Readiness

公開前に **production visual を inbox 経由で揃える**。テスト画像 / ai-blog-db からの流用画像は使わない。

### First Visual Action

**最初の1枚は `note-hero-v1`**。実行ガイドは [tasks/visuals/building-hitori-media-os/_first-production-image-run.md](../../../tasks/visuals/building-hitori-media-os/_first-production-image-run.md)。

- [x] `note-hero-v1` の candidate を生成して `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に保存（2026-05-14、第3候補を採用）
- [x] Visual Register の Inbox Review で `approve & register`（manifest が `reviewStatus: registered`）
- [x] master file（`assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`）が作成された
- [x] **Sanity Studio で `visualAssetPlan.note-hero-v1` と `visualAssetPlan.substack-header-v1` の両方に `localAssetPath` を手動入力**（human-confirmed 2026-05-14）
- [x] `npm run publish:package -- building-hitori-media-os --dry-run` で配布計画を確認（note + substack 両方が campaign-hero-v1.png を copy 予定）
- [x] **`npm run publish:package -- building-hitori-media-os`（flag なし）で publish-packages/{note,substack}/images/ に実配布**（2026-05-14 完了）

`note-hero-v1` が成功してから、次の asset（`x-hook-main-v1` など）へ進む。

text-first 4 platforms 向けの canonical asset:

- [x] `note-hero-v1`（Substack header と master 共有）: candidate 生成 → Visual Register approve & register 完了 → Sanity 反映完了 → publish-package 実配布完了
- [x] `substack-header-v1`: master を note と共有、Sanity Studio で `localAssetPath` を同パスへ手動入力済み → publish-package 実配布完了
- [x] `x-hook-main-v1`: Codex exec + image_gen + gpt-5.4 で v001.png 生成 → Visual Register approve & register 完了（2026-05-14T13:47Z）→ Sanity 反映完了（human-confirmed 2026-05-14）→ publish-package 実配布完了（`publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` 655,963 bytes）
- [x] `threads-support-diagram-v1`: v004.png 生成（japanese-editorial-v1、self-rubric 35/35）→ Visual Register approve & register 完了（2026-05-18T11:35:32.973Z）→ Sanity 反映完了（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`、2026-05-18）→ publish-package 実配布完了（`publish-packages/threads/building-hitori-media-os/images/threads-support-diagram-v1.png` 1,224,241 bytes）
- [x] `note-inline-content-os-flow-v1`: v004.png 生成（japanese-editorial-v1、Before/After + Pipeline、self-rubric 35/35）→ Visual Register approve & register 完了（2026-05-18）→ Sanity 反映完了（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`）→ publish-package 実配布完了（`publish-packages/note/building-hitori-media-os/images/note-inline-content-os-flow-v1.png` 1,234,240 bytes）
- [x] `note-inline-human-judgment-v1`: v001.png 生成（japanese-editorial-v1、Human review journey、self-rubric 35/35）→ Visual Register approve & register 完了（2026-05-18）→ Sanity 反映完了（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`）→ publish-package 実配布完了（`publish-packages/note/building-hitori-media-os/images/note-inline-human-judgment-v1.png` 1,375,682 bytes）
- [x] `substack-inline-reader-system-v1`（旧 P3、本フェーズで完了）: v001.png 生成（japanese-editorial-v1、Reader-list funnel、self-rubric 35/35）→ scripted recovery で approve & register 完了（2026-05-18）→ Sanity 反映完了（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`）→ publish-package 実配布完了（`publish-packages/substack/building-hitori-media-os/images/substack-inline-reader-system-v1.png` 1,297,423 bytes）

意図的に skipped（本フェーズで保留、note 記事は補助図なしで公開可、Visual Engine Improvement Phase で再評価）:

- [x] `note-inline-manual-vs-automation-v1`: Sanity `status: skipped`、`localAssetPath` unset、reviewNotes 記録済（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`）
- [x] `note-inline-publish-package-folder-v1`: Sanity `status: skipped`、`localAssetPath` unset、reviewNotes 記録済（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`）

各 asset で確認すべきこと（7 saved + 2 skipped、全 9 件の visualAssetPlan で完了済み）:

- [x] **inbox に candidate がある**（`assets/inbox/generated/building-hitori-media-os/<slug>/v00X.png`）— saved 7 件全て確認
- [x] **Visual Register Inbox Review で approve & register 済み**（saved 7 件）/ scripted recovery 経由含む
- [x] **patch JSON が `patches/visual-assets/building-hitori-media-os/<slug>.json` に存在**（saved 7 件全て生成済）
- [x] **Sanity で `visualAssetPlan.<slug>.localAssetPath` / `status: saved` 反映済**（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`、2026-05-18、saved 7 件 + skipped 2 件、post-write verification 9/9 PASS）
- [x] **`publish-packages/<platform>/building-hitori-media-os/images/` に該当画像がある**（Step F、2026-05-18 配布完了：x 1 件 / threads 1 件 / note 3 件 / substack 2 件）

video / audio 系（YouTube サムネ / Shorts cover / Podcast cover）は別バッチ。

詳細フロー: [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md)

## Safety Reaffirmation

- [ ] No auto-posting（全媒体で手動投稿）
- [ ] No API publishing（platform API 未使用）
- [ ] No direct Sanity write（Studio への反映は手動）
- [ ] No private PDF content included in any draft or screen recording
- [ ] No secrets visible in screen recordings（`.env.local` / 実 project ID / dataset 名 / API トークン / subscriber メール / 購入PDFファイル名 など）
- [ ] No AI clone voice without explicit human approval
- [ ] No paid offer in this campaign（free public work でまず信頼形成）

## Tracking Plan

公開後に必要な手動記録:

- [ ] Published URLs to be recorded later → 各 final-review の「Published URL」欄に貼る
- [ ] Reaction notes to be recorded later → 各 final-review の「Reaction Notes」欄に書く
- [ ] post-publication log を [post-publication-log-template.md](post-publication-log-template.md) からコピーして、`docs/devlog/` に新規ファイルとして保存する
- [ ] Sanity Studio で `substackPostPlan.publishedUrl` を手動更新する
- [ ] Sanity Studio で `substackGrowthAction.resultNotes` を実施後に手動更新する

## Pause Conditions

公開を一度止める判断材料:

- [ ] 反応で「完成版」を期待された場合 → トーン調整して再公開
- [ ] screen recording に secret / private/ が映っている可能性に気付いた場合 → 公開取り下げ、素材差し替え
- [ ] AI clone voice / avatar を急ぎたい衝動が出た場合 → 本人承認・権利確認まで保留

## Final Sign-off

- [x] 全 final-review を読み終わった
- [x] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が全媒体で守られている
- [x] 完成版ツールの宣伝になっていないことを再確認
- [x] 公開順は [publish-order.md](publish-order.md) を最終決定として使う
- [x] このキャンペーンの目的（building-in-public な実験ログとしての発信）に納得している
