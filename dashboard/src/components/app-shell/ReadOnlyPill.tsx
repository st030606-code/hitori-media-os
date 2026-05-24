// Compact write-mode indicator that lives in the Topbar instead of the page
// body. Replaces the full-width amber banner that used to sit at the top of
// every route in v0.2.
//
// Phase 2B-1: when both `enableWriteActions` and a Sanity write token are
// present in the local runtime, the pill switches to a "local write" mode
// (blue) so the boss can see at a glance whether the inline editors on
// /analytics will fire. Production deploys never reach that state because
// neither env var is set on Vercel.

import {ShieldAlert, Pencil} from 'lucide-react'

interface Props {
  /** True only when both ENABLE_WRITE_ACTIONS=true and SANITY_WRITE_TOKEN
   *  are present in the local runtime. Computed server-side. */
  writeReady: boolean
}

export function ReadOnlyPill({writeReady}: Props) {
  if (writeReady) {
    return (
      <span
        role="status"
        title="ローカル環境で Phase 2B-1 write actions が有効です。Vercel 上では常に読み取り専用のままです。"
        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 ring-1 ring-inset ring-blue-200"
      >
        <Pencil size={12} aria-hidden="true" />
        <span>ローカル書き込み有効</span>
      </span>
    )
  }
  return (
    <span
      role="status"
      title="このダッシュボードは読み取り専用です。Sanity への書き込みは Studio または controlled write tool 経由のみ。"
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200"
    >
      <ShieldAlert size={12} aria-hidden="true" />
      <span>読み取り専用</span>
    </span>
  )
}
