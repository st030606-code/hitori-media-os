# Handoff: Codex CLI Optional Workflow (design + templates)

Date: 2026-05-14

## 1. Task Goal

Codex CLI を Hitori Media OS の **オプションの補助ツール** として位置付け、3用途（code review / image candidate generation / image revision）の運用設計とテンプレートを整備する。Visual Register Inbox Review を引き続き承認の source of truth として維持し、Codex が無くても MVP は完全に動く状態を保つ。

## 2. Constraints Followed

- Visual Register Inbox Review を replace していない。
- paid API integration は追加していない。
- direct Sanity write は実装していない。
- auto-posting は実装していない。
- `seed --replace` は実行していない。
- secrets / API キー / 実 project ID をコミットしていない。
- production image を自動生成・自動採用していない（このバッチでは画像を1枚も生成していない）。
- Codex CLI を必須にしていない。MVP は Codex なしでも完全に動く。
- Codex CLI が無い環境を想定した代替フロー（ChatGPT 手動 + Visual Register）も維持。

## 3. Changed Files

### Added

- `docs/44-codex-cli-optional-workflow.md` — メイン設計ドキュメント
- `tasks/visuals/_codex-image-generation-template.md` — Codex 画像生成プロンプトテンプレ
- `tasks/reviews/codex-code-review-template.md` — Codex コードレビュープロンプトテンプレ
- `tools/codex-workflow/README.md` — README-only ワークフローガイド
- `docs/devlog/0080-codex-cli-optional-workflow.md`
- `docs/handoff/0092-codex-cli-optional-workflow.md`

### Modified

- `docs/handoff/latest.md`

### Confirmed unchanged

- 既存スキーマ全般 / `schemas/index.ts` / `sanity.config.ts`
- 既存 outputs / publish-packages / private/
- 既存 seed すべて
- `tools/visual-register/`（前バッチの inbox 機能はそのまま）
- `tools/publish-package-builder/build.mjs`
- `tools/local-check.mjs`

## 4. Summary of Changes

### Numbering note

前バッチで `docs/43-...`、`docs/devlog/0078-...`、`docs/handoff/0090-...` を visual-completion / visual-register-inbox に使用済みのため、本バッチでは次の空き番号を使用:

- `docs/44-codex-cli-optional-workflow.md`
- `docs/devlog/0080-codex-cli-optional-workflow.md`
- `docs/handoff/0092-codex-cli-optional-workflow.md`

### docs/44

Codex CLI を使う場合の運用設計:

- 3 use cases: code review / image candidate generation / image revision
- いずれも **Visual Register Inbox Review が承認の source of truth**
- candidate folder convention: `assets/inbox/generated/<slug>/<visual-asset-slug>/v00X.png`
- Codex がやらないこと一覧（final path 書き込み / Sanity 書き込み / auto-post / paid API / `seed --replace` / 顔写真 / private/ リーク）
- adoption は段階的: Phase 1 = Code Review only / Phase 2 = prompt revision / Phase 3 = candidate generation

### tasks/visuals/_codex-image-generation-template.md

Codex に画像生成を依頼するテンプレ:

- Asset Metadata（contentSlug / visualAssetPlanId / placement / aspect / pixel size / expectedLocalAssetPath）
- Inbox Candidate Path（v00X 連番、上書き禁止）
- Generation Prompt（例として building-hitori-media-os / note-hero-v1 用を inline 記載）
- Negative Prompt / Avoid List
- Review Criteria（candidate ごとの自己レビュー観点）
- Output Naming Convention
- Reminder（final path 書き込み禁止、上書き禁止、paid API 禁止）
- Hand-Off（人間が Visual Register で承認する手順）

### tasks/reviews/codex-code-review-template.md

Codex にコードレビューを依頼するテンプレ:

- When To Run（schema activation / publish-package-builder 変更 / Visual Register 変更 / commit 前など）
- Current Task Summary / Files Changed / Constraints
- Review Checklist（A〜H の 8 観点）:
  - A. Destructive Writes
  - B. Secret Leakage
  - C. Direct Sanity Write
  - D. Schema Registration
  - E. Assets Overwrite Risk
  - F. Build / Local Check
  - G. Visual Register Specific
  - H. Local-First Constraints
- Do Not Edit ルール
- Expected Output Format（Critical Issues / Warnings / Safe-To-Merge Notes / Suggested Follow-Up）
- Sample One-Liner Prompt

### tools/codex-workflow/README.md

README-only ワークフローガイド:

- Quick Decision: Codex を使うか使わないかの判断
- 3 用途のテンプレ使い方
- Phase 1 → 3 の adoption ガイド
- Required Local State
- Safety Reaffirmation

実行スクリプトは含まない（local MVP の Codex 非依存性を維持）。

## 5. Important Decisions

- Codex CLI を **オプション** にすることを最優先（必須化しない）。
- Visual Register Inbox Review が引き続き「承認・final adoption の source of truth」。
- Codex は code review / candidate 生成 / prompt 推敲 の 3 用途に限定。
- production image を Codex が自動で final asset path に書く経路は作らない。
- 実行スクリプトは入れず、README + template のみ。
- 連番は前バッチで埋まったため次の空きを使用（44 / 0080 / 0092）。devlog でも理由を明記。

## 6. Human Review Questions

- Codex CLI の install 状況を README に書き加えるか（環境ごとに違うため、現状は触れない方針）。
- Phase 1（コードレビュー）から始める方針でよいか、いきなり Phase 3（画像生成）に飛んでもよいか。
- `assets/inbox/generated/<slug>/<visual-asset-slug>/` のサブフォルダ構造（v001 / v002 ...）を必須にするか、フラット placement も許容するか（現状は両方 OK）。
- Codex に渡す code review テンプレを `git diff` 自動展開する補助スクリプトを将来作るか。
- 顔写真ワークフローを Codex に乗せる場合、別 inbox（`assets/inbox/face/`）を切るか。

## 7. Risks or Uncertainties

- Codex CLI を使う開発者と使わない開発者で運用がぶれる可能性。docs に「両方サポート」を明記しているが、運用フィードバックを次バッチで集める。
- Codex を Phase 3（candidate 生成）に進めたとき、画像品質のチェックを人間が見落とすリスク。Visual Register Inbox Review の `reviewNotes` を必須にする運用ルールがまだ非公式。
- Codex 出力がレビューテンプレの「Expected Output Format」に厳密に従わない可能性。テンプレ違反のときは Claude Code 側で再整形する。
- Codex を実際に試す段階で、API 認証や rate limit などの環境依存事項が出てくる。README に「環境固有のセットアップは扱わない」と明記済み。

## 8. Recommended Next Step

短期（コード変更ゼロ）:

1. 人間が `docs/44-codex-cli-optional-workflow.md` と4つの新ファイルを読み、運用境界に合意する。
2. Codex CLI を持っている人は Phase 1（コードレビュー）から試す。前バッチ（Visual Register Inbox Review）を `tasks/reviews/codex-code-review-template.md` で safety review に通す。
3. レビュー結果を `docs/devlog/` に残す。
4. 違和感がなければ Phase 3（candidate 生成）を `note-hero-v1` で試す。
5. Visual Register Inbox Review で承認するところまでを 1 サイクル回す。

中期:

- Codex を使った devlog の蓄積を待ってから、薄いラッパースクリプトや Visual Register との連携を検討する。
- 顔写真ワークフローの inbox 設計を別バッチで進める。

## 9. Exact Prompt to Give Codex Next

```text
Run a safety review of the most recent batches (Visual Register Inbox Review + Codex CLI Optional Workflow) using tasks/reviews/codex-code-review-template.md.

Do not edit any files.
Do not commit anything.
Do not push to GitHub.
Do not call paid APIs.
Do not run seed --replace.

Use:
- tasks/reviews/codex-code-review-template.md (fill the sections in)
- git status / git diff --stat for files changed
- docs/43-visual-register-inbox-review-workflow.md
- docs/44-codex-cli-optional-workflow.md
- tools/visual-register/server.mjs
- tools/visual-register/public/app.js

Output should follow the "Expected Output Format" of the template:
- Critical Issues
- Warnings
- Safe-To-Merge Notes
- Suggested Follow-Up

Do not expose any secret, real project ID, subscriber email, or private/ filename in the output.
```
