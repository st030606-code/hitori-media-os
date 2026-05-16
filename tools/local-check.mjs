import {readFile, readdir} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {execSync} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const checks = []

function addCheck(name, ok, details = '') {
  checks.push({name, ok: Boolean(ok), details})
}

function relativePath(value) {
  return path.relative(projectRoot, value).replace(/\\/g, '/')
}

async function listFiles(directory, predicate = () => true) {
  if (!existsSync(directory)) return []
  const entries = await readdir(directory, {withFileTypes: true})
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) return listFiles(absolute, predicate)
      if (entry.isFile() && predicate(absolute)) return [absolute]
      return []
    }),
  )
  return nested.flat().sort()
}

async function readJson(relativeFile) {
  const absolute = path.join(projectRoot, relativeFile)
  return JSON.parse(await readFile(absolute, 'utf8'))
}

async function countVisualPlans() {
  const main = await readJson('seed/visual-asset-plan-records.json')
  const testFiles = await listFiles(path.join(projectRoot, 'seed'), (file) =>
    path.basename(file).startsWith('visual-asset-plan-records-test-') && file.endsWith('.json'),
  )
  let testCount = 0
  for (const file of testFiles) {
    const parsed = JSON.parse(await readFile(file, 'utf8'))
    testCount += Array.isArray(parsed) ? parsed.length : 1
  }
  return {mainCount: Array.isArray(main) ? main.length : 1, testCount, testFiles}
}

async function scanSecrets() {
  const roots = ['README.md', 'docs', 'schemas', 'seed', 'tools', 'launchers', 'sanity.config.ts', 'sanity.cli.ts', 'package.json']
  const files = []
  for (const root of roots) {
    const absolute = path.join(projectRoot, root)
    if (!existsSync(absolute)) continue
    if ((await readdir(path.dirname(absolute), {withFileTypes: true})).some((entry) => entry.name === path.basename(absolute) && entry.isFile())) {
      files.push(absolute)
    } else {
      files.push(...(await listFiles(absolute, (file) => /\.(md|json|js|mjs|ts|tsx|css|html|command|sh|bat)$/.test(file))))
    }
  }

  const hits = []
  const secretPattern = /sk-[A-Za-z0-9_-]{20,}|SANITY_AUTH_TOKEN=|SANITY_API_TOKEN=|projectId:\s*['"][a-z0-9]{8,}['"]/g
  for (const file of files) {
    if (relativePath(file) === 'tools/local-check.mjs') continue
    const text = await readFile(file, 'utf8')
    const matches = text.match(secretPattern)
    if (matches) hits.push({file: relativePath(file), matches})
  }
  return hits
}

async function isPrivateGitignored() {
  const gitignorePath = path.join(projectRoot, '.gitignore')
  if (!existsSync(gitignorePath)) return false
  const contents = await readFile(gitignorePath, 'utf8')
  return /^[ \t]*private\/?[ \t]*$/m.test(contents)
}

function trackedPrivateFiles() {
  try {
    const output = execSync('git ls-files private/', {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString()
    return {available: true, files: output.trim() ? output.trim().split('\n') : []}
  } catch {
    return {available: false, files: []}
  }
}

async function scanDirectSanityWrites() {
  const toolFiles = await listFiles(path.join(projectRoot, 'tools'), (file) => /\.(js|mjs)$/.test(file))
  const hits = []
  const writePattern = /createClient|\.patch\(|\.create\(|\.createOrReplace\(|\.delete\(|mutation|SANITY_AUTH_TOKEN|SANITY_API_TOKEN/
  for (const file of toolFiles) {
    if (relativePath(file) === 'tools/local-check.mjs') continue
    const text = await readFile(file, 'utf8')
    if (writePattern.test(text)) hits.push(relativePath(file))
  }
  return hits
}

async function main() {
  addCheck('package.json exists', existsSync(path.join(projectRoot, 'package.json')))
  addCheck('.env.local exists', existsSync(path.join(projectRoot, '.env.local')), 'warn only; required for local Studio login')
  addCheck('seed/contentIdea-ai-blog-db.json exists', existsSync(path.join(projectRoot, 'seed/contentIdea-ai-blog-db.json')))
  addCheck('seed/visual-asset-plan-records.json exists', existsSync(path.join(projectRoot, 'seed/visual-asset-plan-records.json')))
  addCheck('seed/video-asset-plan-examples.json exists', existsSync(path.join(projectRoot, 'seed/video-asset-plan-examples.json')))
  addCheck('seed/audio-asset-plan-examples.json exists', existsSync(path.join(projectRoot, 'seed/audio-asset-plan-examples.json')))
  addCheck('assets/visuals exists', existsSync(path.join(projectRoot, 'assets/visuals')))
  addCheck('patches/visual-assets exists', existsSync(path.join(projectRoot, 'patches/visual-assets')))
  addCheck('publish-packages exists', existsSync(path.join(projectRoot, 'publish-packages')), 'created by npm run publish:package')

  const visualCounts = await countVisualPlans()
  addCheck('main visualAssetPlan seed count', visualCounts.mainCount === 5, `count=${visualCounts.mainCount}`)
  addCheck('test visualAssetPlan seed count', visualCounts.testCount === 3, `count=${visualCounts.testCount}`)

  const patchFiles = await listFiles(path.join(projectRoot, 'patches/visual-assets'), (file) => file.endsWith('.json'))
  addCheck('visual patch JSON files exist', patchFiles.length > 0, `count=${patchFiles.length}`)

  const secretHits = await scanSecrets()
  addCheck('no obvious secrets in committed files', secretHits.length === 0, secretHits.map((hit) => hit.file).join(', '))

  const directWriteHits = await scanDirectSanityWrites()
  addCheck('no direct Sanity write code paths in local tools', directWriteHits.length === 0, directWriteHits.join(', '))

  const privateExists = existsSync(path.join(projectRoot, 'private'))
  const privateIgnored = await isPrivateGitignored()
  addCheck(
    'private/ is gitignored if it exists',
    !privateExists || privateIgnored,
    privateExists ? (privateIgnored ? 'private/ present and ignored' : 'private/ present but NOT in .gitignore') : 'private/ not present',
  )

  const tracked = trackedPrivateFiles()
  addCheck(
    'private/ contents are not tracked',
    !tracked.available || tracked.files.length === 0,
    tracked.available
      ? tracked.files.length === 0
        ? 'no tracked files under private/'
        : `tracked: ${tracked.files.join(', ')}`
      : 'git not available; check skipped',
  )

  const informationalChecks = new Set([
    '.env.local exists',
    'private/ is gitignored if it exists',
    'private/ contents are not tracked',
  ])
  const ok = checks.every((check) => check.ok || informationalChecks.has(check.name))
  console.log(JSON.stringify({ok, generatedAt: new Date().toISOString(), checks}, null, 2))
  if (!ok) process.exit(1)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
