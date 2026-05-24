# Phase 2C-1 Content Idea schema alignment fix

日付: 2026-05-22

## 背景

Phase 2C-1 の `/ideas` Content Idea promote helper は動作していたが、boss の最新 manual smoke で Sanity Studio 保存時の schema mismatch が残っていることが分かった。

- `title` / `slug` / `coreThesis` だけでは保存に足りない。
- `claims` / `tone` / `voice` / `platformAngles` などで validation error が出る。
- `claims` が red / Untitled に見えるため、array item shape が実 schema とズレている可能性が高い。

この batch は PASS 記録ではなく、schema-aware alignment fix の実装。Phase 2C-1 は boss smoke test 待ちのまま。

## contentIdea schema inventory

`schemas/contentIdea.ts` から確認した必須 field:

- `title`: string, required
- `slug`: slug, required, JSON shape `{_type: "slug", current: "..."}`
- `status`: string, required, enum `idea` / `researched` / `drafted` / `reviewed` / `archived`
- `summary`: text, required
- `coreThesis`: text, required
- `audience`: string array, required, min 1
- `audiencePain`: text, required
- `claims`: object array, required, min 1
  - item shape: `claim` required, `supportingEvidence`, `confidence` enum `low` / `medium` / `high`, `needsVerification`
- `tone`: object, required
  - `voice`: string, required
  - `styleNotes`: string array
  - `avoid`: string array
- `platformAngles`: object array, required, min 1
  - item shape: `platform` required enum `note` / `substack` / `threads` / `x` / `youtube` / `shorts` / `podcast` / `diagram` / `github` / `paid` / `instagram` / `newsletter`
  - optional: `targetReader`, `hook`, `formatNotes`, `callToAction`

Optional fields:

- `rawInput`
- `contentPillars`
- `evidence`
- `examples`
- `objections`
- `sourceLinks`
- `outputChecklist`
- `personalContext`

## 変更

- `dashboard/src/lib/ideaJobs/contentIdeaMapper.ts`
  - `studioDraft` を actual `contentIdea` schema field のみに整理。
  - non-schema の `extended` / `provenance` / `warnings` は `enrichedDraft` 側へ分離。
  - `status: "idea"` を schema enum default として追加。
  - `tone.voice` に保存可能な暫定値を入れ、checklist では `needs manual edit` と表示。
  - `claims` を schema item shape (`claim`, `supportingEvidence`, `confidence`, `needsVerification`) に正規化。
  - `platformAngles` を schema item shape (`platform`, `targetReader`, `hook`, `formatNotes`, `callToAction`) に正規化。
  - object map 型の `platformAngles` (`{note: "...", x: "..."}` など) も schema enum に変換。
  - `studioDraftJsonText` と `copyableJsonText` を分離。
  - `schemaChecklist` を追加。
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx`
  - `Sanity必須fieldチェック` card を追加。
  - `Studio draft JSONをコピー` と `Full enriched JSONをコピー` を分離。
  - field-by-field copy に `status`, `rawInput`, `contentPillars`, `evidence`, `tone`, `tone.voice` などを追加。
  - Studio root の右ペイン blank は正常で、左ペインから Content Ideas を選ぶ流れだと明記。

## 判断

- Sanity schema は変更しない。
- dashboard から Sanity doc は作成しない。
- `studioDraft` は schema-aligned only、future automation 用の情報は `enrichedDraft` に逃がす。
- `tone.voice` は actual schema に enum がないため、schema-valid string default を入れて保存可能性を上げる。ただし editorial voice としては boss が Studio で確認する。
- `platformAngles` は empty にせず、欠けている場合は `note` の fallback item を入れる。
- `claims` は object item の exact key に寄せ、red / Untitled の原因になりやすい非対応 key を避ける。

## 状態

Implemented schema alignment fix. Phase 2C-1 smoke PASS は未記録。boss manual smoke 待ち。

## 次

boss が `/ideas` で既存 job `obsidian-ai-sanity-3 / 20260521-124748` を使い、required field checklist、schema-aligned JSON copy、manual Studio creation の validation 減少を確認する。
