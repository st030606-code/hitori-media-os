// /visual-assets/[assetId]/candidates — Candidate focus review (Phase UI-fidelity-6).
//
// 2-col CandidateFocusLayout: BigPreview + ThumbStrip + prompt context (left)
// SelectedCandidateMetaCard + deferred actions + Visual Register CTA (right)
// Empty states explicitly distinguish:
//   - production mode (local FS disabled)
//   - dataset has no plan / assetId malformed
//   - plan exists but no candidates generated yet

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
import {readPromptBody} from '@/lib/visualAssets/inboxLookup'
import {buildPatchJsonPath, patchJsonExists} from '@/lib/visualAssets/patchJson'
import {PageHeader} from '@/components/common/PageHeader'
import {PlatformBadge, platformLabel} from '@/components/common/PlatformBadge'
import {LocalModeBanner} from '@/components/visual-review/LocalModeBanner'
import {CandidateFocusLayout} from '@/components/visual-review/CandidateFocusLayout'

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
): Promise<CandidateBundle | {error: string}> {
  try {
    return await readAssetCandidates(campaignSlug, assetSlug)
  } catch (e) {
    return {error: e instanceof Error ? e.message : 'unknown'}
  }
}

export default async function VisualAssetCandidatesPage({params}: PageProps) {
  const {assetId: rawAssetId} = await params
  const assetId = decodeURIComponent(rawAssetId)
  const slugs = deriveSlugsFromAssetId(assetId)
  const plan = await fetchPlan(assetId)

  const campaignSlug = slugs?.campaignSlug ?? plan?.sourceCampaign?.slug ?? '—'
  const assetSlug = slugs?.assetSlug ?? plan?.slug ?? '—'
  const detailHref = `/visual-assets/${encodeURIComponent(assetId)}`

  let bundle: CandidateBundle | null = null
  let bundleError: string | null = null
  let promptBody: string | null = null
  if (enableLocalFsRoutes && slugs) {
    const [bundleResult, body] = await Promise.all([
      loadCandidates(slugs.campaignSlug, slugs.assetSlug),
      readPromptBody(slugs.campaignSlug, slugs.assetSlug),
    ])
    if ('error' in bundleResult) bundleError = bundleResult.error
    else bundle = bundleResult
    promptBody = body
  }
  const hasCandidates = !!bundle && bundle.candidates.length > 0
  const title = plan?.title ?? assetSlug
  const metaParts = [
    plan?.assetType,
    plan?.targetPlatform ? platformLabel(plan.targetPlatform) : null,
    plan?.aspectRatio,
  ].filter((s): s is string => typeof s === 'string' && s.length > 0)
  const description = bundle
    ? `${bundle.candidates.length} 件の候補 / inbox ${bundle.folderRelativePath}`
    : metaParts.join(' · ') || 'visual asset'

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={`${assetSlug} の候補比較`}
        description={description}
        breadcrumb={[
          {label: 'ダッシュボード', href: '/'},
          {label: '図解レビュー', href: '/visual-assets'},
          {label: assetSlug, href: detailHref},
          {label: '候補比較'},
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              アセット詳細へ
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
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
          <span className="flex flex-wrap items-center gap-1.5">
            <span>タイトル: {title}</span>
            {plan?.targetPlatform && (
              <>
                <span aria-hidden="true">·</span>
                <PlatformBadge platform={plan.targetPlatform} />
              </>
            )}
          </span>
        }
      />

      <LocalModeBanner enableLocalFsRoutes={enableLocalFsRoutes} />

      {/* Empty / error states distinguished per docs/77 §8 boss decision */}
      {!enableLocalFsRoutes ? (
        <EmptyCard
          title="ローカル候補プレビューは開発環境でのみ利用できます"
          body="本番モードでは inbox フォルダを読まない設計です。ローカルで ENABLE_LOCAL_FS_ROUTES=true npm run dev を実行すると、ここに候補比較が表示されます。"
        />
      ) : !slugs ? (
        <EmptyCard
          title="assetId からスラッグを導出できませんでした"
          body={`URL の '${assetId}' が 'visualAssetPlan.<campaignSlug>.<assetSlug>' の形式ではありません。Studio の record を確認してください。`}
        />
      ) : bundleError ? (
        <EmptyCard
          title="inbox の読み込みに失敗しました"
          body={bundleError}
          tone="rose"
        />
      ) : !hasCandidates ? (
        <EmptyCard
          title="候補画像はまだ生成されていません"
          body={`'assets/inbox/generated/${campaignSlug}/${assetSlug}/' に v001.png 〜 が見当たりません。docs/64 §14 の codex exec / chatgpt 手順で 1 件生成してください。`}
        />
      ) : (
        <CandidateFocusLayout
          candidates={bundle!.candidates}
          promptMeta={bundle!.promptMeta}
          promptBody={promptBody}
          reviewMeta={bundle!.reviewMeta}
          warnings={bundle!.warnings}
          enableLocalFsRoutes={enableLocalFsRoutes}
          approveBridge={{
            assetId,
            campaignSlug,
            assetSlug,
            expectedLocalAssetPath: plan?.expectedLocalAssetPath ?? null,
            currentLocalAssetPath: plan?.localAssetPath ?? null,
            // Phase 2B-3 (W1) is a CLI bridge for file ops only — it never
            // writes to Sanity (Q-2B3-2: Sanity reflect is deferred to
            // Phase 2B-3.1), so SANITY_WRITE_TOKEN is intentionally NOT
            // required here. The two flags below ARE required.
            writeReady: enableWriteActions,
            localFsReady: enableLocalFsRoutes,
          }}
          reflectBridge={(() => {
            const reflectPathRaw = buildPatchJsonPath(campaignSlug, assetSlug)
            const reflectPathResolved =
              enableLocalFsRoutes && reflectPathRaw && patchJsonExists(reflectPathRaw)
                ? reflectPathRaw
                : null
            return {
              visualAssetPlanId: assetId,
              campaignSlug,
              assetSlug,
              patchJsonPath: reflectPathResolved,
              // Phase 2B-3.1 (Sanity reflect) DOES require SANITY_WRITE_TOKEN.
              // Topbar pill uses the same AND-gate as 2B-1 / 2B-2 — keep
              // them consistent here.
              writeReady: enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN),
              localFsReady: enableLocalFsRoutes,
            }
          })()}
        />
      )}
    </main>
  )
}

function EmptyCard({
  title,
  body,
  tone = 'slate',
}: {
  title: string
  body: string
  tone?: 'slate' | 'rose'
}) {
  const cls =
    tone === 'rose'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-slate-200 bg-white text-slate-700'
  return (
    <section className={`rounded-lg border p-5 shadow-sm ${cls}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm">{body}</p>
    </section>
  )
}
