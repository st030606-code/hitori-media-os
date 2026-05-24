// PublishingLifecycleTimeline — publish-specific 5 stage horizontal flow.
// Distinct from common/LifecyclePipeline (Idea→Published which is content-OS
// wide). This timeline reflects the publishing workflow only:
//   計画 → 準備 → レビュー → 公開予定 → 公開済み
//
// Current stage is derived from manualPublishingStatus + humanReviewGates:
//   - all platforms done           → 公開済み
//   - some done, some pending      → 公開予定
//   - pending gates > 0            → レビュー
//   - selectedPlatforms exist      → 準備
//   - otherwise                    → 計画

import {ClipboardList, Layers, Eye, CalendarClock, CheckCircle2, ChevronRight} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import type {CampaignPlanDetail} from '@/lib/groq/campaign'

type PublishStageKey = 'planning' | 'preparation' | 'review' | 'scheduled' | 'published'

interface StageDef {
  key: PublishStageKey
  label: string
  description: string
  icon: LucideIcon
  bg: string
  ring: string
  text: string
  iconColor: string
}

const STAGES: StageDef[] = [
  {
    key: 'planning',
    label: '計画',
    description: '対象媒体と切り口',
    icon: ClipboardList,
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    key: 'preparation',
    label: '準備',
    description: '本文 / 画像生成',
    icon: Layers,
    bg: 'bg-purple-50',
    ring: 'ring-purple-200',
    text: 'text-purple-700',
    iconColor: 'text-purple-600',
  },
  {
    key: 'review',
    label: 'レビュー',
    description: '人間判定ゲート',
    icon: Eye,
    bg: 'bg-orange-50',
    ring: 'ring-orange-200',
    text: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  {
    key: 'scheduled',
    label: '公開予定',
    description: '公開準備OK / 一部公開済み',
    icon: CalendarClock,
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    text: 'text-amber-700',
    iconColor: 'text-amber-600',
  },
  {
    key: 'published',
    label: '公開済み',
    description: '全媒体完了 → 反応待ち',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-600',
  },
]

interface Props {
  campaign: CampaignPlanDetail
}

function computeCurrentStage(campaign: CampaignPlanDetail): PublishStageKey {
  const items = campaign.manualPublishingStatus ?? []
  const tracked = items.filter((i) => i.platform)
  const done = tracked.filter((i) => i.state === 'done' && !!i.publishedUrl).length
  const total = tracked.length
  const pendingGates = (campaign.humanReviewGates ?? []).filter(
    (g) =>
      g.state === 'pending-review' || g.state === 'in-progress' || g.state === 'blocked',
  ).length
  const selected = (campaign.selectedPlatforms ?? []).filter((p) => p.enabled !== false).length

  if (total > 0 && done === total) return 'published'
  if (done > 0 && done < total) return 'scheduled'
  if (pendingGates > 0) return 'review'
  if (selected > 0 || total > 0) return 'preparation'
  return 'planning'
}

export function PublishingLifecycleTimeline({campaign}: Props) {
  const currentKey = computeCurrentStage(campaign)
  const currentIdx = STAGES.findIndex((s) => s.key === currentKey)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開ライフサイクル</h2>
        <p className="text-xs text-slate-500">計画 → 準備 → レビュー → 公開予定 → 公開済み</p>
      </header>
      <ol className="flex flex-col gap-2">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon
          const isCurrent = stage.key === currentKey
          const isPast = currentIdx > -1 && idx < currentIdx
          const tone = isCurrent || isPast ? stage : null
          return (
            <li key={stage.key}>
              <div
                className={
                  (tone
                    ? `${tone.bg} ${tone.ring} ring-1 ring-inset`
                    : 'bg-slate-50 ring-1 ring-inset ring-slate-200') +
                  (isCurrent ? ' ring-2 shadow-sm' : '') +
                  ' flex items-start gap-3 rounded-md p-3'
                }
              >
                <span
                  className={
                    `inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/80 ` +
                    (tone ? tone.iconColor : 'text-slate-400')
                  }
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div
                      className={
                        (tone ? tone.text : 'text-slate-700') +
                        ' text-xs font-semibold uppercase tracking-wide'
                      }
                    >
                      {stage.label}
                    </div>
                    {isCurrent && (
                      <span
                        className={`rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${stage.text}`}
                      >
                        Current
                      </span>
                    )}
                    {isPast && !isCurrent && (
                      <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        Done
                      </span>
                    )}
                  </div>
                  <p
                    className={
                      (tone ? 'text-slate-700' : 'text-slate-500') + ' mt-0.5 text-[11px]'
                    }
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="flex items-center justify-center py-0.5" aria-hidden="true">
                  <ChevronRight size={12} className="rotate-90 text-slate-300" />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
