// Campaign-level "next action" derivation helpers.
//
// Moved from the legacy `NextActionSummary` component during Phase UI-fidelity-11
// so the helper survives independently of the deprecated component file (the
// fidelity-1 era `<NextActionSummary />` is being deleted, but its derivation
// logic is still consumed by the current `<NextActionList />`).
//
// Pure server-safe functions: no JSX, no client APIs.

import type {CampaignPlanDetail} from '@/lib/groq/campaign'

export type ActionTone = 'now' | 'soon' | 'later' | 'warn' | 'done'

export interface Action {
  tone: ActionTone
  title: string
  detail?: string
}

export const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'] as const

export function isActiveGateState(state?: string): boolean {
  return state === 'pending-review' || state === 'in-progress' || state === 'blocked'
}

export function isActiveVisualState(state?: string): boolean {
  return state !== 'done' && state !== 'skipped'
}

export function actionToneClasses(tone: ActionTone): string {
  switch (tone) {
    case 'now':
      return 'border-amber-300 bg-amber-50 text-amber-950'
    case 'soon':
      return 'border-sky-300 bg-sky-50 text-sky-950'
    case 'later':
      return 'border-slate-300 bg-slate-50 text-slate-800'
    case 'warn':
      return 'border-rose-300 bg-rose-50 text-rose-950'
    case 'done':
      return 'border-emerald-300 bg-emerald-50 text-emerald-950'
  }
}

export function actionLabel(tone: ActionTone): string {
  switch (tone) {
    case 'now':
      return 'Do next'
    case 'soon':
      return 'Soon'
    case 'later':
      return 'Later'
    case 'warn':
      return 'Warning'
    case 'done':
      return 'OK'
  }
}

export function computeNextActions(campaign: CampaignPlanDetail): Action[] {
  const actions: Action[] = []

  // 1. Staleness check: visual assets whose seed-side state is pending/blocked
  // but whose underlying visualAssetPlan in Sanity says saved/approved/published.
  // This catches the known x-hook-main-v1 staleness pattern: the campaignPlan
  // seed was frozen before approval, but the actual visualAssetPlan document
  // is already saved.
  const stale = (campaign.visualAssetDetails ?? []).filter((v) => {
    const planStatus = v.plan?.status
    if (!planStatus) return false
    const planDone = ['saved', 'reviewed', 'approved', 'packaged', 'published'].includes(planStatus)
    return planDone && isActiveVisualState(v.state)
  })
  for (const s of stale) {
    actions.push({
      tone: 'warn',
      title: `CampaignPlan may be stale: ${s.assetSlug ?? s.visualAssetPlanId ?? '(unknown)'}`,
      detail: `campaign state is "${s.state}" but the underlying visualAssetPlan is "${s.plan?.status}". Update the campaignPlan in Sanity Studio so progress is accurate.`,
    })
  }

  // 2. Active human review gates (pending-review / in-progress / blocked).
  const activeGates = (campaign.humanReviewGates ?? []).filter((g) => isActiveGateState(g.state))
  for (const g of activeGates) {
    actions.push({
      tone: g.state === 'blocked' ? 'warn' : 'now',
      title: `Review gate: ${g.gateName ?? '(unnamed)'}`,
      detail: [g.state, g.reviewer ? `reviewer: ${g.reviewer}` : null, g.notes].filter(Boolean).join(' · '),
    })
  }

  // 3. Highest-priority not-done required visual assets.
  const pendingVisuals = (campaign.visualAssetDetails ?? [])
    .filter((v) => isActiveVisualState(v.state) && !stale.includes(v))
    .sort((a, b) => {
      const ai = PRIORITY_ORDER.indexOf((a.priority ?? 'P3') as (typeof PRIORITY_ORDER)[number])
      const bi = PRIORITY_ORDER.indexOf((b.priority ?? 'P3') as (typeof PRIORITY_ORDER)[number])
      return ai - bi
    })
  // Take the top 3 by priority so the panel does not blow up; the full list is
  // available in the Visual Asset Status table further down the page.
  for (const v of pendingVisuals.slice(0, 3)) {
    actions.push({
      tone: 'soon',
      title: `Generate visual: ${v.assetSlug ?? v.visualAssetPlanId ?? '(unknown)'}`,
      detail: [v.platform, v.assetType, v.priority, `state: ${v.state ?? '—'}`]
        .filter(Boolean)
        .join(' · '),
    })
  }
  const remainingVisuals = pendingVisuals.length - Math.min(3, pendingVisuals.length)
  if (remainingVisuals > 0) {
    actions.push({
      tone: 'later',
      title: `${remainingVisuals} more visual asset${remainingVisuals === 1 ? '' : 's'} not done`,
      detail: 'See the Visual Assets table below for the full list.',
    })
  }

  // 4. Publish package paths that are not done yet.
  const pendingPackages = (campaign.publishPackagePaths ?? []).filter((p) =>
    isActiveVisualState(p.state),
  )
  if (pendingPackages.length > 0) {
    actions.push({
      tone: 'later',
      title: `Publish packages still pending: ${pendingPackages.length}`,
      detail: pendingPackages
        .map((p) => `${p.platform ?? '—'}${p.state ? ` (${p.state})` : ''}`)
        .join(' · '),
    })
  }

  // 5. Manual publishing: anything still not-started.
  const pendingPublishing = (campaign.manualPublishingStatus ?? []).filter(
    (m) => !m.publishedUrl && (m.state ?? 'not-started') !== 'done',
  )
  if (pendingPublishing.length > 0) {
    actions.push({
      tone: 'later',
      title: `Manual publishing pending: ${pendingPublishing.length} platform${
        pendingPublishing.length === 1 ? '' : 's'
      }`,
      detail: pendingPublishing.map((m) => m.platform ?? '—').join(' · '),
    })
  }

  // 6. If nothing actionable, surface the "all clear" line.
  if (actions.length === 0) {
    actions.push({
      tone: 'done',
      title: 'No immediate blockers',
      detail: 'All review gates are done, all required visual assets are done, and publishing has been recorded.',
    })
  }

  return actions
}
