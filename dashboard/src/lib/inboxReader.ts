// Dev-only inbox reader for Phase Admin 2A candidate review.
//
// Reads `assets/inbox/generated/<campaignSlug>/<assetSlug>/` and returns a
// typed bundle of candidate metadata for the dashboard.
//
// Production guard: callers must check `enableLocalFsRoutes` before invoking
// this module. The functions here do NOT re-check the flag — they assume the
// caller has verified the environment. Path validation is still strict so
// even if accidentally called on production, no out-of-tree file is read.

import path from 'node:path'
import {promises as fs, existsSync} from 'node:fs'
import {repoRoot, repoPath} from '@/lib/repoRoot'
import {readFrontmatter, type YamlValue} from '@/lib/frontmatter'

// ---------- types ----------

export interface CandidateMeta {
  id: string // v001
  relativePath: string // assets/inbox/generated/<slug>/<asset>/v001.png
  fileName: string
  fileSize: number
  pixelWidth: number | null
  pixelHeight: number | null
  generatedAt: string | null
  variant: string | null
  layoutPattern: string | null
  score: number | null
  notes: string | null
}

export interface PromptMeta {
  campaignSlug?: string
  assetSlug?: string
  visualAssetPlanId?: string
  assetPurpose?: string
  platform?: string
  aspectRatio?: string
  pixelSize?: string
  candidateStrategy?: Array<{
    id: string
    variant: string | null
    layoutPattern: string | null
    notes: string | null
  }>
  styleAnchors?: string[]
  layoutPatterns?: string[]
  requiredVisualModules?: string[]
  forbiddenPatterns?: string[]
  phase?: string
}

export interface ReviewMeta {
  campaignSlug?: string
  assetSlug?: string
  visualAssetPlanId?: string
  reviewStatus?: string
  rubricScale?: string
  rubricMaxScore?: number
  rubricAxes?: string[]
  candidateScores?: Record<
    string,
    {
      variant: string | null
      score: number | null
      notes: string | null
    }
  >
  recommendedCandidate?: string | null
  humanDecision?: string | null
  phase?: string
}

export interface CandidateBundle {
  campaignSlug: string
  assetSlug: string
  folderRelativePath: string
  promptMeta: PromptMeta | null
  reviewMeta: ReviewMeta | null
  candidates: CandidateMeta[]
  hasPrompt: boolean
  hasReview: boolean
  warnings: string[]
}

export interface InboxAssetSummary {
  campaignSlug: string
  assetSlug: string
  folderRelativePath: string
  candidateCount: number
  hasPrompt: boolean
  hasReview: boolean
  hasReviewManifest: boolean // campaign-level manifest
}

// ---------- path / id helpers ----------

const INBOX_PREFIX = 'assets/inbox/generated'
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/
const CANDIDATE_RE = /^v\d{3}\.(?:png|jpg|jpeg|webp)$/i

function isSafeSlug(s: string | undefined | null): s is string {
  return typeof s === 'string' && SLUG_RE.test(s) && s !== '..' && s !== '.'
}

// `visualAssetPlan.<campaignSlug>.<assetSlug>` is the canonical form used
// elsewhere in the repo. We require exactly one dot between the prefix and the
// campaign segment, and one dot between the campaign segment and the asset
// segment. Both segments must be slug-safe.
export function deriveSlugsFromAssetId(
  assetId: string,
): {campaignSlug: string; assetSlug: string} | null {
  const prefix = 'visualAssetPlan.'
  if (!assetId.startsWith(prefix)) return null
  const rest = assetId.slice(prefix.length)
  const dot = rest.indexOf('.')
  if (dot <= 0 || dot === rest.length - 1) return null
  const campaignSlug = rest.slice(0, dot)
  const assetSlug = rest.slice(dot + 1)
  if (!isSafeSlug(campaignSlug)) return null
  if (!isSafeSlug(assetSlug)) return null
  return {campaignSlug, assetSlug}
}

// ---------- value coercion (parser returns YamlValue, narrow to our types) ----------

function asString(v: YamlValue | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined
}
function asNumber(v: YamlValue | undefined): number | undefined {
  return typeof v === 'number' ? v : undefined
}
function asStringOrNull(v: YamlValue | undefined): string | null {
  if (v === null) return null
  return typeof v === 'string' ? v : null
}
function asNumberOrNull(v: YamlValue | undefined): number | null {
  if (v === null) return null
  return typeof v === 'number' ? v : null
}
function asStringArray(v: YamlValue | undefined): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: string[] = []
  for (const item of v) if (typeof item === 'string') out.push(item)
  return out
}

type CandidateStrategyEntry = NonNullable<PromptMeta['candidateStrategy']>[number]

function coercePromptMeta(meta: Record<string, YamlValue>): PromptMeta {
  const out: PromptMeta = {}
  out.campaignSlug = asString(meta.campaignSlug)
  out.assetSlug = asString(meta.assetSlug)
  out.visualAssetPlanId = asString(meta.visualAssetPlanId)
  out.assetPurpose = asString(meta.assetPurpose)
  out.platform = asString(meta.platform)
  out.aspectRatio = asString(meta.aspectRatio)
  out.pixelSize = asString(meta.pixelSize)
  if (Array.isArray(meta.candidateStrategy)) {
    const strategy: CandidateStrategyEntry[] = []
    for (const item of meta.candidateStrategy) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue
      const obj = item as Record<string, YamlValue>
      const id = asString(obj.id)
      if (!id) continue
      strategy.push({
        id,
        variant: asStringOrNull(obj.variant),
        layoutPattern: asStringOrNull(obj.layoutPattern),
        notes: asStringOrNull(obj.notes),
      })
    }
    out.candidateStrategy = strategy
  }
  out.styleAnchors = asStringArray(meta.styleAnchors)
  out.layoutPatterns = asStringArray(meta.layoutPatterns)
  out.requiredVisualModules = asStringArray(meta.requiredVisualModules)
  out.forbiddenPatterns = asStringArray(meta.forbiddenPatterns)
  out.phase = asString(meta.phase)
  return out
}

function coerceReviewMeta(meta: Record<string, YamlValue>): ReviewMeta {
  const out: ReviewMeta = {}
  out.campaignSlug = asString(meta.campaignSlug)
  out.assetSlug = asString(meta.assetSlug)
  out.visualAssetPlanId = asString(meta.visualAssetPlanId)
  out.reviewStatus = asString(meta.reviewStatus)
  out.rubricScale = asString(meta.rubricScale)
  out.rubricMaxScore = asNumber(meta.rubricMaxScore)
  out.rubricAxes = asStringArray(meta.rubricAxes)
  if (meta.candidateScores && typeof meta.candidateScores === 'object' && !Array.isArray(meta.candidateScores)) {
    const scoresObj = meta.candidateScores as Record<string, YamlValue>
    const result: NonNullable<ReviewMeta['candidateScores']> = {}
    for (const [k, val] of Object.entries(scoresObj)) {
      if (!val || typeof val !== 'object' || Array.isArray(val)) continue
      const inner = val as Record<string, YamlValue>
      result[k] = {
        variant: asStringOrNull(inner.variant),
        score: asNumberOrNull(inner.score),
        notes: asStringOrNull(inner.notes),
      }
    }
    out.candidateScores = result
  }
  out.recommendedCandidate = meta.recommendedCandidate === undefined ? undefined : asStringOrNull(meta.recommendedCandidate)
  out.humanDecision = meta.humanDecision === undefined ? undefined : asStringOrNull(meta.humanDecision)
  out.phase = asString(meta.phase)
  return out
}

// ---------- PNG dimensions (no external dep) ----------

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

async function pngDimensions(absPath: string): Promise<{width: number; height: number} | null> {
  let fd: import('node:fs/promises').FileHandle | null = null
  try {
    fd = await fs.open(absPath, 'r')
    const buf = Buffer.alloc(24)
    const {bytesRead} = await fd.read(buf, 0, 24, 0)
    if (bytesRead < 24) return null
    if (buf.compare(PNG_SIG, 0, 8, 0, 8) !== 0) return null
    return {width: buf.readUInt32BE(16), height: buf.readUInt32BE(20)}
  } catch {
    return null
  } finally {
    if (fd) await fd.close()
  }
}

// ---------- safe path containment ----------

function ensureUnderInbox(relativePath: string): string {
  // Reject absolute paths.
  if (relativePath.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(relativePath)) {
    throw new Error('absolute path not allowed')
  }
  // Require inbox prefix.
  if (!(relativePath === INBOX_PREFIX || relativePath.startsWith(INBOX_PREFIX + '/'))) {
    throw new Error('forbidden prefix')
  }
  const normalized = path.normalize(relativePath)
  if (normalized !== relativePath || normalized.includes('..')) {
    throw new Error('path traversal')
  }
  if (!(normalized === INBOX_PREFIX || normalized.startsWith(INBOX_PREFIX + '/'))) {
    throw new Error('forbidden prefix after normalize')
  }
  const allowedRoot = path.resolve(repoRoot(), INBOX_PREFIX)
  const abs = path.resolve(repoRoot(), normalized)
  const allowedRootWithSep = allowedRoot.endsWith(path.sep) ? allowedRoot : allowedRoot + path.sep
  if (abs !== allowedRoot && !abs.startsWith(allowedRootWithSep)) {
    throw new Error('out of allowed root')
  }
  return abs
}

export function isAllowedCandidateImage(relativePath: string): boolean {
  try {
    ensureUnderInbox(relativePath)
  } catch {
    return false
  }
  const ext = path.extname(relativePath).toLowerCase()
  if (!IMAGE_EXTS.has(ext)) return false
  // Require pattern like v001.png at the file segment.
  const base = path.basename(relativePath)
  if (!CANDIDATE_RE.test(base)) return false
  return true
}

export function imageMimeFromPath(p: string): string {
  const ext = path.extname(p).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

// ---------- readers ----------

async function readMaybe(absPath: string): Promise<string | null> {
  if (!existsSync(absPath)) return null
  try {
    return await fs.readFile(absPath, 'utf8')
  } catch {
    return null
  }
}

export async function readAssetCandidates(
  campaignSlug: string,
  assetSlug: string,
): Promise<CandidateBundle> {
  if (!isSafeSlug(campaignSlug)) throw new Error('unsafe campaignSlug')
  if (!isSafeSlug(assetSlug)) throw new Error('unsafe assetSlug')
  const folderRel = `${INBOX_PREFIX}/${campaignSlug}/${assetSlug}`
  const folderAbs = ensureUnderInbox(folderRel)
  const warnings: string[] = []

  let promptMeta: PromptMeta | null = null
  let reviewMeta: ReviewMeta | null = null

  const promptRaw = await readMaybe(path.join(folderAbs, 'prompt.md'))
  if (promptRaw) {
    const parsed = readFrontmatter(promptRaw)
    if (parsed.hasFrontmatter) {
      promptMeta = coercePromptMeta(parsed.meta)
      if (parsed.warnings.length > 0) warnings.push(...parsed.warnings.map((w) => `prompt.md: ${w}`))
    } else {
      warnings.push('prompt.md present but has no frontmatter')
    }
  }
  const reviewRaw = await readMaybe(path.join(folderAbs, 'review.md'))
  if (reviewRaw) {
    const parsed = readFrontmatter(reviewRaw)
    if (parsed.hasFrontmatter) {
      reviewMeta = coerceReviewMeta(parsed.meta)
      if (parsed.warnings.length > 0) warnings.push(...parsed.warnings.map((w) => `review.md: ${w}`))
    } else {
      warnings.push('review.md present but has no frontmatter')
    }
  }

  const candidates: CandidateMeta[] = []
  if (existsSync(folderAbs)) {
    const entries = await fs.readdir(folderAbs, {withFileTypes: true})
    for (const e of entries) {
      if (!e.isFile()) continue
      if (!CANDIDATE_RE.test(e.name)) continue
      const ext = path.extname(e.name).toLowerCase()
      if (!IMAGE_EXTS.has(ext)) continue
      const id = e.name.slice(0, e.name.length - ext.length) // v001
      const absFile = path.join(folderAbs, e.name)
      const stat = await fs.stat(absFile)
      const dims = ext === '.png' ? await pngDimensions(absFile) : null
      const stratItem = promptMeta?.candidateStrategy?.find((s) => s.id === id)
      const scoreItem = reviewMeta?.candidateScores?.[id]
      candidates.push({
        id,
        relativePath: `${folderRel}/${e.name}`,
        fileName: e.name,
        fileSize: stat.size,
        pixelWidth: dims ? dims.width : null,
        pixelHeight: dims ? dims.height : null,
        generatedAt: stat.mtime.toISOString(),
        variant: stratItem?.variant ?? scoreItem?.variant ?? null,
        layoutPattern: stratItem?.layoutPattern ?? null,
        score: scoreItem?.score ?? null,
        notes: scoreItem?.notes ?? null,
      })
    }
    candidates.sort((a, b) => a.id.localeCompare(b.id))
  }

  return {
    campaignSlug,
    assetSlug,
    folderRelativePath: folderRel,
    promptMeta,
    reviewMeta,
    candidates,
    hasPrompt: promptRaw !== null,
    hasReview: reviewRaw !== null,
    warnings,
  }
}

export async function listInbox(): Promise<InboxAssetSummary[]> {
  const root = repoPath(INBOX_PREFIX)
  if (!existsSync(root)) return []
  const out: InboxAssetSummary[] = []
  const campaigns = await fs.readdir(root, {withFileTypes: true})
  for (const c of campaigns) {
    if (!c.isDirectory()) continue
    if (!isSafeSlug(c.name)) continue
    const campaignDir = path.join(root, c.name)
    const hasReviewManifest = existsSync(path.join(campaignDir, 'review-manifest.json'))
    const assets = await fs.readdir(campaignDir, {withFileTypes: true})
    for (const a of assets) {
      if (!a.isDirectory()) continue
      if (!isSafeSlug(a.name)) continue
      const assetDir = path.join(campaignDir, a.name)
      const inner = await fs.readdir(assetDir, {withFileTypes: true})
      let count = 0
      let hasPrompt = false
      let hasReview = false
      for (const f of inner) {
        if (!f.isFile()) continue
        if (CANDIDATE_RE.test(f.name)) count++
        if (f.name === 'prompt.md') hasPrompt = true
        if (f.name === 'review.md') hasReview = true
      }
      out.push({
        campaignSlug: c.name,
        assetSlug: a.name,
        folderRelativePath: `${INBOX_PREFIX}/${c.name}/${a.name}`,
        candidateCount: count,
        hasPrompt,
        hasReview,
        hasReviewManifest,
      })
    }
  }
  out.sort((x, y) =>
    x.campaignSlug.localeCompare(y.campaignSlug) || x.assetSlug.localeCompare(y.assetSlug),
  )
  return out
}

export async function readReviewManifest(campaignSlug: string): Promise<{
  exists: boolean
  campaignSlug: string
  manifest: unknown
}> {
  if (!isSafeSlug(campaignSlug)) throw new Error('unsafe campaignSlug')
  const rel = `${INBOX_PREFIX}/${campaignSlug}/review-manifest.json`
  const abs = ensureUnderInbox(rel)
  if (!existsSync(abs)) {
    return {exists: false, campaignSlug, manifest: {candidates: [], updatedAt: ''}}
  }
  const raw = await fs.readFile(abs, 'utf8')
  try {
    return {exists: true, campaignSlug, manifest: JSON.parse(raw)}
  } catch {
    return {exists: true, campaignSlug, manifest: {candidates: [], updatedAt: '', parseError: true}}
  }
}

// Resolve the absolute filesystem path for a candidate image relative path,
// performing all path validation. Throws on invalid input — caller (the
// candidate-image route) translates errors to HTTP status codes.
export function resolveCandidateImagePath(relativePath: string): {absolute: string; mime: string} {
  const decoded = decodeURIComponentSafe(relativePath)
  if (!isAllowedCandidateImage(decoded)) {
    throw new Error('not allowed')
  }
  const abs = ensureUnderInbox(decoded)
  return {absolute: abs, mime: imageMimeFromPath(decoded)}
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
