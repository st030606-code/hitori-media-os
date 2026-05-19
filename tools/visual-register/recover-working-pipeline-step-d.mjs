#!/usr/bin/env node
// tools/visual-register/recover-working-pipeline-step-d.mjs
//
// One-off recovery script for Working Pipeline Step D Visual Register mis-mapping.
// See docs/handoff/0127-working-pipeline-visual-register-approval.md for full context.
//
// Issue: a previous Visual Register UI approve session bound
//   assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png
// to the substack-header-v1 plan, which overwrote
//   assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
// with the wrong content (1,331,047 → 1,297,423 bytes) and left
// substack-inline-reader-system-v1 unregistered.
//
// This script performs two recovery operations:
// A. Re-approve substack-header-v1 with note-hero-v1/v001.png (the original
//    master-shared source) → restores shared/campaign-hero-v1.png to 1,331,047 bytes.
// B. Approve substack-inline-reader-system-v1 with its own v001.png → creates
//    the missing final asset + patch JSON.
//
// Logic mirrors tools/visual-register/server.mjs's handleInboxApproveAndRegister
// (lines 550-648) for byte-structurally-identical patch JSON and review-manifest
// entries. server.mjs is NOT modified (it exports nothing; this script replicates
// the helpers verbatim).
//
// Defaults to --dry-run. Use --execute to write.
//
// Safety:
// - --dry-run by default; --execute required for writes
// - Pre-validates source byte sizes
// - Backs up shared/campaign-hero-v1.png before overwrite
// - Touches ONLY the 2 documented targets + their patch JSONs + the manifest
// - Never writes to Sanity
// - Never runs publish-package actual

import {copyFile, readFile, writeFile, mkdir, readdir, stat} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const seedPath = path.join(projectRoot, 'seed/visual-asset-plan-records.json')
const seedDir = path.join(projectRoot, 'seed')
const inboxRoot = path.join(projectRoot, 'assets/inbox/generated')
const inboxManifestFileName = 'review-manifest.json'

// ---------- CLI ----------

const args = process.argv.slice(2)
const isExecute = args.includes('--execute')
const isDryRun = !isExecute

// ---------- Recovery operations (hardcoded mappings) ----------

const OPS = [
  {
    name: 'A. Restore master shared campaign-hero-v1.png',
    sourceRelative:
      'assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png',
    targetPlanId: 'visualAssetPlan.building-hitori-media-os.substack-header-v1',
    expectedSourceBytes: 1331047,
    expectedTargetRelative:
      'assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png',
    expectedTargetBytesAfter: 1331047,
    backupBeforeOverwrite: true,
    reviewNotes:
      'Recovery 2026-05-18: re-approved substack-header-v1 with note-hero-v1/v001.png (master shared source) to restore shared/campaign-hero-v1.png after previous mis-selection overwrote it with substack-inline-reader-system-v1/v001.png. See docs/handoff/0127.',
    // Manifest behaviour: APPEND a new entry. The relativePath here
    // (note-hero-v1/v001.png) is shared with the existing note-hero-v1 → note-hero-v1
    // mapping (manifest entry #2). Visual Register's default findIndex-by-relativePath
    // would overwrite that earlier entry, which would lose the note-hero-v1 history.
    // Master sharing means one candidate is approved under multiple plans, so we
    // explicitly append a new entry instead.
    manifestStrategy: 'append-new',
  },
  {
    name: 'B. Register substack-inline-reader-system-v1',
    sourceRelative:
      'assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png',
    targetPlanId:
      'visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1',
    expectedSourceBytes: 1297423,
    expectedTargetRelative:
      'assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png',
    expectedTargetBytesAfter: 1297423,
    backupBeforeOverwrite: false, // target does not exist yet
    reviewNotes:
      'Recovery 2026-05-18: register substack-inline-reader-system-v1 with v001.png (japanese-editorial-v1, Reader-list funnel, self-rubric 35/35). Previous Visual Register session accidentally bound this candidate to substack-header-v1. See docs/handoff/0127.',
    // Manifest behaviour: REPLACE the existing entry that has this relativePath
    // (currently entry #6 with the wrong suggestedAssetPlanId = substack-header-v1).
    // Overwriting it with the correct mapping is the intended fix.
    manifestStrategy: 'replace-by-relative-path',
  },
]

// ---------- Helpers (replicated verbatim from tools/visual-register/server.mjs) ----------

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function contentSlugFromPlan(plan) {
  const sourceContentIdeaId = plan.sourceContentIdea?._ref || ''
  if (sourceContentIdeaId.startsWith('contentIdea.')) {
    return slugify(sourceContentIdeaId.slice('contentIdea.'.length))
  }
  const prefix = 'visualAssetPlan.'
  if (!plan._id?.startsWith(prefix)) return 'content'
  const rest = plan._id.slice(prefix.length)
  const parts = rest.split('.')
  return slugify(parts[0] || 'content')
}

function assetNameFromPlan(plan) {
  const parts = String(plan._id || '').split('.')
  return slugify(parts[parts.length - 1] || plan.title || 'visual-asset')
}

function placementSlug(placement) {
  const value = String(placement || '').toLowerCase()
  if (value.includes('hero')) return 'hero'
  if (value.includes('hook')) return 'hook'
  if (value.includes('cover')) return 'cover'
  if (value.includes('architecture')) return 'architecture'
  if (value.includes('thumbnail')) return 'thumbnail'
  return slugify(placement || 'visual')
}

function normalizeRelativePath(relativePath) {
  return String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '')
}

function safeProjectPath(relativePath) {
  const normalized = normalizeRelativePath(relativePath)
  const absolute = path.resolve(projectRoot, normalized)
  const rootWithSeparator = projectRoot.endsWith(path.sep)
    ? projectRoot
    : `${projectRoot}${path.sep}`
  if (absolute !== projectRoot && !absolute.startsWith(rootWithSeparator)) {
    throw new Error('Refusing to write outside the project root.')
  }
  return {absolute, relative: path.relative(projectRoot, absolute).replace(/\\/g, '/')}
}

function isInsideInbox(absolute) {
  if (absolute === inboxRoot) return true
  const root = inboxRoot.endsWith(path.sep) ? inboxRoot : `${inboxRoot}${path.sep}`
  return absolute.startsWith(root)
}

function safeInboxPath(relativePath) {
  const target = safeProjectPath(relativePath)
  if (!isInsideInbox(target.absolute)) {
    throw new Error('Refusing to access path outside assets/inbox/generated.')
  }
  return target
}

function slugFromInboxRelativePath(relativePath) {
  const segments = String(relativePath || '').split('/')
  if (
    segments.length < 5 ||
    segments[0] !== 'assets' ||
    segments[1] !== 'inbox' ||
    segments[2] !== 'generated'
  ) {
    return ''
  }
  return segments[3]
}

function expectedAssetPath(plan) {
  if (plan.expectedLocalAssetPath) return normalizeRelativePath(plan.expectedLocalAssetPath)
  const contentSlug = contentSlugFromPlan(plan)
  const platform = slugify(plan.targetPlatform || 'platform')
  const placement = placementSlug(plan.placement)
  const assetName = assetNameFromPlan(plan)
  return `assets/visuals/${contentSlug}/${platform}/${placement}/${assetName}.png`
}

function patchPathFor(plan) {
  const contentSlug = contentSlugFromPlan(plan)
  const assetName = assetNameFromPlan(plan)
  return `patches/visual-assets/${contentSlug}/${assetName}.json`
}

function imageMimeFromExt(ext) {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

async function discoverCampaignSeedFiles() {
  if (!existsSync(seedDir)) return []
  const entries = await readdir(seedDir, {withFileTypes: true})
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith('visual-asset-plan-records-') &&
        !entry.name.startsWith('visual-asset-plan-records-test-') &&
        entry.name.endsWith('.json'),
    )
    .map((entry) => path.join(seedDir, entry.name))
    .sort()
}

async function loadPlans() {
  const seedFiles = [seedPath]
  const campaignSeedFiles = await discoverCampaignSeedFiles()
  seedFiles.push(...campaignSeedFiles)
  const records = []
  for (const filePath of seedFiles) {
    if (!existsSync(filePath)) continue
    try {
      const raw = await readFile(filePath, 'utf8')
      const parsed = JSON.parse(raw)
      records.push(...(Array.isArray(parsed) ? parsed : [parsed]))
    } catch {
      // ignore unreadable seed files
    }
  }
  return records
}

async function loadInboxManifest(slug) {
  const manifestPath = path.join(inboxRoot, slug, inboxManifestFileName)
  const fallback = {contentSlug: slug, updatedAt: '', candidates: []}
  if (!existsSync(manifestPath)) return fallback
  try {
    const raw = await readFile(manifestPath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    if (!Array.isArray(parsed.candidates)) parsed.candidates = []
    parsed.contentSlug = slug
    return parsed
  } catch {
    return fallback
  }
}

async function saveInboxManifest(slug, manifest) {
  const manifestPath = path.join(inboxRoot, slug, inboxManifestFileName)
  const payload = {
    contentSlug: slug,
    updatedAt: new Date().toISOString(),
    candidates: Array.isArray(manifest.candidates) ? manifest.candidates : [],
  }
  await mkdir(path.dirname(manifestPath), {recursive: true})
  await writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`)
  return payload
}

// ---------- planner ----------

function safeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function planOperation(op, plans) {
  const source = safeInboxPath(op.sourceRelative)
  if (!existsSync(source.absolute)) {
    throw new Error(`source does not exist: ${op.sourceRelative}`)
  }
  const sourceStat = await stat(source.absolute)
  if (sourceStat.size !== op.expectedSourceBytes) {
    throw new Error(
      `source byte size mismatch: ${op.sourceRelative} expected ${op.expectedSourceBytes}, got ${sourceStat.size}`,
    )
  }

  const plan = plans.find((p) => p._id === op.targetPlanId)
  if (!plan) throw new Error(`visualAssetPlan not found in seed: ${op.targetPlanId}`)

  const targetPath = safeProjectPath(expectedAssetPath(plan))
  if (targetPath.relative !== op.expectedTargetRelative) {
    throw new Error(
      `target path mismatch: expected ${op.expectedTargetRelative}, got ${targetPath.relative} (derived from plan.expectedLocalAssetPath)`,
    )
  }

  const patchPath = safeProjectPath(patchPathFor(plan))

  const slug = slugFromInboxRelativePath(source.relative)
  if (!slug) {
    throw new Error(`could not derive campaign slug from inbox path: ${source.relative}`)
  }

  const updatedAt = new Date().toISOString()
  const mimeType = imageMimeFromExt(path.extname(source.absolute))
  const reviewNotesValue = [
    'Approved via Visual Register inbox and copied to final local asset path.',
    op.reviewNotes || '',
    plan.reviewNotes || '',
  ]
    .filter(Boolean)
    .join(' ')

  const patch = {
    _id: plan._id,
    set: {
      localAssetPath: targetPath.relative,
      status: 'saved',
      updatedAt,
      reviewNotes: reviewNotesValue,
    },
    meta: {
      generatedBy: 'tools/visual-register/recover-working-pipeline-step-d.mjs',
      inboxSource: source.relative,
      originalFileName: path.basename(source.absolute),
      mimeType,
      directSanityWrite: false,
    },
  }

  const targetExists = existsSync(targetPath.absolute)
  const patchExists = existsSync(patchPath.absolute)

  return {
    op,
    plan,
    source,
    sourceStat,
    targetPath,
    patchPath,
    targetExists,
    patchExists,
    patch,
    slug,
    updatedAt,
  }
}

async function applyOperation(planned, timestamp) {
  const {op, plan, source, targetPath, patchPath, patch, slug, updatedAt} = planned
  const result = {writes: []}

  // 1. Backup target if it exists and backup is requested.
  let backupRelative = null
  if (op.backupBeforeOverwrite && existsSync(targetPath.absolute)) {
    const backupAbs = `${targetPath.absolute}.recovery-backup-${timestamp}`
    backupRelative = path.relative(projectRoot, backupAbs).replace(/\\/g, '/')
    await copyFile(targetPath.absolute, backupAbs)
    result.writes.push({type: 'backup', path: backupRelative})
  }

  // 2. Ensure target dir exists; copy candidate → final.
  await mkdir(path.dirname(targetPath.absolute), {recursive: true})
  await copyFile(source.absolute, targetPath.absolute)
  result.writes.push({
    type: planned.targetExists ? 'overwrite-final' : 'create-final',
    path: targetPath.relative,
  })

  // 3. Write patch JSON (same shape as Visual Register handleInboxApproveAndRegister).
  await mkdir(path.dirname(patchPath.absolute), {recursive: true})
  await writeFile(patchPath.absolute, `${JSON.stringify(patch, null, 2)}\n`)
  result.writes.push({
    type: planned.patchExists ? 'overwrite-patch' : 'create-patch',
    path: patchPath.relative,
  })

  // 4. Update review-manifest.json (same shape as Visual Register).
  const manifest = await loadInboxManifest(slug)
  const candidates = Array.isArray(manifest.candidates) ? manifest.candidates : []
  const idx = candidates.findIndex((entry) => entry.relativePath === source.relative)
  const previous = idx >= 0 ? candidates[idx] : null

  const useExisting = op.manifestStrategy === 'replace-by-relative-path' && previous
  const baseEntry = useExisting ? previous : {}
  const entry = {
    ...baseEntry,
    relativePath: source.relative,
    fileName: path.basename(source.relative),
    suggestedAssetPlanId: plan._id,
    reviewStatus: 'registered',
    reviewNotes: op.reviewNotes || '',
    finalAssetPath: targetPath.relative,
    patchPath: patchPath.relative,
    registeredAt: updatedAt,
    createdAt: useExisting ? previous.createdAt || updatedAt : updatedAt,
    updatedAt,
  }
  if (op.manifestStrategy === 'replace-by-relative-path' && idx >= 0) {
    candidates[idx] = entry
    result.writes.push({type: 'manifest-replace-entry', path: `entry[${idx}]`})
  } else {
    candidates.push(entry)
    result.writes.push({type: 'manifest-append-entry', path: `entry[${candidates.length - 1}]`})
  }
  manifest.candidates = candidates
  await saveInboxManifest(slug, manifest)
  result.writes.push({
    type: 'manifest-saved',
    path: `assets/inbox/generated/${slug}/review-manifest.json`,
  })

  result.entry = entry
  result.backupRelative = backupRelative
  return result
}

// ---------- main ----------

async function main() {
  console.log('=== Working Pipeline Step D — Recovery Tool ===')
  console.log(`Project root: ${projectRoot}`)
  console.log(`Mode: ${isExecute ? 'EXECUTE (will write)' : 'DRY-RUN (no writes)'}`)
  console.log('')

  const plans = await loadPlans()
  console.log(`Loaded ${plans.length} visualAssetPlan records from seed.`)
  console.log('')

  const timestamp = safeTimestamp()
  const planneds = []
  for (const op of OPS) {
    console.log(`--- Plan: ${op.name} ---`)
    let planned
    try {
      planned = await planOperation(op, plans)
    } catch (err) {
      console.error(`  ✗ FAILED to plan: ${err.message}`)
      process.exitCode = 1
      return
    }
    planneds.push(planned)

    console.log(`  source:                    ${planned.source.relative}`)
    console.log(`  source bytes:              ${planned.sourceStat.size} (expected ${op.expectedSourceBytes}) ✓`)
    console.log(`  target plan:               ${planned.plan._id}`)
    console.log(`  target path:               ${planned.targetPath.relative}`)
    console.log(`  target exists now:         ${planned.targetExists}`)
    console.log(`  patch path:                ${planned.patchPath.relative}`)
    console.log(`  patch exists now:          ${planned.patchExists}`)
    console.log(`  manifest strategy:         ${op.manifestStrategy}`)
    if (op.backupBeforeOverwrite && planned.targetExists) {
      console.log(`  backup before overwrite:   ${planned.targetPath.relative}.recovery-backup-${timestamp}`)
    } else {
      console.log(`  backup before overwrite:   (none — target does not exist, or backup not requested)`)
    }
    console.log(`  patch.set.localAssetPath:        ${planned.patch.set.localAssetPath}`)
    console.log(`  patch.set.status:                ${planned.patch.set.status}`)
    console.log(`  patch.set.updatedAt:             ${planned.patch.set.updatedAt}`)
    console.log(`  patch.meta.inboxSource:          ${planned.patch.meta.inboxSource}`)
    console.log(`  patch.meta.originalFileName:     ${planned.patch.meta.originalFileName}`)
    console.log(`  patch.meta.mimeType:             ${planned.patch.meta.mimeType}`)
    console.log(`  patch.meta.directSanityWrite:    ${planned.patch.meta.directSanityWrite}`)
    console.log(`  patch.meta.generatedBy:          ${planned.patch.meta.generatedBy}`)
    console.log('')
  }

  if (isDryRun) {
    console.log('=== DRY-RUN complete. No files were written. ===')
    console.log('To execute, re-run with --execute.')
    return
  }

  console.log('=== EXECUTING ===')
  for (const planned of planneds) {
    console.log(`\nApplying: ${planned.op.name}`)
    const result = await applyOperation(planned, timestamp)
    for (const w of result.writes) {
      console.log(`  • ${w.type}: ${w.path}`)
    }
    // Post-verify byte size
    const targetStat = await stat(planned.targetPath.absolute)
    const expected = planned.op.expectedTargetBytesAfter
    if (targetStat.size === expected) {
      console.log(`  ✓ target byte size: ${targetStat.size} (matches expected ${expected})`)
    } else {
      console.log(`  ⚠ target byte size: ${targetStat.size} (expected ${expected})`)
      process.exitCode = 1
    }
  }
  console.log('\n=== EXECUTE complete. ===')
  console.log('Next step: re-run publish-package --dry-run, then proceed to Sanity Studio manual reflection (docs/handoff/0127 §9).')
}

main().catch((err) => {
  console.error('FATAL:', err instanceof Error ? err.message : String(err))
  process.exitCode = 1
})
