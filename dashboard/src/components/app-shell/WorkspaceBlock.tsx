// Boss-only WorkspaceBlock for Phase UI-1.
// Values are hardcoded boss-confirmed placeholders until multi-user mode lands.
// The component is intentionally a Server Component (no interactivity yet) —
// it just renders static workspace state. The "プランをアップグレード" button
// is a stub link that goes to /settings for now.

import Link from 'next/link'

interface UsageBarProps {
  label: string
  current: number
  limit: number
  unit?: string
}

function UsageBar({label, current, limit, unit = ''}: UsageBarProps) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0
  const tone = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] text-slate-600">
        <span>{label}</span>
        <span className="tabular-nums text-slate-700">
          {current}
          {unit} / {limit}
          {unit}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${tone}`} style={{width: `${pct}%`}} />
      </div>
    </div>
  )
}

export function WorkspaceBlock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-blue-700">
            スタンダードプラン
          </div>
          <div className="text-xs text-slate-700">Hitori Lab ワークスペース</div>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          正常
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <UsageBar label="今月の出力数" current={72} limit={300} />
        <UsageBar label="ストレージ使用量" current={18.4} limit={100} unit="GB" />
      </div>

      <div className="mt-3 flex items-baseline justify-between text-[11px] text-slate-600">
        <span>メンバー</span>
        <span className="tabular-nums text-slate-700">3 / 5</span>
      </div>

      <Link
        href="/settings"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        プランをアップグレード
      </Link>
    </div>
  )
}
