import type {ReactNode} from 'react'

type BadgeTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'violet' | 'teal'

const BADGE_TONE: Record<BadgeTone, string> = {
  slate: 'bg-slate-50 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
}

interface WorkflowBadgeProps {
  label: string
  tone?: BadgeTone
}

export function WorkflowBadge({label, tone = 'slate'}: WorkflowBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${BADGE_TONE[tone]}`}
    >
      {label}
    </span>
  )
}

interface WorkflowStepHeaderProps {
  step: string
  title: string
  description: string
  badges?: WorkflowBadgeProps[]
  icon?: ReactNode
}

export function WorkflowStepHeader({
  step,
  title,
  description,
  badges = [],
  icon,
}: WorkflowStepHeaderProps) {
  return (
    <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-2">
        {icon}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Step {step}
          </div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
      </div>
      {badges.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {badges.map((badge) => (
            <WorkflowBadge key={badge.label} {...badge} />
          ))}
        </div>
      )}
    </header>
  )
}

interface NextActionCardProps {
  title?: string
  items: string[]
  tone?: 'blue' | 'emerald' | 'violet' | 'teal'
}

const NEXT_ACTION_TONE: Record<NonNullable<NextActionCardProps['tone']>, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  violet: 'border-violet-200 bg-violet-50 text-violet-950',
  teal: 'border-teal-200 bg-teal-50 text-teal-950',
}

export function NextActionCard({
  title = '次にやること',
  items,
  tone = 'blue',
}: NextActionCardProps) {
  return (
    <div className={`rounded-md border px-3 py-2 text-xs ${NEXT_ACTION_TONE[tone]}`}>
      <p className="font-semibold">{title}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  )
}

interface WorkflowNoticeProps {
  children: ReactNode
  tone?: 'amber' | 'blue' | 'slate'
}

const NOTICE_TONE: Record<NonNullable<WorkflowNoticeProps['tone']>, string> = {
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function WorkflowNotice({children, tone = 'slate'}: WorkflowNoticeProps) {
  return (
    <p className={`rounded-md border px-3 py-2 text-xs ${NOTICE_TONE[tone]}`}>
      {children}
    </p>
  )
}
