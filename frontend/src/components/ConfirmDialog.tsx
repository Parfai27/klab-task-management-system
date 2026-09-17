import { useEffect } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, busy }: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-sidebar/45 p-4 backdrop-blur-[2px]" onClick={busy ? undefined : onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-3xl bg-card p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-2xl bg-danger px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
