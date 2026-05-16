# Handoff: Activate substackPostPlan (2nd Substack schema)

Date: 2026-05-14

## 1. Task Goal

`substackPublicationStrategy` の Studio UI 手動確認が問題なく通った（passed）ので、`schemas/proposed/` の残り5本のうち `substackPostPlan` だけを追加で1本だけ活性化する。残り4本（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。`sanity.config.ts` は触らない。Sanity CLI / direct write / `seed --replace` は使わない。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない（コード側から）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。
- 他の proposed Substack schema（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は活性化していない。

## 3. Changed Files

### Added

- `schemas/substackPostPlan.ts`（active schema、`relatedNotesPlan` は一時削除済み）
- `seed/substack-post-plan-building-hitori-media-os.json`（test seed、ローカル保存のみ）
- `docs/devlog/0070-substack-publication-strategy-studio-check.md`（Part 1 の Studio 確認結果記録）
- `docs/devlog/0071-activate-substack-post-plan.md`（Part 2 以降の活性化記録）
- `docs/handoff/0082-substack-publication-strategy-studio-check.md`
- `docs/handoff/0083-activate-substack-post-plan.md`

### Modified

- `schemas/index.ts`（`substackPostPlan` の import 追加、`schemaTypes` 配列末尾に1件追加）
- `schemas/proposed/README.md`（Activation Status 更新、Compatibility Note 追加）
- `docs/handoff/latest.md`

### Deleted

- `schemas/proposed/substackPostPlan.ts`（active schemas/ へ移動済み）

### Confirmed unchanged

- `sanity.config.ts`（`git diff` 空）
- 既存スキーマ全般（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy）
- 残り4本の proposed スキーマファイル（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）

## 4. Summary of Changes

### Part 1: substackPublicationStrategy Studio Check (passed)

- 人間が `npm run dev` を起動して Sanity Studio をブラウザで確認。
- 「Substack発行戦略（Substack Publication Strategy）」が document type 一覧に表示。
- 新規作成フォームで全フィールド（title / slug / sourceContentIdea / relatedContentIdeas / targetReader / positioningStatement / coreTopics min 1 / max 3 / publicationPromise / freeContentRole / paidContentRole / notesRole / postRole / subscriberCTA / aboutPageDraft / welcomeEmailDraft / voiceContentFormat / status radio / reviewNotes）が想定通り。
- test seed を投入して reference UI（contentIdea references）が動作することを確認。
- ブロッキングなフィールド問題なし。active 維持の判断。
- `docs/devlog/0070-substack-publication-strategy-studio-check.md` と `docs/handoff/0082-substack-publication-strategy-studio-check.md` に記録。

### Part 2: substackPostPlan Activation

- `schemas/proposed/substackPostPlan.ts` を `schemas/substackPostPlan.ts` へ移動。`PROPOSED SCHEMA` コメントブロックを削除。
- 小さな互換性 fix: `relatedNotesPlan`（reference → `substackNotesPlan`）フィールドを一時的に削除。`substackNotesPlan` が proposed-only のままだと未登録 type への reference で Studio が起動時にエラーを出す可能性があるため。コードと README にNOTEを残し、`substackNotesPlan` 活性化時に再追加する想定。
- `schemas/index.ts` に1件追加（`substackPublicationStrategy` の後に `substackPostPlan` を置き、reference 先 → reference 元の順序を維持）。
- `sanity.config.ts` は未変更。

### Part 3: Test seed

- `seed/substack-post-plan-building-hitori-media-os.json` を新規作成。ローカル保存のみ。Studio へは未投入。
- 主要フィールド:
  - `_id`: `substackPostPlan.building-hitori-media-os.first-post`
  - `sourceContentIdea`: `contentIdea.building-hitori-media-os`
  - `publicationStrategy`: `substackPublicationStrategy.building-hitori-media-os`
  - `campaignSlug`: `building-hitori-media-os`
  - `titleOptions` 3案 / `emailSubjectOptions` 3案 / `previewText` / `openingAngle`
  - `mainSections` 3 ブロック（_key 付き object）
  - `readerQuestion`, `subscriberCTA`, `repurposeNotes`, `publishPackagePath`, `humanReviewChecklist`（6項目）
  - `status`: `ready-for-human-edit`
  - `reviewNotes` に「Initial test seed」と明記、`publishedUrl` は空

### Part 4: Proposed README

- Activation Status テーブルを更新:
  - `substackPublicationStrategy`: ACTIVATED 2026-05-14（Studio UI 確認済み）
  - `substackPostPlan`: ACTIVATED 2026-05-14（次回 Studio UI 確認待ち）
  - 残り4本: proposed only
- Compatibility Note 節を追加: `relatedNotesPlan` の一時削除と、`substackNotesPlan` 活性化時の再追加方針を明記。
- これまでの test seed パスを2件記載。

## 5. Important Decisions

- 6本まとめての活性化はせず、1本だけ。今回は `substackPostPlan` のみ。
- `relatedNotesPlan` を一時削除（small fix）。Activation Checklist 上の "TypeScript/build requires small fixes" の範囲内として判断。`substackNotesPlan` 活性化バッチで戻す。
- `schemas/index.ts` の配列順序は reference 先 → reference 元（`substackPublicationStrategy` → `substackPostPlan`）。これにより将来 NotesPlan を活性化するときも、`substackPostPlan` の後ろに置くと整理しやすい。
- test seed は Sanity に投入しない。`sanity documents create` は人間判断で行う段階に留める。

## 6. Human Review Questions

- Studio UI で「Substack Post計画」の作成フォームを開いたとき、`mainSections` の object array UI、`titleOptions` / `emailSubjectOptions` / `humanReviewChecklist` の string array UI は使いやすいか。
- `status` の選択肢（idea / outline-ready / draft-ready / ready-for-human-edit / published / archived）は適切か。
- `publishedUrl` を `type: url` のままにするか、`string` に緩めるか（プラットフォーム発行直後にコピペしやすさを優先する場合）。
- 次に `substackNotesPlan` を活性化するタイミングは、Substack 1本目を実際に公開してフィードバックを集めた後でよいか。
- `relatedNotesPlan` フィールドを `substackPostPlan` に戻すときに、`substackNotesPlan` の活性化と同じバッチでまとめてよいか。

## 7. Risks or Uncertainties

- `substackPostPlan` の Studio UI ブラウザ確認はまだ未実施。今回は build と JSON だけで完結。人間が `npm run dev` で確認するまで、UI 上の細かい違和感には気付けない。
- test seed の `mainSections` には `_key` を付けたが、Sanity Studio で配列要素を編集するときに `_key` 重複の警告が出ないか念のため確認したい。
- `relatedNotesPlan` を削除したため、active 版は元の `schemas/proposed/substackPostPlan.ts` から1フィールドだけ異なる状態。`substackNotesPlan` 活性化バッチで戻すときの差分管理は、コード側のNOTEコメントと README の Compatibility Note で追跡できる。
- 将来 `schemaTypes` の並び順を機械的にソートしたくなった場合、現在の「reference 先を先に置く」原則が崩れるので、ソート時に依存順制約をどう扱うか後で考える必要あり。

## 8. Recommended Next Step

- 人間がローカルで `npm run dev` を起動し、Sanity Studio で `Substack Post計画（Substack Post Plan）` の document type が表示されることを確認する。
- 新規作成フォームで `titleOptions` / `emailSubjectOptions` / `mainSections` / `humanReviewChecklist` / `status` radio などのUI挙動を確認。
- 必要なら `npx sanity documents create seed/substack-post-plan-building-hitori-media-os.json` でtest seedを投入し、`sourceContentIdea` / `publicationStrategy` の参照UIを確認（`seed --replace` は使わない）。
- 入力UIに違和感があれば `schemas/substackPostPlan.ts` を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
- 安定したら、`substackNotesPlan` を同じ手順で1本だけ活性化する別バッチへ進む。その際 `substackPostPlan` の `relatedNotesPlan` フィールドを再追加する。

## 9. Exact Prompt to Give Codex Next

```text
Run a manual Sanity Studio check for substackPostPlan, then decide whether substackNotesPlan should be the next activation.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/substackPostPlan.ts
- schemas/index.ts
- seed/substack-post-plan-building-hitori-media-os.json
- schemas/proposed/substackNotesPlan.ts
- schemas/proposed/README.md (Activation Status, Compatibility Note)
- docs/strategy-modules/substack-strategy-module.md

Steps:
1. Run "npm run dev" and open Sanity Studio in the browser.
2. Confirm "Substack Post計画（Substack Post Plan）" appears in the document type list.
3. Open the create form and confirm titleOptions / emailSubjectOptions / mainSections object array / humanReviewChecklist string array / status radio render correctly.
4. Optionally run "npx sanity documents create seed/substack-post-plan-building-hitori-media-os.json" (no --replace) and verify the reference UI works for sourceContentIdea / publicationStrategy.
5. Decide whether substackNotesPlan should be activated next. If yes, the activation batch must:
   - Move schemas/proposed/substackNotesPlan.ts -> schemas/substackNotesPlan.ts
   - Restore the `relatedNotesPlan` field on schemas/substackPostPlan.ts
   - Add only substackNotesPlan and the restored relatedNotesPlan field
6. Do not activate substackGrowthAction, substackSubscriberMilestone, or substackPaidReadiness in the same batch.

Document:
- the browser-confirmed UI state for substackPostPlan
- whether the test seed was injected and any reference validation issues
- the decision: proceed to substackNotesPlan activation, or stay on substackPostPlan
- any field changes proposed for substackPostPlan

Update devlog and handoff.
```
