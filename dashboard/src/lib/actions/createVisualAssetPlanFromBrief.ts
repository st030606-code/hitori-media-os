'use server'

// Phase 2C-6 — controlled Sanity create for visualAssetPlan from a saved
// generation job visual brief. No image generation and no asset writes.

import {enableWriteActions} from '@/lib/featureFlags'
import {sanityClient, studioVisualAssetPlanUrl} from '@/lib/sanity'
import {buildGenerationJobPaths, type GenerationPlatform} from '@/lib/generationJobs/paths'
import {readGenerationJobDetail} from '@/lib/generationJobs/reader'
import {extractVisualBriefFromGeneratedDraft} from '@/lib/generationJobs/visualBriefExtractor'
import {
  mapVisualBriefToVisualAssetPlan,
  type MappedVisualAssetPlan,
  type VisualAssetPlanContentIdeaDoc,
  type VisualAssetPlanDraft,
  type VisualAssetPlanPlatformOutputDoc,
  type VisualAssetPlanSummary,
  type VisualAssetPlanChecklistItem,
} from '@/lib/generationJobs/visualAssetPlanMapper'
import {getSanityWriteClient} from './sanityWriteClient'

export type CreateVisualAssetPlanError =
  | 'validation'
  | 'write-disabled'
  | 'missing-token'
  | 'path-rejected'
  | 'not-found'
  | 'duplicate-found'
  | 'content-idea-mismatch'
  | 'permission'
  | 'unknown'

export interface CreateVisualAssetPlanInput {
  selectedContentIdeaSlug?: string | null
  contentIdeaSlug: string
  platform: string
  timestamp: string
  placement?: string
  assetType?: string
  aspectRatio?: string
  mode: 'preview' | 'execute'
}

export interface VisualAssetPlanDuplicate {
  found: boolean
  existingId?: string
  existingStudioUrl?: string
}

interface PreviewSuccess {
  ok: true
  mode: 'preview'
  plannedDocumentId: string
  summary: VisualAssetPlanSummary
  schemaChecklist: VisualAssetPlanChecklistItem[]
  missingRequiredFields: string[]
  duplicate: VisualAssetPlanDuplicate
  warnings: string[]
  writeReady: boolean
  writeDisabledReason: string | null
  createReady: boolean
  studioUrl: string
  imagePrompt: string
}

interface ExecuteSuccess {
  ok: true
  mode: 'execute'
  documentId: string
  studioUrl: string
  verified: boolean
  summary: VisualAssetPlanSummary
  imagePrompt: string
}

interface ActionError {
  ok: false
  error: CreateVisualAssetPlanError
  message: string
  existingId?: string
  existingStudioUrl?: string
  missingRequiredFields?: string[]
}

export type CreateVisualAssetPlanResult = PreviewSuccess | ExecuteSuccess | ActionError

const TIMESTAMP_RE = /^\d{8}-\d{6}$/
const VISUAL_PLAN_ID_RE = /^visualAssetPlan\.[a-z0-9][a-z0-9-]{0,79}\.[a-z0-9-]{1,24}\.[a-z0-9-]{1,80}$/

interface CreatedVisualAssetPlan {
  _id: string
  _type: 'visualAssetPlan'
  sourceContentIdea?: {_ref?: string}
  targetPlatform?: string
  status?: string
  imagePrompt?: string
}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[createVisualAssetPlanFromBrief:${stage}]`, detail)
}

function validateInput(input: CreateVisualAssetPlanInput):
  | {ok: true; contentIdeaSlug: string; selectedContentIdeaSlug: string; platform: GenerationPlatform; timestamp: string}
  | ActionError {
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
  if (!selectedPaths.ok) return {ok: false, error: 'path-rejected', message: selectedPaths.message}
  if (selectedPaths.contentIdeaSlug !== paths.contentIdeaSlug) {
    return {
      ok: false,
      error: 'content-idea-mismatch',
      message: '選択中のContent Ideaとgeneration jobが一致していません。',
    }
  }
  if (!TIMESTAMP_RE.test(paths.timestamp)) {
    return {ok: false, error: 'path-rejected', message: 'timestamp must match YYYYMMDD-HHMMSS'}
  }
  return {
    ok: true,
    contentIdeaSlug: paths.contentIdeaSlug,
    selectedContentIdeaSlug: selectedPaths.contentIdeaSlug,
    platform: paths.platform,
    timestamp: paths.timestamp,
  }
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!process.env.SANITY_WRITE_TOKEN) return 'SANITY_WRITE_TOKEN is not set'
  return null
}

function sanitizeIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function plannedDocumentId(args: {slug: string; platform: string; placement: string}): string {
  return `visualAssetPlan.${args.slug}.${args.platform}.${sanitizeIdPart(args.placement)}`
}

async function fetchContentIdea(slug: string): Promise<{ok: true; doc: VisualAssetPlanContentIdeaDoc} | ActionError> {
  try {
    const doc = await sanityClient.fetch<VisualAssetPlanContentIdeaDoc | null>(
      `*[_type == "contentIdea" && slug.current == $slug][0]{_id,title,slug,summary}`,
      {slug},
    )
    if (!doc) return {ok: false, error: 'not-found', message: `contentIdea with slug "${slug}" was not found`}
    return {ok: true, doc}
  } catch {
    return {ok: false, error: 'unknown', message: 'failed to fetch contentIdea'}
  }
}

async function findPairedPlatformOutput(draftMdPath: string): Promise<VisualAssetPlanPlatformOutputDoc | null> {
  try {
    return await sanityClient.fetch<VisualAssetPlanPlatformOutputDoc | null>(
      `*[_type == "platformOutput" && localOutputPath == $draftMdPath][0]{_id,title,platform,localOutputPath}`,
      {draftMdPath},
    )
  } catch {
    return null
  }
}

async function findDuplicate(documentId: string): Promise<VisualAssetPlanDuplicate> {
  const existing = await sanityClient.fetch<{_id: string} | null>(
    `*[_type == "visualAssetPlan" && _id == $id][0]{_id}`,
    {id: documentId},
  )
  if (!existing) return {found: false}
  return {
    found: true,
    existingId: existing._id,
    existingStudioUrl: studioVisualAssetPlanUrl(existing._id),
  }
}

function schemaAllowedDocument(id: string, draft: VisualAssetPlanDraft): {_id: string; _type: 'visualAssetPlan'} & VisualAssetPlanDraft {
  return {
    _id: id,
    _type: 'visualAssetPlan',
    sourceContentIdea: draft.sourceContentIdea,
    pairedPlatformOutput: draft.pairedPlatformOutput,
    title: draft.title,
    purpose: draft.purpose,
    targetPlatform: draft.targetPlatform,
    placement: draft.placement,
    assetType: draft.assetType,
    aspectRatio: draft.aspectRatio,
    reusePolicy: draft.reusePolicy,
    status: draft.status,
    imagePrompt: draft.imagePrompt,
    textToInclude: draft.textToInclude,
    textToAvoid: draft.textToAvoid,
    visualDirection: draft.visualDirection,
    reviewNotes: draft.reviewNotes,
    expectedLocalAssetPath: draft.expectedLocalAssetPath,
    taskFilePath: draft.taskFilePath,
    generationMode: draft.generationMode,
    generationProvider: draft.generationProvider,
    sourcePromptVersion: draft.sourcePromptVersion,
    apiEnabled: draft.apiEnabled,
    automationNotes: draft.automationNotes,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  }
}

async function buildMapped(input: CreateVisualAssetPlanInput & {platform: GenerationPlatform}): Promise<
  | {ok: true; mapped: MappedVisualAssetPlan; documentId: string}
  | ActionError
> {
  const paths = buildGenerationJobPaths(input.contentIdeaSlug, input.platform, input.timestamp)
  if (!paths.ok) return {ok: false, error: 'path-rejected', message: paths.message}
  const detail = await readGenerationJobDetail(input.contentIdeaSlug, input.platform, input.timestamp)
  if (!detail.ok) return {ok: false, error: detail.error === 'not-found' ? 'not-found' : 'unknown', message: detail.message}
  if (!detail.job.draftMarkdown?.trim()) {
    return {ok: false, error: 'not-found', message: 'draft.md is required before visualAssetPlan create'}
  }
  const visualBriefMarkdown =
    detail.job.visualBriefMarkdown ??
    extractVisualBriefFromGeneratedDraft({
      draftMarkdown: detail.job.draftMarkdown,
      platform: input.platform,
      jobMetadata: detail.job.jobMetadata,
      draftJson: detail.job.draftJson,
    }).visualBriefMarkdown
  if (!visualBriefMarkdown.trim()) {
    return {ok: false, error: 'not-found', message: 'visual brief was not found; run Visual Brief extraction first'}
  }
  const contentIdea = await fetchContentIdea(input.contentIdeaSlug)
  if (!contentIdea.ok) return contentIdea
  const platformOutput = await findPairedPlatformOutput(paths.expectedDraftMdRelative)
  const structured = extractVisualBriefFromGeneratedDraft({
    draftMarkdown: visualBriefMarkdown,
    platform: input.platform,
    jobMetadata: detail.job.jobMetadata,
    draftJson: detail.job.visualBriefJson ?? detail.job.draftJson,
  }).structuredVisualBrief
  const mapped = mapVisualBriefToVisualAssetPlan({
    contentIdea: contentIdea.doc,
    platformOutput,
    contentIdeaSlug: input.contentIdeaSlug,
    platform: input.platform,
    timestamp: input.timestamp,
    visualBriefMarkdown,
    structuredVisualBrief: structured,
    visualBriefMdPath: paths.visualBriefMdRelative,
    visualBriefJsonPath: detail.job.visualBriefJsonExists ? paths.visualBriefJsonRelative : null,
    draftMdPath: paths.expectedDraftMdRelative,
    placement: input.placement,
    assetType: input.assetType,
    aspectRatio: input.aspectRatio,
  })
  const documentId = plannedDocumentId({
    slug: input.contentIdeaSlug,
    platform: mapped.summary.targetPlatform,
    placement: mapped.summary.placement,
  })
  if (!VISUAL_PLAN_ID_RE.test(documentId)) {
    return {ok: false, error: 'validation', message: 'planned visualAssetPlan document id is invalid'}
  }
  return {ok: true, mapped, documentId}
}

function verify(doc: CreatedVisualAssetPlan | null, expected: {id: string; sourceContentIdeaId: string; platform: string}): boolean {
  return Boolean(
    doc &&
      doc._id === expected.id &&
      doc._type === 'visualAssetPlan' &&
      doc.sourceContentIdea?._ref === expected.sourceContentIdeaId &&
      doc.targetPlatform === expected.platform &&
      doc.status === 'planned' &&
      typeof doc.imagePrompt === 'string' &&
      doc.imagePrompt.trim().length > 0,
  )
}

export async function createVisualAssetPlanFromBrief(
  input: CreateVisualAssetPlanInput,
): Promise<CreateVisualAssetPlanResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    contentIdeaSlug: input?.contentIdeaSlug,
    platform: input?.platform,
    timestamp: input?.timestamp,
  })
  const valid = validateInput(input)
  if (!valid.ok) return valid
  const built = await buildMapped({...input, platform: valid.platform})
  if (!built.ok) return built
  const duplicate = await findDuplicate(built.documentId)
  if (duplicate.found && input.mode === 'execute') {
    return {
      ok: false,
      error: 'duplicate-found',
      message: 'visualAssetPlan already exists for this generation job placement',
      existingId: duplicate.existingId,
      existingStudioUrl: duplicate.existingStudioUrl,
    }
  }

  const disabledReason = writeDisabledReason()
  const createReady = !duplicate.found && built.mapped.missingRequiredFields.length === 0

  if (input.mode === 'preview') {
    logEvent('preview', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: built.mapped.summary.targetPlatform,
      timestamp: valid.timestamp,
      fieldCount: Object.keys(built.mapped.visualAssetPlanDraft).length,
      duplicate: duplicate.found,
      missingRequiredCount: built.mapped.missingRequiredFields.length,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'preview',
      plannedDocumentId: built.documentId,
      summary: built.mapped.summary,
      schemaChecklist: built.mapped.schemaChecklist,
      missingRequiredFields: built.mapped.missingRequiredFields,
      duplicate,
      warnings: built.mapped.warnings,
      writeReady: !disabledReason,
      writeDisabledReason: disabledReason,
      createReady,
      studioUrl: studioVisualAssetPlanUrl(built.documentId),
      imagePrompt: built.mapped.visualAssetPlanDraft.imagePrompt,
    }
  }

  if (disabledReason) {
    return {
      ok: false,
      error: disabledReason.includes('TOKEN') ? 'missing-token' : 'write-disabled',
      message: disabledReason,
    }
  }
  if (built.mapped.missingRequiredFields.length > 0) {
    return {
      ok: false,
      error: 'validation',
      message: 'visualAssetPlan required fields are missing',
      missingRequiredFields: built.mapped.missingRequiredFields,
    }
  }

  const writeClient = getSanityWriteClient()
  if (!writeClient) return {ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN is not set'}
  const duplicateBeforeWrite = await writeClient.client.fetch<{_id: string} | null>(
    `*[_type == "visualAssetPlan" && _id == $id][0]{_id}`,
    {id: built.documentId},
  )
  if (duplicateBeforeWrite?._id) {
    return {
      ok: false,
      error: 'duplicate-found',
      message: 'visualAssetPlan already exists for this generation job placement',
      existingId: duplicateBeforeWrite._id,
      existingStudioUrl: studioVisualAssetPlanUrl(duplicateBeforeWrite._id),
    }
  }

  try {
    const document = schemaAllowedDocument(built.documentId, built.mapped.visualAssetPlanDraft)
    await writeClient.client.transaction().create(document).commit({
      autoGenerateArrayKeys: true,
      returnDocuments: false,
    })
    const created = await writeClient.client.fetch<CreatedVisualAssetPlan | null>(
      `*[_type == "visualAssetPlan" && _id == $id][0]{
        _id,_type,sourceContentIdea,targetPlatform,status,imagePrompt
      }`,
      {id: built.documentId},
    )
    const verified = verify(created, {
      id: built.documentId,
      sourceContentIdeaId: built.mapped.summary.sourceContentIdeaId,
      platform: built.mapped.summary.targetPlatform,
    })
    logEvent('execute', {
      contentIdeaSlug: valid.contentIdeaSlug,
      platform: built.mapped.summary.targetPlatform,
      timestamp: valid.timestamp,
      documentId: built.documentId,
      fieldCount: Object.keys(document).length,
      elapsedMs: Date.now() - startedAt,
    })
    return {
      ok: true,
      mode: 'execute',
      documentId: built.documentId,
      studioUrl: studioVisualAssetPlanUrl(built.documentId),
      verified,
      summary: built.mapped.summary,
      imagePrompt: built.mapped.visualAssetPlanDraft.imagePrompt,
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
        : 'failed to create visualAssetPlan',
    }
  }
}
