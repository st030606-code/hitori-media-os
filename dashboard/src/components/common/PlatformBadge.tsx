// PlatformBadge — small pill identifying a posting platform.
// Brand colors follow docs/68 §12-3.

import type {LucideIcon} from 'lucide-react'

export type PlatformKey =
  | 'x'
  | 'threads'
  | 'note'
  | 'substack'
  | 'youtube'
  | 'shorts'
  | 'podcast'
  | 'diagram'
  | 'instagram'
  | 'blog'

interface PlatformVisual {
  label: string
  bg: string
  text: string
  ring: string
}

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  x: 'X',
  threads: 'Threads',
  note: 'note',
  substack: 'Substack',
  youtube: 'YouTube',
  shorts: 'Shorts',
  podcast: 'Podcast',
  diagram: '図解',
  instagram: 'Instagram',
  blog: 'ブログ',
}

const PLATFORM_TONE: Record<PlatformKey, PlatformVisual> = {
  x:         {label: 'X',        bg: 'bg-slate-900',  text: 'text-white',         ring: 'ring-slate-900'},
  threads:   {label: 'Threads',  bg: 'bg-slate-800',  text: 'text-white',         ring: 'ring-slate-800'},
  note:      {label: 'note',     bg: 'bg-emerald-600', text: 'text-white',         ring: 'ring-emerald-600'},
  substack:  {label: 'Substack', bg: 'bg-orange-600', text: 'text-white',         ring: 'ring-orange-600'},
  youtube:   {label: 'YouTube',  bg: 'bg-rose-600',   text: 'text-white',         ring: 'ring-rose-600'},
  shorts:    {label: 'Shorts',   bg: 'bg-rose-500',   text: 'text-white',         ring: 'ring-rose-500'},
  podcast:   {label: 'Podcast',  bg: 'bg-purple-600', text: 'text-white',         ring: 'ring-purple-600'},
  diagram:   {label: '図解',     bg: 'bg-blue-100',   text: 'text-blue-800',      ring: 'ring-blue-300'},
  instagram: {label: 'Instagram', bg: 'bg-pink-600',  text: 'text-white',         ring: 'ring-pink-600'},
  blog:      {label: 'ブログ',   bg: 'bg-slate-200',  text: 'text-slate-800',     ring: 'ring-slate-300'},
}

interface PlatformBadgeProps {
  platform: string
  icon?: LucideIcon
  size?: 'sm' | 'md'
}

function resolve(platform: string): PlatformVisual & {key?: PlatformKey} {
  const key = platform.toLowerCase() as PlatformKey
  if (key in PLATFORM_TONE) return {...PLATFORM_TONE[key], key}
  // Unknown platform fallback: slate pill, raw label.
  return {label: platform || '—', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200'}
}

export function PlatformBadge({platform, icon: Icon, size = 'sm'}: PlatformBadgeProps) {
  const tone = resolve(platform)
  const padding = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-medium ${tone.bg} ${tone.text} ${tone.ring} ${padding}`}
    >
      {Icon && <Icon size={size === 'md' ? 14 : 12} aria-hidden="true" />}
      <span>{tone.label}</span>
    </span>
  )
}

export function platformLabel(platform: string | undefined): string {
  if (!platform) return '—'
  return PLATFORM_LABELS[platform.toLowerCase() as PlatformKey] ?? platform
}
