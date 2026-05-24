'use client'

// CampaignSwitcher — hand-roll dropdown for /publish to switch between
// campaigns. Uses URL searchParam ?slug=... for persistence so the boss can
// bookmark a specific campaign's publish view.
//
// Pattern matches QuickCreateButton (UI-1): click-outside + Escape to close,
// no shadcn dependency. If only one campaign exists we still render the
// compact selector state (no menu items besides the current one).

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import {ChevronDown, Check} from 'lucide-react'

export interface CampaignOption {
  slug: string
  title: string
}

interface Props {
  current: CampaignOption
  options: CampaignOption[]
}

export function CampaignSwitcher({current, options}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  function selectCampaign(slug: string) {
    setOpen(false)
    if (slug === current.slug) return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('slug', slug)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasOptions = options.length > 1

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            対象キャンペーン
          </span>
          {options.length > 0 && (
            <span className="text-[10px] text-slate-400">{options.length} 件</span>
          )}
        </div>
        <div className="relative" ref={ref}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            disabled={!hasOptions}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <span className="max-w-[18rem] truncate">{current.title}</span>
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600">
              {current.slug}
            </code>
            {hasOptions && (
              <ChevronDown size={14} aria-hidden="true" className="text-slate-400" />
            )}
          </button>
          {open && hasOptions && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <ul className="py-1.5 text-sm">
                {options.map((o) => {
                  const active = o.slug === current.slug
                  return (
                    <li key={o.slug} role="none">
                      <Link
                        role="menuitem"
                        href={`/publish?slug=${encodeURIComponent(o.slug)}`}
                        onClick={(e) => {
                          // Use router for smoother navigation while preserving
                          // existing search params other than slug.
                          if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                            e.preventDefault()
                            selectCampaign(o.slug)
                          }
                        }}
                        className={
                          (active ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50') +
                          ' flex items-center gap-2.5 px-3 py-1.5 focus:outline-none focus:bg-slate-50'
                        }
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                          {active && <Check size={14} aria-hidden="true" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{o.title}</span>
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600">
                          {o.slug}
                        </code>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-500">
                URL searchParam <code>?slug=</code> で永続化
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
