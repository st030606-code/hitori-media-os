// Small shared badge for state / status enums.
// Read-only display, no interaction.

type Tone = 'done' | 'progress' | 'pending' | 'blocked' | 'idle' | 'info'

function toneFor(state?: string): Tone {
  if (!state) return 'idle'
  const s = state.toLowerCase()
  if (s === 'done' || s === 'saved' || s === 'approved' || s === 'published' || s === 'completed' || s === 'registered') {
    return 'done'
  }
  if (s === 'in-progress' || s === 'generating' || s === 'reviewing' || s === 'pending-review') {
    return 'progress'
  }
  if (s === 'not-started' || s === 'planning' || s === 'planned' || s === 'draft' || s === 'idea') {
    return 'pending'
  }
  if (s === 'blocked' || s === 'needs-regeneration' || s === 'rejected' || s === 'deprecated') {
    return 'blocked'
  }
  if (s === 'archived' || s === 'skipped') {
    return 'idle'
  }
  return 'info'
}

const toneClasses: Record<Tone, string> = {
  done: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300',
  progress: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300',
  pending: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300',
  blocked: 'bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-300',
  idle: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200',
  info: 'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-300',
}

export function StatusBadge({state, label}: {state?: string; label?: string}) {
  const tone = toneFor(state)
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label ?? state ?? '—'}
    </span>
  )
}
