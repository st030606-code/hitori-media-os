// Active schema (activated 2026-05-14, batch 0096).
// Source / design history:
//   docs/47-prompt-template-system.md
//   docs/49-platform-selection-model.md
//   docs/50-visual-prompt-quality-system.md
//   schemas/proposed/_design-brandProfile.md (design sketch, retained for reference)

import {defineField, defineType} from 'sanity'

const platformOptions = [
  {title: 'note（note）', value: 'note'},
  {title: 'Substack（substack）', value: 'substack'},
  {title: 'Threads（threads）', value: 'threads'},
  {title: 'X（x）', value: 'x'},
  {title: 'YouTube（youtube）', value: 'youtube'},
  {title: 'Shorts（shorts）', value: 'shorts'},
  {title: 'Podcast（podcast）', value: 'podcast'},
  {title: 'Instagram（instagram）', value: 'instagram'},
  {title: 'GitHub（github）', value: 'github'},
  {title: '有料記事（paid）', value: 'paid'},
  {title: 'ニュースレター（newsletter）', value: 'newsletter'},
]

const contentModeOptions = [
  {title: '開発ログ（build-log）', value: 'build-log'},
  {title: '教育コンテンツ（educational）', value: 'educational'},
  {title: '有料化準備（paid-readiness）', value: 'paid-readiness'},
  {title: 'ケーススタディ（case-study）', value: 'case-study'},
  {title: '意見・主張（opinion）', value: 'opinion'},
  {title: 'building-in-public（building-in-public）', value: 'building-in-public'},
]

const decorationDensityOptions = [
  {title: '最小（minimal）', value: 'minimal'},
  {title: '控えめ（restrained）', value: 'restrained'},
  {title: '標準（standard）', value: 'standard'},
  {title: '装飾的（rich）', value: 'rich'},
]

const nodeShapeOptions = [
  {title: '丸角矩形（rounded-square）', value: 'rounded-square'},
  {title: '円形（circle）', value: 'circle'},
  {title: '六角形（hexagon）', value: 'hexagon'},
  {title: 'pill', value: 'pill'},
  {title: '矩形（rectangle）', value: 'rectangle'},
]

const lineWeightOptions = [
  {title: '極細（hairline）', value: 'hairline'},
  {title: '細（thin）', value: 'thin'},
  {title: '標準（regular）', value: 'regular'},
  {title: '太（bold）', value: 'bold'},
]

const visualVocabularyOptions = [
  {title: 'structured', value: 'structured'},
  {title: 'app-like', value: 'app-like'},
  {title: 'modern', value: 'modern'},
  {title: 'clean', value: 'clean'},
  {title: 'diagram-friendly', value: 'diagram-friendly'},
  {title: 'trust-building', value: 'trust-building'},
  {title: 'building-in-public', value: 'building-in-public'},
]

export const brandProfile = defineType({
  name: 'brandProfile',
  title: 'ブランドプロファイル（Brand Profile）',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ（Slug）',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brandName',
      title: 'ブランド名（Brand Name）',
      type: 'string',
      description: '対外表記。例: Hitori Media OS / すがわらたくや',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ownerType',
      title: 'オーナー種別（Owner Type）',
      type: 'string',
      options: {
        list: [
          {title: '個人（solo）', value: 'solo'},
          {title: 'デュオ（duo）', value: 'duo'},
          {title: '小チーム（small-team）', value: 'small-team'},
          {title: 'エージェンシー（agency）', value: 'agency'},
        ],
        layout: 'radio',
      },
      initialValue: 'solo',
      validation: (Rule) => Rule.required(),
    }),
    // --- voice / tone ---
    defineField({
      name: 'voiceTone',
      title: '語り口・トーン（Voice & Tone）',
      type: 'object',
      fields: [
        defineField({
          name: 'voice',
          title: '語り口（Voice）',
          type: 'string',
          description: '一人称、語尾、距離感、断定の強さ。',
        }),
        defineField({
          name: 'expertiseLevel',
          title: '専門性レベル（Expertise Level）',
          type: 'string',
          options: {
            list: [
              {title: '初学者（beginner-building-in-public）', value: 'beginner-building-in-public'},
              {title: '中級（intermediate）', value: 'intermediate'},
              {title: '熟練（expert）', value: 'expert'},
              {title: '研究者（researcher）', value: 'researcher'},
            ],
          },
        }),
        defineField({
          name: 'styleNotes',
          title: '文体メモ（Style Notes）',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({
          name: 'avoidPhrasings',
          title: '避ける表現（Avoid Phrasings）',
          type: 'array',
          of: [{type: 'string'}],
          description: '完全自動化 / 稼げる / 誰でも / 保証 / AIに任せる時代 など。',
        }),
      ],
    }),
    defineField({
      name: 'audience',
      title: '想定読者（Audience）',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    // --- content principles ---
    defineField({
      name: 'contentPrinciples',
      title: 'コンテンツ原則（Content Principles）',
      type: 'array',
      of: [{type: 'string'}],
      description: '例: building-in-public / 完成断言を避ける / 数字煽りを避ける / 短い段落。',
    }),
    defineField({
      name: 'defaultContentModes',
      title: '既定contentMode（Default Content Modes）',
      type: 'array',
      of: [{type: 'string', options: {list: contentModeOptions}}],
    }),
    defineField({
      name: 'defaultPlatforms',
      title: '既定platform（Default Platforms）',
      type: 'array',
      of: [{type: 'string', options: {list: platformOptions}}],
    }),
    // --- visual defaults ---
    defineField({
      name: 'visualDefaults',
      title: 'ビジュアル既定値（Visual Defaults）',
      type: 'object',
      fields: [
        defineField({
          name: 'visualVocabulary',
          title: 'ビジュアル語彙（Visual Vocabulary）',
          type: 'array',
          of: [{type: 'string', options: {list: visualVocabularyOptions}}],
          description: 'Hitori Media OSなら structured / app-like / modern / clean / diagram-friendly / trust-building / building-in-public。',
        }),
        defineField({
          name: 'defaultBaseColor',
          title: '既定ベース色（Default Base Color）',
          type: 'string',
          description: '例: off-white #FAFAFA',
        }),
        defineField({
          name: 'defaultAccentColor',
          title: '既定アクセント色（Default Accent Color）',
          type: 'string',
          description: '例: warm terracotta（控えめ）',
        }),
        defineField({
          name: 'allowedAccentColors',
          title: '許可アクセント色（Allowed Accent Colors）',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({
          name: 'defaultFontFamily',
          title: '既定フォント（Default Font Family）',
          type: 'string',
          description: '例: Noto Sans JP / Inter / IBM Plex',
        }),
        defineField({
          name: 'defaultNodeShape',
          title: '既定ノード形状（Default Node Shape）',
          type: 'string',
          options: {list: nodeShapeOptions},
        }),
        defineField({
          name: 'defaultLineWeight',
          title: '既定線太さ（Default Line Weight）',
          type: 'string',
          options: {list: lineWeightOptions},
        }),
        defineField({
          name: 'decorationDensity',
          title: '装飾密度（Decoration Density）',
          type: 'string',
          options: {list: decorationDensityOptions, layout: 'radio'},
        }),
      ],
    }),
    defineField({
      name: 'negativeStyleList',
      title: '禁忌スタイル一覧（Negative Style List）',
      type: 'array',
      of: [{type: 'string'}],
      description:
        '画像 / 文章 / 図 で共通禁忌。例: face photo / AI brain icon / robot / glass flare / gradient overload / clickbait / text-only title card as default。',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'platformToneOverrides',
      title: 'platform別トーン上書き（Platform Tone Overrides）',
      type: 'array',
      description: '特定platformだけ語尾やCTA姿勢が違う場合に上書き。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'voiceOverride', title: 'voice override', type: 'string'}),
            defineField({
              name: 'styleNotesOverride',
              title: 'style notes override',
              type: 'array',
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'ctaApproachOverride',
              title: 'CTA姿勢 override',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'reviewPrinciples',
      title: 'レビュー原則（Review Principles）',
      type: 'array',
      of: [{type: 'string'}],
      description: '生成物を採用する前に毎回確認する観点。例: 元レコードの主張を改変していないか / 完成断言になっていないか / paid PDF引用がないか。',
    }),
    defineField({
      name: 'ctaDefaults',
      title: 'CTA既定（CTA Defaults）',
      type: 'object',
      fields: [
        defineField({name: 'softCtaTemplate', title: 'soft CTA template', type: 'text', rows: 2}),
        defineField({
          name: 'avoidHardSell',
          title: 'avoidHardSell',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({name: 'newsletterUrl', title: 'newsletter URL', type: 'url'}),
        defineField({
          name: 'paidOfferStatus',
          title: 'paid offer status',
          type: 'string',
          options: {
            list: [
              {title: 'なし（none）', value: 'none'},
              {title: '計画中（planned）', value: 'planned'},
              {title: '未活性（not-yet-active）', value: 'not-yet-active'},
              {title: '活性（active）', value: 'active'},
            ],
          },
          initialValue: 'none',
        }),
      ],
    }),
    defineField({
      name: 'version',
      title: 'バージョン（Version）',
      type: 'string',
      initialValue: '0.1.0',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          {title: '下書き（draft）', value: 'draft'},
          {title: '有効（active）', value: 'active'},
          {title: '非推奨（deprecated）', value: 'deprecated'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'メモ（Notes）',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'createdAt',
      title: '作成日時（Created At）',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedAt',
      title: '更新日時（Updated At）',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      brandName: 'brandName',
      status: 'status',
    },
    prepare({title, brandName, status}) {
      return {
        title,
        subtitle: [brandName, status].filter(Boolean).join(' / '),
      }
    },
  },
})
