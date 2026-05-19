// Boss-facing next action panel for the pre-publish phase.
// Read-only — checklist state is not persisted; the boss tracks it in the
// final-human-checklist.md file.

const STEPS: Array<{step: number; text: string}> = [
  {step: 1, text: 'final-human-checklist.md を確認'},
  {step: 2, text: 'X / Threads / note / Substack の最終レビューを確認'},
  {step: 3, text: '公開予定日を記入'},
  {step: 4, text: '各媒体で手動公開'},
  {step: 5, text: 'Published URL / Reaction Notes を記録'},
]

export function NextActionChecklist() {
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-amber-950">次にやること（ボス）</h2>
        <p className="mt-0.5 text-xs text-amber-900">
          公開前の最終ステップ。順番に進めてください。
        </p>
      </header>
      <ol className="space-y-1.5 text-sm text-amber-950">
        {STEPS.map((s) => (
          <li key={s.step} className="flex gap-2">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold">
              {s.step}
            </span>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
