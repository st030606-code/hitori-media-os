// PendingMonitoringCard — list of publications that passed 24h since
// publishedAt but still have no reactionNotes recorded. Surfaces the next
// boss action: write a reaction note.
//
// Phase 2B-1: when write actions are enabled, the row mounts an inline
// <ReactionNoteEditor> with an empty initial value so the boss can fill
// the note without leaving /analytics. When disabled, falls back to a
// link to the publish package page.

import Link from 'next/link'
import {ChevronRight, Clock} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {ReactionNoteEditor} from './ReactionNoteEditor'

export interface PendingMonitoringRow {
  campaignId: string
  campaignRev: string
  itemKey: string
  campaignSlug: string
  campaignTitle?: string
  platform: string
  publishedAt: string
  ageHours: number
}

interface Props {
  rows: PendingMonitoringRow[]
  enableWriteActions: boolean
  hasWriteToken: boolean
}

export function PendingMonitoringCard({rows, enableWriteActions, hasWriteToken}: Props) {
  const writeReady = enableWriteActions && hasWriteToken
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
            aria-hidden="true"
          >
            <Clock size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">反応メモ待ち</h2>
            <p className="text-[11px] text-slate-500">
              公開後 24h+ で reactionNotes 未記入
              {writeReady ? ' · その場で記入可' : ''}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
          {rows.length} 件
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          24h 以上経過した公開で、反応メモ未記入のものはありません。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li
              key={`${r.campaignId}-${r.itemKey}-${i}`}
              className="py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <PlatformBadge platform={r.platform} />
                    <span>{platformLabel(r.platform)}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-slate-800">
                    {r.campaignTitle ?? r.campaignSlug}
                  </div>
                  <div className="text-[11px] tabular-nums text-amber-700">
                    経過: {r.ageHours.toFixed(0)}h
                  </div>
                </div>
                {!writeReady && (
                  <Link
                    href={`/publish-package/${encodeURIComponent(r.campaignSlug)}#${r.platform}`}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
                  >
                    記入
                    <ChevronRight size={11} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {writeReady && (
                <ReactionNoteEditor
                  campaignId={r.campaignId}
                  campaignRev={r.campaignRev}
                  itemKey={r.itemKey}
                  platform={r.platform}
                  initialValue=""
                  writeReady={writeReady}
                  variant="empty"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
