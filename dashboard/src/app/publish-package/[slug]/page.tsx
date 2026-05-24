import Link from 'next/link'
import {readPublishPackage, type PublishPackage} from '@/lib/publishPackageReader'
import {enableLocalFsRoutes} from '@/lib/featureFlags'
import {CopyButton} from '@/components/CopyButton'
import {sanityClient} from '@/lib/sanity'
import {
  publishPackageStateBySlugQuery,
  findPlatformState,
  isPublished,
  formatPublishedAtJst,
  type PublishPackageState,
  type PublishPackagePlatformState,
} from '@/lib/groq/publishPackage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{slug: string}>
}

async function fetchPublishState(slug: string): Promise<PublishPackageState | null> {
  try {
    return await sanityClient.fetch<PublishPackageState | null>(
      publishPackageStateBySlugQuery,
      {slug},
    )
  } catch {
    // Read-only UI: a Sanity outage should not break the FS-driven page.
    // The badges simply fall back to "未公開" / unknown.
    return null
  }
}

export default async function PublishPackagePage({params}: PageProps) {
  const {slug} = await params

  if (!enableLocalFsRoutes) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <h1 className="text-xl font-semibold text-amber-950">公開パッケージ</h1>
          <p className="mt-2">
            この画面はローカル環境専用です。<code>publish-packages/</code> をリポジトリから直接読み込みます。
          </p>
          <p className="mt-1">
            <strong>ローカルで起動してください</strong>: <code>cd dashboard && npm run dev</code>
            （または環境変数 <code>ENABLE_LOCAL_FS_ROUTES=true</code> を設定）
          </p>
        </section>
      </main>
    )
  }

  const [pkg, publishState] = await Promise.all([
    readPublishPackage(slug),
    fetchPublishState(slug),
  ])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader pkg={pkg} publishState={publishState} />
      <PlatformOverviewCards pkg={pkg} publishState={publishState} />

      <XSection pkg={pkg} platformState={findPlatformState(publishState, 'x')} />
      <ThreadsSection pkg={pkg} platformState={findPlatformState(publishState, 'threads')} />
      <NoteSection pkg={pkg} platformState={findPlatformState(publishState, 'note')} />
      <SubstackSection pkg={pkg} platformState={findPlatformState(publishState, 'substack')} />

      <ReleaseReviewFooter pkg={pkg} />
    </main>
  )
}

// ---------- Page header ----------

function PageHeader({
  pkg,
  publishState,
}: {
  pkg: PublishPackage
  publishState: PublishPackageState | null
}) {
  const isHitori = pkg.slug === 'building-hitori-media-os'
  const campaignLabel = isHitori
    ? 'AIで「ひとりメディア運営OS」を作っている裏側'
    : pkg.slug

  const mps = publishState?.manualPublishingStatus ?? []
  const totalTracked = ['x', 'threads', 'note', 'substack'].filter((p) =>
    mps.some((it) => it.platform === p),
  ).length
  const doneCount = mps.filter((it) => it.state === 'done').length
  const allDone = totalTracked > 0 && doneCount === totalTracked
  const partial = doneCount > 0 && !allDone

  let nextValue = '媒体ごとにコピーして投稿'
  let nextTone: 'done' | 'info' | 'warn' = 'warn'
  if (allDone) {
    nextValue = '全媒体公開済み — Reaction Notes を後日記入'
    nextTone = 'done'
  } else if (partial) {
    nextValue = `${doneCount} / ${totalTracked} 公開済み — 残りを手動投稿`
    nextTone = 'warn'
  }

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">公開パッケージ</h1>
      <p className="mt-1 text-sm text-slate-600">
        この画面から各媒体に投稿文をコピーし、画像を確認して、手動公開できます。
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        <span className="text-slate-500">対象キャンペーン:</span>
        <span className="font-medium text-slate-900">{campaignLabel}</span>
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{pkg.slug}</code>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <Pair label="技術準備" value="完了" tone="done" />
        <Pair
          label="公開状況"
          value={
            publishState === null
              ? '未取得（Sanity 接続不可）'
              : totalTracked === 0
                ? '未設定'
                : `${doneCount} / ${totalTracked} 公開済み`
          }
          tone={allDone ? 'done' : partial ? 'warn' : 'info'}
        />
        <Pair label="次にやること" value={nextValue} tone={nextTone} />
      </dl>
    </header>
  )
}

function Pair({label, value, tone}: {label: string; value: string; tone: 'done' | 'info' | 'warn'}) {
  const cls =
    tone === 'done'
      ? 'bg-emerald-50 text-emerald-900 ring-emerald-200'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-950 ring-amber-200'
        : 'bg-slate-50 text-slate-800 ring-slate-200'
  return (
    <div className={`rounded-md ring-1 px-3 py-2 ${cls}`}>
      <dt className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

// ---------- Platform overview cards ----------

function PlatformOverviewCards({
  pkg,
  publishState,
}: {
  pkg: PublishPackage
  publishState: PublishPackageState | null
}) {
  const platforms: Array<{
    key: string
    label: string
    anchor: string
    hasText: boolean
    hasImage: boolean
    reviewed: boolean
    extra?: string
  }> = [
    {
      key: 'x',
      label: 'X',
      anchor: '#x',
      hasText: !!pkg.x.mainPost,
      hasImage: pkg.x.images.length > 0,
      reviewed: true,
    },
    {
      key: 'threads',
      label: 'Threads',
      anchor: '#threads',
      hasText: !!pkg.threads.mainPost,
      hasImage: pkg.threads.images.length > 0,
      reviewed: true,
    },
    {
      key: 'note',
      label: 'note',
      anchor: '#note',
      hasText: !!pkg.note.articleBody,
      hasImage: pkg.note.images.length > 0,
      reviewed: true,
      extra: pkg.note.insertMapStale ? 'insert-map が stale' : undefined,
    },
    {
      key: 'substack',
      label: 'Substack',
      anchor: '#substack',
      hasText: !!pkg.substack.postBody,
      hasImage: pkg.substack.images.length > 0,
      reviewed: true,
      extra:
        pkg.substack.aboutPageIsStub || pkg.substack.welcomeEmailIsStub || pkg.substack.notesFileIsStub
          ? 'About/Welcome/Notes 未記入'
          : undefined,
    },
  ]
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {platforms.map((p) => {
        const state = findPlatformState(publishState, p.key)
        const published = isPublished(state)
        const at = formatPublishedAtJst(state?.publishedAt)
        return (
          <a
            key={p.key}
            href={p.anchor}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-900">{p.label}</h2>
              <span className="text-xs text-sky-700 underline underline-offset-2">開く</span>
            </div>
            <div className="mt-2">
              <PublishedBadge published={published} state={state?.state} />
              {published && at && (
                <p className="mt-1 text-[11px] text-slate-500">公開日時: {at}</p>
              )}
            </div>
            <ul className="mt-2 space-y-0.5 text-xs">
              <li className={p.hasText ? 'text-emerald-700' : 'text-slate-400'}>
                {p.hasText ? '✓ 投稿文あり' : '× 投稿文なし'}
              </li>
              <li className={p.hasImage ? 'text-emerald-700' : 'text-slate-400'}>
                {p.hasImage ? '✓ 画像あり' : '× 画像なし'}
              </li>
              <li className="text-emerald-700">✓ レビュー済み</li>
              {p.extra && <li className="text-amber-700">⚠ {p.extra}</li>}
            </ul>
          </a>
        )
      })}
    </section>
  )
}

function PublishedBadge({published, state}: {published: boolean; state?: string}) {
  if (published) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 ring-1 ring-inset ring-emerald-300">
        ✓ 公開済み
      </span>
    )
  }
  const label = state === 'not-started' || !state ? '⏳ 未公開' : `⏳ ${state}`
  return (
    <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-300">
      {label}
    </span>
  )
}

function PublishedStatusBlock({state}: {state?: PublishPackagePlatformState}) {
  const published = isPublished(state)
  const at = formatPublishedAtJst(state?.publishedAt)
  if (published && state?.publishedUrl) {
    return (
      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-medium">✓ 公開済み</span>
          {at && <span className="text-xs text-emerald-900">公開日時: {at}</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-900">公開済みURL</span>
          <a
            href={state.publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-emerald-900 underline underline-offset-2 hover:text-emerald-700"
          >
            {state.publishedUrl}
          </a>
          <CopyButton text={state.publishedUrl} label="URLをコピー" />
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
      <span className="font-medium">公開予定: 未公開</span>
      <span className="ml-2 text-xs">
        （state: {state?.state ?? '不明'}）
      </span>
    </div>
  )
}

// ---------- Shared platform card layout ----------

function PlatformCard({
  id,
  title,
  emoji,
  children,
}: {
  id: string
  title: string
  emoji?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-baseline gap-2">
        {emoji && <span className="text-xl" aria-hidden="true">{emoji}</span>}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function TextBlock({label, text}: {label: string; text: string}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <CopyButton text={text} label="コピー" />
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900 font-sans">
        {text}
      </pre>
    </div>
  )
}

function ManualStepsList({steps}: {steps: string[]}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-amber-950">手順</div>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-amber-950">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}

function ImageList({
  images,
  expectedFilenames,
}: {
  images: {filename: string; relativePath: string; byteSize: number}[]
  expectedFilenames?: string[]
}) {
  if (images.length === 0) {
    return <p className="text-xs text-rose-700">⚠ 画像が見つかりません</p>
  }
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">画像</div>
      <ul className="mt-1.5 space-y-1 text-sm">
        {images.map((img) => {
          const expected = expectedFilenames?.includes(img.filename) ?? true
          return (
            <li key={img.relativePath} className="flex flex-wrap items-baseline gap-2">
              <span className={expected ? 'font-medium text-slate-900' : 'font-medium text-amber-800'}>
                {img.filename}
              </span>
              <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700">
                {img.relativePath}
              </code>
              <span className="text-[11px] text-slate-500">
                {(img.byteSize / 1024).toFixed(0)} KB
              </span>
              <CopyButton text={img.relativePath} label="パスをコピー" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------- X section ----------

function XSection({
  pkg,
  platformState,
}: {
  pkg: PublishPackage
  platformState?: PublishPackagePlatformState
}) {
  const c = pkg.x
  return (
    <PlatformCard id="x" title="X" emoji="✕">
      <PublishedStatusBlock state={platformState} />
      {!c.available && <p className="text-sm text-rose-700">posts.md が読めません。</p>}
      {c.mainPost && <TextBlock label="メイン投稿" text={c.mainPost} />}
      {c.alternateHooks.length > 0 && (
        <BulletWithCopy label="Alternate Hooks（候補、1つだけ採用）" items={c.alternateHooks} />
      )}
      {c.threadPosts.length > 0 && (
        <ThreadCopySection
          label={`Optional Thread（${c.threadPosts.length} 投稿、4〜6 に絞る判断あり）`}
          posts={c.threadPosts}
          joinSeparator="\n\n"
        />
      )}
      {c.softCtas.length > 0 && (
        <BulletWithCopy label="Soft CTA（1つだけ採用）" items={c.softCtas} />
      )}
      <ImageList images={c.images} expectedFilenames={['x-hook-main-v1.png']} />
      <ManualStepsList
        steps={[
          'X を開く',
          '投稿文を貼る',
          '画像を添付（x-hook-main-v1.png）',
          '公開',
          'Published URL を x-final-review.md に記録',
        ]}
      />
      <DevDetails sourceFile={c.sourceFile} />
    </PlatformCard>
  )
}

// ---------- Threads section ----------

function ThreadsSection({
  pkg,
  platformState,
}: {
  pkg: PublishPackage
  platformState?: PublishPackagePlatformState
}) {
  const c = pkg.threads
  return (
    <PlatformCard id="threads" title="Threads" emoji="@">
      <PublishedStatusBlock state={platformState} />
      {!c.available && <p className="text-sm text-rose-700">posts.md が読めません。</p>}
      {c.mainPost && <TextBlock label="メイン投稿" text={c.mainPost} />}
      {c.alternateMainPosts.length > 0 && (
        <BulletWithCopy label="Alternate Main Posts（候補、1つだけ採用）" items={c.alternateMainPosts} />
      )}
      {c.replyChain.length > 0 && (
        <ThreadCopySection
          label={`Optional Reply Chain（${c.replyChain.length} 返信、4〜5 に絞るのが推奨）`}
          posts={c.replyChain}
          joinSeparator="\n\n"
        />
      )}
      {c.discussionQuestion && (
        <TextBlock label="Discussion Question" text={c.discussionQuestion} />
      )}
      {c.softCtas.length > 0 && (
        <BulletWithCopy label="Soft CTA（控えめに）" items={c.softCtas} />
      )}
      <ImageList images={c.images} expectedFilenames={['threads-support-diagram-v1.png']} />
      <ManualStepsList
        steps={[
          'Threads を開く',
          'メイン投稿を貼る',
          '画像を添付（threads-support-diagram-v1.png）',
          '必要な返信だけ投稿',
          'Published URL を threads-final-review.md に記録',
        ]}
      />
      <DevDetails sourceFile={c.sourceFile} />
    </PlatformCard>
  )
}

// ---------- note section ----------

function NoteSection({
  pkg,
  platformState,
}: {
  pkg: PublishPackage
  platformState?: PublishPackagePlatformState
}) {
  const c = pkg.note
  return (
    <PlatformCard id="note" title="note" emoji="N">
      <PublishedStatusBlock state={platformState} />
      {!c.available && <p className="text-sm text-rose-700">article.md が読めません。</p>}

      {(c.insertMapStale || pkg.note.images.length > 0) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <div className="font-medium">⚠ 公開時の注意</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>
              <code>note-inline-manual-vs-automation-v1</code> と{' '}
              <code>note-inline-publish-package-folder-v1</code> は今回保留。
            </li>
            <li>
              <code>article.md</code> 第 4 章末尾の「想定画像挿入: 手動 → 半自動 → 自動」マーカーは
              skipped 画像を指しているため、公開時に削除するか{' '}
              <code>note-inline-human-judgment-v1</code> に置き換える。
            </li>
            {c.insertMapStale && (
              <li>
                <code>insert-map.md</code> が stale（配布済み 3 枚未反映）。
                article.md 本文の「想定画像挿入」マーカーと下の Image Insertion Points を直接参照してください。
              </li>
            )}
          </ul>
        </div>
      )}

      {c.titleOptions.length > 0 && (
        <BulletWithCopy label="Title Options（1つ採用）" items={c.titleOptions} />
      )}
      {c.leadParagraph && <TextBlock label="Lead Paragraph（冒頭リード）" text={c.leadParagraph} />}
      {c.articleBody && <TextBlock label="Article Body（本文 7 章）" text={c.articleBody} />}
      {c.suggestedImageInsertionPoints.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Suggested Image Insertion Points
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-800">
            {c.suggestedImageInsertionPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {c.softCtas.length > 0 && (
        <BulletWithCopy label="Soft CTA（控えめに）" items={c.softCtas} />
      )}
      <ImageList
        images={c.images}
        expectedFilenames={[
          'campaign-hero-v1.png',
          'note-inline-content-os-flow-v1.png',
          'note-inline-human-judgment-v1.png',
        ]}
      />
      <ManualStepsList
        steps={[
          'note を開く',
          'タイトルと本文を貼る',
          'hero 画像（campaign-hero-v1.png）を設定',
          'inline 画像 2 枚（content-os-flow / human-judgment）を配置',
          'skipped 画像の挿入マーカーを削除または修正',
          '公開',
          'Published URL を note-final-review.md に記録',
        ]}
      />
      <DevDetails sourceFile={c.sourceFile} />
    </PlatformCard>
  )
}

// ---------- Substack section ----------

function SubstackSection({
  pkg,
  platformState,
}: {
  pkg: PublishPackage
  platformState?: PublishPackagePlatformState
}) {
  const c = pkg.substack
  const anyStub = c.aboutPageIsStub || c.welcomeEmailIsStub || c.notesFileIsStub
  return (
    <PlatformCard id="substack" title="Substack" emoji="S">
      <PublishedStatusBlock state={platformState} />
      {!c.available && <p className="text-sm text-rose-700">post.md が読めません。</p>}

      {anyStub && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <div className="font-medium">⚠ Publication 全体の体裁は未完成</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {c.aboutPageIsStub && (
              <li>
                <code>about-page.md</code> は TODO stub（boss が手書きで埋める）
              </li>
            )}
            {c.welcomeEmailIsStub && (
              <li>
                <code>welcome-email.md</code> は TODO stub（boss が手書きで埋める）
              </li>
            )}
            {c.notesFileIsStub && (
              <li>
                <code>notes.md</code> は TODO stub（Notes コンテンツは下の Substack Notes Plan からコピー）
              </li>
            )}
          </ul>
          <p className="mt-2">
            Post 自体は publishable。Publication 全体の体裁完成は boss の手書き作業に依存。
          </p>
        </div>
      )}

      {c.titleOptions.length > 0 && (
        <BulletWithCopy label="Title Options（1つ採用）" items={c.titleOptions} />
      )}
      {c.emailSubjectOptions.length > 0 && (
        <BulletWithCopy label="Email Subject Options（1つ採用）" items={c.emailSubjectOptions} />
      )}
      {c.previewText && <TextBlock label="Preview Text" text={c.previewText} />}
      {c.postBody && <TextBlock label="Post Body（Opening 〜 Subscribe CTA）" text={c.postBody} />}
      {c.notesPlan && (
        <TextBlock label="Substack Notes Plan（Notes 候補）" text={c.notesPlan} />
      )}
      <ImageList
        images={c.images}
        expectedFilenames={['campaign-hero-v1.png', 'substack-inline-reader-system-v1.png']}
      />
      <ManualStepsList
        steps={[
          'Substack を開く',
          'Post 本文を貼る',
          'header 画像（campaign-hero-v1.png）を設定',
          'inline 画像（substack-inline-reader-system-v1.png）を配置',
          '必要なら About / Welcome Email を手書きで埋める',
          '公開',
          'Published URL を substack-final-review.md に記録',
        ]}
      />
      <DevDetails sourceFile={c.sourceFile} />
    </PlatformCard>
  )
}

// ---------- Shared helpers ----------

function BulletWithCopy({label, items}: {label: string; items: string[]}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <ul className="mt-1.5 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-start justify-between gap-2">
            <span className="text-slate-800">{it}</span>
            <CopyButton text={it} label="コピー" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ThreadCopySection({
  label,
  posts,
  joinSeparator,
}: {
  label: string
  posts: string[]
  joinSeparator: string
}) {
  const allJoined = posts.join(joinSeparator.replace(/\\n/g, '\n'))
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <CopyButton text={allJoined} label="全返信をコピー" tone="primary" />
      </div>
      <ol className="mt-1 space-y-2 text-sm">
        {posts.map((p, i) => (
          <li key={i} className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">{i + 1}/{posts.length}</span>
              <CopyButton text={p} label="この投稿をコピー" />
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900 font-sans">
              {p}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  )
}

function DevDetails({sourceFile}: {sourceFile: string}) {
  return (
    <details className="text-xs text-slate-500">
      <summary className="cursor-pointer">詳細情報</summary>
      <p className="mt-1">
        ソースファイル:{' '}
        <code className="break-all rounded bg-slate-50 px-1.5 py-0.5">{sourceFile}</code>
      </p>
    </details>
  )
}

// ---------- Release review footer ----------

function ReleaseReviewFooter({pkg}: {pkg: PublishPackage}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開後に記録するファイル</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          各 final-review に Published URL / Reaction Notes を手書きで埋めてください。
          このダッシュボードは記入先のガイドのみ表示します（保存はしません）。
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        {pkg.releaseReview.files.map((f) => (
          <li
            key={f.filename}
            className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div>
              <span className="font-medium text-slate-900">{f.label}</span>
              {!f.exists && <span className="ml-2 text-xs text-rose-700">(見つかりません)</span>}
            </div>
            <code className="break-all rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">
              {f.relativePath}
            </code>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Link
          href="/campaigns/building-hitori-media-os"
          className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
        >
          ← キャンペーン詳細に戻る
        </Link>
        <Link
          href="/publish-packages"
          className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
        >
          配布物一覧（dev）→
        </Link>
      </div>
    </section>
  )
}
