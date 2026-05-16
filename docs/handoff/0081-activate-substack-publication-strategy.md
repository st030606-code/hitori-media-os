# Handoff: Activate substackPublicationStrategy (1st Substack schema)

Date: 2026-05-14

## 1. Task Goal

`schemas/proposed/` の Substack 戦略系 6 本のうち、`substackPublicationStrategy` だけを Sanity Studio に活性化する。残り5本は proposed-only のまま据え置く。`sanity.config.ts` は触らない。Sanity CLI / direct write / `seed --replace` は使わない。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- Sanity CLI create/update commandsは実行していない（test seedはローカル保存のみ）。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。
- 他の proposed Substack schema（PostPlan / NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は活性化していない。

## 3. Changed Files

### Added

- `schemas/substackPublicationStrategy.ts`（active schema）
- `seed/substack-publication-strategy-building-hitori-media-os.json`（test seed、ローカル保存のみ）
- `docs/devlog/0069-activate-substack-publication-strategy.md`
- `docs/handoff/0081-activate-substack-publication-strategy.md`

### Modified

- `schemas/index.ts`（import + schemaTypes 配列に1件追加）
- `schemas/proposed/README.md`（Activation Status テーブル追加）
- `docs/handoff/latest.md`

### Deleted

- `schemas/proposed/substackPublicationStrategy.ts`（active schemas/ へ移動済み）

### Confirmed unchanged

- `sanity.config.ts`（`git diff` 空）
- 既存スキーマ（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool）
- 他の proposed スキーマファイル5本

## 4. Summary of Changes

### Activation

- `substackPublicationStrategy` を proposed → active へ移動。`PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントブロックを削除。フィールド構造は完全に同一。
- `schemas/index.ts` に `import {substackPublicationStrategy} from './substackPublicationStrategy'` 追加、`schemaTypes` の末尾に `substackPublicationStrategy` を1件追加。
- `sanity.config.ts` は未変更。`schemaTypes` を `schemas/index.ts` から取り込む構造のままで反映される。

### Test seed

- ローカル保存のみ。Studio へは未投入（人間が `npx sanity documents create` を判断したときに初めて投入する想定）。
- 主要フィールド:
  - `_id`: `substackPublicationStrategy.building-hitori-media-os`
  - `sourceContentIdea`: `contentIdea.building-hitori-media-os`
  - `relatedContentIdeas`: `[contentIdea.ai-blog-db]`
  - `targetReader`, `positioningStatement`, `coreTopics`（Hitori Media OS / AI-assisted media workflow / Substack reader-list growth）
  - `publicationPromise`, `freeContentRole`, `paidContentRole`, `notesRole`, `postRole`, `subscriberCTA`
  - `voiceContentFormat`（voice / content / format）
  - `aboutPageDraft` / `welcomeEmailDraft` は TODO（人間が後で埋める）
  - `status`: `draft`
  - `reviewNotes`: 「Initial test seed. 他5本は proposed のまま」と明記

### Proposed README

- Activation Status テーブルを追加し、`substackPublicationStrategy` が activated、他5本が proposed-only と明示。
- test seed パスを記載。
- 次の活性化は別バッチで判断する旨を追記。

## 5. Important Decisions

- 6本まとめての活性化はしない。1本だけ。
- 最初に活性化する候補として `substackPublicationStrategy` を選んだ。他5本がこれを `publicationStrategy` 参照で持つため、土台を先に置くのが自然。
- `sanity.config.ts` は触らない。`schemas/index.ts` 経由で取り込まれているので、`schemaTypes` の更新だけで足りる。
- test seedは Sanity に投入しない。`sanity documents create` は人間判断で行う段階に留める。
- 元の `schemas/proposed/substackPublicationStrategy.ts` は削除（move）。コピーで残すと、ファイル先頭の `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` コメントが嘘になるため。

## 6. Human Review Questions

- Studio UI 上で `substackPublicationStrategy` の document type が想定通り表示されるか（左ナビ表記「Substack発行戦略（Substack Publication Strategy）」、各フィールドのラベル、radio status）。
- フィールドの過不足はないか（特に `aboutPageDraft` / `welcomeEmailDraft` を text 6 rows としているが、portable text にしたいかは要検討）。
- `coreTopics` の min 1 / max 3 validation は厳しすぎないか。
- test seed を実際に Sanity Studio へ投入してみるタイミング（X / Threads / note / Substack 公開後に合わせるか、それより前に投入するか）。
- 次に活性化する候補（推奨は `substackPostPlan`）に進む基準を、どんな運用フィードバックが揃ったら満たすとするか。

## 7. Risks or Uncertainties

- まだ `npm run dev` でブラウザ確認していない。Studio UI 上で実際にフィールドが想定通りに見えるか、人間が手動でブラウザを開いて確認する必要がある。
- test seedは投入していないため、参照UI（`sourceContentIdea` / `relatedContentIdeas`）の動作はまだ検証できていない。投入前に `contentIdea.building-hitori-media-os` / `contentIdea.ai-blog-db` がSanity datasetに存在しているか人間が確認する必要がある（存在していなければreference検証エラーが出る可能性）。
- 他5本の proposed スキーマファイルは依然として `substackPublicationStrategy` への `to: [{type: 'substackPublicationStrategy'}]` reference を持つが、`schemas/index.ts` から import されていないので Studio registry には影響しない。万一 import 順を誤って追加した場合のみ問題が出る。
- 将来、proposed フォルダから複数本を同時に活性化したくなった場合、`schemas/index.ts` への追加順を `publicationStrategy` の後にする必要がある（参照先が先にロードされている必要があるため）。

## 8. Recommended Next Step

- 人間がローカルで `npm run dev` を起動し、Sanity Studio の document type 一覧に `Substack発行戦略（Substack Publication Strategy）` が表示されることを確認する。
- 新規作成画面で各フィールドの label / type / validation が想定通りであることを確認する。
- 必要であれば `npx sanity documents create seed/substack-publication-strategy-building-hitori-media-os.json` でtest seedを投入し、参照UI（contentIdea referenceの2件）の動作を確認する。`seed --replace` は使わない。
- 入力UIに違和感があれば `schemas/substackPublicationStrategy.ts` を直接修正するか、一旦 `schemas/index.ts` から外して `schemas/proposed/` に戻す（小さな revert で済む）。
- 安定したら、`substackPostPlan` を同じ手順で1本だけ活性化する別バッチへ進む。

## 9. Exact Prompt to Give Codex Next

```text
Run a manual Sanity Studio check for substackPublicationStrategy, and decide whether substackPostPlan should be the next activation.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/substackPublicationStrategy.ts
- schemas/index.ts
- seed/substack-publication-strategy-building-hitori-media-os.json
- schemas/proposed/substackPostPlan.ts
- schemas/proposed/README.md
- docs/strategy-modules/substack-strategy-module.md

Steps:
1. Run "npm run dev" and open Sanity Studio in the browser.
2. Confirm "Substack発行戦略（Substack Publication Strategy）" appears in the document type list.
3. Open the create form and confirm fields render correctly (especially coreTopics min/max, status radio).
4. Optionally run "npx sanity documents create seed/substack-publication-strategy-building-hitori-media-os.json" (no --replace) and verify reference UI works for sourceContentIdea / relatedContentIdeas.
5. Decide whether substackPostPlan should be activated next, or whether substackPublicationStrategy needs field tweaks first.

Document:
- the browser-confirmed UI state
- whether the test seed was injected and any reference validation issues
- the decision: proceed to substackPostPlan activation, or stay on substackPublicationStrategy
- any field changes proposed for substackPublicationStrategy

Update devlog and handoff.
```
