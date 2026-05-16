import type {SelectedPlatform} from '@/lib/groq/campaign'

function priorityTone(priority?: string) {
  switch (priority) {
    case 'P0':
      return 'bg-rose-100 text-rose-900 ring-rose-300'
    case 'P1':
      return 'bg-amber-100 text-amber-900 ring-amber-300'
    case 'P2':
      return 'bg-sky-100 text-sky-900 ring-sky-300'
    case 'P3':
      return 'bg-slate-100 text-slate-700 ring-slate-300'
    default:
      return 'bg-zinc-100 text-zinc-600 ring-zinc-200'
  }
}

export function SelectedPlatformChips({platforms}: {platforms?: SelectedPlatform[]}) {
  if (!platforms || platforms.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Selected Platforms</h2>
        <p className="mt-2">No selected platforms recorded.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Selected Platforms</h2>
      <ul className="flex flex-wrap gap-2">
        {platforms.map((p, i) => {
          const disabled = p.enabled === false
          return (
            <li
              key={`${p.platform ?? 'unknown'}-${i}`}
              className={`flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm ${
                disabled ? 'opacity-50' : ''
              }`}
            >
              <span className="font-medium text-slate-900">{p.platform ?? '—'}</span>
              {p.priority && (
                <span className={`rounded px-1.5 py-0.5 text-xs ring-1 ring-inset ${priorityTone(p.priority)}`}>
                  {p.priority}
                </span>
              )}
              {p.contentDepth && <span className="text-xs text-slate-600">{p.contentDepth}</span>}
              {p.visualRequirement && (
                <span className="text-xs text-slate-500">visual: {p.visualRequirement}</span>
              )}
              {p.publishMode && (
                <span className="text-xs text-slate-500">publish: {p.publishMode}</span>
              )}
              {disabled && <span className="text-xs italic text-rose-700">disabled</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
