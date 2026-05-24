// /analytics — アナリティクス (Phase UI-fidelity-9).
//
// Read-only post-publish performance + learning surface. No new GROQ query
// in this batch (boss decision): we run dashboardHomeQuery and outputsListQuery
// in parallel and aggregate page-side. External analytics APIs (Plausible /
// X / note) are Phase Analytics-2 placeholder via FutureIntegrationCard.

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {ArrowRight, CheckCircle2, FileText, Layers, MessageSquare, Rocket} from 'lucide-react'
import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {enableWriteActions} from '@/lib/featureFlags'
import {dashboardHomeQuery, type DashboardHomeData} from '@/lib/groq/campaign'
import {
  outputsListQuery,
  type OutputsListRaw,
  type CampaignWithPublishingRaw,
} from '@/lib/groq/outputs'
import {repoPath} from '@/lib/repoRoot'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {
  PlatformPerformanceCard,
  type PlatformStat,
} from '@/components/analytics/PlatformPerformanceCard'
import {
  CampaignAnalyticsTable,
  type CampaignAnalyticsRow,
} from '@/components/analytics/CampaignAnalyticsTable'
import {ReactionNotesCard, type ReactionNoteRow} from '@/components/analytics/ReactionNotesCard'
import {
  PendingMonitoringCard,
  type PendingMonitoringRow,
} from '@/components/analytics/PendingMonitoringCard'
import {UndoToastHost} from '@/components/common/UndoToastHost'
import {FutureIntegrationCard} from '@/components/analytics/FutureIntegrationCard'
import {
  LearningInsightsCard,
  type DevlogInsight,
} from '@/components/analytics/LearningInsightsCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}
const LATEST_DEVLOGS = 5
const DEVLOG_EXCERPT_LEN = 240

// ---------- aggregation helpers ----------

function buildPlatformStats(raw: OutputsListRaw): PlatformStat[] {
  const acc = new Map<string, PlatformStat>()
  for (const campaign of raw.campaigns) {
    for (const item of campaign.items ?? []) {
      if (!item.platform) continue
      const cur =
        acc.get(item.platform) ??
        ({
          platform: item.platform,
          publishedCount: 0,
          reactionNotesCount: 0,
          pendingCount: 0,
        } as PlatformStat)
      if (item.publishedUrl) cur.publishedCount += 1
      if (item.reactionNotes && item.reactionNotes.trim().length > 0) cur.reactionNotesCount += 1
      if (
        !item.publishedUrl &&
        (item.state === 'not-started' || item.state === 'in-progress' || !item.state)
      ) {
        cur.pendingCount += 1
      }
      acc.set(item.platform, cur)
    }
  }
  return Array.from(acc.values()).sort((a, b) => b.publishedCount - a.publishedCount)
}

function buildCampaignRows(raw: OutputsListRaw): CampaignAnalyticsRow[] {
  return raw.campaigns
    .map((c) => {
      const items = c.items ?? []
      const publishedCount = items.filter((i) => i.publishedUrl).length
      const reactionNotesCount = items.filter(
        (i) => i.reactionNotes && i.reactionNotes.trim().length > 0,
      ).length
      const distinctPlatforms = new Set(items.map((i) => i.platform).filter(Boolean)).size
      const lastPublishedAt = items
        .map((i) => i.publishedAt)
        .filter((s): s is string => typeof s === 'string')
        .sort()
        .pop()
      return {
        campaignSlug: c.slug ?? c._id,
        campaignTitle: c.title,
        publishedCount,
        totalItems: items.length,
        reactionNotesCount,
        distinctPlatforms,
        lastPublishedAt: lastPublishedAt ?? null,
      }
    })
    .filter((r) => r.totalItems > 0)
    .sort((a, b) => (b.lastPublishedAt ?? '').localeCompare(a.lastPublishedAt ?? ''))
}

function buildReactionRows(raw: OutputsListRaw): ReactionNoteRow[] {
  const out: ReactionNoteRow[] = []
  for (const campaign of raw.campaigns) {
    if (!campaign._rev) continue
    for (const item of campaign.items ?? []) {
      if (!item.platform || !item._key) continue
      if (!item.reactionNotes || item.reactionNotes.trim().length === 0) continue
      out.push({
        campaignId: campaign._id,
        campaignRev: campaign._rev,
        itemKey: item._key,
        campaignSlug: campaign.slug ?? campaign._id,
        campaignTitle: campaign.title,
        platform: item.platform,
        reactionNotes: item.reactionNotes,
        publishedAt: item.publishedAt ?? null,
      })
    }
  }
  out.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
  return out.slice(0, 8)
}

function buildPendingRows(raw: OutputsListRaw, now = Date.now()): PendingMonitoringRow[] {
  const out: PendingMonitoringRow[] = []
  for (const campaign of raw.campaigns) {
    if (!campaign._rev) continue
    for (const item of campaign.items ?? []) {
      if (!item.platform || !item._key || !item.publishedAt) continue
      if (item.reactionNotes && item.reactionNotes.trim().length > 0) continue
      const ms = Date.parse(item.publishedAt)
      if (Number.isNaN(ms)) continue
      const ageHours = (now - ms) / 36e5
      if (ageHours < 24) continue
      out.push({
        campaignId: campaign._id,
        campaignRev: campaign._rev,
        itemKey: item._key,
        campaignSlug: campaign.slug ?? campaign._id,
        campaignTitle: campaign.title,
        platform: item.platform,
        publishedAt: item.publishedAt,
        ageHours,
      })
    }
  }
  out.sort((a, b) => b.ageHours - a.ageHours)
  return out.slice(0, 6)
}

function countDistinctPlatforms(raw: OutputsListRaw): number {
  const set = new Set<string>()
  for (const c of raw.campaigns) for (const i of c.items ?? []) if (i.platform) set.add(i.platform)
  return set.size
}

// ---------- devlog reader (page-local minimal version) ----------

function parseFrontmatter(body: string): {title?: string; date?: string} {
  let title: string | undefined
  let date: string | undefined
  for (const line of body.split('\n')) {
    if (!title) {
      const m = line.match(/^#\s+(.+)\s*$/)
      if (m) title = m[1].trim()
    }
    if (!date) {
      const m = line.match(/^Date:\s*(.+)\s*$/)
      if (m) date = m[1].trim()
    }
    if (title && date) break
  }
  return {title, date}
}

function buildExcerpt(body: string): string {
  const joined = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('---'))
    .join(' ')
  return joined.length > DEVLOG_EXCERPT_LEN
    ? joined.slice(0, DEVLOG_EXCERPT_LEN).trim() + '…'
    : joined
}

async function readLatestDevlogs(): Promise<DevlogInsight[]> {
  const dir = repoPath('docs', 'devlog')
  let filenames: string[]
  try {
    filenames = (await fs.readdir(dir, {withFileTypes: true}))
      .filter((d) => d.isFile() && d.name.endsWith('.md'))
      .map((d) => d.name)
  } catch {
    return []
  }
  filenames.sort((a, b) => b.localeCompare(a))
  const chosen = filenames.slice(0, LATEST_DEVLOGS)
  const out: DevlogInsight[] = []
  for (const filename of chosen) {
    try {
      const body = await fs.readFile(path.join(dir, filename), 'utf-8')
      const fm = parseFrontmatter(body)
      const dateFromName = filename.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
      out.push({
        title: fm.title ?? filename.replace(/\.md$/, ''),
        date: fm.date ?? dateFromName ?? null,
        filename,
        excerpt: buildExcerpt(body),
      })
    } catch {
      /* skip */
    }
  }
  return out
}

// ---------- page ----------

async function fetchHome(): Promise<DashboardHomeData> {
  return await sanityClient.fetch<DashboardHomeData>(dashboardHomeQuery)
}

async function fetchOutputs(): Promise<OutputsListRaw> {
  return await sanityClient.fetch<OutputsListRaw>(outputsListQuery)
}

function countOutputRows(raw: OutputsListRaw): number {
  return (raw.platformOutputs?.length ?? 0) + raw.campaigns.reduce((acc, c) => acc + (c.items?.length ?? 0), 0)
}

export default async function AnalyticsPage() {
  const [home, outputsRaw, devlogs] = await Promise.all([
    fetchHome(),
    fetchOutputs(),
    readLatestDevlogs(),
  ])

  const platformStats = buildPlatformStats(outputsRaw)
  const campaignRows = buildCampaignRows(outputsRaw)
  const reactionRows = buildReactionRows(outputsRaw)
  const pendingRows = buildPendingRows(outputsRaw)
  const distinctPlatforms = countDistinctPlatforms(outputsRaw)
  const recentOutputs = countOutputRows(outputsRaw)
  const hasWriteToken = Boolean(process.env.SANITY_WRITE_TOKEN)
  const reactionTotal = (outputsRaw.campaigns as CampaignWithPublishingRaw[]).reduce(
    (acc, c) =>
      acc +
      (c.items ?? []).filter((i) => i.reactionNotes && i.reactionNotes.trim().length > 0).length,
    0,
  )

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="アナリティクス"
        description="公開後の反応・学習を集計し、次キャンペーンに反映します。外部 API 連携は Phase Analytics-2 で実装予定。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: 'アナリティクス'}]}
        actions={
          <Link
            href="/publish"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            公開管理を開く
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="公開済み"
          value={home.manualPublishingDone}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          secondary="manualPublishingStatus.publishedUrl"
        />
        <KpiCard
          label="反応ノート"
          value={reactionTotal}
          icon={MessageSquare}
          tone="blue"
          trend={neutralTrend}
          secondary={reactionTotal === 0 ? '24-72h 後に手動記録' : '記入済み'}
        />
        <KpiCard
          label="キャンペーン"
          value={home.campaignTotal}
          icon={Rocket}
          tone="purple"
          trend={neutralTrend}
          secondary={`active ${home.campaignsActive}`}
        />
        <KpiCard
          label="媒体"
          value={distinctPlatforms}
          icon={Layers}
          tone="orange"
          trend={neutralTrend}
          secondary="publishing 実績あり"
        />
        <KpiCard
          label="直近の出力"
          value={recentOutputs}
          icon={FileText}
          tone="slate"
          trend={neutralTrend}
          secondary="platformOutput + status"
        />
      </KpiCardsRow>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <PlatformPerformanceCard stats={platformStats} />
          <CampaignAnalyticsTable rows={campaignRows} />
          <LearningInsightsCard entries={devlogs} />
        </div>
        <div className="flex flex-col gap-5">
          <UndoToastHost>
            <ReactionNotesCard
              rows={reactionRows}
              enableWriteActions={enableWriteActions}
              hasWriteToken={hasWriteToken}
            />
            <PendingMonitoringCard
              rows={pendingRows}
              enableWriteActions={enableWriteActions}
              hasWriteToken={hasWriteToken}
            />
          </UndoToastHost>
          <FutureIntegrationCard />
        </div>
      </div>
    </main>
  )
}
