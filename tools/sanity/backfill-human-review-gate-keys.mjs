#!/usr/bin/env node
// tools/sanity/backfill-human-review-gate-keys.mjs
//
// One-off controlled Sanity write tool: add Sanity-internal `_key` to any
// `humanReviewGates[]` array item that is missing one on
// `campaignPlan.building-hitori-media-os`.
//
// Background:
// Phase 2B-2 ships a state-update server action that patches a single
// `humanReviewGates[_key=="<key>"].state`. Existing gates that were imported
// from seed/campaign-plan-building-hitori-media-os.json arrived without
// `_key` (Sanity's client.create() does NOT auto-assign array `_key`s by
// default; only client.patch().insert() or Studio UI does). Without `_key`,
// the dashboard cannot edit those gates. This script adds the missing keys.
//
// Safety model (mirrors tools/sanity/reflect-publication-state.mjs):
//   1. Default mode: dry-run (no writes). Use --execute to commit.
//   2. Hardcoded `_id` allowlist — exactly one doc:
//        campaignPlan.building-hitori-media-os
//      The script refuses to write to anything else, even if the slug
//      fallback resolves to a different `_id`.
//   3. Only ADDS `_key` to items that lack it. Items with an existing
//      `_key` are kept verbatim.
//   4. Field-preservation check before AND after the write: every original
//      field on every gate must be present in the patched array with an
//      unchanged value. The script aborts if any drift is detected.
//   5. Optimistic lock via `ifRevisionID` so we never race a concurrent
//      Studio edit.
//   6. Single transaction patch; no other documents touched.
//   7. Token values are never logged. Only env var names and metadata
//      counts appear in stdout.
//
// Deterministic `_key` rules:
//   - Prefer the gate's `gateName` as the basis (the only stable string
//     field on the seed). The slug helper lowercases, strips non-ASCII
//     alphanumerics + hyphens, collapses repeated hyphens, and prefixes
//     with `gate-`. Japanese characters are dropped — the remaining ASCII
//     portion of each `gateName` in the seed is unique. If two gates
//     would map to the same slug, the second/third/... gets `-2`, `-3`
//     suffixes.
//   - If `gateName` is empty (or stripping leaves no ASCII), fall back
//     to `gate-<index>`.
//
// Required env (loaded from .env.local at repo root and dashboard/.env.local):
//   - SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)
//   - SANITY_STUDIO_DATASET    (or NEXT_PUBLIC_SANITY_DATASET; defaults to 'production')
//   - SANITY_READ_TOKEN        (optional for public dataset; required for dry-run if private)
//   - SANITY_WRITE_TOKEN       (required for --execute; not used in dry-run)
//
// Usage:
//   Dry-run (default, no writes):
//     node tools/sanity/backfill-human-review-gate-keys.mjs
//
//   Execute (commits the patch):
//     node tools/sanity/backfill-human-review-gate-keys.mjs --execute

import {createClient} from '@sanity/client'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

// ---------- paths ----------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

// ---------- env loading ----------

const envFiles = [
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, 'dashboard', '.env.local'),
]
for (const ef of envFiles) {
  if (existsSync(ef)) {
    try {
      process.loadEnvFile(ef)
    } catch {
      // silent; missing-env checks below surface any real problem
    }
  }
}

// ---------- CLI ----------

const args = process.argv.slice(2)
const isExecute = args.includes('--execute')
const isDryRun = !isExecute

// ---------- Config ----------

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2025-08-15'
const writeToken = process.env.SANITY_WRITE_TOKEN
const readToken = process.env.SANITY_READ_TOKEN || writeToken

if (!projectId) {
  console.error('FATAL: SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID) is missing.')
  process.exit(1)
}
if (isExecute && !writeToken) {
  console.error('FATAL: --execute requires SANITY_WRITE_TOKEN in the env. Aborting.')
  process.exit(2)
}

// ---------- Allowlist (hardcoded) ----------

const CAMPAIGN_ID = 'campaignPlan.building-hitori-media-os'
const CAMPAIGN_SLUG = 'building-hitori-media-os'

// ---------- helpers ----------

function fmtRevPrefix(rev) {
  if (typeof rev !== 'string') return '(none)'
  return rev.length > 6 ? rev.slice(0, 6) + '…' : rev
}

function makeBaseSlug(name, index) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return `gate-${index}`
  }
  const ascii = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!ascii) return `gate-${index}`
  const trimmed = ascii.slice(0, 48).replace(/-+$/, '')
  return `gate-${trimmed}`
}

function planKeys(gates) {
  const used = new Set()
  const plan = []
  // First pass: claim existing _keys.
  for (const g of gates) {
    if (typeof g?._key === 'string' && g._key.length > 0) used.add(g._key)
  }
  // Second pass: assign deterministic keys to missing slots.
  for (let i = 0; i < gates.length; i++) {
    const g = gates[i] ?? {}
    if (typeof g._key === 'string' && g._key.length > 0) {
      plan.push({index: i, existing: g._key, planned: g._key, action: 'keep'})
      continue
    }
    const base = makeBaseSlug(g.gateName, i)
    let candidate = base
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}-${suffix++}`
    }
    used.add(candidate)
    plan.push({index: i, existing: null, planned: candidate, action: 'add'})
  }
  return plan
}

function fieldPreservationCheck(oldArr, newArr) {
  if (oldArr.length !== newArr.length) {
    return {ok: false, reason: `count drift ${oldArr.length} -> ${newArr.length}`}
  }
  for (let i = 0; i < oldArr.length; i++) {
    const before = oldArr[i] ?? {}
    const after = newArr[i] ?? {}
    for (const k of Object.keys(before)) {
      if (!(k in after)) {
        return {ok: false, reason: `index ${i}: field "${k}" missing in new array`}
      }
      if (k === '_key') continue
      if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
        return {ok: false, reason: `index ${i}: field "${k}" value drift`}
      }
    }
    // Allow only the addition of `_key` — refuse silent new fields.
    for (const k of Object.keys(after)) {
      if (k === '_key') continue
      if (!(k in before)) {
        return {ok: false, reason: `index ${i}: unexpected new field "${k}" in patched array`}
      }
    }
  }
  return {ok: true}
}

// ---------- main ----------

async function main() {
  console.log('=== humanReviewGates _key backfill ===')
  console.log(`Project root:    ${projectRoot}`)
  console.log(`Sanity project:  ${projectId}`)
  console.log(`Sanity dataset:  ${dataset}`)
  console.log(`API version:     ${apiVersion}`)
  console.log(`Target _id:      ${CAMPAIGN_ID}`)
  console.log(`Mode:            ${isExecute ? 'EXECUTE' : 'dry-run'}`)
  console.log(`Read token:      ${readToken ? 'present (server-only)' : 'absent'}`)
  console.log(`Write token:     ${writeToken ? 'present (server-only)' : 'absent'}`)
  console.log()

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: isExecute ? writeToken : readToken,
    useCdn: false,
    perspective: 'published',
  })

  // Fetch target by allowlisted _id.
  let doc = await client.fetch(
    `*[_type == "campaignPlan" && _id == $id][0]{
      _id, _rev, _type, "slug": slug.current, humanReviewGates
    }`,
    {id: CAMPAIGN_ID},
  )
  if (!doc) {
    console.warn(`[backfill] target _id not found; trying slug fallback "${CAMPAIGN_SLUG}"`)
    doc = await client.fetch(
      `*[_type == "campaignPlan" && slug.current == $slug][0]{
        _id, _rev, _type, "slug": slug.current, humanReviewGates
      }`,
      {slug: CAMPAIGN_SLUG},
    )
  }
  if (!doc) {
    console.error('[backfill] target document not found by _id or slug. Aborting.')
    process.exit(3)
  }
  if (doc._id !== CAMPAIGN_ID) {
    console.error(
      `[backfill] resolved doc _id "${doc._id}" does not match allowlist "${CAMPAIGN_ID}". Aborting safety check.`,
    )
    process.exit(4)
  }
  if (doc._type !== 'campaignPlan') {
    console.error(`[backfill] resolved doc _type "${doc._type}" is not "campaignPlan". Aborting.`)
    process.exit(5)
  }

  const gates = Array.isArray(doc.humanReviewGates) ? doc.humanReviewGates : []
  const plan = planKeys(gates)
  const toAdd = plan.filter((p) => p.action === 'add')
  const toKeep = plan.filter((p) => p.action === 'keep')

  console.log(`Doc _id:                ${doc._id}`)
  console.log(`Doc slug:               ${doc.slug ?? '(none)'}`)
  console.log(`Doc _rev:               ${fmtRevPrefix(doc._rev)}`)
  console.log(`humanReviewGates total: ${gates.length}`)
  console.log(`  with existing _key:   ${toKeep.length}`)
  console.log(`  missing _key:         ${toAdd.length}`)
  console.log()
  console.log('Per-gate plan:')
  for (const p of plan) {
    const g = gates[p.index] ?? {}
    const name = (typeof g.gateName === 'string' ? g.gateName : '(unnamed)').slice(0, 64)
    const state = typeof g.state === 'string' ? g.state : '(no state)'
    if (p.action === 'keep') {
      console.log(
        `  [${String(p.index).padStart(2, '0')}] keep  _key="${p.existing}"  state="${state}"  name="${name}"`,
      )
    } else {
      console.log(
        `  [${String(p.index).padStart(2, '0')}] ADD   _key="${p.planned}"  state="${state}"  name="${name}"`,
      )
    }
  }
  console.log()

  if (toAdd.length === 0) {
    console.log('[backfill] no missing _key — nothing to do. Exiting.')
    return
  }

  // Build new array: preserve every field, ADD `_key` only.
  const newGates = gates.map((g, i) => {
    const p = plan[i]
    if (p.action === 'keep') return g
    return {...g, _key: p.planned}
  })

  const fp = fieldPreservationCheck(gates, newGates)
  if (!fp.ok) {
    console.error(`[backfill] field-preservation check FAILED: ${fp.reason}. Aborting.`)
    process.exit(6)
  }
  console.log('[backfill] field-preservation check passed (no field-value drift, only `_key` added).')
  console.log()

  if (isDryRun) {
    console.log('[backfill] dry-run finished. No writes were made.')
    console.log('[backfill] To commit, re-run with --execute and SANITY_WRITE_TOKEN set in env.')
    console.log('[backfill]   node tools/sanity/backfill-human-review-gate-keys.mjs --execute')
    return
  }

  // ---------- EXECUTE ----------

  console.log('[backfill] EXECUTE mode — committing patch...')
  const patch = client
    .patch(doc._id, {ifRevisionID: doc._rev})
    .set({humanReviewGates: newGates})

  let committed
  try {
    committed = await client.transaction().patch(patch).commit({
      autoGenerateArrayKeys: false,
      returnDocuments: true,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[backfill] commit FAILED:', message)
    process.exit(7)
  }

  // Extract new _rev from the various return shapes the client can produce.
  let newRev = '(unknown)'
  if (Array.isArray(committed) && committed.length > 0) {
    const first = committed[0]
    if (first && typeof first === 'object') {
      if (typeof first._rev === 'string') newRev = first._rev
      else if (first.document && typeof first.document._rev === 'string') newRev = first.document._rev
    }
  } else if (committed && typeof committed === 'object' && Array.isArray(committed.results)) {
    const first = committed.results[0]
    if (first && typeof first === 'object') {
      if (typeof first._rev === 'string') newRev = first._rev
      else if (first.document && typeof first.document._rev === 'string') newRev = first.document._rev
    }
  }
  console.log(`[backfill] commit OK. new _rev: ${fmtRevPrefix(newRev)}`)
  console.log()

  // ---------- Post-write verification ----------

  console.log('[backfill] verifying post-write state...')
  const verify = await client.fetch(
    `*[_type == "campaignPlan" && _id == $id][0]{_id, _rev, humanReviewGates}`,
    {id: CAMPAIGN_ID},
  )
  if (!verify) {
    console.error('[backfill] verification FAILED: doc not found after commit. Investigate.')
    process.exit(8)
  }
  const verifyGates = Array.isArray(verify.humanReviewGates) ? verify.humanReviewGates : []
  if (verifyGates.length !== gates.length) {
    console.error(
      `[backfill] verification FAILED: count drift ${gates.length} -> ${verifyGates.length}. Investigate.`,
    )
    process.exit(9)
  }
  const missingAfter = verifyGates.filter(
    (g) => typeof g._key !== 'string' || g._key.length === 0,
  )
  if (missingAfter.length > 0) {
    console.error(
      `[backfill] verification FAILED: ${missingAfter.length} items still missing _key. Investigate.`,
    )
    process.exit(10)
  }
  const verifyFp = fieldPreservationCheck(gates, verifyGates)
  if (!verifyFp.ok) {
    console.error(`[backfill] verification FAILED: ${verifyFp.reason}. Investigate.`)
    process.exit(11)
  }
  console.log(
    `[backfill] verification OK — ${verifyGates.length} gates, all have _key, non-_key fields unchanged.`,
  )
}

main().catch((e) => {
  const message = e instanceof Error ? e.message : String(e)
  console.error('[backfill] FATAL:', message)
  process.exit(1)
})
