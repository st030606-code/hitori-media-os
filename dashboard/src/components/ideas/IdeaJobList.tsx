'use client'

// Phase 2C-1 — Recent idea-jobs list + "Content Idea化を準備" entry point.
//
// Behaviour:
//   - Server-rendered list (props injected by /ideas page) of recent
//     idea-jobs/<slug>/<timestamp>/ directories.
//   - Each row shows the status badge (package-only / result-md-only /
//     structured-result-ready) and a "Content Idea化を準備" button which
//     activates only when result.json exists.
//   - Clicking the button surfaces the <ContentIdeaPromotePanel> for the
//     selected job. Selection state is owned by this component.
//   - localFsReady=false renders the list in read-only/disabled mode.

import {useState} from 'react'
import {Clock, FileText, FileJson, Sparkles} from 'lucide-react'
import type {IdeaJobListItem} from '@/lib/ideaJobs/reader'
import {ContentIdeaPromotePanel} from './ContentIdeaPromotePanel'

interface Props {
  jobs: IdeaJobListItem[]
  truncated: boolean
  localFsReady: boolean
  /** Surfaced when the server-side reader failed (e.g. idea-jobs missing). */
  errorText?: string | null
}

const STATUS_LABEL: Record<IdeaJobListItem['status'], string> = {
  'package-only': 'package のみ',
  'result-markdown-only': 'result.md のみ',
  'structured-result-ready': '構造化結果あり',
}

const STATUS_TONE: Record<IdeaJobListItem['status'], string> = {
  'package-only': 'border-slate-300 bg-slate-50 text-slate-600',
  'result-markdown-only': 'border-amber-300 bg-amber-50 text-amber-700',
  'structured-result-ready': 'border-emerald-300 bg-emerald-50 text-emerald-700',
}

function formatTimestamp(ts: string): string {
  // ts shape: YYYYMMDD-HHMMSS (UTC). Render as `YYYY-MM-DD HH:MM:SS UTC`.
  if (!/^\d{8}-\d{6}$/.test(ts)) return ts
  const y = ts.slice(0, 4)
  const m = ts.slice(4, 6)
  const d = ts.slice(6, 8)
  const hh = ts.slice(9, 11)
  const mi = ts.slice(11, 13)
  const ss = ts.slice(13, 15)
  return `${y}-${m}-${d} ${hh}:${mi}:${ss} UTC`
}

export function IdeaJobList({jobs, truncated, localFsReady, errorText}: Props) {
  const [selected, setSelected] = useState<{ideaSlug: string; timestamp: string} | null>(null)

  if (errorText) {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        <p className="font-semibold">既存ジョブ一覧を読み込めませんでした</p>
        <p className="mt-1 text-xs">{errorText}</p>
      </section>
    )
  }

  if (!localFsReady) {
    return (
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold">既存の idea-jobs を読むには ENABLE_LOCAL_FS_ROUTES が必要です</p>
        <p className="mt-1 text-xs">
          dashboard は本番では filesystem を読みません。 dev/localhost で <code>.env.local</code> に
          <code> ENABLE_LOCAL_FS_ROUTES=true</code> を設定すると、 既存ジョブの一覧と
          Content Idea 化の準備が行えるようになります。
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} aria-hidden="true" className="text-slate-500" />
                既存の idea-jobs (最近の {jobs.length}{truncated ? ' (一部表示)' : ''} 件)
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Phase 2C-0 で作成したジョブを mtime 降順で表示します。
              <strong> 構造化結果あり</strong> のジョブから「Content Idea作成を確認」 で
              Sanity 作成前の必須fieldとプレビューを確認できます。
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
            既存のジョブが見つかりませんでした。 上の「アイデアパッケージを作成」 で最初のジョブを作ってください。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200">
            {jobs.map((job) => {
              const id = `${job.ideaSlug}/${job.timestamp}`
              const isSelected =
                selected?.ideaSlug === job.ideaSlug && selected?.timestamp === job.timestamp
              return (
                <li key={id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[12px] font-semibold text-slate-800 ring-1 ring-inset ring-slate-200">
                        {job.ideaSlug}
                      </code>
                      <span className="text-xs text-slate-500">/</span>
                      <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700 ring-1 ring-inset ring-slate-200">
                        {job.timestamp}
                      </code>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TONE[job.status]}`}
                      >
                        {STATUS_LABEL[job.status]}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {formatTimestamp(job.timestamp)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                      <ArtifactChip label="_raw.json" present={job.hasRawJson} />
                      <ArtifactChip label="prompt.md" present={job.hasPromptMd} icon="md" />
                      <ArtifactChip label="job.json" present={job.hasJobJson} />
                      <ArtifactChip label="result.md" present={job.hasResultMd} icon="md" />
                      <ArtifactChip label="result.json" present={job.hasResultJson} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelected(
                          isSelected
                            ? null
                            : {ideaSlug: job.ideaSlug, timestamp: job.timestamp},
                        )
                      }
                      disabled={!job.hasResultJson}
                      title={
                        !job.hasResultJson
                          ? 'result.json が存在しません。 まず「AIの企画化結果を取り込む」 で結果を保存してください。'
                          : ''
                      }
                      className={
                        job.hasResultJson
                          ? (isSelected
                              ? 'inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700'
                              : 'inline-flex items-center gap-1.5 rounded-md border border-blue-500 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50')
                          : 'inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400'
                      }
                    >
                      <Sparkles size={12} aria-hidden="true" />
                      {isSelected ? '閉じる' : 'Content Idea作成を確認'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selected && (
        <ContentIdeaPromotePanel
          ideaSlug={selected.ideaSlug}
          timestamp={selected.timestamp}
        />
      )}
    </section>
  )
}

function ArtifactChip({label, present, icon}: {label: string; present: boolean; icon?: 'md'}) {
  const Icon = icon === 'md' ? FileText : FileJson
  return (
    <span
      className={
        present
          ? 'inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-700'
          : 'inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-slate-400 line-through'
      }
      title={present ? `${label} exists` : `${label} missing`}
    >
      <Icon size={9} aria-hidden="true" />
      {label}
    </span>
  )
}
