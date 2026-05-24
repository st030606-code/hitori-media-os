// RiskCheckCard — right sidebar "リスクチェック" card.
// Phase UI-fidelity-4: static check items, all marked green by default
// (the campaign has passed Pre-Publish Review which verified no leaks).
// Phase UI-7+ will wire these to release-review's Safety Reaffirmation
// section for dynamic evaluation.

import {ShieldCheck, CheckCircle2, AlertCircle} from 'lucide-react'

export type RiskState = 'pass' | 'warn' | 'unknown'

export interface RiskCheckItem {
  key: string
  label: string
  hint?: string
  state: RiskState
}

const DEFAULT_ITEMS: RiskCheckItem[] = [
  {
    key: 'internal-info',
    label: '内部情報の漏出なし',
    hint: '.env / project ID / dataset 名 / API トークン',
    state: 'pass',
  },
  {
    key: 'paid-pdf',
    label: '有料 PDF の引用なし',
    hint: '購入教材本文を draft に混入させていない',
    state: 'pass',
  },
  {
    key: 'auto-post',
    label: '自動投稿なし',
    hint: 'Platform API を呼ばない / scheduling 機構なし',
    state: 'pass',
  },
  {
    key: 'personal-info',
    label: '個人情報の表示なし',
    hint: 'subscriber email / 購入者氏名 / 私的連絡先',
    state: 'pass',
  },
  {
    key: 'ai-clone-voice',
    label: 'AI クローン音声 / アバター未使用',
    hint: '本人承認 / 権利確認まで保留',
    state: 'pass',
  },
]

interface Props {
  items?: RiskCheckItem[]
}

const STATE_STYLE: Record<RiskState, {icon: typeof CheckCircle2; color: string; bg: string; ring: string}> = {
  pass: {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
  },
  warn: {
    icon: AlertCircle,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
  },
  unknown: {
    icon: AlertCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    ring: 'ring-slate-200',
  },
}

export function RiskCheckCard({items = DEFAULT_ITEMS}: Props) {
  const passCount = items.filter((i) => i.state === 'pass').length
  const warnCount = items.filter((i) => i.state === 'warn').length
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
            aria-hidden="true"
          >
            <ShieldCheck size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">リスクチェック</h2>
            <p className="text-[11px] text-slate-500">公開前の確認項目</p>
          </div>
        </div>
        <span className="text-[11px] tabular-nums text-slate-500">
          ✓ {passCount}
          {warnCount > 0 && <span className="text-amber-700"> / ⚠ {warnCount}</span>}
        </span>
      </header>
      <ul className="space-y-1.5">
        {items.map((it) => {
          const style = STATE_STYLE[it.state]
          const Icon = style.icon
          return (
            <li
              key={it.key}
              className={`flex items-start gap-2 rounded-md p-2 ring-1 ring-inset ${style.bg} ${style.ring}`}
            >
              <Icon size={14} aria-hidden="true" className={`mt-0.5 shrink-0 ${style.color}`} />
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-medium ${style.color}`}>{it.label}</div>
                {it.hint && <div className="mt-0.5 text-[10px] text-slate-600">{it.hint}</div>}
              </div>
            </li>
          )
        })}
      </ul>
      <footer className="mt-3 text-[10px] text-slate-500">
        Phase UI-7+ で release-review の Safety Reaffirmation と連動予定。
      </footer>
    </section>
  )
}
