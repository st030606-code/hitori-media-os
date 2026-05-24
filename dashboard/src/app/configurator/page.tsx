// /configurator — Output Configurator (Phase UI-fidelity-5).
//
// Server Component that fetches the option lists + recent outputs + lifecycle
// counts in parallel, then hands them to the <ConfiguratorForm> client wrapper
// which owns the form state.

import {sanityClient} from '@/lib/sanity'
import {
  configuratorOptionsQuery,
  type ConfiguratorOptions,
} from '@/lib/groq/configurator'
import {
  outputsListQuery,
  buildOutputRows,
  type OutputsListRaw,
} from '@/lib/groq/outputs'
import {dashboardHomeQuery, type DashboardHomeData} from '@/lib/groq/campaign'
import {listRecentGenerationJobs} from '@/lib/generationJobs/reader'
import {PageHeader} from '@/components/common/PageHeader'
import {ConfiguratorForm} from '@/components/configurator/ConfiguratorForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchOptions(): Promise<ConfiguratorOptions> {
  return await sanityClient.fetch<ConfiguratorOptions>(configuratorOptionsQuery)
}

async function fetchOutputs(): Promise<OutputsListRaw> {
  return await sanityClient.fetch<OutputsListRaw>(outputsListQuery)
}

async function fetchHome(): Promise<DashboardHomeData> {
  return await sanityClient.fetch<DashboardHomeData>(dashboardHomeQuery)
}

export default async function ConfiguratorPage() {
  const [options, outputsRaw, home, recentGenerationJobs] = await Promise.all([
    fetchOptions(),
    fetchOutputs(),
    fetchHome(),
    listRecentGenerationJobs(20),
  ])
  const recentOutputs = buildOutputRows(outputsRaw)

  const lifecycle = {
    idea: home.contentIdeaTotal,
    structured: home.campaignTotal,
    draft: home.manualPublishingPending,
    review: home.pendingGatesTotal,
    published: home.manualPublishingDone,
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="出力コンフィギュレーター"
        description="SanityのContent Ideaから、生成プロンプト、AI生成結果の取り込み、platformOutput、図解プランまでを順番に進めます。AI実行は手動です。"
        breadcrumb={[
          {label: 'ダッシュボード', href: '/'},
          {label: '出力コンフィギュレーター'},
        ]}
      />

      <ConfiguratorForm
        options={options}
        recentOutputs={recentOutputs}
        recentGenerationJobs={recentGenerationJobs}
        lifecycle={lifecycle}
      />
    </main>
  )
}
