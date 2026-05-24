// RubricScoresCard — axes × candidate score grid for the currently focused
// candidate. The data source is review.md.candidateScores, populated by the
// Codex self-review pass. The card never invents scores — when missing, the
// cells display "—" and the card shows a graceful empty state.

import {ListChecks} from 'lucide-react'
import type {CandidateMeta, ReviewMeta} from '@/lib/inboxReader'

interface Props {
  candidate: CandidateMeta | null
  reviewMeta: ReviewMeta | null
  enableLocalFsRoutes: boolean
}

function scoreClass(score: number | null | undefined, max: number | null | undefined): string {
  if (score == null) return 'text-slate-500'
  const m = max ?? 35
  if (score >= Math.ceil(m * 0.68)) return 'text-emerald-700'
  if (score >= Math.ceil(m * 0.51)) return 'text-amber-700'
  return 'text-rose-700'
}

export function RubricScoresCard({candidate, reviewMeta, enableLocalFsRoutes}: Props) {
  const max = reviewMeta?.rubricMaxScore
  const axes = reviewMeta?.rubricAxes ?? []
  const selectedScore = candidate ? candidate.score ?? null : null
  const recommendedId = reviewMeta?.recommendedCandidate ?? null
  const isRecommended = candidate && recommendedId && candidate.id === recommendedId

  const empty = !reviewMeta || !candidate

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
            aria-hidden="true"
          >
            <ListChecks size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">スコア (Codex 自己評価)</h2>
            <p className="text-[11px] text-slate-500">
              {candidate ? `${candidate.id} の総合点と内訳` : '候補が未選択'}
            </p>
          </div>
        </div>
        {isRecommended && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            ★ 推奨
          </span>
        )}
      </header>

      {empty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          {enableLocalFsRoutes
            ? 'Codex 自己評価はまだ記録されていません。review.md に candidateScores を追記すると、ここに表示されます。'
            : 'スコアは開発環境でのみ表示されます。'}
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-semibold tabular-nums leading-none ${scoreClass(selectedScore, max)}`}
            >
              {selectedScore == null ? '—' : selectedScore}
            </span>
            <span className="text-xs text-slate-500">/ {max ?? 35}</span>
          </div>

          {axes.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {axes.map((axis, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700 ring-1 ring-inset ring-slate-200"
                >
                  <span className="truncate">{axis}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                    {/* per-axis score not present in current review.md schema */}
                    —
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[11px] text-slate-500">
              審査軸 (rubricAxes) が未登録です。
            </p>
          )}

          {candidate.notes && (
            <p className="mt-3 whitespace-pre-line rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-700 ring-1 ring-inset ring-slate-200">
              {candidate.notes}
            </p>
          )}
        </>
      )}
    </section>
  )
}
