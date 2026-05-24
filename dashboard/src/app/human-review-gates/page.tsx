// /human-review-gates — 確認待ちゲート (Phase UI-fidelity-10).
//
// Aggregates humanReviewGates across all campaignPlan documents and groups
// them by state. Data fetch + flatten + formatDate are unchanged from the
// previous implementation — only the surrounding presentation moved to
// PageHeader + KpiCardsRow + inline section headers per bucket.

import Link from 'next/link'
import {AlertOctagon, Clock, Eye, Loader} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {enableWriteActions} from '@/lib/featureFlags'
import {
  pendingHumanReviewGatesQuery,
  type PendingGatesByCampaign,
  type HumanReviewGate,
} from '@/lib/groq/campaign'
import {StatusBadge} from '@/components/StatusBadge'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard, type KpiTone} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {UndoToastHost} from '@/components/common/UndoToastHost'
import {GateStateControl} from '@/components/gates/GateStateControl'
import {isGateState, type HumanReviewGateState} from '@/lib/gates/stateTransitions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}

interface FlatGate {
  campaignId: string
  campaignRev?: string
  campaignTitle?: string
  campaignSlug?: string
  campaignStatus?: string
  gate: HumanReviewGate
}

type BucketKey = 'pending-review' | 'in-progress' | 'blocked' | 'not-started'

interface BucketDef {
  key: BucketKey
  title: string
  description: string
  icon: LucideIcon
  tone: KpiTone
}

const BUCKETS: BucketDef[] = [
  {
    key: 'pending-review',
    title: 'レビュー待ち',
    description: '人間判定を待っている gate',
    icon: Eye,
    tone: 'orange',
  },
  {
    key: 'in-progress',
    title: '作業中',
    description: 'レビュー進行中',
    icon: Loader,
    tone: 'blue',
  },
  {
    key: 'blocked',
    title: 'ブロック',
    description: '次工程に進めない状態',
    icon: AlertOctagon,
    tone: 'red',
  },
  {
    key: 'not-started',
    title: '未着手',
    description: 'まだ着手していない',
    icon: Clock,
    tone: 'slate',
  },
]

function flatten(campaigns: PendingGatesByCampaign[]): Record<BucketKey, FlatGate[]> {
  const buckets: Record<BucketKey, FlatGate[]> = {
    'pending-review': [],
    'in-progress': [],
    blocked: [],
    'not-started': [],
  }
  for (const c of campaigns) {
    for (const g of c.gates ?? []) {
      const key = (g.state ?? 'not-started').toLowerCase() as BucketKey
      if (!(key in buckets)) continue
      buckets[key].push({
        campaignId: c._id,
        campaignRev: c._rev,
        campaignTitle: c.title,
        campaignSlug: c.slug,
        campaignStatus: c.status,
        gate: g,
      })
    }
  }
  return buckets
}

function formatDate(value?: string): string | null {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export default async function HumanReviewGatesPage() {
  const campaigns = await sanityClient.fetch<PendingGatesByCampaign[]>(
    pendingHumanReviewGatesQuery,
  )
  const buckets = flatten(campaigns)
  const counts: Record<BucketKey, number> = {
    'pending-review': buckets['pending-review'].length,
    'in-progress': buckets['in-progress'].length,
    blocked: buckets.blocked.length,
    'not-started': buckets['not-started'].length,
  }
  const totalActive = counts['pending-review'] + counts['in-progress'] + counts.blocked
  const totalAll = totalActive + counts['not-started']
  const writeReady = enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)

  // Phase 2B-2 diagnostic (smoke fix 0184): if write actions are enabled but
  // any non-terminal gate row is missing `_key` or `_rev`, the change-state
  // button can't bind to a patchable identifier. Surface the diagnosis in
  // server stdout so the boss can see the data shape without exposing notes
  // or tokens.
  if (writeReady) {
    let editable = 0
    let missing = 0
    for (const c of campaigns) {
      for (const g of c.gates ?? []) {
        if (!isGateState(g.state)) continue
        const hasKey = typeof g._key === 'string' && g._key.length > 0
        const hasRev = typeof c._rev === 'string' && c._rev.length > 0
        if (hasKey && hasRev) editable += 1
        else missing += 1
      }
    }
    // eslint-disable-next-line no-console
    console.log('[hrg:diag]', {
      writeReady,
      campaigns: campaigns.length,
      editableGates: editable,
      missingIdentityGates: missing,
    })
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="確認待ちゲート"
        description="全キャンペーン横断の human review gate を bucket 別に表示します。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '確認待ちゲート'}]}
        meta={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span className="tabular-nums">active: {totalActive} 件</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">未着手: {counts['not-started']} 件</span>
          </span>
        }
      />

      <KpiCardsRow>
        {BUCKETS.map((b) => (
          <KpiCard
            key={b.key}
            label={b.title}
            value={counts[b.key]}
            icon={b.icon}
            tone={b.tone}
            trend={neutralTrend}
            secondary={b.description}
          />
        ))}
      </KpiCardsRow>

      {totalAll === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">レビューゲートがありません</h2>
          <p className="mt-2 text-slate-600">
            <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">campaignPlan.humanReviewGates</code>{' '}
            に登録があると、ここに bucket 別で表示されます。
          </p>
        </section>
      ) : (
        <UndoToastHost>
          {BUCKETS.map((b) => {
            const items = buckets[b.key]
            return (
              <section
                key={b.key}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{b.title}</h2>
                    <p className="text-[11px] text-slate-500">{b.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200">
                    {items.length}
                  </span>
                </header>

                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-[11px] text-slate-500">
                    この状態の gate はありません。
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {items.map((it, i) => {
                      const at = formatDate(it.gate.completedAt)
                      const hasLongNotes = !!it.gate.notes && it.gate.notes.length > 160
                      // We always render <GateStateControl>; the control
                      // itself decides which affordance to show based on
                      // writeReady and the presence of `_key` / `_rev`. A
                      // gate whose state is outside the schema enum falls
                      // back to a bare <StatusBadge> with no control.
                      const stateIsKnown = isGateState(it.gate.state)
                      return (
                        <li
                          key={`${it.campaignId}-${it.gate._key ?? i}`}
                          className="flex flex-col gap-1 py-2.5 text-sm"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {it.gate.gateName ?? '(unnamed gate)'}
                            </span>
                            {stateIsKnown ? (
                              <GateStateControl
                                campaignId={it.campaignId}
                                campaignRev={it.campaignRev}
                                gateKey={it.gate._key}
                                gateName={it.gate.gateName ?? '(unnamed gate)'}
                                initialState={it.gate.state as HumanReviewGateState}
                                writeReady={writeReady}
                              />
                            ) : (
                              <StatusBadge state={it.gate.state} />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                            <span>
                              campaign:{' '}
                              <Link
                                className="font-medium text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
                                href={`/campaigns/${it.campaignSlug ?? ''}`}
                              >
                                {it.campaignTitle ?? it.campaignId}
                              </Link>{' '}
                              <span className="text-slate-400">
                                (<code>{it.campaignSlug ?? it.campaignId}</code>)
                              </span>
                            </span>
                            {it.gate.reviewer && <span>reviewer: {it.gate.reviewer}</span>}
                            {at && <span className="tabular-nums">at: {at}</span>}
                          </div>
                          {it.gate.notes &&
                            (hasLongNotes ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-slate-700 hover:text-slate-900">
                                  <span className="line-clamp-2 align-baseline">
                                    {it.gate.notes}
                                  </span>
                                </summary>
                                <p className="mt-1 whitespace-pre-line rounded-md bg-slate-50 px-3 py-2 text-slate-700 ring-1 ring-inset ring-slate-200">
                                  {it.gate.notes}
                                </p>
                              </details>
                            ) : (
                              <p className="line-clamp-2 text-xs text-slate-700">{it.gate.notes}</p>
                            ))}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </UndoToastHost>
      )}
    </main>
  )
}
