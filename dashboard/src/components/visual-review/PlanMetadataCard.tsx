// PlanMetadataCard — collapsible dl/dt/dd for the full visualAssetPlan record.
// imagePrompt is large, so the prompt + textToInclude / textToAvoid /
// visualDirection are rendered under a native <details> element. No client
// state, fully Server-Component-safe.

import {Layers} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {statusLabelJa} from '@/lib/statusJa'
import type {VisualAssetPlanDetail} from '@/lib/groq/campaign'

interface Props {
  plan: VisualAssetPlanDetail
}

function fallback(s?: string | null): string {
  return s && s.length > 0 ? s : '—'
}

function joinList(arr?: string[] | null): string {
  if (!arr || arr.length === 0) return '—'
  return arr.join(' / ')
}

export function PlanMetadataCard({plan}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
            aria-hidden="true"
          >
            <Layers size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">アセット詳細</h2>
            <p className="text-[11px] text-slate-500">visualAssetPlan の全フィールド</p>
          </div>
        </div>
        <StatusBadge state={plan.status} label={statusLabelJa(plan.status)} />
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <Pair label="タイトル" value={fallback(plan.title)} />
        <Pair label="slug" value={<code className="break-all text-xs">{fallback(plan.slug)}</code>} />
        <Pair
          label="媒体"
          value={
            plan.targetPlatform ? (
              <span className="inline-flex items-center gap-1.5">
                <PlatformBadge platform={plan.targetPlatform} />
                <span>{platformLabel(plan.targetPlatform)}</span>
              </span>
            ) : (
              '—'
            )
          }
        />
        <Pair label="タイプ" value={fallback(plan.assetType)} />
        <Pair label="配置" value={fallback(plan.placement)} />
        <Pair label="アスペクト比" value={fallback(plan.aspectRatio)} />
        <Pair label="再利用ポリシー" value={fallback(plan.reusePolicy)} />
        <Pair label="生成モード" value={fallback(plan.generationMode)} />
        <Pair label="生成プロバイダ" value={fallback(plan.generationProvider)} />
        <Pair label="ソースプロンプト版" value={fallback(plan.sourcePromptVersion)} />
        <Pair label="textToInclude" value={joinList(plan.textToInclude)} />
        <Pair label="textToAvoid" value={joinList(plan.textToAvoid)} />
      </dl>

      {(plan.imagePrompt || plan.visualDirection || plan.reviewNotes) && (
        <details className="mt-4 rounded-md border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
            プロンプト本文 / 視覚指示 / レビューメモを開く
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {plan.visualDirection && (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  visualDirection
                </div>
                <p className="mt-1 whitespace-pre-line">{plan.visualDirection}</p>
              </div>
            )}
            {plan.imagePrompt && (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  imagePrompt
                </div>
                <pre className="mt-1 max-h-[320px] overflow-auto rounded bg-white px-3 py-2 text-[12px] leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-200">
                  <code className="whitespace-pre-wrap break-words font-mono">{plan.imagePrompt}</code>
                </pre>
              </div>
            )}
            {plan.reviewNotes && (
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  reviewNotes
                </div>
                <p className="mt-1 whitespace-pre-line">{plan.reviewNotes}</p>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  )
}

function Pair({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}
