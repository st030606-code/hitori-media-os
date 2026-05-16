// Active schema (activated 2026-05-14, batch 0096; activated together with brandProfile and visualStyleProfile).
// Source / design history:
//   docs/47-prompt-template-system.md
//   docs/48-campaign-generation-flow.md
//   docs/49-platform-selection-model.md
//   docs/50-visual-prompt-quality-system.md
//   schemas/proposed/_design-promptTemplate.md (design sketch, retained for reference)
//
// References `brandProfile` and `visualStyleProfile` (now active).

import {defineField, defineType} from 'sanity'

const categoryOptions = [
  {title: 'テキスト下書き（text-draft）', value: 'text-draft'},
  {title: 'スレッド（thread）', value: 'thread'},
  {title: 'note記事（note-article）', value: 'note-article'},
  {title: 'Substack Post（substack-post）', value: 'substack-post'},
  {title: 'Substack Notes（substack-notes）', value: 'substack-notes'},
  {title: '画像生成（image-generation）', value: 'image-generation'},
  {title: '図解生成（diagram-generation）', value: 'diagram-generation'},
  {title: '動画台本（video-script）', value: 'video-script'},
  {title: 'Shorts台本（shorts-script）', value: 'shorts-script'},
  {title: 'Podcast台本（podcast-script）', value: 'podcast-script'},
  {title: '公開チェックリスト（publish-checklist）', value: 'publish-checklist'},
]

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
  {title: '図解（diagram）', value: 'diagram'},
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

const contentModeOptions = [
  {title: '開発ログ（build-log）', value: 'build-log'},
  {title: '教育コンテンツ（educational）', value: 'educational'},
  {title: '有料化準備（paid-readiness）', value: 'paid-readiness'},
  {title: 'ケーススタディ（case-study）', value: 'case-study'},
  {title: '意見・主張（opinion）', value: 'opinion'},
  {title: 'building-in-public（building-in-public）', value: 'building-in-public'},
]

const outputFormatOptions = [
  {title: 'Markdown（markdown）', value: 'markdown'},
  {title: 'JSON（json）', value: 'json'},
  {title: 'スレッドJSON（thread-json）', value: 'thread-json'},
  {title: '画像プロンプトJSON（image-prompt-json）', value: 'image-prompt-json'},
  {title: 'プレーンテキスト（plain-text）', value: 'plain-text'},
  {title: '画像PNG（image-png）', value: 'image-png'},
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
  {title: '図優先（diagram-first）', value: 'diagram-first'},
  {title: 'タイポ+図ハイブリッド（typography-diagram-hybrid）', value: 'typography-diagram-hybrid'},
  {title: 'メタファーミックス（metaphor-mix）', value: 'metaphor-mix'},
  {title: '3パターン標準（3-pattern-default）— diagram-first / typography-hybrid / metaphor-mix', value: '3-pattern-default'},
]

export const promptTemplate = defineType({
  name: 'promptTemplate',
  title: 'プロンプトテンプレート（Prompt Template）',
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
      name: 'category',
      title: 'カテゴリ（Category）',
      type: 'string',
      options: {list: categoryOptions, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetPlatform',
      title: '対象媒体（Target Platform）',
      type: 'string',
      options: {list: platformOptions},
      description: '単一platform向けtemplateの場合に設定。複数platform対応はapplicablePlatformsを使う。',
    }),
    defineField({
      name: 'applicablePlatforms',
      title: '適用platform一覧（Applicable Platforms）',
      type: 'array',
      of: [{type: 'string', options: {list: platformOptions}}],
      description: '複数platformに同じtemplateを適用する場合のリスト。',
    }),
    defineField({
      name: 'assetType',
      title: '主アセット種別（Primary Asset Type）',
      type: 'string',
      options: {list: assetTypeOptions},
      description: 'image-generation / diagram-generation カテゴリの場合のみ意味あり。',
    }),
    defineField({
      name: 'applicableAssetTypes',
      title: '適用アセット種別一覧（Applicable Asset Types）',
      type: 'array',
      of: [{type: 'string', options: {list: assetTypeOptions}}],
    }),
    defineField({
      name: 'contentMode',
      title: 'コンテンツモード（Content Mode）',
      type: 'string',
      options: {list: contentModeOptions},
    }),
    defineField({
      name: 'applicableContentModes',
      title: '適用コンテンツモード一覧（Applicable Content Modes）',
      type: 'array',
      of: [{type: 'string', options: {list: contentModeOptions}}],
    }),
    defineField({
      name: 'brandProfile',
      title: 'ブランドプロファイル（Brand Profile）',
      type: 'reference',
      to: [{type: 'brandProfile'}],
      weak: true,
      description: 'PROPOSED ref。brandProfileがactivate されるまでは参照解決されない。',
    }),
    defineField({
      name: 'visualStyleProfile',
      title: 'ビジュアルスタイルプロファイル（Visual Style Profile）',
      type: 'reference',
      to: [{type: 'visualStyleProfile'}],
      weak: true,
      description: 'image-generation 用template でのみ意味あり。PROPOSED ref。',
    }),
    defineField({
      name: 'outputFormat',
      title: '出力形式（Output Format）',
      type: 'string',
      options: {list: outputFormatOptions},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'automationLevel',
      title: '自動化レベル（Automation Level）',
      type: 'string',
      initialValue: 'manual',
      options: {
        list: [
          {title: '手動（manual）', value: 'manual'},
          {title: '半自動（semi-auto）', value: 'semi-auto'},
          {title: '自動化可能（auto-eligible）', value: 'auto-eligible'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'systemInstruction',
      title: 'システム指示（System Instruction）',
      type: 'text',
      rows: 6,
      description: 'LLM のsystem役割。永続的な人格・制約・safety policyをここに集約。',
    }),
    defineField({
      name: 'userPromptTemplate',
      title: 'ユーザープロンプトtemplate（User Prompt Template）',
      type: 'text',
      rows: 12,
      description: '{{placeholder}} 形式を含む。inputVariables と1:1対応。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'inputVariables',
      title: '入力変数（Input Variables）',
      type: 'array',
      description: 'userPromptTemplate の {{placeholder}} と対応する変数定義。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: '変数名（Name）',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: '型（Type）',
              type: 'string',
              options: {
                list: [
                  {title: '文字列（string）', value: 'string'},
                  {title: 'テキスト（text）', value: 'text'},
                  {title: '数値（number）', value: 'number'},
                  {title: '真偽値（boolean）', value: 'boolean'},
                  {title: '配列（array）', value: 'array'},
                  {title: '参照（reference）', value: 'reference'},
                  {title: '画像パス（image-path）', value: 'image-path'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'source',
              title: '取得元（Source）',
              type: 'string',
              options: {
                list: [
                  {title: 'contentIdea', value: 'contentIdea'},
                  {title: 'campaignPlan', value: 'campaignPlan'},
                  {title: 'visualAssetPlan', value: 'visualAssetPlan'},
                  {title: 'brandProfile', value: 'brandProfile'},
                  {title: 'visualStyleProfile', value: 'visualStyleProfile'},
                  {title: '人間入力（human-input）', value: 'human-input'},
                  {title: 'ファイルパス（file-path）', value: 'file-path'},
                  {title: '定数（constant）', value: 'constant'},
                ],
              },
            }),
            defineField({
              name: 'required',
              title: '必須（Required）',
              type: 'boolean',
              initialValue: true,
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
      name: 'outputContract',
      title: '出力契約（Output Contract）',
      type: 'text',
      rows: 6,
      description: '返り値の構造をJSON schemaまたは平文で明示。',
    }),
    defineField({
      name: 'negativeInstructions',
      title: '禁止指示（Negative Instructions）',
      type: 'array',
      of: [{type: 'string'}],
      description: '完全自動化煽り / 顔写真 / paid PDF copy / API キー出力 など。',
    }),
    defineField({
      name: 'reviewRubric',
      title: 'レビュー基準（Review Rubric）',
      type: 'array',
      description: 'criterion / weight / passThreshold の3組で構成。Codex/ChatGPT のself-reviewと人間レビュー両方で使う。',
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
              description: '"pass" / "80%" / "manual-judgment" など。',
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
      name: 'successCriteria',
      title: '成功条件（Success Criteria）',
      type: 'array',
      of: [{type: 'string'}],
      description: 'runtime で機械チェック可能な条件（例: "image is 1200x675", "headline within central 70%"）。',
    }),
    defineField({
      name: 'variationStrategy',
      title: 'バリアント戦略（Variation Strategy）',
      type: 'string',
      options: {list: variationStrategyOptions, layout: 'radio'},
      initialValue: 'single',
      description: 'image-generation では3-pattern-default を推奨。',
    }),
    defineField({
      name: 'numberOfVariants',
      title: 'バリアント数（Number Of Variants）',
      type: 'number',
      initialValue: 1,
      description: 'variationStrategy = 3-pattern-default の場合は 3。',
    }),
    // --- image-generation 専用フィールド ---
    defineField({
      name: 'imageGenerationConfig',
      title: '画像生成設定（Image Generation Config）',
      type: 'object',
      description: 'category = image-generation / diagram-generation の場合のみ意味あり。',
      fields: [
        defineField({
          name: 'defaultLayoutPattern',
          title: '既定レイアウト（Default Layout Pattern）',
          type: 'string',
          options: {list: layoutPatternOptions},
          description: 'centered-title-only をデフォルトにしないこと。',
        }),
        defineField({
          name: 'allowedLayoutPatterns',
          title: '許可レイアウト（Allowed Layout Patterns）',
          type: 'array',
          of: [{type: 'string', options: {list: layoutPatternOptions}}],
        }),
        defineField({
          name: 'requiredVisualModules',
          title: '必須ビジュアルモジュール（Required Visual Modules）',
          type: 'object',
          fields: [
            defineField({name: 'headlineRequired', type: 'boolean', initialValue: true, title: 'headline必須'}),
            defineField({name: 'subtitleRequired', type: 'boolean', initialValue: false, title: 'subtitle必須'}),
            defineField({name: 'diagramNodesMin', type: 'number', initialValue: 2, title: 'diagramNodes最小数'}),
            defineField({name: 'diagramEdgesMin', type: 'number', initialValue: 1, title: 'diagramEdges最小数'}),
            defineField({name: 'iconHintsAllowed', type: 'boolean', initialValue: false, title: 'icon許可'}),
            defineField({name: 'bracketingLineRequired', type: 'boolean', initialValue: false, title: 'bracketing line必須'}),
          ],
        }),
        defineField({
          name: 'forbiddenPatterns',
          title: '禁止パターン（Forbidden Patterns）',
          type: 'array',
          of: [{type: 'string'}],
          description: '例: face photo / AI brain icon / robot / glass flare / gradient overload / text-only title card as default',
        }),
        defineField({
          name: 'selfReviewBeforeSaving',
          title: '保存前self-review（Self Review Before Saving）',
          type: 'boolean',
          initialValue: true,
          description: 'Codex/ChatGPT がreviewRubricで自己審査し、落第ならstop（placeholderで埋めない）。',
        }),
        defineField({
          name: 'candidateSavePolicy',
          title: '候補保存ポリシー（Candidate Save Policy）',
          type: 'text',
          rows: 4,
          description: 'assets/inbox/generated/<slug>/<assetSlug>/v00N.png に保存、v00X 上書き禁止 など。',
        }),
        defineField({
          name: 'finalPathPolicy',
          title: '最終パスポリシー（Final Path Policy）',
          type: 'text',
          rows: 3,
          description: 'assets/visuals/... への直接書き込み禁止、Visual Register approve & register 経由のみ。',
        }),
        defineField({
          name: 'visualRegisterApprovalRequired',
          title: 'Visual Register承認必須（Visual Register Approval Required）',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'expectedPixelSize',
          title: '想定ピクセルサイズ（Expected Pixel Size）',
          type: 'string',
          description: '例: 1200x675',
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
      ],
    }),
    // ---
    defineField({
      name: 'version',
      title: 'バージョン（Version）',
      type: 'string',
      initialValue: '0.1.0',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: '優先度（Priority）',
      type: 'number',
      description: '同じselection keyで複数matchした際の順位（高いほど優先）。',
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
      category: 'category',
      status: 'status',
    },
    prepare({title, category, status}) {
      return {
        title,
        subtitle: [category, status].filter(Boolean).join(' / '),
      }
    },
  },
})
