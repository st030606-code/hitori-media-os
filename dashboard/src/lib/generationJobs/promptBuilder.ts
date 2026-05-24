// Phase 2C-2 — pure prompt/job builder for no-API generation packages.
//
// This module never reads/writes files, never calls Sanity, and never calls an
// external LLM. It only renders text that boss can copy into ChatGPT / Claude
// Code / Codex manually.

import type {GenerationJobPaths, GenerationPlatform} from './paths'

export const GENERATION_PROMPT_VERSION = 'phase-2c-2-v1'
export const GENERATION_PROMPT_BOUNDARY = 'no-api, manual-agent, no-shell-exec'

export const GENERATION_OUTPUT_TYPE_VALUES = [
  'post',
  'thread',
  'article',
  'newsletter',
  'script',
  'short-script',
  'visual-brief',
  'custom',
  // Legacy configurator values accepted for route compatibility.
  'short-post',
  'long-article',
  'video-script',
  'shorts-script',
  'podcast-script',
  'diagram-prompt',
] as const

export type GenerationOutputType = (typeof GENERATION_OUTPUT_TYPE_VALUES)[number]

export const GENERATION_OUTPUT_LENGTH_VALUES = [
  'short',
  'medium',
  'long',
  // Legacy configurator values accepted for route compatibility.
  'standard',
  'deep-dive',
] as const

export type GenerationOutputLength = (typeof GENERATION_OUTPUT_LENGTH_VALUES)[number]

export const GENERATION_VISUAL_PREFERENCE_VALUES = [
  'no-visual',
  'visual-direction-only',
  'visual-later',
] as const

export type GenerationVisualPreference = (typeof GENERATION_VISUAL_PREFERENCE_VALUES)[number]

export interface GenerationContentIdeaDoc {
  _id: string
  _updatedAt?: string
  title?: string
  slug?: {current?: string}
  status?: string
  summary?: string
  rawInput?: string
  coreThesis?: string
  audience?: unknown
  audiencePain?: unknown
  contentPillars?: unknown
  claims?: unknown
  evidence?: unknown
  examples?: unknown
  objections?: unknown
  tone?: {
    voice?: string
    styleNotes?: unknown
    avoid?: unknown
  }
  sourceLinks?: unknown
  platformAngles?: unknown
  outputChecklist?: unknown
  personalContext?: string
}

export interface GenerationPromptInput {
  contentIdea: GenerationContentIdeaDoc
  paths: GenerationJobPaths
  platform: GenerationPlatform
  outputType: GenerationOutputType
  purpose: string
  tone: string
  cta: string
  outputLength: GenerationOutputLength
  visualPreference: GenerationVisualPreference
  additionalInstructions?: string
  createdAtIso: string
}

export interface RenderedGenerationPackage {
  promptMd: string
  jobJson: string
  suggestedCommands: {
    codex: string
    claude: string
    pbcopy: string
  }
  summary: {
    title: string
    slug: string
    status: string
    claimsCount: number
    platformAnglesCount: number
    audienceCount: number
  }
  warnings: string[]
}

const PLATFORM_LABELS: Record<string, string> = {
  x: 'X',
  threads: 'Threads',
  note: 'note',
  substack: 'Substack',
  youtube: 'YouTube',
  shorts: 'Shorts',
  podcast: 'Podcast',
  instagram: 'Instagram',
  newsletter: 'Newsletter',
  github: 'GitHub',
  diagram: 'Diagram',
}

const OUTPUT_TYPE_LABELS: Record<string, string> = {
  post: 'post',
  thread: 'thread',
  article: 'article',
  newsletter: 'newsletter',
  script: 'script',
  'short-script': 'short-script',
  'visual-brief': 'visual-brief',
  custom: 'custom',
  'short-post': 'post',
  'long-article': 'article',
  'video-script': 'script',
  'shorts-script': 'short-script',
  'podcast-script': 'script',
  'diagram-prompt': 'visual-brief',
}

const LENGTH_LABELS: Record<string, string> = {
  short: 'short',
  medium: 'medium',
  standard: 'medium',
  long: 'long',
  'deep-dive': 'long',
}

const VISUAL_LABELS: Record<GenerationVisualPreference, string> = {
  'no-visual': 'No visual output in this batch',
  'visual-direction-only': 'Include visual direction notes only',
  'visual-later': 'Mention visual opportunities for a later batch',
}

function labelOf(map: Record<string, string>, value: string): string {
  return map[value] ?? value
}

function truncate(value: string, max = 2000): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 20)}\n[...truncated...]`
}

export function normalizeGenerationTextList(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? [trimmed] : []
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeGenerationTextList(item)).filter(Boolean)
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (Array.isArray(obj.children)) {
      const parts: string[] = []
      for (const child of obj.children) {
        if (child && typeof child === 'object') {
          const t = (child as {text?: unknown}).text
          if (typeof t === 'string' && t.trim()) parts.push(t.trim())
        }
      }
      if (parts.length > 0) return [parts.join('')]
    }
    const composite = describeObject(obj)
    return composite ? [composite] : []
  }
  return []
}

function valueToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return normalizeGenerationTextList(value).join(' / ')
}

function describeObject(obj: Record<string, unknown>): string {
  const orderedKeys = [
    'platform',
    'targetReader',
    'hook',
    'formatNotes',
    'callToAction',
    'claim',
    'supportingEvidence',
    'confidence',
    'needsVerification',
    'type',
    'description',
    'sourceUrl',
    'notes',
    'title',
    'objection',
    'response',
    'outputType',
    'status',
    'localOutputPath',
    'publishedUrl',
    'reference',
  ]
  const parts: string[] = []
  for (const key of orderedKeys) {
    const raw = obj[key]
    if (raw == null || raw === '') continue
    const text = valueToString(raw)
    if (text) parts.push(`${key}: ${text}`)
  }
  return parts.join(' | ')
}

function bulletList(value: unknown, fallback = '(未設定)'): string {
  const list = normalizeGenerationTextList(value)
  if (list.length === 0) return `- ${fallback}`
  return list.map((item) => `- ${truncate(item, 700)}`).join('\n')
}

function yamlScalar(value: string): string {
  return JSON.stringify(value)
}

function firstText(value: unknown, fallback = ''): string {
  return normalizeGenerationTextList(value)[0] ?? fallback
}

function buildWarnings(input: GenerationPromptInput): string[] {
  const warnings: string[] = []
  if (!input.contentIdea.summary) warnings.push('contentIdea.summary is empty')
  if (!input.contentIdea.coreThesis) warnings.push('contentIdea.coreThesis is empty')
  if (normalizeGenerationTextList(input.contentIdea.claims).length === 0) {
    warnings.push('contentIdea.claims is empty')
  }
  if (normalizeGenerationTextList(input.contentIdea.platformAngles).length === 0) {
    warnings.push('contentIdea.platformAngles is empty')
  }
  if (!input.contentIdea.tone?.voice) warnings.push('contentIdea.tone.voice is empty')
  return warnings
}

function renderPromptMd(input: GenerationPromptInput, warnings: string[]): string {
  const {contentIdea, paths} = input
  const slug = contentIdea.slug?.current ?? paths.contentIdeaSlug
  const title = contentIdea.title ?? '(Untitled contentIdea)'
  const platformLabel = labelOf(PLATFORM_LABELS, input.platform)
  const outputTypeLabel = labelOf(OUTPUT_TYPE_LABELS, input.outputType)
  const lengthLabel = labelOf(LENGTH_LABELS, input.outputLength)

  const lines: string[] = []
  lines.push('# Hitori Media OS — Generation Prompt Package')
  lines.push('')
  lines.push('```yaml')
  lines.push(`promptVersion: ${GENERATION_PROMPT_VERSION}`)
  lines.push(`boundary: ${GENERATION_PROMPT_BOUNDARY}`)
  lines.push(`createdAt: ${input.createdAtIso}`)
  lines.push(`sourceContentIdeaId: ${yamlScalar(contentIdea._id)}`)
  lines.push(`sourceContentIdeaSlug: ${yamlScalar(slug)}`)
  lines.push(`platform: ${input.platform}`)
  lines.push(`outputType: ${outputTypeLabel}`)
  lines.push(`expectedOutputPath: ${yamlScalar(paths.expectedDraftMdRelative)}`)
  lines.push(`expectedOutputJsonPath: ${yamlScalar(paths.expectedDraftJsonRelative)}`)
  lines.push('```')
  lines.push('')
  lines.push('## Role')
  lines.push('')
  lines.push('You are the generation partner for Hitori Media OS.')
  lines.push('Write only the selected platform/output below. Do not create drafts for every platform.')
  lines.push('Default to Japanese unless the source contentIdea clearly requires another language.')
  lines.push('Do not call external tools or browse. Work from the structured record below.')
  lines.push('')
  lines.push('## Source Content Idea')
  lines.push('')
  lines.push(`- title: ${title}`)
  lines.push(`- slug: \`${slug}\``)
  lines.push(`- status: ${contentIdea.status ?? '(unknown)'}`)
  if (contentIdea.summary) lines.push(`- summary: ${truncate(contentIdea.summary)}`)
  if (contentIdea.coreThesis) lines.push(`- coreThesis: ${truncate(contentIdea.coreThesis)}`)
  if (contentIdea.rawInput) lines.push(`- rawInput: ${truncate(contentIdea.rawInput, 1200)}`)
  lines.push('')
  lines.push('### Audience')
  lines.push(bulletList(contentIdea.audience))
  lines.push('')
  lines.push('### Audience Pain')
  lines.push(bulletList(contentIdea.audiencePain))
  lines.push('')
  lines.push('### Content Pillars')
  lines.push(bulletList(contentIdea.contentPillars))
  lines.push('')
  lines.push('### Claims')
  lines.push(bulletList(contentIdea.claims))
  lines.push('')
  lines.push('### Evidence')
  lines.push(bulletList(contentIdea.evidence))
  lines.push('')
  lines.push('### Examples')
  lines.push(bulletList(contentIdea.examples))
  lines.push('')
  lines.push('### Objections')
  lines.push(bulletList(contentIdea.objections))
  lines.push('')
  lines.push('### Platform Angles')
  lines.push(bulletList(contentIdea.platformAngles))
  lines.push('')
  lines.push('### Tone / Voice')
  lines.push(`- voice: ${contentIdea.tone?.voice ?? '(未設定)'}`)
  lines.push('#### styleNotes')
  lines.push(bulletList(contentIdea.tone?.styleNotes))
  lines.push('#### avoid')
  lines.push(bulletList(contentIdea.tone?.avoid))
  lines.push('')
  lines.push('### Output Checklist')
  lines.push(bulletList(contentIdea.outputChecklist))
  if (contentIdea.personalContext) {
    lines.push('')
    lines.push('### Personal Context')
    lines.push(truncate(contentIdea.personalContext))
  }
  lines.push('')
  lines.push('## Selected Output Configuration')
  lines.push('')
  lines.push(`- selectedPlatform: ${platformLabel} (\`${input.platform}\`)`)
  lines.push(`- outputType: ${outputTypeLabel}`)
  lines.push(`- purpose: ${input.purpose || '(未設定)'}`)
  lines.push(`- toneOverride: ${input.tone || '(contentIdea tone を優先)'}`)
  lines.push(`- CTA: ${input.cta || '(none)'}`)
  lines.push(`- outputLength: ${lengthLabel}`)
  lines.push(`- visualPreference: ${VISUAL_LABELS[input.visualPreference]}`)
  if (input.additionalInstructions?.trim()) {
    lines.push('- additionalInstructions:')
    lines.push(truncate(input.additionalInstructions.trim(), 1200))
  }
  lines.push('')
  lines.push('## Expected Output Format')
  lines.push('')
  lines.push('Return Markdown suitable for later dashboard import.')
  lines.push('Start with this frontmatter block, then write the draft body:')
  lines.push('')
  lines.push('```yaml')
  lines.push(`sourceContentIdeaId: ${yamlScalar(contentIdea._id)}`)
  lines.push(`sourceContentIdeaSlug: ${yamlScalar(slug)}`)
  lines.push(`platform: ${input.platform}`)
  lines.push(`outputType: ${outputTypeLabel}`)
  lines.push(`expectedOutputPath: ${yamlScalar(paths.expectedDraftMdRelative)}`)
  lines.push('status: draft')
  lines.push('```')
  lines.push('')
  lines.push('Then include:')
  lines.push('1. Title candidates, if appropriate for the selected platform')
  lines.push('2. Final draft for the selected platform/output only')
  lines.push('3. CTA line or CTA note, if requested')
  lines.push('4. Review notes: assumptions, weak points, and human checks')
  if (input.visualPreference !== 'no-visual') {
    lines.push('5. Visual direction notes only. Do not generate an image in this batch.')
  }
  lines.push('')
  lines.push('## Review Checklist')
  lines.push('')
  lines.push('- The draft preserves the coreThesis.')
  lines.push('- The draft addresses the audiencePain directly.')
  lines.push('- Claims are not overstated beyond evidence in the contentIdea.')
  lines.push('- The platform format fits the selected platform only.')
  lines.push('- The CTA matches the selected CTA setting.')
  lines.push('- The output can be pasted into `draft.md` later without extra explanation.')
  if (warnings.length > 0) {
    lines.push('')
    lines.push('## Schema / Source Warnings')
    lines.push(warnings.map((warning) => `- ${warning}`).join('\n'))
  }
  return lines.join('\n')
}

function buildJobJson(input: GenerationPromptInput, warnings: string[]): string {
  const {contentIdea, paths} = input
  const slug = contentIdea.slug?.current ?? paths.contentIdeaSlug
  const job = {
    jobType: 'generation-prompt-package',
    promptVersion: GENERATION_PROMPT_VERSION,
    boundary: GENERATION_PROMPT_BOUNDARY,
    createdAt: input.createdAtIso,
    sourceContentIdea: {
      _id: contentIdea._id,
      title: contentIdea.title ?? null,
      slug,
      status: contentIdea.status ?? null,
      updatedAt: contentIdea._updatedAt ?? null,
    },
    configuration: {
      platform: input.platform,
      outputType: labelOf(OUTPUT_TYPE_LABELS, input.outputType),
      purpose: input.purpose,
      tone: input.tone,
      cta: input.cta,
      outputLength: labelOf(LENGTH_LABELS, input.outputLength),
      visualPreference: input.visualPreference,
      additionalInstructions: input.additionalInstructions?.trim() || null,
    },
    paths: {
      promptMd: paths.promptMdRelative,
      jobJson: paths.jobJsonRelative,
      expectedDraftMd: paths.expectedDraftMdRelative,
      expectedDraftJson: paths.expectedDraftJsonRelative,
    },
    sourceSnapshot: {
      summary: contentIdea.summary ?? null,
      coreThesis: contentIdea.coreThesis ?? null,
      audience: normalizeGenerationTextList(contentIdea.audience),
      audiencePain: normalizeGenerationTextList(contentIdea.audiencePain),
      claims: normalizeGenerationTextList(contentIdea.claims),
      objections: normalizeGenerationTextList(contentIdea.objections),
      examples: normalizeGenerationTextList(contentIdea.examples),
      platformAngles: normalizeGenerationTextList(contentIdea.platformAngles),
      toneVoice: contentIdea.tone?.voice ?? null,
      styleNotes: normalizeGenerationTextList(contentIdea.tone?.styleNotes),
      avoid: normalizeGenerationTextList(contentIdea.tone?.avoid),
      outputChecklist: normalizeGenerationTextList(contentIdea.outputChecklist),
      personalContext: contentIdea.personalContext ?? null,
    },
    warnings,
  }
  return `${JSON.stringify(job, null, 2)}\n`
}

function buildSuggestedCommands(paths: GenerationJobPaths): RenderedGenerationPackage['suggestedCommands'] {
  return {
    codex: `codex exec "$(cat ${paths.promptMdRelative})" > ${paths.expectedDraftMdRelative}`,
    claude: `claude -p "$(cat ${paths.promptMdRelative})" > ${paths.expectedDraftMdRelative}`,
    pbcopy: `pbcopy < ${paths.promptMdRelative}`,
  }
}

export function renderGenerationPromptPackage(
  input: GenerationPromptInput,
): RenderedGenerationPackage {
  const warnings = buildWarnings(input)
  const promptMd = renderPromptMd(input, warnings)
  const jobJson = buildJobJson(input, warnings)
  const slug = input.contentIdea.slug?.current ?? input.paths.contentIdeaSlug
  return {
    promptMd,
    jobJson,
    suggestedCommands: buildSuggestedCommands(input.paths),
    summary: {
      title: input.contentIdea.title ?? '(Untitled contentIdea)',
      slug,
      status: input.contentIdea.status ?? '(unknown)',
      claimsCount: normalizeGenerationTextList(input.contentIdea.claims).length,
      platformAnglesCount: normalizeGenerationTextList(input.contentIdea.platformAngles).length,
      audienceCount: normalizeGenerationTextList(input.contentIdea.audience).length,
    },
    warnings,
  }
}

export function generationContentIdeaSummary(contentIdea: GenerationContentIdeaDoc): string {
  const title = contentIdea.title ?? '(Untitled contentIdea)'
  const slug = contentIdea.slug?.current ?? '(no-slug)'
  const thesis = firstText(contentIdea.coreThesis, '(coreThesis missing)')
  return `${title} / ${slug}\n${thesis}`
}
