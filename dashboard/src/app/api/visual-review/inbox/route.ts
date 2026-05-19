// Phase Admin 2A dev-only listing of inbox candidate folders.
//
// Returns a summary table keyed by (campaignSlug, assetSlug). No image bytes,
// no frontmatter contents — just counts and presence flags. Use the per-asset
// `/api/visual-review/assets/[assetId]/candidates` endpoint to drill down.
//
// Production guard: 404 when `ENABLE_LOCAL_FS_ROUTES` is off. This route reads
// filesystem and is intentionally not available in production.

import {NextResponse} from 'next/server'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {listInbox} from '@/lib/inboxReader'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(): Promise<NextResponse> {
  if (!enableLocalFsRoutes) {
    return NextResponse.json(
      {error: 'not found', reason: 'local-fs-routes-disabled'},
      {status: 404, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
  try {
    const items = await listInbox()
    return NextResponse.json(
      {
        ok: true,
        inboxPrefix: 'assets/inbox/generated',
        count: items.length,
        items,
      },
      {status: 200, headers: {'Cache-Control': 'private, no-store'}},
    )
  } catch (e) {
    return NextResponse.json(
      {error: 'internal', message: e instanceof Error ? e.message : 'unknown'},
      {status: 500, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
}
