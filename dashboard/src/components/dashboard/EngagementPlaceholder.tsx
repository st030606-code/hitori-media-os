// EngagementPlaceholder — replaces the right-column ReleaseReviewLinks slot
// on Dashboard Home. Visually communicates that engagement analytics will
// arrive in Phase UI-6, without showing fake numbers.
//
// Phase UI-2.5: pure presentational placeholder with 4 metric tiles + a
// dashed chart area + an explanatory note.

import {LineChart} from 'lucide-react'

interface MetricTile {
  label: string
  hint?: string
}

const TILES: MetricTile[] = [
  {label: '視聴数', hint: 'note + Substack の合計'},
  {label: 'スキ・♥', hint: '各媒体のリアクション集計'},
  {label: '購読・フォロー', hint: 'Substack 購読 + フォロー増分'},
  {label: '返信・引用', hint: '会話の質を測る'},
]

export function EngagementPlaceholder() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-100"
            aria-hidden="true"
          >
            <LineChart size={14} />
          </span>
          <h2 className="text-base font-semibold text-slate-900">エンゲージメント概要</h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
          Phase UI-6
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {TILES.map((t) => (
          <div
            key={t.label}
            className="rounded-md border border-slate-200 bg-slate-50 p-2.5"
          >
            <div className="text-[11px] font-medium text-slate-600">{t.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-slate-300">—</div>
            {t.hint && <div className="mt-0.5 text-[10px] text-slate-500">{t.hint}</div>}
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-20 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/60">
        <span className="text-[11px] text-slate-500">
          反応データが揃うと、ここにチャートが入ります
        </span>
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Phase UI-6 (Analytics) で <code className="rounded bg-slate-50 px-1 py-0.5">manualPublishingStatus.reactionNotes</code> から自動集計します。現在は反応データ収集中。
      </p>
    </section>
  )
}
