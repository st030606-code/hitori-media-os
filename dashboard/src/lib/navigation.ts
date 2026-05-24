// Shared navigation contract for the Hitori Media OS AppShell (Phase UI-1).
//
// The Sidebar uses this list to render nav items, and the active item is
// resolved deterministically from the current pathname.

import {
  Home,
  Rocket,
  Blocks,
  FileText,
  Send,
  Image as ImageIcon,
  Database,
  LineChart,
  Lightbulb,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavGroup = 'main' | 'production' | 'knowledge' | 'system'

export interface NavItem {
  key: string
  href: string
  label: string
  icon: LucideIcon
  group: NavGroup
}

export const NAV_ITEMS: readonly NavItem[] = [
  {key: 'dashboard',     href: '/',              label: 'ダッシュボード',           icon: Home,      group: 'main'},
  {key: 'campaigns',     href: '/campaigns',     label: 'キャンペーン',             icon: Rocket,    group: 'main'},
  {key: 'configurator',  href: '/configurator',  label: '出力コンフィギュレーター', icon: Blocks,    group: 'production'},
  {key: 'outputs',       href: '/outputs',       label: '出力管理',                 icon: FileText,  group: 'production'},
  {key: 'publish',       href: '/publish',       label: '公開管理',                 icon: Send,      group: 'production'},
  {key: 'visual-review', href: '/visual-assets', label: '図解レビュー',             icon: ImageIcon, group: 'production'},
  {key: 'ideas',         href: '/ideas',         label: 'アイデア開発',             icon: Lightbulb, group: 'knowledge'},
  {key: 'knowledge',     href: '/knowledge',     label: 'ナレッジDB',               icon: Database,  group: 'knowledge'},
  {key: 'analytics',     href: '/analytics',     label: 'アナリティクス',           icon: LineChart, group: 'knowledge'},
  {key: 'settings',      href: '/settings',      label: '設定',                     icon: Settings,  group: 'system'},
] as const

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  main: '',
  production: '制作 & 配布',
  knowledge: '知識 & 分析',
  system: '',
}

// Walk NAV_ITEMS in declaration order and pick the *longest* href prefix
// that the current pathname matches. Falls back to "/" if no match.
export function activeNavKey(pathname: string | null | undefined): string {
  if (!pathname) return 'dashboard'
  let best: NavItem | undefined
  for (const item of NAV_ITEMS) {
    if (item.href === '/') continue
    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
      if (!best || item.href.length > best.href.length) {
        best = item
      }
    }
  }
  if (best) return best.key
  // /publish-package/* and /publish-packages should map to 公開管理 too.
  if (pathname.startsWith('/publish-package/') || pathname.startsWith('/publish-packages')) {
    return 'publish'
  }
  return 'dashboard'
}
