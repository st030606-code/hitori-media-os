// /settings — 設定 (Phase UI-fidelity-9).
//
// Read-only readout of the workspace identity + feature flags + local dev
// shortcuts + safety posture. Secret values are never displayed (boss
// decision): we show env names + on/off states only.

import {ChevronRight, ExternalLink} from 'lucide-react'
import Link from 'next/link'
import {sanityConfig} from '@/lib/sanity'
import {
  enableDiagnostics,
  enableLocalFsRoutes,
  activityLogMode,
  isProductionRuntime,
} from '@/lib/featureFlags'
import {PageHeader} from '@/components/common/PageHeader'
import {WorkspaceCard} from '@/components/settings/WorkspaceCard'
import {FeatureFlagsCard, type FlagRow} from '@/components/settings/FeatureFlagsCard'
import {LocalDevCard} from '@/components/settings/LocalDevCard'
import {SafetyReadOnlyCard} from '@/components/settings/SafetyReadOnlyCard'
import {GenerationSettingsCard} from '@/components/settings/GenerationSettingsCard'
import {PublishingSettingsCard} from '@/components/settings/PublishingSettingsCard'
import {FutureIntegrationsCard} from '@/components/settings/FutureIntegrationsCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STUDIO_BASE_URL = process.env.NEXT_PUBLIC_STUDIO_BASE_URL || 'http://localhost:3333'

function buildFlagRows(): FlagRow[] {
  return [
    {
      envName: 'ENABLE_DIAGNOSTICS',
      description: '/diagnostics ページ + Sidebar link',
      current: enableDiagnostics ? 'enabled' : 'disabled',
      devDefault: 'enabled',
      prodDefault: 'disabled',
      active: enableDiagnostics,
    },
    {
      envName: 'ENABLE_LOCAL_FS_ROUTES',
      description: '/publish-packages + /api/asset-thumb + 候補 thumbnail',
      current: enableLocalFsRoutes ? 'enabled' : 'disabled',
      devDefault: 'enabled',
      prodDefault: 'disabled',
      active: enableLocalFsRoutes,
    },
    {
      envName: 'ACTIVITY_LOG_MODE',
      description: '/activity-log のソース (fs or snapshot)',
      current: activityLogMode,
      devDefault: 'fs',
      prodDefault: 'snapshot',
      active: true,
    },
  ]
}

export default function SettingsPage() {
  const flags = buildFlagRows()
  const runtime = isProductionRuntime ? 'production' : 'development'

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="設定"
        description="現環境・feature flags・workspace 情報を確認します。書き込みは Sanity Studio / Vercel ダッシュボード / .env.local で。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '設定'}]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {enableDiagnostics ? (
              <Link
                href="/diagnostics"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                診断を開く
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                title="ENABLE_DIAGNOSTICS が off のため /diagnostics は 404 を返します"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
              >
                診断ページは現在無効です
                <ChevronRight size={14} aria-hidden="true" />
              </span>
            )}
            <a
              href={STUDIO_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Sanity Studio
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>runtime:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {runtime}
            </code>
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WorkspaceCard
          projectId={sanityConfig.projectId}
          dataset={sanityConfig.dataset}
          apiVersion={sanityConfig.apiVersion}
          hasReadToken={sanityConfig.hasReadToken}
          studioBaseUrl={STUDIO_BASE_URL}
        />
        <FeatureFlagsCard rows={flags} />
        <LocalDevCard enableDiagnostics={enableDiagnostics} />
        <SafetyReadOnlyCard />
        <GenerationSettingsCard />
        <PublishingSettingsCard />
      </div>

      <FutureIntegrationsCard />
    </main>
  )
}
