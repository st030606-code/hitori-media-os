# Sanity Studio: Content Idea-Centered Structure

Date: 2026-05-14

このドキュメントは、Sanity Studio の左ナビ構造を **Content Idea を中心** に組み替えた設計と運用ルールをまとめます。

## Why Content Idea Becomes The Navigation Hub

Sanity Studio のデフォルトは「document type ごとのフラットリスト」です。Hitori Media OS では schema が増えてきました:

- `contentIdea` / `prompt` / `platformOutput` / `diagramPlan` / `visualAssetPlan` / `workflow` / `publishedOutput` / `tool`
- Substack 戦略レイヤー: `substackPublicationStrategy` / `substackPostPlan` / `substackNotesPlan` / `substackGrowthAction`

Content Idea が `ai-blog-db` / `building-hitori-media-os` などへ増えていくと、各フラットリストには複数 Content Idea のレコードが混在し、

- 「いま `building-hitori-media-os` の Visual Asset Plan は何があるか」
- 「`ai-blog-db` の Substack Post Plan はどれか」

を見つけるのにフィルタを毎回掛け直す必要があり、運用が重くなります。

Hitori Media OS では **1つの Content Idea から複数媒体へ展開する** のが基本単位。Studio の入口も同じ単位にすると、頭の中のモデルと UI が揃います。

## What Changed

- `sanity.config.ts` の `structureTool()` に custom structure を渡すよう変更。
- `structure/index.ts` を新規作成。
- 既存スキーマ・既存 dataset には触っていない。
- 既存の「by document type」リストも `By Type (flat)` セクションに残し、引き続きアクセス可能。

## New Studio Navigation

```text
Content Ideas (hub)
  ├── All Content Ideas         （contentIdea 全件、デフォルトの S.documentTypeList）
  └── By Content Idea
      └── <select a contentIdea>
          ├── Overview                              （contentIdea 本体 editor）
          ├── Visual Asset Plans
          ├── Diagram Plans
          ├── Platform Outputs
          ├── Workflows
          ├── Substack Post Plans
          ├── Substack Notes Plans
          ├── Substack Growth Actions
          └── Substack Publication Strategies      （sourceContentIdea / relatedContentIdeas いずれかでマッチ）

────────── divider ──────────

By Type (flat)
  ├── Content Ideas
  ├── Prompts
  ├── Platform Outputs
  ├── Diagram Plans
  ├── Visual Asset Plans
  ├── Workflows
  ├── Published Outputs
  ├── Tools
  ├── Substack Publication Strategies
  ├── Substack Post Plans
  ├── Substack Notes Plans
  └── Substack Growth Actions
```

## Filtering Logic

### Direct `sourceContentIdea` reference

下記 7 schemas はすべて `sourceContentIdea` を持つため、共通 GROQ で絞り込みます:

```groq
_type == $type && sourceContentIdea._ref == $contentIdeaId
```

対象: `visualAssetPlan`, `diagramPlan`, `platformOutput`, `workflow`, `substackPostPlan`, `substackNotesPlan`, `substackGrowthAction`

### `substackPublicationStrategy` の特例

`sourceContentIdea`（単数 reference）と `relatedContentIdeas`（配列 reference）の両方を持つため、GROQ の `references()` ヘルパーで包括的に判定:

```groq
_type == "substackPublicationStrategy" && references($contentIdeaId)
```

これにより、主軸 / 関連いずれの Content Idea からも当該 Publication Strategy が一覧に出ます。

## Schemas Successfully Grouped

| Schema | Grouped? | Notes |
| --- | --- | --- |
| `contentIdea` | ★ (hub) | 自身が navigation の起点 |
| `visualAssetPlan` | ✓ | `sourceContentIdea._ref` |
| `diagramPlan` | ✓ | `sourceContentIdea._ref` |
| `platformOutput` | ✓ | `sourceContentIdea._ref` |
| `workflow` | ✓ | `sourceContentIdea._ref` |
| `substackPublicationStrategy` | ✓ | `references($contentIdeaId)`（sourceContentIdea + relatedContentIdeas） |
| `substackPostPlan` | ✓ | `sourceContentIdea._ref` |
| `substackNotesPlan` | ✓ | `sourceContentIdea._ref` |
| `substackGrowthAction` | ✓ | `sourceContentIdea._ref` |

## Schemas Not Yet Grouped (Backlog)

| Schema | Reason |
| --- | --- |
| `prompt` | Content Idea への直接 reference が無い。`promptKind` / `targetPlatform` などで分類されている。Content Idea 連携を schema レベルで足すかは別バッチで判断。 |
| `tool` | 生成ツール（ChatGPT / Canva 等）のメタ情報。本質的に Content Idea 横断。 |
| `publishedOutput` | `sourcePlatformOutput` 経由で 2-hop で Content Idea につながる。1-hop の reference を追加するか、GROQ 2-hop join を structure に書くかは別バッチで検討。 |

これらは `By Type (flat)` セクションから引き続きアクセスできます。

## Files Touched

- `sanity.config.ts`（structureTool に structure を渡すよう変更、追加 import 1行）
- `structure/index.ts`（新規、structure resolver と child list ビルダー）

既存 schema ファイルには **一切触っていません**。`schemas/index.ts` も触っていません。

## Manual Studio Check Steps (for human)

1. `npm run dev` で Sanity Studio を起動。
2. 左ナビに **「Content Ideas」** セクションが表示されることを確認。
3. `Content Ideas → All Content Ideas` でフラット一覧が表示されることを確認。
4. `Content Ideas → By Content Idea` を開き、`ai-blog-db` を選択。
   - `Overview` で contentIdea ドキュメントが開くか確認。
   - `Visual Asset Plans` で既存 5 件（ai-blog-db note hero / x hook / instagram carousel / github architecture / youtube thumbnail）が表示されるか確認。
   - `Diagram Plans` / `Platform Outputs` / `Workflows` などにも該当 Content Idea のレコードのみが出るか確認。
5. `Content Ideas → By Content Idea → building-hitori-media-os` を選択（Studio に投入済みの場合）。
   - `Visual Asset Plans` に 9 件（note-hero / substack-header / x-hook-main / threads-support-diagram / note-inline 3点 / substack-inline / note-inline-publish-package-folder）が表示されるか確認。
   - `Substack Publication Strategies` に 1 件（building-hitori-media-os strategy）が表示されるか確認。
6. divider の下の **`By Type (flat)`** セクションを開く。
   - 12 種類の document type 全部にアクセスできること（特に `Prompts` / `Published Outputs` / `Tools` がここから引ける）。

### よくある確認パターン

- 「`building-hitori-media-os` の visual がぱっと全部見たい」→ `Content Ideas → By Content Idea → building-hitori-media-os → Visual Asset Plans`
- 「全 Visual Asset Plan を横断で見たい」→ `By Type (flat) → Visual Asset Plans`

## Relation To Future Admin Dashboard

将来の管理ダッシュボード（Next.js を入れた段階）は、この **Content Idea を中心とした情報モデル** をそのまま流用できます:

- カード型 UI で「Content Idea 1件 = 1カード」を出す
- カードを開くと、関連する Visual Asset Plan / Diagram Plan / Platform Output / Substack 戦略 / Growth Action / Subscriber Milestone が一覧
- Studio と同じ GROQ フィルタが管理 UI でも使える

ただし、本バッチ時点では **Studio の組み換えだけ**。Next.js / 管理ダッシュボードは引き続き保留です。

## Safety / Constraints

- No Next.js
- No paid LLM / image generation API
- No direct Sanity write（grep で 0 hits 維持）
- No auto-posting
- No `seed --replace`
- No Sanity CLI 実行
- No destructive schema change（既存 schema には触っていない）
- existing dataset の document には触っていない
- `private/` には触っていない

## Backlog

将来検討する候補:

1. `prompt` schema に `contentIdea` reference を追加し、grouped に昇格させる。
2. `publishedOutput` を `sourcePlatformOutput` 経由でなく `contentIdea` 直 reference を追加 or 2-hop GROQ で grouped 化。
3. Content Idea のサブビューに `Production Visuals (saved)` / `Production Visuals (brief-ready)` のような status 別フィルタを追加。
4. Substack 戦略レイヤーで `substackSubscriberMilestone` / `substackPaidReadiness` が active になったとき、structure に追加。
5. ai-blog-db / building-hitori-media-os 以外の Content Idea を増やす段階で、Studio 表示の order / preview をチューニング。

## Related Docs

- [docs/handoff/latest.md](handoff/latest.md)
- [docs/35-hitori-media-os-v0-2-architecture.md](35-hitori-media-os-v0-2-architecture.md)
- [docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md](42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md)
- [docs/43-visual-register-inbox-review-workflow.md](43-visual-register-inbox-review-workflow.md)
- [schemas/proposed/README.md](../schemas/proposed/README.md)
