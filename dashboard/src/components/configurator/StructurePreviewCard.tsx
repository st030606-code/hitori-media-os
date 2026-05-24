'use client'

// StructurePreviewCard — outline preview (序論 / 本論 / 結論 / CTA).
// Section tone follows docs/68 §4.3 (blue / purple / orange / emerald).

import {ListTree} from 'lucide-react'
import {CTA_OPTIONS, LENGTH_OPTIONS, OUTPUT_TYPE_OPTIONS, type FormValue} from '@/lib/configurator/options'

interface Props {
  form: FormValue
}

interface Section {
  key: string
  label: string
  tone: 'blue' | 'purple' | 'orange' | 'emerald'
  description: string
  bullets: number
}

const TONE: Record<Section['tone'], {bg: string; ring: string; text: string}> = {
  blue: {bg: 'bg-blue-50', ring: 'ring-blue-200', text: 'text-blue-700'},
  purple: {bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700'},
  orange: {bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-700'},
  emerald: {bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700'},
}

function bulletsForLength(length: string): number {
  switch (length) {
    case 'short':
      return 2
    case 'long':
      return 5
    case 'medium':
    case 'standard':
      return 3
    case 'deep-dive':
      return 7
    default:
      return 3
  }
}

function ctaLabel(cta: string): string {
  if (!cta || cta === 'none') return 'CTA なし — 本文だけで完結'
  const match = CTA_OPTIONS.find((o) => o.value === cta)
  return match?.label ?? cta
}

export function StructurePreviewCard({form}: Props) {
  const outputTypeLabel = OUTPUT_TYPE_OPTIONS.find((o) => o.value === form.outputType)?.label
  const lengthLabel = LENGTH_OPTIONS.find((o) => o.value === form.length)?.label
  const body = bulletsForLength(form.length)

  const sections: Section[] = [
    {
      key: 'intro',
      label: '序論',
      tone: 'blue',
      description: '読者の状況と扱う問題を 1 段落で示す',
      bullets: 1,
    },
    {
      key: 'body',
      label: '本論',
      tone: 'purple',
      description: outputTypeLabel
        ? `${outputTypeLabel} の構造で主張・具体例・反論を展開`
        : '主張・具体例・反論を展開',
      bullets: body,
    },
    {
      key: 'conclusion',
      label: '結論',
      tone: 'orange',
      description: lengthLabel ? `${lengthLabel} に合わせて主張を要約` : '主張を要約',
      bullets: 1,
    },
    {
      key: 'cta',
      label: 'CTA',
      tone: 'emerald',
      description: ctaLabel(form.cta),
      bullets: 1,
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
          aria-hidden="true"
        >
          <ListTree size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">構造プレビュー</h2>
          <p className="text-[11px] text-slate-500">下書きの想定セクション</p>
        </div>
      </header>

      <ol className="flex flex-col gap-2">
        {sections.map((s) => {
          const tone = TONE[s.tone]
          return (
            <li
              key={s.key}
              className={`flex items-start gap-3 rounded-md ${tone.bg} px-3 py-2 ring-1 ring-inset ${tone.ring}`}
            >
              <span
                className={`mt-0.5 inline-flex shrink-0 items-center rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.text} ring-1 ring-inset ${tone.ring}`}
              >
                {s.label}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">{s.description}</p>
                <p className={`mt-0.5 text-[11px] ${tone.text}`}>
                  想定 bullet 数: <span className="font-semibold tabular-nums">{s.bullets}</span>
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
