// RubricChecklistCard — read-only summary of review.md frontmatter for an
// asset. Lists rubric axes as chips and exposes the rubric scale / max score
// / recommended candidate / review status / human decision.
//
// Phase UI-fidelity-7 (P1): no write — Phase 2B will allow the dashboard to
// flip humanDecision and submit the review-manifest.json patch.

import {ClipboardCheck} from 'lucide-react'
import type {ReviewMeta} from '@/lib/inboxReader'
import {StatusBadge} from '@/components/StatusBadge'

interface Props {
  reviewMeta: ReviewMeta | null
  enableLocalFsRoutes: boolean
}

export function RubricChecklistCard({reviewMeta, enableLocalFsRoutes}: Props) {
  const empty = !reviewMeta
  const axes = reviewMeta?.rubricAxes ?? []

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
            aria-hidden="true"
          >
            <ClipboardCheck size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">レビュー基準</h2>
            <p className="text-[11px] text-slate-500">
              <code>review.md</code> の frontmatter から
            </p>
          </div>
        </div>
        {reviewMeta?.reviewStatus && (
          <StatusBadge state={reviewMeta.reviewStatus} label={reviewMeta.reviewStatus} />
        )}
      </header>

      {empty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          {enableLocalFsRoutes
            ? 'レビュー基準はまだ登録されていません。inbox に review.md を作成すると、ここに表示されます。'
            : 'レビュー基準は開発環境でのみ表示されます。'}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Pair label="スケール" value={reviewMeta?.rubricScale ?? '—'} />
            <Pair
              label="最大スコア"
              value={
                reviewMeta?.rubricMaxScore != null ? (
                  <span className="font-semibold tabular-nums">{reviewMeta.rubricMaxScore}</span>
                ) : (
                  '—'
                )
              }
            />
            <Pair
              label="推奨候補"
              value={reviewMeta?.recommendedCandidate ?? '— (未決定)'}
            />
            <Pair
              label="人間判断"
              value={reviewMeta?.humanDecision ?? '— (Phase 2B で記録)'}
            />
          </dl>

          {axes.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                審査軸 ({axes.length})
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                {axes.map((axis, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-amber-50 px-2 py-0.5 ring-1 ring-inset ring-amber-200"
                  >
                    {axis}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Pair({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}
