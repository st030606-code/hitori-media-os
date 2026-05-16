// Active schema (activated 2026-05-14, batch 0096; activated after brandProfile / visualStyleProfile / promptTemplate).
// Source / design history:
//   docs/48-campaign-generation-flow.md
//   docs/49-platform-selection-model.md
//   schemas/proposed/_design-campaignPlan.md (design sketch, retained for reference)
//
// References:
//   contentIdea (active) — strong ref
//   brandProfile (active) — weak ref

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

const contentDepthOptions = [
  {title: 'フックのみ（hook-only）', value: 'hook-only'},
  {title: '要約（summary）', value: 'summary'},
  {title: '本文記事（full-article）', value: 'full-article'},
  {title: '長文研究（long-form-research）', value: 'long-form-research'},
]

const visualRequirementOptions = [
  {title: 'なし（none）', value: 'none'},
  {title: '最小（minimal）', value: 'minimal'},
  {title: '標準（standard）', value: 'standard'},
  {title: '装飾的（rich）', value: 'rich'},
]

const publishModeOptions = [
  {title: '手動のみ（manual-only）', value: 'manual-only'},
  {title: '半自動（semi-auto）', value: 'semi-auto'},
  {title: '自動化可能（api-auto-eligible）', value: 'api-auto-eligible'},
]

const productionModeOptions = [
  {title: 'ひとり（solo）', value: 'solo'},
  {title: '協力者あり（collaborator）', value: 'collaborator'},
  {title: '外注（agency）', value: 'agency'},
]

const cadenceOptions = [
  {title: '随時（ad-hoc）', value: 'ad-hoc'},
  {title: '週次（weekly）', value: 'weekly'},
  {title: '隔週（biweekly）', value: 'biweekly'},
  {title: '月次（monthly）', value: 'monthly'},
  {title: 'キャンペーン単位（per-campaign）', value: 'per-campaign'},
]

const priorityOptions = [
  {title: 'P0（必須・最優先）', value: 'P0'},
  {title: 'P1（必須）', value: 'P1'},
  {title: 'P2（推奨）', value: 'P2'},
  {title: 'P3（任意）', value: 'P3'},
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

const campaignTypeOptions = [
  {title: 'リリースレビュー（release-review）', value: 'release-review'},
  {title: '開発ログ（build-log）', value: 'build-log'},
  {title: '教育キャンペーン（educational）', value: 'educational'},
  {title: '有料化準備（paid-readiness）', value: 'paid-readiness'},
  {title: 'ケーススタディ（case-study）', value: 'case-study'},
  {title: 'ローンチ（launch）', value: 'launch'},
  {title: 'マイルストーン（milestone）', value: 'milestone'},
]

const contentModeOptions = [
  {title: '開発ログ（build-log）', value: 'build-log'},
  {title: '教育コンテンツ（educational）', value: 'educational'},
  {title: '有料化準備（paid-readiness）', value: 'paid-readiness'},
  {title: 'ケーススタディ（case-study）', value: 'case-study'},
  {title: '意見・主張（opinion）', value: 'opinion'},
  {title: 'building-in-public（building-in-public）', value: 'building-in-public'},
]

const progressStateOptions = [
  {title: '未着手（not-started）', value: 'not-started'},
  {title: '進行中（in-progress）', value: 'in-progress'},
  {title: 'レビュー待ち（pending-review）', value: 'pending-review'},
  {title: '完了（done）', value: 'done'},
  {title: 'スキップ（skipped）', value: 'skipped'},
  {title: 'ブロック中（blocked）', value: 'blocked'},
]

export const campaignPlan = defineType({
  name: 'campaignPlan',
  title: 'キャンペーン計画（Campaign Plan）',
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
      description: 'publish-packages/<platform>/<slug> と一致させる。例: building-hitori-media-os',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceContentIdea',
      title: '元の知識アイデア（Source Content Idea）',
      type: 'reference',
      to: [{type: 'contentIdea'}],
      validation: (Rule) => Rule.required(),
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
      name: 'campaignType',
      title: 'キャンペーン種別（Campaign Type）',
      type: 'string',
      options: {list: campaignTypeOptions, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentMode',
      title: 'コンテンツモード（Content Mode）',
      type: 'string',
      options: {list: contentModeOptions, layout: 'radio'},
    }),
    defineField({
      name: 'coreThesis',
      title: '中心主張（Core Thesis）',
      type: 'text',
      rows: 3,
      description: 'sourceContentIdea.coreThesis のキャンペーン用ミラー（省略可、初期は contentIdea から手動コピー）。',
    }),
    defineField({
      name: 'targetReader',
      title: '想定読者（Target Reader）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    // --- selectedPlatforms ---
    defineField({
      name: 'selectedPlatforms',
      title: '選択platform（Selected Platforms）',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
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
            defineField({
              name: 'enabled',
              title: '有効（Enabled）',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'priority',
              title: '優先度（Priority）',
              type: 'string',
              options: {list: priorityOptions},
            }),
            defineField({
              name: 'contentDepth',
              title: 'コンテンツ深さ（Content Depth）',
              type: 'string',
              options: {list: contentDepthOptions},
            }),
            defineField({
              name: 'visualRequirement',
              title: 'visual要件（Visual Requirement）',
              type: 'string',
              options: {list: visualRequirementOptions},
            }),
            defineField({
              name: 'publishMode',
              title: '公開モード（Publish Mode）',
              type: 'string',
              options: {list: publishModeOptions},
              initialValue: 'manual-only',
            }),
            defineField({
              name: 'productionMode',
              title: '制作体制（Production Mode）',
              type: 'string',
              options: {list: productionModeOptions},
              initialValue: 'solo',
            }),
            defineField({
              name: 'cadence',
              title: '頻度（Cadence）',
              type: 'string',
              options: {list: cadenceOptions},
              initialValue: 'per-campaign',
            }),
            defineField({
              name: 'requiredAssets',
              title: '必須asset（Required Assets）',
              type: 'array',
              of: [{type: 'string', options: {list: assetTypeOptions}}],
            }),
            defineField({
              name: 'optionalAssets',
              title: '任意asset（Optional Assets）',
              type: 'array',
              of: [{type: 'string', options: {list: assetTypeOptions}}],
            }),
            defineField({
              name: 'notes',
              title: 'メモ（Notes）',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: {
            select: {
              platform: 'platform',
              priority: 'priority',
              depth: 'contentDepth',
            },
            prepare({platform, priority, depth}) {
              return {
                title: platform || '(未設定)',
                subtitle: [priority, depth].filter(Boolean).join(' / '),
              }
            },
          },
        },
      ],
    }),
    // --- platformGenerationSettings ---
    defineField({
      name: 'platformGenerationSettings',
      title: 'platform別生成設定（Platform Generation Settings）',
      type: 'array',
      description: 'platformごとの生成順序、依存、特殊指示。selectedPlatformsより細かい指示。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'generationOrder',
              title: '生成順序（Generation Order）',
              type: 'number',
            }),
            defineField({
              name: 'dependsOn',
              title: '依存platform（Depends On）',
              type: 'array',
              of: [{type: 'string', options: {list: platformOptions}}],
              description: '例: substackがnoteのhero masterを共有する場合、["note"] を入れる。',
            }),
            defineField({
              name: 'sharedMasterAssets',
              title: '共有masterアセット（Shared Master Assets）',
              type: 'array',
              of: [{type: 'string'}],
              description: '例: campaign-hero-v1.png',
            }),
            defineField({
              name: 'specialInstructions',
              title: '特殊指示（Special Instructions）',
              type: 'text',
              rows: 3,
            }),
          ],
        },
      ],
    }),
    // --- required records / assets / templates ---
    defineField({
      name: 'requiredRecords',
      title: '必須Sanityレコード（Required Records）',
      type: 'array',
      description: 'このcampaignで生成すべきSanity document IDのリスト。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'recordType',
              title: 'レコード種別（Record Type）',
              type: 'string',
              description: '例: platformOutput / substackPostPlan / substackNotesPlan / substackGrowthAction / visualAssetPlan / diagramPlan',
            }),
            defineField({
              name: 'recordId',
              title: 'レコードID（Record ID）',
              type: 'string',
            }),
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'state',
              title: '状態（State）',
              type: 'string',
              options: {list: progressStateOptions},
              initialValue: 'not-started',
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
      name: 'requiredVisualAssets',
      title: '必須ビジュアルアセット（Required Visual Assets）',
      type: 'array',
      description: 'visualAssetPlan ID と、その campaign 内優先度 / 共有方針 を記録。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'visualAssetPlanId',
              title: 'visualAssetPlan ID',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'assetSlug',
              title: 'asset slug',
              type: 'string',
              description: '例: note-hero-v1 / x-hook-main-v1',
            }),
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'assetType',
              title: 'assetType',
              type: 'string',
              options: {list: assetTypeOptions},
            }),
            defineField({
              name: 'priority',
              title: '優先度（Priority）',
              type: 'string',
              options: {list: priorityOptions},
            }),
            defineField({
              name: 'sharesMasterWith',
              title: 'masterを共有する相手（Shares Master With）',
              type: 'array',
              of: [{type: 'string'}],
              description: '例: note-hero-v1 と substack-header-v1 が campaign-hero-v1.png を共有する場合。',
            }),
            defineField({
              name: 'state',
              title: '状態（State）',
              type: 'string',
              options: {list: progressStateOptions},
              initialValue: 'not-started',
            }),
            defineField({
              name: 'localAssetPath',
              title: 'localAssetPath',
              type: 'string',
              description: 'Visual Register approve & register 後の最終 path。',
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
      name: 'promptTemplateSelections',
      title: 'promptTemplate選定（Prompt Template Selections）',
      type: 'array',
      description: 'このcampaignで採用するpromptTemplate ID のリスト。category × platform × assetType 軸で1つずつ。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'promptTemplateId',
              title: 'promptTemplate ID',
              type: 'string',
            }),
            defineField({
              name: 'category',
              title: 'category',
              type: 'string',
              description: '例: image-generation / text-draft',
            }),
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'assetType',
              title: 'assetType',
              type: 'string',
              options: {list: assetTypeOptions},
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
    // --- publish package & review ---
    defineField({
      name: 'publishPackagePaths',
      title: 'publish-packageパス（Publish Package Paths）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'path',
              title: 'path',
              type: 'string',
              description: '例: publish-packages/x/building-hitori-media-os/',
            }),
            defineField({
              name: 'state',
              title: '状態（State）',
              type: 'string',
              options: {list: progressStateOptions},
              initialValue: 'not-started',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'releaseReviewPath',
      title: 'release-reviewパス（Release Review Path）',
      type: 'string',
      description: '例: publish-packages/campaigns/building-hitori-media-os-release-review/',
    }),
    // --- progress / human gates ---
    defineField({
      name: 'progressStatus',
      title: '進捗状況（Progress Status）',
      type: 'object',
      fields: [
        defineField({
          name: 'overall',
          title: '全体（Overall）',
          type: 'string',
          options: {list: progressStateOptions},
          initialValue: 'not-started',
        }),
        defineField({
          name: 'textDrafts',
          title: 'テキスト下書き（Text Drafts）',
          type: 'string',
          description: '例: "4/4 done"',
        }),
        defineField({
          name: 'visuals',
          title: 'ビジュアル（Visuals）',
          type: 'string',
          description: '例: "1/7 saved, 6 pending"',
        }),
        defineField({
          name: 'publishPackages',
          title: 'publish-package（Publish Packages）',
          type: 'string',
        }),
        defineField({
          name: 'releaseReview',
          title: 'release-review',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'humanReviewGates',
      title: '人間レビューゲート（Human Review Gates）',
      type: 'array',
      description: '各段階で必須の人間判断ポイント。state が done になっていない場合、後続を進めない。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'gateName',
              title: 'gate name',
              type: 'string',
              description: '例: selectedPlatforms 確認 / claims最終確認 / Visual Register approve / Sanity手動反映 / release-review final',
            }),
            defineField({
              name: 'state',
              title: '状態（State）',
              type: 'string',
              options: {list: progressStateOptions},
              initialValue: 'not-started',
            }),
            defineField({
              name: 'reviewer',
              title: 'reviewer',
              type: 'string',
              description: '例: 人間（自分）/ 編集者A / 外部レビュー',
            }),
            defineField({
              name: 'completedAt',
              title: '完了日時（Completed At）',
              type: 'datetime',
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
      name: 'manualPublishingStatus',
      title: '手動公開状況（Manual Publishing Status）',
      type: 'array',
      description: 'platformごとの公開URL / 公開日時 / 反応メモを記録。auto-postingはまだ実装しない。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'platform',
              type: 'string',
              options: {list: platformOptions},
            }),
            defineField({
              name: 'publishedUrl',
              title: 'publishedUrl',
              type: 'url',
            }),
            defineField({
              name: 'publishedAt',
              title: 'publishedAt',
              type: 'datetime',
            }),
            defineField({
              name: 'reactionNotes',
              title: 'reactionNotes',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'state',
              title: '状態（State）',
              type: 'string',
              options: {list: progressStateOptions},
              initialValue: 'not-started',
            }),
          ],
        },
      ],
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
      description: 'campaign 全体の自動化レベル。auto-posting は scope 外、Visual Register と Sanity 反映の人間 gate は維持。',
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          {title: '下書き（draft）', value: 'draft'},
          {title: '計画中（planning）', value: 'planning'},
          {title: '生成中（generating）', value: 'generating'},
          {title: 'レビュー中（reviewing）', value: 'reviewing'},
          {title: '公開済み（published）', value: 'published'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'バージョン（Version）',
      type: 'string',
      initialValue: '0.1.0',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'メモ（Notes）',
      type: 'text',
      rows: 5,
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
      campaignType: 'campaignType',
      status: 'status',
    },
    prepare({title, campaignType, status}) {
      return {
        title,
        subtitle: [campaignType, status].filter(Boolean).join(' / '),
      }
    },
  },
})
