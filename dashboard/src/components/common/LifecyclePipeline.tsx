// LifecyclePipeline — 5-stage horizontal pipeline used as a recurring spine
// across the dashboard (docs/68 §2-5).
//
// Stages: Idea → Structured → Draft → Review → Published
// Optional currentStage gives the user a sense of "where am I in the OS".
//
// Tone classes follow docs/68 §4.3.

import type {LucideIcon} from 'lucide-react'
import {Lightbulb, LayoutGrid, FileText, Eye, CheckCircle2, ChevronRight} from 'lucide-react'

export type LifecycleKey = 'idea' | 'structured' | 'draft' | 'review' | 'published'

export interface LifecycleStage {
  key: LifecycleKey
  label: string
  count: number
  description?: string
}

interface LifecyclePipelineProps {
  stages: LifecycleStage[]
  currentStage?: LifecycleKey
  title?: string
  caption?: string
}

const TONE: Record<LifecycleKey, {bg: string; ring: string; text: string; iconColor: string; icon: LucideIcon}> = {
  idea: {bg: 'bg-blue-50', ring: 'ring-blue-200', text: 'text-blue-700', iconColor: 'text-blue-600', icon: Lightbulb},
  structured: {bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700', iconColor: 'text-purple-600', icon: LayoutGrid},
  draft: {bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-700', iconColor: 'text-orange-600', icon: FileText},
  review: {bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600', icon: Eye},
  published: {bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600', icon: CheckCircle2},
}

const STAGE_LABELS: Record<LifecycleKey, string> = {
  idea: 'アイデア',
  structured: '構造化済み',
  draft: '下書き',
  review: 'レビュー待ち',
  published: '公開済み',
}

export const DEFAULT_LIFECYCLE_STAGES: readonly LifecycleKey[] = [
  'idea',
  'structured',
  'draft',
  'review',
  'published',
] as const

export function lifecycleLabel(key: LifecycleKey): string {
  return STAGE_LABELS[key]
}

export function LifecyclePipeline({
  stages,
  currentStage,
  title,
  caption,
}: LifecyclePipelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {(title || caption) && (
        <header className="mb-4 flex flex-col gap-0.5">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {caption && <p className="text-xs text-slate-500">{caption}</p>}
        </header>
      )}
      <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
        {stages.map((stage, idx) => {
          const tone = TONE[stage.key]
          const Icon = tone.icon
          const isCurrent = currentStage === stage.key
          const isLast = idx === stages.length - 1
          return (
            <li key={stage.key} className="flex flex-1 items-stretch">
              <div
                className={
                  `${tone.bg} ${tone.ring} ` +
                  (isCurrent ? 'ring-2 shadow-sm ' : 'ring-1 ') +
                  'ring-inset flex w-full flex-col gap-1.5 rounded-md px-3 py-3'
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/70 ${tone.iconColor}`}
                    aria-hidden="true"
                  >
                    <Icon size={14} />
                  </span>
                  {isCurrent && (
                    <span
                      className={`rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${tone.text}`}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div className={`${tone.text} text-[11px] font-medium uppercase tracking-wide`}>
                  {STAGE_LABELS[stage.key]}
                </div>
                <div className={`${tone.text} text-2xl font-semibold tabular-nums leading-none`}>
                  {stage.count}
                </div>
                {stage.description && (
                  <p className="text-[11px] text-slate-700/80">{stage.description}</p>
                )}
              </div>
              {!isLast && (
                <span
                  className="hidden shrink-0 items-center self-center px-1 text-slate-300 lg:flex"
                  aria-hidden="true"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
