import {defineField, defineType} from 'sanity'

export const workflow = defineType({
  name: 'workflow',
  title: 'ワークフロー（Workflow）',
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
      name: 'promptsUsed',
      title: '使用プロンプト（Prompts Used）',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'prompt'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'toolsUsed',
      title: '使用ツール（Tools Used）',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tool'}]}],
    }),
    defineField({
      name: 'platformOutputs',
      title: '媒体別下書き（Platform Outputs）',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'platformOutput'}]}],
    }),
    defineField({
      name: 'diagramPlans',
      title: '図解計画（Diagram Plans）',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'diagramPlan'}]}],
    }),
    defineField({
      name: 'outputFiles',
      title: '出力ファイル（Output Files）',
      type: 'array',
      of: [{type: 'string'}],
      description: 'このタスク単位のワークフローで作成したローカル出力ファイルのパスです。',
    }),
    defineField({
      name: 'workflowMode',
      title: 'ワークフロー種別（Workflow Mode）',
      type: 'string',
      initialValue: 'manual',
      options: {
        list: [
          {title: '手動（manual）', value: 'manual'},
          {title: '半自動（semi-automatic）', value: 'semi-automatic'},
          {title: '自動（automated）', value: 'automated'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'observations',
      title: '観察メモ（Observations）',
      type: 'text',
      rows: 5,
      description: 'タスクやdevlog単位の観察メモです。必要がない限り、小さな出力ごとにワークフローを細分化しすぎないようにします。',
    }),
    defineField({
      name: 'devlogReference',
      title: 'devlog参照（Devlog Reference）',
      type: 'string',
      description: '例: docs/devlog/0004-video-audio-visual-outputs.md',
    }),
    defineField({
      name: 'reviewRequired',
      title: 'レビュー必須（Review Required）',
      type: 'boolean',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mode: 'workflowMode',
    },
    prepare({title, mode}) {
      return {
        title,
        subtitle: mode,
      }
    },
  },
})
