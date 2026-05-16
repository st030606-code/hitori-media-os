import {defineField, defineType} from 'sanity'

export const publishedOutput = defineType({
  name: 'publishedOutput',
  title: '公開済みコンテンツ（Published Output）',
  type: 'document',
  fields: [
    defineField({
      name: 'sourcePlatformOutput',
      title: '元の媒体別下書き（Source Platform Output）',
      type: 'reference',
      to: [{type: 'platformOutput'}],
      description: '文章、台本、SNS、GitHub、有料記事などの公開元になる下書きを紐づけます。',
    }),
    defineField({
      name: 'sourceDiagramPlan',
      title: '元の図解計画（Source Diagram Plan）',
      type: 'reference',
      to: [{type: 'diagramPlan'}],
      description: '公開物が図解、画像、図解付き投稿の場合に紐づけます。',
    }),
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
    defineField({
      name: 'publishedUrl',
      title: '公開URL（Published URL）',
      type: 'url',
      description: '実際に公開されたページ、投稿、動画、音声、ドキュメントのURLです。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '公開日時（Published At）',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'performanceNotes',
      title: '反応メモ（Performance Notes）',
      type: 'text',
      rows: 4,
      description: '閲覧数、反応、コメント、保存、返信など、公開後に見えた結果を記録します。',
    }),
    defineField({
      name: 'learnings',
      title: '学び（Learnings）',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'nextAction',
      title: '次の行動（Next Action）',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      platform: 'platform',
      publishedAt: 'publishedAt',
    },
    prepare({title, platform, publishedAt}) {
      return {
        title,
        subtitle: [platform, publishedAt].filter(Boolean).join(' / '),
      }
    },
  },
})
