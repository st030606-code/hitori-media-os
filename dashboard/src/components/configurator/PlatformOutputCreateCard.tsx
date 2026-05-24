'use client'

import {useMemo, useState, useTransition} from 'react'
import {ExternalLink, FileUp, ShieldCheck, TriangleAlert} from 'lucide-react'
import {
  createPlatformOutputFromDraft,
  type CreatePlatformOutputResult,
} from '@/lib/actions/createPlatformOutputFromDraft'
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
}

type ActionResult = CreatePlatformOutputResult | null

function resultMessage(result: ActionResult): string | null {
  if (!result) return null
  return result.ok ? null : result.message
}

export function PlatformOutputCreateCard({
  job,
  selectedContentIdeaSlug,
  selectedContentIdeaTitle,
}: Props) {
  const [preview, setPreview] = useState<ActionResult>(null)
  const [executeResult, setExecuteResult] = useState<ActionResult>(null)
  const [isPending, startTransition] = useTransition()

  const hasDraft = Boolean(job?.draftMdExists)
  const isMismatch =
    Boolean(job && selectedContentIdeaSlug) && job?.contentIdeaSlug !== selectedContentIdeaSlug
  const executeDisabledReason = useMemo(() => {
    if (!selectedContentIdeaSlug) return 'Content Idea を選択してください'
    if (!job) return 'generation job を選択してください'
    if (job.contentIdeaSlug !== selectedContentIdeaSlug) {
      return '選択中のContent Ideaとgeneration jobが一致していません。'
    }
    if (!hasDraft) return '先に draft.md を保存してください'
    if (!preview?.ok) return '出力データをプレビューしてください'
    if (preview.mode === 'preview') {
      if (preview.duplicate.found) return '同じ generation job の platformOutput が既にあります'
      if (preview.missingRequiredFields.length > 0) {
        return `必須 field が不足しています: ${preview.missingRequiredFields.join(', ')}`
      }
      if (!preview.writeReady) return preview.writeDisabledReason ?? 'write is disabled'
      if (!preview.createReady) return 'create readiness check failed'
    }
    return null
  }, [hasDraft, isMismatch, job, preview, selectedContentIdeaSlug])

  const runAction = (mode: 'preview' | 'execute') => {
    if (!job || !hasDraft) return
    startTransition(async () => {
      const result = await createPlatformOutputFromDraft({
        selectedContentIdeaSlug,
        contentIdeaSlug: job.contentIdeaSlug,
        platform: job.platform,
        timestamp: job.timestamp,
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

  const shown = executeResult?.ok ? executeResult : preview?.ok ? preview : null
  const error = resultMessage(executeResult) ?? resultMessage(preview)

  return (
    <section className="rounded-lg border border-violet-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200"
            aria-hidden="true"
          >
            <FileUp size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Step 5 出力データをSanityに保存
            </h2>
            <p className="text-[11px] text-slate-500">
              保存済み `draft.md` から `platformOutput` を1件だけ作成します。platform は job.json を正にします。
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WorkflowBadge label="保存先: Sanity" tone="violet" />
              <WorkflowBadge label="プレビュー後に作成" tone="amber" />
            </div>
          </div>
        </div>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
          Phase 2C-4
        </span>
      </header>

      {!job ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          generation job を選択すると、draft.md から出力データのプレビューを作れます。
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
            <Info label="status" value={job.status} />
            <Info label="draft.md" value={job.draftMdPath} />
            <Info label="job.json" value={job.jobJsonPath} />
          </div>

          {isMismatch && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              選択中のContent Ideaとgeneration jobが一致していません。この job では platformOutput を作成できません。
            </p>
          )}

          {!hasDraft && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              この job にはまだ draft.md がありません。Step 4「AI生成結果を取り込む」で下書きを保存すると、この操作が使えます。
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction('preview')}
              disabled={!hasDraft || isMismatch || isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileUp size={13} aria-hidden="true" />
              出力データをプレビュー
            </button>
            <button
              type="button"
              onClick={() => runAction('execute')}
              disabled={Boolean(executeDisabledReason) || isPending}
              title={executeDisabledReason ?? '出力データをSanityに保存'}
              className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={13} aria-hidden="true" />
              出力データをSanityに保存
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
              {!executeResult?.ok && executeResult?.error === 'duplicate-found' && executeResult.existingId
                ? ` (${executeResult.existingId})`
                : ''}
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

          {shown && shown.mode === 'preview' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                <div className="font-semibold">出力データのプレビュー</div>
                <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <Info label="contentIdea" value={shown.platformOutputDraftSummary.sourceContentIdeaId} compact />
                  <Info label="platform" value={shown.platformOutputDraftSummary.platform} compact />
                  <Info label="outputType" value={shown.platformOutputDraftSummary.outputType} compact />
                  <Info label="status" value={shown.platformOutputDraftSummary.status} compact />
                  <Info label="body length" value={`${shown.platformOutputDraftSummary.draftBodyLength} chars / ${shown.platformOutputDraftSummary.draftBodyBytes} bytes`} compact />
                  <Info label="planned id" value={shown.plannedDocumentId} compact />
                  <Info
                    label="duplicate"
                    value={shown.duplicate.found ? `found: ${shown.duplicate.existingId}` : 'not found'}
                    compact
                  />
                  <Info
                    label="prompt ref"
                    value={shown.platformOutputDraftSummary.generatedFromPromptId ?? 'missing'}
                    compact
                  />
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Required fields
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {shown.schemaChecklist.map((item) => (
                    <span
                      key={item.field}
                      className={
                        'rounded-md px-2 py-0.5 text-[11px] ring-1 ring-inset ' +
                        (item.state === 'ready'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-amber-50 text-amber-800 ring-amber-200')
                      }
                    >
                      {item.label}: {item.state}
                    </span>
                  ))}
                </div>
              </div>

              {shown.warnings.length > 0 && (
                <Warnings warnings={shown.warnings} />
              )}
              {!shown.writeReady && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  プレビューは利用できますが、Sanity保存は無効です: {shown.writeDisabledReason}
                </p>
              )}
              {shown.duplicate.found && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  同じ draft.md の platformOutput が既にあります。Phase 2C-4 では上書きしません。
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
            </div>
          )}

          {shown && shown.mode === 'execute' && (
            <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-950">
              <div className="font-semibold">出力データをSanityに保存しました</div>
              <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                <Info label="document id" value={shown.documentId} compact />
                <Info label="platform" value={shown.platform} compact />
                <Info label="outputType" value={shown.outputType} compact />
                <Info label="status" value={shown.status} compact />
                <Info label="verified" value={shown.verified ? 'yes' : 'no'} compact />
                <a
                  href={shown.studioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-800 underline underline-offset-2"
                >
                  Studioを開く
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
              <p className="mt-2 text-[11px] text-violet-900">
                次は Studio で下書きを確認・編集します。公開管理と publishedOutput 作成は後続 phase です。
              </p>
              <div className="mt-3">
                <NextActionCard
                  tone="violet"
                  items={[
                    'StudioでplatformOutputの下書きを確認する',
                    '必要なら本文を編集する',
                    '図解が必要ならStep 6で図解案を抽出する',
                  ]}
                />
              </div>
            </div>
          )}
          <WorkflowNotice>
            この操作はSanityに書き込みます。実行前にプレビューと重複状態を確認してください。
          </WorkflowNotice>
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
    <div className="rounded-md border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-900">
      現在の対象:{' '}
      <code className="font-mono">{selectedSlug ?? '未選択'}</code>
      {selectedTitle ? <span className="ml-1 text-violet-700">/ {selectedTitle}</span> : null}
    </div>
  )
}
