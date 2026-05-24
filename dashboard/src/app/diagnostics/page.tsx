// /diagnostics — 診断 (Phase UI-fidelity-8).
//
// Server-side runs `npm run local:check` at the repo root and renders the
// JSON output. The command is hardcoded; no user input is accepted. Dev-only
// (production returns 404 via the feature flag).
//
// runLocalCheck logic and JSON parsing are unchanged from the previous
// implementation — only the surrounding presentation moved to PageHeader +
// KpiCardsRow + inline empty/error.

import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {notFound} from 'next/navigation'
import {Activity, AlertTriangle, CheckCircle2, Timer, XCircle} from 'lucide-react'
import {repoRoot} from '@/lib/repoRoot'
import {enableDiagnostics} from '@/lib/featureFlags'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard, type KpiTone} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {StatusBadge} from '@/components/StatusBadge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const execFileAsync = promisify(execFile)

const CHECK_COMMAND = 'npm'
const CHECK_ARGS: readonly string[] = ['run', 'local:check']
const TIMEOUT_MS = 60_000

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

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

function overallTone(result: CheckResult): {tone: KpiTone; value: string} {
  if (result.runError) return {tone: 'red', value: 'error'}
  if (!result.ok) return {tone: 'red', value: 'fail'}
  return {tone: 'emerald', value: 'ok'}
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
  const overall = overallTone(result)

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="診断"
        description="server 側で `npm run local:check` を実行し、結果を表示します。コマンドはハードコード、ユーザー入力は受け付けません。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '診断'}]}
        meta={<span>last run: <span className="tabular-nums">{lastRun}</span></span>}
      />

      <KpiCardsRow>
        <KpiCard
          label="結果"
          value={overall.value}
          icon={Activity}
          tone={overall.tone}
          trend={neutralTrend}
          secondary={
            result.runError
              ? result.runError
              : result.parseError
                ? 'JSON parse 失敗'
                : 'as reported by local:check'
          }
        />
        <KpiCard
          label="成功"
          value={greenCount}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          secondary={total > 0 ? `${greenCount} / ${total}` : '—'}
        />
        <KpiCard
          label="失敗"
          value={redCount}
          icon={XCircle}
          tone={redCount === 0 ? 'slate' : 'red'}
          trend={neutralTrend}
          secondary={redCount === 0 ? 'all clear' : 'see details'}
        />
        <KpiCard
          label="所要時間"
          value={`${(result.durationMs / 1000).toFixed(2)}s`}
          icon={Timer}
          tone="slate"
          trend={neutralTrend}
          secondary={`run at ${lastRun}`}
        />
      </KpiCardsRow>

      {result.runError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">npm run local:check を実行できませんでした</p>
          <p className="mt-1 text-[12px]">{result.runError}</p>
        </section>
      )}
      {!result.runError && result.parseError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">local:check は実行できたが、stdout が JSON として parse できませんでした</p>
          <p className="mt-1 text-[12px]">{result.parseError}</p>
        </section>
      )}

      {result.checks && result.checks.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">チェック</h2>
              <p className="text-[11px] text-slate-500">
                JSON 出力から parse。{total} 件のチェック
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200">
              {greenCount} / {total}
            </span>
          </header>
          <ul className="divide-y divide-slate-100">
            {result.checks.map((c, i) => (
              <li
                key={`${c.name}-${i}`}
                className="flex flex-wrap items-start gap-3 py-2.5 text-sm"
              >
                <StatusBadge state={c.ok ? 'done' : 'blocked'} label={c.ok ? 'ok' : 'fail'} />
                <div className="min-w-0 grow">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  {c.details && (
                    <p className="mt-0.5 text-xs text-slate-600">{c.details}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">Raw output</h2>
          <p className="text-[11px] text-slate-500">
            <code>npm run local:check</code> の stdout。JSON parse が失敗したときに有用。
          </p>
        </header>
        <details>
          <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
            stdout を表示 ({result.raw.length} chars)
          </summary>
          <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-slate-100">
{result.raw || '(empty)'}
          </pre>
        </details>
        {result.stderr && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
              stderr を表示 ({result.stderr.length} chars)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
{result.stderr}
            </pre>
          </details>
        )}
      </section>

      <section className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200"
          aria-hidden="true"
        >
          <AlertTriangle size={14} />
        </span>
        <p>
          <strong className="font-semibold">注意。</strong>{' '}
          このページはリクエスト時に実シェルプロセスを起動します。localhost dashboard 専用です。
          dashboard を deploy する際 (Batch D) はこの route を無効化するか、cached snapshot に置き換える必要があります。
        </p>
      </section>
    </main>
  )
}
