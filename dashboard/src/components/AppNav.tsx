'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

interface NavItem {
  href: string
  label: string
  enabled: boolean
}

function buildItems(flags: {enableDiagnostics: boolean; enableLocalFsRoutes: boolean}): NavItem[] {
  return [
    {href: '/', label: 'Home', enabled: true},
    {href: '/campaigns', label: 'Campaigns', enabled: true},
    {href: '/human-review-gates', label: 'Human Review Gates', enabled: true},
    {href: '/visual-assets', label: 'Visual Assets', enabled: true},
    {href: '/publish-packages', label: 'Publish Packages', enabled: flags.enableLocalFsRoutes},
    {href: '/diagnostics', label: 'Diagnostics', enabled: flags.enableDiagnostics},
    {href: '/activity-log', label: 'Activity Log', enabled: true},
  ]
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function AppNav({
  enableDiagnostics,
  enableLocalFsRoutes,
}: {
  enableDiagnostics: boolean
  enableLocalFsRoutes: boolean
}) {
  const pathname = usePathname()
  const items = buildItems({enableDiagnostics, enableLocalFsRoutes}).filter((it) => it.enabled)
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-slate-700">
          Hitori Media OS
          <span className="ml-1.5 text-xs font-normal text-slate-500">/ Admin (Phase 1)</span>
        </Link>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {items.map((it) => {
            const active = isActive(pathname, it.href)
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={
                    active
                      ? 'rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-900'
                      : 'text-slate-700 hover:text-slate-900'
                  }
                  aria-current={active ? 'page' : undefined}
                >
                  {it.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
