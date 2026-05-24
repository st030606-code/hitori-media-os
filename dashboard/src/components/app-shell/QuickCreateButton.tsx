'use client'

// QuickCreateButton — dropdown menu of placeholder create-actions.
// Phase UI-1: actual create flow not implemented; clicking a menu item
// just routes to the matching placeholder/section page.

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {Plus, ChevronDown, Lightbulb, Rocket, FileText, Send, Database} from 'lucide-react'

interface MenuItem {
  key: string
  label: string
  href: string
  icon: React.ComponentType<{size?: number; className?: string}>
}

const ITEMS: MenuItem[] = [
  {key: 'contentIdea',    label: 'コンテンツアイデア', href: '/knowledge',     icon: Lightbulb},
  {key: 'campaign',       label: 'キャンペーン',       href: '/campaigns',     icon: Rocket},
  {key: 'output',         label: '出力',               href: '/configurator',  icon: FileText},
  {key: 'publishPackage', label: '公開パッケージ',     href: '/publish',       icon: Send},
  {key: 'knowledge',      label: 'ナレッジ',           href: '/knowledge',     icon: Database},
]

export function QuickCreateButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <Plus size={16} aria-hidden="true" />
        <span>クイック作成</span>
        <ChevronDown size={14} aria-hidden="true" className="opacity-80" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <ul className="py-1.5 text-sm">
            {ITEMS.map((it) => {
              const Icon = it.icon
              return (
                <li key={it.key} role="none">
                  <Link
                    role="menuitem"
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-slate-800 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    <Icon size={16} className="text-slate-500" />
                    <span>{it.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
            Phase UI-1: 作成フローは次フェーズで実装
          </div>
        </div>
      )}
    </div>
  )
}
