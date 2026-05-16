# Proposed Schema (design only) — `brandProfile`

Date: 2026-05-14
Status: **design-only**, not yet activated. **No `.ts` file created in this batch.**

`docs/47` `docs/49` `docs/50` で参照される、著者人格 / 既定トーン / 既定 visual 制約のレコード。

## 目的

複数 Content Idea / Campaign に共通の「著者の人格 / トーン / 視覚制約 / 禁忌表現」を 1 record として持ち、prompt template と visualStyleProfile から参照する。

## Sketch

```ts
defineType({
  name: 'brandProfile',
  title: '著者プロフィール（Brand Profile）',
  type: 'document',
  fields: [
    defineField({name: 'slug', type: 'slug', validation: r => r.required()}),
    defineField({name: 'title', type: 'string', validation: r => r.required()}),

    defineField({
      name: 'persona',
      type: 'object',
      fields: [
        {name: 'voice', type: 'string', description: '一人称、語尾、距離感'},
        {name: 'expertiseLevel', type: 'string', options: {list: [
          'beginner-building-in-public','intermediate','expert','researcher'
        ]}},
        {name: 'styleNotes', type: 'array', of: [{type: 'string'}]},
        {name: 'avoidPhrasings', type: 'array', of: [{type: 'string'}]},
      ],
    }),

    defineField({
      name: 'audiences',
      type: 'array',
      of: [{type: 'string'}],
      description: '想定読者の主要セグメント',
    }),

    defineField({
      name: 'defaultContentModes',
      type: 'array',
      of: [{type: 'string'}],
      description: 'build-log / educational / paid-readiness / case-study / opinion',
    }),

    defineField({
      name: 'defaultPlatforms',
      type: 'array',
      of: [{type: 'string'}],
      description: 'このブランドが「使う」platform。Campaign Plan で override 可。',
    }),

    defineField({
      name: 'visualDefaults',
      type: 'object',
      fields: [
        {name: 'defaultBaseColor', type: 'string', description: '#FAFAFA など'},
        {name: 'defaultAccentColor', type: 'string'},
        {name: 'defaultFontFamily', type: 'string'},
        {name: 'defaultNodeShape', type: 'string', options: {list: [
          'rounded-square','circle','hexagon','pill','rectangle'
        ]}},
        {name: 'defaultLineWeight', type: 'string', options: {list: [
          'hairline','thin','regular','bold'
        ]}},
        {name: 'decorationDensity', type: 'string', options: {list: [
          'minimal','restrained','standard','rich'
        ]}},
      ],
    }),

    defineField({
      name: 'negativeStyleList',
      type: 'array',
      of: [{type: 'string'}],
      description: '画像 / 文章 / 図 で共通禁忌（顔写真 / AI brain icon / robot / glass flare / 煽り文言 等）',
    }),

    defineField({
      name: 'ctaDefaults',
      type: 'object',
      fields: [
        {name: 'softCtaTemplate', type: 'text', rows: 2},
        {name: 'avoidHardSell', type: 'boolean', initialValue: true},
        {name: 'newsletterUrl', type: 'url'},
        {name: 'paidOfferStatus', type: 'string', options: {list: [
          'none','planned','not-yet-active','active'
        ]}},
      ],
    }),

    defineField({name: 'notes', type: 'text', rows: 4}),
    defineField({name: 'createdAt', type: 'datetime'}),
    defineField({name: 'updatedAt', type: 'datetime'}),
  ],
})
```

## 例: `brandProfile.hitori-media-os-default`

```json
{
  "_id": "brandProfile.hitori-media-os-default",
  "_type": "brandProfile",
  "slug": {"current": "hitori-media-os-default"},
  "title": "Hitori Media OS（building-in-public）",
  "persona": {
    "voice": "実装者目線、断定せず、迷いをそのまま書く",
    "expertiseLevel": "intermediate",
    "styleNotes": ["building-in-public", "完成断言を避ける", "短い段落"],
    "avoidPhrasings": ["完全自動化","稼げる","誰でも","保証","AIに任せる時代"]
  },
  "audiences": ["ひとりメディア運営者","エンジニア","editor"],
  "defaultContentModes": ["build-log","educational"],
  "defaultPlatforms": ["x","threads","note","substack"],
  "visualDefaults": {
    "defaultBaseColor": "off-white",
    "defaultAccentColor": "warm terracotta (restrained)",
    "defaultFontFamily": "Noto Sans JP / Inter / IBM Plex",
    "defaultNodeShape": "rounded-square",
    "defaultLineWeight": "thin",
    "decorationDensity": "restrained"
  },
  "negativeStyleList": [
    "face photo","AI generated avatar","robot","AI brain icon",
    "glass flare","gradient overload","neon","heavy shadows",
    "logo-style marks","emoji decoration","clickbait headline"
  ],
  "ctaDefaults": {
    "softCtaTemplate": "Hitori Media OS の開発過程は Substack に書いています。気が向いたら覗いてみてください。",
    "avoidHardSell": true,
    "paidOfferStatus": "none"
  }
}
```

## 関連参照

- `promptTemplate.brandProfile` → このレコード
- `visualStyleProfile.brandProfile` → このレコード
- `campaignPlan.brandProfile` → このレコード

## Out of scope

- 複数 brand の persona blending（co-author 形式）
- L10N（多言語版 brandProfile）
- A/B variant brand（実験用）
