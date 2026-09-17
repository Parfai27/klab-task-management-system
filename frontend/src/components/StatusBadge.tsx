import type { TaskStatus } from '../types'

export function StatusBadge({ status }: { status: TaskStatus }) {
  const completed = status === 'COMPLETED'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] ${
        completed ? 'bg-accent/10 text-accent-dark' : 'bg-canvas text-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-accent' : 'bg-mid'}`} />
      {completed ? 'Done' : 'Open'}
    </span>
  )
}
