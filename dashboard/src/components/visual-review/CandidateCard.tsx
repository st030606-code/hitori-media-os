// CandidateCard — single candidate tile shown inside the CandidateGrid.
// Renders preview + variant + dims + size + generatedAt + self-review score.
// No interaction in Phase 2A; clicking links to a deeper inspection view in a
// future batch (Phase 2A-2).

import type {CandidateMeta} from '@/lib/inboxReader'
import {CandidatePreview} from './CandidatePreview'
import {CandidateStatusBadge} from './CandidateStatusBadge'

function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return iso
  }
}

function scoreClass(score: number | null, max: number | null | undefined): string {
  if (score == null) return 'text-slate-500'
  const m = max ?? 35
  if (score >= Math.ceil(m * 0.68)) return 'text-emerald-700'
  if (score >= Math.ceil(m * 0.51)) return 'text-amber-700'
  return 'text-rose-700'
}

export function CandidateCard({
  candidate,
  rubricMaxScore,
  reviewStatus,
  enableLocalFsRoutes,
}: {
  candidate: CandidateMeta
  rubricMaxScore?: number
  reviewStatus?: string | null
  enableLocalFsRoutes: boolean
}) {
  const dims =
    candidate.pixelWidth && candidate.pixelHeight
      ? `${candidate.pixelWidth} × ${candidate.pixelHeight}`
      : '—'
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">{candidate.id}</div>
          <div className="text-xs text-slate-500">{candidate.variant ?? '—'}</div>
        </div>
        <CandidateStatusBadge status={reviewStatus ?? null} />
      </header>
      <CandidatePreview
        relativePath={candidate.relativePath}
        alt={`${candidate.id} ${candidate.variant ?? ''}`}
        enableLocalFsRoutes={enableLocalFsRoutes}
      />
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-700">
        <dt className="text-slate-500">dims</dt>
        <dd>{dims}</dd>
        <dt className="text-slate-500">size</dt>
        <dd>{fmtBytes(candidate.fileSize)}</dd>
        <dt className="text-slate-500">generated</dt>
        <dd>{fmtDate(candidate.generatedAt)}</dd>
        <dt className="text-slate-500">self-review</dt>
        <dd className={scoreClass(candidate.score ?? null, rubricMaxScore)}>
          {candidate.score == null ? '— / ' : `${candidate.score} / `}
          {rubricMaxScore ?? 35}
        </dd>
        {candidate.layoutPattern && (
          <>
            <dt className="text-slate-500">layout</dt>
            <dd>{candidate.layoutPattern}</dd>
          </>
        )}
      </dl>
      {candidate.notes && (
        <p className="rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-700">{candidate.notes}</p>
      )}
    </article>
  )
}
