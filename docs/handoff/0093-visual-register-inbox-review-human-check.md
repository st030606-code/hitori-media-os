# Handoff: Visual Register Inbox Review — Human UI Check (passed)

Date: 2026-05-14

## 1. Task Goal

前バッチで実装した Visual Register Inbox Review を人間がブラウザで確認し、production image generation に進める判断を記録する。Visual Register が引き続き承認・final adoption の source of truth であることを再確認する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration / paid image generation API integration は追加していない。
- OpenAI API / Anthropic API clients は追加していない。
- external APIは呼んでいない。
- Sanity direct write は実装していない。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- secrets / API キー / 実 project ID / private/ filename / subscriber data は commit していない。
- 有料PDF本文の引用は含めていない。
- production images をこのバッチで自動生成していない。
- 顔写真ワークフローは扱っていない。

## 3. Changed Files

### Added (Part 2 のみ)

- `docs/devlog/0081-visual-register-inbox-review-human-check.md`
- `docs/handoff/0093-visual-register-inbox-review-human-check.md`

### Confirmed unchanged (Part 2 では)

- `tools/visual-register/`（前バッチの実装そのまま）
- 既存スキーマ / `schemas/index.ts` / `sanity.config.ts`
- 既存 outputs / publish-packages
- 既存 seed
- `tools/publish-package-builder/build.mjs` / `tools/local-check.mjs`

## 4. Summary of Changes

### 人間 UI 確認結果

- Visual Register を `npm run visual:register` で起動。
- 「Inbox Review（候補画像レビュー）」カードが Upload Card と 登録キュー の間に表示された。
- 候補が無い状態の表示（empty state + サマリーバー + フィルタ）が想定通り。
- Content Slug フィルタ / レビュー状態フィルタの挙動を確認。
- `seed/visual-asset-plan-records-building-hitori-media-os.json` の 8 visualAssetPlan が Visual Register で表示される（キャンペーン seed の自動 load を確認）。
- 既存アップロード型 register / Patch Review が引き続き同じ位置に存在。

### 判断

- Visual Register Inbox Review は active 維持。
- 既存機能の破壊は無さそう。
- 次は production image generation を進めてよい。**ただし画像は必ず inbox 経由**で final asset path に渡る。

## 5. Important Decisions

- production image generation を Visual Register Inbox Review 経由で進める方針を確定。
- 自動化はまだしない。手動レビューを品質ゲートに残す。
- Codex CLI を使う場合も Phase 1（コードレビュー）から始め、いきなり Phase 3（画像生成）には飛ばない。

## 6. Human Review Questions

- 候補が実際に置かれた状態での Inbox Review UI 確認はまだ。最初の本生成のときに合わせて行う。
- inbox 内の candidate を **複数同時 approve** したい運用シーンが出てきたとき、batch approve UI を後付けするか。
- `assets/inbox/generated/<slug>/<visual-asset-slug>/v00X.png` のサブフォルダ構造を厳格化するか、フラット placement も許容したままにするか。

## 7. Risks or Uncertainties

- まだ実 candidate を 1 枚も入れていない。本生成時に UI / overwrite confirmation / patch JSON 出力を re-verify する必要がある。
- `loadPlans()` のキャンペーン seed 自動 load は smoke test で confirm 済みだが、本生成時に再確認したい。
- Codex CLI は引き続きオプション。導入されない環境でも MVP は動く前提。

## 8. Recommended Next Step

- 同セッション内で Part 3 以降を進める:
  - 7 種類の production visual task files を `tasks/visuals/building-hitori-media-os/` に整備
  - `docs/45-building-hitori-media-os-production-visual-generation.md` 追加
  - release review package に visual readiness 項目を追記
- そのうえで人間が ChatGPT / Codex で1枚目（note-hero-v1）を生成 → inbox 配置 → Visual Register approve & register → patch JSON 確認 → Sanity 手動反映、というサイクルを1回試す。

## 9. Exact Prompt to Give Codex Next

このhandoff は本セッション内の中間記録。次セッションでは `docs/handoff/latest.md`（Part 7 で更新）の "Exact Prompt to Give Codex Next" を参照。
