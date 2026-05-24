'use client'

// DeliverablesCard — grid of icons showing what artefacts the configured
// run will produce. Items are conditioned on form state (platforms +
// diagramEnabled + outputType).

import type {LucideIcon} from 'lucide-react'
import {FileText, Image as ImageIcon, Layers, Video, Mic, MessageCircle, Package} from 'lucide-react'
import type {FormValue} from '@/lib/configurator/options'

interface Props {
  form: FormValue
}

interface Item {
  key: string
  label: string
  icon: LucideIcon
  active: boolean
  caption: string
}

export function DeliverablesCard({form}: Props) {
  const isShortPost =
    form.outputType === 'post' ||
    form.outputType === 'short-post' ||
    form.platforms.includes('x') ||
    form.platforms.includes('threads')
  const isThread = form.outputType === 'thread'
  const isVideo =
    form.outputType === 'script' ||
    form.outputType === 'video-script' ||
    form.platforms.includes('youtube')
  const isShorts =
    form.outputType === 'short-script' ||
    form.outputType === 'shorts-script' ||
    form.platforms.includes('shorts')
  const isPodcast =
    form.outputType === 'script' ||
    form.outputType === 'podcast-script' ||
    form.platforms.includes('podcast')

  const items: Item[] = [
    {
      key: 'text',
      label: 'テキスト本文',
      icon: FileText,
      active: true,
      caption: 'markdown 下書き',
    },
    {
      key: 'diagram',
      label: '図解プロンプト',
      icon: ImageIcon,
      active:
        form.diagramEnabled ||
        form.visualPreference !== 'no-visual' ||
        form.outputType === 'visual-brief' ||
        form.outputType === 'diagram-prompt',
      caption: '画像生成用 brief',
    },
    {
      key: 'thread',
      label: 'スレッド分割',
      icon: Layers,
      active: isThread,
      caption: 'X / Threads の連投',
    },
    {
      key: 'video',
      label: '動画台本',
      icon: Video,
      active: isVideo || isShorts,
      caption: isShorts ? '60s 以内 / Shorts' : 'YouTube long-form',
    },
    {
      key: 'audio',
      label: '音声台本',
      icon: Mic,
      active: isPodcast,
      caption: 'Podcast narration',
    },
    {
      key: 'reply',
      label: 'リプライ案',
      icon: MessageCircle,
      active: isShortPost || isThread,
      caption: '想定コメントへの返信',
    },
  ]

  const activeCount = items.filter((i) => i.active).length

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
            aria-hidden="true"
          >
            <Package size={14} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">生成される成果物</h2>
            <p className="text-[11px] text-slate-500">条件によって自動的に切り替わります</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
          有効 {activeCount} 件
        </span>
      </header>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.key}
              className={
                'flex flex-col gap-1 rounded-md border p-2.5 ' +
                (item.active
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-slate-200 bg-slate-50 opacity-60')
              }
            >
              <span
                className={
                  'inline-flex h-6 w-6 items-center justify-center rounded ' +
                  (item.active
                    ? 'bg-white text-emerald-700 ring-1 ring-inset ring-emerald-200'
                    : 'bg-white text-slate-400 ring-1 ring-inset ring-slate-200')
                }
                aria-hidden="true"
              >
                <Icon size={13} />
              </span>
              <span className="text-xs font-medium text-slate-800">{item.label}</span>
              <span className="text-[10px] text-slate-500">{item.caption}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
