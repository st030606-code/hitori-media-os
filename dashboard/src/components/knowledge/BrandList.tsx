// BrandList — brandProfile cards on /knowledge.

import {ExternalLink} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {studioDocumentUrl} from '@/lib/sanity'
import type {BrandOption} from '@/lib/groq/configurator'

interface Props {
  brands: BrandOption[]
}

export function BrandList({brands}: Props) {
  if (brands.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">brandProfile が登録されていません</h3>
        <p className="mt-2 text-slate-600">
          Studio で <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">brandProfile</code> を作成するとここに表示されます。
        </p>
      </section>
    )
  }
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {brands.map((b) => (
        <li
          key={b._id}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-900">
                {b.brandName ?? b.title ?? b._id}
              </h3>
              {b.title && b.brandName && b.title !== b.brandName && (
                <p className="truncate text-[11px] text-slate-500">{b.title}</p>
              )}
            </div>
            {b.status && <StatusBadge state={b.status} label={b.status} />}
          </header>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-500">ownerType</dt>
            <dd className="text-slate-800">{b.ownerType ?? '—'}</dd>
            <dt className="text-slate-500">voice</dt>
            <dd className="text-slate-800">{b.voice ?? '—'}</dd>
          </dl>

          {b.defaultPlatforms && b.defaultPlatforms.length > 0 && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                defaultPlatforms
              </div>
              <ul className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                {b.defaultPlatforms.map((p, i) => (
                  <li key={i} className="inline-flex items-center gap-1">
                    <PlatformBadge platform={p} />
                    <span>{platformLabel(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <a
            href={studioDocumentUrl(b._id)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Studio で開く
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
