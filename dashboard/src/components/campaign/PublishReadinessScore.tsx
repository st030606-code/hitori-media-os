// PublishReadinessScore — campaign-level readiness summary used in the
// right column of /campaigns/[slug].
//
// Renders:
//   - large numeric score (0-100) with circular SVG progress
//   - per-platform breakdown (X / Threads / note / Substack) with ✓ / ⏳ dots
//   - visual readiness breakdown (saved / skipped counts)
//   - subtitle "{N}/{total} 媒体公開済み"
//
// Score derivation (deterministic, no Sanity write):
//   - publishingScore: publishedDone / (publishedDone + publishedPending) * 70
//   - visualScore:     visualsDone / visualsTotal * 30
//   - total:           clamp(0, 100)
// (Pure function of the data passed in, no async.)

import {CheckCircle2, Clock, Image as ImageIcon} from 'lucide-react'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'

interface PublishItem {
  platform?: string
  state?: string
  publishedUrl?: string
}

interface VisualBreakdown {
  saved: number
  skipped: number
  total: number
}

interface Props {
  publishing: PublishItem[]
  visualReadiness: VisualBreakdown
  // Optional override: when boss wants a specific score regardless of derivation.
  scoreOverride?: number
}

const SIZE = 120
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

function toneFor(score: number): {arc: string; text: string; chip: string} {
  if (score >= 80) return {arc: 'stroke-emerald-500', text: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200'}
  if (score >= 60) return {arc: 'stroke-blue-500', text: 'text-blue-700', chip: 'bg-blue-100 text-blue-800 ring-blue-200'}
  if (score >= 40) return {arc: 'stroke-amber-500', text: 'text-amber-700', chip: 'bg-amber-100 text-amber-800 ring-amber-200'}
  return {arc: 'stroke-slate-400', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-700 ring-slate-200'}
}

function platformStatus(items: PublishItem[], platform: string): 'done' | 'pending' | 'unknown' {
  const match = items.find((i) => i.platform === platform)
  if (!match) return 'unknown'
  if (match.state === 'done' && match.publishedUrl) return 'done'
  return 'pending'
}

const KNOWN_PLATFORMS = ['x', 'threads', 'note', 'substack'] as const

export function PublishReadinessScore({publishing, visualReadiness, scoreOverride}: Props) {
  const tracked = publishing.filter((p) => p.platform && KNOWN_PLATFORMS.includes(p.platform as (typeof KNOWN_PLATFORMS)[number]))
  const publishedDone = tracked.filter((p) => p.state === 'done' && p.publishedUrl).length
  const publishedPending = tracked.filter((p) => !(p.state === 'done' && p.publishedUrl)).length
  const publishedTotal = publishedDone + publishedPending

  const publishingPart =
    publishedTotal === 0 ? 0 : (publishedDone / publishedTotal) * 70
  const visualPart =
    visualReadiness.total === 0
      ? 0
      : (visualReadiness.saved / visualReadiness.total) * 30
  const derived = Math.round(publishingPart + visualPart)
  const score = Math.max(0, Math.min(100, scoreOverride ?? derived))

  const tone = toneFor(score)
  const offset = CIRC * (1 - score / 100)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">公開準備スコア</h2>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${tone.chip}`}
        >
          {publishedDone} / {publishedTotal || 4} 媒体公開済み
        </span>
      </header>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{width: SIZE, height: SIZE}}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-slate-100"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              className={tone.arc}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-semibold tabular-nums leading-none ${tone.text}`}>
              {score}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
              SCORE
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ul className="space-y-1.5 text-sm">
            {KNOWN_PLATFORMS.map((p) => {
              const status = platformStatus(publishing, p)
              return (
                <li key={p} className="flex items-center justify-between gap-2">
                  <PlatformBadge platform={p} />
                  <span
                    className={
                      'inline-flex items-center gap-1 text-[11px] font-medium ' +
                      (status === 'done'
                        ? 'text-emerald-700'
                        : status === 'pending'
                          ? 'text-amber-700'
                          : 'text-slate-400')
                    }
                  >
                    {status === 'done' ? (
                      <>
                        <CheckCircle2 size={12} aria-hidden="true" />
                        <span>公開済み</span>
                      </>
                    ) : status === 'pending' ? (
                      <>
                        <Clock size={12} aria-hidden="true" />
                        <span>未公開</span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span>未追跡</span>
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">公開済み</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-semibold tabular-nums text-emerald-700">{publishedDone}</span>
            <span className="text-[11px] text-slate-500">/ {publishedTotal || 4}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">未公開</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-semibold tabular-nums text-amber-700">{publishedPending}</span>
            <span className="text-[11px] text-slate-500">媒体</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ImageIcon size={10} aria-hidden="true" />
              画像
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-lg font-semibold tabular-nums text-purple-700">{visualReadiness.saved}</span>
            <span className="text-[11px] text-slate-500">/ {visualReadiness.total}</span>
            {visualReadiness.skipped > 0 && (
              <span className="text-[10px] text-slate-500">+ 保留 {visualReadiness.skipped}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper exported for callers (page.tsx) that want to label the platforms
// using the shared platformLabel helper without re-importing it.
export {platformLabel}
