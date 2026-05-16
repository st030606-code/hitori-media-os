import type {RequiredVisualAssetItem} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

export function VisualAssetStatusTable({assets}: {assets?: RequiredVisualAssetItem[]}) {
  if (!assets || assets.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">Visual Assets</h2>
        <p className="mt-2">No required visual assets recorded.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Visual Assets</h2>
        <p className="text-xs text-slate-500">
          {assets.length} total &middot; {assets.filter((a) => a.state === 'done').length} done
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Asset</th>
              <th className="px-3 py-2 font-medium">Platform</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">State</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium">Local Asset Path</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((a, i) => {
              const planResolved = a.plan && a.plan._id
              const pathFromPlan = a.plan?.localAssetPath || a.localAssetPath
              const sharesMaster = a.sharesMasterWith && a.sharesMasterWith.length > 0
              return (
                <tr key={`${a.assetSlug ?? a.visualAssetPlanId ?? 'asset'}-${i}`}>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-900">{a.assetSlug ?? '—'}</div>
                    {a.visualAssetPlanId && (
                      <div className="text-xs text-slate-500 break-all">
                        <code>{a.visualAssetPlanId}</code>
                      </div>
                    )}
                    {sharesMaster && (
                      <div className="mt-1 text-xs text-slate-500">
                        shares master with: {a.sharesMasterWith?.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">{a.platform ?? '—'}</td>
                  <td className="px-3 py-2 align-top text-slate-700">{a.assetType ?? '—'}</td>
                  <td className="px-3 py-2 align-top">
                    {a.priority ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{a.priority}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <StatusBadge state={a.state} />
                  </td>
                  <td className="px-3 py-2 align-top text-xs">
                    {planResolved ? (
                      <span className="text-slate-700">
                        plan status: <StatusBadge state={a.plan?.status} />
                      </span>
                    ) : (
                      <span className="text-rose-700">Reference not in dataset</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-slate-700 break-all">
                    {pathFromPlan ? <code>{pathFromPlan}</code> : <span className="italic text-slate-400">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
