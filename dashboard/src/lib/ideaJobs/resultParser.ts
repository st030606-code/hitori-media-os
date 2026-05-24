// Phase 2C-0.1 — parser for AI-developed idea result (boss-pasted ChatGPT /
// Claude / Codex output).
//
// What this module does:
//   - Accepts a pasted string up to 200 KB.
//   - Returns the markdown text portion + an optional structured JSON
//     object that boss-confirmed fields can be derived from.
//   - Tolerates 3 input shapes:
//       1. Pure JSON object (no markdown). Accepted if it parses cleanly.
//       2. Markdown containing a fenced ```json ... ``` block (prefers the
//          LAST such block — AI agents typically emit metadata at the end).
//       3. Markdown without any JSON block. Markdown-only is valid.
//   - When malformed JSON is found, parser falls back to markdown-only and
//     records a warning. Never throws on JSON parse failure.
//   - `detectedFields` lists which of the 13 expected contentIdea-shaped
//     fields are present.
//
// Boundaries (handoff/0197 CONFIRMED):
//   - This module NEVER touches the filesystem.
//   - This module NEVER calls any LLM API.
//   - The dashboard NEVER logs the result body — caller is responsible for
//     truncating any echo before logging.

export const MAX_RESULT_BYTES = 200 * 1024 // 200 KB

/** Fields the prompt asks the AI to return, in stable display order. */
export const EXPECTED_RESULT_FIELDS = [
  'proposedTitle',
  'coreThesis',
  'targetReader',
  'audiencePain',
  'claims',
  'objections',
  'examples',
  'platformAngles',
  'visualPotential',
  'recommendedCampaignFraming',
  'risks',
  'weakPoints',
  'nextQuestions',
] as const

export type ExpectedField = (typeof EXPECTED_RESULT_FIELDS)[number]

/**
 * Older prompts (Phase 2C-0 v1) emit `recommendedCampaign` instead of
 * `recommendedCampaignFraming`. We accept either, normalising on the way
 * out. Same logic for `risks` vs `weakPoints` (the prompt currently lists
 * them as separate buckets, but agents often merge them).
 */
const FIELD_ALIASES: Partial<Record<ExpectedField, readonly string[]>> = {
  recommendedCampaignFraming: ['recommendedCampaign', 'recommended_campaign', 'campaignFraming'],
  proposedTitle: ['title', 'proposed_title'],
  coreThesis: ['thesis', 'core_thesis'],
  targetReader: ['target_reader', 'audience'],
  audiencePain: ['audience_pain', 'pain'],
  platformAngles: ['platform_angles', 'angles'],
  visualPotential: ['visual_potential', 'visual'],
  weakPoints: ['weak_points', 'weaknesses'],
  nextQuestions: ['next_questions', 'questions'],
} as const

export type ResultParserError =
  | 'empty'
  | 'too-large'

export interface ResultParserErrorDetail {
  ok: false
  error: ResultParserError
  message: string
}

export interface ParsedResult {
  ok: true
  /** The markdown portion. If the input was pure JSON, this is the empty
   *  string. If the input had a JSON code-fence, that fence is preserved
   *  in the markdown (we only extract a copy for inspection — boss may
   *  want the full document saved verbatim). */
  markdownText: string
  /** Boss-confirmed JSON object if successfully parsed, else null. */
  structuredJson: Record<string, unknown> | null
  /** Pretty-printed JSON (2-space indent) ready to write to result.json. */
  structuredJsonText: string | null
  /** List of EXPECTED_RESULT_FIELDS keys that appeared (after alias
   *  normalisation). Empty when structuredJson is null. */
  detectedFields: ExpectedField[]
  /** Non-fatal parse warnings (malformed JSON, multiple blocks, alias
   *  remappings, etc.). Caller surfaces these to the UI. */
  parseWarnings: string[]
  /** Cheap preview of the first ~600 characters of markdown for UI hint. */
  previewExcerpt: string
}

export type ResultParseResult = ParsedResult | ResultParserErrorDetail

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

/**
 * Try to parse `text` as a complete JSON value. Returns the object on
 * success, null on failure or non-object results (e.g. raw arrays).
 */
function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return null
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (isPlainObject(parsed)) return parsed
    return null
  } catch {
    return null
  }
}

interface JsonBlockExtraction {
  jsonText: string | null
  blockCount: number
}

/**
 * Locate fenced ```json ... ``` blocks in `markdown`. Returns the body of
 * the LAST block (AI agents typically place metadata at the end). The
 * block count is surfaced as a warning when > 1 so boss can verify the
 * right block was used.
 */
function extractLastJsonBlock(markdown: string): JsonBlockExtraction {
  // Match ```json (or ```JSON) ... ```, capturing body. Multi-line.
  const re = /```\s*json\s*\r?\n([\s\S]*?)```/gi
  const matches: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown)) !== null) {
    matches.push(m[1])
  }
  if (matches.length === 0) return {jsonText: null, blockCount: 0}
  return {jsonText: matches[matches.length - 1].trim(), blockCount: matches.length}
}

/** Apply alias remapping so the canonical keys are present when possible. */
function normaliseFieldKeys(
  raw: Record<string, unknown>,
): {normalised: Record<string, unknown>; aliasRemaps: string[]} {
  const out: Record<string, unknown> = {...raw}
  const aliasRemaps: string[] = []
  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES) as ReadonlyArray<
    [ExpectedField, readonly string[]]
  >) {
    if (canonical in out) continue
    for (const alias of aliases) {
      if (alias in out) {
        out[canonical] = out[alias]
        aliasRemaps.push(`${alias} → ${canonical}`)
        break
      }
    }
  }
  return {normalised: out, aliasRemaps}
}

function detectFields(normalised: Record<string, unknown>): ExpectedField[] {
  const detected: ExpectedField[] = []
  for (const field of EXPECTED_RESULT_FIELDS) {
    const value = normalised[field]
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim().length === 0) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (
      isPlainObject(value) &&
      Object.keys(value).length === 0
    )
      continue
    detected.push(field)
  }
  return detected
}

function buildPreviewExcerpt(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= 600) return trimmed
  return trimmed.slice(0, 600) + '…'
}

export function parseAiDevelopmentResult(input: string): ResultParseResult {
  if (typeof input !== 'string') {
    return {ok: false, error: 'empty', message: 'resultText must be a string'}
  }
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return {ok: false, error: 'empty', message: 'resultText is empty'}
  }
  const byteLength = Buffer.byteLength(input, 'utf8')
  if (byteLength > MAX_RESULT_BYTES) {
    return {
      ok: false,
      error: 'too-large',
      message: `resultText exceeds ${MAX_RESULT_BYTES} bytes (got ${byteLength})`,
    }
  }
  const warnings: string[] = []

  // Pattern 1: entire input parses as a JSON object.
  const wholeJson = tryParseJsonObject(input)
  if (wholeJson) {
    const {normalised, aliasRemaps} = normaliseFieldKeys(wholeJson)
    if (aliasRemaps.length > 0) {
      warnings.push(`Aliased keys normalised: ${aliasRemaps.join(', ')}`)
    }
    const detected = detectFields(normalised)
    return {
      ok: true,
      markdownText: '',
      structuredJson: normalised,
      structuredJsonText: JSON.stringify(normalised, null, 2) + '\n',
      detectedFields: detected,
      parseWarnings:
        detected.length === 0
          ? [...warnings, 'JSON parsed but no expected fields detected']
          : warnings,
      previewExcerpt: buildPreviewExcerpt(JSON.stringify(normalised, null, 2)),
    }
  }

  // Pattern 2/3: markdown with optional fenced ```json``` block.
  const extracted = extractLastJsonBlock(input)
  if (extracted.blockCount > 1) {
    warnings.push(
      `Multiple JSON code blocks found (${extracted.blockCount}); using the last one.`,
    )
  }
  let structuredJson: Record<string, unknown> | null = null
  let detected: ExpectedField[] = []
  let structuredJsonText: string | null = null
  if (extracted.jsonText !== null) {
    const parsed = tryParseJsonObject(extracted.jsonText)
    if (parsed) {
      const {normalised, aliasRemaps} = normaliseFieldKeys(parsed)
      if (aliasRemaps.length > 0) {
        warnings.push(`Aliased keys normalised: ${aliasRemaps.join(', ')}`)
      }
      structuredJson = normalised
      detected = detectFields(normalised)
      structuredJsonText = JSON.stringify(normalised, null, 2) + '\n'
      if (detected.length === 0) {
        warnings.push('JSON block parsed but no expected fields detected')
      }
    } else {
      warnings.push('JSON code block found but failed to parse — falling back to markdown-only')
    }
  } else {
    warnings.push('No JSON code block detected — markdown-only result')
  }
  return {
    ok: true,
    markdownText: input,
    structuredJson,
    structuredJsonText,
    detectedFields: detected,
    parseWarnings: warnings,
    previewExcerpt: buildPreviewExcerpt(input),
  }
}
