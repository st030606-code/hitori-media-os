import {createClient, type SanityClient} from '@sanity/client'

// Phase Admin 1 read-only client.
// - useCdn: true when no token is present (anonymous reads of public datasets)
// - useCdn: false when SANITY_READ_TOKEN is set (CDN bypasses tokens, so a
//   private dataset only resolves via the live API)
// - no mutation helpers exported (write is intentionally not supported)
// - SANITY_READ_TOKEN is a SERVER-SIDE env var only (no NEXT_PUBLIC_ prefix);
//   it must never reach the browser. Server Components read it via process.env
//   at request time; the value never appears in the client bundle.
//
// projectId / dataset / apiVersion are PUBLIC and inlined into the client
// bundle via NEXT_PUBLIC_* prefix. Override via dashboard/.env.local if you
// need a different project/dataset.

const DEFAULT_PROJECT_ID = '5f79ed6q'
const DEFAULT_DATASET = 'production'
const DEFAULT_API_VERSION = '2025-08-15'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || DEFAULT_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || DEFAULT_API_VERSION

// Optional read token for private datasets. Read at request time on the
// server; not bundled into client JavaScript.
const readToken = process.env.SANITY_READ_TOKEN || undefined

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasReadToken: Boolean(readToken),
} as const

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // When using a token, the CDN cannot serve the request (it intentionally
  // strips auth), so we must hit the live API. When anonymous, CDN is fine.
  useCdn: !readToken,
  token: readToken,
  perspective: 'published',
})

// Studio deep-link helper. Used only for read-only "open in Studio" buttons.
// The actual Studio URL depends on hosting; if Studio runs locally on
// `npm run dev` (port 3333), this returns the local URL by default.
const STUDIO_BASE_URL = process.env.NEXT_PUBLIC_STUDIO_BASE_URL || 'http://localhost:3333'

export function studioDocumentUrl(documentId: string): string {
  return `${STUDIO_BASE_URL}/structure/${encodeURIComponent(documentId)}`
}
