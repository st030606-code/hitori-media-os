// LifecyclePreviewCard — wraps the common LifecyclePipeline with the
// "draft" stage marked as current, indicating where the configurator's
// output will land in the OS lifecycle.

import {LifecyclePipeline, type LifecycleStage} from '@/components/common/LifecyclePipeline'

interface Props {
  ideaCount: number
  structuredCount: number
  draftCount: number
  reviewCount: number
  publishedCount: number
}

export function LifecyclePreviewCard({
  ideaCount,
  structuredCount,
  draftCount,
  reviewCount,
  publishedCount,
}: Props) {
  const stages: LifecycleStage[] = [
    {key: 'idea', label: 'アイデア', count: ideaCount, description: 'まだ構造化前'},
    {key: 'structured', label: '構造化済み', count: structuredCount, description: 'contentIdea'},
    {key: 'draft', label: '下書き', count: draftCount, description: 'これから生成'},
    {key: 'review', label: 'レビュー待ち', count: reviewCount, description: '人間チェック'},
    {key: 'published', label: '公開済み', count: publishedCount, description: '配信完了'},
  ]
  return (
    <LifecyclePipeline
      stages={stages}
      currentStage="draft"
      title="この出力の位置づけ"
      caption="生成 → レビュー → 公開 の前段"
    />
  )
}
