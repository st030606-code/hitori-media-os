# Handoff: Activate substackNotesPlan (3rd Substack schema) + restore relatedNotesPlan

Date: 2026-05-14

## 1. Task Goal

`substackPostPlan` の Studio UI 手動確認が問題なく通った（passed）ので、`schemas/proposed/` の残り4本のうち `substackNotesPlan` だけを追加で1本だけ活性化する。同じバッチで `substackPostPlan` の `relatedNotesPlan` フィールドを復元する。残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。`sanity.config.ts` は触らない。Sanity CLI / direct write / `seed --replace` は使わない。

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
- 既存ファイルを破壊的に上書きしていない（postPlan seed は relatedNotesPlan の追加のみ、他フィールド未変更）。
- 他の proposed Substack schema（GrowthAction / SubscriberMilestone / PaidReadiness）は活性化していない。

## 3. Changed Files

### Added

- `schemas/substackNotesPlan.ts`（active schema）
- `seed/substack-notes-plan-building-hitori-media-os.json`（test seed、ローカル保存のみ）
- `docs/devlog/0072-substack-post-plan-studio-check.md`（Part 1: Studio 確認結果）
- `docs/devlog/0073-activate-substack-notes-plan.md`（Part 2 以降: 活性化と復元）
- `docs/handoff/0084-substack-post-plan-studio-check.md`
- `docs/handoff/0085-activate-substack-notes-plan.md`

### Modified

- `schemas/index.ts`（`substackNotesPlan` の import 追加、`schemaTypes` 配列末尾に1件追加）
- `schemas/substackPostPlan.ts`（`relatedNotesPlan` フィールドを復元）
- `schemas/proposed/README.md`（Activation Status 更新、Compatibility Note を「復元済み」に更新）
- `seed/substack-post-plan-building-hitori-media-os.json`（`relatedNotesPlan` reference を追加。他フィールド変更なし）
- `docs/handoff/latest.md`

### Deleted

- `schemas/proposed/substackNotesPlan.ts`（active schemas/ へ移動済み）

### Confirmed unchanged

- `sanity.config.ts`（`git diff` 空）
- 既存スキーマ全般（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy）
- 残り3本の proposed スキーマファイル（substackGrowthAction.ts / substackSubscriberMilestone.ts / substackPaidReadiness.ts）

## 4. Summary of Changes

### Part 1: substackPostPlan Studio Check (passed)

- 人間が `npm run dev` を起動して Sanity Studio をブラウザで確認。
- 「Substack Post計画（Substack Post Plan）」が document type 一覧に表示。
- `titleOptions` / `emailSubjectOptions` / `mainSections` の object array（heading + body、`_key` 自動付与） / `humanReviewChecklist` の string array / `status` radio が想定通り。
- reference UI（`sourceContentIdea` / `publicationStrategy`）が解決。
- `publishedUrl` は `type: url` のままで運用可能。
- ブロッキングなフィールド問題なし。active 維持の判断。
- `docs/devlog/0072-substack-post-plan-studio-check.md` と `docs/handoff/0084-substack-post-plan-studio-check.md` に記録。

### Part 2: substackNotesPlan Activation

- `schemas/proposed/substackNotesPlan.ts` を `schemas/substackNotesPlan.ts` へ移動。`PROPOSED SCHEMA` コメントブロックを削除。
- 参照先（contentIdea / substackPostPlan / substackPublicationStrategy）はすべて active なので追加の互換性 fix は不要。
- `schemas/index.ts` に1件追加（`substackPostPlan` の後ろに `substackNotesPlan` を置く）。
- `sanity.config.ts` は未変更。

### Part 3: Restore `relatedNotesPlan` on substackPostPlan

- `schemas/substackPostPlan.ts` の `subscriberCTA` と `repurposeNotes` の間に `relatedNotesPlan` フィールドを復元。
- 型: `reference` to `[{type: 'substackNotesPlan'}]`、optional、description「このPostに紐づくSubstack Notes計画。」。
- 一時削除を示す NOTE コメントは取り除いた。

### Part 4: Test seed

- `seed/substack-notes-plan-building-hitori-media-os.json` を新規作成。ローカル保存のみ。
- 主要フィールド:
  - `_id`: `substackNotesPlan.building-hitori-media-os.first-post-notes`
  - `sourceContentIdea`: `contentIdea.building-hitori-media-os`
  - `relatedPostPlan`: `substackPostPlan.building-hitori-media-os.first-post`
  - `publicationStrategy`: `substackPublicationStrategy.building-hitori-media-os`
  - `notesPurpose`: `interaction`
  - `prePostNotes` 3本（_key付き object: question / build-log / lesson-learned）
  - `postLaunchNotes` 2本（_key付き object: post-launch / soft-cta）
  - `conversationPrompts` 2本、`ctaVariants` 3案、`humanReviewChecklist` 6項目
  - `status: ready-for-human-edit`
  - `reviewNotes` に「Initial test seed」と明記
- `seed/substack-post-plan-building-hitori-media-os.json` に `relatedNotesPlan` reference を追加。他フィールド未変更。

### Part 5: Proposed README

- Activation Status テーブルを更新:
  - `substackPublicationStrategy`: ACTIVATED 2026-05-14（Studio UI 確認済み）
  - `substackPostPlan`: ACTIVATED 2026-05-14（Studio UI 確認済み、`relatedNotesPlan` 復元済み）
  - `substackNotesPlan`: ACTIVATED 2026-05-14（次回 Studio UI 確認待ち）
  - 残り3本: proposed only
- Compatibility Note を更新: `relatedNotesPlan` 復元タイミングを明記し、PostPlan ↔ NotesPlan の往復参照が成立したことを記録。

## 5. Important Decisions

- 6本まとめての活性化はせず、1本だけ。今回は `substackNotesPlan` のみ。
- `relatedNotesPlan` を復元したのは、PostPlan ↔ NotesPlan の往復参照を `docs/strategy-modules/substack-strategy-module.md` の設計に合わせるため。
- `schemas/index.ts` の配列順序は依存順を維持: `substackPublicationStrategy → substackPostPlan → substackNotesPlan`。
- test seed は Sanity に投入しない。`sanity documents create` は人間判断で行う段階に留める。

## 6. Human Review Questions

- Studio UI で「Substack Notes計画」の作成フォームを開いたとき、`prePostNotes` / `postLaunchNotes` の object array（noteType radio + body text）UI は使いやすいか。
- `notesPurpose` の選択肢（discovery / interaction / pre-post / post-launch / question / build-log / lesson-learned / soft-cta）は十分か。
- `substackPostPlan` の編集画面で `relatedNotesPlan` フィールドが想定通り表示されるか。
- 次に `substackGrowthAction` を活性化するタイミングは、X / Substack を実際に公開して subscribers が動き始めてからでよいか。
- 残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）の活性化を、それぞれどのタイミングで進めるか（運用フェーズに合わせる前提）。

## 7. Risks or Uncertainties

- `substackNotesPlan` の Studio UI ブラウザ確認はまだ未実施。今回は build と JSON だけで完結。
- `prePostNotes` / `postLaunchNotes` の object array に `_key` を付けたが、Sanity Studio で配列要素を編集するときに警告や挙動の差異が出ないか確認したい。
- `relatedNotesPlan` を復元したことで、`substackPostPlan` の test seed を編集した。`relatedNotesPlan` reference を持つ状態で Studio に投入したとき、参照先（`substackNotesPlan.building-hitori-media-os.first-post-notes`）がまだ Sanity dataset に存在しないと validation 警告が出る可能性。先に NotesPlan、続いて PostPlan の順で投入するのが安全。
- 将来 `substackGrowthAction` を活性化する場合、`relatedContentIdea` を `contentIdea` への reference として持つので、追加の互換性 fix は不要。`SubscriberMilestone` の `sourceCampaign` も同様。`PaidReadiness` の `sourcePublicationStrategy` も active なので問題なし。

## 8. Recommended Next Step

- 人間がローカルで `npm run dev` を起動し、Sanity Studio で `Substack Notes計画（Substack Notes Plan）` の document type が表示されることを確認する。
- 新規作成フォームで `prePostNotes` / `postLaunchNotes` の object array UI、`conversationPrompts` / `ctaVariants` / `humanReviewChecklist` の string array UI、`status` radio の挙動を確認。
- `substackPostPlan` の編集画面で `relatedNotesPlan` フィールドが想定通り表示されるかも確認。
- 必要なら以下の順で test seed を投入: `substack-notes-plan-building-hitori-media-os.json` を先に、続いて `substack-post-plan-building-hitori-media-os.json` を投入（reference 整合のため）。`seed --replace` は使わない。
- 入力UIに違和感があれば各 schema を直接修正、または `schemas/index.ts` から一旦外して `schemas/proposed/` に戻す。
- 安定したら、`substackGrowthAction` を同じ手順で1本だけ活性化する別バッチへ進む。

## 9. Exact Prompt to Give Codex Next

```text
Run a manual Sanity Studio check for substackNotesPlan and the restored relatedNotesPlan on substackPostPlan, then decide whether substackGrowthAction should be the next activation.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/substackNotesPlan.ts
- schemas/substackPostPlan.ts (relatedNotesPlan restored)
- schemas/index.ts
- seed/substack-notes-plan-building-hitori-media-os.json
- seed/substack-post-plan-building-hitori-media-os.json (relatedNotesPlan added)
- schemas/proposed/substackGrowthAction.ts
- schemas/proposed/README.md (Activation Status, Compatibility Note)
- docs/strategy-modules/substack-strategy-module.md

Steps:
1. Run "npm run dev" and open Sanity Studio in the browser.
2. Confirm "Substack Notes計画（Substack Notes Plan）" appears in the document type list.
3. Open the create form and confirm prePostNotes / postLaunchNotes object array, conversationPrompts / ctaVariants / humanReviewChecklist string array, status radio render correctly.
4. Open the substackPostPlan create / edit form and confirm relatedNotesPlan reference field renders correctly.
5. Optionally inject test seeds in order: substackNotesPlan first, then substackPostPlan (to satisfy relatedNotesPlan reference).
6. Decide whether substackGrowthAction should be activated next, or whether NotesPlan / PostPlan need field tweaks first.

Document:
- the browser-confirmed UI state for substackNotesPlan and substackPostPlan (with relatedNotesPlan)
- whether the test seeds were injected and any reference validation issues
- the decision: proceed to substackGrowthAction activation, or stay
- any field changes proposed

Update devlog and handoff.
```
