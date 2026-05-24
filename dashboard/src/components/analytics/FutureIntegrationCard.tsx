// FutureIntegrationCard — visible placeholder for external analytics APIs
// that haven't been wired yet (Plausible / X / note / Substack). Sets
// reasonable expectations so the boss doesn't wonder why the analytics page
// looks thin.

import {Plug, type LucideIcon} from 'lucide-react'

interface IntegrationItem {
  name: string
  description: string
  phase: string
}

const ITEMS: IntegrationItem[] = [
  {
    name: 'Plausible / GA',
    description: 'note / blog の閲覧数とリファラを集計',
    phase: 'Analytics-2',
  },
  {
    name: 'X API',
    description: 'インプレッション / 反応 / ブックマーク数',
    phase: 'Analytics-2',
  },
  {
    name: 'note 統計',
    description: '記事別の閲覧 / スキ / 購読',
    phase: 'Analytics-2',
  },
  {
    name: 'Substack 統計',
    description: '購読数 / 開封率 / クリック率',
    phase: 'Analytics-2',
  },
]

const Icon: LucideIcon = Plug

export function FutureIntegrationCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
          aria-hidden="true"
        >
          <Icon size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">外部 API 連携 (準備中)</h2>
          <p className="text-[11px] text-slate-500">Phase Analytics-2 で実装予定</p>
        </div>
      </header>
      <ul className="flex flex-col gap-1.5">
        {ITEMS.map((it) => (
          <li
            key={it.name}
            className="flex items-start justify-between gap-2 rounded-md bg-slate-50/60 px-3 py-2 text-xs ring-1 ring-inset ring-slate-200"
          >
            <div className="min-w-0">
              <div className="font-medium text-slate-800">{it.name}</div>
              <div className="text-[11px] text-slate-500">{it.description}</div>
            </div>
            <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-700">
              {it.phase}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
