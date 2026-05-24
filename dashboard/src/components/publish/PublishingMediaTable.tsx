// PublishingMediaTable — 公開メディア一覧 DataTable for /publish.
// 6 columns: 媒体 / レビュー状態 / Published URL / Published At / 担当 / 操作.
// Pattern mirrors Campaign Detail's PublishingScheduleTable but adds the
// 担当 column (boss-only fixed for now) and URL truncation with external icon.

import Link from 'next/link'
import {ExternalLink, ChevronRight} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {ManualPublishingItem, SelectedPlatform} from '@/lib/groq/campaign'

interface Props {
  campaignSlug: string
  publishing: ManualPublishingItem[]
  selectedPlatforms: SelectedPlatform[]
  assigneeName?: string // boss-only fixed value passed from page
}

interface Row {
  platform: string
  state: string
  publishedUrl?: string
  publishedAt?: string
}

function buildRows(
  publishing: ManualPublishingItem[],
  selectedPlatforms: SelectedPlatform[],
): Row[] {
  const seen = new Set<string>()
  const rows: Row[] = []
  for (const p of publishing) {
    if (!p.platform || seen.has(p.platform)) continue
    seen.add(p.platform)
    rows.push({
      platform: p.platform,
      state: p.state ?? 'not-started',
      publishedUrl: p.publishedUrl,
      publishedAt: p.publishedAt,
    })
  }
  for (const sp of selectedPlatforms) {
    if (sp.enabled === false || !sp.platform) continue
    if (seen.has(sp.platform)) continue
    seen.add(sp.platform)
    rows.push({platform: sp.platform, state: 'not-tracked'})
  }
  return rows
}

function isoToShortJst(iso?: string): string {
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

const STATE_LABELS: Record<string, string> = {
  done: '公開済み',
  'not-started': '未着手',
  'in-progress': '作業中',
  blocked: '要対応',
  'not-tracked': '未追跡',
}

export function PublishingMediaTable({
  campaignSlug,
  publishing,
  selectedPlatforms,
  assigneeName = 'ボス',
}: Props) {
  const rows = buildRows(publishing, selectedPlatforms)
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">公開メディア一覧</h2>
        <span className="text-[11px] tabular-nums text-slate-500">{rows.length} 件</span>
      </header>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          このキャンペーンには公開する媒体がまだ登録されていません。
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">媒体</th>
                <th className="px-4 py-2.5 font-medium">レビュー状態</th>
                <th className="px-4 py-2.5 font-medium">Published URL</th>
                <th className="px-4 py-2.5 font-medium">Published At</th>
                <th className="px-4 py-2.5 font-medium">担当</th>
                <th className="px-4 py-2.5 font-medium" aria-label="操作" />
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
                  <td className="px-4 py-3 align-middle">
                    {r.state === 'not-tracked' ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        未追跡
                      </span>
                    ) : (
                      <StatusBadge state={r.state} label={STATE_LABELS[r.state] ?? r.state} />
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs">
                    {r.publishedUrl ? (
                      <a
                        href={r.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-[18rem] items-center gap-1 truncate text-blue-700 hover:text-blue-900"
                      >
                        <span className="truncate">{r.publishedUrl}</span>
                        <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs tabular-nums text-slate-600">
                    {isoToShortJst(r.publishedAt)}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700"
                      >
                        B
                      </span>
                      {assigneeName}
                    </div>
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
