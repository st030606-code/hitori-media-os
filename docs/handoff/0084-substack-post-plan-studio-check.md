# Handoff: substackPostPlan Studio UI Check (manual, passed)

Date: 2026-05-14

## 1. Task Goal

前バッチで活性化した `substackPostPlan` を、人間がローカル Sanity Studio でブラウザ確認した結果を記録し、active 維持の判断を残す。次の活性化候補（`substackNotesPlan`）に進むための前提を整える。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- 外部APIは呼んでいない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。

## 3. Changed Files

### Added

- `docs/devlog/0072-substack-post-plan-studio-check.md`
- `docs/handoff/0084-substack-post-plan-studio-check.md`

### Confirmed unchanged (Part 1)

- `schemas/substackPostPlan.ts`
- `schemas/index.ts`
- `seed/substack-post-plan-building-hitori-media-os.json`
- `sanity.config.ts`

## 4. Summary of Changes

Studio 手動確認の結果:

- 「Substack Post計画（Substack Post Plan）」が document type 一覧に表示。
- `titleOptions` / `emailSubjectOptions` / `mainSections` の object array / `humanReviewChecklist` の string array / `status` radio が正しく動作。
- `_key` 自動付与も機能。
- reference UI（`sourceContentIdea` / `publicationStrategy`）が解決。
- `publishedUrl` は `type: url` のままで運用可能。
- ブロッキングなフィールド問題なし。

判断:

- `substackPostPlan` は active 維持。
- 次の活性化候補は `substackNotesPlan`。

## 5. Important Decisions

- `mainSections` の body は引き続き text 6 rows。portable text 化は将来検討。
- `publishedUrl` は `type: url` のまま。`string` への変更は必要が出てから。
- `relatedNotesPlan` の一時削除状態は許容。NotesPlan 活性化時に復元する。

## 6. Human Review Questions

- 運用しながら、`mainSections.body` を portable text に上げたいタイミングはあるか。
- `publishedUrl` の `url` バリデーションが厳しすぎないか（Substack の URL は通る）。
- `substackPostPlan` のリスト表示で何を `subtitle` に出すべきか（現状は `status`）。

## 7. Risks or Uncertainties

- Studio UI 確認はローカルのみ。本番 dataset で別挙動が出る可能性は残る。
- test seed は1件のみ。Post Plan を10件以上作ったときのリスト表示などはまだ未検証。

## 8. Recommended Next Step

- 続けて `substackNotesPlan` を Activation Checklist に従って単独活性化する（本セッション後半で実施）。
- 同バッチで `substackPostPlan` の `relatedNotesPlan` フィールドを復元する。
- 残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）は proposed-only のまま据え置き。

## 9. Exact Prompt to Give Codex Next

このhandoff は本セッション内の中間記録。次セッションでは `docs/handoff/latest.md`（`substackNotesPlan` 活性化後）を参照。
