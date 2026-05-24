'use client'

import {useEffect, useMemo, useState, useTransition} from 'react'
import {ClipboardPaste, FileCheck2, RotateCcw, TriangleAlert} from 'lucide-react'
import {
  saveGeneratedOutputDraft,
  type SaveGeneratedOutputDraftResult,
} from '@/lib/actions/saveGeneratedOutputDraft'
import type {GenerationJobSummary} from '@/lib/generationJobs/reader'
import {
  NextActionCard,
  WorkflowBadge,
  WorkflowNotice,
} from '@/components/common/WorkflowGuide'

interface Props {
  recentJobs: GenerationJobSummary[]
  currentJob?: GenerationJobSummary | null
  selectedContentIdeaSlug?: string | null
  selectedContentIdeaTitle?: string | null
  onActiveJobChange?: (job: GenerationJobSummary | null) => void
  onDraftSaved?: (job: GenerationJobSummary) => void
}

type ActionResult = SaveGeneratedOutputDraftResult | null

function jobKey(job: GenerationJobSummary): string {
  return `${job.contentIdeaSlug}/${job.platform}/${job.timestamp}`
}

function statusLabel(status: GenerationJobSummary['status']): string {
  switch (status) {
    case 'structured-draft-saved':
      return '構造化下書き保存済み'
    case 'draft-markdown-saved':
      return 'markdown下書き保存済み'
    default:
      return 'パッケージのみ'
  }
}

function resultMessage(result: ActionResult): string | null {
  if (!result) return null
  return result.ok ? null : result.message
}

function mergeJobs(currentJob: GenerationJobSummary | null | undefined, recentJobs: GenerationJobSummary[]): GenerationJobSummary[] {
  if (!currentJob) return recentJobs
  const currentKey = jobKey(currentJob)
  return [currentJob, ...recentJobs.filter((job) => jobKey(job) !== currentKey)]
}

export function GeneratedOutputImportCard({
  recentJobs,
  currentJob,
  selectedContentIdeaSlug,
  selectedContentIdeaTitle,
  onActiveJobChange,
  onDraftSaved,
}: Props) {
  const jobs = useMemo(() => {
    const scoped = selectedContentIdeaSlug
      ? recentJobs.filter((job) => job.contentIdeaSlug === selectedContentIdeaSlug)
      : []
    const scopedCurrent =
      currentJob?.contentIdeaSlug === selectedContentIdeaSlug ? currentJob : null
    return mergeJobs(scopedCurrent, scoped)
  }, [currentJob, recentJobs, selectedContentIdeaSlug])
  const [selectedKey, setSelectedKey] = useState(jobs[0] ? jobKey(jobs[0]) : '')
  const [generatedOutputText, setGeneratedOutputText] = useState('')
  const [preview, setPreview] = useState<ActionResult>(null)
  const [saveResult, setSaveResult] = useState<ActionResult>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!currentJob || currentJob.contentIdeaSlug !== selectedContentIdeaSlug) return
    const nextKey = jobKey(currentJob)
    if (selectedKey === nextKey) return
    setSelectedKey(nextKey)
    setPreview(null)
    setSaveResult(null)
  }, [currentJob, selectedContentIdeaSlug, selectedKey])

  useEffect(() => {
    if (jobs.length === 0) {
      if (selectedKey) setSelectedKey('')
      return
    }
    if (!selectedKey || !jobs.some((job) => jobKey(job) === selectedKey)) {
      setSelectedKey(jobKey(jobs[0]))
    }
  }, [jobs, selectedKey])

  const selectedJob = useMemo(
    () => jobs.find((job) => jobKey(job) === selectedKey) ?? null,
    [jobs, selectedKey],
  )

  useEffect(() => {
    onActiveJobChange?.(selectedJob)
  }, [onActiveJobChange, selectedJob])

  const ready = Boolean(selectedJob) && generatedOutputText.trim().length > 0
  const isMismatch =
    Boolean(selectedJob && selectedContentIdeaSlug) &&
    selectedJob?.contentIdeaSlug !== selectedContentIdeaSlug
  const saveDisabledReason = useMemo(() => {
    if (!selectedContentIdeaSlug) return 'Content Idea を選択してください'
    if (!selectedJob) return 'generation job を選択してください'
    if (selectedJob.contentIdeaSlug !== selectedContentIdeaSlug) {
      return '選択中のContent Ideaとgeneration jobが一致していません。'
    }
    if (!generatedOutputText.trim()) return '生成結果を貼り付けてください'
    if (!preview?.ok) return '生成結果をプレビューしてください'
    if (preview.mode === 'preview' && !preview.writeReady) {
      return preview.writeDisabledReason ?? 'write is disabled'
    }
    return null
  }, [generatedOutputText, preview, selectedContentIdeaSlug, selectedJob])

  const runAction = (mode: 'preview' | 'execute') => {
    if (!selectedJob || !ready) return
    const job = selectedJob
    startTransition(async () => {
      const result = await saveGeneratedOutputDraft({
        selectedContentIdeaSlug,
        contentIdeaSlug: job.contentIdeaSlug,
        platform: job.platform,
        timestamp: job.timestamp,
        generatedOutputText,
        mode,
      })
      if (mode === 'preview') {
        setPreview(result)
        setSaveResult(null)
      } else {
        setSaveResult(result)
        if (result.ok && result.mode === 'execute') {
          const savedJob: GenerationJobSummary = {
            ...job,
            draftMdExists: true,
            draftJsonExists: Boolean(result.plannedDraftJsonPath),
            visualBriefMdExists: job.visualBriefMdExists,
            visualBriefJsonExists: job.visualBriefJsonExists,
            status: result.plannedDraftJsonPath
              ? 'structured-draft-saved'
              : 'draft-markdown-saved',
            updatedAtMs: Date.now(),
          }
          onDraftSaved?.(savedJob)
          onActiveJobChange?.(savedJob)
        }
      }
    })
  }

  const clear = () => {
    setGeneratedOutputText('')
    setPreview(null)
    setSaveResult(null)
  }

  const shown = saveResult?.ok ? saveResult : preview?.ok ? preview : null
  const error = resultMessage(saveResult) ?? resultMessage(preview)

  return (
    <section className="rounded-lg border border-blue-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <ClipboardPaste size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Step 4 AI生成結果を取り込む
            </h2>
            <p className="text-[11px] text-slate-500">
              手動生成した AI 出力を `generation-jobs/` の `draft.md` として保存します。
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WorkflowBadge label="保存先: ローカル" tone="blue" />
              <WorkflowBadge label="AI実行: 手動" tone="amber" />
            </div>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
          Phase 2C-3
        </span>
      </header>

      {jobs.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-600">
          {selectedContentIdeaSlug
            ? 'このContent Ideaに紐づくgeneration jobはまだありません。先にStep 3で生成プロンプトパッケージを作成してください。'
            : 'Content Ideaを選択すると、そのContent Ideaに紐づくgeneration jobだけを表示します。'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <ContextIndicator
            selectedSlug={selectedContentIdeaSlug}
            selectedTitle={selectedContentIdeaTitle}
          />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">対象generation job</span>
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value)
                setPreview(null)
                setSaveResult(null)
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {jobs.map((job) => (
                <option key={jobKey(job)} value={jobKey(job)}>
                  {job.contentIdeaSlug} / {job.platform} / {job.timestamp} — {statusLabel(job.status)}
                </option>
              ))}
            </select>
          </label>

          {selectedJob && (
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <Info label="job slug" value={selectedJob.contentIdeaSlug} />
              <Info label="一致状態" value={isMismatch ? '不一致' : '一致'} />
              <Info label="prompt.md" value={selectedJob.promptPath} />
              <Info label="job.json" value={selectedJob.jobJsonPath} />
              <Info label="draft.md" value={selectedJob.draftMdPath} />
              <Info label="draft.json" value={selectedJob.draftJsonPath} />
            </div>
          )}

          {isMismatch && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              選択中のContent Ideaとgeneration jobが一致していません。この job では preview / save を実行できません。
            </p>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">
              ChatGPT / Claude / Codexの生成結果
            </span>
            <textarea
              value={generatedOutputText}
              onChange={(e) => {
                setGeneratedOutputText(e.target.value)
                setPreview(null)
                setSaveResult(null)
              }}
              rows={10}
              placeholder="ここに ChatGPT / Claude / Codex が生成した Threads draft や visual-brief を貼り付けます。"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction('preview')}
              disabled={!ready || isMismatch || isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardPaste size={13} aria-hidden="true" />
              生成結果をプレビュー
            </button>
            <button
              type="button"
              onClick={() => runAction('execute')}
              disabled={Boolean(saveDisabledReason) || isPending}
              title={saveDisabledReason ?? '下書きを保存'}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCheck2 size={13} aria-hidden="true" />
              下書きを保存
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw size={13} aria-hidden="true" />
              クリア
            </button>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {error}
            </p>
          )}
          {preview?.ok && preview.mode === 'preview' && !preview.writeReady && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              プレビューは利用できますが、保存は無効です: {preview.writeDisabledReason}
            </p>
          )}

          {shown && (
            <div className="flex flex-col gap-3">
              <div
                className={
                  'rounded-md border px-3 py-2 text-xs ' +
                  (shown.mode === 'execute'
                    ? 'border-blue-200 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-slate-50 text-slate-800')
                }
              >
                <div className="font-semibold">
                  {shown.mode === 'execute' ? '下書きを保存しました' : '保存内容のプレビュー'}
                </div>
                <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <Info label="draft.md" value={shown.plannedDraftMdPath} compact />
                  <Info label="draft.json" value={shown.plannedDraftJsonPath ?? 'not detected'} compact />
                  <Info label="output kind" value={shown.detectedOutputKind} compact />
                  <Info label="sections" value={String(shown.detectedSections.length)} compact />
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  検出セクション
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {shown.detectedSections.map((section) => (
                    <span
                      key={section}
                      className="rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-inset ring-slate-200"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {shown.warnings.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <TriangleAlert size={13} aria-hidden="true" />
                    Warnings
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {shown.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <pre className="max-h-[260px] overflow-auto rounded-md bg-slate-900 px-3 py-3 text-[11px] leading-relaxed text-slate-100">
                <code className="whitespace-pre-wrap break-words font-mono">
                  {shown.previewExcerpt}
                </code>
              </pre>

              {shown.mode === 'execute' && (
                <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                  保存完了。この操作ではSanityには書き込んでいません。
                </p>
              )}
              {shown.mode === 'execute' && (
                <NextActionCard
                  tone="blue"
                  items={[
                    'Step 5「出力データをSanityに保存」でプレビューする',
                    '保存先と重複状態を確認する',
                    '問題なければplatformOutputとしてSanityに保存する',
                  ]}
                />
              )}
              <WorkflowNotice>
                このカードはローカルファイルへ保存します。Sanity書き込みはStep 5で明示的に実行します。
              </WorkflowNotice>
            </div>
          )}
        </div>
      )}
    </section>
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
    <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
      現在の対象:{' '}
      <code className="font-mono">{selectedSlug ?? '未選択'}</code>
      {selectedTitle ? <span className="ml-1 text-blue-700">/ {selectedTitle}</span> : null}
    </div>
  )
}
