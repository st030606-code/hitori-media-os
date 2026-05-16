import {defineField, defineType} from 'sanity'

export const tool = defineType({
  name: 'tool',
  title: 'ツール（Tool）',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '名前（Name）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'カテゴリ（Category）',
      type: 'string',
      options: {
        list: [
          {title: 'コーディング（coding）', value: 'coding'},
          {title: '執筆（writing）', value: 'writing'},
          {title: '画像（image）', value: 'image'},
          {title: '音声（audio）', value: 'audio'},
          {title: '動画（video）', value: 'video'},
          {title: 'CMS（cms）', value: 'cms'},
          {title: 'レビュー（review）', value: 'review'},
          {title: 'その他（other）', value: 'other'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: '役割（Role）',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'usedFor',
      title: '用途（Used For）',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'costModel',
      title: '費用形態（Cost Model）',
      type: 'string',
      description: '無料、サブスク、従量課金、既存契約など、制作ワークフロー上の費用感を記録します。',
      options: {
        list: [
          {title: '無料（free）', value: 'free'},
          {title: 'サブスク（subscription）', value: 'subscription'},
          {title: '従量課金（paid-per-use）', value: 'paid-per-use'},
          {title: '既存契約（existing-contract）', value: 'existing-contract'},
          {title: '不明（unknown）', value: 'unknown'},
        ],
      },
    }),
    defineField({
      name: 'notes',
      title: 'メモ（Notes）',
      type: 'text',
      rows: 4,
      description: 'APIキー、認証情報、トークン、シークレットはここに保存しません。',
    }),
    defineField({
      name: 'relatedWorkflows',
      title: '関連ワークフロー（Related Workflows）',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'workflow'}]}],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
})
