// DeferredActionButton — a disabled-by-design button that documents an action
// planned for a later phase (2B / 2C / 2D). The label keeps the future shape
// visible on screen so the boss knows what's coming next; the title attribute
// holds the tooltip explanation.

export function DeferredActionButton({
  label,
  phase,
  tooltip,
}: {
  label: string
  phase: '2B' | '2C' | '2D'
  tooltip?: string
}) {
  return (
    <button
      type="button"
      disabled
      title={tooltip ?? `Available in Phase Admin ${phase}.`}
      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500"
    >
      <span>{label}</span>
      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
        Phase {phase}
      </span>
    </button>
  )
}
