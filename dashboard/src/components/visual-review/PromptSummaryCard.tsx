// PromptSummaryCard — combines inbox prompt.md frontmatter + a body excerpt
// (read by the page server-side; passed here as a pre-truncated string), with
// a CopyButton to copy the full text. Used on both /visual-assets/[assetId]
// and /visual-assets/[assetId]/candidates.

import {Wand2} from 'lucide-react'
import type {PromptMeta} from '@/lib/inboxReader'
import {CopyButton} from '@/components/CopyButton'

interface Props {
  promptMeta: PromptMeta | null
  // The full prompt.md body (markdown), or null when the file doesn't exist.
  // Pre-truncation is handled here so callers don't need a 2nd helper.
  promptBody: string | null
  enableLocalFsRoutes: boolean
}

const EXCERPT_LEN = 800

function listOrDash(arr?: string[] | null): string {
  if (!arr || arr.length === 0) return '—'
  return arr.join(', ')
}

function excerpt(body: string): string {
  if (body.length <= EXCERPT_LEN) return body
  return body.slice(0, EXCERPT_LEN).trimEnd() + '\n…'
}

export function PromptSummaryCard({promptMeta, promptBody, enableLocalFsRoutes}: Props) {
  const hasAny = !!(promptMeta || promptBody)
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200"
            aria-hidden="true"
          >
            <Wand2 size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">プロンプト概要</h2>
            <p className="text-[11px] text-slate-500">
              <code>prompt.md</code> の frontmatter と本文抜粋
            </p>
          </div>
        </div>
        {promptBody && (
          <CopyButton text={promptBody} label="全文をコピー" tone="secondary" />
        )}
      </header>

      {!hasAny ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          {enableLocalFsRoutes
            ? 'inbox に prompt.md が見つかりません。tasks/visuals/ のブリーフから生成プロンプトを作ると、ここに表示されます。'
            : 'プロンプト本文は開発環境でのみ表示されます。ローカルで ENABLE_LOCAL_FS_ROUTES=true npm run dev を実行してください。'}
        </p>
      ) : (
        <>
          {promptMeta && (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <Pair label="用途 (assetPurpose)" value={promptMeta.assetPurpose ?? '—'} />
              <Pair label="媒体 (platform)" value={promptMeta.platform ?? '—'} />
              <Pair label="比率 (aspectRatio)" value={promptMeta.aspectRatio ?? '—'} />
              <Pair label="ピクセル (pixelSize)" value={promptMeta.pixelSize ?? '—'} />
              <Pair label="必須モジュール" value={listOrDash(promptMeta.requiredVisualModules)} />
              <Pair label="layoutPatterns" value={listOrDash(promptMeta.layoutPatterns)} />
              <Pair label="styleAnchors" value={listOrDash(promptMeta.styleAnchors)} />
              <Pair label="forbiddenPatterns" value={listOrDash(promptMeta.forbiddenPatterns)} />
            </dl>
          )}
          {promptBody && (
            <details className="mt-4 rounded-md border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
              <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
                本文抜粋 (先頭 {EXCERPT_LEN} 字)
              </summary>
              <pre className="mt-3 max-h-[360px] overflow-auto rounded bg-white px-3 py-2 text-[12px] leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-200">
                <code className="whitespace-pre-wrap break-words font-mono">{excerpt(promptBody)}</code>
              </pre>
            </details>
          )}
        </>
      )}
    </section>
  )
}

function Pair({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </>
  )
}
