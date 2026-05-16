# Handoff: note-hero-v1 Production Visual Registration (first cycle)

Date: 2026-05-14

## 1. Task Goal

building-hitori-media-os キャンペーンの最初の production visual `note-hero-v1` を Visual Register Inbox Review で承認・登録した結果を記録する。ファイルシステム上の事実のみを記述し、Sanity Studio など CLI から観測できない部分は要・人間確認とする。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration / paid image generation API integration は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（grep で 0 hits 維持）。
- `seed --replace` は実行していない。
- 画像本体を modify していない（人間が生成した v001.png をそのまま使用）。
- Visual Register Inbox Review を bypass していない。
- 本バッチで Claude Code が新規画像を生成していない。
- 本バッチで `assets/visuals/...` を新規追加・上書きしていない（前 cycle で登録済みのファイルを観測しただけ）。

## 3. Changed Files

### Added (logs only, no asset / code changes)

- `docs/devlog/0085-note-hero-v1-production-visual-registration.md`
- `docs/handoff/0096-note-hero-v1-production-visual-registration.md`

### Modified

- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（First Visual Action / canonical asset list の note-hero-v1 関連項目を `[x]` マーク、Sanity 反映と実配布の2項目は未確認 `[ ]` のまま）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`（hero 関連を `[x]`、Visual Register approved / Patch JSON も `[x]`、Sanity と publish-package 実配布は未確認 `[ ]`）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`（header 関連を `[x]`、Patch JSON も `[x]`、Sanity 反映と publish-package 実配布は未確認 `[ ]`）
- `docs/handoff/latest.md`

### Confirmed unchanged

- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs`
- `schemas/` / `sanity.config.ts`
- 既存 outputs / publish-packages 本文（visual readiness 節のみ追記）
- 既存 seed
- `private/`
- ai-blog-db 関連

### Verified (filesystem state at time of recording)

- `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` 1.33 MB PNG
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` 1.33 MB PNG（v001.png と同サイズ）
- `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` 1031 bytes
- `assets/inbox/generated/building-hitori-media-os/review-manifest.json` v001.png entry が `reviewStatus: registered`

これらは前 cycle（人間が Visual Register で `approve & register` した結果）の状態。本バッチでは触っていない。

## 4. Summary of Changes

### Registration Result (filesystem-verified)

- 採用 candidate: 第3候補（v001.png として保存）
- レビューメモ（manifest より）: "Selected v001 as first production hero candidate. Stronger visual balance than earlier minimal versions. Suitable for note hero and Substack header shared master."
- registeredAt: `2026-05-14T07:59:49.920Z`
- master file: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- patch JSON: `set.status: saved` / `set.updatedAt` / `meta.directSanityWrite: false`

### Sanity Studio Manual Update

- **Status**: **unconfirmed from CLI**（dataset 状態を観測する手段なし）
- 期待アクション: 人間が Studio で `visualAssetPlan.note-hero-v1.localAssetPath` と `visualAssetPlan.substack-header-v1.localAssetPath` の **両方** に `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を入力し、`status: saved` に更新。

### Patch Review Displayed

- **Yes**（`patches/visual-assets/building-hitori-media-os/note-hero-v1.json` 存在、Visual Register の `GET /api/visual-patches` がこれを返す）。

### Dry-Run Distribution Plan

`npm run publish:package -- building-hitori-media-os --dry-run`:

- `note`: visualCount=5、`copied: ["publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png"]`（dry-run のため未配布）
- `substack`: visualCount=2、`copied: ["publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png"]`（同上）
- master 共有方針が正しく機能。

### Issues Found

1. **Inbox 内に旧 test 画像が残存**: `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` が flat 配置で残り、manifest にも別 entry として `registered` のまま。同じ final path を 2 つの inbox entry が指す状態。混乱回避のため人間が削除 or 移動を判断。
2. **publish-package images/ 未配布**: 本 handoff 執筆時点で `publish-packages/{note,substack}/building-hitori-media-os/images/` ディレクトリは未作成。`npm run publish:package -- building-hitori-media-os`（flag なし）を1回実行すると `campaign-hero-v1.png` が両方に配布される。
3. **採用候補とユーザー報告の差異**: 人間報告では "third generated candidate" だがファイル名は `v001.png`。ChatGPT で生成 3 回試して採用1枚を v001 として保存した運用と思われる（命名規則上は正常）。

## 5. Important Decisions

- 本バッチでは画像 / asset を **新規生成・上書きしていない**。前 cycle で人間が完了した登録結果をファイルシステムから観測して docs に記録するのみ。
- release-review checklist は **CLI 観測できる項目を `[x]`、観測できない（Sanity 反映 / 実配布）を `[ ]` のまま** にする honest な状態管理。
- Sanity Studio 反映と publish-package 実配布は次の人間アクション。
- 旧 test 画像（`note-hero-v1-attempt-1.png`）は削除せず、人間判断に委ねる。

## 6. Human Review Questions

- Sanity Studio で `visualAssetPlan.note-hero-v1.localAssetPath` と `visualAssetPlan.substack-header-v1.localAssetPath` の更新は完了したか？（完了したら次バッチで `[x]` に更新）
- `npm run publish:package -- building-hitori-media-os`（flag なし）を実行して publish-package images/ に実配布するタイミングはいつか？
- `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` を削除するか、historical として残すか？
- 次の production visual は `x-hook-main-v1` で確定でよいか？

## 7. Risks or Uncertainties

- Sanity Studio 反映が未確認のままだと、Studio 上の `visualAssetPlan.note-hero-v1` は `localAssetPath` が空のまま、`substack-header-v1` も同様。Studio から見ると「画像未保存」状態。
- publish-package images/ 未配布のまま手動公開フェーズに入ると、note / Substack の publish-package には画像がない。投稿時に手動で `assets/visuals/.../campaign-hero-v1.png` をアップロードすれば回避できるが、`npm run publish:package` を1回流す方が手順整合する。
- inbox に2系統の note-hero-v1 candidate（古い attempt-1.png と新 v001.png）が混在し、両方 `registered` ステータス。将来 Visual Register UI 上で「重複登録か？」と人間が誤解するリスク。`_workflow.md` の Shared File Handling 節で明示すべき余地あり。
- 第3候補で採用したが、v002 / v003 を inbox に置いていない。レビュー履歴としては v001 のみ。将来「他の候補も比較したかった」となったとき、再生成で対応する流れ。

## 8. Recommended Next Step

### Immediate Human Actions

1. Sanity Studio を開いて `visualAssetPlan.note-hero-v1` の `localAssetPath` と `status` を手動更新。
2. 同じく `visualAssetPlan.substack-header-v1` の `localAssetPath` に同じパスを手動入力。
3. `npm run publish:package -- building-hitori-media-os`（flag なし）で publish-package images/ に実配布。
4. （任意）`assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` を削除して inbox 整理。

### Next Production Visual

**`x-hook-main-v1`**（P1）が次。brief は `tasks/visuals/building-hitori-media-os/x-hook-main-v1.md`、生成 → inbox 保存 → Visual Register approve & register の flow を繰り返す。

`note-hero-v1` を「トーンの基準」として、color / accent / font / 余白の感覚を揃える。

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
6. After Visual Register registration, the human updates Sanity Studio manually.

Do not bypass Visual Register Inbox Review.
Do not save any image directly to assets/visuals/...
Do not call any paid image generation API. If Codex cannot generate images locally, stop and report so the human can use ChatGPT instead.

Document:
- the actual prompt version used
- the candidate version (v001 / v002 / ...)
- any sanity check failures
```
