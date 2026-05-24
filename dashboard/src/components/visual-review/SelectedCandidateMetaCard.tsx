// SelectedCandidateMetaCard — id / generatedAt / px / size / variant /
// layoutPattern / self-review for the currently focused candidate. The card
// also surfaces optional review notes from review.md.

import {Sparkles} from 'lucide-react'
import type {CandidateMeta} from '@/lib/inboxReader'

interface Props {
  candidate?: CandidateMeta | null
  rubricMaxScore?: number
}

function fmtBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function fmtJst(iso?: string | null): string {
  if (!iso) return '—'
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '—'
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm} JST`
}

function scoreClass(score: number | null, max: number | null | undefined): string {
  if (score == null) return 'text-slate-500'
  const m = max ?? 35
  if (score >= Math.ceil(m * 0.68)) return 'text-emerald-700'
  if (score >= Math.ceil(m * 0.51)) return 'text-amber-700'
  return 'text-rose-700'
}

export function SelectedCandidateMetaCard({candidate, rubricMaxScore}: Props) {
  if (!candidate) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <Sparkles size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">候補メタデータ</h2>
            <p className="text-[11px] text-slate-500">候補が未選択です</p>
          </div>
        </header>
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
          候補がまだありません。左側のサムネイルから 1 件を選ぶと、ここに詳細が表示されます。
        </p>
      </section>
    )
  }

  const dims =
    candidate.pixelWidth && candidate.pixelHeight
      ? `${candidate.pixelWidth} × ${candidate.pixelHeight}`
      : '—'
  const max = rubricMaxScore ?? 35

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <Sparkles size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{candidate.id} の詳細</h2>
            <p className="text-[11px] text-slate-500">{candidate.fileName}</p>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-500">ピクセル</dt>
        <dd className="tabular-nums text-slate-800">{dims}</dd>
        <dt className="text-slate-500">ファイルサイズ</dt>
        <dd className="tabular-nums text-slate-800">{fmtBytes(candidate.fileSize)}</dd>
        <dt className="text-slate-500">生成日時</dt>
        <dd className="tabular-nums text-slate-800">{fmtJst(candidate.generatedAt)}</dd>
        <dt className="text-slate-500">variant</dt>
        <dd className="text-slate-800">{candidate.variant ?? '—'}</dd>
        <dt className="text-slate-500">layoutPattern</dt>
        <dd className="text-slate-800">{candidate.layoutPattern ?? '—'}</dd>
        <dt className="text-slate-500">自己評価</dt>
        <dd className={`font-semibold tabular-nums ${scoreClass(candidate.score, max)}`}>
          {candidate.score == null ? '—' : `${candidate.score} / ${max}`}
        </dd>
      </dl>

      {candidate.notes && (
        <p className="mt-3 whitespace-pre-line rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-700 ring-1 ring-inset ring-slate-200">
          {candidate.notes}
        </p>
      )}
    </section>
  )
}
