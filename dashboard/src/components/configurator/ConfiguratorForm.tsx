'use client'

// ConfiguratorForm — client wrapper that owns the form state for /configurator.
// Lays out the 2-col grid (form left, preview right) and renders the bottom
// action bar plus the "prompt copy" preview block.
//
// State is plain useState (no persistence, no URL sync) per Phase UI-fidelity-5
// boss confirmation. AI generation is NOT wired; "下書きを生成" is wired as a
// prompt-copy preview (see buildPrompt + CopyButton at the bottom).

import {useCallback, useMemo, useState} from 'react'
import {RefreshCw, Save, Wand2} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'
import {WorkflowBadge, WorkflowNotice} from '@/components/common/WorkflowGuide'
import {ContentIdeaSelectorCard} from './ContentIdeaSelectorCard'
import {PlatformAndOutputTypeCard} from './PlatformAndOutputTypeCard'
import {ToneAndCtaCard} from './ToneAndCtaCard'
import {AdvancedOptionsCard} from './AdvancedOptionsCard'
import {GenerationPreviewCard} from './GenerationPreviewCard'
import {GenerationPackageCard} from './GenerationPackageCard'
import {GeneratedOutputImportCard} from './GeneratedOutputImportCard'
import {PlatformOutputCreateCard} from './PlatformOutputCreateCard'
import {VisualBriefExtractionCard} from './VisualBriefExtractionCard'
import {VisualAssetPlanCreateCard} from './VisualAssetPlanCreateCard'
import {StructurePreviewCard} from './StructurePreviewCard'
import {DeliverablesCard} from './DeliverablesCard'
import {LifecyclePreviewCard} from './LifecyclePreviewCard'
import {RecommendedTemplatesCard} from './RecommendedTemplatesCard'
import {RecentOutputsLinkCard} from './RecentOutputsLinkCard'
import {DEFAULT_FORM_VALUE, type FormValue} from '@/lib/configurator/options'
import {buildPrompt} from '@/lib/configurator/promptBuilder'
import type {ConfiguratorOptions} from '@/lib/groq/configurator'
import type {OutputRow} from '@/lib/groq/outputs'
import type {GenerationJobSummary} from '@/lib/generationJobs/reader'

interface Props {
  options: ConfiguratorOptions
  recentOutputs: OutputRow[]
  recentGenerationJobs: GenerationJobSummary[]
  lifecycle: {
    idea: number
    structured: number
    draft: number
    review: number
    published: number
  }
}

export function ConfiguratorForm({options, recentOutputs, recentGenerationJobs, lifecycle}: Props) {
  const [form, setForm] = useState<FormValue>(DEFAULT_FORM_VALUE)
  const [createdGenerationJob, setCreatedGenerationJob] = useState<GenerationJobSummary | null>(
    null,
  )
  const [activeGenerationJob, setActiveGenerationJob] = useState<GenerationJobSummary | null>(null)
  const [savedDraftJob, setSavedDraftJob] = useState<GenerationJobSummary | null>(null)
  const [visualBriefReadyJob, setVisualBriefReadyJob] = useState<GenerationJobSummary | null>(null)

  const onChange = useCallback((next: Partial<FormValue>) => {
    setForm((prev) => ({...prev, ...next}))
  }, [])

  const onReset = useCallback(() => setForm(DEFAULT_FORM_VALUE), [])

  const selectedIdea = useMemo(
    () => options.contentIdeas.find((c) => c._id === form.contentIdeaId) ?? null,
    [options.contentIdeas, form.contentIdeaId],
  )
  const selectedContentIdeaSlug = selectedIdea?.slug ?? null
  const selectedContentIdeaTitle = selectedIdea?.title ?? null

  const scopedGenerationJobs = useMemo(() => {
    if (!selectedContentIdeaSlug) return []
    return recentGenerationJobs.filter((job) => job.contentIdeaSlug === selectedContentIdeaSlug)
  }, [recentGenerationJobs, selectedContentIdeaSlug])

  const scopedCurrentJob = useMemo(() => {
    const candidate = savedDraftJob ?? createdGenerationJob
    if (!candidate || candidate.contentIdeaSlug !== selectedContentIdeaSlug) return null
    return candidate
  }, [createdGenerationJob, savedDraftJob, selectedContentIdeaSlug])

  const scopedActiveJob = useMemo(() => {
    const candidate = savedDraftJob ?? activeGenerationJob
    if (!candidate || candidate.contentIdeaSlug !== selectedContentIdeaSlug) return null
    return candidate
  }, [activeGenerationJob, savedDraftJob, selectedContentIdeaSlug])

  const scopedVisualBriefJob = useMemo(() => {
    const candidate = visualBriefReadyJob ?? savedDraftJob ?? activeGenerationJob
    if (!candidate || candidate.contentIdeaSlug !== selectedContentIdeaSlug) return null
    return candidate
  }, [activeGenerationJob, savedDraftJob, selectedContentIdeaSlug, visualBriefReadyJob])

  const selectedTemplate = useMemo(
    () => options.promptTemplates.find((t) => t._id === form.promptTemplateId) ?? null,
    [options.promptTemplates, form.promptTemplateId],
  )

  const promptText = useMemo(
    () =>
      buildPrompt({
        form,
        contentIdea: selectedIdea,
        promptTemplate: selectedTemplate,
      }),
    [form, selectedIdea, selectedTemplate],
  )

  const readyToCopy =
    !!form.contentIdeaId && form.platforms.length > 0 && !!form.outputType && !!form.purpose

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              現在の対象
            </div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {selectedContentIdeaTitle ?? 'Content Idea未選択'}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-700">
              <span>
                slug:{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono ring-1 ring-inset ring-blue-100">
                  {selectedContentIdeaSlug ?? '未選択'}
                </code>
              </span>
              <span>platform: {form.platforms[0] ?? '未選択'}</span>
              <span>outputType: {form.outputType || '未選択'}</span>
            </div>
            <p className="mt-2 text-xs text-blue-900">
              このページでは、選択中のContent Ideaに紐づくgeneration jobだけを扱います。
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <WorkflowBadge label="AI実行: 手動" tone="amber" />
            <WorkflowBadge label="API: 未使用" tone="amber" />
            <WorkflowBadge label="保存先: ローカル + Sanity" tone="blue" />
          </div>
        </div>
      </section>

      <WorkflowNotice tone="blue">
        生成はDashboard内で実行しません。プロンプトをコピーしてChatGPT / Claude / Codexに手動で渡し、返答をこの画面へ戻します。
      </WorkflowNotice>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <ContentIdeaSelectorCard
            contentIdeas={options.contentIdeas}
            value={form.contentIdeaId}
            onChange={(id) => {
              onChange({contentIdeaId: id})
              setCreatedGenerationJob(null)
              setActiveGenerationJob(null)
              setSavedDraftJob(null)
              setVisualBriefReadyJob(null)
            }}
          />
          <PlatformAndOutputTypeCard value={form} onChange={onChange} />
          <ToneAndCtaCard value={form} onChange={onChange} />
          <AdvancedOptionsCard
            value={form}
            onChange={onChange}
            promptTemplates={options.promptTemplates}
          />
          <GenerationPackageCard
            form={form}
            contentIdea={selectedIdea}
            onPackageCreated={(job) => {
              setCreatedGenerationJob(job)
              setActiveGenerationJob(job)
              setSavedDraftJob(null)
              setVisualBriefReadyJob(null)
            }}
          />
          <GeneratedOutputImportCard
            recentJobs={scopedGenerationJobs}
            currentJob={scopedCurrentJob}
            selectedContentIdeaSlug={selectedContentIdeaSlug}
            selectedContentIdeaTitle={selectedContentIdeaTitle}
            onActiveJobChange={setActiveGenerationJob}
            onDraftSaved={(job) => {
              setSavedDraftJob(job)
              setVisualBriefReadyJob(null)
            }}
          />
          <PlatformOutputCreateCard
            job={scopedActiveJob}
            selectedContentIdeaSlug={selectedContentIdeaSlug}
            selectedContentIdeaTitle={selectedContentIdeaTitle}
          />
          <VisualBriefExtractionCard
            job={scopedActiveJob}
            selectedContentIdeaSlug={selectedContentIdeaSlug}
            selectedContentIdeaTitle={selectedContentIdeaTitle}
            onVisualBriefReady={setVisualBriefReadyJob}
          />
          <VisualAssetPlanCreateCard
            job={scopedVisualBriefJob}
            visualBriefReady={Boolean(
              visualBriefReadyJob &&
                visualBriefReadyJob.contentIdeaSlug === selectedContentIdeaSlug,
            )}
            selectedContentIdeaSlug={selectedContentIdeaSlug}
            selectedContentIdeaTitle={selectedContentIdeaTitle}
          />
        </div>

        <div className="flex flex-col gap-5">
          <GenerationPreviewCard form={form} contentIdea={selectedIdea} />
          <StructurePreviewCard form={form} />
          <DeliverablesCard form={form} />
          <LifecyclePreviewCard
            ideaCount={lifecycle.idea}
            structuredCount={lifecycle.structured}
            draftCount={lifecycle.draft}
            reviewCount={lifecycle.review}
            publishedCount={lifecycle.published}
          />
          <RecommendedTemplatesCard
            promptTemplates={options.promptTemplates}
            selectedId={form.promptTemplateId}
            onSelect={(id) => onChange({promptTemplateId: id})}
          />
          <RecentOutputsLinkCard rows={recentOutputs} />
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">プロンプトプレビュー</h2>
            <p className="text-[11px] text-slate-500">
              現在の入力から組み立てたプロンプトです。ChatGPT / Claude にコピー & 貼り付けて手動で生成してください。
            </p>
          </div>
          <CopyButton
            text={promptText}
            label="プロンプトをコピー"
            tone="primary"
            disabled={!readyToCopy}
          />
        </header>
        {!readyToCopy && (
          <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
            アイデア・媒体・出力形式・目的を選ぶとコピー可能になります。
          </p>
        )}
        <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-900 px-3 py-3 text-[11px] leading-relaxed text-slate-100">
          <code className="whitespace-pre-wrap break-words font-mono">{promptText}</code>
        </pre>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw size={13} aria-hidden="true" />
          リセット
        </button>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
          title="Phase UI-fidelity-6 以降で実装予定"
        >
          <Save size={13} aria-hidden="true" />
          テンプレートとして保存
        </button>
        <CopyButton
          text={promptText}
          label="生成プロンプトをコピー"
          tone="primary"
          disabled={!readyToCopy}
        />
        <span className="ml-1 hidden text-[11px] text-slate-500 sm:inline">
          <Wand2 size={11} className="mr-1 inline" aria-hidden="true" />
          実 AI 連携は Phase UI-4 P2
        </span>
      </div>
    </div>
  )
}
