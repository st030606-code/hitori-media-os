// LocalDevCard — quick reference of the npm commands the boss runs locally
// and shortcuts to other dev-only utility pages.
//
// The /diagnostics shortcut is gated by the ENABLE_DIAGNOSTICS flag (Codex
// review B3): linking when off would guarantee a 404, so we render the row
// as a disabled label instead.

import Link from 'next/link'
import {ChevronRight, Terminal} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'

interface Props {
  enableDiagnostics: boolean
}

interface CommandRow {
  label: string
  command: string
  note?: string
}

const COMMANDS: CommandRow[] = [
  {label: 'dashboard 起動', command: 'cd dashboard && npm run dev', note: 'localhost:3000'},
  {label: 'Sanity Studio 起動', command: 'npm run dev', note: 'localhost:3333'},
  {label: 'Visual Register 起動', command: 'npm run visual:register', note: 'localhost:3334'},
  {
    label: 'Activity Log snapshot を再生成',
    command: 'cd dashboard && npm run build:activity-snapshot',
  },
  {label: 'local check', command: 'npm run local:check', note: '/diagnostics と同じ JSON'},
]

interface ShortcutRow {
  label: string
  href: string
  hint: string
  // When false, render as a disabled label. When omitted/true the row is a
  // normal link.
  enabled?: boolean
  disabledHint?: string
}

export function LocalDevCard({enableDiagnostics}: Props) {
  const shortcuts: ShortcutRow[] = [
    {
      label: '診断',
      href: '/diagnostics',
      hint: 'local:check の結果',
      enabled: enableDiagnostics,
      disabledHint: 'ENABLE_DIAGNOSTICS off のため /diagnostics は 404',
    },
    {label: '作業ログ', href: '/activity-log', hint: 'devlog / handoff の最新'},
    {label: '公開パッケージ一覧', href: '/publish-packages', hint: 'fs walk of publish-packages/'},
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
          aria-hidden="true"
        >
          <Terminal size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">ローカル開発</h2>
          <p className="text-[11px] text-slate-500">起動コマンドと dev-only リンク</p>
        </div>
      </header>

      <ul className="mb-4 flex flex-col gap-1.5">
        {COMMANDS.map((c) => (
          <li key={c.command} className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="w-40 shrink-0 text-slate-600">{c.label}</span>
            <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-800 ring-1 ring-inset ring-slate-200">
              {c.command}
            </code>
            <CopyButton text={c.command} label="copy" />
            {c.note && <span className="text-slate-400">{c.note}</span>}
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 pt-3">
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          ショートカット
        </div>
        <ul className="flex flex-col">
          {shortcuts.map((s) => {
            const active = s.enabled === undefined || s.enabled
            if (active) {
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <span>
                      <span className="font-medium">{s.label}</span>
                      <span className="ml-2 text-[11px] text-slate-500">{s.hint}</span>
                    </span>
                    <ChevronRight size={12} className="text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              )
            }
            return (
              <li key={s.href}>
                <span
                  aria-disabled="true"
                  title={s.disabledHint ?? '現在無効です'}
                  className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400"
                >
                  <span>
                    <span className="font-medium">{s.label}</span>
                    <span className="ml-2 text-[11px] text-slate-400">
                      {s.disabledHint ?? s.hint}
                    </span>
                  </span>
                  <ChevronRight size={12} className="text-slate-300" aria-hidden="true" />
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
