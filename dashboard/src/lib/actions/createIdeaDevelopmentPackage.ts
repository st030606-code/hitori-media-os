'use server'

// Phase 2C-0 — Server action that builds and (in execute mode) writes the
// Raw Idea + AI idea-development prompt package onto the local filesystem.
//
// Safety layers (in order):
//   1. enableWriteActions feature flag (Phase 2B master switch)
//   2. enableLocalFsRoutes feature flag (Phase 2B-3 local-fs gate)
//   3. Hard input validation (rough memo length, enum values, etc.)
//   4. Slug derivation + ideaSlug regex validation
//   5. Path safety: resolved under `<repo>/idea-jobs/<slug>/...` only,
//      .md / .json extensions only, no traversal, no absolute paths,
//      no URL-encoded traversal, no null bytes.
//   6. Atomic write (temp file + rename), 200 KB per file cap.
//
// Boundaries (CONFIRMED handoff/0197):
//   - Q-2C-1: no Sanity schema change touched.
//   - Q-2C-2: raw idea stays in `_raw.json`, NEVER becomes a Sanity doc here.
//   - Q-2C-6: no shell execution, no LLM API call. Suggested CLI commands are
//             returned as plain strings — boss runs them manually if they want.
//   - Q-2C-8: this action does NOT create platformOutput / contentIdea docs.
//   - Server logs are metadata only — no rough memo / prompt body / source
//     context text. Body lengths only.

import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  buildIdeaJobPaths,
  nowTimestamp,
  randomSlugSuffix,
  slugifyTitle,
  validateIdeaSlug,
  type IdeaJobPaths,
  type IdeaPathErrorDetail,
} from '@/lib/ideaJobs/paths'
import {atomicWriteIdeaJobFile} from '@/lib/ideaJobs/paths'
import {
  buildSuggestedCommands,
  normaliseRawIdea,
  renderPromptPackage,
  type RawIdeaInput,
} from '@/lib/ideaJobs/promptBuilder'

export type CreateIdeaPackageError =
  | 'validation'
  | 'write-disabled'
  | 'localfs-disabled'
  | 'path-rejected'
  | 'write-failed'
  | 'unknown'

export interface CreateIdeaDevelopmentPackageInput extends RawIdeaInput {
  /** Optional explicit slug. If omitted, derived from `rawTitle` or a random
   *  suffix when the title is empty / non-ASCII. */
  ideaSlug?: string
  mode: 'preview' | 'execute'
}

export interface SuggestedCommands {
  codex: string
  claude: string
  cat: string
}

export interface IdeaPackagePreview {
  ideaSlug: string
  timestamp: string
  rawJsonPath: string
  promptPath: string
  jobJsonPath: string
  expectedResultMdPath: string
  expectedResultJsonPath: string
  promptText: string
  rawJsonText: string
  jobJsonText: string
  suggestedCommands: SuggestedCommands
  /** Counts only; never include the actual memo / prompt body in logs. */
  metrics: {
    promptBytes: number
    rawJsonBytes: number
    jobJsonBytes: number
    roughMemoLength: number
  }
}
export type CreateIdeaDevelopmentPackageResult =
  | ({ok: true; mode: 'preview'} & IdeaPackagePreview)
  | ({ok: true; mode: 'execute'; committedAt: string} & IdeaPackagePreview)
  | {ok: false; error: CreateIdeaPackageError; message: string}

function logEvent(stage: string, detail: Record<string, unknown>): void {
  // Q-10 / Phase 2B logging contract: metadata only. Never log:
  //   - rough memo body
  //   - prompt body
  //   - source context body
  //   - any token value
  // Lengths and slug-level info only.
  // eslint-disable-next-line no-console
  console.log(`[createIdeaDevelopmentPackage:${stage}]`, detail)
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

function buildPreview(args: {
  paths: IdeaJobPaths
  promptMd: string
  rawIdeaJson: string
  jobJson: string
  roughMemoLength: number
}): IdeaPackagePreview {
  const {paths, promptMd, rawIdeaJson, jobJson, roughMemoLength} = args
  return {
    ideaSlug: paths.ideaSlug,
    timestamp: paths.timestamp,
    rawJsonPath: paths.rawJsonRelative,
    promptPath: paths.promptMdRelative,
    jobJsonPath: paths.jobJsonRelative,
    expectedResultMdPath: paths.expectedResultMdRelative,
    expectedResultJsonPath: paths.expectedResultJsonRelative,
    promptText: promptMd,
    rawJsonText: rawIdeaJson,
    jobJsonText: jobJson,
    suggestedCommands: buildSuggestedCommands(paths),
    metrics: {
      promptBytes: Buffer.byteLength(promptMd, 'utf8'),
      rawJsonBytes: Buffer.byteLength(rawIdeaJson, 'utf8'),
      jobJsonBytes: Buffer.byteLength(jobJson, 'utf8'),
      roughMemoLength,
    },
  }
}

export async function createIdeaDevelopmentPackage(
  input: CreateIdeaDevelopmentPackageInput,
): Promise<CreateIdeaDevelopmentPackageResult> {
  const startedAt = Date.now()
  if (typeof input !== 'object' || input === null) {
    return {ok: false, error: 'validation', message: 'input is not an object'}
  }
  if (input.mode !== 'preview' && input.mode !== 'execute') {
    return {ok: false, error: 'validation', message: 'mode must be "preview" or "execute"'}
  }

  // 1. Normalise + validate the raw idea fields (no fs touch yet).
  const normalised = normaliseRawIdea(input)
  if (!normalised.ok) {
    logEvent('rejected', {reason: normalised.error})
    return {ok: false, error: 'validation', message: normalised.message}
  }
  const raw = normalised.value

  // 2. Derive ideaSlug.
  let candidateSlug: string
  if (typeof input.ideaSlug === 'string' && input.ideaSlug.length > 0) {
    candidateSlug = input.ideaSlug
  } else {
    const fallback = `idea-${randomSlugSuffix()}`
    candidateSlug = slugifyTitle(raw.rawTitle, fallback)
  }
  const slugCheck = validateIdeaSlug(candidateSlug)
  if (!slugCheck.ok) {
    logEvent('rejected', {reason: 'bad-slug', detail: slugCheck.error})
    return {ok: false, error: 'validation', message: slugCheck.message}
  }

  // 3. Build paths under idea-jobs/<slug>/<timestamp>/...
  const timestamp = nowTimestamp()
  const pathsResult = buildIdeaJobPaths(slugCheck.slug, timestamp)
  if (isPathError(pathsResult)) {
    logEvent('rejected', {reason: 'path-build', detail: pathsResult.error})
    return {ok: false, error: 'path-rejected', message: pathsResult.message}
  }
  const paths = pathsResult

  // 4. Render the prompt package (pure functions, no fs touch).
  const createdAtIso = new Date().toISOString()
  const rendered = renderPromptPackage({raw, paths, createdAtIso})

  const preview = buildPreview({
    paths,
    promptMd: rendered.promptMd,
    rawIdeaJson: rendered.rawIdeaJson,
    jobJson: rendered.jobJson,
    roughMemoLength: raw.roughMemo.length,
  })

  // 5. Mode='preview' short-circuit. Do NOT touch the filesystem.
  if (input.mode === 'preview') {
    logEvent('preview-ok', {
      ideaSlug: paths.ideaSlug,
      timestamp: paths.timestamp,
      promptBytes: preview.metrics.promptBytes,
      jobJsonBytes: preview.metrics.jobJsonBytes,
      rawJsonBytes: preview.metrics.rawJsonBytes,
      elapsedMs: Date.now() - startedAt,
    })
    return {ok: true, mode: 'preview', ...preview}
  }

  // 6. Mode='execute' — check env gates before writing.
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

  // 7. Atomic write. Each file lives under the timestamped sub-directory, so
  //    write collisions are practically impossible (we generate a fresh
  //    timestamp on every call). _raw.json overwrites are allowed because
  //    boss may iterate on a raw idea before deciding on a final structure.
  try {
    await atomicWriteIdeaJobFile(paths.rawJsonRelative, rendered.rawIdeaJson, {
      existingFileMode: 'overwrite',
    })
    await atomicWriteIdeaJobFile(paths.promptMdRelative, rendered.promptMd)
    await atomicWriteIdeaJobFile(paths.jobJsonRelative, rendered.jobJson)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    logEvent('write-failed', {message})
    return {ok: false, error: 'write-failed', message: 'Failed to write idea package files'}
  }

  logEvent('execute-ok', {
    ideaSlug: paths.ideaSlug,
    timestamp: paths.timestamp,
    promptBytes: preview.metrics.promptBytes,
    jobJsonBytes: preview.metrics.jobJsonBytes,
    rawJsonBytes: preview.metrics.rawJsonBytes,
    elapsedMs: Date.now() - startedAt,
  })

  return {
    ok: true,
    mode: 'execute',
    committedAt: createdAtIso,
    ...preview,
  }
}
