// ContentOutputConfiguratorCard — preview-only hero card on Dashboard Home.
//
// Phase UI-2.5 polish:
//   - Hero treatment: subtle gradient header strip + accent icon
//   - "下書きを生成" CTA promoted to top-right of the header (acts as the
//     primary route into /configurator)
//   - Fake selects rendered with stronger borders (white bg + slate-200 ring)
//   - Bottom row with the large primary blue CTA preserved as a secondary
//     entry point so boss has the button visible both in the header and
//     the bottom of the card.

import Link from 'next/link'
import {Blocks, ArrowRight, Sparkles} from 'lucide-react'

interface FakeSelectProps {
  label: string
  value: string
  required?: boolean
}

function FakeSelect({label, value, required}: FakeSelectProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-blue-600">*</span>}
      </span>
      <span className="flex h-9 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm transition-colors hover:border-slate-300">
        <span className="truncate">{value}</span>
        <span aria-hidden="true" className="ml-2 text-slate-400">
          ▾
        </span>
      </span>
    </label>
  )
}

export function ContentOutputConfiguratorCard() {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200"
            aria-hidden="true"
          >
            <Blocks size={20} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              コンテンツ出力コンフィギュレーター
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              1 つのアイデアを媒体別に展開します。フル機能は Phase UI-4 で実装。
            </p>
          </div>
        </div>
        <Link
          href="/configurator"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <Sparkles size={14} aria-hidden="true" />
          下書きを生成
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
        <FakeSelect label="元アイデア" value="building-hitori-media-os" required />
        <FakeSelect label="出力先" value="note" />
        <FakeSelect label="出力形式" value="note 記事" />
        <FakeSelect label="目的" value="信頼形成" />
        <FakeSelect label="トーン" value="実践的" />
        <FakeSelect label="CTA" value="Substack 購読" />
        <FakeSelect label="出力長さ" value="中（2,000〜4,000字）" />
        <FakeSelect label="参照プロンプト" value="japanese-devlog-v1" />
      </div>

      <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">
          下書きの生成は <code className="rounded bg-white px-1 py-0.5 text-[11px] text-slate-700 ring-1 ring-inset ring-slate-200">/configurator</code> で行います（Phase UI-4）。
        </p>
        <Link
          href="/configurator"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          出力コンフィギュレーターを開く
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </footer>
    </section>
  )
}
