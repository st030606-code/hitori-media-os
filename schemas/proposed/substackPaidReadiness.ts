// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.
// Not imported from schemas/index.ts. Not registered in sanity.config.ts.
// This file is a design sketch for human review only.
// Source: docs/strategy-modules/substack-strategy-module.md, docs/strategy-sources/substack-textbook-notes.md
import {defineField, defineType} from 'sanity'

export const substackPaidReadiness = defineType({
  name: 'substackPaidReadiness',
  title: 'Substack有料化準備（Substack Paid Readiness）',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル（Title）',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourcePublicationStrategy',
      title: '対象publication戦略（Source Publication Strategy）',
      type: 'reference',
      to: [{type: 'substackPublicationStrategy'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trustSignals',
      title: '信頼の兆し（Trust Signals）',
      type: 'array',
      of: [{type: 'string'}],
      description: '例: 再読率、返信頻度、引用、Notes反応、他publication recommend。',
    }),
    defineField({
      name: 'audienceQuestions',
      title: '読者から繰り返し届く質問（Audience Questions）',
      type: 'array',
      of: [{type: 'string'}],
      description: 'paid化の方向性のヒントになる「もっと深く知りたい」を集める。',
    }),
    defineField({
      name: 'repeatedDemandSignals',
      title: '繰り返しの需要シグナル（Repeated Demand Signals）',
      type: 'array',
      of: [{type: 'string'}],
      description: '同じテーマで何度も反応が出ているか。',
    }),
    defineField({
      name: 'candidatePaidOffer',
      title: '候補となる有料オファー（Candidate Paid Offer）',
      type: 'text',
      rows: 4,
      description: 'テンプレート / 詳細ログ / コホート / 講座 / 個別相談など。具体的に書く。',
    }),
    defineField({
      name: 'freePaidBoundary',
      title: '無料 / 有料の境界（Free / Paid Boundary）',
      type: 'text',
      rows: 4,
      description: 'best public workは無料、有料はbackstage-passという原則をどう運用するか。',
    }),
    defineField({
      name: 'readinessLevel',
      title: '準備レベル（Readiness Level）',
      type: 'string',
      options: {
        list: [
          {title: 'まだ早い（too-early）', value: 'too-early'},
          {title: '兆しはある（some-signal）', value: 'some-signal'},
          {title: '一部読者から確信（partial-confidence）', value: 'partial-confidence'},
          {title: '小さく試せる（ready-to-test）', value: 'ready-to-test'},
        ],
      },
    }),
    defineField({
      name: 'readinessScore',
      title: '準備スコア（Readiness Score, 0–100）',
      type: 'number',
      description: '主観でよいが、根拠を reviewNotes に書く。',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'reasonsToWait',
      title: '今は待つ理由（Reasons To Wait）',
      type: 'array',
      of: [{type: 'string'}],
      description: '急がない判断を残す欄。trust不足、free postの量不足、運用整備不足など。',
    }),
    defineField({
      name: 'nextValidationActions',
      title: '次に検証するアクション（Next Validation Actions）',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'status',
      title: '状態（Status）',
      type: 'string',
      initialValue: 'not-ready',
      options: {
        list: [
          {title: 'まだ準備していない（not-ready）', value: 'not-ready'},
          {title: '観察中（observing）', value: 'observing'},
          {title: '検証が必要（validation-needed）', value: 'validation-needed'},
          {title: '小さく試せる（ready-to-test）', value: 'ready-to-test'},
          {title: '一時停止（paused）', value: 'paused'},
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
