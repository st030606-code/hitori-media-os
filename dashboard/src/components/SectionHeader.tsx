// Shared section header. Title comes first (boss-friendly label), supporting
// metadata after the title is muted (developer / context).

import type {ReactNode} from 'react'

export function SectionHeader({
  title,
  description,
  right,
}: {
  title: string
  description?: string
  right?: ReactNode
}) {
  return (
    <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {right && <div className="text-sm">{right}</div>}
    </header>
  )
}
