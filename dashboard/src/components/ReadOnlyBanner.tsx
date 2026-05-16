export function ReadOnlyBanner() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <strong className="font-semibold">Phase Admin 1 is read-only.</strong>{' '}
      No Sanity writes, no posting, no AI generation triggers in this dashboard. Edit
      via Sanity Studio.
    </div>
  )
}
