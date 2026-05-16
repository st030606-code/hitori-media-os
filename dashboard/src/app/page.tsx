import Link from 'next/link'
import {sanityClient, sanityConfig} from '@/lib/sanity'
import {dashboardHomeQuery, type DashboardHomeData} from '@/lib/groq/campaign'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {NextActionSummary} from '@/components/NextActionSummary'
import {StatusBadge} from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchHome(): Promise<DashboardHomeData> {
  return await sanityClient.fetch<DashboardHomeData>(dashboardHomeQuery)
}

export default async function HomePage() {
  const data = await fetchHome()

  const visualPct =
    data.visualsTotal > 0 ? Math.round((data.visualsDone / data.visualsTotal) * 100) : 0
  const publishingTotal = data.manualPublishingPending + data.manualPublishingDone
  const publishingPct =
    publishingTotal > 0 ? Math.round((data.manualPublishingDone / publishingTotal) * 100) : 0

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read-only operational view across all campaign plans in the Sanity dataset.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          label="Campaigns"
          primary={`${data.campaignsActive}`}
          secondary={`active · ${data.campaignTotal} total`}
        />
        <OverviewCard
          label="Pending review gates"
          primary={`${data.pendingGatesTotal}`}
          secondary="pending-review · in-progress · blocked"
        />
        <OverviewCard
          label="Visual progress"
          primary={`${data.visualsDone} / ${data.visualsTotal}`}
          secondary={`${visualPct}% done across all campaigns`}
        />
        <OverviewCard
          label="Manual publishing"
          primary={`${data.manualPublishingDone} / ${publishingTotal}`}
          secondary={`${publishingPct}% published · ${data.manualPublishingPending} pending`}
        />
      </section>

      {data.latest ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Latest active campaign</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Sorted by most recently updated.
              </p>
            </div>
            <Link
              className="text-sm text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href={`/campaigns/${data.latest.slug ?? ''}`}
            >
              Open Campaign Detail →
            </Link>
          </header>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-900">{data.latest.title ?? data.latest._id}</span>
            <span className="text-xs text-slate-500">
              <code>{data.latest.slug ?? data.latest._id}</code>
            </span>
            <StatusBadge state={data.latest.status} label={`status: ${data.latest.status ?? '—'}`} />
            <StatusBadge state="info" label={`auto: ${data.latest.automationLevel ?? '—'}`} />
          </div>

          <NextActionSummary campaign={data.latest} />
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          <p>No campaign plans found in the dataset.</p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Open elsewhere</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link className="text-sky-700 underline underline-offset-2 hover:text-sky-900" href="/campaigns">
              Browse all campaigns →
            </Link>
          </li>
          <li>
            <Link
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="/human-review-gates"
            >
              See pending human review gates →
            </Link>
          </li>
          <li>
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Visual Register (localhost:3334) →
            </a>
          </li>
          <li>
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Sanity Studio (localhost:3333) →
            </a>{' '}
            <span className="text-xs text-slate-500">
              (project <code>{sanityConfig.projectId}</code>, dataset <code>{sanityConfig.dataset}</code>)
            </span>
          </li>
        </ul>
      </section>
    </main>
  )
}

function OverviewCard({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string
  secondary?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{primary}</p>
      {secondary && <p className="mt-1 text-xs text-slate-500">{secondary}</p>}
    </div>
  )
}
