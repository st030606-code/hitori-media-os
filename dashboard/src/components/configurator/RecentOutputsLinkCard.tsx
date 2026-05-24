// RecentOutputsLinkCard — compact preview of the 5 most recent outputs,
// linking to /outputs. Reuses OutputRow shape from lib/groq/outputs.

import Link from 'next/link'
import {ChevronRight, History} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {OutputRow} from '@/lib/groq/outputs'

interface Props {
  rows: OutputRow[]
}

export function RecentOutputsLinkCard({rows}: Props) {
  const preview = rows.slice(0, 5)
  const empty = preview.length === 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200"
            aria-hidden="true"
          >
            <History size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">直近の出力</h2>
            <p className="text-[11px] text-slate-500">同じ source からの 5 件</p>
          </div>
        </div>
        <Link
          href="/outputs"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          すべて見る
          <ChevronRight size={12} aria-hidden="true" />
        </Link>
      </header>

      {empty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          出力履歴がまだありません。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {preview.map((o) => (
            <li key={o.key} className="flex items-center gap-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-900">{o.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                  <PlatformBadge platform={o.platform} />
                  <span>{platformLabel(o.platform)}</span>
                </div>
              </div>
              <StatusBadge
                state={o.bucket === 'published' ? 'done' : o.bucket}
                label={o.rawStatus}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
