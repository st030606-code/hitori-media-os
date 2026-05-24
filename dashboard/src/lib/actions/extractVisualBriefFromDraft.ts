'use server'

// Phase 2C-6 — extract visual brief text from a saved generation job draft.
// No Sanity writes, no image generation, and no external API calls.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  atomicWriteGenerationJobFile,
  buildGenerationJobPaths,
  validateGenerationPlatform,
  validateGenerationSlug,
  type GenerationPlatform,
} from '@/lib/generationJobs/paths'
import {
  buildVisualBriefJsonPayload,
  extractVisualBriefFromGeneratedDraft,
  type ExtractedVisualBrief,
} from '@/lib/generationJobs/visualBriefExtractor'
import {readGenerationJobDetail, type GenerationJobSummary} from '@/lib/generationJobs/reader'

export type ExtractVisualBriefError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'not-found'
  | 'write-failed'
  | 'content-idea-mismatch'
  | 'unknown'

export interface ExtractVisualBriefInput {
  selectedContentIdeaSlug?: string | null
  contentIdeaSlug: string
  platform: string
  timestamp: string
  mode: 'preview' | 'execute'
}

interface BaseSuccess {
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  plannedVisualBriefMdPath: string
  plannedVisualBriefJsonPath: string | null
  visualBriefFound: boolean
  visualBriefMarkdown: string
  structuredVisualBrief: ExtractedVisualBrief['structuredVisualBrief']
  detectedFields: ExtractedVisualBrief['detectedFields']
  warnings: string[]
  previewExcerpt: string
  suggestedPlacement: string
  suggestedAssetType: string
  suggestedAspectRatio: string
  suggestedImagePrompt: string
  job: GenerationJobSummary
}

interface PreviewSuccess extends BaseSuccess {
  ok: true
  mode: 'preview'
  writeReady: boolean
  writeDisabledReason: string | null
}

interface ExecuteSuccess extends BaseSuccess {
  ok: true
  mode: 'execute'
  visualBriefMdPath: string
  visualBriefJsonPath: string | null
  savedAt: string
}

interface ActionError {
  ok: false
  error: ExtractVisualBriefError
  message: string
}

export type ExtractVisualBriefResult = PreviewSuccess | ExecuteSuccess | ActionError

const TIMESTAMP_RE = /^\d{8}-\d{6}$/

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[extractVisualBriefFromDraft:${stage}]`, detail)
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!enableLocalFsRoutes) return 'ENABLE_LOCAL_FS_ROUTES is off'
  return null
}

function validateInput(input: ExtractVisualBriefInput):
  | {ok: true; contentIdeaSlug: string; selectedContentIdeaSlug: string; platform: GenerationPlatform; timestamp: string}
  | ActionError {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const slug = validateGenerationSlug(input.contentIdeaSlug)
  if (!slug.ok) return {ok: false, error: 'path-rejected', message: slug.message}
  const selectedSlug = validateGenerationSlug(input.selectedContentIdeaSlug)
  if (!selectedSlug.ok) {
    return {ok: false, error: 'validation', message: 'selectedContentIdeaSlug is required'}
  }
  if (selectedSlug.slug !== slug.slug) {
    return {
      ok: false,
      error: 'content-idea-mismatch',
      message: '選択中のContent Ideaとgeneration jobが一致していません。',
    }
  }
  const platform = validateGenerationPlatform(input.platform)
  if (!platform.ok) return {ok: false, error: 'path-rejected', message: platform.message}
  if (typeof input.timestamp !== 'string' || !TIMESTAMP_RE.test(input.timestamp)) {
    return {ok: false, error: 'path-rejected', message: 'timestamp must match YYYYMMDD-HHMMSS'}
  }
  return {
    ok: true,
    contentIdeaSlug: slug.slug,
    selectedContentIdeaSlug: selectedSlug.slug,
    platform: platform.platform,
    timestamp: input.timestamp,
  }
}

export async function extractVisualBriefFromDraft(
  input: ExtractVisualBriefInput,
): Promise<ExtractVisualBriefResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    contentIdeaSlug: input?.contentIdeaSlug,
    platform: input?.platform,
    timestamp: input?.timestamp,
  })

  const valid = validateInput(input)
  if (!valid.ok) return valid

  const paths = buildGenerationJobPaths(valid.contentIdeaSlug, valid.platform, valid.timestamp)
  if (!paths.ok) return {ok: false, error: 'path-rejected', message: paths.message}

  const detail = await readGenerationJobDetail(valid.contentIdeaSlug, valid.platform, valid.timestamp)
  if (!detail.ok) return {ok: false, error: detail.error === 'not-found' ? 'not-found' : 'unknown', message: detail.message}
  if (!detail.job.draftMarkdown?.trim()) {
    return {ok: false, error: 'not-found', message: 'draft.md is required before visual brief extraction'}
  }

  const extracted = extractVisualBriefFromGeneratedDraft({
    draftMarkdown: detail.job.draftMarkdown,
    platform: valid.platform,
    jobMetadata: detail.job.jobMetadata,
    draftJson: detail.job.draftJson,
  })
  const savedAt = new Date().toISOString()
  const jsonPayload = buildVisualBriefJsonPayload({
    contentIdeaSlug: valid.contentIdeaSlug,
    platform: valid.platform,
    timestamp: valid.timestamp,
    visualBriefMdPath: paths.visualBriefMdRelative,
    visualBriefJsonPath: paths.visualBriefJsonRelative,
    extracted,
    savedAtIso: savedAt,
    jobMetadata: detail.job.jobMetadata,
  })
  const base: BaseSuccess = {
    contentIdeaSlug: valid.contentIdeaSlug,
    platform: valid.platform,
    timestamp: valid.timestamp,
    plannedVisualBriefMdPath: paths.visualBriefMdRelative,
    plannedVisualBriefJsonPath: jsonPayload ? paths.visualBriefJsonRelative : null,
    visualBriefFound: extracted.visualBriefFound,
    visualBriefMarkdown: extracted.visualBriefMarkdown,
    structuredVisualBrief: extracted.structuredVisualBrief,
    detectedFields: extracted.detectedFields,
    warnings: extracted.warnings,
    previewExcerpt: extracted.previewExcerpt,
    suggestedPlacement: extracted.suggestedPlacement,
    suggestedAssetType: extracted.suggestedAssetType,
    suggestedAspectRatio: extracted.suggestedAspectRatio,
    suggestedImagePrompt: extracted.suggestedImagePrompt,
    job: detail.job,
  }

  if (input.mode === 'preview') {
    logEvent('preview', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: valid.platform,
      timestamp: valid.timestamp,
      visualBriefFound: extracted.visualBriefFound,
      detectedFieldCount: extracted.detectedFields.length,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'preview',
      ...base,
      writeReady: !writeDisabledReason(),
      writeDisabledReason: writeDisabledReason(),
    }
  }

  const disabledReason = writeDisabledReason()
  if (disabledReason) {
    return {
      ok: false,
      error: disabledReason.includes('LOCAL_FS') ? 'localfs-disabled' : 'write-disabled',
      message: disabledReason,
    }
  }
  if (!extracted.visualBriefFound || !extracted.visualBriefMarkdown.trim()) {
    return {ok: false, error: 'validation', message: 'no visual brief was found in draft.md'}
  }

  try {
    await atomicWriteGenerationJobFile(paths.visualBriefMdRelative, extracted.visualBriefMarkdown)
    if (jsonPayload) await atomicWriteGenerationJobFile(paths.visualBriefJsonRelative, jsonPayload)
    logEvent('execute', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: valid.platform,
      timestamp: valid.timestamp,
      visualBriefBytes: Buffer.byteLength(extracted.visualBriefMarkdown, 'utf8'),
      wroteJson: Boolean(jsonPayload),
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'execute',
      ...base,
      visualBriefMdPath: paths.visualBriefMdRelative,
      visualBriefJsonPath: jsonPayload ? paths.visualBriefJsonRelative : null,
      savedAt,
    }
  } catch {
    return {ok: false, error: 'write-failed', message: 'failed to write visual brief files'}
  }
}
