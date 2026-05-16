import {createServer} from 'node:http'
import {copyFile, readFile, writeFile, mkdir, readdir} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const publicDir = path.join(__dirname, 'public')
const seedPath = path.join(projectRoot, 'seed/visual-asset-plan-records.json')
const seedDir = path.join(projectRoot, 'seed')
const visualPatchDir = path.join(projectRoot, 'patches/visual-assets')
const inboxRoot = path.join(projectRoot, 'assets/inbox/generated')
const inboxManifestFileName = 'review-manifest.json'
const validReviewStatuses = new Set([
  'candidate',
  'approved',
  'rejected',
  'needs-regeneration',
  'registered',
])
const inboxImageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
const host = process.env.VISUAL_REGISTER_HOST || '127.0.0.1'
const port = Number(process.env.VISUAL_REGISTER_PORT || 3334)
const includeTestSeeds = process.env.VISUAL_REGISTER_INCLUDE_TEST_SEEDS === 'true'
const maxJsonBytes = 35 * 1024 * 1024

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
])

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body, null, 2))
}

function sendText(res, status, message) {
  res.writeHead(status, {'content-type': 'text/plain; charset=utf-8'})
  res.end(message)
}

function sendApiNotFound(res, pathname) {
  return sendJson(res, 404, {
    ok: false,
    error: 'Not found',
    path: pathname,
  })
}

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
  const rootWithSeparator = projectRoot.endsWith(path.sep) ? projectRoot : `${projectRoot}${path.sep}`
  if (absolute !== projectRoot && !absolute.startsWith(rootWithSeparator)) {
    throw new Error('Refusing to write outside the project root.')
  }
  return {absolute, relative: path.relative(projectRoot, absolute).replace(/\\/g, '/')}
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

async function listJsonFiles(directory) {
  if (!existsSync(directory)) return []
  const entries = await readdir(directory, {withFileTypes: true})
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) return listJsonFiles(absolute)
      if (entry.isFile() && entry.name.endsWith('.json')) return [absolute]
      return []
    }),
  )
  return files.flat().sort()
}

async function discoverTestSeedFiles() {
  if (!existsSync(seedDir)) return []
  const entries = await readdir(seedDir, {withFileTypes: true})
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith('visual-asset-plan-records-test-') &&
        entry.name.endsWith('.json'),
    )
    .map((entry) => path.join(seedDir, entry.name))
    .sort()
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

async function listInboxCampaignSlugs() {
  if (!existsSync(inboxRoot)) return []
  const entries = await readdir(inboxRoot, {withFileTypes: true})
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

async function listInboxImageFiles(slug) {
  const slugDir = path.join(inboxRoot, slug)
  if (!existsSync(slugDir)) return []
  const results = []
  async function walk(dir) {
    const entries = await readdir(dir, {withFileTypes: true})
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(absolute)
        continue
      }
      if (!entry.isFile()) continue
      if (!inboxImageExtensions.has(path.extname(entry.name).toLowerCase())) continue
      results.push(absolute)
    }
  }
  await walk(slugDir)
  return results.sort()
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

function suggestAssetPlanId(fileName, slug, plans) {
  const lower = String(fileName || '').toLowerCase()
  const candidates = plans.filter((plan) => contentSlugFromPlan(plan) === slug)
  for (const plan of candidates) {
    const assetName = assetNameFromPlan(plan).toLowerCase()
    if (assetName && lower.includes(assetName)) return plan._id
  }
  return null
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

async function listInboxCandidates(slugFilter, plans) {
  const allSlugs = await listInboxCampaignSlugs()
  const slugs = slugFilter ? allSlugs.filter((s) => s === slugFilter) : allSlugs
  const result = []

  for (const slug of slugs) {
    const files = await listInboxImageFiles(slug)
    const manifest = await loadInboxManifest(slug)
    const manifestMap = new Map(
      (manifest.candidates || []).map((entry) => [entry.relativePath, entry]),
    )

    for (const absolute of files) {
      const relativePath = path.relative(projectRoot, absolute).replace(/\\/g, '/')
      const fileName = path.basename(absolute)
      const stored = manifestMap.get(relativePath)
      const suggestedAssetPlanId =
        stored?.suggestedAssetPlanId || suggestAssetPlanId(fileName, slug, plans)
      const plan = suggestedAssetPlanId
        ? plans.find((p) => p._id === suggestedAssetPlanId) || null
        : null
      const expectedFinalPath = plan ? expectedAssetPath(plan) : null
      const expectedFinalExists = expectedFinalPath
        ? existsSync(safeProjectPath(expectedFinalPath).absolute)
        : false

      result.push({
        contentSlug: slug,
        relativePath,
        fileName,
        suggestedAssetPlanId: suggestedAssetPlanId || '',
        reviewStatus: stored?.reviewStatus || 'candidate',
        reviewNotes: stored?.reviewNotes || '',
        expectedFinalPath: expectedFinalPath || '',
        expectedFinalExists,
        finalAssetPath: stored?.finalAssetPath || '',
        patchPath: stored?.patchPath || '',
        registeredAt: stored?.registeredAt || '',
        createdAt: stored?.createdAt || '',
        updatedAt: stored?.updatedAt || '',
      })
    }
  }

  return result
}

function relativeProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/')
}

function containsSecretLikeValue(value) {
  const raw = JSON.stringify(value || {})
  return /(?:sk-[A-Za-z0-9_-]{20,}|api[_-]?key|secret|token|credential)/i.test(raw)
}

function validatePatch(patch) {
  const validation = {
    validJson: true,
    hasDocumentId: Boolean(patch?._id),
    hasSet: Boolean(patch?.set && typeof patch.set === 'object'),
    hasLocalAssetPath: Boolean(patch?.set?.localAssetPath),
    hasStatus: Boolean(patch?.set?.status),
    hasUpdatedAt: Boolean(patch?.set?.updatedAt),
    hasReviewNotes: Boolean(patch?.set?.reviewNotes),
    safeLocalAssetPath: false,
    localAssetPathExists: false,
    directSanityWrite: patch?.meta?.directSanityWrite === true,
    hasSecretLikeValue: containsSecretLikeValue(patch),
  }

  if (patch?.set?.localAssetPath) {
    try {
      const assetPath = safeProjectPath(patch.set.localAssetPath)
      validation.safeLocalAssetPath = true
      validation.localAssetPathExists = existsSync(assetPath.absolute)
    } catch {
      validation.safeLocalAssetPath = false
      validation.localAssetPathExists = false
    }
  }

  validation.ok =
    validation.validJson &&
    validation.hasDocumentId &&
    validation.hasSet &&
    validation.hasLocalAssetPath &&
    validation.hasStatus &&
    validation.hasUpdatedAt &&
    validation.hasReviewNotes &&
    validation.safeLocalAssetPath &&
    validation.localAssetPathExists &&
    !validation.directSanityWrite &&
    !validation.hasSecretLikeValue

  return validation
}

async function loadVisualPatches() {
  const files = await listJsonFiles(visualPatchDir)
  const patchRoot = visualPatchDir.endsWith(path.sep) ? visualPatchDir : `${visualPatchDir}${path.sep}`

  return Promise.all(
    files.map(async (absolute) => {
      if (!absolute.startsWith(patchRoot)) {
        return {
          filePath: path.relative(projectRoot, absolute).replace(/\\/g, '/'),
          error: 'Patch file is outside the visual patch directory.',
          validation: {validJson: false, ok: false},
        }
      }

      const filePath = path.relative(projectRoot, absolute).replace(/\\/g, '/')
      try {
        const patch = JSON.parse(await readFile(absolute, 'utf8'))
        return {
          filePath,
          _id: patch._id || '',
          set: patch.set || {},
          meta: patch.meta || {},
          validation: validatePatch(patch),
        }
      } catch (error) {
        return {
          filePath,
          error: error instanceof Error ? error.message : String(error),
          validation: {validJson: false, ok: false},
        }
      }
    }),
  )
}

async function loadPlans() {
  const seedFiles = [seedPath]
  const campaignSeedFiles = await discoverCampaignSeedFiles()
  const testSeedFiles = includeTestSeeds ? await discoverTestSeedFiles() : []

  seedFiles.push(...campaignSeedFiles)
  if (includeTestSeeds) seedFiles.push(...testSeedFiles)

  const records = []
  const loadedSeedFiles = []
  const failedSeedFiles = []

  for (const filePath of seedFiles) {
    try {
      const raw = await readFile(filePath, 'utf8')
      const parsed = JSON.parse(raw)
      records.push(...(Array.isArray(parsed) ? parsed : [parsed]))
      loadedSeedFiles.push(filePath)
    } catch (error) {
      failedSeedFiles.push({
        filePath,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const contentIdeaIds = [...new Set(records.map((plan) => plan.sourceContentIdea?._ref || ''))].filter(Boolean)
  const debugWarnings = []
  if (includeTestSeeds && testSeedFiles.length === 0) {
    debugWarnings.push('VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true but no visual-asset-plan-records-test-*.json files were found.')
  }
  if (includeTestSeeds && testSeedFiles.length > 0 && loadedSeedFiles.length === 1) {
    debugWarnings.push('Test seed files were discovered but none were loaded successfully.')
  }

  return {
    includeTestSeeds,
    seedFiles: seedFiles.map(relativeProjectPath),
    campaignSeedFiles: campaignSeedFiles.map(relativeProjectPath),
    testSeedFiles: testSeedFiles.map(relativeProjectPath),
    loadedSeedFiles: loadedSeedFiles.map(relativeProjectPath),
    failedSeedFiles: failedSeedFiles.map((item) => ({
      filePath: relativeProjectPath(item.filePath),
      error: item.error,
    })),
    contentIdeaIds,
    debugWarnings,
    records,
  }
}

async function readJsonBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxJsonBytes) throw new Error('Request body is too large.')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function decodeDataUrl(dataUrl) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(String(dataUrl || ''))
  if (!match) throw new Error('Expected an image data URL.')
  const mimeType = match[1]
  if (!mimeType.startsWith('image/')) throw new Error('Only image data URLs are accepted.')
  return {mimeType, bytes: Buffer.from(match[2], 'base64')}
}

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname
  const absolute = path.resolve(publicDir, `.${requestedPath}`)
  const publicRoot = publicDir.endsWith(path.sep) ? publicDir : `${publicDir}${path.sep}`
  if (!absolute.startsWith(publicRoot)) return sendText(res, 403, 'Forbidden')

  try {
    const body = await readFile(absolute)
    const contentType = contentTypes.get(path.extname(absolute)) || 'application/octet-stream'
    res.writeHead(200, {
      'content-type': contentType,
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    sendText(res, 404, 'Not found')
  }
}

async function handleInboxReview(req, res) {
  const body = await readJsonBody(req)
  const relativePath = body.relativePath
  if (!relativePath) return sendJson(res, 400, {error: 'relativePath is required'})
  if (!validReviewStatuses.has(body.reviewStatus)) {
    return sendJson(res, 400, {
      error: `reviewStatus must be one of: ${[...validReviewStatuses].join(', ')}`,
    })
  }

  let safe
  try {
    safe = safeInboxPath(relativePath)
  } catch (error) {
    return sendJson(res, 400, {error: error instanceof Error ? error.message : String(error)})
  }
  if (!existsSync(safe.absolute)) {
    return sendJson(res, 404, {error: 'Candidate image not found at provided relativePath.'})
  }

  const slug = slugFromInboxRelativePath(safe.relative)
  if (!slug) {
    return sendJson(res, 400, {
      error: 'Inbox path must be under assets/inbox/generated/<content-slug>/',
    })
  }

  const manifest = await loadInboxManifest(slug)
  const candidates = Array.isArray(manifest.candidates) ? manifest.candidates : []
  const idx = candidates.findIndex((entry) => entry.relativePath === safe.relative)
  const now = new Date().toISOString()
  const previous = idx >= 0 ? candidates[idx] : null
  const entry = {
    ...(previous || {}),
    relativePath: safe.relative,
    fileName: path.basename(safe.relative),
    suggestedAssetPlanId: body.suggestedAssetPlanId || previous?.suggestedAssetPlanId || '',
    reviewStatus: body.reviewStatus,
    reviewNotes: body.reviewNotes || '',
    createdAt: previous?.createdAt || now,
    updatedAt: now,
  }
  if (idx >= 0) candidates[idx] = entry
  else candidates.push(entry)
  manifest.candidates = candidates
  const saved = await saveInboxManifest(slug, manifest)

  return sendJson(res, 200, {ok: true, manifest: saved, entry})
}

async function handleInboxApproveAndRegister(req, res) {
  const body = await readJsonBody(req)
  const relativePath = body.relativePath
  if (!relativePath) return sendJson(res, 400, {error: 'relativePath is required'})
  if (!body.visualAssetPlanId) return sendJson(res, 400, {error: 'visualAssetPlanId is required'})

  let safe
  try {
    safe = safeInboxPath(relativePath)
  } catch (error) {
    return sendJson(res, 400, {error: error instanceof Error ? error.message : String(error)})
  }
  if (!existsSync(safe.absolute)) {
    return sendJson(res, 404, {error: 'Candidate image not found at provided relativePath.'})
  }

  const {records: plans} = await loadPlans()
  const plan = plans.find((item) => item._id === body.visualAssetPlanId)
  if (!plan) return sendJson(res, 404, {error: 'visualAssetPlan not found'})

  const targetPath = safeProjectPath(expectedAssetPath(plan))
  const targetAlreadyExists = existsSync(targetPath.absolute)
  if (targetAlreadyExists && body.overwriteConfirmed !== true) {
    return sendJson(res, 409, {
      error: 'A file already exists at the expected local asset path.',
      code: 'asset_exists',
      localAssetPath: targetPath.relative,
      overwriteRequired: true,
    })
  }

  await mkdir(path.dirname(targetPath.absolute), {recursive: true})
  await copyFile(safe.absolute, targetPath.absolute)

  const updatedAt = new Date().toISOString()
  const mimeType = imageMimeFromExt(path.extname(safe.absolute))
  const reviewNotesValue = [
    'Approved via Visual Register inbox and copied to final local asset path.',
    body.reviewNotes || '',
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
      generatedBy: 'tools/visual-register/inbox',
      inboxSource: safe.relative,
      originalFileName: path.basename(safe.absolute),
      mimeType,
      directSanityWrite: false,
    },
  }

  const patchPath = safeProjectPath(patchPathFor(plan))
  await mkdir(path.dirname(patchPath.absolute), {recursive: true})
  await writeFile(patchPath.absolute, `${JSON.stringify(patch, null, 2)}\n`)

  const slug = slugFromInboxRelativePath(safe.relative)
  if (slug) {
    const manifest = await loadInboxManifest(slug)
    const candidates = Array.isArray(manifest.candidates) ? manifest.candidates : []
    const idx = candidates.findIndex((entry) => entry.relativePath === safe.relative)
    const previous = idx >= 0 ? candidates[idx] : null
    const entry = {
      ...(previous || {}),
      relativePath: safe.relative,
      fileName: path.basename(safe.relative),
      suggestedAssetPlanId: plan._id,
      reviewStatus: 'registered',
      reviewNotes: body.reviewNotes || '',
      finalAssetPath: targetPath.relative,
      patchPath: patchPath.relative,
      registeredAt: updatedAt,
      createdAt: previous?.createdAt || updatedAt,
      updatedAt,
    }
    if (idx >= 0) candidates[idx] = entry
    else candidates.push(entry)
    manifest.candidates = candidates
    await saveInboxManifest(slug, manifest)
  }

  return sendJson(res, 200, {
    ok: true,
    visualAssetPlanId: plan._id,
    inboxSource: safe.relative,
    localAssetPath: targetPath.relative,
    patchPath: patchPath.relative,
    patch,
  })
}

async function serveInboxImage(url, res) {
  const requested = url.searchParams.get('path')
  if (!requested) return sendText(res, 400, 'path query param required')
  try {
    const safe = safeInboxPath(requested)
    if (!existsSync(safe.absolute)) return sendText(res, 404, 'Not found')
    const ext = path.extname(safe.absolute).toLowerCase()
    if (!inboxImageExtensions.has(ext)) return sendText(res, 415, 'Unsupported image type')
    const body = await readFile(safe.absolute)
    res.writeHead(200, {
      'content-type': imageMimeFromExt(ext),
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch (error) {
    sendText(res, 400, error instanceof Error ? error.message : String(error))
  }
}

async function handleRegister(req, res) {
  const body = await readJsonBody(req)
  const {records: plans} = await loadPlans()
  const plan = plans.find((item) => item._id === body.visualAssetPlanId)
  if (!plan) return sendJson(res, 404, {error: 'visualAssetPlan not found'})

  const {bytes, mimeType} = decodeDataUrl(body.dataUrl)
  const targetPath = safeProjectPath(expectedAssetPath(plan))
  const targetAlreadyExists = existsSync(targetPath.absolute)
  if (targetAlreadyExists && body.overwriteConfirmed !== true) {
    return sendJson(res, 409, {
      error: 'A file already exists at the expected local asset path.',
      code: 'asset_exists',
      localAssetPath: targetPath.relative,
      overwriteRequired: true,
    })
  }

  await mkdir(path.dirname(targetPath.absolute), {recursive: true})
  await writeFile(targetPath.absolute, bytes)

  const updatedAt = new Date().toISOString()
  const reviewNotes = [
    'Local image saved through Visual Register. Needs visual review.',
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
      reviewNotes,
    },
    meta: {
      generatedBy: 'tools/visual-register',
      originalFileName: body.fileName || '',
      mimeType,
      directSanityWrite: false,
    },
  }

  const patchPath = safeProjectPath(patchPathFor(plan))
  await mkdir(path.dirname(patchPath.absolute), {recursive: true})
  await writeFile(patchPath.absolute, `${JSON.stringify(patch, null, 2)}\n`)

  return sendJson(res, 200, {
    ok: true,
    visualAssetPlanId: plan._id,
    localAssetPath: targetPath.relative,
    patchPath: patchPath.relative,
    patch,
  })
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      const planData = await loadPlans()
      return sendJson(res, 200, {
        ok: true,
        projectRoot,
        seedExists: existsSync(seedPath),
        includeTestSeeds,
        testSeedPattern: 'seed/visual-asset-plan-records-test-*.json',
        seedFiles: planData.seedFiles,
        testSeedFiles: planData.testSeedFiles,
        loadedSeedFiles: planData.loadedSeedFiles,
        failedSeedFiles: planData.failedSeedFiles,
        count: planData.records.length,
        contentIdeaIds: planData.contentIdeaIds,
        debugWarnings: planData.debugWarnings,
        assetsDir: 'assets/visuals',
        patchesDir: 'patches/visual-assets',
      })
    }

    if (req.method === 'GET' && url.pathname === '/api/visual-asset-plans') {
      const planData = await loadPlans()
      const plans = planData.records
      return sendJson(res, 200, {
        ok: true,
        includeTestSeeds: planData.includeTestSeeds,
        seedFiles: planData.seedFiles,
        testSeedFiles: planData.testSeedFiles,
        loadedSeedFiles: planData.loadedSeedFiles,
        failedSeedFiles: planData.failedSeedFiles,
        contentIdeaIds: planData.contentIdeaIds,
        debugWarnings: planData.debugWarnings,
        count: plans.length,
        plans: plans.map((plan) => ({
          ...plan,
          sourceContentIdeaId: plan.sourceContentIdea?._ref || '',
          contentSlug: contentSlugFromPlan(plan),
          expectedLocalAssetPath: expectedAssetPath(plan),
          expectedLocalAssetExists: existsSync(safeProjectPath(expectedAssetPath(plan)).absolute),
          expectedPatchPath: patchPathFor(plan),
        })),
      })
    }

    if (req.method === 'GET' && url.pathname === '/api/visual-patches') {
      const patches = await loadVisualPatches()
      return sendJson(res, 200, {
        ok: true,
        patchesRoot: 'patches/visual-assets',
        count: patches.length,
        patches,
      })
    }

    if (req.method === 'POST' && url.pathname === '/api/register-visual') {
      return handleRegister(req, res)
    }

    if (req.method === 'GET' && url.pathname === '/api/inbox/candidates') {
      const slugFilter = url.searchParams.get('slug') || ''
      const {records: plans} = await loadPlans()
      const candidates = await listInboxCandidates(slugFilter || null, plans)
      const summary = {
        candidate: 0,
        approved: 0,
        rejected: 0,
        'needs-regeneration': 0,
        registered: 0,
      }
      for (const item of candidates) {
        if (summary[item.reviewStatus] !== undefined) summary[item.reviewStatus] += 1
      }
      return sendJson(res, 200, {
        ok: true,
        inboxRoot: 'assets/inbox/generated',
        slug: slugFilter,
        count: candidates.length,
        summary,
        candidates,
      })
    }

    if (req.method === 'POST' && url.pathname === '/api/inbox/review') {
      return handleInboxReview(req, res)
    }

    if (req.method === 'POST' && url.pathname === '/api/inbox/approve-and-register') {
      return handleInboxApproveAndRegister(req, res)
    }

    if (req.method === 'GET' && url.pathname === '/inbox-image') {
      return serveInboxImage(url, res)
    }

    if (url.pathname.startsWith('/api/')) return sendApiNotFound(res, url.pathname)

    if (req.method === 'GET') return serveStatic(req, res)

    sendJson(res, 405, {ok: false, error: 'Method not allowed'})
  } catch (error) {
    sendJson(res, 500, {error: error instanceof Error ? error.message : String(error)})
  }
}

const server = createServer(handleRequest)

server.on('error', (error) => {
  console.error('Visual Register failed to start.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

server.listen(port, host, () => {
  const url = `http://localhost:${port}`
  console.log('Visual Register running at:')
  console.log(url)
  console.log('')
  console.log(`Test seed mode: ${includeTestSeeds ? 'enabled' : 'disabled'}`)
  loadPlans()
    .then((planData) => {
      console.log(`Loaded visualAssetPlan records: ${planData.records.length}`)
      console.log(`Loaded seed files: ${planData.loadedSeedFiles.join(', ') || '-'}`)
      if (includeTestSeeds) {
        console.log(`Discovered test seed files: ${planData.testSeedFiles.join(', ') || '-'}`)
      }
      if (planData.failedSeedFiles.length > 0) {
        console.log('Failed seed files:')
        for (const item of planData.failedSeedFiles) console.log(`- ${item.filePath}: ${item.error}`)
      }
      if (planData.debugWarnings.length > 0) {
        console.log('Seed warnings:')
        for (const warning of planData.debugWarnings) console.log(`- ${warning}`)
      }
    })
    .catch((error) => {
      console.log(`Seed debug failed: ${error instanceof Error ? error.message : String(error)}`)
    })
  console.log('')
  console.log('No direct Sanity writes. No image generation API calls.')
})
