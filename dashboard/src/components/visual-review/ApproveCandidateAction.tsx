'use client'

// Phase 2B-3 — Visual Register approve & register action card.
//
// UX flow (boss-confirmed via handoff/0188):
//   1. read mode — button visible only when a candidate is selected and
//      both env flags are on. Otherwise renders a disabled affordance
//      explaining why.
//   2. button click → server action `mode: 'preview'` runs (no network
//      call to Visual Register, no filesystem touch). The result is shown
//      in an inline confirm panel: planned paths, "overwrite likely"
//      warning if `plan.localAssetPath` is already set, an overwrite
//      checkbox guard.
//   3. confirm → server action `mode: 'execute'` POSTs to
//      `localhost:3334/api/inbox/approve-and-register`. Visual Register
//      copies the file, writes the patch JSON, updates the manifest.
//   4. success → result panel shows the final paths, manifest status, and
//      the next-step commands (Sanity reflect + publish-package) with a
//      <CopyButton> on each. Manual rollback note explains how to undo
//      since automatic undo is not available for file operations
//      (Q-2B3-5).
//   5. errors are rendered inline (Visual Register down / overwrite
//      required / candidate not found / etc.) with a clear path back to
//      the boss — never log token, prompt body, or review body.

import {useCallback, useState, useTransition} from 'react'
import {useRouter} from 'next/navigation'
import {CheckCircle2, ExternalLink, Pencil, Lock, RefreshCw} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'
import {
  approveVisualCandidate,
  type ApproveVisualCandidateResult,
} from '@/lib/actions/approveVisualCandidate'

interface Props {
  assetId: string
  campaignSlug: string
  assetSlug: string
  /** Currently selected candidate. Null when no candidate is selected,
   *  or when local FS is disabled and the candidate list is empty. */
  selected: {
    id: string                                   // 'v003'
    fileName: string                             // 'v003.png'
    relativePath: string                          // 'assets/inbox/generated/<slug>/<asset>/v003.png'
  } | null
  /** Plan's `expectedLocalAssetPath` if set in Sanity. */
  expectedLocalAssetPath: string | null
  /** Plan's `localAssetPath` (set by a previous registration, if any). */
  currentLocalAssetPath: string | null
  writeReady: boolean
  localFsReady: boolean
}

type Status =
  | {kind: 'idle'}
  | {kind: 'preview'; preview: ExecutePreview; overwriteChecked: boolean}
  | {kind: 'executing'; preview: ExecutePreview}
  | {kind: 'success'; preview: ExecutePreview; result: SuccessResult}
  | {kind: 'error'; message: string; isOverwriteRequired: boolean; previousPreview: ExecutePreview | null}

interface ExecutePreview {
  assetId: string
  campaignSlug: string
  assetSlug: string
  candidateFile: string
  candidateRelativePath: string
  plannedFinalAssetPath: string | null
  plannedPatchPath: string
  overwriteLikely: boolean
}

interface SuccessResult {
  finalAssetPath: string
  patchPath: string
  manifestUpdated: boolean
  committedAtIso: string
  nextStepsHint: {sanityReflectCommand: string; publishPackageCommand: string}
}

const VISUAL_REGISTER_URL = 'http://localhost:3334'

export function ApproveCandidateAction({
  assetId,
  campaignSlug,
  assetSlug,
  selected,
  expectedLocalAssetPath,
  currentLocalAssetPath,
  writeReady,
  localFsReady,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>({kind: 'idle'})
  const [, startTransition] = useTransition()

  const disabledReason: string | null = (() => {
    if (!localFsReady) return 'ENABLE_LOCAL_FS_ROUTES が off のため利用できません'
    if (!writeReady) return 'ENABLE_WRITE_ACTIONS が off のため利用できません'
    if (!selected) return '候補画像を選択してください'
    return null
  })()

  const startPreview = useCallback(() => {
    if (!selected) return
    if (!writeReady || !localFsReady) return
    setStatus({kind: 'executing', preview: {
      assetId,
      campaignSlug,
      assetSlug,
      candidateFile: selected.fileName,
      candidateRelativePath: selected.relativePath,
      plannedFinalAssetPath: currentLocalAssetPath || expectedLocalAssetPath || null,
      plannedPatchPath: `patches/visual-assets/${campaignSlug}/${assetSlug}.json`,
      overwriteLikely: !!currentLocalAssetPath,
    }})
    startTransition(async () => {
      let result: ApproveVisualCandidateResult
      try {
        result = await approveVisualCandidate({
          assetId,
          campaignSlug,
          assetSlug,
          candidateFile: selected.fileName,
          candidateRelativePath: selected.relativePath,
          expectedLocalAssetPath,
          currentLocalAssetPath,
          mode: 'preview',
        })
      } catch (e) {
        setStatus({
          kind: 'error',
          message: e instanceof Error ? e.message : 'preview に失敗しました',
          isOverwriteRequired: false,
          previousPreview: null,
        })
        return
      }
      if (!result.ok) {
        setStatus({
          kind: 'error',
          message: result.message,
          isOverwriteRequired: false,
          previousPreview: null,
        })
        return
      }
      if (result.mode !== 'preview') return
      setStatus({
        kind: 'preview',
        preview: {
          assetId: result.preview.assetId,
          campaignSlug: result.preview.campaignSlug,
          assetSlug: result.preview.assetSlug,
          candidateFile: result.preview.candidateFile,
          candidateRelativePath: result.preview.candidateRelativePath,
          plannedFinalAssetPath: result.preview.plannedFinalAssetPath,
          plannedPatchPath: result.preview.plannedPatchPath,
          overwriteLikely: result.preview.overwriteLikely,
        },
        overwriteChecked: false,
      })
    })
  }, [
    assetId,
    campaignSlug,
    assetSlug,
    selected,
    writeReady,
    localFsReady,
    expectedLocalAssetPath,
    currentLocalAssetPath,
  ])

  const cancelPreview = useCallback(() => setStatus({kind: 'idle'}), [])

  const executeApprove = useCallback(
    (preview: ExecutePreview, overwriteConfirmed: boolean) => {
      setStatus({kind: 'executing', preview})
      startTransition(async () => {
        let result: ApproveVisualCandidateResult
        try {
          result = await approveVisualCandidate({
            assetId: preview.assetId,
            campaignSlug: preview.campaignSlug,
            assetSlug: preview.assetSlug,
            candidateFile: preview.candidateFile,
            candidateRelativePath: preview.candidateRelativePath,
            expectedLocalAssetPath,
            currentLocalAssetPath,
            overwriteConfirmed,
            mode: 'execute',
          })
        } catch (e) {
          setStatus({
            kind: 'error',
            message: e instanceof Error ? e.message : '実行に失敗しました',
            isOverwriteRequired: false,
            previousPreview: preview,
          })
          return
        }
        if (!result.ok) {
          setStatus({
            kind: 'error',
            message: result.message,
            isOverwriteRequired: result.error === 'overwrite-required',
            previousPreview: preview,
          })
          return
        }
        if (result.mode !== 'execute') return
        setStatus({
          kind: 'success',
          preview,
          result: {
            finalAssetPath: result.finalAssetPath,
            patchPath: result.patchPath,
            manifestUpdated: result.manifestUpdated,
            committedAtIso: result.committedAtIso,
            nextStepsHint: result.nextStepsHint,
          },
        })
        router.refresh()
      })
    },
    [expectedLocalAssetPath, currentLocalAssetPath, router],
  )

  const reopenPreviewWithOverwrite = useCallback(() => {
    if (status.kind !== 'error' || !status.previousPreview) return
    setStatus({kind: 'preview', preview: status.previousPreview, overwriteChecked: true})
  }, [status])

  const dismissError = useCallback(() => setStatus({kind: 'idle'}), [])
  const dismissSuccess = useCallback(() => setStatus({kind: 'idle'}), [])

  // ---------- render ----------

  return (
    <section
      aria-label="候補を採用 (Visual Register に登録)"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <header className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
          <Pencil size={12} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">採用 & 登録</h3>
          <p className="text-[11px] text-slate-500">
            Visual Register CLI に bridge して assets / patches を書きます。
          </p>
        </div>
      </header>

      {disabledReason !== null ? (
        <DisabledState reason={disabledReason} />
      ) : (
        <ReadyState
          status={status}
          selected={selected!}
          writeReady={writeReady}
          localFsReady={localFsReady}
          onStartPreview={startPreview}
          onCancelPreview={cancelPreview}
          onExecute={executeApprove}
          onSetOverwrite={(v) =>
            setStatus((s) =>
              s.kind === 'preview' ? {...s, overwriteChecked: v} : s,
            )
          }
          onRetryAsOverwrite={reopenPreviewWithOverwrite}
          onDismissError={dismissError}
          onDismissSuccess={dismissSuccess}
        />
      )}

      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        本番環境 (Vercel) では永久に無効。Visual Register は{' '}
        <code className="rounded bg-slate-50 px-1 ring-1 ring-inset ring-slate-200">
          npm run visual:register
        </code>{' '}
        で起動してください。
      </p>
    </section>
  )
}

// ---------- subcomponents ----------

function DisabledState({reason}: {reason: string}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <Lock size={12} aria-hidden="true" />
        採用 不可
      </span>
      <span className="text-[11px] text-slate-500">{reason}</span>
    </div>
  )
}

interface ReadyStateProps {
  status: Status
  selected: {id: string; fileName: string; relativePath: string}
  writeReady: boolean
  localFsReady: boolean
  onStartPreview: () => void
  onCancelPreview: () => void
  onExecute: (preview: ExecutePreview, overwriteConfirmed: boolean) => void
  onSetOverwrite: (value: boolean) => void
  onRetryAsOverwrite: () => void
  onDismissError: () => void
  onDismissSuccess: () => void
}

function ReadyState(props: ReadyStateProps) {
  const {
    status,
    selected,
    onStartPreview,
    onCancelPreview,
    onExecute,
    onSetOverwrite,
    onRetryAsOverwrite,
    onDismissError,
    onDismissSuccess,
  } = props

  if (status.kind === 'idle') {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-600">
          選択中:{' '}
          <code className="rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
            {selected.fileName}
          </code>
        </div>
        <button
          type="button"
          onClick={onStartPreview}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          採用する (Visual Register に登録)
        </button>
      </div>
    )
  }

  if (status.kind === 'executing' && status.preview.candidateFile === selected.fileName) {
    return (
      <button
        type="button"
        disabled
        aria-busy
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-300 bg-blue-300 px-3 py-2 text-sm font-medium text-white"
      >
        <RefreshCw size={14} aria-hidden="true" className="animate-spin" />
        処理中…
      </button>
    )
  }

  if (status.kind === 'preview') {
    return <PreviewPanel
      preview={status.preview}
      overwriteChecked={status.overwriteChecked}
      onCancel={onCancelPreview}
      onExecute={() => onExecute(status.preview, status.overwriteChecked)}
      onSetOverwrite={onSetOverwrite}
    />
  }

  if (status.kind === 'executing') {
    return (
      <button
        type="button"
        disabled
        aria-busy
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-300 bg-blue-300 px-3 py-2 text-sm font-medium text-white"
      >
        <RefreshCw size={14} aria-hidden="true" className="animate-spin" />
        Visual Register に登録中…
      </button>
    )
  }

  if (status.kind === 'success') {
    return <SuccessPanel
      preview={status.preview}
      result={status.result}
      onDismiss={onDismissSuccess}
    />
  }

  // error
  return <ErrorPanel
    message={status.message}
    isOverwriteRequired={status.isOverwriteRequired}
    canRetryAsOverwrite={status.previousPreview !== null}
    onDismiss={onDismissError}
    onRetryAsOverwrite={onRetryAsOverwrite}
  />
}

function PreviewPanel({
  preview,
  overwriteChecked,
  onCancel,
  onExecute,
  onSetOverwrite,
}: {
  preview: ExecutePreview
  overwriteChecked: boolean
  onCancel: () => void
  onExecute: () => void
  onSetOverwrite: (value: boolean) => void
}) {
  const executeBlocked = preview.overwriteLikely && !overwriteChecked
  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-300 bg-slate-50/40 p-3 text-[12px] text-slate-800">
      <div className="font-medium text-slate-900">候補画像を採用しますか?</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-slate-500">Asset:</dt>
        <dd>
          <code className="rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
            {preview.assetSlug}
          </code>
        </dd>
        <dt className="text-slate-500">Campaign:</dt>
        <dd>
          <code className="rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
            {preview.campaignSlug}
          </code>
        </dd>
        <dt className="text-slate-500">候補:</dt>
        <dd>
          <code className="rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
            {preview.candidateFile}
          </code>
        </dd>
        <dt className="text-slate-500">source:</dt>
        <dd className="break-all font-mono text-[10px] text-slate-700">
          {preview.candidateRelativePath}
        </dd>
        <dt className="text-slate-500">final (予測):</dt>
        <dd className="break-all font-mono text-[10px] text-slate-700">
          {preview.plannedFinalAssetPath ?? (
            <span className="italic text-slate-500">
              Visual Register が決定します
            </span>
          )}
        </dd>
        <dt className="text-slate-500">patch:</dt>
        <dd className="break-all font-mono text-[10px] text-slate-700">
          {preview.plannedPatchPath}
        </dd>
      </dl>

      {preview.overwriteLikely && (
        <label className="mt-1 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={overwriteChecked}
            onChange={(e) => onSetOverwrite(e.target.checked)}
          />
          <span>
            既存の最終アセットが存在します (上書きが必要)。チェックを入れて承認してください。
          </span>
        </label>
      )}

      <p className="mt-1 text-[10px] text-slate-500">
        ※ ファイル操作は元に戻せません。Studio / Sanity 反映と publish-package 配布は別途実行してください。
      </p>

      <div className="mt-1 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onExecute}
          disabled={executeBlocked}
          className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          実行
        </button>
      </div>
    </div>
  )
}

function SuccessPanel({
  preview,
  result,
  onDismiss,
}: {
  preview: ExecutePreview
  result: SuccessResult
  onDismiss: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-[12px] text-emerald-950">
      <div className="flex items-center gap-1.5 font-medium">
        <CheckCircle2 size={14} aria-hidden="true" />
        Visual Register に登録しました。
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-emerald-800">登録時刻:</dt>
        <dd className="font-mono text-[10px]">{result.committedAtIso}</dd>
        <dt className="text-emerald-800">final:</dt>
        <dd className="break-all font-mono text-[10px]">{result.finalAssetPath || '(unknown)'}</dd>
        <dt className="text-emerald-800">patch:</dt>
        <dd className="break-all font-mono text-[10px]">{result.patchPath || '(unknown)'}</dd>
        <dt className="text-emerald-800">manifest:</dt>
        <dd>{result.manifestUpdated ? '✓ 更新済み' : '— 更新情報なし'}</dd>
        <dt className="text-emerald-800">候補:</dt>
        <dd>
          <code className="rounded bg-white px-1 ring-1 ring-inset ring-emerald-200">
            {preview.candidateFile}
          </code>
        </dd>
      </dl>

      <div className="mt-1 rounded-md border border-emerald-200 bg-white/70 p-2 text-[11px]">
        <div className="mb-1 font-medium text-emerald-900">次のステップ</div>
        <ol className="ml-4 list-decimal space-y-1.5">
          <li>
            <div className="text-emerald-900">Sanity に反映 (別 batch / Phase 2B-3.1 で自動化予定)</div>
            <div className="mt-1 flex items-center gap-2">
              <code className="break-all rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-900">
                {result.nextStepsHint.sanityReflectCommand}
              </code>
              <CopyButton text={result.nextStepsHint.sanityReflectCommand} label="コピー" />
            </div>
          </li>
          <li>
            <div className="text-emerald-900">publish-package に配布</div>
            <div className="mt-1 flex items-center gap-2">
              <code className="break-all rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-900">
                {result.nextStepsHint.publishPackageCommand}
              </code>
              <CopyButton text={result.nextStepsHint.publishPackageCommand} label="コピー" />
            </div>
          </li>
        </ol>
      </div>

      <details className="mt-1 rounded-md border border-emerald-200 bg-white/70 p-2 text-[11px]">
        <summary className="cursor-pointer font-medium text-emerald-900">
          ※ 元に戻したい場合 (manual cleanup)
        </summary>
        <ol className="mt-2 ml-4 list-decimal space-y-1 text-emerald-900">
          <li>
            <code className="break-all rounded bg-emerald-50 px-1 font-mono text-[10px]">
              {result.finalAssetPath || 'assets/visuals/...'}
            </code>{' '}
            を削除
          </li>
          <li>
            <code className="break-all rounded bg-emerald-50 px-1 font-mono text-[10px]">
              {result.patchPath || 'patches/visual-assets/...'}
            </code>{' '}
            を削除
          </li>
          <li>
            <code className="rounded bg-emerald-50 px-1 font-mono text-[10px]">
              assets/inbox/generated/{preview.campaignSlug}/review-manifest.json
            </code>{' '}
            の該当エントリを <code className="font-mono">candidate</code> に戻す
          </li>
        </ol>
        <p className="mt-1 text-[10px] text-emerald-800">
          自動 undo は実装しない設計 (Q-2B3-5 confirmed)。preview + confirm で吸収できなかった場合のみ手動で。
        </p>
      </details>

      <div className="mt-1 flex items-center justify-end gap-2">
        <a
          href={VISUAL_REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100"
        >
          Visual Register を開く
          <ExternalLink size={10} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center rounded border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

function ErrorPanel({
  message,
  isOverwriteRequired,
  canRetryAsOverwrite,
  onDismiss,
  onRetryAsOverwrite,
}: {
  message: string
  isOverwriteRequired: boolean
  canRetryAsOverwrite: boolean
  onDismiss: () => void
  onRetryAsOverwrite: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-[12px] text-rose-900">
      <span className="flex-1">{message}</span>
      <div className="flex shrink-0 items-center gap-1">
        {isOverwriteRequired && canRetryAsOverwrite && (
          <button
            type="button"
            onClick={onRetryAsOverwrite}
            className="inline-flex items-center rounded border border-rose-400 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
          >
            上書きで再実行
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center rounded border border-rose-300 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
