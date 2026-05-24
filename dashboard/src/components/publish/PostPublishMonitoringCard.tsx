// PostPublishMonitoringCard — right sidebar "公開後モニタリング" card.
// Phase UI-fidelity-4: 4 metric tile placeholders + dashed chart area.
// Structure intentionally mirrors EngagementPlaceholder (UI-2.5 Dashboard)
// but scoped to "post-publish 24h / 7d" timing.

import {LineChart, Eye, Heart, Users, MessageSquare} from 'lucide-react'

interface MetricTile {
  label: string
  hint?: string
  icon: React.ComponentType<{size?: number; className?: string}>
  tone: 'blue' | 'purple' | 'orange' | 'emerald'
}

const TILES: MetricTile[] = [
  {label: '視聴', hint: 'note + Substack の合計', icon: Eye, tone: 'blue'},
  {label: 'スキ・♥', hint: '各媒体のリアクション', icon: Heart, tone: 'orange'},
  {label: '購読・フォロー', hint: 'Substack 購読 + X フォロー', icon: Users, tone: 'emerald'},
  {label: '返信・引用', hint: '会話の質', icon: MessageSquare, tone: 'purple'},
]

const TONE_BG: Record<MetricTile['tone'], string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export function PostPublishMonitoringCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
            aria-hidden="true"
          >
            <LineChart size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">公開後モニタリング</h2>
            <p className="text-[11px] text-slate-500">公開直後 24h / 7d の指標</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
          Phase UI-6
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {TILES.map((t) => {
          const Icon = t.icon
          return (
            <div
              key={t.label}
              className="rounded-md border border-slate-200 bg-slate-50 p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium text-slate-600">{t.label}</div>
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded ring-1 ring-inset ${TONE_BG[t.tone]}`}
                  aria-hidden="true"
                >
                  <Icon size={11} />
                </span>
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-slate-300">—</div>
              {t.hint && <div className="mt-0.5 text-[10px] text-slate-500">{t.hint}</div>}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex h-16 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/60">
        <span className="text-[11px] text-slate-500">
          反応データが揃うと、ここに mini chart が入ります
        </span>
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Phase UI-6 (Analytics) で <code className="rounded bg-slate-50 px-1">manualPublishingStatus.reactionNotes</code> から自動集計します。
      </p>
    </section>
  )
}
