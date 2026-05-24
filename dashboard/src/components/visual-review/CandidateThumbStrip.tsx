// CandidateThumbStrip — horizontal v00N thumbnail strip for candidate focus
// switching. Pure presentational client component receiving selectedId +
// onSelect from CandidateFocusLayout. Dev-only previews; when the flag is
// off, the thumbnail slot is a labelled placeholder.

import type {CandidateMeta} from '@/lib/inboxReader'

interface Props {
  candidates: CandidateMeta[]
  selectedId: string | null
  onSelect: (id: string) => void
  enableLocalFsRoutes: boolean
}

function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function CandidateThumbStrip({candidates, selectedId, onSelect, enableLocalFsRoutes}: Props) {
  if (candidates.length === 0) return null
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <ul className="flex items-stretch gap-2">
        {candidates.map((c) => {
          const selected = c.id === selectedId
          const src = enableLocalFsRoutes
            ? `/api/visual-review/candidate-image?path=${encodeURIComponent(c.relativePath)}`
            : null
          const dims =
            c.pixelWidth && c.pixelHeight ? `${c.pixelWidth}×${c.pixelHeight}` : null
          return (
            <li key={c.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={selected}
                className={
                  'flex w-32 flex-col gap-1 rounded-md border bg-white p-1.5 text-left transition-colors focus:outline-none ' +
                  (selected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded bg-slate-50">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={c.id}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                      {enableLocalFsRoutes ? 'no image' : 'dev-only'}
                    </div>
                  )}
                </div>
                <div className="px-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-900">{c.id}</span>
                    {selected && (
                      <span className="rounded bg-blue-100 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-700">
                        focus
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-1.5 text-[10px] tabular-nums text-slate-500">
                    {dims && <span>{dims}</span>}
                    <span>{fmtBytes(c.fileSize)}</span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
