import Link from 'next/link'
import {notFound} from 'next/navigation'
import {sanityClient, sanityConfig, studioDocumentUrl} from '@/lib/sanity'
import {campaignDetailBySlugQuery, type CampaignPlanDetail} from '@/lib/groq/campaign'
import {CampaignStatusCard} from '@/components/CampaignStatusCard'
import {SelectedPlatformChips} from '@/components/SelectedPlatformChips'
import {HumanReviewGateList} from '@/components/HumanReviewGateList'
import {VisualAssetStatusTable} from '@/components/VisualAssetStatusTable'
import {PromptTemplateSummary} from '@/components/PromptTemplateSummary'
import {PublishPackageLinks} from '@/components/PublishPackageLinks'
import {ManualPublishingStatusList} from '@/components/ManualPublishingStatusList'
import {NextActionSummary} from '@/components/NextActionSummary'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {PublishReadinessBoard} from '@/components/PublishReadinessBoard'
import {ReleaseReviewLinks} from '@/components/ReleaseReviewLinks'

// Force dynamic rendering — campaignPlan data is expected to change as the
// human moves visual / publish gates forward, and Phase Admin 1 should reflect
// dataset state on every request. We could opt into ISR later.
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchCampaign(slug: string): Promise<CampaignPlanDetail | null> {
  return await sanityClient.fetch<CampaignPlanDetail | null>(campaignDetailBySlugQuery, {slug})
}

interface PageProps {
  params: Promise<{slug: string}>
}

export default async function CampaignDetailPage({params}: PageProps) {
  const {slug} = await params
  const campaign = await fetchCampaign(slug)

  if (!campaign) {
    notFound()
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <CampaignStatusCard campaign={campaign} />

      <PublishReadinessBoard />

      <section className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-emerald-950">公開パッケージを開く</h2>
            <p className="mt-0.5 text-xs text-emerald-900">
              各媒体への投稿文コピーと画像確認をこの 1 画面で。
            </p>
          </div>
          <Link
            href={`/publish-package/${campaign.slug ?? campaign._id}`}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            公開パッケージを開く →
          </Link>
        </div>
      </section>

      <ReleaseReviewLinks />

      <NextActionSummary campaign={campaign} />

      <ContentIdeaSection campaign={campaign} />
      <BrandProfileSection campaign={campaign} />

      <SelectedPlatformChips platforms={campaign.selectedPlatforms} />

      <HumanReviewGateList gates={campaign.humanReviewGates} />

      <VisualAssetStatusTable assets={campaign.visualAssetDetails} />

      <PromptTemplateSummary selections={campaign.promptTemplateDetails} />

      <PublishPackageLinks
        paths={campaign.publishPackagePaths}
        releaseReviewPath={campaign.releaseReviewPath}
      />

      <ManualPublishingStatusList items={campaign.manualPublishingStatus} />

      <ExternalLinks campaign={campaign} />
    </main>
  )
}

function ContentIdeaSection({campaign}: {campaign: CampaignPlanDetail}) {
  const idea = campaign.sourceContentIdea
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-900">Source Content Idea</h2>
      {idea ? (
        <div className="text-sm">
          <div className="font-medium text-slate-900">{idea.title ?? idea._id}</div>
          <div className="text-xs text-slate-500">
            <code>{idea._id}</code>
            {idea.slug && <> &middot; slug: <code>{idea.slug}</code></>}
            {idea.status && <> &middot; status: {idea.status}</>}
          </div>
          {idea.coreThesis && (
            <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-700">{idea.coreThesis}</p>
          )}
          {idea.audience && idea.audience.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-600">
              {idea.audience.map((a, i) => (
                <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-rose-700">Source Content Idea reference not resolved.</p>
      )}
    </section>
  )
}

function BrandProfileSection({campaign}: {campaign: CampaignPlanDetail}) {
  const brand = campaign.brandProfile
  if (!brand) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Brand Profile</h2>
        <p className="mt-2">Brand profile reference not resolved.</p>
      </section>
    )
  }
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-900">Brand Profile</h2>
      <div className="text-sm">
        <div className="font-medium text-slate-900">{brand.brandName ?? brand.title ?? brand._id}</div>
        <div className="text-xs text-slate-500">
          <code>{brand._id}</code>
          {brand.ownerType && <> &middot; owner: {brand.ownerType}</>}
          {brand.status && <> &middot; status: {brand.status}</>}
        </div>
        {brand.voiceTone?.voice && (
          <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-700">{brand.voiceTone.voice}</p>
        )}
        {brand.defaultPlatforms && brand.defaultPlatforms.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-600">
            default platforms:
            {brand.defaultPlatforms.map((p) => (
              <span key={p} className="rounded bg-slate-100 px-1.5 py-0.5">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ExternalLinks({campaign}: {campaign: CampaignPlanDetail}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Open elsewhere</h2>
      <ul className="space-y-1.5 text-sm">
        <li>
          <a
            className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
            href={studioDocumentUrl(campaign._id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Edit in Sanity Studio →
          </a>{' '}
          <span className="text-xs text-slate-500">
            (project <code>{sanityConfig.projectId}</code>, dataset <code>{sanityConfig.dataset}</code>)
          </span>
        </li>
        <li>
          <a
            className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
            href="http://localhost:3334"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Visual Register (localhost:3334) →
          </a>
        </li>
      </ul>
    </section>
  )
}
