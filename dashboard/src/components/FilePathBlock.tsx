// Display a filesystem path as muted, monospaced text. Optional secondary
// metadata (size, mtime) rendered after the path.

export function FilePathBlock({
  path,
  detail,
}: {
  path?: string | null
  detail?: string
}) {
  if (!path) {
    return <span className="italic text-slate-400">—</span>
  }
  return (
    <span className="break-all">
      <code className="rounded bg-slate-50 px-1 py-0.5 text-xs text-slate-700">{path}</code>
      {detail && <span className="ml-2 text-[11px] text-slate-500">{detail}</span>}
    </span>
  )
}
