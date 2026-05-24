// Lightweight inbox lookup helpers used by Visual Review P1 cards
// (Phase UI-fidelity-7). These complement lib/inboxReader.ts:
//
//   - readAssetCandidates() loads candidate images + frontmatter for ONE asset
//     (parses prompt.md / review.md → expensive when scanning a list of assets)
//   - This file exposes a thin "just list directory entries" lookup for the
//     /visual-assets list page so AssetCard can show the latest v00N thumb
//     without paying the YAML / PNG-dim parse cost N times.
//
// All functions enforce the same slug-safety guard as inboxReader and never
// touch absolute paths or anything outside `assets/inbox/generated/`.

import path from 'node:path'
import {promises as fs, existsSync} from 'node:fs'
import {repoPath} from '@/lib/repoRoot'

const INBOX_PREFIX = 'assets/inbox/generated'
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/
const CANDIDATE_RE = /^v(\d{3})\.(?:png|jpg|jpeg|webp)$/i

function isSafeSlug(s: string | undefined | null): s is string {
  return typeof s === 'string' && SLUG_RE.test(s) && s !== '..' && s !== '.'
}

export interface LatestInboxCandidate {
  // e.g. "v003"
  id: string
  // e.g. "assets/inbox/generated/<campaign>/<asset>/v003.png"
  relativePath: string
  fileName: string
}

// Returns the highest-numbered v00N image found in the inbox folder, or null
// when the folder doesn't exist / has no v00N images / slugs are malformed.
// Does NOT parse PNG dimensions or YAML frontmatter — cheap enough to call
// once per AssetCard.
export async function getLatestInboxCandidate(
  campaignSlug: string,
  assetSlug: string,
): Promise<LatestInboxCandidate | null> {
  if (!isSafeSlug(campaignSlug) || !isSafeSlug(assetSlug)) return null
  const folderRel = `${INBOX_PREFIX}/${campaignSlug}/${assetSlug}`
  const folderAbs = repoPath(folderRel)
  if (!existsSync(folderAbs)) return null
  let entries: import('node:fs').Dirent[]
  try {
    entries = await fs.readdir(folderAbs, {withFileTypes: true})
  } catch {
    return null
  }
  let bestNum = -1
  let bestName: string | null = null
  for (const e of entries) {
    if (!e.isFile()) continue
    const m = CANDIDATE_RE.exec(e.name)
    if (!m) continue
    const n = parseInt(m[1], 10)
    if (!Number.isFinite(n)) continue
    if (n > bestNum) {
      bestNum = n
      bestName = e.name
    }
  }
  if (bestName === null) return null
  return {
    id: bestName.slice(0, bestName.lastIndexOf('.')),
    relativePath: `${folderRel}/${bestName}`,
    fileName: bestName,
  }
}

// Build the expected `patches/visual-assets/<campaign>/<asset>.json` path
// (Visual Register convention). Returns null when slugs are malformed. Does
// NOT check existence — the FilePathsCard just shows where the patch *would*
// land once approve & register has run.
export function expectedPatchPath(campaignSlug?: string | null, assetSlug?: string | null): string | null {
  if (!isSafeSlug(campaignSlug ?? undefined) || !isSafeSlug(assetSlug ?? undefined)) return null
  return `patches/visual-assets/${campaignSlug}/${assetSlug}.json`
}

// Read the full prompt.md body (raw markdown including frontmatter fence and
// body) for PromptSummaryCard. Returns null when the file doesn't exist or
// slugs are malformed. No parsing — PromptSummaryCard receives the body as a
// string and truncates client-side.
export async function readPromptBody(
  campaignSlug: string,
  assetSlug: string,
): Promise<string | null> {
  if (!isSafeSlug(campaignSlug) || !isSafeSlug(assetSlug)) return null
  const abs = repoPath(`${INBOX_PREFIX}/${campaignSlug}/${assetSlug}/prompt.md`)
  if (!existsSync(abs)) return null
  try {
    return await fs.readFile(abs, 'utf8')
  } catch {
    return null
  }
}
