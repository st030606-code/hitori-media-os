'use server'

// Phase 2C-1 — Server action that prepares a Sanity Content Idea draft from
// an idea-jobs/<slug>/<timestamp>/result.json.
//
// Boundaries (handoff/0197 CONFIRMED):
//   - Read-only. NO filesystem writes (Phase 2C-0 already wrote those).
//   - NO Sanity reads or writes — schema is referenced only as a target
//     shape inside the mapper.
//   - NO LLM API calls. NO shell execution.
//   - Server logs are metadata only — never the result body, never the
//     mapped draft body, never tokens.
//
// The action requires `enableLocalFsRoutes=true` (Phase 2B-3 pattern) to
// touch the filesystem at all. `enableWriteActions` is NOT required since
// this is a read-only helper.

import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {studioContentIdeasListUrl} from '@/lib/sanity'
import {
  mapResultToContentIdea,
  type MappedContentIdea,
} from '@/lib/ideaJobs/contentIdeaMapper'
import {
  IDEA_JOBS_PREFIX,
  validateIdeaSlug,
} from '@/lib/ideaJobs/paths'
import {readResultJson, readRawIdeaJson} from '@/lib/ideaJobs/reader'

export type PrepareContentIdeaError =
  | 'validation'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'not-found'
  | 'parse-error'
  | 'too-large'
  | 'unknown'

export interface PrepareContentIdeaInput {
  ideaSlug: string
  timestamp: string
  /** mode is fixed to 'preview' for Phase 2C-1; the parameter is kept for
   *  shape parity with other Phase 2C actions and future expansion. */
  mode: 'preview'
}

const STUDIO_BASE_URL_DEFAULT = 'http://localhost:3333'

export interface StudioHandoffLink {
  url: string
  label: string
  /** Recommended click priority for the UI.
   *  `primary` is the safe entry point (Studio root). */
  kind: 'primary' | 'byType' | 'intentExperimental'
  /** When true, surface a warning chip in the UI — this URL may not work
   *  on every Studio configuration. */
  experimental: boolean
}

export interface PrepareContentIdeaResult_Ok {
  ok: true
  mode: 'preview'
  ideaSlug: string
  timestamp: string
  resultJsonPath: string
  resultMdPath: string
  rawJsonPath: string
  studioBaseUrl: string
  studioLinks: {
    primary: StudioHandoffLink
    byType: StudioHandoffLink
    intentExperimental: StudioHandoffLink
  }
  /** Whether the optional `_raw.json` was read successfully. */
  rawIdeaAvailable: boolean
  mapped: MappedContentIdea
  metrics: {
    resultJsonBytes: number
    copyableJsonBytes: number
    fieldClipboardCount: number
    warningCount: number
    fieldWarningCount: number
  }
}

export type PrepareContentIdeaResult =
  | PrepareContentIdeaResult_Ok
  | {ok: false; error: PrepareContentIdeaError; message: string}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // Phase 2B / 2C logging contract: metadata only — never log:
  //   - result body / _raw.json roughMemo body
  //   - studioDraft fields (claims / objections / examples ...)
  //   - JSON copyable text
  //   - any token
  // Lengths / counts / slug + timestamp only.
  // eslint-disable-next-line no-console
  console.log(`[prepareContentIdeaFromResult:${stage}]`, detail)
}

export async function prepareContentIdeaFromResult(
  input: PrepareContentIdeaInput,
): Promise<PrepareContentIdeaResult> {
  const startedAt = Date.now()

  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" in Phase 2C-1'}
  }

  // 1. Slug + timestamp validation via shared helper.
  const slugCheck = validateIdeaSlug(input.ideaSlug)
  if (!slugCheck.ok) {
    logEvent('rejected', {reason: 'bad-slug', detail: slugCheck.error})
    return {ok: false, error: 'path-rejected', message: slugCheck.message}
  }
  if (typeof input.timestamp !== 'string' || !/^\d{8}-\d{6}$/.test(input.timestamp)) {
    logEvent('rejected', {reason: 'bad-timestamp'})
    return {
      ok: false,
      error: 'path-rejected',
      message: 'timestamp must match YYYYMMDD-HHMMSS',
    }
  }

  // 2. Filesystem read requires the local-fs route flag.
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled'})
    return {
      ok: false,
      error: 'localfs-disabled',
      message: 'ENABLE_LOCAL_FS_ROUTES is off',
    }
  }

  // 3. Read result.json (required).
  const resultRead = await readResultJson(slugCheck.slug, input.timestamp)
  if (!resultRead.ok) {
    const mapped =
      resultRead.error === 'not-found'
        ? 'not-found'
        : resultRead.error === 'too-large'
          ? 'too-large'
          : resultRead.error === 'parse-error'
            ? 'parse-error'
            : 'unknown'
    logEvent('rejected', {reason: resultRead.error, source: 'result.json'})
    return {ok: false, error: mapped as PrepareContentIdeaError, message: resultRead.message}
  }

  // 4. Read _raw.json (optional metadata).
  const rawRead = await readRawIdeaJson(slugCheck.slug)
  const rawIdea = rawRead.ok ? rawRead.data : null

  // 5. Map to Content Idea draft.
  const ideaSlug = slugCheck.slug
  const timestamp = input.timestamp
  const resultJsonPath = `${IDEA_JOBS_PREFIX}/${ideaSlug}/${timestamp}/result.json`
  const resultMdPath = `${IDEA_JOBS_PREFIX}/${ideaSlug}/${timestamp}/result.md`
  const rawJsonPath = `${IDEA_JOBS_PREFIX}/${ideaSlug}/_raw.json`
  const preparedAtIso = new Date().toISOString()
  const mapped = mapResultToContentIdea({
    result: resultRead.data,
    rawIdea,
    ideaSlug,
    timestamp,
    resultJsonPath,
    resultMdPath,
    rawJsonPath,
    preparedAtIso,
  })

  // Build a small handoff link set. The previous Phase 2C-1 used
  // `/structure/contentIdea;new` as a single deep link, but boss-smoke
  // observed that route renders a blank right pane on some Studio configs.
  // We now offer three increasingly specific options; the UI picks the
  // primary one as the main CTA and exposes the others as fallbacks.
  const studioBaseUrlRaw = process.env.NEXT_PUBLIC_STUDIO_BASE_URL || STUDIO_BASE_URL_DEFAULT
  const studioBaseUrl = studioBaseUrlRaw.replace(/\/$/, '')
  const contentIdeasListUrl = studioContentIdeasListUrl()
  const studioLinks: PrepareContentIdeaResult_Ok['studioLinks'] = {
    primary: {
      url: `${studioBaseUrl}/structure`,
      label: 'Studio を開く (左ペインから Content Ideas を選ぶ)',
      kind: 'primary',
      experimental: false,
    },
    byType: {
      url: contentIdeasListUrl,
      label: 'Content Ideas 一覧を開く',
      kind: 'byType',
      experimental: false,
    },
    intentExperimental: {
      url: `${studioBaseUrl}/intent/create/template=contentIdea;type=contentIdea`,
      label: '(experimental) intent で新規作成を試す',
      kind: 'intentExperimental',
      experimental: true,
    },
  }

  const resultJsonBytes = Buffer.byteLength(JSON.stringify(resultRead.data), 'utf8')
  const copyableJsonBytes = Buffer.byteLength(mapped.copyableJsonText, 'utf8')
  const fieldClipboardCount = Object.keys(mapped.fieldClipboards).length
  const warningCount = mapped.warnings.length
  const fieldWarningCount = Object.keys(mapped.fieldWarnings).length

  logEvent('preview-ok', {
    ideaSlug,
    timestamp,
    rawIdeaAvailable: rawIdea !== null,
    resultJsonBytes,
    copyableJsonBytes,
    fieldClipboardCount,
    warningCount,
    fieldWarningCount,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'preview',
    ideaSlug,
    timestamp,
    resultJsonPath,
    resultMdPath,
    rawJsonPath,
    studioBaseUrl,
    studioLinks,
    rawIdeaAvailable: rawIdea !== null,
    mapped,
    metrics: {
      resultJsonBytes,
      copyableJsonBytes,
      fieldClipboardCount,
      warningCount,
      fieldWarningCount,
    },
  }
}
