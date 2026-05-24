// PackageHeroCard — Publish Management top hero card.
// Shows campaign title + status badge + description + meta + cover placeholder.
// Computes a derived overall status: "公開済み" (all platforms done) /
// "公開準備OK" (no pending review gates) / "公開予定" (some pending) /
// "下書き" (none done yet).

import {Send, Eye, Image as ImageIcon, FileText} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import type {CampaignPlanDetail} from '@/lib/groq/campaign'

interface Props {
  campaign: CampaignPlanDetail
}

interface HeroStatus {
  label: string
  state: string
  tone: 'done' | 'progress' | 'pending'
}

function computeStatus(campaign: CampaignPlanDetail): HeroStatus {
  const items = campaign.manualPublishingStatus ?? []
  const tracked = items.filter((i) => i.platform)
  const done = tracked.filter((i) => i.state === 'done' && !!i.publishedUrl).length
  const total = tracked.length
  const pendingGates = (campaign.humanReviewGates ?? []).filter(
    (g) =>
      g.state === 'pending-review' || g.state === 'in-progress' || g.state === 'blocked',
  ).length

  if (total > 0 && done === total) {
    return {label: '公開済み', state: 'done', tone: 'done'}
  }
  if (done > 0 && done < total) {
    return {label: '一部公開済み', state: 'pending-review', tone: 'progress'}
  }
  if (pendingGates > 0) {
    return {label: 'レビュー待ち', state: 'pending-review', tone: 'progress'}
  }
  if (total > 0) {
    return {label: '公開準備OK', state: 'ready', tone: 'pending'}
  }
  return {label: '下書き', state: 'draft', tone: 'pending'}
}

function isoToShortJst(iso?: string): string | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  const d = new Date(ms + 9 * 60 * 60 * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day} JST`
}

export function PackageHeroCard({campaign}: Props) {
  const status = computeStatus(campaign)
  const publishing = campaign.manualPublishingStatus ?? []
  const platformsTotal = (campaign.selectedPlatforms ?? []).filter((p) => p.enabled !== false).length
  const platformsDone = publishing.filter(
    (i) => i.state === 'done' && !!i.publishedUrl,
  ).length
  const visualsTotal = (campaign.visualAssetDetails ?? []).length
  const visualsDone = (campaign.visualAssetDetails ?? []).filter(
    (v) => v.state === 'done' || v.plan?.status === 'saved',
  ).length
  const latestPublishedAt = publishing
    .map((i) => i.publishedAt)
    .filter((s): s is string => !!s)
    .sort()
    .at(-1)

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        {/* Cover placeholder */}
        <div
          aria-hidden="true"
          className="flex h-24 w-32 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 via-purple-50 to-emerald-50 ring-1 ring-inset ring-slate-200 sm:h-28 sm:w-40"
        >
          <Send size={28} className="text-blue-700/70" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              Publish Package
            </span>
            <StatusBadge state={status.state} label={status.label} />
          </div>
          <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
            {campaign.title ?? campaign._id}
          </h2>
          {campaign.coreThesis && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {campaign.coreThesis}
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="公開済み" icon={Send} primary={`${platformsDone} / ${platformsTotal || publishing.length}`} hint="媒体" />
            <Stat
              label="画像・図解"
              icon={ImageIcon}
              primary={`${visualsDone} / ${visualsTotal}`}
              hint="配布済み"
            />
            <Stat
              label="確認待ち"
              icon={Eye}
              primary={String(
                (campaign.humanReviewGates ?? []).filter(
                  (g) =>
                    g.state === 'pending-review' ||
                    g.state === 'in-progress' ||
                    g.state === 'blocked',
                ).length,
              )}
              hint="人間判定"
            />
            <Stat
              label="最終公開"
              icon={FileText}
              primary={isoToShortJst(latestPublishedAt) ?? '—'}
              hint="(直近)"
            />
          </dl>
        </div>
      </div>
    </section>
  )
}

function Stat({
  label,
  icon: Icon,
  primary,
  hint,
}: {
  label: string
  icon: React.ComponentType<{size?: number; className?: string}>
  primary: string
  hint?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
        <Icon size={12} aria-hidden="true" className="text-slate-400" />
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">{primary}</div>
      {hint && <div className="text-[10px] text-slate-500">{hint}</div>}
    </div>
  )
}
