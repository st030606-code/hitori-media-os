// AppShell — Hitori Media OS root shell (Phase UI-1).
// Layout:
//   - Sidebar 280px fixed left (desktop only; mobile hides it)
//   - Topbar 64px fixed top, right of Sidebar on desktop
//   - Main scrollable area, max 1440px, 24px page padding
// Background is slate-50, text slate-900.

import {Sidebar} from './Sidebar'
import {Topbar} from './Topbar'
import {enableWriteActions} from '@/lib/featureFlags'

// AppShell uses <div> (not <main>) as the content wrapper so existing pages
// that already declare their own <main> remain valid HTML (one <main> per
// page). Later, when individual pages are redesigned in UI-2+, we can move
// the <main> landmark up here.
//
// Phase 2B-1: compute writeReady server-side (both env-flag AND token present)
// and pass it down. The token itself never leaves the server — we forward
// only a boolean.
export function AppShell({children}: {children: React.ReactNode}) {
  const writeReady = enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <Topbar writeReady={writeReady} />
      <div className="pt-16 lg:pl-[280px]">{children}</div>
    </div>
  )
}
