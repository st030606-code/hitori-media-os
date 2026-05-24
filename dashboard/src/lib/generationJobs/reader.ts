// Phase 2C-3 — safe read helpers for generation-jobs/.
//
// Reads are restricted to generation-jobs/<contentIdeaSlug>/<platform>/<timestamp>/
// and to .md / .json files via generationJobs/paths.ts.

import {readdir, readFile, stat} from 'node:fs/promises'
import path from 'node:path'
import {repoPath} from '@/lib/repoRoot'
import {
  buildGenerationJobPaths,
  GENERATION_JOBS_PREFIX,
  GENERATION_PLATFORM_VALUES,
  MAX_GENERATION_JOB_FILE_BYTES,
  resolveGenerationJobAbsolutePath,
  validateGenerationSlug,
  type GenerationJobPaths,
  type GenerationPlatform,
} from './paths'

export type GenerationJobReadError =
  | 'path-rejected'
  | 'not-found'
  | 'too-large'
  | 'parse-error'
  | 'unknown'

export interface GenerationJobReadErrorDetail {
  ok: false
  error: GenerationJobReadError
  message: string
}

export interface GenerationJobSummary {
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  promptExists: boolean
  jobJsonExists: boolean
  draftMdExists: boolean
  draftJsonExists: boolean
  visualBriefMdExists: boolean
  visualBriefJsonExists: boolean
  status: 'package-only' | 'draft-markdown-saved' | 'structured-draft-saved'
  promptPath: string
  jobJsonPath: string
  draftMdPath: string
  draftJsonPath: string
  visualBriefMdPath: string
  visualBriefJsonPath: string
  updatedAtMs: number
  jobMetadata: unknown | null
  promptExcerpt?: string
}

export interface GenerationJobDetail extends GenerationJobSummary {
  promptText?: string
  draftMarkdown?: string
  draftJson?: unknown
  visualBriefMarkdown?: string
  visualBriefJson?: unknown
}

function fail(error: GenerationJobReadError, message: string): GenerationJobReadErrorDetail {
  return {ok: false, error, message}
}

async function exists(relative: string): Promise<boolean> {
  const resolved = resolveGenerationJobAbsolutePath(relative)
  if (!resolved.ok) return false
  try {
    await stat(resolved.absolutePath)
    return true
  } catch {
    return false
  }
}

export async function readGenerationJobTextFile(
  relative: string,
): Promise<{ok: true; text: string; bytes: number} | GenerationJobReadErrorDetail> {
  const resolved = resolveGenerationJobAbsolutePath(relative)
  if (!resolved.ok) return fail('path-rejected', resolved.message)
  let fileStat: Awaited<ReturnType<typeof stat>>
  try {
    fileStat = await stat(resolved.absolutePath)
  } catch {
    return fail('not-found', 'file was not found')
  }
  if (!fileStat.isFile()) return fail('path-rejected', 'path is not a file')
  if (fileStat.size > MAX_GENERATION_JOB_FILE_BYTES) {
    return fail(
      'too-large',
      `file exceeds ${MAX_GENERATION_JOB_FILE_BYTES} bytes (got ${fileStat.size})`,
    )
  }
  try {
    const text = await readFile(resolved.absolutePath, 'utf8')
    return {ok: true, text, bytes: Buffer.byteLength(text, 'utf8')}
  } catch {
    return fail('unknown', 'failed to read file')
  }
}

async function readJson(relative: string): Promise<unknown | null> {
  const read = await readGenerationJobTextFile(relative)
  if (!read.ok) return null
  try {
    return JSON.parse(read.text)
  } catch {
    return null
  }
}

function excerpt(value: string, max = 360): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 20).trimEnd()}\n...`
}

function statusOf(args: {
  draftMdExists: boolean
  draftJsonExists: boolean
}): GenerationJobSummary['status'] {
  if (args.draftJsonExists) return 'structured-draft-saved'
  if (args.draftMdExists) return 'draft-markdown-saved'
  return 'package-only'
}

async function updatedAtFor(paths: GenerationJobPaths): Promise<number> {
  const candidates = [
    paths.expectedDraftJsonRelative,
    paths.visualBriefJsonRelative,
    paths.visualBriefMdRelative,
    paths.expectedDraftMdRelative,
    paths.jobJsonRelative,
    paths.promptMdRelative,
  ]
  for (const relative of candidates) {
    const resolved = resolveGenerationJobAbsolutePath(relative)
    if (!resolved.ok) continue
    try {
      const s = await stat(resolved.absolutePath)
      return s.mtimeMs
    } catch {
      // continue
    }
  }
  return 0
}

export async function getGenerationJobSummary(
  contentIdeaSlug: string,
  platform: string,
  timestamp: string,
  options?: {includePromptExcerpt?: boolean},
): Promise<{ok: true; job: GenerationJobSummary} | GenerationJobReadErrorDetail> {
  const paths = buildGenerationJobPaths(contentIdeaSlug, platform, timestamp)
  if (!paths.ok) return fail('path-rejected', paths.message)

  const [
    promptExists,
    jobJsonExists,
    draftMdExists,
    draftJsonExists,
    visualBriefMdExists,
    visualBriefJsonExists,
  ] = await Promise.all([
    exists(paths.promptMdRelative),
    exists(paths.jobJsonRelative),
    exists(paths.expectedDraftMdRelative),
    exists(paths.expectedDraftJsonRelative),
    exists(paths.visualBriefMdRelative),
    exists(paths.visualBriefJsonRelative),
  ])
  if (!promptExists || !jobJsonExists) {
    return fail('not-found', 'generation job prompt.md and job.json are required')
  }

  const [jobMetadata, updatedAtMs] = await Promise.all([
    readJson(paths.jobJsonRelative),
    updatedAtFor(paths),
  ])
  let promptExcerpt: string | undefined
  if (options?.includePromptExcerpt) {
    const promptRead = await readGenerationJobTextFile(paths.promptMdRelative)
    if (promptRead.ok) promptExcerpt = excerpt(promptRead.text)
  }

  return {
    ok: true,
    job: {
      contentIdeaSlug: paths.contentIdeaSlug,
      platform: paths.platform,
      timestamp: paths.timestamp,
      promptExists,
      jobJsonExists,
      draftMdExists,
      draftJsonExists,
      visualBriefMdExists,
      visualBriefJsonExists,
      status: statusOf({draftMdExists, draftJsonExists}),
      promptPath: paths.promptMdRelative,
      jobJsonPath: paths.jobJsonRelative,
      draftMdPath: paths.expectedDraftMdRelative,
      draftJsonPath: paths.expectedDraftJsonRelative,
      visualBriefMdPath: paths.visualBriefMdRelative,
      visualBriefJsonPath: paths.visualBriefJsonRelative,
      updatedAtMs,
      jobMetadata,
      promptExcerpt,
    },
  }
}

async function safeDirNames(abs: string): Promise<string[]> {
  try {
    const entries = await readdir(abs, {withFileTypes: true})
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  } catch {
    return []
  }
}

export async function listRecentGenerationJobs(
  limit = 20,
): Promise<GenerationJobSummary[]> {
  const root = repoPath(GENERATION_JOBS_PREFIX)
  const summaries: GenerationJobSummary[] = []
  const slugs = await safeDirNames(root)

  for (const slug of slugs) {
    if (!validateGenerationSlug(slug).ok) continue
    const slugDir = path.join(root, slug)
    const platforms = await safeDirNames(slugDir)
    for (const platform of platforms) {
      if (!(GENERATION_PLATFORM_VALUES as readonly string[]).includes(platform)) continue
      const platformDir = path.join(slugDir, platform)
      const timestamps = await safeDirNames(platformDir)
      for (const timestamp of timestamps) {
        const result = await getGenerationJobSummary(slug, platform, timestamp, {
          includePromptExcerpt: false,
        })
        if (result.ok) summaries.push(result.job)
      }
    }
  }

  return summaries.sort((a, b) => b.updatedAtMs - a.updatedAtMs).slice(0, limit)
}

export async function readGenerationJobDetail(
  contentIdeaSlug: string,
  platform: string,
  timestamp: string,
): Promise<{ok: true; job: GenerationJobDetail} | GenerationJobReadErrorDetail> {
  const summary = await getGenerationJobSummary(contentIdeaSlug, platform, timestamp, {
    includePromptExcerpt: true,
  })
  if (!summary.ok) return summary
  const paths = buildGenerationJobPaths(contentIdeaSlug, platform, timestamp)
  if (!paths.ok) return fail('path-rejected', paths.message)

  const [promptRead, draftRead, draftJson, visualBriefRead, visualBriefJson] = await Promise.all([
    readGenerationJobTextFile(paths.promptMdRelative),
    summary.job.draftMdExists
      ? readGenerationJobTextFile(paths.expectedDraftMdRelative)
      : Promise.resolve(null),
    summary.job.draftJsonExists ? readJson(paths.expectedDraftJsonRelative) : Promise.resolve(null),
    summary.job.visualBriefMdExists
      ? readGenerationJobTextFile(paths.visualBriefMdRelative)
      : Promise.resolve(null),
    summary.job.visualBriefJsonExists ? readJson(paths.visualBriefJsonRelative) : Promise.resolve(null),
  ])

  return {
    ok: true,
    job: {
      ...summary.job,
      promptText: promptRead.ok ? promptRead.text : undefined,
      draftMarkdown: draftRead && draftRead.ok ? draftRead.text : undefined,
      draftJson,
      visualBriefMarkdown: visualBriefRead && visualBriefRead.ok ? visualBriefRead.text : undefined,
      visualBriefJson,
    },
  }
}
