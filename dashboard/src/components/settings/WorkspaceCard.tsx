// WorkspaceCard — workspace identity readout on /settings.
// Read-only: shows the Sanity projectId / dataset / apiVersion + a Studio
// external link. No secrets surfaced (boss decision).

import {ExternalLink, FolderTree} from 'lucide-react'

interface Props {
  projectId: string
  dataset: string
  apiVersion: string
  hasReadToken: boolean
  studioBaseUrl: string
}

export function WorkspaceCard({projectId, dataset, apiVersion, hasReadToken, studioBaseUrl}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
          aria-hidden="true"
        >
          <FolderTree size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">ワークスペース</h2>
          <p className="text-[11px] text-slate-500">Hitori Media OS / Sanity 接続</p>
        </div>
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <Pair label="名称" value="Hitori Media OS" />
        <Pair
          label="projectId"
          value={<code className="break-all text-[11px]">{projectId}</code>}
        />
        <Pair
          label="dataset"
          value={<code className="break-all text-[11px]">{dataset}</code>}
        />
        <Pair
          label="apiVersion"
          value={<code className="break-all text-[11px]">{apiVersion}</code>}
        />
        <Pair
          label="read token"
          value={
            hasReadToken ? (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                設定済み (値は非表示)
              </span>
            ) : (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                未設定 (anonymous + CDN)
              </span>
            )
          }
        />
      </dl>

      <a
        href={studioBaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Sanity Studio を開く
        <ExternalLink size={12} aria-hidden="true" />
      </a>
    </section>
  )
}

function Pair({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}
