import type { ReactNode } from 'react'

interface BoardColumnProps {
  title: string
  count: number
  tone: 'pending' | 'done'
  children: ReactNode
  emptyLabel: string
}

export function BoardColumn({ title, count, tone, children, emptyLabel }: BoardColumnProps) {
  return (
    <section className="flex min-h-[28rem] flex-col rounded-[28px] bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-white/70 backdrop-blur-sm">
      <header className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${tone === 'done' ? 'bg-accent' : 'bg-mid'}`} />
          <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        </div>
        <span className="rounded-full bg-sidebar text-[11px] font-bold text-white px-2.5 py-1">{count}</span>
      </header>
      <div className="board-scroll flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {count === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">{emptyLabel}</p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
