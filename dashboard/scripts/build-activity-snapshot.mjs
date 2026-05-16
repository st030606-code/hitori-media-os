// dashboard/scripts/build-activity-snapshot.mjs
//
// Read the repo's docs/devlog/ and docs/handoff/ markdown files and write a
// trimmed JSON snapshot to dashboard/public/activity-snapshot.json so that
// /activity-log can render in production environments that do not have the
// repo filesystem available at request time.
//
// Run manually before deploying:
//   npm run build:activity-snapshot
//
// Snapshot fields per entry: kind / fileName / relPath / title / status /
// date / excerpt (first ~120 chars after metadata). Limited to LATEST_PER_KIND
// per kind (default 20), sorted by filename descending.

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// dashboard/scripts → dashboard/ → repo root
const DASHBOARD_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DASHBOARD_ROOT, '..')
const SNAPSHOT_PATH = path.join(DASHBOARD_ROOT, 'public', 'activity-snapshot.json')

const LATEST_PER_KIND = 20
const EXCERPT_LEN = 120

function extractTitle(body) {
  for (const line of body.split('\n')) {
    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m) return m[1].trim()
  }
  return undefined
}

function extractDate(body) {
  for (const line of body.split('\n')) {
    const m = line.match(/^Date:\s*(.+?)\s*$/)
    if (m) return m[1].trim()
  }
  return undefined
}

function extractStatus(body) {
  for (const line of body.split('\n')) {
    const m = line.match(/^Status:\s*(.+?)\s*$/)
    if (m) {
      return m[1].trim().replace(/^\*+/, '').replace(/\*+$/, '')
    }
  }
  return undefined
}

function extractExcerpt(body) {
  // Drop heading lines, metadata lines, blank lines, then concat and trim.
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith('#') &&
        !l.startsWith('---') &&
        !/^(Date|Status):\s/i.test(l),
    )
  const joined = lines.join(' ')
  if (joined.length <= EXCERPT_LEN) return joined
  return joined.slice(0, EXCERPT_LEN).trim() + '…'
}

function dateFromFilename(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : undefined
}

async function readEntriesForKind(kind) {
  const dir = path.join(REPO_ROOT, 'docs', kind)
  let entries
  try {
    entries = await fs.readdir(dir, {withFileTypes: true})
  } catch (err) {
    console.warn(`[activity-snapshot] could not read ${dir}: ${err?.message ?? err}`)
    return []
  }
  const names = entries
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => d.name)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, LATEST_PER_KIND)
  const out = []
  for (const name of names) {
    const abs = path.join(dir, name)
    try {
      const body = await fs.readFile(abs, 'utf-8')
      const stat = await fs.stat(abs)
      out.push({
        kind,
        filename: name,
        relPath: path.relative(REPO_ROOT, abs),
        title: extractTitle(body) ?? name.replace(/\.md$/, ''),
        status: extractStatus(body) ?? null,
        date: extractDate(body) ?? dateFromFilename(name) ?? null,
        excerpt: extractExcerpt(body),
        size: stat.size,
        mtime:
          stat.mtime.toISOString().replace('T', ' ').slice(0, 16) + 'Z',
      })
    } catch (err) {
      console.warn(`[activity-snapshot] could not read ${abs}: ${err?.message ?? err}`)
    }
  }
  return out
}

async function main() {
  const start = Date.now()
  const [devlog, handoff] = await Promise.all([
    readEntriesForKind('devlog'),
    readEntriesForKind('handoff'),
  ])

  const snapshot = {
    generatedAt: new Date().toISOString(),
    repoRoot: REPO_ROOT,
    latestPerKind: LATEST_PER_KIND,
    excerptLength: EXCERPT_LEN,
    devlog,
    handoff,
  }

  await fs.mkdir(path.dirname(SNAPSHOT_PATH), {recursive: true})
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8')

  const ms = Date.now() - start
  console.log(
    `[activity-snapshot] wrote ${devlog.length} devlog + ${handoff.length} handoff entries to ${path.relative(REPO_ROOT, SNAPSHOT_PATH)} in ${ms}ms`,
  )
}

main().catch((err) => {
  console.error('[activity-snapshot] failed:', err)
  process.exitCode = 1
})
