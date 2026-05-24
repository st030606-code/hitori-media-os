'use server'

// Phase 2C-4 — controlled Sanity create for platformOutput from a saved
// generation job draft.
//
// Boundaries:
//   - Reads are limited to generation-jobs/ via generationJobs/reader.
//   - Uses job.json metadata as source of truth; generated text sections do not
//     override platform/outputType.
//   - Creates exactly one platformOutput document on execute.
//   - No campaignPlan / publishedOutput creation and no publish status change.
//   - Metadata-only logs. Never log draft bodies or token values.

import {enableWriteActions} from '@/lib/featureFlags'
import {sanityClient, studioPlatformOutputUrl} from '@/lib/sanity'
import {buildGenerationJobPaths, type GenerationPlatform} from '@/lib/generationJobs/paths'
import {readGenerationJobDetail} from '@/lib/generationJobs/reader'
import {
  mapGenerationJobToPlatformOutput,
  type MappedPlatformOutput,
  type PlatformOutputContentIdeaDoc,
  type PlatformOutputDraft,
  type PlatformOutputDraftSummary,
  type PlatformOutputPlatform,
  type PlatformOutputPromptRef,
  type PlatformOutputSchemaChecklistItem,
} from '@/lib/generationJobs/platformOutputMapper'
import {getSanityWriteClient} from './sanityWriteClient'

export type CreatePlatformOutputError =
  | 'validation'
  | 'write-disabled'
  | 'missing-token'
  | 'path-rejected'
  | 'not-found'
  | 'parse-error'
  | 'duplicate-found'
  | 'content-idea-mismatch'
  | 'permission'
  | 'unknown'

export interface CreatePlatformOutputInput {
  selectedContentIdeaSlug?: string | null
  contentIdeaSlug: string
  platform: string
  timestamp: string
  mode: 'preview' | 'execute'
}

export interface PlatformOutputDuplicate {
  found: boolean
  existingId?: string
  existingStudioUrl?: string
}

interface PreviewSuccess {
  ok: true
  mode: 'preview'
  contentIdeaSlug: string
  platform: PlatformOutputPlatform
  timestamp: string
  plannedDocumentId: string
  platformOutputDraftSummary: PlatformOutputDraftSummary
  schemaChecklist: PlatformOutputSchemaChecklistItem[]
  missingRequiredFields: string[]
  duplicate: PlatformOutputDuplicate
  sourcePaths: {
    promptPath: string
    jobJsonPath: string
    draftMdPath: string
    draftJsonPath?: string
  }
  warnings: string[]
  writeReady: boolean
  writeDisabledReason: string | null
  createReady: boolean
  studioUrl: string
}

interface ExecuteSuccess {
  ok: true
  mode: 'execute'
  documentId: string
  platform: string
  outputType: string
  status: string
  studioUrl: string
  verified: boolean
}

interface ActionError {
  ok: false
  error: CreatePlatformOutputError
  message: string
  existingId?: string
  existingStudioUrl?: string
  missingRequiredFields?: string[]
}

export type CreatePlatformOutputResult = PreviewSuccess | ExecuteSuccess | ActionError

const PLATFORM_OUTPUT_ID_RE =
  /^platformOutput\.[a-z0-9][a-z0-9-]{0,79}\.[a-z0-9-]{1,24}\.\d{8}-\d{6}$/

interface ExistingPlatformOutput {
  _id: string
  localOutputPath?: string
}

interface PromptDoc {
  _id: string
  title?: string
}

interface CreatedPlatformOutput {
  _id: string
  _type: 'platformOutput'
  sourceContentIdea?: {_ref?: string}
  platform?: string
  outputType?: string
  draftBody?: string
  status?: string
  generatedFromPrompt?: {_ref?: string}
}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[createPlatformOutputFromDraft:${stage}]`, detail)
}

function validateInput(input: CreatePlatformOutputInput):
  | {ok: true; contentIdeaSlug: string; selectedContentIdeaSlug: string; platform: GenerationPlatform; timestamp: string}
  | {ok: false; error: CreatePlatformOutputError; message: string} {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const paths = buildGenerationJobPaths(input.contentIdeaSlug, input.platform, input.timestamp)
  if (!paths.ok) return {ok: false, error: 'path-rejected', message: paths.message}
  if (typeof input.selectedContentIdeaSlug !== 'string') {
    return {ok: false, error: 'validation', message: 'selectedContentIdeaSlug is required'}
  }
  const selectedPaths = buildGenerationJobPaths(
    input.selectedContentIdeaSlug,
    input.platform,
    input.timestamp,
  )
  if (!selectedPaths.ok) {
    return {ok: false, error: 'path-rejected', message: selectedPaths.message}
  }
  if (selectedPaths.contentIdeaSlug !== paths.contentIdeaSlug) {
    return {
      ok: false,
      error: 'content-idea-mismatch',
      message: '選択中のContent Ideaとgeneration jobが一致していません。',
    }
  }
  return {
    ok: true,
    contentIdeaSlug: paths.contentIdeaSlug,
    selectedContentIdeaSlug: selectedPaths.contentIdeaSlug,
    platform: paths.platform,
    timestamp: paths.timestamp,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringAt(value: unknown, path: string[]): string | null {
  let current: unknown = value
  for (const segment of path) {
    if (!isRecord(current)) return null
    current = current[segment]
  }
  return typeof current === 'string' && current.trim() ? current.trim() : null
}

function plannedDocumentId(args: {
  contentIdeaSlug: string
  platform: PlatformOutputPlatform
  timestamp: string
}): string {
  return `platformOutput.${args.contentIdeaSlug}.${args.platform}.${args.timestamp}`
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!process.env.SANITY_WRITE_TOKEN) return 'SANITY_WRITE_TOKEN is not set'
  return null
}

function buildSchemaAllowedDocument(
  id: string,
  draft: PlatformOutputDraft,
): {_id: string; _type: 'platformOutput'} & PlatformOutputDraft {
  return {
    _id: id,
    _type: 'platformOutput',
    sourceContentIdea: draft.sourceContentIdea,
    platform: draft.platform,
    outputType: draft.outputType,
    title: draft.title,
    draftBody: draft.draftBody,
    localOutputPath: draft.localOutputPath,
    status: draft.status,
    reviewNotes: draft.reviewNotes,
    generatedFromPrompt: draft.generatedFromPrompt,
    outputLength: draft.outputLength,
    targetFormat: draft.targetFormat,
    primaryCTA: draft.primaryCTA,
    contentStatus: draft.contentStatus,
  }
}

function validateJobMetadata(args: {
  jobMetadata: unknown
  contentIdeaSlug: string
  platform: GenerationPlatform
}): {ok: true; sourceSlug: string; sourcePlatform: GenerationPlatform} | ActionError {
  const metadataSlug = stringAt(args.jobMetadata, ['sourceContentIdea', 'slug'])
  if (metadataSlug && metadataSlug !== args.contentIdeaSlug) {
    return {
      ok: false,
      error: 'validation',
      message: `job.json sourceContentIdea.slug "${metadataSlug}" does not match selected job slug "${args.contentIdeaSlug}"`,
    }
  }

  const metadataPlatform = stringAt(args.jobMetadata, ['configuration', 'platform'])
  if (metadataPlatform && metadataPlatform !== args.platform) {
    return {
      ok: false,
      error: 'validation',
      message: `job.json configuration.platform "${metadataPlatform}" does not match selected job platform "${args.platform}"`,
    }
  }

  return {
    ok: true,
    sourceSlug: metadataSlug ?? args.contentIdeaSlug,
    sourcePlatform: args.platform,
  }
}

async function fetchContentIdeaBySlug(slug: string): Promise<
  | {ok: true; doc: PlatformOutputContentIdeaDoc}
  | {ok: false; error: CreatePlatformOutputError; message: string}
> {
  try {
    const doc = await sanityClient.fetch<PlatformOutputContentIdeaDoc | null>(
      `*[_type == "contentIdea" && slug.current == $slug][0]{
        _id,
        title,
        slug,
        status,
        summary,
        coreThesis
      }`,
      {slug},
    )
    if (!doc) {
      return {
        ok: false,
        error: 'not-found',
        message: `contentIdea with slug "${slug}" was not found`,
      }
    }
    return {ok: true, doc}
  } catch {
    return {ok: false, error: 'unknown', message: 'failed to fetch contentIdea'}
  }
}

function promptIdFromMetadata(jobMetadata: unknown): string | null {
  return (
    stringAt(jobMetadata, ['generatedFromPrompt', '_ref']) ??
    stringAt(jobMetadata, ['generatedFromPromptId']) ??
    stringAt(jobMetadata, ['promptId']) ??
    stringAt(jobMetadata, ['prompt', '_id']) ??
    stringAt(jobMetadata, ['sourcePrompt', '_id']) ??
    stringAt(jobMetadata, ['configuration', 'promptId'])
  )
}

async function resolvePromptReference(args: {
  jobMetadata: unknown
  platform: string
  outputType: string
}): Promise<PlatformOutputPromptRef | null> {
  const metadataPromptId = promptIdFromMetadata(args.jobMetadata)
  if (metadataPromptId) {
    const prompt = await sanityClient.fetch<PromptDoc | null>(
      `*[_type == "prompt" && _id == $id][0]{_id, title}`,
      {id: metadataPromptId},
    )
    if (prompt?._id) {
      return {...prompt, strategy: 'job-metadata'}
    }
  }

  const platformMatch = await sanityClient.fetch<PromptDoc | null>(
    `*[_type == "prompt" && targetPlatform == $platform && outputType == $outputType] |
      order(status asc, _updatedAt desc)[0]{_id, title}`,
    {platform: args.platform, outputType: args.outputType},
  )
  if (platformMatch?._id) {
    return {...platformMatch, strategy: 'sanity-platform-match'}
  }

  const fallback = await sanityClient.fetch<PromptDoc | null>(
    `*[_type == "prompt"] | order(status asc, _updatedAt desc)[0]{_id, title}`,
  )
  if (fallback?._id) {
    return {...fallback, strategy: 'sanity-fallback'}
  }

  return null
}

async function findDuplicate(args: {
  documentId: string
  draftMdPath: string
  useWriteClient?: ReturnType<typeof getSanityWriteClient>
}): Promise<PlatformOutputDuplicate> {
  const client = args.useWriteClient?.client ?? sanityClient
  const existing = await client.fetch<ExistingPlatformOutput | null>(
    `*[_type == "platformOutput" && (_id == $id || localOutputPath == $draftMdPath)][0]{
      _id,
      localOutputPath
    }`,
    {id: args.documentId, draftMdPath: args.draftMdPath},
  )
  if (!existing) return {found: false}
  return {
    found: true,
    existingId: existing._id,
    existingStudioUrl: studioPlatformOutputUrl(existing._id),
  }
}

async function buildMapped(input: {
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
}): Promise<
  | {
      ok: true
      mapped: MappedPlatformOutput
      documentId: string
    }
  | ActionError
> {
  const paths = buildGenerationJobPaths(input.contentIdeaSlug, input.platform, input.timestamp)
  if (!paths.ok) return {ok: false, error: 'path-rejected', message: paths.message}

  const detail = await readGenerationJobDetail(input.contentIdeaSlug, input.platform, input.timestamp)
  if (!detail.ok) {
    const mappedError: CreatePlatformOutputError =
      detail.error === 'not-found'
        ? 'not-found'
        : detail.error === 'parse-error'
          ? 'parse-error'
          : detail.error === 'path-rejected'
            ? 'path-rejected'
            : 'unknown'
    return {ok: false, error: mappedError, message: detail.message}
  }
  if (!detail.job.draftMarkdown || detail.job.draftMarkdown.trim().length === 0) {
    return {ok: false, error: 'not-found', message: 'draft.md is required before platformOutput create'}
  }

  const metadataCheck = validateJobMetadata({
    jobMetadata: detail.job.jobMetadata,
    contentIdeaSlug: input.contentIdeaSlug,
    platform: input.platform,
  })
  if (!metadataCheck.ok) return metadataCheck

  const contentIdea = await fetchContentIdeaBySlug(metadataCheck.sourceSlug)
  if (!contentIdea.ok) return contentIdea

  const provisional = mapGenerationJobToPlatformOutput({
    jobMetadata: detail.job.jobMetadata,
    draftMarkdown: detail.job.draftMarkdown,
    draftJson: detail.job.draftJson ?? null,
    contentIdea: contentIdea.doc,
    contentIdeaSlug: metadataCheck.sourceSlug,
    platform: metadataCheck.sourcePlatform,
    timestamp: input.timestamp,
    promptPath: detail.job.promptPath,
    jobJsonPath: detail.job.jobJsonPath,
    draftMdPath: detail.job.draftMdPath,
    draftJsonPath: detail.job.draftJsonExists ? detail.job.draftJsonPath : undefined,
    promptRef: null,
  })
  const promptRef = await resolvePromptReference({
    jobMetadata: detail.job.jobMetadata,
    platform: provisional.summary.platform,
    outputType: provisional.summary.outputType,
  })

  const mapped = mapGenerationJobToPlatformOutput({
    jobMetadata: detail.job.jobMetadata,
    draftMarkdown: detail.job.draftMarkdown,
    draftJson: detail.job.draftJson ?? null,
    contentIdea: contentIdea.doc,
    contentIdeaSlug: metadataCheck.sourceSlug,
    platform: metadataCheck.sourcePlatform,
    timestamp: input.timestamp,
    promptPath: detail.job.promptPath,
    jobJsonPath: detail.job.jobJsonPath,
    draftMdPath: detail.job.draftMdPath,
    draftJsonPath: detail.job.draftJsonExists ? detail.job.draftJsonPath : undefined,
    promptRef,
  })
  const documentId = plannedDocumentId({
    contentIdeaSlug: metadataCheck.sourceSlug,
    platform: mapped.summary.platform,
    timestamp: input.timestamp,
  })
  if (!PLATFORM_OUTPUT_ID_RE.test(documentId)) {
    return {ok: false, error: 'validation', message: 'planned platformOutput document id is invalid'}
  }

  return {ok: true, mapped, documentId}
}

function verifyCreatedDoc(doc: CreatedPlatformOutput | null, expected: {
  documentId: string
  sourceContentIdeaId: string
  platform: string
  outputType: string
  generatedFromPromptId: string
}): boolean {
  return Boolean(
    doc &&
      doc._id === expected.documentId &&
      doc._type === 'platformOutput' &&
      doc.sourceContentIdea?._ref === expected.sourceContentIdeaId &&
      doc.platform === expected.platform &&
      doc.outputType === expected.outputType &&
      doc.status === 'drafted' &&
      doc.generatedFromPrompt?._ref === expected.generatedFromPromptId &&
      typeof doc.draftBody === 'string' &&
      doc.draftBody.trim().length > 0,
  )
}

export async function createPlatformOutputFromDraft(
  input: CreatePlatformOutputInput,
): Promise<CreatePlatformOutputResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    contentIdeaSlug: input?.contentIdeaSlug,
    platform: input?.platform,
    timestamp: input?.timestamp,
  })

  const valid = validateInput(input)
  if (!valid.ok) return valid

  const built = await buildMapped(valid)
  if (!built.ok) return built

  const duplicate = await findDuplicate({
    documentId: built.documentId,
    draftMdPath: built.mapped.summary.localOutputPath,
  })
  if (duplicate.found && input.mode === 'execute') {
    return {
      ok: false,
      error: 'duplicate-found',
      message: 'platformOutput already exists for this generation job',
      existingId: duplicate.existingId,
      existingStudioUrl: duplicate.existingStudioUrl,
    }
  }

  const writeReason = writeDisabledReason()
  const createReady = !duplicate.found && built.mapped.missingRequiredFields.length === 0

  if (input.mode === 'preview') {
    logEvent('preview', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: built.mapped.summary.platform,
      timestamp: valid.timestamp,
      fieldCount: Object.keys(built.mapped.platformOutputDraft).length,
      duplicate: duplicate.found,
      missingRequiredCount: built.mapped.missingRequiredFields.length,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'preview',
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: built.mapped.summary.platform,
      timestamp: valid.timestamp,
      plannedDocumentId: built.documentId,
      platformOutputDraftSummary: built.mapped.summary,
      schemaChecklist: built.mapped.schemaChecklist,
      missingRequiredFields: built.mapped.missingRequiredFields,
      duplicate,
      sourcePaths: {
        promptPath: built.mapped.sourceMetadata.promptPath,
        jobJsonPath: built.mapped.sourceMetadata.jobJsonPath,
        draftMdPath: built.mapped.sourceMetadata.draftMdPath,
        draftJsonPath: built.mapped.sourceMetadata.draftJsonPath,
      },
      warnings: built.mapped.warnings,
      writeReady: !writeReason,
      writeDisabledReason: writeReason,
      createReady,
      studioUrl: studioPlatformOutputUrl(built.documentId),
    }
  }

  if (writeReason) {
    return {
      ok: false,
      error: writeReason.includes('TOKEN') ? 'missing-token' : 'write-disabled',
      message: writeReason,
    }
  }
  if (built.mapped.missingRequiredFields.length > 0) {
    return {
      ok: false,
      error: 'validation',
      message: 'platformOutput required fields are missing',
      missingRequiredFields: built.mapped.missingRequiredFields,
    }
  }

  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return {ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN is not set'}
  }

  const duplicateBeforeWrite = await findDuplicate({
    documentId: built.documentId,
    draftMdPath: built.mapped.summary.localOutputPath,
    useWriteClient: writeClient,
  })
  if (duplicateBeforeWrite.found) {
    return {
      ok: false,
      error: 'duplicate-found',
      message: 'platformOutput already exists for this generation job',
      existingId: duplicateBeforeWrite.existingId,
      existingStudioUrl: duplicateBeforeWrite.existingStudioUrl,
    }
  }

  const document = buildSchemaAllowedDocument(
    built.documentId,
    built.mapped.platformOutputDraft,
  )

  try {
    await writeClient.client
      .transaction()
      .create(document)
      .commit({autoGenerateArrayKeys: true, returnDocuments: false})

    const verifiedDoc = await writeClient.client.fetch<CreatedPlatformOutput | null>(
      `*[_type == "platformOutput" && _id == $id][0]{
        _id,
        _type,
        sourceContentIdea,
        platform,
        outputType,
        draftBody,
        status,
        generatedFromPrompt
      }`,
      {id: built.documentId},
    )
    const generatedFromPromptId = built.mapped.platformOutputDraft.generatedFromPrompt?._ref
    const verified = generatedFromPromptId
      ? verifyCreatedDoc(verifiedDoc, {
          documentId: built.documentId,
          sourceContentIdeaId: built.mapped.summary.sourceContentIdeaId,
          platform: built.mapped.summary.platform,
          outputType: built.mapped.summary.outputType,
          generatedFromPromptId,
        })
      : false

    logEvent('execute', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: built.mapped.summary.platform,
      timestamp: valid.timestamp,
      documentId: built.documentId,
      fieldCount: Object.keys(document).length,
      elapsedMs: Date.now() - startedAt,
    })

    return {
      ok: true,
      mode: 'execute',
      documentId: built.documentId,
      platform: built.mapped.summary.platform,
      outputType: built.mapped.summary.outputType,
      status: built.mapped.summary.status,
      studioUrl: studioPlatformOutputUrl(built.documentId),
      verified,
    }
  } catch (err) {
    const statusCode =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? (err as {statusCode?: number}).statusCode
        : undefined
    return {
      ok: false,
      error: statusCode === 401 || statusCode === 403 ? 'permission' : 'unknown',
      message: statusCode === 401 || statusCode === 403
        ? 'Sanity write permission was denied'
        : 'failed to create platformOutput',
    }
  }
}
