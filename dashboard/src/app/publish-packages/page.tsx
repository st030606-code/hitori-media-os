// /publish-packages — 公開パッケージ一覧 (Phase UI-fidelity-8).
//
// Filesystem walk of publish-packages/<platform>/<campaign>/ at the repo
// root. Server-only read; dev-only (production returns 404 via the feature
// flag). Layout matches Phase UI-fidelity-1〜7 tone: PageHeader + Breadcrumb
// + KpiCardsRow + per-package cards with inline empty/error states.
//
// Data-fetch logic (scanPackages / walkPackage / readDirEntries) is unchanged
// from the previous implementation — only the surrounding presentation
// changed.

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {notFound} from 'next/navigation'
import Link from 'next/link'
import {ArrowRight, FileText, Hash, Image as ImageIcon, Layers} from 'lucide-react'
import {repoPath, repoRoot} from '@/lib/repoRoot'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {CopyButton} from '@/components/CopyButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])
const MD_EXTS = new Set(['.md', '.markdown'])

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

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
  const sourceRel = path.relative(repoRoot(), packagesRoot)

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="公開パッケージ一覧"
        description="publish-packages/ 配下のファイルシステムを walk して表示します。dev 専用、production では 404。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '公開パッケージ一覧'}]}
        actions={
          <Link
            href="/publish"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            公開管理を開く
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>{totalEntries} packages · {totalFiles} files</span>
            <span aria-hidden="true">·</span>
            <span>source:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {sourceRel}
            </code>
          </span>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="Packages"
          value={totalEntries}
          icon={Layers}
          tone="slate"
          trend={neutralTrend}
          secondary="platform × campaign"
        />
        <KpiCard
          label="Files"
          value={totalFiles}
          icon={FileText}
          tone="blue"
          trend={neutralTrend}
          secondary="全 file 数"
        />
        <KpiCard
          label="Images"
          value={totalImages}
          icon={ImageIcon}
          tone="purple"
          trend={neutralTrend}
          secondary="png / jpg / webp"
        />
        <KpiCard
          label="Markdown"
          value={totalMarkdown}
          icon={Hash}
          tone="emerald"
          trend={neutralTrend}
          secondary=".md / .markdown"
        />
      </KpiCardsRow>

      {errors.length > 0 && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">一部のディレクトリ読み込みに失敗しました</p>
          <p className="mt-1 text-[12px]">{errors.join(' · ')}</p>
        </section>
      )}

      {entries.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">公開パッケージが見つかりません</h2>
          <p className="mt-2 text-slate-600">
            <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">publish-packages/</code> がリポジトリルートに存在しないか、platform×campaign のサブディレクトリが空です。
          </p>
        </section>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <PackageCard key={`${e.platform}-${e.campaignSlug}`} entry={e} />
          ))}
        </ul>
      )}
    </main>
  )
}

function PackageCard({entry: e}: {entry: PackageEntry}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            {e.platform} <span className="text-slate-400">·</span> {e.campaignSlug}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-700 ring-1 ring-inset ring-slate-200">
              {e.relativePath}
            </code>
            <CopyButton text={e.relativePath} label="copy" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] tabular-nums text-slate-600">
          <span>{e.fileCount} files</span>
          <span>{e.imageCount} images</span>
          <span>{e.markdownCount} markdown</span>
          <span>{formatBytes(e.totalBytes)}</span>
          {e.lastModified && <span className="text-slate-500">last: {e.lastModified}</span>}
        </div>
      </header>

      {e.files.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
            {e.files.length} 件のファイルを表示
          </summary>
          <ul className="mt-2 max-h-80 space-y-0.5 overflow-auto rounded-md bg-slate-50/60 p-2 text-xs ring-1 ring-inset ring-slate-200">
            {e.files.map((f) => (
              <li key={f.relPath} className="flex flex-wrap items-center gap-3">
                <code className="break-all text-slate-700">{f.relPath}</code>
                <span className="text-[11px] tabular-nums text-slate-500">{formatBytes(f.size)}</span>
                <span className="text-[11px] tabular-nums text-slate-400">{f.mtime}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  )
}
