# Handoff: x-hook-main-v1 Visual Register Approval + Distribution + Trigger Correction

Date: 2026-05-14
Status: **approved / registered / sanity-reflected / publish-distributed / phase-admin-trigger-corrected**

## 1. Task Goal

[devlog 0090](../devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md) で生成した `x-hook-main-v1/v001.png` が人間によって Visual Register Inbox Review で `approve & register` 完了していたため、本バッチで:

- filesystem の事実を確認
- Sanity Studio 反映済を人間確認
- `npm run publish:package -- building-hitori-media-os` を dry-run + 本配布
- [docs/58](../58-admin-dashboard-phase-plan.md) / [docs/handoff/0105](0105-admin-dashboard-architecture-plan.md) の Phase Admin 0 → 1 trigger 表現の補正
- release-review checklist の `[x]` 化

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない。
- `seed --replace` を実行していない。
- proposed schemas を activate していない（`schemas/index.ts` 不変）。
- `sanity.config.ts` / `structure/index.ts` を変更していない。
- 既存 active schemas を破壊的に変更していない。
- 画像を新規生成していない（既存 v001.png は変更なし）。
- `assets/visuals/...` / `patches/...` を本バッチでは変更していない（Visual Register が前回作成したもの）。
- `assets/inbox/...` の既存ファイルを変更していない。

## 3. Changed Files

### Added

- `docs/devlog/0095-x-hook-main-v1-visual-register-approval.md`
- `docs/handoff/0106-x-hook-main-v1-visual-register-approval.md`

### Created via npm run publish:package

- `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png`（655,963 bytes、`assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` の copy）

### Modified

- `docs/58-admin-dashboard-phase-plan.md`（trigger 行 2 つを `[x]` 化 + Status correction note 追記）
- `docs/devlog/0094-admin-dashboard-architecture-plan.md`（header に Correction 行を追記）
- `docs/handoff/0105-admin-dashboard-architecture-plan.md`（header に Correction 行 + §6 trigger 4 条件記述を訂正）
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（`x-hook-main-v1` 行を `[x]`）
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`（5 つの Production Visual Readiness 項目を `[x]`）
- `docs/handoff/latest.md`（本 0106 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 12 / proposed 11、引き続き未 activate）
- `sanity.config.ts` / `structure/index.ts` / `tools/` / `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages 本文（visual readiness 節のみ更新）
- `private/` / ai-blog-db 関連
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`（前バッチで Visual Register が copy 済み）
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（1,331,047 bytes 不変）
- `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`（655,963 bytes 不変）
- `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json`（前バッチで Visual Register が生成済み）

## 4. Summary of Changes

### A. Approval State Verified (filesystem audit)

| 観察項目 | 値 |
| --- | --- |
| `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` | **EXISTS**（655,963 bytes、May 14 22:47:16 JST） |
| `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` | **EXISTS** |
| `review-manifest.json` の x-hook-main-v1/v001.png entry | `reviewStatus: registered`、`registeredAt: 2026-05-14T13:47:16.465Z` |
| patch JSON content | `set.localAssetPath: assets/visuals/.../x-hook-main-v1.png`、`set.status: saved`、`set.reviewNotes` あり、`meta.directSanityWrite: false` |
| inbox `v001.png` | 655,963 bytes（May 14 21:19:34）— final と同サイズで copy 検証 |
| Codex exec 生成 source | gpt-5.4 + `--enable image_generation`（前バッチ 0090） |

### B. Sanity Studio reflection — human confirmed

人間が同日中に Sanity Studio で `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を手動更新（AskUserQuestion で 2026-05-14 確認）:

- `localAssetPath` = `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
- `status: saved`
- `reviewNotes` = patch JSON の reviewNote をコピペ

CLI から dataset を観測する手段はないため、human-confirmed として記録。

### C. publish package distribution executed

dry-run + 本配布を順次実行:

- **dry-run**:
  - note (visualCount=5): `campaign-hero-v1.png` を `skipped`（idempotent）
  - x (visualCount=1): `x-hook-main-v1.png` を `copied`（新規予定）
  - substack (visualCount=2): `campaign-hero-v1.png` を `skipped`
  - threads (visualCount=1): image 無し
- **本配布**:
  - `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` を **新規 copy**（655,963 bytes）
  - 既存 hero は idempotent に skip

→ Phase Admin 0 → 1 trigger の「publish package distribution が X / note / Substack で動く」が **実機で確認完了**。

### D. Trigger Correction

旧 [docs/handoff/0105](0105-admin-dashboard-architecture-plan.md) §6 の記述は **矛盾**していた:

> `[x] Visual Register ≥ 2 approve（note-hero-v1 / x-hook-main-v1 で 2 件、後者は v001 inbox 段階）`

`[x]`（完了）と「v001 inbox 段階」（未完了）が同じ行に混在。これは [batch 0094/0105 執筆時の filesystem 状態確認漏れ](../devlog/0094-admin-dashboard-architecture-plan.md)に由来。人間は同日中に approve していたが、私（Claude Code）が確認しないまま docs 化した。

本バッチで:

- header に Correction 行を追記（[docs/devlog/0094](../devlog/0094-admin-dashboard-architecture-plan.md) / [docs/handoff/0105](0105-admin-dashboard-architecture-plan.md) / [docs/58](../58-admin-dashboard-phase-plan.md)）
- [docs/handoff/0105](0105-admin-dashboard-architecture-plan.md) §6 の記述を正確な事実に書き換え
- [docs/58 §1](../58-admin-dashboard-phase-plan.md) の trigger 行 2 つを `[x]` + Status correction note を追記

### E. Phase Admin 0 → 1 trigger — 最新

| 条件 | 状態 |
| --- | --- |
| 4 proposed schema activate | **[ ] 未** |
| campaignPlan seed 投入 | **[ ] 未**（JSON は作成済 [seed/campaign-plan-building-hitori-media-os.json](../seed/campaign-plan-building-hitori-media-os.json)） |
| Visual Register ≥ 2 production asset approve | **[x] 完了**（note-hero-v1 + x-hook-main-v1） |
| publish package distribution が X / note / Substack で動く | **[x] 完了**（hero + x-hook-main-v1） |

→ 残るは **schema activate + seed 投入の 2 バッチ**で Phase Admin 1 着手可能。

### F. Validation Results

- `npm run local:check`: **ok: true**（17 green / 0 fail）
- `npm run build`: **成功**
- direct Sanity write の grep: 0 hits（不変）
- paid LLM/image API client/SDK の repo 追加: 0 hits（不変）
- Sanity CLI auto-exec: 0 hits（`npx sanity documents create` 0 回）
- 画像生成: 0 件（既存 v001.png は変更なし）
- schema activate: 0 件
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`: 655,963 bytes 不変（Visual Register 経由で前バッチ作成、本バッチでは触らず）
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`: 1,331,047 bytes 不変
- `patches/visual-assets/building-hitori-media-os/`: `note-hero-v1.json` + `x-hook-main-v1.json` の 2 件、本バッチで追加・変更なし

## 5. Important Decisions

- **filesystem audit を docs 補正の起点にする**: 「人間が approve したと思った」では足りず、`assets/visuals/` / `patches/` / `review-manifest.json` の3 点で確証を取る。
- **既存 docs を全書き換えしない**: 旧 0094 / 0105 を retroactive に補正する代わりに、header に Correction 行 + 該当 §6 のみ最小修正。新規 0095 / 0106 で正確な記録を集約。
- **publish-package distribution を本バッチで実行する判断**: 人間に AskUserQuestion で確認、`--dry-run` で計画確認後、即本配布。idempotent なので失敗時のリスクが低い。
- **Phase Admin 1 着手の trigger 残作業を明示**: schema activate + seed 投入の2バッチで完了する見通しを docs/58 / docs/handoff/0106 で揃える。

## 6. Human Review Questions

- Phase Admin 0 → 1 trigger 残り 2 条件を **次の 2 バッチで終わらせて Phase Admin 1 に進む** で問題ないか？
- それとも schema activate 前に他の design 補強（structure builder の "By Campaign" / tools/codex-workflow の diff watcher 等）を入れるか？
- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）を **Phase Admin 1 着手前**に進めるか、**後回し**にして dashboard 着手を優先するか？
- x-hook-main-v1 を実際の X 投稿に使う（manual publish）タイミングは未定だが、現状で reviewRubric 的に十分な candidate になっているか（中央 70% 制約 / 装飾密度 / accent color）？

## 7. Risks or Uncertainties

- **次バッチ（schema activate）で 4 schema 同時 activate の依存順を誤ると Studio で警告が出る**: 順序は `brandProfile → visualStyleProfile → promptTemplate → campaignPlan`。各 activate 後 `npm run build` 確認を必須にする。
- **seed 投入時の reference 整合**: `contentIdea.building-hitori-media-os` が dataset に既存である前提。未投入なら先に contentIdea seed から投入が必要。
- **visualAssetPlan.building-hitori-media-os.x-hook-main-v1 が Sanity dataset で reference を持つ場合、reference target が PROPOSED schema instance になり警告**: 該当 fields は本 visualAssetPlan には無いので影響は限定的だが、campaignPlan seed 投入時に `_ref: "brandProfile.hitori-media-os-default"` などが reference unresolved になる可能性。
- **publish-package の x platform に `README.md` / `posts.md` / `checklist.md` 等 markdown が既存**: 画像配布以外の content は今回触っていない。手動 publish 時に内容確認が必要。

## 8. Recommended Next Step

### Immediate Human Actions

- 本 handoff の `Phase Admin 0 → 1 trigger` 状態を確認、残作業 2 件（schema activate + seed 投入）に着手するか判断
- x-hook-main-v1 の実 X 投稿のタイミングを決める（手動公開）
- 残り 5 visual を Phase Admin 1 着手前に進めるか、後回しにするか方針決定

### Next Implementation Batches（推奨順）

1. **4 proposed schema を Studio activate するバッチ**（依存順: brandProfile → visualStyleProfile → promptTemplate → campaignPlan、各 activate 後 `npm run build` 確認、seed 投入は別バッチ）
2. **4 seed を Sanity に投入するバッチ**（依存順、`npx sanity documents create` 1 件ずつ、`--replace` 禁止）
3. （任意・並走可）`structure/index.ts` 拡張: "By Campaign" 子ノード追加
4. （任意・並走可）`tools/codex-workflow/` に Codex agent diff watcher script を追加（[devlog 0090](../devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md) の lesson）
5. **trigger 達成後**: `docs/59-admin-phase-1-implementation-plan.md` を design batch
6. Next.js scaffold バッチ（最小限 app router + 1 画面 read-only）

### Mid-term

- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）の生成サイクル
- 公開サイト `hitorimedia.com` の content source 決定（note mirror / Sanity mirror / 静的）
- Auth scheme 決定（Phase Admin 2 着手時）

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / dashboard charts

## 9. Exact Prompt to Give Codex Next

```text
Activate the 4 proposed schemas in Studio in dependency order, then verify Studio renders them.

Hard Rules:
- Activate in this exact order: brandProfile → visualStyleProfile → promptTemplate → campaignPlan.
- After each activation, run `npm run build` and confirm success before moving to the next.
- Do NOT touch any other schema file.
- Do NOT call paid APIs.
- Do NOT run `npx sanity documents create` yet (seed insertion is a separate batch).
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...

Use:
- schemas/proposed/brandProfile.ts
- schemas/proposed/visualStyleProfile.ts
- schemas/proposed/promptTemplate.ts
- schemas/proposed/campaignPlan.ts
- schemas/index.ts
- sanity.config.ts
- docs/58-admin-dashboard-phase-plan.md
- docs/handoff/0106-x-hook-main-v1-visual-register-approval.md

Workflow:
1. Move (or copy) each proposed schema file into schemas/ (or keep in schemas/proposed/ but import from there — your choice).
2. Update schemas/index.ts to import and export each new type, in dependency order.
3. Update sanity.config.ts only if structure changes are required (typically not needed).
4. After each activation step: `npm run build` and confirm success.
5. After all 4 are active: `npm run dev`, open Studio, confirm 4 new types appear in "By Type (flat)" view.
6. Run `git diff --stat` at the end. Confirm only schemas/ files + docs touched.
7. Do NOT yet insert any seed file. Stop and report status.

End-of-run output:
- list of files moved / modified
- npm run build result per step
- Studio rendering confirmation
- git diff --stat summary
```
