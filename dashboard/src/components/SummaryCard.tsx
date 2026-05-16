// Small overview card used by Dashboard Home, Visual Assets, etc.
// Pure presentational component.

export function SummaryCard({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string | number
  secondary?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{primary}</p>
      {secondary && <p className="mt-1 text-xs text-slate-500">{secondary}</p>}
    </div>
  )
}
