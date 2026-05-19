// Phase Admin 2A — /visual-assets/[assetId]
//
// Single-asset landing. Renders metadata pulled from Sanity (visualAssetPlan
// + its sourceCampaign + sourceContentIdea) and links into the candidates
// review surface. Read-only — no writes.

import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanByIdQuery, type VisualAssetPlanDetail} from '@/lib/groq/campaign'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {deriveSlugsFromAssetId} from '@/lib/inboxReader'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {LocalModeBanner} from '@/components/visual-review/LocalModeBanner'
import {VisualAssetHeader} from '@/components/visual-review/VisualAssetHeader'
import {DeferredActionButton} from '@/components/visual-review/DeferredActionButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{assetId: string}>
}

async function fetchPlan(assetId: string): Promise<VisualAssetPlanDetail | null> {
  try {
    return await sanityClient.fetch<VisualAssetPlanDetail | null>(visualAssetPlanByIdQuery, {assetId})
  } catch {
    return null
  }
}

export default async function VisualAssetDetailPage({params}: PageProps) {
  const {assetId: rawAssetId} = await params
  const assetId = decodeURIComponent(rawAssetId)
  const slugs = deriveSlugsFromAssetId(assetId)
  const plan = await fetchPlan(assetId)

  // Even when the derived slugs are invalid, render a degraded page rather
  // than 404 — boss may have typed the URL by hand and we want to show what
  // the dashboard could derive.
  const campaignSlug = slugs?.campaignSlug ?? plan?.sourceCampaign?.slug ?? '—'
  const assetSlug = slugs?.assetSlug ?? plan?.slug ?? '—'
  const candidatesHref = `/visual-assets/${encodeURIComponent(assetId)}/candidates`

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />
      <LocalModeBanner enableLocalFsRoutes={enableLocalFsRoutes} />

      <VisualAssetHeader
        assetId={assetId}
        campaignSlug={campaignSlug}
        assetSlug={assetSlug}
        plan={plan}
      />

      {!plan && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>
            <strong className="font-semibold">No visualAssetPlan found in Sanity</strong> for{' '}
            <code>{assetId}</code>. Metadata above is derived from the assetId. Insert the record in
            Sanity Studio or correct the URL.
          </p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Candidate review</h2>
        <p className="mt-1 text-sm text-slate-600">
          Inbox candidates for this asset, v001 / v002 / v003. Read-only in Phase 2A — actual
          approve &amp; register continues in the local Visual Register tool.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={candidatesHref}
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            View candidates →
          </Link>
          <DeferredActionButton
            label="Approve & register"
            phase="2B"
            tooltip="Phase 2B will let the dashboard copy a candidate into assets/visuals/ and create the patch JSON. For now, approve via the Visual Register tool at http://localhost:3334."
          />
          <DeferredActionButton
            label="Regenerate prompt preview"
            phase="2B"
            tooltip="Phase 2B will surface a regeneration prompt builder. For now, edit prompt.md manually and re-run codex exec."
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">Reference</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {plan?.taskFilePath && (
            <li>
              Brief: <code className="rounded bg-slate-50 px-1 py-0.5 text-xs">{plan.taskFilePath}</code>
            </li>
          )}
          {plan?.imagePrompt && (
            <li className="text-slate-600">
              Image prompt (Sanity-managed) is set; full body shown in Phase 2A-2 prompt panel.
            </li>
          )}
          <li>
            Inbox folder:{' '}
            <code className="rounded bg-slate-50 px-1 py-0.5 text-xs">
              assets/inbox/generated/{campaignSlug}/{assetSlug}/
            </code>
          </li>
          <li>
            Expected final path:{' '}
            <code className="rounded bg-slate-50 px-1 py-0.5 text-xs">
              {plan?.expectedLocalAssetPath ?? '—'}
            </code>
          </li>
        </ul>
      </section>
    </main>
  )
}
