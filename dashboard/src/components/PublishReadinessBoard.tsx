// Boss-facing 公開準備ボード for the building-hitori-media-os campaign.
// Phase 1 static board: the per-platform readiness and asset counts reflect
// the human-confirmed Working Pipeline Step A–G completion state. We do not
// derive these from Sanity queries here because the boss needs an at-a-glance
// "ready / not ready" view independent of query timing.

interface PlatformReadiness {
  platform: string
  state: 'ready' | 'pending'
}

interface AssetSummary {
  label: string
  detail: string
}

const PLATFORMS: PlatformReadiness[] = [
  {platform: 'X', state: 'ready'},
  {platform: 'Threads', state: 'ready'},
  {platform: 'note', state: 'ready'},
  {platform: 'Substack', state: 'ready'},
]

const ASSETS: AssetSummary[] = [
  {label: '共通ヒーロー画像', detail: '完了'},
  {label: 'Xフック画像', detail: '完了'},
  {label: 'Threads補助図解', detail: '完了'},
  {label: 'note本文図解', detail: '2枚完了 / 2枚保留'},
  {label: 'Substack本文図解', detail: '完了'},
]

const REMAINING: string[] = [
  'ボスの最終確認',
  '公開予定日の記入',
  '手動公開',
  '公開URLと反応メモの記録',
]

function stateBadge(state: PlatformReadiness['state']): {label: string; classes: string} {
  if (state === 'ready') {
    return {
      label: '準備完了',
      classes: 'bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300',
    }
  }
  return {
    label: '準備中',
    classes: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300',
  }
}

export function PublishReadinessBoard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開準備ボード</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          媒体ごとの ready / not ready と、残っているボス側の作業を 1 枚で確認します。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">媒体別</h3>
          <ul className="space-y-1.5 text-sm">
            {PLATFORMS.map((p) => {
              const badge = stateBadge(p.state)
              return (
                <li
                  key={p.platform}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5"
                >
                  <span className="font-medium text-slate-900">{p.platform}</span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">画像・図解</h3>
          <ul className="space-y-1.5 text-sm">
            {ASSETS.map((a) => (
              <li
                key={a.label}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5"
              >
                <span className="text-slate-900">{a.label}</span>
                <span className="text-xs text-slate-700">{a.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-slate-700">残り作業</h3>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-800">
          {REMAINING.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
