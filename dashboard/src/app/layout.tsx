import type {Metadata} from 'next'
import {Inter, Noto_Sans_JP} from 'next/font/google'
import './globals.css'
import {AppShell} from '@/components/app-shell/AppShell'

// Inter for Latin / numerics / code, Noto Sans JP for 日本語.
// CSS variable fallback chain in globals.css:
//   --font-sans : "Inter", "Noto Sans JP", system-ui, sans-serif
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const notoSansJp = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hitori Media OS — Admin',
  description: 'Read-only admin dashboard for Hitori Media OS (Phase Admin 1).',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
