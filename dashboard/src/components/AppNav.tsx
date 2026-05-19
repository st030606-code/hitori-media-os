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
    {href: '/', label: 'ダッシュボード', enabled: true},
    {href: '/campaigns', label: 'キャンペーン', enabled: true},
    {href: '/human-review-gates', label: '確認待ち', enabled: true},
    {href: '/visual-assets', label: '画像・図解素材', enabled: true},
    {href: '/publish-package/building-hitori-media-os', label: '公開パッケージ', enabled: flags.enableLocalFsRoutes},
    {href: '/publish-packages', label: '配布物一覧', enabled: flags.enableLocalFsRoutes},
    {href: '/diagnostics', label: '診断', enabled: flags.enableDiagnostics},
    {href: '/activity-log', label: '作業ログ', enabled: true},
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
