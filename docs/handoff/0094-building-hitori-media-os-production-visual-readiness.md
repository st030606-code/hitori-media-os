# Handoff: building-hitori-media-os Production Visual Readiness

Date: 2026-05-14

## 1. Task Goal

Codex Phase 1 safety review packet を準備し、Visual Register Inbox Review の人間 UI 確認 passed を記録し、building-hitori-media-os の text-first 4 platforms 向け production visual 7 アセット（canonical）を inbox 経由フローに沿って整える。本バッチでは実画像を1枚も生成せず、production visual を生成可能な状態 (readiness) にとどめる。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration / paid image generation API は追加していない。
- OpenAI API / Anthropic API clients は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（コード grep で 0 hits 維持）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- secrets / API キー / 実 project ID / private/ filename / subscriber data は commit していない。
- 有料PDF本文の引用は含めていない。
- production images をこのバッチで生成していない（実画像 0 枚）。
- 候補画像を `assets/visuals/...` の final path に直接書いていない。
- Visual Register Inbox Review を bypass していない。
- 顔写真ワークフローは扱っていない。

## 3. Changed Files

### Added

- `tasks/reviews/visual-register-inbox-codex-review.md` — Codex Phase 1 safety review packet
- `tasks/visuals/building-hitori-media-os/threads-support-diagram-v1.md` — canonical brief（rename from threads-support-v1）
- `tasks/visuals/building-hitori-media-os/note-inline-human-judgment-v1.md` — canonical brief（NEW）
- `docs/45-building-hitori-media-os-production-visual-generation.md` — execution guide
- `docs/devlog/0081-visual-register-inbox-review-human-check.md`
- `docs/devlog/0082-building-hitori-media-os-production-visual-readiness.md`
- `docs/handoff/0093-visual-register-inbox-review-human-check.md`
- `docs/handoff/0094-building-hitori-media-os-production-visual-readiness.md`

### Modified

- `seed/visual-asset-plan-records-building-hitori-media-os.json`（threads-support-v1 → threads-support-diagram-v1、note-inline-human-judgment-v1 を追加）
- `tasks/visuals/building-hitori-media-os/_inventory.md`（canonical 7 + historical 3 構成へ更新）
- `tasks/visuals/building-hitori-media-os/note-hero-v1.md`（Inbox Candidate Path 節を追加）
- `tasks/visuals/building-hitori-media-os/substack-header-v1.md`（master 共有方針を inbox 文脈へ更新）
- `tasks/visuals/building-hitori-media-os/x-hook-main-v1.md`（Inbox Candidate Path 節を追加）
- `tasks/visuals/building-hitori-media-os/note-inline-content-os-flow-v1.md`（同上）
- `tasks/visuals/building-hitori-media-os/substack-inline-reader-system-v1.md`（同上）
- `publish-packages/campaigns/building-hitori-media-os-release-review/README.md`（Production Visual Readiness Gate）
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（Production Visual Readiness checklist）
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`（visual readiness ゲート）
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md`（同）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`（同）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`（同）
- `docs/handoff/latest.md`

### Confirmed unchanged

- 既存スキーマ / `schemas/index.ts` / `sanity.config.ts`
- `tools/visual-register/`、`tools/publish-package-builder/`、`tools/local-check.mjs`
- `outputs/...`（テキスト本文は touch しない）
- `assets/visuals/...`（実画像未生成・未上書き）
- `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` などの既存ファイル（前バッチ / 人間テストの残骸、本バッチでは触らず）
- `private/` 配下
- ai-blog-db 関連すべて

## 4. Summary of Changes

### Part 1: Codex Phase 1 safety review packet

- `tasks/reviews/visual-register-inbox-codex-review.md` を作成。
- 対象: Visual Register Inbox Review 関連 server / client / assets / docs / templates の 10 ファイル群。
- レビュー観点 9 軸（A〜I）: Destructive Writes / Inbox Path Traversal / Final Asset Overwrite Safety / Direct Sanity Write Absence / Private Leakage / Paid API Absence / Visual Register Existing Behavior Preservation / Patch JSON Safety / Candidate Review Status Safety。
- Expected Output Format: Critical / Warnings / Safe-To-Merge / Suggested Follow-Up。
- 「Codex は edit しない。secret / private / API token を出力に出さない」を強調。

### Part 2: Inbox Review human-check 記録

- Visual Register Inbox Review を人間がブラウザで確認、UI / 候補なし時の表示 / フィルタ / Plan auto-suggest（candidates 入っていない時点で部分確認）すべて想定通り。
- active 維持の判断、production image generation に進める判断を `devlog/0081` と `handoff/0093` に記録。

### Part 3: production visual task files (canonical 7)

| # | Asset | 既存/新規 | Slug 変更 | Brief 更新 |
| --- | --- | --- | --- | --- |
| 1 | `note-hero-v1` | 既存 | - | inbox v00X 節を追加 |
| 2 | `substack-header-v1` | 既存 | - | master 共有方針を inbox 文脈へ |
| 3 | `x-hook-main-v1` | 既存 | - | inbox v00X 節を追加 |
| 4 | `threads-support-diagram-v1` | **新規** | rename from `threads-support-v1` | new brief |
| 5 | `note-inline-content-os-flow-v1` | 既存 | - | inbox v00X 節を追加 |
| 6 | `note-inline-human-judgment-v1` | **新規** | new asset | new brief |
| 7 | `substack-inline-reader-system-v1` | 既存 | - | inbox v00X 節を追加 |

- seed: `threads-support-v1` を rename し、`note-inline-human-judgment-v1` を追加。`note-inline-manual-vs-automation-v1` / `note-inline-publish-package-folder-v1` は historical / alternate として残置。
- `_inventory.md` を canonical 7 + historical 3 の構成へ更新。

### Part 4: docs/45 Production Visual Generation Guide

- なぜ production visual が必要か（test images / 他キャンペーン流用を避ける）
- text-first 4 platforms スコープ + 顔写真 / video / Shorts cover を out-of-scope に
- generation order（最短公開可能性）
- local inbox flow（8 step）
- visual review criteria（8 観点）
- Safety Reaffirmation

### Part 5: release review package update

- README に Production Visual Readiness Gate
- final-human-checklist に Production Visual Readiness 節（各 asset の inbox / approve & register / patch / Sanity / package image チェック）
- 各 final-review.md（x / threads / note / substack）に Production Visual Readiness 節を追加
- outputs / publish-packages 本体は touch しない

## 5. Important Decisions

- 本バッチは設計と準備のみ。実画像生成は次の人間ターン。
- canonical 7 と historical 3 を seed と inventory で分離（運用ノイズを減らす）。
- threads-support-v1 を threads-support-diagram-v1 へ rename（命名一貫性）。
- note-inline-human-judgment-v1 を新規追加（AI→人間判断→公開のflowを視覚化）。
- 顔写真 / Instagram / video / Shorts cover / Podcast cover は引き続き out-of-scope。
- Codex は引き続き任意。MVP は ChatGPT 手動 + Visual Register で完結。

## 6. Human Review Questions

- canonical 7 のうち、初回公開時に必須にするのは何枚か（推奨は P1 = `note-hero-v1` + `x-hook-main-v1`）。
- `threads-support-v1.md`（旧 brief）を retire するか、historical として残すか。現状は inbox v00X 節を入れず残置している。
- `note-inline-publish-package-folder-v1` を canonical に戻すかどうか。
- Codex Phase 1 safety review packet を実際に Codex CLI に通すか、人間目視レビューだけで進めるか。

## 7. Risks or Uncertainties

- canonical asset list が 7 件に増えたため、初回公開までに揃えるべき枚数が「最低 3 枚（hero / x / substack header）」から「3〜6 枚（P1〜P2）」へと幅広い。優先度判断は最終的に人間。
- `threads-support-v1.md` の旧 brief を retire していないため、ファイル一覧で 2 つの threads brief が並ぶ。`_inventory.md` で historical / alternate と注記してあるが、混乱の余地あり。
- `note-inline-human-judgment-v1` の brief は新規作成。Generation Prompt は妥当だが、実生成して見ないと「flow図 4 ノード」が visually まとまるかは未検証。
- inbox にすでに置かれている `note-hero-v1-attempt-1.png` のような前バッチテスト画像は、本生成 candidate が来たときに **削除**するか、`v001 / v002 ...` の混在を許すかは運用ルール未定。`_workflow.md` の Shared File Handling 節で明示する余地あり。
- Codex safety review packet を実行しない場合、人間が手で同等のチェックをする運用ルールを確立する必要がある（docs/44 と本 handoff に手順は明記）。

## 8. Recommended Next Step

### Immediate（コード変更ゼロ）

1. （任意）Codex CLI 利用者: `tasks/reviews/visual-register-inbox-codex-review.md` を Codex に渡し Phase 1 safety review を実行。結果を `docs/devlog/` に保存。
2. ChatGPT / Codex で `note-hero-v1` の candidate を生成 → `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に保存。
3. `npm run visual:register`（既存プロセスは `lsof -ti :3334 | xargs kill`）。
4. Inbox Review カードで auto-suggest を確認、`approve & register`。
5. patch JSON / Sanity Studio 手動反映を完了。
6. `npm run publish:package -- building-hitori-media-os --dry-run` で配布計画を確認。
7. `x-hook-main-v1` へ進む。

### Mid-term

- canonical 7 のうち最初に揃える 3 枚（hero / x / Substack header の共有 master）を完成させ、X + Substack の最低限の公開準備を整える。
- inbox の v00X 連番運用を実運用に通す。
- `note-inline-human-judgment-v1` の生成・採用で、Visual Register Inbox Review の v00X flow 全段を試す。

### Deferred

- 顔写真ワークフロー（YouTube サムネ / Shorts cover / Podcast cover）
- Instagram carousel slides
- subscribers が動き始めたら `substackSubscriberMilestone` 活性化

## 9. Exact Prompt to Give Codex Next

```text
Run the Visual Register Inbox + Codex CLI Optional Workflow safety review using tasks/reviews/visual-register-inbox-codex-review.md.

Do not edit any files.
Do not commit or push.
Do not call paid APIs.
Do not run seed --replace.
Do not expose secrets, real project IDs, subscriber emails, or private/ filenames in the output.

Use:
- tasks/reviews/visual-register-inbox-codex-review.md (packet)
- git status / git diff --stat output for files changed in the last 3 batches
- tools/visual-register/server.mjs
- tools/visual-register/public/app.js
- tools/visual-register/public/index.html
- tools/visual-register/public/styles.css
- assets/inbox/generated/README.md
- docs/43-visual-register-inbox-review-workflow.md
- docs/44-codex-cli-optional-workflow.md
- docs/45-building-hitori-media-os-production-visual-generation.md
- tasks/visuals/_codex-image-generation-template.md
- tasks/reviews/codex-code-review-template.md
- tools/codex-workflow/README.md
- tasks/visuals/building-hitori-media-os/_inventory.md
- tasks/visuals/building-hitori-media-os/threads-support-diagram-v1.md
- tasks/visuals/building-hitori-media-os/note-inline-human-judgment-v1.md
- seed/visual-asset-plan-records-building-hitori-media-os.json
- publish-packages/campaigns/building-hitori-media-os-release-review/README.md
- publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md

Output should follow the "Expected Output Format" of the packet:
- Critical Issues
- Warnings
- Safe-To-Merge Notes
- Suggested Follow-Up

After review:
- Save the output to docs/devlog/0083-codex-safety-review-result-<date>.md
- Address Critical Issues with Claude Code in a new batch if any
- Move Warnings into docs/handoff/latest.md under "Risks or Uncertainties"
```
