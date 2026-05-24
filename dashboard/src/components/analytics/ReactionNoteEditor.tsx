'use client'

// Phase 2B-1 — inline editor for a single manualPublishingStatus[].reactionNotes.
//
// State model (post smoke fix 0179):
//   - Read mode: shows the current value (or "(未記入)") and an 編集 button
//     when writeReady is true.
//   - Edit mode: textarea + 保存 / キャンセル. Save triggers the server
//     action with mode='execute' and the current expectedRevision.
//   - Saved: the editor collapses back to read mode immediately. The
//     "保存しました — 10秒以内なら元に戻せます" toast is owned by
//     <UndoToastHost> (stable parent) so it survives row movement
//     between cards after router.refresh().
//
// Confirmed decisions:
//   - Q-6: in-memory previous value only. No persistence. 10s undo window.
//   - Q-8: _rev mismatch → conflict banner + reload button. No merge UI.
//   - Q-10: no auto devlog from client. Server logs metadata only.

import {useCallback, useEffect, useRef, useState, useTransition} from 'react'
import {useRouter} from 'next/navigation'
import {Pencil} from 'lucide-react'
import {
  updateReactionNotes,
  type UpdateReactionNotesResult,
} from '@/lib/actions/updateReactionNotes'
import {useUndoToast, type UndoResult} from '@/components/common/UndoToastHost'

const MAX_LEN = 2000

type Status =
  | {kind: 'read'}
  | {kind: 'edit'}
  | {kind: 'saving'}
  | {kind: 'error'; message: string; isConflict: boolean}

interface Props {
  campaignId: string
  campaignRev: string
  itemKey: string
  platform: string
  initialValue: string
  writeReady: boolean
  /** 'filled' = comes from a row that already had reactionNotes; show line-clamp readout.
   *  'empty'  = comes from a "pending" row; show the editor more prominently. */
  variant: 'filled' | 'empty'
}

function resultErrorMessage(result: Extract<UpdateReactionNotesResult, {ok: false}>): string {
  switch (result.error) {
    case 'validation':
      return `入力内容に問題があります: ${result.message}`
    case 'missing-token':
      return 'SANITY_WRITE_TOKEN が設定されていません'
    case 'write-disabled':
      return 'ENABLE_WRITE_ACTIONS が off です'
    case 'permission':
      return 'Sanity の token に書き込み権限がありません'
    case 'not-found':
      return '対象 record が見つかりません'
    case 'conflict':
      return '他で編集された可能性があります。画面を更新してください'
    case 'unknown':
    default:
      return `保存に失敗しました: ${result.message}`
  }
}

export function ReactionNoteEditor({
  campaignId,
  campaignRev,
  itemKey,
  platform,
  initialValue,
  writeReady,
  variant,
}: Props) {
  const router = useRouter()
  const {notifySaved} = useUndoToast()
  const [status, setStatus] = useState<Status>({kind: 'read'})
  const [draft, setDraft] = useState(initialValue)
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [revision, setRevision] = useState(campaignRev)
  const [, startTransition] = useTransition()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // initialValue / campaignRev may change on revalidation; sync only when
    // we are not in the middle of editing or saving.
    if (status.kind === 'read') {
      setCurrentValue(initialValue)
      setDraft(initialValue)
      setRevision(campaignRev)
    }
  }, [initialValue, campaignRev, status.kind])

  const dirty = draft !== currentValue

  const startEdit = useCallback(() => {
    setDraft(currentValue)
    setStatus({kind: 'edit'})
  }, [currentValue])

  const cancelEdit = useCallback(() => {
    setDraft(currentValue)
    setStatus({kind: 'read'})
  }, [currentValue])

  const onSave = useCallback(() => {
    if (!writeReady) return
    if (!dirty) return
    if (draft.length > MAX_LEN) {
      setStatus({
        kind: 'error',
        message: `本文が長すぎます (上限 ${MAX_LEN} 文字)`,
        isConflict: false,
      })
      return
    }
    const previousForUndo = currentValue
    const expectedRevision = revision
    setStatus({kind: 'saving'})
    startTransition(async () => {
      let result: UpdateReactionNotesResult
      try {
        result = await updateReactionNotes({
          campaignId,
          itemKey,
          platform,
          newReactionNotes: draft,
          expectedRevision,
          mode: 'execute',
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
        setStatus({
          kind: 'error',
          message: resultErrorMessage(result),
          isConflict: result.error === 'conflict',
        })
        return
      }
      // execute success — hand off the undo toast to the stable host so it
      // survives this editor unmounting if the row migrates between cards.
      const newRev = result.mode === 'execute' ? result.newRevision : expectedRevision
      const savedValue = result.mode === 'execute' ? result.newValue : draft
      notifySaved({
        title: '保存しました。',
        detail: `10秒以内なら元に戻せます。 — ${platform}`,
        onUndo: async (): Promise<UndoResult> => {
          let undoResult: UpdateReactionNotesResult
          try {
            undoResult = await updateReactionNotes({
              campaignId,
              itemKey,
              platform,
              newReactionNotes: previousForUndo,
              expectedRevision: newRev,
              mode: 'execute',
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
          return {
            ok: false,
            message: resultErrorMessage(undoResult),
            isConflict: undoResult.error === 'conflict',
          }
        },
      })
      // Collapse the editor back to read mode. The new value will be picked
      // up by the next server render via router.refresh().
      if (mountedRef.current) {
        setCurrentValue(savedValue)
        setDraft(savedValue)
        setRevision(newRev)
        setStatus({kind: 'read'})
      }
      router.refresh()
    })
  }, [
    draft,
    currentValue,
    revision,
    dirty,
    writeReady,
    campaignId,
    itemKey,
    platform,
    notifySaved,
    router,
  ])

  const onReloadAfterConflict = useCallback(() => {
    router.refresh()
  }, [router])

  // ---------- render ----------

  const readView = (
    <div className="mt-1.5 flex items-start justify-between gap-2">
      {currentValue.trim().length === 0 ? (
        <p className="text-[12px] italic text-slate-400">(未記入)</p>
      ) : (
        <p
          className={
            variant === 'empty'
              ? 'whitespace-pre-line text-[12px] leading-relaxed text-slate-700'
              : 'line-clamp-2 whitespace-pre-line text-[12px] leading-relaxed text-slate-700'
          }
        >
          {currentValue}
        </p>
      )}
      {writeReady && status.kind === 'read' && (
        <button
          type="button"
          onClick={startEdit}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil size={11} aria-hidden="true" />
          編集
        </button>
      )}
      {!writeReady && (
        <span
          aria-disabled="true"
          title="編集は ENABLE_WRITE_ACTIONS=true かつ SANITY_WRITE_TOKEN 設定時のみ"
          className="inline-flex shrink-0 cursor-not-allowed items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-400"
        >
          <Pencil size={11} aria-hidden="true" />
          編集
        </span>
      )}
    </div>
  )

  const editView = (
    <div className="mt-1.5 flex flex-col gap-1.5">
      <label
        htmlFor={`rne-${campaignId}-${itemKey}`}
        className="text-[10px] uppercase tracking-wide text-slate-500"
      >
        {platform} · 反応メモ
      </label>
      <textarea
        id={`rne-${campaignId}-${itemKey}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        maxLength={MAX_LEN}
        disabled={status.kind === 'saving'}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[12px] leading-relaxed text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
        placeholder="24-72h 後の反応メモ。Markdown は plain text で保存されます。"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tabular-nums text-slate-400">
          {draft.length}/{MAX_LEN}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={status.kind === 'saving'}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || status.kind === 'saving'}
            aria-busy={status.kind === 'saving'}
            className="inline-flex items-center gap-1 rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:border-blue-300"
          >
            {status.kind === 'saving' ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )

  const errorBanner =
    status.kind === 'error' ? (
      <div className="mt-1.5 flex items-start justify-between gap-2 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] text-rose-900">
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
            onClick={() => setStatus({kind: dirty ? 'edit' : 'read'})}
            className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-rose-800 hover:bg-rose-100"
          >
            閉じる
          </button>
        )}
      </div>
    ) : null

  const showEditor = status.kind === 'edit' || status.kind === 'saving'

  return (
    <div>
      {showEditor ? editView : readView}
      {errorBanner}
    </div>
  )
}
