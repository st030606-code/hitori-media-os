import {defineField, defineType} from 'sanity'

const notesPurposeOptions = [
  {title: '発見（discovery）', value: 'discovery'},
  {title: '会話（interaction）', value: 'interaction'},
  {title: 'Post予告（pre-post）', value: 'pre-post'},
  {title: 'Post launch follow-up', value: 'post-launch'},
  {title: 'Q&A / 質問投げ', value: 'question'},
  {title: 'build log', value: 'build-log'},
  {title: 'lesson learned', value: 'lesson-learned'},
  {title: 'soft CTA', value: 'soft-cta'},
]

export const substackNotesPlan = defineType({
  name: 'substackNotesPlan',
  title: 'Substack Notes計画（Substack Notes Plan）',
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
      name: 'relatedPostPlan',
      title: '関連するPost計画（Related Post Plan）',
      type: 'reference',
      to: [{type: 'substackPostPlan'}],
      description: 'どのSubstack PostのためのNotes群か。',
    }),
    defineField({
      name: 'publicationStrategy',
      title: 'Publication戦略（Publication Strategy）',
      type: 'reference',
      to: [{type: 'substackPublicationStrategy'}],
    }),
    defineField({
      name: 'notesPurpose',
      title: 'Notes全体の目的（Notes Purpose）',
      type: 'string',
      options: {
        list: notesPurposeOptions,
      },
    }),
    defineField({
      name: 'prePostNotes',
      title: 'Post前のNotes（Pre-Post Notes）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'noteType',
              title: '種類（Type）',
              type: 'string',
              options: {list: notesPurposeOptions},
            }),
            defineField({name: 'body', title: '本文（Body）', type: 'text', rows: 3}),
          ],
        },
      ],
    }),
    defineField({
      name: 'postLaunchNotes',
      title: 'Post公開後のNotes（Post Launch Notes）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'noteType',
              title: '種類（Type）',
              type: 'string',
              options: {list: notesPurposeOptions},
            }),
            defineField({name: 'body', title: '本文（Body）', type: 'text', rows: 3}),
          ],
        },
      ],
    }),
    defineField({
      name: 'conversationPrompts',
      title: '会話を促す問い（Conversation Prompts）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'ctaVariants',
      title: 'CTA案（CTA Variants）',
      type: 'array',
      of: [{type: 'string'}],
      description: 'soft / reply-first / conversation など、複数の案を比較する。',
    }),
    defineField({
      name: 'humanReviewChecklist',
      title: 'Human Review Checklist',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'planned',
      options: {
        list: [
          {title: '計画中（planned）', value: 'planned'},
          {title: '下書き作成済み（drafted）', value: 'drafted'},
          {title: '人間レビュー待ち（ready-for-human-edit）', value: 'ready-for-human-edit'},
          {title: '一部公開済み（partially-published）', value: 'partially-published'},
          {title: '完了（completed）', value: 'completed'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
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
