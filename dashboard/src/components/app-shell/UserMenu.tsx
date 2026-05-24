'use client'

// UserMenu — boss-only placeholder for Phase UI-1.
// Click opens a dropdown with profile / workspace settings / billing / logout
// placeholder links. None of them are wired up; clicking just routes to
// /settings (or stays put) and closes the menu.

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {ChevronDown} from 'lucide-react'

interface MenuLink {
  label: string
  href: string
}

const LINKS: MenuLink[] = [
  {label: 'プロフィール', href: '/settings'},
  {label: 'ワークスペース設定', href: '/settings'},
  {label: '請求・プラン', href: '/settings'},
  {label: 'ログアウト', href: '/settings'},
]

export function UserMenu() {
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
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
          B
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <div className="text-xs font-medium">ボス</div>
          <div className="text-[10px] text-slate-500">Hitori Lab</div>
        </div>
        <ChevronDown size={14} aria-hidden="true" className="text-slate-500" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <div className="text-sm font-medium text-slate-900">ボス</div>
            <div className="text-[11px] text-slate-500">Hitori Lab ワークスペース</div>
          </div>
          <ul className="py-1 text-sm">
            {LINKS.map((l) => (
              <li key={l.label} role="none">
                <Link
                  role="menuitem"
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-slate-800 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
            Phase UI-1: ボタンは placeholder
          </div>
        </div>
      )}
    </div>
  )
}
