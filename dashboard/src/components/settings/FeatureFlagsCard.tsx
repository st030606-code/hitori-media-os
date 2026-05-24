// FeatureFlagsCard — readout of the 3 env-controlled feature flags.
// Shows env name + current value + dev/prod default. Never shows secret
// values (none of these flags carry secrets, but the discipline matters).

import {Flag} from 'lucide-react'

export interface FlagRow {
  envName: string
  description: string
  current: string
  devDefault: string
  prodDefault: string
  active: boolean
}

interface Props {
  rows: FlagRow[]
}

export function FeatureFlagsCard({rows}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-200"
          aria-hidden="true"
        >
          <Flag size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">フィーチャーフラグ</h2>
          <p className="text-[11px] text-slate-500">
            現環境の状態 / dev / production デフォルト
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">env 変数</th>
              <th className="px-3 py-2 font-medium">現在</th>
              <th className="px-3 py-2 font-medium">dev</th>
              <th className="px-3 py-2 font-medium">prod</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.envName}>
                <td className="px-3 py-2 align-top">
                  <code className="break-all text-[11px]">{r.envName}</code>
                  <div className="mt-0.5 text-[11px] text-slate-500">{r.description}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <span
                    className={
                      'rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ' +
                      (r.active
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-slate-100 text-slate-600 ring-slate-200')
                    }
                  >
                    {r.current}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-[11px] text-slate-600">{r.devDefault}</td>
                <td className="px-3 py-2 align-top text-[11px] text-slate-600">{r.prodDefault}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        値の編集は <code>dashboard/.env.local</code> を手動で編集します。Phase 2B 以降で
        UI 上の編集に対応予定。
      </p>
    </section>
  )
}
