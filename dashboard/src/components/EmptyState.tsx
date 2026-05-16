// Shared empty / error state used when a data source returns nothing or fails
// in a recoverable way.

export function EmptyState({
  title,
  body,
  tone = 'info',
}: {
  title: string
  body?: string
  tone?: 'info' | 'error'
}) {
  const toneClasses =
    tone === 'error'
      ? 'border-rose-300 bg-rose-50 text-rose-900'
      : 'border-slate-300 bg-slate-50 text-slate-700'

  return (
    <section className={`rounded-lg border border-dashed px-4 py-5 text-sm ${toneClasses}`}>
      <h3 className="font-semibold">{title}</h3>
      {body && <p className="mt-1 text-xs">{body}</p>}
    </section>
  )
}
