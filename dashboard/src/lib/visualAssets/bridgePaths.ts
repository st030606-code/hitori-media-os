// Phase 2B-3 — path safety + preview helpers for the Visual Register bridge.
//
// What this module does:
//   - Validates inputs to the approve/register server action (assetId,
//     inbox slug, candidate filename, candidate relative path).
//   - Rejects unsafe path shapes:
//       absolute paths, traversal (..), URL-encoded traversal,
//       empty strings, unexpected extensions, paths outside
//       assets/inbox/generated/.
//   - Computes a best-effort preview shown to the boss before commit.
//     The dashboard never decides the actual final asset path or patch
//     path; tools/visual-register/server.mjs is the source of truth for
//     those. Preview values surface what the user is about to commit so
//     they can confirm intent.
//
// Boundaries:
//   - This module performs NO filesystem writes.
//   - This module performs NO Sanity reads or writes.
//   - This module does NOT call the Visual Register HTTP endpoint.
//     That happens in the server action (`approveVisualCandidate.ts`)
//     using the URL constant exported below.
//
// Q-2B3-1 confirmed: the dashboard talks to the Visual Register CLI via
// HTTP only, never via spawn / shell. The endpoint URL is hardcoded —
// env override is intentionally NOT supported (Q-2B3-7 + safety boundary).

export const VISUAL_REGISTER_BASE_URL = 'http://localhost:3334'
export const VISUAL_REGISTER_APPROVE_ENDPOINT = `${VISUAL_REGISTER_BASE_URL}/api/inbox/approve-and-register`
export const VISUAL_REGISTER_HEALTH_ENDPOINT = `${VISUAL_REGISTER_BASE_URL}/api/health`

const ALLOWED_CANDIDATE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const

const INBOX_PREFIX = 'assets/inbox/generated/'
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i
const ASSET_ID_RE = /^visualAssetPlan\.[a-z0-9][a-z0-9._-]{0,200}$/i
const CANDIDATE_FILENAME_RE = /^v\d{1,4}\.(png|jpg|jpeg|webp)$/i

export type BridgePathError =
  | 'empty'
  | 'absolute'
  | 'traversal'
  | 'url-encoded-traversal'
  | 'outside-inbox'
  | 'bad-extension'
  | 'bad-slug'
  | 'bad-asset-id'
  | 'bad-filename'
  | 'shape-mismatch'

export interface BridgePathErrorDetail {
  ok: false
  error: BridgePathError
  message: string
}

export interface ValidatedCandidate {
  ok: true
  assetId: string
  campaignSlug: string
  assetSlug: string
  candidateFile: string                  // e.g. 'v003.png'
  candidateRelativePath: string          // e.g. 'assets/inbox/generated/<slug>/<asset>/v003.png'
}

function fail(error: BridgePathError, message: string): BridgePathErrorDetail {
  return {ok: false, error, message}
}

function hasUrlEncodedTraversal(value: string): boolean {
  // Catch %2e%2e, %2E%2E, %2f%2e%2e, etc. before url-decoding could occur.
  const lower = value.toLowerCase()
  return lower.includes('%2e%2e') || lower.includes('%2f') || lower.includes('%5c')
}

function isAbsolutePath(value: string): boolean {
  if (value.startsWith('/')) return true
  if (value.startsWith('\\')) return true
  // Windows-style drive letters; defensive even though we run on macOS dev.
  return /^[a-z]:[\\/]/i.test(value)
}

function hasTraversalSegment(value: string): boolean {
  // Split on both POSIX and Windows separators; reject any '..' segment.
  return value
    .split(/[\\/]+/)
    .some((segment) => segment === '..' || segment === '.')
}

export interface ValidateInputArgs {
  assetId: unknown
  campaignSlug: unknown
  assetSlug: unknown
  candidateFile: unknown
  candidateRelativePath: unknown
}

/**
 * Validates the four identifiers the server action receives. Returns either
 * a normalized `ValidatedCandidate` or a structured error. NO filesystem
 * touch, NO Sanity touch.
 */
export function validateApproveInput(
  args: ValidateInputArgs,
): ValidatedCandidate | BridgePathErrorDetail {
  const {assetId, campaignSlug, assetSlug, candidateFile, candidateRelativePath} = args

  if (typeof assetId !== 'string' || assetId.length === 0) {
    return fail('empty', 'assetId is required')
  }
  if (!ASSET_ID_RE.test(assetId)) {
    return fail('bad-asset-id', 'assetId must be of the form visualAssetPlan.<slug>.<asset>')
  }

  if (typeof campaignSlug !== 'string' || campaignSlug.length === 0) {
    return fail('empty', 'campaignSlug is required')
  }
  if (!SLUG_RE.test(campaignSlug)) {
    return fail('bad-slug', 'campaignSlug must be lowercase alphanumeric with hyphens')
  }

  if (typeof assetSlug !== 'string' || assetSlug.length === 0) {
    return fail('empty', 'assetSlug is required')
  }
  if (!SLUG_RE.test(assetSlug)) {
    return fail('bad-slug', 'assetSlug must be lowercase alphanumeric with hyphens')
  }

  if (typeof candidateFile !== 'string' || candidateFile.length === 0) {
    return fail('empty', 'candidateFile is required')
  }
  if (!CANDIDATE_FILENAME_RE.test(candidateFile)) {
    return fail('bad-filename', 'candidateFile must look like v001.png / v012.jpg / etc.')
  }
  const extension = candidateFile.slice(candidateFile.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_CANDIDATE_EXTENSIONS.includes(extension as (typeof ALLOWED_CANDIDATE_EXTENSIONS)[number])) {
    return fail('bad-extension', `extension ${extension} not allowed`)
  }

  if (typeof candidateRelativePath !== 'string' || candidateRelativePath.length === 0) {
    return fail('empty', 'candidateRelativePath is required')
  }
  if (hasUrlEncodedTraversal(candidateRelativePath)) {
    return fail('url-encoded-traversal', 'URL-encoded traversal is not allowed')
  }
  if (isAbsolutePath(candidateRelativePath)) {
    return fail('absolute', 'absolute paths are not allowed')
  }
  if (hasTraversalSegment(candidateRelativePath)) {
    return fail('traversal', '".." or "." segments are not allowed')
  }
  if (!candidateRelativePath.startsWith(INBOX_PREFIX)) {
    return fail('outside-inbox', `candidate must live under ${INBOX_PREFIX}`)
  }

  // Confirm shape: <prefix><campaignSlug>/<assetSlug>/<candidateFile>
  const expectedRelative = `${INBOX_PREFIX}${campaignSlug}/${assetSlug}/${candidateFile}`
  if (candidateRelativePath !== expectedRelative) {
    return fail(
      'shape-mismatch',
      `candidateRelativePath must equal ${expectedRelative}`,
    )
  }

  return {
    ok: true,
    assetId,
    campaignSlug,
    assetSlug,
    candidateFile,
    candidateRelativePath,
  }
}

export interface BridgePreview {
  /** Identity passed back so the UI does not have to re-derive it. */
  assetId: string
  campaignSlug: string
  assetSlug: string
  candidateFile: string
  candidateRelativePath: string

  /** Best-effort planned final asset path. `tools/visual-register/server.mjs`
   *  is the actual source of truth; if a previous registration set
   *  `plan.localAssetPath`, that is the most reliable preview value. The
   *  `expectedLocalAssetPath` from the plan is the next best signal. Both
   *  may be empty — in that case the dashboard renders a "Visual Register
   *  が決定します" caption rather than a path. */
  plannedFinalAssetPath: string | null

  /** Best-effort planned patch path. Computed as
   *  `patches/visual-assets/<campaignSlug>/<assetSlug>.json`, which is the
   *  same shape `server.mjs` writes (verified by inspecting existing
   *  patches/visual-assets/*.json files). */
  plannedPatchPath: string

  /** True if the plan already has a `localAssetPath` set, meaning a
   *  previous registration likely wrote a file at the same target. The UI
   *  uses this to surface the "overwrite is likely" hint and require the
   *  overwrite checkbox before execute. The server.mjs side is the
   *  authoritative check; this is only a hint. */
  overwriteLikely: boolean

  /** Echoed back so callers don't need to import the constant. */
  endpoint: typeof VISUAL_REGISTER_APPROVE_ENDPOINT
}

export interface BuildPreviewArgs {
  validated: ValidatedCandidate
  expectedLocalAssetPath: string | null | undefined
  currentLocalAssetPath: string | null | undefined
}

export function buildBridgePreview({
  validated,
  expectedLocalAssetPath,
  currentLocalAssetPath,
}: BuildPreviewArgs): BridgePreview {
  const plannedFinalAssetPath =
    (typeof currentLocalAssetPath === 'string' && currentLocalAssetPath.length > 0
      ? currentLocalAssetPath
      : null) ??
    (typeof expectedLocalAssetPath === 'string' && expectedLocalAssetPath.length > 0
      ? expectedLocalAssetPath
      : null)

  const plannedPatchPath = `patches/visual-assets/${validated.campaignSlug}/${validated.assetSlug}.json`

  const overwriteLikely =
    typeof currentLocalAssetPath === 'string' && currentLocalAssetPath.length > 0

  return {
    assetId: validated.assetId,
    campaignSlug: validated.campaignSlug,
    assetSlug: validated.assetSlug,
    candidateFile: validated.candidateFile,
    candidateRelativePath: validated.candidateRelativePath,
    plannedFinalAssetPath,
    plannedPatchPath,
    overwriteLikely,
    endpoint: VISUAL_REGISTER_APPROVE_ENDPOINT,
  }
}
