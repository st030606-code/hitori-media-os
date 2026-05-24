import Link from 'next/link'
import {Activity, CheckCircle2, ChevronRight, Eye, Rocket} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {campaignListQuery, type CampaignListItem} from '@/lib/groq/campaign'
import {StatusBadge} from '@/components/StatusBadge'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {PlatformBadge} from '@/components/common/PlatformBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}
const ACTIVE_STATUSES = new Set(['draft', 'planning', 'generating', 'reviewing'])

async function fetchCampaigns(): Promise<CampaignListItem[]> {
  return await sanityClient.fetch<CampaignListItem[]>(campaignListQuery)
}

export default async function CampaignsListPage() {
  const campaigns = await fetchCampaigns()
  const activeCount = campaigns.filter((c) => c.status && ACTIVE_STATUSES.has(c.status)).length
  const publishedTotal = campaigns.reduce(
    (acc, c) => acc + (c.manualPublishingDoneCount ?? 0),
    0,
  )
  const pendingGatesTotal = campaigns.reduce((acc, c) => acc + (c.pendingGatesCount ?? 0), 0)

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="キャンペーン"
        description={
          campaigns.length === 0
            ? 'キャンペーンプランがまだ登録されていません。'
            : `${campaigns.length} 件のキャンペーンプランを管理しています。`
        }
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: 'キャンペーン'}]}
      />

      <KpiCardsRow>
        <KpiCard
          label="全キャンペーン"
          value={campaigns.length}
          icon={Rocket}
          tone="slate"
          trend={neutralTrend}
          secondary="campaignPlan 件数"
        />
        <KpiCard
          label="active"
          value={activeCount}
          icon={Activity}
          tone="blue"
          trend={neutralTrend}
          secondary="draft / planning / generating / reviewing"
        />
        <KpiCard
          label="公開済み"
          value={publishedTotal}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          secondary="manualPublishingStatus.publishedUrl"
        />
        <KpiCard
          label="レビュー待ち"
          value={pendingGatesTotal}
          icon={Eye}
          tone="orange"
          trend={neutralTrend}
          secondary="humanReviewGates"
        />
      </KpiCardsRow>

      {campaigns.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">キャンペーンを表示できません。</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">タイトル</th>
                  <th className="px-4 py-2.5 font-medium">状態</th>
                  <th className="px-4 py-2.5 font-medium">媒体</th>
                  <th className="px-4 py-2.5 font-medium text-right">進捗</th>
                  <th className="px-4 py-2.5 font-medium" aria-label="actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <CampaignRow key={c._id} campaign={c} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

function progressOf(c: CampaignListItem): {pct: number; label: string} {
  const pubDone = c.manualPublishingDoneCount ?? 0
  const pubPending = c.manualPublishingNotStartedCount ?? 0
  const pubTotal = pubDone + pubPending
  if (pubTotal > 0) {
    return {pct: Math.round((pubDone / pubTotal) * 100), label: `公開 ${pubDone}/${pubTotal}`}
  }
  const visTotal = c.totalVisualsCount ?? 0
  if (visTotal > 0) {
    const visDone = c.doneVisualsCount ?? 0
    return {pct: Math.round((visDone / visTotal) * 100), label: `画像 ${visDone}/${visTotal}`}
  }
  return {pct: 0, label: '未着手'}
}

function CampaignRow({campaign: c}: {campaign: CampaignListItem}) {
  const {pct, label} = progressOf(c)
  const enabledPlatforms = (c.selectedPlatforms ?? []).filter((p) => p.enabled !== false)
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 align-middle">
        <Link
          href={`/campaigns/${c.slug ?? c._id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <div className="font-medium text-slate-900">{c.title ?? c._id}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <code className="rounded bg-slate-100 px-1 py-0.5">{c.slug ?? c._id}</code>
            {c.sourceContentIdea?.title && (
              <span>
                ← {c.sourceContentIdea.title}
              </span>
            )}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusBadge state={c.status} label={c.status ?? '—'} />
        {c.automationLevel && (
          <div className="mt-1 text-[11px] text-slate-500">auto: {c.automationLevel}</div>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        {enabledPlatforms.length === 0 ? (
          <span className="text-xs text-slate-400">—</span>
        ) : (
          <ul className="flex flex-wrap gap-1">
            {enabledPlatforms.slice(0, 6).map((p, i) => (
              <li key={`${p.platform ?? 'p'}-${i}`}>
                <PlatformBadge platform={p.platform ?? '—'} />
              </li>
            ))}
            {enabledPlatforms.length > 6 && (
              <li className="text-[11px] text-slate-500">+{enabledPlatforms.length - 6}</li>
            )}
          </ul>
        )}
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <div className="ml-auto w-24">
          <div className="text-xs tabular-nums text-slate-700">{pct}%</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={pct === 100 ? 'h-full bg-emerald-500' : 'h-full bg-blue-500'}
              style={{width: `${pct}%`}}
            />
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">{label}</div>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <Link
          href={`/campaigns/${c.slug ?? c._id}`}
          aria-label={`${c.title ?? c._id} を開く`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
