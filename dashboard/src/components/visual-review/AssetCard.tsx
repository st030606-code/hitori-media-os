// AssetCard — single visualAssetPlan as a card on /visual-assets.
// Thumbnail fallback chain (Phase UI-fidelity-7):
//   1. localAssetPath under assets/visuals/ → /api/asset-thumb (final asset)
//   2. server-precomputed latestInboxPath (highest v00N) → /api/asset-thumb
//   3. derived v001 path under assets/inbox/generated/ (best effort)
//   4. ImageIcon placeholder (assetType / status badge still visible)

import Link from 'next/link'
import {ChevronRight, Image as ImageIcon} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {statusLabelJa} from '@/lib/statusJa'
import {assetRoleJa, assetSlugFromId} from '@/lib/assetRoleJa'
import {campaignSlugFromAssetId} from '@/lib/visualAssets/buckets'
import type {VisualAssetPlanListItem} from '@/lib/groq/campaign'

interface Props {
  plan: VisualAssetPlanListItem
  enableLocalFsRoutes: boolean
  // Optional: highest-numbered v00N inbox candidate (server-precomputed).
  latestInboxPath?: string
}

function shortJst(iso?: string): string {
  if (!iso) return '—'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '—'
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildThumbSrc(
  plan: VisualAssetPlanListItem,
  enableLocalFsRoutes: boolean,
  latestInboxPath?: string,
): {src: string; source: 'final' | 'inbox-latest' | 'inbox-fallback'} | null {
  if (!enableLocalFsRoutes) return null
  const finalPath = plan.localAssetPath
  if (finalPath && finalPath.startsWith('assets/visuals/')) {
    return {src: `/api/asset-thumb?path=${encodeURIComponent(finalPath)}`, source: 'final'}
  }
  if (latestInboxPath && latestInboxPath.startsWith('assets/inbox/generated/')) {
    return {
      src: `/api/asset-thumb?path=${encodeURIComponent(latestInboxPath)}`,
      source: 'inbox-latest',
    }
  }
  const campaignSlug = campaignSlugFromAssetId(plan._id)
  const assetSlug = plan.slug ?? assetSlugFromId(plan._id)
  if (campaignSlug && assetSlug) {
    const inboxPath = `assets/inbox/generated/${campaignSlug}/${assetSlug}/v001.png`
    return {
      src: `/api/asset-thumb?path=${encodeURIComponent(inboxPath)}`,
      source: 'inbox-fallback',
    }
  }
  return null
}

const SOURCE_LABEL: Record<'final' | 'inbox-latest' | 'inbox-fallback', string> = {
  final: '最終',
  'inbox-latest': '最新候補',
  'inbox-fallback': 'v001',
}

export function AssetCard({plan, enableLocalFsRoutes, latestInboxPath}: Props) {
  const slug = plan.slug ?? assetSlugFromId(plan._id) ?? plan._id
  const roleJa = assetRoleJa(slug)
  const title = plan.title ?? roleJa ?? slug
  const detailHref = `/visual-assets/${encodeURIComponent(plan._id)}`
  const candidatesHref = `${detailHref}/candidates`
  const thumb = buildThumbSrc(plan, enableLocalFsRoutes, latestInboxPath)
  const updated = shortJst(plan.updatedAt)

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-50"
        aria-label={`${title} の詳細を開く`}
      >
        {thumb ? (
          <>
            {/* Local-mode-only preview via dev API. Native <img> on purpose —
                no Next.js image optimization for already-bounded local PNGs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb.src}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute right-1.5 top-1.5 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200 backdrop-blur">
              {SOURCE_LABEL[thumb.source]}
            </span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageIcon size={36} aria-hidden="true" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={detailHref}
              className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700"
            >
              {title}
            </Link>
            {roleJa && title !== roleJa && (
              <p className="truncate text-[11px] text-slate-500">{roleJa}</p>
            )}
            <p className="truncate text-[11px] text-slate-400">
              <code>{slug}</code>
            </p>
          </div>
          <StatusBadge state={plan.status} label={statusLabelJa(plan.status)} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
          {plan.targetPlatform && <PlatformBadge platform={plan.targetPlatform} />}
          {plan.targetPlatform && <span>{platformLabel(plan.targetPlatform)}</span>}
          {plan.assetType && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 ring-1 ring-inset ring-slate-200">
              {plan.assetType}
            </span>
          )}
          {plan.aspectRatio && <span>{plan.aspectRatio}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
          <span className="tabular-nums text-slate-500">更新: {updated}</span>
          <Link
            href={candidatesHref}
            className="inline-flex items-center gap-0.5 font-medium text-blue-700 hover:text-blue-900"
          >
            候補を見る
            <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
