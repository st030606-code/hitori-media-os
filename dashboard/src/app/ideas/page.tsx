// /ideas — アイデア開発 (Phase 2C-0).
//
// Phase 2C-0 surface: capture a rough/raw idea and write an AI idea-development
// prompt package onto the local filesystem under `idea-jobs/<slug>/...`.
//
// Boundaries (handoff/0197, Q-2C-1〜Q-2C-13 confirmed):
//   - No external LLM API. Dashboard renders the prompt; boss runs the AI
//     agent manually (ChatGPT / Claude Code / Codex).
//   - No external LLM API. Phase 2C-1B can create exactly one contentIdea
//     through a controlled Sanity write action after boss preview.
//   - Filesystem write requires both ENABLE_WRITE_ACTIONS and
//     ENABLE_LOCAL_FS_ROUTES; production deploys keep both off.

import {Lightbulb, ExternalLink} from 'lucide-react'
import {enableLocalFsRoutes, enableWriteActions} from '@/lib/featureFlags'
import {listIdeaJobs} from '@/lib/ideaJobs/reader'
import {PageHeader} from '@/components/common/PageHeader'
import {WorkflowBadge} from '@/components/common/WorkflowGuide'
import {RawIdeaBuilder} from '@/components/ideas/RawIdeaBuilder'
import {IdeaJobList} from '@/components/ideas/IdeaJobList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STUDIO_BASE_URL = process.env.NEXT_PUBLIC_STUDIO_BASE_URL || 'http://localhost:3333'

export default async function IdeasPage() {
  // Phase 2C-0 writes only to the filesystem (no Sanity), so
  // SANITY_WRITE_TOKEN is intentionally NOT required here. The two flags
  // below ARE required.
  const writeReady = enableWriteActions
  const localFsReady = enableLocalFsRoutes

  // Phase 2C-1: server-side read of existing idea-jobs (if local fs is
  // enabled). When the flag is off we skip the read entirely so the page
  // still renders in read-only mode.
  let jobsListing: Awaited<ReturnType<typeof listIdeaJobs>> | null = null
  let jobsErrorText: string | null = null
  if (localFsReady) {
    try {
      jobsListing = await listIdeaJobs()
      if (!jobsListing.ok) jobsErrorText = jobsListing.message
    } catch (e) {
      jobsErrorText = e instanceof Error ? e.message : String(e)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="アイデア開発"
        description="仮アイデアをContent Ideaに育てる no-API ワークフロー。Dashboardはプロンプトと保存先を整え、AI実行は手動で行います。"
        breadcrumb={[
          {label: 'ダッシュボード', href: '/'},
          {label: 'アイデア開発'},
        ]}
        actions={
          <a
            href={STUDIO_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Sanity Studio を開く
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>writeReady:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {writeReady ? 'true' : 'false'}
            </code>
            <span>· localFsReady:</span>
            <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] ring-1 ring-inset ring-slate-200">
              {localFsReady ? 'true' : 'false'}
            </code>
          </span>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-amber-50/40 p-4 text-sm text-amber-900 shadow-sm">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold">Raw Idea は Content Idea ではありません</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-amber-800">
              <li>Dashboard は AI 企画化プロンプトを作るだけです。 OpenAI / Anthropic / 他有料 LLM API は呼びません。</li>
              <li>仮アイデアとAI企画化結果はローカル <code>idea-jobs/</code> に保存され、 Sanity には書き込みません。</li>
              <li>構造化されたContent Ideaだけ、boss が内容を確認したあと controlled write action で Sanity に作成できます。</li>
              <li>filesystem 書き込みは <code>ENABLE_WRITE_ACTIONS</code> + <code>ENABLE_LOCAL_FS_ROUTES</code> 両方 ON のときだけ動きます。</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Step 0: Raw IdeaからContent Ideaへ</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              ローカルで育ててから、最後だけSanityに保存します。
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <WorkflowBadge label="AI実行: 手動" tone="amber" />
            <WorkflowBadge label="API: 未使用" tone="amber" />
          </div>
        </div>
        <ol className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
          <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-900">0-1 仮アイデアを書く</p>
            <p className="mt-1 text-slate-600">保存先: ローカル</p>
          </li>
          <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-900">0-2 プロンプトを作る</p>
            <p className="mt-1 text-slate-600">保存先: idea-jobs/</p>
          </li>
          <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-900">0-3 AI結果を取り込む</p>
            <p className="mt-1 text-slate-600">保存先: ローカル</p>
          </li>
          <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-900">0-4 Sanityに作成</p>
            <p className="mt-1 text-slate-600">保存先: Sanity</p>
          </li>
        </ol>
      </section>

      <RawIdeaBuilder writeReady={writeReady} localFsReady={localFsReady} />

      <IdeaJobList
        jobs={jobsListing && jobsListing.ok ? jobsListing.jobs : []}
        truncated={jobsListing && jobsListing.ok ? jobsListing.truncated : false}
        localFsReady={localFsReady}
        errorText={jobsErrorText}
      />
    </main>
  )
}
