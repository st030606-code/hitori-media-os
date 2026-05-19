// Phase Admin 2A dev-only per-asset candidate bundle endpoint.
//
// Returns the typed CandidateBundle for one visualAssetPlan asset ID:
//   - promptMeta / reviewMeta parsed from prompt.md / review.md frontmatter
//   - candidates[] derived from v00N.png files
//
// The assetId path segment uses the canonical dotted form
// `visualAssetPlan.<campaignSlug>.<assetSlug>`. URL-encoding is required by
// the browser; Next.js decodes it before handing off to the route handler.
//
// Production guard: 404 when `ENABLE_LOCAL_FS_ROUTES` is off.

import {NextResponse, type NextRequest} from 'next/server'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {readAssetCandidates, deriveSlugsFromAssetId} from '@/lib/inboxReader'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RouteContext {
  params: Promise<{assetId: string}>
}

export async function GET(_req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  if (!enableLocalFsRoutes) {
    return NextResponse.json(
      {error: 'not found', reason: 'local-fs-routes-disabled'},
      {status: 404, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
  const {assetId} = await ctx.params
  const slugs = deriveSlugsFromAssetId(assetId)
  if (!slugs) {
    return NextResponse.json(
      {error: 'invalid assetId', assetId},
      {status: 400, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
  try {
    const bundle = await readAssetCandidates(slugs.campaignSlug, slugs.assetSlug)
    return NextResponse.json(
      {ok: true, assetId, ...bundle},
      {status: 200, headers: {'Cache-Control': 'private, no-store'}},
    )
  } catch (e) {
    return NextResponse.json(
      {error: 'read failed', message: e instanceof Error ? e.message : 'unknown'},
      {status: 500, headers: {'Cache-Control': 'private, no-store'}},
    )
  }
}
