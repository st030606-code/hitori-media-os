import {promises as fs} from 'node:fs'
import path from 'node:path'
import {NextResponse, type NextRequest} from 'next/server'
import {repoRoot} from '@/lib/repoRoot'
import {enableLocalFsRoutes} from '@/lib/featureFlags'

// Local-mode-only image serving for the dashboard's /visual-assets page.
// We do NOT want this enabled in production: Vercel won't have the
// `assets/visuals/` tree, and exposing arbitrary repo files behind a path
// query parameter is the kind of thing that must stay on localhost.
//
// Allowed inputs and behaviors:
//   - relative path under `assets/visuals/` only
//   - no absolute paths, no `..` traversal, no double-encoded traversal
//   - extension whitelist (png / jpg / jpeg / webp / gif)
//   - size cap 8 MB
//   - 404 when feature flag is off or file is missing
//   - 403 when the requested path escapes the allowed root
//   - 415 for disallowed extensions
//   - 413 for files over the size cap

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_PREFIX = 'assets/visuals/'
const ALLOWED_EXTS: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}
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

  // Decode once; reject if the raw query contained encoded traversal that
  // would re-introduce `..` after decoding (`%2e%2e/`, `..%2f` etc).
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return reject(400, 'bad encoding')
  }

  // 1. reject absolute paths
  if (decoded.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(decoded)) {
    return reject(400, 'absolute path not allowed')
  }

  // 2. require the canonical prefix BEFORE normalize so attackers can't slip
  //    through with a different relative prefix and rely on resolve() snapping
  //    them back inside.
  if (!decoded.startsWith(ALLOWED_PREFIX)) {
    return reject(403, 'forbidden prefix')
  }

  // 3. normalize and reject any `..` segments.
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

  // 4. extension whitelist
  const ext = path.extname(normalized).toLowerCase()
  const mime = ALLOWED_EXTS[ext]
  if (!mime) return reject(415, 'unsupported extension')

  // 5. resolve absolute paths and double-check containment.
  const allowedRoot = path.resolve(repoRoot(), ALLOWED_PREFIX)
  const abs = path.resolve(repoRoot(), normalized)
  // resolve(...) collapses any remaining tricks; require the resulting path
  // to start with allowedRoot + separator so `assets/visuals-evil/` is denied.
  const allowedRootWithSep = allowedRoot.endsWith(path.sep) ? allowedRoot : allowedRoot + path.sep
  if (!abs.startsWith(allowedRootWithSep)) {
    return reject(403, 'out of allowed root')
  }

  // 6. size cap + existence
  let stat
  try {
    stat = await fs.stat(abs)
  } catch {
    return reject(404, 'not found')
  }
  if (!stat.isFile()) return reject(403, 'not a file')
  if (stat.size > MAX_BYTES) return reject(413, 'file too large')

  // 7. stream-by-buffer (file is at most 8MB by check above).
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
      'Content-Type': mime,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, max-age=60, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
