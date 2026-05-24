// Phase 2C-6 — map extracted visual briefs to the existing visualAssetPlan
// schema. Pure mapper: no IO, no Sanity writes, no image generation.

import type {GenerationPlatform} from './paths'
import type {StructuredVisualBrief} from './visualBriefExtractor'

export const VISUAL_ASSET_PLAN_PLATFORM_VALUES = [
  'note',
  'substack',
  'x',
  'threads',
  'instagram',
  'youtube',
  'shorts',
  'podcast',
  'github',
  'paid',
  'newsletter',
] as const

export const VISUAL_ASSET_TYPE_VALUES = [
  'hero',
  'eye-catch',
  'section-diagram',
  'comparison-diagram',
  'flow-diagram',
  'architecture-diagram',
  'schema-diagram',
  'pipeline-diagram',
  'carousel-cover',
  'carousel-slide',
  'hook-image',
  'thumbnail',
  'paired-post-visual',
  'summary-diagram',
  'cta-visual',
] as const

export const VISUAL_ASPECT_RATIO_VALUES = ['16:9', '1:1', '4:5', '9:16'] as const

export type VisualAssetPlanPlatform = (typeof VISUAL_ASSET_PLAN_PLATFORM_VALUES)[number]
export type VisualAssetType = (typeof VISUAL_ASSET_TYPE_VALUES)[number]
export type VisualAspectRatio = (typeof VISUAL_ASPECT_RATIO_VALUES)[number]

export interface VisualAssetPlanContentIdeaDoc {
  _id: string
  title?: string
  slug?: {current?: string}
  summary?: string
}

export interface VisualAssetPlanPlatformOutputDoc {
  _id: string
  title?: string
  platform?: string
  localOutputPath?: string
}

export interface VisualAssetPlanDraft {
  sourceContentIdea: {_type: 'reference'; _ref: string}
  pairedPlatformOutput?: {_type: 'reference'; _ref: string}
  title: string
  purpose: string
  targetPlatform: VisualAssetPlanPlatform
  placement: string
  assetType: VisualAssetType
  aspectRatio: VisualAspectRatio
  reusePolicy: 'platform-specific'
  status: 'planned'
  imagePrompt: string
  textToInclude?: string[]
  textToAvoid?: string[]
  visualDirection?: string
  reviewNotes?: string
  expectedLocalAssetPath?: string
  taskFilePath?: string
  generationMode: 'manual'
  generationProvider: 'chatgpt-manual'
  sourcePromptVersion?: string
  apiEnabled: false
  automationNotes?: string
  createdAt: string
  updatedAt: string
}

export interface VisualAssetPlanChecklistItem {
  field: string
  state: 'ready' | 'missing' | 'needs-manual-edit'
  note?: string
}

export interface VisualAssetPlanSummary {
  title: string
  sourceContentIdeaId: string
  pairedPlatformOutputId: string | null
  targetPlatform: VisualAssetPlanPlatform
  placement: string
  assetType: VisualAssetType
  aspectRatio: VisualAspectRatio
  status: 'planned'
  imagePromptLength: number
  imagePromptPreview: string
}

export interface MappedVisualAssetPlan {
  visualAssetPlanDraft: VisualAssetPlanDraft
  summary: VisualAssetPlanSummary
  schemaChecklist: VisualAssetPlanChecklistItem[]
  missingRequiredFields: string[]
  warnings: string[]
}

function includes<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return (values as readonly string[]).includes(value)
}

function isVisualAssetPlanPlatform(value: string): value is VisualAssetPlanPlatform {
  return includes(VISUAL_ASSET_PLAN_PLATFORM_VALUES, value)
}

export function defaultVisualPlacement(platform: GenerationPlatform): string {
  if (platform === 'youtube') return 'thumbnail-1'
  if (platform === 'threads' || platform === 'x' || platform === 'instagram') return 'main-visual-1'
  if (platform === 'note' || platform === 'substack' || platform === 'newsletter') return 'inline-visual-1'
  return 'visual-1'
}

export function defaultVisualAssetType(platform: GenerationPlatform, brief: string): VisualAssetType {
  if (platform === 'youtube') return 'thumbnail'
  if (platform === 'instagram') return 'carousel-cover'
  if (platform === 'threads' || platform === 'x') return 'hook-image'
  if (/比較|comparison/i.test(brief)) return 'comparison-diagram'
  if (/pipeline|パイプライン/i.test(brief)) return 'pipeline-diagram'
  if (/flow|フロー/i.test(brief)) return 'flow-diagram'
  if (/architecture|構造|アーキテクチャ/i.test(brief)) return 'architecture-diagram'
  return 'section-diagram'
}

export function defaultVisualAspectRatio(platform: GenerationPlatform, brief: string): VisualAspectRatio {
  const match = brief.match(/(?:16:9|1:1|4:5|9:16)/)
  if (match && includes(VISUAL_ASPECT_RATIO_VALUES, match[0])) return match[0]
  if (platform === 'shorts') return '9:16'
  if (platform === 'threads' || platform === 'x' || platform === 'instagram') return '1:1'
  return '16:9'
}

function compact(text: string, max = 600): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 3).trimEnd()}...`
}

function checklist(field: string, ready: boolean, note?: string): VisualAssetPlanChecklistItem {
  return {field, state: ready ? 'ready' : 'missing', note}
}

export function mapVisualBriefToVisualAssetPlan(input: {
  contentIdea: VisualAssetPlanContentIdeaDoc
  platformOutput?: VisualAssetPlanPlatformOutputDoc | null
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  visualBriefMarkdown: string
  structuredVisualBrief: StructuredVisualBrief
  visualBriefMdPath: string
  visualBriefJsonPath?: string | null
  draftMdPath: string
  placement?: string
  assetType?: string
  aspectRatio?: string
  nowIso?: string
}): MappedVisualAssetPlan {
  const warnings: string[] = []
  const platformSupported = isVisualAssetPlanPlatform(input.platform)
  if (!platformSupported) {
    warnings.push(`platform "${input.platform}" is not valid for visualAssetPlan.targetPlatform.`)
  }
  const targetPlatform: VisualAssetPlanPlatform = isVisualAssetPlanPlatform(input.platform)
    ? input.platform
    : 'note'
  const placement = input.placement?.trim() || defaultVisualPlacement(input.platform)
  const assetType = input.assetType && includes(VISUAL_ASSET_TYPE_VALUES, input.assetType)
    ? input.assetType
    : defaultVisualAssetType(input.platform, input.visualBriefMarkdown)
  const aspectRatio = input.aspectRatio && includes(VISUAL_ASPECT_RATIO_VALUES, input.aspectRatio)
    ? input.aspectRatio
    : defaultVisualAspectRatio(input.platform, input.visualBriefMarkdown)
  const imagePrompt =
    input.structuredVisualBrief.imagePrompt?.trim() || compact(input.visualBriefMarkdown, 1800)
  const title =
    input.structuredVisualBrief.title?.trim() ||
    `${input.contentIdea.title ?? input.contentIdeaSlug} / ${placement}`
  const nowIso = input.nowIso ?? new Date().toISOString()
  const expectedLocalAssetPath = `assets/visuals/${input.contentIdeaSlug}/${targetPlatform}/${placement}.png`
  const reviewNotes = [
    'Phase 2C-6 visual brief extraction.',
    `contentIdeaSlug: ${input.contentIdeaSlug}`,
    `platform: ${input.platform}`,
    `timestamp: ${input.timestamp}`,
    `draft.md: ${input.draftMdPath}`,
    `visual-brief.md: ${input.visualBriefMdPath}`,
    input.visualBriefJsonPath ? `visual-brief.json: ${input.visualBriefJsonPath}` : null,
    'No image files were created. localAssetPath intentionally remains empty.',
  ]
    .filter(Boolean)
    .join('\n')

  const draft: VisualAssetPlanDraft = {
    sourceContentIdea: {_type: 'reference', _ref: input.contentIdea._id},
    title,
    purpose:
      input.structuredVisualBrief.visualDirection ??
      `Manual visual planning for ${targetPlatform} output generated from ${input.contentIdeaSlug}.`,
    targetPlatform,
    placement,
    assetType,
    aspectRatio,
    reusePolicy: 'platform-specific',
    status: 'planned',
    imagePrompt,
    textToInclude: input.structuredVisualBrief.textToInclude,
    textToAvoid: input.structuredVisualBrief.textToAvoid,
    visualDirection: input.structuredVisualBrief.visualDirection ?? input.visualBriefMarkdown,
    reviewNotes,
    expectedLocalAssetPath,
    taskFilePath: input.visualBriefMdPath,
    generationMode: 'manual',
    generationProvider: 'chatgpt-manual',
    sourcePromptVersion: 'phase-2c-6-v1',
    apiEnabled: false,
    automationNotes:
      'Created from a pasted/generated visual brief. Image generation and Visual Register are later manual steps.',
    createdAt: nowIso,
    updatedAt: nowIso,
  }
  if (input.platformOutput?._id) {
    draft.pairedPlatformOutput = {_type: 'reference', _ref: input.platformOutput._id}
  }

  const schemaChecklist = [
    checklist('sourceContentIdea', Boolean(draft.sourceContentIdea._ref)),
    checklist('title', Boolean(draft.title.trim())),
    checklist('purpose', Boolean(draft.purpose.trim())),
    checklist(
      'targetPlatform',
      platformSupported && includes(VISUAL_ASSET_PLAN_PLATFORM_VALUES, draft.targetPlatform),
      platformSupported ? undefined : `platform "${input.platform}" is not supported by visualAssetPlan schema`,
    ),
    checklist('placement', Boolean(draft.placement.trim())),
    checklist('assetType', includes(VISUAL_ASSET_TYPE_VALUES, draft.assetType)),
    checklist('aspectRatio', includes(VISUAL_ASPECT_RATIO_VALUES, draft.aspectRatio)),
    checklist('reusePolicy', draft.reusePolicy === 'platform-specific'),
    checklist('status', draft.status === 'planned'),
    checklist('imagePrompt', Boolean(draft.imagePrompt.trim())),
    checklist('generationMode', draft.generationMode === 'manual'),
    checklist('generationProvider', draft.generationProvider === 'chatgpt-manual'),
    checklist('apiEnabled', draft.apiEnabled === false),
    checklist('createdAt', Boolean(draft.createdAt)),
    checklist('updatedAt', Boolean(draft.updatedAt)),
  ]
  const missingRequiredFields = schemaChecklist
    .filter((item) => item.state !== 'ready')
    .map((item) => item.field)

  return {
    visualAssetPlanDraft: draft,
    summary: {
      title: draft.title,
      sourceContentIdeaId: input.contentIdea._id,
      pairedPlatformOutputId: input.platformOutput?._id ?? null,
      targetPlatform,
      placement,
      assetType,
      aspectRatio,
      status: 'planned',
      imagePromptLength: imagePrompt.length,
      imagePromptPreview: compact(imagePrompt, 360),
    },
    schemaChecklist,
    missingRequiredFields,
    warnings,
  }
}
