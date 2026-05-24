import Link from 'next/link'
import {ArrowRight, FileText, Edit3, Eye, CheckCircle2, Plus} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {
  outputsListQuery,
  buildOutputRows,
  countByBucket,
  countByPlatform,
  distinctCampaigns,
  type OutputsListRaw,
} from '@/lib/groq/outputs'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {OutputsView} from '@/components/outputs/OutputsView'
import {PlatformBreakdownCard} from '@/components/outputs/PlatformBreakdownCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchOutputs(): Promise<OutputsListRaw> {
  return await sanityClient.fetch<OutputsListRaw>(outputsListQuery)
}

export default async function OutputsPage() {
  const raw = await fetchOutputs()
  const rows = buildOutputRows(raw)
  const kpis = countByBucket(rows)
  const platformCounts = countByPlatform(rows)
  const campaigns = distinctCampaigns(rows)
    .filter((c) => !!c.slug)
    .map((c) => ({slug: c.slug as string, title: c.title}))
  const platformKeys = Array.from(new Set(rows.map((r) => r.platform))).filter(
    (p) => p && p !== '—',
  )

  const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="出力管理"
        description="すべての出力をプラットフォーム横断で管理できます。"
        actions={
          <Link
            href="/configurator"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <Plus size={14} aria-hidden="true" />
            新規出力
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="全出力"
          value={kpis.total}
          icon={FileText}
          tone="slate"
          trend={neutralTrend}
          secondary="platformOutput + 公開状況"
        />
        <KpiCard
          label="下書き"
          value={kpis.draft}
          icon={Edit3}
          tone="purple"
          trend={neutralTrend}
          secondary="drafted / 未着手"
        />
        <KpiCard
          label="レビュー待ち"
          value={kpis.review}
          icon={Eye}
          tone="orange"
          trend={neutralTrend}
          secondary="reviewed / ready / blocked"
        />
        <KpiCard
          label="公開済み"
          value={kpis.published}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          secondary="published URL あり"
        />
      </KpiCardsRow>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div>
          <OutputsView rows={rows} campaigns={campaigns} platforms={platformKeys} />
        </div>
        <div className="flex flex-col gap-5">
          <PlatformBreakdownCard counts={platformCounts} />
          <FallbackNotice rows={rows} />
        </div>
      </div>
    </main>
  )
}

function FallbackNotice({rows}: {rows: ReturnType<typeof buildOutputRows>}) {
  const hasPlatformOutput = rows.some((r) => r.source === 'platformOutput')
  const hasManualPublishing = rows.some((r) => r.source === 'manualPublishing')

  if (hasPlatformOutput && hasManualPublishing) {
    return null
  }

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
      <h2 className="text-sm font-semibold">データソース</h2>
      <p className="mt-1 text-xs leading-relaxed text-blue-900">
        {hasPlatformOutput
          ? '本ページは Sanity の platformOutput ドキュメントを主に表示しています。'
          : hasManualPublishing
            ? 'Sanity に platformOutput ドキュメントが未投入のため、campaignPlan.manualPublishingStatus を proxy として表示しています。Phase UI-3 で本格データを統合する予定です。'
            : '表示できる出力がまだありません。'}
      </p>
      <p className="mt-2 text-[11px] text-blue-700">
        Phase UI-3 で <code className="rounded bg-white px-1">/publish-package/[slug]</code> から行 inline 編集 / write actions を導入予定。
      </p>
    </section>
  )
}
