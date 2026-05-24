# Phase 2C-1B createContentIdea server action

日付: 2026-05-22

## 背景

Phase 2C-1A の promote helper と schema alignment は動作した。boss manual smoke でも `/ideas` で既存 job `obsidian-ai-sanity-3 / 20260521-124748` が検出され、必須field checklist、`slug.current`、Studio draft JSON、field copy が表示されることを確認。

ただし Sanity Studio の document form は full JSON paste を前提にできず、field-by-field paste は手間が大きい。よって Phase 2C-1B として、Dashboard が schema-aligned `studioDraft` から `contentIdea` を controlled create する方針へ進める。

## 変更

- `dashboard/src/lib/actions/createContentIdeaFromResult.ts`
  - `createContentIdeaFromResult(input)` を追加。
  - `mode: "preview"` は `idea-jobs/<ideaSlug>/<timestamp>/result.json` と `_raw.json` を読み、既存 mapper で `studioDraft` を作り、duplicate を確認する。
  - `mode: "execute"` は同じ read/map/validate/duplicate pass を再実行し、`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` が揃うときだけ Sanity に `contentIdea` を作成する。
  - deterministic `_id = contentIdea.<slug.current>` を採用。既存 seed / refs の convention に合わせた。
  - duplicate は `_id` または `slug.current` で検出し、既存 doc を上書きしない。
  - post-create refetch で `_id`, `slug.current`, required fields を検証する。
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
  - `Content IdeaをSanityに作成` card を追加。
  - `Preview create` と `Create Content Idea` button を追加。
  - preview で planned id / slug / duplicate / write readiness を表示。
  - success で created doc id / slug / Studio link / verified を表示。
  - duplicate の場合は既存 Studio link を表示。
  - 手動 Studio handoff と field-by-field copy は fallback として維持。
- `dashboard/src/app/ideas/page.tsx`
  - 説明文を Phase 2C-1B の controlled create に合わせて更新。
- `dashboard/src/components/ideas/RawIdeaBuilder.tsx`
  - result 保存後の案内を「次は Content Idea create preview」に更新。

## 安全設計

- Sanity schema は変更しない。
- `studioDraft` の schema field だけを明示 allow-list で document payload に入れる。
- `enrichedDraft` / `provenance` / warnings は Sanity に書かない。
- 任意JSONやuser-provided `_id` は受け取らない。
- `campaignPlan`, `platformOutput`, `publishedOutput` は作成しない。
- filesystem read は既存 `readResultJson` / `readRawIdeaJson` を使い、`idea-jobs/` allowlist と size cap を維持。
- execute は `enableWriteActions` と `SANITY_WRITE_TOKEN` の両方を要求。
- logs は metadata only。result body / contentIdea body / token value は出さない。

## 状態

Phase 2C-1B createContentIdea implementation landed. Boss smoke test 待ち。まだ smoke PASS ではない。

## 次

boss が `/ideas` で preview create → execute create → duplicate block を確認する。成功したら別handoffで Phase 2C-1B smoke PASS を記録する。
