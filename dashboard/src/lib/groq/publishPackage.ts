// Focused GROQ helper for /publish-package/[slug] v0.2.
// Pulls only the manualPublishingStatus array per platform so the publish-package
// page can derive ✓ 公開済み / ⏳ 未公開 badges and link to publishedUrl.
//
// Read-only — no mutations.

export const publishPackageStateBySlugQuery = /* groq */ `
*[_type == "campaignPlan" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  "manualPublishingStatus": manualPublishingStatus[]{
    platform,
    state,
    publishedUrl,
    publishedAt
  }
}
`

export interface PublishPackagePlatformState {
  platform?: string
  state?: string
  publishedUrl?: string
  publishedAt?: string
}

export interface PublishPackageState {
  _id: string
  slug?: string
  manualPublishingStatus?: PublishPackagePlatformState[]
}

// Tiny per-platform lookup used by the page.
export function findPlatformState(
  state: PublishPackageState | null | undefined,
  platform: string,
): PublishPackagePlatformState | undefined {
  return (state?.manualPublishingStatus ?? []).find((item) => item.platform === platform)
}

export function isPublished(platformState?: PublishPackagePlatformState): boolean {
  return platformState?.state === 'done' && !!platformState.publishedUrl
}

// Render an ISO datetime (e.g. 2026-05-19T09:38:00+09:00) as
// "2026-05-19 09:38 JST" — deterministic on both server and client, no
// hydration mismatch.
//
// We do the JST conversion explicitly (UTC offset + 9h) rather than relying on
// runtime locale, since Next.js server/client environments may have different
// default timezones.
export function formatPublishedAtJst(iso?: string | null): string | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  const jstMs = ms + 9 * 60 * 60 * 1000
  const d = new Date(jstMs)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm} JST`
}
