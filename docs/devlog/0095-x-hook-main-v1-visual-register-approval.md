# Devlog 0095 — x-hook-main-v1 Visual Register Approval + Distribution

Date: 2026-05-14
Status: **approved / registered / sanity-reflected / publish-distributed**

## 今日の判断

[devlog 0090](0090-x-hook-main-v1-codex-exec-imagegen-success.md) で Codex exec + image_gen で生成した `x-hook-main-v1/v001.png` を、人間が Visual Register Inbox Review で `approve & register` 完了（registeredAt: 2026-05-14T13:47:16.465Z）。本バッチで:

- ファイルシステムの事実を audit
- Sanity Studio 手動反映済を人間確認
- `npm run publish:package -- building-hitori-media-os` を dry-run + 本配布で実行
- [docs/58](../58-admin-dashboard-phase-plan.md) の Phase Admin 0 → 1 trigger を訂正
- release-review の checklist を `[x]` 化

[handoff 0105](../handoff/0105-admin-dashboard-architecture-plan.md) §6 の「Phase Admin 0 → 1 trigger 4 条件」記述では、Visual Register ≥ 2 approve を `[x]` としつつ説明文に「後者は v001 inbox 段階」と書いていた → **矛盾していた**。人間が同日中に既に approve 完了していたため、本バッチで `[x]` + 正確な記述に統一。

## なぜその設計にしたか

- **CLI から observable な事実を起点に判断**: `assets/visuals/.../x-hook-main-v1.png` 存在 / `patches/visual-assets/.../x-hook-main-v1.json` 存在 / `review-manifest.json` の `reviewStatus: registered` という3点を確認してから Task 3 path（approved 確認後の docs 更新）を実行。
- **Sanity 反映と publish 配布は人間判断で確定**: CLI から Sanity dataset 状態は観測できないため、人間 AskUserQuestion で「反映済み」を確認。publish 配布は `npm run publish:package` の出力で実機確認。
- **既存 docs の補正 vs 新規 doc の役割分担**: 旧 0094 / 0105 を全書き換えにせず、header に Correction 行 + §6 の trigger 行のみ最小修正。本 devlog 0095 と handoff 0106 を新規に作って詳細を集約。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| candidate 画像生成 | Codex exec + image_gen（前バッチ 0090） |
| Visual Register approve & register | 人間（このバッチ前に完了） |
| filesystem audit / docs 補正 / publish 配布 trigger | **Claude Code（本バッチ）** |
| Sanity Studio 反映 | 人間（このバッチ前に完了、human-confirmed） |

## API なしで済ませた理由（再確認）

- `npm run publish:package` は paid API を呼ばない、純粋なローカル file copy script。
- Sanity への直接書き込みなし（patch JSON は filesystem に存在、反映は人間が Studio で手動）。
- 画像を新規生成していない（既存 v001.png を Visual Register が copy しただけ）。

## このバッチで作ったもの / 変更したもの

### Added

- `docs/devlog/0095-x-hook-main-v1-visual-register-approval.md`（本ファイル）
- `docs/handoff/0106-x-hook-main-v1-visual-register-approval.md`

### Created via npm run publish:package

- `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png`（655,963 bytes、`assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` の copy）

### Modified

- `docs/58-admin-dashboard-phase-plan.md`（Visual Register / publish package trigger 行を `[x]`、Status correction の note を追記）
- `docs/devlog/0094-admin-dashboard-architecture-plan.md`（header に Correction 行を追記）
- `docs/handoff/0105-admin-dashboard-architecture-plan.md`（header に Correction 行 + §6 trigger 4 条件の記述を訂正）
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（`x-hook-main-v1` を `[x]`）
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`（5 つの Production Visual Readiness 項目を `[x]`）
- `docs/handoff/latest.md`（0106 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 12 / proposed 11、引き続き未 activate）
- `sanity.config.ts` / `structure/index.ts` / `tools/` / `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages 本文 / private / ai-blog-db 関連
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`（前バッチで Visual Register が copy 済み、本バッチでは触らず）
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（1,331,047 bytes 不変）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`（655,963 bytes 不変）
- `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json`（前バッチで Visual Register が生成済み、本バッチでは触らず）

## Phase Admin 0 → 1 trigger 4 条件 — 最新

| 条件 | 状態 |
| --- | --- |
| 4 proposed schema activate | **未** |
| campaignPlan seed 投入 | **未**（JSON は作成済） |
| Visual Register ≥ 2 production asset approve | **完了**（note-hero-v1 + x-hook-main-v1） |
| publish package distribution が X / note / Substack で動く | **完了**（hero + x-hook-main-v1） |

→ 残るは **schema activate + seed 投入 の 2 バッチ**。

## 連番について

- devlog: 0094 → **0095**
- handoff: 0105 → **0106**

## 発信ネタになりそうな切り口

1. **「docs を書き換える前に filesystem を audit する」**: 「approved だと思ってた」と「ファイル / manifest が示す事実」を分離。`reviewStatus: registered` を直接読む癖をつける。
2. **「trigger 4 条件で残るのは 2 つ」**: Phase Admin 1 に進む前の必要十分条件を可視化、残作業も schema activate と seed 投入の2つに絞り込めた。
3. **「`npm run publish:package` が safe-skip-existing を持っているので何度走らせても idempotent」**: hero は skip、x-hook-main-v1 が copied、という idempotent な配布実例。
4. **「Visual Register の registeredAt は UTC、人間視点では JST」**: `2026-05-14T13:47:16.465Z` = 22:47 JST。tz handling を docs に1度書いておくと将来の混乱を防げる。

## Safety Verified

- direct Sanity write の grep: 0 hits（不変）
- paid API integration の grep: 0 hits（不変）
- 画像生成 0 件
- schema activate 0 件
- `seed --replace` 実行 0 回
- Sanity CLI 自動実行 0 回
- `npm run local:check`: ok: true（17 green）
- `npm run build`: 成功
