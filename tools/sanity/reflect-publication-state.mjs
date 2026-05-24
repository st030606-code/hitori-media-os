#!/usr/bin/env node
// tools/sanity/reflect-publication-state.mjs
//
// One-off controlled Sanity write tool for building-hitori-media-os
// publication state reflection (post manual publishing).
//
// Reflects:
//   - campaignPlan.building-hitori-media-os.manualPublishingStatus
//       X / note / Substack → state: done + publishedUrl + publishedAt
//       Threads             → state: not-started
//   - substackPostPlan.building-hitori-media-os.publishedUrl (if doc exists)
//   - contentIdea.building-hitori-media-os.outputChecklist[ entries
//       matching outputType in {x-post, note-article, substack-post} ]
//       → publishedUrl (only when a SINGLE unambiguous entry matches)
//
// Does NOT touch:
//   - reactionNotes (deferred until reactions arrive)
//   - substackGrowthAction.resultNotes (deferred)
//   - any platform other than X / Threads / note / Substack
//   - any document outside the 3 hardcoded _ids below
//
// Safety model (mirrors tools/sanity/reflect-working-pipeline-visual-assets.mjs)
//   1. Default mode: --dry-run (no writes). Use --execute to commit.
//   2. Hardcoded _id allowlist (3 docs max). No GROQ-driven bulk update.
//   3. Read every target by _id and validate _type before any write.
//   4. Refuse to proceed if planned change is ambiguous (e.g. duplicate
//      outputChecklist entries for the same outputType).
//   5. Use a single client.transaction() so all patches commit atomically.
//   6. Never logs token values.
//
// Required env (loaded from .env.local at repo root and dashboard/.env.local):
//   - SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID)
//   - SANITY_STUDIO_DATASET    (or NEXT_PUBLIC_SANITY_DATASET; defaults to 'production')
//   - SANITY_READ_TOKEN        (optional for public dataset; required for --dry-run if private)
//   - SANITY_WRITE_TOKEN       (required for --execute; not used in --dry-run)
//
// Usage:
//   Dry-run (default):
//     node tools/sanity/reflect-publication-state.mjs --dry-run
//   Execute:
//     node tools/sanity/reflect-publication-state.mjs --execute

import {createClient} from '@sanity/client'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import crypto from 'node:crypto'

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
  console.error('FATAL: SANITY_STUDIO_PROJECT_ID is missing.')
  process.exitCode = 1
  process.exit()
}

// ---------- Allowlist & input data (hardcoded) ----------

const CAMPAIGN_ID = 'campaignPlan.building-hitori-media-os'
const CONTENT_IDEA_ID = 'contentIdea.building-hitori-media-os'
const SUBSTACK_POST_PLAN_ID = 'substackPostPlan.building-hitori-media-os'

const ALL_IDS = [CAMPAIGN_ID, CONTENT_IDEA_ID, SUBSTACK_POST_PLAN_ID]

// Source of truth comes from
//   publish-packages/campaigns/building-hitori-media-os-release-review/
//     final-human-checklist.md (Publication Log Snapshot)
// and matches each platform's *-final-review.md.
const PUBLICATION_INPUTS = [
  {
    platform: 'x',
    outputType: 'x-post',
    state: 'done',
    publishedUrl: 'https://x.com/potablenx/status/2056534823737720925',
    publishedAt: '2026-05-19T09:38:00+09:00',
  },
  {
    platform: 'note',
    outputType: 'note-article',
    state: 'done',
    publishedUrl: 'https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb',
    publishedAt: '2026-05-19T09:57:00+09:00',
  },
  {
    platform: 'substack',
    outputType: 'substack-post',
    state: 'done',
    publishedUrl: 'https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os',
    publishedAt: '2026-05-19T09:57:00+09:00',
  },
  {
    platform: 'threads',
    outputType: 'threads-thread',
    state: 'not-started',
    publishedUrl: null,
    publishedAt: null,
  },
]

const PLATFORMS = PUBLICATION_INPUTS.map((p) => p.platform)

// ---------- helpers ----------

function fmt(value) {
  if (value === undefined) return '(unset)'
  if (value === null) return '(null)'
  if (value === '') return '""'
  if (typeof value === 'string' && value.length > 80) return value.slice(0, 80) + '…'
  return JSON.stringify(value)
}

function newKey() {
  // Sanity expects an _key for each array item; use a short hex token.
  return crypto.randomBytes(6).toString('hex')
}

// ---------- main ----------

async function main() {
  console.log('=== Publication State Sanity Reflection ===')
  console.log(`Project root:      ${projectRoot}`)
  console.log(`Sanity project:    ${projectId}`)
  console.log(`Sanity dataset:    ${dataset}`)
  console.log(`Sanity apiVersion: ${apiVersion}`)
  console.log(`Read token:        ${readToken ? '(present, ' + readToken.length + ' chars)' : '(not present)'}`)
  console.log(`Write token:       ${writeToken ? '(present, ' + writeToken.length + ' chars)' : '(not present)'}`)
  console.log(`Mode:              ${isExecute ? 'EXECUTE (will write to Sanity)' : 'DRY-RUN (no writes)'}`)
  console.log('')

  if (isExecute && !writeToken) {
    console.error('FATAL: SANITY_WRITE_TOKEN is required for --execute mode and is not present.')
    console.error('')
    console.error('How to obtain a write token:')
    console.error('  1. Go to https://www.sanity.io/manage')
    console.error(`  2. Select your project (id: ${projectId})`)
    console.error('  3. API → Tokens → Add API token')
    console.error('  4. Name it "publication-state-reflect" (or similar)')
    console.error('  5. Permission: Editor (sufficient for campaignPlan / contentIdea / substackPostPlan patches)')
    console.error('  6. Copy the token (shown ONCE)')
    console.error('  7. Add to .env.local at repo root:')
    console.error('     SANITY_WRITE_TOKEN=<paste token here>')
    console.error('  8. Re-run: node tools/sanity/reflect-publication-state.mjs --execute')
    console.error('')
    console.error('Note: this token grants write access. Treat it as a secret.')
    console.error('      Never commit .env.local. The repo .gitignore already excludes it.')
    process.exitCode = 1
    return
  }

  // ---------- Sanity read ----------

  console.log('--- Sanity read (read-only, fetching 3 targets by _id) ---')
  const readClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: readToken || undefined,
    perspective: 'published',
  })

  let docs
  try {
    docs = await readClient.fetch('*[_id in $ids]{...}', {ids: ALL_IDS})
  } catch (err) {
    console.error('FATAL: Sanity read failed:', err instanceof Error ? err.message : String(err))
    process.exitCode = 1
    return
  }
  const byId = new Map(docs.map((d) => [d._id, d]))

  const campaign = byId.get(CAMPAIGN_ID)
  const contentIdea = byId.get(CONTENT_IDEA_ID)
  const substackPlan = byId.get(SUBSTACK_POST_PLAN_ID)

  if (!campaign) {
    console.error(`FATAL: missing required doc: ${CAMPAIGN_ID}`)
    process.exitCode = 1
    return
  }
  if (campaign._type !== 'campaignPlan') {
    console.error(`FATAL: ${CAMPAIGN_ID} has wrong _type: ${campaign._type}`)
    process.exitCode = 1
    return
  }
  console.log(`  ✓ ${CAMPAIGN_ID} (_type: ${campaign._type})`)

  if (contentIdea && contentIdea._type !== 'contentIdea') {
    console.error(`FATAL: ${CONTENT_IDEA_ID} has wrong _type: ${contentIdea._type}`)
    process.exitCode = 1
    return
  }
  console.log(`  ${contentIdea ? '✓' : '○'} ${CONTENT_IDEA_ID} ${contentIdea ? `(_type: ${contentIdea._type})` : '(not present — will skip outputChecklist update)'}`)

  if (substackPlan && substackPlan._type !== 'substackPostPlan') {
    console.error(`FATAL: ${SUBSTACK_POST_PLAN_ID} has wrong _type: ${substackPlan._type}`)
    process.exitCode = 1
    return
  }
  console.log(`  ${substackPlan ? '✓' : '○'} ${SUBSTACK_POST_PLAN_ID} ${substackPlan ? `(_type: ${substackPlan._type})` : '(not present — will skip publishedUrl update)'}`)

  console.log('')

  // ---------- Plan: campaignPlan.manualPublishingStatus ----------

  console.log('--- Plan A: campaignPlan.manualPublishingStatus ---')
  const existingMps = Array.isArray(campaign.manualPublishingStatus)
    ? campaign.manualPublishingStatus
    : []
  console.log(`  current array length: ${existingMps.length}`)
  for (const item of existingMps) {
    console.log(
      `    - [${item._key ?? '(no _key)'}] platform=${fmt(item.platform)} state=${fmt(item.state)} ` +
        `publishedUrl=${fmt(item.publishedUrl)} publishedAt=${fmt(item.publishedAt)} ` +
        `reactionNotes=${fmt(item.reactionNotes)}`,
    )
  }

  // Detect ambiguity: more than one entry per platform.
  const ambiguityErrors = []
  const platformToEntries = new Map()
  for (const item of existingMps) {
    if (!item.platform) continue
    if (!platformToEntries.has(item.platform)) platformToEntries.set(item.platform, [])
    platformToEntries.get(item.platform).push(item)
  }
  for (const platform of PLATFORMS) {
    const matches = platformToEntries.get(platform) ?? []
    if (matches.length > 1) {
      ambiguityErrors.push(
        `Platform "${platform}" has ${matches.length} entries in manualPublishingStatus. Refuse to patch (ambiguous).`,
      )
    }
  }

  // Detect "keyless seed" case: ALL existing entries lack _key, AND each
  // entry's only meaningful field beyond platform/state is empty.
  // Boss-confirmed safe-replace branch (see handoff 0137 / Q&A 2026-05-19):
  // we replace the entire array with 4 new items that include generated _key
  // + state/url/at per PUBLICATION_INPUTS. We do NOT enter this branch if
  // any existing item has non-empty publishedUrl / publishedAt / reactionNotes.
  const allKeyless = existingMps.length > 0 && existingMps.every((it) => !it._key)
  const allEmptyBeyondPlatformState = existingMps.every(
    (it) =>
      !it.publishedUrl &&
      !it.publishedAt &&
      !it.reactionNotes &&
      (it.state === 'not-started' || !it.state),
  )
  const existingPlatforms = new Set(existingMps.map((it) => it.platform).filter(Boolean))
  const platformsMatchExpected =
    existingMps.length === PLATFORMS.length &&
    PLATFORMS.every((p) => existingPlatforms.has(p))

  let replaceArrayMode = false
  if (
    allKeyless &&
    allEmptyBeyondPlatformState &&
    platformsMatchExpected &&
    ambiguityErrors.length === 0
  ) {
    replaceArrayMode = true
    console.log(
      `  Detected keyless-seed case: all ${existingMps.length} entries lack _key, all fields beyond platform/state are empty, ` +
        `and platforms match expected set. Will REPLACE the entire array with new items (boss-confirmed).`,
    )
  }

  // Build patch operations for the campaign doc.
  const campaignPatchSet = {}
  const campaignAppendItems = []
  const campaignReplaceArray = []
  const campaignPlanSummary = []

  if (replaceArrayMode) {
    // Build the full new array, ordered to match PUBLICATION_INPUTS.
    for (const input of PUBLICATION_INPUTS) {
      const before = (platformToEntries.get(input.platform) ?? [])[0] ?? null
      const newItem = {
        _key: newKey(),
        _type: 'object',
        platform: input.platform,
        state: input.state,
      }
      if (input.publishedUrl !== null) newItem.publishedUrl = input.publishedUrl
      if (input.publishedAt !== null) newItem.publishedAt = input.publishedAt
      campaignReplaceArray.push(newItem)
      campaignPlanSummary.push({
        platform: input.platform,
        action: 'replace-array-item',
        key: newItem._key,
        before: before
          ? {state: before.state, publishedUrl: before.publishedUrl, publishedAt: before.publishedAt}
          : null,
        after: {
          state: input.state,
          publishedUrl: input.publishedUrl,
          publishedAt: input.publishedAt,
        },
      })
    }
  } else {
    for (const input of PUBLICATION_INPUTS) {
      const matches = platformToEntries.get(input.platform) ?? []
      if (matches.length > 1) {
        // Already captured in ambiguityErrors above. Skip planning.
        continue
      }
      const before = matches[0]
      if (before) {
        // Update existing item by _key. Only set the fields we control.
        const key = before._key
        if (!key) {
          ambiguityErrors.push(
            `Platform "${input.platform}" entry has no _key — cannot safely patch.`,
          )
          continue
        }
        campaignPatchSet[`manualPublishingStatus[_key=="${key}"].state`] = input.state
        if (input.publishedUrl !== null) {
          campaignPatchSet[`manualPublishingStatus[_key=="${key}"].publishedUrl`] = input.publishedUrl
        }
        if (input.publishedAt !== null) {
          campaignPatchSet[`manualPublishingStatus[_key=="${key}"].publishedAt`] = input.publishedAt
        }
        campaignPlanSummary.push({
          platform: input.platform,
          action: 'patch-existing',
          key,
          before: {
            state: before.state,
            publishedUrl: before.publishedUrl,
            publishedAt: before.publishedAt,
          },
          after: {
            state: input.state,
            publishedUrl: input.publishedUrl,
            publishedAt: input.publishedAt,
          },
        })
      } else {
        // Append new item with a generated _key.
        const newItem = {
          _key: newKey(),
          _type: 'object',
          platform: input.platform,
          state: input.state,
        }
        if (input.publishedUrl !== null) newItem.publishedUrl = input.publishedUrl
        if (input.publishedAt !== null) newItem.publishedAt = input.publishedAt
        campaignAppendItems.push(newItem)
        campaignPlanSummary.push({
          platform: input.platform,
          action: 'append-new',
          key: newItem._key,
          before: null,
          after: {
            state: input.state,
            publishedUrl: input.publishedUrl,
            publishedAt: input.publishedAt,
          },
        })
      }
    }
  }

  console.log('')
  console.log('  Planned campaignPlan changes:')
  for (const s of campaignPlanSummary) {
    if (s.action === 'patch-existing') {
      console.log(`    ✎ ${s.platform} (key=${s.key})`)
      console.log(`        state:        ${fmt(s.before.state)} → ${fmt(s.after.state)}`)
      console.log(`        publishedUrl: ${fmt(s.before.publishedUrl)} → ${fmt(s.after.publishedUrl)}`)
      console.log(`        publishedAt:  ${fmt(s.before.publishedAt)} → ${fmt(s.after.publishedAt)}`)
    } else if (s.action === 'replace-array-item') {
      console.log(`    ⟳ ${s.platform} (new _key=${s.key}, array-replace mode)`)
      const before = s.before ?? {state: '(none)', publishedUrl: '(none)', publishedAt: '(none)'}
      console.log(`        state:        ${fmt(before.state)} → ${fmt(s.after.state)}`)
      console.log(`        publishedUrl: ${fmt(before.publishedUrl)} → ${fmt(s.after.publishedUrl)}`)
      console.log(`        publishedAt:  ${fmt(before.publishedAt)} → ${fmt(s.after.publishedAt)}`)
    } else {
      console.log(`    + ${s.platform} (new _key=${s.key})`)
      console.log(`        state:        (no entry) → ${fmt(s.after.state)}`)
      console.log(`        publishedUrl: (no entry) → ${fmt(s.after.publishedUrl)}`)
      console.log(`        publishedAt:  (no entry) → ${fmt(s.after.publishedAt)}`)
    }
  }
  if (replaceArrayMode) {
    console.log('')
    console.log(`  Replace mode: existing array (${existingMps.length} items, all keyless) will be REPLACED with new ${campaignReplaceArray.length}-item array.`)
    console.log(`  Note: no existing reactionNotes are lost (all were empty pre-replace, verified above).`)
  }
  console.log('')

  // ---------- Plan: substackPostPlan.publishedUrl ----------

  console.log('--- Plan B: substackPostPlan.publishedUrl ---')
  let substackPlanPatch = null
  if (substackPlan) {
    const before = substackPlan.publishedUrl
    const target = PUBLICATION_INPUTS.find((p) => p.platform === 'substack')
    const after = target?.publishedUrl ?? null
    console.log(`  before: ${fmt(before)}`)
    console.log(`  after:  ${fmt(after)}`)
    if (before === after) {
      console.log('  (no change required)')
    } else {
      substackPlanPatch = {publishedUrl: after}
    }
  } else {
    console.log('  (skip — substackPostPlan doc not present)')
  }
  console.log('')

  // ---------- Plan: contentIdea.outputChecklist ----------

  console.log('--- Plan C: contentIdea.outputChecklist[].publishedUrl ---')
  const contentIdeaPatchSet = {}
  const contentIdeaSummary = []
  let contentIdeaAmbiguity = []
  if (contentIdea) {
    const checklist = Array.isArray(contentIdea.outputChecklist) ? contentIdea.outputChecklist : []
    console.log(`  current array length: ${checklist.length}`)
    for (const it of checklist) {
      console.log(
        `    - [${it._key ?? '(no _key)'}] outputType=${fmt(it.outputType)} status=${fmt(it.status)} ` +
          `publishedUrl=${fmt(it.publishedUrl)}`,
      )
    }
    // Only update non-pending platforms.
    const updateTargets = PUBLICATION_INPUTS.filter((p) => p.publishedUrl !== null)
    const outputTypeToEntries = new Map()
    for (const it of checklist) {
      if (!it.outputType) continue
      if (!outputTypeToEntries.has(it.outputType)) outputTypeToEntries.set(it.outputType, [])
      outputTypeToEntries.get(it.outputType).push(it)
    }
    for (const target of updateTargets) {
      const matches = outputTypeToEntries.get(target.outputType) ?? []
      if (matches.length === 0) {
        contentIdeaSummary.push({outputType: target.outputType, action: 'skip-no-match', reason: 'no matching outputChecklist entry'})
        continue
      }
      if (matches.length > 1) {
        contentIdeaAmbiguity.push(
          `outputType "${target.outputType}" has ${matches.length} entries — refuse to patch (ambiguous).`,
        )
        contentIdeaSummary.push({outputType: target.outputType, action: 'skip-ambiguous', count: matches.length})
        continue
      }
      const entry = matches[0]
      if (!entry._key) {
        contentIdeaAmbiguity.push(
          `outputType "${target.outputType}" entry has no _key — cannot safely patch.`,
        )
        contentIdeaSummary.push({outputType: target.outputType, action: 'skip-no-key'})
        continue
      }
      if (entry.publishedUrl === target.publishedUrl) {
        contentIdeaSummary.push({
          outputType: target.outputType,
          action: 'no-change',
          key: entry._key,
          publishedUrl: entry.publishedUrl,
        })
        continue
      }
      contentIdeaPatchSet[`outputChecklist[_key=="${entry._key}"].publishedUrl`] = target.publishedUrl
      contentIdeaSummary.push({
        outputType: target.outputType,
        action: 'patch-existing',
        key: entry._key,
        before: entry.publishedUrl,
        after: target.publishedUrl,
      })
    }
  } else {
    console.log('  (skip — contentIdea doc not present)')
  }

  console.log('')
  console.log('  Planned contentIdea changes:')
  if (!contentIdea) {
    console.log('    (none)')
  } else if (contentIdeaSummary.length === 0) {
    console.log('    (none — no matching outputChecklist entries for x-post / note-article / substack-post)')
  } else {
    for (const s of contentIdeaSummary) {
      if (s.action === 'patch-existing') {
        console.log(`    ✎ ${s.outputType} (key=${s.key})`)
        console.log(`        publishedUrl: ${fmt(s.before)} → ${fmt(s.after)}`)
      } else if (s.action === 'no-change') {
        console.log(`    = ${s.outputType} (key=${s.key}) publishedUrl already ${fmt(s.publishedUrl)}`)
      } else if (s.action === 'skip-no-match') {
        console.log(`    ↪ ${s.outputType} — skipped (no matching entry)`)
      } else if (s.action === 'skip-ambiguous') {
        console.log(`    ✗ ${s.outputType} — skipped (${s.count} matching entries, ambiguous)`)
      } else if (s.action === 'skip-no-key') {
        console.log(`    ✗ ${s.outputType} — skipped (entry has no _key)`)
      }
    }
  }
  console.log('')

  // ---------- Ambiguity gate ----------

  const allAmbiguity = [...ambiguityErrors, ...contentIdeaAmbiguity]
  if (allAmbiguity.length > 0) {
    console.error('FATAL: ambiguity detected. Refusing to write.')
    for (const e of allAmbiguity) console.error(`  - ${e}`)
    process.exitCode = 1
    return
  }

  // ---------- Summary ----------

  console.log('--- Plan summary ---')
  console.log(
    `  campaignPlan:        ${campaignPlanSummary.length} platform entries planned ` +
      `(${campaignAppendItems.length} new, ${Object.keys(campaignPatchSet).length / 3} updates ≈ key·field count)`,
  )
  console.log(`  substackPostPlan:    ${substackPlanPatch ? '1 publishedUrl change' : 'no change / missing'}`)
  console.log(
    `  contentIdea:         ${contentIdeaSummary.filter((s) => s.action === 'patch-existing').length} outputChecklist publishedUrl change(s) ` +
      `(${contentIdeaSummary.filter((s) => s.action.startsWith('skip-')).length} skipped, ` +
      `${contentIdeaSummary.filter((s) => s.action === 'no-change').length} no-change)`,
  )
  console.log(`  reactionNotes:       (deferred — NOT touched)`)
  console.log(`  resultNotes:         (deferred — NOT touched)`)
  console.log(`  unrelated docs:      0 (allowlist enforced)`)
  console.log('')

  if (isDryRun) {
    console.log('=== DRY-RUN complete. No Sanity writes performed. ===')
    console.log('To execute: ensure SANITY_WRITE_TOKEN is in .env.local and re-run with --execute.')
    return
  }

  // ---------- Execute ----------

  console.log('=== EXECUTING Sanity transaction (atomic) ===')
  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
  })
  const tx = writeClient.transaction()

  // campaignPlan: 3 mutually-exclusive branches per the planning phase:
  //   (a) replaceArrayMode → `.set({manualPublishingStatus: [4 new items]})`
  //   (b) patch-existing/append by _key, when entries already have keys
  //   (c) no-op (nothing planned)
  const campaignSetKeys = Object.keys(campaignPatchSet)
  if (replaceArrayMode) {
    tx.patch(writeClient.patch(CAMPAIGN_ID).set({manualPublishingStatus: campaignReplaceArray}))
  } else if (campaignSetKeys.length > 0 || campaignAppendItems.length > 0) {
    let cp = writeClient.patch(CAMPAIGN_ID)
    if (campaignSetKeys.length > 0) cp = cp.set(campaignPatchSet)
    if (campaignAppendItems.length > 0) {
      cp = cp.setIfMissing({manualPublishingStatus: []}).insert(
        'after',
        'manualPublishingStatus[-1]',
        campaignAppendItems,
      )
    }
    tx.patch(cp)
  }

  // substackPostPlan: simple set.
  if (substackPlanPatch) {
    tx.patch(writeClient.patch(SUBSTACK_POST_PLAN_ID).set(substackPlanPatch))
  }

  // contentIdea: patch existing array items by _key (set).
  const contentIdeaKeys = Object.keys(contentIdeaPatchSet)
  if (contentIdeaKeys.length > 0) {
    tx.patch(writeClient.patch(CONTENT_IDEA_ID).set(contentIdeaPatchSet))
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

  console.log('--- Post-write verification (re-read targets) ---')
  const afterDocs = await readClient.fetch('*[_id in $ids]{...}', {ids: ALL_IDS})
  const afterById = new Map(afterDocs.map((d) => [d._id, d]))
  const afterCampaign = afterById.get(CAMPAIGN_ID)
  const afterContentIdea = afterById.get(CONTENT_IDEA_ID)
  const afterSubstackPlan = afterById.get(SUBSTACK_POST_PLAN_ID)

  let verifyOk = true

  // Verify campaignPlan
  const afterMps = Array.isArray(afterCampaign?.manualPublishingStatus)
    ? afterCampaign.manualPublishingStatus
    : []
  for (const input of PUBLICATION_INPUTS) {
    const entry = afterMps.find((it) => it.platform === input.platform)
    if (!entry) {
      console.error(`  ✗ campaignPlan.manualPublishingStatus[platform=${input.platform}] not found after write`)
      verifyOk = false
      continue
    }
    if (entry.state !== input.state) {
      console.error(
        `  ✗ campaignPlan.${input.platform}: state mismatch (got ${entry.state}, expected ${input.state})`,
      )
      verifyOk = false
      continue
    }
    if (input.publishedUrl !== null && entry.publishedUrl !== input.publishedUrl) {
      console.error(
        `  ✗ campaignPlan.${input.platform}: publishedUrl mismatch (got ${entry.publishedUrl}, expected ${input.publishedUrl})`,
      )
      verifyOk = false
      continue
    }
    if (input.publishedAt !== null && entry.publishedAt !== input.publishedAt) {
      console.error(
        `  ✗ campaignPlan.${input.platform}: publishedAt mismatch (got ${entry.publishedAt}, expected ${input.publishedAt})`,
      )
      verifyOk = false
      continue
    }
    console.log(
      `  ✓ campaignPlan.${input.platform.padEnd(8)} state=${entry.state}` +
        (entry.publishedUrl ? ` url=${entry.publishedUrl.slice(0, 60)}…` : ''),
    )
  }

  // Verify substackPostPlan
  if (substackPlanPatch && afterSubstackPlan) {
    if (afterSubstackPlan.publishedUrl !== substackPlanPatch.publishedUrl) {
      console.error(
        `  ✗ substackPostPlan.publishedUrl mismatch (got ${afterSubstackPlan.publishedUrl}, expected ${substackPlanPatch.publishedUrl})`,
      )
      verifyOk = false
    } else {
      console.log(`  ✓ substackPostPlan.publishedUrl = ${afterSubstackPlan.publishedUrl.slice(0, 60)}…`)
    }
  }

  // Verify contentIdea outputChecklist entries
  if (afterContentIdea) {
    const afterChecklist = Array.isArray(afterContentIdea.outputChecklist)
      ? afterContentIdea.outputChecklist
      : []
    for (const s of contentIdeaSummary) {
      if (s.action !== 'patch-existing') continue
      const entry = afterChecklist.find((it) => it._key === s.key)
      if (!entry) {
        console.error(`  ✗ contentIdea.outputChecklist[_key=${s.key}] not found after write`)
        verifyOk = false
        continue
      }
      if (entry.publishedUrl !== s.after) {
        console.error(
          `  ✗ contentIdea.outputChecklist[${s.outputType}]: publishedUrl mismatch (got ${entry.publishedUrl}, expected ${s.after})`,
        )
        verifyOk = false
        continue
      }
      console.log(`  ✓ contentIdea.outputChecklist[${s.outputType}].publishedUrl set`)
    }
  }

  // Verify reactionNotes were NOT modified (sanity check on hard rule).
  for (const item of afterMps) {
    // We never wrote reactionNotes, so the post-write state should match
    // what we read pre-write for matched _key items.
    const beforeItem = existingMps.find((b) => b._key === item._key)
    if (beforeItem && beforeItem.reactionNotes !== item.reactionNotes) {
      console.error(
        `  ✗ HARD RULE VIOLATION: reactionNotes changed for platform=${item.platform} key=${item._key}`,
      )
      verifyOk = false
    }
  }

  if (!verifyOk) {
    console.error('')
    console.error('FATAL: post-write verification failed. Some fields may not match the intended state.')
    process.exitCode = 1
    return
  }

  console.log('')
  console.log('=== EXECUTE complete. All targets verified. ===')
  console.log(`transactionId: ${txResult?.transactionId}`)
}

main().catch((err) => {
  console.error('FATAL:', err instanceof Error ? err.message : String(err))
  process.exitCode = 1
})
