import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {campaignListQuery, type CampaignListItem} from '@/lib/groq/campaign'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {StatusBadge} from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchCampaigns(): Promise<CampaignListItem[]> {
  return await sanityClient.fetch<CampaignListItem[]>(campaignListQuery)
}

export default async function CampaignsListPage() {
  const campaigns = await fetchCampaigns()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
        <p className="mt-1 text-sm text-slate-600">
          {campaigns.length === 0
            ? 'No campaign plans in the dataset.'
            : `${campaigns.length} campaign plan${campaigns.length === 1 ? '' : 's'} in the dataset.`}
        </p>
      </header>

      {campaigns.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          <p>No campaigns to show.</p>
        </section>
      ) : (
        <ul className="flex flex-col gap-3">
          {campaigns.map((c) => (
            <CampaignRow key={c._id} campaign={c} />
          ))}
        </ul>
      )}
    </main>
  )
}

function CampaignRow({campaign: c}: {campaign: CampaignListItem}) {
  const visualPct =
    c.totalVisualsCount && c.totalVisualsCount > 0
      ? Math.round(((c.doneVisualsCount ?? 0) / c.totalVisualsCount) * 100)
      : 0
  const publishingDone = c.manualPublishingDoneCount ?? 0
  const publishingPending = c.manualPublishingNotStartedCount ?? 0
  const publishingTotal = publishingDone + publishingPending

  return (
    <li>
      <Link
        href={`/campaigns/${c.slug ?? ''}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-300"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{c.title ?? c._id}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              <code>{c.slug ?? c._id}</code>
              {c.sourceContentIdea?.title && (
                <span className="ml-2">
                  ← {c.sourceContentIdea.title}{' '}
                  <span className="text-slate-400">
                    (<code>{c.sourceContentIdea.slug ?? c.sourceContentIdea._id}</code>)
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge state={c.status} label={`status: ${c.status ?? '—'}`} />
            <StatusBadge state="info" label={`auto: ${c.automationLevel ?? '—'}`} />
            <StatusBadge state="info" label={`type: ${c.campaignType ?? '—'}`} />
          </div>
        </div>

        {c.selectedPlatforms && c.selectedPlatforms.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {c.selectedPlatforms
              .filter((p) => p.enabled !== false)
              .map((p, i) => (
                <li
                  key={`${p.platform ?? 'p'}-${i}`}
                  className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
                >
                  <span className="font-medium">{p.platform}</span>
                  {p.priority && (
                    <span className="rounded bg-slate-200 px-1 text-[10px] text-slate-700">{p.priority}</span>
                  )}
                  {p.contentDepth && <span className="text-slate-500">{p.contentDepth}</span>}
                </li>
              ))}
          </ul>
        )}

        <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-4">
          <Metric
            label="Visual progress"
            primary={`${c.doneVisualsCount ?? 0} / ${c.totalVisualsCount ?? 0}`}
            secondary={`${visualPct}%`}
          />
          <Metric
            label="Pending gates"
            primary={`${c.pendingGatesCount ?? 0}`}
            secondary="pending-review · in-progress · blocked"
          />
          <Metric
            label="Manual publishing"
            primary={`${publishingDone} / ${publishingTotal}`}
            secondary={`${publishingPending} not-started`}
          />
          <Metric
            label="Selected platforms"
            primary={`${c.selectedPlatformsCount ?? c.selectedPlatforms?.length ?? 0}`}
            secondary={c.progressStatus?.overall ?? 'no overall progress'}
          />
        </dl>
      </Link>
    </li>
  )
}

function Metric({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string
  secondary?: string
}) {
  return (
    <div>
      <dt className="font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{primary}</dd>
      {secondary && <dd className="text-[11px] text-slate-500">{secondary}</dd>}
    </div>
  )
}
