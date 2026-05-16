import type {ManualPublishingItem} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

function formatDate(value?: string) {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export function ManualPublishingStatusList({items}: {items?: ManualPublishingItem[]}) {
  if (!items || items.length === 0) {
    return null // optional section, don't render an empty state for this one
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Manual Publishing</h2>
      <ul className="divide-y divide-slate-100 text-sm">
        {items.map((m, i) => {
          const at = formatDate(m.publishedAt)
          return (
            <li key={`${m.platform ?? 'unknown'}-${i}`} className="flex flex-wrap items-center gap-3 py-2">
              <span className="w-24 shrink-0 font-medium text-slate-900">{m.platform ?? '—'}</span>
              <StatusBadge state={m.state} />
              {m.publishedUrl ? (
                <a
                  className="text-xs text-sky-700 underline underline-offset-2 break-all hover:text-sky-900"
                  href={m.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m.publishedUrl}
                </a>
              ) : (
                <span className="text-xs italic text-slate-400">no URL</span>
              )}
              {at && <span className="text-xs text-slate-500">at {at}</span>}
              {m.reactionNotes && <span className="text-xs text-slate-600">{m.reactionNotes}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
