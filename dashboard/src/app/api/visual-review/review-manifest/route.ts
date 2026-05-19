// Phase Admin 2A dev-only campaign-level review-manifest reader.
//
// Returns the parsed contents of `assets/inbox/generated/<slug>/review-manifest.json`.
// If the file is missing, returns a safe empty manifest shape so the dashboard
// can degrade cleanly. Never writes.

import {NextResponse, type NextRequest} from 'next/server'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {readReviewManifest} from '@/lib/inboxReader'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!enableLocalFsRoutes) {
    return NextResponse.json(
      {error: 'not found', reason: 'local-fs-routes-disabled'},
      {status: 404, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json(
      {error: 'missing slug'},
      {status: 400, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
  try {
    const result = await readReviewManifest(slug)
    return NextResponse.json(
      {ok: true, ...result},
      {status: 200, headers: {'Cache-Control': 'private, no-store'}},
    )
  } catch (e) {
    return NextResponse.json(
      {error: 'read failed', message: e instanceof Error ? e.message : 'unknown'},
      {status: 400, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
}
