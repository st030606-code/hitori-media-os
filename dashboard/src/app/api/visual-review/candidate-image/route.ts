// Phase Admin 2A dev-only candidate image serve.
//
// Mirrors the security model of /api/asset-thumb but limits the allowed
// prefix to `assets/inbox/generated/` and the filename pattern to v00N.png.
// Caller is expected to URL-encode the `path` query value.

import path from 'node:path'
import {promises as fs} from 'node:fs'
import {NextResponse, type NextRequest} from 'next/server'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {repoRoot} from '@/lib/repoRoot'
import {isAllowedCandidateImage, imageMimeFromPath} from '@/lib/inboxReader'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_PREFIX = 'assets/inbox/generated/'
const MAX_BYTES = 8 * 1024 * 1024

function reject(status: number, message: string): NextResponse {
  return new NextResponse(message, {
    status,
    headers: {'Cache-Control': 'private, no-store'},
  })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!enableLocalFsRoutes) {
    return reject(404, 'not found')
  }

  const raw = req.nextUrl.searchParams.get('path')
  if (!raw) return reject(400, 'missing path')

  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return reject(400, 'bad encoding')
  }

  if (decoded.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(decoded)) {
    return reject(400, 'absolute path not allowed')
  }

  if (!decoded.startsWith(ALLOWED_PREFIX)) {
    return reject(403, 'forbidden prefix')
  }

  const normalized = path.normalize(decoded)
  if (
    normalized !== decoded ||
    normalized.includes('..') ||
    normalized.split(/[\\/]/).some((seg) => seg === '..')
  ) {
    return reject(400, 'path traversal')
  }
  if (!normalized.startsWith(ALLOWED_PREFIX)) {
    return reject(403, 'forbidden prefix after normalize')
  }

  if (!isAllowedCandidateImage(normalized)) {
    return reject(415, 'unsupported candidate image')
  }

  const allowedRoot = path.resolve(repoRoot(), ALLOWED_PREFIX)
  const abs = path.resolve(repoRoot(), normalized)
  const allowedRootWithSep = allowedRoot.endsWith(path.sep) ? allowedRoot : allowedRoot + path.sep
  if (!abs.startsWith(allowedRootWithSep)) {
    return reject(403, 'out of allowed root')
  }

  let stat
  try {
    stat = await fs.stat(abs)
  } catch {
    return reject(404, 'not found')
  }
  if (!stat.isFile()) return reject(403, 'not a file')
  if (stat.size > MAX_BYTES) return reject(413, 'file too large')

  let buffer: Buffer
  try {
    buffer = await fs.readFile(abs)
  } catch {
    return reject(404, 'read failed')
  }

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': imageMimeFromPath(normalized),
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, max-age=60, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
