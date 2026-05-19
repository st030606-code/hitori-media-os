#!/usr/bin/env node
// tools/sanity/reflect-working-pipeline-visual-assets.mjs
//
// One-off controlled Sanity write tool for Working Pipeline Step E.
// Updates exactly 9 visualAssetPlan documents to reflect the post-recovery state:
//   - 7 records → status: saved + localAssetPath + reviewNotes + updatedAt
//   - 2 records → status: skipped + reviewNotes + unset(localAssetPath) + updatedAt
//
// Safety model
//   1. Default mode: --dry-run (no writes). Use --execute to commit.
//   2. Allowlist of exactly 9 document IDs hardcoded in RECORDS. No GROQ-driven
//      bulk update. No --replace. No dataset import.
//   3. Read every target doc by _id and validate _type === 'visualAssetPlan'
//      before any write. If any doc is missing or wrong type, abort.
//   4. For "saved" records, validate that the matching final-asset PNG exists on
//      disk (with byte-size check for the 2 critical assets) and the matching
//      patch JSON points to the same localAssetPath. If a check fails, abort.
//   5. Use a single client.transaction() so all 9 patches commit atomically.
//   6. Never logs token values. Never prints raw .env file contents.
//
// Required env (loaded from .env.local at repo root and dashboard/.env.local):
//   - SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)
//   - SANITY_STUDIO_DATASET    (or NEXT_PUBLIC_SANITY_DATASET; defaults to 'production')
//   - SANITY_READ_TOKEN        (optional for public dataset; required for --dry-run if private)
//   - SANITY_WRITE_TOKEN       (required for --execute; not used in --dry-run)
//
// Usage
//   Dry-run (default):
//     node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run
//   Execute (writes):
//     node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute

import {createClient} from '@sanity/client'
import {existsSync, statSync} from 'node:fs'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

// ---------- paths ----------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

// ---------- load env (without printing values) ----------

const envFiles = [
  path.join(projectRoot, '.env.local'),
  path.join(projectRoot, 'dashboard', '.env.local'),
]
for (const ef of envFiles) {
  if (existsSync(ef)) {
    try {
      process.loadEnvFile(ef)
    } catch {
      // intentionally silent; bad .env files surface via missing env checks below.
    }
  }
}

// ---------- CLI ----------

const args = process.argv.slice(2)
const isExecute = args.includes('--execute')
const isDryRun = !isExecute

// ---------- Config resolution ----------

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2025-08-15'
const writeToken = process.env.SANITY_WRITE_TOKEN
const readToken = process.env.SANITY_READ_TOKEN || writeToken

if (!projectId) {
  console.error('FATAL: SANITY_STUDIO_PROJECT_ID is missing.')
  console.error('Set it in .env.local at the repo root (or pass via environment).')
  process.exitCode = 1
  process.exit()
}
if (!dataset) {
  console.error('FATAL: SANITY_STUDIO_DATASET is missing.')
  process.exitCode = 1
  process.exit()
}

// ---------- 9 record allowlist (hardcoded) ----------

const SAVED_RECORDS = [
  {
    _id: 'visualAssetPlan.building-hitori-media-os.note-hero-v1',
    status: 'saved',
    localAssetPath: 'assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png',
    reviewNotes:
      'Master shared with substack-header-v1. Approved 2026-05-14, master file restored after Visual Register recovery.',
    expectedFinalBytes: 1331047,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/note-hero-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.substack-header-v1',
    status: 'saved',
    localAssetPath: 'assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png',
    reviewNotes:
      'Master sharing with note-hero-v1. Recovered and re-registered after prior mis-selection. Uses restored campaign-hero-v1.png master asset.',
    expectedFinalBytes: 1331047,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/substack-header-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.x-hook-main-v1',
    status: 'saved',
    localAssetPath: 'assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png',
    reviewNotes:
      'Hook image v1 approved through Visual Register. Working pipeline production asset.',
    expectedFinalBytes: null, // no strict byte check for this one
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1',
    status: 'saved',
    localAssetPath:
      'assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png',
    reviewNotes:
      'v004 (japanese-editorial-v1), Problem-to-system 3-band portrait. Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared.',
    expectedFinalBytes: null,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/threads-support-diagram-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1',
    status: 'saved',
    localAssetPath:
      'assets/visuals/building-hitori-media-os/note/inline/note-inline-content-os-flow-v1.png',
    reviewNotes:
      'v004 (japanese-editorial-v1), Before/After + Pipeline. Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared.',
    expectedFinalBytes: null,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/note-inline-content-os-flow-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1',
    status: 'saved',
    localAssetPath:
      'assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png',
    reviewNotes:
      'v001 (japanese-editorial-v1), Human review journey 3-section. Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared.',
    expectedFinalBytes: null,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/note-inline-human-judgment-v1.json',
  },
  {
    _id: 'visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1',
    status: 'saved',
    localAssetPath:
      'assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png',
    reviewNotes:
      'v001 (japanese-editorial-v1), Reader-list funnel. Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared. Approved after Visual Register recovery.',
    expectedFinalBytes: 1297423,
    patchJsonPath:
      'patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json',
  },
]

const SKIPPED_RECORDS = [
  {
    _id:
      'visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1',
    status: 'skipped',
    reviewNotes:
      '本フェーズでは保留。Visual Engine Improvement Phaseで再評価。記事は補助図なしで公開可。',
  },
  {
    _id:
      'visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1',
    status: 'skipped',
    reviewNotes:
      '本フェーズでは保留。Visual Engine Improvement Phaseで再評価。記事は補助図なしで公開可。',
  },
]

const ALL_IDS = [...SAVED_RECORDS, ...SKIPPED_RECORDS].map((r) => r._id)
const EXPECTED_TYPE = 'visualAssetPlan'

// ---------- helpers ----------

function repoExists(relativePath) {
  return existsSync(path.join(projectRoot, relativePath))
}

function repoStat(relativePath) {
  try {
    return statSync(path.join(projectRoot, relativePath))
  } catch {
    return null
  }
}

async function readPatchJson(relativePath) {
  const abs = path.join(projectRoot, relativePath)
  if (!existsSync(abs)) return null
  try {
    return JSON.parse(await readFile(abs, 'utf8'))
  } catch {
    return null
  }
}

function fmtBefore(value) {
  if (value === undefined) return '(unset)'
  if (value === null) return '(null)'
  if (typeof value === 'string' && value.length > 60) return value.slice(0, 60) + '…'
  return JSON.stringify(value)
}

function fmtAfter(value) {
  if (value === undefined) return '(unset)'
  if (value === null) return '(null)'
  if (typeof value === 'string' && value.length > 60) return value.slice(0, 60) + '…'
  return JSON.stringify(value)
}

// ---------- main ----------

async function main() {
  console.log('=== Working Pipeline Step E — Sanity Reflection ===')
  console.log(`Project root:  ${projectRoot}`)
  console.log(`Sanity project: ${projectId}`)
  console.log(`Sanity dataset: ${dataset}`)
  console.log(`Sanity apiVersion: ${apiVersion}`)
  console.log(`Read token:    ${readToken ? '(present, ' + readToken.length + ' chars)' : '(not present)'}`)
  console.log(`Write token:   ${writeToken ? '(present, ' + writeToken.length + ' chars)' : '(not present)'}`)
  console.log(`Mode:          ${isExecute ? 'EXECUTE (will write to Sanity)' : 'DRY-RUN (no writes)'}`)
  console.log('')

  // Pre-flight: --execute requires write token
  if (isExecute && !writeToken) {
    console.error('FATAL: SANITY_WRITE_TOKEN is required for --execute mode and is not present.')
    console.error('')
    console.error('How to obtain a write token:')
    console.error('  1. Go to https://www.sanity.io/manage')
    console.error(`  2. Select your project (id: ${projectId})`)
    console.error('  3. API → Tokens → Add API token')
    console.error('  4. Name it "working-pipeline-step-e-reflect" (or similar)')
    console.error('  5. Permission: Editor (sufficient for visualAssetPlan patches)')
    console.error('  6. Copy the token (shown ONCE)')
    console.error('  7. Add to .env.local at repo root:')
    console.error('     SANITY_WRITE_TOKEN=<paste token here>')
    console.error('  8. Re-run: node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute')
    console.error('')
    console.error('Note: this token grants write access. Treat it as a secret.')
    console.error('      Never commit .env.local. The repo .gitignore already excludes it.')
    process.exitCode = 1
    return
  }

  // ---------- Local-state verification (saved records) ----------

  console.log('--- Local state verification (saved records) ---')
  let localOk = true
  for (const rec of SAVED_RECORDS) {
    const finalStat = repoStat(rec.localAssetPath)
    if (!finalStat) {
      console.error(`  ✗ ${rec._id}: final asset MISSING at ${rec.localAssetPath}`)
      localOk = false
      continue
    }
    if (rec.expectedFinalBytes != null && finalStat.size !== rec.expectedFinalBytes) {
      console.error(
        `  ✗ ${rec._id}: byte size mismatch ${rec.localAssetPath} (got ${finalStat.size}, expected ${rec.expectedFinalBytes})`,
      )
      localOk = false
      continue
    }
    const patch = await readPatchJson(rec.patchJsonPath)
    if (!patch) {
      console.error(`  ✗ ${rec._id}: patch JSON MISSING at ${rec.patchJsonPath}`)
      localOk = false
      continue
    }
    if (patch.set?.localAssetPath !== rec.localAssetPath) {
      console.error(
        `  ✗ ${rec._id}: patch.set.localAssetPath mismatch (got ${patch.set?.localAssetPath}, expected ${rec.localAssetPath})`,
      )
      localOk = false
      continue
    }
    if (patch.set?.status !== 'saved') {
      console.error(
        `  ✗ ${rec._id}: patch.set.status (${patch.set?.status}) is not 'saved'`,
      )
      localOk = false
      continue
    }
    if (patch.meta?.directSanityWrite !== false) {
      console.error(
        `  ✗ ${rec._id}: patch.meta.directSanityWrite (${patch.meta?.directSanityWrite}) is not false`,
      )
      localOk = false
      continue
    }
    console.log(`  ✓ ${rec._id.split('.').pop().padEnd(40)} final=${finalStat.size}b, patch OK`)
  }
  if (!localOk) {
    console.error('')
    console.error('FATAL: local state verification failed. Aborting before any Sanity read.')
    process.exitCode = 1
    return
  }
  for (const rec of SKIPPED_RECORDS) {
    console.log(`  ↪ ${rec._id.split('.').pop().padEnd(40)} (skipped record, no local asset expected)`)
  }
  console.log('')

  // ---------- Sanity read ----------

  console.log('--- Sanity read (read-only, fetching 9 targets by _id) ---')
  const readClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: readToken || undefined,
    perspective: 'published',
  })

  let existing
  try {
    existing = await readClient.fetch(
      '*[_id in $ids]{_id, _type, title, status, localAssetPath, reviewNotes, updatedAt}',
      {ids: ALL_IDS},
    )
  } catch (err) {
    console.error('FATAL: Sanity read failed:', err instanceof Error ? err.message : String(err))
    process.exitCode = 1
    return
  }
  const byId = new Map(existing.map((d) => [d._id, d]))

  // Validate: every target must exist and be visualAssetPlan
  let preflightOk = true
  for (const id of ALL_IDS) {
    const doc = byId.get(id)
    if (!doc) {
      console.error(`  ✗ Sanity doc MISSING: ${id}`)
      preflightOk = false
      continue
    }
    if (doc._type !== EXPECTED_TYPE) {
      console.error(`  ✗ Sanity doc wrong _type: ${id} (got ${doc._type}, expected ${EXPECTED_TYPE})`)
      preflightOk = false
      continue
    }
  }
  if (!preflightOk) {
    console.error('')
    console.error('FATAL: one or more Sanity preflight checks failed. Aborting before any write.')
    process.exitCode = 1
    return
  }

  // Detect if existing records use updatedAt so we can mirror that convention.
  const anyHasUpdatedAt = existing.some((d) => d.updatedAt)
  const nowIso = new Date().toISOString()

  // ---------- Build planned patches ----------

  const planned = []
  for (const rec of SAVED_RECORDS) {
    const doc = byId.get(rec._id)
    const setFields = {
      status: rec.status,
      localAssetPath: rec.localAssetPath,
      reviewNotes: rec.reviewNotes,
    }
    if (anyHasUpdatedAt) setFields.updatedAt = nowIso
    planned.push({
      _id: rec._id,
      kind: 'saved',
      before: {
        title: doc.title,
        status: doc.status,
        localAssetPath: doc.localAssetPath,
        reviewNotes: doc.reviewNotes,
        updatedAt: doc.updatedAt,
      },
      after: setFields,
      unset: [],
    })
  }
  for (const rec of SKIPPED_RECORDS) {
    const doc = byId.get(rec._id)
    const setFields = {
      status: rec.status,
      reviewNotes: rec.reviewNotes,
    }
    if (anyHasUpdatedAt) setFields.updatedAt = nowIso
    planned.push({
      _id: rec._id,
      kind: 'skipped',
      before: {
        title: doc.title,
        status: doc.status,
        localAssetPath: doc.localAssetPath,
        reviewNotes: doc.reviewNotes,
        updatedAt: doc.updatedAt,
      },
      after: setFields,
      unset: doc.localAssetPath ? ['localAssetPath'] : [],
    })
  }

  // ---------- Print planned diff ----------

  console.log('')
  console.log('--- Planned updates (9 records, atomic transaction) ---')
  for (const p of planned) {
    const shortId = p._id.split('.').pop()
    console.log('')
    console.log(`  ${p._id}`)
    console.log(`    kind:           ${p.kind}`)
    console.log(`    title (before): ${p.before.title}`)
    console.log(`    status:         ${fmtBefore(p.before.status)} → ${fmtAfter(p.after.status)}`)
    if (p.kind === 'saved') {
      console.log(
        `    localAssetPath: ${fmtBefore(p.before.localAssetPath)} → ${fmtAfter(p.after.localAssetPath)}`,
      )
    } else {
      const op = p.unset.includes('localAssetPath') ? 'unset' : '(no change)'
      console.log(
        `    localAssetPath: ${fmtBefore(p.before.localAssetPath)} → ${op}`,
      )
    }
    console.log(
      `    reviewNotes:    ${fmtBefore(p.before.reviewNotes)} → ${fmtAfter(p.after.reviewNotes)}`,
    )
    if (anyHasUpdatedAt) {
      console.log(`    updatedAt:      ${fmtBefore(p.before.updatedAt)} → ${nowIso}`)
    }
  }

  console.log('')
  console.log(`Summary: ${planned.length} documents planned (${SAVED_RECORDS.length} saved + ${SKIPPED_RECORDS.length} skipped).`)
  console.log(`Other docs touched: 0.`)

  if (isDryRun) {
    console.log('')
    console.log('=== DRY-RUN complete. No Sanity writes performed. ===')
    console.log('To execute: ensure SANITY_WRITE_TOKEN is in .env.local and re-run with --execute.')
    return
  }

  // ---------- Execute ----------

  console.log('')
  console.log('=== EXECUTING Sanity transaction (9 patches, atomic) ===')
  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
  })
  const tx = writeClient.transaction()
  for (const p of planned) {
    let patch = writeClient.patch(p._id).set(p.after)
    if (p.unset && p.unset.length) patch = patch.unset(p.unset)
    tx.patch(patch)
  }
  let txResult
  try {
    txResult = await tx.commit({autoGenerateArrayKeys: false})
  } catch (err) {
    console.error('FATAL: Sanity transaction failed:', err instanceof Error ? err.message : String(err))
    process.exitCode = 1
    return
  }
  console.log(`  transactionId: ${txResult?.transactionId || '(unknown)'}`)
  console.log(`  documentIds (${txResult?.documentIds?.length || 0}):`)
  for (const id of txResult?.documentIds || []) console.log(`    ${id}`)
  console.log('')

  // ---------- Post-write verification ----------

  console.log('--- Post-write verification (re-read 9 docs) ---')
  const afterDocs = await readClient.fetch(
    '*[_id in $ids]{_id, _type, status, localAssetPath, reviewNotes, updatedAt}',
    {ids: ALL_IDS},
  )
  const afterById = new Map(afterDocs.map((d) => [d._id, d]))
  let verifyOk = true
  for (const p of planned) {
    const doc = afterById.get(p._id)
    if (!doc) {
      console.error(`  ✗ ${p._id}: not found after write`)
      verifyOk = false
      continue
    }
    const expectStatus = p.after.status
    if (doc.status !== expectStatus) {
      console.error(`  ✗ ${p._id}: status mismatch (got ${doc.status}, expected ${expectStatus})`)
      verifyOk = false
      continue
    }
    if (p.kind === 'saved') {
      if (doc.localAssetPath !== p.after.localAssetPath) {
        console.error(
          `  ✗ ${p._id}: localAssetPath mismatch (got ${doc.localAssetPath}, expected ${p.after.localAssetPath})`,
        )
        verifyOk = false
        continue
      }
    } else {
      if (doc.localAssetPath != null && doc.localAssetPath !== '') {
        console.error(`  ✗ ${p._id}: expected localAssetPath unset, got ${doc.localAssetPath}`)
        verifyOk = false
        continue
      }
    }
    if (doc.reviewNotes !== p.after.reviewNotes) {
      console.error(
        `  ✗ ${p._id}: reviewNotes mismatch`,
      )
      verifyOk = false
      continue
    }
    if (anyHasUpdatedAt && doc.updatedAt !== nowIso) {
      console.error(
        `  ✗ ${p._id}: updatedAt mismatch (got ${doc.updatedAt}, expected ${nowIso})`,
      )
      verifyOk = false
      continue
    }
    console.log(
      `  ✓ ${p._id.split('.').pop().padEnd(40)} status=${doc.status}, ${p.kind === 'saved' ? 'localAssetPath set' : 'localAssetPath unset'}`,
    )
  }

  if (!verifyOk) {
    console.error('')
    console.error('FATAL: post-write verification failed. Some documents may not match the intended state.')
    process.exitCode = 1
    return
  }

  console.log('')
  console.log('=== EXECUTE complete. All 9 documents verified. ===')
  console.log(`Next step: re-run \`npm run publish:package -- building-hitori-media-os --dry-run\` and review.`)
}

main().catch((err) => {
  console.error('FATAL:', err instanceof Error ? err.message : String(err))
  process.exitCode = 1
})
