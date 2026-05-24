'use client'

// Hitori Media OS Sidebar (Phase UI-1)
// 280px wide, 9 nav items grouped into 4 sections.
// Active item is highlighted with a left blue bar + slate-100 background.
//
// Hydration note: usePathname() can return null during the very first render
// in some Next 16 edge cases. We coerce to '' so activeKey is deterministic
// on both server and client. The brand header className below is intentionally
// static (no dynamic class) so it always matches across SSR + hydration.

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {NAV_ITEMS, NAV_GROUP_LABELS, activeNavKey, type NavGroup, type NavItem} from '@/lib/navigation'
import {WorkspaceBlock} from './WorkspaceBlock'

const GROUP_ORDER: NavGroup[] = ['main', 'production', 'knowledge', 'system']

export function Sidebar() {
  const pathname = usePathname() ?? ''
  const activeKey = activeNavKey(pathname)

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: NAV_ITEMS.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0)

  return (
    <aside
      aria-label="Primary"
      className="fixed left-0 top-0 z-30 hidden h-screen w-[280px] border-r border-slate-200 bg-white lg:flex lg:flex-col"
    >
      <div className="flex h-16 items-center gap-2.5 bg-slate-900 px-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-sm font-semibold text-white shadow-inner"
          aria-hidden="true"
        >
          H
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Hitori Media OS</div>
          <div className="text-[11px] text-slate-400">Admin · Phase 1</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 pt-3">
        {grouped.map(({group, items}, idx) => (
          <div key={group} className={idx === 0 ? '' : 'mt-4'}>
            {NAV_GROUP_LABELS[group] && (
              <div className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {NAV_GROUP_LABELS[group]}
              </div>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <SidebarLink key={item.key} item={item} active={activeKey === item.key} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <WorkspaceBlock />
      </div>
    </aside>
  )
}

function SidebarLink({item, active}: {item: NavItem; active: boolean}) {
  const Icon = item.icon
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={
          (active
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900') +
          ' relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'
        }
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-blue-600"
            style={{width: '3px'}}
          />
        )}
        <Icon size={18} strokeWidth={2} aria-hidden="true" className={active ? 'text-blue-600' : 'text-slate-500'} />
        <span>{item.label}</span>
      </Link>
    </li>
  )
}
