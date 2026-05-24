// GROQ + helpers for /outputs (Phase UI-fidelity-2).
//
// Strategy:
//   1. Query `platformOutput` docs directly (canonical Sanity type for outputs)
//   2. Query `campaignPlan.manualPublishingStatus` items as a parallel source
//      (proxy rows so /outputs is useful even when no platformOutput docs are
//      seeded yet).
//   3. Merge into a flat OutputRow[] sorted by updatedAt desc.
//   4. Compute per-status counts (全/下書き/レビュー/公開) and per-platform
//      counts for the right sidebar breakdown card.
//
// Read-only — no mutations.

export const outputsListQuery = /* groq */ `
{
  "platformOutputs": *[_type == "platformOutput"] | order(coalesce(_updatedAt, _createdAt) desc) [0..99] {
    _id,
    title,
    platform,
    outputType,
    status,
    localOutputPath,
    "sourceContentIdeaTitle": sourceContentIdea->title,
    "sourceContentIdeaSlug": sourceContentIdea->slug.current,
    _updatedAt,
    _createdAt
  },
  "campaigns": *[_type == "campaignPlan"] | order(title asc) {
    _id,
    _rev,
    title,
    "slug": slug.current,
    "items": manualPublishingStatus[]{
      _key,
      platform,
      state,
      publishedUrl,
      publishedAt,
      reactionNotes
    }
  }
}
`

export interface OutputsListRaw {
  platformOutputs: PlatformOutputRaw[]
  campaigns: CampaignWithPublishingRaw[]
}

export interface PlatformOutputRaw {
  _id: string
  title?: string
  platform?: string
  outputType?: string
  status?: string
  localOutputPath?: string
  sourceContentIdeaTitle?: string
  sourceContentIdeaSlug?: string
  _updatedAt?: string
  _createdAt?: string
}

export interface CampaignWithPublishingRaw {
  _id: string
  _rev?: string
  title?: string
  slug?: string
  items?: Array<{
    _key?: string
    platform?: string
    state?: string
    publishedUrl?: string
    publishedAt?: string
    reactionNotes?: string
  }>
}

// ---------- Normalized row shape ----------

export type StatusBucket = 'draft' | 'review' | 'published' | 'archived' | 'other'

export interface OutputRow {
  key: string
  source: 'platformOutput' | 'manualPublishing'
  title: string
  campaignTitle?: string
  campaignSlug?: string
  platform: string
  outputType?: string
  rawStatus: string // 表示用の生ステータス
  bucket: StatusBucket // KPI 集計用
  updatedAt?: string
  publishedAt?: string
  publishedUrl?: string
  reactionNotes?: string
  localOutputPath?: string
}

const PLATFORM_OUTPUT_STATUS_LABELS: Record<string, string> = {
  drafted: '下書き',
  reviewed: 'レビュー済み',
  revised: '修正済み',
  ready: '公開準備OK',
  archived: 'アーカイブ',
}

const MANUAL_PUBLISHING_STATE_LABELS: Record<string, string> = {
  done: '公開済み',
  'not-started': '未着手',
  'in-progress': '作業中',
  blocked: '要対応',
}

function bucketOfPlatformOutput(status?: string): StatusBucket {
  switch (status) {
    case 'drafted':
    case 'revised':
      return 'draft'
    case 'reviewed':
    case 'ready':
      return 'review'
    case 'archived':
      return 'archived'
    default:
      return 'other'
  }
}

function bucketOfManualPublishing(state?: string, publishedUrl?: string): StatusBucket {
  if (state === 'done' && publishedUrl) return 'published'
  if (state === 'not-started') return 'draft'
  if (state === 'in-progress') return 'draft'
  if (state === 'blocked') return 'review'
  return 'other'
}

function defaultOutputTypeForPlatform(platform: string): string {
  switch (platform) {
    case 'note':
      return 'note-article'
    case 'substack':
      return 'substack-post'
    case 'threads':
      return 'threads-thread'
    case 'x':
      return 'x-post'
    case 'youtube':
      return 'youtube-script'
    case 'shorts':
      return 'shorts-script'
    case 'podcast':
      return 'podcast-script'
    case 'diagram':
      return 'diagram-plan'
    case 'instagram':
      return 'instagram-carousel'
    case 'github':
      return 'github-doc'
    case 'paid':
      return 'paid-article-outline'
    case 'newsletter':
      return 'newsletter'
    default:
      return '—'
  }
}

export function buildOutputRows(data: OutputsListRaw): OutputRow[] {
  const rows: OutputRow[] = []

  for (const po of data.platformOutputs ?? []) {
    rows.push({
      key: `po-${po._id}`,
      source: 'platformOutput',
      title: po.title || po.sourceContentIdeaTitle || '(無題)',
      campaignTitle: po.sourceContentIdeaTitle,
      campaignSlug: po.sourceContentIdeaSlug,
      platform: po.platform ?? '—',
      outputType: po.outputType,
      rawStatus: PLATFORM_OUTPUT_STATUS_LABELS[po.status ?? ''] ?? po.status ?? '—',
      bucket: bucketOfPlatformOutput(po.status),
      updatedAt: po._updatedAt,
      localOutputPath: po.localOutputPath,
    })
  }

  for (const c of data.campaigns ?? []) {
    for (const item of c.items ?? []) {
      if (!item.platform) continue
      rows.push({
        key: `mps-${c._id}-${item._key ?? item.platform}`,
        source: 'manualPublishing',
        title: `${c.title ?? '(campaign)'} / ${item.platform}`,
        campaignTitle: c.title,
        campaignSlug: c.slug,
        platform: item.platform,
        outputType: defaultOutputTypeForPlatform(item.platform),
        rawStatus:
          MANUAL_PUBLISHING_STATE_LABELS[item.state ?? ''] ?? item.state ?? '—',
        bucket: bucketOfManualPublishing(item.state, item.publishedUrl),
        updatedAt: item.publishedAt,
        publishedAt: item.publishedAt,
        publishedUrl: item.publishedUrl,
        reactionNotes: item.reactionNotes,
      })
    }
  }

  rows.sort((a, b) => {
    if (!a.updatedAt && !b.updatedAt) return a.title.localeCompare(b.title)
    if (!a.updatedAt) return 1
    if (!b.updatedAt) return -1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
  return rows
}

export interface OutputsKpis {
  total: number
  draft: number
  review: number
  published: number
}

export function countByBucket(rows: OutputRow[]): OutputsKpis {
  let draft = 0
  let review = 0
  let published = 0
  for (const r of rows) {
    if (r.bucket === 'draft') draft++
    else if (r.bucket === 'review') review++
    else if (r.bucket === 'published') published++
  }
  return {total: rows.length, draft, review, published}
}

export interface PlatformCount {
  platform: string
  count: number
}

const PLATFORM_DISPLAY_ORDER = [
  'x',
  'threads',
  'note',
  'substack',
  'youtube',
  'shorts',
  'podcast',
  'diagram',
  'instagram',
  'blog',
  'newsletter',
  'github',
  'paid',
] as const

export function countByPlatform(rows: OutputRow[]): PlatformCount[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    map.set(r.platform, (map.get(r.platform) ?? 0) + 1)
  }
  const seen = new Set<string>()
  const result: PlatformCount[] = []
  for (const p of PLATFORM_DISPLAY_ORDER) {
    seen.add(p)
    result.push({platform: p, count: map.get(p) ?? 0})
  }
  // Append any unexpected platform that appeared in data.
  for (const [p, count] of map.entries()) {
    if (seen.has(p)) continue
    result.push({platform: p, count})
  }
  return result
}

export function distinctCampaigns(rows: OutputRow[]): Array<{slug?: string; title: string}> {
  const map = new Map<string, string>()
  for (const r of rows) {
    if (!r.campaignSlug && !r.campaignTitle) continue
    const key = r.campaignSlug ?? r.campaignTitle ?? ''
    if (!map.has(key)) {
      map.set(key, r.campaignTitle ?? key)
    }
  }
  return Array.from(map.entries()).map(([slug, title]) => ({slug, title}))
}
