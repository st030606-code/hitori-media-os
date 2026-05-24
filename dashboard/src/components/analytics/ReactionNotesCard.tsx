// ReactionNotesCard — list of recent reactionNotes recorded on
// campaignPlan.manualPublishingStatus[]. Boss writes these manually 24-72h
// after publishing; the dashboard surfaces the raw text and links back to
// the publish package for context.
//
// Phase 2B-1: when `enableWriteActions` is true and SANITY_WRITE_TOKEN is
// set, each row mounts an inline <ReactionNoteEditor> so notes can be
// edited from /analytics directly.

import Link from 'next/link'
import {ChevronRight, MessageSquare} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {ReactionNoteEditor} from './ReactionNoteEditor'

export interface ReactionNoteRow {
  campaignId: string
  campaignRev: string
  itemKey: string
  campaignSlug: string
  campaignTitle?: string
  platform: string
  reactionNotes: string
  publishedAt?: string | null
}

interface Props {
  rows: ReactionNoteRow[]
  enableWriteActions: boolean
  hasWriteToken: boolean
}

function fmtJstShort(iso?: string | null): string {
  if (!iso) return '—'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '—'
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ReactionNotesCard({rows, enableWriteActions, hasWriteToken}: Props) {
  const writeReady = enableWriteActions && hasWriteToken
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <MessageSquare size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">反応ノート</h2>
            <p className="text-[11px] text-slate-500">
              公開後 24-72h に手動記録
              {writeReady ? ' · 編集可' : ''}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
          {rows.length} 件
        </span>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          反応ノートはまだ記録されていません。公開後 24-72h を目安に、
          <code className="rounded bg-white px-1 py-0.5">manualPublishingStatus</code>{' '}
          の reactionNotes フィールドに記入すると、ここに表示されます。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li key={`${r.campaignId}-${r.itemKey}-${i}`} className="py-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <PlatformBadge platform={r.platform} />
                  <span>{platformLabel(r.platform)}</span>
                  <span className="text-slate-400">·</span>
                  <span className="truncate">{r.campaignTitle ?? r.campaignSlug}</span>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                  {fmtJstShort(r.publishedAt)}
                </span>
              </div>
              <ReactionNoteEditor
                campaignId={r.campaignId}
                campaignRev={r.campaignRev}
                itemKey={r.itemKey}
                platform={r.platform}
                initialValue={r.reactionNotes}
                writeReady={writeReady}
                variant="filled"
              />
              <Link
                href={`/publish-package/${encodeURIComponent(r.campaignSlug)}#${r.platform}`}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
              >
                公開パッケージを開く
                <ChevronRight size={11} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
