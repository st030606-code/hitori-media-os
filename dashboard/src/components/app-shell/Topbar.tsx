// Topbar — 64px sticky, sits to the right of the Sidebar.
// Phase UI-1: search is UI-only (placeholder), notifications are stubbed.
// Quick create and user menu are interactive client components.

import {Bell, Search, Settings as SettingsIcon} from 'lucide-react'
import Link from 'next/link'
import {QuickCreateButton} from './QuickCreateButton'
import {ReadOnlyPill} from './ReadOnlyPill'
import {UserMenu} from './UserMenu'

interface Props {
  writeReady: boolean
}

export function Topbar({writeReady}: Props) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:left-[280px] lg:px-6">
      {/* Left: brand on mobile (sidebar is hidden < lg) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white">
          H
        </div>
        <span className="text-sm font-semibold text-slate-900">Hitori Media OS</span>
      </div>

      {/* Center: search */}
      <div className="hidden flex-1 justify-center sm:flex">
        <div className="relative w-full max-w-[560px]">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            aria-label="検索"
            placeholder="検索（キャンペーン、コンテンツ、ドキュメントなど）"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex">
          <ReadOnlyPill writeReady={writeReady} />
        </span>
        <QuickCreateButton />
        <button
          type="button"
          aria-label="通知"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <Bell size={18} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white"
          >
            3
          </span>
        </button>
        <Link
          href="/settings"
          aria-label="設定"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <SettingsIcon size={18} aria-hidden="true" />
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
