import {createClient, type SanityClient} from '@sanity/client'

// Phase 2B-1 Sanity write client.
//
// Physically separated from the read client (`@/lib/sanity`) so that:
//   1. The token lookup happens lazily, only when a write actually fires
//   2. Read paths cannot accidentally mutate via the same client instance
//   3. The token reference stays inside this module, which is only imported
//      from `'use server'` files — the function never appears in the
//      client bundle
//
// SANITY_WRITE_TOKEN MUST be a server-only env var (no NEXT_PUBLIC_ prefix).
// Next.js will not inline non-prefixed env vars into the client bundle.
// If it is missing, callers must surface a 'missing-token' error and abort
// before touching Sanity.

const DEFAULT_PROJECT_ID = '5f79ed6q'
const DEFAULT_DATASET = 'production'
const DEFAULT_API_VERSION = '2025-08-15'

export interface WriteClientHandle {
  client: SanityClient
  projectId: string
  dataset: string
  apiVersion: string
}

export function getSanityWriteClient(): WriteClientHandle | null {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) return null

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || DEFAULT_DATASET
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || DEFAULT_API_VERSION

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: 'published',
  })

  return {client, projectId, dataset, apiVersion}
}
