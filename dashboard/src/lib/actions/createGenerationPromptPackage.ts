'use server'

// Phase 2C-2 — create a no-API generation prompt package from a Sanity
// contentIdea.
//
// Boundaries:
//   - Sanity read only. No Sanity writes.
//   - No campaignPlan / platformOutput / publishedOutput creation.
//   - No external LLM API calls.
//   - No shell execution or child_process usage.
//   - Local filesystem writes require ENABLE_WRITE_ACTIONS and
//     ENABLE_LOCAL_FS_ROUTES, and are limited by generationJobs/paths.ts.
//   - Logs are metadata only; never log contentIdea body, prompt body, or
//     token values.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {sanityClient} from '@/lib/sanity'
import {
  atomicWriteGenerationJobFile,
  buildGenerationJobPaths,
  nowGenerationTimestamp,
  validateGenerationPlatform,
  validateGenerationSlug,
  type GenerationJobPaths,
  type GenerationPathErrorDetail,
  type GenerationPlatform,
} from '@/lib/generationJobs/paths'
import {
  GENERATION_OUTPUT_LENGTH_VALUES,
  GENERATION_OUTPUT_TYPE_VALUES,
  GENERATION_VISUAL_PREFERENCE_VALUES,
  renderGenerationPromptPackage,
  type GenerationContentIdeaDoc,
  type GenerationOutputLength,
  type GenerationOutputType,
  type GenerationVisualPreference,
} from '@/lib/generationJobs/promptBuilder'

export type CreateGenerationPackageError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'not-found'
  | 'path-rejected'
  | 'write-failed'
  | 'unknown'

export interface CreateGenerationPromptPackageInput {
  contentIdeaId: string
  platform: string
  outputType: string
  purpose: string
  tone: string
  cta: string
  outputLength: string
  visualPreference: string
  additionalInstructions?: string
  mode: 'preview' | 'execute'
  /** Optional timestamp from a prior preview, so execute can write the paths boss just inspected. */
  plannedTimestamp?: string
}

interface GenerationPackageSuccessBase {
  contentIdeaId: string
  contentIdeaSlug: string
  contentIdeaTitle: string
  platform: GenerationPlatform
  outputType: GenerationOutputType
  timestamp: string
  promptPath: string
  jobJsonPath: string
  expectedDraftMdPath: string
  expectedDraftJsonPath: string
  promptText: string
  jobJsonText: string
  suggestedCommands: {
    codex: string
    claude: string
    pbcopy: string
  }
  warnings: string[]
  summary: {
    title: string
    slug: string
    status: string
    claimsCount: number
    platformAnglesCount: number
    audienceCount: number
  }
  metrics: {
    promptBytes: number
    jobJsonBytes: number
  }
}

interface PreviewSuccess extends GenerationPackageSuccessBase {
  ok: true
  mode: 'preview'
  writeReady: boolean
  writeDisabledReason: string | null
}

interface ExecuteSuccess extends GenerationPackageSuccessBase {
  ok: true
  mode: 'execute'
  committedAt: string
}

interface ActionError {
  ok: false
  error: CreateGenerationPackageError
  message: string
}

export type CreateGenerationPromptPackageResult = PreviewSuccess | ExecuteSuccess | ActionError

const CONTENT_IDEA_ID_MAX = 200
const FREE_FIELD_MAX = 1000
const ADDITIONAL_INSTRUCTIONS_MAX = 2000
const TIMESTAMP_RE = /^\d{8}-\d{6}$/

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[createGenerationPromptPackage:${stage}]`, detail)
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

function cleanString(value: unknown, field: string, max: number):
  | {ok: true; value: string}
  | {ok: false; message: string} {
  if (value == null) return {ok: true, value: ''}
  if (typeof value !== 'string') return {ok: false, message: `${field} must be a string`}
  if (value.includes('\x00')) return {ok: false, message: `${field} contains a null byte`}
  if (value.length > max) return {ok: false, message: `${field} exceeds ${max} characters`}
  return {ok: true, value: value.trim()}
}

function validateInput(input: CreateGenerationPromptPackageInput):
  | {
      ok: true
      contentIdeaId: string
      platform: GenerationPlatform
      outputType: GenerationOutputType
      purpose: string
      tone: string
      cta: string
      outputLength: GenerationOutputLength
      visualPreference: GenerationVisualPreference
      additionalInstructions: string
      plannedTimestamp?: string
    }
  | {ok: false; error: CreateGenerationPackageError; message: string} {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const id = cleanString(input.contentIdeaId, 'contentIdeaId', CONTENT_IDEA_ID_MAX)
  if (!id.ok) return {ok: false, error: 'validation', message: id.message}
  if (!id.value) return {ok: false, error: 'validation', message: 'contentIdeaId is required'}

  const platformCheck = validateGenerationPlatform(input.platform)
  if (!platformCheck.ok) {
    return {ok: false, error: 'validation', message: platformCheck.message}
  }
  if (!(GENERATION_OUTPUT_TYPE_VALUES as readonly string[]).includes(input.outputType)) {
    return {ok: false, error: 'validation', message: 'outputType is not supported'}
  }
  if (!(GENERATION_OUTPUT_LENGTH_VALUES as readonly string[]).includes(input.outputLength)) {
    return {ok: false, error: 'validation', message: 'outputLength is not supported'}
  }
  if (!(GENERATION_VISUAL_PREFERENCE_VALUES as readonly string[]).includes(input.visualPreference)) {
    return {ok: false, error: 'validation', message: 'visualPreference is not supported'}
  }

  const purpose = cleanString(input.purpose, 'purpose', FREE_FIELD_MAX)
  const tone = cleanString(input.tone, 'tone', FREE_FIELD_MAX)
  const cta = cleanString(input.cta, 'cta', FREE_FIELD_MAX)
  const additionalInstructions = cleanString(
    input.additionalInstructions,
    'additionalInstructions',
    ADDITIONAL_INSTRUCTIONS_MAX,
  )
  if (!purpose.ok) return {ok: false, error: 'validation', message: purpose.message}
  if (!tone.ok) return {ok: false, error: 'validation', message: tone.message}
  if (!cta.ok) return {ok: false, error: 'validation', message: cta.message}
  if (!additionalInstructions.ok) {
    return {ok: false, error: 'validation', message: additionalInstructions.message}
  }

  let plannedTimestamp: string | undefined
  if (typeof input.plannedTimestamp === 'string' && input.plannedTimestamp.length > 0) {
    if (!TIMESTAMP_RE.test(input.plannedTimestamp)) {
      return {ok: false, error: 'validation', message: 'plannedTimestamp must match YYYYMMDD-HHMMSS'}
    }
    plannedTimestamp = input.plannedTimestamp
  }

  return {
    ok: true,
    contentIdeaId: id.value,
    platform: platformCheck.platform,
    outputType: input.outputType as GenerationOutputType,
    purpose: purpose.value,
    tone: tone.value,
    cta: cta.value,
    outputLength: input.outputLength as GenerationOutputLength,
    visualPreference: input.visualPreference as GenerationVisualPreference,
    additionalInstructions: additionalInstructions.value,
    plannedTimestamp,
  }
}

async function fetchContentIdea(
  contentIdeaId: string,
): Promise<{ok: true; doc: GenerationContentIdeaDoc} | ActionError> {
  try {
    const doc = await sanityClient.fetch<GenerationContentIdeaDoc | null>(
      `*[_type == "contentIdea" && _id == $id][0]{
        _id,
        _updatedAt,
        title,
        slug,
        status,
        summary,
        rawInput,
        coreThesis,
        audience,
        audiencePain,
        contentPillars,
        claims[]{
          claim,
          supportingEvidence,
          confidence,
          needsVerification
        },
        evidence[]{
          type,
          description,
          sourceUrl,
          notes
        },
        examples[]{
          title,
          description
        },
        objections[]{
          objection,
          response
        },
        tone{
          voice,
          styleNotes,
          avoid
        },
        sourceLinks[]{
          type,
          title,
          reference,
          notes
        },
        platformAngles[]{
          platform,
          targetReader,
          hook,
          formatNotes,
          callToAction
        },
        outputChecklist[]{
          outputType,
          status,
          localOutputPath,
          publishedUrl,
          notes
        },
        personalContext
      }`,
      {id: contentIdeaId},
    )
    if (!doc) return {ok: false, error: 'not-found', message: 'contentIdea was not found'}
    return {ok: true, doc}
  } catch (e) {
    logEvent('error', {
      stage: 'fetch-contentIdea',
      message: e instanceof Error ? e.message : String(e),
    })
    return {ok: false, error: 'unknown', message: 'Failed to read contentIdea'}
  }
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!enableLocalFsRoutes) return 'ENABLE_LOCAL_FS_ROUTES is off'
  return null
}

function buildSuccessBase(args: {
  doc: GenerationContentIdeaDoc
  paths: GenerationJobPaths
  platform: GenerationPlatform
  outputType: GenerationOutputType
  rendered: ReturnType<typeof renderGenerationPromptPackage>
}): GenerationPackageSuccessBase {
  const {doc, paths, platform, outputType, rendered} = args
  return {
    contentIdeaId: doc._id,
    contentIdeaSlug: paths.contentIdeaSlug,
    contentIdeaTitle: doc.title ?? '(Untitled contentIdea)',
    platform,
    outputType,
    timestamp: paths.timestamp,
    promptPath: paths.promptMdRelative,
    jobJsonPath: paths.jobJsonRelative,
    expectedDraftMdPath: paths.expectedDraftMdRelative,
    expectedDraftJsonPath: paths.expectedDraftJsonRelative,
    promptText: rendered.promptMd,
    jobJsonText: rendered.jobJson,
    suggestedCommands: rendered.suggestedCommands,
    warnings: rendered.warnings,
    summary: rendered.summary,
    metrics: {
      promptBytes: Buffer.byteLength(rendered.promptMd, 'utf8'),
      jobJsonBytes: Buffer.byteLength(rendered.jobJson, 'utf8'),
    },
  }
}

export async function createGenerationPromptPackage(
  input: CreateGenerationPromptPackageInput,
): Promise<CreateGenerationPromptPackageResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    contentIdeaId: input?.contentIdeaId,
    platform: input?.platform,
  })

  const valid = validateInput(input)
  if (!valid.ok) {
    logEvent('rejected', {reason: valid.error, message: valid.message})
    return {ok: false, error: valid.error, message: valid.message}
  }

  const read = await fetchContentIdea(valid.contentIdeaId)
  if (!read.ok) {
    logEvent('rejected', {reason: read.error, contentIdeaId: valid.contentIdeaId})
    return read
  }

  const slugCurrent = read.doc.slug?.current
  const slugCheck = validateGenerationSlug(slugCurrent)
  if (!slugCheck.ok) {
    logEvent('rejected', {
      reason: 'bad-contentIdea-slug',
      contentIdeaId: valid.contentIdeaId,
      detail: slugCheck.error,
    })
    return {ok: false, error: 'validation', message: slugCheck.message}
  }

  const timestamp = valid.plannedTimestamp ?? nowGenerationTimestamp()
  const pathsResult = buildGenerationJobPaths(slugCheck.slug, valid.platform, timestamp)
  if (isPathError(pathsResult)) {
    logEvent('rejected', {reason: 'path-build', detail: pathsResult.error})
    return {ok: false, error: 'path-rejected', message: pathsResult.message}
  }
  const paths = pathsResult

  const createdAtIso = new Date().toISOString()
  const rendered = renderGenerationPromptPackage({
    contentIdea: read.doc,
    paths,
    platform: valid.platform,
    outputType: valid.outputType,
    purpose: valid.purpose,
    tone: valid.tone,
    cta: valid.cta,
    outputLength: valid.outputLength,
    visualPreference: valid.visualPreference,
    additionalInstructions: valid.additionalInstructions,
    createdAtIso,
  })
  const base = buildSuccessBase({
    doc: read.doc,
    paths,
    platform: valid.platform,
    outputType: valid.outputType,
    rendered,
  })

  if (input.mode === 'preview') {
    const reason = writeDisabledReason()
    logEvent('preview-ok', {
      contentIdeaId: valid.contentIdeaId,
      slug: paths.contentIdeaSlug,
      platform: valid.platform,
      promptBytes: base.metrics.promptBytes,
      jobJsonBytes: base.metrics.jobJsonBytes,
      warningCount: base.warnings.length,
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
    logEvent('rejected', {reason: 'write-disabled', mode: 'execute'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled', mode: 'execute'})
    return {ok: false, error: 'localfs-disabled', message: 'ENABLE_LOCAL_FS_ROUTES is off'}
  }

  try {
    await atomicWriteGenerationJobFile(paths.promptMdRelative, rendered.promptMd)
    await atomicWriteGenerationJobFile(paths.jobJsonRelative, rendered.jobJson)
  } catch (e) {
    logEvent('write-failed', {
      message: e instanceof Error ? e.message : String(e),
      slug: paths.contentIdeaSlug,
      platform: valid.platform,
    })
    return {ok: false, error: 'write-failed', message: 'Failed to write generation package files'}
  }

  logEvent('execute-ok', {
    contentIdeaId: valid.contentIdeaId,
    slug: paths.contentIdeaSlug,
    platform: valid.platform,
    promptBytes: base.metrics.promptBytes,
    jobJsonBytes: base.metrics.jobJsonBytes,
    warningCount: base.warnings.length,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'execute',
    committedAt: createdAtIso,
    ...base,
  }
}
