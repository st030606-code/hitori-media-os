// StyleList — visualStyleProfile cards on /knowledge.

import {ExternalLink} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {studioDocumentUrl} from '@/lib/sanity'
import type {StyleOption} from '@/lib/groq/configurator'

interface Props {
  styles: StyleOption[]
}

export function StyleList({styles}: Props) {
  if (styles.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">visualStyleProfile が登録されていません</h3>
        <p className="mt-2 text-slate-600">
          Studio で <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">visualStyleProfile</code> を作成するとここに表示されます。
        </p>
      </section>
    )
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
      {styles.map((s) => (
        <li
          key={s._id}
          className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-900">{s.title ?? s._id}</h3>
            <p className="truncate text-[11px] text-slate-500">
              <code>{s._id}</code>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {s.status && <StatusBadge state={s.status} label={s.status} />}
            <a
              href={studioDocumentUrl(s._id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
            >
              Studio
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
