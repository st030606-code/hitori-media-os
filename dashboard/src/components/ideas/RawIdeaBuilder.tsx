'use client'

// Phase 2C-0 — Raw Idea + Idea Development Package builder UI.
//
// Behaviour:
//   - Form fields for the raw idea (rawTitle / roughMemo / sourceContext /
//     intendedTheme / urgency / relatedProject / initialPlatforms /
//     ideaSource). Only roughMemo is required.
//   - 「Preview prompt」 button calls the server action with mode='preview'
//     and shows planned paths + prompt preview. No filesystem touch.
//   - 「Create idea package」 button calls mode='execute' and shows a
//     success panel with copy-prompt / copy-command buttons + expected
//     result paths + boss instructions for running their AI agent manually.
//   - If writeReady=false or localFsReady=false, the execute button shows
//     a disabled explanation.

import {useCallback, useState, useTransition} from 'react'
import {
  createIdeaDevelopmentPackage,
  type CreateIdeaDevelopmentPackageResult,
} from '@/lib/actions/createIdeaDevelopmentPackage'
import {
  saveIdeaDevelopmentResult,
  type SaveIdeaDevelopmentResultResult,
} from '@/lib/actions/saveIdeaDevelopmentResult'
import {
  IDEA_SOURCE_VALUES,
  RELATED_PROJECT_VALUES,
  SUPPORTED_PLATFORMS,
  URGENCY_VALUES,
  type IdeaSource,
  type RelatedProject,
  type SupportedPlatform,
  type Urgency,
} from '@/lib/ideaJobs/promptBuilder'
import {EXPECTED_RESULT_FIELDS, MAX_RESULT_BYTES} from '@/lib/ideaJobs/resultParser'
import {CopyButton} from '@/components/CopyButton'
import {
  NextActionCard,
  WorkflowBadge,
  WorkflowNotice,
  WorkflowStepHeader,
} from '@/components/common/WorkflowGuide'

const URGENCY_LABEL: Record<Urgency, string> = {
  now: 'いま (now)',
  'this-week': '今週中 (this-week)',
  someday: 'いつか (someday)',
  unknown: '未定 (unknown)',
}

const RELATED_PROJECT_LABEL: Record<RelatedProject, string> = {
  'pota-empire-core': 'POTA Empire Core',
  'pota-card-pro': 'POTA Card Pro',
  'hitori-media-os': 'Hitori Media OS',
  external: '外部',
  other: 'その他',
}

const IDEA_SOURCE_LABEL: Record<IdeaSource, string> = {
  obsidian: 'Obsidian',
  'chatgpt-chat': 'ChatGPT chat',
  'claude-chat': 'Claude chat',
  'codex-chat': 'Codex chat',
  'voice-memo': '音声メモ',
  dream: '夢 / ふと',
  dialogue: '対話',
  manual: '手動',
}

const PLATFORM_LABEL: Record<SupportedPlatform, string> = {
  note: 'note',
  substack: 'Substack',
  threads: 'Threads',
  x: 'X',
  youtube: 'YouTube',
  shorts: 'Shorts',
  podcast: 'Podcast',
  diagram: '図解',
  github: 'GitHub',
  paid: '有料記事',
  instagram: 'Instagram',
  newsletter: 'Newsletter',
}

const MAX_ROUGH_MEMO_LEN = 4000
const MAX_FREE_FIELD_LEN = 400

interface Props {
  writeReady: boolean
  localFsReady: boolean
}

type ExecuteSuccess = Extract<CreateIdeaDevelopmentPackageResult, {ok: true; mode: 'execute'}>
type PreviewSuccess = Extract<CreateIdeaDevelopmentPackageResult, {ok: true; mode: 'preview'}>
type ActionError = Extract<CreateIdeaDevelopmentPackageResult, {ok: false}>

function errorMessage(result: ActionError): string {
  switch (result.error) {
    case 'validation':
      return `入力内容に問題があります: ${result.message}`
    case 'write-disabled':
      return 'ENABLE_WRITE_ACTIONS が off です。 .env.local で有効化してください。'
    case 'localfs-disabled':
      return 'ENABLE_LOCAL_FS_ROUTES が off です。 .env.local で有効化してください。'
    case 'path-rejected':
      return `path 検査で reject されました: ${result.message}`
    case 'write-failed':
      return `ファイル書き込みに失敗しました: ${result.message}`
    case 'unknown':
    default:
      return `予期しないエラー: ${result.message}`
  }
}

export function RawIdeaBuilder({writeReady, localFsReady}: Props) {
  const [rawTitle, setRawTitle] = useState('')
  const [roughMemo, setRoughMemo] = useState('')
  const [sourceContext, setSourceContext] = useState('')
  const [intendedTheme, setIntendedTheme] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('unknown')
  const [relatedProject, setRelatedProject] = useState<RelatedProject | ''>('')
  const [initialPlatforms, setInitialPlatforms] = useState<SupportedPlatform[]>([])
  const [ideaSource, setIdeaSource] = useState<IdeaSource | ''>('')
  const [preview, setPreview] = useState<PreviewSuccess | null>(null)
  const [executeResult, setExecuteResult] = useState<ExecuteSuccess | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const togglePlatform = useCallback((p: SupportedPlatform) => {
    setInitialPlatforms((prev) =>
      prev.includes(p) ? prev.filter((it) => it !== p) : [...prev, p],
    )
  }, [])

  const buildInput = useCallback(
    (mode: 'preview' | 'execute') => ({
      mode,
      rawTitle: rawTitle.trim() || undefined,
      roughMemo,
      sourceContext: sourceContext.trim() || undefined,
      intendedTheme: intendedTheme.trim() || undefined,
      urgency,
      relatedProject: relatedProject || undefined,
      initialPlatforms,
      ideaSource: ideaSource || undefined,
    }),
    [
      rawTitle,
      roughMemo,
      sourceContext,
      intendedTheme,
      urgency,
      relatedProject,
      initialPlatforms,
      ideaSource,
    ],
  )

  const onPreview = useCallback(() => {
    setErrorText(null)
    setExecuteResult(null)
    startTransition(async () => {
      const result = await createIdeaDevelopmentPackage(buildInput('preview'))
      if (result.ok && result.mode === 'preview') {
        setPreview(result)
      } else if (!result.ok) {
        setPreview(null)
        setErrorText(errorMessage(result))
      }
    })
  }, [buildInput])

  const onExecute = useCallback(() => {
    setErrorText(null)
    startTransition(async () => {
      const result = await createIdeaDevelopmentPackage(buildInput('execute'))
      if (result.ok && result.mode === 'execute') {
        setExecuteResult(result)
        setPreview(null)
      } else if (!result.ok) {
        setErrorText(errorMessage(result))
      }
    })
  }, [buildInput])

  const memoLength = roughMemo.length
  const memoOver = memoLength > MAX_ROUGH_MEMO_LEN
  const titleOver = rawTitle.length > MAX_FREE_FIELD_LEN
  const sourceOver = sourceContext.length > MAX_FREE_FIELD_LEN
  const themeOver = intendedTheme.length > MAX_FREE_FIELD_LEN
  const canPreview = roughMemo.trim().length > 0 && !memoOver && !titleOver && !sourceOver && !themeOver
  const canExecute = canPreview && writeReady && localFsReady

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <WorkflowStepHeader
          step="0-1"
          title="仮アイデアを書く"
          description="まだContent Ideaではありません。思いつき・メモ・会話ログを入力します。"
          badges={[
            {label: '保存先: ローカル', tone: 'blue'},
            {label: 'AI実行: 手動', tone: 'amber'},
          ]}
        />
        <WorkflowNotice tone="blue">
          Step 0-2 でDashboardがAI企画化プロンプトを作ります。DashboardはAIを自動実行せず、OpenAI / Anthropic APIも呼びません。
        </WorkflowNotice>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="raw-title" className="block text-xs font-semibold text-slate-700">
              rawTitle (任意)
            </label>
            <input
              id="raw-title"
              type="text"
              value={rawTitle}
              onChange={(e) => setRawTitle(e.target.value)}
              placeholder="例: Hitori Media OS の design discipline を 1 投稿で説明する"
              maxLength={MAX_FREE_FIELD_LEN + 10}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-1 text-[11px] text-slate-500">
              {rawTitle.length} / {MAX_FREE_FIELD_LEN} 文字
              {titleOver && <span className="ml-2 text-rose-600">超過しています</span>}
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="rough-memo" className="block text-xs font-semibold text-slate-700">
              roughMemo (必須)
            </label>
            <textarea
              id="rough-memo"
              rows={8}
              value={roughMemo}
              onChange={(e) => setRoughMemo(e.target.value)}
              placeholder="思いついたこと、 Obsidian のメモ、 会話ログ、 1 行のフックなど。 整理されていなくて構いません。"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-1 text-[11px] text-slate-500">
              {memoLength} / {MAX_ROUGH_MEMO_LEN} 文字
              {memoOver && <span className="ml-2 text-rose-600">超過しています</span>}
            </div>
          </div>

          <div>
            <label htmlFor="source-context" className="block text-xs font-semibold text-slate-700">
              source / context (任意)
            </label>
            <input
              id="source-context"
              type="text"
              value={sourceContext}
              onChange={(e) => setSourceContext(e.target.value)}
              placeholder="例: 2026-05-21 朝の Obsidian note"
              maxLength={MAX_FREE_FIELD_LEN + 10}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {sourceOver && (
              <div className="mt-1 text-[11px] text-rose-600">超過しています</div>
            )}
          </div>

          <div>
            <label htmlFor="intended-theme" className="block text-xs font-semibold text-slate-700">
              intendedTheme (任意)
            </label>
            <input
              id="intended-theme"
              type="text"
              value={intendedTheme}
              onChange={(e) => setIntendedTheme(e.target.value)}
              placeholder="例: design discipline / No-API workflow"
              maxLength={MAX_FREE_FIELD_LEN + 10}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {themeOver && (
              <div className="mt-1 text-[11px] text-rose-600">超過しています</div>
            )}
          </div>

          <div>
            <label htmlFor="urgency" className="block text-xs font-semibold text-slate-700">
              urgency
            </label>
            <select
              id="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {URGENCY_VALUES.map((v) => (
                <option key={v} value={v}>
                  {URGENCY_LABEL[v]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="related-project" className="block text-xs font-semibold text-slate-700">
              relatedProject (任意)
            </label>
            <select
              id="related-project"
              value={relatedProject}
              onChange={(e) => setRelatedProject(e.target.value as RelatedProject | '')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">(指定なし)</option>
              {RELATED_PROJECT_VALUES.map((v) => (
                <option key={v} value={v}>
                  {RELATED_PROJECT_LABEL[v]}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">
              initialPlatforms (任意、 複数選択可)
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {SUPPORTED_PLATFORMS.map((p) => {
                const active = initialPlatforms.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={
                      active
                        ? 'rounded-md border border-blue-600 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'
                        : 'rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50'
                    }
                    aria-pressed={active}
                  >
                    {PLATFORM_LABEL[p]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="idea-source" className="block text-xs font-semibold text-slate-700">
              ideaSource (任意)
            </label>
            <select
              id="idea-source"
              value={ideaSource}
              onChange={(e) => setIdeaSource(e.target.value as IdeaSource | '')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">(指定なし)</option>
              {IDEA_SOURCE_VALUES.map((v) => (
                <option key={v} value={v}>
                  {IDEA_SOURCE_LABEL[v]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={!canPreview || isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            プロンプトをプレビュー
          </button>
          <button
            type="button"
            onClick={onExecute}
            disabled={!canExecute || isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              !writeReady
                ? 'ENABLE_WRITE_ACTIONS が off です'
                : !localFsReady
                  ? 'ENABLE_LOCAL_FS_ROUTES が off です'
                  : ''
            }
          >
            アイデアパッケージを作成
          </button>
          {isPending && <span className="text-xs text-slate-500">処理中…</span>}
        </div>

        {!writeReady && (
          <p className="mt-2 text-xs text-amber-700">
            ENABLE_WRITE_ACTIONS が off のため、 ファイル書き込みは disabled です。 プレビューだけ可能。
          </p>
        )}
        {writeReady && !localFsReady && (
          <p className="mt-2 text-xs text-amber-700">
            ENABLE_LOCAL_FS_ROUTES が off のため、 idea-jobs/ への書き込みは disabled です。
          </p>
        )}

        {errorText && (
          <div
            role="alert"
            className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {errorText}
          </div>
        )}
      </div>

      {preview && !executeResult && (
        <PreviewPanel preview={preview} />
      )}

      {executeResult && <SuccessPanel result={executeResult} />}

      {executeResult && (
        <ResultImportSection
          ideaSlug={executeResult.ideaSlug}
          timestamp={executeResult.timestamp}
          writeReady={writeReady}
          localFsReady={localFsReady}
        />
      )}
    </section>
  )
}

function PreviewPanel({preview}: {preview: PreviewSuccess}) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-blue-900">プレビュー (まだ書き込みは行われていません)</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <WorkflowBadge label="Step 0-2: AI企画化プロンプトを作る" tone="blue" />
        <WorkflowBadge label="保存先: idea-jobs/" tone="blue" />
        <WorkflowBadge label="API: 未使用" tone="amber" />
      </div>
      <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
        <PathRow label="ideaSlug" value={preview.ideaSlug} />
        <PathRow label="timestamp" value={preview.timestamp} />
        <PathRow label="rawJsonPath" value={preview.rawJsonPath} mono />
        <PathRow label="promptPath" value={preview.promptPath} mono />
        <PathRow label="jobJsonPath" value={preview.jobJsonPath} mono />
        <PathRow label="expectedResultMd" value={preview.expectedResultMdPath} mono />
        <PathRow label="expectedResultJson" value={preview.expectedResultJsonPath} mono />
        <PathRow
          label="prompt bytes"
          value={`${preview.metrics.promptBytes} bytes (memo ${preview.metrics.roughMemoLength} 字)`}
        />
      </dl>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-blue-700">
          プロンプト本文を見る
        </summary>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-[11px] text-slate-800 ring-1 ring-inset ring-slate-200">
          {preview.promptText}
        </pre>
      </details>
      <p className="mt-3 text-xs text-slate-600">
        「アイデアパッケージを作成」 を押すと上記 3 ファイル (rawJson / prompt.md / job.json) が
        ローカルファイルに書き出されます。Sanityには書き込みません。
      </p>
    </div>
  )
}

function SuccessPanel({result}: {result: ExecuteSuccess}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-emerald-900">アイデアパッケージを作成しました</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <WorkflowBadge label="完了" tone="emerald" />
        <WorkflowBadge label="保存先: ローカル" tone="blue" />
        <WorkflowBadge label="AI実行: 手動" tone="amber" />
      </div>
      <p className="mt-1 text-xs text-slate-600">
        committedAt: <code>{result.committedAt}</code>
      </p>
      <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
        <PathRow label="ideaSlug" value={result.ideaSlug} />
        <PathRow label="timestamp" value={result.timestamp} />
        <PathRow label="rawJson 書き込み済" value={result.rawJsonPath} mono />
        <PathRow label="prompt.md 書き込み済" value={result.promptPath} mono />
        <PathRow label="job.json 書き込み済" value={result.jobJsonPath} mono />
        <PathRow label="expectedResultMd (boss が保存する)" value={result.expectedResultMdPath} mono />
        <PathRow label="expectedResultJson (boss が保存する)" value={result.expectedResultJsonPath} mono />
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CopyButton text={result.promptText} label="プロンプトをコピー" tone="primary" />
        <CopyButton
          text={result.suggestedCommands.codex}
          label="Codexコマンドをコピー"
        />
        <CopyButton
          text={result.suggestedCommands.claude}
          label="Claudeコマンドをコピー"
        />
        <CopyButton
          text={result.suggestedCommands.cat}
          label="pbcopy ワンライナーをコピー"
        />
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-emerald-700">
          推奨 CLI コマンド (表示のみ、 dashboard は実行しません)
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-white p-3 text-[11px] text-slate-800 ring-1 ring-inset ring-slate-200">
{`# codex を使う場合\n${result.suggestedCommands.codex}\n\n# claude CLI を使う場合\n${result.suggestedCommands.claude}\n\n# ChatGPT / Web UI に手動で貼る場合\n${result.suggestedCommands.cat}`}
        </pre>
      </details>

      <div className="mt-4">
        <NextActionCard
          tone="emerald"
          items={[
            'プロンプトをコピーする',
            'ChatGPT / Claude / Codexに手動で貼る',
            '返答を下の「AIの企画化結果を取り込む」に貼る',
          ]}
        />
        <p className="mt-2 text-[11px] text-slate-500">
          raw stage とAI実行は filesystem/manual に閉じ込めています。Sanity 書き込みは schema-aligned
          <code> contentIdea</code> create の controlled action だけです。
        </p>
      </div>
    </div>
  )
}

function PathRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
      <dd
        className={
          mono
            ? 'truncate font-mono text-[11px] text-slate-800'
            : 'truncate text-[11px] text-slate-800'
        }
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase 2C-0.1 — AI-developed result import.
// ---------------------------------------------------------------------------

type ResultPreview = Extract<SaveIdeaDevelopmentResultResult, {ok: true; mode: 'preview'}>
type ResultExecute = Extract<SaveIdeaDevelopmentResultResult, {ok: true; mode: 'execute'}>
type ResultError = Extract<SaveIdeaDevelopmentResultResult, {ok: false}>

function resultErrorMessage(result: ResultError): string {
  switch (result.error) {
    case 'validation':
      return `入力内容に問題があります: ${result.message}`
    case 'write-disabled':
      return 'ENABLE_WRITE_ACTIONS が off です。 .env.local で有効化してください。'
    case 'localfs-disabled':
      return 'ENABLE_LOCAL_FS_ROUTES が off です。 .env.local で有効化してください。'
    case 'path-rejected':
      return `path 検査で reject されました: ${result.message}`
    case 'parse-error':
      return `結果テキストの parse に失敗しました: ${result.message}`
    case 'write-failed':
      return `ファイル書き込みに失敗しました: ${result.message}`
    case 'unknown':
    default:
      return `予期しないエラー: ${result.message}`
  }
}

function ResultImportSection({
  ideaSlug,
  timestamp,
  writeReady,
  localFsReady,
}: {
  ideaSlug: string
  timestamp: string
  writeReady: boolean
  localFsReady: boolean
}) {
  const [resultText, setResultText] = useState('')
  const [preview, setPreview] = useState<ResultPreview | null>(null)
  const [executeResult, setExecuteResult] = useState<ResultExecute | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const resultBytes =
    typeof window === 'undefined' ? resultText.length : new Blob([resultText]).size
  const resultOver = resultBytes > MAX_RESULT_BYTES
  const canPreview = resultText.trim().length > 0 && !resultOver
  const canSave = canPreview && writeReady && localFsReady

  const onPreview = useCallback(() => {
    setErrorText(null)
    setExecuteResult(null)
    startTransition(async () => {
      const result = await saveIdeaDevelopmentResult({
        ideaSlug,
        timestamp,
        resultText,
        mode: 'preview',
      })
      if (result.ok && result.mode === 'preview') {
        setPreview(result)
      } else if (!result.ok) {
        setPreview(null)
        setErrorText(resultErrorMessage(result))
      }
    })
  }, [ideaSlug, timestamp, resultText])

  const onSave = useCallback(() => {
    setErrorText(null)
    startTransition(async () => {
      const result = await saveIdeaDevelopmentResult({
        ideaSlug,
        timestamp,
        resultText,
        mode: 'execute',
      })
      if (result.ok && result.mode === 'execute') {
        setExecuteResult(result)
        setPreview(null)
      } else if (!result.ok) {
        setErrorText(resultErrorMessage(result))
      }
    })
  }, [ideaSlug, timestamp, resultText])

  const onReset = useCallback(() => {
    setResultText('')
    setPreview(null)
    setExecuteResult(null)
    setErrorText(null)
  }, [])

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Step 0-3
          </div>
          <h3 className="text-sm font-semibold text-slate-900">AIの企画化結果を取り込む</h3>
          <p className="mt-1 text-xs text-slate-600">
            ChatGPT / Claude Code / Codex から戻ってきた markdown 結果をそのまま貼り付けます。
            JSON ブロック (<code>```json</code> ... <code>```</code>) があれば自動検出して
            <code>result.json</code> としても保存します。 dashboard は AI を呼びません。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <WorkflowBadge label="保存先: ローカル" tone="blue" />
            <WorkflowBadge label="API: 未使用" tone="amber" />
          </div>
        </div>
        {(preview || executeResult || resultText.length > 0) && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            クリア
          </button>
        )}
      </div>

      <div className="mt-3">
        <label htmlFor="result-text" className="block text-xs font-semibold text-slate-700">
          AI 結果 (markdown、 JSON ブロックを含めて貼り付け可)
        </label>
        <textarea
          id="result-text"
          rows={10}
          value={resultText}
          onChange={(e) => setResultText(e.target.value)}
          placeholder="ChatGPT / Claude / Codex から返ってきた markdown 全文を貼り付けます。&#10;末尾に ```json ... ``` を含む場合は自動的に検出して result.json も書き出します。"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-blue-500 focus:outline-none"
        />
        <div className="mt-1 text-[11px] text-slate-500">
          {(resultBytes / 1024).toFixed(1)} KB / {(MAX_RESULT_BYTES / 1024).toFixed(0)} KB
          {resultOver && <span className="ml-2 text-rose-600">200 KB を超えています</span>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={!canPreview || isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          企画化結果をプレビュー
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={
            !writeReady
              ? 'ENABLE_WRITE_ACTIONS が off です'
              : !localFsReady
                ? 'ENABLE_LOCAL_FS_ROUTES が off です'
                : ''
          }
        >
          企画化結果を保存
        </button>
        {isPending && <span className="text-xs text-slate-500">処理中…</span>}
      </div>

      {!writeReady && (
        <p className="mt-2 text-xs text-amber-700">
          ENABLE_WRITE_ACTIONS が off のため、 ファイル書き込みは disabled です。 preview だけ可能。
        </p>
      )}
      {writeReady && !localFsReady && (
        <p className="mt-2 text-xs text-amber-700">
          ENABLE_LOCAL_FS_ROUTES が off のため、 idea-jobs/ への書き込みは disabled です。
        </p>
      )}

      {errorText && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {errorText}
        </div>
      )}

      {preview && !executeResult && (
        <ResultPreviewPanel preview={preview} />
      )}

      {executeResult && <ResultSavedPanel result={executeResult} />}
    </div>
  )
}

function ResultPreviewPanel({preview}: {preview: ResultPreview}) {
  return (
    <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/40 p-3 shadow-sm">
      <h4 className="text-xs font-semibold text-blue-900">プレビュー (まだ書き込みは行われていません)</h4>
      <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
        <PathRow label="result.md 予定先" value={preview.resultMdPath} mono />
        <PathRow
          label="result.json 予定先"
          value={preview.resultJsonPath ?? '(JSON 未検出 → markdown のみ保存)'}
          mono
        />
        <PathRow
          label="結果 size"
          value={`${(preview.metrics.resultBytes / 1024).toFixed(1)} KB`}
        />
        <PathRow
          label="JSON size"
          value={
            preview.metrics.structuredJsonBytes !== null
              ? `${(preview.metrics.structuredJsonBytes / 1024).toFixed(1)} KB`
              : '—'
          }
        />
      </dl>

      <div className="mt-3">
        <p className="text-[11px] font-semibold text-slate-700">
          検出された expected fields ({preview.detectedFields.length} / {EXPECTED_RESULT_FIELDS.length})
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {EXPECTED_RESULT_FIELDS.map((f) => {
            const present = preview.detectedFields.includes(f)
            return (
              <span
                key={f}
                className={
                  present
                    ? 'rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700'
                    : 'rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-400'
                }
              >
                {f}
              </span>
            )
          })}
        </div>
      </div>

      {preview.parseWarnings.length > 0 && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <p className="font-semibold">警告</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
            {preview.parseWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-blue-700">
          結果テキストの先頭を見る (最大 600 文字)
        </summary>
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-[11px] text-slate-800 ring-1 ring-inset ring-slate-200">
          {preview.previewExcerpt}
        </pre>
      </details>

      <p className="mt-3 text-xs text-slate-600">
        「企画化結果を保存」 を押すと <code>result.md</code>
        {preview.resultJsonPath !== null && (
          <>
            {' '}
            と <code>result.json</code>
          </>
        )}{' '}
        が書き出されます。
      </p>
    </div>
  )
}

function ResultSavedPanel({result}: {result: ResultExecute}) {
  return (
    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 shadow-sm">
      <h4 className="text-xs font-semibold text-emerald-900">AI企画化結果を保存しました</h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <WorkflowBadge label="完了" tone="emerald" />
        <WorkflowBadge label="保存先: ローカル" tone="blue" />
        <WorkflowBadge label="次の操作あり" tone="amber" />
      </div>
      <p className="mt-1 text-[11px] text-slate-600">
        committedAt: <code>{result.committedAt}</code>
      </p>
      <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
        <PathRow label="result.md 書き込み済" value={result.resultMdPath} mono />
        <PathRow
          label="result.json"
          value={result.resultJsonPath ?? '(JSON 未検出 → 書き込みなし)'}
          mono
        />
        <PathRow
          label="結果 size"
          value={`${(result.metrics.resultBytes / 1024).toFixed(1)} KB`}
        />
        <PathRow
          label="JSON size"
          value={
            result.metrics.structuredJsonBytes !== null
              ? `${(result.metrics.structuredJsonBytes / 1024).toFixed(1)} KB`
              : '—'
          }
        />
      </dl>

      <div className="mt-3">
        <p className="text-[11px] font-semibold text-slate-700">
          検出された expected fields ({result.detectedFields.length} / {EXPECTED_RESULT_FIELDS.length})
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {EXPECTED_RESULT_FIELDS.map((f) => {
            const present = result.detectedFields.includes(f)
            return (
              <span
                key={f}
                className={
                  present
                    ? 'rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700'
                    : 'rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-400'
                }
              >
                {f}
              </span>
            )
          })}
        </div>
      </div>

      {result.parseWarnings.length > 0 && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <p className="font-semibold">警告</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
            {result.parseWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {result.hasStructuredJson && result.structuredJsonText && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton
            text={result.structuredJsonText}
            label="Content Idea 用 JSON をコピー"
            tone="primary"
          />
          <span className="text-[11px] text-slate-500">
            (In Development list の Content Idea create preview で schema-aligned draft に変換されます)
          </span>
        </div>
      )}

      <div className="mt-4">
        <NextActionCard
          tone="emerald"
          items={[
            '下の既存ジョブ一覧で「Content Idea作成を確認」を開く',
            'Sanity必須fieldチェックを確認する',
            'Content IdeaをSanityに作成する',
          ]}
        />
        <WorkflowNotice>
          今は <code>result.md</code>
          {result.resultJsonPath !== null ? <> + <code>result.json</code></> : null}
          をローカルに保存しただけです。この操作ではSanityに書き込みません。
        </WorkflowNotice>
      </div>
    </div>
  )
}
