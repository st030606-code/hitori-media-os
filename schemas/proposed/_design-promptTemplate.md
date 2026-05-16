# Proposed Schema (design only) — `promptTemplate`

Date: 2026-05-14
Status: **design-only**, not yet activated. **No `.ts` file created in this batch.**

詳細背景は [`docs/47-prompt-template-system.md`](../../docs/47-prompt-template-system.md)。

## 目的

「毎回ゼロから書く prompt」をやめ、`category × platform × assetType × contentMode × brandProfile` を selection key とする template を再利用する。

## Sketch

```ts
defineType({
  name: 'promptTemplate',
  title: 'プロンプトテンプレート（Prompt Template）',
  type: 'document',
  fields: [
    defineField({name: 'slug', type: 'slug', validation: r => r.required()}),
    defineField({name: 'title', type: 'string', validation: r => r.required()}),

    defineField({
      name: 'category',
      type: 'string',
      options: {list: [
        'text-draft','thread','note-article','substack-post','substack-notes',
        'image-generation','diagram-generation','video-script','shorts-script',
        'podcast-script','publish-checklist',
      ]},
      validation: r => r.required(),
    }),

    defineField({
      name: 'applicablePlatforms',
      type: 'array',
      of: [{type: 'string'}],
      description: 'x / threads / note / substack / youtube / shorts / podcast / instagram / github / newsletter / paid',
    }),
    defineField({
      name: 'applicableAssetTypes',
      type: 'array',
      of: [{type: 'string'}],
      description: 'image-generation / diagram-generation 系の場合のみ意味あり',
    }),
    defineField({
      name: 'applicableContentModes',
      type: 'array',
      of: [{type: 'string'}],
      description: 'build-log / educational / paid-readiness / case-study / opinion',
    }),

    defineField({name: 'brandProfile', type: 'reference', to: [{type: 'brandProfile'}], weak: true}),
    defineField({name: 'visualStyleProfile', type: 'reference', to: [{type: 'visualStyleProfile'}], weak: true}),

    defineField({name: 'systemInstruction', type: 'text', rows: 6}),
    defineField({
      name: 'userPromptTemplate',
      type: 'text', rows: 12,
      description: '{{placeholder}} を含む。inputVariables と対応。',
    }),

    defineField({
      name: 'inputVariables',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string'},
          {name: 'type', type: 'string', options: {list: [
            'string','text','number','boolean','array','reference','image-path'
          ]}},
          {name: 'source', type: 'string', options: {list: [
            'contentIdea','campaignPlan','visualAssetPlan','brandProfile',
            'visualStyleProfile','human-input','file-path','constant'
          ]}},
          {name: 'required', type: 'boolean', initialValue: true},
          {name: 'notes', type: 'text', rows: 2},
        ],
      }],
    }),

    defineField({name: 'outputContract', type: 'text', rows: 6}),

    defineField({
      name: 'negativeInstructions',
      type: 'array',
      of: [{type: 'string'}],
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
          {name: 'notes', type: 'text', rows: 2},
        ],
      }],
    }),
    defineField({
      name: 'successCriteria',
      type: 'array',
      of: [{type: 'string'}],
      description: 'runtime で機械チェック可能な条件',
    }),

    defineField({
      name: 'variationStrategy',
      type: 'string',
      options: {list: [
        'single','3-variant','diagram-first','typography-hybrid','metaphor-mix','3-pattern-default'
      ]},
    }),

    defineField({
      name: 'automationLevel',
      type: 'string',
      options: {list: ['manual','semi-auto','auto-eligible']},
      initialValue: 'manual',
    }),

    defineField({name: 'version', type: 'string', initialValue: '0.1.0'}),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['draft','active','deprecated','archived']},
      initialValue: 'draft',
    }),
    defineField({name: 'priority', type: 'number', description: '同 selection key で複数 match した時の優先度'}),
    defineField({name: 'notes', type: 'text', rows: 4}),
    defineField({name: 'createdAt', type: 'datetime'}),
    defineField({name: 'updatedAt', type: 'datetime'}),
  ],
})
```

## 既存 `prompt` schema との関係

- `prompt` を削除・破壊しない。
- 将来的に `prompt` に `template` reference を追加する余地を残す（additive のみ）。
- 新規 generation 時の使い分け:
  - **template が無い場合**: 既存 `prompt` をそのまま使う。
  - **template がある場合**: template から派生した instance を `prompt` document として記録（or 別 `promptRun` document）。

## Selection 例

```text
キー:
  category = "image-generation"
  applicablePlatforms includes "x"
  applicableAssetTypes includes "hook-image"
  applicableContentModes includes "build-log"
  brandProfile = brandProfile.hitori-media-os-default

→ hit する promptTemplate を 1 件選び、その userPromptTemplate を inputVariables で埋める
→ Codex `image_gen` に流す
```

## Out of scope

- 自動 A/B test
- LLM auto-rubric scoring
- paid LLM client integration
- migration script
