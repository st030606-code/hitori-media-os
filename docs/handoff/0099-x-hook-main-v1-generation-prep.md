# Handoff: x-hook-main-v1 Generation Prep (next production visual)

Date: 2026-05-14

## 1. Task Goal

`note-hero-v1` の production visual サイクル（candidate 生成 → Visual Register approve & register → Sanity 手動反映 → publish-package 実配布）が完了したので、次の P1 visual `x-hook-main-v1` の生成準備に進む。本バッチでは画像を生成せず、tone reference / 生成 prompt / ワークフロー記録だけを整える。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM / image generation API integration は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない。
- `seed --replace` は実行していない。
- 既存 ai-blog-db レコードを変更していない。
- production images をこのバッチで生成していない（assets/visuals 配下に新規画像追加なし）。
- 候補画像を `assets/visuals/...` の final path に直接書いていない。
- Visual Register Inbox Review を bypass していない。
- 新規 schema を活性化していない。

## 3. Changed Files

### Added

- `docs/devlog/0088-x-hook-main-v1-generation-prep.md`
- `docs/handoff/0099-x-hook-main-v1-generation-prep.md`

### Modified

- `docs/devlog/0086-building-hitori-media-os-visualassetplan-sanity-ingest-status.md`（status: completed、checklist `[x]` へ）
- `docs/handoff/0097-building-hitori-media-os-visualassetplan-sanity-ingest-status.md`（Status: completed）
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（First Visual Action の Sanity 反映と publish-package 配布の2項目を `[x]` へ）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`（Sanity manually reflected / Final package image present を `[x]` へ）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`（Substack header reuses note master / Final package image present を `[x]` へ）
- `docs/handoff/latest.md`

### Created via npm run publish:package

- `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png`（1.33 MB、master 共有元 file の copy）
- `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png`（同一 file の copy）

### Confirmed unchanged

- 既存スキーマ全般 / `schemas/index.ts` / `sanity.config.ts`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs` / `structure/index.ts`
- 既存 outputs / publish-packages 本文（visual readiness 節のみ更新）
- 既存 seed
- `private/`
- ai-blog-db 関連すべて
- 既存 production image（campaign-hero-v1.png 本体、Visual Register が前バッチで copy 済み）

## 4. Summary of Changes

### A. note-hero-v1 サイクル完了記録

人間確認 (2026-05-14):

- Sanity Studio で 9 visualAssetPlan が `building-hitori-media-os` 検索でヒット
- `visualAssetPlan.note-hero-v1` を Studio で手動更新（localAssetPath / status: saved / reviewNotes）
- `visualAssetPlan.substack-header-v1` も同じ `localAssetPath` で手動更新（master 共有）

ファイルシステム確認 (本バッチで):

- `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` 配置完了
- `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` 配置完了

8 段 production visual flow（生成 → inbox → Visual Register → final copy → patch JSON → manifest → Sanity 反映 → publish-package 配布）の全段が `note-hero-v1` / `substack-header-v1` で **完走**。

### B. x-hook-main-v1 prep

- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.x-hook-main-v1`
- candidate inbox: `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`
- final expected: `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`
- pixelSize: 1200 x 675 (16:9)
- tone reference: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（前バッチで作成）
- brief: [tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md)

### C. Validation Results

- `npm run publish:package -- building-hitori-media-os`（flag なし、実行）→ master file を note + substack に copy 完了
- `npm run publish:package -- building-hitori-media-os --dry-run`（実行後）→ campaign-hero-v1.png が `skipped` に移動（safe-skip-existing-files 機能、idempotent 確認）
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 8.2s で成功
- direct Sanity write の grep → 0 hits（不変）
- paid API integration の grep → 0 hits（不変）

## 5. Important Decisions

- `note-hero-v1` サイクル完了を docs / release-review checklist の両方に反映。
- `x-hook-main-v1` を次の P1 として明示。
- tone reference として `campaign-hero-v1.png` を使うことを brief レベルで再確認。
- master 共有方針は `note-hero-v1` ↔ `substack-header-v1` のみ。`x-hook-main-v1` は X 専用 variant（reusePolicy: variant-required）。
- 顔写真 / Instagram / video / Shorts cover は引き続き out-of-scope。

## 6. Human Review Questions

- `x-hook-main-v1` の最初の candidate を生成するタイミングはいつか？
- Codex Phase 3（image generation）で挑むか、ChatGPT 手動で進めるか？
- 採用候補が出るまで何回 v00X を試すか（運用上、3〜5 が標準）？
- `x-hook-main-v1` 完成後、次は `threads-support-diagram-v1` / `note-inline-content-os-flow-v1` / `note-inline-human-judgment-v1` のどれを優先するか？

## 7. Risks or Uncertainties

- tone reference として `campaign-hero-v1.png` を使うが、ChatGPT 画像生成は前回画像との完全な統一は難しい。色 / フォントが微妙にズレる可能性。採用前に並べて目視確認推奨。
- X の inline preview crop は media 形式によって異なる（1.91:1 / 1:1 など）。1200x675 で生成しても重要要素は中央 70% に収める。
- 既存 inbox `note-hero-v1-attempt-1.png` を削除するかは人間判断のまま。`x-hook-main-v1` 生成時に inbox 整理を兼ねるかどうか。
- ai-blog-db には `x-hook-before-after-v1.png` という別 visual がある（既存）。building-hitori-media-os は独立した別 file（混同しない）。

## 8. Recommended Next Step

### Immediate Human Actions

1. **ChatGPT or Codex で candidate 生成**: [tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md) の "Generation Prompt (paste-ready)" を使う。
2. **inbox 保存**: `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`（`mkdir -p` 必要）
3. **Visual Register 起動 / 再起動**: 旧プロセス停止 + `npm run visual:register`
4. **Inbox Review で確認**: `building-hitori-media-os` filter、Plan auto-suggest 確認
5. **approve & register**: 最終 path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` へ copy + patch JSON 作成
6. **Patch Review 確認**
7. **Sanity Studio 手動反映**: `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` の `localAssetPath` / `status: saved` / `reviewNotes`
8. **publish-package 配布**: dry-run → 実配布
9. **次の visual** に進む判断（threads-support-diagram-v1 / note inline 系）

### Mid-term

- `threads-support-diagram-v1`（P2）
- `note-inline-content-os-flow-v1`（P2）
- `note-inline-human-judgment-v1`（P2）
- `substack-inline-reader-system-v1`（P3、任意）

### Deferred

- Instagram carousel slides
- 顔写真ワークフロー（YouTube サムネ / Shorts cover / Podcast cover）
- 動画 / 音声ファイル本体生成
- subscriber milestone / paid readiness 活性化

## 9. Exact Prompt to Give Codex Next

```text
Generate a production candidate image for x-hook-main-v1 and save it to the inbox path.

Do not save to any final asset path.
Do not modify assets/visuals/...
Do not write to Sanity from code.
Do not call paid APIs.
Do not auto-post.

Use:
- tasks/visuals/building-hitori-media-os/x-hook-main-v1.md (Generation Prompt)
- tasks/visuals/building-hitori-media-os/_first-production-image-run.md (workflow reference)
- tasks/visuals/_codex-image-generation-template.md (general guidance)
- tasks/visuals/building-hitori-media-os/_style-guide.md (visual vocabulary)
- assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png (tone reference)

Workflow:
1. Use note-hero-v1 (campaign-hero-v1.png) as the tone reference. Match base color, accent color, font family, node shape.
2. Read the Generation Prompt in tasks/visuals/building-hitori-media-os/x-hook-main-v1.md and produce a 1200x675 image candidate.
3. Save the candidate to:
   assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png
4. If revisions needed, save as v002.png, v003.png... do NOT overwrite v001.
5. Hand off to the human:
   - run "npm run visual:register"
   - open Inbox Review
   - confirm Plan auto-suggest = visualAssetPlan.building-hitori-media-os.x-hook-main-v1
   - review notes + approve & register
6. After Visual Register registration, the human updates Sanity Studio manually for visualAssetPlan.x-hook-main-v1 only (no master sharing).
7. After Sanity reflection, run "npm run publish:package -- building-hitori-media-os" to distribute publish-packages/x/.../images/x-hook-main-v1.png.

Do not bypass Visual Register Inbox Review.
Do not save any image directly to assets/visuals/...
Do not call any paid image generation API. If Codex cannot generate images locally, stop and report so the human can use ChatGPT instead.

Document:
- the actual prompt version used
- the candidate version (v001 / v002 / ...)
- any sanity check failures (text readability / face photo / paid PDF content / secret leakage)
- how tone matches campaign-hero-v1.png (color / font / accent)
```
