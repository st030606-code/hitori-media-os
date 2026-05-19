// CandidateStatusBadge — review-status pill specialized for inbox candidates.
// The existing StatusBadge covers visualAssetPlan.status; this one covers the
// candidate-level state recorded in review-manifest.json or review.md.

type Status =
  | 'candidate'
  | 'approved'
  | 'rejected'
  | 'needs-regeneration'
  | 'registered'
  | 'unknown'

const labelMap: Record<Status, string> = {
  candidate: 'candidate',
  approved: 'approved',
  rejected: 'rejected',
  'needs-regeneration': 'needs regen',
  registered: 'registered',
  unknown: 'unknown',
}

const toneMap: Record<Status, string> = {
  candidate: 'bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-300',
  approved: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300',
  rejected: 'bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-300',
  'needs-regeneration': 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300',
  registered: 'bg-violet-100 text-violet-900 ring-1 ring-inset ring-violet-300',
  unknown: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200',
}

function normalize(s: string | undefined | null): Status {
  if (!s) return 'unknown'
  const v = s.toLowerCase()
  if (v === 'candidate' || v === 'approved' || v === 'rejected' || v === 'registered') return v
  if (v === 'needs-regeneration' || v === 'needs-regen') return 'needs-regeneration'
  return 'unknown'
}

export function CandidateStatusBadge({status}: {status?: string | null}) {
  const v = normalize(status)
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${toneMap[v]}`}
    >
      {labelMap[v]}
    </span>
  )
}
