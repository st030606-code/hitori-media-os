// LearningInsightsCard — short list of operational insights / learnings.
// Phase UI-2: items are static / supplied by parent. Phase UI-6 (Analytics)
// will derive these from manualPublishingStatus.reactionNotes and dataset
// patterns.

import {Lightbulb} from 'lucide-react'

export interface LearningInsight {
  id: string
  title: string
  description?: string
  metric?: string
  tone?: 'emerald' | 'blue' | 'orange' | 'purple' | 'slate'
}

interface Props {
  insights: LearningInsight[]
}

const TONE: Record<NonNullable<LearningInsight['tone']>, string> = {
  emerald: 'border-emerald-200 bg-emerald-50',
  blue: 'border-blue-200 bg-blue-50',
  orange: 'border-orange-200 bg-orange-50',
  purple: 'border-purple-200 bg-purple-50',
  slate: 'border-slate-200 bg-slate-50',
}

const TONE_TEXT: Record<NonNullable<LearningInsight['tone']>, string> = {
  emerald: 'text-emerald-900',
  blue: 'text-blue-900',
  orange: 'text-orange-900',
  purple: 'text-purple-900',
  slate: 'text-slate-800',
}

export function LearningInsightsCard({insights}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <Lightbulb size={16} className="text-amber-500" aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-900">気付き・学び</h2>
      </header>
      {insights.length === 0 ? (
        <p className="text-sm text-slate-500">
          反応データが揃うと、ここに自動検出された学びが表示されます（Phase UI-6）。
        </p>
      ) : (
        <ul className="space-y-2">
          {insights.map((it) => {
            const tone = it.tone ?? 'slate'
            return (
              <li key={it.id} className={`rounded-md border px-3 py-2 ${TONE[tone]}`}>
                <div className={`text-sm font-medium ${TONE_TEXT[tone]}`}>{it.title}</div>
                {it.description && (
                  <p className="mt-0.5 text-xs text-slate-700">{it.description}</p>
                )}
                {it.metric && (
                  <p className="mt-1 text-[11px] tabular-nums text-slate-600">{it.metric}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
