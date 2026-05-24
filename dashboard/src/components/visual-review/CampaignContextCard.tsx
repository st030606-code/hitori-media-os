// CampaignContextCard — sourceCampaign + sourceContentIdea + asset routing
// metadata. Used on the detail page right column.

import Link from 'next/link'
import {FolderOpen} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import type {VisualAssetPlanDetail} from '@/lib/groq/campaign'

interface Props {
  plan: VisualAssetPlanDetail | null
  campaignSlug: string
  assetSlug: string
}

export function CampaignContextCard({plan, campaignSlug, assetSlug}: Props) {
  const camp = plan?.sourceCampaign
  const idea = plan?.sourceContentIdea
  const platform = plan?.targetPlatform
  const placement = plan?.placement

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
          aria-hidden="true"
        >
          <FolderOpen size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">コンテキスト</h2>
          <p className="text-[11px] text-slate-500">この素材の親キャンペーン / アイデア</p>
        </div>
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm">
        <Pair
          label="キャンペーン"
          value={
            camp?.slug ? (
              <Link
                href={`/campaigns/${encodeURIComponent(camp.slug)}`}
                className="font-medium text-slate-900 hover:text-blue-700"
              >
                {camp.title ?? camp.slug}
              </Link>
            ) : (
              <span className="text-slate-700">{camp?.title ?? campaignSlug ?? '—'}</span>
            )
          }
        />
        <Pair
          label="campaignSlug"
          value={<code className="break-all text-[11px]">{camp?.slug ?? campaignSlug ?? '—'}</code>}
        />
        <Pair
          label="assetSlug"
          value={<code className="break-all text-[11px]">{plan?.slug ?? assetSlug ?? '—'}</code>}
        />
        <Pair
          label="content idea"
          value={
            idea ? (
              <span className="text-slate-700">
                {idea.title ?? idea._id}{' '}
                <span className="text-[11px] text-slate-500">(<code>{idea.slug ?? idea._id}</code>)</span>
              </span>
            ) : (
              '—'
            )
          }
        />
        <Pair
          label="媒体"
          value={
            platform ? (
              <span className="inline-flex items-center gap-1.5">
                <PlatformBadge platform={platform} />
                <span>{platformLabel(platform)}</span>
              </span>
            ) : (
              '—'
            )
          }
        />
        <Pair label="placement" value={placement ?? '—'} />
      </dl>

      {camp?.coreThesis && (
        <p className="mt-3 line-clamp-3 rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-700 ring-1 ring-inset ring-slate-200">
          {camp.coreThesis}
        </p>
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
