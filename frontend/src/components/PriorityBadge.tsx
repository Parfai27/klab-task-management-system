import type { TaskPriority } from '../types'

const styles: Record<TaskPriority, string> = {
  HIGH: 'bg-danger/10 text-danger',
  MEDIUM: 'bg-mid/10 text-mid',
  LOW: 'bg-accent/10 text-accent-dark',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] ${styles[priority]}`}>
      {priority}
    </span>
  )
}
