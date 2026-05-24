// NotesCard — read-only excerpt of the review notes for the focused candidate.
// Sources, in priority order:
//   1. candidate.notes (review.md.candidateScores[id].notes, populated by Codex)
//   2. reviewMeta.humanDecision (human verdict, when boss has filled it in)
// Phase 2B will replace this with a writable textarea + autosave.

import {MessageSquareText} from 'lucide-react'
import type {CandidateMeta, ReviewMeta} from '@/lib/inboxReader'

interface Props {
  candidate: CandidateMeta | null
  reviewMeta: ReviewMeta | null
  enableLocalFsRoutes: boolean
}

export function NotesCard({candidate, reviewMeta, enableLocalFsRoutes}: Props) {
  const notes = candidate?.notes ?? null
  const decision = reviewMeta?.humanDecision ?? null
  const empty = !notes && !decision

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <MessageSquareText size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">レビューメモ</h2>
            <p className="text-[11px] text-slate-500">
              書き込みは Phase 2B で実装します
            </p>
          </div>
        </div>
      </header>

      {empty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          {enableLocalFsRoutes
            ? 'メモはまだ記録されていません。Visual Register で承認すると review-manifest.json に記録されます。'
            : 'メモは開発環境でのみ表示されます。'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {decision && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                人間判断 (humanDecision)
              </div>
              <p className="mt-1 text-sm text-slate-800">{decision}</p>
            </div>
          )}
          {notes && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                自己レビューメモ
              </div>
              <p className="mt-1 whitespace-pre-line rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-700 ring-1 ring-inset ring-slate-200">
                {notes}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-500">
        次の一手: Visual Register で承認し、人間判断を review-manifest.json に書き込む。
      </p>
    </section>
  )
}
