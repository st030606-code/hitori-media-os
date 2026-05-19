// CandidateGrid — side-by-side display of v00N candidate cards. 3 columns on
// medium+, 1 column on mobile. Empty grid handled by the caller via
// EmptyCandidateState.

import type {CandidateMeta} from '@/lib/inboxReader'
import {CandidateCard} from './CandidateCard'

export function CandidateGrid({
  candidates,
  rubricMaxScore,
  reviewStatus,
  enableLocalFsRoutes,
}: {
  candidates: CandidateMeta[]
  rubricMaxScore?: number
  reviewStatus?: string | null
  enableLocalFsRoutes: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((c) => (
        <CandidateCard
          key={c.id}
          candidate={c}
          rubricMaxScore={rubricMaxScore}
          reviewStatus={reviewStatus}
          enableLocalFsRoutes={enableLocalFsRoutes}
        />
      ))}
    </div>
  )
}
