'use client'

// Lightweight Tabs primitive used by Campaign Detail (and any future page
// that needs tabbed sections). Hand-rolled in Tailwind to avoid pulling in
// @radix-ui/react-tabs + clsx + tailwind-merge + class-variance-authority
// just for one component. Stick to the Tailwind-first policy.
//
// Usage:
//   <Tabs defaultValue="content">
//     <TabsList>
//       <TabsTrigger value="content">Content</TabsTrigger>
//       <TabsTrigger value="brand">Brand</TabsTrigger>
//     </TabsList>
//     <TabsContent value="content">...</TabsContent>
//     <TabsContent value="brand">...</TabsContent>
//   </Tabs>
//
// Keyboard support: ArrowLeft / ArrowRight to move between triggers when the
// list has focus; Home / End jumps to first / last. ARIA role="tablist" /
// "tab" / "tabpanel" with proper aria-controls / aria-labelledby.

import {createContext, useCallback, useContext, useId, useRef, useState, type ReactNode} from 'react'

interface TabsCtx {
  value: string
  setValue: (v: string) => void
  baseId: string
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void
  focusNext: (current: string, direction: 1 | -1 | 'first' | 'last') => void
}

const Ctx = createContext<TabsCtx | null>(null)

function useTabs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>')
  return ctx
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
  children: ReactNode
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = controlledValue ?? uncontrolled
  const setValue = useCallback(
    (v: string) => {
      if (controlledValue === undefined) setUncontrolled(v)
      onValueChange?.(v)
    },
    [controlledValue, onValueChange],
  )
  const baseId = useId()
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map())

  const registerTrigger = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) triggersRef.current.set(v, el)
    else triggersRef.current.delete(v)
  }, [])

  const focusNext: TabsCtx['focusNext'] = useCallback((current, direction) => {
    const order = Array.from(triggersRef.current.keys())
    if (order.length === 0) return
    let nextIdx: number
    if (direction === 'first') nextIdx = 0
    else if (direction === 'last') nextIdx = order.length - 1
    else {
      const idx = order.indexOf(current)
      nextIdx = (idx + direction + order.length) % order.length
    }
    const nextVal = order[nextIdx]
    triggersRef.current.get(nextVal)?.focus()
    setValue(nextVal)
  }, [setValue])

  return (
    <Ctx.Provider value={{value, setValue, baseId, registerTrigger, focusNext}}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  )
}

export function TabsList({children, className}: {children: ReactNode; className?: string}) {
  return (
    <div
      role="tablist"
      className={
        'inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 ' +
        (className ?? '')
      }
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  const ctx = useTabs()
  const active = ctx.value === value
  const tabId = `${ctx.baseId}-tab-${value}`
  const panelId = `${ctx.baseId}-panel-${value}`
  return (
    <button
      ref={(el) => ctx.registerTrigger(value, el)}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          ctx.focusNext(value, 1)
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          ctx.focusNext(value, -1)
        } else if (e.key === 'Home') {
          e.preventDefault()
          ctx.focusNext(value, 'first')
        } else if (e.key === 'End') {
          e.preventDefault()
          ctx.focusNext(value, 'last')
        }
      }}
      className={
        (active
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200'
          : 'text-slate-600 hover:text-slate-900') +
        ' rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'
      }
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const ctx = useTabs()
  const active = ctx.value === value
  const tabId = `${ctx.baseId}-tab-${value}`
  const panelId = `${ctx.baseId}-panel-${value}`
  if (!active) return null
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={className ?? 'mt-4 focus:outline-none'}
    >
      {children}
    </div>
  )
}
