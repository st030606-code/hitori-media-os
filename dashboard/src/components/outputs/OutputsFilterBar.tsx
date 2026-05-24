'use client'

// OutputsFilterBar — native select + Tailwind controls.
// Phase UI-fidelity-2 (boss: shadcn select NO). Filter state is held by the
// parent OutputsView client wrapper; this component is purely presentational
// + emits change events.

import Link from 'next/link'
import {Search, Plus, RotateCcw} from 'lucide-react'

export interface CampaignOption {
  slug: string
  title: string
}

export interface FilterState {
  search: string
  campaign: string // '' = all
  platform: string // '' = all
  status: string // '' = all (values: draft / review / published / archived)
  sort: 'updated-desc' | 'updated-asc' | 'title-asc'
}

export const DEFAULT_FILTER: FilterState = {
  search: '',
  campaign: '',
  platform: '',
  status: '',
  sort: 'updated-desc',
}

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
  onReset: () => void
  campaigns: CampaignOption[]
  platforms: string[] // 既知 platform リスト (count > 0 を呼び出し側で絞っても良い)
  hasActiveFilter: boolean
}

const STATUS_OPTIONS = [
  {value: '', label: 'すべてのステータス'},
  {value: 'draft', label: '下書き'},
  {value: 'review', label: 'レビュー待ち'},
  {value: 'published', label: '公開済み'},
  {value: 'archived', label: 'アーカイブ'},
] as const

const SORT_OPTIONS = [
  {value: 'updated-desc', label: '更新日 (新しい順)'},
  {value: 'updated-asc', label: '更新日 (古い順)'},
  {value: 'title-asc', label: 'タイトル (昇順)'},
] as const

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[10rem] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  )
}

export function OutputsFilterBar({
  value,
  onChange,
  onReset,
  campaigns,
  platforms,
  hasActiveFilter,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 min-w-[220px] flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">検索</span>
          <div className="relative">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={value.search}
              onChange={(e) => onChange({...value, search: e.target.value})}
              placeholder="タイトル / キャンペーン名で検索"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </label>

        <SelectField
          label="キャンペーン"
          value={value.campaign}
          onChange={(v) => onChange({...value, campaign: v})}
        >
          <option value="">すべてのキャンペーン</option>
          {campaigns.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="プラットフォーム"
          value={value.platform}
          onChange={(v) => onChange({...value, platform: v})}
        >
          <option value="">すべての媒体</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="ステータス"
          value={value.status}
          onChange={(v) => onChange({...value, status: v})}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="ソート順"
          value={value.sort}
          onChange={(v) => onChange({...value, sort: v as FilterState['sort']})}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilter}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <RotateCcw size={12} aria-hidden="true" />
            リセット
          </button>
          <Link
            href="/configurator"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <Plus size={14} aria-hidden="true" />
            新規出力
          </Link>
        </div>
      </div>
    </section>
  )
}
