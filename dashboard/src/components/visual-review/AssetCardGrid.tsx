// AssetCardGrid — 3-col grid wrapper for AssetCard.
// Filter / empty state handled by the caller (the page).
// latestInboxPaths is a server-precomputed map of {plan._id → relativePath of
// the newest v00N image}. AssetCard uses it for thumbnail fallback.

import {AssetCard} from './AssetCard'
import type {VisualAssetPlanListItem} from '@/lib/groq/campaign'

interface Props {
  plans: VisualAssetPlanListItem[]
  enableLocalFsRoutes: boolean
  latestInboxPaths?: Record<string, string>
}

export function AssetCardGrid({plans, enableLocalFsRoutes, latestInboxPaths}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <AssetCard
          key={plan._id}
          plan={plan}
          enableLocalFsRoutes={enableLocalFsRoutes}
          latestInboxPath={latestInboxPaths?.[plan._id]}
        />
      ))}
    </div>
  )
}
