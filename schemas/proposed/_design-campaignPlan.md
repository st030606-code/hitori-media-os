# Proposed Schema (design only) — `campaignPlan`

Date: 2026-05-14
Status: **design-only**, not yet activated. **No `.ts` file created in this batch.**

`docs/48-campaign-generation-flow.md` と `docs/49-platform-selection-model.md` で参照する Campaign Plan の record 設計。

## 目的

1 Content Idea を起点に、selected platforms / per-platform 設定 / 生成済み記録の進捗を1枚にまとめる。

## Sketch（TS-like、本バッチでは defineType しない）

```ts
defineType({
  name: 'campaignPlan',
  title: 'キャンペーン計画（Campaign Plan）',
  type: 'document',
  fields: [
    defineField({name: 'slug', type: 'slug', validation: r => r.required()}),
    defineField({name: 'title', type: 'string', validation: r => r.required()}),
    defineField({
      name: 'sourceContentIdea',
      type: 'reference', to: [{type: 'contentIdea'}],
      validation: r => r.required(),
    }),
    defineField({
      name: 'brandProfile',
      type: 'reference', to: [{type: 'brandProfile'}], weak: true,
    }),
    defineField({
      name: 'contentMode',
      type: 'string',
      options: {list: ['build-log','educational','paid-readiness','case-study','opinion']},
    }),
    defineField({
      name: 'selectedPlatforms',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'platform', type: 'string', options: {list: [
            'x','threads','note','substack','youtube','shorts','podcast',
            'instagram','github','newsletter','paid'
          ]}},
          {name: 'enabled', type: 'boolean', initialValue: true},
          {name: 'priority', type: 'string', options: {list: ['P0','P1','P2','P3']}},
          {name: 'contentDepth', type: 'string', options: {list: [
            'hook-only','summary','full-article','long-form-research'
          ]}},
          {name: 'visualRequirement', type: 'string', options: {list: [
            'none','minimal','standard','rich'
          ]}},
          {name: 'publishMode', type: 'string', options: {list: [
            'manual-only','semi-auto','api-auto-eligible'
          ]}},
          {name: 'productionMode', type: 'string', options: {list: [
            'solo','collaborator','agency'
          ]}},
          {name: 'cadence', type: 'string', options: {list: [
            'ad-hoc','weekly','biweekly','monthly','per-campaign'
          ]}},
          {name: 'requiredAssets', type: 'array', of: [{type: 'string'}]},
          {name: 'optionalAssets', type: 'array', of: [{type: 'string'}]},
          {name: 'notes', type: 'text', rows: 2},
        ],
      }],
      validation: r => r.required().min(1),
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['planning','generating','reviewing','published','archived']},
      initialValue: 'planning',
    }),
    defineField({
      name: 'progress',
      type: 'object',
      fields: [
        {name: 'textDrafts', type: 'string'},      // "4/4 done" 等
        {name: 'visuals', type: 'string'},
        {name: 'publishPackages', type: 'string'},
        {name: 'releaseReview', type: 'string'},
      ],
    }),
    defineField({name: 'notes', type: 'text', rows: 4}),
    defineField({name: 'createdAt', type: 'datetime'}),
    defineField({name: 'updatedAt', type: 'datetime'}),
  ],
})
```

## 関連 reference

| field | refers to | notes |
| --- | --- | --- |
| `sourceContentIdea` | `contentIdea` | 必須、1:1 |
| `brandProfile` | `brandProfile`（提案中） | 任意、weak |
| （逆参照） | `platformOutput.campaignSlug` etc | slug match で文字列 join、structure builder で集約 |

## Out of scope（本 doc）

- structure builder の "By Campaign" 表示の実装
- existing platformOutput / visualAssetPlan への campaign reference 追加
- ai-blog-db キャンペーンへの逆適用
