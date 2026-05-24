'use client'

import {useState, useTransition} from 'react'
import {CopyButton} from '@/components/CopyButton'
import {ExternalLink, ImagePlus, ShieldCheck, TriangleAlert} from 'lucide-react'
import {
  createVisualAssetPlanFromBrief,
  type CreateVisualAssetPlanResult,
} from '@/lib/actions/createVisualAssetPlanFromBrief'
import type {GenerationJobSummary} from '@/lib/generationJobs/reader'
import {
  NextActionCard,
  WorkflowBadge,
  WorkflowNotice,
} from '@/components/common/WorkflowGuide'

interface Props {
  job?: GenerationJobSummary | null
  visualBriefReady?: boolean
  selectedContentIdeaSlug?: string | null
  selectedContentIdeaTitle?: string | null
}

type ActionResult = CreateVisualAssetPlanResult | null

const ASSET_TYPES = [
  'section-diagram',
  'hook-image',
  'thumbnail',
  'comparison-diagram',
  'flow-diagram',
  'architecture-diagram',
  'carousel-cover',
  'eye-catch',
]

const ASPECT_RATIOS = ['16:9', '1:1', '4:5', '9:16']

function resultMessage(result: ActionResult): string | null {
  if (!result) return null
  return result.ok ? null : result.message
}

export function VisualAssetPlanCreateCard({
  job,
  visualBriefReady,
  selectedContentIdeaSlug,
  selectedContentIdeaTitle,
}: Props) {
  const [placement, setPlacement] = useState('')
  const [assetType, setAssetType] = useState('')
  const [aspectRatio, setAspectRatio] = useState('')
  const [preview, setPreview] = useState<ActionResult>(null)
  const [executeResult, setExecuteResult] = useState<ActionResult>(null)
  const [isPending, startTransition] = useTransition()

  const hasDraft = Boolean(job?.draftMdExists)
  const canUseBrief = Boolean(job?.visualBriefMdExists || visualBriefReady)
  const isMismatch =
    Boolean(job && selectedContentIdeaSlug) && job?.contentIdeaSlug !== selectedContentIdeaSlug
  const shown = executeResult?.ok ? executeResult : preview?.ok ? preview : null
  const error = resultMessage(executeResult) ?? resultMessage(preview)
  const executeDisabledReason = (() => {
    if (!selectedContentIdeaSlug) return 'Content Idea を選択してください'
    if (!job) return 'generation job を選択してください'
    if (job.contentIdeaSlug !== selectedContentIdeaSlug) {
      return '選択中のContent Ideaとgeneration jobが一致していません。'
    }
    if (!hasDraft) return '先に draft.md を保存してください'
    if (!canUseBrief) return '先に図解案をプレビューまたは保存してください'
    if (!preview?.ok) return '図解プランをプレビューしてください'
    if (preview.mode === 'preview') {
      if (preview.duplicate.found) return '同じ placement の visualAssetPlan が既にあります'
      if (preview.missingRequiredFields.length > 0) {
        return `必須 field が不足しています: ${preview.missingRequiredFields.join(', ')}`
      }
      if (!preview.writeReady) return preview.writeDisabledReason ?? 'write is disabled'
      if (!preview.createReady) return 'create readiness check failed'
    }
    return null
  })()

  const runAction = (mode: 'preview' | 'execute') => {
    if (!job || !hasDraft || !canUseBrief) return
    startTransition(async () => {
      const result = await createVisualAssetPlanFromBrief({
        selectedContentIdeaSlug,
        contentIdeaSlug: job.contentIdeaSlug,
        platform: job.platform,
        timestamp: job.timestamp,
        placement: placement || undefined,
        assetType: assetType || undefined,
        aspectRatio: aspectRatio || undefined,
        mode,
      })
      if (mode === 'preview') {
        setPreview(result)
        setExecuteResult(null)
      } else {
        setExecuteResult(result)
      }
    })
  }

  return (
    <section className="rounded-lg border border-teal-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200">
            <ImagePlus size={14} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Step 7 図解プランをSanityに作成
            </h2>
            <p className="text-[11px] text-slate-500">
              visual brief から visualAssetPlan を1件作成します。画像生成と asset 保存は行いません。
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WorkflowBadge label="保存先: Sanity" tone="teal" />
              <WorkflowBadge label="画像生成: なし" tone="amber" />
              <WorkflowBadge label="プレビュー後に作成" tone="amber" />
            </div>
          </div>
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
          Phase 2C-6
        </span>
      </header>

      {!job ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          図解案を持つgeneration jobを選択すると、図解プランのプレビューを作れます。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <ContextIndicator
            selectedSlug={selectedContentIdeaSlug}
            selectedTitle={selectedContentIdeaTitle}
          />
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <Info label="selected job" value={`${job.contentIdeaSlug} / ${job.platform} / ${job.timestamp}`} />
            <Info label="一致状態" value={isMismatch ? '不一致' : '一致'} />
            <Info label="visual-brief.md" value={job.visualBriefMdPath} />
            <Info label="draft.md" value={job.draftMdPath} />
            <Info label="status" value={canUseBrief ? 'visual brief ready' : 'visual brief not ready'} />
          </div>

          {isMismatch && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              選択中のContent Ideaとgeneration jobが一致していません。この job では visualAssetPlan を作成できません。
            </p>
          )}

          {!canUseBrief && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              先にStep 6「図解案を抽出する」でプレビューまたは保存を実行してください。
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-slate-600">placement上書き</span>
              <input
                value={placement}
                onChange={(e) => {
                  setPlacement(e.target.value)
                  setPreview(null)
                  setExecuteResult(null)
                }}
                placeholder="auto"
                className="h-9 rounded-md border border-slate-200 px-2 text-xs"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-slate-600">assetType</span>
              <select
                value={assetType}
                onChange={(e) => {
                  setAssetType(e.target.value)
                  setPreview(null)
                  setExecuteResult(null)
                }}
                className="h-9 rounded-md border border-slate-200 px-2 text-xs"
              >
                <option value="">auto</option>
                {ASSET_TYPES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-slate-600">aspectRatio</span>
              <select
                value={aspectRatio}
                onChange={(e) => {
                  setAspectRatio(e.target.value)
                  setPreview(null)
                  setExecuteResult(null)
                }}
                className="h-9 rounded-md border border-slate-200 px-2 text-xs"
              >
                <option value="">auto</option>
                {ASPECT_RATIOS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction('preview')}
              disabled={!hasDraft || !canUseBrief || isMismatch || isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus size={13} aria-hidden="true" />
              図解プランをプレビュー
            </button>
            <button
              type="button"
              onClick={() => runAction('execute')}
              disabled={Boolean(executeDisabledReason) || isPending}
              title={executeDisabledReason ?? '図解プランをSanityに作成'}
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={13} aria-hidden="true" />
              図解プランをSanityに作成
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
              {!executeResult?.ok &&
                executeResult?.error === 'duplicate-found' &&
                executeResult.existingStudioUrl && (
                  <a
                    href={executeResult.existingStudioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 font-medium underline underline-offset-2"
                  >
                    Studioで開く
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
            </p>
          )}

          {shown && (
            <div className="flex flex-col gap-3">
              <div
                className={
                  'rounded-md border px-3 py-2 text-xs ' +
                  (shown.mode === 'execute'
                    ? 'border-teal-200 bg-teal-50 text-teal-950'
                    : 'border-slate-200 bg-slate-50 text-slate-800')
                }
              >
                <div className="font-semibold">
                  {shown.mode === 'execute' ? '図解プランを作成しました' : '図解プランのプレビュー'}
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <Info label="document id" value={shown.mode === 'execute' ? shown.documentId : shown.plannedDocumentId} compact />
                  <Info label="contentIdea" value={shown.summary.sourceContentIdeaId} compact />
                  <Info label="platformOutput" value={shown.summary.pairedPlatformOutputId ?? 'not resolved'} compact />
                  <Info label="platform" value={shown.summary.targetPlatform} compact />
                  <Info label="placement" value={shown.summary.placement} compact />
                  <Info label="assetType" value={shown.summary.assetType} compact />
                  <Info label="aspectRatio" value={shown.summary.aspectRatio} compact />
                  <Info label="status" value={shown.summary.status} compact />
                </div>
              </div>

              {shown.mode === 'preview' && shown.duplicate.found && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  同じ placement の visualAssetPlan が既にあります。Phase 2C-6 では上書きしません。
                  {shown.duplicate.existingStudioUrl && (
                    <a
                      href={shown.duplicate.existingStudioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-1 font-medium underline underline-offset-2"
                    >
                      既存docを開く
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </p>
              )}

              {'warnings' in shown && shown.warnings.length > 0 && (
                <Warnings warnings={shown.warnings} />
              )}
              <div className="flex flex-wrap gap-2">
                <CopyButton text={shown.imagePrompt} label="画像プロンプトをコピー" />
                <a
                  href={shown.mode === 'execute' ? shown.studioUrl : shown.studioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  Studioを開く
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
              <pre className="max-h-[220px] overflow-auto rounded-md bg-slate-900 px-3 py-3 text-[11px] leading-relaxed text-slate-100">
                <code className="whitespace-pre-wrap break-words font-mono">
                  {shown.summary.imagePromptPreview}
                </code>
              </pre>
              {shown.mode === 'execute' && (
                <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
                  作成完了。次は手動で画像候補を生成し、Visual Review / Visual Register flow で保存・反映します。
                </p>
              )}
              {shown.mode === 'execute' && (
                <NextActionCard
                  tone="teal"
                  items={[
                    '画像プロンプトをコピーする',
                    '外部の画像生成ツールで手動生成する',
                    '候補画像は後続のVisual Review / Visual Register flowで扱う',
                  ]}
                />
              )}
              <WorkflowNotice>
                この操作はSanityにvisualAssetPlanを作成します。画像ファイルは作成せず、assets/にも書き込みません。
              </WorkflowNotice>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function Warnings({warnings}: {warnings: string[]}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <div className="flex items-center gap-1.5 font-semibold">
        <TriangleAlert size={13} aria-hidden="true" />
        Warnings
      </div>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  )
}

function Info({label, value, compact}: {label: string; value: string; compact?: boolean}) {
  return (
    <div className={compact ? '' : 'rounded-md border border-slate-200 bg-slate-50 px-3 py-2'}>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <code className="mt-0.5 block break-words font-mono text-[11px] text-slate-900">{value}</code>
    </div>
  )
}

function ContextIndicator({
  selectedSlug,
  selectedTitle,
}: {
  selectedSlug?: string | null
  selectedTitle?: string | null
}) {
  return (
    <div className="rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-900">
      現在の対象:{' '}
      <code className="font-mono">{selectedSlug ?? '未選択'}</code>
      {selectedTitle ? <span className="ml-1 text-teal-700">/ {selectedTitle}</span> : null}
    </div>
  )
}
