'use client'

// Phase 2B-2 — state transition control for a single humanReviewGate.
//
// UX revision (smoke fix 0183):
//   The status badge itself is no longer the dropdown trigger. Boss feedback
//   was that the badge reads as a display label, not a clickable affordance
//   — so editing felt hidden. The control now renders the badge as a pure
//   readout, plus a separate explicit button labelled "状態を変更" with a
//   chevron, so the action is unambiguous.
//
// Renders one of three shapes:
//   - writeReady = false: badge + disabled "編集不可" pill + tooltip
//   - terminal state (done / skipped): badge + non-interactive "終了状態" chip
//     (no outbound transitions in this batch; reopening requires Studio)
//   - writeReady = true and transitions exist: badge + "状態を変更 ▾" button
//     that opens a menu of only the §3-2 allowed transitions
//     (Q-2B2-6 UI filter, Q-2B2-5 dropdown UI).
//
// Terminal targets (`done`, `skipped`) open a confirm modal (Q-2B2-2).
// Non-terminal targets commit on click. On success the control hands the
// undo off to <UndoToastHost> so the toast survives row movement after
// router.refresh().

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import {useRouter} from 'next/navigation'
import {CheckCircle2, ChevronDown, Lock} from 'lucide-react'
import {StatusBadge} from '@/components/StatusBadge'
import {useUndoToast, type UndoResult} from '@/components/common/UndoToastHost'
import {
  gateStateLabel,
  gateTransitionVerb,
  getAllowedGateTransitions,
  isTerminalGateState,
  type HumanReviewGateState,
} from '@/lib/gates/stateTransitions'
import {
  updateGateState,
  type UpdateGateStateResult,
} from '@/lib/actions/updateGateState'

interface Props {
  campaignId: string
  /** Doc-level Sanity _rev. May be missing on older seed-loaded docs that
   *  were imported without `autoGenerateArrayKeys`. When missing we render
   *  a "編集不可 (データ準備中)" affordance instead of the change button so
   *  the boss still sees a control and an explanation. */
  campaignRev?: string
  /** Array-element _key. Same caveat as campaignRev. */
  gateKey?: string
  gateName: string
  initialState: HumanReviewGateState
  writeReady: boolean
}

type Status =
  | {kind: 'idle'}
  | {kind: 'open'}
  | {kind: 'confirm'; target: HumanReviewGateState}
  | {kind: 'saving'}
  | {kind: 'error'; message: string; isConflict: boolean}

function mapResultError(result: Extract<UpdateGateStateResult, {ok: false}>): {
  message: string
  isConflict: boolean
} {
  switch (result.error) {
    case 'conflict':
      return {message: '他で編集された可能性があります。画面を更新してください', isConflict: true}
    case 'missing-token':
      return {message: 'SANITY_WRITE_TOKEN が設定されていません', isConflict: false}
    case 'write-disabled':
      return {message: 'ENABLE_WRITE_ACTIONS が off です', isConflict: false}
    case 'permission':
      return {message: 'Sanity の token に書き込み権限がありません', isConflict: false}
    case 'not-found':
      return {message: '対象 gate が見つかりません', isConflict: false}
    case 'transition-not-allowed':
      return {message: result.message, isConflict: false}
    case 'validation':
      return {message: `入力内容に問題があります: ${result.message}`, isConflict: false}
    case 'unknown':
    default:
      return {message: `保存に失敗しました: ${result.message}`, isConflict: false}
  }
}

export function GateStateControl({
  campaignId,
  campaignRev,
  gateKey,
  gateName,
  initialState,
  writeReady,
}: Props) {
  const router = useRouter()
  const {notifySaved} = useUndoToast()
  const [currentState, setCurrentState] = useState<HumanReviewGateState>(initialState)
  const [revision, setRevision] = useState<string>(campaignRev ?? '')
  const [status, setStatus] = useState<Status>({kind: 'idle'})
  const [, startTransition] = useTransition()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Sync after server re-render (e.g. router.refresh()) only when the
  // control is idle. Mid-saving/confirming, ignore drift to avoid
  // surprising the user.
  useEffect(() => {
    if (status.kind === 'idle') {
      setCurrentState(initialState)
      setRevision(campaignRev ?? '')
    }
  }, [initialState, campaignRev, status.kind])

  // Close the dropdown / dismiss confirm modal on outside click and Escape.
  useEffect(() => {
    if (status.kind !== 'open' && status.kind !== 'confirm') return
    const onDocClick = (e: MouseEvent) => {
      const t = e.target
      if (!(t instanceof Node)) return
      if (wrapperRef.current && !wrapperRef.current.contains(t)) {
        setStatus({kind: 'idle'})
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStatus({kind: 'idle'})
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [status.kind])

  const allowed = useMemo(
    () => getAllowedGateTransitions(currentState),
    [currentState],
  )

  const commitTransition = useCallback(
    (target: HumanReviewGateState) => {
      // commitTransition is only reachable from the editable render branch,
      // which is gated by `gateKey` + `revision` presence. The runtime guard
      // is defensive — if these ever became empty mid-flight, we want a
      // clean failure rather than a TypeScript escape into the server.
      if (!gateKey || !revision) {
        setStatus({
          kind: 'error',
          message:
            'この gate には _key / _rev が付与されていません。Sanity Studio で再保存してください。',
          isConflict: false,
        })
        return
      }
      const previousForUndo = currentState
      const expectedRevision = revision
      const resolvedGateKey = gateKey
      setStatus({kind: 'saving'})
      startTransition(async () => {
        let result: UpdateGateStateResult
        try {
          result = await updateGateState({
            campaignId,
            gateKey: resolvedGateKey,
            currentState: previousForUndo,
            nextState: target,
            expectedRevision,
          })
        } catch (e) {
          if (!mountedRef.current) return
          setStatus({
            kind: 'error',
            message: e instanceof Error ? e.message : '不明なエラー',
            isConflict: false,
          })
          return
        }
        if (!result.ok) {
          if (!mountedRef.current) return
          const mapped = mapResultError(result)
          setStatus({kind: 'error', message: mapped.message, isConflict: mapped.isConflict})
          return
        }
        // Optimistic local update; new state + revision come from the server.
        if (mountedRef.current) {
          setCurrentState(result.nextState)
          setRevision(result.newRevision)
          setStatus({kind: 'idle'})
        }
        // Hand off undo to the stable host. The control may unmount when the
        // page re-renders (e.g. bucket re-bucketing on /human-review-gates),
        // but the toast lives on the host.
        notifySaved({
          title: 'ゲート state を変更しました。',
          detail: `${gateStateLabel(previousForUndo)} → ${gateStateLabel(
            result.nextState,
          )} · 10秒以内なら元に戻せます — ${gateName}`,
          onUndo: async (): Promise<UndoResult> => {
            let undoResult: UpdateGateStateResult
            try {
              undoResult = await updateGateState({
                campaignId,
                gateKey: resolvedGateKey,
                currentState: result.nextState,
                nextState: previousForUndo,
                expectedRevision: result.newRevision,
                isUndo: true,
              })
            } catch (e) {
              return {
                ok: false,
                message:
                  e instanceof Error
                    ? `元に戻すのに失敗しました: ${e.message}`
                    : '元に戻すのに失敗しました',
                isConflict: false,
              }
            }
            if (undoResult.ok) return {ok: true}
            const mapped = mapResultError(undoResult)
            return {ok: false, message: mapped.message, isConflict: mapped.isConflict}
          },
        })
        router.refresh()
      })
    },
    [campaignId, currentState, gateKey, gateName, notifySaved, revision, router],
  )

  const onOptionClick = useCallback(
    (target: HumanReviewGateState) => {
      if (isTerminalGateState(target)) {
        setStatus({kind: 'confirm', target})
      } else {
        commitTransition(target)
      }
    },
    [commitTransition],
  )

  const onReloadAfterConflict = useCallback(() => {
    setStatus({kind: 'idle'})
    router.refresh()
  }, [router])

  // ---------- render: disabled (writeReady=false) ----------

  if (!writeReady) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <StatusBadge state={currentState} label={gateStateLabel(currentState)} />
        <span
          aria-disabled="true"
          title="state 変更は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ"
          className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400"
        >
          <Lock size={10} aria-hidden="true" />
          編集不可
        </span>
      </div>
    )
  }

  // ---------- render: disabled (data missing _key / _rev) ----------
  // Existing seed-loaded gates may have been imported without
  // autoGenerateArrayKeys=true, so `_key` is undefined for those rows. The
  // server-side patch requires `_key`, so we cannot edit those gates from
  // dashboard. We still surface a control-shaped affordance so the boss can
  // see the row is intended to be editable and why it currently isn't.

  if (!gateKey || !campaignRev) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <StatusBadge state={currentState} label={gateStateLabel(currentState)} />
        <span
          aria-disabled="true"
          title="この gate には Sanity 内部 _key/_rev が付与されていません。Sanity Studio で gate を開いて保存し直すと付与されます。"
          className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
        >
          <Lock size={10} aria-hidden="true" />
          編集不可 (要 Studio 再保存)
        </span>
      </div>
    )
  }

  // ---------- render: editable ----------

  const isOpen = status.kind === 'open'
  const isSaving = status.kind === 'saving'
  const isConfirming = status.kind === 'confirm'
  const isError = status.kind === 'error'
  const terminalLocked = allowed.length === 0

  return (
    <div ref={wrapperRef} className="relative inline-flex flex-col items-start gap-1">
      <div className="inline-flex items-center gap-1.5">
        {/* Badge is a pure status readout — never a button. The explicit
           change-state control sits next to it. */}
        <StatusBadge state={currentState} label={gateStateLabel(currentState)} />

        {terminalLocked ? (
          <span
            title="終端 state です。Studio で手動編集が必要です。"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500"
          >
            <CheckCircle2 size={11} aria-hidden="true" />
            終了状態
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (isSaving) return
              setStatus(isOpen ? {kind: 'idle'} : {kind: 'open'})
            }}
            disabled={isSaving}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-busy={isSaving}
            aria-label={`${gateName} の状態を変更`}
            className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800 shadow-sm hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSaving ? '保存中…' : '状態を変更'}</span>
            {isSaving ? null : (
              <ChevronDown size={12} aria-hidden="true" className="text-blue-700" />
            )}
          </button>
        )}
      </div>

      {isOpen && !terminalLocked && (
        <ul
          role="listbox"
          aria-label={`${gateName} の state 変更`}
          className="absolute left-0 top-full z-10 mt-1 w-max min-w-[160px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
        >
          {allowed.map((target) => {
            const terminal = isTerminalGateState(target)
            return (
              <li key={target}>
                <button
                  type="button"
                  role="option"
                  onClick={() => onOptionClick(target)}
                  className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[12px] text-slate-800 hover:bg-slate-50"
                >
                  <span>→ {gateTransitionVerb(target)}</span>
                  {terminal ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      確認
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {isConfirming && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={`${gateName} の state を ${gateStateLabel(status.target)} にしますか?`}
          className="absolute left-0 top-full z-20 mt-1 w-max min-w-[280px] rounded-md border border-slate-300 bg-white p-3 shadow-lg"
        >
          <div className="mb-2 text-[12px] font-medium text-slate-900">
            ゲートを{gateStateLabel(status.target)}にしますか?
          </div>
          <div className="mb-2 space-y-0.5 text-[11px] text-slate-700">
            <div>
              <span className="text-slate-500">ゲート: </span>
              {gateName}
            </div>
            <div>
              <span className="text-slate-500">現在: </span>
              {gateStateLabel(currentState)}
            </div>
            <div>
              <span className="text-slate-500">変更後: </span>
              {gateStateLabel(status.target)}
            </div>
          </div>
          <p className="mb-3 text-[10px] text-slate-500">
            ※ {gateStateLabel(status.target)}は終端 state です。dashboard では再開できません
            (Studio で手動変更が必要)。 10秒以内なら元に戻せます。
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatus({kind: 'idle'})}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => commitTransition(status.target)}
              className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
            >
              {gateStateLabel(status.target)}にする
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div className="mt-1 flex max-w-xs items-start justify-between gap-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-900">
          <span className="flex-1">{status.message}</span>
          {status.isConflict ? (
            <button
              type="button"
              onClick={onReloadAfterConflict}
              className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
            >
              更新
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStatus({kind: 'idle'})}
              className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
            >
              閉じる
            </button>
          )}
        </div>
      )}
    </div>
  )
}
