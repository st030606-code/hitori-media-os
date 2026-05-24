// Breadcrumb — small navigation trail rendered above the page title.
// Last item is treated as current (no link, slate-900). Earlier items are
// links if `href` is set; otherwise rendered as plain slate-500 text.

import Link from 'next/link'
import {ChevronRight} from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export function Breadcrumb({items}: Props) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-slate-800"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium text-slate-900' : 'text-slate-500'}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight size={12} aria-hidden="true" className="text-slate-400" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
