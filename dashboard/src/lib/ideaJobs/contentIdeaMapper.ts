// Phase 2C-1 — Content Idea draft mapper.
//
// What this module does:
//   - Takes a parsed `result.json` (from Phase 2C-0.1 import) plus an
//     optional `_raw.json` (Phase 2C-0) and shapes it into a draft that
//     boss can either:
//       1. Paste field-by-field into Sanity Studio's "New Content Idea" form, or
//       2. Copy as a single JSON blob and paste into Studio's JSON view.
//   - Surfaces alias normalisation + missing-field warnings so boss can
//     spot AI-side gaps before promoting the idea.
//
// Schema reference (read-only — Q-2C-1 / Q-2C-8 maintain "no schema change"):
//   - Sanity `contentIdea` (schemas/contentIdea.ts) requires:
//       title (string), slug (slug), status (enum, default 'idea'),
//       summary (text), coreThesis (text), audience (array of string, min 1),
//       audiencePain (text), claims (array of object, min 1),
//       tone (object with `voice` required),
//       platformAngles (array of object, min 1).
//   - Optional schema fields: rawInput (text), contentPillars (array),
//       evidence, examples, objections, sourceLinks, outputChecklist,
//       personalContext.
//
// Boundaries:
//   - Pure function module. No filesystem, no Sanity, no network.

import {slugifyTitle, validateIdeaSlug} from './paths'
import type {RawIdeaJsonShape} from './reader'

export const CONTENT_IDEA_STUDIO_FIELDS = [
  'title',
  'slug',
  'status',
  'summary',
  'rawInput',
  'coreThesis',
  'audience',
  'audiencePain',
  'contentPillars',
  'claims',
  'evidence',
  'objections',
  'examples',
  'platformAngles',
  'tone',
  'voice',
  'sourceLinks',
  'outputChecklist',
  'personalContext',
] as const

/** Sanity slug field shape — `{_type: 'slug', current: '...'}`. */
export interface ContentIdeaSlugDraft {
  _type: 'slug'
  current: string
}

/**
 * Source attribution for slug derivation. Exposed so the UI can show
 * "derived from proposedTitle" vs "fell back to ideaSlug".
 */
export type ContentIdeaSlugSource =
  | 'proposedTitle'
  | 'rawTitle'
  | 'ideaSlug'
  | 'fallback'

export type StudioField = (typeof CONTENT_IDEA_STUDIO_FIELDS)[number]

const DEFAULT_STATUS: ContentIdeaStudioDraft['status'] = 'idea'
const DEFAULT_VOICE =
  '実務寄りで率直、構造化された語り口。必要に応じてStudioでbrandProfileに合わせて調整。'

const VALID_PLATFORM_VALUES = [
  'note',
  'substack',
  'threads',
  'x',
  'youtube',
  'shorts',
  'podcast',
  'diagram',
  'github',
  'paid',
  'instagram',
  'newsletter',
] as const

type PlatformValue = (typeof VALID_PLATFORM_VALUES)[number]

const PLATFORM_ALIASES: Record<string, PlatformValue> = {
  note: 'note',
  substack: 'substack',
  threads: 'threads',
  thread: 'threads',
  x: 'x',
  twitter: 'x',
  youtube: 'youtube',
  yt: 'youtube',
  shorts: 'shorts',
  'youtube-shorts': 'shorts',
  podcast: 'podcast',
  audio: 'podcast',
  diagram: 'diagram',
  visual: 'diagram',
  github: 'github',
  gh: 'github',
  paid: 'paid',
  'paid-article': 'paid',
  instagram: 'instagram',
  insta: 'instagram',
  newsletter: 'newsletter',
  mail: 'newsletter',
}

export interface ContentIdeaClaim {
  claim: string
  supportingEvidence?: string
  confidence?: 'low' | 'medium' | 'high'
  needsVerification?: boolean
}

export interface ContentIdeaEvidence {
  type?: string
  description?: string
  sourceUrl?: string
  notes?: string
}

export interface ContentIdeaObjection {
  objection: string
  response?: string
}

export interface ContentIdeaExample {
  title: string
  description?: string
}

export interface ContentIdeaPlatformAngle {
  platform: string
  targetReader?: string
  hook?: string
  formatNotes?: string
  callToAction?: string
}

export interface ContentIdeaToneDraft {
  voice: string
  styleNotes?: string[]
  avoid?: string[]
}

export interface ContentIdeaSourceLink {
  type?: string
  title?: string
  reference?: string
  notes?: string
}

export interface ContentIdeaOutputChecklistItem {
  outputType?: string
  status?: string
  localOutputPath?: string
  publishedUrl?: string
  notes?: string
}

export type SchemaChecklistState = 'ready' | 'missing' | 'needs-manual-edit'

export interface SchemaChecklistItem {
  field: string
  label: string
  state: SchemaChecklistState
  message: string
}

/**
 * Schema-friendly draft. Only includes fields that map to existing Sanity
 * `contentIdea` schema fields. Required gaps get schema-valid fallbacks
 * plus warnings/checklist states so boss can still make the final Studio
 * validation decision manually.
 */
export interface ContentIdeaStudioDraft {
  title: string
  slug: ContentIdeaSlugDraft
  status: 'idea' | 'researched' | 'drafted' | 'reviewed' | 'archived'
  summary: string
  rawInput: string
  coreThesis: string
  audience: string[]
  audiencePain: string
  contentPillars: string[]
  claims: ContentIdeaClaim[]
  evidence: ContentIdeaEvidence[]
  objections: ContentIdeaObjection[]
  examples: ContentIdeaExample[]
  platformAngles: ContentIdeaPlatformAngle[]
  tone: ContentIdeaToneDraft
  sourceLinks: ContentIdeaSourceLink[]
  outputChecklist: ContentIdeaOutputChecklistItem[]
  personalContext: string
}

export interface ContentIdeaExtendedDraft {
  visualPotential: unknown
  recommendedCampaignFraming: unknown
  risks: unknown
  weakPoints: unknown
  nextQuestions: unknown
}

export interface ContentIdeaProvenance {
  source: 'idea-jobs'
  ideaSlug: string
  timestamp: string
  resultJsonPath: string
  resultMdPath: string
  rawJsonPath: string
  createdFromRawIdea: boolean
  /** ISO 8601 of when this draft was prepared. */
  preparedAtIso: string
}

export interface MappedContentIdea {
  studioDraft: ContentIdeaStudioDraft
  /** Schema-aligned JSON only. Safe as a Studio reference payload. */
  studioDraftJsonText: string
  extended: ContentIdeaExtendedDraft
  /** Extra non-schema context for future automation and debugging. */
  enrichedDraft: {
    extended: ContentIdeaExtendedDraft
    provenance: ContentIdeaProvenance
    warnings: string[]
  }
  provenance: ContentIdeaProvenance
  schemaChecklist: SchemaChecklistItem[]
  /** Where the slug came from. Surfaced in UI so boss can spot when we
   *  fell back to ideaSlug or to the timestamped sentinel. */
  slugSource: ContentIdeaSlugSource
  /** Single JSON blob suitable for the "Content Idea 用 JSON をコピー"
   *  button. Combines studioDraft + extended + provenance. */
  copyableJsonText: string
  /** Field-level clipboard payloads keyed by `StudioField`. */
  fieldClipboards: Partial<Record<StudioField, string>>
  warnings: string[]
  fieldWarnings: Partial<Record<StudioField, string[]>>
}

export interface MapperInput {
  result: Record<string, unknown>
  rawIdea: RawIdeaJsonShape | null
  ideaSlug: string
  timestamp: string
  resultJsonPath: string
  resultMdPath: string
  rawJsonPath: string
  preparedAtIso: string
}

// ---------------------------------------------------------------------------
// Helpers for tolerant field reads.
// ---------------------------------------------------------------------------

function readString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    const items: string[] = []
    for (const item of value) {
      const s = readString(item)
      if (s.length > 0) items.push(s)
    }
    return items
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    // Some AI agents return a single string instead of an array.
    return [value.trim()]
  }
  return []
}

function readObjectRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readClaims(value: unknown): ContentIdeaClaim[] {
  if (!Array.isArray(value)) return []
  const out: ContentIdeaClaim[] = []
  for (const item of value) {
    const obj = readObjectRecord(item)
    if (!obj) {
      // String claims are tolerated — AI sometimes returns ["foo", "bar"].
      const s = readString(item)
      if (s.length > 0) out.push({claim: s})
      continue
    }
    const claim = readString(obj.claim ?? obj.title ?? obj.description ?? obj.text)
    if (claim.length === 0) continue
    const entry: ContentIdeaClaim = {claim}
    const supportingEvidence = readString(
      obj.supportingEvidence ?? obj.support ?? obj.evidence ?? obj.reason ?? obj.notes ?? '',
    )
    if (supportingEvidence) entry.supportingEvidence = supportingEvidence
    const confidence = readString(obj.confidence)
    if (confidence === 'low' || confidence === 'medium' || confidence === 'high') {
      entry.confidence = confidence
    }
    if (typeof obj.needsVerification === 'boolean') {
      entry.needsVerification = obj.needsVerification
    }
    out.push(entry)
  }
  return out
}

function buildFallbackClaim(coreThesis: string, title: string): ContentIdeaClaim[] {
  const claim = coreThesis || title
  if (!claim) return []
  return [
    {
      claim,
      confidence: 'medium',
      needsVerification: true,
    },
  ]
}

function readEvidence(value: unknown, claims: ContentIdeaClaim[]): ContentIdeaEvidence[] {
  const out: ContentIdeaEvidence[] = []
  if (Array.isArray(value)) {
    for (const item of value) {
      const obj = readObjectRecord(item)
      if (!obj) {
        const description = readString(item)
        if (description) out.push({description})
        continue
      }
      const entry: ContentIdeaEvidence = {}
      const type = readString(obj.type)
      const description = readString(obj.description ?? obj.evidence ?? obj.summary ?? obj.text)
      const sourceUrl = readString(obj.sourceUrl ?? obj.source_url ?? obj.url)
      const notes = readString(obj.notes ?? obj.note)
      if (type) entry.type = type
      if (description) entry.description = description
      if (sourceUrl) entry.sourceUrl = sourceUrl
      if (notes) entry.notes = notes
      if (Object.keys(entry).length > 0) out.push(entry)
    }
  }
  if (out.length === 0) {
    for (const claim of claims) {
      if (claim.supportingEvidence) {
        out.push({
          type: 'claim-support',
          description: claim.supportingEvidence,
          notes: claim.claim,
        })
      }
    }
  }
  return out
}

function readObjections(value: unknown): ContentIdeaObjection[] {
  if (!Array.isArray(value)) return []
  const out: ContentIdeaObjection[] = []
  for (const item of value) {
    const obj = readObjectRecord(item)
    if (!obj) {
      const s = readString(item)
      if (s.length > 0) out.push({objection: s})
      continue
    }
    const objection = readString(obj.objection)
    if (objection.length === 0) continue
    const entry: ContentIdeaObjection = {objection}
    const response = readString(obj.response)
    if (response) entry.response = response
    out.push(entry)
  }
  return out
}

function readExamples(value: unknown): ContentIdeaExample[] {
  if (!Array.isArray(value)) return []
  const out: ContentIdeaExample[] = []
  for (const item of value) {
    const obj = readObjectRecord(item)
    if (!obj) {
      const s = readString(item)
      if (s.length > 0) out.push({title: s})
      continue
    }
    const title = readString(obj.title)
    if (title.length === 0) continue
    const entry: ContentIdeaExample = {title}
    const description = readString(obj.description)
    if (description) entry.description = description
    out.push(entry)
  }
  return out
}

function normalizePlatform(value: unknown): PlatformValue | null {
  const raw = readString(value).toLowerCase().trim()
  if (!raw) return null
  return PLATFORM_ALIASES[raw] ?? null
}

function readPlatformAngles(value: unknown): ContentIdeaPlatformAngle[] {
  const out: ContentIdeaPlatformAngle[] = []
  const pushObject = (obj: Record<string, unknown>, fallbackPlatform?: string): void => {
    const platform = normalizePlatform(obj.platform ?? fallbackPlatform)
    if (!platform) return
    const entry: ContentIdeaPlatformAngle = {platform}
    const targetReader = readString(obj.targetReader ?? obj.target_reader ?? obj.reader)
    if (targetReader) entry.targetReader = targetReader
    const hook = readString(obj.hook ?? obj.title ?? obj.angle)
    if (hook) entry.hook = hook
    const formatNotes = readString(obj.formatNotes ?? obj.format_notes ?? obj.format ?? obj.notes)
    if (formatNotes) entry.formatNotes = formatNotes
    const callToAction = readString(obj.callToAction ?? obj.call_to_action ?? obj.cta)
    if (callToAction) entry.callToAction = callToAction
    out.push(entry)
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const obj = readObjectRecord(item)
      if (!obj) continue
      pushObject(obj)
    }
  } else {
    const obj = readObjectRecord(value)
    if (obj) {
      for (const [key, nested] of Object.entries(obj)) {
        const nestedObj = readObjectRecord(nested)
        if (nestedObj) {
          pushObject(nestedObj, key)
        } else {
          const text = readString(nested)
          if (text && normalizePlatform(key)) {
            pushObject({hook: text}, key)
          }
        }
      }
    }
  }
  return out
}

function buildFallbackPlatformAngles(title: string, audience: string[]): ContentIdeaPlatformAngle[] {
  return [
    {
      platform: 'note',
      targetReader: audience[0],
      hook: title,
      formatNotes: 'Phase 2C-1 schema alignment fallback。Studioで媒体別の切り口を確認してください。',
      callToAction: '必要に応じてnote / Substack / X / Threads向けに調整する。',
    },
  ]
}

function readContentPillars(result: Record<string, unknown>, claims: ContentIdeaClaim[]): string[] {
  const direct = readStringArray(result.contentPillars ?? result.content_pillars ?? result.pillars)
  if (direct.length > 0) return direct
  return claims.slice(0, 3).map((claim) => claim.claim)
}

function checklistItem(
  field: string,
  label: string,
  ready: boolean,
  message: string,
  readyState: SchemaChecklistState = 'ready',
): SchemaChecklistItem {
  return {
    field,
    label,
    state: ready ? readyState : 'missing',
    message,
  }
}

/**
 * Format visualPotential / recommendedCampaignFraming / risks / weakPoints
 * / nextQuestions into a single `personalContext` paragraph. Boss can keep
 * it, edit it, or move parts into other Studio fields.
 */
function buildPersonalContext(
  result: Record<string, unknown>,
): string {
  const sections: string[] = []

  const visualPotential = result.visualPotential
  if (visualPotential !== undefined && visualPotential !== null) {
    sections.push(`## visualPotential\n${formatLooseValue(visualPotential)}`)
  }

  const campaign = result.recommendedCampaignFraming ?? result.recommendedCampaign
  if (campaign !== undefined && campaign !== null) {
    sections.push(`## recommendedCampaignFraming\n${formatLooseValue(campaign)}`)
  }

  const risks = result.risks
  const risksArray = readStringArray(risks)
  if (risksArray.length > 0) {
    sections.push(`## risks\n${risksArray.map((r) => `- ${r}`).join('\n')}`)
  }

  const weakPoints = result.weakPoints ?? result.weak_points
  const weakArray = readStringArray(weakPoints)
  if (weakArray.length > 0) {
    sections.push(`## weakPoints\n${weakArray.map((r) => `- ${r}`).join('\n')}`)
  }

  const nextQuestions = result.nextQuestions ?? result.next_questions ?? result.questions
  const nextArray = readStringArray(nextQuestions)
  if (nextArray.length > 0) {
    sections.push(`## nextQuestions\n${nextArray.map((r) => `- ${r}`).join('\n')}`)
  }

  if (sections.length === 0) return ''
  return sections.join('\n\n')
}

/**
 * Derive a deterministic slug for the Studio `slug.current` field.
 *
 * Priority:
 *   1. `proposedTitle` (AI-suggested) — slugify ASCII portion.
 *   2. `rawTitle` (boss-entered) — slugify ASCII portion.
 *   3. `ideaSlug` — already a valid lowercase-alphanumeric-hyphen slug from
 *      Phase 2C-0 (validated against `IDEA_SLUG_RE`).
 *   4. `content-idea-<timestamp>` sentinel — guaranteed unique-per-job.
 *
 * No CJK transliteration is attempted (no kuroshiro / wanakana dependency
 * added). Japanese titles fall through to ideaSlug, which Phase 2C-0
 * already derived from ASCII portions of the rawTitle.
 *
 * The returned value is guaranteed to satisfy the same regex as
 * `validateIdeaSlug` (lowercase, alphanumeric + hyphen, length ≤ 80).
 */
export function deriveContentIdeaSlug(args: {
  proposedTitle: string
  rawTitle: string | undefined
  ideaSlug: string
  timestamp: string
}): {value: string; source: ContentIdeaSlugSource} {
  const proposedTitle = args.proposedTitle.trim()
  if (proposedTitle.length > 0) {
    const candidate = slugifyTitle(proposedTitle, '')
    if (candidate.length > 0) {
      const check = validateIdeaSlug(candidate)
      if (check.ok) return {value: check.slug, source: 'proposedTitle'}
    }
  }
  const rawTitle = (args.rawTitle ?? '').trim()
  if (rawTitle.length > 0) {
    const candidate = slugifyTitle(rawTitle, '')
    if (candidate.length > 0) {
      const check = validateIdeaSlug(candidate)
      if (check.ok) return {value: check.slug, source: 'rawTitle'}
    }
  }
  const ideaSlugCheck = validateIdeaSlug(args.ideaSlug)
  if (ideaSlugCheck.ok) {
    return {value: ideaSlugCheck.slug, source: 'ideaSlug'}
  }
  // `content-idea-<YYYYMMDD-HHMMSS>` — 28 chars, well under 80 cap, matches
  // `[a-z0-9][a-z0-9-]{0,79}`.
  return {value: `content-idea-${args.timestamp}`, source: 'fallback'}
}

function formatLooseValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    return value.map((v) => formatLooseValue(v)).filter((s) => s.length > 0).map((s) => `- ${s}`).join('\n')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return ''
}

// ---------------------------------------------------------------------------
// Main mapper.
// ---------------------------------------------------------------------------

export function mapResultToContentIdea(input: MapperInput): MappedContentIdea {
  const {result, rawIdea, ideaSlug, timestamp, resultJsonPath, resultMdPath, rawJsonPath, preparedAtIso} = input

  const warnings: string[] = []
  const fieldWarnings: Partial<Record<StudioField, string[]>> = {}

  function addFieldWarning(field: StudioField, message: string): void {
    const list = fieldWarnings[field] ?? []
    list.push(message)
    fieldWarnings[field] = list
  }

  // ---- title -------------------------------------------------------------
  const proposedTitleRaw = readString(result.proposedTitle ?? result.title ?? '')
  const title = proposedTitleRaw.length > 0
    ? proposedTitleRaw
    : readString(rawIdea?.rawTitle ?? '')
  if (title.length === 0) {
    addFieldWarning('title', 'AI 結果に proposedTitle / title が見つかりません。 Studio で手入力が必要です。')
  }

  const safeTitle = title || `Content Idea ${timestamp}`

  // ---- slug --------------------------------------------------------------
  // Derive a deterministic Sanity-friendly slug. Order: proposedTitle →
  // rawTitle → ideaSlug → content-idea-<timestamp>. CJK titles fall through
  // to ideaSlug (Phase 2C-0 already produced an ASCII slug from any ASCII
  // portion of rawTitle; pure-CJK rawTitles get a `idea-<hex>` fallback).
  const slugDerived = deriveContentIdeaSlug({
    proposedTitle: proposedTitleRaw,
    rawTitle: rawIdea?.rawTitle ?? undefined,
    ideaSlug,
    timestamp,
  })
  const slug: ContentIdeaSlugDraft = {_type: 'slug', current: slugDerived.value}
  if (slugDerived.source === 'ideaSlug') {
    addFieldWarning(
      'slug',
      'proposedTitle / rawTitle から ASCII slug を生成できなかったため、 Phase 2C-0 で生成済の ideaSlug を流用しています。 Studio で読みやすい slug に書き換えることを推奨。',
    )
  } else if (slugDerived.source === 'fallback') {
    addFieldWarning(
      'slug',
      `proposedTitle / rawTitle / ideaSlug いずれからも slug を生成できなかったため、 sentinel "content-idea-<timestamp>" を使っています。 Studio で必ず書き換えてください。`,
    )
  }

  // ---- summary (Schema required) ----------------------------------------
  // The prompt does not ask the AI for a summary field. Synthesize a short
  // summary from coreThesis when possible so boss has a sensible default.
  const coreThesis = readString(result.coreThesis ?? result.core_thesis ?? '')
  const summary = coreThesis.length > 0
    ? (coreThesis.length > 240 ? coreThesis.slice(0, 237) + '…' : coreThesis)
    : safeTitle
  if (coreThesis.length === 0) {
    addFieldWarning('summary', 'schema 必須項目。coreThesis が空のため title から暫定 summary を入れています。')
  } else if (coreThesis.length > 240) {
    addFieldWarning('summary', 'coreThesis から自動切り詰めました (240 字)。 Studio で短く整え直すことを推奨。')
  }

  // ---- rawInput ----------------------------------------------------------
  const rawInputParts: string[] = []
  if (rawIdea?.rawTitle) rawInputParts.push(`# ${rawIdea.rawTitle}`)
  if (rawIdea?.roughMemo) rawInputParts.push(rawIdea.roughMemo)
  if (rawIdea?.sourceContext) rawInputParts.push(`(source: ${rawIdea.sourceContext})`)
  const rawInput = rawInputParts.join('\n\n')

  // ---- audience (Schema required min 1) ---------------------------------
  let audience = readStringArray(result.targetReader ?? result.target_reader ?? result.audience)
  if (audience.length === 0) {
    audience = ['AI時代に個人メディアを運用したい人']
    addFieldWarning('audience', 'schema 必須 (min 1)。 AI 結果に targetReader が見つからないため、暫定値を入れています。 Studio で確認してください。')
  }

  // ---- audiencePain (Schema required) -----------------------------------
  const audiencePainRaw = readString(result.audiencePain ?? result.audience_pain ?? result.pain ?? '')
  const audiencePain = audiencePainRaw || '読者の課題はAI企画化結果から十分に特定できません。Studioで具体化してください。'
  if (audiencePain.length === 0) {
    addFieldWarning('audiencePain', 'schema 必須項目です。 AI 結果に audiencePain がありません。')
  } else if (!audiencePainRaw) {
    addFieldWarning('audiencePain', 'schema 必須項目。AI 結果に audiencePain がないため暫定文を入れています。')
  }

  // ---- coreThesis (Schema required) -------------------------------------
  if (coreThesis.length === 0) {
    addFieldWarning('coreThesis', 'schema 必須項目です。 AI 結果に coreThesis がありません。')
  }
  const safeCoreThesis = coreThesis || safeTitle

  // ---- claims (Schema required min 1) -----------------------------------
  let claims = readClaims(result.claims)
  if (claims.length === 0) {
    claims = buildFallbackClaim(coreThesis, safeTitle)
    addFieldWarning('claims', 'schema 必須 (min 1)。 AI 結果に claims が見つからないため、coreThesis/title から暫定 claim を作りました。')
  }

  // ---- evidence / contentPillars (optional schema fields) ---------------
  const evidence = readEvidence(result.evidence, claims)
  const contentPillars = readContentPillars(result, claims)

  // ---- objections --------------------------------------------------------
  const objections = readObjections(result.objections)

  // ---- examples ----------------------------------------------------------
  const examples = readExamples(result.examples)

  // ---- platformAngles (Schema required min 1) ---------------------------
  let platformAngles = readPlatformAngles(result.platformAngles ?? result.platform_angles ?? result.angles)
  if (platformAngles.length === 0) {
    platformAngles = buildFallbackPlatformAngles(safeTitle, audience)
    addFieldWarning('platformAngles', 'schema 必須 (min 1)。 AI 結果に platformAngles が見つからないため、note向けの暫定 item を入れています。 Studio で確認してください。')
  }

  // ---- tone (Schema required, voice required) ---------------------------
  // Actual schema has no enum for tone.voice, but both `tone` and
  // `tone.voice` are required. Emit a valid default so Studio can save,
  // while marking it as an editorial/manual-review field in the checklist.
  const tone: ContentIdeaToneDraft = {
    voice: DEFAULT_VOICE,
    styleNotes: ['Phase 2C-1 schema alignment default。必要に応じてbrandProfileに合わせて編集。'],
    avoid: ['過度に一般化した断定', '未検証の事実断定'],
  }
  addFieldWarning('tone', 'schema 必須項目。保存可能な暫定 tone.voice を入れていますが、Studioで編集推奨です。')
  addFieldWarning('voice', 'tone.voice は schema 必須。暫定値を入れています。')

  // ---- personalContext (extended fields の集約) -------------------------
  const personalContext = buildPersonalContext(result)

  // Top-level warnings about extended fields.
  if (result.visualPotential !== undefined && result.visualPotential !== null) {
    warnings.push('visualPotential は contentIdea schema に直接対応する field がないため、 personalContext に集約しました。')
  }
  if (result.recommendedCampaignFraming !== undefined || result.recommendedCampaign !== undefined) {
    warnings.push('recommendedCampaignFraming は contentIdea ではなく campaignPlan の field です。 personalContext に保持し、 Phase 2C-2 以降で campaign 作成時に活用してください。')
  }
  if (readStringArray(result.nextQuestions ?? result.next_questions ?? result.questions).length > 0) {
    warnings.push('nextQuestions は personalContext に集約しました。 schema 直対応 field はありません。')
  }

  const studioDraft: ContentIdeaStudioDraft = {
    title: safeTitle,
    slug,
    status: DEFAULT_STATUS,
    summary,
    rawInput,
    coreThesis: safeCoreThesis,
    audience,
    audiencePain,
    contentPillars,
    claims,
    evidence,
    objections,
    examples,
    platformAngles,
    tone,
    sourceLinks: [],
    outputChecklist: [],
    personalContext,
  }

  const extended: ContentIdeaExtendedDraft = {
    visualPotential: result.visualPotential ?? null,
    recommendedCampaignFraming: result.recommendedCampaignFraming ?? result.recommendedCampaign ?? null,
    risks: result.risks ?? null,
    weakPoints: result.weakPoints ?? result.weak_points ?? null,
    nextQuestions: result.nextQuestions ?? result.next_questions ?? result.questions ?? null,
  }

  const provenance: ContentIdeaProvenance = {
    source: 'idea-jobs',
    ideaSlug,
    timestamp,
    resultJsonPath,
    resultMdPath,
    rawJsonPath,
    createdFromRawIdea: rawIdea !== null,
    preparedAtIso,
  }

  const schemaChecklist: SchemaChecklistItem[] = [
    checklistItem('title', 'title', studioDraft.title.length > 0, 'schema required string'),
    checklistItem('slug', 'slug.current', studioDraft.slug.current.length > 0, 'schema required slug'),
    checklistItem('status', 'status', studioDraft.status === 'idea', 'schema enum value: idea'),
    checklistItem('summary', 'summary', studioDraft.summary.length > 0, 'schema required text'),
    checklistItem('coreThesis', 'coreThesis', studioDraft.coreThesis.length > 0, coreThesis ? 'schema required text' : 'fallback inserted from title; edit in Studio', coreThesis ? 'ready' : 'needs-manual-edit'),
    checklistItem('audience', 'audience', studioDraft.audience.length > 0, 'schema required array min 1'),
    checklistItem('audiencePain', 'audiencePain', studioDraft.audiencePain.length > 0, 'schema required text'),
    checklistItem('claims', 'claims', studioDraft.claims.length > 0 && studioDraft.claims.every((c) => c.claim.length > 0), 'schema required array min 1; item.claim required'),
    checklistItem('tone', 'tone', studioDraft.tone.voice.length > 0, 'schema required object', 'needs-manual-edit'),
    checklistItem('voice', 'tone.voice', studioDraft.tone.voice.length > 0, 'schema required string; default inserted', 'needs-manual-edit'),
    checklistItem('platformAngles', 'platformAngles', studioDraft.platformAngles.length > 0 && studioDraft.platformAngles.every((p) => VALID_PLATFORM_VALUES.includes(p.platform as PlatformValue)), 'schema required array min 1; item.platform required'),
  ]

  const studioDraftJsonText = JSON.stringify(studioDraft, null, 2) + '\n'
  const enrichedDraft = {
    extended,
    provenance,
    warnings,
  }
  const copyableJsonText = JSON.stringify(
    {
      studioDraft,
      enrichedDraft,
      schemaChecklist,
    },
    null,
    2,
  ) + '\n'

  const fieldClipboards: Partial<Record<StudioField, string>> = {}
  if (studioDraft.title) fieldClipboards.title = studioDraft.title
  // Studio's slug input accepts the raw `current` string, not the full
  // `{_type, current}` object — boss pastes the string into the slug
  // input and Studio wraps it back. Keep the convention consistent here.
  fieldClipboards.slug = slug.current
  fieldClipboards.status = studioDraft.status
  if (summary) fieldClipboards.summary = summary
  if (rawInput) fieldClipboards.rawInput = rawInput
  if (studioDraft.coreThesis) fieldClipboards.coreThesis = studioDraft.coreThesis
  if (audience.length > 0) fieldClipboards.audience = audience.join('\n')
  if (audiencePain) fieldClipboards.audiencePain = audiencePain
  if (contentPillars.length > 0) fieldClipboards.contentPillars = contentPillars.join('\n')
  if (claims.length > 0) fieldClipboards.claims = JSON.stringify(claims, null, 2)
  if (evidence.length > 0) fieldClipboards.evidence = JSON.stringify(evidence, null, 2)
  if (objections.length > 0) fieldClipboards.objections = JSON.stringify(objections, null, 2)
  if (examples.length > 0) fieldClipboards.examples = JSON.stringify(examples, null, 2)
  if (platformAngles.length > 0) fieldClipboards.platformAngles = JSON.stringify(platformAngles, null, 2)
  fieldClipboards.tone = JSON.stringify(tone, null, 2)
  fieldClipboards.voice = tone.voice
  if (studioDraft.sourceLinks.length > 0) fieldClipboards.sourceLinks = JSON.stringify(studioDraft.sourceLinks, null, 2)
  if (studioDraft.outputChecklist.length > 0) fieldClipboards.outputChecklist = JSON.stringify(studioDraft.outputChecklist, null, 2)
  if (personalContext) fieldClipboards.personalContext = personalContext

  return {
    studioDraft,
    studioDraftJsonText,
    extended,
    enrichedDraft,
    provenance,
    schemaChecklist,
    slugSource: slugDerived.source,
    copyableJsonText,
    fieldClipboards,
    warnings,
    fieldWarnings,
  }
}
