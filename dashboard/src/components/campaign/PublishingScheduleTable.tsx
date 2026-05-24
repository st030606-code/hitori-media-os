// PublishingScheduleTable — campaign-level table of platform × manual
// publishing entries. Used in the main column of /campaigns/[slug] to
// replace the old "details > ManualPublishingStatusList" surfacing.
//
// Phase UI-fidelity-1: read-only listing derived from
// campaign.manualPublishingStatus + campaign.selectedPlatforms. URL inline
// edit lands in Phase UI-3 with server actions. Rows without explicit
// manualPublishingStatus entries are still shown as "未追跡" so boss sees
// the full intended platform set.

import Link from 'next/link'
import {ExternalLink, ChevronRight} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {ManualPublishingItem, SelectedPlatform} from '@/lib/groq/campaign'

interface Props {
  campaignSlug: string
  publishing: ManualPublishingItem[]
  selectedPlatforms: SelectedPlatform[]
}

function isoToShort(iso?: string): string {
  if (!iso) return '—'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '—'
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm} JST`
}

function rowOutputType(platform: string): string {
  switch (platform) {
    case 'x':
    case 'threads':
      return '投稿'
    case 'note':
      return '記事'
    case 'substack':
      return 'Post / Newsletter'
    case 'youtube':
      return '台本'
    case 'shorts':
      return 'Shorts 台本'
    case 'podcast':
      return 'Podcast 台本'
    case 'diagram':
      return '図解'
    case 'instagram':
      return 'カルーセル'
    case 'blog':
      return 'ブログ'
    default:
      return '—'
  }
}

interface Row {
  platform: string
  outputType: string
  state: string
  publishedAt?: string
  publishedUrl?: string
  reactionNotes?: string
}

function buildRows(
  publishing: ManualPublishingItem[],
  selectedPlatforms: SelectedPlatform[],
): Row[] {
  const byPlatform = new Map<string, ManualPublishingItem>()
  for (const p of publishing) {
    if (p.platform) byPlatform.set(p.platform, p)
  }
  // Start from manualPublishingStatus order so explicit entries come first.
  const seen = new Set<string>()
  const rows: Row[] = []
  for (const p of publishing) {
    if (!p.platform) continue
    if (seen.has(p.platform)) continue
    seen.add(p.platform)
    rows.push({
      platform: p.platform,
      outputType: rowOutputType(p.platform),
      state: p.state ?? 'not-started',
      publishedAt: p.publishedAt,
      publishedUrl: p.publishedUrl,
      reactionNotes: p.reactionNotes,
    })
  }
  // Append enabled selectedPlatforms that have no manualPublishingStatus row,
  // so the table reflects the full intended set.
  for (const sp of selectedPlatforms) {
    if (sp.enabled === false) continue
    if (!sp.platform || seen.has(sp.platform)) continue
    seen.add(sp.platform)
    rows.push({
      platform: sp.platform,
      outputType: rowOutputType(sp.platform),
      state: 'not-tracked',
      publishedAt: undefined,
      publishedUrl: undefined,
    })
  }
  return rows
}

export function PublishingScheduleTable({campaignSlug, publishing, selectedPlatforms}: Props) {
  const rows = buildRows(publishing, selectedPlatforms)
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">公開予定一覧</h2>
        <Link
          href={`/publish-package/${campaignSlug}`}
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          公開パッケージで開く →
        </Link>
      </header>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          このキャンペーンには公開予定の媒体がまだ登録されていません。
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">媒体</th>
                <th className="px-4 py-2.5 font-medium">出力種別</th>
                <th className="px-4 py-2.5 font-medium">状態</th>
                <th className="px-4 py-2.5 font-medium">公開日時 (JST)</th>
                <th className="px-4 py-2.5 font-medium">URL</th>
                <th className="px-4 py-2.5 font-medium" aria-label="actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.platform} className="hover:bg-slate-50">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={r.platform} />
                      <span className="text-[11px] text-slate-500">{platformLabel(r.platform)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">{r.outputType}</td>
                  <td className="px-4 py-3 align-middle">
                    {r.state === 'not-tracked' ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        未追跡
                      </span>
                    ) : (
                      <StatusBadge state={r.state} label={r.state} />
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs tabular-nums text-slate-600">
                    {isoToShort(r.publishedAt)}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs">
                    {r.publishedUrl ? (
                      <a
                        href={r.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"
                      >
                        開く
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs">
                    <Link
                      href={`/publish-package/${campaignSlug}#${r.platform}`}
                      aria-label={`${platformLabel(r.platform)} の公開パッケージを開く`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
