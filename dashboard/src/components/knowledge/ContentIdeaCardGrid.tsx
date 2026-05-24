// ContentIdeaCardGrid — 3-col grid wrapper for /knowledge contentIdea tab.

import {ContentIdeaCard} from './ContentIdeaCard'
import type {ContentIdeaOption} from '@/lib/groq/configurator'

interface Props {
  ideas: ContentIdeaOption[]
}

export function ContentIdeaCardGrid({ideas}: Props) {
  if (ideas.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">contentIdea が登録されていません</h3>
        <p className="mt-2 text-slate-600">
          Sanity Studio で <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">contentIdea</code> ドキュメントを 1 件作成すると、ここに表示されます。
        </p>
      </section>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <ContentIdeaCard key={idea._id} idea={idea} />
      ))}
    </div>
  )
}
