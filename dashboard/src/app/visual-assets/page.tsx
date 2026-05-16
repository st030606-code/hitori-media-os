import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanListQuery, type VisualAssetPlanListItem} from '@/lib/groq/campaign'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {StatusBadge} from '@/components/StatusBadge'
import {SummaryCard} from '@/components/SummaryCard'
import {EmptyState} from '@/components/EmptyState'
import {FilePathBlock} from '@/components/FilePathBlock'
import {SectionHeader} from '@/components/SectionHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Bucket the visualAssetPlan.status enum into 3 boss-friendly groups so the
// page doesn't show 10 thin slices for what is really "done / in flight / not
// started". Schema enum source: schemas/visualAssetPlan.ts.
const DONE_STATES = new Set(['saved', 'reviewed', 'approved', 'packaged', 'published'])
const PENDING_STATES = new Set(['generated-needs-save'])
const PROGRESS_STATES = new Set(['prompt-ready']) // brief was prepared but no candidate yet
const PLANNED_STATES = new Set(['planned', 'brief-ready'])

type Bucket = 'done' | 'pending' | 'progress' | 'planned' | 'other'

function bucketize(status?: string): Bucket {
  if (!status) return 'other'
  if (DONE_STATES.has(status)) return 'done'
  if (PENDING_STATES.has(status)) return 'pending'
  if (PROGRESS_STATES.has(status)) return 'progress'
  if (PLANNED_STATES.has(status)) return 'planned'
  return 'other'
}

function formatDate(value?: string): string | null {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export default async function VisualAssetsPage() {
  const items = await sanityClient.fetch<VisualAssetPlanListItem[]>(visualAssetPlanListQuery)

  const counts = items.reduce(
    (acc, it) => {
      const b = bucketize(it.status)
      acc[b] = (acc[b] ?? 0) + 1
      return acc
    },
    {done: 0, pending: 0, progress: 0, planned: 0, other: 0} as Record<Bucket, number>,
  )
  const total = items.length

  const sections: Array<{
    key: Bucket
    title: string
    description: string
  }> = [
    {
      key: 'pending',
      title: 'Pending review',
      description: 'generated but not yet saved — needs Visual Register approve & register.',
    },
    {
      key: 'progress',
      title: 'In flight',
      description: 'prompt prepared, awaiting candidate generation.',
    },
    {
      key: 'planned',
      title: 'Planned / brief-ready',
      description: 'asset has a plan but no production candidate yet.',
    },
    {
      key: 'done',
      title: 'Done',
      description: 'saved / reviewed / approved / packaged / published.',
    },
    {
      key: 'other',
      title: 'Other / no status',
      description: 'unexpected or missing status value.',
    },
  ]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Visual Assets</h1>
        <p className="mt-1 text-sm text-slate-600">
          Full listing of <code>visualAssetPlan</code> documents in the Sanity dataset.
          {total === 0 ? ' No assets found.' : ` ${total} asset${total === 1 ? '' : 's'} total.`}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Total" primary={total} />
        <SummaryCard label="Done" primary={counts.done} secondary="saved / reviewed / approved / packaged / published" />
        <SummaryCard label="Pending" primary={counts.pending} secondary="generated-needs-save" />
        <SummaryCard label="In flight" primary={counts.progress} secondary="prompt-ready" />
        <SummaryCard label="Planned" primary={counts.planned} secondary="planned / brief-ready" />
      </section>

      {enableLocalFsRoutes ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>
            <strong className="font-semibold">Local thumbnails are enabled.</strong> Images under{' '}
            <code>assets/visuals/</code> are served via the dev-only{' '}
            <code>/api/asset-thumb</code> route (8&nbsp;MB cap, prefix-restricted). Production builds
            disable this route by default; see <code>docs/60</code>.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong className="font-semibold">Thumbnails are disabled.</strong> Set{' '}
            <code>ENABLE_LOCAL_FS_ROUTES=true</code> on localhost to enable the{' '}
            <code>/api/asset-thumb</code> handler. Production deploys keep thumbnails off until the
            build-time snapshot strategy (Batch D2) is wired up.
          </p>
        </section>
      )}

      {sections.map((s) => {
        const bucketItems = items.filter((it) => bucketize(it.status) === s.key)
        if (bucketItems.length === 0) {
          // Skip empty "other" / "in flight" buckets to keep the page tight.
          if (s.key === 'other' || s.key === 'progress' || s.key === 'pending') return null
        }
        return (
          <section
            key={s.key}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SectionHeader
              title={s.title}
              description={s.description}
              right={
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {bucketItems.length}
                </span>
              }
            />
            {bucketItems.length === 0 ? (
              <p className="text-sm text-slate-500">—</p>
            ) : (
              <VisualAssetTable items={bucketItems} thumbsEnabled={enableLocalFsRoutes} />
            )}
          </section>
        )
      })}

      {items.length === 0 && (
        <EmptyState title="No visual asset plans found in the dataset." body="Insert seeds via npx sanity documents create, or check that SANITY_READ_TOKEN is set if the dataset is private." />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          title="Where Visual Asset review actually happens"
          description="Phase Admin 1 is read-only; approval continues in the local Visual Register."
        />
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            Inbox Review (<code className="rounded bg-slate-100 px-1">approve &amp; register</code>) is in
            local{' '}
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visual Register
            </a>{' '}
            at <code>http://localhost:3334</code>.
          </li>
          <li>
            Start it from the repo root with <code className="rounded bg-slate-100 px-1">npm run visual:register</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}

function VisualAssetTable({
  items,
  thumbsEnabled,
}: {
  items: VisualAssetPlanListItem[]
  thumbsEnabled: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {thumbsEnabled && <th className="px-3 py-2 font-medium">Thumb</th>}
            <th className="px-3 py-2 font-medium">Asset</th>
            <th className="px-3 py-2 font-medium">Platform</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Content Idea</th>
            <th className="px-3 py-2 font-medium">Local Path</th>
            <th className="px-3 py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((it) => {
            const updated = formatDate(it.updatedAt)
            const pathToShow = it.localAssetPath || it.expectedLocalAssetPath
            const pathLabel = it.localAssetPath
              ? undefined
              : it.expectedLocalAssetPath
                ? '(expected, not yet saved)'
                : undefined
            const thumbSrc =
              thumbsEnabled && it.localAssetPath && it.localAssetPath.startsWith('assets/visuals/')
                ? `/api/asset-thumb?path=${encodeURIComponent(it.localAssetPath)}`
                : null
            return (
              <tr key={it._id}>
                {thumbsEnabled && (
                  <td className="px-3 py-2 align-top">
                    {thumbSrc ? (
                      // Native <img> on purpose: we serve an already-sized PNG via
                      // /api/asset-thumb and want no Next.js image optimization
                      // round-trip for local-only previews.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbSrc}
                        alt={it.title ?? it._id}
                        className="h-14 w-24 rounded border border-slate-200 bg-slate-50 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="italic text-slate-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-slate-900">{it.title ?? '(untitled)'}</div>
                  <div className="text-xs text-slate-500 break-all">
                    <code>{it._id}</code>
                  </div>
                  {it.placement && (
                    <div className="mt-0.5 text-xs text-slate-500">placement: {it.placement}</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-slate-700">{it.targetPlatform ?? '—'}</td>
                <td className="px-3 py-2 align-top text-slate-700">
                  {it.assetType ?? '—'}
                  {it.aspectRatio && <div className="text-xs text-slate-500">{it.aspectRatio}</div>}
                </td>
                <td className="px-3 py-2 align-top">
                  <StatusBadge state={it.status} />
                  {it.reusePolicy && (
                    <div className="mt-1 text-[11px] text-slate-500">reuse: {it.reusePolicy}</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {it.sourceContentIdea ? (
                    <span className="text-slate-700">
                      <span className="font-medium">{it.sourceContentIdea.title ?? it.sourceContentIdea._id}</span>
                      <span className="ml-1 text-xs text-slate-500">
                        (<code>{it.sourceContentIdea.slug ?? it.sourceContentIdea._id}</code>)
                      </span>
                    </span>
                  ) : (
                    <span className="text-rose-700 text-xs">Reference unresolved</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-xs">
                  <FilePathBlock path={pathToShow} detail={pathLabel} />
                </td>
                <td className="px-3 py-2 align-top text-xs text-slate-500">{updated ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
