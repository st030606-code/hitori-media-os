# Phase 2C-1B Studio URL fix

日付: 2026-05-22

## 背景

boss が Phase 2C-1B createContentIdea flow を smoke test。

確認済み:

- `/ideas` は動作。
- Content Idea promote panel は動作。
- Schema checklist / field mapping / Preview create は概ね OK。
- Sanity 側に作成・previewされる `contentIdea` field は許容範囲。

残 issue:

- 作成済み / 既存 `contentIdea` を開く Studio URL が generic route になっていた。
- wrong: `http://localhost:3333/structure/contentIdea.obsidian-ai-sanity`
- correct: `http://localhost:3333/structure/content-ideas-hub;content-ideas-all;contentIdea.obsidian-ai-sanity`

## 変更

- `dashboard/src/lib/sanity.ts`
  - 汎用 `studioDocumentUrl(documentId)` は維持。
  - contentIdea 専用 `studioContentIdeasListUrl()` を追加。
  - contentIdea 専用 `studioContentIdeaUrl(documentId)` を追加。
- `dashboard/src/lib/actions/createContentIdeaFromResult.ts`
  - preview planned URL / duplicate existing URL / created URL を `studioContentIdeaUrl()` に変更。
  - create logic / duplicate blocking / deterministic `_id` は変更なし。
- `dashboard/src/lib/actions/prepareContentIdeaFromResult.ts`
  - Content Ideas list link を `/structure/content-ideas-hub;content-ideas-all` に変更。
  - Studio root linkは維持。
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
  - Preview create panel に compact schema summary を追加。
  - 表示項目: title, status, summary readiness, coreThesis readiness, claims count, platformAngles count, audience count, tone.voice, required readiness。
  - 長文bodyは表示しない。

## 状態

Studio URL fix implemented. Phase 2C-1B smoke PASS は未記録。boss re-smoke 待ち。

## 次

boss が `/ideas` で preview/create/duplicate link を再確認し、Studio document URL が正しい Structure path に飛ぶことを確認する。
