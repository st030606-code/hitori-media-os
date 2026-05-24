// PublishingSettingsCard — read-only summary of publishing posture.
// Auto-post is intentionally off; the only path is manual approval.

import {Send} from 'lucide-react'

export function PublishingSettingsCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
          aria-hidden="true"
        >
          <Send size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">公開設定</h2>
          <p className="text-[11px] text-slate-500">手動公開・承認フロー</p>
        </div>
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm">
        <Pair
          label="auto-post"
          value={
            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-800 ring-1 ring-inset ring-rose-200">
              never
            </span>
          }
        />
        <Pair
          label="承認フロー"
          value={
            <span className="text-[12px] text-slate-800">
              人間が <code>/publish</code> / <code>/publish-package/[slug]</code> で確認し、各媒体のネイティブ UI に手動投稿
            </span>
          }
        />
        <Pair
          label="承認後の記録"
          value={
            <span className="text-[12px] text-slate-800">
              <code>manualPublishingStatus[]</code> に publishedUrl を atomic write
            </span>
          }
        />
        <Pair
          label="reaction notes"
          value={
            <span className="text-[12px] text-slate-800">
              24-72h 後に手動で <code>reactionNotes</code> に記録
            </span>
          }
        />
      </dl>

      <p className="mt-3 text-[11px] text-slate-500">
        各 platform のデフォルト設定 (tone / CTA / length) は brandProfile.defaultPlatforms から導出予定 (Phase Settings-2)。
      </p>
    </section>
  )
}

function Pair({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </>
  )
}
