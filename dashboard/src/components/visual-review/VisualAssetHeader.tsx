// VisualAssetHeader — title + metadata block for a single visual asset.
// Source order: Sanity visualAssetPlan first, with fall-back to derived slugs
// when the dataset has no matching record (e.g. tests, dev datasets).

import type {ReactNode} from 'react'
import {StatusBadge} from '@/components/StatusBadge'
import {FilePathBlock} from '@/components/FilePathBlock'
import {SectionHeader} from '@/components/SectionHeader'
import type {VisualAssetPlanDetail} from '@/lib/groq/campaign'

export interface VisualAssetHeaderProps {
  assetId: string
  campaignSlug: string
  assetSlug: string
  plan: VisualAssetPlanDetail | null
}

export function VisualAssetHeader({
  assetId,
  campaignSlug,
  assetSlug,
  plan,
}: VisualAssetHeaderProps) {
  const title = plan?.title ?? assetSlug
  const targetPlatform = plan?.targetPlatform
  const assetType = plan?.assetType
  const placement = plan?.placement
  const aspectRatio = plan?.aspectRatio
  const status = plan?.status
  const reusePolicy = plan?.reusePolicy
  const expected = plan?.expectedLocalAssetPath
  const current = plan?.localAssetPath

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader
        title={title}
        description={`Campaign: ${plan?.sourceCampaign?.title ?? campaignSlug}`}
        right={status ? <StatusBadge state={status} /> : undefined}
      />
      <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <Pair label="Asset ID" value={<code className="break-all text-xs">{assetId}</code>} />
        <Pair label="Platform" value={targetPlatform ?? '—'} />
        <Pair label="Asset type" value={assetType ?? '—'} />
        <Pair label="Placement" value={placement ?? '—'} />
        <Pair label="Aspect ratio" value={aspectRatio ?? '—'} />
        <Pair label="Reuse policy" value={reusePolicy ?? '—'} />
      </dl>
      <div className="mt-3 space-y-1.5 text-xs">
        <div>
          <span className="text-slate-500">Expected final path:</span>{' '}
          <FilePathBlock path={expected} />
        </div>
        <div>
          <span className="text-slate-500">Current final path:</span>{' '}
          {current ? <FilePathBlock path={current} /> : <span className="italic text-slate-500">— (not saved yet)</span>}
        </div>
      </div>
    </header>
  )
}

function Pair({label, value}: {label: string; value: ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}
