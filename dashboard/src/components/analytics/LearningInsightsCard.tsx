// LearningInsightsCard (analytics-specific) — surfaces the latest devlog
// entries as "what we learned recently". Reuses the page-side read of
// docs/devlog/*.md so the component itself stays presentational.
//
// Boss decision: keep this as an analytics-specific component, do not force
// extraction into common/. The Dashboard's LearningInsightsCard remains
// separate (its data shape differs subtly).

import {Sparkles} from 'lucide-react'

export interface DevlogInsight {
  title: string
  date?: string | null
  filename: string
  excerpt: string
}

interface Props {
  entries: DevlogInsight[]
}

export function LearningInsightsCard({entries}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200"
          aria-hidden="true"
        >
          <Sparkles size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">直近の学び</h2>
          <p className="text-[11px] text-slate-500">
            <code>docs/devlog/</code> の最新エントリーから抜粋
          </p>
        </div>
      </header>
      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          devlog エントリーが読めません。ローカル開発環境でのみ利用できます。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((e) => (
            <li key={e.filename} className="py-2.5 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium text-slate-900">{e.title}</h3>
                {e.date && (
                  <span className="text-[11px] tabular-nums text-slate-400">{e.date}</span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-700">
                {e.excerpt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
