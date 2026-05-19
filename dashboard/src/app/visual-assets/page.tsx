import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanListQuery, type VisualAssetPlanListItem} from '@/lib/groq/campaign'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'
import {StatusBadge} from '@/components/StatusBadge'
import {SummaryCard} from '@/components/SummaryCard'
import {EmptyState} from '@/components/EmptyState'
import {FilePathBlock} from '@/components/FilePathBlock'
import {SectionHeader} from '@/components/SectionHeader'
import {statusLabelJa} from '@/lib/statusJa'
import {assetRoleJa, assetSlugFromId} from '@/lib/assetRoleJa'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Bucket the visualAssetPlan.status enum into 3 boss-friendly groups so the
// page doesn't show 10 thin slices for what is really "done / in flight / not
// started". Schema enum source: schemas/visualAssetPlan.ts.
const DONE_STATES = new Set(['saved', 'reviewed', 'approved', 'packaged', 'published'])
const SKIPPED_STATES = new Set(['skipped'])
const PENDING_STATES = new Set(['generated-needs-save'])
const PROGRESS_STATES = new Set(['prompt-ready']) // brief was prepared but no candidate yet
const PLANNED_STATES = new Set(['planned', 'brief-ready'])

type Bucket = 'done' | 'skipped' | 'pending' | 'progress' | 'planned' | 'other'

function bucketize(status?: string): Bucket {
  if (!status) return 'other'
  if (DONE_STATES.has(status)) return 'done'
  if (SKIPPED_STATES.has(status)) return 'skipped'
  if (PENDING_STATES.has(status)) return 'pending'
  if (PROGRESS_STATES.has(status)) return 'progress'
  if (PLANNED_STATES.has(status)) return 'planned'
  return 'other'
}

function formatDate(value?: string): string | null {
  if (!value) return null
  try {
    return new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return value
  }
}

export default async function VisualAssetsPage() {
  const items = await sanityClient.fetch<VisualAssetPlanListItem[]>(visualAssetPlanListQuery)

  const counts = items.reduce(
    (acc, it) => {
      const b = bucketize(it.status)
      acc[b] = (acc[b] ?? 0) + 1
      return acc
    },
    {done: 0, skipped: 0, pending: 0, progress: 0, planned: 0, other: 0} as Record<Bucket, number>,
  )
  const total = items.length

  const sections: Array<{
    key: Bucket
    title: string
    description: string
  }> = [
    {
      key: 'pending',
      title: '保存待ち',
      description: '生成済みだが Visual Register での approve & register 待ち。',
    },
    {
      key: 'progress',
      title: '作業中',
      description: 'プロンプト準備済み、候補画像はまだ生成されていない。',
    },
    {
      key: 'planned',
      title: '計画中 / 生成前',
      description: 'プランはあるが本番候補がまだない。',
    },
    {
      key: 'done',
      title: '完了',
      description: '保存済み / 確認済み / 承認済み / 配布準備済み / 公開済み。',
    },
    {
      key: 'skipped',
      title: '今回は保留',
      description: '本フェーズでは生成しない判断をした素材。後のフェーズで再評価。',
    },
    {
      key: 'other',
      title: 'その他 / 不明',
      description: '想定外、もしくはステータスなし。',
    },
  ]

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReadOnlyBanner />

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">画像・図解素材</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sanity データセット内の <code>visualAssetPlan</code> ドキュメント一覧。
          {total === 0
            ? ' 素材はまだ登録されていません。'
            : ` 全 ${total} 件。完了 ${counts.done} 件 / 今回は保留 ${counts.skipped} 件。`}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="合計" primary={total} />
        <SummaryCard label="完了" primary={counts.done} secondary="保存・確認・公開済み" />
        <SummaryCard label="今回は保留" primary={counts.skipped} secondary="後のフェーズで再評価" />
        <SummaryCard label="保存待ち" primary={counts.pending} secondary="生成済み・未保存" />
        <SummaryCard label="作業中" primary={counts.progress} secondary="プロンプト準備済み" />
        <SummaryCard label="計画中" primary={counts.planned} secondary="生成前 / 計画中" />
      </section>

      {enableLocalFsRoutes ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>
            <strong className="font-semibold">ローカルサムネイル表示が有効です。</strong>{' '}
            <code>assets/visuals/</code> 配下の画像は dev 専用の <code>/api/asset-thumb</code>{' '}
            経由で表示しています (8&nbsp;MB cap, prefix-restricted)。本番ビルドではこのルートは
            既定で無効化されます。<code>docs/60</code> 参照。
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong className="font-semibold">サムネイル表示は無効です。</strong> ローカル環境では{' '}
            <code>ENABLE_LOCAL_FS_ROUTES=true</code> を設定すると{' '}
            <code>/api/asset-thumb</code> ハンドラが有効になります。本番デプロイでは
            ビルド時スナップショット戦略 (Batch D2) ができるまで無効のままです。
          </p>
        </section>
      )}

      {sections.map((s) => {
        const bucketItems = items.filter((it) => bucketize(it.status) === s.key)
        if (bucketItems.length === 0) {
          // Skip empty "other" / "in flight" buckets to keep the page tight.
          if (s.key === 'other' || s.key === 'progress' || s.key === 'pending') return null
        }
        return (
          <section
            key={s.key}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SectionHeader
              title={s.title}
              description={s.description}
              right={
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {bucketItems.length}
                </span>
              }
            />
            {bucketItems.length === 0 ? (
              <p className="text-sm text-slate-500">—</p>
            ) : (
              <VisualAssetTable items={bucketItems} thumbsEnabled={enableLocalFsRoutes} />
            )}
          </section>
        )
      })}

      {items.length === 0 && (
        <EmptyState
          title="データセットに visualAssetPlan が登録されていません。"
          body="npx sanity documents create でシードを投入するか、データセットが private の場合は SANITY_READ_TOKEN を確認してください。"
        />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          title="承認作業は Visual Register で行います"
          description="Phase Admin 1 は読み取り専用。approve & register はローカルの Visual Register に残しています。"
        />
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            Inbox Review（<code className="rounded bg-slate-100 px-1">approve &amp; register</code>）は
            ローカルの{' '}
            <a
              className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visual Register
            </a>{' '}
            (<code>http://localhost:3334</code>) で行います。
          </li>
          <li>
            リポジトリルートで <code className="rounded bg-slate-100 px-1">npm run visual:register</code>{' '}
            を実行して起動します。
          </li>
        </ul>
      </section>
    </main>
  )
}

function VisualAssetTable({
  items,
  thumbsEnabled,
}: {
  items: VisualAssetPlanListItem[]
  thumbsEnabled: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {thumbsEnabled && <th className="px-3 py-2 font-medium">サムネ</th>}
            <th className="px-3 py-2 font-medium">役割 / 素材</th>
            <th className="px-3 py-2 font-medium">媒体</th>
            <th className="px-3 py-2 font-medium">種別</th>
            <th className="px-3 py-2 font-medium">状態</th>
            <th className="px-3 py-2 font-medium">Content Idea</th>
            <th className="px-3 py-2 font-medium">更新</th>
            <th className="px-3 py-2 font-medium">候補</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((it) => {
            const updated = formatDate(it.updatedAt)
            const pathToShow = it.localAssetPath || it.expectedLocalAssetPath
            const pathLabel = it.localAssetPath
              ? undefined
              : it.expectedLocalAssetPath
                ? '(expected, not yet saved)'
                : undefined
            const thumbSrc =
              thumbsEnabled && it.localAssetPath && it.localAssetPath.startsWith('assets/visuals/')
                ? `/api/asset-thumb?path=${encodeURIComponent(it.localAssetPath)}`
                : null
            const slug = it.slug ?? assetSlugFromId(it._id)
            const roleJa = assetRoleJa(slug)
            return (
              <tr key={it._id}>
                {thumbsEnabled && (
                  <td className="px-3 py-2 align-top">
                    {thumbSrc ? (
                      // Native <img> on purpose: we serve an already-sized PNG via
                      // /api/asset-thumb and want no Next.js image optimization
                      // round-trip for local-only previews.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbSrc}
                        alt={it.title ?? it._id}
                        className="h-14 w-24 rounded border border-slate-200 bg-slate-50 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="italic text-slate-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-slate-900">{roleJa ?? it.title ?? '(無題)'}</div>
                  {roleJa && it.title && (
                    <div className="text-xs text-slate-500">{it.title}</div>
                  )}
                  {it.placement && (
                    <div className="mt-0.5 text-xs text-slate-500">配置: {it.placement}</div>
                  )}
                  <details className="mt-1 text-xs text-slate-400">
                    <summary className="cursor-pointer">詳細情報</summary>
                    <div className="mt-1 flex flex-col gap-1 break-all">
                      <code className="text-[11px]">id: {it._id}</code>
                      {slug && <code className="text-[11px]">slug: {slug}</code>}
                      <FilePathBlock path={pathToShow} detail={pathLabel} />
                    </div>
                  </details>
                </td>
                <td className="px-3 py-2 align-top text-slate-700">{it.targetPlatform ?? '—'}</td>
                <td className="px-3 py-2 align-top text-slate-700">
                  {it.assetType ?? '—'}
                  {it.aspectRatio && <div className="text-xs text-slate-500">{it.aspectRatio}</div>}
                </td>
                <td className="px-3 py-2 align-top">
                  <StatusBadge state={it.status} label={statusLabelJa(it.status)} />
                  {it.reusePolicy && (
                    <div className="mt-1 text-[11px] text-slate-500">reuse: {it.reusePolicy}</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {it.sourceContentIdea ? (
                    <span className="text-slate-700">
                      <span className="font-medium">{it.sourceContentIdea.title ?? it.sourceContentIdea._id}</span>
                      <span className="ml-1 text-xs text-slate-500">
                        (<code>{it.sourceContentIdea.slug ?? it.sourceContentIdea._id}</code>)
                      </span>
                    </span>
                  ) : (
                    <span className="text-rose-700 text-xs">参照解決できず</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-xs text-slate-500">{updated ?? '—'}</td>
                <td className="px-3 py-2 align-top text-xs">
                  <Link
                    href={`/visual-assets/${encodeURIComponent(it._id)}/candidates`}
                    className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
                  >
                    候補を見る
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
