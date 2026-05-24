// Responsive grid wrapper for KpiCards.
// 2 columns on mobile, up to 5 on desktop matches the spec dashboard layout.

import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
}

export function KpiCardsRow({children}: Props) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {children}
    </section>
  )
}
