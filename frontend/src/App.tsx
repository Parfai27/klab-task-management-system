import { useState } from 'react'
import { BoardColumn } from './components/BoardColumn'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TaskCard } from './components/TaskCard'
import { TaskFormModal } from './components/TaskFormModal'
import { useTasks } from './hooks/useTasks'
import type { StatusFilter, Task } from './types'

const filters: { id: StatusFilter; label: string; hint: string }[] = [
  { id: 'ALL', label: 'Board', hint: 'Everything' },
  { id: 'PENDING', label: 'Pending', hint: 'Still open' },
  { id: 'COMPLETED', label: 'Completed', hint: 'Shipped' },
]

export default function App() {
  const {
    visibleTasks,
    stats,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    refresh,
    create,
    update,
    remove,
    toggleStatus,
  } = useTasks()

  const [formTask, setFormTask] = useState<Task | null | undefined>(undefined)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const pendingTasks = visibleTasks.filter((task) => task.status === 'PENDING')
  const completedTasks = visibleTasks.filter((task) => task.status === 'COMPLETED')
  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  async function handleDelete() {
    if (!taskToDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await remove(taskToDelete.id)
      setTaskToDelete(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the task')
    } finally {
      setDeleting(false)
    }
  }

  function handleToggle(task: Task) {
    setActionError(null)
    void toggleStatus(task).catch((err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Could not update status')
    })
  }

  return (
    <div className="min-h-svh text-ink">
      <div className="mx-auto flex min-h-svh max-w-[1440px]">
        <aside className="hidden w-[272px] shrink-0 flex-col bg-sidebar px-5 py-6 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-lg font-extrabold text-sidebar">
              T
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none tracking-tight">Task Manager</p>
              <p className="mt-1 text-xs text-sidebar-muted">Personal workspace</p>
            </div>
          </div>

          <nav className="mt-10 flex flex-col gap-1.5">
            {filters.map((filter) => {
              const active = statusFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`rounded-2xl px-3 py-3 text-left transition ${
                    active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="block text-sm font-semibold">{filter.label}</span>
                  <span className="text-xs text-sidebar-muted">{filter.hint}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto rounded-3xl bg-white/5 p-4">
            <div className="flex items-end justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-muted">Progress</p>
              <p className="font-display text-2xl font-bold">{progress}%</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-sidebar-muted">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-4 px-4 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{today}</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Task manager</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-72">
                <span className="sr-only">Search tasks</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the board"
                  className="w-full rounded-2xl border border-line bg-white/80 py-2.5 pr-4 pl-10 text-sm outline-none ring-accent/20 focus:ring-4"
                />
              </label>
              <button
                type="button"
                onClick={() => setFormTask(null)}
                className="rounded-2xl bg-sidebar px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(8,17,31,0.22)] transition hover:bg-ink"
              >
                New task
              </button>
            </div>
          </header>

          <div className="grid gap-3 px-4 sm:grid-cols-3 sm:px-8 lg:hidden">
            <MobileStat label="Total" value={stats.total} />
            <MobileStat label="Pending" value={stats.pending} />
            <MobileStat label="Done" value={stats.completed} />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                  statusFilter === filter.id ? 'bg-sidebar text-white' : 'bg-white/70 text-muted'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <main className="flex flex-1 flex-col px-4 py-5 sm:px-8">
            {error ? (
              <div className="mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                <p>{error}</p>
                <button type="button" onClick={() => void refresh()} className="mt-2 font-bold underline">
                  Try again
                </button>
              </div>
            ) : null}

            {actionError ? <p className="mb-4 text-sm text-danger">{actionError}</p> : null}

            {loading ? (
              <div className="grid flex-1 gap-4 lg:grid-cols-2">
                {[0, 1].map((key) => (
                  <div key={key} className="h-full min-h-80 animate-pulse rounded-[28px] bg-white/50" />
                ))}
              </div>
            ) : statusFilter === 'ALL' ? (
              <div className="grid flex-1 gap-4 lg:grid-cols-2">
                <BoardColumn title="Pending" count={pendingTasks.length} tone="pending" emptyLabel="Nothing waiting. Add a task to start the day.">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setFormTask}
                      onDelete={setTaskToDelete}
                      onToggleStatus={handleToggle}
                    />
                  ))}
                </BoardColumn>
                <BoardColumn title="Completed" count={completedTasks.length} tone="done" emptyLabel="Finished work will land here.">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setFormTask}
                      onDelete={setTaskToDelete}
                      onToggleStatus={handleToggle}
                    />
                  ))}
                </BoardColumn>
              </div>
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                hasSearch={search.trim().length > 0}
                onCreate={() => setFormTask(null)}
              />
            ) : (
              <BoardColumn
                title={statusFilter === 'PENDING' ? 'Pending' : 'Completed'}
                count={visibleTasks.length}
                tone={statusFilter === 'COMPLETED' ? 'done' : 'pending'}
                emptyLabel="No tasks in this view."
              >
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setFormTask}
                    onDelete={setTaskToDelete}
                    onToggleStatus={handleToggle}
                  />
                ))}
              </BoardColumn>
            )}
          </main>
        </div>
      </div>

      {formTask !== undefined ? (
        <TaskFormModal
          task={formTask}
          onClose={() => setFormTask(undefined)}
          onSubmit={(payload) => (formTask ? update(formTask.id, payload) : create(payload))}
        />
      ) : null}

      {taskToDelete ? (
        <ConfirmDialog
          title="Delete this task?"
          message={`“${taskToDelete.title}” will be removed from the board permanently.`}
          confirmLabel="Delete task"
          busy={deleting}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  )
}

function MobileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ hasSearch, onCreate }: { hasSearch: boolean; onCreate: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center rounded-[28px] bg-white/55 px-6 py-16 text-center ring-1 ring-white/70">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-accent/15 font-display text-2xl font-bold text-accent">
        +
      </div>
      <p className="mt-5 font-display text-3xl font-semibold">{hasSearch ? 'No matching tasks' : 'A clear board'}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        {hasSearch
          ? 'Try another search term, or switch back to the full board.'
          : 'Create a task, set its priority, and move it to completed when it is done.'}
      </p>
      {hasSearch ? null : (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 rounded-2xl bg-sidebar px-5 py-2.5 text-sm font-bold text-white"
        >
          Create your first task
        </button>
      )}
    </section>
  )
}
