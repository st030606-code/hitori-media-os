// Visual Review bucket mapping (Phase UI-fidelity-6).
//
// visualAssetPlan.status (schema enum) → 5 KPI buckets shown on /visual-assets.
//   - すべて        : count(all)
//   - 候補あり      : prompt-ready, generated-needs-save  (active candidate flow)
//   - 承認済み      : reviewed, approved, packaged, published
//   - 要再生成      : archived  (boss treats archive as "remove/regenerate")
//   - 保存済み      : saved      (registered into assets/visuals/ but not yet reviewed)
// planned / brief-ready fall through to "no candidate yet" and are visible via
// AssetCard StatusBadge but not counted in any of the 5 KPI buckets.

import type {VisualAssetPlanListItem} from '@/lib/groq/campaign'

export type VisualBucket = 'all' | 'candidates' | 'approved' | 'needs-regen' | 'saved'

export const VISUAL_BUCKET_KEYS: ReadonlyArray<VisualBucket> = [
  'all',
  'candidates',
  'approved',
  'needs-regen',
  'saved',
] as const

export const VISUAL_BUCKET_LABEL: Record<VisualBucket, string> = {
  all: 'すべて',
  candidates: '候補あり',
  approved: '承認済み',
  'needs-regen': '要再生成',
  saved: '保存済み',
}

export const VISUAL_BUCKET_HINT: Record<VisualBucket, string> = {
  all: '登録済 visualAssetPlan',
  candidates: '生成済み・保存待ち',
  approved: 'レビュー / 承認以上',
  'needs-regen': 'archive → 再生成候補',
  saved: '保存のみ・未レビュー',
}

const APPROVED = new Set(['reviewed', 'approved', 'packaged', 'published'])
const CANDIDATES = new Set(['prompt-ready', 'generated-needs-save'])

export function bucketsFor(plan: VisualAssetPlanListItem): VisualBucket[] {
  const out: VisualBucket[] = ['all']
  const s = plan.status ?? ''
  if (CANDIDATES.has(s)) out.push('candidates')
  if (APPROVED.has(s)) out.push('approved')
  if (s === 'archived') out.push('needs-regen')
  if (s === 'saved') out.push('saved')
  return out
}

export function countByBucket(plans: VisualAssetPlanListItem[]): Record<VisualBucket, number> {
  const counts: Record<VisualBucket, number> = {
    all: 0,
    candidates: 0,
    approved: 0,
    'needs-regen': 0,
    saved: 0,
  }
  for (const p of plans) {
    for (const b of bucketsFor(p)) counts[b]++
  }
  return counts
}

// `visualAssetPlan.<campaignSlug>.<assetSlug>` → returns the campaignSlug part.
// Returns null when the ID does not match the canonical form (e.g. legacy IDs).
export function campaignSlugFromAssetId(assetId?: string | null): string | null {
  if (!assetId) return null
  const prefix = 'visualAssetPlan.'
  if (!assetId.startsWith(prefix)) return null
  const rest = assetId.slice(prefix.length)
  const dot = rest.indexOf('.')
  if (dot <= 0) return null
  return rest.slice(0, dot)
}
