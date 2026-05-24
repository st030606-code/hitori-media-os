// PlatformBreakdownCard — right sidebar card on /outputs.
// Shows per-platform output counts with PlatformBadge + count. Server
// Component, derived from outputs data at the page level.

import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import type {PlatformCount} from '@/lib/groq/outputs'

interface Props {
  counts: PlatformCount[]
  // 表示する platform を絞りたい場合は keys を渡す。未指定なら counts 全件。
  visibleKeys?: string[]
}

const DEFAULT_VISIBLE: ReadonlyArray<string> = [
  'x',
  'threads',
  'note',
  'substack',
  'youtube',
  'podcast',
  'diagram',
] as const

export function PlatformBreakdownCard({counts, visibleKeys}: Props) {
  const keys = visibleKeys ?? DEFAULT_VISIBLE
  const visible = keys
    .map((k) => counts.find((c) => c.platform === k) ?? {platform: k, count: 0})
    .filter(Boolean)
  const total = visible.reduce((acc, c) => acc + c.count, 0)
  const max = visible.reduce((acc, c) => Math.max(acc, c.count), 0)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">媒体別出力</h2>
        <span className="text-[11px] text-slate-500 tabular-nums">合計 {total}</span>
      </header>
      <ul className="space-y-2">
        {visible.map((c) => {
          const pct = max > 0 ? Math.round((c.count / max) * 100) : 0
          return (
            <li key={c.platform} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={c.platform} />
                  <span className="text-[11px] text-slate-500">{platformLabel(c.platform)}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {c.count}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={c.count > 0 ? 'h-full bg-blue-400' : 'h-full bg-slate-200'}
                  style={{width: `${pct}%`}}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
