// Shared placeholder for new routes that will be implemented in later UI phases.
// Each placeholder shows the page title, the phase that will deliver it, and
// a link back to the dashboard. Used by /configurator /outputs /publish
// /knowledge /analytics /settings in Phase UI-1.

import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'

interface Props {
  title: string
  phase: string
  description?: string
  children?: React.ReactNode
}

export function PhasePlaceholder({title, phase, description, children}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </header>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="text-sm font-medium text-slate-700">
          この画面は次フェーズで実装します
        </div>
        <p className="mt-1 text-xs text-slate-500">対応フェーズ: {phase}</p>
        <p className="mt-3 text-xs text-slate-500">
          実装計画は{' '}
          <code className="rounded bg-slate-50 px-1.5 py-0.5">
            docs/69-dashboard-ui-redesign-implementation-plan.md
          </code>{' '}
          を参照してください。
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
      {children}
    </main>
  )
}
