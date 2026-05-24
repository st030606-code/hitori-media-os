// /visual-assets — Visual Review list (Phase UI-fidelity-7).
//
// Layout:
//   PageHeader + breadcrumb
//   LocalModeBanner (local FS state)
//   KpiCardsRow (5 buckets per docs/77 §3)
//   VisualAssetsListView (client wrapper: FilterBar + AssetCardGrid)
//   Visual Register CTA card
// Read-only, server-side GROQ fetch; client wrapper handles filter state.
//
// P1 additions:
//   - searchParams parsed into initialFilter so URL state is shareable
//   - latestInboxPaths precomputed server-side under enableLocalFsRoutes so
//     AssetCard can show the newest v00N rather than always v001.

import {
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  Hourglass,
  RefreshCw,
  Save,
} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanListQuery, type VisualAssetPlanListItem} from '@/lib/groq/campaign'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {LocalModeBanner} from '@/components/visual-review/LocalModeBanner'
import {VisualAssetsListView} from '@/components/visual-review/VisualAssetsListView'
import {countByBucket, VISUAL_BUCKET_KEYS, campaignSlugFromAssetId} from '@/lib/visualAssets/buckets'
import {getLatestInboxCandidate} from '@/lib/visualAssets/inboxLookup'
import {DEFAULT_FILTER, type VisualFilterValue} from '@/components/visual-review/VisualAssetsFilterBar'
import {assetSlugFromId} from '@/lib/assetRoleJa'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const neutralTrend = {value: '—', direction: 'flat' as const, periodLabel: '前月比'}
const SORT_VALUES: VisualFilterValue['sort'][] = ['updated-desc', 'updated-asc', 'status', 'platform']

function uniqSorted(items: Array<string | undefined>): string[] {
  const set = new Set<string>()
  for (const it of items) if (it) set.add(it)
  return Array.from(set).sort()
}

function pickString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? ''
  return v ?? ''
}

function resolveInitialFilter(sp: Record<string, string | string[] | undefined>): VisualFilterValue {
  const bucketRaw = pickString(sp.bucket)
  const bucket = (VISUAL_BUCKET_KEYS as ReadonlyArray<string>).includes(bucketRaw)
    ? (bucketRaw as VisualFilterValue['bucket'])
    : DEFAULT_FILTER.bucket
  const sortRaw = pickString(sp.sort) as VisualFilterValue['sort']
  const sort = SORT_VALUES.includes(sortRaw) ? sortRaw : DEFAULT_FILTER.sort
  return {
    bucket,
    platform: pickString(sp.platform),
    assetType: pickString(sp.assetType),
    sort,
    search: pickString(sp.q),
  }
}

async function buildLatestInboxPaths(plans: VisualAssetPlanListItem[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  if (!enableLocalFsRoutes) return out
  await Promise.all(
    plans.map(async (p) => {
      const campaignSlug = campaignSlugFromAssetId(p._id)
      const assetSlug = p.slug ?? assetSlugFromId(p._id)
      if (!campaignSlug || !assetSlug) return
      const latest = await getLatestInboxCandidate(campaignSlug, assetSlug)
      if (latest) out[p._id] = latest.relativePath
    }),
  )
  return out
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VisualAssetsPage({searchParams}: PageProps) {
  const sp = await searchParams
  const initialFilter = resolveInitialFilter(sp)
  const plans = await sanityClient.fetch<VisualAssetPlanListItem[]>(visualAssetPlanListQuery)
  const [counts, latestInboxPaths] = [
    countByBucket(plans),
    await buildLatestInboxPaths(plans),
  ]
  const platforms = uniqSorted(plans.map((p) => p.targetPlatform))
  const assetTypes = uniqSorted(plans.map((p) => p.assetType))
  const hasPlans = plans.length > 0

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="図解レビュー"
        description="図解・画像候補を確認し、採用候補を整理します。"
        breadcrumb={[{label: 'ダッシュボード', href: '/'}, {label: '図解レビュー'}]}
        actions={
          <a
            href="http://localhost:3334"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Visual Register を開く
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
      />

      <LocalModeBanner enableLocalFsRoutes={enableLocalFsRoutes} />

      <KpiCardsRow>
        <KpiCard
          label="すべて"
          value={counts.all}
          icon={ImageIcon}
          tone="slate"
          trend={neutralTrend}
          secondary="visualAssetPlan"
        />
        <KpiCard
          label="候補あり"
          value={counts.candidates}
          icon={Hourglass}
          tone="orange"
          trend={neutralTrend}
          secondary="prompt-ready / 保存待ち"
        />
        <KpiCard
          label="承認済み"
          value={counts.approved}
          icon={CheckCircle2}
          tone="emerald"
          trend={neutralTrend}
          secondary="reviewed 以上"
        />
        <KpiCard
          label="要再生成"
          value={counts['needs-regen']}
          icon={RefreshCw}
          tone="red"
          trend={neutralTrend}
          secondary="archive / 再生成候補"
        />
        <KpiCard
          label="保存済み"
          value={counts.saved}
          icon={Save}
          tone="blue"
          trend={neutralTrend}
          secondary="未レビュー"
        />
      </KpiCardsRow>

      {hasPlans ? (
        <VisualAssetsListView
          plans={plans}
          enableLocalFsRoutes={enableLocalFsRoutes}
          counts={counts}
          platforms={platforms}
          assetTypes={assetTypes}
          initialFilter={initialFilter}
          latestInboxPaths={latestInboxPaths}
        />
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">
            Sanityに図解計画がまだ登録されていません
          </h2>
          <p className="mt-2 text-slate-600">
            <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">
              visualAssetPlan
            </code>{' '}
            ドキュメントを Sanity Studio で 1 件作成すると、ここに表示されます。
          </p>
          <p className="mt-2 text-slate-600">
            seed を投入する場合は <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">npx sanity documents create</code> を使用します。
          </p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">
            承認作業は Visual Register で行います
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Phase Admin 1 は読み取り専用です。approve &amp; register はローカルの Visual Register に残しています。
          </p>
        </header>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          <li>
            リポジトリルートで{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">
              npm run visual:register
            </code>{' '}
            を実行
          </li>
          <li>
            ブラウザで{' '}
            <a
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
            >
              http://localhost:3334
            </a>{' '}
            を開く
          </li>
          <li>
            inbox 候補を「approve &amp; register」すると{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs ring-1 ring-inset ring-slate-200">
              assets/visuals/
            </code>{' '}
            にコピー + Sanity patch JSON が生成されます
          </li>
        </ol>
      </section>
    </main>
  )
}
