import type {PublishPackagePathItem} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

export function PublishPackageLinks({
  paths,
  releaseReviewPath,
}: {
  paths?: PublishPackagePathItem[]
  releaseReviewPath?: string
}) {
  const hasPaths = paths && paths.length > 0
  const hasReview = !!releaseReviewPath

  if (!hasPaths && !hasReview) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Publish Packages</h2>
        <p className="mt-2">No publish package paths recorded.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Publish Packages</h2>
      {hasPaths && (
        <ul className="space-y-2 text-sm">
          {paths!.map((p, i) => (
            <li
              key={`${p.platform ?? 'unknown'}-${i}`}
              className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2"
            >
              <span className="font-medium text-slate-900">{p.platform ?? '—'}</span>
              <code className="grow text-xs text-slate-700 break-all">{p.path ?? '—'}</code>
              <StatusBadge state={p.state} />
              {p.notes && <span className="text-xs text-slate-500">{p.notes}</span>}
            </li>
          ))}
        </ul>
      )}
      {hasReview && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm">
          <span className="mr-2 font-medium text-slate-900">release-review</span>
          <code className="text-xs text-slate-700 break-all">{releaseReviewPath}</code>
        </div>
      )}
      <p className="mt-3 text-xs italic text-slate-500">
        Read-only. To regenerate, run <code className="rounded bg-slate-100 px-1">npm run publish:package -- &lt;slug&gt;</code> at
        the repo root.
      </p>
    </section>
  )
}
