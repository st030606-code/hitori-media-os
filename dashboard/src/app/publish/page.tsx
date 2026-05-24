import Link from 'next/link'
import {Pencil, Settings as SettingsIcon, Send} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {
  campaignDetailBySlugQuery,
  campaignListQuery,
  type CampaignPlanDetail,
  type CampaignListItem,
} from '@/lib/groq/campaign'
import {outputsListQuery, buildOutputRows, type OutputsListRaw, type OutputRow} from '@/lib/groq/outputs'
import {PageHeader} from '@/components/common/PageHeader'
import {CampaignSwitcher, type CampaignOption} from '@/components/publish/CampaignSwitcher'
import {PackageHeroCard} from '@/components/publish/PackageHeroCard'
import {ChannelsGrid} from '@/components/publish/ChannelsGrid'
import {PublishingMediaTable} from '@/components/publish/PublishingMediaTable'
import {IncludedAssetsTable} from '@/components/publish/IncludedAssetsTable'
import {PublishingLifecycleTimeline} from '@/components/publish/PublishingLifecycleTimeline'
import {ReleaseNotesCard} from '@/components/publish/ReleaseNotesCard'
import {RiskCheckCard} from '@/components/publish/RiskCheckCard'
import {PostPublishMonitoringCard} from '@/components/publish/PostPublishMonitoringCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Active campaign statuses, kept in sync with /campaigns list page.
const ACTIVE_STATUSES = new Set(['draft', 'planning', 'generating', 'reviewing'])

interface PageProps {
  searchParams: Promise<{slug?: string}>
}

async function fetchCampaign(slug: string): Promise<CampaignPlanDetail | null> {
  return await sanityClient.fetch<CampaignPlanDetail | null>(campaignDetailBySlugQuery, {slug})
}

async function fetchCampaigns(): Promise<CampaignListItem[]> {
  return await sanityClient.fetch<CampaignListItem[]>(campaignListQuery)
}

async function fetchOutputs(): Promise<OutputsListRaw> {
  return await sanityClient.fetch<OutputsListRaw>(outputsListQuery)
}

// Pick a default slug from the campaign list. Priority (Codex B2):
//   1. first campaign with manualPublishingStatus not all done
//      (manualPublishingNotStartedCount > 0)
//   2. first active campaign (status in ACTIVE_STATUSES)
//   3. first campaign in list
// Returns null when no campaigns exist.
function pickDefaultSlug(campaignList: CampaignListItem[]): string | null {
  const pending = campaignList.find(
    (c) => (c.manualPublishingNotStartedCount ?? 0) > 0 && c.slug,
  )
  if (pending?.slug) return pending.slug
  const active = campaignList.find(
    (c) => c.status && ACTIVE_STATUSES.has(c.status) && c.slug,
  )
  if (active?.slug) return active.slug
  const withSlug = campaignList.find((c) => !!c.slug)
  return withSlug?.slug ?? null
}

export default async function PublishPage({searchParams}: PageProps) {
  const sp = await searchParams
  const requestedSlug = sp.slug?.trim() || null

  // Need the campaign list first to derive a sensible default when no slug
  // is provided. Outputs are independent and can fetch in parallel.
  const [campaignList, outputsRaw] = await Promise.all([fetchCampaigns(), fetchOutputs()])

  const effectiveSlug = requestedSlug ?? pickDefaultSlug(campaignList)
  let campaign = effectiveSlug ? await fetchCampaign(effectiveSlug) : null

  // Secondary fallback: requested slug not found in dataset → derive a
  // default from the list rather than degrading to a "not found" state.
  if (!campaign && requestedSlug) {
    const fallbackSlug = pickDefaultSlug(campaignList)
    if (fallbackSlug && fallbackSlug !== requestedSlug) {
      campaign = await fetchCampaign(fallbackSlug)
    }
  }

  if (!campaign) {
    return (
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="公開管理"
          description="campaignPlan が見つかりませんでした。"
          breadcrumb={[
            {label: 'ダッシュボード', href: '/'},
            {label: '公開管理'},
          ]}
        />
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          <p>
            指定の campaign が見つかりません。{' '}
            <Link href="/campaigns" className="text-blue-700 hover:text-blue-900">
              キャンペーン一覧
            </Link>{' '}
            から確認してください。
          </p>
        </section>
      </main>
    )
  }

  const slugForLinks = campaign.slug ?? campaign._id

  const switcherOptions: CampaignOption[] = campaignList
    .filter((c) => !!c.slug)
    .map((c) => ({slug: c.slug as string, title: c.title ?? (c.slug as string)}))

  const switcherCurrent: CampaignOption = {
    slug: slugForLinks,
    title: campaign.title ?? slugForLinks,
  }

  const outputsRows = buildOutputRows(outputsRaw)
  const outputsForCampaign: OutputRow[] = outputsRows.filter(
    (r) => r.campaignSlug === slugForLinks,
  )

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="公開管理"
        description="Publish Package を単位として、公開状態・チャネル・リスクをまとめて確認します。"
        breadcrumb={[
          {label: 'ダッシュボード', href: '/'},
          {label: 'キャンペーン', href: '/campaigns'},
          {label: campaign.title ?? slugForLinks, href: `/campaigns/${slugForLinks}`},
          {label: '公開管理'},
        ]}
        actions={
          <>
            <button
              type="button"
              disabled
              title="Phase UI-3+ で実装予定"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Pencil size={14} aria-hidden="true" />
              公開パッケージを編集
            </button>
            <button
              type="button"
              disabled
              title="Phase UI-7+ で実装予定"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <SettingsIcon size={14} aria-hidden="true" />
              公開設定
            </button>
            <button
              type="button"
              disabled
              title="Phase UI-7+ で実装予定 — 現状は手動公開のみ"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Send size={14} aria-hidden="true" />
              今すぐ公開
            </button>
          </>
        }
      />

      <CampaignSwitcher current={switcherCurrent} options={switcherOptions} />

      <PackageHeroCard campaign={campaign} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <ChannelsGrid
            campaignSlug={slugForLinks}
            publishing={campaign.manualPublishingStatus ?? []}
            selectedPlatforms={campaign.selectedPlatforms ?? []}
          />
          <PublishingMediaTable
            campaignSlug={slugForLinks}
            publishing={campaign.manualPublishingStatus ?? []}
            selectedPlatforms={campaign.selectedPlatforms ?? []}
          />
          <IncludedAssetsTable
            visuals={campaign.visualAssetDetails ?? []}
            outputs={outputsForCampaign}
            campaignSlug={slugForLinks}
          />
        </div>
        <div className="flex flex-col gap-5">
          <PublishingLifecycleTimeline campaign={campaign} />
          <ReleaseNotesCard campaign={campaign} />
          <RiskCheckCard />
          <PostPublishMonitoringCard />
        </div>
      </div>
    </main>
  )
}
