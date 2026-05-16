# Proposed Schema (design only) — `visualStyleProfile`

Date: 2026-05-14
Status: **design-only**, not yet activated. **No `.ts` file created in this batch.**

`docs/50-visual-prompt-quality-system.md` で参照される、asset 種別ごとの style anchor record。

## 目的

`brandProfile` は「著者の人格 / 共通 visual 制約」、`visualStyleProfile` は **assetType 単位の固有 style anchor** を持つ。採用済み candidate を referenceImagePaths として蓄積し、次回 generation の prompt に inline する。

## Sketch

```ts
defineType({
  name: 'visualStyleProfile',
  title: 'ビジュアルスタイルプロファイル（Visual Style Profile）',
  type: 'document',
  fields: [
    defineField({name: 'slug', type: 'slug', validation: r => r.required()}),
    defineField({name: 'title', type: 'string', validation: r => r.required()}),

    defineField({
      name: 'brandProfile',
      type: 'reference', to: [{type: 'brandProfile'}], weak: true,
    }),

    defineField({
      name: 'assetType',
      type: 'string',
      options: {list: [
        'hero','eye-catch','section-diagram','comparison-diagram','flow-diagram',
        'architecture-diagram','schema-diagram','pipeline-diagram','carousel-cover',
        'carousel-slide','hook-image','thumbnail','paired-post-visual',
        'summary-diagram','cta-visual'
      ]},
      validation: r => r.required(),
    }),

    defineField({
      name: 'applicablePlatforms',
      type: 'array',
      of: [{type: 'string'}],
      description: '同一 assetType でも platform で style が変わる場合は別 visualStyleProfile を作る',
    }),

    defineField({
      name: 'defaultLayoutPattern',
      type: 'string',
      options: {list: [
        'centered-title-only','title-with-single-diagram',
        'split-left-text-right-diagram','top-headline-bottom-flow',
        'grid-of-modules','before-after-comparison','architecture-stack'
      ]},
      description: 'centered-title-only は最終手段、デフォルトにしない',
    }),

    defineField({
      name: 'requiredModules',
      type: 'object',
      fields: [
        {name: 'headlineRequired', type: 'boolean', initialValue: true},
        {name: 'subtitleRequired', type: 'boolean', initialValue: false},
        {name: 'diagramNodesMin', type: 'number', initialValue: 2},
        {name: 'diagramEdgesMin', type: 'number', initialValue: 1},
        {name: 'iconHintsAllowed', type: 'boolean', initialValue: false},
        {name: 'bracketingLineRequired', type: 'boolean', initialValue: false},
      ],
    }),

    defineField({
      name: 'typographyHierarchy',
      type: 'object',
      fields: [
        {name: 'headlineSizeHint', type: 'string', options: {list: ['large','xl','xxl']}},
        {name: 'subtitleSizeHint', type: 'string', options: {list: ['xs','small','medium']}},
        {name: 'nodeLabelSizeHint', type: 'string', options: {list: ['small','medium']}},
        {name: 'density', type: 'string', options: {list: ['sparse','balanced','dense']}},
        {name: 'lineHeightHint', type: 'string', options: {list: ['tight','normal','relaxed']}},
      ],
    }),

    defineField({
      name: 'colorOverrides',
      type: 'object',
      fields: [
        {name: 'baseColor', type: 'string', description: 'brandProfile defaultBaseColor を override'},
        {name: 'accentColor', type: 'string'},
        {name: 'allowedAccents', type: 'array', of: [{type: 'string'}]},
      ],
    }),

    defineField({
      name: 'referenceImagePaths',
      type: 'array',
      of: [{type: 'string'}],
      description: '採用済み candidate の final asset path。新規 generation 時に style anchor として inline する。',
    }),

    defineField({
      name: 'variationStrategy',
      type: 'string',
      options: {list: [
        'single','3-variant','3-pattern-default','diagram-first','typography-hybrid','metaphor-mix'
      ]},
      initialValue: '3-pattern-default',
    }),

    defineField({
      name: 'reviewRubric',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'criterion', type: 'string'},
          {name: 'weight', type: 'number'},
          {name: 'passThreshold', type: 'string'},
        ],
      }],
    }),

    defineField({
      name: 'acceptanceThreshold',
      type: 'number',
      description: 'reviewRubric の総合重みのうち、何%以上で acceptable とするか（例: 80）',
    }),

    defineField({name: 'notes', type: 'text', rows: 4}),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['draft','active','deprecated','archived']},
      initialValue: 'draft',
    }),
    defineField({name: 'createdAt', type: 'datetime'}),
    defineField({name: 'updatedAt', type: 'datetime'}),
  ],
})
```

## 例: `visualStyleProfile.hitori-media-os.x-hook-image`

```json
{
  "_id": "visualStyleProfile.hitori-media-os.x-hook-image",
  "_type": "visualStyleProfile",
  "slug": {"current": "hitori-media-os-x-hook-image"},
  "title": "Hitori Media OS / X / hook-image",
  "brandProfile": {"_type": "reference", "_ref": "brandProfile.hitori-media-os-default"},
  "assetType": "hook-image",
  "applicablePlatforms": ["x"],
  "defaultLayoutPattern": "title-with-single-diagram",
  "requiredModules": {
    "headlineRequired": true,
    "subtitleRequired": true,
    "diagramNodesMin": 2,
    "diagramEdgesMin": 1,
    "iconHintsAllowed": false,
    "bracketingLineRequired": true
  },
  "typographyHierarchy": {
    "headlineSizeHint": "xl",
    "subtitleSizeHint": "xs",
    "nodeLabelSizeHint": "small",
    "density": "balanced",
    "lineHeightHint": "normal"
  },
  "colorOverrides": {
    "baseColor": "off-white",
    "accentColor": "warm terracotta",
    "allowedAccents": ["warm terracotta","muted teal"]
  },
  "referenceImagePaths": [
    "assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png"
  ],
  "variationStrategy": "3-pattern-default",
  "reviewRubric": [
    {"criterion": "headline readable in X preview crop", "weight": 3, "passThreshold": "pass"},
    {"criterion": "diagram nodes ≥ 2 (centered-title-only 以外)", "weight": 3, "passThreshold": "pass"},
    {"criterion": "tone matches referenceImagePaths", "weight": 3, "passThreshold": "pass"},
    {"criterion": "no face/robot/AI brain", "weight": 5, "passThreshold": "pass"},
    {"criterion": "no paid PDF content copy", "weight": 5, "passThreshold": "pass"}
  ],
  "acceptanceThreshold": 80,
  "status": "draft"
}
```

## 採用 candidate の追記フロー

```
1. Visual Register で approve & register
2. patch JSON が `assets/visuals/...` への copy を確定
3. （automated, 次バッチ実装）visualStyleProfile.referenceImagePaths にこの path を append
4. 次回 generation 時に inline され、tone 一貫性が時間と共に強化される
```

## 関連参照

- `promptTemplate.visualStyleProfile` → このレコード
- `visualAssetPlan` に新規 field `styleProfile` を追加する余地（次バッチ判断、本 doc では未確定）

## Out of scope

- 画像の自動 style transfer
- LLM による layoutPattern の自動選定（将来）
- paid image generation API integration
