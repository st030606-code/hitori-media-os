// LocalModeBanner — shown at the top of candidate review screens to make the
// runtime mode explicit. In production-like mode (ENABLE_LOCAL_FS_ROUTES=false)
// candidate previews and inbox filesystem reads are disabled; the banner spells
// out why and how to enable locally.

export function LocalModeBanner({
  enableLocalFsRoutes,
}: {
  enableLocalFsRoutes: boolean
}) {
  if (enableLocalFsRoutes) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
        <strong className="font-semibold">Local mode.</strong>{' '}
        Inbox candidate previews are served from <code>assets/inbox/generated/</code>{' '}
        via the dev-only <code>/api/visual-review/*</code> routes. No writes, no Sanity mutation.
      </div>
    )
  }
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <strong className="font-semibold">
        Local candidate review unavailable in production mode.
      </strong>{' '}
      Run the dashboard locally with{' '}
      <code>ENABLE_LOCAL_FS_ROUTES=true npm run dev</code> to inspect inbox candidates.
      Metadata pulled from Sanity will still render below.
    </div>
  )
}
