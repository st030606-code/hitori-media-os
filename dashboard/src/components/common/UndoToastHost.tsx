'use client'

// Generic undo toast host for Phase 2B write actions.
//
// Originally introduced as `AnalyticsToastHost` (Phase 2B-1) to keep the
// 10-second undo countdown alive when the row hosting the editor unmounted
// after a successful save (e.g. a pending reactionNote getting promoted into
// the filled list). Phase 2B-2 needs the same survive-row-unmount guarantee
// for humanReviewGate state changes on /human-review-gates and on the
// "確認ゲート" tab of /campaigns/[slug], so the host is now generic.
//
// Generic shape:
//   - Callers push a `SavedNotification` via `useUndoToast().notifySaved(n)`.
//   - The notification carries the user-facing copy AND its own typed
//     `onUndo()` callback. The host never knows about Sanity or any specific
//     server action; it just runs `onUndo()` when the user clicks 元に戻す.
//   - Decisions confirmed: in-memory only (Q-6), no persistent undo log,
//     no audit-log schema, current UI session only (Q-2B2-7).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import {useRouter} from 'next/navigation'
import {RotateCcw, X} from 'lucide-react'

const UNDO_VISIBLE_MS = 10_000

/** Result returned by `SavedNotification.onUndo`. The host uses this to
 *  decide whether to dismiss the toast (`ok: true`) or surface an inline
 *  error banner (`ok: false`). */
export type UndoResult =
  | {ok: true}
  | {ok: false; message: string; isConflict: boolean}

export interface SavedNotification {
  /** Short toast title. Example: 「保存しました。」 */
  title: string
  /** Optional secondary line. Example: 「10秒以内なら元に戻せます。 — note」 */
  detail?: string
  /** Caller-supplied undo. The host invokes this when the user clicks
   *  元に戻す inside the 10s window. Should perform the server-side reverse
   *  patch and translate its result into UndoResult. */
  onUndo: () => Promise<UndoResult>
}

interface ToastCtx {
  notifySaved: (n: SavedNotification) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useUndoToast(): ToastCtx {
  const c = useContext(Ctx)
  if (!c) {
    throw new Error('useUndoToast must be used inside <UndoToastHost>')
  }
  return c
}

export function UndoToastHost({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const [toast, setToast] = useState<SavedNotification | null>(null)
  const [errorState, setErrorState] = useState<{
    message: string
    isConflict: boolean
  } | null>(null)
  const [undoing, setUndoing] = useState(false)
  const [, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Defensive cleanup. The host itself is anchored above the cards/rows,
  // so it does not unmount as rows move; this only matters when the page
  // tree itself tears down.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const scheduleAutoClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast(null)
    }, UNDO_VISIBLE_MS)
  }, [])

  const notifySaved = useCallback<ToastCtx['notifySaved']>(
    (n) => {
      setErrorState(null)
      setToast(n)
      scheduleAutoClear()
    },
    [scheduleAutoClear],
  )

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const dismissError = useCallback(() => setErrorState(null), [])

  const onUndo = useCallback(() => {
    const current = toast
    if (!current || undoing) return
    setUndoing(true)
    startTransition(async () => {
      let result: UndoResult
      try {
        result = await current.onUndo()
      } catch (e) {
        setErrorState({
          message:
            e instanceof Error
              ? `元に戻すのに失敗しました: ${e.message}`
              : '元に戻すのに失敗しました',
          isConflict: false,
        })
        dismissToast()
        setUndoing(false)
        return
      }
      if (result.ok) {
        dismissToast()
        router.refresh()
      } else {
        setErrorState({message: result.message, isConflict: result.isConflict})
        dismissToast()
      }
      setUndoing(false)
    })
  }, [toast, undoing, dismissToast, router])

  const onConflictReload = useCallback(() => {
    setErrorState(null)
    router.refresh()
  }, [router])

  return (
    <Ctx.Provider value={{notifySaved}}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-30 flex max-w-sm flex-col items-end gap-2"
        aria-live="polite"
      >
        {toast && (
          <div
            role="status"
            className="pointer-events-auto flex w-full items-start justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-[12px] text-emerald-900 shadow-md"
          >
            <div className="flex-1">
              <div className="font-medium">{toast.title}</div>
              {toast.detail ? (
                <div className="text-[11px] text-emerald-800">{toast.detail}</div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onUndo}
                disabled={undoing}
                className="inline-flex items-center gap-1 rounded border border-emerald-400 bg-white px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw size={11} aria-hidden="true" />
                {undoing ? '戻し中…' : '元に戻す'}
              </button>
              <button
                type="button"
                onClick={dismissToast}
                aria-label="閉じる"
                className="inline-flex items-center justify-center rounded border border-emerald-300 bg-white p-1 text-emerald-800 hover:bg-emerald-100"
              >
                <X size={11} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {errorState && (
          <div
            role="alert"
            className="pointer-events-auto flex w-full items-start justify-between gap-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-900 shadow-md"
          >
            <span className="flex-1">{errorState.message}</span>
            <div className="flex shrink-0 items-center gap-1">
              {errorState.isConflict ? (
                <button
                  type="button"
                  onClick={onConflictReload}
                  className="inline-flex items-center gap-1 rounded border border-rose-400 bg-white px-2 py-1 text-[11px] font-medium text-rose-800 hover:bg-rose-100"
                >
                  更新
                </button>
              ) : null}
              <button
                type="button"
                onClick={dismissError}
                aria-label="閉じる"
                className="inline-flex items-center justify-center rounded border border-rose-300 bg-white p-1 text-rose-800 hover:bg-rose-100"
              >
                <X size={11} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}
