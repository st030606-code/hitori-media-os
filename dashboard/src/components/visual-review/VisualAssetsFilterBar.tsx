'use client'

// VisualAssetsFilterBar — list-page filter row.
// P0: client-only state, no URL sync. P1 will wire URL searchParams.
// Native <select> / <input> only — no shadcn.

import {ChevronDown, Search} from 'lucide-react'
import type {VisualBucket} from '@/lib/visualAssets/buckets'
import {VISUAL_BUCKET_KEYS, VISUAL_BUCKET_LABEL} from '@/lib/visualAssets/buckets'

export interface VisualFilterValue {
  bucket: VisualBucket
  platform: string
  assetType: string
  sort: 'updated-desc' | 'updated-asc' | 'status' | 'platform'
  search: string
}

export const DEFAULT_FILTER: VisualFilterValue = {
  bucket: 'all',
  platform: '',
  assetType: '',
  sort: 'updated-desc',
  search: '',
}

interface Props {
  value: VisualFilterValue
  onChange: (next: Partial<VisualFilterValue>) => void
  platforms: string[]
  assetTypes: string[]
  counts: Record<VisualBucket, number>
}

export function VisualAssetsFilterBar({value, onChange, platforms, assetTypes, counts}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap items-center gap-1.5" role="tablist">
          {VISUAL_BUCKET_KEYS.map((k) => {
            const active = value.bucket === k
            return (
              <li key={k}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChange({bucket: k})}
                  className={
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ' +
                    (active
                      ? 'bg-blue-50 text-blue-700 ring-blue-200'
                      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')
                  }
                >
                  <span>{VISUAL_BUCKET_LABEL[k]}</span>
                  <span
                    className={
                      'rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums ' +
                      (active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700')
                    }
                  >
                    {counts[k] ?? 0}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="ビジュアル種別"
            value={value.assetType}
            onChange={(v) => onChange({assetType: v})}
            options={assetTypes}
            placeholder="すべて"
          />
          <FilterSelect
            label="カテゴリ"
            value={value.platform}
            onChange={(v) => onChange({platform: v})}
            options={platforms}
            placeholder="すべての媒体"
          />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">並び替え</span>
            <div className="relative">
              <select
                value={value.sort}
                onChange={(e) => onChange({sort: e.target.value as VisualFilterValue['sort']})}
                className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="updated-desc">更新が新しい順</option>
                <option value="updated-asc">更新が古い順</option>
                <option value="status">状態順</option>
                <option value="platform">媒体順</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-600">検索</span>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={value.search}
                onChange={(e) => onChange({search: e.target.value})}
                placeholder="slug / title"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>
        </div>
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
    </label>
  )
}
