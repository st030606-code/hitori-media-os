# 55 — Proposed Campaign Plan Schema (implementation followup)

Date: 2026-05-14
Status: **proposed-only**, not active in Studio

[`docs/48-campaign-generation-flow.md`](48-campaign-generation-flow.md) と [`docs/49-platform-selection-model.md`](49-platform-selection-model.md) で設計した Campaign Plan を、proposed schema 1 件 + seed 1 件として落とした記録。

## 1. 何が変わったか

| 区分 | 追加 | 役割 |
| --- | --- | --- |
| schema (proposed) | `schemas/proposed/campaignPlan.ts` | 1 Content Idea 起点 campaign を 1 record 化 |
| seed (local-only) | `seed/campaign-plan-building-hitori-media-os.json` | building-hitori-media-os の Example B 具体例 |
| design followup | `docs/55-proposed-campaign-plan-schema.md` | 本ファイル |
| devlog | `docs/devlog/0093-...md` | 開発ログ |
| handoff | `docs/handoff/0104-...md` | 引き継ぎ書 |

**Studio に activate していない**。`schemas/index.ts` / `sanity.config.ts` は不変。

## 2. campaignPlan が結びつけるもの

```
contentIdea  ──┐
               │  sourceContentIdea (strong ref)
               ▼
        campaignPlan
        ├─ brandProfile (weak ref to PROPOSED brandProfile)
        ├─ selectedPlatforms[]            ← docs/49 Example B
        ├─ platformGenerationSettings[]   ← 生成順 + 依存 + master 共有
        ├─ requiredRecords[]              ← platformOutput / substackPostPlan / visualAssetPlan ID 一覧
        ├─ requiredVisualAssets[]         ← visualAssetPlan ID + 進捗 state
        ├─ promptTemplateSelections[]     ← どの promptTemplate を使うか
        ├─ publishPackagePaths[]          ← publish-packages/<platform>/<slug>/
        ├─ humanReviewGates[]             ← 人間判断 9 段
        ├─ manualPublishingStatus[]       ← 公開URL / 公開日時 / 反応メモ
        ├─ progressStatus                 ← 全体 / drafts / visuals / packages / release-review
        ├─ automationLevel                ← manual / semi-auto / auto-eligible
        └─ status                         ← draft / planning / generating / reviewing / published / archived
```

これにより、Content Idea → selectedPlatforms → promptTemplate 選定 → visualAssetPlan / platformOutput 生成 → publish-package 配布 → release-review → manual publish の **13 段フロー全体を 1 record で観測** できる。

## 3. 既存 active schemas との関係

- `contentIdea` → ref 元（campaignPlan.sourceContentIdea）。**改変なし**。
- `platformOutput` / `substackPostPlan` / `substackNotesPlan` / `substackGrowthAction` / `visualAssetPlan` → campaignPlan.requiredRecords / requiredVisualAssets に **ID 文字列で参照**。Sanity の reference 型ではなく string ID にしてあるのは、cross-type の柔軟性を保つため（schema 種別が異なるため reference の `to` を array にすると煩雑になる）。
- `brandProfile` / `visualStyleProfile` / `promptTemplate` → 提案中。weak ref / string ID で参照。

## 4. seed の特徴（building-hitori-media-os）

[`seed/campaign-plan-building-hitori-media-os.json`](../seed/campaign-plan-building-hitori-media-os.json) は **生きた example**:

- **selectedPlatforms**: X / Threads / note / Substack の4platform、`docs/49` Example B と同じ。
- **platformGenerationSettings**: note hero → substack header の master 共有を `dependsOn` + `sharedMasterAssets` で明示。
- **requiredRecords**: 既存の14 record（4 platformOutput / 3 Substack plan / 7 visualAssetPlan）の現状 state を反映:
  - 4 platformOutput / 3 Substack plan: `in-progress` / `not-started`
  - note-hero-v1 / substack-header-v1: `done`（既に publish-package 配布済）
  - x-hook-main-v1: `pending-review`（v001.png 生成済、Visual Register approve 待ち）
  - 残り 4 visual: `not-started`
- **promptTemplateSelections**: `promptTemplate.x-hook-image-diagram-rich-v1` を x-hook-main-v1 用に登録。
- **humanReviewGates**: 9 段の人間判断ポイントを記録、既完了は `done`、現状進行中は `pending-review` / `in-progress` / `not-started`。
- **manualPublishingStatus**: 4 platform 全部 `not-started`（未公開）。

## 5. Future admin dashboard への寄与

campaignPlan は **将来の admin dashboard の中心 record** になる:

- **Campaign 一覧 view**: `_type == campaignPlan` で全 campaign を listing、`status` / `automationLevel` / `progressStatus.overall` を一目で。
- **per-Campaign detail view**: 1 campaign 内の selectedPlatforms / requiredRecords / requiredVisualAssets / humanReviewGates / manualPublishingStatus を縦に並べて progress を可視化。
- **human gates dashboard**: `humanReviewGates[?state == "pending-review"]` を全 campaign から GROQ で集めれば「いま自分が判断を求められているもの」リスト。
- **visual progress dashboard**: `requiredVisualAssets[?state != "done"]` を全 campaign から集めれば「未完成の visual」リスト、Visual Register と直接連携。
- **publish status board**: `manualPublishingStatus[?publishedUrl != null]` を集めれば「公開済み実績」テーブル、反応メモ付きで。

structure builder の "By Campaign" view も campaignPlan を起点に組み立てられる（次バッチ以降）。

## 6. Platform Selection への寄与

[`docs/49`](49-platform-selection-model.md) の 4 ユーザータイプ（writer-only / building-hitori-media-os / video-first / niche developer）は campaignPlan の **異なる instance** として表現される:

```text
writer-only:
  selectedPlatforms = [note, substack]

building-hitori-media-os（本 seed）:
  selectedPlatforms = [x, threads, note, substack]

video-first:
  selectedPlatforms = [youtube, shorts, x]

niche developer:
  selectedPlatforms = [github, note, paid]
```

これにより、`brandProfile.defaultPlatforms` を上書きしつつ、campaign 単位で「今回はこの組み合わせ」を明示できる。

将来は `tools/campaign-plan/derive-visual-asset-plans.mjs`（仮）で `selectedPlatforms[].requiredAssets` から `visualAssetPlan` を derive する script を書くと、最も多い「visualAssetPlan を手で書く」工程が削減できる。

## 7. activate の意思決定 trigger

以下が揃ったタイミングで campaignPlan / brandProfile / visualStyleProfile / promptTemplate の **4 proposed schema を同時 activate** することを推奨:

- [ ] 4 schema の `.ts` の中で reference を相互解決できる確証（依存順: brandProfile → visualStyleProfile → promptTemplate → campaignPlan）
- [ ] 既存 active 12 type との衝突なしの最終確認
- [ ] seed 4 件をすべて投入可能な状態（contentIdea が dataset にあること）
- [ ] structure builder の "By Campaign" 子ノード設計の有無
- [ ] tools 側 runner script（promptTemplate を JSON から読んで Codex exec に渡す）の有無

それまでは proposed のまま、seed を local example として参照。

## 8. Out of scope（本 doc）

- Studio activate（`schemas/index.ts` への追加、`sanity.config.ts` への登録）
- `npx sanity documents create` 等の Sanity 投入
- structure builder の "By Campaign" view 実装
- `tools/campaign-plan/` 配下の runner script
- automated publishing / API auto-post
- paid LLM / image generation API integration

## 9. 次バッチへの推奨

1. **4 proposed schema を Studio activate する判断バッチ**（依存順厳守、seed 投入 + Studio 表示確認）
2. （任意）`structure/index.ts` を拡張して "By Campaign" 子ノード追加（campaignPlan を起点に requiredRecords / requiredVisualAssets を表示）
3. （任意）`tools/campaign-plan/derive-visual-asset-plans.mjs` の概念 sketch（`selectedPlatforms[].requiredAssets` から visualAssetPlan を derive、--dry-run のみ）
4. （任意）旧 `prompt` schema を「`promptTemplate` から派生した instance」として再定義する migration の検討
5. （任意）Visual Register Inbox Review UI に `reviewRubric` 表示 + `humanReviewGates` への state 反映
