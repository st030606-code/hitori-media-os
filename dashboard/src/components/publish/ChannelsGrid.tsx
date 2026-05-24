// ChannelsGrid — left column "公開チャネルとリンク" card.
// Lists each platform's publishing status + URL + actions inline.

import Link from 'next/link'
import {ExternalLink, Clock, CheckCircle2, AlertCircle, Circle} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {CopyButton} from '@/components/CopyButton'
import type {ManualPublishingItem, SelectedPlatform} from '@/lib/groq/campaign'

interface Props {
  campaignSlug: string
  publishing: ManualPublishingItem[]
  selectedPlatforms: SelectedPlatform[]
}

interface ChannelRow {
  platform: string
  state: 'published' | 'pending' | 'not-tracked' | 'blocked'
  publishedUrl?: string
  publishedAt?: string
}

const KNOWN_PLATFORMS = ['x', 'threads', 'note', 'substack', 'youtube', 'podcast', 'diagram'] as const

function buildRows(
  publishing: ManualPublishingItem[],
  selectedPlatforms: SelectedPlatform[],
): ChannelRow[] {
  const known = new Set<string>()
  const rows: ChannelRow[] = []
  for (const p of publishing) {
    if (!p.platform) continue
    known.add(p.platform)
    let state: ChannelRow['state']
    if (p.state === 'done' && p.publishedUrl) state = 'published'
    else if (p.state === 'blocked') state = 'blocked'
    else state = 'pending'
    rows.push({
      platform: p.platform,
      state,
      publishedUrl: p.publishedUrl,
      publishedAt: p.publishedAt,
    })
  }
  for (const sp of selectedPlatforms) {
    if (sp.enabled === false || !sp.platform) continue
    if (known.has(sp.platform)) continue
    known.add(sp.platform)
    rows.push({platform: sp.platform, state: 'pending'})
  }
  // Append the default known set as 'not-tracked' if missing — gives the boss
  // visibility on platforms that exist in the OS but aren't on this campaign.
  for (const p of KNOWN_PLATFORMS) {
    if (known.has(p)) continue
    rows.push({platform: p, state: 'not-tracked'})
  }
  return rows
}

function isoToShortJst(iso?: string): string | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm} JST`
}

function StateIndicator({state}: {state: ChannelRow['state']}) {
  if (state === 'published') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 size={12} aria-hidden="true" />
        公開済み
      </span>
    )
  }
  if (state === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
        <Clock size={12} aria-hidden="true" />
        公開予定
      </span>
    )
  }
  if (state === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700">
        <AlertCircle size={12} aria-hidden="true" />
        要対応
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
      <Circle size={12} aria-hidden="true" />
      未追跡
    </span>
  )
}

export function ChannelsGrid({campaignSlug, publishing, selectedPlatforms}: Props) {
  const rows = buildRows(publishing, selectedPlatforms)
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">公開チャネルとリンク</h2>
          <p className="text-xs text-slate-500">媒体ごとの公開状況と公開済み URL</p>
        </div>
        <Link
          href={`/publish-package/${campaignSlug}`}
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          公開パッケージで開く →
        </Link>
      </header>
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.platform} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex shrink-0 items-center gap-2">
                <PlatformBadge platform={r.platform} />
                <span className="text-xs text-slate-600">{platformLabel(r.platform)}</span>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
                <StateIndicator state={r.state} />
                {r.publishedAt && (
                  <span className="text-[11px] tabular-nums text-slate-500">
                    {isoToShortJst(r.publishedAt)}
                  </span>
                )}
                {r.publishedUrl ? (
                  <div className="flex items-center gap-1">
                    <a
                      href={r.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-[16rem] items-center gap-1 truncate text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900"
                    >
                      <span className="truncate">{r.publishedUrl}</span>
                      <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
                    </a>
                    <CopyButton text={r.publishedUrl} label="URL" />
                  </div>
                ) : r.state === 'not-tracked' ? (
                  <span className="text-[11px] text-slate-400">この campaign では未選択</span>
                ) : (
                  <Link
                    href={`/publish-package/${campaignSlug}#${r.platform}`}
                    className="text-[11px] text-blue-700 hover:text-blue-900"
                  >
                    公開パッケージへ →
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
