import type {CampaignPlanDetail} from '@/lib/groq/campaign'
import {StatusBadge} from './StatusBadge'

export function CampaignStatusCard({campaign}: {campaign: CampaignPlanDetail}) {
  const progress = campaign.progressStatus ?? {}
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{campaign.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{campaign.slug ?? campaign._id}</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge state={campaign.status} label={`status: ${campaign.status ?? '—'}`} />
          <StatusBadge state="info" label={`type: ${campaign.campaignType ?? '—'}`} />
          <StatusBadge state="info" label={`mode: ${campaign.contentMode ?? '—'}`} />
          <StatusBadge state="info" label={`auto: ${campaign.automationLevel ?? '—'}`} />
        </div>
      </header>

      {campaign.coreThesis && (
        <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          {campaign.coreThesis}
        </p>
      )}

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-slate-500">Overall</dt>
          <dd className="mt-0.5">
            <StatusBadge state={progress.overall} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Text drafts</dt>
          <dd className="mt-0.5 text-slate-800">{progress.textDrafts ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Visuals</dt>
          <dd className="mt-0.5 text-slate-800">{progress.visuals ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Publish packages</dt>
          <dd className="mt-0.5 text-slate-800">{progress.publishPackages ?? '—'}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <dt className="font-medium text-slate-500">Release review</dt>
          <dd className="mt-0.5 text-slate-800">{progress.releaseReview ?? '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
