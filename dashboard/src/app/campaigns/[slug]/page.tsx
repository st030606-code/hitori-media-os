import Link from 'next/link'
import {notFound} from 'next/navigation'
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Pencil,
  Plus,
  Share2,
  ExternalLink,
} from 'lucide-react'
import {sanityClient, sanityConfig, studioDocumentUrl} from '@/lib/sanity'
import {campaignDetailBySlugQuery, type CampaignPlanDetail} from '@/lib/groq/campaign'
import {StatusBadge} from '@/components/StatusBadge'
import {gateStateLabel} from '@/lib/gates/stateTransitions'
import {CopyButton} from '@/components/CopyButton'
import {PageHeader} from '@/components/common/PageHeader'
import {KpiCard} from '@/components/common/KpiCard'
import {KpiCardsRow} from '@/components/common/KpiCardsRow'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {LifecyclePipeline, type LifecycleStage, type LifecycleKey} from '@/components/common/LifecyclePipeline'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/common/Tabs'
import {PublishReadinessScore} from '@/components/campaign/PublishReadinessScore'
import {PublishingScheduleTable} from '@/components/campaign/PublishingScheduleTable'
import {NextActionList} from '@/components/campaign/NextActionList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchCampaign(slug: string): Promise<CampaignPlanDetail | null> {
  return await sanityClient.fetch<CampaignPlanDetail | null>(campaignDetailBySlugQuery, {slug})
}

interface PageProps {
  params: Promise<{slug: string}>
}

export default async function CampaignDetailPage({params}: PageProps) {
  const {slug} = await params
  const campaign = await fetchCampaign(slug)

  if (!campaign) {
    notFound()
  }

  const visuals = campaign.visualAssetDetails ?? []
  const visualsSaved = visuals.filter(
    (v) => v.state === 'done' || v.plan?.status === 'saved',
  ).length
  const visualsSkipped = visuals.filter((v) => v.plan?.status === 'skipped').length
  const visualsTotal = visuals.length
  const gates = campaign.humanReviewGates ?? []
  const pendingGates = gates.filter(
    (g) => g.state === 'pending-review' || g.state === 'in-progress' || g.state === 'blocked',
  ).length
  const publishing = campaign.manualPublishingStatus ?? []
  const publishingDone = publishing.filter((p) => p.state === 'done' && !!p.publishedUrl).length
  const publishingPending = publishing.filter((p) => !p.publishedUrl).length
  const platformsSelected = (campaign.selectedPlatforms ?? []).filter((p) => p.enabled !== false).length

  const lifecycle = buildLifecycle({
    pendingGates,
    publishingDone,
    publishingPending,
    visualsDone: visualsSaved,
    visualsTotal,
  })

  const slugForLinks = campaign.slug ?? campaign._id

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={campaign.title ?? campaign._id}
        description={campaign.coreThesis}
        breadcrumb={[
          {label: 'キャンペーン', href: '/campaigns'},
          {label: campaign.title ?? campaign._id},
        ]}
        meta={
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            <code className="rounded bg-slate-100 px-1 py-0.5">{slugForLinks}</code>
            {campaign.campaignType && <span>type: {campaign.campaignType}</span>}
            {campaign.contentMode && <span>mode: {campaign.contentMode}</span>}
            {campaign.automationLevel && <span>auto: {campaign.automationLevel}</span>}
            <StatusBadge state={campaign.status} label={campaign.status ?? '—'} />
          </div>
        }
        actions={
          <>
            <button
              type="button"
              disabled
              title="Phase UI-3+ で実装予定"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Pencil size={14} aria-hidden="true" />
              編集
            </button>
            <Link
              href="/configurator"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Plus size={14} aria-hidden="true" />
              出力を追加
            </Link>
            <Link
              href={`/publish-package/${slugForLinks}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              公開パッケージへ
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <button
              type="button"
              disabled
              title="Phase UI-7+ で実装予定"
              aria-label="共有"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Share2 size={16} aria-hidden="true" />
            </button>
          </>
        }
      />

      <KpiCardsRow>
        <KpiCard
          label="公開済み"
          value={`${publishingDone} / ${publishingDone + publishingPending}`}
          icon={CheckCircle2}
          tone="emerald"
          secondary={publishingPending > 0 ? `公開待ち ${publishingPending}` : '完了'}
        />
        <KpiCard
          label="確認待ちゲート"
          value={pendingGates}
          icon={Eye}
          tone="orange"
          secondary={gates.length > 0 ? `全 ${gates.length} 件中` : '未設定'}
        />
        <KpiCard
          label="画像・図解"
          value={`${visualsSaved} / ${visualsTotal}`}
          icon={ImageIcon}
          tone="purple"
          secondary={visualsSkipped > 0 ? `今回は保留 ${visualsSkipped}` : '配布済み'}
        />
        <KpiCard
          label="選択媒体"
          value={platformsSelected}
          icon={FileText}
          tone="blue"
          secondary="enabled platforms"
        />
      </KpiCardsRow>

      <LifecyclePipeline
        title="このキャンペーンのライフサイクル"
        caption="Idea → Structured → Draft → Review → Published"
        stages={lifecycle.stages}
        currentStage={lifecycle.currentStage}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <CampaignBriefCard campaign={campaign} />
          <PublishingScheduleTable
            campaignSlug={slugForLinks}
            publishing={publishing}
            selectedPlatforms={campaign.selectedPlatforms ?? []}
          />
        </div>
        <div className="flex flex-col gap-5">
          <PublishReadinessScore
            publishing={publishing}
            visualReadiness={{saved: visualsSaved, skipped: visualsSkipped, total: visualsTotal}}
          />
          <NextActionList campaign={campaign} />
          <ReleaseReviewCard releaseReviewPath={campaign.releaseReviewPath} />
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">詳細</h2>
          <span className="text-[11px] text-slate-500">
            キャンペーンに紐づく技術詳細
          </span>
        </header>
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content Idea</TabsTrigger>
            <TabsTrigger value="brand">ブランド</TabsTrigger>
            <TabsTrigger value="media">媒体</TabsTrigger>
            <TabsTrigger value="gates">確認ゲート</TabsTrigger>
            <TabsTrigger value="visuals">画像・図解</TabsTrigger>
            <TabsTrigger value="prompts">プロンプト</TabsTrigger>
            <TabsTrigger value="package">パッケージ</TabsTrigger>
            <TabsTrigger value="links">外部リンク</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <ContentIdeaSection campaign={campaign} />
          </TabsContent>
          <TabsContent value="brand">
            <BrandProfileSection campaign={campaign} />
          </TabsContent>
          <TabsContent value="media">
            <PlatformsSection platforms={campaign.selectedPlatforms} />
          </TabsContent>
          <TabsContent value="gates">
            <GatesSection gates={campaign.humanReviewGates} />
          </TabsContent>
          <TabsContent value="visuals">
            <VisualsSection assets={campaign.visualAssetDetails} />
          </TabsContent>
          <TabsContent value="prompts">
            <PromptsSection selections={campaign.promptTemplateDetails} />
          </TabsContent>
          <TabsContent value="package">
            <PackagePathsSection
              paths={campaign.publishPackagePaths}
              releaseReviewPath={campaign.releaseReviewPath}
            />
          </TabsContent>
          <TabsContent value="links">
            <ExternalLinks campaign={campaign} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function buildLifecycle(args: {
  pendingGates: number
  publishingDone: number
  publishingPending: number
  visualsDone: number
  visualsTotal: number
}): {stages: LifecycleStage[]; currentStage: LifecycleKey} {
  const {pendingGates, publishingDone, publishingPending, visualsDone, visualsTotal} = args
  const draftCount = publishingPending
  const currentStage: LifecycleKey =
    publishingDone > 0 && publishingPending === 0
      ? 'published'
      : pendingGates > 0
        ? 'review'
        : draftCount > 0
          ? 'draft'
          : visualsDone < visualsTotal
            ? 'structured'
            : 'idea'
  const stages: LifecycleStage[] = [
    {key: 'idea', label: 'アイデア', count: 1, description: '原型を構造化記録'},
    {key: 'structured', label: '構造化済み', count: visualsTotal, description: 'campaignPlan として整理'},
    {key: 'draft', label: '下書き', count: draftCount, description: '媒体別アウトプット'},
    {key: 'review', label: 'レビュー待ち', count: pendingGates, description: '人間判定ゲート'},
    {key: 'published', label: '公開済み', count: publishingDone, description: '反応データ収集中'},
  ]
  return {stages, currentStage}
}

function CampaignBriefCard({campaign}: {campaign: CampaignPlanDetail}) {
  const idea = campaign.sourceContentIdea
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">キャンペーン概要</h2>
        {campaign.version && (
          <span className="text-[11px] text-slate-500">version: {campaign.version}</span>
        )}
      </header>
      {campaign.coreThesis && (
        <p className="rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-100">
          {campaign.coreThesis}
        </p>
      )}
      {campaign.targetReader && campaign.targetReader.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            想定読者
          </div>
          <ul className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-700">
            {campaign.targetReader.map((r, i) => (
              <li
                key={i}
                className="rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-inset ring-slate-200"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      {idea && (
        <div className="mt-3 flex flex-wrap items-baseline gap-2 text-[11px] text-slate-500">
          <span>元アイデア:</span>
          <span className="font-medium text-slate-700">{idea.title ?? idea._id}</span>
          {idea.slug && <code className="rounded bg-slate-100 px-1 py-0.5">{idea.slug}</code>}
        </div>
      )}
    </section>
  )
}

function ContentIdeaSection({campaign}: {campaign: CampaignPlanDetail}) {
  const idea = campaign.sourceContentIdea
  if (!idea) {
    return (
      <p className="text-sm text-rose-700">Source Content Idea reference not resolved.</p>
    )
  }
  return (
    <div className="text-sm">
      <div className="font-medium text-slate-900">{idea.title ?? idea._id}</div>
      <div className="text-xs text-slate-500">
        <code>{idea._id}</code>
        {idea.slug && <> &middot; slug: <code>{idea.slug}</code></>}
        {idea.status && <> &middot; status: {idea.status}</>}
      </div>
      {idea.coreThesis && (
        <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-100">
          {idea.coreThesis}
        </p>
      )}
      {idea.audience && idea.audience.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-600">
          {idea.audience.map((a, i) => (
            <span
              key={i}
              className="rounded-md bg-white px-2 py-0.5 ring-1 ring-inset ring-slate-200"
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandProfileSection({campaign}: {campaign: CampaignPlanDetail}) {
  const brand = campaign.brandProfile
  if (!brand) {
    return <p className="text-sm text-slate-500">Brand profile reference not resolved.</p>
  }
  return (
    <div className="text-sm">
      <div className="font-medium text-slate-900">{brand.brandName ?? brand.title ?? brand._id}</div>
      <div className="text-xs text-slate-500">
        <code>{brand._id}</code>
        {brand.ownerType && <> &middot; owner: {brand.ownerType}</>}
        {brand.status && <> &middot; status: {brand.status}</>}
      </div>
      {brand.voiceTone?.voice && (
        <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-100">
          {brand.voiceTone.voice}
        </p>
      )}
      {brand.defaultPlatforms && brand.defaultPlatforms.length > 0 && (
        <div className="mt-3 flex flex-wrap items-baseline gap-1.5 text-xs text-slate-600">
          <span className="text-slate-500">default platforms:</span>
          {brand.defaultPlatforms.map((p) => (
            <span
              key={p}
              className="rounded-md bg-white px-2 py-0.5 ring-1 ring-inset ring-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ExternalLinks({campaign}: {campaign: CampaignPlanDetail}) {
  return (
    <ul className="space-y-1.5 text-sm">
      <li>
        <a
          className="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900"
          href={studioDocumentUrl(campaign._id)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Sanity Studio でこの campaignPlan を開く
          <ExternalLink size={12} aria-hidden="true" />
        </a>{' '}
        <span className="text-xs text-slate-500">
          (<code>{sanityConfig.projectId}</code> / <code>{sanityConfig.dataset}</code>)
        </span>
      </li>
      <li>
        <a
          className="inline-flex items-center gap-1 text-blue-700 underline underline-offset-2 hover:text-blue-900"
          href="http://localhost:3334"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visual Register (localhost:3334)
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      </li>
    </ul>
  )
}

// ---------- Page-local sections (Phase UI-fidelity-11) ----------
//
// Replacing the legacy /components/ files that used to be re-imported here.
// Functionality-equivalent, but native HTML + Tailwind only and inlined so
// the legacy files can be deleted in the follow-up cleanup microbatch.

interface ReleaseFile {
  label: string
  file: string
  note?: string
}

const RELEASE_FILES: readonly ReleaseFile[] = [
  {label: '最終チェックリスト', file: 'final-human-checklist.md', note: 'ボスが最後に1度通すリスト'},
  {label: 'X 最終レビュー', file: 'x-final-review.md'},
  {label: 'Threads 最終レビュー', file: 'threads-final-review.md'},
  {label: 'note 最終レビュー', file: 'note-final-review.md'},
  {label: 'Substack 最終レビュー', file: 'substack-final-review.md'},
]

function ReleaseReviewCard({releaseReviewPath}: {releaseReviewPath?: string}) {
  // Hide entirely when the campaign has no release-review path: replaces the
  // old hardcoded /components/ReleaseReviewLinks.tsx which always pointed at
  // building-hitori-media-os (B1 fixes follow-up).
  if (!releaseReviewPath) return null
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開前レビュー資料</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          ローカルのファイルパスを表示します。クリックしてもファイルは開かないので、エディタで開いて読んでください。
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        {RELEASE_FILES.map((l) => (
          <li
            key={l.file}
            className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div>
              <span className="font-medium text-slate-900">{l.label}</span>
              {l.note && <span className="ml-2 text-xs text-slate-500">{l.note}</span>}
            </div>
            <code className="break-all rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">
              {releaseReviewPath}/{l.file}
            </code>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PlatformsSection({platforms}: {platforms?: CampaignPlanDetail['selectedPlatforms']}) {
  if (!platforms || platforms.length === 0) {
    return <p className="text-sm text-slate-500">媒体が選択されていません。</p>
  }
  const enabled = platforms.filter((p) => p.enabled !== false)
  const disabled = platforms.filter((p) => p.enabled === false)
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap items-center gap-1.5 text-xs">
        {enabled.map((p, i) => (
          <li
            key={`${p.platform ?? 'p'}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 ring-1 ring-inset ring-slate-200"
          >
            <PlatformBadge platform={p.platform ?? '—'} />
            <span className="text-slate-800">{platformLabel(p.platform)}</span>
            {p.priority && (
              <span className="text-[10px] text-slate-500">priority: {p.priority}</span>
            )}
            {p.contentDepth && (
              <span className="text-[10px] text-slate-500">depth: {p.contentDepth}</span>
            )}
          </li>
        ))}
      </ul>
      {disabled.length > 0 && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            無効化済
          </div>
          <ul className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
            {disabled.map((p, i) => (
              <li
                key={`${p.platform ?? 'p'}-d-${i}`}
                className="rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-inset ring-slate-200"
              >
                {p.platform ?? '—'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function formatIso(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
  } catch {
    return iso
  }
}

function GatesSection({gates}: {gates?: CampaignPlanDetail['humanReviewGates']}) {
  // Read-only on /campaigns/[slug] by boss decision (smoke fix 0183).
  // State changes happen only on /human-review-gates so the campaign
  // detail view stays observation-focused. The link below routes the
  // boss to the work surface.
  if (!gates || gates.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">確認ゲートが設定されていません。</p>
        <Link
          href="/human-review-gates"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          確認待ちゲートで状態を変更する
          <ChevronRight size={11} aria-hidden="true" />
        </Link>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-slate-500">
        ここでは状態を表示のみ。変更は{' '}
        <Link
          href="/human-review-gates"
          className="font-medium text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
        >
          /human-review-gates
        </Link>{' '}
        から行います。
      </p>
      <ul className="divide-y divide-slate-100">
        {gates.map((g, i) => (
          <li
            key={g._key ?? `${g.gateName ?? 'gate'}-${i}`}
            className="flex flex-col gap-1 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-900">
                {g.gateName ?? '(unnamed gate)'}
              </span>
              <StatusBadge state={g.state} label={gateStateLabel(g.state)} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              {g.reviewer && <span>reviewer: {g.reviewer}</span>}
              {g.completedAt && (
                <span className="tabular-nums">at: {formatIso(g.completedAt)}</span>
              )}
            </div>
            {g.notes && <p className="line-clamp-2 text-xs text-slate-700">{g.notes}</p>}
          </li>
        ))}
      </ul>
      <Link
        href="/human-review-gates"
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
      >
        確認待ちゲートで状態を変更する
        <ChevronRight size={11} aria-hidden="true" />
      </Link>
    </div>
  )
}

function VisualsSection({assets}: {assets?: CampaignPlanDetail['visualAssetDetails']}) {
  if (!assets || assets.length === 0) {
    return <p className="text-sm text-slate-500">画像・図解が設定されていません。</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-slate-100 text-sm">
        {assets.map((v, i) => (
          <li
            key={v.visualAssetPlanId ?? `${v.assetSlug ?? 'asset'}-${i}`}
            className="flex flex-wrap items-center gap-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900">
                {v.plan?.title ?? v.assetSlug ?? '(無題)'}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                {v.platform && <PlatformBadge platform={v.platform} />}
                {v.assetType && <span>{v.assetType}</span>}
                {v.priority && <span>priority: {v.priority}</span>}
              </div>
            </div>
            <StatusBadge
              state={v.state ?? v.plan?.status}
              label={v.state ?? v.plan?.status ?? '—'}
            />
          </li>
        ))}
      </ul>
      <Link
        href="/visual-assets"
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
      >
        図解レビューを開く
        <ChevronRight size={11} aria-hidden="true" />
      </Link>
    </div>
  )
}

function PromptsSection({selections}: {selections?: CampaignPlanDetail['promptTemplateDetails']}) {
  if (!selections || selections.length === 0) {
    return <p className="text-sm text-slate-500">プロンプトテンプレートが選択されていません。</p>
  }
  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {selections.map((s, i) => (
        <li
          key={s.promptTemplateId ?? `prompt-${i}`}
          className="flex flex-wrap items-center gap-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900">
              {s.template?.title ?? s.promptTemplateId ?? '—'}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
              {s.category && <span>category: {s.category}</span>}
              {s.platform && <PlatformBadge platform={s.platform} />}
              {s.assetType && <span>{s.assetType}</span>}
              {s.template?.version && <span>v{s.template.version}</span>}
            </div>
            {s.notes && <p className="mt-0.5 text-[11px] text-slate-500">{s.notes}</p>}
          </div>
          {s.template?._id && (
            <a
              href={studioDocumentUrl(s.template._id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
            >
              Studio
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

function PackagePathsSection({
  paths,
  releaseReviewPath,
}: {
  paths?: CampaignPlanDetail['publishPackagePaths']
  releaseReviewPath?: string
}) {
  const hasPaths = paths && paths.length > 0
  if (!hasPaths && !releaseReviewPath) {
    return <p className="text-sm text-slate-500">公開パッケージのパスが設定されていません。</p>
  }
  return (
    <div className="flex flex-col gap-2 text-[11px]">
      {hasPaths &&
        paths!.map((p, i) => (
          <div
            key={`pkg-${i}`}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="w-32 shrink-0 text-slate-600">
              {p.platform ? `${p.platform}` : `package ${i + 1}`}
            </span>
            {p.path ? (
              <>
                <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-800 ring-1 ring-inset ring-slate-200">
                  {p.path}
                </code>
                <CopyButton text={p.path} label="copy" />
              </>
            ) : (
              <span className="italic text-slate-400">— (未設定)</span>
            )}
            {p.state && <StatusBadge state={p.state} />}
            {p.notes && <span className="text-slate-500">{p.notes}</span>}
          </div>
        ))}
      {releaseReviewPath && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-32 shrink-0 text-slate-600">release-review</span>
          <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-800 ring-1 ring-inset ring-slate-200">
            {releaseReviewPath}
          </code>
          <CopyButton text={releaseReviewPath} label="copy" />
        </div>
      )}
    </div>
  )
}
