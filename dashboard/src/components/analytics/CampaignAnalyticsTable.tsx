// CampaignAnalyticsTable — per-campaign rollup of publication state on /analytics.
// Read-only; rows link to /publish-package/<slug>.

import Link from 'next/link'
import {ChevronRight, Rocket} from 'lucide-react'

export interface CampaignAnalyticsRow {
  campaignSlug: string
  campaignTitle?: string
  publishedCount: number
  totalItems: number
  reactionNotesCount: number
  distinctPlatforms: number
  lastPublishedAt?: string | null
}

interface Props {
  rows: CampaignAnalyticsRow[]
}

function shortJst(iso?: string | null): string {
  if (!iso) return '—'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '—'
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function CampaignAnalyticsTable({rows}: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
          aria-hidden="true"
        >
          <Rocket size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">キャンペーン別集計</h2>
          <p className="text-[11px] text-slate-500">campaignPlan ごとの公開状況</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          campaignPlan がまだ登録されていません。
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50/60 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">キャンペーン</th>
                <th className="px-4 py-2 font-medium">公開済み</th>
                <th className="px-4 py-2 font-medium">反応ノート</th>
                <th className="px-4 py-2 font-medium">媒体数</th>
                <th className="px-4 py-2 font-medium">最終公開</th>
                <th className="px-4 py-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.campaignSlug}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">
                      {r.campaignTitle ?? r.campaignSlug}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <code>{r.campaignSlug}</code>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-800">
                    {r.publishedCount}
                    <span className="text-slate-400"> / {r.totalItems}</span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-700">
                    {r.reactionNotesCount}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-700">
                    {r.distinctPlatforms}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-500">
                    {shortJst(r.lastPublishedAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/publish-package/${encodeURIComponent(r.campaignSlug)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                    >
                      開く
                      <ChevronRight size={12} aria-hidden="true" />
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
