// Page-level header used at the top of redesigned routes (Phase UI-2+).
// Renders a title, optional description, optional right-side actions,
// optional inline meta, and an optional breadcrumb above the title.

import type {ReactNode} from 'react'
import {Breadcrumb, type BreadcrumbItem} from './Breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  meta?: ReactNode
  breadcrumb?: BreadcrumbItem[]
}

export function PageHeader({title, description, actions, meta, breadcrumb}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
          {meta && <div className="mt-2 text-xs text-slate-500">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
