// FutureIntegrationsCard — wide placeholder card on /settings listing the
// integration surfaces planned for later phases. Pure visual placeholder.

import {Plug, type LucideIcon} from 'lucide-react'

interface Item {
  name: string
  description: string
  phase: string
}

const ITEMS: Item[] = [
  {name: 'billing', description: 'Stripe / Substack / Patreon 等の課金連携', phase: 'Phase Billing'},
  {name: 'team workspace', description: '複数ユーザーでの編集 / ロール管理', phase: 'Phase Settings-2'},
  {name: 'external analytics', description: 'Plausible / GA / X API / note 統計', phase: 'Phase Analytics-2'},
  {name: 'AI auto-generation', description: 'API 経由で下書きを自動生成', phase: 'Phase 2B (要承認)'},
]

const Icon: LucideIcon = Plug

export function FutureIntegrationsCard() {
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
          <h2 className="text-base font-semibold text-slate-900">将来の連携</h2>
          <p className="text-[11px] text-slate-500">後続フェーズで検討する設定領域</p>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
