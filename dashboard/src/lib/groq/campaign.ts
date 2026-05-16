// GROQ queries for Campaign-related screens.
// Source: docs/59-admin-phase-1-implementation-plan.md §7
//
// Read-only. No mutations.
// `requiredVisualAssets[].visualAssetPlanId`, `promptTemplateSelections[].promptTemplateId`,
// and `requiredRecords[].recordId` are STRING IDs (not Sanity references), so we use
// `*[_id == ^.X][0]` to dereference them — not the `->` arrow.

export const campaignDetailBySlugQuery = /* groq */ `
*[_type == "campaignPlan" && slug.current == $slug][0] {
  _id,
  _type,
  title,
  "slug": slug.current,
  campaignType,
  contentMode,
  coreThesis,
  targetReader,
  status,
  automationLevel,
  version,
  notes,
  createdAt,
  updatedAt,
  selectedPlatforms,
  platformGenerationSettings,
  humanReviewGates,
  manualPublishingStatus,
  publishPackagePaths,
  releaseReviewPath,
  progressStatus,
  "sourceContentIdea": sourceContentIdea->{
    _id,
    title,
    "slug": slug.current,
    status,
    summary,
    coreThesis,
    audience
  },
  "brandProfile": brandProfile->{
    _id,
    title,
    brandName,
    ownerType,
    voiceTone,
    defaultPlatforms,
    status
  },
  "visualAssetDetails": requiredVisualAssets[] {
    visualAssetPlanId,
    assetSlug,
    platform,
    assetType,
    priority,
    state,
    sharesMasterWith,
    localAssetPath,
    notes,
    "plan": *[_id == ^.visualAssetPlanId][0]{
      _id,
      title,
      status,
      localAssetPath,
      publishPackagePath,
      reviewNotes
    }
  },
  "promptTemplateDetails": promptTemplateSelections[] {
    promptTemplateId,
    category,
    platform,
    assetType,
    notes,
    "template": *[_id == ^.promptTemplateId][0]{
      _id,
      title,
      category,
      version,
      status,
      automationLevel,
      variationStrategy,
      "brand": brandProfile->{_id, brandName},
      "style": visualStyleProfile->{_id, title}
    }
  },
  "recordDetails": requiredRecords[] {
    recordType,
    recordId,
    platform,
    state,
    notes,
    "doc": *[_id == ^.recordId][0]{_id, _type, status}
  }
}
`

// ---------- Used by Batch B (Dashboard Home / Campaigns list / Human Review Gates) ----------

export const campaignListQuery = /* groq */ `
*[_type == "campaignPlan"] | order(coalesce(updatedAt, _updatedAt) desc) {
  _id,
  title,
  "slug": slug.current,
  campaignType,
  contentMode,
  status,
  automationLevel,
  progressStatus,
  "sourceContentIdea": sourceContentIdea->{_id, title, "slug": slug.current},
  "selectedPlatforms": selectedPlatforms[]{platform, priority, contentDepth, enabled},
  "selectedPlatformsCount": count(selectedPlatforms[enabled == true]),
  "pendingGatesCount": count(humanReviewGates[
    state == "pending-review" || state == "in-progress" || state == "blocked"
  ]),
  "doneVisualsCount": count(requiredVisualAssets[state == "done"]),
  "totalVisualsCount": count(requiredVisualAssets),
  "manualPublishingNotStartedCount": count(
    manualPublishingStatus[!defined(publishedUrl) && (state == "not-started" || !defined(state))]
  ),
  "manualPublishingDoneCount": count(manualPublishingStatus[defined(publishedUrl)])
}
`

// Dashboard Home aggregates the top campaigns plus dataset-wide counts.
export const dashboardHomeQuery = /* groq */ `
{
  "campaigns": *[_type == "campaignPlan"] | order(coalesce(updatedAt, _updatedAt) desc)[0..4] {
    _id,
    title,
    "slug": slug.current,
    campaignType,
    contentMode,
    status,
    automationLevel,
    progressStatus,
    "selectedPlatforms": selectedPlatforms[]{platform, priority, enabled},
    "pendingGatesCount": count(humanReviewGates[
      state == "pending-review" || state == "in-progress" || state == "blocked"
    ]),
    "doneVisualsCount": count(requiredVisualAssets[state == "done"]),
    "totalVisualsCount": count(requiredVisualAssets),
    "manualPublishingDoneCount": count(manualPublishingStatus[defined(publishedUrl)])
  },
  "campaignTotal": count(*[_type == "campaignPlan"]),
  "campaignsActive": count(*[
    _type == "campaignPlan" && status in ["draft","planning","generating","reviewing"]
  ]),
  "pendingGatesTotal": count(
    *[_type == "campaignPlan"].humanReviewGates[
      state == "pending-review" || state == "in-progress" || state == "blocked"
    ]
  ),
  "visualsTotal": count(*[_type == "campaignPlan"].requiredVisualAssets[]),
  "visualsDone": count(
    *[_type == "campaignPlan"].requiredVisualAssets[state == "done"]
  ),
  "manualPublishingPending": count(
    *[_type == "campaignPlan"].manualPublishingStatus[
      !defined(publishedUrl) && (state == "not-started" || !defined(state))
    ]
  ),
  "manualPublishingDone": count(
    *[_type == "campaignPlan"].manualPublishingStatus[defined(publishedUrl)]
  ),
  "latest": *[_type == "campaignPlan"] | order(coalesce(updatedAt, _updatedAt) desc)[0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    campaignType,
    contentMode,
    coreThesis,
    targetReader,
    status,
    automationLevel,
    version,
    notes,
    createdAt,
    updatedAt,
    selectedPlatforms,
    platformGenerationSettings,
    humanReviewGates,
    manualPublishingStatus,
    publishPackagePaths,
    releaseReviewPath,
    progressStatus,
    "sourceContentIdea": sourceContentIdea->{_id, title, "slug": slug.current, status, summary, coreThesis, audience},
    "brandProfile": brandProfile->{_id, title, brandName, ownerType, voiceTone, defaultPlatforms, status},
    "visualAssetDetails": requiredVisualAssets[] {
      visualAssetPlanId, assetSlug, platform, assetType, priority, state, sharesMasterWith, localAssetPath, notes,
      "plan": *[_id == ^.visualAssetPlanId][0]{_id, title, status, localAssetPath, publishPackagePath, reviewNotes}
    },
    "promptTemplateDetails": promptTemplateSelections[] {
      promptTemplateId, category, platform, assetType, notes,
      "template": *[_id == ^.promptTemplateId][0]{
        _id, title, category, version, status, automationLevel, variationStrategy,
        "brand": brandProfile->{_id, brandName},
        "style": visualStyleProfile->{_id, title}
      }
    }
  }
}
`

// Aggregator: every humanReviewGate across every campaign that is currently
// "active" (pending-review / in-progress / blocked). Optionally also returns
// not-started gates as a "Later" bucket for the page.
export const pendingHumanReviewGatesQuery = /* groq */ `
*[_type == "campaignPlan" && count(humanReviewGates) > 0] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  status,
  "gates": humanReviewGates[]{gateName, state, reviewer, completedAt, notes}
}
`

// Full listing of visualAssetPlan documents in the dataset. Used by /visual-assets.
// Read-only. The ordering puts most-recently-updated first so the boss sees
// fresh activity at the top of the page.
export const visualAssetPlanListQuery = /* groq */ `
*[_type == "visualAssetPlan"] | order(coalesce(updatedAt, _updatedAt) desc) {
  _id,
  title,
  "slug": slug.current,
  targetPlatform,
  assetType,
  placement,
  aspectRatio,
  status,
  reusePolicy,
  generationMode,
  generationProvider,
  expectedLocalAssetPath,
  localAssetPath,
  taskFilePath,
  publishPackagePath,
  reviewNotes,
  updatedAt,
  createdAt,
  "sourceContentIdea": sourceContentIdea->{_id, title, "slug": slug.current}
}
`

// ---------- TypeScript types for the new queries ----------

export interface CampaignListItem {
  _id: string
  title?: string
  slug?: string
  campaignType?: string
  contentMode?: string
  status?: string
  automationLevel?: string
  progressStatus?: ProgressStatus
  sourceContentIdea?: {_id: string; title?: string; slug?: string} | null
  selectedPlatforms?: Array<{platform?: string; priority?: string; contentDepth?: string; enabled?: boolean}>
  selectedPlatformsCount?: number
  pendingGatesCount?: number
  doneVisualsCount?: number
  totalVisualsCount?: number
  manualPublishingNotStartedCount?: number
  manualPublishingDoneCount?: number
}

export interface DashboardHomeData {
  campaigns: CampaignListItem[]
  campaignTotal: number
  campaignsActive: number
  pendingGatesTotal: number
  visualsTotal: number
  visualsDone: number
  manualPublishingPending: number
  manualPublishingDone: number
  latest: CampaignPlanDetail | null
}

export interface VisualAssetPlanListItem {
  _id: string
  title?: string
  slug?: string
  targetPlatform?: string
  assetType?: string
  placement?: string
  aspectRatio?: string
  status?: string
  reusePolicy?: string
  generationMode?: string
  generationProvider?: string
  expectedLocalAssetPath?: string
  localAssetPath?: string
  taskFilePath?: string
  publishPackagePath?: string
  reviewNotes?: string
  updatedAt?: string
  createdAt?: string
  sourceContentIdea?: {_id: string; title?: string; slug?: string} | null
}

export interface PendingGatesByCampaign {
  _id: string
  title?: string
  slug?: string
  status?: string
  gates?: HumanReviewGate[]
}

// ---------- TypeScript types (lightweight, just what the components need) ----------

export interface ContentIdeaRef {
  _id: string
  title?: string
  slug?: string
  status?: string
  summary?: string
  coreThesis?: string
  audience?: string[]
}

export interface BrandProfileRef {
  _id: string
  title?: string
  brandName?: string
  ownerType?: string
  voiceTone?: {voice?: string; expertiseLevel?: string; styleNotes?: string[]; avoidPhrasings?: string[]}
  defaultPlatforms?: string[]
  status?: string
}

export interface VisualAssetPlanLite {
  _id: string
  title?: string
  status?: string
  localAssetPath?: string
  publishPackagePath?: string
  reviewNotes?: string
}

export interface PromptTemplateLite {
  _id: string
  title?: string
  category?: string
  version?: string
  status?: string
  automationLevel?: string
  variationStrategy?: string
  brand?: {_id: string; brandName?: string}
  style?: {_id: string; title?: string}
}

export interface SelectedPlatform {
  platform?: string
  enabled?: boolean
  priority?: string
  contentDepth?: string
  visualRequirement?: string
  publishMode?: string
  productionMode?: string
  cadence?: string
  requiredAssets?: string[]
  optionalAssets?: string[]
  notes?: string
}

export interface HumanReviewGate {
  gateName?: string
  state?: string
  reviewer?: string
  completedAt?: string
  notes?: string
}

export interface RequiredVisualAssetItem {
  visualAssetPlanId?: string
  assetSlug?: string
  platform?: string
  assetType?: string
  priority?: string
  state?: string
  sharesMasterWith?: string[]
  localAssetPath?: string
  notes?: string
  plan?: VisualAssetPlanLite | null
}

export interface PromptTemplateSelectionItem {
  promptTemplateId?: string
  category?: string
  platform?: string
  assetType?: string
  notes?: string
  template?: PromptTemplateLite | null
}

export interface PublishPackagePathItem {
  platform?: string
  path?: string
  state?: string
  notes?: string
}

export interface ManualPublishingItem {
  platform?: string
  publishedUrl?: string
  publishedAt?: string
  reactionNotes?: string
  state?: string
}

export interface ProgressStatus {
  overall?: string
  textDrafts?: string
  visuals?: string
  publishPackages?: string
  releaseReview?: string
}

export interface CampaignPlanDetail {
  _id: string
  _type: string
  title?: string
  slug?: string
  campaignType?: string
  contentMode?: string
  coreThesis?: string
  targetReader?: string[]
  status?: string
  automationLevel?: string
  version?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  selectedPlatforms?: SelectedPlatform[]
  humanReviewGates?: HumanReviewGate[]
  manualPublishingStatus?: ManualPublishingItem[]
  publishPackagePaths?: PublishPackagePathItem[]
  releaseReviewPath?: string
  progressStatus?: ProgressStatus
  sourceContentIdea?: ContentIdeaRef | null
  brandProfile?: BrandProfileRef | null
  visualAssetDetails?: RequiredVisualAssetItem[]
  promptTemplateDetails?: PromptTemplateSelectionItem[]
}
