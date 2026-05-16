# Devlog 0082: building-hitori-media-os Production Visual Readiness

Date: 2026-05-14

## 今日の判断

本バッチは「Codex safety review packet + Visual Register Inbox Review human-check 記録 + production visual generation readiness」を1セットで進める **準備 batch**。実画像生成はまだしない。

ゴール:

1. Codex CLI に渡せる safety review パケットを準備（実行はしない、人間判断）。
2. 人間が Visual Register Inbox Review を UI 確認した結果を docs に固定。
3. text-first 4 platforms（X / Threads / note / Substack）の **canonical 7 visualAssetPlan** を整え、inbox 経由フローに沿った task brief を全て用意。
4. Production Visual Generation Guide を `docs/45` に追加。
5. Release Review Package に Production Visual Readiness ゲートを差し込む。

production image は **1枚も生成していない**。assets/visuals / private/ は触っていない。

## 連番について

連番 (44, 0080, 0092) は前バッチで埋まったため、本バッチでは次の空き番号を使用:

- `docs/45-building-hitori-media-os-production-visual-generation.md`
- `docs/devlog/0081-...md`（Inbox Review human check）
- `docs/devlog/0082-...md`（本devlog）
- `docs/handoff/0093-...md`（Inbox Review human check）
- `docs/handoff/0094-...md`（本handoff）

## 変更したこと

### Part 1: Codex Phase 1 safety review packet

- `tasks/reviews/visual-register-inbox-codex-review.md`
  - レビュー対象（Visual Register Inbox + Codex CLI Optional Workflow 関連 10 ファイル）
  - レビュー観点 A〜I（Destructive Writes / Inbox Path Traversal / Final Asset Overwrite Safety / Direct Sanity Write Absence / Private Leakage / Paid API Absence / Visual Register Existing Behavior Preservation / Patch JSON Safety / Candidate Review Status Safety）
  - Expected Output Format（Critical / Warnings / Safe-To-Merge / Suggested Follow-Up）
  - Sample one-liner prompt
  - 「Codex は **編集しない**」「secret / private / API トークンを出力に貼り付けない」を強調

### Part 2: Inbox Review human-check 記録

- `docs/devlog/0081-visual-register-inbox-review-human-check.md`
- `docs/handoff/0093-visual-register-inbox-review-human-check.md`
- Visual Register Inbox Review が active 維持の判断、production image generation に進める根拠、自動化を急がない理由を記録。

### Part 3: production visual task files

- canonical 7 アセット（user 指定）に合わせて整備:
  1. `note-hero-v1.md`（既存、inbox v00X 節を追加）
  2. `substack-header-v1.md`（既存、master 共有方針を inbox 文脈へ更新）
  3. `x-hook-main-v1.md`（既存、inbox v00X 節を追加）
  4. `threads-support-diagram-v1.md`（**新規**、`threads-support-v1` を rename）
  5. `note-inline-content-os-flow-v1.md`（既存、inbox v00X 節を追加）
  6. `note-inline-human-judgment-v1.md`（**新規**、AI→人間判断→公開のflow図ブリーフ）
  7. `substack-inline-reader-system-v1.md`（既存、inbox v00X 節を追加）

- seed file `seed/visual-asset-plan-records-building-hitori-media-os.json` を更新:
  - `threads-support-v1` を `threads-support-diagram-v1` へ rename（`_id` / `title` / `expectedLocalAssetPath` / `taskFilePath` を更新）
  - `note-inline-human-judgment-v1` レコードを追加（additive）
  - 既存の `note-inline-manual-vs-automation-v1` / `note-inline-publish-package-folder-v1` は historical / alternate として残置

- `tasks/visuals/building-hitori-media-os/_inventory.md` を canonical 7 + historical 3 の構成に更新。

### Part 4: Production Visual Generation Guide

- `docs/45-building-hitori-media-os-production-visual-generation.md`
  - なぜ production visual が必要か
  - test images を使わない理由
  - text-first 4 platforms スコープ
  - 顔写真 / video / Shorts cover などを意図的に out-of-scope に
  - generation order（最短公開可能性）
  - local inbox flow（8 step）
  - visual review criteria（8 観点）
  - Codex CLI optional usage
  - Safety Reaffirmation

### Part 5: Release Review Package update

- `publish-packages/campaigns/building-hitori-media-os-release-review/README.md`: Production Visual Readiness Gate 節を追加
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`: Production Visual Readiness 節を追加（各 asset の inbox / Visual Register / patch JSON / Sanity / package image チェック）
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`: Production Visual Readiness 節を追加（x-hook-main-v1 用 checklist）
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md`: 同（threads-support-diagram-v1 用）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`: 同（note-hero / 2 inline 用）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`: 同（substack-header / inline 用）

`outputs/...` の本文は **触らず**、各 final-review に Production Visual Readiness 節を追加する形のみ。

## 変更していないもの

- production images（実画像）を1枚も生成・配置していない。
- `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` などの既存テスト画像は前バッチ / 人間テストの残骸であり、**本バッチでは触っていない**。
- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` も同じく既存（前 inbox 試験の産物か、人間が置いた可能性）。本バッチで作成・上書きしていない。
- private/ には触っていない。
- `tools/visual-register/`、`tools/publish-package-builder/`、`tools/local-check.mjs` は未変更。
- 既存スキーマ / `schemas/index.ts` / `sanity.config.ts` は未変更。

## 安全性の担保

- direct Sanity write の grep → 0 hits（不変）
- paid API integration の grep → 0 hits
- 実画像生成 / final asset 直接書き込み なし
- inbox v00X 規約を全 task brief に統一
- canonical 7 + historical 3 の区別を `_inventory.md` で明示
- Production Visual Readiness ゲートを release-review package の各 final-review に追加

## CodexとClaude Codeの役割分担

- Claude Code（今回）: 設計 / docs / task brief / release-review update / seed 整備
- 人間: ChatGPT or Codex CLI で candidate 生成 → inbox 保存 → Visual Register approve & register → Sanity Studio 手動反映
- Codex（オプション）: Phase 1 = safety review、Phase 2 = prompt revision、Phase 3 = candidate generation

## APIなしで済ませた理由

- 本バッチは設計 + docs + brief + seed renaming のみ。
- 画像生成も Sanity 書き込みも auto-posting も発生しない。

## 発信コンテンツにできる切り口

- 「準備バッチ」で生成しないという判断（実装と運用の境界線）。
- canonical asset list と historical / alternate を分けて管理する設計の話。
- 公開を急がない方針: visual も Codex も Visual Register も、人間判断のゲートを残す。

## 検証

- `node --check tools/visual-register/server.mjs` / `tools/visual-register/public/app.js` / `tools/publish-package-builder/build.mjs` / `tools/local-check.mjs` → 全て成功
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 8.0s で成功
- direct Sanity write の grep → 0 hits
- paid API integration の grep → 0 hits
- production images 生成数 → 0
- private/ / assets/visuals の本バッチ変更 → 0

## 次にテストすること

人間レビュー駆動（コード変更ゼロ）:

1. Codex CLI を持っているなら、`tasks/reviews/visual-register-inbox-codex-review.md` を Codex に渡し、Phase 1 safety review を実行する（任意）。
2. ChatGPT / Codex で `note-hero-v1` の candidate を生成し、`assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に保存する。
3. `npm run visual:register`（必要なら旧プロセスを先に kill）。
4. Inbox Review カードで Plan auto-suggest を確認、`approve & register`。
5. patch JSON / Sanity Studio 反映を確認。
6. `x-hook-main-v1` などへ進む。
