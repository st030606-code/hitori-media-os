# Handoff: Activate substackGrowthAction (4th Substack schema)

Date: 2026-05-14

## 1. Task Goal

`substackNotesPlan` の Studio UI 手動確認と、復元した `substackPostPlan.relatedNotesPlan` の動作確認が通った（passed）ので、`schemas/proposed/` の残り3本のうち `substackGrowthAction` だけを追加で1本だけ活性化する。残り2本（SubscriberMilestone / PaidReadiness）は引き続き proposed-only。`sanity.config.ts` は触らない。Sanity CLI / direct write / `seed --replace` は使わない。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- 外部APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない（コード側から）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。
- 他の proposed Substack schema（SubscriberMilestone / PaidReadiness）は活性化していない。

## 3. Changed Files

### Added

- `schemas/substackGrowthAction.ts`（active schema）
- `seed/substack-growth-action-building-hitori-media-os.json`（test seed、ローカル保存のみ）
- `docs/devlog/0074-substack-notes-plan-studio-check.md`（Part 1: Studio 確認結果）
- `docs/devlog/0075-activate-substack-growth-action.md`（Part 2 以降: 活性化記録）
- `docs/handoff/0086-substack-notes-plan-studio-check.md`
- `docs/handoff/0087-activate-substack-growth-action.md`

### Modified

- `schemas/index.ts`（`substackGrowthAction` の import 追加、`schemaTypes` 配列末尾に1件追加）
- `schemas/proposed/README.md`（Activation Status 更新、Compatibility Note を補強）
- `docs/handoff/latest.md`

### Deleted

- `schemas/proposed/substackGrowthAction.ts`（active schemas/ へ移動済み）

### Confirmed unchanged

- `sanity.config.ts`（`git diff` 空）
- 既存スキーマ全般（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy / substackPostPlan / substackNotesPlan）
- 残り2本の proposed スキーマファイル（substackSubscriberMilestone.ts / substackPaidReadiness.ts）

## 4. Summary of Changes

### Part 1: substackNotesPlan + restored relatedNotesPlan Studio Check (passed)

- 人間が `npm run dev` を起動して Sanity Studio をブラウザで確認。
- 「Substack Notes計画（Substack Notes Plan）」が document type 一覧に表示。
- `prePostNotes` / `postLaunchNotes` object array（noteType + body）、`conversationPrompts` / `ctaVariants` / `humanReviewChecklist` string array、`status` radio が動作。
- `substackPostPlan` の `relatedNotesPlan` reference フィールドが表示・選択可能。
- PostPlan ↔ NotesPlan の往復参照（`relatedNotesPlan` / `relatedPostPlan`）が両方向で機能。
- ブロッキング問題なし。active 維持の判断。
- `docs/devlog/0074-substack-notes-plan-studio-check.md` / `docs/handoff/0086-substack-notes-plan-studio-check.md` に記録。

### Part 2: substackGrowthAction Activation

- `schemas/proposed/substackGrowthAction.ts` を `schemas/substackGrowthAction.ts` へ移動。`PROPOSED SCHEMA` コメントブロックを削除。
- 参照先（`contentIdea` / `substackPublicationStrategy`）はすべて active なので追加の互換性 fix は不要。
- `schemas/index.ts` に1件追加（`substackNotesPlan` の後ろに `substackGrowthAction` を置く）。
- `sanity.config.ts` は未変更。

### Part 3: Test seed

- `seed/substack-growth-action-building-hitori-media-os.json` を新規作成。ローカル保存のみ。
- 主要フィールド:
  - `_id`: `substackGrowthAction.building-hitori-media-os.about-page-update`
  - `sourceContentIdea`: `contentIdea.building-hitori-media-os`
  - `publicationStrategy`: `substackPublicationStrategy.building-hitori-media-os`
  - `actionType`: `about-page-update`
  - `targetPlatform`: `substack`
  - `actionDescription`: About Page を Hitori Media OS の開発ログとして整理する目的
  - `expectedOutcome`: 初回訪問者の理解と期待値合わせ
  - `subscriberCTA`: soft な購読誘導
  - `relatedPublishPackagePath`: `publish-packages/substack/building-hitori-media-os/`
  - `safetyNotes`: 自動投稿しない / API 不使用 / subscribers個人情報を扱わない / About 本文は人間が手動投入
  - `status`: `planned`
  - `resultNotes`: 空（実施前）

### Part 4: Proposed README

- Activation Status テーブルを更新:
  - `substackPublicationStrategy`: ACTIVATED 2026-05-14（Studio UI 確認済み）
  - `substackPostPlan`: ACTIVATED 2026-05-14（Studio UI 確認済み、`relatedNotesPlan` 復元済み）
  - `substackNotesPlan`: ACTIVATED 2026-05-14（Studio UI 確認済み）
  - `substackGrowthAction`: ACTIVATED 2026-05-14（次回 Studio UI 確認待ち）
  - 残り2本: proposed only
- Compatibility Note を補強: `substackGrowthAction` は追加 fix 不要であった旨と、残り2本を引き続き proposed-only にする理由を明記。

## 5. Important Decisions

- 6本まとめての活性化はせず、1本だけ。今回は `substackGrowthAction` のみ。
- 残り2本（SubscriberMilestone / PaidReadiness）は subscriber が動き始めるまで proposed-only。
- `safetyNotes` を test seed で埋めて、運用ルールをレコードレベルで残す方針を確立。
- `schemas/index.ts` の配列順序は依存順を維持: `substackPublicationStrategy → substackPostPlan → substackNotesPlan → substackGrowthAction`。
- test seed は Sanity に投入しない。`sanity documents create` は人間判断で行う段階に留める。

## 6. Human Review Questions

- Studio UI で「Substack成長施策」の作成フォームを開いたとき、`actionType` と `targetPlatform` の select UI、`dueDate` / `completedDate` の date picker、`safetyNotes` text field は使いやすいか。
- `actionType` の選択肢8種類は十分か（paid trial outreach / partnership outreach などを追加するかは要検討）。
- `status` の選択肢（planned / ready / done / skipped / needs-review）は適切か。
- `substackGrowthAction` のリスト表示で `subtitle` に `actionType` も出した方が見やすいか（現状は `status`）。
- 次の `substackSubscriberMilestone` を活性化するタイミングは、subscriber が10 or 50に到達したらでよいか、それより前に器だけ作っておくか。

## 7. Risks or Uncertainties

- `substackGrowthAction` の Studio UI ブラウザ確認はまだ未実施。今回は build と JSON だけで完結。
- `date` 型の dueDate / completedDate を未入力で投入できるかは Studio で挙動確認したい（schema 上は optional）。
- `safetyNotes` フィールドが「人間がレコードを作るときに必ず埋まる」運用ルールがまだ非公式。docs か README で明文化しておくと、将来追加する第三者にも伝わる。
- 8種類の actionType を全部使うわけではないが、Studio の select 表示で多すぎないかは UI 確認待ち。

## 8. Recommended Next Step

- 人間がローカルで `npm run dev` を起動し、Sanity Studio で `Substack成長施策（Substack Growth Action）` の document type が表示されることを確認する。
- 新規作成フォームで `actionType` / `targetPlatform` / `dueDate` / `completedDate` / `safetyNotes` / `status` radio などの挙動を確認。
- 必要なら `npx sanity documents create seed/substack-growth-action-building-hitori-media-os.json` でtest seedを投入し、`sourceContentIdea` / `publicationStrategy` の参照UIを確認（`seed --replace` 不使用）。
- 入力UIに違和感があれば `schemas/substackGrowthAction.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
- 安定したら、`substackSubscriberMilestone` の活性化を subscriber が実際に動き始めたタイミングで検討する別バッチへ進む。

## 9. Exact Prompt to Give Codex Next

```text
Run a manual Sanity Studio check for substackGrowthAction, then decide whether substackSubscriberMilestone should be the next activation.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/substackGrowthAction.ts
- schemas/index.ts
- seed/substack-growth-action-building-hitori-media-os.json
- schemas/proposed/substackSubscriberMilestone.ts
- schemas/proposed/README.md (Activation Status, Compatibility Note)
- docs/strategy-modules/substack-strategy-module.md

Steps:
1. Run "npm run dev" and open Sanity Studio in the browser.
2. Confirm "Substack成長施策（Substack Growth Action）" appears in the document type list.
3. Open the create form and confirm actionType / targetPlatform select, dueDate / completedDate date picker, safetyNotes text, status radio render correctly.
4. Optionally run "npx sanity documents create seed/substack-growth-action-building-hitori-media-os.json" (no --replace) and verify the reference UI works for sourceContentIdea / publicationStrategy.
5. Decide whether substackSubscriberMilestone should be activated next. The recommended trigger is when subscribers start moving (10 / 50 / 100 milestone), so it can also stay proposed until that signal exists.

Document:
- the browser-confirmed UI state for substackGrowthAction
- whether the test seed was injected and any reference validation issues
- the decision: activate substackSubscriberMilestone now, or stay
- any field changes proposed for substackGrowthAction

Update devlog and handoff.
```
