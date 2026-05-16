# Final Human Checklist: building-hitori-media-os

Status: ready-for-human-review

公開前に、このチェックリストを1度通す。各項目にチェックを入れて、最後に1度音読してから手動公開する。

## Per-Platform Review

- [ ] X reviewed（[x-final-review.md](x-final-review.md)）
- [ ] Threads reviewed（[threads-final-review.md](threads-final-review.md)）
- [ ] note reviewed（[note-final-review.md](note-final-review.md)）
- [ ] Substack reviewed（[substack-final-review.md](substack-final-review.md)）
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
- [ ] `threads-support-diagram-v1`: candidate → approve & register → Sanity 反映
- [ ] `note-inline-content-os-flow-v1`: candidate → approve & register → Sanity 反映
- [ ] `note-inline-human-judgment-v1`: candidate → approve & register → Sanity 反映
- [ ] `substack-inline-reader-system-v1`（任意 P3）

各 asset で確認すべきこと:

- [ ] **inbox に candidate がある**（`assets/inbox/generated/building-hitori-media-os/<slug>/v00X.png`）
- [ ] **Visual Register Inbox Review で approve & register 済み**
- [ ] **patch JSON が `patches/visual-assets/building-hitori-media-os/<slug>.json` に存在**
- [ ] **Sanity Studio で `visualAssetPlan.<slug>.localAssetPath` / `status: saved` を手動更新**
- [ ] **`publish-packages/<platform>/building-hitori-media-os/images/` に該当画像がある**

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

- [ ] 全 final-review を読み終わった
- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が全媒体で守られている
- [ ] 完成版ツールの宣伝になっていないことを再確認
- [ ] 公開順は [publish-order.md](publish-order.md) を最終決定として使う
- [ ] このキャンペーンの目的（building-in-public な実験ログとしての発信）に納得している
