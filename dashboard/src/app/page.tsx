import Link from 'next/link'
import {Lightbulb, FileText, Eye, CheckCircle2, Database, ArrowRight} from 'lucide-react'
import {sanityClient, sanityConfig} from '@/lib/sanity'
import {
  dashboardHomeQuery,
  type CampaignListItem,
  type DashboardHomeData,
} from '@/lib/groq/campaign'
import {outputsListQuery, buildOutputRows, type OutputsListRaw} from '@/lib/groq/outputs'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {LifecyclePipeline} from '@/components/common/LifecyclePipeline'
import {ContentOutputConfiguratorCard} from '@/components/dashboard/ContentOutputConfiguratorCard'
import {ActiveCampaignsCard} from '@/components/dashboard/ActiveCampaignsCard'
import {RecentOutputsTable} from '@/components/dashboard/RecentOutputsTable'
import {TodayTasksCard, type TaskItem} from '@/components/dashboard/TodayTasksCard'
import {LearningInsightsCard, type LearningInsight} from '@/components/dashboard/LearningInsightsCard'
import {EngagementPlaceholder} from '@/components/dashboard/EngagementPlaceholder'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchHome(): Promise<DashboardHomeData> {
  return await sanityClient.fetch<DashboardHomeData>(dashboardHomeQuery)
}

async function fetchOutputs(): Promise<OutputsListRaw> {
  return await sanityClient.fetch<OutputsListRaw>(outputsListQuery)
}

// Active campaign statuses, kept in sync with /campaigns list page.
const ACTIVE_STATUSES = new Set(['draft', 'planning', 'generating', 'reviewing'])

// Pick a campaign to anchor home-page CTAs and tasks on. Priority:
//   1. first active campaign (status in ACTIVE_STATUSES)
//   2. first campaign with manualPublishingNotStartedCount > 0
//   3. first campaign in list
// Returns null when no campaigns exist — callers should fall back to safe
// empty copy instead of hardcoding a sample slug.
function pickPrimaryCampaign(campaigns: CampaignListItem[]): CampaignListItem | null {
  if (campaigns.length === 0) return null
  const active = campaigns.find((c) => c.status && ACTIVE_STATUSES.has(c.status) && c.slug)
  if (active) return active
  const pending = campaigns.find(
    (c) => (c.manualPublishingNotStartedCount ?? 0) > 0 && c.slug,
  )
  if (pending) return pending
  const withSlug = campaigns.find((c) => !!c.slug)
  return withSlug ?? campaigns[0] ?? null
}

export default async function HomePage() {
  const [data, outputsRaw] = await Promise.all([fetchHome(), fetchOutputs()])
  const recentOutputs = buildOutputRows(outputsRaw)
  const primaryCampaign = pickPrimaryCampaign(data.campaigns)
  const primarySlug = primaryCampaign?.slug ?? null
  const primaryTitle = primaryCampaign?.title ?? primarySlug ?? null

  const tasks = buildTasks(data, primarySlug)
  const insights = buildInsights(data)

  const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="ダッシュボード"
        description="アイデアから出力・レビュー・公開・学習まで、すべてを一元管理します。"
        actions={
          primarySlug ? (
            <Link
              href={`/publish-package/${encodeURIComponent(primarySlug)}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              title={primaryTitle ? `公開パッケージを開く: ${primaryTitle}` : undefined}
            >
              公開パッケージを開く
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              title="キャンペーンがまだありません"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
            >
              公開パッケージを開く
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          )
        }
      />

      {!primarySlug && (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-medium text-slate-800">キャンペーンがまだありません</p>
          <p className="mt-1">
            Sanity Studio で <code className="rounded bg-white px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">campaignPlan</code>{' '}
            を 1 件作成すると、ダッシュボードの CTA と今日のタスクが当該キャンペーンに紐づきます。
          </p>
        </section>
      )}

      <KpiCardsRow>
        <KpiCard
          label="コンテンツアイデア"
          value={data.contentIdeaTotal}
          icon={Lightbulb}
          tone="blue"
          trend={neutralTrend}
          sparkline={[3, 5, 4, 6, 8, 9, 11]}
          secondary="構造化済みレコード"
        />
        <KpiCard
          label="下書き"
          value={data.manualPublishingPending}
          icon={FileText}
          tone="purple"
          trend={neutralTrend}
          sparkline={[2, 3, 5, 4, 6, 5, 7]}
          secondary="公開待ちの media × campaign"
        />
        <KpiCard
          label="レビュー待ち"
          value={data.pendingGatesTotal}
          icon={Eye}
          tone="orange"
          trend={neutralTrend}
          sparkline={[1, 2, 2, 3, 3, 4, 4]}
          secondary="人間判定ゲート"
        />
        <KpiCard
          label="公開済み"
          value={data.manualPublishingDone}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          sparkline={[0, 0, 1, 1, 2, 3, 3]}
          secondary="manualPublishingStatus 集計"
        />
        <KpiCard
          label="ナレッジ資産"
          value={data.knowledgeAssetTotal}
          icon={Database}
          tone="blue"
          trend={neutralTrend}
          sparkline={[10, 12, 14, 13, 15, 17, 18]}
          secondary="brand / style / prompt / tool"
        />
      </KpiCardsRow>

      {/* Upper grid: Configurator (65%) + TodayTasks (35%) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContentOutputConfiguratorCard />
        </div>
        <div className="lg:col-span-1">
          <TodayTasksCard tasks={tasks} />
        </div>
      </div>

      {/* Lifecycle pipeline: full width */}
      <LifecyclePipeline
        title="コンテンツライフサイクル"
        caption="Idea → Structured → Draft → Review → Published"
        stages={[
          {key: 'idea', label: 'アイデア', count: data.contentIdeaTotal, description: '原型を構造化記録'},
          {key: 'structured', label: '構造化済み', count: data.campaignTotal, description: 'campaignPlan として整理'},
          {key: 'draft', label: '下書き', count: data.manualPublishingPending, description: '媒体別アウトプット'},
          {key: 'review', label: 'レビュー待ち', count: data.pendingGatesTotal, description: '人間判定ゲート'},
          {key: 'published', label: '公開済み', count: data.manualPublishingDone, description: '反応データ収集中'},
        ]}
        currentStage={
          data.pendingGatesTotal > 0
            ? 'review'
            : data.manualPublishingPending > 0
              ? 'draft'
              : 'published'
        }
      />

      {/* Middle row: ActiveCampaigns + RecentOutputs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ActiveCampaignsCard campaigns={data.campaigns} />
        <RecentOutputsTable rows={recentOutputs} />
      </div>

      {/* Lower row: LearningInsights + Engagement placeholder */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LearningInsightsCard insights={insights} />
        <EngagementPlaceholder />
      </div>

      {/* Lower prominence: 外部ツール (release-review links moved to
          /campaigns/[slug] page-local ReleaseReviewCard per UI-fidelity-11) */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">外部ツール</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link className="text-blue-700 underline underline-offset-2 hover:text-blue-900" href="/campaigns">
              すべてのキャンペーンを開く →
            </Link>
          </li>
          <li>
            <Link
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
              href="/human-review-gates"
            >
              確認待ちゲートを開く →
            </Link>
          </li>
          <li>
            <a
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visual Register (localhost:3334) →
            </a>
          </li>
          <li>
            <a
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sanity Studio (localhost:3333) →
            </a>{' '}
            <span className="text-xs text-slate-500">
              (<code>{sanityConfig.projectId}</code> / <code>{sanityConfig.dataset}</code>)
            </span>
          </li>
        </ul>
      </section>
    </main>
  )
}

function buildTasks(data: DashboardHomeData, primarySlug: string | null): TaskItem[] {
  const out: TaskItem[] = []
  if (data.pendingGatesTotal > 0) {
    out.push({
      id: 'pending-gates',
      title: `確認待ちゲートが ${data.pendingGatesTotal} 件あります`,
      dueLabel: '優先度高',
      href: '/human-review-gates',
      priority: 'high',
    })
  }
  // Campaign-specific tasks are only emitted when we know which campaign to
  // link to. On a fresh workspace these would otherwise point at a sample
  // slug that does not exist (Codex review B1).
  const pkgHref = primarySlug ? `/publish-package/${encodeURIComponent(primarySlug)}` : null
  if (data.manualPublishingPending > 0 && pkgHref) {
    out.push({
      id: 'publishing-pending',
      title: `公開待ちの媒体: ${data.manualPublishingPending} 件`,
      dueLabel: '公開パッケージから手動投稿',
      href: pkgHref,
      priority: 'medium',
    })
  }
  if (pkgHref) {
    out.push({
      id: 'reaction-notes',
      title: '反応メモを 24-72h 後に追記',
      dueLabel: 'X / note / Substack の反応データ',
      href: pkgHref,
      priority: 'medium',
    })
    out.push({
      id: 'threads-decision',
      title: 'Threads 公開判断',
      dueLabel: '反応を見てから次回以降',
      href: `${pkgHref}#threads`,
      priority: 'low',
    })
    if (data.manualPublishingDone > 0) {
      out.push({
        id: 'release-review-ack',
        title: 'release-review 5 ファイル最終確認',
        dueLabel: '完了',
        href: pkgHref,
        priority: 'low',
        completed: true,
      })
    }
  }
  return out
}

function buildInsights(data: DashboardHomeData): LearningInsight[] {
  const out: LearningInsight[] = []
  out.push({
    id: 'os-loop-complete',
    title: 'Working Pipeline 1 周完走',
    description: 'Step A–G の手動運用ループが 1 キャンペーンで通った。次は反応データで型を確かめる段階。',
    metric: `公開済み ${data.manualPublishingDone} / 4 媒体`,
    tone: 'emerald',
  })
  if (data.pendingGatesTotal > 0 || data.manualPublishingPending > 0) {
    out.push({
      id: 'pending-loop',
      title: '残る手動作業の場所',
      description: `確認待ち ${data.pendingGatesTotal} 件、公開待ち ${data.manualPublishingPending} 件。自動化の優先順位はここから決める。`,
      tone: 'orange',
    })
  }
  out.push({
    id: 'configurator-next',
    title: 'Output Configurator が中核 monetizable feature',
    description: 'contentIdea → AI 派生の体験そのものが製品価値。Phase UI-4 で MVP 化予定。',
    tone: 'blue',
  })
  return out
}
