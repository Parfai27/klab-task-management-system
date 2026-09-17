import type { Task, TaskPriority } from '../types'
import { PriorityBadge } from './PriorityBadge'

const rail: Record<TaskPriority, string> = {
  HIGH: 'bg-danger',
  MEDIUM: 'bg-mid',
  LOW: 'bg-accent',
}

function formatDate(value: string) {
  const date = new Date(value)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggleStatus: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const completed = task.status === 'COMPLETED'

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-card p-4 pl-5 shadow-[0_10px_30px_rgba(16,32,51,0.06)] ring-1 ring-line/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${rail[task.priority]}`} />

      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
            completed
              ? 'border-accent bg-accent text-white'
              : 'border-line bg-white text-transparent hover:border-accent'
          }`}
          aria-label={completed ? 'Mark pending' : 'Mark completed'}
          title={completed ? 'Mark pending' : 'Mark completed'}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path d="M3.5 8.2 6.4 11l6.1-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h3 className={`text-[15px] font-semibold leading-snug text-ink ${completed ? 'text-muted line-through decoration-line' : ''}`}>
            {task.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{task.description}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 pl-9">
        <time className="text-xs font-medium text-muted" dateTime={task.createdAt}>
          {formatDate(task.createdAt)}
        </time>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-ink hover:bg-canvas"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
