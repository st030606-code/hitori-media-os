import {defineField, defineType} from 'sanity'

export const platformOutput = defineType({
  name: 'platformOutput',
  title: '媒体別下書き（Platform Output）',
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
      description: '任意項目です。この下書きを作ったタスク単位のワークフローを紐づけます。',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
    }),
    defineField({
      name: 'draftBody',
      title: '下書き本文（Draft Body）',
      type: 'text',
      rows: 18,
      description: '媒体別に生成・編集した下書き本文です。最終公開文ではなく、人間レビュー前提で扱います。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'localOutputPath',
      title: 'ローカル出力パス（Local Output Path）',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'drafted',
      options: {
        list: [
          {title: '下書き作成済み（drafted）', value: 'drafted'},
          {title: 'レビュー済み（reviewed）', value: 'reviewed'},
          {title: '修正済み（revised）', value: 'revised'},
          {title: '公開準備OK（ready）', value: 'ready'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewNotes',
      title: 'レビューメモ（Review Notes）',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'generatedFromPrompt',
      title: '使用プロンプト（Generated From Prompt）',
      type: 'reference',
      to: [{type: 'prompt'}],
      description: 'この下書きの生成に使った保存済みプロンプトです。改善時にどのプロンプトへ戻すかを追跡します。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outputLength',
      title: '出力の長さ（Output Length）',
      type: 'string',
    }),
    defineField({
      name: 'targetFormat',
      title: '対象フォーマット（Target Format）',
      type: 'string',
    }),
    defineField({
      name: 'primaryCTA',
      title: '主要CTA（Primary CTA）',
      type: 'string',
    }),
    defineField({
      name: 'contentStatus',
      title: 'コンテンツ状態（Content Status）',
      type: 'string',
      options: {
        list: [
          {title: '下書き（draft）', value: 'draft'},
          {title: 'レビュー必要（needs-review）', value: 'needs-review'},
          {title: '準備OK（ready）', value: 'ready'},
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      platform: 'platform',
      status: 'status',
    },
    prepare({title, platform, status}) {
      return {
        title: title || 'Untitled platform output',
        subtitle: [platform, status].filter(Boolean).join(' / '),
      }
    },
  },
})
