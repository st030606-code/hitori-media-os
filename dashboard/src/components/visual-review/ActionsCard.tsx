// ActionsCard — primary Visual Register CTA + Phase 2B placeholder buttons.
// Used on both /visual-assets/[assetId] and inside CandidateFocusLayout. The
// labels and tooltips are configurable so the candidates page can show
// candidate-specific verbs ("採用する") while the asset page shows asset-level
// ones ("再生成プロンプトを編集").

import {ExternalLink} from 'lucide-react'
import {DeferredActionButton} from './DeferredActionButton'

export interface DeferredAction {
  label: string
  tooltip: string
  phase?: '2B' | '2C' | '2D'
}

interface Props {
  visualRegisterUrl?: string
  visualRegisterLabel?: string
  deferred: DeferredAction[]
  // Optional banner showing the Codex-recommended candidate id.
  recommendedCandidateId?: string | null
  // Short hint shown under the primary CTA.
  helperText?: string
}

const DEFAULT_URL = 'http://localhost:3334'
const DEFAULT_HELPER =
  'Phase 2B で dashboard 内から approve & register を実行できるようになります。'

export function ActionsCard({
  visualRegisterUrl = DEFAULT_URL,
  visualRegisterLabel = 'Visual Register で承認',
  deferred,
  recommendedCandidateId,
  helperText = DEFAULT_HELPER,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">承認アクション</h2>
          <p className="text-[11px] text-slate-500">
            書き込みは Visual Register で実行します
          </p>
        </div>
        {recommendedCandidateId && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
            推奨: {recommendedCandidateId}
          </span>
        )}
      </header>
      <a
        href={visualRegisterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        {visualRegisterLabel}
        <ExternalLink size={12} aria-hidden="true" />
      </a>
      <div className="mt-3 flex flex-wrap gap-2">
        {deferred.map((d, i) => (
          <DeferredActionButton
            key={i}
            label={d.label}
            phase={d.phase ?? '2B'}
            tooltip={d.tooltip}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">{helperText}</p>
    </section>
  )
}
