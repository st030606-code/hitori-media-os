// Phase 2B-3.1 — patch JSON read + validation helpers for the Sanity reflect
// server action.
//
// Boundary:
//   - This module reads the filesystem (patches/visual-assets/<slug>/<asset>.json).
//   - Imported only from server code: the server action and Server Components
//     calling `patchJsonExists()` for the page-level indicator. Importing it
//     from a client component is intentionally not supported.
//   - This module does NOT call Sanity. Sanity reads and writes live in the
//     server action.
//   - This module does NOT write to the filesystem. Patch JSONs are
//     produced exclusively by `tools/visual-register/server.mjs`.
//
// Confirmed decisions (handoff/0192):
//   - Q-2B3.1-1: field allow-list is exactly 4 fields —
//                localAssetPath, status, updatedAt, reviewNotes
//   - Q-2B3.1-6: implement as dashboard server action (this helper supports
//                that action; we do NOT import tools/sanity/reflect-*.mjs)

import {existsSync} from 'node:fs'
import {readFile} from 'node:fs/promises'
import {repoPath} from '@/lib/repoRoot'

export const PATCH_JSON_FIELDS = [
  'localAssetPath',
  'status',
  'updatedAt',
  'reviewNotes',
] as const

export type PatchJsonField = (typeof PATCH_JSON_FIELDS)[number]

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i
const PATCH_PATH_PREFIX = 'patches/visual-assets/'

export type PatchJsonError =
  | 'empty-path'
  | 'absolute-path'
  | 'traversal'
  | 'url-encoded-traversal'
  | 'outside-allowlist'
  | 'bad-extension'
  | 'bad-slug'
  | 'shape-mismatch'
  | 'patch-not-found'
  | 'patch-not-json'
  | 'direct-sanity-write-not-false'
  | 'id-mismatch'
  | 'field-missing'
  | 'field-type'

interface ValidatedPatchPath {
  ok: true
  campaignSlug: string
  assetSlug: string
  /** Relative path with forward slashes — used for log + UI display. */
  relativePath: string
  /** Absolute path on disk — only used inside server code. */
  absolutePath: string
}

interface PatchPathError {
  ok: false
  error: PatchJsonError
  message: string
}

function hasUrlEncodedTraversal(value: string): boolean {
  const lower = value.toLowerCase()
  return lower.includes('%2e%2e') || lower.includes('%2f') || lower.includes('%5c')
}

function isAbsolutePath(value: string): boolean {
  if (value.startsWith('/')) return true
  if (value.startsWith('\\')) return true
  return /^[a-z]:[\\/]/i.test(value)
}

function hasTraversalSegment(value: string): boolean {
  return value.split(/[\\/]+/).some((segment) => segment === '..' || segment === '.')
}

/**
 * Validate a `patches/visual-assets/<campaignSlug>/<assetSlug>.json` path
 * with no filesystem touch. Used by both the server action and the page-level
 * Server Component that decides whether to render the reflect CTA.
 */
export function validatePatchJsonPath(
  patchJsonPath: unknown,
): ValidatedPatchPath | PatchPathError {
  if (typeof patchJsonPath !== 'string' || patchJsonPath.length === 0) {
    return {ok: false, error: 'empty-path', message: 'patchJsonPath is required'}
  }
  if (hasUrlEncodedTraversal(patchJsonPath)) {
    return {ok: false, error: 'url-encoded-traversal', message: 'URL-encoded traversal not allowed'}
  }
  if (isAbsolutePath(patchJsonPath)) {
    return {ok: false, error: 'absolute-path', message: 'absolute paths are not allowed'}
  }
  if (hasTraversalSegment(patchJsonPath)) {
    return {ok: false, error: 'traversal', message: '".." or "." segments are not allowed'}
  }
  if (!patchJsonPath.endsWith('.json')) {
    return {ok: false, error: 'bad-extension', message: 'patchJsonPath must end with .json'}
  }
  if (!patchJsonPath.startsWith(PATCH_PATH_PREFIX)) {
    return {ok: false, error: 'outside-allowlist', message: `patchJsonPath must start with ${PATCH_PATH_PREFIX}`}
  }
  const remainder = patchJsonPath.slice(PATCH_PATH_PREFIX.length)
  const parts = remainder.split('/')
  if (parts.length !== 2) {
    return {
      ok: false,
      error: 'outside-allowlist',
      message: `patchJsonPath must equal ${PATCH_PATH_PREFIX}<campaignSlug>/<assetSlug>.json`,
    }
  }
  const [campaignSlug, fileNameWithExt] = parts
  if (!SLUG_RE.test(campaignSlug)) {
    return {ok: false, error: 'bad-slug', message: 'campaignSlug format invalid'}
  }
  const assetSlug = fileNameWithExt.slice(0, -'.json'.length)
  if (!SLUG_RE.test(assetSlug)) {
    return {ok: false, error: 'bad-slug', message: 'assetSlug format invalid'}
  }
  const absolutePath = repoPath(patchJsonPath)
  return {
    ok: true,
    campaignSlug,
    assetSlug,
    relativePath: patchJsonPath,
    absolutePath,
  }
}

export function buildPatchJsonPath(
  campaignSlug: string | null | undefined,
  assetSlug: string | null | undefined,
): string | null {
  if (
    typeof campaignSlug !== 'string' ||
    !SLUG_RE.test(campaignSlug) ||
    typeof assetSlug !== 'string' ||
    !SLUG_RE.test(assetSlug)
  ) {
    return null
  }
  return `${PATCH_PATH_PREFIX}${campaignSlug}/${assetSlug}.json`
}

/**
 * Cheap server-side existence probe used by Server Components to decide
 * whether to render the reflect CTA without doing a full read.
 */
export function patchJsonExists(patchJsonPath: string): boolean {
  const validated = validatePatchJsonPath(patchJsonPath)
  if (!validated.ok) return false
  return existsSync(validated.absolutePath)
}

/** Shape produced by `tools/visual-register/server.mjs`. The dashboard
 *  applies only the 4 fields in `set`; `meta` is validated to ensure the
 *  patch was produced by Visual Register (directSanityWrite: false). */
export interface ParsedPatchJson {
  _id: string
  set: Record<PatchJsonField, string>
  meta: {
    directSanityWrite: false
    [key: string]: unknown
  }
}

interface PatchReadOk {
  ok: true
  /** The absolute disk path used to read this patch — never returned to
   *  the client; kept here for the server action to log a path string
   *  without re-deriving it. */
  absolutePath: string
  patch: ParsedPatchJson
}

interface PatchReadError {
  ok: false
  error: PatchJsonError
  message: string
}

function validatePatchShape(raw: unknown): ParsedPatchJson | PatchReadError {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {ok: false, error: 'shape-mismatch', message: 'patch JSON must be an object'}
  }
  const r = raw as Record<string, unknown>
  if (typeof r._id !== 'string' || r._id.length === 0) {
    return {ok: false, error: 'shape-mismatch', message: 'patch JSON `_id` must be a non-empty string'}
  }
  if (typeof r.set !== 'object' || r.set === null || Array.isArray(r.set)) {
    return {ok: false, error: 'shape-mismatch', message: 'patch JSON `set` must be an object'}
  }
  const setBlock = r.set as Record<string, unknown>
  // Field allow-list strict check: must have exactly the 4 fields.
  for (const field of PATCH_JSON_FIELDS) {
    if (!(field in setBlock)) {
      return {ok: false, error: 'field-missing', message: `patch JSON \`set.${field}\` is missing`}
    }
    if (typeof setBlock[field] !== 'string') {
      return {ok: false, error: 'field-type', message: `patch JSON \`set.${field}\` must be a string`}
    }
  }
  // Reject fields outside the allow-list (defensive — Visual Register
  // currently only writes the 4 fields, but we don't want a future
  // out-of-band field to be silently passed through to Sanity).
  for (const key of Object.keys(setBlock)) {
    if (!(PATCH_JSON_FIELDS as readonly string[]).includes(key)) {
      return {
        ok: false,
        error: 'shape-mismatch',
        message: `patch JSON \`set.${key}\` is outside the 4-field allow-list`,
      }
    }
  }
  if (typeof r.meta !== 'object' || r.meta === null) {
    return {ok: false, error: 'shape-mismatch', message: 'patch JSON `meta` must be an object'}
  }
  const meta = r.meta as Record<string, unknown>
  if (meta.directSanityWrite !== false) {
    return {
      ok: false,
      error: 'direct-sanity-write-not-false',
      message:
        'patch JSON `meta.directSanityWrite` must be exactly `false` (Visual Register convention)',
    }
  }
  // Narrow `set` to the typed alias.
  const typedSet: Record<PatchJsonField, string> = {
    localAssetPath: setBlock.localAssetPath as string,
    status: setBlock.status as string,
    updatedAt: setBlock.updatedAt as string,
    reviewNotes: setBlock.reviewNotes as string,
  }
  return {
    _id: r._id,
    set: typedSet,
    meta: {...(meta as object), directSanityWrite: false} as ParsedPatchJson['meta'],
  }
}

/**
 * Read + parse + shape-validate the patch JSON at the given relative path.
 * Returns either the typed `ParsedPatchJson` or a structured error.
 *
 * Server-side only: imports `fs/promises`. Anywhere this is called from a
 * client component would fail at build time.
 */
export async function readAndValidatePatchJson(
  patchJsonPath: string,
  expectedVisualAssetPlanId: string,
): Promise<PatchReadOk | PatchReadError> {
  const validatedPath = validatePatchJsonPath(patchJsonPath)
  if (!validatedPath.ok) return validatedPath

  if (!existsSync(validatedPath.absolutePath)) {
    return {ok: false, error: 'patch-not-found', message: 'patch JSON file not found'}
  }

  let raw: unknown
  try {
    const bytes = await readFile(validatedPath.absolutePath, 'utf8')
    raw = JSON.parse(bytes)
  } catch (e) {
    return {
      ok: false,
      error: 'patch-not-json',
      message: e instanceof Error ? e.message : 'patch JSON failed to parse',
    }
  }

  const shape = validatePatchShape(raw)
  if ('ok' in shape && shape.ok === false) return shape
  const parsed = shape as ParsedPatchJson

  if (parsed._id !== expectedVisualAssetPlanId) {
    return {
      ok: false,
      error: 'id-mismatch',
      message: `patch JSON \`_id\` (${parsed._id}) does not match expected visualAssetPlanId (${expectedVisualAssetPlanId})`,
    }
  }

  return {ok: true, absolutePath: validatedPath.absolutePath, patch: parsed}
}

export interface FieldDiff {
  field: PatchJsonField
  before: string | null
  after: string
  changed: boolean
}

/**
 * Compare the 4 patch fields against current Sanity values. Returns the
 * 4-row diff and whether all 4 fields are already equal (already-reflected
 * detection per Q-2B3.1-4).
 */
export function computePatchDiff(
  patch: ParsedPatchJson,
  current: Partial<Record<PatchJsonField, string | null>>,
): {diffs: FieldDiff[]; alreadyReflected: boolean} {
  const diffs: FieldDiff[] = PATCH_JSON_FIELDS.map((field) => {
    const before = typeof current[field] === 'string' ? (current[field] as string) : null
    const after = patch.set[field]
    return {
      field,
      before,
      after,
      changed: before !== after,
    }
  })
  const alreadyReflected = diffs.every((d) => !d.changed)
  return {diffs, alreadyReflected}
}
