# Handoff: Sanity Studio Content Idea-Centered Structure

Date: 2026-05-14

## 1. Task Goal

Sanity Studio の左ナビを、document type ごとのフラットリストから **Content Idea を中心** とした hub 型に組み替える。既存の by-type フラットリストも残し、debugging / power use を維持する。schema や既存 dataset には触らない。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM / image generation API integration は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（grep 0 hits 維持）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- secrets / API キー / 実 project ID / private/ filename / paid PDF content は commit していない。
- 既存 schema を破壊的に変更していない（schema には一切触っていない）。
- 既存 dataset の document に触っていない。
- 既存 by-type アクセス（フラットリスト）を温存している。

## 3. Changed Files

### Added

- `structure/index.ts`（118 行、structure resolver + child list ビルダー）
- `docs/46-sanity-content-idea-centered-structure.md`
- `docs/devlog/0087-sanity-content-idea-centered-structure.md`
- `docs/handoff/0098-sanity-content-idea-centered-structure.md`

### Modified

- `sanity.config.ts`（`import {structure} from './structure'` を追加、`structureTool()` を `structureTool({structure})` に変更）
- `docs/handoff/latest.md`

### Confirmed unchanged

- 全 schema ファイル（`schemas/contentIdea.ts` / `visualAssetPlan.ts` / etc.）
- `schemas/index.ts`
- 既存 outputs / publish-packages / private / 既存 seed
- ai-blog-db 関連レコード
- tools 配下（visual-register / publish-package-builder / local-check）

## 4. Summary of Changes

### Navigation 構造

```text
Content Ideas (hub)
  ├── All Content Ideas
  └── By Content Idea
      └── <select contentIdea>
          ├── Overview
          ├── Visual Asset Plans
          ├── Diagram Plans
          ├── Platform Outputs
          ├── Workflows
          ├── Substack Post Plans
          ├── Substack Notes Plans
          ├── Substack Growth Actions
          └── Substack Publication Strategies

(divider)

By Type (flat)
  ├── Content Ideas / Prompts / Platform Outputs / Diagram Plans
  ├── Visual Asset Plans / Workflows / Published Outputs / Tools
  └── Substack Publication Strategies / Post Plans / Notes Plans / Growth Actions
```

### Filter Logic

- 7 schemas（visualAssetPlan / diagramPlan / platformOutput / workflow / substackPostPlan / substackNotesPlan / substackGrowthAction）→ `_type == $type && sourceContentIdea._ref == $contentIdeaId`
- substackPublicationStrategy（sourceContentIdea + relatedContentIdeas）→ `_type == "substackPublicationStrategy" && references($contentIdeaId)`

### Not Grouped (backlog)

- `prompt` / `tool` / `publishedOutput` は Content Idea reference を持たないため `By Type (flat)` のみアクセス可能。

## 5. Important Decisions

- 既存挙動を破壊しない設計（By Type フラットリストを残す）。
- schema には触らない。structure 側だけで Content Idea hub を実現。
- substackPublicationStrategy の `relatedContentIdeas` 配列も拾えるよう `references()` を使用。
- 将来の Next.js 管理ダッシュボードでも、この情報モデルを流用できる。

## 6. Human Review Questions

- `Content Ideas (hub)` を最上部に置く順序でよいか、`By Type (flat)` を上にした方が好みか。
- `prompt` schema に `contentIdea` reference を追加して hub に組み込むかどうか（schema 変更を伴うため別バッチ）。
- `publishedOutput` も `contentIdea` 直 reference を持たせるか、2-hop GROQ で hub に組み込むか。
- Content Idea サブビューに status / platform 別の追加フィルタ（例: visualAssetPlan を `status == "saved"` で絞る）を後から付けるか。

## 7. Risks or Uncertainties

- `npm run build` は成功したが、人間が `npm run dev` で実際に Studio を開くまで、UI 上の見え方は未検証。特に GROQ filter の動作は dataset 状態に依存（building-hitori-media-os の visualAssetPlan を投入していない場合は空表示）。
- ai-blog-db 既存 5 visualAssetPlan は `sourceContentIdea: contentIdea.ai-blog-db` を持つので、ai-blog-db を選択すれば表示されるはず。
- substackPublicationStrategy の `references()` フィルタは GROQ の標準機能だが、Studio バージョンによって挙動差がある可能性は低い（Sanity v3 で標準サポート）。
- structure id（`content-ideas-hub` / `by-type` 等）は内部 ID で human-visible ではない。重複してはいけない点だけ注意。

## 8. Recommended Next Step

### Immediate Human Actions

1. `npm run dev` で Sanity Studio を起動。
2. ブラウザで左ナビに「Content Ideas」セクションが表示されることを確認。
3. `Content Ideas → All Content Ideas` で contentIdea 全件が出ることを確認。
4. `Content Ideas → By Content Idea → ai-blog-db` を選択:
   - `Overview` で contentIdea editor が開く
   - `Visual Asset Plans` に既存 5 件
   - `Diagram Plans` / `Platform Outputs` / `Workflows` に該当レコード
5. building-hitori-media-os の visualAssetPlan を Sanity に投入済みの場合、同じ手順で確認。
6. `By Type (flat)` セクションで 12 schema 全部にアクセスできることを確認。
7. 違和感があれば次バッチで structure を調整。

### Mid-term

- prompt / publishedOutput を Content Idea hub に組み込むか判断。
- Content Idea サブビューに status / platform 別フィルタを追加するか判断。
- substackSubscriberMilestone / substackPaidReadiness が active 化したタイミングで structure に追加。

### Deferred

- Next.js 管理ダッシュボード（このバッチでは未着手、Studio 改善が先行）。
- Studio の preview customization（preview select / order の高度なチューニング）。

## 9. Exact Prompt to Give Codex Next

```text
Run a manual Sanity Studio UX check for the Content Idea-centered structure.

Do not edit files.
Do not call paid APIs.
Do not write to Sanity from code.
Do not run seed --replace.

Use:
- sanity.config.ts
- structure/index.ts
- docs/46-sanity-content-idea-centered-structure.md
- schemas/contentIdea.ts (reference)

Steps:
1. Run "npm run dev" and open Sanity Studio in the browser.
2. Confirm the left nav shows "Content Ideas" section at the top and "By Type (flat)" below a divider.
3. Open "Content Ideas → All Content Ideas" — confirm both ai-blog-db and building-hitori-media-os contentIdea documents are listed.
4. Open "Content Ideas → By Content Idea → ai-blog-db" — confirm:
   - Overview opens the contentIdea editor
   - Visual Asset Plans lists 5 records (note hero, x hook, instagram carousel, github architecture, youtube thumbnail)
   - Diagram Plans / Platform Outputs / Workflows show related ai-blog-db records
   - Substack sections may be empty (ai-blog-db has no Substack strategy yet)
5. Open "Content Ideas → By Content Idea → building-hitori-media-os" (only after Sanity ingest of seed/visual-asset-plan-records-building-hitori-media-os.json) — confirm:
   - Visual Asset Plans lists up to 9 records
   - Substack Publication Strategies shows 1 record (if substackPublicationStrategy seed is ingested)
6. Open "By Type (flat)" and confirm 12 schema types still accessible individually.

Report:
- which Content Ideas were visible
- which related sub-lists rendered correctly
- any GROQ filter mismatch or missing references
- any UI / UX friction (slow load, confusing labels, etc.)

Do not edit any files in this turn.
```
