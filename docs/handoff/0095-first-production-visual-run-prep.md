# Handoff: First Production Visual Run Prep (note-hero-v1)

Date: 2026-05-14

## 1. Task Goal

Codex Phase 1 safety review の公式記録場所を準備し、最初の production image generation（`note-hero-v1`）に進めるための実行 handoff を整える。実画像はこのバッチで生成しない。Visual Register Inbox Review が引き続き承認ゲート。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration / paid image generation API は追加していない。
- OpenAI API / Anthropic API clients は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（grep で 0 hits 維持）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- secrets / API キー / 実 project ID / private/ filename / subscriber data は commit していない。
- 有料PDF本文の引用は含めていない。
- production images をこのバッチで生成していない（実画像 0 枚）。
- 候補画像を `assets/visuals/...` の final path に直接書いていない。
- Visual Register Inbox Review を bypass していない。

## 3. Changed Files

### Added

- `docs/devlog/0083-codex-safety-review-result-2026-05-14.md`（placeholder、`pending-human-codex-review`）
- `tasks/visuals/building-hitori-media-os/_first-production-image-run.md`（11 セクションの execution guide）
- `docs/devlog/0084-first-production-visual-run-prep.md`
- `docs/handoff/0095-first-production-visual-run-prep.md`

### Modified

- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（First Visual Action ブロック）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`（First Visual Action サブ節）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`（First Visual Action サブ節）
- `docs/handoff/latest.md`

### Confirmed unchanged

- `tools/visual-register/`、`tools/publish-package-builder/`、`tools/local-check.mjs`
- 既存スキーマ / `schemas/index.ts` / `sanity.config.ts`
- 既存 outputs / publish-packages 本体（First Visual Action 追記のみ）
- 既存 seed
- `assets/visuals/...`（実画像未生成）
- `private/`
- ai-blog-db 関連

## 4. Summary of Changes

### Part 1: Codex Phase 1 safety review record

- `docs/devlog/0083-codex-safety-review-result-2026-05-14.md` を placeholder で作成。
- Status: `pending-human-codex-review`。
- Handoff Command / Prompt セクションに Codex 用 prompt を保存。
- Codex Review Output（4セクション）と Outcome（5チェック）が空欄で待機。
- 実行は任意。Codex を使わない場合は人間目視レビュー結果をここに記録する運用。

### Part 2: First Production Image Generation Handoff

- `tasks/visuals/building-hitori-media-os/_first-production-image-run.md` を新規作成。
- 11 セクション:
  1. First Target Asset: `note-hero-v1`
  2. Why This Asset First（shared master / 公開ゲート / flow 全段テスト）
  3. Source Brief（note-hero-v1.md へのリンク）
  4. Candidate Save Path（`assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` 等）
  5. Final Expected Path（seed の `expectedLocalAssetPath` = `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`）
  6. Human Steps（10 step）
  7. Review Criteria（9 観点）
  8. Regeneration Loop（v00X 連番、上書き禁止）
  9. After This First Cycle（次の asset 順）
  10. Safety
  11. Related Files

### Part 3: Release Review Package Update

- `final-human-checklist.md`: Production Visual Readiness 節の冒頭に **First Visual Action** ブロックを追加。
- `note-final-review.md`: Production Visual Readiness 節の冒頭に **First Visual Action** サブ節を追加。
- `substack-final-review.md`: Production Visual Readiness 節の冒頭に **First Visual Action** サブ節を追加（master 共有方針を再強調）。

## 5. Important Decisions

- Codex Phase 1 safety review を本バッチでは実行しない（人間判断）。代わりに公式記録場所を作っておく。
- 最初の production image は **`note-hero-v1`** 一択。shared master で 2 用途、flow 全段テストを兼ねる。
- candidate は v00X 連番、上書き禁止。採用候補が出るまで final path への copy は発生しない。
- release-review package の3ファイルに First Visual Action を追加し、人間が note / Substack 公開準備に進む手前で必ず1枚目を完成させる導線を作る。

## 6. Human Review Questions

- Codex Phase 1 safety review を実行するか、人間目視で済ませるか。
- 1枚目の candidate を ChatGPT / Codex のどちらで生成するか。
- 採用候補が出るまで何回 v00X を試すか（運用上、3〜5 が標準と仮置き）。
- 採用後、v001 以外の candidate を inbox に残すか、削除するか。

## 7. Risks or Uncertainties

- Codex Phase 1 review を skip した場合、人間が `tasks/reviews/visual-register-inbox-codex-review.md` の9軸を目視で通す責任が残る。
- 1枚目を急いで採用すると、トーンの基準が後続 asset 全てに影響する。`_first-production-image-run.md` の Review Criteria 9 観点を厳しめに通す方が後で楽。
- 採用候補 v00X とテスト候補が混在する inbox 状態のとき、Visual Register UI が candidate を多く表示しすぎる可能性。フィルタ（slug / review status）で絞ること。
- master 共有方針（note ↔ Substack）を運用上忘れると、`substack-header-v1.localAssetPath` が空のまま Sanity Studio に残る。`_first-production-image-run.md` の Step 9 で明示済み。
- 既に inbox にある test 画像（`note-hero-v1-attempt-1.png`）と新 candidate（`note-hero-v1/v001.png`）の混同に注意。サブフォルダ構造で分離する運用を `_first-production-image-run.md` Step 2 に明記。

## 8. Recommended Next Step

人間レビュー駆動（コード変更ゼロ）:

1. （任意）`docs/devlog/0083-...md` の handoff prompt を Codex CLI に渡し safety review を実行。結果を同ファイルに paste し Status を `completed` に更新。
2. ChatGPT or Codex で `note-hero-v1` の candidate 画像を生成（`tasks/visuals/building-hitori-media-os/note-hero-v1.md` の Generation Prompt を使う）。
3. `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に保存（必要なら mkdir）。
4. `lsof -ti :3334 | xargs kill` で旧 Visual Register プロセスを停止。
5. `npm run visual:register` で起動。
6. Inbox Review カードで `building-hitori-media-os` フィルタを当て、candidate を確認。
7. レビューノートを書いて `approve & register`。
8. Patch Review カードで `note-hero-v1.json` を確認。
9. `npm run dev` で Sanity Studio を開き、`visualAssetPlan.note-hero-v1` と `visualAssetPlan.substack-header-v1` の両方に同じ `localAssetPath` を手動入力 / status を `saved` に。
10. `npm run publish:package -- building-hitori-media-os --dry-run` で配布計画を確認、問題なければ flag なしで実行。
11. 採用後の v001 以外の candidate を残す / 削除する判断。
12. `x-hook-main-v1` へ進む。

## 9. Exact Prompt to Give Codex Next

```text
Generate a production candidate image for note-hero-v1 and save it to the inbox path.

Do not save to any final asset path.
Do not modify assets/visuals/...
Do not write to Sanity from code.
Do not call paid APIs.
Do not auto-post.

Use:
- tasks/visuals/building-hitori-media-os/note-hero-v1.md (Generation Prompt)
- tasks/visuals/building-hitori-media-os/_first-production-image-run.md (workflow)
- tasks/visuals/_codex-image-generation-template.md (general guidance)
- tasks/visuals/building-hitori-media-os/_style-guide.md (visual vocabulary)

Workflow:
1. Read the Generation Prompt in tasks/visuals/building-hitori-media-os/note-hero-v1.md and produce a 1456x816 image candidate.
2. Save the candidate to:
   assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png
3. If the human asks for revisions, save the next attempt as v002.png, v003.png... do NOT overwrite v001.
4. After saving, hand off to the human:
   - run "npm run visual:register"
   - open Inbox Review
   - confirm Plan auto-suggest = visualAssetPlan.building-hitori-media-os.note-hero-v1
   - review notes + approve & register

Do not save any image directly to assets/visuals/...
Do not bypass Visual Register Inbox Review.
Do not call any paid image generation API. If Codex cannot generate images locally without paid API, stop and report so the human can use ChatGPT instead.

Document:
- the actual prompt version used (file + last commit hash if available)
- the candidate version number (v001 / v002 / ...)
- any sanity check failures (text readability / face photo / paid PDF content / secret leakage)
```
