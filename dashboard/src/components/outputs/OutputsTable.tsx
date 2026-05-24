// OutputsTable — 7-column DataTable for /outputs.
// Phase UI-fidelity-2: receives already-filtered rows from OutputsView client
// wrapper, so the component itself can remain a presentation-only piece (no
// state, no use client). However we render it inside the OutputsView client
// tree so it ships as a client component implicitly.

import Link from 'next/link'
import {ExternalLink, ChevronRight} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {OutputRow, StatusBucket} from '@/lib/groq/outputs'

interface Props {
  rows: OutputRow[]
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

const BUCKET_BADGE_STATE: Record<StatusBucket, string> = {
  draft: 'draft',
  review: 'pending-review',
  published: 'done',
  archived: 'archived',
  other: 'info',
}

function rowActionHref(row: OutputRow): string {
  if (row.campaignSlug) {
    return `/publish-package/${row.campaignSlug}#${row.platform}`
  }
  return '/publish'
}

export function OutputsTable({rows}: Props) {
  if (rows.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          条件に一致する出力がありません
        </p>
        <p className="mt-1 text-xs text-slate-500">
          フィルタをリセットして全件表示するか、{' '}
          <Link href="/configurator" className="text-blue-700 hover:text-blue-900">
            出力コンフィギュレーター
          </Link>{' '}
          で新しい下書きを作成してください。
        </p>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">出力一覧</h2>
        <span className="text-[11px] text-slate-500 tabular-nums">{rows.length} 件</span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">タイトル</th>
              <th className="px-4 py-2.5 font-medium">キャンペーン</th>
              <th className="px-4 py-2.5 font-medium">媒体</th>
              <th className="px-4 py-2.5 font-medium">出力形式</th>
              <th className="px-4 py-2.5 font-medium">ステータス</th>
              <th className="px-4 py-2.5 font-medium">更新日 / 公開日</th>
              <th className="px-4 py-2.5 font-medium" aria-label="操作" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-slate-50">
                <td className="px-4 py-3 align-middle">
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-inset ring-slate-200">
                      {r.source === 'platformOutput' ? 'platformOutput' : 'manualPublishing'}
                    </span>
                    {r.publishedUrl && (
                      <a
                        href={r.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-blue-700 hover:text-blue-900"
                      >
                        公開URL
                        <ExternalLink size={10} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  {r.campaignSlug ? (
                    <Link
                      href={`/campaigns/${r.campaignSlug}`}
                      className="text-slate-700 hover:text-blue-700"
                    >
                      {r.campaignTitle ?? r.campaignSlug}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{r.campaignTitle ?? '—'}</span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={r.platform} />
                    <span className="text-[11px] text-slate-500">{platformLabel(r.platform)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-middle text-slate-700">{r.outputType ?? '—'}</td>
                <td className="px-4 py-3 align-middle">
                  <StatusBadge state={BUCKET_BADGE_STATE[r.bucket]} label={r.rawStatus} />
                </td>
                <td className="px-4 py-3 align-middle text-xs tabular-nums text-slate-600">
                  {isoToShortJst(r.updatedAt)}
                </td>
                <td className="px-4 py-3 align-middle text-xs">
                  <Link
                    href={rowActionHref(r)}
                    aria-label={`${r.title} を開く`}
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
    </section>
  )
}
