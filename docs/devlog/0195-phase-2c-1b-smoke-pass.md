# Phase 2C-1B createContentIdea smoke PASS

日付: 2026-05-22

## 結果

Phase 2C-1B `createContentIdea` flow は boss re-smoke で PASS。

## 確認されたこと

- `/ideas` が開く。
- 既存 job `obsidian-ai-sanity-3 / 20260521-124748` が表示される。
- Content Idea promote panel が開く。
- Schema checklist が表示される。
- Preview create が動作する。
- Compact create preview summary が表示される。
- Content Ideas list link が `/structure/content-ideas-hub;content-ideas-all` を使う。
- Created / duplicate doc link が `/structure/content-ideas-hub;content-ideas-all;<documentId>` を使う。
- Create Content Idea が動作する、または既存docがある場合は `duplicate-found` として正しく止まる。
- Sanity Studio で `contentIdea` document が確認できる。
- 必須fieldが保存済み / 利用可能。
- duplicate create は block される。
- Dashboard は `campaignPlan` を作成しない。
- Dashboard は `platformOutput` / `publishedOutput` を作成しない。
- 外部 LLM API 呼び出しなし。
- Dashboard による shell execution なし。
- Sanity schema 変更なし。

## 現在の Phase 2C 状態

- Phase 2C-0: PASS
- Phase 2C-0.1: PASS
- Phase 2C-1A: PASS / schema-aligned manual promote helper
- Phase 2C-1B: PASS / controlled `createContentIdea` + Studio URL fix
- Phase 2C-2: pending

## 判断

Raw Idea incubation result から Sanity `contentIdea` を作成できる状態になった。Campaign creation は次フェーズ。Phase 2C-1B は `contentIdea` のみを作成し、`campaignPlan` / `platformOutput` / `publishedOutput` は作らない。

## 次

Phase 2C-2 Generation Prompt Package に進む。
