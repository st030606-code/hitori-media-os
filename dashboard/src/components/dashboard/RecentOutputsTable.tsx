// RecentOutputsTable — Dashboard Home's compact "最近の出力" table.
//
// Phase UI-fidelity-3: reuses the OutputRow type + bucket→badge mapping
// from /outputs (lib/groq/outputs.ts) so Dashboard and Output Management
// agree on what an output looks like. Renders top 5 rows by updatedAt desc;
// for the full filtered list the boss clicks "出力管理を開く".

import Link from 'next/link'
import {FileText, ExternalLink, ChevronRight} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {OutputRow, StatusBucket} from '@/lib/groq/outputs'

const BUCKET_BADGE_STATE: Record<StatusBucket, string> = {
  draft: 'draft',
  review: 'pending-review',
  published: 'done',
  archived: 'archived',
  other: 'info',
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

interface Props {
  rows: OutputRow[]
  limit?: number
}

export function RecentOutputsTable({rows, limit = 5}: Props) {
  const top = rows.slice(0, limit)
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-slate-500" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-900">最近の出力</h2>
        </div>
        <Link
          href="/outputs"
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          出力管理を開く →
        </Link>
      </header>

      {top.length === 0 ? (
        <div className="px-5 py-6 text-sm text-slate-500">
          まだ出力がありません。{' '}
          <Link href="/configurator" className="text-blue-700 hover:text-blue-900">
            出力コンフィギュレーター
          </Link>{' '}
          から下書きを生成できます (Phase UI-4)。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">タイトル</th>
                <th className="px-4 py-2 font-medium">媒体</th>
                <th className="px-4 py-2 font-medium">ステータス</th>
                <th className="px-4 py-2 font-medium">更新日</th>
                <th className="px-4 py-2 font-medium" aria-label="操作" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 align-middle">
                    <div className="font-medium text-slate-900">{r.title}</div>
                    {r.campaignTitle && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {r.campaignSlug ? (
                          <Link
                            href={`/campaigns/${r.campaignSlug}`}
                            className="hover:text-blue-700"
                          >
                            {r.campaignTitle}
                          </Link>
                        ) : (
                          r.campaignTitle
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 align-middle">
                    <div className="flex items-center gap-1.5">
                      <PlatformBadge platform={r.platform} />
                      <span className="text-[11px] text-slate-500">{platformLabel(r.platform)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 align-middle">
                    <StatusBadge state={BUCKET_BADGE_STATE[r.bucket]} label={r.rawStatus} />
                  </td>
                  <td className="px-4 py-2.5 align-middle text-xs tabular-nums text-slate-600">
                    {isoToShortJst(r.updatedAt)}
                  </td>
                  <td className="px-4 py-2.5 align-middle text-xs">
                    {r.publishedUrl ? (
                      <a
                        href={r.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="公開URLを開く"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : r.campaignSlug ? (
                      <Link
                        href={`/publish-package/${r.campaignSlug}#${r.platform}`}
                        aria-label={`${r.title} を開く`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
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
