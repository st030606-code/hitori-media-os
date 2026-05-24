'use server'

// Phase 2C-0.1 — Server action that saves an AI-developed idea result
// (boss-pasted ChatGPT / Claude / Codex output) into the existing
// `idea-jobs/<ideaSlug>/<timestamp>/` directory created by Phase 2C-0.
//
// Boundaries (CONFIRMED handoff/0197):
//   - No external LLM API call (Q-2C-6).
//   - No shell execution (Q-2C-6).
//   - No Sanity write (Q-2C-1 / Q-2C-8).
//   - Filesystem writes only under `idea-jobs/<ideaSlug>/<timestamp>/`
//     with `.md` / `.json` extensions, 200 KB cap, atomic write.
//   - Requires enableWriteActions AND enableLocalFsRoutes (Q-2C-7).

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  atomicWriteIdeaJobFile,
  buildIdeaJobPaths,
  type IdeaJobPaths,
  type IdeaPathErrorDetail,
} from '@/lib/ideaJobs/paths'
import {
  parseAiDevelopmentResult,
  type ExpectedField,
} from '@/lib/ideaJobs/resultParser'

export type SaveResultError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'parse-error'
  | 'write-failed'
  | 'unknown'

export interface SaveIdeaDevelopmentResultInput {
  ideaSlug: string
  /** YYYYMMDD-HHMMSS — must match an existing idea-job sub-directory
   *  produced by `createIdeaDevelopmentPackage` execute. */
  timestamp: string
  resultText: string
  mode: 'preview' | 'execute'
}

export interface ResultSavePreviewPayload {
  ideaSlug: string
  timestamp: string
  resultMdPath: string
  /** Only present when structured JSON was detected. */
  resultJsonPath: string | null
  detectedFields: ExpectedField[]
  parseWarnings: string[]
  previewExcerpt: string
  /** Byte sizes (UTF-8) so the UI can show "x KB" hints. */
  metrics: {
    resultBytes: number
    structuredJsonBytes: number | null
    detectedFieldCount: number
  }
  /** True when boss can copy the structured JSON for future Studio entry. */
  hasStructuredJson: boolean
  structuredJsonText: string | null
}

export type SaveIdeaDevelopmentResultResult =
  | ({ok: true; mode: 'preview'} & ResultSavePreviewPayload)
  | ({ok: true; mode: 'execute'; committedAt: string} & ResultSavePreviewPayload)
  | {ok: false; error: SaveResultError; message: string}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // Phase 2B/2C logging contract: metadata only — never log:
  //   - result body / markdown text
  //   - structured JSON values
  //   - any token value
  // Byte sizes, field counts, slug + timestamp only.
  // eslint-disable-next-line no-console
  console.log(`[saveIdeaDevelopmentResult:${stage}]`, detail)
}

function isPathError(value: unknown): value is IdeaPathErrorDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    (value as {ok: unknown}).ok === false &&
    'error' in value
  )
}

function buildPreviewPayload(args: {
  paths: IdeaJobPaths
  parsed: ReturnType<typeof parseAiDevelopmentResult>
  resultText: string
}): ResultSavePreviewPayload {
  const {paths, parsed, resultText} = args
  if (!parsed.ok) {
    // Caller ensures we never reach this branch via the parse-error short
    // circuit; defensive narrowing only.
    throw new Error('buildPreviewPayload: parsed.ok must be true')
  }
  const resultBytes = Buffer.byteLength(resultText, 'utf8')
  const structuredJsonBytes =
    parsed.structuredJsonText !== null
      ? Buffer.byteLength(parsed.structuredJsonText, 'utf8')
      : null
  return {
    ideaSlug: paths.ideaSlug,
    timestamp: paths.timestamp,
    resultMdPath: paths.expectedResultMdRelative,
    resultJsonPath: parsed.structuredJsonText !== null ? paths.expectedResultJsonRelative : null,
    detectedFields: parsed.detectedFields,
    parseWarnings: parsed.parseWarnings,
    previewExcerpt: parsed.previewExcerpt,
    metrics: {
      resultBytes,
      structuredJsonBytes,
      detectedFieldCount: parsed.detectedFields.length,
    },
    hasStructuredJson: parsed.structuredJson !== null,
    structuredJsonText: parsed.structuredJsonText,
  }
}

export async function saveIdeaDevelopmentResult(
  input: SaveIdeaDevelopmentResultInput,
): Promise<SaveIdeaDevelopmentResultResult> {
  const startedAt = Date.now()
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }

  // 1. Path safety — re-use the shared helper to validate ideaSlug + ts and
  //    build the canonical relative paths.
  const pathsResult = buildIdeaJobPaths(input.ideaSlug, input.timestamp)
  if (isPathError(pathsResult)) {
    logEvent('rejected', {reason: 'path-build', detail: pathsResult.error})
    return {ok: false, error: 'path-rejected', message: pathsResult.message}
  }
  const paths = pathsResult

  // 2. Parse the pasted result text. Returns either a parsed payload (even
  //    for markdown-only inputs) or a fatal `empty` / `too-large` error.
  const parsed = parseAiDevelopmentResult(input.resultText)
  if (!parsed.ok) {
    logEvent('rejected', {
      reason: 'parse-error',
      detail: parsed.error,
      ideaSlug: paths.ideaSlug,
    })
    return {ok: false, error: 'parse-error', message: parsed.message}
  }

  const previewPayload = buildPreviewPayload({paths, parsed, resultText: input.resultText})

  // 3. Mode='preview' — no filesystem touch.
  if (input.mode === 'preview') {
    logEvent('preview-ok', {
      ideaSlug: paths.ideaSlug,
      timestamp: paths.timestamp,
      resultBytes: previewPayload.metrics.resultBytes,
      structuredJsonBytes: previewPayload.metrics.structuredJsonBytes,
      detectedFieldCount: previewPayload.metrics.detectedFieldCount,
      warningCount: previewPayload.parseWarnings.length,
      elapsedMs: Date.now() - startedAt,
    })
    return {ok: true, mode: 'preview', ...previewPayload}
  }

  // 4. Mode='execute' — env gates before any write.
  if (!enableWriteActions) {
    logEvent('rejected', {reason: 'write-disabled'})
    return {ok: false, error: 'write-disabled', message: 'ENABLE_WRITE_ACTIONS is off'}
  }
  if (!enableLocalFsRoutes) {
    logEvent('rejected', {reason: 'localfs-disabled'})
    return {
      ok: false,
      error: 'localfs-disabled',
      message: 'ENABLE_LOCAL_FS_ROUTES is off',
    }
  }

  // 5. Atomic write result.md (always) and result.json (only if a
  //    structured JSON was successfully parsed). Both files are inside the
  //    pre-existing timestamped sub-directory; result.md may already exist
  //    if boss already saved a draft, so we explicitly allow overwrite.
  try {
    await atomicWriteIdeaJobFile(paths.expectedResultMdRelative, input.resultText, {
      existingFileMode: 'overwrite',
    })
    if (parsed.structuredJsonText !== null) {
      await atomicWriteIdeaJobFile(
        paths.expectedResultJsonRelative,
        parsed.structuredJsonText,
        {existingFileMode: 'overwrite'},
      )
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    logEvent('write-failed', {message})
    return {ok: false, error: 'write-failed', message: 'Failed to write result files'}
  }

  const committedAt = new Date().toISOString()
  logEvent('execute-ok', {
    ideaSlug: paths.ideaSlug,
    timestamp: paths.timestamp,
    resultBytes: previewPayload.metrics.resultBytes,
    structuredJsonBytes: previewPayload.metrics.structuredJsonBytes,
    detectedFieldCount: previewPayload.metrics.detectedFieldCount,
    warningCount: previewPayload.parseWarnings.length,
    wroteJson: parsed.structuredJsonText !== null,
    elapsedMs: Date.now() - startedAt,
  })
  return {ok: true, mode: 'execute', committedAt, ...previewPayload}
}
