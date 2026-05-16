import {defineField, defineType} from 'sanity'

export const substackPostPlan = defineType({
  name: 'substackPostPlan',
  title: 'Substack Post計画（Substack Post Plan）',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
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
      name: 'publicationStrategy',
      title: '関連publication戦略（Publication Strategy）',
      type: 'reference',
      to: [{type: 'substackPublicationStrategy'}],
      description: 'どのSubstack発行戦略のもとで出すPostか。',
    }),
    defineField({
      name: 'campaignSlug',
      title: 'キャンペーンslug（Campaign Slug）',
      type: 'string',
      description: '例: building-hitori-media-os。publish-packages配下のslugと一致させる。',
    }),
    defineField({
      name: 'titleOptions',
      title: 'タイトル候補（Title Options）',
      type: 'array',
      of: [{type: 'string'}],
      description: '最終採用は1つ。残りはレビュー時に削除またはアーカイブ。',
    }),
    defineField({
      name: 'emailSubjectOptions',
      title: 'Email Subject候補（Email Subject Options）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'previewText',
      title: 'プレビューテキスト（Preview Text）',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'openingAngle',
      title: '冒頭の切り口（Opening Angle）',
      type: 'text',
      rows: 4,
      description: '制作ログ / 個人的気づき / 現在地など、Substackらしい入りを書く。',
    }),
    defineField({
      name: 'mainSections',
      title: '本文セクション（Main Sections）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'heading', title: '見出し（Heading）', type: 'string'}),
            defineField({name: 'body', title: '本文（Body）', type: 'text', rows: 6}),
          ],
        },
      ],
    }),
    defineField({
      name: 'readerQuestion',
      title: '読者への問い（Reader Question）',
      type: 'text',
      rows: 2,
      description: '返信誘導の問い。煽らない。',
    }),
    defineField({
      name: 'subscriberCTA',
      title: '購読CTA（Subscriber CTA）',
      type: 'text',
      rows: 2,
      description: 'soft CTAを基本とする。',
    }),
    defineField({
      name: 'relatedNotesPlan',
      title: '関連Notes計画（Related Notes Plan）',
      type: 'reference',
      to: [{type: 'substackNotesPlan'}],
      description: 'このPostに紐づくSubstack Notes計画。',
    }),
    defineField({
      name: 'repurposeNotes',
      title: '転用メモ（Repurpose Notes）',
      type: 'text',
      rows: 4,
      description: 'X / note / Threads / YouTube / Shorts / Podcastへの再利用方針。',
    }),
    defineField({
      name: 'publishPackagePath',
      title: 'publish package パス（Publish Package Path）',
      type: 'string',
      description: '例: publish-packages/substack/building-hitori-media-os/。ローカルfolderへのリファレンス。',
    }),
    defineField({
      name: 'humanReviewChecklist',
      title: 'Human Review Checklist',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Substack Strategy Moduleの安全条件（subscribe CTAなしで公開しない、paid急がない等）。',
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'idea',
      options: {
        list: [
          {title: 'アイデア（idea）', value: 'idea'},
          {title: 'アウトライン確定（outline-ready）', value: 'outline-ready'},
          {title: '下書き作成済み（draft-ready）', value: 'draft-ready'},
          {title: '人間レビュー待ち（ready-for-human-edit）', value: 'ready-for-human-edit'},
          {title: '公開済み（published）', value: 'published'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedUrl',
      title: '公開URL（Published URL）',
      type: 'url',
      description: '公開後に手動で記録する。',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'レビューメモ（Review Notes）',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'status'},
  },
})
