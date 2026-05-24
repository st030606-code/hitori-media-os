'use client'

import {useState, useTransition} from 'react'
import {CopyButton} from '@/components/CopyButton'
import {Eye, FileCheck2, TriangleAlert} from 'lucide-react'
import {
  extractVisualBriefFromDraft,
  type ExtractVisualBriefResult,
} from '@/lib/actions/extractVisualBriefFromDraft'
import type {GenerationJobSummary} from '@/lib/generationJobs/reader'
import {
  NextActionCard,
  WorkflowBadge,
  WorkflowNotice,
} from '@/components/common/WorkflowGuide'

interface Props {
  job?: GenerationJobSummary | null
  selectedContentIdeaSlug?: string | null
  selectedContentIdeaTitle?: string | null
  onVisualBriefReady?: (job: GenerationJobSummary) => void
}

type ActionResult = ExtractVisualBriefResult | null

function resultMessage(result: ActionResult): string | null {
  if (!result) return null
  return result.ok ? null : result.message
}

export function VisualBriefExtractionCard({
  job,
  selectedContentIdeaSlug,
  selectedContentIdeaTitle,
  onVisualBriefReady,
}: Props) {
  const [preview, setPreview] = useState<ActionResult>(null)
  const [saveResult, setSaveResult] = useState<ActionResult>(null)
  const [isPending, startTransition] = useTransition()

  const hasDraft = Boolean(job?.draftMdExists)
  const isMismatch =
    Boolean(job && selectedContentIdeaSlug) && job?.contentIdeaSlug !== selectedContentIdeaSlug
  const shown = saveResult?.ok ? saveResult : preview?.ok ? preview : null
  const error = resultMessage(saveResult) ?? resultMessage(preview)
  const saveDisabledReason = (() => {
    if (!selectedContentIdeaSlug) return 'Content Idea を選択してください'
    if (!job) return 'generation job を選択してください'
    if (job.contentIdeaSlug !== selectedContentIdeaSlug) {
      return '選択中のContent Ideaとgeneration jobが一致していません。'
    }
    if (!hasDraft) return '先に draft.md を保存してください'
    if (!preview?.ok) return '図解案をプレビューしてください'
    if (preview.mode === 'preview' && !preview.visualBriefFound) return 'visual brief が見つかりません'
    if (preview.mode === 'preview' && !preview.writeReady) return preview.writeDisabledReason ?? 'write is disabled'
    return null
  })()

  const runAction = (mode: 'preview' | 'execute') => {
    if (!job || !hasDraft) return
    startTransition(async () => {
      const result = await extractVisualBriefFromDraft({
        selectedContentIdeaSlug,
        contentIdeaSlug: job.contentIdeaSlug,
        platform: job.platform,
        timestamp: job.timestamp,
        mode,
      })
      if (mode === 'preview') {
        setPreview(result)
        setSaveResult(null)
        if (result.ok && result.visualBriefFound) onVisualBriefReady?.(job)
      } else {
        setSaveResult(result)
        if (result.ok && result.mode === 'execute') {
          onVisualBriefReady?.({
            ...job,
            visualBriefMdExists: true,
            visualBriefJsonExists: Boolean(result.visualBriefJsonPath),
            updatedAtMs: Date.now(),
          })
        }
      }
    })
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <Eye size={14} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Step 6 図解案を抽出する</h2>
            <p className="text-[11px] text-slate-500">
              `draft.md` 内の図解案・画像プロンプトを分離し、visual-brief.md/json として保存します。
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WorkflowBadge label="保存先: ローカル" tone="blue" />
              <WorkflowBadge label="画像生成: なし" tone="amber" />
            </div>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
          Phase 2C-6
        </span>
      </header>

      {!job ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          draft.md を持つgeneration jobを選択すると、図解案を抽出できます。
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
            <Info label="draft.md" value={job.draftMdPath} />
            <Info label="visual-brief.md" value={job.visualBriefMdPath} />
            <Info label="visual-brief.json" value={job.visualBriefJsonPath} />
          </div>

          {isMismatch && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              選択中のContent Ideaとgeneration jobが一致していません。この job では visual brief を抽出できません。
            </p>
          )}

          {!hasDraft && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              この job にはまだ draft.md がありません。Step 4「AI生成結果を取り込む」で下書きを保存してください。
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction('preview')}
              disabled={!hasDraft || isMismatch || isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={13} aria-hidden="true" />
              図解案をプレビュー
            </button>
            <button
              type="button"
              onClick={() => runAction('execute')}
              disabled={Boolean(saveDisabledReason) || isPending}
              title={saveDisabledReason ?? '図解案を保存'}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCheck2 size={13} aria-hidden="true" />
              図解案を保存
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </p>
          )}

          {shown && !shown.visualBriefFound && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              このdraft.mdにはvisual briefが見つかりません。必要ならAIに図解案だけ再生成させて貼り付けてください。
            </p>
          )}

          {shown && shown.visualBriefFound && (
            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                <div className="font-semibold">
                  {shown.mode === 'execute' ? '図解案を保存しました' : '図解案のプレビュー'}
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <Info label="visual-brief.md" value={shown.plannedVisualBriefMdPath} compact />
                  <Info label="visual-brief.json" value={shown.plannedVisualBriefJsonPath ?? 'not detected'} compact />
                  <Info label="placement" value={shown.suggestedPlacement} compact />
                  <Info label="assetType" value={shown.suggestedAssetType} compact />
                  <Info label="aspectRatio" value={shown.suggestedAspectRatio} compact />
                  <Info label="detected fields" value={String(shown.detectedFields.length)} compact />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <CopyButton text={shown.visualBriefMarkdown} label="図解案をコピー" />
                <CopyButton text={shown.suggestedImagePrompt} label="画像プロンプトをコピー" />
              </div>

              {shown.warnings.length > 0 && <Warnings warnings={shown.warnings} />}
              <pre className="max-h-[240px] overflow-auto rounded-md bg-slate-900 px-3 py-3 text-[11px] leading-relaxed text-slate-100">
                <code className="whitespace-pre-wrap break-words font-mono">{shown.previewExcerpt}</code>
              </pre>
              {shown.mode === 'execute' && (
                <NextActionCard
                  tone="emerald"
                  items={[
                    'Step 7「図解プランをSanityに作成」でプレビューする',
                    '画像プロンプトとplacementを確認する',
                    '必要ならvisualAssetPlanとしてSanityに作成する',
                  ]}
                />
              )}
              <WorkflowNotice>
                この操作はローカルファイルに保存します。画像生成やassets/への保存は行いません。
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
    <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
      現在の対象:{' '}
      <code className="font-mono">{selectedSlug ?? '未選択'}</code>
      {selectedTitle ? <span className="ml-1 text-emerald-700">/ {selectedTitle}</span> : null}
    </div>
  )
}
