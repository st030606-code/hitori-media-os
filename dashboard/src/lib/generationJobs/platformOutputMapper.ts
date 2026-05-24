// Phase 2C-4 — map a saved generation job draft to the existing
// platformOutput schema. This module does not read/write Sanity and does not
// infer platform from generated text sections; job metadata remains the source
// of truth.

import type {GenerationPlatform} from './paths'

export const PLATFORM_OUTPUT_PLATFORM_VALUES = [
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

export const PLATFORM_OUTPUT_TYPE_VALUES = [
  'note-article',
  'substack-post',
  'threads-thread',
  'x-post',
  'youtube-script',
  'shorts-script',
  'podcast-script',
  'diagram-plan',
  'github-doc',
  'paid-article-outline',
  'instagram-carousel',
  'newsletter',
] as const

export const PLATFORM_OUTPUT_STATUS_VALUES = [
  'drafted',
  'reviewed',
  'revised',
  'ready',
  'archived',
] as const

export type PlatformOutputPlatform = (typeof PLATFORM_OUTPUT_PLATFORM_VALUES)[number]
export type PlatformOutputType = (typeof PLATFORM_OUTPUT_TYPE_VALUES)[number]
export type PlatformOutputStatus = (typeof PLATFORM_OUTPUT_STATUS_VALUES)[number]

export interface PlatformOutputSchemaChecklistItem {
  field: string
  label: string
  state: 'ready' | 'missing' | 'needs-manual-edit'
  note?: string
}

export interface PlatformOutputContentIdeaDoc {
  _id: string
  title?: string
  slug?: {current?: string}
  status?: string
  summary?: string
  coreThesis?: string
}

export interface PlatformOutputPromptRef {
  _id: string
  title?: string
  strategy: 'job-metadata' | 'sanity-platform-match' | 'sanity-fallback'
}

export interface PlatformOutputDraft {
  sourceContentIdea: {_type: 'reference'; _ref: string}
  platform: PlatformOutputPlatform
  outputType: PlatformOutputType
  title?: string
  draftBody: string
  localOutputPath?: string
  status: 'drafted'
  reviewNotes?: string
  generatedFromPrompt?: {_type: 'reference'; _ref: string}
  outputLength?: string
  targetFormat?: string
  primaryCTA?: string
  contentStatus?: 'draft'
}

export interface PlatformOutputDraftSummary {
  title: string
  sourceContentIdeaId: string
  platform: PlatformOutputPlatform
  outputType: PlatformOutputType
  status: 'drafted'
  contentStatus: 'draft'
  draftBodyLength: number
  draftBodyBytes: number
  localOutputPath: string
  generatedFromPromptId: string | null
  generatedFromPromptTitle: string | null
  outputLength: string | null
  targetFormat: string | null
  primaryCTA: string | null
}

export interface PlatformOutputSourceMetadata {
  contentIdeaSlug: string
  timestamp: string
  promptPath: string
  jobJsonPath: string
  draftMdPath: string
  draftJsonPath?: string
  promptReferenceStrategy?: PlatformOutputPromptRef['strategy']
}

export interface MappedPlatformOutput {
  platformOutputDraft: PlatformOutputDraft
  summary: PlatformOutputDraftSummary
  schemaChecklist: PlatformOutputSchemaChecklistItem[]
  missingRequiredFields: string[]
  warnings: string[]
  sourceMetadata: PlatformOutputSourceMetadata
}

interface MapPlatformOutputInput {
  jobMetadata: unknown
  draftMarkdown: string
  draftJson: unknown | null
  contentIdea: PlatformOutputContentIdeaDoc
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  promptPath: string
  jobJsonPath: string
  draftMdPath: string
  draftJsonPath?: string
  promptRef?: PlatformOutputPromptRef | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringAt(value: unknown, path: string[]): string | null {
  let current: unknown = value
  for (const segment of path) {
    if (!isRecord(current)) return null
    current = current[segment]
  }
  return typeof current === 'string' && current.trim() ? current.trim() : null
}

function isPlatform(value: string): value is PlatformOutputPlatform {
  return (PLATFORM_OUTPUT_PLATFORM_VALUES as readonly string[]).includes(value)
}

function isOutputType(value: string): value is PlatformOutputType {
  return (PLATFORM_OUTPUT_TYPE_VALUES as readonly string[]).includes(value)
}

function outputTypeForPlatform(platform: PlatformOutputPlatform): PlatformOutputType {
  switch (platform) {
    case 'note':
      return 'note-article'
    case 'substack':
      return 'substack-post'
    case 'threads':
      return 'threads-thread'
    case 'x':
      return 'x-post'
    case 'youtube':
      return 'youtube-script'
    case 'shorts':
      return 'shorts-script'
    case 'podcast':
      return 'podcast-script'
    case 'diagram':
      return 'diagram-plan'
    case 'github':
      return 'github-doc'
    case 'paid':
      return 'paid-article-outline'
    case 'instagram':
      return 'instagram-carousel'
    case 'newsletter':
      return 'newsletter'
  }
}

function normaliseOutputType(raw: string | null, platform: PlatformOutputPlatform): {
  outputType: PlatformOutputType
  warning?: string
} {
  if (raw && isOutputType(raw)) return {outputType: raw}

  const byPlatform = outputTypeForPlatform(platform)
  if (!raw) {
    return {
      outputType: byPlatform,
      warning: `job.json outputType was missing; mapped from platform "${platform}" to "${byPlatform}".`,
    }
  }

  const fromGeneric: Record<string, Partial<Record<PlatformOutputPlatform, PlatformOutputType>>> = {
    article: {
      note: 'note-article',
      substack: 'substack-post',
      paid: 'paid-article-outline',
    },
    post: {
      x: 'x-post',
      substack: 'substack-post',
      instagram: 'instagram-carousel',
    },
    thread: {
      threads: 'threads-thread',
      x: 'x-post',
    },
    newsletter: {
      newsletter: 'newsletter',
      substack: 'substack-post',
    },
    script: {
      youtube: 'youtube-script',
      podcast: 'podcast-script',
    },
    'short-script': {
      shorts: 'shorts-script',
    },
    'visual-brief': {
      diagram: 'diagram-plan',
      instagram: 'instagram-carousel',
    },
    custom: {},
  }

  const mapped = fromGeneric[raw]?.[platform] ?? byPlatform
  return {
    outputType: mapped,
    warning: `job.json outputType "${raw}" was mapped to schema value "${mapped}" for platform "${platform}".`,
  }
}

function titleFromDraft(markdown: string): string | null {
  const lines = markdown.split(/\r?\n/)
  for (const rawLine of lines.slice(0, 40)) {
    const line = rawLine.trim()
    if (!line) continue
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading?.[1]) return heading[1].trim().slice(0, 120)
    if (!line.startsWith('```') && line.length <= 120) return line.replace(/^[-*]\s+/, '').trim()
  }
  return null
}

function titleFromDraftJson(draftJson: unknown): string | null {
  const direct = stringAt(draftJson, ['title'])
  if (direct) return direct.slice(0, 120)
  const candidate = stringAt(draftJson, ['titleCandidates', '0'])
  if (candidate) return candidate.slice(0, 120)
  return null
}

function compact(value: string | null | undefined, max = 180): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}...` : trimmed
}

function buildReviewNotes(input: MapPlatformOutputInput, outputType: PlatformOutputType): string {
  const lines = [
    'Phase 2C-4 local generation job import.',
    `contentIdeaSlug: ${input.contentIdeaSlug}`,
    `platform: ${input.platform}`,
    `outputType: ${outputType}`,
    `timestamp: ${input.timestamp}`,
    `prompt.md: ${input.promptPath}`,
    `job.json: ${input.jobJsonPath}`,
    `draft.md: ${input.draftMdPath}`,
  ]
  if (input.draftJsonPath) lines.push(`draft.json: ${input.draftJsonPath}`)
  lines.push('No campaignPlan / publishedOutput was created; status remains drafted.')
  return lines.join('\n')
}

function checklistItem(
  field: string,
  ready: boolean,
  note?: string,
): PlatformOutputSchemaChecklistItem {
  return {
    field,
    label: field,
    state: ready ? 'ready' : 'missing',
    note,
  }
}

export function mapGenerationJobToPlatformOutput(
  input: MapPlatformOutputInput,
): MappedPlatformOutput {
  const warnings: string[] = []
  const metadataPlatform = stringAt(input.jobMetadata, ['configuration', 'platform'])
  const platform = isPlatform(metadataPlatform ?? '')
    ? (metadataPlatform as PlatformOutputPlatform)
    : input.platform

  if (!metadataPlatform) {
    warnings.push('job.json configuration.platform was missing; using generation job path platform.')
  } else if (metadataPlatform !== input.platform) {
    warnings.push(
      `job.json platform "${metadataPlatform}" differs from path platform "${input.platform}"; job.json value is used for the draft.`,
    )
  }

  const rawOutputType = stringAt(input.jobMetadata, ['configuration', 'outputType'])
  const outputTypeResult = normaliseOutputType(rawOutputType, platform)
  if (outputTypeResult.warning) warnings.push(outputTypeResult.warning)

  if (input.draftJson) {
    warnings.push('draft.json was detected and treated as supplemental metadata only.')
  }

  if (!input.promptRef) {
    warnings.push('platformOutput.generatedFromPrompt is required, but no existing Sanity prompt reference was resolved.')
  } else if (input.promptRef.strategy !== 'job-metadata') {
    warnings.push(
      `generatedFromPrompt was resolved via ${input.promptRef.strategy}; verify the prompt reference in Studio after create.`,
    )
  }

  const outputType = outputTypeResult.outputType
  const title =
    titleFromDraftJson(input.draftJson) ??
    titleFromDraft(input.draftMarkdown) ??
    `${input.contentIdea.title ?? input.contentIdeaSlug} / ${platform}`
  const outputLength = compact(stringAt(input.jobMetadata, ['configuration', 'outputLength']), 80)
  const targetFormat = compact(rawOutputType ? `${platform}:${rawOutputType}` : platform, 120)
  const primaryCTA = compact(stringAt(input.jobMetadata, ['configuration', 'cta']), 180)
  const reviewNotes = buildReviewNotes(input, outputType)

  const platformOutputDraft: PlatformOutputDraft = {
    sourceContentIdea: {_type: 'reference', _ref: input.contentIdea._id},
    platform,
    outputType,
    title,
    draftBody: input.draftMarkdown,
    localOutputPath: input.draftMdPath,
    status: 'drafted',
    reviewNotes,
    outputLength,
    targetFormat,
    primaryCTA,
    contentStatus: 'draft',
  }
  if (input.promptRef?._id) {
    platformOutputDraft.generatedFromPrompt = {_type: 'reference', _ref: input.promptRef._id}
  }

  const schemaChecklist: PlatformOutputSchemaChecklistItem[] = [
    checklistItem('sourceContentIdea', Boolean(platformOutputDraft.sourceContentIdea._ref)),
    checklistItem('platform', isPlatform(platformOutputDraft.platform)),
    checklistItem('outputType', isOutputType(platformOutputDraft.outputType)),
    checklistItem('draftBody', input.draftMarkdown.trim().length > 0),
    checklistItem('status', platformOutputDraft.status === 'drafted'),
    checklistItem('generatedFromPrompt', Boolean(platformOutputDraft.generatedFromPrompt?._ref)),
  ]
  const missingRequiredFields = schemaChecklist
    .filter((item) => item.state !== 'ready')
    .map((item) => item.field)

  return {
    platformOutputDraft,
    summary: {
      title,
      sourceContentIdeaId: input.contentIdea._id,
      platform,
      outputType,
      status: 'drafted',
      contentStatus: 'draft',
      draftBodyLength: input.draftMarkdown.length,
      draftBodyBytes: Buffer.byteLength(input.draftMarkdown, 'utf8'),
      localOutputPath: input.draftMdPath,
      generatedFromPromptId: input.promptRef?._id ?? null,
      generatedFromPromptTitle: input.promptRef?.title ?? null,
      outputLength: outputLength ?? null,
      targetFormat: targetFormat ?? null,
      primaryCTA: primaryCTA ?? null,
    },
    schemaChecklist,
    missingRequiredFields,
    warnings,
    sourceMetadata: {
      contentIdeaSlug: input.contentIdeaSlug,
      timestamp: input.timestamp,
      promptPath: input.promptPath,
      jobJsonPath: input.jobJsonPath,
      draftMdPath: input.draftMdPath,
      draftJsonPath: input.draftJsonPath,
      promptReferenceStrategy: input.promptRef?.strategy,
    },
  }
}
