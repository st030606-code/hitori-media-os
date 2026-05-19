// Static Working Pipeline state for the building-hitori-media-os campaign.
// This is a Phase 1 boss-facing summary: it reflects the technical readiness
// established by Step A–G handoffs (2026-05-18). The values are intentionally
// not derived from the dataset — they are the human-confirmed Working Pipeline
// completion state so the boss sees it at a glance without depending on Sanity
// query latency.

type StepState = 'done' | 'pending'

interface Step {
  label: string
  state: StepState
  detail?: string
}

const STEPS: Step[] = [
  {label: '画像・図解生成', state: 'done', detail: 'Step A–B 完了 (7 saved / 2 skipped)'},
  {label: 'Visual Register / recovery', state: 'done', detail: 'Step D recovery 完了'},
  {label: 'Sanity反映', state: 'done', detail: 'Step E atomic transaction 完了'},
  {label: '配布パッケージ作成', state: 'done', detail: 'Step F、7 ファイル配布済み'},
  {label: '公開前レビュー', state: 'done', detail: 'Step G、5 ファイル更新済み'},
  {label: '最終公開判断', state: 'pending', detail: 'ボス確認待ち'},
]

function stateBadge(state: StepState): {label: string; classes: string} {
  if (state === 'done') {
    return {
      label: '完了',
      classes: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300',
    }
  }
  return {
    label: 'ボス確認待ち',
    classes: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300',
  }
}

export function WorkingPipelineStatus() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">Working Pipeline 進捗</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          building-hitori-media-os キャンペーンの 1 周完走状況（2026-05-18 時点）。
        </p>
      </header>
      <ol className="space-y-2">
        {STEPS.map((s) => {
          const badge = stateBadge(s.state)
          return (
            <li
              key={s.label}
              className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium text-slate-900">{s.label}</span>
                {s.detail && <span className="text-xs text-slate-500">{s.detail}</span>}
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.classes}`}
              >
                {badge.label}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
