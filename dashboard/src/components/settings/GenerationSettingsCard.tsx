// GenerationSettingsCard — content quality rules pulled from CLAUDE.md (the
// project-level instructions). Read-only chip list; editing happens by
// modifying CLAUDE.md directly.

import {Sparkles} from 'lucide-react'

interface Rule {
  text: string
  positive: boolean
}

const RULES: Rule[] = [
  {text: '発信者の視点を残す', positive: true},
  {text: '元レコードの主張と制約を守る', positive: true},
  {text: 'プラットフォームごとの形式に合わせる', positive: true},
  {text: '読者に合った言葉で書く', positive: true},
  {text: '実用的な次の行動を示す', positive: true},
  {text: 'AI っぽい水増し / 曖昧な励まし / 根拠のない主張を避ける', positive: false},
]

export function GenerationSettingsCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200"
          aria-hidden="true"
        >
          <Sparkles size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">生成ルール</h2>
          <p className="text-[11px] text-slate-500">
            <code>CLAUDE.md</code> の content quality 基準
          </p>
        </div>
      </header>

      <ul className="flex flex-wrap gap-1.5">
        {RULES.map((r) => (
          <li
            key={r.text}
            className={
              'rounded-md px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ' +
              (r.positive
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-rose-50 text-rose-800 ring-rose-200')
            }
          >
            {r.positive ? '✓ ' : '✗ '}
            {r.text}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-slate-500">
        ルールの編集はリポジトリ直下の <code>CLAUDE.md</code> を手動で更新します。Phase 2B 以降で dashboard 上の編集 UI を検討。
      </p>
    </section>
  )
}
