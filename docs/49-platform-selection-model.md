# 49 — Platform Selection Model (design)

Date: 2026-05-14
Status: **design-only, no schema activation**
Scope: Hitori Media OS の利用者ごとに「使う platform / 使わない platform」が違う前提を、record として明示する設計。

## 1. 問題: "all platforms by default" は嘘

`schemas/contentIdea.ts` の `platformAngles` は 12 platform を network 上の選択肢として持っているが、現実の運営者は:

- writer-only（note + Substack のみ）
- video-first（YouTube + Shorts + 補助で X）
- audio-first（Podcast + Substack + X）
- full-stack（X + Threads + note + Substack + YouTube + Shorts + Podcast）
- niche（GitHub + note + paid のみ）

など、組み合わせが大きく異なる。Campaign Plan / publish package / prompt template / visual asset plan の自動生成を考えると、**どの platform に対して何を生むか** を明示する記録が必要。

## 2. 目標

- `selectedPlatforms` を Campaign 単位で **明示的に持つ**
- 各 platform に対して enabled / priority / contentDepth / visualRequirement / publishMode / productionMode / requiredAssets / optionalAssets を保持
- これを Campaign Generation Flow (`docs/48`) と Prompt Template System (`docs/47`) の selection key として使う

## 3. selectedPlatforms 要素（per-platform フィールド）

```text
selectedPlatform {
  platform              (enum: x / threads / note / substack / youtube / shorts /
                              podcast / instagram / github / newsletter / paid)
  enabled               (boolean)
  priority              (enum: P0 / P1 / P2 / P3)
  contentDepth          (enum: hook-only / summary / full-article / long-form-research)
  visualRequirement     (enum: none / minimal / standard / rich)
  publishMode           (enum: manual-only / semi-auto / api-auto-eligible)
  productionMode        (enum: solo / collaborator / agency)
  cadence               (enum: ad-hoc / weekly / biweekly / monthly / per-campaign)
  requiredAssets        (array<assetType>)
  optionalAssets        (array<assetType>)
  notes                 (text)
}
```

### enum 詳細

#### contentDepth

| 値 | 説明 |
| --- | --- |
| `hook-only` | 1〜3 文の hook 投稿（X main / Threads main） |
| `summary` | 300〜600 字の要約（X thread / Threads post） |
| `full-article` | 1500〜4000 字の本文（note / Substack post / paid post） |
| `long-form-research` | 5000+ 字、参考文献あり（GitHub README / paid deep-dive） |

#### visualRequirement

| 値 | 説明 |
| --- | --- |
| `none` | 画像なし（X reply / Threads quick） |
| `minimal` | 1 hook image のみ（X main / Threads main） |
| `standard` | hero + 2〜3 inline diagram（note / Substack post） |
| `rich` | hero + 4+ inline + carousel / thumbnail / cover（YouTube + Instagram） |

#### publishMode

| 値 | 説明 |
| --- | --- |
| `manual-only` | API 自動投稿しない（現状の全 platform） |
| `semi-auto` | preview link 自動生成 + 手動 publish |
| `api-auto-eligible` | 将来 API 自動投稿可（要 explicit human approval per cycle） |

#### productionMode

| 値 | 説明 |
| --- | --- |
| `solo` | 全工程ひとり |
| `collaborator` | 編集 / 校正のもう1人がいる |
| `agency` | 外注（撮影 / 編集 / 校閲） |

## 4. 例: 4 ユーザータイプ

### A. writer-only（note + Substack）

```json
{
  "selectedPlatforms": [
    {"platform": "note", "enabled": true, "priority": "P1",
     "contentDepth": "full-article", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": ["hero"],
     "optionalAssets": ["flow-diagram", "section-diagram"]},
    {"platform": "substack", "enabled": true, "priority": "P1",
     "contentDepth": "full-article", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": ["hero"],
     "optionalAssets": ["section-diagram"]}
  ]
}
```

### B. building-hitori-media-os 実例（X + Threads + note + Substack）

```json
{
  "selectedPlatforms": [
    {"platform": "x", "enabled": true, "priority": "P1",
     "contentDepth": "hook-only", "visualRequirement": "minimal",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": ["hook-image"],
     "optionalAssets": []},
    {"platform": "threads", "enabled": true, "priority": "P2",
     "contentDepth": "summary", "visualRequirement": "minimal",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": [],
     "optionalAssets": ["section-diagram"]},
    {"platform": "note", "enabled": true, "priority": "P1",
     "contentDepth": "full-article", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": ["hero"],
     "optionalAssets": ["flow-diagram", "section-diagram", "architecture-diagram"]},
    {"platform": "substack", "enabled": true, "priority": "P1",
     "contentDepth": "full-article", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "cadence": "per-campaign",
     "requiredAssets": ["hero"],
     "optionalAssets": ["section-diagram"]}
  ]
}
```

未選択: YouTube / Shorts / Podcast / Instagram / GitHub / paid / newsletter → これらの platformOutput / visualAssetPlan は生成されない。

### C. video-first（YouTube + Shorts + X）

```json
{
  "selectedPlatforms": [
    {"platform": "youtube", "enabled": true, "priority": "P1",
     "contentDepth": "long-form-research", "visualRequirement": "rich",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["thumbnail", "hero"]},
    {"platform": "shorts", "enabled": true, "priority": "P2",
     "contentDepth": "hook-only", "visualRequirement": "rich",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["thumbnail"]},
    {"platform": "x", "enabled": true, "priority": "P2",
     "contentDepth": "summary", "visualRequirement": "minimal",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["hook-image"]}
  ]
}
```

### D. niche developer（GitHub + note + paid）

```json
{
  "selectedPlatforms": [
    {"platform": "github", "enabled": true, "priority": "P1",
     "contentDepth": "long-form-research", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["architecture-diagram"]},
    {"platform": "note", "enabled": true, "priority": "P2",
     "contentDepth": "full-article", "visualRequirement": "standard",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["hero"]},
    {"platform": "paid", "enabled": true, "priority": "P3",
     "contentDepth": "long-form-research", "visualRequirement": "rich",
     "publishMode": "manual-only", "productionMode": "solo",
     "requiredAssets": ["hero", "comparison-diagram"]}
  ]
}
```

## 5. これがどう Campaign Plan schema になるか

提案: `selectedPlatforms` を Campaign Plan の必須フィールドとして持つ。

```text
campaignPlan {
  slug                     (string, 例 "building-hitori-media-os")
  sourceContentIdea        (ref to contentIdea, required)
  brandProfile             (ref to brandProfile, weak)
  selectedPlatforms        (array<selectedPlatform>, see §3)
  contentMode              (enum: build-log / educational / paid-readiness / case-study / opinion)
  status                   (planning / generating / reviewing / published / archived)
  progress                 (object: { textDrafts, visuals, publishPackages, releaseReview })
  notes                    (text)
  createdAt / updatedAt
}
```

詳細は [_design-campaignPlan.md](../schemas/proposed/_design-campaignPlan.md)。

## 6. selectedPlatforms と既存 visualAssetPlan の整合性

current: `visualAssetPlan` は per-record で `targetPlatform` を持つ。
future: Campaign Plan の `selectedPlatforms[].requiredAssets` が source-of-truth、`visualAssetPlan` はそこから derived。

derive ルール（次バッチで実装する場合の sketch）:

```
for each selectedPlatform p:
  for each assetType in p.requiredAssets:
    visualAssetPlan {
      sourceContentIdea: campaign.sourceContentIdea
      targetPlatform: p.platform
      assetType: assetType
      status: planned
      reusePolicy: (heuristic based on assetType + platform)
    }
  for each assetType in p.optionalAssets:
    （deferred、人間判断で activate）
```

## 7. Out of scope

- Campaign 横断の publishing carousel（per-platform 自動公開）
- Sanity の structure builder への "By Campaign" 表示（次バッチ以降）
- 既存 platformOutput / visualAssetPlan の破壊的 migration

## 8. 次バッチへの推奨

1. `schemas/proposed/campaignPlan.ts` を sketch（include `selectedPlatforms`）
2. building-hitori-media-os の B 例を seed file 化（`seed/campaign-plan-building-hitori-media-os.json`）
3. `tools/campaign-plan/derive-visual-asset-plans.mjs`（仮）を local-only script として下書き
4. structure builder への "By Campaign" 子ノードは Phase 2
