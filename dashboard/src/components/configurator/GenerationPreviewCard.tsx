'use client'

// GenerationPreviewCard — right-column "title candidate" preview.
// Uses buildTitleCandidates from promptBuilder, which derives 3-5 titles
// from coreThesis + outputType + tone. No AI call; deterministic.

import {Sparkles} from 'lucide-react'
import {buildTitleCandidates} from '@/lib/configurator/promptBuilder'
import type {ContentIdeaOption} from '@/lib/groq/configurator'
import type {FormValue} from '@/lib/configurator/options'

interface Props {
  form: FormValue
  contentIdea?: ContentIdeaOption | null
}

export function GenerationPreviewCard({form, contentIdea}: Props) {
  const candidates = buildTitleCandidates(contentIdea?.coreThesis, form.outputType, form.tone)
  const empty = !contentIdea || candidates.length === 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <Sparkles size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">生成プレビュー</h2>
            <p className="text-[11px] text-slate-500">タイトル候補 (coreThesis から派生)</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
          {empty ? '未生成' : `${candidates.length}件`}
        </span>
      </header>

      {empty ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          アイデアと出力条件を設定すると、ここにタイトル候補が表示されます。
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {candidates.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2"
            >
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="text-sm text-slate-800">{c}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-2 text-[11px] text-slate-500">
        ※ AI 呼び出しはまだ行いません。下の「プロンプトをコピー」で手動生成してください。
      </p>
    </section>
  )
}
