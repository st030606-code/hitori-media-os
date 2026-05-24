// ReleaseNotesCard — right sidebar "リリースノート" card.
// Phase UI-fidelity-4: static highlights derived from current campaign state
// (manualPublishingStatus done count + visualsDone + reactionNotes preview).
// No write actions; "ハイライト" bullets are auto-generated from the
// campaign data.

import {FileText} from 'lucide-react'
import type {CampaignPlanDetail} from '@/lib/groq/campaign'

interface Props {
  campaign: CampaignPlanDetail
}

interface Highlight {
  text: string
}

function buildHighlights(campaign: CampaignPlanDetail): Highlight[] {
  const out: Highlight[] = []
  const items = campaign.manualPublishingStatus ?? []
  const tracked = items.filter((i) => i.platform)
  const done = tracked.filter((i) => i.state === 'done' && !!i.publishedUrl).length
  const total = tracked.length
  const pending = total - done

  if (done > 0) {
    const platforms = tracked
      .filter((i) => i.state === 'done' && !!i.publishedUrl)
      .map((i) => i.platform)
      .filter(Boolean)
      .join(' / ')
    out.push({text: `${platforms} で公開完了 (${done}/${total} 媒体)`})
  }
  if (pending > 0) {
    const pendingPlatforms = tracked
      .filter((i) => !(i.state === 'done' && i.publishedUrl))
      .map((i) => i.platform)
      .filter(Boolean)
      .join(' / ')
    out.push({text: `${pendingPlatforms} は次回以降に公開予定`})
  }
  const visuals = campaign.visualAssetDetails ?? []
  const visualsDone = visuals.filter(
    (v) => v.state === 'done' || v.plan?.status === 'saved',
  ).length
  if (visuals.length > 0) {
    out.push({text: `画像・図解 ${visualsDone}/${visuals.length} 配布済み`})
  }
  if (campaign.coreThesis) {
    out.push({text: `coreThesis: ${campaign.coreThesis.slice(0, 60)}${campaign.coreThesis.length > 60 ? '…' : ''}`})
  }
  if (out.length === 0) {
    out.push({text: '公開状況のサマリーが揃ったらここに表示します。'})
  }
  return out
}

export function ReleaseNotesCard({campaign}: Props) {
  const highlights = buildHighlights(campaign)
  const items = campaign.manualPublishingStatus ?? []
  const reactionPreview = items.find((i) => i.reactionNotes)?.reactionNotes

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200"
          aria-hidden="true"
        >
          <FileText size={14} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">リリースノート</h2>
          <p className="text-[11px] text-slate-500">今回のハイライト</p>
        </div>
      </header>
      <ul className="space-y-1.5 text-sm">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400"
            />
            <span className="text-slate-800">{h.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          反応サマリー
        </div>
        {reactionPreview ? (
          <p className="mt-1 text-xs text-slate-700">{reactionPreview}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            Phase UI-6 で <code className="rounded bg-white px-1">reactionNotes</code> から自動集計します。
          </p>
        )}
      </div>
    </section>
  )
}
