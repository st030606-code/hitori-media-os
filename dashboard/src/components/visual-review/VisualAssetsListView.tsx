'use client'

// VisualAssetsListView — client wrapper that holds FilterBar state and
// renders the filtered AssetCardGrid.
//
// Phase UI-fidelity-7 adds URL searchParams sync (bucket / platform /
// assetType / sort / q). The initial filter state comes from the parent
// (Server Component-computed from searchParams), so SSR and the first
// client render produce identical DOM — no hydration mismatch. After the
// user mutates a filter we replace() the URL so reload restores state and
// the filter is shareable.

import {useCallback, useEffect, useMemo, useState} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import {VisualAssetsFilterBar, DEFAULT_FILTER, type VisualFilterValue} from './VisualAssetsFilterBar'
import {AssetCardGrid} from './AssetCardGrid'
import {bucketsFor} from '@/lib/visualAssets/buckets'
import type {VisualAssetPlanListItem} from '@/lib/groq/campaign'
import type {VisualBucket} from '@/lib/visualAssets/buckets'

interface Props {
  plans: VisualAssetPlanListItem[]
  enableLocalFsRoutes: boolean
  counts: Record<VisualBucket, number>
  platforms: string[]
  assetTypes: string[]
  // Initial filter resolved server-side from searchParams.
  initialFilter: VisualFilterValue
  // Optional latest-v00N path per plan id (server-precomputed in local mode).
  latestInboxPaths?: Record<string, string>
}

function matchesSearch(plan: VisualAssetPlanListItem, search: string): boolean {
  if (!search) return true
  const needle = search.toLowerCase()
  const hay = [plan.title, plan.slug, plan._id, plan.assetType, plan.targetPlatform]
    .filter((s): s is string => typeof s === 'string')
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

function filterToSearch(value: VisualFilterValue): string {
  const params = new URLSearchParams()
  if (value.bucket !== DEFAULT_FILTER.bucket) params.set('bucket', value.bucket)
  if (value.platform) params.set('platform', value.platform)
  if (value.assetType) params.set('assetType', value.assetType)
  if (value.sort !== DEFAULT_FILTER.sort) params.set('sort', value.sort)
  if (value.search) params.set('q', value.search)
  return params.toString()
}

export function VisualAssetsListView({
  plans,
  enableLocalFsRoutes,
  counts,
  platforms,
  assetTypes,
  initialFilter,
  latestInboxPaths,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filter, setFilter] = useState<VisualFilterValue>(initialFilter)

  const onChange = useCallback((next: Partial<VisualFilterValue>) => {
    setFilter((prev) => ({...prev, ...next}))
  }, [])

  // URL sync: write filter state to ?bucket=&platform=&assetType=&sort=&q=
  // using router.replace so back/forward stays sensible. Skipped on the very
  // first render because that's the SSR state already.
  useEffect(() => {
    const qs = filterToSearch(filter)
    const target = qs ? `${pathname}?${qs}` : pathname
    router.replace(target, {scroll: false})
  }, [filter, pathname, router])

  const filtered = useMemo(() => {
    const out = plans.filter((p) => {
      const bucketHit = filter.bucket === 'all' || bucketsFor(p).includes(filter.bucket)
      const platformHit = !filter.platform || p.targetPlatform === filter.platform
      const typeHit = !filter.assetType || p.assetType === filter.assetType
      const searchHit = matchesSearch(p, filter.search)
      return bucketHit && platformHit && typeHit && searchHit
    })
    const sorted = [...out]
    switch (filter.sort) {
      case 'updated-asc':
        sorted.sort((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''))
        break
      case 'status':
        sorted.sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''))
        break
      case 'platform':
        sorted.sort((a, b) => (a.targetPlatform ?? '').localeCompare(b.targetPlatform ?? ''))
        break
      case 'updated-desc':
      default:
        sorted.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    }
    return sorted
  }, [plans, filter])

  return (
    <div className="flex flex-col gap-4">
      <VisualAssetsFilterBar
        value={filter}
        onChange={onChange}
        platforms={platforms}
        assetTypes={assetTypes}
        counts={counts}
      />
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
          条件に一致する素材がありません。フィルタを調整してください。
        </div>
      ) : (
        <AssetCardGrid
          plans={filtered}
          enableLocalFsRoutes={enableLocalFsRoutes}
          latestInboxPaths={latestInboxPaths}
        />
      )}
    </div>
  )
}
