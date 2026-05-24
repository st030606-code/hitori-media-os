// Phase 2C-0 — path safety + atomic write helpers for the Raw Idea / Idea
// Development Package filesystem layer.
//
// What this module does:
//   - Validates `ideaSlug` (lowercase alphanumeric + hyphen, length cap).
//   - Builds repo-relative + absolute paths under `idea-jobs/<ideaSlug>/...`
//     and rejects anything that would escape that allowlist.
//   - Rejects absolute paths, traversal (`..`), URL-encoded traversal,
//     null bytes, unexpected extensions, and obviously bad shapes.
//   - Provides an atomic-write helper (write to temp file, then `rename`)
//     plus a size cap enforcer.
//
// Boundaries (CONFIRMED handoff/0197, Q-2C-7):
//   - This module NEVER spawns shell commands and NEVER calls Sanity.
//   - Write surface is limited to `idea-jobs/` ONLY in Phase 2C-0.
//     Other allowlisted dirs (generation-jobs/, outputs/generated/,
//     publish-packages/campaigns/) are out of scope for this sub-batch.
//   - The server action must additionally check `enableWriteActions`
//     and `enableLocalFsRoutes` before invoking the write helpers here.
//   - File extensions allowed: `.md` and `.json` only.
//   - Max file size: 200 KB per file.

import {randomBytes} from 'node:crypto'
import {mkdir, rename, writeFile, unlink} from 'node:fs/promises'
import path from 'node:path'
import {repoPath} from '@/lib/repoRoot'

export const IDEA_JOBS_PREFIX = 'idea-jobs'
export const MAX_FILE_BYTES = 200 * 1024 // 200 KB
const IDEA_SLUG_MAX_LEN = 80
const IDEA_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/
const TIMESTAMP_RE = /^\d{8}-\d{6}$/      // YYYYMMDD-HHMMSS, see `nowTimestamp()`
const RELATIVE_LEAF_RE = /^[a-zA-Z0-9._-]{1,128}$/
const ALLOWED_EXTENSIONS = new Set(['.md', '.json'])
const NULL_BYTE = '\x00'

export type IdeaPathError =
  | 'empty'
  | 'bad-slug'
  | 'bad-timestamp'
  | 'absolute'
  | 'traversal'
  | 'url-encoded-traversal'
  | 'null-byte'
  | 'bad-extension'
  | 'outside-idea-jobs'
  | 'too-large'

export interface IdeaPathErrorDetail {
  ok: false
  error: IdeaPathError
  message: string
}

export interface IdeaJobPaths {
  ok: true
  ideaSlug: string
  timestamp: string
  /** All paths below are repo-relative POSIX strings. */
  rawJsonRelative: string                  // idea-jobs/<slug>/_raw.json
  promptMdRelative: string                 // idea-jobs/<slug>/<ts>/prompt.md
  jobJsonRelative: string                  // idea-jobs/<slug>/<ts>/job.json
  expectedResultMdRelative: string         // idea-jobs/<slug>/<ts>/result.md
  expectedResultJsonRelative: string       // idea-jobs/<slug>/<ts>/result.json
}

function fail(error: IdeaPathError, message: string): IdeaPathErrorDetail {
  return {ok: false, error, message}
}

function hasUrlEncodedTraversal(value: string): boolean {
  const lower = value.toLowerCase()
  return lower.includes('%2e%2e') || lower.includes('%2f') || lower.includes('%5c')
}

function hasNullByte(value: string): boolean {
  return value.indexOf(NULL_BYTE) !== -1
}

function isAbsolutePath(value: string): boolean {
  if (value.startsWith('/')) return true
  if (value.startsWith('\\')) return true
  return /^[a-z]:[\\/]/i.test(value)
}

function hasTraversalSegment(value: string): boolean {
  return value.split(/[\\/]+/).some((segment) => segment === '..' || segment === '.')
}

export function validateIdeaSlug(value: unknown): {ok: true; slug: string} | IdeaPathErrorDetail {
  if (typeof value !== 'string' || value.length === 0) {
    return fail('empty', 'ideaSlug is required')
  }
  if (hasNullByte(value)) {
    return fail('null-byte', 'ideaSlug contains a null byte')
  }
  if (hasUrlEncodedTraversal(value)) {
    return fail('url-encoded-traversal', 'ideaSlug contains URL-encoded traversal')
  }
  if (value.length > IDEA_SLUG_MAX_LEN) {
    return fail('bad-slug', `ideaSlug exceeds ${IDEA_SLUG_MAX_LEN} characters`)
  }
  if (!IDEA_SLUG_RE.test(value)) {
    return fail('bad-slug', 'ideaSlug must be lowercase alphanumeric + hyphen, starting with [a-z0-9]')
  }
  return {ok: true, slug: value}
}

/**
 * Convert a free-form title to a candidate slug. Falls back when the result
 * would be empty (e.g. all CJK characters).
 */
export function slugifyTitle(rawTitle: string | undefined, fallback: string): string {
  const source = (rawTitle ?? '').toLowerCase().normalize('NFKD')
  const ascii = source
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, IDEA_SLUG_MAX_LEN)
  if (ascii.length === 0) return fallback
  return ascii.replace(/^-+/, '').slice(0, IDEA_SLUG_MAX_LEN) || fallback
}

/**
 * Deterministic short suffix for cases where the slug would be empty
 * (e.g. boss enters only CJK text). Caller can append + re-validate.
 */
export function randomSlugSuffix(): string {
  return randomBytes(3).toString('hex')
}

/**
 * Timestamp string `YYYYMMDD-HHMMSS` (UTC). Stable, sortable, fs-safe.
 */
export function nowTimestamp(now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear().toString().padStart(4, '0')
  const mm = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = now.getUTCDate().toString().padStart(2, '0')
  const hh = now.getUTCHours().toString().padStart(2, '0')
  const mi = now.getUTCMinutes().toString().padStart(2, '0')
  const ss = now.getUTCSeconds().toString().padStart(2, '0')
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

export function buildIdeaJobPaths(
  rawSlug: unknown,
  rawTimestamp: unknown,
): IdeaJobPaths | IdeaPathErrorDetail {
  const slugResult = validateIdeaSlug(rawSlug)
  if (!slugResult.ok) return slugResult
  const slug = slugResult.slug
  if (typeof rawTimestamp !== 'string' || !TIMESTAMP_RE.test(rawTimestamp)) {
    return fail('bad-timestamp', 'timestamp must match YYYYMMDD-HHMMSS')
  }
  const ts = rawTimestamp
  const rawJsonRelative = `${IDEA_JOBS_PREFIX}/${slug}/_raw.json`
  const promptMdRelative = `${IDEA_JOBS_PREFIX}/${slug}/${ts}/prompt.md`
  const jobJsonRelative = `${IDEA_JOBS_PREFIX}/${slug}/${ts}/job.json`
  const expectedResultMdRelative = `${IDEA_JOBS_PREFIX}/${slug}/${ts}/result.md`
  const expectedResultJsonRelative = `${IDEA_JOBS_PREFIX}/${slug}/${ts}/result.json`
  return {
    ok: true,
    ideaSlug: slug,
    timestamp: ts,
    rawJsonRelative,
    promptMdRelative,
    jobJsonRelative,
    expectedResultMdRelative,
    expectedResultJsonRelative,
  }
}

/**
 * Resolve a repo-relative POSIX path into an absolute filesystem path,
 * verifying every safety check we care about.
 */
export function resolveIdeaJobAbsolutePath(
  relative: string,
): {ok: true; absolutePath: string} | IdeaPathErrorDetail {
  if (typeof relative !== 'string' || relative.length === 0) {
    return fail('empty', 'relative path is empty')
  }
  if (hasNullByte(relative)) return fail('null-byte', 'relative path contains null byte')
  if (hasUrlEncodedTraversal(relative)) {
    return fail('url-encoded-traversal', 'relative path contains URL-encoded traversal')
  }
  if (isAbsolutePath(relative)) return fail('absolute', 'absolute paths are not allowed')
  if (hasTraversalSegment(relative)) {
    return fail('traversal', '".." or "." segments are not allowed')
  }
  const segments = relative.split('/')
  if (segments.length < 3) {
    // Shortest legal path is idea-jobs/<slug>/_raw.json (3 segments).
    return fail('outside-idea-jobs', 'path must live under idea-jobs/<ideaSlug>/')
  }
  if (segments[0] !== IDEA_JOBS_PREFIX) {
    return fail('outside-idea-jobs', `path must begin with "${IDEA_JOBS_PREFIX}/"`)
  }
  const slugCheck = validateIdeaSlug(segments[1])
  if (!slugCheck.ok) return slugCheck
  for (const seg of segments.slice(2)) {
    if (!RELATIVE_LEAF_RE.test(seg)) {
      return fail('traversal', `path segment "${seg}" has unexpected shape`)
    }
  }
  const ext = path.posix.extname(segments[segments.length - 1])
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return fail('bad-extension', `only ${[...ALLOWED_EXTENSIONS].join('/')} files are allowed`)
  }
  const absoluteIdeaJobsRoot = repoPath(IDEA_JOBS_PREFIX)
  const absolute = repoPath(...segments)
  const normalised = path.resolve(absolute)
  if (normalised !== absolute) {
    return fail('traversal', 'normalised path drifted from the requested path')
  }
  if (
    normalised !== absoluteIdeaJobsRoot &&
    !normalised.startsWith(absoluteIdeaJobsRoot + path.sep)
  ) {
    return fail('outside-idea-jobs', 'resolved path escapes idea-jobs/')
  }
  return {ok: true, absolutePath: normalised}
}

/**
 * Atomic write helper: write to `<target>.tmp-<rand>` (with O_EXCL via flag
 * `wx`), then `rename` into place. Parent dirs are created with
 * `{recursive: true}`. Enforces the 200 KB per-file cap.
 *
 * When `existingFileMode === 'reject-if-exists'` (default), the caller is
 * responsible for choosing a unique timestamped directory; we do not perform
 * a stat() probe (TOCTOU). The Phase 2C-0 server action picks a fresh
 * timestamped sub-directory for each job, so write conflicts are unlikely
 * in practice.
 */
export async function atomicWriteIdeaJobFile(
  relative: string,
  content: string,
  options?: {existingFileMode?: 'reject-if-exists' | 'overwrite'},
): Promise<void> {
  const resolved = resolveIdeaJobAbsolutePath(relative)
  if (!resolved.ok) {
    throw new Error(`atomicWriteIdeaJobFile: ${resolved.error} (${resolved.message})`)
  }
  const byteLength = Buffer.byteLength(content, 'utf8')
  if (byteLength > MAX_FILE_BYTES) {
    throw new Error(
      `atomicWriteIdeaJobFile: file exceeds ${MAX_FILE_BYTES} bytes (got ${byteLength})`,
    )
  }
  // existingFileMode is reserved for a future overwrite-aware variant; in
  // Phase 2C-0 the timestamped sub-directory makes collisions practically
  // impossible. We accept the parameter to keep the call sites explicit.
  void options
  const target = resolved.absolutePath
  const parentDir = path.dirname(target)
  await mkdir(parentDir, {recursive: true})
  const tmpSuffix = randomBytes(8).toString('hex')
  const tmpPath = `${target}.tmp-${tmpSuffix}`
  try {
    await writeFile(tmpPath, content, {encoding: 'utf8', flag: 'wx'})
    await rename(tmpPath, target)
  } catch (err) {
    try {
      await unlink(tmpPath)
    } catch {
      /* ignore cleanup error */
    }
    throw err
  }
}
