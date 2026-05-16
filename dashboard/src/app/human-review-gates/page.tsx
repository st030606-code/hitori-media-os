import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {
  pendingHumanReviewGatesQuery,
  type PendingGatesByCampaign,
  type HumanReviewGate,
} from '@/lib/groq/campaign'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {StatusBadge} from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface FlatGate {
  campaignId: string
  campaignTitle?: string
  campaignSlug?: string
  campaignStatus?: string
  gate: HumanReviewGate
}

const BUCKETS = [
  {key: 'pending-review', title: 'Pending review', tone: 'pending-review'},
  {key: 'in-progress', title: 'In progress', tone: 'in-progress'},
  {key: 'blocked', title: 'Blocked', tone: 'blocked'},
  {key: 'not-started', title: 'Not started', tone: 'not-started'},
] as const

function flatten(campaigns: PendingGatesByCampaign[]): Record<string, FlatGate[]> {
  const buckets: Record<string, FlatGate[]> = {
    'pending-review': [],
    'in-progress': [],
    blocked: [],
    'not-started': [],
  }
  for (const c of campaigns) {
    for (const g of c.gates ?? []) {
      const key = (g.state ?? 'not-started').toLowerCase()
      if (!(key in buckets)) continue
      buckets[key].push({
        campaignId: c._id,
        campaignTitle: c.title,
        campaignSlug: c.slug,
        campaignStatus: c.status,
        gate: g,
      })
    }
  }
  return buckets
}

function formatDate(value?: string): string | null {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export default async function HumanReviewGatesPage() {
  const campaigns = await sanityClient.fetch<PendingGatesByCampaign[]>(pendingHumanReviewGatesQuery)
  const buckets = flatten(campaigns)
  const totalActive = buckets['pending-review'].length + buckets['in-progress'].length + buckets.blocked.length

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Human Review Gates</h1>
        <p className="mt-1 text-sm text-slate-600">
          Aggregated across all campaign plans. {totalActive} gate{totalActive === 1 ? '' : 's'} in the
          active buckets (pending-review · in-progress · blocked).
        </p>
      </header>

      {BUCKETS.map(({key, title, tone}) => {
        const items = buckets[key] ?? []
        return (
          <section
            key={key}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <StatusBadge state={tone} label={`${items.length}`} />
              </div>
              {key !== 'not-started' && items.length === 0 && (
                <p className="text-xs text-emerald-700">No gates in this state.</p>
              )}
            </header>

            {items.length === 0 ? (
              <p className="text-sm text-slate-500">—</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((it, i) => {
                  const at = formatDate(it.gate.completedAt)
                  return (
                    <li key={`${it.campaignId}-${i}`} className="flex flex-col gap-1 py-2.5 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{it.gate.gateName ?? '(unnamed gate)'}</span>
                        <StatusBadge state={it.gate.state} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>
                          campaign:{' '}
                          <Link
                            className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
                            href={`/campaigns/${it.campaignSlug ?? ''}`}
                          >
                            {it.campaignTitle ?? it.campaignId}
                          </Link>{' '}
                          <span className="text-slate-400">
                            (<code>{it.campaignSlug ?? it.campaignId}</code>)
                          </span>
                        </span>
                        {it.gate.reviewer && <span>reviewer: {it.gate.reviewer}</span>}
                        {at && <span>at: {at}</span>}
                      </div>
                      {it.gate.notes && <p className="text-xs text-slate-600">{it.gate.notes}</p>}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </main>
  )
}
