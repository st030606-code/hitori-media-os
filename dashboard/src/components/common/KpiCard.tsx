// KpiCard — single-number highlight used on Dashboard Home and Campaign detail.
// Tone palette follows docs/68 §4.3 (semantic colors). Icon is optional.
//
// Phase UI-2.5 visual polish:
//   - value typography upgraded to text-3xl
//   - "neutral" trend ("— 前月比") supported via direction === 'flat' + value === '—'
//   - tiny inline sparkline (SVG, 60×16) when sparkline array is provided
//   - icon pill larger (h-9 w-9) with stronger tone tint

import type {LucideIcon} from 'lucide-react'
import {ArrowDown, ArrowUp, Minus} from 'lucide-react'

export type KpiTone = 'blue' | 'purple' | 'orange' | 'emerald' | 'red' | 'slate'

interface KpiTrend {
  value: string
  direction: 'up' | 'down' | 'flat'
  periodLabel?: string
}

interface KpiCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: KpiTone
  trend?: KpiTrend
  sparkline?: number[]
  secondary?: string
}

const TONE_PILL: Record<KpiTone, string> = {
  blue: 'bg-blue-100 text-blue-700 ring-blue-200',
  purple: 'bg-purple-100 text-purple-700 ring-purple-200',
  orange: 'bg-orange-100 text-orange-700 ring-orange-200',
  emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-100 text-rose-700 ring-rose-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const TONE_SPARKLINE: Record<KpiTone, string> = {
  blue: 'stroke-blue-500',
  purple: 'stroke-purple-500',
  orange: 'stroke-orange-500',
  emerald: 'stroke-emerald-500',
  red: 'stroke-rose-500',
  slate: 'stroke-slate-400',
}

const TREND_CLASS = {
  up: 'text-emerald-700',
  down: 'text-rose-700',
  flat: 'text-slate-500',
} as const

const TREND_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
} as const

function Sparkline({values, toneClass}: {values: number[]; toneClass: string}) {
  if (values.length < 2) return null
  const w = 64
  const h = 18
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / span) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={toneClass}
      />
    </svg>
  )
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  trend,
  sparkline,
  secondary,
}: KpiCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null
  const isNeutralTrend = trend?.direction === 'flat' && (trend.value === '—' || trend.value === '-')

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums leading-none text-slate-900">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${TONE_PILL[tone]}`}
            aria-hidden="true"
          >
            <Icon size={20} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-medium ${TREND_CLASS[trend.direction]}`}
            >
              {TrendIcon && !isNeutralTrend && <TrendIcon size={12} aria-hidden="true" />}
              {isNeutralTrend ? (
                <span>— 前月比</span>
              ) : (
                <>
                  <span>{trend.value}</span>
                  {trend.periodLabel && (
                    <span className="text-slate-500">{trend.periodLabel}</span>
                  )}
                </>
              )}
            </span>
          )}
          {sparkline && sparkline.length > 1 && (
            <Sparkline values={sparkline} toneClass={TONE_SPARKLINE[tone]} />
          )}
        </div>
        {secondary && <span className="text-slate-500">{secondary}</span>}
      </div>
    </div>
  )
}
