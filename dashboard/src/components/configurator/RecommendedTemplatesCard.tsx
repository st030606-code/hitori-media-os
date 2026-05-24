'use client'

// RecommendedTemplatesCard — list of promptTemplate docs. Clicking 「使う」
// sets value.promptTemplateId in the form state. Graceful empty fallback
// when no promptTemplate docs are registered.

import {ChevronRight, ScrollText} from 'lucide-react'
import Link from 'next/link'
import type {PromptTemplateOption} from '@/lib/groq/configurator'

interface Props {
  promptTemplates: PromptTemplateOption[]
  selectedId: string
  onSelect: (id: string) => void
}

export function RecommendedTemplatesCard({promptTemplates, selectedId, onSelect}: Props) {
  const rows = promptTemplates.slice(0, 5)
  const isEmpty = rows.length === 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
            aria-hidden="true"
          >
            <ScrollText size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">おすすめテンプレ</h2>
            <p className="text-[11px] text-slate-500">promptTemplate から派生</p>
          </div>
        </div>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          すべて見る
          <ChevronRight size={12} aria-hidden="true" />
        </Link>
      </header>

      {isEmpty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          promptTemplate がまだ Sanity に登録されていません。Studio でテンプレを 1 件作成すると、ここに候補が並びます。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((t) => {
            const selected = selectedId === t._id
            return (
              <li
                key={t._id}
                className="flex items-center gap-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {t.title ?? t._id}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                    {t.category && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 ring-1 ring-inset ring-slate-200">
                        {t.category}
                      </span>
                    )}
                    {t.version && <span>v{t.version}</span>}
                    {t.brandName && <span>brand: {t.brandName}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(selected ? '' : t._id)}
                  aria-pressed={selected}
                  className={
                    'inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors ' +
                    (selected
                      ? 'bg-blue-600 text-white ring-blue-600 hover:bg-blue-700'
                      : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50')
                  }
                >
                  {selected ? '採用中' : '使う'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
