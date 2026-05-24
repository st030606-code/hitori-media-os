'use client'

// ToneAndCtaCard — tone / cta / length selects.
// Stays controlled by ConfiguratorForm via {value, onChange}.

import {Heart} from 'lucide-react'
import {CTA_OPTIONS, LENGTH_OPTIONS, TONE_OPTIONS, type FormValue} from '@/lib/configurator/options'

interface Props {
  value: FormValue
  onChange: (next: Partial<FormValue>) => void
}

export function ToneAndCtaCard({value, onChange}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200"
          aria-hidden="true"
        >
          <Heart size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">トーン・CTA・長さを決める</h2>
          <p className="text-[11px] text-slate-500">読者体験のチューニング</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">トーン</span>
          <select
            value={value.tone}
            onChange={(e) => onChange({tone: e.target.value})}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">トーンを選択…</option>
            {TONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
                {o.hint ? ` — ${o.hint}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">CTA</span>
          <select
            value={value.cta}
            onChange={(e) => onChange({cta: e.target.value})}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">CTA を選択…</option>
            {CTA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
                {o.hint ? ` — ${o.hint}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">出力長さ</span>
          <select
            value={value.length}
            onChange={(e) => onChange({length: e.target.value})}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {LENGTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
                {o.hint ? ` — ${o.hint}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
