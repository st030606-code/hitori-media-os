'use client'

// Phase 2B-3.1 — Sanity reflect action card for visualAssetPlan.
//
// UX flow (boss-confirmed via handoff/0192):
//   1. read mode — button visible only when patch JSON exists, both env
//      flags are on, and a write token is available. Otherwise renders
//      a disabled affordance explaining why.
//   2. button click → server action `mode: 'preview'` runs (reads patch
//      JSON + fetches Sanity, computes 4-field diff, NO Sanity write).
//      The result is shown in an inline diff panel: each of 4 fields
//      with before/after, an "already reflected" indicator if all 4
//      match.
//   3. confirm → server action `mode: 'execute'` patches Sanity with
//      `ifRevisionID`. Post-write refetch verifies the 4 fields match.
//   4. success → emerald panel shows the new `_rev`, applied fields,
//      and the `verified` flag. No undo toast (Q-2B3.1-3 confirmed).
//   5. errors are inline:
//       - not-found → Sanity Studio guidance
//       - conflict → reload prompt
//       - patch-malformed / patch-not-found → check Visual Register run
//       - permission / missing-token / write-disabled → env hint

import {useCallback, useMemo, useState, useTransition} from 'react'
import {useRouter} from 'next/navigation'
import {AlertCircle, CheckCircle2, ExternalLink, RefreshCw} from 'lucide-react'
import {CopyButton} from '@/components/CopyButton'
import {
  reflectVisualAssetPatch,
  type ReflectVisualAssetPatchResult,
} from '@/lib/actions/reflectVisualAssetPatch'
import type {FieldDiff, PatchJsonField} from '@/lib/visualAssets/patchJson'

const REVIEW_NOTES_TRUNCATE = 240

interface Props {
  visualAssetPlanId: string
  campaignSlug: string
  assetSlug: string
  /** Server-resolved patch JSON path. The page knows whether the file
   *  exists; if it doesn't, the page passes `patchJsonPath = null` to
   *  hide the CTA entirely. */
  patchJsonPath: string | null
  writeReady: boolean
  localFsReady: boolean
  /** Optional layout hint. 'compact' = single column small card used in
   *  the candidates page right column; 'wide' = full-width card used on
   *  the detail page below FilePathsCard. */
  variant?: 'compact' | 'wide'
}

type Status =
  | {kind: 'idle'}
  | {kind: 'preview-loading'}
  | {
      kind: 'preview-shown'
      visualAssetPlanId: string
      patchJsonPath: string
      currentRevision: string
      diffs: FieldDiff[]
      alreadyReflected: boolean
    }
  | {kind: 'executing'; previousRevision: string}
  | {
      kind: 'success'
      visualAssetPlanId: string
      patchJsonPath: string
      newRevision: string
      committedAtIso: string
      verified: boolean
    }
  | {kind: 'error'; message: string; subtype: ErrorSubtype}

type ErrorSubtype =
  | 'general'
  | 'conflict'
  | 'not-found'
  | 'patch-not-found'
  | 'patch-malformed'

function mapResultError(
  result: Extract<ReflectVisualAssetPatchResult, {ok: false}>,
): {message: string; subtype: ErrorSubtype} {
  switch (result.error) {
    case 'conflict':
      return {message: '他で編集された可能性があります。画面を更新してください', subtype: 'conflict'}
    case 'missing-token':
      return {message: 'SANITY_WRITE_TOKEN が設定されていません', subtype: 'general'}
    case 'write-disabled':
      return {message: 'ENABLE_WRITE_ACTIONS が off です', subtype: 'general'}
    case 'localfs-disabled':
      return {message: 'ENABLE_LOCAL_FS_ROUTES が off です (patch JSON を読めません)', subtype: 'general'}
    case 'permission':
      return {message: 'Sanity の token に書き込み権限がありません', subtype: 'general'}
    case 'not-found':
      return {message: result.message, subtype: 'not-found'}
    case 'patch-not-found':
      return {
        message:
          'patch JSON が見つかりません。 Visual Register で「採用 & 登録」 を実行すると生成されます。',
        subtype: 'patch-not-found',
      }
    case 'patch-malformed':
      return {message: `patch JSON の形式が不正です: ${result.message}`, subtype: 'patch-malformed'}
    case 'patch-target-mismatch':
      return {message: `patch JSON の \`_id\` が一致しません: ${result.message}`, subtype: 'patch-malformed'}
    case 'validation':
      return {message: `入力内容に問題があります: ${result.message}`, subtype: 'general'}
    case 'unknown':
    default:
      return {message: `反映に失敗しました: ${result.message}`, subtype: 'general'}
  }
}

function truncateReviewNotes(value: string | null): string {
  if (value === null) return '(未設定)'
  if (value.length <= REVIEW_NOTES_TRUNCATE) return value
  return value.slice(0, REVIEW_NOTES_TRUNCATE) + ' …'
}

function fieldLabel(field: PatchJsonField): string {
  switch (field) {
    case 'localAssetPath':
      return 'localAssetPath'
    case 'status':
      return 'status'
    case 'updatedAt':
      return 'updatedAt'
    case 'reviewNotes':
      return 'reviewNotes'
  }
}

export function ReflectVisualAssetAction({
  visualAssetPlanId,
  campaignSlug,
  assetSlug,
  patchJsonPath,
  writeReady,
  localFsReady,
  variant = 'wide',
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>({kind: 'idle'})
  const [, startTransition] = useTransition()

  const disabledReason: string | null = useMemo(() => {
    if (!localFsReady) return 'ENABLE_LOCAL_FS_ROUTES が off のため利用できません'
    if (!writeReady) return 'ENABLE_WRITE_ACTIONS / SANITY_WRITE_TOKEN が揃っていません'
    if (!patchJsonPath) return 'patch JSON がまだ生成されていません (先に Visual Register で採用してください)'
    return null
  }, [localFsReady, writeReady, patchJsonPath])

  const startPreview = useCallback(() => {
    if (disabledReason !== null || !patchJsonPath) return
    setStatus({kind: 'preview-loading'})
    startTransition(async () => {
      let result: ReflectVisualAssetPatchResult
      try {
        result = await reflectVisualAssetPatch({
          visualAssetPlanId,
          patchJsonPath,
          campaignSlug,
          assetSlug,
          mode: 'preview',
        })
      } catch (e) {
        setStatus({
          kind: 'error',
          message: e instanceof Error ? e.message : 'preview に失敗しました',
          subtype: 'general',
        })
        return
      }
      if (!result.ok) {
        const mapped = mapResultError(result)
        setStatus({kind: 'error', message: mapped.message, subtype: mapped.subtype})
        return
      }
      if (result.mode !== 'preview') return
      setStatus({
        kind: 'preview-shown',
        visualAssetPlanId: result.visualAssetPlanId,
        patchJsonPath: result.patchJsonPath,
        currentRevision: result.currentRevision,
        diffs: result.diffs,
        alreadyReflected: result.alreadyReflected,
      })
    })
  }, [
    disabledReason,
    patchJsonPath,
    visualAssetPlanId,
    campaignSlug,
    assetSlug,
  ])

  const execute = useCallback(
    (currentRevision: string, patchJsonPathFromPreview: string) => {
      setStatus({kind: 'executing', previousRevision: currentRevision})
      startTransition(async () => {
        let result: ReflectVisualAssetPatchResult
        try {
          result = await reflectVisualAssetPatch({
            visualAssetPlanId,
            patchJsonPath: patchJsonPathFromPreview,
            campaignSlug,
            assetSlug,
            expectedRevision: currentRevision,
            mode: 'execute',
          })
        } catch (e) {
          setStatus({
            kind: 'error',
            message: e instanceof Error ? e.message : '実行に失敗しました',
            subtype: 'general',
          })
          return
        }
        if (!result.ok) {
          const mapped = mapResultError(result)
          setStatus({kind: 'error', message: mapped.message, subtype: mapped.subtype})
          return
        }
        if (result.mode !== 'execute') return
        setStatus({
          kind: 'success',
          visualAssetPlanId: result.visualAssetPlanId,
          patchJsonPath: result.patchJsonPath,
          newRevision: result.newRevision,
          committedAtIso: result.committedAtIso,
          verified: result.verified,
        })
        router.refresh()
      })
    },
    [visualAssetPlanId, campaignSlug, assetSlug, router],
  )

  const dismissError = useCallback(() => setStatus({kind: 'idle'}), [])
  const dismissSuccess = useCallback(() => setStatus({kind: 'idle'}), [])
  const onConflictReload = useCallback(() => {
    setStatus({kind: 'idle'})
    router.refresh()
  }, [router])

  // ---------- render ----------

  return (
    <section
      aria-label="Sanity に反映 (visualAssetPlan)"
      className={`rounded-lg border border-slate-200 bg-white ${
        variant === 'compact' ? 'p-3' : 'p-4'
      } shadow-sm`}
    >
      <header className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
          <CheckCircle2 size={12} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Sanity に反映</h3>
          <p className="text-[11px] text-slate-500">
            patch JSON の 4 field を visualAssetPlan に apply (Phase 2B-3.1)
          </p>
        </div>
      </header>

      {disabledReason !== null ? (
        <DisabledState reason={disabledReason} patchJsonPath={patchJsonPath} />
      ) : (
        <Body
          status={status}
          patchJsonPath={patchJsonPath!}
          onStartPreview={startPreview}
          onExecute={execute}
          onDismissError={dismissError}
          onDismissSuccess={dismissSuccess}
          onConflictReload={onConflictReload}
        />
      )}

      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        本 action は visualAssetPlan の 4 field (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) のみを patch します。 他 field は touch しません。 自動 undo はありません (preview + confirm で吸収)。
      </p>
    </section>
  )
}

// ---------- subcomponents ----------

function DisabledState({reason, patchJsonPath}: {reason: string; patchJsonPath: string | null}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">反映 不可</span>
        <span className="text-[11px] text-slate-500">{reason}</span>
      </div>
      {patchJsonPath && (
        <div className="break-all font-mono text-[10px] text-slate-500">{patchJsonPath}</div>
      )}
    </div>
  )
}

function Body({
  status,
  patchJsonPath,
  onStartPreview,
  onExecute,
  onDismissError,
  onDismissSuccess,
  onConflictReload,
}: {
  status: Status
  patchJsonPath: string
  onStartPreview: () => void
  onExecute: (currentRevision: string, patchJsonPath: string) => void
  onDismissError: () => void
  onDismissSuccess: () => void
  onConflictReload: () => void
}) {
  if (status.kind === 'idle') {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-600">
          patch JSON:{' '}
          <code className="break-all rounded bg-white px-1 py-0.5 ring-1 ring-inset ring-slate-200">
            {patchJsonPath}
          </code>
        </div>
        <button
          type="button"
          onClick={onStartPreview}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Sanityに反映する
        </button>
      </div>
    )
  }

  if (status.kind === 'preview-loading') {
    return (
      <button
        type="button"
        disabled
        aria-busy
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-300 bg-blue-300 px-3 py-2 text-sm font-medium text-white"
      >
        <RefreshCw size={14} aria-hidden="true" className="animate-spin" />
        diff を計算中…
      </button>
    )
  }

  if (status.kind === 'preview-shown') {
    return <PreviewPanel status={status} onExecute={onExecute} onCancel={onDismissError} />
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
        Sanity に書き込み中…
      </button>
    )
  }

  if (status.kind === 'success') {
    return <SuccessPanel status={status} onDismiss={onDismissSuccess} />
  }

  // error
  return (
    <ErrorPanel
      message={status.message}
      subtype={status.subtype}
      onDismiss={onDismissError}
      onConflictReload={onConflictReload}
    />
  )
}

function PreviewPanel({
  status,
  onExecute,
  onCancel,
}: {
  status: Extract<Status, {kind: 'preview-shown'}>
  onExecute: (currentRevision: string, patchJsonPath: string) => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-300 bg-slate-50/40 p-3 text-[12px] text-slate-800">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-900">プレビュー (4 field の差分)</span>
        {status.alreadyReflected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
            <CheckCircle2 size={10} aria-hidden="true" />
            既に反映済 (4 field 完全一致)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            <AlertCircle size={10} aria-hidden="true" />
            未反映 / 差分あり
          </span>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-slate-200 rounded border border-slate-200 bg-white">
        {status.diffs.map((d) => (
          <li key={d.field} className="flex flex-col gap-1 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-[11px] text-slate-700">{fieldLabel(d.field)}</code>
              <span
                className={
                  d.changed
                    ? 'rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800'
                    : 'rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800'
                }
              >
                {d.changed ? '変更あり' : '一致'}
              </span>
            </div>
            {d.changed && (
              <>
                <div className="flex items-baseline gap-2 text-[11px]">
                  <span className="shrink-0 text-slate-500">before:</span>
                  <span className="break-all font-mono text-[10px] text-slate-600">
                    {d.field === 'reviewNotes' ? truncateReviewNotes(d.before) : d.before ?? '(未設定)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 text-[11px]">
                  <span className="shrink-0 text-blue-700">after:</span>
                  <span className="break-all font-mono text-[10px] text-blue-900">
                    {d.field === 'reviewNotes' ? truncateReviewNotes(d.after) : d.after}
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-slate-500">
        ※ patch は単一 transaction で 4 field を一括 set します。 自動 undo はありません。 必要なら別 patch を発行するか Sanity Studio で手動編集してください。
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
          onClick={() => onExecute(status.currentRevision, status.patchJsonPath)}
          className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
        >
          実行
        </button>
      </div>
    </div>
  )
}

function SuccessPanel({
  status,
  onDismiss,
}: {
  status: Extract<Status, {kind: 'success'}>
  onDismiss: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-[12px] text-emerald-950">
      <div className="flex items-center gap-1.5 font-medium">
        <CheckCircle2 size={14} aria-hidden="true" />
        Sanity visualAssetPlan を更新しました。
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-emerald-800">visualAssetPlan _id:</dt>
        <dd className="break-all font-mono text-[10px]">{status.visualAssetPlanId}</dd>
        <dt className="text-emerald-800">patch JSON:</dt>
        <dd className="break-all font-mono text-[10px]">{status.patchJsonPath}</dd>
        <dt className="text-emerald-800">登録時刻:</dt>
        <dd className="font-mono text-[10px]">{status.committedAtIso}</dd>
        <dt className="text-emerald-800">new _rev:</dt>
        <dd className="font-mono text-[10px]">{status.newRevision}</dd>
        <dt className="text-emerald-800">verified:</dt>
        <dd>{status.verified ? '✓ post-write refetch で 4 field 一致' : '— refetch verification 未完了 (Studio で確認推奨)'}</dd>
        <dt className="text-emerald-800">applied fields:</dt>
        <dd className="font-mono text-[10px]">localAssetPath, status, updatedAt, reviewNotes</dd>
      </dl>
      <div className="mt-1 flex items-center justify-end gap-2">
        <CopyButton text={status.patchJsonPath} label="path コピー" />
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
  subtype,
  onDismiss,
  onConflictReload,
}: {
  message: string
  subtype: ErrorSubtype
  onDismiss: () => void
  onConflictReload: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-[12px] text-rose-900">
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1">{message}</span>
        <div className="flex shrink-0 items-center gap-1">
          {subtype === 'conflict' ? (
            <button
              type="button"
              onClick={onConflictReload}
              className="inline-flex items-center rounded border border-rose-400 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
            >
              更新
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center rounded border border-rose-300 bg-white px-2 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
          >
            閉じる
          </button>
        </div>
      </div>
      {subtype === 'not-found' && (
        <div className="rounded border border-rose-200 bg-white p-2 text-[11px] text-rose-900">
          <div className="mb-1 font-medium">手動セットアップが必要です</div>
          <ol className="ml-4 list-decimal space-y-0.5">
            <li>Sanity Studio を開く</li>
            <li>
              該当の visualAssetPlan ドキュメントを新規作成 (<code>_id</code> を{' '}
              <code>{'visualAssetPlan.<campaignSlug>.<assetSlug>'}</code> に設定)
            </li>
            <li>必須 field (title / purpose / targetPlatform / etc.) を埋めて保存</li>
            <li>ここに戻って再度「Sanityに反映する」 を実行</li>
          </ol>
          <a
            href="http://localhost:3333"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-rose-800 underline-offset-2 hover:underline"
          >
            Sanity Studio を開く
            <ExternalLink size={9} aria-hidden="true" />
          </a>
        </div>
      )}
      {subtype === 'patch-not-found' && (
        <div className="rounded border border-rose-200 bg-white p-2 text-[11px] text-rose-900">
          <div className="mb-1 font-medium">patch JSON が見つかりません</div>
          <p>
            Visual Register (`/visual-assets/[assetId]/candidates` の 「採用する (Visual Register に登録)」) を先に実行してください。
            file pipeline (file copy + patch JSON 生成) は Visual Register が owner です。
          </p>
        </div>
      )}
    </div>
  )
}
