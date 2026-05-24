// Phase 2C-1 — server-only filesystem reader for idea-jobs/.
//
// What this module does:
//   - Walks `idea-jobs/<ideaSlug>/<timestamp>/` directories and reports
//     which Phase 2C-0 / 2C-0.1 artefacts exist (_raw.json / prompt.md /
//     job.json / result.md / result.json).
//   - Provides a safe `readResultJson(ideaSlug, timestamp)` helper that
//     validates path safety + size cap before returning the parsed
//     object.
//
// Boundaries (handoff/0197 CONFIRMED):
//   - This module NEVER writes to the filesystem (read-only).
//   - This module NEVER spawns shell commands.
//   - This module NEVER calls Sanity / external APIs.
//   - File extensions read: `.md` / `.json` only.
//   - Max file size honoured: `MAX_FILE_BYTES` (200 KB, shared with paths.ts).
//   - All paths are resolved through `resolveIdeaJobAbsolutePath` so we
//     reuse the Phase 2C-0 safety contract.

import {readdir, readFile, stat} from 'node:fs/promises'
import path from 'node:path'
import {repoPath} from '@/lib/repoRoot'
import {
  IDEA_JOBS_PREFIX,
  MAX_FILE_BYTES,
  resolveIdeaJobAbsolutePath,
  validateIdeaSlug,
} from './paths'

export const MAX_LISTED_JOBS = 20
const TIMESTAMP_RE = /^\d{8}-\d{6}$/

export type IdeaJobStatus =
  | 'package-only'
  | 'result-markdown-only'
  | 'structured-result-ready'

export interface IdeaJobListItem {
  ideaSlug: string
  timestamp: string
  hasRawJson: boolean
  hasPromptMd: boolean
  hasJobJson: boolean
  hasResultMd: boolean
  hasResultJson: boolean
  status: IdeaJobStatus
  /** mtime in ms since epoch, used for sort. */
  mtimeMs: number
}

export interface ListIdeaJobsResult {
  ok: true
  jobs: IdeaJobListItem[]
  truncated: boolean
}

export type ReaderError =
  | 'idea-jobs-missing'
  | 'read-failed'
  | 'path-rejected'
  | 'too-large'
  | 'not-found'
  | 'parse-error'

export interface ReaderErrorDetail {
  ok: false
  error: ReaderError
  message: string
}

async function fileExists(absolutePath: string): Promise<{exists: boolean; mtimeMs: number}> {
  try {
    const s = await stat(absolutePath)
    return {exists: s.isFile(), mtimeMs: s.mtimeMs}
  } catch {
    return {exists: false, mtimeMs: 0}
  }
}

async function readSafeFile(relativePath: string): Promise<string | ReaderErrorDetail> {
  const resolved = resolveIdeaJobAbsolutePath(relativePath)
  if (!resolved.ok) {
    return {ok: false, error: 'path-rejected', message: resolved.message}
  }
  let statResult
  try {
    statResult = await stat(resolved.absolutePath)
  } catch {
    return {ok: false, error: 'not-found', message: `file not found: ${relativePath}`}
  }
  if (!statResult.isFile()) {
    return {ok: false, error: 'not-found', message: `not a file: ${relativePath}`}
  }
  if (statResult.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: 'too-large',
      message: `file exceeds ${MAX_FILE_BYTES} bytes: ${relativePath}`,
    }
  }
  try {
    return await readFile(resolved.absolutePath, 'utf8')
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {ok: false, error: 'read-failed', message}
  }
}

/**
 * Lists existing idea-jobs/ jobs, sorted by mtime descending, capped at
 * `MAX_LISTED_JOBS`. Each entry reports which Phase 2C-0 / 2C-0.1
 * artefacts are present.
 *
 * Returns an empty list (not an error) when `idea-jobs/` does not exist —
 * `enableLocalFsRoutes=false` deployments still want to render the UI in
 * read-only mode without throwing.
 */
export async function listIdeaJobs(): Promise<ListIdeaJobsResult | ReaderErrorDetail> {
  const root = repoPath(IDEA_JOBS_PREFIX)
  let slugDirs: string[]
  try {
    slugDirs = await readdir(root)
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code
    if (code === 'ENOENT') {
      return {ok: true, jobs: [], truncated: false}
    }
    const message = e instanceof Error ? e.message : String(e)
    return {ok: false, error: 'read-failed', message}
  }

  const items: IdeaJobListItem[] = []
  for (const slug of slugDirs) {
    if (slug.startsWith('.') || slug.startsWith('_')) continue
    const slugCheck = validateIdeaSlug(slug)
    if (!slugCheck.ok) continue
    const slugRoot = path.join(root, slug)
    let slugStat
    try {
      slugStat = await stat(slugRoot)
    } catch {
      continue
    }
    if (!slugStat.isDirectory()) continue

    let timestampDirs: string[]
    try {
      timestampDirs = await readdir(slugRoot)
    } catch {
      continue
    }
    for (const ts of timestampDirs) {
      if (!TIMESTAMP_RE.test(ts)) continue
      const tsRoot = path.join(slugRoot, ts)
      let tsStat
      try {
        tsStat = await stat(tsRoot)
      } catch {
        continue
      }
      if (!tsStat.isDirectory()) continue

      const rawJsonPath = path.join(root, slug, '_raw.json')
      const promptMdPath = path.join(tsRoot, 'prompt.md')
      const jobJsonPath = path.join(tsRoot, 'job.json')
      const resultMdPath = path.join(tsRoot, 'result.md')
      const resultJsonPath = path.join(tsRoot, 'result.json')

      const [
        rawJson,
        promptMd,
        jobJson,
        resultMd,
        resultJson,
      ] = await Promise.all([
        fileExists(rawJsonPath),
        fileExists(promptMdPath),
        fileExists(jobJsonPath),
        fileExists(resultMdPath),
        fileExists(resultJsonPath),
      ])

      let status: IdeaJobStatus = 'package-only'
      if (resultJson.exists) status = 'structured-result-ready'
      else if (resultMd.exists) status = 'result-markdown-only'

      const mtimeMs = Math.max(
        rawJson.mtimeMs,
        promptMd.mtimeMs,
        jobJson.mtimeMs,
        resultMd.mtimeMs,
        resultJson.mtimeMs,
        tsStat.mtimeMs,
      )

      items.push({
        ideaSlug: slug,
        timestamp: ts,
        hasRawJson: rawJson.exists,
        hasPromptMd: promptMd.exists,
        hasJobJson: jobJson.exists,
        hasResultMd: resultMd.exists,
        hasResultJson: resultJson.exists,
        status,
        mtimeMs,
      })
    }
  }
  items.sort((a, b) => b.mtimeMs - a.mtimeMs)
  const truncated = items.length > MAX_LISTED_JOBS
  return {
    ok: true,
    jobs: items.slice(0, MAX_LISTED_JOBS),
    truncated,
  }
}

export interface RawIdeaJsonShape {
  ideaSlug?: string
  createdAt?: string
  rawTitle?: string | null
  roughMemo?: string
  sourceContext?: string | null
  intendedTheme?: string | null
  urgency?: string
  relatedProject?: string | null
  initialPlatforms?: string[]
  ideaSource?: string | null
}

/**
 * Reads `idea-jobs/<slug>/<timestamp>/result.json` and returns the parsed
 * object. Validates path + size; returns structured error on failure.
 */
export async function readResultJson(
  ideaSlug: string,
  timestamp: string,
): Promise<{ok: true; data: Record<string, unknown>} | ReaderErrorDetail> {
  const slugCheck = validateIdeaSlug(ideaSlug)
  if (!slugCheck.ok) {
    return {ok: false, error: 'path-rejected', message: slugCheck.message}
  }
  if (typeof timestamp !== 'string' || !TIMESTAMP_RE.test(timestamp)) {
    return {ok: false, error: 'path-rejected', message: 'timestamp must match YYYYMMDD-HHMMSS'}
  }
  const rel = `${IDEA_JOBS_PREFIX}/${slugCheck.slug}/${timestamp}/result.json`
  const text = await readSafeFile(rel)
  if (typeof text !== 'string') return text
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {ok: false, error: 'parse-error', message}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {ok: false, error: 'parse-error', message: 'result.json must be a JSON object'}
  }
  return {ok: true, data: parsed as Record<string, unknown>}
}

/**
 * Reads `idea-jobs/<slug>/_raw.json`. Same safety pattern as `readResultJson`.
 * Returns `not-found` when the file is missing (callers treat this as
 * optional metadata).
 */
export async function readRawIdeaJson(
  ideaSlug: string,
): Promise<{ok: true; data: RawIdeaJsonShape} | ReaderErrorDetail> {
  const slugCheck = validateIdeaSlug(ideaSlug)
  if (!slugCheck.ok) {
    return {ok: false, error: 'path-rejected', message: slugCheck.message}
  }
  const rel = `${IDEA_JOBS_PREFIX}/${slugCheck.slug}/_raw.json`
  const text = await readSafeFile(rel)
  if (typeof text !== 'string') return text
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {ok: false, error: 'parse-error', message}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {ok: false, error: 'parse-error', message: '_raw.json must be a JSON object'}
  }
  return {ok: true, data: parsed as RawIdeaJsonShape}
}
