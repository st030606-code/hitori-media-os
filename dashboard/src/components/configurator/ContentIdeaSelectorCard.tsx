'use client'

// ContentIdeaSelectorCard — single select + selected idea preview.
// Receives the full option list + currently selected id + onChange.

import {Lightbulb} from 'lucide-react'
import type {ContentIdeaOption} from '@/lib/groq/configurator'
import {normalizeTextList} from '@/lib/configurator/promptBuilder'
import {WorkflowBadge} from '@/components/common/WorkflowGuide'

interface Props {
  contentIdeas: ContentIdeaOption[]
  value: string
  onChange: (id: string) => void
}

export function ContentIdeaSelectorCard({contentIdeas, value, onChange}: Props) {
  const selected = contentIdeas.find((c) => c._id === value)
  const hasOptions = contentIdeas.length > 0
  const audienceList = selected ? normalizeTextList(selected.audience) : []
  const audiencePainList = selected ? normalizeTextList(selected.audiencePain) : []

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
          aria-hidden="true"
        >
          <Lightbulb size={14} />
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Step 1
          </div>
          <h2 className="text-base font-semibold text-slate-900">元アイデアを選ぶ</h2>
          <p className="text-[11px] text-slate-500">Sanityに保存済みのContent Ideaを読み込みます</p>
        </div>
        <div className="ml-auto hidden flex-wrap gap-1.5 sm:flex">
          <WorkflowBadge label="保存先: Sanityから読み込み" tone="blue" />
        </div>
      </header>

      {!hasOptions ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            contentIdea が Sanity に登録されていません。Studio で構造化アイデアを 1 件作成してから再度開いてください。
          </p>
        </div>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">
            元アイデア <span className="text-blue-600">*</span>
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">アイデアを選択してください…</option>
            {contentIdeas.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title ?? c._id}
                {c.slug ? ` (${c.slug})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      {selected && (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-900">{selected.title}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            {selected.slug && (
              <code className="rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
                {selected.slug}
              </code>
            )}
            {selected.status && <span className="ml-2">status: {selected.status}</span>}
          </div>
          {selected.coreThesis && (
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{selected.coreThesis}</p>
          )}
          {audienceList.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                想定読者
              </div>
              <ul className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-700">
                {audienceList.map((a, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-white px-2 py-0.5 ring-1 ring-inset ring-slate-200"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {audiencePainList.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                想定読者の悩み
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-slate-700">
                {audiencePainList.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-2">
            <Stat label="主張" value={selected.claimsCount ?? 0} />
            <Stat label="具体例" value={selected.examplesCount ?? 0} />
            <Stat label="反論" value={selected.objectionsCount ?? 0} />
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}
