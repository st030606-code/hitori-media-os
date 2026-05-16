# Proposed Schemas

Date: 2026-05-14
Last activation: 2026-05-14（`substackGrowthAction` を追加活性化）

このフォルダにあるTypeScriptファイルは、**提案段階のSanityスキーマ**です。

## Activation Status

| Schema | Status | Path |
| --- | --- | --- |
| `substackPublicationStrategy` | **ACTIVATED 2026-05-14**（Studio UI 確認済み） | `schemas/substackPublicationStrategy.ts`（`schemas/index.ts` に登録済み） |
| `substackPostPlan` | **ACTIVATED 2026-05-14**（Studio UI 確認済み、`relatedNotesPlan` 復元済み） | `schemas/substackPostPlan.ts`（`schemas/index.ts` に登録済み） |
| `substackNotesPlan` | **ACTIVATED 2026-05-14**（Studio UI 確認済み） | `schemas/substackNotesPlan.ts`（`schemas/index.ts` に登録済み） |
| `substackGrowthAction` | **ACTIVATED 2026-05-14**（次回 Studio UI 確認待ち） | `schemas/substackGrowthAction.ts`（`schemas/index.ts` に登録済み） |
| `substackSubscriberMilestone` | proposed only | `schemas/proposed/substackSubscriberMilestone.ts` |
| `substackPaidReadiness` | proposed only | `schemas/proposed/substackPaidReadiness.ts` |

これまでの活性化に使ったtest seed:

- `seed/substack-publication-strategy-building-hitori-media-os.json`
- `seed/substack-post-plan-building-hitori-media-os.json`（`relatedNotesPlan` 参照を追加済み）
- `seed/substack-notes-plan-building-hitori-media-os.json`
- `seed/substack-growth-action-building-hitori-media-os.json`

これらのseedはローカル保存のみで、Sanity CLI / `seed --replace` / direct write は使っていません。

## Compatibility Note (substackPostPlan)

`substackPostPlan` を最初に active 化した際、`relatedNotesPlan` フィールド（`substackNotesPlan` への reference）は **一時的に削除** していました。これは `substackNotesPlan` が proposed-only のまま `schemas/index.ts` に登録されておらず、未登録 type への reference が Studio 起動時のエラー原因になる可能性があったためです。

2026-05-14 の `substackNotesPlan` 活性化バッチで、`schemas/substackPostPlan.ts` に `relatedNotesPlan` フィールドを **復元** しました。`substackPostPlan` ↔ `substackNotesPlan` の往復参照が成立し、Studio UI でも確認済みです。

`substackGrowthAction` は `contentIdea` / `substackPublicationStrategy`（いずれも active）への reference のみを持つため、追加の互換性 fix は不要でした。

残り2本（`substackSubscriberMilestone` / `substackPaidReadiness`）は引き続き proposed-only。subscriber が実際に動き始めるか、paid化を真剣に検討するタイミングまで活性化を保留します。

## Important

- このフォルダに残っている5本は Sanity Studio に読み込まれていません。
- `schemas/index.ts` から **import / export していません**。
- `sanity.config.ts` の `schemaTypes` にも追加していません。
- `npm run build` の対象には入りますが、Studio UI には登場しません（型としてはコンパイルされますが、registry にいません）。
- 内容はあくまでも「次に活性化する候補のスケッチ」です。
- 活性化（activation）は人間レビューを通したあとに、別バッチで段階的に行います。

このフォルダのファイルを編集しても、運用中の Studio には影響しません。安全に提案を磨くための場所です。

## Why Substack strategy needs its own layer

Hitori Media OS v0.2 の Strategy Module ドキュメント（`docs/strategy-modules/substack-strategy-module.md`）と、抽象化メモ（`docs/strategy-sources/substack-textbook-notes.md`）に基づき、Substackを「publication / email / Notes / archive / subscriber asset」の5役で扱う方針を取っています。

ところが現在の Sanity スキーマでは、Substackは `platformOutput` のひとつとして格納される位置にあり、`contentIdea` の中の `platformAngles` で切り口だけが分けられている状態です。これだとSubstack固有の戦略レイヤー（publication設計、Post計画、Notes計画、growth action、subscriber milestone、paid readiness）が `contentIdea` に染み出してしまいます。

そこで、Substack専用の document type をいくつか独立させ、`contentIdea` を汚さずに Substack 戦略を扱えるようにする、というのがこのフォルダの目的です。

## Proposed schemas

各ファイルの目的と他スキーマとの関係。

### substackPublicationStrategy.ts

- Publication全体のpositioning / target reader / core topics / Voice・Content・Format / Notes・Postの役割 / free・paidの役割 / About Page / Welcome Email下書き / subscriber CTAを束ねる。
- 1 publication = 1 document を想定。
- `contentIdea` を `sourceContentIdea` / `relatedContentIdeas` で参照。
- 状態: draft / strategy-ready / in-use / needs-review / archived

### substackPostPlan.ts

- 1本のSubstack Postを計画するレコード。
- `sourceContentIdea` と `substackPublicationStrategy` を参照。
- titleOptions、emailSubjectOptions、previewText、openingAngle、mainSections、readerQuestion、subscriberCTA、relatedNotesPlan、publishPackagePath、humanReviewChecklist を持つ。
- 公開後の publishedUrl は手動で書き戻す。
- 状態: idea / outline-ready / draft-ready / ready-for-human-edit / published / archived

### substackNotesPlan.ts

- Substack Notes を Post 単位で計画する。
- `substackPostPlan` を `relatedPostPlan` で参照。
- prePostNotes / postLaunchNotes / conversationPrompts / ctaVariants を独立して持つ。
- 状態: planned / drafted / ready-for-human-edit / partially-published / completed / archived

### substackGrowthAction.ts

- subscriber成長施策の手動ログ。
- actionType: profile-update / about-page-update / welcome-email-update / notes-engagement / cross-post-promotion / reply-campaign / launch-supporter-outreach / post-followup
- 期待する成果と結果メモを残す。
- 自動投稿しない、API連携しない方針を `safetyNotes` で明記。
- 状態: planned / ready / done / skipped / needs-review

### substackSubscriberMilestone.ts

- subscriber 数の節目（10 / 50 / 100 / 500 / 1000 など）の記録。
- 数値は **手動で記録**（Substack APIは叩かない）。
- subscriberSources を Source × 推定数 × メモ の構造で持つ。
- 状態: planned / reached / missed / archived

### substackPaidReadiness.ts

- paid contentに進む準備が整っているかを段階的に判断するレコード。
- trustSignals、audienceQuestions、repeatedDemandSignals、candidatePaidOffer、freePaidBoundary、readinessLevel、readinessScore、reasonsToWait、nextValidationActions を持つ。
- 状態: not-ready / observing / validation-needed / ready-to-test / paused

## Mapping To Current Hitori Media OS

- `contentIdea`: 既存。Substack戦略レイヤーから参照される側。中身には Substack 用フィールドを増やさない。
- `platformOutput`: 既存。Substack Postの「下書きそのもの」として引き続き使う想定。`substackPostPlan` はそれより上位の計画レイヤー。
- `prompts/substack-*.md`: 既存。Substack戦略レイヤーのフィールドを満たすプロンプトとして対応関係を整理しておく。
- `publish-packages/substack/<slug>/`: 既存。`substackPostPlan` の `publishPackagePath` フィールドが、このフォルダパスを指す想定。
- 既存docs: `docs/35-hitori-media-os-v0-2-architecture.md`、`docs/36-substack-strategy-module.md`、`docs/37-substack-schema-extension-plan.md`、`docs/strategy-modules/substack-strategy-module.md`。

## Activation Checklist

提案を活性化するときは、必ず次の順番で進めます。**1ファイルずつ**。

1. 人間が提案スキーマのフィールドをレビュー（このフォルダのファイルを読む）。
2. MVP として活性化する schema 個数を決める（推奨は1つから）。
3. 最初に活性化する候補は `substackPublicationStrategy.ts`。
   - 他の5スキーマは、`publicationStrategy` への参照を持つので、最初にこれを足すと依存関係が綺麗。
4. 活性化対象のファイルを `schemas/index.ts` に `import` と `schemaTypes` の配列追加で組み込む。
5. `npm run build` を実行し、Studio buildが成功することを確認。
6. ローカルで `npm run dev` を起動し、新しい document type の入力UIをStudio画面で確認。
7. テスト用 seed JSON を1件だけ作成（`sanity documents create <file>`、`seed --replace` は使わない）。
8. Studio で実データを保存し、Validation エラーや使い勝手を確認。
9. 不満があれば提案ファイルへ戻して修正し、`schemas/index.ts` への登録を一旦外す。
10. 落ち着いて使えるようになったら、次の schema を1つだけ追加。

### Recommended activation order

1. `substackPublicationStrategy`（土台）
2. `substackPostPlan`（次の主力）
3. `substackNotesPlan`（Postに連動して必要になる）
4. `substackGrowthAction`（手動運用が増えてきたら）
5. `substackSubscriberMilestone`（10〜50 subscribersあたりで）
6. `substackPaidReadiness`（paidを検討したくなる前段で）

すべて活性化しないままでも構いません。Hitori Media OS は手動運用 / 人間レビューを残す前提なので、足すかどうかは「同じことを何度も手書きしている」と感じてからで十分です。

## Safety Notes

- これらの提案スキーマは、Sanity への直接書き込みを目的としません。
- 活性化後でも、Sanity Studio で人間が手動入力する想定。スクリプトでの一括投入はしません。
- API連携、自動投稿、subscriber個人情報の取り扱いは引き続き禁止です。
- 有料PDF本文の引用、その他著作権で保護された素材のコピーは含まれていません（このフォルダ全ファイルで確認済）。
