import Link from 'next/link'
import {sanityClient, sanityConfig} from '@/lib/sanity'
import {dashboardHomeQuery, type DashboardHomeData} from '@/lib/groq/campaign'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {StatusBadge} from '@/components/StatusBadge'
import {WorkingPipelineStatus} from '@/components/WorkingPipelineStatus'
import {NextActionChecklist} from '@/components/NextActionChecklist'
import {ReleaseReviewLinks} from '@/components/ReleaseReviewLinks'
import {statusLabelJa} from '@/lib/statusJa'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchHome(): Promise<DashboardHomeData> {
  return await sanityClient.fetch<DashboardHomeData>(dashboardHomeQuery)
}

export default async function HomePage() {
  const data = await fetchHome()

  const visualPct =
    data.visualsTotal > 0 ? Math.round((data.visualsDone / data.visualsTotal) * 100) : 0
  const publishingTotal = data.manualPublishingPending + data.manualPublishingDone
  const publishingPct =
    publishingTotal > 0 ? Math.round((data.manualPublishingDone / publishingTotal) * 100) : 0

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">ひとりメディアOS 管理画面</h1>
        <p className="mt-1 text-sm text-slate-600">
          公開前レビュー用ダッシュボード。Sanity データセットの状態を読み取り専用で表示しています。
        </p>
      </header>

      {data.latest ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">対象キャンペーン</h2>
              <p className="mt-0.5 text-xs text-slate-500">最後に更新されたキャンペーン。</p>
            </div>
            <Link
              className="text-sm text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href={`/campaigns/${data.latest.slug ?? ''}`}
            >
              キャンペーン詳細を開く →
            </Link>
          </header>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-900">
              {data.latest.title ?? data.latest._id}
            </span>
            <StatusBadge
              state={data.latest.status}
              label={`状態: ${statusLabelJa(data.latest.status)}`}
            />
          </div>
          {data.latest.coreThesis && (
            <p className="mt-2 rounded bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {data.latest.coreThesis}
            </p>
          )}

          <details className="mt-3 text-xs text-slate-600">
            <summary className="cursor-pointer text-slate-500">詳細情報（開発者向け）</summary>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded bg-slate-100 px-1.5 py-0.5">
                slug: {data.latest.slug ?? data.latest._id}
              </code>
              <code className="rounded bg-slate-100 px-1.5 py-0.5">
                automation: {data.latest.automationLevel ?? '—'}
              </code>
            </div>
          </details>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          <p>キャンペーンプランがまだ登録されていません。</p>
        </section>
      )}

      <WorkingPipelineStatus />

      <section className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-emerald-950">公開パッケージを開く</h2>
            <p className="mt-0.5 text-xs text-emerald-900">
              各媒体への投稿文コピー、画像確認、手動公開のガイドが 1 画面にまとまっています。
            </p>
          </div>
          <Link
            href="/publish-package/building-hitori-media-os"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            公開パッケージを開く →
          </Link>
        </div>
      </section>

      <NextActionChecklist />

      <ReleaseReviewLinks />

      <details className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          詳細情報：データセット全体の数値
        </summary>
        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            label="キャンペーン"
            primary={`${data.campaignsActive}`}
            secondary={`active · ${data.campaignTotal} total`}
          />
          <OverviewCard
            label="確認待ちゲート"
            primary={`${data.pendingGatesTotal}`}
            secondary="pending-review · in-progress · blocked"
          />
          <OverviewCard
            label="画像進捗"
            primary={`${data.visualsDone} / ${data.visualsTotal}`}
            secondary={`${visualPct}% done across all campaigns`}
          />
          <OverviewCard
            label="手動公開"
            primary={`${data.manualPublishingDone} / ${publishingTotal}`}
            secondary={`${publishingPct}% published · ${data.manualPublishingPending} pending`}
          />
        </section>
      </details>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">外部ツール</h2>
        <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link className="text-sky-700 underline underline-offset-2 hover:text-sky-900" href="/campaigns">
              すべてのキャンペーンを開く →
            </Link>
          </li>
          <li>
            <Link
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="/human-review-gates"
            >
              確認待ちゲートを開く →
            </Link>
          </li>
          <li>
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visual Register を開く (localhost:3334) →
            </a>
          </li>
          <li>
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sanity Studio を開く (localhost:3333) →
            </a>{' '}
            <span className="text-xs text-slate-500">
              (project <code>{sanityConfig.projectId}</code>, dataset <code>{sanityConfig.dataset}</code>)
            </span>
          </li>
        </ul>
      </section>
    </main>
  )
}

function OverviewCard({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: string
  secondary?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{primary}</p>
      {secondary && <p className="mt-1 text-xs text-slate-500">{secondary}</p>}
    </div>
  )
}
