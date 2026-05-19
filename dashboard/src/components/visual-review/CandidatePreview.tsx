// CandidatePreview — native <img> wrapping the dev-only candidate-image route.
// Using <img> on purpose (same rationale as /api/asset-thumb usage in the
// existing VisualAssetTable): no Next.js image optimization round-trip for
// local-only PNG previews.

export function CandidatePreview({
  relativePath,
  alt,
  className,
  enableLocalFsRoutes,
}: {
  relativePath: string
  alt: string
  className?: string
  enableLocalFsRoutes: boolean
}) {
  if (!enableLocalFsRoutes) {
    return (
      <div
        className={
          className ??
          'flex h-32 w-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500'
        }
      >
        preview unavailable in production mode
      </div>
    )
  }
  const src = `/api/visual-review/candidate-image?path=${encodeURIComponent(relativePath)}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className ?? 'h-auto w-full rounded border border-slate-200 bg-slate-50 object-contain'}
    />
  )
}
