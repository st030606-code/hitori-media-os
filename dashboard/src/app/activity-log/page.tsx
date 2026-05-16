import {promises as fs} from 'node:fs'
import path from 'node:path'
import {repoPath, repoRoot} from '@/lib/repoRoot'
import {activityLogMode} from '@/lib/featureFlags'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {EmptyState} from '@/components/EmptyState'
import {SectionHeader} from '@/components/SectionHeader'
import {SummaryCard} from '@/components/SummaryCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LATEST_PER_KIND = 20
const EXCERPT_FS_LEN = 400 // fs mode keeps the existing richer excerpt
const SNAPSHOT_PATH = ['public', 'activity-snapshot.json'] as const

interface DocEntry {
  kind: 'devlog' | 'handoff'
  filename: string
  relPath: string
  title: string
  status?: string | null
  date?: string | null
  excerpt: string
  size?: number
  mtime?: string
}

interface SnapshotShape {
  generatedAt?: string
  latestPerKind?: number
  excerptLength?: number
  devlog?: DocEntry[]
  handoff?: DocEntry[]
}

// ---------------- fs mode ----------------

function parseFrontmatter(body: string): {title?: string; status?: string; date?: string} {
  let title: string | undefined
  let status: string | undefined
  let date: string | undefined
  for (const line of body.split('\n')) {
    if (!title) {
      const m = line.match(/^#\s+(.+)\s*$/)
      if (m) title = m[1].trim()
    }
    if (!date) {
      const m = line.match(/^Date:\s*(.+)\s*$/)
      if (m) date = m[1].trim()
    }
    if (!status) {
      const m = line.match(/^Status:\s*(.+)\s*$/)
      if (m) status = m[1].trim().replace(/^\*+/, '').replace(/\*+$/, '')
    }
  }
  return {title, status, date}
}

function buildExcerpt(body: string): string {
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('---'))
  const joined = lines.join(' ')
  return joined.length > EXCERPT_FS_LEN ? joined.slice(0, EXCERPT_FS_LEN).trim() + '…' : joined
}

function dateFromFilename(filename: string): string | undefined {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : undefined
}

async function readDocsFromFs(kind: 'devlog' | 'handoff'): Promise<DocEntry[]> {
  const dir = repoPath('docs', kind)
  let filenames: string[]
  try {
    filenames = (await fs.readdir(dir, {withFileTypes: true}))
      .filter((d) => d.isFile() && d.name.endsWith('.md'))
      .map((d) => d.name)
  } catch {
    return []
  }
  filenames.sort((a, b) => b.localeCompare(a))
  const chosen = filenames.slice(0, LATEST_PER_KIND)
  const entries: DocEntry[] = []
  for (const filename of chosen) {
    const abs = path.join(dir, filename)
    try {
      const stat = await fs.stat(abs)
      const body = await fs.readFile(abs, 'utf-8')
      const fm = parseFrontmatter(body)
      entries.push({
        kind,
        filename,
        relPath: path.relative(repoRoot(), abs),
        title: fm.title ?? filename.replace(/\.md$/, ''),
        status: fm.status,
        date: fm.date ?? dateFromFilename(filename),
        excerpt: buildExcerpt(body),
        size: stat.size,
        mtime: stat.mtime.toISOString().replace('T', ' ').slice(0, 16) + 'Z',
      })
    } catch {
      /* ignore individual file errors */
    }
  }
  return entries
}

// ---------------- snapshot mode ----------------

interface SnapshotLoadResult {
  loaded: boolean
  snapshot?: SnapshotShape
  error?: string
}

async function loadSnapshot(): Promise<SnapshotLoadResult> {
  const snapshotPath = path.join(process.cwd(), ...SNAPSHOT_PATH)
  try {
    const body = await fs.readFile(snapshotPath, 'utf-8')
    const parsed = JSON.parse(body) as SnapshotShape
    return {loaded: true, snapshot: parsed}
  } catch (err) {
    return {
      loaded: false,
      error:
        err instanceof Error ? err.message : 'unknown error while reading activity-snapshot.json',
    }
  }
}

// ---------------- page ----------------

export default async function ActivityLogPage() {
  const mode = activityLogMode

  let devlogs: DocEntry[] = []
  let handoffs: DocEntry[] = []
  let snapshotError: string | undefined
  let generatedAt: string | undefined

  if (mode === 'fs') {
    const both = await Promise.all([readDocsFromFs('devlog'), readDocsFromFs('handoff')])
    devlogs = both[0]
    handoffs = both[1]
  } else {
    const res = await loadSnapshot()
    if (!res.loaded || !res.snapshot) {
      snapshotError = res.error ?? 'snapshot missing'
    } else {
      devlogs = res.snapshot.devlog ?? []
      handoffs = res.snapshot.handoff ?? []
      generatedAt = res.snapshot.generatedAt
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-600">
          Latest entries from <code>docs/devlog/</code> and <code>docs/handoff/</code>.
          Mode:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">{mode}</code>
          {mode === 'snapshot' && generatedAt && (
            <> &middot; snapshot generated {generatedAt}</>
          )}
          . Up to {LATEST_PER_KIND} per kind.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Mode"
          primary={mode}
          secondary={mode === 'fs' ? 'reads repo filesystem on request' : 'reads public/activity-snapshot.json'}
        />
        <SummaryCard label="Devlog entries shown" primary={devlogs.length} secondary={`max ${LATEST_PER_KIND} per kind`} />
        <SummaryCard label="Handoff entries shown" primary={handoffs.length} secondary={`max ${LATEST_PER_KIND} per kind`} />
        <SummaryCard
          label="Source"
          primary={mode === 'fs' ? 'docs/' : 'snapshot'}
          secondary={mode === 'fs' ? 'live read each request' : 'rebuild with npm run build:activity-snapshot'}
        />
      </section>

      {mode === 'snapshot' && snapshotError && (
        <EmptyState
          tone="error"
          title="No activity snapshot found"
          body={`Could not read public/activity-snapshot.json (${snapshotError}). Run "npm run build:activity-snapshot" from the dashboard/ directory to generate it.`}
        />
      )}

      <DocList kind="devlog" title="Devlog" entries={devlogs} />
      <DocList kind="handoff" title="Handoff" entries={handoffs} />
    </main>
  )
}

function DocList({kind, title, entries}: {kind: string; title: string; entries: DocEntry[]}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title={`No ${kind} entries to show`}
        body={`Expected markdown files under docs/${kind}/. In snapshot mode, run npm run build:activity-snapshot to rebuild.`}
      />
    )
  }
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader title={title} description={`${entries.length} entries (newest first by filename)`} />
      <ul className="divide-y divide-slate-100">
        {entries.map((e) => (
          <li key={e.relPath} className="py-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-medium text-slate-900">{e.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  <code>{e.filename}</code>
                  {e.date && <span> · {e.date}</span>}
                  {e.status && <span> · status: {e.status}</span>}
                </p>
              </div>
              {e.mtime && <span className="text-[11px] text-slate-400">{e.mtime}</span>}
            </div>
            {e.excerpt && <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{e.excerpt}</p>}
            <p className="mt-1 text-[11px] text-slate-400">
              <code>{e.relPath}</code>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
