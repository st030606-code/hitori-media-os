// FilePathsCard — file path summary for a single visualAssetPlan + its inbox
// + its prospective patch JSON. Each row exposes a CopyButton for the path.

import {FileText} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'

export interface FilePathItem {
  label: string
  path: string | null | undefined
  fallback?: string
  note?: string
}

interface Props {
  items: FilePathItem[]
}

export function FilePathsCard({items}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
          aria-hidden="true"
        >
          <FileText size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">ファイルパス</h2>
          <p className="text-[11px] text-slate-500">
            最終アセット / inbox / patch / brief
          </p>
        </div>
      </header>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px]">
            <span className="w-28 shrink-0 pt-0.5 text-slate-500">{item.label}</span>
            <div className="min-w-0 flex-1">
              {item.path ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-800 ring-1 ring-inset ring-slate-200">
                    {item.path}
                  </code>
                  <CopyButton text={item.path} label="copy" />
                </div>
              ) : (
                <span className="italic text-slate-400">{item.fallback ?? '—'}</span>
              )}
              {item.note && (
                <p className="mt-0.5 text-[10px] text-slate-400">{item.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
