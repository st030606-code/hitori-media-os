// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.
// Not imported from schemas/index.ts. Not registered in sanity.config.ts.
// This file is a design sketch for human review only.
// Source: docs/strategy-modules/substack-strategy-module.md, docs/strategy-sources/substack-textbook-notes.md
import {defineField, defineType} from 'sanity'

export const substackSubscriberMilestone = defineType({
  name: 'substackSubscriberMilestone',
  title: 'Substack subscriber マイルストーン（Substack Subscriber Milestone）',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicationStrategy',
      title: '関連publication戦略（Publication Strategy）',
      type: 'reference',
      to: [{type: 'substackPublicationStrategy'}],
    }),
    defineField({
      name: 'milestoneNumber',
      title: 'マイルストーン数値（Milestone Number）',
      type: 'number',
      description: '例: 10 / 50 / 100 / 500 / 1000。',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currentSubscriberCount',
      title: '現在のsubscriber数（Current Subscriber Count）',
      type: 'number',
      description: '手動で記録する。Substack APIを叩かない。',
    }),
    defineField({
      name: 'targetSubscriberCount',
      title: '目標subscriber数（Target Subscriber Count）',
      type: 'number',
    }),
    defineField({
      name: 'milestoneDate',
      title: '到達日（Milestone Date）',
      type: 'date',
      description: '到達した日。未到達の場合は空欄。',
    }),
    defineField({
      name: 'sourceCampaign',
      title: '関連キャンペーン（Source Campaign）',
      type: 'reference',
      to: [{type: 'contentIdea'}],
      description: 'どのキャンペーンがマイルストーンに最も寄与したか。',
    }),
    defineField({
      name: 'whatWorked',
      title: '効いたこと（What Worked）',
      type: 'text',
      rows: 4,
      description: '具体的にどのPost / Notes / 流入経路が効いたかをメモする。',
    }),
    defineField({
      name: 'subscriberSources',
      title: 'subscriber流入経路（Subscriber Sources）',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'source',
              title: '流入元（Source）',
              type: 'string',
              options: {
                list: [
                  {title: 'X / Threads', value: 'x-threads'},
                  {title: 'note', value: 'note'},
                  {title: 'Substack Notes', value: 'substack-notes'},
                  {title: '他Publication recommend', value: 'recommend'},
                  {title: 'YouTube / Podcast', value: 'youtube-podcast'},
                  {title: 'email', value: 'email'},
                  {title: 'その他（other）', value: 'other'},
                ],
              },
            }),
            defineField({name: 'count', title: '推定数（Count）', type: 'number'}),
            defineField({name: 'notes', title: 'メモ（Notes）', type: 'text', rows: 2}),
          ],
        },
      ],
    }),
    defineField({
      name: 'nextActions',
      title: '次のアクション（Next Actions）',
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
          {title: '到達（reached）', value: 'reached'},
          {title: '未達（missed）', value: 'missed'},
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
