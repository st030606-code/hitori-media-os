'use server'

// Phase 2C-3 — save manually generated AI output back into an existing
// generation-jobs package.
//
// Boundaries:
//   - No Sanity writes.
//   - No campaignPlan / platformOutput / publishedOutput creation.
//   - No external LLM API calls.
//   - No shell execution or child_process usage.
//   - Writes require ENABLE_WRITE_ACTIONS + ENABLE_LOCAL_FS_ROUTES.
//   - Local reads/writes are restricted to generation-jobs/.
//   - Logs are metadata only; never log generated body or prompt body.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  atomicWriteGenerationJobFile,
  buildGenerationJobPaths,
  validateGenerationPlatform,
  validateGenerationSlug,
  type GenerationPathErrorDetail,
  type GenerationPlatform,
} from '@/lib/generationJobs/paths'
import {
  buildDraftJsonPayload,
  parseGeneratedOutput,
  type DetectedOutputKind,
  type DetectedSection,
} from '@/lib/generationJobs/outputParser'
import {getGenerationJobSummary, type GenerationJobSummary} from '@/lib/generationJobs/reader'

export type SaveGeneratedOutputDraftError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'not-found'
  | 'parse-error'
  | 'too-large'
  | 'write-failed'
  | 'content-idea-mismatch'
  | 'unknown'

export interface SaveGeneratedOutputDraftInput {
  selectedContentIdeaSlug?: string | null
  contentIdeaSlug: string
  platform: string
  timestamp: string
  generatedOutputText: string
  mode: 'preview' | 'execute'
}

interface SaveGeneratedOutputDraftBase {
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  plannedDraftMdPath: string
  plannedDraftJsonPath: string | null
  detectedSections: DetectedSection[]
  detectedOutputKind: DetectedOutputKind
  warnings: string[]
  previewExcerpt: string
  job: GenerationJobSummary
  metrics: {
    inputBytes: number
    markdownBytes: number
    structuredJsonBytes: number
    wroteJson: boolean
  }
}

interface PreviewSuccess extends SaveGeneratedOutputDraftBase {
  ok: true
  mode: 'preview'
  writeReady: boolean
  writeDisabledReason: string | null
}

interface ExecuteSuccess extends SaveGeneratedOutputDraftBase {
  ok: true
  mode: 'execute'
  draftMdPath: string
  draftJsonPath: string | null
  savedAt: string
}

interface ActionError {
  ok: false
  error: SaveGeneratedOutputDraftError
  message: string
}

export type SaveGeneratedOutputDraftResult = PreviewSuccess | ExecuteSuccess | ActionError

const TIMESTAMP_RE = /^\d{8}-\d{6}$/

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[saveGeneratedOutputDraft:${stage}]`, detail)
}

function isPathError(value: unknown): value is GenerationPathErrorDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    (value as {ok: unknown}).ok === false &&
    'error' in value
  )
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!enableLocalFsRoutes) return 'ENABLE_LOCAL_FS_ROUTES is off'
  return null
}

function validateInput(input: SaveGeneratedOutputDraftInput):
  | {
      ok: true
      contentIdeaSlug: string
      selectedContentIdeaSlug: string
      platform: GenerationPlatform
      timestamp: string
      generatedOutputText: string
    }
  | ActionError {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const slugCheck = validateGenerationSlug(input.contentIdeaSlug)
  if (!slugCheck.ok) return {ok: false, error: 'path-rejected', message: slugCheck.message}
  const selectedSlugCheck = validateGenerationSlug(input.selectedContentIdeaSlug)
  if (!selectedSlugCheck.ok) {
    return {ok: false, error: 'validation', message: 'selectedContentIdeaSlug is required'}
  }
  if (selectedSlugCheck.slug !== slugCheck.slug) {
    return {
      ok: false,
      error: 'content-idea-mismatch',
      message: '選択中のContent Ideaとgeneration jobが一致していません。',
    }
  }
  const platformCheck = validateGenerationPlatform(input.platform)
  if (!platformCheck.ok) {
    return {ok: false, error: 'path-rejected', message: platformCheck.message}
  }
  if (typeof input.timestamp !== 'string' || !TIMESTAMP_RE.test(input.timestamp)) {
    return {ok: false, error: 'path-rejected', message: 'timestamp must match YYYYMMDD-HHMMSS'}
  }
  if (typeof input.generatedOutputText !== 'string') {
    return {ok: false, error: 'validation', message: 'generatedOutputText must be a string'}
  }
  return {
    ok: true,
    contentIdeaSlug: slugCheck.slug,
    selectedContentIdeaSlug: selectedSlugCheck.slug,
    platform: platformCheck.platform,
    timestamp: input.timestamp,
    generatedOutputText: input.generatedOutputText,
  }
}

function mapParserError(error: string): SaveGeneratedOutputDraftError {
  if (error === 'too-large') return 'too-large'
  if (error === 'invalid-json') return 'parse-error'
  return 'validation'
}

export async function saveGeneratedOutputDraft(
  input: SaveGeneratedOutputDraftInput,
): Promise<SaveGeneratedOutputDraftResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    contentIdeaSlug: input?.contentIdeaSlug,
    platform: input?.platform,
    timestamp: input?.timestamp,
  })

  const valid = validateInput(input)
  if (!valid.ok) {
    logEvent('rejected', {reason: valid.error})
    return valid
  }

  const paths = buildGenerationJobPaths(valid.contentIdeaSlug, valid.platform, valid.timestamp)
  if (isPathError(paths)) {
    logEvent('rejected', {reason: 'path-build', detail: paths.error})
    return {ok: false, error: 'path-rejected', message: paths.message}
  }

  const job = await getGenerationJobSummary(valid.contentIdeaSlug, valid.platform, valid.timestamp)
  if (!job.ok) {
    logEvent('rejected', {reason: job.error})
    return {ok: false, error: job.error, message: job.message}
  }

  const parsed = parseGeneratedOutput(valid.generatedOutputText)
  if (!parsed.ok) {
    logEvent('rejected', {reason: parsed.error})
    return {ok: false, error: mapParserError(parsed.error), message: parsed.message}
  }

  const savedAtIso = new Date().toISOString()
  const draftJsonText = buildDraftJsonPayload({
    contentIdeaSlug: paths.contentIdeaSlug,
    platform: paths.platform,
    timestamp: paths.timestamp,
    draftMdPath: paths.expectedDraftMdRelative,
    draftJsonPath: paths.expectedDraftJsonRelative,
    parsed: parsed.parsed,
    savedAtIso,
    jobMetadata: job.job.jobMetadata,
  })
  const wroteJson = Boolean(draftJsonText)

  const base: SaveGeneratedOutputDraftBase = {
    contentIdeaSlug: paths.contentIdeaSlug,
    platform: paths.platform,
    timestamp: paths.timestamp,
    plannedDraftMdPath: paths.expectedDraftMdRelative,
    plannedDraftJsonPath: wroteJson ? paths.expectedDraftJsonRelative : null,
    detectedSections: parsed.parsed.detectedSections,
    detectedOutputKind: parsed.parsed.detectedOutputKind,
    warnings: parsed.parsed.warnings,
    previewExcerpt: parsed.parsed.previewExcerpt,
    job: job.job,
    metrics: {
      inputBytes: parsed.parsed.metrics.inputBytes,
      markdownBytes: parsed.parsed.metrics.markdownBytes,
      structuredJsonBytes: parsed.parsed.metrics.structuredJsonBytes,
      wroteJson,
    },
  }

  if (input.mode === 'preview') {
    const reason = writeDisabledReason()
    logEvent('preview-ok', {
      contentIdeaSlug: paths.contentIdeaSlug,
      platform: paths.platform,
      timestamp: paths.timestamp,
      inputBytes: base.metrics.inputBytes,
      markdownBytes: base.metrics.markdownBytes,
      structuredJsonBytes: base.metrics.structuredJsonBytes,
      detectedSectionCount: base.detectedSections.length,
      wroteJson,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'preview',
      ...base,
      writeReady: reason === null,
      writeDisabledReason: reason,
    }
  }

  if (!enableWriteActions) {
    logEvent('rejected', {reason: 'write-disabled'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled'})
    return {ok: false, error: 'localfs-disabled', message: 'ENABLE_LOCAL_FS_ROUTES is off'}
  }

  try {
    await atomicWriteGenerationJobFile(paths.expectedDraftMdRelative, parsed.parsed.markdownText)
    if (draftJsonText) {
      await atomicWriteGenerationJobFile(paths.expectedDraftJsonRelative, draftJsonText)
    }
  } catch (e) {
    logEvent('write-failed', {
      message: e instanceof Error ? e.message : String(e),
      contentIdeaSlug: paths.contentIdeaSlug,
      platform: paths.platform,
      timestamp: paths.timestamp,
    })
    return {ok: false, error: 'write-failed', message: 'Failed to write generated output draft'}
  }

  logEvent('execute-ok', {
    contentIdeaSlug: paths.contentIdeaSlug,
    platform: paths.platform,
    timestamp: paths.timestamp,
    inputBytes: base.metrics.inputBytes,
    markdownBytes: base.metrics.markdownBytes,
    structuredJsonBytes: base.metrics.structuredJsonBytes,
    detectedSectionCount: base.detectedSections.length,
    wroteJson,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'execute',
    draftMdPath: paths.expectedDraftMdRelative,
    draftJsonPath: wroteJson ? paths.expectedDraftJsonRelative : null,
    savedAt: savedAtIso,
    ...base,
  }
}
