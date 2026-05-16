// Active schema (activated 2026-05-14, batch 0096; activated together with brandProfile).
// Source / design history:
//   docs/50-visual-prompt-quality-system.md
//   schemas/proposed/_design-visualStyleProfile.md (design sketch, retained for reference)
//
// References `brandProfile` (now active).

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

const assetTypeOptions = [
  {title: 'ヒーロー画像（hero）', value: 'hero'},
  {title: 'アイキャッチ（eye-catch）', value: 'eye-catch'},
  {title: 'セクション図解（section-diagram）', value: 'section-diagram'},
  {title: '比較図（comparison-diagram）', value: 'comparison-diagram'},
  {title: 'フロー図（flow-diagram）', value: 'flow-diagram'},
  {title: 'アーキテクチャ図（architecture-diagram）', value: 'architecture-diagram'},
  {title: 'スキーマ図（schema-diagram）', value: 'schema-diagram'},
  {title: 'パイプライン図（pipeline-diagram）', value: 'pipeline-diagram'},
  {title: 'カルーセル表紙（carousel-cover）', value: 'carousel-cover'},
  {title: 'カルーセルスライド（carousel-slide）', value: 'carousel-slide'},
  {title: 'フック画像（hook-image）', value: 'hook-image'},
  {title: 'サムネイル（thumbnail）', value: 'thumbnail'},
  {title: '投稿ペア画像（paired-post-visual）', value: 'paired-post-visual'},
  {title: 'まとめ図（summary-diagram）', value: 'summary-diagram'},
  {title: 'CTA画像（cta-visual）', value: 'cta-visual'},
]

const layoutPatternOptions = [
  {title: 'タイトルのみ中央（centered-title-only）— 最終手段、デフォルト禁止', value: 'centered-title-only'},
  {title: 'タイトル + 単独図（title-with-single-diagram）', value: 'title-with-single-diagram'},
  {title: '左テキスト/右図（split-left-text-right-diagram）', value: 'split-left-text-right-diagram'},
  {title: '上見出し/下flow（top-headline-bottom-flow）', value: 'top-headline-bottom-flow'},
  {title: 'グリッド配置（grid-of-modules）', value: 'grid-of-modules'},
  {title: 'ビフォーアフター対比（before-after-comparison）', value: 'before-after-comparison'},
  {title: 'アーキテクチャ層構造（architecture-stack）', value: 'architecture-stack'},
]

const variationStrategyOptions = [
  {title: '単一（single）', value: 'single'},
  {title: '3バリアント（3-variant）', value: '3-variant'},
  {title: '3パターン標準（3-pattern-default）— diagram-first / typography-hybrid / metaphor-mix', value: '3-pattern-default'},
  {title: '図優先（diagram-first）', value: 'diagram-first'},
  {title: 'タイポ+図ハイブリッド（typography-diagram-hybrid）', value: 'typography-diagram-hybrid'},
  {title: 'メタファーミックス（metaphor-mix）', value: 'metaphor-mix'},
]

const densityOptions = [
  {title: 'sparse', value: 'sparse'},
  {title: 'balanced', value: 'balanced'},
  {title: 'dense', value: 'dense'},
]

export const visualStyleProfile = defineType({
  name: 'visualStyleProfile',
  title: 'ビジュアルスタイルプロファイル（Visual Style Profile）',
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
      name: 'brandProfile',
      title: 'ブランドプロファイル（Brand Profile）',
      type: 'reference',
      to: [{type: 'brandProfile'}],
      weak: true,
      description: 'PROPOSED ref。brandProfileがactivateされるまでは参照解決されない。',
    }),
    defineField({
      name: 'applicablePlatforms',
      title: '適用platform（Applicable Platforms）',
      type: 'array',
      of: [{type: 'string', options: {list: platformOptions}}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'assetTypes',
      title: '対象assetType（Asset Types）',
      type: 'array',
      of: [{type: 'string', options: {list: assetTypeOptions}}],
      validation: (Rule) => Rule.required().min(1),
    }),
    // --- layout / module / typography ---
    defineField({
      name: 'layoutPatterns',
      title: '採用レイアウトパターン（Layout Patterns）',
      type: 'array',
      of: [{type: 'string', options: {list: layoutPatternOptions}}],
      description: 'このスタイルで許可するレイアウト。centered-title-only を含めるかは慎重に。',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'defaultLayoutPattern',
      title: '既定レイアウト（Default Layout Pattern）',
      type: 'string',
      options: {list: layoutPatternOptions},
      description: 'centered-title-only をデフォルトにしないこと。',
    }),
    defineField({
      name: 'visualModuleSet',
      title: 'ビジュアルモジュール構成（Visual Module Set）',
      type: 'object',
      fields: [
        defineField({name: 'headlineRequired', title: 'headline必須', type: 'boolean', initialValue: true}),
        defineField({name: 'subtitleRequired', title: 'subtitle必須', type: 'boolean', initialValue: false}),
        defineField({name: 'diagramNodesMin', title: 'diagramNodes最小数', type: 'number', initialValue: 2}),
        defineField({name: 'diagramEdgesMin', title: 'diagramEdges最小数', type: 'number', initialValue: 1}),
        defineField({name: 'iconHintsAllowed', title: 'icon許可', type: 'boolean', initialValue: false}),
        defineField({name: 'bracketingLineRequired', title: 'bracketing line必須', type: 'boolean', initialValue: false}),
        defineField({name: 'watermarkOrTagAllowed', title: 'watermark/tag許可', type: 'boolean', initialValue: false}),
      ],
    }),
    defineField({
      name: 'typographyGuidance',
      title: 'タイポグラフィ指針（Typography Guidance）',
      type: 'object',
      fields: [
        defineField({
          name: 'headlineSizeHint',
          title: 'headlineサイズ',
          type: 'string',
          options: {list: [
            {title: 'large', value: 'large'},
            {title: 'xl', value: 'xl'},
            {title: 'xxl', value: 'xxl'},
          ]},
        }),
        defineField({
          name: 'subtitleSizeHint',
          title: 'subtitleサイズ',
          type: 'string',
          options: {list: [
            {title: 'xs', value: 'xs'},
            {title: 'small', value: 'small'},
            {title: 'medium', value: 'medium'},
          ]},
        }),
        defineField({
          name: 'nodeLabelSizeHint',
          title: 'nodeラベルサイズ',
          type: 'string',
          options: {list: [
            {title: 'small', value: 'small'},
            {title: 'medium', value: 'medium'},
          ]},
        }),
        defineField({
          name: 'density',
          title: '密度（Density）',
          type: 'string',
          options: {list: densityOptions, layout: 'radio'},
        }),
        defineField({
          name: 'lineHeightHint',
          title: '行間ヒント',
          type: 'string',
          options: {list: [
            {title: 'tight', value: 'tight'},
            {title: 'normal', value: 'normal'},
            {title: 'relaxed', value: 'relaxed'},
          ]},
        }),
        defineField({
          name: 'fontFamilyHint',
          title: 'フォントヒント（Font Family Hint）',
          type: 'string',
          description: 'brandProfile.defaultFontFamily を override する場合に設定。',
        }),
      ],
    }),
    // --- color / density ---
    defineField({
      name: 'colorGuidance',
      title: '色彩指針（Color Guidance）',
      type: 'object',
      fields: [
        defineField({name: 'baseColor', title: 'baseColor', type: 'string'}),
        defineField({name: 'accentColor', title: 'accentColor', type: 'string'}),
        defineField({
          name: 'allowedAccents',
          title: '許可accent色',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({
          name: 'forbiddenColorEffects',
          title: '禁止色効果',
          type: 'array',
          of: [{type: 'string'}],
          description: '例: gradient overload / neon / glass flare。',
        }),
      ],
    }),
    defineField({
      name: 'densityGuidance',
      title: '装飾密度指針（Density Guidance）',
      type: 'object',
      fields: [
        defineField({
          name: 'decorationDensity',
          title: '装飾密度（Decoration Density）',
          type: 'string',
          options: {list: [
            {title: 'minimal', value: 'minimal'},
            {title: 'restrained', value: 'restrained'},
            {title: 'standard', value: 'standard'},
            {title: 'rich', value: 'rich'},
          ], layout: 'radio'},
        }),
        defineField({
          name: 'compareTo',
          title: '比較基準（Compare To）',
          type: 'string',
          description: '例: "note hero よりも1段階控えめ"。',
        }),
      ],
    }),
    // --- references / anchors ---
    defineField({
      name: 'referenceImagePaths',
      title: '参照画像パス（Reference Image Paths）',
      type: 'array',
      of: [{type: 'string'}],
      description: '採用済みcandidateのfinal asset path。新規generation時にstyle anchorとしてinlineされる。',
    }),
    defineField({
      name: 'adoptedCandidatePaths',
      title: '採用candidateパス（Adopted Candidate Paths）',
      type: 'array',
      of: [{type: 'string'}],
      description: 'inbox由来でVisual Register承認済みのcandidateパス。reference image と区別したい場合に使う。',
    }),
    defineField({
      name: 'negativePatterns',
      title: '禁止パターン（Negative Patterns）',
      type: 'array',
      of: [{type: 'string'}],
      description:
        '例: face photo / AI brain icon / robot / glass flare / clickbait / text-only title card as default。',
      validation: (Rule) => Rule.required().min(1),
    }),
    // --- review / variation ---
    defineField({
      name: 'reviewRubric',
      title: 'レビュー基準（Review Rubric）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'criterion',
              title: '評価項目（Criterion）',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'weight',
              title: '重み（Weight）',
              type: 'number',
              initialValue: 1,
            }),
            defineField({
              name: 'passThreshold',
              title: '合格基準（Pass Threshold）',
              type: 'string',
            }),
            defineField({
              name: 'notes',
              title: 'メモ（Notes）',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'acceptanceThreshold',
      title: '採用閾値（Acceptance Threshold）',
      type: 'number',
      description: 'reviewRubric の総合重みのうち、何%以上で acceptable とするか（例: 80）。',
    }),
    defineField({
      name: 'variationStrategy',
      title: 'バリアント戦略（Variation Strategy）',
      type: 'string',
      options: {list: variationStrategyOptions, layout: 'radio'},
      initialValue: '3-pattern-default',
    }),
    defineField({
      name: 'numberOfVariants',
      title: 'バリアント数（Number Of Variants）',
      type: 'number',
      initialValue: 3,
    }),
    defineField({
      name: 'expectedAspectRatio',
      title: '想定アスペクト比（Expected Aspect Ratio）',
      type: 'string',
      options: {
        list: [
          {title: '16:9', value: '16:9'},
          {title: '1:1', value: '1:1'},
          {title: '4:5', value: '4:5'},
          {title: '9:16', value: '9:16'},
        ],
      },
    }),
    defineField({
      name: 'expectedPixelSize',
      title: '想定ピクセルサイズ（Expected Pixel Size）',
      type: 'string',
      description: '例: 1200x675',
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
      assetTypes: 'assetTypes',
      status: 'status',
    },
    prepare({title, assetTypes, status}) {
      const assetSummary = Array.isArray(assetTypes) && assetTypes.length > 0 ? assetTypes.join(',') : ''
      return {
        title,
        subtitle: [assetSummary, status].filter(Boolean).join(' / '),
      }
    },
  },
})
