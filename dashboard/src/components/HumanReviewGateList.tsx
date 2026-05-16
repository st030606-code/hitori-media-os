import type {HumanReviewGate} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

function stateSymbol(state?: string) {
  switch (state) {
    case 'done':
      return '✓'
    case 'in-progress':
    case 'pending-review':
      return '◐'
    case 'blocked':
      return '⚠'
    case 'skipped':
      return '⊘'
    default:
      return '○'
  }
}

function formatDate(value?: string) {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export function HumanReviewGateList({gates}: {gates?: HumanReviewGate[]}) {
  if (!gates || gates.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Human Review Gates</h2>
        <p className="mt-2">No gates recorded.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Human Review Gates</h2>
      <ol className="divide-y divide-slate-100">
        {gates.map((g, i) => {
          const completedAt = formatDate(g.completedAt)
          return (
            <li key={`${g.gateName ?? 'gate'}-${i}`} className="flex items-start gap-3 py-2.5 text-sm">
              <span
                className="mt-0.5 inline-block w-5 shrink-0 text-center font-bold text-slate-500"
                aria-hidden="true"
              >
                {stateSymbol(g.state)}
              </span>
              <div className="grow">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{g.gateName ?? '(unnamed gate)'}</span>
                  <StatusBadge state={g.state} />
                </div>
                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                  {g.reviewer && <span>reviewer: {g.reviewer}</span>}
                  {completedAt && <span>at: {completedAt}</span>}
                </div>
                {g.notes && <p className="mt-1 text-xs text-slate-600">{g.notes}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
