import {promises as fs} from 'node:fs'
import path from 'node:path'
import {notFound} from 'next/navigation'
import {repoPath, repoRoot} from '@/lib/repoRoot'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {EmptyState} from '@/components/EmptyState'
import {FilePathBlock} from '@/components/FilePathBlock'
import {SectionHeader} from '@/components/SectionHeader'
import {SummaryCard} from '@/components/SummaryCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])
const MD_EXTS = new Set(['.md', '.markdown'])

interface PackageEntry {
  platform: string
  campaignSlug: string
  relativePath: string
  absolutePath: string
  fileCount: number
  markdownCount: number
  imageCount: number
  totalBytes: number
  lastModified?: string
  files: Array<{relPath: string; size: number; mtime: string}>
}

interface PackageScan {
  packagesRoot: string
  entries: PackageEntry[]
  errors: string[]
}

async function readDirEntries(dir: string): Promise<{name: string; isDir: boolean}[]> {
  const items = await fs.readdir(dir, {withFileTypes: true})
  return items.map((it) => ({name: it.name, isDir: it.isDirectory()}))
}

async function walkPackage(absDir: string): Promise<{
  files: Array<{relPath: string; size: number; mtime: string}>
  imageCount: number
  markdownCount: number
  totalBytes: number
  lastModified?: string
}> {
  const collected: Array<{relPath: string; size: number; mtime: string}> = []
  let imageCount = 0
  let markdownCount = 0
  let totalBytes = 0
  let lastModified: number | null = null

  async function walk(dir: string) {
    let entries: {name: string; isDir: boolean}[]
    try {
      entries = await readDirEntries(dir)
    } catch {
      return
    }
    for (const e of entries) {
      const abs = path.join(dir, e.name)
      const rel = path.relative(absDir, abs)
      if (e.isDir) {
        await walk(abs)
      } else {
        try {
          const stat = await fs.stat(abs)
          collected.push({
            relPath: rel,
            size: stat.size,
            mtime: stat.mtime.toISOString().replace('T', ' ').slice(0, 16) + 'Z',
          })
          totalBytes += stat.size
          if (!lastModified || stat.mtimeMs > lastModified) lastModified = stat.mtimeMs
          const ext = path.extname(e.name).toLowerCase()
          if (IMAGE_EXTS.has(ext)) imageCount++
          if (MD_EXTS.has(ext)) markdownCount++
        } catch {
          /* ignore stat errors */
        }
      }
    }
  }

  await walk(absDir)
  collected.sort((a, b) => a.relPath.localeCompare(b.relPath))
  return {
    files: collected,
    imageCount,
    markdownCount,
    totalBytes,
    lastModified: lastModified ? new Date(lastModified).toISOString().replace('T', ' ').slice(0, 16) + 'Z' : undefined,
  }
}

async function scanPackages(): Promise<PackageScan> {
  const errors: string[] = []
  const packagesRoot = repoPath('publish-packages')
  const entries: PackageEntry[] = []

  let platformDirs: string[]
  try {
    platformDirs = (await readDirEntries(packagesRoot)).filter((it) => it.isDir).map((it) => it.name)
  } catch (err) {
    errors.push(
      `Could not list ${packagesRoot}: ${err instanceof Error ? err.message : 'unknown error'}`,
    )
    return {packagesRoot, entries, errors}
  }

  for (const platform of platformDirs.sort()) {
    const platformAbs = path.join(packagesRoot, platform)
    let campaignDirs: string[]
    try {
      campaignDirs = (await readDirEntries(platformAbs)).filter((it) => it.isDir).map((it) => it.name)
    } catch (err) {
      errors.push(
        `Could not list ${platformAbs}: ${err instanceof Error ? err.message : 'unknown error'}`,
      )
      continue
    }
    for (const campaignSlug of campaignDirs.sort()) {
      const abs = path.join(platformAbs, campaignSlug)
      try {
        const walked = await walkPackage(abs)
        entries.push({
          platform,
          campaignSlug,
          relativePath: path.relative(repoRoot(), abs),
          absolutePath: abs,
          fileCount: walked.files.length,
          imageCount: walked.imageCount,
          markdownCount: walked.markdownCount,
          totalBytes: walked.totalBytes,
          lastModified: walked.lastModified,
          files: walked.files,
        })
      } catch (err) {
        errors.push(
          `Failed to walk ${abs}: ${err instanceof Error ? err.message : 'unknown error'}`,
        )
      }
    }
  }
  // Stable order: platform name asc, then campaign slug asc.
  entries.sort((a, b) =>
    a.platform.localeCompare(b.platform) || a.campaignSlug.localeCompare(b.campaignSlug),
  )
  return {packagesRoot, entries, errors}
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

export default async function PublishPackagesPage() {
  if (!enableLocalFsRoutes) {
    notFound()
  }
  const {packagesRoot, entries, errors} = await scanPackages()
  const totalEntries = entries.length
  const totalFiles = entries.reduce((acc, e) => acc + e.fileCount, 0)
  const totalImages = entries.reduce((acc, e) => acc + e.imageCount, 0)
  const totalMarkdown = entries.reduce((acc, e) => acc + e.markdownCount, 0)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Publish Packages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Filesystem walk of <code>publish-packages/</code> at the repo root. Server-only read.
          {' '}<span className="text-slate-500">{totalEntries} packages, {totalFiles} files.</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Source path:{' '}
          <code className="rounded bg-slate-50 px-1 py-0.5">
            {path.relative(repoRoot(), packagesRoot)}
          </code>{' '}
          (under <code>{repoRoot()}</code>)
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Packages" primary={totalEntries} secondary="platform × campaign" />
        <SummaryCard label="Files" primary={totalFiles} />
        <SummaryCard label="Images" primary={totalImages} />
        <SummaryCard label="Markdown" primary={totalMarkdown} />
      </section>

      {errors.length > 0 && (
        <EmptyState
          tone="error"
          title="Some directories failed to read"
          body={errors.join(' · ')}
        />
      )}

      {entries.length === 0 ? (
        <EmptyState
          title="No publish packages found."
          body="Either publish-packages/ is missing at the repo root, or it contains no platform×campaign subdirectories."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <PackageRow key={`${e.platform}-${e.campaignSlug}`} entry={e} />
          ))}
        </ul>
      )}
    </main>
  )
}

function PackageRow({entry: e}: {entry: PackageEntry}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {e.platform} <span className="text-slate-400">·</span> {e.campaignSlug}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            <FilePathBlock path={e.relativePath} />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span>{e.fileCount} files</span>
          <span>{e.imageCount} images</span>
          <span>{e.markdownCount} markdown</span>
          <span>{formatBytes(e.totalBytes)}</span>
          {e.lastModified && <span>last: {e.lastModified}</span>}
        </div>
      </header>

      {e.files.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
            Show {e.files.length} file{e.files.length === 1 ? '' : 's'}
          </summary>
          <ul className="mt-2 space-y-0.5 text-xs">
            {e.files.map((f) => (
              <li key={f.relPath} className="flex flex-wrap items-center gap-3">
                <code className="text-slate-700 break-all">{f.relPath}</code>
                <span className="text-[11px] text-slate-500">{formatBytes(f.size)}</span>
                <span className="text-[11px] text-slate-400">{f.mtime}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  )
}
