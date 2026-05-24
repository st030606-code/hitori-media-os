'use client'

import {useMemo, useState, useTransition} from 'react'
import {FileCode2, PackageCheck, TriangleAlert} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'
import {
  NextActionCard,
  WorkflowBadge,
  WorkflowNotice,
} from '@/components/common/WorkflowGuide'
import {
  createGenerationPromptPackage,
  type CreateGenerationPromptPackageResult,
} from '@/lib/actions/createGenerationPromptPackage'
import type {ContentIdeaOption} from '@/lib/groq/configurator'
import type {FormValue} from '@/lib/configurator/options'
import type {GenerationJobSummary} from '@/lib/generationJobs/reader'

interface Props {
  form: FormValue
  contentIdea?: ContentIdeaOption | null
  onPackageCreated?: (job: GenerationJobSummary) => void
}

type ActionResult = CreateGenerationPromptPackageResult | null

function resultMessage(result: ActionResult): string | null {
  if (!result) return null
  if (result.ok) return null
  return result.message
}

function primaryPlatform(platforms: string[]): string {
  return platforms[0] ?? ''
}

function generationJobFromExecuteResult(
  result: Extract<CreateGenerationPromptPackageResult, {ok: true; mode: 'execute'}>,
): GenerationJobSummary {
  return {
    contentIdeaSlug: result.contentIdeaSlug,
    platform: result.platform,
    timestamp: result.timestamp,
    promptExists: true,
    jobJsonExists: true,
    draftMdExists: false,
    draftJsonExists: false,
    visualBriefMdExists: false,
    visualBriefJsonExists: false,
    status: 'package-only',
    promptPath: result.promptPath,
    jobJsonPath: result.jobJsonPath,
    draftMdPath: result.expectedDraftMdPath,
    draftJsonPath: result.expectedDraftJsonPath,
    visualBriefMdPath: result.expectedDraftMdPath.replace(/draft\.md$/, 'visual-brief.md'),
    visualBriefJsonPath: result.expectedDraftJsonPath.replace(/draft\.json$/, 'visual-brief.json'),
    updatedAtMs: Date.now(),
    jobMetadata: null,
  }
}

export function GenerationPackageCard({form, contentIdea, onPackageCreated}: Props) {
  const [preview, setPreview] = useState<ActionResult>(null)
  const [executeResult, setExecuteResult] = useState<ActionResult>(null)
  const [isPending, startTransition] = useTransition()

  const platform = primaryPlatform(form.platforms)
  const ready =
    Boolean(form.contentIdeaId) &&
    Boolean(platform) &&
    Boolean(form.outputType) &&
    Boolean(form.purpose)

  const plannedTimestamp = preview?.ok ? preview.timestamp : undefined
  const executeDisabledReason = useMemo(() => {
    if (!ready) return 'contentIdea / platform / outputType / purpose を選択してください'
    if (!preview?.ok) return '生成プロンプトをプレビューしてください'
    if (preview.mode === 'preview' && !preview.writeReady) {
      return preview.writeDisabledReason ?? 'write is disabled'
    }
    return null
  }, [preview, ready])

  const runAction = (mode: 'preview' | 'execute') => {
    if (!ready) return
    startTransition(async () => {
      const result = await createGenerationPromptPackage({
        contentIdeaId: form.contentIdeaId,
        platform,
        outputType: form.outputType,
        purpose: form.purpose,
        tone: form.tone,
        cta: form.cta,
        outputLength: form.length,
        visualPreference: form.visualPreference,
        additionalInstructions: form.additionalInstructions,
        plannedTimestamp: mode === 'execute' ? plannedTimestamp : undefined,
        mode,
      })
      if (mode === 'preview') {
        setPreview(result)
        setExecuteResult(null)
      } else {
        setExecuteResult(result)
        if (result.ok && result.mode === 'execute') {
          onPackageCreated?.(generationJobFromExecuteResult(result))
        }
      }
    })
  }

  const shown = executeResult?.ok ? executeResult : preview?.ok ? preview : null
  const error = resultMessage(executeResult) ?? resultMessage(preview)
  const selectedTitle = contentIdea?.title ?? '(未選択)'
  const multiplePlatformHint =
    form.platforms.length > 1
      ? `複数 platform が選択されています。Phase 2C-2 package は先頭の ${platform} だけを作成します。`
      : null

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
            aria-hidden="true"
          >
            <PackageCheck size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Step 3 生成プロンプトパッケージ
            </h2>
            <p className="text-[11px] text-slate-500">
              Content Ideaから `generation-jobs/` に no-API生成パッケージを作ります。
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WorkflowBadge label="保存先: ローカル" tone="blue" />
              <WorkflowBadge label="AI実行: 手動" tone="amber" />
              <WorkflowBadge label="API: 未使用" tone="amber" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction('preview')}
            disabled={!ready || isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileCode2 size={13} aria-hidden="true" />
            生成プロンプトをプレビュー
          </button>
          <button
            type="button"
            onClick={() => runAction('execute')}
            disabled={Boolean(executeDisabledReason) || isPending}
            title={executeDisabledReason ?? '生成パッケージを作成'}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PackageCheck size={13} aria-hidden="true" />
            生成パッケージを作成
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <Info label="contentIdea" value={selectedTitle} />
        <Info label="primary platform" value={platform || '未選択'} />
        <Info label="outputType" value={form.outputType || '未選択'} />
        <Info label="purpose" value={form.purpose || '未選択'} />
      </div>

      {!ready && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Content Idea / platform / outputType / purpose を選ぶと、生成プロンプトのプレビューが使えます。
        </p>
      )}
      {multiplePlatformHint && (
        <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          {multiplePlatformHint}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </p>
      )}
      {preview?.ok && preview.mode === 'preview' && !preview.writeReady && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          プレビューは利用できますが、作成は無効です: {preview.writeDisabledReason}
        </p>
      )}

      {shown && (
        <div className="mt-4 flex flex-col gap-3">
          <div
            className={
              'rounded-md border px-3 py-2 text-xs ' +
              (shown.mode === 'execute'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-slate-50 text-slate-800')
            }
          >
            <div className="font-semibold">
              {shown.mode === 'execute'
                ? '生成パッケージを作成しました'
                : '生成プロンプトのプレビュー'}
            </div>
            <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
              <Info label="slug" value={shown.contentIdeaSlug} compact />
              <Info label="timestamp" value={shown.timestamp} compact />
              <Info label="claims" value={String(shown.summary.claimsCount)} compact />
              <Info
                label="platformAngles"
                value={String(shown.summary.platformAnglesCount)}
                compact
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <PathLine label="prompt.md" value={shown.promptPath} />
            <PathLine label="job.json" value={shown.jobJsonPath} />
            <PathLine label="expected draft.md" value={shown.expectedDraftMdPath} />
            <PathLine label="expected draft.json" value={shown.expectedDraftJsonPath} />
          </div>

          {shown.warnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-semibold">
                <TriangleAlert size={13} aria-hidden="true" />
                Source warnings
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {shown.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <CopyButton text={shown.promptText} label="プロンプトをコピー" tone="primary" />
            <CopyButton text={shown.suggestedCommands.codex} label="Codexコマンドをコピー" />
            <CopyButton text={shown.suggestedCommands.claude} label="Claudeコマンドをコピー" />
            <CopyButton text={shown.suggestedCommands.pbcopy} label="pbcopyコマンドをコピー" />
          </div>

          <pre className="max-h-[360px] overflow-auto rounded-md bg-slate-900 px-3 py-3 text-[11px] leading-relaxed text-slate-100">
            <code className="whitespace-pre-wrap break-words font-mono">{shown.promptText}</code>
          </pre>

          <WorkflowNotice>
            Dashboardはコマンドを実行しません。プロンプトをコピーして手動でAIに渡し、返答を次のStep 4で取り込みます。
          </WorkflowNotice>
          {shown.mode === 'execute' && (
            <NextActionCard
              tone="emerald"
              items={[
                'プロンプトをコピーする',
                'ChatGPT / Claude / Codexに手動で貼る',
                '返答をStep 4「AI生成結果を取り込む」に貼る',
              ]}
            />
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
      <div className="mt-0.5 break-words font-medium text-slate-900">{value}</div>
    </div>
  )
}

function PathLine({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <code className="mt-0.5 block break-words font-mono text-[11px] text-slate-900">{value}</code>
    </div>
  )
}
