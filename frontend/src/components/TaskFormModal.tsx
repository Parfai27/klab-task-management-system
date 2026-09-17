import { useEffect, useState, type FormEvent } from 'react'
import type { Task, TaskPriority, TaskRequest, TaskStatus } from '../types'

interface TaskFormModalProps {
  task?: Task | null
  onClose: () => void
  onSubmit: (payload: TaskRequest) => Promise<void>
}

const emptyForm: TaskRequest = {
  title: '',
  description: '',
  status: 'PENDING',
  priority: 'MEDIUM',
}

function validate(values: TaskRequest) {
  const errors: Partial<Record<keyof TaskRequest, string>> = {}
  const title = values.title.trim()
  const description = values.description.trim()

  if (!title) errors.title = 'Title is required'
  else if (title.length > 120) errors.title = 'Title must be at most 120 characters'

  if (!description) errors.description = 'Description is required'
  else if (description.length > 2000) errors.description = 'Description must be at most 2000 characters'

  return errors
}

const priorities: { id: TaskPriority; label: string }[] = [
  { id: 'LOW', label: 'Low' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'HIGH', label: 'High' },
]

const statuses: { id: TaskStatus; label: string }[] = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'COMPLETED', label: 'Completed' },
]

export function TaskFormModal({ task, onClose, onSubmit }: TaskFormModalProps) {
  const [values, setValues] = useState<TaskRequest>(
    task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Partial<Record<keyof TaskRequest, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const editing = Boolean(task)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSubmitError(null)
    if (Object.keys(nextErrors).length > 0) return

    setBusy(true)
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save the task')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-sidebar/40 backdrop-blur-[2px]">
      <button type="button" className="h-full flex-1 cursor-default" aria-label="Close drawer" onClick={onClose} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onSubmit={handleSubmit}
        className="flex h-full w-full max-w-md flex-col bg-card shadow-[-24px_0_80px_rgba(8,17,31,0.25)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              {editing ? 'Update task' : 'New task'}
            </p>
            <h2 id="task-form-title" className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {editing ? 'Refine the work' : 'Capture a task'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-lg text-muted hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <label className="block text-sm font-semibold">
            Title
            <input
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              maxLength={120}
              autoFocus
              className="mt-2 w-full rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm font-medium outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              placeholder="What needs to happen?"
            />
            {errors.title ? <span className="mt-1.5 block text-xs font-medium text-danger">{errors.title}</span> : null}
          </label>

          <label className="mt-5 block text-sm font-semibold">
            Description
            <textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              maxLength={2000}
              rows={6}
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-canvas/70 px-4 py-3 text-sm font-medium leading-relaxed outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              placeholder="Context, links, or the definition of done."
            />
            {errors.description ? (
              <span className="mt-1.5 block text-xs font-medium text-danger">{errors.description}</span>
            ) : null}
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Priority</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {priorities.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValues((current) => ({ ...current, priority: option.id }))}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                    values.priority === option.id
                      ? 'border-sidebar bg-sidebar text-white'
                      : 'border-line bg-white text-muted hover:border-sidebar/30 hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Status</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {statuses.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValues((current) => ({ ...current, status: option.id }))}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                    values.status === option.id
                      ? 'border-accent bg-accent text-white'
                      : 'border-line bg-white text-muted hover:border-accent/40 hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {submitError ? <p className="mt-5 text-sm text-danger">{submitError}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,157,142,0.35)] transition hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add to board'}
          </button>
        </div>
      </form>
    </div>
  )
}
