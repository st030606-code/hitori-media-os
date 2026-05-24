'use server'

// Phase 2C-1B — controlled Sanity create for contentIdea.
//
// What this server action does:
//   - mode='preview': read idea-jobs/<slug>/<timestamp>/result.json,
//                     map it through the schema-aligned Content Idea mapper,
//                     check duplicates by deterministic _id + slug.current,
//                     and return a create plan. NO Sanity write.
//   - mode='execute': repeat the full read/map/validate/duplicate pass,
//                     require ENABLE_WRITE_ACTIONS + SANITY_WRITE_TOKEN,
//                     create exactly one contentIdea document, and verify it.
//
// Boundaries:
//   - No schema changes.
//   - No arbitrary JSON passthrough.
//   - No enrichedDraft/provenance writes; only schema-aligned studioDraft
//     fields are copied into the Sanity document.
//   - No campaignPlan / platformOutput / publishedOutput creation.
//   - Metadata-only logs. Never log result bodies, draft bodies, or tokens.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {sanityClient, studioContentIdeaUrl} from '@/lib/sanity'
import {
  mapResultToContentIdea,
  type ContentIdeaStudioDraft,
  type MappedContentIdea,
  type SchemaChecklistItem,
} from '@/lib/ideaJobs/contentIdeaMapper'
import {IDEA_JOBS_PREFIX, validateIdeaSlug} from '@/lib/ideaJobs/paths'
import {readRawIdeaJson, readResultJson} from '@/lib/ideaJobs/reader'
import {getSanityWriteClient} from './sanityWriteClient'

export type CreateContentIdeaError =
  | 'validation'
  | 'write-disabled'
  | 'missing-token'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'not-found'
  | 'parse-error'
  | 'too-large'
  | 'duplicate-found'
  | 'permission'
  | 'unknown'

export interface CreateContentIdeaInput {
  ideaSlug: string
  timestamp: string
  mode: 'preview' | 'execute'
}

export interface CreateContentIdeaDuplicate {
  found: boolean
  existingId?: string
  existingSlug?: string
  existingStudioUrl?: string
}

interface PreviewSuccess {
  ok: true
  mode: 'preview'
  ideaSlug: string
  timestamp: string
  plannedDocumentId: string
  slugCurrent: string
  studioUrl: string
  studioDraft: ContentIdeaStudioDraft
  schemaChecklist: SchemaChecklistItem[]
  missingRequiredFields: string[]
  manualEditFields: string[]
  duplicate: CreateContentIdeaDuplicate
  writeReady: boolean
  writeDisabledReason: string | null
}

interface ExecuteSuccess {
  ok: true
  mode: 'execute'
  documentId: string
  slugCurrent: string
  studioUrl: string
  createdAt: string | null
  verified: boolean
}

interface ActionError {
  ok: false
  error: CreateContentIdeaError
  message: string
  existingId?: string
  existingStudioUrl?: string
  missingRequiredFields?: string[]
}

export type CreateContentIdeaResult = PreviewSuccess | ExecuteSuccess | ActionError

const TIMESTAMP_RE = /^\d{8}-\d{6}$/
const CONTENT_IDEA_ID_RE = /^contentIdea\.[a-z0-9][a-z0-9-]{0,79}$/

interface ExistingContentIdea {
  _id: string
  slug?: {current?: string}
}

interface CreatedContentIdea {
  _id: string
  _createdAt?: string
  _type: 'contentIdea'
  slug?: {current?: string}
  title?: string
  status?: string
  summary?: string
  coreThesis?: string
  audience?: string[]
  audiencePain?: string
  claims?: Array<{claim?: string}>
  tone?: {voice?: string}
  platformAngles?: Array<{platform?: string}>
}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(`[createContentIdeaFromResult:${stage}]`, detail)
}

function validateInput(input: CreateContentIdeaInput):
  | {ok: true; ideaSlug: string; timestamp: string}
  | {ok: false; error: CreateContentIdeaError; message: string} {
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }
  const slugCheck = validateIdeaSlug(input.ideaSlug)
  if (!slugCheck.ok) {
    return {ok: false, error: 'path-rejected', message: slugCheck.message}
  }
  if (typeof input.timestamp !== 'string' || !TIMESTAMP_RE.test(input.timestamp)) {
    return {ok: false, error: 'path-rejected', message: 'timestamp must match YYYYMMDD-HHMMSS'}
  }
  return {ok: true, ideaSlug: slugCheck.slug, timestamp: input.timestamp}
}

function validateMappedDraft(mapped: MappedContentIdea): {
  missingRequiredFields: string[]
  manualEditFields: string[]
} {
  return {
    missingRequiredFields: mapped.schemaChecklist
      .filter((item) => item.state === 'missing')
      .map((item) => item.label),
    manualEditFields: mapped.schemaChecklist
      .filter((item) => item.state === 'needs-manual-edit')
      .map((item) => item.label),
  }
}

function buildDocumentId(slugCurrent: string): string {
  return `contentIdea.${slugCurrent}`
}

function writeDisabledReason(): string | null {
  if (!enableWriteActions) return 'ENABLE_WRITE_ACTIONS is off'
  if (!process.env.SANITY_WRITE_TOKEN) return 'SANITY_WRITE_TOKEN is not set'
  return null
}

function buildSchemaAllowedDocument(
  id: string,
  draft: ContentIdeaStudioDraft,
): {_id: string; _type: 'contentIdea'} & ContentIdeaStudioDraft {
  return {
    _id: id,
    _type: 'contentIdea',
    title: draft.title,
    slug: draft.slug,
    status: draft.status,
    summary: draft.summary,
    rawInput: draft.rawInput,
    coreThesis: draft.coreThesis,
    audience: draft.audience,
    audiencePain: draft.audiencePain,
    contentPillars: draft.contentPillars,
    claims: draft.claims,
    evidence: draft.evidence,
    objections: draft.objections,
    examples: draft.examples,
    platformAngles: draft.platformAngles,
    tone: draft.tone,
    sourceLinks: draft.sourceLinks,
    outputChecklist: draft.outputChecklist,
    personalContext: draft.personalContext,
  }
}

async function buildMapped(input: {ideaSlug: string; timestamp: string}):
  Promise<
    | {
        ok: true
        mapped: MappedContentIdea
      }
    | {
        ok: false
        error: CreateContentIdeaError
        message: string
      }
  > {
  const resultRead = await readResultJson(input.ideaSlug, input.timestamp)
  if (!resultRead.ok) {
    const mappedError: CreateContentIdeaError =
      resultRead.error === 'not-found'
        ? 'not-found'
        : resultRead.error === 'too-large'
          ? 'too-large'
          : resultRead.error === 'parse-error'
            ? 'parse-error'
            : resultRead.error === 'path-rejected'
              ? 'path-rejected'
              : 'unknown'
    return {ok: false, error: mappedError, message: resultRead.message}
  }

  const rawRead = await readRawIdeaJson(input.ideaSlug)
  const rawIdea = rawRead.ok ? rawRead.data : null
  const resultJsonPath = `${IDEA_JOBS_PREFIX}/${input.ideaSlug}/${input.timestamp}/result.json`
  const resultMdPath = `${IDEA_JOBS_PREFIX}/${input.ideaSlug}/${input.timestamp}/result.md`
  const rawJsonPath = `${IDEA_JOBS_PREFIX}/${input.ideaSlug}/_raw.json`

  return {
    ok: true,
    mapped: mapResultToContentIdea({
      result: resultRead.data,
      rawIdea,
      ideaSlug: input.ideaSlug,
      timestamp: input.timestamp,
      resultJsonPath,
      resultMdPath,
      rawJsonPath,
      preparedAtIso: new Date().toISOString(),
    }),
  }
}

async function findDuplicate(args: {
  documentId: string
  slugCurrent: string
  useWriteClient?: ReturnType<typeof getSanityWriteClient>
}): Promise<CreateContentIdeaDuplicate> {
  const client = args.useWriteClient?.client ?? sanityClient
  const existing = await client.fetch<ExistingContentIdea | null>(
    `*[_type == "contentIdea" && (_id == $id || slug.current == $slug)][0]{
      _id,
      slug
    }`,
    {id: args.documentId, slug: args.slugCurrent},
  )
  if (!existing) return {found: false}
  return {
    found: true,
    existingId: existing._id,
    existingSlug: existing.slug?.current,
    existingStudioUrl: studioContentIdeaUrl(existing._id),
  }
}

function verifyCreatedDoc(doc: CreatedContentIdea | null, expected: {
  documentId: string
  slugCurrent: string
}): boolean {
  return Boolean(
    doc &&
      doc._id === expected.documentId &&
      doc._type === 'contentIdea' &&
      doc.slug?.current === expected.slugCurrent &&
      typeof doc.title === 'string' &&
      typeof doc.status === 'string' &&
      typeof doc.summary === 'string' &&
      typeof doc.coreThesis === 'string' &&
      Array.isArray(doc.audience) &&
      typeof doc.audiencePain === 'string' &&
      Array.isArray(doc.claims) &&
      doc.claims.length > 0 &&
      doc.claims.every((claim) => typeof claim.claim === 'string' && claim.claim.length > 0) &&
      typeof doc.tone?.voice === 'string' &&
      doc.tone.voice.length > 0 &&
      Array.isArray(doc.platformAngles) &&
      doc.platformAngles.length > 0 &&
      doc.platformAngles.every((angle) => typeof angle.platform === 'string' && angle.platform.length > 0),
  )
}

export async function createContentIdeaFromResult(
  input: CreateContentIdeaInput,
): Promise<CreateContentIdeaResult> {
  const startedAt = Date.now()
  logEvent('start', {
    mode: input?.mode,
    ideaSlug: input?.ideaSlug,
    timestamp: input?.timestamp,
  })

  const valid = validateInput(input)
  if (!valid.ok) {
    logEvent('rejected', {reason: valid.error})
    return {ok: false, error: valid.error, message: valid.message}
  }
  const {ideaSlug, timestamp} = valid

  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled', mode: input.mode})
    return {ok: false, error: 'localfs-disabled', message: 'ENABLE_LOCAL_FS_ROUTES is off'}
  }

  const mappedResult = await buildMapped({ideaSlug, timestamp})
  if (!mappedResult.ok) {
    logEvent('rejected', {reason: mappedResult.error, mode: input.mode})
    return {ok: false, error: mappedResult.error, message: mappedResult.message}
  }

  const mapped = mappedResult.mapped
  const slugCurrent = mapped.studioDraft.slug.current
  const documentId = buildDocumentId(slugCurrent)
  if (!CONTENT_IDEA_ID_RE.test(documentId)) {
    logEvent('rejected', {reason: 'validation', detail: 'document-id-format'})
    return {ok: false, error: 'validation', message: 'planned contentIdea document id is invalid'}
  }

  const {missingRequiredFields, manualEditFields} = validateMappedDraft(mapped)
  if (missingRequiredFields.length > 0) {
    logEvent('rejected', {
      reason: 'required-fields-missing',
      mode: input.mode,
      slug: slugCurrent,
      missingCount: missingRequiredFields.length,
    })
    return {
      ok: false,
      error: 'validation',
      message: 'schema-informed required fields are missing',
      missingRequiredFields,
    }
  }

  if (input.mode === 'preview') {
    let duplicate: CreateContentIdeaDuplicate
    try {
      duplicate = await findDuplicate({documentId, slugCurrent})
    } catch (e) {
      logEvent('error', {
        stage: 'duplicate-fetch',
        mode: 'preview',
        message: e instanceof Error ? e.message : String(e),
      })
      return {ok: false, error: 'unknown', message: 'Failed to check duplicate contentIdea'}
    }
    logEvent('preview-ok', {
      ideaSlug,
      timestamp,
      slug: slugCurrent,
      documentId,
      duplicateFound: duplicate.found,
      fieldCount: Object.keys(mapped.studioDraft).length,
      missingCount: missingRequiredFields.length,
      manualEditCount: manualEditFields.length,
      elapsedMs: Date.now() - startedAt,
    })
    const reason = writeDisabledReason()
    return {
      ok: true,
      mode: 'preview',
      ideaSlug,
      timestamp,
      plannedDocumentId: documentId,
      slugCurrent,
      studioUrl: studioContentIdeaUrl(documentId),
      studioDraft: mapped.studioDraft,
      schemaChecklist: mapped.schemaChecklist,
      missingRequiredFields,
      manualEditFields,
      duplicate,
      writeReady: reason === null,
      writeDisabledReason: reason,
    }
  }

  if (!enableWriteActions) {
    logEvent('rejected', {reason: 'write-disabled', mode: 'execute'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }

  const handle = getSanityWriteClient()
  if (!handle) {
    logEvent('rejected', {reason: 'missing-token', mode: 'execute'})
    return {ok: false, error: 'missing-token', message: 'SANITY_WRITE_TOKEN is not set'}
  }

  let duplicate: CreateContentIdeaDuplicate
  try {
    duplicate = await findDuplicate({documentId, slugCurrent, useWriteClient: handle})
  } catch (e) {
    logEvent('error', {
      stage: 'duplicate-fetch',
      mode: 'execute',
      message: e instanceof Error ? e.message : String(e),
    })
    return {ok: false, error: 'unknown', message: 'Failed to check duplicate contentIdea'}
  }
  if (duplicate.found) {
    logEvent('rejected', {
      reason: 'duplicate-found',
      slug: slugCurrent,
      existingId: duplicate.existingId,
    })
    return {
      ok: false,
      error: 'duplicate-found',
      message: '同じ slug の Content Idea が既にあります',
      existingId: duplicate.existingId,
      existingStudioUrl: duplicate.existingStudioUrl,
    }
  }

  const doc = buildSchemaAllowedDocument(documentId, mapped.studioDraft)
  try {
    await handle.client.transaction().create(doc).commit({
      autoGenerateArrayKeys: true,
      returnDocuments: false,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const status =
      typeof e === 'object' && e !== null && 'statusCode' in e
        ? (e as {statusCode?: unknown}).statusCode
        : undefined
    if (status === 409 || /already exists|duplicate|conflict/i.test(message)) {
      logEvent('duplicate', {slug: slugCurrent, documentId})
      return {
        ok: false,
        error: 'duplicate-found',
        message: '同じ slug の Content Idea が既にあります',
        existingId: documentId,
        existingStudioUrl: studioContentIdeaUrl(documentId),
      }
    }
    if (status === 401 || status === 403 || /unauthor|forbidden|insufficient/i.test(message)) {
      logEvent('permission', {message})
      return {ok: false, error: 'permission', message: 'Sanity token lacks create permission'}
    }
    logEvent('error', {stage: 'create', message})
    return {ok: false, error: 'unknown', message: 'Failed to create contentIdea'}
  }

  let created: CreatedContentIdea | null = null
  try {
    created = await handle.client.fetch<CreatedContentIdea | null>(
      `*[_id == $id && _type == "contentIdea"][0]{
        _id,
        _createdAt,
        _type,
        slug,
        title,
        status,
        summary,
        coreThesis,
        audience,
        audiencePain,
        claims[]{claim},
        tone{voice},
        platformAngles[]{platform}
      }`,
      {id: documentId},
    )
  } catch (e) {
    logEvent('verify-error', {message: e instanceof Error ? e.message : String(e)})
  }

  const verified = verifyCreatedDoc(created, {documentId, slugCurrent})
  logEvent('execute-ok', {
    ideaSlug,
    timestamp,
    slug: slugCurrent,
    documentId,
    fieldCount: Object.keys(mapped.studioDraft).length,
    verified,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'execute',
    documentId,
    slugCurrent,
    studioUrl: studioContentIdeaUrl(documentId),
    createdAt: created?._createdAt ?? null,
    verified,
  }
}
