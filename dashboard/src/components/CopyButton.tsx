'use client'

// Client-side clipboard copy button for the 公開パッケージ UI.
// No package install: uses navigator.clipboard with a textarea fallback.

import {useState, useCallback} from 'react'

type State = 'idle' | 'copied' | 'manual'

interface Props {
  text: string
  label?: string
  // When non-empty, render a slightly larger button with a primary tone.
  tone?: 'primary' | 'secondary'
  // Disables the button (used when source content is missing).
  disabled?: boolean
}

async function tryClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // permission denied or insecure context — fall through to textarea fallback
    }
  }
  if (typeof document !== 'undefined') {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
  return false
}

export function CopyButton({text, label = 'コピー', tone = 'secondary', disabled}: Props) {
  const [state, setState] = useState<State>('idle')

  const handleClick = useCallback(async () => {
    if (disabled || !text) return
    const ok = await tryClipboard(text)
    setState(ok ? 'copied' : 'manual')
    setTimeout(() => setState('idle'), 2200)
  }, [text, disabled])

  const stateLabel =
    state === 'copied'
      ? 'コピーしました'
      : state === 'manual'
        ? '手動で選択してコピーしてください'
        : label

  const base =
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const toneClasses =
    tone === 'primary'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'

  return (
    <button
      type="button"
      className={`${base} ${toneClasses}`}
      onClick={handleClick}
      disabled={disabled || !text}
      aria-disabled={disabled || !text}
      title={
        disabled || !text
          ? '本文がないためコピーできません'
          : state === 'manual'
            ? '自動コピーに失敗しました。テキストを直接選択してコピーしてください。'
            : 'クリックでコピー'
      }
    >
      <span>{stateLabel}</span>
    </button>
  )
}
