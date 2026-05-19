// Phase Admin 2A — /visual-assets/[assetId]/candidates
//
// Side-by-side candidate grid for one visual asset. Server Component: the
// inbox reader is called directly here when `enableLocalFsRoutes` is true,
// avoiding a self-fetch round-trip. Read-only — no writes.

import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanByIdQuery, type VisualAssetPlanDetail} from '@/lib/groq/campaign'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {
  deriveSlugsFromAssetId,
  readAssetCandidates,
  type CandidateBundle,
} from '@/lib/inboxReader'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {LocalModeBanner} from '@/components/visual-review/LocalModeBanner'
import {VisualAssetHeader} from '@/components/visual-review/VisualAssetHeader'
import {CandidateGrid} from '@/components/visual-review/CandidateGrid'
import {EmptyCandidateState} from '@/components/visual-review/EmptyCandidateState'
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

async function loadCandidates(
  campaignSlug: string,
  assetSlug: string,
): Promise<CandidateBundle | {error: string}> {
  try {
    return await readAssetCandidates(campaignSlug, assetSlug)
  } catch (e) {
    return {error: e instanceof Error ? e.message : 'unknown'}
  }
}

export default async function VisualAssetCandidatesPage({params}: PageProps) {
  const {assetId: rawAssetId} = await params
  const assetId = decodeURIComponent(rawAssetId)
  const slugs = deriveSlugsFromAssetId(assetId)
  const plan = await fetchPlan(assetId)

  const campaignSlug = slugs?.campaignSlug ?? plan?.sourceCampaign?.slug ?? '—'
  const assetSlug = slugs?.assetSlug ?? plan?.slug ?? '—'
  const detailHref = `/visual-assets/${encodeURIComponent(assetId)}`

  let bundle: CandidateBundle | null = null
  let bundleError: string | null = null
  if (enableLocalFsRoutes && slugs) {
    const result = await loadCandidates(slugs.campaignSlug, slugs.assetSlug)
    if ('error' in result) bundleError = result.error
    else bundle = result
  }

  const hasCandidates = !!bundle && bundle.candidates.length > 0
  const reviewStatus = bundle?.reviewMeta?.reviewStatus ?? null
  const rubricMaxScore = bundle?.reviewMeta?.rubricMaxScore

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />
      <LocalModeBanner enableLocalFsRoutes={enableLocalFsRoutes} />

      <nav className="text-xs text-slate-500">
        <Link href="/visual-assets" className="hover:text-slate-900">
          Visual Assets
        </Link>
        <span className="mx-1">/</span>
        <Link href={detailHref} className="hover:text-slate-900">
          {assetSlug}
        </Link>
        <span className="mx-1">/</span>
        <span>Candidates</span>
      </nav>

      <VisualAssetHeader
        assetId={assetId}
        campaignSlug={campaignSlug}
        assetSlug={assetSlug}
        plan={plan}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Candidate comparison</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Side-by-side v00N inbox candidates. Read-only — approve via Visual Register.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DeferredActionButton
              label="Approve & register"
              phase="2B"
              tooltip="Use Visual Register (http://localhost:3334) for now."
            />
            <DeferredActionButton
              label="Mark needs regeneration"
              phase="2B"
              tooltip="Phase 2B will write review-manifest.json from the dashboard."
            />
          </div>
        </header>

        {!enableLocalFsRoutes ? (
          <EmptyCandidateState reason="local-only" />
        ) : !slugs ? (
          <EmptyCandidateState reason="asset-not-found" />
        ) : bundleError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            Inbox read failed: {bundleError}
          </div>
        ) : hasCandidates ? (
          <CandidateGrid
            candidates={bundle!.candidates}
            rubricMaxScore={rubricMaxScore}
            reviewStatus={reviewStatus}
            enableLocalFsRoutes={enableLocalFsRoutes}
          />
        ) : (
          <EmptyCandidateState reason="no-candidates" />
        )}

        {bundle && bundle.warnings.length > 0 && (
          <ul className="mt-3 space-y-0.5 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
            {bundle.warnings.map((w, i) => (
              <li key={i}>warning: {w}</li>
            ))}
          </ul>
        )}
      </section>

      {bundle?.promptMeta && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Prompt context</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            From inbox <code>prompt.md</code> frontmatter (Phase 2A read-only).
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Pair label="Asset purpose" value={bundle.promptMeta.assetPurpose ?? '—'} />
            <Pair label="Platform" value={bundle.promptMeta.platform ?? '—'} />
            <Pair label="Aspect ratio" value={bundle.promptMeta.aspectRatio ?? '—'} />
            <Pair label="Pixel size" value={bundle.promptMeta.pixelSize ?? '—'} />
            <Pair label="Layout patterns" value={listOrDash(bundle.promptMeta.layoutPatterns)} />
            <Pair
              label="Required modules"
              value={listOrDash(bundle.promptMeta.requiredVisualModules)}
            />
            <Pair label="Style anchors" value={listOrDash(bundle.promptMeta.styleAnchors)} />
            <Pair
              label="Forbidden patterns"
              value={listOrDash(bundle.promptMeta.forbiddenPatterns)}
            />
          </dl>
        </section>
      )}

      {bundle?.reviewMeta && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Review rubric default</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            From inbox <code>review.md</code> frontmatter. Human override is disabled in Phase 2A;
            scores below are Codex self-review only.
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Pair label="Rubric scale" value={bundle.reviewMeta.rubricScale ?? '—'} />
            <Pair label="Max score" value={String(bundle.reviewMeta.rubricMaxScore ?? '—')} />
            <Pair label="Status" value={bundle.reviewMeta.reviewStatus ?? '—'} />
            <Pair
              label="Recommended"
              value={bundle.reviewMeta.recommendedCandidate ?? '— (not decided)'}
            />
            <Pair
              label="Human decision"
              value={bundle.reviewMeta.humanDecision ?? '— (Phase 2B input)'}
            />
            <Pair label="Axes" value={listOrDash(bundle.reviewMeta.rubricAxes)} />
          </dl>
        </section>
      )}
    </main>
  )
}

import type {ReactNode} from 'react'

function Pair({label, value}: {label: string; value: ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}

function listOrDash(items?: string[]): string {
  if (!items || items.length === 0) return '—'
  return items.join(', ')
}
