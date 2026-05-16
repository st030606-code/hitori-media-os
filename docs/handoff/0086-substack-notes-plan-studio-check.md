# Handoff: substackNotesPlan Studio UI Check (manual, passed)

Date: 2026-05-14

## 1. Task Goal

前バッチで活性化した `substackNotesPlan` と、`substackPostPlan` に復元した `relatedNotesPlan` フィールドを、人間がローカル Sanity Studio でブラウザ確認した結果を記録する。active 維持判断と次の活性化候補（`substackGrowthAction`）への前提を整える。

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

- `docs/devlog/0074-substack-notes-plan-studio-check.md`
- `docs/handoff/0086-substack-notes-plan-studio-check.md`

### Confirmed unchanged (Part 1)

- `schemas/substackNotesPlan.ts`
- `schemas/substackPostPlan.ts`（`relatedNotesPlan` 復元済みのまま）
- `schemas/index.ts`
- `seed/substack-notes-plan-building-hitori-media-os.json`
- `seed/substack-post-plan-building-hitori-media-os.json`
- `sanity.config.ts`

## 4. Summary of Changes

Studio 手動確認の結果:

- 「Substack Notes計画（Substack Notes Plan）」が document type 一覧に表示。
- `prePostNotes` / `postLaunchNotes` の object array（noteType radio + body text）が想定通り動作。
- `conversationPrompts` / `ctaVariants` / `humanReviewChecklist` の string array UI が動作。
- `status` radio（planned / drafted / ready-for-human-edit / partially-published / completed / archived）が動作。
- `substackPostPlan` の編集画面で `relatedNotesPlan` reference フィールドが表示され、Notes Plan を選択できる。
- PostPlan ↔ NotesPlan の往復参照が両方向で機能。
- ブロッキングなフィールド問題なし。

判断:

- `substackNotesPlan` は active 維持。
- `substackPostPlan.relatedNotesPlan` も復元状態で維持。
- 次の活性化候補は `substackGrowthAction`。

## 5. Important Decisions

- `prePostNotes` / `postLaunchNotes` の body は text 3 rows のまま。
- `notesPurpose` と配列要素の `noteType` の責務重複は、運用してから判断する。
- 残り2本（SubscriberMilestone / PaidReadiness）は subscribers が動き始めるまで proposed-only。

## 6. Human Review Questions

- `notesPurpose` を残すか、配列要素の `noteType` に集約するか、運用後に再検討するか。
- `substackPostPlan` の `relatedNotesPlan` を required にすべきか、optional のままにするか。
- 次の `substackGrowthAction` 活性化は、X / Substack 公開前に Studio 側を整えるために進めるか、公開後に進めるか。

## 7. Risks or Uncertainties

- Studio UI 確認はローカルのみで実施。本番 dataset での挙動は別途。
- test seed は1件ずつのみ。3本（PublicationStrategy / PostPlan / NotesPlan）を1セットとして並べたときのリスト表示や検索性は未確認。

## 8. Recommended Next Step

- 続けて `substackGrowthAction` を Activation Checklist に従って単独活性化する（本セッション後半で実施）。
- 残り2本（SubscriberMilestone / PaidReadiness）は proposed-only のまま据え置き。

## 9. Exact Prompt to Give Codex Next

このhandoff は本セッション内の中間記録。次セッションでは `docs/handoff/latest.md`（`substackGrowthAction` 活性化後）を参照。
