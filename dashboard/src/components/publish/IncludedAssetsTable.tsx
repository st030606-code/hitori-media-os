// IncludedAssetsTable — left column "含まれる成果物" card.
// Shows visual assets (from campaign.visualAssetDetails) + text outputs
// (from outputs proxy rows belonging to this campaign).
//
// Phase UI-fidelity-4: read-only listing only; thumbnail rendering is
// deferred to UI-fidelity-5 (extends /api/asset-thumb to publish-packages
// paths). Graceful fallback when both sources are empty.

import Link from 'next/link'
import {Image as ImageIcon, FileText, ChevronRight} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {StatusBadge} from '@/components/StatusBadge'
import type {RequiredVisualAssetItem} from '@/lib/groq/campaign'
import type {OutputRow} from '@/lib/groq/outputs'

interface Props {
  visuals: RequiredVisualAssetItem[]
  outputs: OutputRow[] // 既に campaign slug でフィルタ済み
  campaignSlug: string
}

function visualStatusLabel(state?: string, planStatus?: string): {label: string; bucket: string} {
  if (state === 'done' || planStatus === 'saved') return {label: '配布済み', bucket: 'done'}
  if (planStatus === 'skipped') return {label: '今回は保留', bucket: 'archived'}
  if (state === 'pending-review' || state === 'in-progress') return {label: '作業中', bucket: 'pending-review'}
  return {label: state ?? planStatus ?? '未着手', bucket: 'draft'}
}

export function IncludedAssetsTable({visuals, outputs, campaignSlug}: Props) {
  const visualRows = visuals.slice(0, 12)
  const outputRows = outputs.slice(0, 8)
  const hasContent = visualRows.length > 0 || outputRows.length > 0
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">含まれる成果物</h2>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={12} aria-hidden="true" />
            画像 {visualRows.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText size={12} aria-hidden="true" />
            出力 {outputRows.length}
          </span>
        </div>
      </header>

      {!hasContent ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          このキャンペーンに紐づく成果物がまだ登録されていません。
        </p>
      ) : (
        <div className="flex flex-col gap-4 px-5 py-4">
          {visualRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                画像・図解 ({visualRows.length})
              </h3>
              <ul className="divide-y divide-slate-100">
                {visualRows.map((v) => {
                  const status = visualStatusLabel(v.state, v.plan?.status)
                  return (
                    <li
                      key={v.visualAssetPlanId ?? v.assetSlug ?? Math.random().toString(36)}
                      className="flex items-center gap-3 py-2 text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex h-7 w-10 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-100 to-purple-50 ring-1 ring-inset ring-slate-200"
                      >
                        <ImageIcon size={14} className="text-blue-700/70" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {v.plan?.title ?? v.assetSlug ?? v.visualAssetPlanId ?? '(無題)'}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                          {v.platform && <PlatformBadge platform={v.platform} />}
                          {v.assetType && <span>{v.assetType}</span>}
                          {v.priority && <span>{v.priority}</span>}
                        </div>
                      </div>
                      <StatusBadge state={status.bucket} label={status.label} />
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {outputRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                出力 ({outputRows.length})
              </h3>
              <ul className="divide-y divide-slate-100">
                {outputRows.map((o) => (
                  <li
                    key={o.key}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-50 ring-1 ring-inset ring-slate-200"
                    >
                      <FileText size={14} className="text-slate-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-slate-900">{o.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                        <PlatformBadge platform={o.platform} />
                        <span>{platformLabel(o.platform)}</span>
                        {o.outputType && <span>{o.outputType}</span>}
                      </div>
                    </div>
                    <StatusBadge
                      state={o.bucket === 'published' ? 'done' : o.bucket}
                      label={o.rawStatus}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-1">
            <Link
              href={`/outputs?slug=${encodeURIComponent(campaignSlug)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
            >
              すべての出力を見る
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
