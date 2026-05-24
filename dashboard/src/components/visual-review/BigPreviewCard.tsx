// BigPreviewCard — focused candidate preview on the candidates page.
// Uses native <img> served by the dev-only /api/visual-review/candidate-image
// route (no Next.js image optimization for already-bounded local PNGs). When
// the local FS feature flag is off, a placeholder explains the limitation.

import {Image as ImageIcon} from 'lucide-react'
import type {CandidateMeta} from '@/lib/inboxReader'

interface Props {
  candidate?: CandidateMeta | null
  enableLocalFsRoutes: boolean
}

function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function BigPreviewCard({candidate, enableLocalFsRoutes}: Props) {
  const dims =
    candidate?.pixelWidth && candidate.pixelHeight
      ? `${candidate.pixelWidth} × ${candidate.pixelHeight}`
      : null
  const src =
    candidate && enableLocalFsRoutes
      ? `/api/visual-review/candidate-image?path=${encodeURIComponent(candidate.relativePath)}`
      : null

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {candidate ? candidate.id : '候補プレビュー'}
          </h2>
          {candidate?.variant && (
            <p className="text-[11px] text-slate-500">variant: {candidate.variant}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] tabular-nums text-slate-600">
          {dims && (
            <span className="rounded bg-slate-100 px-2 py-0.5 ring-1 ring-inset ring-slate-200">
              {dims}
            </span>
          )}
          {candidate && (
            <span className="rounded bg-slate-100 px-2 py-0.5 ring-1 ring-inset ring-slate-200">
              {fmtBytes(candidate.fileSize)}
            </span>
          )}
        </div>
      </header>
      <div className="flex max-h-[640px] items-center justify-center bg-slate-50">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${candidate?.id ?? 'candidate'} preview`}
            loading="lazy"
            className="max-h-[640px] w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-slate-300">
            <ImageIcon size={48} aria-hidden="true" />
            <p className="text-xs text-slate-500">
              {enableLocalFsRoutes
                ? '候補画像はまだ生成されていません。'
                : 'ローカル候補プレビューは開発環境でのみ利用できます。'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
