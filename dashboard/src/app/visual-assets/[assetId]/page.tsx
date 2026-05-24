// /visual-assets/[assetId] — Visual Review detail (Phase UI-fidelity-7).
//
// 2-col grid:
//   Left:  AssetPreviewCard + PlanMetadataCard + PromptSummaryCard
//   Right: CampaignContextCard + RubricChecklistCard + FilePathsCard + ActionsCard
//
// Read-only — write actions are placeholders linking to Visual Register.
// inbox prompt.md / review.md is read server-side under enableLocalFsRoutes.

import Link from 'next/link'
import {ChevronRight, ExternalLink} from 'lucide-react'
import {sanityClient} from '@/lib/sanity'
import {visualAssetPlanByIdQuery, type VisualAssetPlanDetail} from '@/lib/groq/campaign'
import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {
  deriveSlugsFromAssetId,
  readAssetCandidates,
  type CandidateBundle,
} from '@/lib/inboxReader'
import {
  expectedPatchPath,
  getLatestInboxCandidate,
  readPromptBody,
} from '@/lib/visualAssets/inboxLookup'
import {PageHeader} from '@/components/common/PageHeader'
import {PlatformBadge} from '@/components/common/PlatformBadge'
import {LocalModeBanner} from '@/components/visual-review/LocalModeBanner'
import {AssetPreviewCard} from '@/components/visual-review/AssetPreviewCard'
import {PlanMetadataCard} from '@/components/visual-review/PlanMetadataCard'
import {PromptSummaryCard} from '@/components/visual-review/PromptSummaryCard'
import {CampaignContextCard} from '@/components/visual-review/CampaignContextCard'
import {RubricChecklistCard} from '@/components/visual-review/RubricChecklistCard'
import {FilePathsCard} from '@/components/visual-review/FilePathsCard'
import {ActionsCard} from '@/components/visual-review/ActionsCard'
import {ReflectVisualAssetAction} from '@/components/visual-review/ReflectVisualAssetAction'
import {patchJsonExists} from '@/lib/visualAssets/patchJson'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{assetId: string}>
}

async function fetchPlan(assetId: string): Promise<VisualAssetPlanDetail | null> {
  try {
    return await sanityClient.fetch<VisualAssetPlanDetail | null>(visualAssetPlanByIdQuery, {assetId})
  } catch {
    return null
  }
}

async function loadCandidates(
  campaignSlug: string,
  assetSlug: string,
): Promise<CandidateBundle | null> {
  try {
    return await readAssetCandidates(campaignSlug, assetSlug)
  } catch {
    return null
  }
}

export default async function VisualAssetDetailPage({params}: PageProps) {
  const {assetId: rawAssetId} = await params
  const assetId = decodeURIComponent(rawAssetId)
  const slugs = deriveSlugsFromAssetId(assetId)
  const plan = await fetchPlan(assetId)

  const campaignSlug = slugs?.campaignSlug ?? plan?.sourceCampaign?.slug ?? '—'
  const assetSlug = slugs?.assetSlug ?? plan?.slug ?? '—'

  // Inbox data (only under enableLocalFsRoutes + valid slugs)
  let bundle: CandidateBundle | null = null
  let promptBody: string | null = null
  let latestInboxPath: string | null = null
  if (enableLocalFsRoutes && slugs) {
    const [b, body, latest] = await Promise.all([
      loadCandidates(slugs.campaignSlug, slugs.assetSlug),
      readPromptBody(slugs.campaignSlug, slugs.assetSlug),
      getLatestInboxCandidate(slugs.campaignSlug, slugs.assetSlug),
    ])
    bundle = b
    promptBody = body
    latestInboxPath = latest?.relativePath ?? null
  }

  const candidatesHref = `/visual-assets/${encodeURIComponent(assetId)}/candidates`
  const publishPackageHref =
    plan?.sourceCampaign?.slug && `/publish-package/${encodeURIComponent(plan.sourceCampaign.slug)}`

  const title = plan?.title ?? assetSlug
  const metaParts = [
    plan?.assetType,
    plan?.targetPlatform,
    plan?.aspectRatio,
  ].filter((s): s is string => typeof s === 'string' && s.length > 0)

  const inboxFolder = slugs ? `assets/inbox/generated/${slugs.campaignSlug}/${slugs.assetSlug}` : null
  const promptMdPath = inboxFolder ? `${inboxFolder}/prompt.md` : null
  const reviewMdPath = inboxFolder ? `${inboxFolder}/review.md` : null
  const patchPath = expectedPatchPath(slugs?.campaignSlug, slugs?.assetSlug)
  const inboxFallbackPath = latestInboxPath ?? (slugs ? `${inboxFolder}/v001.png` : null)

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={title}
        description={metaParts.length > 0 ? metaParts.join(' · ') : 'visual asset'}
        breadcrumb={[
          {label: 'ダッシュボード', href: '/'},
          {label: '図解レビュー', href: '/visual-assets'},
          {label: assetSlug},
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={candidatesHref}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              候補一覧へ
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
            {publishPackageHref && (
              <Link
                href={publishPackageHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                公開パッケージで見る
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            )}
            <a
              href="http://localhost:3334"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Visual Register で承認
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        }
        meta={
          plan?.targetPlatform && (
            <span className="inline-flex items-center gap-1.5">
              <PlatformBadge platform={plan.targetPlatform} />
              <span>キャンペーン: {plan.sourceCampaign?.title ?? campaignSlug}</span>
            </span>
          )
        }
      />

      <LocalModeBanner enableLocalFsRoutes={enableLocalFsRoutes} />

      {!plan && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>
            <strong className="font-semibold">該当する visualAssetPlan が Sanity に見つかりませんでした。</strong>{' '}
            URL の <code>{assetId}</code> に対応するレコードを Studio で作成するか、URL を見直してください。
            下のメタデータは assetId から推測した内容です。
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <AssetPreviewCard
            finalPath={plan?.localAssetPath}
            inboxFallbackPath={inboxFallbackPath}
            alt={title}
            enableLocalFsRoutes={enableLocalFsRoutes}
          />
          {plan && <PlanMetadataCard plan={plan} />}
          <PromptSummaryCard
            promptMeta={bundle?.promptMeta ?? null}
            promptBody={promptBody}
            enableLocalFsRoutes={enableLocalFsRoutes}
          />
        </div>

        <div className="flex flex-col gap-5">
          <CampaignContextCard plan={plan} campaignSlug={campaignSlug} assetSlug={assetSlug} />
          <RubricChecklistCard
            reviewMeta={bundle?.reviewMeta ?? null}
            enableLocalFsRoutes={enableLocalFsRoutes}
          />
          <FilePathsCard
            items={[
              {
                label: '現在の最終',
                path: plan?.localAssetPath,
                fallback: '— (未保存)',
              },
              {
                label: '期待される最終',
                path: plan?.expectedLocalAssetPath,
                note: '保存先 (Visual Register が登録するパス)',
              },
              {
                label: 'brief',
                path: plan?.taskFilePath,
                note: 'tasks/visuals/ 配下のブリーフ',
              },
              {
                label: '公開パッケージ',
                path: plan?.publishPackagePath,
              },
              {
                label: 'inbox フォルダ',
                path: inboxFolder,
                note: 'inbox の root',
              },
              {
                label: 'prompt.md',
                path: promptMdPath,
              },
              {
                label: 'review.md',
                path: reviewMdPath,
              },
              {
                label: '最新候補',
                path: latestInboxPath,
                fallback: '— (候補未生成)',
              },
              {
                label: 'patch JSON',
                path: patchPath,
                note: 'approve & register 後に Visual Register が生成',
              },
            ]}
          />
          <ReflectVisualAssetAction
            visualAssetPlanId={assetId}
            campaignSlug={slugs?.campaignSlug ?? ''}
            assetSlug={slugs?.assetSlug ?? ''}
            patchJsonPath={
              enableLocalFsRoutes && patchPath && patchJsonExists(patchPath) ? patchPath : null
            }
            writeReady={enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)}
            localFsReady={enableLocalFsRoutes}
            variant="wide"
          />
          <ActionsCard
            visualRegisterLabel="Visual Register を開く"
            deferred={[
              {
                label: '採用する (候補比較で実行)',
                tooltip:
                  'Phase 2B-3 (実装済) で候補比較ページから approve & register を実行できます。',
              },
              {
                label: '再生成プロンプトを編集',
                tooltip: 'Phase 2B で imagePrompt を編集し codex exec を再実行する想定。',
              },
              {
                label: '今回は保留',
                tooltip:
                  'Phase 2B で status を archived にする atomic write を dashboard から実行する想定。',
              },
            ]}
            helperText="採用は候補比較ページ、 Sanity 反映は上記カード、 再生成 / 保留は将来 Phase で対応予定です。"
          />
        </div>
      </div>
    </main>
  )
}
