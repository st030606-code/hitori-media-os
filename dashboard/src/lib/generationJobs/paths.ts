// Phase 2C-2 — path safety + atomic write helpers for generation prompt
// packages.
//
// Boundaries:
//   - Writes are limited to generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/.
//   - Only .md and .json leaves are allowed.
//   - No absolute paths, traversal, URL-encoded traversal, or null bytes.
//   - 200 KB max per file.
//   - This module never spawns shell commands and never calls Sanity.

import {randomBytes} from 'node:crypto'
import {mkdir, rename, unlink, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {repoPath} from '@/lib/repoRoot'

export const GENERATION_JOBS_PREFIX = 'generation-jobs'
export const MAX_GENERATION_JOB_FILE_BYTES = 200 * 1024

const SLUG_MAX_LEN = 80
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/
const TIMESTAMP_RE = /^\d{8}-\d{6}$/
const RELATIVE_LEAF_RE = /^[a-zA-Z0-9._-]{1,128}$/
const ALLOWED_EXTENSIONS = new Set(['.md', '.json'])
const NULL_BYTE = '\x00'

export const GENERATION_PLATFORM_VALUES = [
  'x',
  'threads',
  'note',
  'substack',
  'youtube',
  'shorts',
  'podcast',
  'instagram',
  'newsletter',
  'github',
  'diagram',
] as const

export type GenerationPlatform = (typeof GENERATION_PLATFORM_VALUES)[number]

export type GenerationPathError =
  | 'empty'
  | 'bad-slug'
  | 'bad-platform'
  | 'bad-timestamp'
  | 'absolute'
  | 'traversal'
  | 'url-encoded-traversal'
  | 'null-byte'
  | 'bad-extension'
  | 'outside-generation-jobs'
  | 'too-large'

export interface GenerationPathErrorDetail {
  ok: false
  error: GenerationPathError
  message: string
}

export interface GenerationJobPaths {
  ok: true
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  promptMdRelative: string
  jobJsonRelative: string
  expectedDraftMdRelative: string
  expectedDraftJsonRelative: string
  visualBriefMdRelative: string
  visualBriefJsonRelative: string
}

function fail(error: GenerationPathError, message: string): GenerationPathErrorDetail {
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

export function validateGenerationSlug(
  value: unknown,
): {ok: true; slug: string} | GenerationPathErrorDetail {
  if (typeof value !== 'string' || value.length === 0) {
    return fail('empty', 'contentIdeaSlug is required')
  }
  if (hasNullByte(value)) return fail('null-byte', 'contentIdeaSlug contains a null byte')
  if (hasUrlEncodedTraversal(value)) {
    return fail('url-encoded-traversal', 'contentIdeaSlug contains URL-encoded traversal')
  }
  if (value.length > SLUG_MAX_LEN) {
    return fail('bad-slug', `contentIdeaSlug exceeds ${SLUG_MAX_LEN} characters`)
  }
  if (!SLUG_RE.test(value)) {
    return fail(
      'bad-slug',
      'contentIdeaSlug must be lowercase alphanumeric + hyphen, starting with [a-z0-9]',
    )
  }
  return {ok: true, slug: value}
}

export function validateGenerationPlatform(
  value: unknown,
): {ok: true; platform: GenerationPlatform} | GenerationPathErrorDetail {
  if (
    typeof value === 'string' &&
    (GENERATION_PLATFORM_VALUES as readonly string[]).includes(value)
  ) {
    return {ok: true, platform: value as GenerationPlatform}
  }
  return fail('bad-platform', 'platform is not supported for generation jobs')
}

export function nowGenerationTimestamp(now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear().toString().padStart(4, '0')
  const mm = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = now.getUTCDate().toString().padStart(2, '0')
  const hh = now.getUTCHours().toString().padStart(2, '0')
  const mi = now.getUTCMinutes().toString().padStart(2, '0')
  const ss = now.getUTCSeconds().toString().padStart(2, '0')
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

export function buildGenerationJobPaths(
  rawSlug: unknown,
  rawPlatform: unknown,
  rawTimestamp: unknown,
): GenerationJobPaths | GenerationPathErrorDetail {
  const slugResult = validateGenerationSlug(rawSlug)
  if (!slugResult.ok) return slugResult
  const platformResult = validateGenerationPlatform(rawPlatform)
  if (!platformResult.ok) return platformResult
  if (typeof rawTimestamp !== 'string' || !TIMESTAMP_RE.test(rawTimestamp)) {
    return fail('bad-timestamp', 'timestamp must match YYYYMMDD-HHMMSS')
  }

  const slug = slugResult.slug
  const platform = platformResult.platform
  const timestamp = rawTimestamp
  const base = `${GENERATION_JOBS_PREFIX}/${slug}/${platform}/${timestamp}`

  return {
    ok: true,
    contentIdeaSlug: slug,
    platform,
    timestamp,
    promptMdRelative: `${base}/prompt.md`,
    jobJsonRelative: `${base}/job.json`,
    expectedDraftMdRelative: `${base}/draft.md`,
    expectedDraftJsonRelative: `${base}/draft.json`,
    visualBriefMdRelative: `${base}/visual-brief.md`,
    visualBriefJsonRelative: `${base}/visual-brief.json`,
  }
}

export function resolveGenerationJobAbsolutePath(
  relative: string,
): {ok: true; absolutePath: string} | GenerationPathErrorDetail {
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
  if (segments.length !== 5) {
    return fail(
      'outside-generation-jobs',
      'path must live under generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/',
    )
  }
  if (segments[0] !== GENERATION_JOBS_PREFIX) {
    return fail('outside-generation-jobs', `path must begin with "${GENERATION_JOBS_PREFIX}/"`)
  }
  const slugCheck = validateGenerationSlug(segments[1])
  if (!slugCheck.ok) return slugCheck
  const platformCheck = validateGenerationPlatform(segments[2])
  if (!platformCheck.ok) return platformCheck
  if (!TIMESTAMP_RE.test(segments[3])) {
    return fail('bad-timestamp', 'timestamp must match YYYYMMDD-HHMMSS')
  }
  if (!RELATIVE_LEAF_RE.test(segments[4])) {
    return fail('traversal', `path segment "${segments[4]}" has unexpected shape`)
  }
  const ext = path.posix.extname(segments[4])
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return fail('bad-extension', `only ${[...ALLOWED_EXTENSIONS].join('/')} files are allowed`)
  }

  const absoluteRoot = repoPath(GENERATION_JOBS_PREFIX)
  const absolute = repoPath(...segments)
  const normalised = path.resolve(absolute)
  if (normalised !== absolute) {
    return fail('traversal', 'normalised path drifted from the requested path')
  }
  if (normalised !== absoluteRoot && !normalised.startsWith(absoluteRoot + path.sep)) {
    return fail('outside-generation-jobs', 'resolved path escapes generation-jobs/')
  }
  return {ok: true, absolutePath: normalised}
}

export async function atomicWriteGenerationJobFile(
  relative: string,
  content: string,
): Promise<void> {
  const resolved = resolveGenerationJobAbsolutePath(relative)
  if (!resolved.ok) {
    throw new Error(`atomicWriteGenerationJobFile: ${resolved.error} (${resolved.message})`)
  }
  const byteLength = Buffer.byteLength(content, 'utf8')
  if (byteLength > MAX_GENERATION_JOB_FILE_BYTES) {
    throw new Error(
      `atomicWriteGenerationJobFile: file exceeds ${MAX_GENERATION_JOB_FILE_BYTES} bytes (got ${byteLength})`,
    )
  }

  const target = resolved.absolutePath
  await mkdir(path.dirname(target), {recursive: true})
  const tmpPath = `${target}.tmp-${randomBytes(8).toString('hex')}`
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
