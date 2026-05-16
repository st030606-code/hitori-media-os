import type {PromptTemplateSelectionItem} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

export function PromptTemplateSummary({selections}: {selections?: PromptTemplateSelectionItem[]}) {
  if (!selections || selections.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Prompt Templates</h2>
        <p className="mt-2">No prompt templates selected for this campaign.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Prompt Templates</h2>
      <ul className="space-y-3">
        {selections.map((sel, i) => {
          const t = sel.template
          return (
            <li
              key={`${sel.promptTemplateId ?? 'tpl'}-${i}`}
              className="rounded-md border border-slate-200 bg-slate-50/50 p-3 text-sm"
            >
              {t ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{t.title ?? t._id}</span>
                    {t.version && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-700">
                        v{t.version}
                      </span>
                    )}
                    <StatusBadge state={t.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                    {t.category && <span>category: {t.category}</span>}
                    {sel.platform && <span>platform: {sel.platform}</span>}
                    {sel.assetType && <span>assetType: {sel.assetType}</span>}
                    {t.automationLevel && <span>auto: {t.automationLevel}</span>}
                    {t.variationStrategy && <span>variation: {t.variationStrategy}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                    {t.brand?.brandName && <span>brand: {t.brand.brandName}</span>}
                    {t.style?.title && <span>style: {t.style.title}</span>}
                  </div>
                  {sel.notes && <p className="mt-2 text-xs text-slate-600">{sel.notes}</p>}
                </>
              ) : (
                <div>
                  <div className="text-rose-700">Prompt template not in dataset</div>
                  <div className="mt-1 text-xs text-slate-500">
                    requested ID: <code>{sel.promptTemplateId ?? '(empty)'}</code>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
