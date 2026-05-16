// Feature flags for Phase Admin 1 — Batch D1.
//
// Three flags control which dev-only surfaces are reachable:
//
//   ENABLE_DIAGNOSTICS         /diagnostics page + nav link
//   ENABLE_LOCAL_FS_ROUTES     /publish-packages page + nav link + /api/asset-thumb
//   ACTIVITY_LOG_MODE          'fs' (read docs/ on request) | 'snapshot' (read public/activity-snapshot.json)
//
// Default behavior:
//   - Localhost dev (NODE_ENV !== 'production') keeps the pre-Batch-D1 UX:
//       all dev-only routes are enabled and Activity Log reads filesystem.
//   - Production defaults are safe: dev-only routes are 404, Activity Log
//     reads the build-time snapshot. The flags only switch on with an
//     explicit env var so a production deploy without configuration cannot
//     accidentally expose filesystem-backed routes.
//
// This module is server-only: client components that need to know which nav
// links should be visible receive the booleans as props from a Server
// Component parent (typically `app/layout.tsx`). We intentionally avoid
// NEXT_PUBLIC_ flags here so that the route-guard decision and the nav-link
// visibility never disagree.

export const isProductionRuntime = process.env.NODE_ENV === 'production'
const isLocalhostDev = !isProductionRuntime

function envFlagOn(name: string): boolean {
  return process.env[name] === 'true'
}

function envFlagOff(name: string): boolean {
  return process.env[name] === 'false'
}

// Default: dev = enabled, production = disabled, override either way via env.
function defaultEnableInDev(envName: string): boolean {
  if (envFlagOn(envName)) return true
  if (envFlagOff(envName)) return false
  return isLocalhostDev
}

export const enableDiagnostics = defaultEnableInDev('ENABLE_DIAGNOSTICS')
export const enableLocalFsRoutes = defaultEnableInDev('ENABLE_LOCAL_FS_ROUTES')

// ACTIVITY_LOG_MODE:
//   explicit 'fs'        → fs mode
//   explicit 'snapshot'  → snapshot mode
//   anything else        → dev default to 'fs', production default to 'snapshot'
type ActivityLogMode = 'fs' | 'snapshot'
export const activityLogMode: ActivityLogMode = (() => {
  const raw = process.env.ACTIVITY_LOG_MODE
  if (raw === 'fs') return 'fs'
  if (raw === 'snapshot') return 'snapshot'
  return isLocalhostDev ? 'fs' : 'snapshot'
})()

export interface NavFlags {
  enableDiagnostics: boolean
  enableLocalFsRoutes: boolean
}

// Helper for layout.tsx to bundle just the props AppNav needs. Booleans only,
// no secrets, safe to cross the Server → Client boundary.
export function getNavFlags(): NavFlags {
  return {
    enableDiagnostics,
    enableLocalFsRoutes,
  }
}
