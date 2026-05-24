// GROQ + types for /configurator (Phase UI-fidelity-5).
//
// Fetches the 4 option lists needed by the Output Configurator form in a
// single round-trip:
//   - contentIdea list   → ContentIdeaSelectorCard
//   - promptTemplate list → RecommendedTemplatesCard
//   - brandProfile list   → tone defaults (future)
//   - visualStyleProfile  → style defaults (future)
//
// Read-only. No mutations.

export const configuratorOptionsQuery = /* groq */ `
{
  "contentIdeas": *[_type == "contentIdea"] | order(coalesce(updatedAt, _updatedAt) desc) [0..99] {
    _id,
    title,
    "slug": slug.current,
    status,
    summary,
    coreThesis,
    audience,
    audiencePain,
    "claimsCount": count(claims),
    "examplesCount": count(examples),
    "objectionsCount": count(objections),
    "platformAnglesCount": count(platformAngles),
    updatedAt,
    _updatedAt
  },
  "promptTemplates": *[_type == "promptTemplate"] | order(title asc) [0..49] {
    _id,
    title,
    category,
    version,
    status,
    automationLevel,
    variationStrategy,
    "brandName": brandProfile->brandName,
    "styleTitle": visualStyleProfile->title
  },
  "brandProfiles": *[_type == "brandProfile"] | order(brandName asc) {
    _id,
    title,
    brandName,
    ownerType,
    "voice": voiceTone.voice,
    defaultPlatforms,
    status
  },
  "visualStyleProfiles": *[_type == "visualStyleProfile"] | order(title asc) {
    _id,
    title,
    status
  }
}
`

export interface ContentIdeaOption {
  _id: string
  title?: string
  slug?: string
  status?: string
  summary?: string
  coreThesis?: string
  // `audience` is schema `array of string` in current contentIdea schema, but
  // older datasets may have it as text. Type as unknown and normalize at the
  // call site (see normalizeTextList in lib/configurator/promptBuilder.ts).
  audience?: unknown
  // `audiencePain` is schema `text` (single string). Older or future datasets
  // may turn it into an array. Same unknown + normalize pattern.
  audiencePain?: unknown
  claimsCount?: number
  examplesCount?: number
  objectionsCount?: number
  platformAnglesCount?: number
  updatedAt?: string
  _updatedAt?: string
}

export interface PromptTemplateOption {
  _id: string
  title?: string
  category?: string
  version?: string
  status?: string
  automationLevel?: string
  variationStrategy?: string
  brandName?: string
  styleTitle?: string
}

export interface BrandOption {
  _id: string
  title?: string
  brandName?: string
  ownerType?: string
  voice?: string
  defaultPlatforms?: string[]
  status?: string
}

export interface StyleOption {
  _id: string
  title?: string
  status?: string
}

export interface ConfiguratorOptions {
  contentIdeas: ContentIdeaOption[]
  promptTemplates: PromptTemplateOption[]
  brandProfiles: BrandOption[]
  visualStyleProfiles: StyleOption[]
}
