# Devlog 0080: Codex CLI Optional Workflow (design + templates)

Date: 2026-05-14

## 今日の判断

Codex CLI を Hitori Media OS の **オプションの補助ツール** として位置付け、設計とテンプレートを整備しました。

- Codex CLI は **必須ではない**。MVP は引き続き Codex なしでも完全に動作する。
- Codex の役割は3用途に限定: code review / image candidate generation / image revision。
- Visual Register Inbox Review が引き続き **承認と final adoption の source of truth**。
- production image を Codex が自動で final asset path に書き込まない（inbox 経由必須）。

実行スクリプトは入れず、README + テンプレートのみ。

## 連番について

ユーザー指示の連番（`docs/43-...`、`docs/devlog/0078-...`、`docs/handoff/0090-...`）は前バッチで埋まっていたため、次の空き番号を使った:

- `docs/44-codex-cli-optional-workflow.md`（43 は visual-register-inbox-review-workflow に使用済）
- `docs/devlog/0080-codex-cli-optional-workflow.md`（0078 は visual completion batch / 0079 は visual register inbox に使用済）
- `docs/handoff/0092-codex-cli-optional-workflow.md`（0090 は visual completion batch / 0091 は visual register inbox に使用済）

意味的な順序は維持（visual-register inbox → codex optional）。

## 変更したこと

### Added (docs + templates + README)

- `docs/44-codex-cli-optional-workflow.md` — Codex CLI を使うときの運用設計
  - 3 use cases（code review / image candidate generation / image revision）
  - candidate folder convention（`assets/inbox/generated/<slug>/<visual-asset-slug>/v00X.png`）
  - Codex がやってはいけないこと一覧
  - Phase 1 → Phase 3 の段階的 adoption 順
- `tasks/visuals/_codex-image-generation-template.md` — Codex に画像生成を依頼するときのテンプレ
  - Asset Metadata / Inbox Candidate Path / Generation Prompt / Negative Prompt / Review Criteria / Output Naming / Reminder / Hand-Off
  - 「final path には書き込まない」「v00X 上書き禁止」「auto-post / paid API 不使用」を明示
- `tasks/reviews/codex-code-review-template.md` — Codex にコードレビューを依頼するテンプレ
  - When To Run / Files Changed / Constraints / Review Checklist（A〜H の 8 観点）/ Expected Output Format / Sample Prompt
  - 「Codex はレビューのみ。ファイル編集しない」を明示
- `tools/codex-workflow/README.md` — Codex を使う場合の README（実行スクリプトなし）
  - Quick Decision（使う / 使わない判断）
  - 3 用途のテンプレ使い方
  - Phase 1 → 3 の adoption ガイド
  - Safety Reaffirmation

### Added (logs)

- `docs/devlog/0080-codex-cli-optional-workflow.md`
- `docs/handoff/0092-codex-cli-optional-workflow.md`

### Modified

- `docs/handoff/latest.md`

### Confirmed unchanged

- 既存スキーマ全般 / `schemas/index.ts` / `sanity.config.ts`
- 既存 outputs / publish-packages / private/
- 既存 seed すべて
- `tools/visual-register/`（前バッチで追加した inbox 機能はそのまま）
- `tools/publish-package-builder/build.mjs`
- `tools/local-check.mjs`

## 理由

Codex CLI を実装エージェントとして使い始めると、最初に直面する設計判断は「どこまで委ねるか」と「どこを Visual Register が握り続けるか」です。

このバッチで境界線を明文化:

- **Visual Register が握る**: 承認、final adoption、patch JSON、Sanity 反映の起点
- **Codex が補助**: コードレビュー、candidate 画像生成、prompt 推敲
- **Claude Code がメイン実装**: バッチ全体の指揮、コード変更、docs 執筆

Codex CLI を「使わない選択」も同じくらい正当だと明示することで、MVP の local-first 性を保ちます。

## 安全性の担保

- 実行スクリプトを入れていない。README + テンプレートのみ。
- Codex が production image を final asset path に直接書く経路を作らない（inbox 経由必須）。
- Codex 経由でも paid API integration / direct Sanity write / auto-posting / `seed --replace` 禁止。
- レビューテンプレに「Codex は **コードを編集しない**」を明示。
- 既存ファイルへの破壊的書き込みなし。

## CodexとClaude Codeの役割分担

このバッチ自体が役割分担の言語化:

- Claude Code: 設計 / docs / テンプレート整備（今回）
- Codex: 将来、(a) 大きめバッチ後のレビュー、(b) inbox candidate 生成、(c) prompt 推敲を担当
- 人間: Visual Register Inbox Review での承認、Sanity Studio での手動反映、各 platform への手動投稿

## APIなしで済ませた理由

- このバッチは設計と docs のみ。コード変更なし、API 呼び出しなし。
- 将来 Codex CLI を実際に使い始めた段階でも、Codex 自体はオプションで、MVP は Codex なしで完全に動く設計。

## 発信コンテンツにできる切り口

- 「Codex CLI を導入する」より「Codex CLI を **使わなくても動く** ようにしてから入れる」順序の話。
- 自動化と人間レビューの境界線（Visual Register Inbox Review）の重要性。
- Phase 1 → 3 の段階的 adoption（コードレビュー → prompt 推敲 → image 生成）の意義。

## 検証

- `node --check tools/visual-register/server.mjs` / `tools/visual-register/public/app.js` / `tools/publish-package-builder/build.mjs` / `tools/local-check.mjs` → 全て成功
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 7.6s で成功
- 直接 Sanity 書き込み grep → 0 hits（不変）
- 既存 Visual Register / publish-package-builder / schemas / seed すべて未変更

## 次にテストすること

1. Codex CLI を持っている開発者は、`tasks/reviews/codex-code-review-template.md` で **今までのバッチを safety review** に通してみる（Phase 1）。
2. 違和感なく動けば、`tasks/visuals/_codex-image-generation-template.md` で `note-hero-v1` の candidate 生成を Codex に依頼してみる（Phase 3 試験）。
3. candidate を `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` 等に保存。
4. Visual Register Inbox Review で承認 → `approve & register`。
5. 結果を `docs/devlog/` に残す。

Codex を使わない開発者は、引き続き ChatGPT 手動生成 + Visual Register Inbox Review で完結する。
