// /knowledge — ナレッジDB (Phase UI-fidelity-9).
//
// Read-only browse of the 4 knowledge resource types fetched via the existing
// configuratorOptionsQuery (no new GROQ in this batch):
//   - contentIdea
//   - brandProfile
//   - visualStyleProfile
//   - promptTemplate
//
// Tabs are hand-rolled (common/Tabs.tsx, Phase UI-fidelity-1). Cards link to
// Sanity Studio in a new tab — the dashboard never mutates these records.

import {ExternalLink, Compass, Lightbulb, Palette, Wand2} from 'lucide-react'
import {sanityClient, sanityConfig} from '@/lib/sanity'
import {configuratorOptionsQuery, type ConfiguratorOptions} from '@/lib/groq/configurator'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {KnowledgeView} from '@/components/knowledge/KnowledgeView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

const STUDIO_BASE_URL = process.env.NEXT_PUBLIC_STUDIO_BASE_URL || 'http://localhost:3333'

async function fetchOptions(): Promise<ConfiguratorOptions> {
  return await sanityClient.fetch<ConfiguratorOptions>(configuratorOptionsQuery)
}

export default async function KnowledgePage() {
  const options = await fetchOptions()
  const ideaCount = options.contentIdeas.length
  const brandCount = options.brandProfiles.length
  const styleCount = options.visualStyleProfiles.length
  const promptCount = options.promptTemplates.length

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="ナレッジDB"
        description="contentIdea / brandProfile / visualStyleProfile / promptTemplate を横断的に閲覧します。書き込みは Sanity Studio で。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: 'ナレッジDB'}]}
        actions={
          <a
            href={STUDIO_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Sanity Studio を開く
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>project:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {sanityConfig.projectId}
            </code>
            <span>· dataset:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {sanityConfig.dataset}
            </code>
          </span>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="アイデア"
          value={ideaCount}
          icon={Lightbulb}
          tone="blue"
          trend={neutralTrend}
          secondary="contentIdea 件数"
        />
        <KpiCard
          label="ブランド"
          value={brandCount}
          icon={Compass}
          tone="purple"
          trend={neutralTrend}
          secondary="brandProfile"
        />
        <KpiCard
          label="スタイル"
          value={styleCount}
          icon={Palette}
          tone="orange"
          trend={neutralTrend}
          secondary="visualStyleProfile"
        />
        <KpiCard
          label="プロンプト"
          value={promptCount}
          icon={Wand2}
          tone="emerald"
          trend={neutralTrend}
          secondary="promptTemplate"
        />
      </KpiCardsRow>

      <KnowledgeView options={options} />
    </main>
  )
}
