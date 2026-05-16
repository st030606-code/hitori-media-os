// Phase Admin 1 — Batch D2: Basic Auth proxy.
//
// Next.js 16 renamed the `middleware` file convention to `proxy`. This file
// lives at `dashboard/src/proxy.ts` (alongside `src/app/`) per the Next.js
// docs for src-dir projects.
//
// Behavior:
//   - If both ADMIN_BASIC_AUTH_USER and ADMIN_BASIC_AUTH_PASSWORD are set,
//     every matched request must present a valid HTTP Basic Auth header.
//   - If either env var is missing, the proxy passes the request through
//     unchanged. This keeps localhost dev friction low: just `npm run dev`
//     with no auth env and you get the old behavior.
//   - We never log credentials, never accept them via query string, never
//     write them to cookies. Credentials are checked entirely from the
//     `Authorization` header.
//
// Matcher excludes Next.js static asset prefixes so HMR / image optimization
// don't 401 before the page itself even loads.

import {NextResponse, type NextRequest} from 'next/server'

// Constant-time string compare. Not crypto-grade (no random tags) but it
// avoids the early-return timing leak of a naive `===` over user-controlled
// strings, which is the right hardening level for a personal admin dashboard
// behind Basic Auth.
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still iterate something so the total work doesn't depend on which side
    // is longer in trivially short inputs. Conservative; not load-bearing.
    let _drain = 0
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) _drain |= 1
    void _drain
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function decodeBasicAuth(headerValue: string): {user: string; pass: string} | null {
  // Expected: "Basic base64(user:pass)".
  const parts = headerValue.split(' ')
  if (parts.length !== 2) return null
  if (parts[0] !== 'Basic') return null
  try {
    // `atob` is global in both Edge runtime and Node 18+.
    const decoded = atob(parts[1])
    const sep = decoded.indexOf(':')
    if (sep < 0) return null
    return {user: decoded.slice(0, sep), pass: decoded.slice(sep + 1)}
  } catch {
    return null
  }
}

function requireAuthResponse(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Hitori Media OS Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

export function proxy(req: NextRequest): NextResponse | undefined {
  const user = process.env.ADMIN_BASIC_AUTH_USER
  const pass = process.env.ADMIN_BASIC_AUTH_PASSWORD
  if (!user || !pass) {
    // Localhost / preview without auth configured — let traffic through.
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return requireAuthResponse()

  const creds = decodeBasicAuth(authHeader)
  if (!creds) return requireAuthResponse()

  const userOk = timingSafeEqualStr(creds.user, user)
  const passOk = timingSafeEqualStr(creds.pass, pass)
  // Evaluate both checks regardless of the result of the first, so the time
  // taken does not depend solely on whether the username matched.
  if (!userOk || !passOk) return requireAuthResponse()

  return NextResponse.next()
}

// Match every request the dashboard serves *except* Next.js's own static
// assets and a handful of well-known endpoints. This protects:
//   - all page routes (/, /campaigns/[slug], /diagnostics, ...)
//   - all API routes (/api/asset-thumb)
//   - public files under /<filename>.<ext> that aren't in the exclude list
// and excludes:
//   - /_next/static, /_next/image, /_next/data         (Next.js internals)
//   - /favicon.ico                                     (browser-issued)
//   - /robots.txt, /sitemap.xml                        (crawler basics)
//   - /.well-known/...                                 (TLS / discovery)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|\\.well-known).*)',
  ],
}
