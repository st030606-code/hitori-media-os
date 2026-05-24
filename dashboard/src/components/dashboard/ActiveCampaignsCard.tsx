// ActiveCampaignsCard — recent / active campaigns with a polished progress
// row. Phase UI-2.5: keep the bar (no donut this batch), but visually upgrade
// with a tone-correct gradient bar, percentage chip on the right, and platform
// chips inline.

import Link from 'next/link'
import {Rocket, ArrowRight} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {PlatformBadge} from '@/components/common/PlatformBadge'
import type {CampaignListItem} from '@/lib/groq/campaign'

interface Props {
  campaigns: CampaignListItem[]
}

function progressFor(c: CampaignListItem): number {
  const pubDone = c.manualPublishingDoneCount ?? 0
  const pubPending = c.manualPublishingNotStartedCount ?? 0
  const pubTotal = pubDone + pubPending
  if (pubTotal > 0) return Math.round((pubDone / pubTotal) * 100)
  const total = c.totalVisualsCount ?? 0
  if (total === 0) return 0
  return Math.round(((c.doneVisualsCount ?? 0) / total) * 100)
}

function progressTone(pct: number): {bar: string; chip: string} {
  if (pct >= 100) return {bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 ring-emerald-200'}
  if (pct >= 60) return {bar: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700 ring-blue-200'}
  if (pct >= 20) return {bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 ring-amber-200'}
  return {bar: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700 ring-slate-200'}
}

export function ActiveCampaignsCard({campaigns}: Props) {
  const rows = campaigns.slice(0, 5)
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100"
            aria-hidden="true"
          >
            <Rocket size={14} />
          </span>
          <h2 className="text-base font-semibold text-slate-900">進行中のキャンペーン</h2>
        </div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          すべて見る
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">キャンペーンプランがまだ登録されていません。</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const pct = progressFor(c)
            const tone = progressTone(pct)
            const enabledPlatforms = (c.selectedPlatforms ?? []).filter((p) => p.enabled !== false)
            return (
              <li key={c._id}>
                <Link
                  href={`/campaigns/${c.slug ?? c._id}`}
                  className="block rounded-md p-2 -m-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {c.title ?? c._id}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <StatusBadge state={c.status} label={c.status ?? '—'} />
                        {c.pendingGatesCount != null && c.pendingGatesCount > 0 && (
                          <span className="text-amber-700">確認待ち {c.pendingGatesCount}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ring-1 ring-inset ${tone.chip}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${tone.bar} transition-all`} style={{width: `${pct}%`}} />
                  </div>
                  {enabledPlatforms.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {enabledPlatforms.slice(0, 6).map((p, i) => (
                        <li key={`${p.platform ?? 'p'}-${i}`}>
                          <PlatformBadge platform={p.platform ?? '—'} />
                        </li>
                      ))}
                      {enabledPlatforms.length > 6 && (
                        <li className="text-[10px] text-slate-500">+{enabledPlatforms.length - 6}</li>
                      )}
                    </ul>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
