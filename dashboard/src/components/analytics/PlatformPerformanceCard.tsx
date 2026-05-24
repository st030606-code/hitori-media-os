// PlatformPerformanceCard — per-platform aggregation of published count and
// reaction-note count, derived from outputsListQuery's manualPublishingStatus
// proxy rows. Read-only.

import {BarChart3} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'

export interface PlatformStat {
  platform: string
  publishedCount: number
  reactionNotesCount: number
  pendingCount: number
}

interface Props {
  stats: PlatformStat[]
}

export function PlatformPerformanceCard({stats}: Props) {
  const max = stats.reduce((m, s) => Math.max(m, s.publishedCount), 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
          aria-hidden="true"
        >
          <BarChart3 size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">媒体別パフォーマンス</h2>
          <p className="text-[11px] text-slate-500">公開済み件数 / 反応ノート / 保留中</p>
        </div>
      </header>

      {stats.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          まだ公開実績がありません。<code className="rounded bg-white px-1 py-0.5">manualPublishingStatus</code> に publishedUrl が記入されると、ここに媒体別の集計が表示されます。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {stats.map((s) => {
            const widthPct = max > 0 ? Math.round((s.publishedCount / max) * 100) : 0
            return (
              <li key={s.platform} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <PlatformBadge platform={s.platform} />
                    <span className="font-medium text-slate-800">{platformLabel(s.platform)}</span>
                  </span>
                  <span className="flex items-center gap-2 tabular-nums text-slate-600">
                    <span className="font-semibold text-slate-900">{s.publishedCount}</span>
                    <span className="text-slate-400">/</span>
                    <span>反応 {s.reactionNotesCount}</span>
                    {s.pendingCount > 0 && (
                      <>
                        <span className="text-slate-400">/</span>
                        <span className="text-amber-700">保留 {s.pendingCount}</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{width: `${widthPct}%`}}
                    aria-hidden="true"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
