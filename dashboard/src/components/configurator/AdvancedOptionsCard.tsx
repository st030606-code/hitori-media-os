'use client'

// AdvancedOptionsCard — P1 detail card.
// 図解 toggle / レビュー要求度 select / 参照プロンプト select / キーワード input.
// Keywords are stored as string[] in FormValue.keywords. We expose a single
// comma- or whitespace-separated input field and parse client-side.

import {SlidersHorizontal} from 'lucide-react'
import type {ChangeEvent} from 'react'
import {
  REVIEW_LEVEL_OPTIONS,
  VISUAL_PREFERENCE_OPTIONS,
  type FormValue,
} from '@/lib/configurator/options'
import type {PromptTemplateOption} from '@/lib/groq/configurator'

interface Props {
  value: FormValue
  onChange: (next: Partial<FormValue>) => void
  promptTemplates: PromptTemplateOption[]
}

function parseKeywords(input: string): string[] {
  return input
    .split(/[,、\s]+/u)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function AdvancedOptionsCard({value, onChange, promptTemplates}: Props) {
  const onKeywords = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({keywords: parseKeywords(e.target.value)})
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200"
          aria-hidden="true"
        >
          <SlidersHorizontal size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">詳細条件を調整する</h2>
          <p className="text-[11px] text-slate-500">図解・レビュー・参照テンプレ・キーワード</p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/50 p-3">
          <input
            type="checkbox"
            checked={value.diagramEnabled}
            onChange={(e) => onChange({diagramEnabled: e.target.checked})}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-800">図解を同時生成する</span>
            <span className="text-[11px] text-slate-500">
              `diagram-prompt` も派生で出力します。本文と並行して投稿可能。
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">レビュー要求度</span>
            <select
              value={value.reviewLevel}
              onChange={(e) => onChange({reviewLevel: e.target.value})}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {REVIEW_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                  {o.hint ? ` — ${o.hint}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">ビジュアル方針</span>
            <select
              value={value.visualPreference}
              onChange={(e) => onChange({visualPreference: e.target.value})}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {VISUAL_PREFERENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                  {o.hint ? ` — ${o.hint}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">参照プロンプトテンプレ</span>
            <select
              value={value.promptTemplateId}
              onChange={(e) => onChange({promptTemplateId: e.target.value})}
              disabled={promptTemplates.length === 0}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {promptTemplates.length === 0 ? '（未登録）' : 'テンプレを選択…'}
              </option>
              {promptTemplates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title ?? t._id}
                  {t.category ? ` (${t.category})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">キーワード (任意)</span>
          <input
            type="text"
            defaultValue={value.keywords.join(', ')}
            onChange={onKeywords}
            placeholder="例: ひとり運営, 構造化, building-in-public"
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {value.keywords.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1">
              {value.keywords.map((k, i) => (
                <li
                  key={i}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-inset ring-slate-200"
                >
                  {k}
                </li>
              ))}
            </ul>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">追加指示 (任意)</span>
          <textarea
            value={value.additionalInstructions}
            onChange={(e) => onChange({additionalInstructions: e.target.value})}
            rows={4}
            placeholder="例: 冒頭は問いかけから始める。体験談を 1 つ入れる。"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
    </section>
  )
}
