'use client'

// OutputsView — client wrapper for /outputs that holds filter state and
// renders OutputsFilterBar + filtered OutputsTable. Receives all rows
// pre-built server-side from outputsListQuery; filtering happens in-memory
// (Phase UI-fidelity-2 visual fidelity only, URL search params come in
// Phase UI-3 with write actions).

import {useMemo, useState} from 'react'
import {OutputsFilterBar, DEFAULT_FILTER, type FilterState, type CampaignOption} from './OutputsFilterBar'
import {OutputsTable} from './OutputsTable'
import type {OutputRow} from '@/lib/groq/outputs'

interface Props {
  rows: OutputRow[]
  campaigns: CampaignOption[]
  platforms: string[]
}

function applyFilter(rows: OutputRow[], filter: FilterState): OutputRow[] {
  let out = rows
  if (filter.search.trim().length > 0) {
    const q = filter.search.trim().toLowerCase()
    out = out.filter((r) => {
      const haystack = [r.title, r.campaignTitle ?? '', r.platform, r.outputType ?? '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }
  if (filter.campaign) {
    out = out.filter((r) => r.campaignSlug === filter.campaign)
  }
  if (filter.platform) {
    out = out.filter((r) => r.platform === filter.platform)
  }
  if (filter.status) {
    out = out.filter((r) => r.bucket === filter.status)
  }
  if (filter.sort === 'updated-asc') {
    out = [...out].sort((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''))
  } else if (filter.sort === 'title-asc') {
    out = [...out].sort((a, b) => a.title.localeCompare(b.title, 'ja'))
  } // updated-desc is the default order from server
  return out
}

function hasActiveFilter(filter: FilterState): boolean {
  return (
    filter.search.length > 0 ||
    filter.campaign !== '' ||
    filter.platform !== '' ||
    filter.status !== '' ||
    filter.sort !== DEFAULT_FILTER.sort
  )
}

export function OutputsView({rows, campaigns, platforms}: Props) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const filteredRows = useMemo(() => applyFilter(rows, filter), [rows, filter])

  return (
    <div className="flex flex-col gap-5">
      <OutputsFilterBar
        value={filter}
        onChange={setFilter}
        onReset={() => setFilter(DEFAULT_FILTER)}
        campaigns={campaigns}
        platforms={platforms}
        hasActiveFilter={hasActiveFilter(filter)}
      />
      <OutputsTable rows={filteredRows} />
    </div>
  )
}
