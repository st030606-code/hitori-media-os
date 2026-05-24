// /activity-log — 作業ログ (Phase UI-fidelity-8).
//
// Renders the latest entries from docs/devlog/*.md and docs/handoff/*.md.
// Two source modes (activityLogMode):
//   - 'fs'       : reads the repo filesystem at request time (dev default)
//   - 'snapshot' : reads dashboard/public/activity-snapshot.json (prod default)
//
// Data-fetch helpers (readDocsFromFs / loadSnapshot / parseFrontmatter / etc)
// are unchanged from the previous implementation — only the surrounding
// presentation moved to PageHeader + KpiCardsRow + inline empty/error.

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {Database, FileText, Server} from 'lucide-react'
import {repoPath, repoRoot} from '@/lib/repoRoot'
import {activityLogMode} from '@/lib/featureFlags'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {CopyButton} from '@/components/CopyButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LATEST_PER_KIND = 20
const EXCERPT_FS_LEN = 400 // fs mode keeps the existing richer excerpt
const SNAPSHOT_PATH = ['public', 'activity-snapshot.json'] as const

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

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

  const description =
    mode === 'snapshot' && generatedAt
      ? `docs/devlog/ と docs/handoff/ の最新 ${LATEST_PER_KIND} 件 / mode: ${mode} · snapshot generated ${generatedAt}`
      : `docs/devlog/ と docs/handoff/ の最新 ${LATEST_PER_KIND} 件 / mode: ${mode}`

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="作業ログ"
        description={description}
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '作業ログ'}]}
        meta={
          <span>
            ソース:{' '}
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {mode === 'fs' ? 'docs/' : 'public/activity-snapshot.json'}
            </code>
            {mode === 'snapshot' && (
              <>
                {' '}· rebuild:{' '}
                <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
                  npm run build:activity-snapshot
                </code>
              </>
            )}
          </span>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="モード"
          value={mode}
          icon={Database}
          tone="slate"
          trend={neutralTrend}
          secondary={mode === 'fs' ? 'リクエスト時に repo を読む' : 'build-time JSON を読む'}
        />
        <KpiCard
          label="Devlog"
          value={devlogs.length}
          icon={FileText}
          tone="blue"
          trend={neutralTrend}
          secondary={`max ${LATEST_PER_KIND} 件`}
        />
        <KpiCard
          label="Handoff"
          value={handoffs.length}
          icon={FileText}
          tone="purple"
          trend={neutralTrend}
          secondary={`max ${LATEST_PER_KIND} 件`}
        />
        <KpiCard
          label="ソース"
          value={mode === 'fs' ? 'docs/' : 'snapshot'}
          icon={Server}
          tone="emerald"
          trend={neutralTrend}
          secondary={mode === 'fs' ? 'live read' : 'build-time'}
        />
      </KpiCardsRow>

      {mode === 'snapshot' && snapshotError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">activity-snapshot.json を読み込めませんでした</p>
          <p className="mt-1 text-[12px]">
            {snapshotError}。<code className="rounded bg-white/60 px-1 py-0.5 text-[11px]">npm run build:activity-snapshot</code> を dashboard/ ディレクトリで実行して生成してください。
          </p>
        </section>
      )}

      <DocListCard title="Devlog" kind="devlog" entries={devlogs} />
      <DocListCard title="Handoff" kind="handoff" entries={handoffs} />
    </main>
  )
}

function DocListCard({kind, title, entries}: {kind: string; title: string; entries: DocEntry[]}) {
  if (entries.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">{title} エントリーがありません</h2>
        <p className="mt-2 text-slate-600">
          <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">docs/{kind}/</code>{' '}
          の下に markdown ファイルを置いてください。snapshot モードなら{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">npm run build:activity-snapshot</code>{' '}
          で再生成します。
        </p>
      </section>
    )
  }
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-[11px] text-slate-500">
            {entries.length} entries (newest first by filename)
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200">
          {entries.length}
        </span>
      </header>
      <ul className="divide-y divide-slate-100">
        {entries.map((e) => (
          <li key={e.relPath} className="py-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900">{e.title}</h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                  <code className="rounded bg-slate-50 px-1 py-0.5 ring-1 ring-inset ring-slate-200">
                    {e.filename}
                  </code>
                  {e.date && <span className="tabular-nums">{e.date}</span>}
                  {e.status && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 ring-1 ring-inset ring-blue-200">
                      {e.status}
                    </span>
                  )}
                </div>
              </div>
              {e.mtime && (
                <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{e.mtime}</span>
              )}
            </div>
            {e.excerpt && <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{e.excerpt}</p>}
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <code className="break-all rounded bg-slate-50 px-1 py-0.5 text-slate-600 ring-1 ring-inset ring-slate-200">
                {e.relPath}
              </code>
              <CopyButton text={e.relPath} label="copy" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
