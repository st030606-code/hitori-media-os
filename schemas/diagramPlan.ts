import {defineField, defineType} from 'sanity'

export const diagramPlan = defineType({
  name: 'diagramPlan',
  title: '図解計画（Diagram Plan）',
  type: 'document',
  fields: [
    defineField({
      name: 'sourceContentIdea',
      title: '元の知識アイデア（Source Content Idea）',
      type: 'reference',
      to: [{type: 'contentIdea'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceWorkflow',
      title: '元ワークフロー（Source Workflow）',
      type: 'reference',
      to: [{type: 'workflow'}],
      weak: true,
      description: '任意項目です。この図解計画を作ったタスク単位のワークフローを紐づけます。',
    }),
    defineField({
      name: 'visualType',
      title: 'ビジュアル種別（Visual Type）',
      type: 'string',
      options: {
        list: [
          {title: '図解（diagram）', value: 'diagram'},
          {title: 'カルーセル（carousel）', value: 'carousel'},
          {title: 'サムネイル（thumbnail）', value: 'thumbnail'},
          {title: '図解付き投稿（paired-post）', value: 'paired-post'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetPlatform',
      title: '対象媒体（Target Platform）',
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
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'layoutIdea',
      title: 'レイアウト案（Layout Idea）',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'labels',
      title: '表示ラベル（Labels）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'imagePrompt',
      title: '画像生成プロンプト（Image Prompt）',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'pairedPostText',
      title: '同時投稿テキスト（Paired Post Text）',
      type: 'text',
      rows: 4,
      description: 'XやThreadsなど、図解と一緒に投稿する短い本文案です。',
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'planned',
      options: {
        list: [
          {title: '計画済み（planned）', value: 'planned'},
          {title: '下書き作成済み（drafted）', value: 'drafted'},
          {title: 'デザイン済み（designed）', value: 'designed'},
          {title: 'レビュー済み（reviewed）', value: 'reviewed'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'assetPath',
      title: 'アセットパス（Asset Path）',
      type: 'string',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'アスペクト比（Aspect Ratio）',
      type: 'string',
      options: {
        list: [
          {title: '横長（16:9）', value: '16:9'},
          {title: '正方形（1:1）', value: '1:1'},
          {title: '縦長投稿（4:5）', value: '4:5'},
          {title: '縦長動画（9:16）', value: '9:16'},
        ],
      },
    }),
    defineField({
      name: 'reviewNotes',
      title: 'レビューメモ（Review Notes）',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      visualType: 'visualType',
      targetPlatform: 'targetPlatform',
    },
    prepare({title, visualType, targetPlatform}) {
      return {
        title,
        subtitle: [visualType, targetPlatform].filter(Boolean).join(' / '),
      }
    },
  },
})
