import {defineField, defineType} from 'sanity'

const platformOptions = [
  {title: 'note（note）', value: 'note'},
  {title: 'Substack（substack）', value: 'substack'},
  {title: 'X（x）', value: 'x'},
  {title: 'Threads（threads）', value: 'threads'},
  {title: 'Instagram（instagram）', value: 'instagram'},
  {title: 'YouTube（youtube）', value: 'youtube'},
  {title: 'Shorts（shorts）', value: 'shorts'},
  {title: 'Podcast（podcast）', value: 'podcast'},
  {title: 'GitHub（github）', value: 'github'},
  {title: '有料記事（paid）', value: 'paid'},
  {title: 'ニュースレター（newsletter）', value: 'newsletter'},
]

const assetTypeOptions = [
  {title: 'ヒーロー画像（hero）', value: 'hero'},
  {title: 'アイキャッチ（eye-catch）', value: 'eye-catch'},
  {title: 'セクション図解（section-diagram）', value: 'section-diagram'},
  {title: '比較図（comparison-diagram）', value: 'comparison-diagram'},
  {title: 'フロー図（flow-diagram）', value: 'flow-diagram'},
  {title: 'アーキテクチャ図（architecture-diagram）', value: 'architecture-diagram'},
  {title: 'スキーマ図（schema-diagram）', value: 'schema-diagram'},
  {title: 'パイプライン図（pipeline-diagram）', value: 'pipeline-diagram'},
  {title: 'カルーセル表紙（carousel-cover）', value: 'carousel-cover'},
  {title: 'カルーセルスライド（carousel-slide）', value: 'carousel-slide'},
  {title: 'フック画像（hook-image）', value: 'hook-image'},
  {title: 'サムネイル（thumbnail）', value: 'thumbnail'},
  {title: '投稿ペア画像（paired-post-visual）', value: 'paired-post-visual'},
  {title: 'まとめ図（summary-diagram）', value: 'summary-diagram'},
  {title: 'CTA画像（cta-visual）', value: 'cta-visual'},
]

export const visualAssetPlan = defineType({
  name: 'visualAssetPlan',
  title: 'ビジュアルアセット計画（Visual Asset Plan）',
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
      name: 'sourceDiagramPlan',
      title: '元の図解計画（Source Diagram Plan）',
      type: 'reference',
      to: [{type: 'diagramPlan'}],
      description: 'このビジュアルアセットの元になる概念レベルの図解計画です。',
    }),
    defineField({
      name: 'pairedPlatformOutput',
      title: '関連する媒体別下書き（Paired Platform Output）',
      type: 'reference',
      to: [{type: 'platformOutput'}],
      description: 'この画像と一緒に使うnote記事、X投稿、YouTube台本などがある場合に紐づけます。',
    }),
    defineField({
      name: 'generatedWith',
      title: '生成・制作ツール（Generated With）',
      type: 'reference',
      to: [{type: 'tool'}],
      description: 'ChatGPT画像生成、Canva、ローカルモデルなど、制作に使うツールを記録します。',
    }),
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'purpose',
      title: '目的（Purpose）',
      type: 'text',
      rows: 3,
      description: 'この画像が何を伝え、どの制作物で使われるかを記録します。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetPlatform',
      title: '対象媒体（Target Platform）',
      type: 'string',
      options: {list: platformOptions},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'placement',
      title: '配置場所（Placement）',
      type: 'string',
      description: '例: note hero, X first post, Instagram carousel cover, GitHub README top',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'assetType',
      title: 'アセット種別（Asset Type）',
      type: 'string',
      options: {list: assetTypeOptions},
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reusePolicy',
      title: '再利用方針（Reuse Policy）',
      type: 'string',
      options: {
        list: [
          {title: '再利用可（reusable）', value: 'reusable'},
          {title: '媒体専用（platform-specific）', value: 'platform-specific'},
          {title: '別バリエーション必要（variant-required）', value: 'variant-required'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'planned',
      options: {
        list: [
          {title: '計画済み（planned）', value: 'planned'},
          {title: 'ブリーフ準備済み（brief-ready）', value: 'brief-ready'},
          {title: 'プロンプト準備済み（prompt-ready）', value: 'prompt-ready'},
          {title: '生成済み・保存待ち（generated-needs-save）', value: 'generated-needs-save'},
          {title: '保存済み（saved）', value: 'saved'},
          {title: 'レビュー済み（reviewed）', value: 'reviewed'},
          {title: '承認済み（approved）', value: 'approved'},
          {title: '公開パッケージ化済み（packaged）', value: 'packaged'},
          {title: '公開済み（published）', value: 'published'},
          {title: 'アーカイブ済み（archived）', value: 'archived'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imagePrompt',
      title: '画像生成プロンプト（Image Prompt）',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'textToInclude',
      title: '入れる文字（Text To Include）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'textToAvoid',
      title: '避ける文字（Text To Avoid）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'visualDirection',
      title: 'ビジュアル方向性（Visual Direction）',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'reviewNotes',
      title: 'レビューメモ（Review Notes）',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'expectedLocalAssetPath',
      title: '保存予定パス（Expected Local Asset Path）',
      type: 'string',
      description:
        '画像を保存する予定のローカルパスです。Visual Registerはこの値を優先して保存先として使います。',
    }),
    defineField({
      name: 'localAssetPath',
      title: 'ローカルアセットパス（Local Asset Path）',
      type: 'string',
      description:
        '実際に保存された画像のローカルパスです。保存前は空にし、登録後にVisual Registerのpatch JSONで更新します。',
    }),
    defineField({
      name: 'taskFilePath',
      title: 'タスクファイルパス（Task File Path）',
      type: 'string',
    }),
    defineField({
      name: 'publishPackagePath',
      title: '公開パッケージパス（Publish Package Path）',
      type: 'string',
    }),
    defineField({
      name: 'generationMode',
      title: '生成モード（Generation Mode）',
      type: 'string',
      initialValue: 'manual',
      options: {
        list: [
          {title: '手動（manual）', value: 'manual'},
          {title: '半自動（semi-automatic）', value: 'semi-automatic'},
          {title: 'API自動（api-automatic）', value: 'api-automatic'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'generationProvider',
      title: '生成プロバイダー（Generation Provider）',
      type: 'string',
      options: {
        list: [
          {title: 'ChatGPT手動（chatgpt-manual）', value: 'chatgpt-manual'},
          {title: 'OpenAI API（openai-api）', value: 'openai-api'},
          {title: 'Stability API（stability-api）', value: 'stability-api'},
          {title: 'Midjourney手動（midjourney-manual）', value: 'midjourney-manual'},
          {title: 'Canva（canva）', value: 'canva'},
          {title: 'ローカルモデル（local-model）', value: 'local-model'},
          {title: 'その他（other）', value: 'other'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'generationJobId',
      title: '生成ジョブID（Generation Job ID）',
      type: 'string',
      description: '将来API生成を使う場合のジョブIDです。MVPの手動生成では空にします。',
    }),
    defineField({
      name: 'sourcePromptVersion',
      title: '元プロンプト版（Source Prompt Version）',
      type: 'string',
    }),
    defineField({
      name: 'apiEnabled',
      title: 'API利用有効（API Enabled）',
      type: 'boolean',
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'automationNotes',
      title: '自動化メモ（Automation Notes）',
      type: 'text',
      rows: 4,
      description: '将来のAPI生成や自動保存で必要になりそうな注意点を記録します。認証情報は保存しません。',
    }),
    defineField({
      name: 'createdAt',
      title: '作成日時（Created At）',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: '更新日時（Updated At）',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      platform: 'targetPlatform',
      status: 'status',
    },
    prepare({title, platform, status}) {
      return {
        title,
        subtitle: [platform, status].filter(Boolean).join(' / '),
      }
    },
  },
})
