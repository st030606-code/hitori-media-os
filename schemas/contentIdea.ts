import {defineField, defineType} from 'sanity'

export const contentIdea = defineType({
  name: 'contentIdea',
  title: '知識アイデア（Content Idea）',
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
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'idea',
      options: {
        list: [
          {title: 'アイデア（idea）', value: 'idea'},
          {title: 'リサーチ済み（researched）', value: 'researched'},
          {title: '下書き作成済み（drafted）', value: 'drafted'},
          {title: 'レビュー済み（reviewed）', value: 'reviewed'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: '要約（Summary）',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rawInput',
      title: '元メモ・素材（Raw Input）',
      type: 'text',
      rows: 6,
      description:
        '将来のダッシュボードで最初に入力する未整理メモ、Obsidianメモ、会話ログ、記事アイデアなど。AIがclaims、examples、objections、platformAnglesを整理するための素材。',
    }),
    defineField({
      name: 'coreThesis',
      title: '中心主張（Core Thesis）',
      type: 'text',
      rows: 4,
      description: 'すべての媒体別出力で守る、この知識アイデアの一番大事な主張です。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audience',
      title: '想定読者（Audience）',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'audiencePain',
      title: '読者の悩み（Audience Pain）',
      type: 'text',
      rows: 3,
      description: 'この知識アイデアが解決したい、読者の具体的な悩みや不満です。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentPillars',
      title: 'コンテンツの柱（Content Pillars）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'claims',
      title: '主張リスト（Claims）',
      type: 'array',
      description: '記事・SNS・台本で使う主張を分解して保存します。根拠が弱い主張は確認フラグを付けます。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'claim',
              title: '主張（Claim）',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'supportingEvidence',
              title: '補足根拠（Supporting Evidence）',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'confidence',
              title: '確信度（Confidence）',
              type: 'string',
              options: {
                list: [
                  {title: '低い（low）', value: 'low'},
                  {title: '中くらい（medium）', value: 'medium'},
                  {title: '高い（high）', value: 'high'},
                ],
              },
            }),
            defineField({
              name: 'needsVerification',
              title: '要確認（Needs Verification）',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'evidence',
      title: '根拠（Evidence）',
      type: 'array',
      description: '主張を支える事実、観察、引用元、一次情報などを保存します。未確認の断定を避けるための欄です。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'type', title: '種類（Type）', type: 'string'}),
            defineField({
              name: 'description',
              title: '説明（Description）',
              type: 'text',
              rows: 2,
            }),
            defineField({name: 'sourceUrl', title: '参照URL（Source URL）', type: 'url'}),
            defineField({name: 'notes', title: 'メモ（Notes）', type: 'text', rows: 2}),
          ],
        },
      ],
    }),
    defineField({
      name: 'examples',
      title: '具体例（Examples）',
      type: 'array',
      description: '読者がイメージしやすくなる例、ミニケース、JSON例などを保存します。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'タイトル（Title）', type: 'string'}),
            defineField({
              name: 'description',
              title: '説明（Description）',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'objections',
      title: '反論・懸念（Objections）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'objection',
              title: '反論（Objection）',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'response',
              title: '返答（Response）',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'tone',
      title: 'トーン（Tone）',
      type: 'object',
      fields: [
        defineField({
          name: 'voice',
          title: '語り口（Voice）',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'styleNotes',
          title: '文体メモ（Style Notes）',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({
          name: 'avoid',
          title: '避ける表現（Avoid）',
          type: 'array',
          of: [{type: 'string'}],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceLinks',
      title: '参照リンク（Source Links）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'type', title: '種類（Type）', type: 'string'}),
            defineField({name: 'title', title: 'タイトル（Title）', type: 'string'}),
            defineField({name: 'reference', title: '参照先（Reference）', type: 'string'}),
            defineField({name: 'notes', title: 'メモ（Notes）', type: 'text', rows: 2}),
          ],
        },
      ],
    }),
    defineField({
      name: 'platformAngles',
      title: '媒体別の切り口（Platform Angles）',
      type: 'array',
      description: 'note、Substack、X、YouTubeなど、媒体ごとの切り口・フック・CTAを保存します。',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: '媒体（Platform）',
              type: 'string',
              options: {
                list: [
                  {title: 'note（note）', value: 'note'},
                  {title: 'Substack（substack）', value: 'substack'},
                  {title: 'Threads（threads）', value: 'threads'},
                  {title: 'X（x）', value: 'x'},
                  {title: 'YouTube（youtube）', value: 'youtube'},
                  {title: 'Shorts（shorts）', value: 'shorts'},
                  {title: 'Podcast（podcast）', value: 'podcast'},
                  {title: '図解（diagram）', value: 'diagram'},
                  {title: 'GitHub（github）', value: 'github'},
                  {title: '有料記事（paid）', value: 'paid'},
                  {title: 'Instagram（instagram）', value: 'instagram'},
                  {title: 'ニュースレター（newsletter）', value: 'newsletter'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'targetReader', title: '対象読者（Target Reader）', type: 'string'}),
            defineField({name: 'hook', title: 'フック（Hook）', type: 'text', rows: 2}),
            defineField({name: 'formatNotes', title: '形式メモ（Format Notes）', type: 'text', rows: 2}),
            defineField({name: 'callToAction', title: '行動喚起（Call To Action）', type: 'text', rows: 2}),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'outputChecklist',
      title: '出力チェックリスト（Output Checklist）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'outputType',
              title: '出力種別（Output Type）',
              type: 'string',
              options: {
                list: [
                  {title: 'note記事（note-article）', value: 'note-article'},
                  {title: 'Substack投稿（substack-post）', value: 'substack-post'},
                  {title: 'Threadsスレッド（threads-thread）', value: 'threads-thread'},
                  {title: 'X投稿（x-post）', value: 'x-post'},
                  {title: 'YouTube台本（youtube-script）', value: 'youtube-script'},
                  {title: 'Shorts台本（shorts-script）', value: 'shorts-script'},
                  {title: 'Podcast台本（podcast-script）', value: 'podcast-script'},
                  {title: '図解計画（diagram-plan）', value: 'diagram-plan'},
                  {title: 'GitHubドキュメント（github-doc）', value: 'github-doc'},
                  {title: '有料記事構成（paid-article-outline）', value: 'paid-article-outline'},
                  {title: 'Instagramカルーセル（instagram-carousel）', value: 'instagram-carousel'},
                  {title: 'ニュースレター（newsletter）', value: 'newsletter'},
                ],
              },
            }),
            defineField({name: 'status', title: '状態（Status）', type: 'string'}),
            defineField({name: 'localOutputPath', title: 'ローカル出力パス（Local Output Path）', type: 'string'}),
            defineField({name: 'publishedUrl', title: '公開URL（Published URL）', type: 'url'}),
            defineField({name: 'notes', title: 'メモ（Notes）', type: 'text', rows: 2}),
          ],
        },
      ],
    }),
    defineField({
      name: 'personalContext',
      title: '個人的背景（Personal Context）',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
    },
  },
})
