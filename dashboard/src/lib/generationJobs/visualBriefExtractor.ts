// Phase 2C-6 — visual brief extraction from saved generated drafts.
//
// Pure parser only: no filesystem, Sanity, image generation, or API calls.

import {MAX_GENERATION_JOB_FILE_BYTES, type GenerationPlatform} from './paths'

export type VisualBriefFieldKey =
  | 'visual-brief'
  | 'imagePrompt'
  | 'visualDirection'
  | 'textToInclude'
  | 'textToAvoid'
  | 'aspectRatio'
  | 'cta'
  | 'mainCopy'
  | 'subCopy'

export interface VisualBriefDetectedField {
  key: VisualBriefFieldKey
  label: string
}

export interface StructuredVisualBrief {
  title?: string
  imagePrompt?: string
  visualDirection?: string
  textToInclude: string[]
  textToAvoid: string[]
  aspectRatio?: string
  cta?: string
  mainCopy?: string
  subCopy?: string
}

export interface ExtractedVisualBrief {
  visualBriefFound: boolean
  visualBriefMarkdown: string
  structuredVisualBrief: StructuredVisualBrief
  detectedFields: VisualBriefDetectedField[]
  warnings: string[]
  previewExcerpt: string
  suggestedPlacement: string
  suggestedAssetType: string
  suggestedAspectRatio: string
  suggestedImagePrompt: string
}

const FIELD_PATTERNS: Array<{key: VisualBriefFieldKey; label: string; re: RegExp}> = [
  {key: 'visual-brief', label: 'visual brief', re: /(visual[-\s]?brief|図解|ビジュアル|画像案|図解構成|図解コンセプト)/i},
  {key: 'imagePrompt', label: 'image prompt', re: /(image prompt|画像生成プロンプト|生成プロンプト)/i},
  {key: 'visualDirection', label: 'visual direction', re: /(visual direction|design direction|ビジュアル方向性|デザイン方向性)/i},
  {key: 'textToInclude', label: 'text to include', re: /(text to include|入れる文字|入れたい文字|main copy|メインコピー)/i},
  {key: 'textToAvoid', label: 'text to avoid', re: /(text to avoid|避けたい表現|避ける文字)/i},
  {key: 'aspectRatio', label: 'aspect ratio', re: /(aspect ratio|画角|アスペクト比|16:9|1:1|4:5|9:16)/i},
  {key: 'cta', label: 'CTA', re: /\bcta\b|行動喚起/i},
  {key: 'mainCopy', label: 'main copy', re: /(main copy|メインコピー|図解タイトル案)/i},
  {key: 'subCopy', label: 'sub copy', re: /(sub copy|サブコピー)/i},
]

function excerpt(text: string, max = 700): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 20).trimEnd()}\n...`
}

function stripFence(text: string): string {
  return text.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/\s*```$/, '').trim()
}

function collectVisualBlock(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => FIELD_PATTERNS.some((pattern) => pattern.re.test(line)))
  if (start < 0) return ''

  const end = lines.findIndex((line, index) => {
    if (index <= start + 1) return false
    return /^#{1,3}\s+/.test(line) && !FIELD_PATTERNS.some((pattern) => pattern.re.test(line))
  })
  return lines.slice(start, end < 0 ? undefined : end).join('\n').trim()
}

function lineAfterLabel(text: string, pattern: RegExp): string | undefined {
  const lines = text.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? ''
    if (!pattern.test(line)) continue
    const inline = line.replace(/^#{1,6}\s*/, '').replace(/^[-*]\s*/, '').split(/[:：]/).slice(1).join(':').trim()
    if (inline) return stripFence(inline)
    for (const next of lines.slice(index + 1, index + 8)) {
      const candidate = next.trim().replace(/^[-*]\s*/, '')
      if (candidate && !/^#{1,6}\s+/.test(candidate)) return stripFence(candidate)
    }
  }
  return undefined
}

function listAfterLabel(text: string, pattern: RegExp): string[] {
  const value = lineAfterLabel(text, pattern)
  if (!value) return []
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean)
    .slice(0, 8)
}

function detectAspectRatio(text: string, platform: GenerationPlatform): string {
  const match = text.match(/(?:16:9|1:1|4:5|9:16)/)
  if (match) return match[0]
  if (platform === 'threads' || platform === 'x' || platform === 'instagram') return '1:1'
  if (platform === 'shorts') return '9:16'
  return '16:9'
}

function placementFor(platform: GenerationPlatform): string {
  if (platform === 'youtube') return 'thumbnail-1'
  if (platform === 'threads' || platform === 'x' || platform === 'instagram') return 'main-visual-1'
  if (platform === 'note' || platform === 'substack' || platform === 'newsletter') return 'inline-visual-1'
  return 'visual-1'
}

function assetTypeFor(platform: GenerationPlatform, text: string): string {
  if (platform === 'youtube') return 'thumbnail'
  if (platform === 'threads' || platform === 'x') return 'hook-image'
  if (/比較|comparison/i.test(text)) return 'comparison-diagram'
  if (/フロー|flow|pipeline/i.test(text)) return 'flow-diagram'
  if (/architecture|構造|アーキテクチャ/i.test(text)) return 'architecture-diagram'
  return 'section-diagram'
}

export function extractVisualBriefFromGeneratedDraft(args: {
  draftMarkdown: string
  platform: GenerationPlatform
  jobMetadata?: unknown
  draftJson?: unknown
}): ExtractedVisualBrief {
  const bytes = Buffer.byteLength(args.draftMarkdown, 'utf8')
  if (bytes > MAX_GENERATION_JOB_FILE_BYTES) {
    return {
      visualBriefFound: false,
      visualBriefMarkdown: '',
      structuredVisualBrief: {textToInclude: [], textToAvoid: []},
      detectedFields: [],
      warnings: [`draft.md exceeds ${MAX_GENERATION_JOB_FILE_BYTES} bytes.`],
      previewExcerpt: '',
      suggestedPlacement: placementFor(args.platform),
      suggestedAssetType: assetTypeFor(args.platform, ''),
      suggestedAspectRatio: detectAspectRatio('', args.platform),
      suggestedImagePrompt: '',
    }
  }

  const visualBlock = collectVisualBlock(args.draftMarkdown)
  const source = visualBlock || args.draftMarkdown
  const detectedFields = FIELD_PATTERNS
    .filter((pattern) => pattern.re.test(source))
    .map(({key, label}) => ({key, label}))
  const visualBriefFound = visualBlock.length > 0 || detectedFields.length > 0
  const warnings = visualBriefFound ? [] : ['no-visual-brief-found']
  const imagePrompt =
    lineAfterLabel(source, /(image prompt|画像生成プロンプト|生成プロンプト)/i) ??
    (visualBriefFound ? excerpt(source, 1200) : '')
  const visualDirection = lineAfterLabel(source, /(visual direction|design direction|ビジュアル方向性|デザイン方向性|図解構成)/i)
  const aspectRatio = detectAspectRatio(source, args.platform)

  return {
    visualBriefFound,
    visualBriefMarkdown: visualBriefFound ? source.trim() : '',
    structuredVisualBrief: {
      title: lineAfterLabel(source, /(図解タイトル案|visual title|title|タイトル)/i),
      imagePrompt,
      visualDirection,
      textToInclude: listAfterLabel(source, /(text to include|入れる文字|入れたい文字|main copy|メインコピー)/i),
      textToAvoid: listAfterLabel(source, /(text to avoid|避けたい表現|避ける文字)/i),
      aspectRatio,
      cta: lineAfterLabel(source, /\bcta\b|行動喚起/i),
      mainCopy: lineAfterLabel(source, /(main copy|メインコピー|図解タイトル案)/i),
      subCopy: lineAfterLabel(source, /(sub copy|サブコピー)/i),
    },
    detectedFields,
    warnings,
    previewExcerpt: visualBriefFound ? excerpt(source) : '',
    suggestedPlacement: placementFor(args.platform),
    suggestedAssetType: assetTypeFor(args.platform, source),
    suggestedAspectRatio: aspectRatio,
    suggestedImagePrompt: imagePrompt,
  }
}

export function buildVisualBriefJsonPayload(args: {
  contentIdeaSlug: string
  platform: GenerationPlatform
  timestamp: string
  visualBriefMdPath: string
  visualBriefJsonPath: string
  extracted: ExtractedVisualBrief
  savedAtIso: string
  jobMetadata: unknown
}): string | null {
  if (!args.extracted.visualBriefFound) return null
  return JSON.stringify(
    {
      jobType: 'visual-brief-extraction',
      phase: '2C-6',
      boundary: 'no-api, no-image-generation, no-asset-write',
      source: {
        contentIdeaSlug: args.contentIdeaSlug,
        platform: args.platform,
        timestamp: args.timestamp,
      },
      paths: {
        visualBriefMdPath: args.visualBriefMdPath,
        visualBriefJsonPath: args.visualBriefJsonPath,
      },
      structuredVisualBrief: args.extracted.structuredVisualBrief,
      detectedFields: args.extracted.detectedFields,
      suggestions: {
        placement: args.extracted.suggestedPlacement,
        assetType: args.extracted.suggestedAssetType,
        aspectRatio: args.extracted.suggestedAspectRatio,
      },
      savedAt: args.savedAtIso,
      jobMetadata: args.jobMetadata,
    },
    null,
    2,
  )
}
