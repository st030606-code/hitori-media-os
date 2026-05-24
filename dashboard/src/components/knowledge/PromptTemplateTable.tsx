// PromptTemplateTable — promptTemplate rows on /knowledge.

import {ExternalLink} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {studioDocumentUrl} from '@/lib/sanity'
import type {PromptTemplateOption} from '@/lib/groq/configurator'

interface Props {
  templates: PromptTemplateOption[]
}

export function PromptTemplateTable({templates}: Props) {
  if (templates.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">promptTemplate が登録されていません</h3>
        <p className="mt-2 text-slate-600">
          Studio で <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">promptTemplate</code> を作成すると、ここと <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">/configurator</code> の RecommendedTemplatesCard に表示されます。
        </p>
      </section>
    )
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">タイトル</th>
              <th className="px-4 py-2 font-medium">category</th>
              <th className="px-4 py-2 font-medium">version</th>
              <th className="px-4 py-2 font-medium">brand</th>
              <th className="px-4 py-2 font-medium">style</th>
              <th className="px-4 py-2 font-medium">状態</th>
              <th className="px-4 py-2 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((t) => (
              <tr key={t._id}>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-slate-900">{t.title ?? t._id}</div>
                  {t.automationLevel && (
                    <div className="text-[11px] text-slate-500">automation: {t.automationLevel}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-slate-700">{t.category ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums text-slate-700">{t.version ?? '—'}</td>
                <td className="px-4 py-2.5 text-slate-700">{t.brandName ?? '—'}</td>
                <td className="px-4 py-2.5 text-slate-700">{t.styleTitle ?? '—'}</td>
                <td className="px-4 py-2.5">
                  {t.status ? <StatusBadge state={t.status} label={t.status} /> : '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <a
                    href={studioDocumentUrl(t._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                  >
                    Studio
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
