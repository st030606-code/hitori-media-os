// NextActionList — clean vertical list of next actions for a campaign,
// replacing the wider NextActionSummary horizontal cards on /campaigns/[slug].
//
// Phase UI-fidelity-1: reuses the same `computeNextActions(campaign)` logic
// from the existing NextActionSummary so the action set is identical, but
// presentation is grouped into:
//   - 要確認 (warn / now / blocked)
//   - 次にやること (soon)
//   - 後で対応 (later / done)

import Link from 'next/link'
import {AlertCircle, Circle, ArrowRight, CheckCircle2} from 'lucide-react'
import {computeNextActions} from '@/lib/campaign/nextActions'
import type {CampaignPlanDetail} from '@/lib/groq/campaign'

interface Props {
  campaign: CampaignPlanDetail
}

const GROUPS = [
  {key: 'review', label: '要確認', tone: 'rose', tones: new Set(['warn', 'now'])},
  {key: 'next', label: '次にやること', tone: 'amber', tones: new Set(['soon'])},
  {key: 'later', label: '後で対応', tone: 'slate', tones: new Set(['later', 'done'])},
] as const

const GROUP_STYLES: Record<string, {dot: string; heading: string}> = {
  rose: {dot: 'bg-rose-500', heading: 'text-rose-700'},
  amber: {dot: 'bg-amber-500', heading: 'text-amber-700'},
  slate: {dot: 'bg-slate-300', heading: 'text-slate-600'},
}

function iconFor(toneKey: string): {Icon: typeof Circle; className: string} {
  switch (toneKey) {
    case 'warn':
      return {Icon: AlertCircle, className: 'text-rose-600'}
    case 'now':
      return {Icon: AlertCircle, className: 'text-rose-500'}
    case 'soon':
      return {Icon: ArrowRight, className: 'text-amber-600'}
    case 'done':
      return {Icon: CheckCircle2, className: 'text-emerald-600'}
    case 'later':
    default:
      return {Icon: Circle, className: 'text-slate-400'}
  }
}

export function NextActionList({campaign}: Props) {
  const actions = computeNextActions(campaign)
  // Bucket into the 3 groups (later includes done so "no immediate blockers" still lands).
  const buckets = GROUPS.map((g) => ({
    ...g,
    items: actions.filter((a) => g.tones.has(a.tone)),
  }))

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">次のアクション</h2>
        <span className="text-[11px] text-slate-500">このキャンペーン由来</span>
      </header>
      <div className="flex flex-col gap-4">
        {buckets.map((g) => {
          if (g.items.length === 0) return null
          const style = GROUP_STYLES[g.tone]
          return (
            <div key={g.key}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${style.heading}`}>
                  {g.label}
                </span>
                <span className="text-[10px] text-slate-400">({g.items.length})</span>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((a, i) => {
                  const {Icon, className} = iconFor(a.tone)
                  return (
                    <li key={`${g.key}-${i}`} className="flex items-start gap-2 rounded-md p-1 -m-1 hover:bg-slate-50">
                      <Icon size={14} className={`mt-0.5 shrink-0 ${className}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-slate-900">{a.title}</div>
                        {a.detail && (
                          <p className="mt-0.5 text-[11px] text-slate-500">{a.detail}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
      <footer className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        詳細な手動チェックは{' '}
        <Link
          href={`/publish-package/${campaign.slug ?? campaign._id}`}
          className="text-blue-700 hover:text-blue-900"
        >
          公開パッケージ
        </Link>{' '}
        と release-review markdown を参照。
      </footer>
    </section>
  )
}
