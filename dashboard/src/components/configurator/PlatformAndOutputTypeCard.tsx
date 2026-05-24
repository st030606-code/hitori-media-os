'use client'

// PlatformAndOutputTypeCard — multi-select platform chips + dependent
// outputType + purpose selects. Receives controlled {value, onChange} from
// ConfiguratorForm so the form state stays in one place.

import {Blocks} from 'lucide-react'
import {
  OUTPUT_TYPE_OPTIONS,
  PLATFORM_OPTIONS,
  PURPOSE_OPTIONS,
  RECOMMENDED_OUTPUT_TYPE_BY_PLATFORM,
  type FormValue,
} from '@/lib/configurator/options'

interface Props {
  value: FormValue
  onChange: (next: Partial<FormValue>) => void
}

export function PlatformAndOutputTypeCard({value, onChange}: Props) {
  const recommendedOutputTypes = new Set<string>()
  for (const p of value.platforms) {
    for (const key of RECOMMENDED_OUTPUT_TYPE_BY_PLATFORM[p] ?? []) {
      recommendedOutputTypes.add(key)
    }
  }

  const togglePlatform = (p: string) => {
    const next = value.platforms.includes(p)
      ? value.platforms.filter((x) => x !== p)
      : [...value.platforms, p]
    onChange({platforms: next})
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
          aria-hidden="true"
        >
          <Blocks size={14} />
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Step 2
          </div>
          <h2 className="text-base font-semibold text-slate-900">出力条件を決める</h2>
          <p className="text-[11px] text-slate-500">媒体・出力形式・目的を選びます</p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium text-slate-600">
            出力先 (platform) <span className="text-blue-600">*</span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {PLATFORM_OPTIONS.map((p) => {
              const selected = value.platforms.includes(p.value)
              return (
                <li key={p.value}>
                  <button
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    aria-pressed={selected}
                    className={
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ' +
                      (selected
                        ? 'bg-blue-50 text-blue-700 ring-blue-200'
                        : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
                    }
                  >
                    {p.label}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-1 text-[11px] text-slate-500">
            {value.platforms.length === 0
              ? '1 つ以上選択してください'
              : `${value.platforms.length} 件選択中`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">
              出力形式 (outputType) <span className="text-blue-600">*</span>
            </span>
            <select
              value={value.outputType}
              onChange={(e) => onChange({outputType: e.target.value})}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">形式を選択してください…</option>
              {OUTPUT_TYPE_OPTIONS.map((o) => {
                const recommended = recommendedOutputTypes.has(o.value)
                return (
                  <option key={o.value} value={o.value}>
                    {recommended ? '★ ' : ''}
                    {o.label}
                    {o.hint ? ` — ${o.hint}` : ''}
                  </option>
                )
              })}
            </select>
            {value.platforms.length > 0 && (
              <span className="text-[11px] text-slate-500">★ は選択媒体に推奨される形式</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">
              目的 (purpose) <span className="text-blue-600">*</span>
            </span>
            <select
              value={value.purpose}
              onChange={(e) => onChange({purpose: e.target.value})}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">目的を選択してください…</option>
              {PURPOSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                  {o.hint ? ` — ${o.hint}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  )
}
