// Resolve the path to the repository root from inside the Next.js app.
//
// The dashboard is scaffolded as `dashboard/` inside the repo, so the repo
// root is one directory above the Next.js working directory.
//
// This is intentionally only usable from server-side code (Server Components,
// Route Handlers). Anywhere this is imported during a client bundle would not
// have access to a `process` object suitable for this; if that ever happens,
// Next.js will warn at build time.

import path from 'node:path'

export function repoRoot(): string {
  return path.resolve(process.cwd(), '..')
}

export function repoPath(...segments: string[]): string {
  return path.resolve(repoRoot(), ...segments)
}
