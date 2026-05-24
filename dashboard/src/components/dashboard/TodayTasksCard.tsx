// TodayTasksCard — read-only checklist of priority actions for the boss.
//
// Phase UI-fidelity-3 polish:
//   - dueLabel moved to the right edge of the title row so the boss can scan
//     a vertical column of times instead of zig-zagging
//   - tabular-nums applied to the dueLabel for clean time alignment when the
//     string is "今日 10:00" / "2026-05-19 09:38" etc.
//   - subtle priority dot replaces the AlertCircle when a task isn't completed,
//     reducing the warning-heavy feel from UI-2.5

import Link from 'next/link'
import {CheckCircle2} from 'lucide-react'

export interface TaskItem {
  id: string
  title: string
  dueLabel?: string
  href?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}

interface Props {
  tasks: TaskItem[]
}

const PRIORITY_DOT_CLASS: Record<'low' | 'medium' | 'high', string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-300',
}

const PRIORITY_TEXT_CLASS: Record<'low' | 'medium' | 'high', string> = {
  high: 'text-rose-700',
  medium: 'text-amber-700',
  low: 'text-slate-600',
}

export function TodayTasksCard({tasks}: Props) {
  const completedCount = tasks.filter((t) => t.completed).length
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">今日のタスク</h2>
        <span className="text-[11px] tabular-nums text-slate-500">
          完了 {completedCount} / {tasks.length}
        </span>
      </header>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">今日対応すべきタスクはありません。</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {tasks.map((t) => {
            const priority = t.priority ?? 'low'
            const Wrapper = ({children}: {children: React.ReactNode}) =>
              t.href ? (
                <Link
                  href={t.href}
                  className="flex items-start gap-2.5 rounded-md p-1.5 -m-1.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  {children}
                </Link>
              ) : (
                <div className="flex items-start gap-2.5 p-1.5 -m-1.5">{children}</div>
              )
            return (
              <li key={t.id}>
                <Wrapper>
                  {t.completed ? (
                    <CheckCircle2
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={
                        'mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-white ' +
                        PRIORITY_DOT_CLASS[priority]
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={
                          (t.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-900') + ' text-sm'
                        }
                      >
                        {t.title}
                      </span>
                      {t.dueLabel && (
                        <span
                          className={
                            'shrink-0 text-[11px] tabular-nums ' +
                            (t.completed
                              ? 'text-slate-400'
                              : PRIORITY_TEXT_CLASS[priority])
                          }
                        >
                          {t.dueLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
