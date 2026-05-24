// ContentIdeaCard — single contentIdea card on /knowledge.
// Studio link opens in a new tab (boss decision: card click → Studio).
// The Configurator deep-link (?ideaId=...) is P1; this card uses the Studio
// URL as the primary "use it" entry for now.

import {ExternalLink} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {studioDocumentUrl} from '@/lib/sanity'
import type {ContentIdeaOption} from '@/lib/groq/configurator'
import {normalizeTextList} from '@/lib/configurator/promptBuilder'

interface Props {
  idea: ContentIdeaOption
}

export function ContentIdeaCard({idea}: Props) {
  const title = idea.title ?? idea.slug ?? idea._id
  const studioHref = studioDocumentUrl(idea._id)
  const audience = normalizeTextList(idea.audience)
  const audiencePain = normalizeTextList(idea.audiencePain)

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>
          {idea.slug && (
            <p className="truncate text-[11px] text-slate-500">
              <code>{idea.slug}</code>
            </p>
          )}
        </div>
        {idea.status && <StatusBadge state={idea.status} label={idea.status} />}
      </header>

      {idea.coreThesis && (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-700">
          {idea.coreThesis}
        </p>
      )}

      {audience.length > 0 && (
        <ul className="flex flex-wrap gap-1 text-[11px] text-slate-700">
          {audience.slice(0, 4).map((a, i) => (
            <li
              key={i}
              className="rounded-md bg-slate-50 px-1.5 py-0.5 ring-1 ring-inset ring-slate-200"
            >
              {a}
            </li>
          ))}
          {audience.length > 4 && (
            <li className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600 ring-1 ring-inset ring-slate-200">
              +{audience.length - 4}
            </li>
          )}
        </ul>
      )}

      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-center">
        <Stat label="主張" value={idea.claimsCount ?? 0} />
        <Stat label="具体例" value={idea.examplesCount ?? 0} />
        <Stat label="反論" value={idea.objectionsCount ?? 0} />
      </div>

      {audiencePain.length > 0 && (
        <p className="line-clamp-1 text-[11px] text-slate-500">
          悩み: {audiencePain[0]}
        </p>
      )}

      <a
        href={studioHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Studio で開く
        <ExternalLink size={12} aria-hidden="true" />
      </a>
    </article>
  )
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}
