import {defineField, defineType} from 'sanity'

const actionTypeOptions = [
  {title: 'profile更新（profile-update）', value: 'profile-update'},
  {title: 'About Page更新（about-page-update）', value: 'about-page-update'},
  {title: 'Welcome Email更新（welcome-email-update）', value: 'welcome-email-update'},
  {title: 'Notes投稿・反応（notes-engagement）', value: 'notes-engagement'},
  {title: 'cross-post promotion', value: 'cross-post-promotion'},
  {title: 'reply campaign', value: 'reply-campaign'},
  {title: 'launch supporter outreach', value: 'launch-supporter-outreach'},
  {title: 'Post公開後フォロー（post-followup）', value: 'post-followup'},
]

const targetPlatformOptions = [
  {title: 'Substack（substack）', value: 'substack'},
  {title: 'Substack Notes（substack-notes）', value: 'substack-notes'},
  {title: 'X（x）', value: 'x'},
  {title: 'Threads（threads）', value: 'threads'},
  {title: 'note（note）', value: 'note'},
  {title: 'Instagram（instagram）', value: 'instagram'},
  {title: 'YouTube（youtube）', value: 'youtube'},
  {title: 'Email（email）', value: 'email'},
  {title: 'その他（other）', value: 'other'},
]

export const substackGrowthAction = defineType({
  name: 'substackGrowthAction',
  title: 'Substack成長施策（Substack Growth Action）',
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
      title: '関連する知識アイデア（Source Content Idea）',
      type: 'reference',
      to: [{type: 'contentIdea'}],
    }),
    defineField({
      name: 'publicationStrategy',
      title: '関連publication戦略（Publication Strategy）',
      type: 'reference',
      to: [{type: 'substackPublicationStrategy'}],
    }),
    defineField({
      name: 'actionType',
      title: '施策種別（Action Type）',
      type: 'string',
      options: {list: actionTypeOptions},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetPlatform',
      title: '対象プラットフォーム（Target Platform）',
      type: 'string',
      options: {list: targetPlatformOptions},
    }),
    defineField({
      name: 'actionDescription',
      title: '施策内容（Action Description）',
      type: 'text',
      rows: 4,
      description: '具体的に何をやるかを書く。手動運用前提。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'expectedOutcome',
      title: '期待する成果（Expected Outcome）',
      type: 'text',
      rows: 3,
      description: '何が起きると成功か。subscriberの増加だけでなく、返信 / 引用 / Notesの反応も含む。',
    }),
    defineField({
      name: 'subscriberCTA',
      title: '購読CTA文言（Subscriber CTA）',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'dueDate',
      title: '実施予定日（Due Date）',
      type: 'date',
    }),
    defineField({
      name: 'completedDate',
      title: '実施日（Completed Date）',
      type: 'date',
    }),
    defineField({
      name: 'resultNotes',
      title: '結果メモ（Result Notes）',
      type: 'text',
      rows: 4,
      description: '実施後の手動メモ。subscriber動向の感想や、反応の質を残す。',
    }),
    defineField({
      name: 'relatedPublishPackagePath',
      title: '関連publish packageパス（Publish Package Path）',
      type: 'string',
      description: '例: publish-packages/substack/building-hitori-media-os/',
    }),
    defineField({
      name: 'safetyNotes',
      title: '安全メモ（Safety Notes）',
      type: 'text',
      rows: 3,
      description: '自動投稿しない、API連携しない、subscribers個人情報を扱わないなどの注意点。',
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'planned',
      options: {
        list: [
          {title: '計画中（planned）', value: 'planned'},
          {title: '準備完了（ready）', value: 'ready'},
          {title: '実施済み（done）', value: 'done'},
          {title: 'スキップ（skipped）', value: 'skipped'},
          {title: '要レビュー（needs-review）', value: 'needs-review'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'status'},
  },
})
