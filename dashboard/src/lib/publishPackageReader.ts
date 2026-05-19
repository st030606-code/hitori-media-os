// Server-only reader for the boss-facing 公開パッケージ UI.
// Pulls markdown content out of publish-packages/<platform>/<slug>/*.md so
// the dashboard can render copy-ready text + image paths for manual posting.

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {repoPath, repoRoot} from './repoRoot'

export interface PlatformBase {
  available: boolean
  sourceFile: string
  images: ImageRef[]
  errors: string[]
}

export interface ImageRef {
  filename: string
  relativePath: string
  byteSize: number
}

export interface XContent extends PlatformBase {
  mainPost?: string
  alternateHooks: string[]
  threadPosts: string[]
  softCtas: string[]
}

export interface ThreadsContent extends PlatformBase {
  mainPost?: string
  alternateMainPosts: string[]
  replyChain: string[]
  discussionQuestion?: string
  softCtas: string[]
}

export interface NoteContent extends PlatformBase {
  titleOptions: string[]
  leadParagraph?: string
  articleBody?: string
  suggestedImageInsertionPoints: string[]
  softCtas: string[]
  insertMapStale: boolean
}

export interface SubstackContent extends PlatformBase {
  titleOptions: string[]
  emailSubjectOptions: string[]
  previewText?: string
  postBody?: string
  notesPlan?: string
  aboutPageIsStub: boolean
  welcomeEmailIsStub: boolean
  notesFileIsStub: boolean
}

export interface ReleaseReviewLink {
  label: string
  filename: string
  relativePath: string
  exists: boolean
}

export interface PublishPackage {
  slug: string
  fsAvailable: boolean
  fsError?: string
  x: XContent
  threads: ThreadsContent
  note: NoteContent
  substack: SubstackContent
  releaseReview: {dir: string; files: ReleaseReviewLink[]}
}

// ---------- Generic markdown helpers ----------

function extractSection(md: string, title: string): string | null {
  const lines = md.split('\n')
  let startIdx = -1
  let startLevel = 0
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/)
    if (m && m[2].trim() === title) {
      startIdx = i + 1
      startLevel = m[1].length
      break
    }
  }
  if (startIdx === -1) return null
  let endIdx = lines.length
  for (let i = startIdx; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/)
    if (m && m[1].length <= startLevel) {
      endIdx = i
      break
    }
  }
  return lines.slice(startIdx, endIdx).join('\n').trim()
}

function extractBullets(section: string | null): string[] {
  if (!section) return []
  return section
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.substring(2).trim())
}

// Split a section into numbered posts of shape:
//   1/ ...
//   2/ ...
// Lines before the first "N/" are skipped (usually intro prose).
function extractNumberedThread(section: string | null): string[] {
  if (!section) return []
  const lines = section.split('\n')
  const posts: string[] = []
  let current: string[] = []
  let inPost = false
  for (const line of lines) {
    const m = line.match(/^(\d+)\/\s*(.*)$/)
    if (m) {
      if (inPost) posts.push(current.join('\n').trim())
      current = m[2] ? [m[2]] : []
      inPost = true
    } else if (inPost) {
      current.push(line)
    }
  }
  if (inPost) posts.push(current.join('\n').trim())
  return posts.filter((p) => p.length > 0)
}

async function readFileOrNull(absPath: string): Promise<string | null> {
  try {
    return await fs.readFile(absPath, 'utf8')
  } catch {
    return null
  }
}

async function listImageFiles(absDir: string): Promise<ImageRef[]> {
  let entries: import('node:fs').Dirent[]
  try {
    entries = await fs.readdir(absDir, {withFileTypes: true})
  } catch {
    return []
  }
  const out: ImageRef[] = []
  for (const e of entries) {
    if (!e.isFile()) continue
    const ext = path.extname(e.name).toLowerCase()
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue
    try {
      const stat = await fs.stat(path.join(absDir, e.name))
      out.push({
        filename: e.name,
        relativePath: path.relative(repoRoot(), path.join(absDir, e.name)),
        byteSize: stat.size,
      })
    } catch {
      // skip
    }
  }
  out.sort((a, b) => a.filename.localeCompare(b.filename))
  return out
}

function looksLikeStub(content: string | null): boolean {
  if (!content) return true
  const trimmed = content.trim()
  if (trimmed.length < 320) return true
  // Substack stubs have "TODO:" near the top.
  if (/^# .+\n+TODO:/m.test(trimmed)) return true
  return false
}

// ---------- Per-platform parsers ----------

async function parseX(slug: string): Promise<XContent> {
  const dir = repoPath('publish-packages/x', slug)
  const sourceAbs = path.join(dir, 'posts.md')
  const md = await readFileOrNull(sourceAbs)
  const images = await listImageFiles(path.join(dir, 'images'))
  if (!md) {
    return {
      available: false,
      sourceFile: path.relative(repoRoot(), sourceAbs),
      images,
      errors: [`Source file not found: ${path.relative(repoRoot(), sourceAbs)}`],
      alternateHooks: [],
      threadPosts: [],
      softCtas: [],
    }
  }
  const mainBlock = extractSection(md, 'Main Post Candidate')
  // Strip the trailing "Soft CTA:\n<line>" if present so the main post is clean.
  let mainPost: string | undefined
  if (mainBlock) {
    const softIdx = mainBlock.indexOf('Soft CTA:')
    mainPost = (softIdx >= 0 ? mainBlock.slice(0, softIdx) : mainBlock).trim()
  }
  return {
    available: true,
    sourceFile: path.relative(repoRoot(), sourceAbs),
    images,
    errors: [],
    mainPost,
    alternateHooks: extractBullets(extractSection(md, 'Alternate Main Hooks')),
    threadPosts: extractNumberedThread(extractSection(md, 'Optional Short Thread (4–7 posts)')),
    softCtas: extractBullets(extractSection(md, 'Soft CTAs (use sparingly)')),
  }
}

async function parseThreads(slug: string): Promise<ThreadsContent> {
  const dir = repoPath('publish-packages/threads', slug)
  const sourceAbs = path.join(dir, 'posts.md')
  const md = await readFileOrNull(sourceAbs)
  const images = await listImageFiles(path.join(dir, 'images'))
  if (!md) {
    return {
      available: false,
      sourceFile: path.relative(repoRoot(), sourceAbs),
      images,
      errors: [`Source file not found: ${path.relative(repoRoot(), sourceAbs)}`],
      alternateMainPosts: [],
      replyChain: [],
      softCtas: [],
    }
  }
  const discussionRaw = extractSection(md, 'Discussion Question')
  // The discussion section has the quoted question on the first non-blank line
  // wrapped in `「...」` — boss copies it as-is.
  return {
    available: true,
    sourceFile: path.relative(repoRoot(), sourceAbs),
    images,
    errors: [],
    mainPost: extractSection(md, 'Main Threads Post Candidate') ?? undefined,
    alternateMainPosts: extractBullets(extractSection(md, 'Alternate Main Posts (1つだけ採用)')),
    replyChain: extractNumberedThread(extractSection(md, 'Optional Reply Chain (4–8 reply)')),
    discussionQuestion: discussionRaw ?? undefined,
    softCtas: extractBullets(extractSection(md, 'Soft CTAs')),
  }
}

async function parseNote(slug: string): Promise<NoteContent> {
  const dir = repoPath('publish-packages/note', slug)
  const sourceAbs = path.join(dir, 'article.md')
  const insertMapAbs = path.join(dir, 'insert-map.md')
  const md = await readFileOrNull(sourceAbs)
  const insertMapMd = await readFileOrNull(insertMapAbs)
  const images = await listImageFiles(path.join(dir, 'images'))
  if (!md) {
    return {
      available: false,
      sourceFile: path.relative(repoRoot(), sourceAbs),
      images,
      errors: [`Source file not found: ${path.relative(repoRoot(), sourceAbs)}`],
      titleOptions: [],
      suggestedImageInsertionPoints: [],
      softCtas: [],
      insertMapStale: false,
    }
  }
  const insertMapStale =
    !!insertMapMd && /このplatform向けの画像がまだありません/.test(insertMapMd)
  return {
    available: true,
    sourceFile: path.relative(repoRoot(), sourceAbs),
    images,
    errors: [],
    titleOptions: extractBullets(extractSection(md, 'Title Options')),
    leadParagraph: extractSection(md, 'Lead Paragraph (冒頭リード)') ?? undefined,
    articleBody: extractSection(md, 'Main Body Draft') ?? undefined,
    suggestedImageInsertionPoints: extractBullets(
      extractSection(md, 'Suggested Image Insertion Points'),
    ),
    softCtas: extractBullets(extractSection(md, 'Soft CTA')),
    insertMapStale,
  }
}

async function parseSubstack(slug: string): Promise<SubstackContent> {
  const dir = repoPath('publish-packages/substack', slug)
  const sourceAbs = path.join(dir, 'post.md')
  const md = await readFileOrNull(sourceAbs)
  const images = await listImageFiles(path.join(dir, 'images'))
  const aboutPage = await readFileOrNull(path.join(dir, 'about-page.md'))
  const welcomeEmail = await readFileOrNull(path.join(dir, 'welcome-email.md'))
  const notesFile = await readFileOrNull(path.join(dir, 'notes.md'))
  if (!md) {
    return {
      available: false,
      sourceFile: path.relative(repoRoot(), sourceAbs),
      images,
      errors: [`Source file not found: ${path.relative(repoRoot(), sourceAbs)}`],
      titleOptions: [],
      emailSubjectOptions: [],
      aboutPageIsStub: looksLikeStub(aboutPage),
      welcomeEmailIsStub: looksLikeStub(welcomeEmail),
      notesFileIsStub: looksLikeStub(notesFile),
    }
  }
  return {
    available: true,
    sourceFile: path.relative(repoRoot(), sourceAbs),
    images,
    errors: [],
    titleOptions: extractBullets(extractSection(md, 'Title Options')),
    emailSubjectOptions: extractBullets(extractSection(md, 'Email Subject Options')),
    previewText: extractSection(md, 'Preview Text') ?? undefined,
    postBody: extractSection(md, 'Post Draft') ?? undefined,
    notesPlan: extractSection(md, 'Substack Notes Plan') ?? undefined,
    aboutPageIsStub: looksLikeStub(aboutPage),
    welcomeEmailIsStub: looksLikeStub(welcomeEmail),
    notesFileIsStub: looksLikeStub(notesFile),
  }
}

async function parseReleaseReview(slug: string): Promise<PublishPackage['releaseReview']> {
  const dir = repoPath('publish-packages/campaigns', `${slug}-release-review`)
  const items: Array<{label: string; filename: string}> = [
    {label: '最終チェックリスト', filename: 'final-human-checklist.md'},
    {label: 'X 最終レビュー', filename: 'x-final-review.md'},
    {label: 'Threads 最終レビュー', filename: 'threads-final-review.md'},
    {label: 'note 最終レビュー', filename: 'note-final-review.md'},
    {label: 'Substack 最終レビュー', filename: 'substack-final-review.md'},
  ]
  const files: ReleaseReviewLink[] = []
  for (const it of items) {
    const abs = path.join(dir, it.filename)
    let exists = false
    try {
      await fs.access(abs)
      exists = true
    } catch {
      exists = false
    }
    files.push({
      label: it.label,
      filename: it.filename,
      relativePath: path.relative(repoRoot(), abs),
      exists,
    })
  }
  return {dir: path.relative(repoRoot(), dir), files}
}

export async function readPublishPackage(slug: string): Promise<PublishPackage> {
  try {
    const [x, threads, note, substack, releaseReview] = await Promise.all([
      parseX(slug),
      parseThreads(slug),
      parseNote(slug),
      parseSubstack(slug),
      parseReleaseReview(slug),
    ])
    return {
      slug,
      fsAvailable: true,
      x,
      threads,
      note,
      substack,
      releaseReview,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown filesystem error'
    return {
      slug,
      fsAvailable: false,
      fsError: message,
      x: emptyPlatform<XContent>(slug, 'x', {
        alternateHooks: [],
        threadPosts: [],
        softCtas: [],
      }),
      threads: emptyPlatform<ThreadsContent>(slug, 'threads', {
        alternateMainPosts: [],
        replyChain: [],
        softCtas: [],
      }),
      note: emptyPlatform<NoteContent>(slug, 'note', {
        titleOptions: [],
        suggestedImageInsertionPoints: [],
        softCtas: [],
        insertMapStale: false,
      }),
      substack: emptyPlatform<SubstackContent>(slug, 'substack', {
        titleOptions: [],
        emailSubjectOptions: [],
        aboutPageIsStub: true,
        welcomeEmailIsStub: true,
        notesFileIsStub: true,
      }),
      releaseReview: {dir: '', files: []},
    }
  }
}

function emptyPlatform<T extends PlatformBase>(
  slug: string,
  platform: string,
  rest: Omit<T, keyof PlatformBase>,
): T {
  return {
    available: false,
    sourceFile: `publish-packages/${platform}/${slug}/`,
    images: [],
    errors: ['Filesystem unavailable'],
    ...rest,
  } as unknown as T
}
