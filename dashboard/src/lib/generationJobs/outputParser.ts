// Phase 2C-3 — parser for manually generated AI output pasted back into the
// dashboard.
//
// This is intentionally tolerant: Markdown-only is valid. Structured JSON or
// frontmatter is detected when present and can be persisted as draft.json.

import {MAX_GENERATION_JOB_FILE_BYTES} from './paths'

export type DetectedOutputKind =
  | 'json'
  | 'markdown-with-frontmatter'
  | 'markdown-with-json-block'
  | 'markdown'

export type DetectedSection =
  | 'title-candidates'
  | 'lead'
  | 'body'
  | 'cta'
  | 'visual-brief'
  | 'visualPrompt'
  | 'thread-posts'
  | 'notes'
  | 'review-checklist'

export interface ParsedGeneratedOutput {
  markdownText: string
  structuredJson: unknown | null
  frontmatter: Record<string, unknown> | null
  detectedSections: DetectedSection[]
  detectedOutputKind: DetectedOutputKind
  warnings: string[]
  previewExcerpt: string
  metrics: {
    inputBytes: number
    markdownBytes: number
    structuredJsonBytes: number
  }
}

export type OutputParserError =
  | 'empty'
  | 'too-large'
  | 'null-byte'
  | 'invalid-json'

export interface OutputParserErrorDetail {
  ok: false
  error: OutputParserError
  message: string
}

export type ParseGeneratedOutputResult =
  | {ok: true; parsed: ParsedGeneratedOutput}
  | OutputParserErrorDetail

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
const FENCED_JSON_RE = /```(?:json|JSON)\s*\n([\s\S]*?)\n```/

function fail(error: OutputParserError, message: string): OutputParserErrorDetail {
  return {ok: false, error, message}
}

function excerpt(value: string, max = 900): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 20).trimEnd()}\n...`
}

function stableUnique<T extends string>(values: T[]): T[] {
  return [...new Set(values)]
}

function simpleYamlValue(raw: string): unknown {
  const value = raw.trim()
  if (!value) return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^['"]|['"]$/g, ''))
  }
  return value
}

function parseSimpleFrontmatter(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const match = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line)
    if (!match) continue
    out[match[1]] = simpleYamlValue(match[2])
  }
  return out
}

function parseFrontmatter(input: string): {
  frontmatter: Record<string, unknown> | null
  markdownWithoutFrontmatter: string
  warning?: string
} {
  const match = FRONTMATTER_RE.exec(input)
  if (!match) return {frontmatter: null, markdownWithoutFrontmatter: input}
  const parsed = parseSimpleFrontmatter(match[1])
  const rest = input.slice(match[0].length)
  return {
    frontmatter: Object.keys(parsed).length > 0 ? parsed : null,
    markdownWithoutFrontmatter: rest.trimStart(),
    warning: Object.keys(parsed).length === 0 ? 'frontmatter was present but no simple key/value pairs were detected' : undefined,
  }
}

function firstFencedJson(input: string): {json: unknown | null; warning?: string} {
  const match = FENCED_JSON_RE.exec(input)
  if (!match) return {json: null}
  try {
    return {json: JSON.parse(match[1])}
  } catch {
    return {json: null, warning: 'fenced JSON block was detected but could not be parsed'}
  }
}

function markdownFromJson(value: unknown): string {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of ['markdownText', 'markdown', 'draftBody', 'body', 'content', 'text']) {
      const candidate = obj[key]
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    }
    if (Array.isArray(obj.posts)) {
      return obj.posts
        .map((post, index) => {
          if (typeof post === 'string') return `${index + 1}. ${post}`
          if (post && typeof post === 'object') {
            const body = (post as {text?: unknown; body?: unknown; content?: unknown}).text ??
              (post as {body?: unknown}).body ??
              (post as {content?: unknown}).content
            if (typeof body === 'string') return `${index + 1}. ${body}`
          }
          return ''
        })
        .filter(Boolean)
        .join('\n\n')
    }
  }
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``
}

function sectionFromHeading(heading: string): DetectedSection | null {
  const normalised = heading.toLowerCase()
  if (/title|タイトル|候補/.test(normalised)) return 'title-candidates'
  if (/lead|リード|冒頭|導入/.test(normalised)) return 'lead'
  if (/body|本文|draft|下書き/.test(normalised)) return 'body'
  if (/cta|call to action|行動喚起/.test(normalised)) return 'cta'
  if (/visual[-\s]?brief|ビジュアル.*brief|画像.*brief|visual direction/.test(normalised)) {
    return 'visual-brief'
  }
  if (/visualprompt|visual prompt|画像プロンプト|image prompt/.test(normalised)) {
    return 'visualPrompt'
  }
  if (/thread|threads|スレッド|投稿/.test(normalised)) return 'thread-posts'
  if (/note|notes|メモ|補足/.test(normalised)) return 'notes'
  if (/review|checklist|チェック/.test(normalised)) return 'review-checklist'
  return null
}

function detectSections(markdown: string, structuredJson: unknown | null): DetectedSection[] {
  const found: DetectedSection[] = []
  const headingRe = /^#{1,4}\s+(.+)$/gm
  let match: RegExpExecArray | null
  while ((match = headingRe.exec(markdown)) !== null) {
    const section = sectionFromHeading(match[1])
    if (section) found.push(section)
  }

  const lower = markdown.toLowerCase()
  if (/^---[\s\S]*?^---/m.test(markdown)) found.push('notes')
  if (/visual[-\s]?brief|ビジュアル|画像候補|visual direction/.test(lower)) {
    found.push('visual-brief')
  }
  if (/visual prompt|image prompt|画像プロンプト/.test(lower)) found.push('visualPrompt')
  if (/cta|call to action|行動喚起|フォロー|返信|購読/.test(lower)) found.push('cta')
  if (/threads?|スレッド|^\s*\d+[.)、]/im.test(markdown)) found.push('thread-posts')
  if (/review checklist|チェックリスト|確認/.test(lower)) found.push('review-checklist')

  if (structuredJson && typeof structuredJson === 'object') {
    const keys = Object.keys(structuredJson as Record<string, unknown>).join(' ').toLowerCase()
    if (/title/.test(keys)) found.push('title-candidates')
    if (/lead/.test(keys)) found.push('lead')
    if (/body|draft|content|posts/.test(keys)) found.push('body')
    if (/cta/.test(keys)) found.push('cta')
    if (/visual/.test(keys)) found.push('visual-brief')
    if (/review|checklist/.test(keys)) found.push('review-checklist')
  }

  if (found.length === 0 && markdown.trim()) found.push('body')
  return stableUnique(found)
}

export function parseGeneratedOutput(input: string): ParseGeneratedOutputResult {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return fail('empty', 'generated output is required')
  }
  if (input.includes('\x00')) {
    return fail('null-byte', 'generated output contains a null byte')
  }
  const inputBytes = Buffer.byteLength(input, 'utf8')
  if (inputBytes > MAX_GENERATION_JOB_FILE_BYTES) {
    return fail(
      'too-large',
      `generated output exceeds ${MAX_GENERATION_JOB_FILE_BYTES} bytes (got ${inputBytes})`,
    )
  }

  const warnings: string[] = []
  let structuredJson: unknown | null = null
  let markdownText = input.trim()
  let detectedOutputKind: DetectedOutputKind = 'markdown'

  try {
    structuredJson = JSON.parse(markdownText)
    markdownText = markdownFromJson(structuredJson)
    detectedOutputKind = 'json'
  } catch {
    const front = parseFrontmatter(markdownText)
    const frontmatter = front.frontmatter
    markdownText = front.markdownWithoutFrontmatter.trim()
    if (front.warning) warnings.push(front.warning)

    const fenced = firstFencedJson(markdownText)
    if (fenced.warning) warnings.push(fenced.warning)
    structuredJson = fenced.json

    const parsed: ParsedGeneratedOutput = {
      markdownText,
      structuredJson,
      frontmatter,
      detectedSections: detectSections(markdownText, structuredJson),
      detectedOutputKind: frontmatter
        ? 'markdown-with-frontmatter'
        : structuredJson
          ? 'markdown-with-json-block'
          : 'markdown',
      warnings,
      previewExcerpt: excerpt(markdownText),
      metrics: {
        inputBytes,
        markdownBytes: Buffer.byteLength(markdownText, 'utf8'),
        structuredJsonBytes: structuredJson
          ? Buffer.byteLength(JSON.stringify(structuredJson), 'utf8')
          : 0,
      },
    }
    return {ok: true, parsed}
  }

  const parsed: ParsedGeneratedOutput = {
    markdownText,
    structuredJson,
    frontmatter: null,
    detectedSections: detectSections(markdownText, structuredJson),
    detectedOutputKind,
    warnings,
    previewExcerpt: excerpt(markdownText),
    metrics: {
      inputBytes,
      markdownBytes: Buffer.byteLength(markdownText, 'utf8'),
      structuredJsonBytes: structuredJson ? Buffer.byteLength(JSON.stringify(structuredJson), 'utf8') : 0,
    },
  }
  return {ok: true, parsed}
}

export function buildDraftJsonPayload(args: {
  contentIdeaSlug: string
  platform: string
  timestamp: string
  draftMdPath: string
  draftJsonPath: string
  parsed: ParsedGeneratedOutput
  savedAtIso: string
  jobMetadata: unknown
}): string | null {
  if (!args.parsed.structuredJson && !args.parsed.frontmatter) return null
  return `${JSON.stringify(
    {
      jobType: 'generated-output-draft',
      savedAt: args.savedAtIso,
      sourceJob: {
        contentIdeaSlug: args.contentIdeaSlug,
        platform: args.platform,
        timestamp: args.timestamp,
      },
      paths: {
        draftMd: args.draftMdPath,
        draftJson: args.draftJsonPath,
      },
      detectedOutputKind: args.parsed.detectedOutputKind,
      detectedSections: args.parsed.detectedSections,
      frontmatter: args.parsed.frontmatter,
      structuredJson: args.parsed.structuredJson,
      previewExcerpt: args.parsed.previewExcerpt,
      warnings: args.parsed.warnings,
      jobMetadata: args.jobMetadata,
    },
    null,
    2,
  )}\n`
}
