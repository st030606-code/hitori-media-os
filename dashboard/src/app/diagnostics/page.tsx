import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {notFound} from 'next/navigation'
import {repoRoot} from '@/lib/repoRoot'
import {enableDiagnostics} from '@/lib/featureFlags'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {EmptyState} from '@/components/EmptyState'
import {SectionHeader} from '@/components/SectionHeader'
import {StatusBadge} from '@/components/StatusBadge'
import {SummaryCard} from '@/components/SummaryCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const execFileAsync = promisify(execFile)

const CHECK_COMMAND = 'npm'
const CHECK_ARGS: readonly string[] = ['run', 'local:check']
const TIMEOUT_MS = 60_000

interface CheckItem {
  name: string
  ok: boolean
  details?: string
}

interface CheckResult {
  ok: boolean
  generatedAt?: string
  checks?: CheckItem[]
  raw: string
  stderr: string
  durationMs: number
  parseError?: string
  runError?: string
}

async function runLocalCheck(): Promise<CheckResult> {
  const start = Date.now()
  // Hardcoded command, no shell expansion, no user input — execFile is safer
  // than exec for that reason. cwd is pinned to the repo root.
  try {
    const {stdout, stderr} = await execFileAsync(CHECK_COMMAND, CHECK_ARGS as string[], {
      cwd: repoRoot(),
      timeout: TIMEOUT_MS,
      maxBuffer: 5 * 1024 * 1024,
      env: process.env,
    })
    const durationMs = Date.now() - start
    const raw = stdout.trim()
    // npm's "> ... > ..." prefix lines come first; strip them to find the JSON.
    const jsonStart = raw.indexOf('{')
    let parsed: {ok?: boolean; generatedAt?: string; checks?: CheckItem[]} | undefined
    let parseError: string | undefined
    if (jsonStart >= 0) {
      try {
        parsed = JSON.parse(raw.slice(jsonStart))
      } catch (err) {
        parseError = err instanceof Error ? err.message : 'unknown parse error'
      }
    } else {
      parseError = 'No JSON object found in stdout.'
    }
    return {
      ok: parsed?.ok ?? false,
      generatedAt: parsed?.generatedAt,
      checks: parsed?.checks,
      raw,
      stderr: stderr.trim(),
      durationMs,
      parseError,
    }
  } catch (err) {
    const durationMs = Date.now() - start
    return {
      ok: false,
      raw: '',
      stderr: '',
      durationMs,
      runError: err instanceof Error ? err.message : 'unknown run error',
    }
  }
}

export default async function DiagnosticsPage() {
  if (!enableDiagnostics) {
    notFound()
  }
  const result = await runLocalCheck()
  const lastRun = new Date().toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  const greenCount = result.checks?.filter((c) => c.ok).length ?? 0
  const redCount = result.checks?.filter((c) => !c.ok).length ?? 0
  const total = result.checks?.length ?? 0

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Diagnostics</h1>
        <p className="mt-1 text-sm text-slate-600">
          Server-side runs <code className="rounded bg-slate-100 px-1 py-0.5">npm run local:check</code> at the
          repo root and renders the JSON output. The command is hardcoded; no user input is accepted.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Overall"
          primary={result.runError ? 'error' : result.ok ? 'ok' : 'fail'}
          secondary={result.runError ? result.runError : 'as reported by local:check'}
        />
        <SummaryCard
          label="Checks green"
          primary={greenCount}
          secondary={total > 0 ? `${greenCount} / ${total}` : undefined}
        />
        <SummaryCard
          label="Checks red"
          primary={redCount}
          secondary={redCount === 0 ? 'all clear' : 'see details'}
        />
        <SummaryCard
          label="Duration"
          primary={`${(result.durationMs / 1000).toFixed(2)}s`}
          secondary={`run at ${lastRun}`}
        />
      </section>

      {result.runError ? (
        <EmptyState
          tone="error"
          title="Could not execute npm run local:check"
          body={result.runError}
        />
      ) : result.parseError ? (
        <EmptyState
          tone="error"
          title="local:check ran, but its stdout was not JSON-parseable"
          body={result.parseError}
        />
      ) : null}

      {result.checks && result.checks.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            title="Checks"
            description={`Parsed from JSON output. ${total} check${total === 1 ? '' : 's'}.`}
          />
          <ul className="divide-y divide-slate-100">
            {result.checks.map((c, i) => (
              <li key={`${c.name}-${i}`} className="flex flex-wrap items-start gap-3 py-2.5 text-sm">
                <StatusBadge state={c.ok ? 'done' : 'blocked'} label={c.ok ? 'ok' : 'fail'} />
                <div className="grow">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  {c.details && <p className="mt-0.5 text-xs text-slate-600">{c.details}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          title="Raw output"
          description="stdout from npm run local:check, useful when JSON parsing fails."
        />
        <details>
          <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
            Show stdout ({result.raw.length} chars)
          </summary>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-slate-900 p-3 text-[11px] text-slate-100">
{result.raw || '(empty)'}
          </pre>
        </details>
        {result.stderr && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
              Show stderr ({result.stderr.length} chars)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-900 p-3 text-[11px] text-amber-200">
{result.stderr}
            </pre>
          </details>
        )}
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          <strong className="font-semibold">Note.</strong> This page runs a real shell process at request time;
          it is only intended for the localhost dashboard. When this dashboard is deployed (Batch D), this
          route should either be disabled or replaced with a cached snapshot.
        </p>
      </section>
    </main>
  )
}
